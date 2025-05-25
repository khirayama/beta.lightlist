import { v4 as uuid } from "uuid";
import * as Y from "yjs";

import { TaskList, Task, App, Preferences } from "./types";
import { store } from "./store";
import {
  getApp as getAppAsync,
  updateApp as updateAppAsync,
  getPreferences as getPreferencesAsync,
  updatePreferences as updatePreferencesAsync,
  getTaskLists as getTaskListsAsync,
  createTaskList as createTaskListAsync,
  updateTaskList as updateTaskListAsync,
  deleteTaskList as deleteTaskListAsync,
  getTaskListsByShareCodes as getTaskListsByShareCodesAsync,
} from "./services";

export {
  register,
  login,
  loadSession,
  updateEmail,
  updatePassword,
  sendPasswordResetRequest,
  resetPassword,
  logout,
  deleteUser,
} from "./services";

/*
 * [x] init
 *
 * *Auth from ./services
 * [x] register
 * [x] login
 * [x] loadSession
 * [x] updateEmail
 * [x] updatePassword
 * [x] sendPasswordResetRequest
 * [x] resetPassword
 * [x] logout
 * [x] deleteUser
 *
 * *Preferences
 * [x] getPreferences
 * [x] updatePreferences
 *
 * *TaskList
 * [x] getApp
 * [x] getTaskLists
 * [x] insertTaskList
 * [x] addTaskList
 * [x] updateTaskList
 * [x] deleteTaskList
 * [x] moveTaskList
 * [x] sortTasks
 * [x] clearCompletedTasks
 * [x] getTaskListsByShareCodes
 * [ ] refreshShareCode
 *
 * *Task
 * [x] insertTask
 * [x] updateTask
 * [x] moveTask
 */

function arrayMove<T>(array: T[], from: number, to: number): T[] {
  const newArray = [...array];
  const [removed] = newArray.splice(from, 1);
  newArray.splice(to, 0, removed);
  return newArray;
}

export function init() {
  return Promise.all([getApp(), getPreferences(), getTaskLists()]).then(
    (res) => {
      return {
        app: res[0].app,
        preferences: res[1].preferences,
        taskLists: res[2].taskLists,
      };
    }
  );
}

/* Preferences */
export function getPreferences() {
  return getPreferencesAsync().then((res) => {
    store.data.preferences = res.preferences;
    store.emit();
    return res;
  });
}

export function updatePreferences(preferences: Partial<Preferences>) {
  store.data.preferences = {
    ...store.data.preferences,
    ...preferences,
  };
  store.emit();
  return [store.data.preferences, updatePreferencesAsync(preferences)];
}

/* TaskList */
export function getApp() {
  return getAppAsync().then((res) => {
    const doc = store.docs.app || new Y.Doc();
    store.docs.app = doc;
    Y.applyUpdate(
      store.docs.app,
      Uint8Array.from(Object.values(res.app.update))
    );
    store.data.app = store.docs.app.getMap("app").toJSON() as App;
    store.emit();
    return res;
  });
}

export function getTaskLists() {
  return getTaskListsAsync().then((res) => {
    for (const tl of res.taskLists) {
      const doc = store.docs.taskLists[tl.id] || new Y.Doc();
      store.docs.taskLists[tl.id] = doc;
      Y.applyUpdate(doc, Uint8Array.from(Object.values(tl.update)));
      const taskList = doc.getMap(tl.id);
      store.data.taskLists[tl.id] = {
        ...taskList.toJSON(),
        shareCode: tl.shareCode,
      } as TaskList;
    }
    store.emit();
    return { taskLists: store.data.taskLists };
  });
}

export function insertTaskList(
  taskList: Partial<TaskList>,
  index: number
): [TaskList, Promise<any>] {
  const id = uuid();
  const doc = new Y.Doc();
  store.docs.taskLists[id] = doc;

  const taskListMap = doc.getMap(id);
  taskListMap.set("id", id);
  taskListMap.set("name", taskList.name || "");
  const taskArray = new Y.Array();
  taskListMap.set("tasks", taskArray);

  const appDoc = store.docs.app;
  const appMap = appDoc.getMap("app");
  const taskListIdArray = appMap.get("taskListIds") as Y.Array<string>;
  taskListIdArray.insert(index, [id]);

  const tl = taskListMap.toJSON() as TaskList;
  tl.update = Y.encodeStateAsUpdate(doc);
  tl.shareCode = uuid();

  const app = appMap.toJSON() as App;
  app.update = Y.encodeStateAsUpdate(appDoc);

  store.data.app = app;
  store.docs.app = appDoc;
  store.data.taskLists[tl.id] = tl;
  store.docs.taskLists[tl.id] = doc;
  store.emit();
  return [tl, Promise.all([createTaskListAsync(tl), updateAppAsync(app)])];
}

