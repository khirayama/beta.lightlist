import axios from "axios";

const API_URL = "http://localhost:3000";

export function register(credentials: { email: string; password: string }) {
  return axios
    .post("/api/auth/register", credentials, {
      baseURL: API_URL,
    })
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      throw new Error(err.response.data.error);
    });
}

export function login(credentials: { email: string; password: string }) {
  return axios
    .post("/api/auth/login", credentials, {
      baseURL: API_URL,
    })
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      throw new Error(err.response.data.error);
    });
}
