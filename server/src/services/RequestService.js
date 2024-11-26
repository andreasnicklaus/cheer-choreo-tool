const axios = require("axios");

const mailAx = axios.create({
  baseURL: `http://${process.env.MAILPROXY_HOST}:${process.env.MAILPROXY_PORT}`,
});

mailAx.interceptors.request.use(
  (config) => {
    const token = process.env.MAILPROXY_SECRET;
    config.headers.Authorization = "Bearer " + token;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

module.exports = { mailAx };
