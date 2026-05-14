import { uuidParams, uuidParamsOptional, colorHex } from "@/utils/zodSchemas";

describe("uuidParams", () => {
  it("accepts a valid UUID", () => {
    const result = uuidParams.safeParse({ id: "550e8400-e29b-41d4-a716-446655440000" });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid UUID string", () => {
    const result = uuidParams.safeParse({ id: "not-a-uuid" });
    expect(result.success).toBe(false);
  });

  it("rejects a missing id", () => {
    const result = uuidParams.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects a non-string id", () => {
    const result = uuidParams.safeParse({ id: 123 });
    expect(result.success).toBe(false);
  });
});

describe("uuidParamsOptional", () => {
  it("accepts a valid UUID", () => {
    const result = uuidParamsOptional.safeParse({ id: "550e8400-e29b-41d4-a716-446655440000" });
    expect(result.success).toBe(true);
  });

  it("accepts missing id", () => {
    const result = uuidParamsOptional.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts explicit undefined id", () => {
    const result = uuidParamsOptional.safeParse({ id: undefined });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid UUID string", () => {
    const result = uuidParamsOptional.safeParse({ id: "not-a-uuid" });
    expect(result.success).toBe(false);
  });
});

describe("colorHex", () => {
  it("accepts a valid 6-digit hex color with hash", () => {
    expect(colorHex.safeParse("#000000").success).toBe(true);
    expect(colorHex.safeParse("#FFFFFF").success).toBe(true);
    expect(colorHex.safeParse("#ffffff").success).toBe(true);
    expect(colorHex.safeParse("#a1b2c3").success).toBe(true);
    expect(colorHex.safeParse("#A1B2C3").success).toBe(true);
  });

  it("rejects hex colors without hash prefix", () => {
    const result = colorHex.safeParse("000000");
    expect(result.success).toBe(false);
  });

  it("rejects 3-digit hex colors", () => {
    const result = colorHex.safeParse("#FFF");
    expect(result.success).toBe(false);
  });

  it("rejects 8-digit hex colors", () => {
    const result = colorHex.safeParse("#000000FF");
    expect(result.success).toBe(false);
  });

  it("rejects hex colors with invalid characters", () => {
    const result = colorHex.safeParse("#GGGGGG");
    expect(result.success).toBe(false);
  });

  it("rejects empty string", () => {
    const result = colorHex.safeParse("");
    expect(result.success).toBe(false);
  });
});
