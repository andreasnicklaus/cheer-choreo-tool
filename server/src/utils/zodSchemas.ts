import { z } from "zod";

export const uuidParams = z.object({ id: z.uuid() });
export const uuidParamsOptional = z.object({ id: z.uuid().optional() });

export const colorHex = z.string().regex(/^#[0-9a-fA-F]{6}$/);
