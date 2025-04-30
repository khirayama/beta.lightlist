import { v4 as uuid } from "uuid";
import * as Y from "yjs";

const docs: {
  taskLists: Record<string, Y.Doc>;
} = {
  taskLists: {},
};

export function insertTask(
  taskListId: string,
  task: Partial<Task>,
  index: number = -1
): TaskList {
  const doc = docs.taskLists[taskListId];
  const taskList = doc.getMap(taskListId);
  const tasks = taskList.get("tasks") as Y.Array<Y.Map<any>>;

  const newTask = new Y.Map();
  newTask.set("id", uuid());
  newTask.set("text", task.text || false);
  newTask.set("completed", task.completed || false);
  newTask.set("date", task.date || "");

  if (index === -1) {
    tasks.push([newTask]);
  } else {
    tasks.insert(index, [newTask]);
  }
  const tl = taskList.toJSON() as TaskList;
  tl.update = Y.encodeStateAsUpdate(doc);
  // updateTaskListAsync(tl);
  return tl;
}
