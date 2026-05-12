import logger from "../plugins/winston";

const PROTECTED_FIELDS = ["UserId", "creatorId", "updaterId"] as const;

export function stripProtectedUpdateFields<T extends object>(data: T): T {
  logger.debug(`Stripping protected fields from data: ${JSON.stringify(data)}`);
  const record = data as Record<string, unknown>;
  for (const field of PROTECTED_FIELDS) {
    if (field in record) {
      delete record[field];
    }
  }
  return data;
}
