import logger from "../plugins/winston";

function sequelizeDataTypeToHtmlInputType(sequelizeDataType: { key: string }) {
  logger.debug(`Converting data type ${sequelizeDataType.key}`);
  switch (sequelizeDataType.key) {
    case "STRING":
      return "text";
    case "INTEGER":
      return "number";
    case "UUID":
      return "text";
    case "ENUM":
      return "ENUM";
    default:
      return "text";
  }
}

export default sequelizeDataTypeToHtmlInputType;
