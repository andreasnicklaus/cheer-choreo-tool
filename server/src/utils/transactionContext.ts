import { AsyncLocalStorage } from "node:async_hooks";
import type { Transaction } from "sequelize";

const transactionStorage = new AsyncLocalStorage<Transaction>();

/**
 * Run `work` with `transaction` bound as the ambient transaction.
 *
 * While the returned promise is pending, any code it calls can retrieve the
 * same transaction via {@link getTransaction} without it being threaded through
 * every function signature. Used by the lineup conflict guard so a mutation,
 * its before/after conflict snapshots, and its writes all share one connection
 * and roll back together.
 *
 * @template T
 * @param {Transaction} transaction - The transaction to expose to `work`.
 * @param {() => Promise<T>} work - The callback run inside the transaction context.
 * @returns {Promise<T>} The resolved value of `work`.
 */
export function runInTransaction<T>(
  transaction: Transaction,
  work: () => Promise<T>,
): Promise<T> {
  return transactionStorage.run(transaction, work);
}

/**
 * Get the transaction bound by the nearest enclosing {@link runInTransaction}.
 *
 * @returns {Transaction | undefined} The ambient transaction, or `undefined`
 * when called outside any `runInTransaction` scope (the normal, unguarded path).
 */
export function getTransaction(): Transaction | undefined {
  return transactionStorage.getStore();
}
