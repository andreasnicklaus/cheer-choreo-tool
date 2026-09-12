import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { FaultyInputError } from "@/utils/errors";
import { validate } from "@/middlewares/validateMiddleware";

function mockReq(overrides: Partial<Request> = {}): Request {
  return {
    body: {},
    query: {},
    params: {},
    t: jest.fn().mockImplementation((key: string) => key),
    ...overrides,
  } as unknown as Request;
}

function mockRes(): Response {
  return {} as Response;
}

function mockNext(): jest.MockedFunction<NextFunction> {
  return jest.fn();
}

const testSchema = z.object({
  name: z.string().min(1),
  age: z.number().int().min(0).optional(),
});

describe("validate middleware", () => {
  describe("body source (default)", () => {
    it("calls next() with no error on valid input", () => {
      const req = mockReq({ body: { name: "Alice", age: 25 } });
      const res = mockRes();
      const next = mockNext();

      validate(testSchema)(req, res, next);

      expect(next).toHaveBeenCalledWith();
      expect(next).not.toHaveBeenCalledWith(expect.any(Error));
    });

    it("strips unknown fields from body", () => {
      const req = mockReq({
        body: { name: "Alice", age: 25, extraField: "shouldBeRemoved" },
      });
      const res = mockRes();
      const next = mockNext();

      validate(testSchema)(req, res, next);

      expect(next).toHaveBeenCalledWith();
      expect(req.body).toEqual({ name: "Alice", age: 25 });
      expect((req.body as Record<string, unknown>).extraField).toBeUndefined();
    });

    it("calls next() with FaultyInputError when required field is missing", () => {
      const req = mockReq({ body: { age: 25 } });
      const res = mockRes();
      const next = mockNext();

      validate(testSchema)(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(FaultyInputError));
      const error = next.mock.calls[0][0] as unknown as FaultyInputError;
      expect(error.message).toContain("name");
      expect(error.name).toBe("FaultyInputError");
    });

    it("calls next() with FaultyInputError when type is wrong", () => {
      const req = mockReq({ body: { name: 123 } });
      const res = mockRes();
      const next = mockNext();

      validate(testSchema)(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(FaultyInputError));
      const error = next.mock.calls[0][0] as unknown as FaultyInputError;
      expect(error.message).toContain("name");
      expect(error.name).toBe("FaultyInputError");
    });

    it("uses req.t() for i18n translation", () => {
      const req = mockReq({
        body: { name: "" },
        t: jest.fn().mockImplementation((key: string) => {
          const map: Record<string, string> = {
            "validation.name.too_small": "Name is too short",
          };
          return map[key] || key;
        }),
      });
      const res = mockRes();
      const next = mockNext();

      const schema = z.object({ name: z.string().min(1) });
      validate(schema)(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(FaultyInputError));
      const error = next.mock.calls[0][0] as unknown as FaultyInputError;
      expect(error.message).toBe("Name is too short");
    });

    it("falls back to generic key when field-specific key is not found", () => {
      const req = mockReq({
        body: { name: "" },
        t: jest.fn().mockImplementation((key: string) => {
          const map: Record<string, string> = {
            "validation.generic.too_small": "Value is too small",
          };
          return map[key] || key;
        }),
      });
      const res = mockRes();
      const next = mockNext();

      const schema = z.object({ name: z.string().min(1) });
      validate(schema)(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(FaultyInputError));
      const error = next.mock.calls[0][0] as unknown as FaultyInputError;
      expect(error.message).toBe("name: Value is too small");
    });

    it("falls back to raw zod message when no i18n key matches", () => {
      const req = mockReq({
        body: { name: "" },
        t: jest.fn().mockImplementation((key: string) => key),
      });
      const res = mockRes();
      const next = mockNext();

      const schema = z.object({ name: z.string().min(1) });
      validate(schema)(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(FaultyInputError));
      const error = next.mock.calls[0][0] as unknown as FaultyInputError;
      expect(error.message).toContain("name:");
    });
  });

  describe("query source", () => {
    it("validates req.query instead of req.body", () => {
      const querySchema = z.object({
        lineupId: z.uuid().optional(),
      });

      const req = mockReq({
        body: { name: "shouldBeIgnored" },
        query: { lineupId: "not-a-uuid" },
      });
      const res = mockRes();
      const next = mockNext();

      validate(querySchema, "query")(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(FaultyInputError));
    });

    it("passes valid query through", () => {
      const querySchema = z.object({
        name: z.string().optional(),
      });

      const req = mockReq({ query: { name: "valid-name" } });
      const res = mockRes();
      const next = mockNext();

      validate(querySchema, "query")(req, res, next);

      expect(next).toHaveBeenCalledWith();
    });
  });

  describe("params source", () => {
    it("validates req.params", () => {
      const paramsSchema = z.object({
        id: z.uuid(),
      });

      const req = mockReq({ params: { id: "not-a-uuid" } });
      const res = mockRes();
      const next = mockNext();

      validate(paramsSchema, "params")(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(FaultyInputError));
    });

    it("passes valid UUID params through", () => {
      const validUuid = "550e8400-e29b-41d4-a716-446655440000";
      const paramsSchema = z.object({ id: z.uuid() });

      const req = mockReq({ params: { id: validUuid } });
      const res = mockRes();
      const next = mockNext();

      validate(paramsSchema, "params")(req, res, next);

      expect(next).toHaveBeenCalledWith();
    });
  });
});
