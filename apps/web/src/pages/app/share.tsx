import { useEffect, useSyncExternalStore } from "react";

import {
  init,
  getTaskListsByShareCodes,
  addTaskList,
  store,
  type Task,
} from "sdk";

/* Features
 * [x] TaskListの表示
 * [x] TaskListの追加
 */

function getShareCodesFromURL(): string[] {
  if (typeof window === "undefined") {
    return [];
  }
  const params = window.location.search.substring(1).split("&");
  for (const param of params) {
    const [key, value] = param.split("=");
    if (key === "shareCodes") {
      const shareCodes = value.split(",");
      return shareCodes;
    }
  }
  return [];
}

export default function SharePage() {
  useEffect(() => {
    init();
    getTaskListsByShareCodes(getShareCodesFromURL());
  }, []);

  const state = useSyncExternalStore(
    store.subscribe,
    () => store.data,
    () => store.data
  );

  const shareCodes = getShareCodesFromURL();
  const taskLists = shareCodes.map((shareCode) => {
    return Object.values(state.taskLists).find(
      (taskList) => taskList.shareCode === shareCode
    );
  });

  return (
    <div>
      <div>
        <a href="/app">App</a>
      </div>
      <p>Share page</p>
      <div>
        {taskLists.map((taskList) => {
          if (!taskList) {
            return null;
          }
          return (
            <div key={taskList.id}>
              <h2>{taskList.name}</h2>
              <button
                onClick={() => {
                  addTaskList(taskList.id);
                }}
              >
                Add
              </button>
              <ul>
                {taskList.tasks.map((task: Task) => (
                  <li key={task.id}>{task.text}</li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
