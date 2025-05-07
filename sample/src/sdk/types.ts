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
  taskListIds: string[];
  update: Uint8Array;
};

export type Preferences = {
  displayName: string;
  lang: "EN" | "JA";
  theme: "SYSTEM" | "LIGHT" | "DARK";
  autoSort: boolean;
  taskInsertPosition: "BOTTOM" | "TOP";
};

export type Store = {
  app: App;
  preferences: Preferences;
  taskLists: {
    [key: string]: TaskList;
  };
};
