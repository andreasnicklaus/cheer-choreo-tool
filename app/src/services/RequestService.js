import axios from "axios";
import { setupCache } from "axios-cache-interceptor";

const ax = setupCache(
  axios.create({
    baseURL:
      process.env.NODE_ENV == "production"
        ? "https://api.cheer.andreasnicklaus.de/"
        : "http://localhost:3000/",
  }),
  { headerInterpreter: () => 50 }
);

// ax.interceptors.response.use(
// (response) => response
// (error) => {
//   switch (error.response.status) {
//     case 401:
//       UserService.logout();
//       break;
//     case 403:
//       UserService.logout({ name: "Login" });
//       break;
//     default:
//       console.warn(error);
//   }
//   return Promise.reject(error);
// }
// );

// const sessionAuthToken = sessionStorage.getItem("authToken");
// if (sessionAuthToken)
//   ax.defaults.headers.common.Authorization = "Bearer " + sessionAuthToken;

export default ax;
