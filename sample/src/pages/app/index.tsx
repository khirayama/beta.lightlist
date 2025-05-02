import { useState, useEffect, useSyncExternalStore } from "react";

import { setSessionStorage } from "../../sdk/session";
import {
  getApp,
  getTaskLists,
  insertTaskList,
  insertTask,
  updateTask,
  sortTasks,
  clearCompletedTasks,
} from "../../sdk/actions";
import { store } from "../../sdk/store";
import { Task } from "../../sdk/types";

/* Features
 * [x] タスクリストの追加
 * [ ] タスクリストの削除
 * [ ] タスクリストの更新(タスクリスト名)
 * [ ] タスクリストの移動
 *
 * [x] タスクの並び替え
 * [x] タスクの自動並び替え
 * [x] タスクの削除
 * [ ] タスクの移動
 *
 * [x] タスクの追加
 * [x] タスクの更新(完了、テキスト、日付)
 */

setSessionStorage("web");

// MEMO: handleXXは、component用のevent handlerの命名で、(props, state, payload)を持つ
type ComponentEventHandler<P, S, V> = (props: P, state: S, val?: V) => void;

interface TaskTextInputProps {
  task: Task;
  handleBlur: ComponentEventHandler<TaskTextInputProps, { text: string }, null>;
}

function TaskTextInput(props: TaskTextInputProps) {
  const task = props.task;
  const [text, setText] = useState(task.text);

  useEffect(() => {
    setText(task.text);
  }, [task.text]);

  return (
    <input
      type="text"
      value={text}
      onChange={(e) => {
        const newText = e.currentTarget.value;
        setText(newText);
      }}
      onBlur={(e) => props.handleBlur(props, { text }, null)}
    />
  );
}

export default function AppPage() {
  const [selectedTaskListId, setSelectedTaskListId] = useState(null);
  const [newTaskText, setNewTaskText] = useState("");
  const [newTaskListName, setNewTaskListName] = useState("");

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
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (newTaskListName !== "") {
                insertTaskList(
                  { name: newTaskListName },
                  app.taskListIds.length
                );
                setNewTaskListName("");
              }
            }}
          >
            <input
              type="text"
              placeholder="New Task List"
              value={newTaskListName}
              onChange={(e) => {
                setNewTaskListName(e.currentTarget.value);
              }}
            />
            <button>Add Task List</button>
          </form>
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
                <button
                  onClick={() => {
                    sortTasks(selectedTaskListId);
                  }}
                >
                  Sort tasks
                </button>
                <button
                  onClick={() => {
                    clearCompletedTasks(selectedTaskListId);
                  }}
                >
                  Clear completed tasks
                </button>
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
                      <TaskTextInput
                        task={task}
                        handleBlur={(_, { text }) => {
                          if (text !== task.text) {
                            updateTask(selectedTaskListId, {
                              ...task,
                              text,
                            });
                          }
                        }}
                      />
                      <input
                        type="date"
                        value={task.date}
                        onChange={(e) => {
                          const date = e.currentTarget.value;
                          updateTask(selectedTaskListId, {
                            ...task,
                            date,
                          });
                        }}
                      />
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