export function addTaskList(taskListId: string) {
  const appDoc = store.docs.app;
  const appMap = appDoc.getMap("app");
  const taskListIdArray = appMap.get("taskListIds") as Y.Array<string>;
  if (!taskListIdArray.toArray().includes(taskListId)) {
    taskListIdArray.push([taskListId]);
  }

  const app = appMap.toJSON() as App;
  app.update = Y.encodeStateAsUpdate(appDoc);

  store.data.app = app;
  store.docs.app = appDoc;
  store.emit();
  return [app, updateAppAsync(app)];
}

export function updateTaskList(
  taskList: Partial<TaskList>
): [TaskList, Promise<any>] {
  const doc = store.docs.taskLists[taskList.id];
  const taskListMap = doc.getMap(taskList.id);
  taskListMap.set("name", taskList.name || "");

  const tl = taskListMap.toJSON() as TaskList;
  tl.update = Y.encodeStateAsUpdate(doc);
  tl.shareCode = store.data.taskLists[taskList.id].shareCode;

  store.data.taskLists[tl.id] = tl;
  store.docs.taskLists[tl.id] = doc;
  store.emit();
  return [tl, updateTaskListAsync(tl)];
}

export function deleteTaskList(taskListId: string): [Promise<any>] {
  const appDoc = store.docs.app;
  const appMap = appDoc.getMap("app");
  const taskListIdArray = appMap.get("taskListIds") as Y.Array<string>;
  const index = taskListIdArray.toArray().indexOf(taskListId);

  taskListIdArray.delete(index);

  const app = appMap.toJSON() as App;
  app.update = Y.encodeStateAsUpdate(appDoc);

  store.data.app = app;
  store.docs.app = appDoc;
  delete store.data.taskLists[taskListId];
  delete store.docs.taskLists[taskListId];
  store.emit();
  return [Promise.all([deleteTaskListAsync(taskListId), updateAppAsync(app)])];
}

export function moveTaskList(from: number, to: number): [App, Promise<any>] {
  const appDoc = store.docs.app;
  const appMap = appDoc.getMap("app");
  const taskListIdArray = appMap.get("taskListIds") as Y.Array<string>;

  taskListIdArray.doc.transact(() => {
    const sortedTaskListIds = arrayMove(taskListIdArray.toJSON(), from, to);
    for (let i = sortedTaskListIds.length - 1; i >= 0; i--) {
      for (let j = 0; j < taskListIdArray.length; j++) {
        if (taskListIdArray.get(j) === sortedTaskListIds[i]) {
          const t = taskListIdArray.get(j);
          taskListIdArray.delete(j);
          taskListIdArray.insert(0, [t]);
          break;
        }
      }
    }
  });

  const app = appMap.toJSON() as App;
  app.update = Y.encodeStateAsUpdate(appDoc);

  store.data.app = app;
  store.docs.app = appDoc;
  store.emit();
  return [app, updateAppAsync(app)];
}

function sortTasksWithoutEmit(taskListId: string) {
  const doc = store.docs.taskLists[taskListId];
  const taskListMap = doc.getMap(taskListId);
  const taskArray = taskListMap.get("tasks") as Y.Array<Y.Map<any>>;

  taskArray.doc.transact(() => {
    const sortedTasks = taskArray.toJSON().sort((a, b) => {
      if (a.completed && !b.completed) {
        return 1;
      }
      if (!a.completed && b.completed) {
        return -1;
      }
      if (!a.date && b.date) {
        return 1;
      }
      if (a.date && !b.date) {
        return -1;
      }
      if (a.date > b.date) {
        return 1;
      }
      if (a.date < b.date) {
        return -1;
      }
      return 0;
    });
    for (let i = sortedTasks.length - 1; i >= 0; i--) {
      for (let j = 0; j < taskArray.length; j++) {
        const task = taskArray.get(j);
        if (task.get("id") === sortedTasks[i].id) {
          const t = task.clone();
          taskArray.delete(j);
          taskArray.insert(0, [t]);
          break;
        }
      }
    }
  });

  const tl = taskListMap.toJSON() as TaskList;
  tl.update = Y.encodeStateAsUpdate(doc);
  tl.shareCode = store.data.taskLists[taskListId].shareCode;
}

export function sortTasks(taskListId: string): [TaskList, Promise<any>] {
  const doc = store.docs.taskLists[taskListId];
  const taskListMap = doc.getMap(taskListId);

  sortTasksWithoutEmit(taskListId);

  const tl = taskListMap.toJSON() as TaskList;
  tl.update = Y.encodeStateAsUpdate(doc);
  tl.shareCode = store.data.taskLists[taskListId].shareCode;

  store.data.taskLists[tl.id] = tl;
  store.docs.taskLists[tl.id] = doc;
  store.emit();
  return [tl, updateTaskListAsync(tl)];
}

