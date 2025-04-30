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

// type App = {
//   taskInsertPosition: "BOTTOM" | "TOP";
//   taskListIds: string[];
//   update: Uint8Array;
// };
//
// type Profile = {
//   displayName: string;
// };
//
// type Preferences = {
//   lang: "EN" | "JA";
//   theme: "SYSTEM" | "LIGHT" | "DARK";
//   autoSort: boolean;
// };
