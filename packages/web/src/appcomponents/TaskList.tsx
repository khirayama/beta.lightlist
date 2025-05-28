import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { CSS } from "@dnd-kit/utilities";

import {
  updateTaskList,
  insertTask,
  sortTasks,
  updateTask,
  moveTask,
  clearCompletedTasks,
  type Task,
  type TaskList,
  type Preferences,
} from "sdk";

import { ComponentEventHandler } from "types";

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
      onBlur={() => props.handleBlur(props, { text }, null)}
    />
  );
}

interface TaskListItemProps {
  taskList: TaskList;
  task: Task;
}

function TaskListItem(props: TaskListItemProps) {
  const taskList = props.taskList;
  const task = props.task;

  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    // isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <span ref={setActivatorNodeRef} {...listeners} {...attributes}>
        H
      </span>
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
        handleBlur={(_: unknown, { text }) => {
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
    </div>
  );
}

interface TaskListProps {
  preferences: Preferences;
  taskList: TaskList;
}

export function TaskList(props: TaskListProps) {
  const taskList = props.taskList;
  const preferences = props.preferences;

  const [taskListName, setTaskListName] = useState(taskList.name);
  const [newTaskText, setNewTaskText] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;

    if (active && over && active.id !== over.id) {
      const from = taskList.tasks.findIndex((t: Task) => t.id === active.id);
      const to = taskList.tasks.findIndex((t: Task) => t.id === over.id);
      moveTask(taskList.id, from, to);
    }
  };

  return (
    <section>
      <header>
        <div>
          <input
            className="inline-block w-full"
            type="text"
            value={taskListName}
            onChange={(e) => {
              const newName = e.currentTarget.value;
              setTaskListName(newName);
            }}
            onBlur={() => {
              if (taskListName !== taskList.name) {
                updateTaskList({
                  ...taskList,
                  name: taskListName,
                });
              }
            }}
          />
        </div>

        <form
          className="flex w-full"
          onSubmit={(e) => {
            e.preventDefault();
            if (newTaskText !== "") {
              const idx =
                preferences.taskInsertPosition === "TOP"
                  ? 0
                  : taskList.tasks.length;
              insertTask(taskList.id, { text: newTaskText }, idx);
              setNewTaskText("");
            }
          }}
        >
          <div className="flex-1">
            <input
              className="flex"
              type="text"
              placeholder="New Task"
              value={newTaskText}
              onChange={(e) => {
                setNewTaskText(e.currentTarget.value);
              }}
            />
          </div>
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
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis]}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={taskList.tasks}
          strategy={verticalListSortingStrategy}
        >
          {taskList.tasks.map((task: Task) => {
            return (
              <TaskListItem key={task.id} taskList={taskList} task={task} />
            );
          })}
        </SortableContext>
      </DndContext>
    </section>
  );
}