export function clearCompletedTasks(
  taskListId: string
): [TaskList, Promise<any>] {
  const doc = store.docs.taskLists[taskListId];
  const taskListMap = doc.getMap(taskListId);
  const taskArray = taskListMap.get("tasks") as Y.Array<Y.Map<any>>;

  taskArray.doc.transact(() => {
    for (let i = taskArray.length - 1; i >= 0; i--) {
      const task = taskArray.get(i);
      if (task.get("completed")) {
        taskArray.delete(i);
      }
    }
  });

  const tl = taskListMap.toJSON() as TaskList;
  tl.update = Y.encodeStateAsUpdate(doc);
  tl.shareCode = store.data.taskLists[taskListId].shareCode;

  store.data.taskLists[tl.id] = tl;
  store.docs.taskLists[tl.id] = doc;
  store.emit();
  return [tl, updateTaskListAsync(tl)];
}

export function getTaskListsByShareCodes(shareCodes: string[]) {
  return getTaskListsByShareCodesAsync(shareCodes).then((res) => {
    for (const tl of res.taskLists) {
      const doc = store.docs.taskLists[tl.id] || new Y.Doc();
      store.docs.taskLists[tl.id] = doc;
      Y.applyUpdate(doc, Uint8Array.from(Object.values(tl.update)));
      const taskList = doc.getMap(tl.id);
      store.data.taskLists[tl.id] = {
        ...taskList.toJSON(),
        shareCode: tl.shareCode,
      } as TaskList;
    }
    store.emit();
    return { taskLists: store.data.taskLists };
  });
}

/* Task */
export function insertTask(
  taskListId: string,
  task: Partial<Task>,
  index: number
): [TaskList, Promise<any>] {
  const doc = store.docs.taskLists[taskListId];
  const taskListMap = doc.getMap(taskListId);
  const taskArray = taskListMap.get("tasks") as Y.Array<Y.Map<any>>;

  const newTaskMap = new Y.Map();
  newTaskMap.set("id", uuid());
  newTaskMap.set("text", task.text || false);
  newTaskMap.set("completed", task.completed || false);
  newTaskMap.set("date", task.date || "");
  taskArray.insert(index, [newTaskMap]);

  if (store.data.preferences.autoSort) {
    sortTasksWithoutEmit(taskListId);
  }

  const tl = taskListMap.toJSON() as TaskList;
  tl.update = Y.encodeStateAsUpdate(doc);
  tl.shareCode = store.data.taskLists[taskListId].shareCode;

  store.data.taskLists[tl.id] = tl;
  store.docs.taskLists[tl.id] = doc;
  store.emit();
  return [tl, updateTaskListAsync(tl)];
}

export function updateTask(
  taskListId: string,
  newTask: Partial<Task>
): [TaskList, Promise<any>] {
  const doc = store.docs.taskLists[taskListId];
  const taskListMap = doc.getMap(taskListId);
  const taskArray = taskListMap.get("tasks") as Y.Array<Y.Map</* FIXME */ any>>;
  const taskMap = Array.from(taskArray).find((t) => t.get("id") === newTask.id);
  taskMap.set("text", newTask.text);
  taskMap.set("completed", newTask.completed);
  taskMap.set("date", newTask.date);

  if (store.data.preferences.autoSort) {
    sortTasksWithoutEmit(taskListId);
  }

  const tl = taskListMap.toJSON() as TaskList;
  tl.update = Y.encodeStateAsUpdate(doc);
  tl.shareCode = store.data.taskLists[taskListId].shareCode;

  store.data.taskLists[tl.id] = tl;
  store.docs.taskLists[tl.id] = doc;
  store.emit();
  return [tl, updateTaskListAsync(tl)];
}

export function moveTask(taskListId: string, from: number, to: number) {
  const doc = store.docs.taskLists[taskListId];
  const taskListMap = doc.getMap(taskListId);
  const taskArray = taskListMap.get("tasks") as Y.Array<Y.Map</* FIXME */ any>>;

  taskArray.doc.transact(() => {
    const sortedTasks = arrayMove(taskArray.toJSON(), from, to);
    for (let i = sortedTasks.length - 1; i >= 0; i--) {
      for (let j = 0; j < taskArray.length; j++) {
        const task = taskArray.get(j);
        if (task.get("id") === sortedTasks[i].id) {
          const t = task.clone();
          taskArray.delete(j);
          taskArray.insert(0, [t]);
          break;
        }
      }
    }
  });

  if (store.data.preferences.autoSort) {
    sortTasksWithoutEmit(taskListId);
  }

  const tl = taskListMap.toJSON() as TaskList;
  tl.update = Y.encodeStateAsUpdate(doc);
  tl.shareCode = store.data.taskLists[taskListId].shareCode;

  store.data.taskLists[tl.id] = tl;
  store.docs.taskLists[tl.id] = doc;
  store.emit();
  return [tl, updateTaskListAsync(tl)];
}
