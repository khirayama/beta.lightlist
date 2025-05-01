import { useState, useEffect, useSyncExternalStore } from "react";

import { setSessionStorage } from "../../sdk/session";
import {
  getApp,
  getTaskLists,
  insertTask,
  updateTask,
} from "../../sdk/actions";
import { store } from "../../sdk/store";

setSessionStorage("web");

export default function AppPage() {
  const [selectedTaskListId, setSelectedTaskListId] = useState(null);
  const [newTaskText, setNewTaskText] = useState("");

  useEffect(() => {
    getApp()
      .then((res) => {
        setSelectedTaskListId(res.app.taskListIds[0]);
      })
      .catch((err) => {
        console.error(err);
      });
    getTaskLists().catch((err) => {
      console.error(err);
    });
  }, []);

  const state = useSyncExternalStore(
    store.subscribe,
    () => store.data,
    () => store.data
  );

  const app = state.app;
  const taskLists = state.taskLists;
  const taskList = taskLists[selectedTaskListId];

  return (
    <div>
      <div>
        <a href="/settings">Settings</a>
      </div>
      <div style={{ display: "flex" }}>
        <ul>
          {app?.taskListIds.map((tlid) => {
            const tl = taskLists[tlid];
            return (
              <li
                key={tlid}
                onClick={() => {
                  setSelectedTaskListId(tlid);
                }}
              >
                {tl?.name}({tl?.tasks.length})
              </li>
            );
          })}
        </ul>
        <div style={{ flex: 1 }}>
          {selectedTaskListId && taskLists[selectedTaskListId] && (
            <section>
              <header>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (newTaskText !== "") {
                      insertTask(
                        selectedTaskListId,
                        { text: newTaskText },
                        taskList.tasks.length
                      );
                      setNewTaskText("");
                    }
                  }}
                >
                  <input
                    type="text"
                    placeholder="New Task"
                    value={newTaskText}
                    onChange={(e) => {
                      setNewTaskText(e.currentTarget.value);
                    }}
                  />
                  <button>Add Task</button>
                </form>
              </header>
              <ul>
                {taskLists[selectedTaskListId].tasks.map((task) => {
                  return (
                    <li key={task.id}>
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={(e) => {
                          const completed = e.currentTarget.checked;
                          updateTask(selectedTaskListId, {
                            ...task,
                            completed,
                          });
                        }}
                      />
                      {task.text}
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
