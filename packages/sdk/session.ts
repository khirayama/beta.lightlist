import { Session } from "./types";

function parseHash(hash: string): Session {
  const params = hash.substring(1).split("&");
  const result: { [key: string]: string } = {};
  params.forEach((param) => {
    const [key, value] = param.split("=");
    result[decodeURIComponent(key)] = decodeURIComponent(value);
  });
  return {
    session: {
      accessToken: result["access_token"],
      refreshToken: result["refresh_token"],
      expiresAt: parseInt(result["expires_at"]),
      expiresIn: parseInt(result["expires_in"]),
    },
    user: null,
  };
}

const sessionStorages: {
  [key: string]: {
    save: (session: Session) => void;
    load: () => Session | null;
    parseHash: (hash: string) => Session;
  };
} = {
  web: {
    parseHash,
    save: (session: Session) => {
      window.localStorage.setItem("__session", JSON.stringify(session));
    },
    load: () => {
      const s = window.localStorage.getItem("__session");
      return s ? JSON.parse(s) : null;
    },
  },
  cli: {
    parseHash,
    save: (session: Session) => {
      console.log("Saving session for CLI", session);
      // Implement CLI-specific storage logic here
    },
    load: () => {
      console.log("Loading session for CLI");
      // Implement CLI-specific loading logic here
      return null;
    },
  },
};

export let sessionStorage = {
  parseHash,
  save: (session: Session) => {
    console.warn(
      "Please call setSessionStorage first to set the storage type."
    );
    console.warn(session);
  },
  load: () => {
    console.warn(
      "Please call setSessionStorage first to set the storage type."
    );
    return null;
  },
};

export function setSessionStorage(storage: "web" | "cli") {
  sessionStorage = sessionStorages[storage];
}
