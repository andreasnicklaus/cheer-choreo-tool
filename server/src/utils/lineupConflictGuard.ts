import { QueryTypes, type Transaction } from "sequelize";
import db from "@/db/db";
import { LineupConflictError } from "./errors";
import { logger } from "@/plugins/winston";
import { runInTransaction } from "./transactionContext";

/**
 * A point-in-time set of lineup consistency violations for one or more
 * choreographies. Each set holds canonical string keys so two snapshots can be
 * diffed to find violations a mutation introduced.
 *
 * @property {Set<string>} lineupOverlaps - Keys `lineupOverlap:<idA>:<idB>` for
 * each pair of lineups in the same choreo whose count ranges overlap.
 * @property {Set<string>} memberConflicts - Keys
 * `memberConflict:<memberId>:<lineupIdA>:<lineupIdB>` for each member holding a
 * position in two overlapping lineups of the same choreo.
 * @property {Set<string>} duplicatePositions - Keys
 * `duplicatePosition:<lineupId>:<memberId>` for each member placed more than
 * once in the same lineup.
 */
export interface LineupConflictSnapshot {
  lineupOverlaps: Set<string>;
  memberConflicts: Set<string>;
  duplicatePositions: Set<string>;
}

/**
 * @returns {boolean} True when the active database dialect is PostgreSQL, which
 * supports the advisory locks used to serialize concurrent guarded mutations.
 */
function isPostgres(): boolean {
  return db.getDialect() === "postgres";
}

/**
 * Take a transaction-scoped PostgreSQL advisory lock keyed to one choreography,
 * so concurrent guarded mutations on the same choreo run one at a time. No-op on
 * SQLite, which serializes writers and is only used by the sequential test suite.
 *
 * @param {Transaction} transaction - The transaction the lock is scoped to; it
 * is released automatically when the transaction ends.
 * @param {string} choreoId - The choreography whose mutations are serialized.
 * @returns {Promise<void>}
 */
async function acquireLock(transaction: Transaction, choreoId: string) {
  if (!isPostgres()) {
    // SQLite serializes writers and the unit-test suite runs transactions
    // sequentially, so there is nothing to acquire.
    return;
  }
  await db.query(`SELECT pg_advisory_xact_lock(hashtextextended($1, 0))`, {
    replacements: [`lineup-guard:${choreoId}`],
    transaction,
  });
}

/**
 * Snapshot every lineup consistency violation currently present across the given
 * choreographies: overlapping lineups, members in two overlapping lineups, and
 * duplicate positions. Runs plain SELECTs inside the caller's transaction so the
 * result reflects uncommitted changes made earlier in the same transaction.
 *
 * @param {string[]} choreoIds - Choreographies to inspect. An empty array yields
 * an empty snapshot without querying.
 * @param {Transaction} transaction - The transaction the queries run in.
 * @returns {Promise<LineupConflictSnapshot>} The violations found, as canonical
 * key sets suitable for diffing against another snapshot.
 */
export async function snapshotLineupConflicts(
  choreoIds: string[],
  transaction: Transaction,
): Promise<LineupConflictSnapshot> {
  const snapshot: LineupConflictSnapshot = {
    lineupOverlaps: new Set(),
    memberConflicts: new Set(),
    duplicatePositions: new Set(),
  };

  if (choreoIds.length === 0) {
    return snapshot;
  }

  const overlaps = (await db.query(
    `SELECT "a"."id" AS "aId", "b"."id" AS "bId"
       FROM "Lineups" AS "a"
       JOIN "Lineups" AS "b"
         ON "a"."ChoreoId" = "b"."ChoreoId"
        AND "a"."id" < "b"."id"
        AND "a"."startCount" <= "b"."endCount"
        AND "b"."startCount" <= "a"."endCount"
      WHERE "a"."ChoreoId" IN (:choreoIds)`,
    {
      replacements: { choreoIds },
      transaction,
      type: QueryTypes.SELECT,
    },
  )) as Array<{ aId: string; bId: string }>;

  for (const row of overlaps) {
    snapshot.lineupOverlaps.add(`lineupOverlap:${row.aId}:${row.bId}`);
  }

  const memberConflicts = (await db.query(
    `SELECT DISTINCT "pa"."MemberId" AS "memberId",
                     "la"."id" AS "lineupIdA",
                     "lb"."id" AS "lineupIdB"
       FROM "Positions" AS "pa"
       JOIN "Lineups" AS "la" ON "la"."id" = "pa"."LineupId"
       JOIN "Positions" AS "pb"
         ON "pb"."MemberId" = "pa"."MemberId"
        AND "pb"."LineupId" <> "pa"."LineupId"
       JOIN "Lineups" AS "lb" ON "lb"."id" = "pb"."LineupId"
      WHERE "la"."ChoreoId" IN (:choreoIds)
        AND "lb"."ChoreoId" = "la"."ChoreoId"
        AND "pa"."MemberId" IS NOT NULL
        AND "la"."startCount" <= "lb"."endCount"
        AND "lb"."startCount" <= "la"."endCount"`,
    {
      replacements: { choreoIds },
      transaction,
      type: QueryTypes.SELECT,
    },
  )) as Array<{ memberId: string; lineupIdA: string; lineupIdB: string }>;

  for (const row of memberConflicts) {
    const [first, second] = [row.lineupIdA, row.lineupIdB].sort();
    snapshot.memberConflicts.add(
      `memberConflict:${row.memberId}:${first}:${second}`,
    );
  }

  const duplicates = (await db.query(
    `SELECT "LineupId" AS "lineupId", "MemberId" AS "memberId"
       FROM "Positions"
      WHERE "LineupId" IN (SELECT "id" FROM "Lineups" WHERE "ChoreoId" IN (:choreoIds))
        AND "MemberId" IS NOT NULL
      GROUP BY "LineupId", "MemberId"
     HAVING COUNT(*) > 1`,
    {
      replacements: { choreoIds },
      transaction,
      type: QueryTypes.SELECT,
    },
  )) as Array<{ lineupId: string; memberId: string }>;

  for (const row of duplicates) {
    snapshot.duplicatePositions.add(
      `duplicatePosition:${row.lineupId}:${row.memberId}`,
    );
  }

  return snapshot;
}

