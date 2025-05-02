import { v4 as uuid } from "uuid";
import * as Y from "yjs";

import { TaskList, Task, App } from "./types";
import { store } from "./store";
import {
  register as registerAsync,
  login as loginAsync,
  getApp as getAppAsync,
  getTaskLists as getTaskListsAsync,
  updateTaskList as updateTaskListAsync,
} from "./services";

/*
 * *Auth
 * [x] register
 * [x] login
 * [ ] updateEmail
 *
 * *App
 * [x] getApp
 * [ ] updateApp
 *
 * *Preferences
 * [ ] getPreferences
 * [ ] updatePreferences
 *
 * *Profile
 * [ ] getProfile
 * [ ] updateProfile
 *
 * *TaskList
 * [x] getTaskLists
 * [ ] insertTaskList
 * [ ] updateTaskList
 * [ ] deleteTaskList
 * [ ] moveTaskList
 * [x] sortTasks
 * [x] clearCompletedTasks
 * [ ] refreshShareCode
 *
 * *Task
 * [x] insertTask
 * [x] updateTask
 * [ ] moveTask
 */

/* Auth */
export function register(creadentials: {
  email: string;
  password: string;
}): Promise<any> {
  return registerAsync(creadentials);
}

export function login(credentials: {
  email: string;
  password: string;
}): Promise<any> {
  return loginAsync(credentials);
}

/* App */
export function getApp() {
  return getAppAsync().then((res) => {
    store.docs.app = new Y.Doc();
    Y.applyUpdate(
      store.docs.app,
      Uint8Array.from(Object.values(res.app.update))
    );
    store.data.app = store.docs.app.getMap("app").toJSON() as App;
    store.emit();
    return res;
  });
}

/* Preferences */

/* Profile */

/* TaskList */
export function getTaskLists() {
  return getTaskListsAsync().then((res) => {
    for (const tl of res.taskLists) {
      const doc = new Y.Doc();
      Y.applyUpdate(doc, Uint8Array.from(Object.values(tl.update)));
      store.docs.taskLists[tl.id] = doc;
      const taskList = doc.getMap(tl.id);
      store.data.taskLists[tl.id] = {
        ...taskList.toJSON(),
        shareCode: tl.shareCode,
      } as TaskList;
    }
    store.emit();
    return res;
  });
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
}

export function sortTasks(taskListId: string): [TaskList, Promise<any>] {
  const doc = store.docs.taskLists[taskListId];
  const taskListMap = doc.getMap(taskListId);

  sortTasksWithoutEmit(taskListId);

  const tl = taskListMap.toJSON() as TaskList;
  tl.update = Y.encodeStateAsUpdate(doc);

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

  store.data.taskLists[tl.id] = tl;
  store.docs.taskLists[tl.id] = doc;
  store.emit();
  return [tl, updateTaskListAsync(tl)];
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

  store.data.taskLists[tl.id] = tl;
  store.docs.taskLists[tl.id] = doc;
  store.emit();
  return [tl, updateTaskListAsync(tl)];
}
