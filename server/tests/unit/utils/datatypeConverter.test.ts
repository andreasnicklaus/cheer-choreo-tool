import { describe, expect, test } from "@jest/globals";
import sequelizeDataTypeToHtmlInputType from "@/utils/datatypeConverter";
import { DataTypes } from "sequelize";
import logger from "@/plugins/winston";

jest.mock("@/plugins/winston", () => ({
  debug: jest.fn(),
}));

describe("datatypeConverter", () => {
  test("sequalizeDataTypeToHTMLInputType converts datatypes to the correct html input type", () => {
    expect(sequelizeDataTypeToHtmlInputType(DataTypes.STRING)).toBe("text");
    expect(sequelizeDataTypeToHtmlInputType(DataTypes.INTEGER)).toBe("number");
    expect(sequelizeDataTypeToHtmlInputType(DataTypes.UUID)).toBe("text");
    expect(sequelizeDataTypeToHtmlInputType(DataTypes.ENUM)).toBe("ENUM");
    expect(sequelizeDataTypeToHtmlInputType(DataTypes.ARRAY)).toBe("text");

    expect(logger.debug).toHaveBeenCalledTimes(5);
  });
});