/**
 * Diff two snapshots and return the violation keys present in `after` but not in
 * `before` — i.e. the conflicts a mutation newly introduced. Pre-existing
 * violations appear in both and are omitted, which is what grandfathers them.
 *
 * @param {LineupConflictSnapshot} before - Snapshot taken before the mutation.
 * @param {LineupConflictSnapshot} after - Snapshot taken after the mutation.
 * @returns {string[]} Canonical keys of the newly introduced violations; empty
 * when the mutation introduced none.
 */
function describeNewViolations(
  before: LineupConflictSnapshot,
  after: LineupConflictSnapshot,
): string[] {
  return [
    ...[...after.lineupOverlaps].filter(
      (key) => !before.lineupOverlaps.has(key),
    ),
    ...[...after.memberConflicts].filter(
      (key) => !before.memberConflicts.has(key),
    ),
    ...[...after.duplicatePositions].filter(
      (key) => !before.duplicatePositions.has(key),
    ),
  ];
}

/**
 * Run a mutation inside a transaction that enforces lineup consistency.
 *
 * The guard takes an advisory lock per choreography (so concurrent writers run
 * one at a time), snapshots existing violations, runs `work`, snapshots again,
 * and commits only if `work` introduced no new overlap, member conflict, or
 * duplicate position. Violations that already existed before `work` are
 * preserved in both snapshots and therefore allowed (stateless grandfathering),
 * so legacy data stays editable as long as the edit does not make it worse.
 *
 * `work` must perform its writes on the ambient transaction via
 * {@link getTransaction} so they are included in the "after" snapshot and roll
 * back together when a conflict is detected. When `choreoIds` contains no usable
 * id, `work` runs directly with no transaction, lock, or snapshot.
 *
 * @template T
 * @param {Array<string | null | undefined>} choreoIds - Choreographies affected
 * by the mutation; null/undefined/duplicate entries are filtered and the rest
 * are locked in sorted order to avoid deadlocks.
 * @param {() => Promise<T>} work - The mutation to run under the guard.
 * @returns {Promise<T>} The value returned by `work`.
 * @throws {LineupConflictError} If `work` introduces a new lineup overlap,
 * member conflict, or duplicate position; the transaction is rolled back.
 */
export async function withLineupConflictGuard<T>(
  choreoIds: Array<string | null | undefined>,
  work: () => Promise<T>,
): Promise<T> {
  const targets = [
    ...new Set(
      choreoIds.filter((id): id is string => typeof id === "string" && !!id),
    ),
  ].sort();

  if (targets.length === 0) {
    return work();
  }

  return db.transaction(async (transaction) =>
    runInTransaction(transaction, async () => {
      for (const choreoId of targets) {
        await acquireLock(transaction, choreoId);
      }

      const before = await snapshotLineupConflicts(targets, transaction);
      const result = await work();
      const after = await snapshotLineupConflicts(targets, transaction);

      const introduced = describeNewViolations(before, after);
      if (introduced.length > 0) {
        throw new LineupConflictError(
          `Lineup consistency conflict introduced: ${introduced.join(", ")}`,
        );
      }

      logger.debug(
        `Lineup conflict guard accepted mutation for ${JSON.stringify(targets)}`,
      );
      return result;
    }),
  );
}
