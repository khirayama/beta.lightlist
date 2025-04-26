type Session = {
  session: {
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
    expiresIn: number;
  };
  user: {
    id: string;
    email: string;
  };
};

export function saveSession(session: Session) {
  window.localStorage.setItem("__session", JSON.stringify(session));
}

export function loadSession(): Session | null {
  return JSON.parse(window.localStorage.getItem("__session")) || null;
}
