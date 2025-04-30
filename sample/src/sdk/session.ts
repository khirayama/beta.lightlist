const sessionStorages: {
  [key: string]: {
    save: (session: Session) => void;
    load: () => Session | null;
  };
} = {
  web: {
    save: (session: Session) => {
      window.localStorage.setItem("__session", JSON.stringify(session));
    },
    load: () => {
      const s = window.localStorage.getItem("__session");
      return s ? JSON.parse(s) : null;
    },
  },
  cli: {
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
