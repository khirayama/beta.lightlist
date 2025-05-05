import axios from "axios";

import { App, TaskList, Preferences } from "./types";
import { sessionStorage } from "./session";

const API_URL = "http://localhost:3000";

const refreshToken = (() => {
  let isRefreshing = null;

  return () => {
    console.warn("Checking token", isRefreshing);

    if (isRefreshing) {
      return isRefreshing;
    }

    isRefreshing = new Promise((resolve, reject) => {
      const s = sessionStorage.load();
      const min3 = 60 * 3;

      if (s.session.expiresAt - Date.now() / 1000 < min3) {
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
            sessionStorage.save(res.data);
            return resolve(res.data);
          })
          .catch((err) => {
            reject(err);
            throw new Error(err.response.data.error);
          })
          .finally(() => {
            isRefreshing = null;
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

export function updateApp(newApp: Partial<App>) {
  return refreshToken().then(() => {
    const s = sessionStorage.load();

    return axios
      .patch("/api/app", newApp, {
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

export function getPreferences() {
  return refreshToken().then(() => {
    const s = sessionStorage.load();

    return axios
      .get("/api/preferences", {
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

export function updatePreferences(newPreferences: Partial<Preferences>) {
  return refreshToken().then(() => {
    const s = sessionStorage.load();

    return axios
      .patch("/api/preferences", newPreferences, {
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

export function createTaskList(newTaskList: Partial<TaskList>) {
  return refreshToken().then(() => {
    const s = sessionStorage.load();

    return axios
      .post("/api/task-lists", newTaskList, {
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

export function updateTaskList(newTaskList: Partial<TaskList>) {
  return refreshToken().then(() => {
    const s = sessionStorage.load();

    return axios
      .patch(`/api/task-lists/${newTaskList.id}`, newTaskList, {
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

export function deleteTaskList(taskListId: string) {
  return refreshToken().then(() => {
    const s = sessionStorage.load();

    return axios
      .delete(`/api/task-lists/${taskListId}`, {
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
