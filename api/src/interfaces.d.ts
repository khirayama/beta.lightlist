type DeepPartial<T> = {
  [P in keyof T]?: T[P] | DeepPartial<T[P]>;
};

type Task = {
  id: string;
  text: string;
  completed: boolean;
  date: string;
};

type TaskList = {
  id: string;
  name: string;
  tasks: Task[];
  shareCode: string;
  update: Uint8Array;
};

type App = {
  taskListIds: string[];
  update: Uint8Array;
};

type Preferences = {
  displayName: string;
  lang: "EN" | "JA";
  theme: "SYSTEM" | "LIGHT" | "DARK";
  autoSort: boolean;
  taskInsertPosition: "BOTTOM" | "TOP";
};
