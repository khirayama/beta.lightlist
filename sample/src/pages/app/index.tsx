import { useState, useEffect, useSyncExternalStore } from "react";

import { setSessionStorage } from "../../sdk/session";
import {
  init,
  insertTaskList,
  updateTaskList,
  deleteTaskList,
  insertTask,
  updateTask,
  sortTasks,
  clearCompletedTasks,
} from "../../sdk/actions";
import { store } from "../../sdk/store";
import { Task, TaskList } from "../../sdk/types";

/* Features
 * [x] タスクリストの追加
 * [x] タスクリストの削除
 * [x] タスクリストの更新(タスクリスト名)
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

interface TaskListComponentProps {
  taskList: TaskList;
}

function TaskListComponent(props: TaskListComponentProps) {
  const taskList = props.taskList;

  const [taskListName, setTaskListName] = useState(taskList.name);
  const [newTaskText, setNewTaskText] = useState("");

  return (
    <section>
      <header>
        <input
          type="text"
          value={taskListName}
          onChange={(e) => {
            const newName = e.currentTarget.value;
            setTaskListName(newName);
          }}
          onBlur={(e) => {
            if (taskListName !== taskList.name) {
              updateTaskList({
                ...taskList,
                name: taskListName,
              });
            }
          }}
        />

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (newTaskText !== "") {
              insertTask(
                taskList.id,
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
            sortTasks(taskList.id);
          }}
        >
          Sort tasks
        </button>
        <button
          onClick={() => {
            clearCompletedTasks(taskList.id);
          }}
        >
          Clear completed tasks
        </button>
      </header>
      <ul>
        {taskList.tasks.map((task) => {
          return (
            <li key={task.id}>
              <input
                type="checkbox"
                checked={task.completed}
                onChange={(e) => {
                  const completed = e.currentTarget.checked;
                  updateTask(taskList.id, {
                    ...task,
                    completed,
                  });
                }}
              />
              <TaskTextInput
                task={task}
                handleBlur={(_, { text }) => {
                  if (text !== task.text) {
                    updateTask(taskList.id, {
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
                  updateTask(taskList.id, {
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
  );
}

export default function AppPage() {
  const [selectedTaskListId, setSelectedTaskListId] = useState(null);
  const [newTaskListName, setNewTaskListName] = useState("");

  useEffect(() => {
    init().then((res) => {
      setSelectedTaskListId(res.app.taskListIds[0]);
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
                <button
                  onClick={() => {
                    deleteTaskList(tlid);
                  }}
                >
                  Delete
                </button>
              </li>
            );
          })}
        </ul>
        <div style={{ flex: 1 }}>
          {taskList && (
            <TaskListComponent key={taskList.id} taskList={taskList} />
          )}
        </div>
      </div>
    </div>
  );
}
