module.exports.sequelizeDataTypeToHtmlInputType = (sequelizeDataType) => {
  switch (sequelizeDataType.key) {
    case "STRING":
      return "text";
    case "INTEGER":
      return "number";
    case "UUID":
      return "text";
    default:
      return "text";
  }
};
