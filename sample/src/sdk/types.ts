export type Session = {
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

export type Task = {
  id: string;
  text: string;
  completed: boolean;
  date: string;
};

export type TaskList = {
  id: string;
  name: string;
  tasks: Task[];
  shareCode: string;
  update: Uint8Array;
};

export type App = {
  taskInsertPosition: "BOTTOM" | "TOP";
  taskListIds: string[];
  update: Uint8Array;
};

export type Profile = {
  displayName: string;
};

export type Preferences = {
  lang: "EN" | "JA";
  theme: "SYSTEM" | "LIGHT" | "DARK";
  autoSort: boolean;
};

export type Store = {
  app: App;
  profile: Profile;
  preferences: Preferences;
  taskLists: {
    [key: string]: TaskList;
  };
};
