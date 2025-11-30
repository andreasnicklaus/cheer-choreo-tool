import { AuthorizationError, FaultyInputError, MisconfigurationError, NotFoundError, RequestOrderError } from "@/utils/errors";

describe("errors", () => {
  test("NotFoundError has correct name and message", () => {
    const error = new NotFoundError("Resource not found");
    expect(error.name).toBe("NotFoundError");
    expect(error.message).toBe("Resource not found");
  })

  test("RequestOrderError has correct name", () => {
    const error = new RequestOrderError("Request order is incorrect");
    expect(error.name).toBe("RequestOrderError");
    expect(error.message).toBe("Request order is incorrect");
  })

  test("FaultyInputError has correct name", () => {
    const error = new FaultyInputError("Input is faulty");
    expect(error.name).toBe("FaultyInputError");
    expect(error.message).toBe("Input is faulty");
  })

  test("MisconfigurationError has correct name", () => {
    const error = new MisconfigurationError("Configuration is faulty");
    expect(error.name).toBe("MisconfigurationError");
    expect(error.message).toBe("Configuration is faulty");
  })

  test("AuthorizationError has correct name", () => {
    const error = new AuthorizationError("Not authorized");
    expect(error.name).toBe("AuthorizationError");
    expect(error.message).toBe("Not authorized");
  })
})