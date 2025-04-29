import { useState, useEffect } from "react";

import { getApp, getTaskLists } from "../../services";

export default function AppPage() {
  const [taskLists, setTaskLists] = useState({});
  const [app, setApp] = useState(null);
  const [selectedTaskListId, setSelectedTaskListId] = useState(null);
  const [newTaskText, setNewTaskText] = useState("");

  useEffect(() => {
    getApp()
      .then((res) => {
        setApp(res.app);
        setSelectedTaskListId(res.app.taskListIds[0]);
      })
      .catch((err) => {
        console.error(err);
      });
    getTaskLists()
      .then((res) => {
        setTaskLists(
          res.taskLists.reduce((acc, tl) => {
            acc[tl.id] = tl;
            return acc;
          }, {})
        );
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  return (
    <div>
      <div>
        <a href="/settings">Settings</a>
      </div>
      <div style={{ display: "flex" }}>
        <ul>
          {" "}
          {app?.taskListIds.map((tlid) => {
            const taskList = taskLists[tlid];
            return (
              <li
                key={tlid}
                onClick={() => {
                  setSelectedTaskListId(tlid);
                }}
              >
                {taskList?.name}({taskList?.tasks.length})
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
                      console.log("create task", newTaskText);
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
                      {task.name} ({task.status})
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
