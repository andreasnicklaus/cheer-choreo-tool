module.exports = async function (globalConfig, projectConfig) {
  console.log("🚀 ~ projectConfig:", projectConfig);
  console.log("🚀 ~ globalConfig:", globalConfig);

  process.env.IsTest = "true";
};
