import { v4 as uuid } from "uuid";
import * as Y from "yjs";

import { TaskList, Task, App } from "./types";
import { store } from "./store";
import {
  getApp as getAppAsync,
  getTaskLists as getTaskListsAsync,
  updateTaskList as updateTaskListAsync,
} from "./services";

/*
 * getApp
 * getTaskLists
 * insertTask
 * updateTask
 */

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

  const tl = taskListMap.toJSON() as TaskList;
  tl.update = Y.encodeStateAsUpdate(doc);

  store.data.taskLists[tl.id] = tl;
  store.docs.taskLists[tl.id] = doc;
  store.emit();
  return [tl, updateTaskListAsync(tl)];
}
