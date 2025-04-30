import axios from "axios";

import { sessionStorage } from "./session";

const API_URL = "http://localhost:3000";

const refreshToken = (() => {
  let isRefreshing = null;

  return () => {
    if (isRefreshing) {
      return isRefreshing;
    }

    isRefreshing = new Promise((resolve, reject) => {
      const s = sessionStorage.load();
      const min3 = 60 * 3;

      if (s.session.expiresAt - Date.now() / 1000 < min3) {
        isRefreshing = true;

        axios
          .post(
            "/api/auth/refresh",
            {
              refreshToken: s.session.refreshToken,
            },
            {
              baseURL: API_URL,
            }
          )
          .then((res) => {
            isRefreshing = null;
            sessionStorage.save(res.data);
            return resolve(res.data);
          })
          .catch((err) => {
            reject(err);
            throw new Error(err.response.data.error);
          });
      } else {
        resolve(s);
      }
    });
    return isRefreshing;
  };
})();

export function register(credentials: { email: string; password: string }) {
  return axios
    .post("/api/auth/register", credentials, {
      baseURL: API_URL,
    })
    .then((res) => {
      sessionStorage.save(res.data);
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
      sessionStorage.save(res.data);
      return res.data;
    })
    .catch((err) => {
      throw new Error(err.response.data.error);
    });
}

export function getApp() {
  return refreshToken().then(() => {
    const s = sessionStorage.load();

    return axios
      .get("/api/app", {
        baseURL: API_URL,
        headers: {
          Authorization: `Bearer ${s.session.accessToken}`,
        },
      })
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        throw new Error(err.response.data.error);
      });
  });
}

export function getTaskLists() {
  return refreshToken().then(() => {
    const s = sessionStorage.load();

    return axios
      .get("/api/task-lists", {
        baseURL: API_URL,
        headers: {
          Authorization: `Bearer ${s.session.accessToken}`,
        },
      })
      .then((res) => {
        return res.data;
      })
      .catch((err) => {
        throw new Error(err.response.data.error);
      });
  });
}
