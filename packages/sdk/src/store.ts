import * as Y from "yjs";

import { type Store } from "./types";

export const store: {
  data: Store;
  docs: {
    app: Y.Doc;
    taskLists: Record<string, Y.Doc>;
  };
  listeners: Array<(s: Store) => void>;
  subscribe: (listener: (s: Store) => void) => () => void;
  emit: () => void;
} = {
  data: {
    app: {
      taskListIds: [],
      update: new Uint8Array(),
    },
    preferences: {
      displayName: "",
      lang: "JA",
      theme: "SYSTEM",
      autoSort: false,
      taskInsertPosition: "BOTTOM",
    },
    taskLists: {},
  },
  docs: {
    app: null,
    taskLists: {},
  },
  listeners: [],
  subscribe: (listener: (s: Store) => void) => {
    store.listeners = [...store.listeners, listener];
    return () => {
      store.listeners = store.listeners.filter((l) => l !== listener);
    };
  },
  emit: () => {
    store.data = { ...store.data };
    store.listeners.forEach((listener) => listener(store.data));
  },
};
