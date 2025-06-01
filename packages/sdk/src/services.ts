import axios from "axios";

import { App, TaskList, Preferences } from "./types";
import { sessionStorage } from "./session";

const API_URL = "http://localhost:3000";

let isRefreshing = null;
const refreshToken = (() => {
  return () => {
    if (isRefreshing) {
      console.log("on refreshing process", isRefreshing);
      return isRefreshing;
    }
    console.log("preparing to refresh", isRefreshing);
    
    const s = sessionStorage.load();
    const min3 = 60 * 3;

    if (s.session.expiresAt - Date.now() / 1000 < min3) {
      console.log("start refreshing");
      isRefreshing = axios
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
          console.log("refresh success");
          sessionStorage.save(res.data);
          return res.data;
        })
        .catch((err) => {
          console.log("refresh failed", err);
          throw new Error(err.response.data.error);
        })
        .finally(() => {
          console.log("refresh finished");
          isRefreshing = null;
        });
    } else {
      isRefreshing = Promise.resolve(s);
      setTimeout(() => {
        isRefreshing = null;
        console.log("valid token, no need to refresh", isRefreshing);
      }, 0);
      console.log("valid token, no need to refresh", isRefreshing);
    }
    
    console.log("return isRefreshing", isRefreshing);
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

export function logout() {
  return refreshToken().then(() => {
    const s = sessionStorage.load();
    return axios
      .post(
        "/api/auth/logout",
        {},
        {
          baseURL: API_URL,
          headers: {
            Authorization: `Bearer ${s.session.accessToken}`,
          },
        }
      )
      .then((res) => {
        sessionStorage.save(null);
        return res.data;
      })
      .catch((err) => {
        throw new Error(err.response.data.error);
      });
  });
}

export function deleteUser() {
  return refreshToken().then(() => {
    const s = sessionStorage.load();
    return axios
      .delete("/api/auth/user", {
        baseURL: API_URL,
        headers: {
          Authorization: `Bearer ${s.session.accessToken}`,
        },
      })
      .then((res) => {
        sessionStorage.save(null);
        return res.data;
      })
      .catch((err) => {
        throw new Error(err.response.data.error);
      });
  });
}

export function loadSession() {
  return sessionStorage.load();
}

export function updateEmail(credentials: { email: string }) {
  return refreshToken().then(() => {
    const s = sessionStorage.load();

    return axios
      .put("/api/auth/email", credentials, {
        baseURL: API_URL,
        headers: {
          Authorization: `Bearer ${s.session.accessToken}`,
        },
      })
      .then((res) => {
        const s = sessionStorage.load();
        sessionStorage.save({ ...s, ...res.data });
        return res.data;
      })
      .catch((err) => {
        throw new Error(err.response.data.error);
      });
  });
}

export function updatePassword(credentials: {
  currentPassword: string;
  newPassword: string;
}) {
  return refreshToken().then(() => {
    const s = sessionStorage.load();

    return axios
      .put("/api/auth/password", credentials, {
        baseURL: API_URL,
        headers: {
          Authorization: `Bearer ${s.session.accessToken}`,
        },
      })
      .then((res) => {
        const s = sessionStorage.load();
        sessionStorage.save({ ...s, ...res.data });
        return res.data;
      })
      .catch((err) => {
        throw new Error(err.response.data.error);
      });
  });
}

export function sendPasswordResetRequest(options: {
  email: string;
  redirectTo: string;
}) {
  return axios
    .post("/api/auth/reset-password", options, {
      baseURL: API_URL,
    })
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      throw new Error(err.response.data.error);
    });
}

export function resetPassword(credentials: { password: string }) {
  const s = sessionStorage.parseHash(window.location.hash);

  return axios
    .put("/api/auth/reset-password", credentials, {
      baseURL: API_URL,
      headers: {
        Authorization: `Bearer ${s.session.accessToken}`,
      },
    })
    .then((res) => {
      const s = sessionStorage.load();
      sessionStorage.save({ ...s, ...res.data });
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

export function getTaskListsByShareCodes(shareCodes: string[]) {
  const s = sessionStorage.load();

  return axios
    .get("/api/task-lists", {
      params: {
        shareCodes,
      },
      paramsSerializer: {
        indexes: null,
      },
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
}
