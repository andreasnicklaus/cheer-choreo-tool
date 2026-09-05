import { FaultyInputError } from "@/utils/errors";
import { NextFunction, Request, Response } from "express";
import { type ZodSchema } from "zod";

export function validate<T>(
  schema: ZodSchema<T>,
  source: "body" | "query" | "params" = "body",
) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const messages = result.error.issues.map((issue) => {
        const path = issue.path.join(".");
        const code = issue.code;
        const fieldKey = `validation.${path}.${code}`;
        const genericKey = `validation.generic.${code}`;
        const fieldMsg = req.t(fieldKey);
        if (fieldMsg !== fieldKey) return fieldMsg;
        const genericMsg = req.t(genericKey);
        if (genericMsg !== genericKey) return `${path}: ${genericMsg}`;
        return `${path}: ${issue.message}`;
      });
      return next(new FaultyInputError(messages.join("; ")));
    }
    // Cannot assign query because it has only a getter, so we skip it
    if (source !== "query") req[source] = result.data;
    next();
  };
}
