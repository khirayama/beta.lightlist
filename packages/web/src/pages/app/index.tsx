import { useState, useEffect, useSyncExternalStore, MouseEvent } from "react";
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
  init,
  insertTaskList,
  deleteTaskList,
  moveTaskList,
  store,
  type App,
  type Preferences,
  type TaskList,
} from "sdk";

import {
  NavigationProvider,
  useNavigation,
  NavigateLink,
} from "navigation/react";
import { TaskList as TaskListComponent } from "appcomponents/TaskList";
import { Settings } from "appcomponents/Settings";

/* Features
 * [x] タスクリストの追加
 * [x] タスクリストの削除
 * [x] タスクリストの更新(タスクリスト名)
 * [x] タスクリストの移動
 *
 * [x] タスクの並び替え
 * [x] タスクの自動並び替え
 * [x] タスクの削除
 * [x] タスクの移動
 *
 * [x] タスクの追加
 * [x] タスクの更新(完了、テキスト、日付)
 */

interface TaskListListItemComponentProps {
  taskList: TaskList;
  onClick: (e?: MouseEvent<HTMLDivElement>) => void;
}

function TaskListListItemComponent(props: TaskListListItemComponentProps) {
  const taskList = props.taskList;

  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    // isDragging,
  } = useSortable({ id: taskList.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} onClick={props.onClick}>
      <span ref={setActivatorNodeRef} {...listeners} {...attributes}>
        H
      </span>
      {taskList?.name}({taskList?.tasks.length})
      <button
        onClick={() => {
          deleteTaskList(taskList.id);
        }}
      >
        Delete
      </button>
    </div>
  );
}

function AppPage(props: {
  app: App;
  taskLists: { [id: string]: TaskList };
  preferences: Preferences;
}) {
  const navigation = useNavigation();

  const [selectedTaskListId, setSelectedTaskListId] = useState(null);
  const [newTaskListName, setNewTaskListName] = useState("");

  const app = props.app;
  const taskLists = props.taskLists;
  const taskList = taskLists[selectedTaskListId];
  const preferences = props.preferences;

  useEffect(() => {
    init().then((res: { app: App }) => {
      setSelectedTaskListId(res.app.taskListIds[0]);
    });
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;

    if (active && over && active.id !== over.id) {
      const from = app.taskListIds.findIndex((tlid) => tlid === active.id);
      const to = app.taskListIds.findIndex((tlid) => tlid === over.id);
      moveTaskList(from, to);
    }
  };
  if (navigation.getAttr().match === "/settings") {
    return <Settings preferences={preferences} />;
  }
  return (
    <div>
      <div>
        <NavigateLink to="/settings">Settings</NavigateLink>
      </div>
      <div className="flex">
        <ul>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (newTaskListName !== "") {
                const [newTaskList] = insertTaskList(
                  { name: newTaskListName },
                  app.taskListIds.length
                );
                setSelectedTaskListId(newTaskList.id);
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
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={app.taskListIds.map((tlid) => taskLists[tlid])}
              strategy={verticalListSortingStrategy}
            >
              {app?.taskListIds.map((tlid) => {
                return (
                  taskLists[tlid] && (
                    <TaskListListItemComponent
                      key={tlid}
                      taskList={taskLists[tlid]}
                      onClick={() => {
                        setSelectedTaskListId(tlid);
                      }}
                    />
                  )
                );
              })}
            </SortableContext>
          </DndContext>
        </ul>
        <div style={{ flex: 1 }}>
          {taskList && (
            <TaskListComponent
              key={taskList.id}
              taskList={taskList}
              preferences={preferences}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default function Routes() {
  const routes: {
    [path: string]: {
      isDrawerOpen: boolean;
      isSharingSheetOpen: boolean;
    };
  } = {
    "/home": {
      isDrawerOpen: false,
      isSharingSheetOpen: false,
    },
    "/menu": {
      isDrawerOpen: true,
      isSharingSheetOpen: false,
    },
    "/settings": {
      isDrawerOpen: false,
      isSharingSheetOpen: false,
    },
    "/sharing/:taskListId": {
      isDrawerOpen: false,
      isSharingSheetOpen: true,
    },
  };

  const state = useSyncExternalStore(
    store.subscribe,
    () => store.data,
    () => store.data
  );

  return (
    <NavigationProvider initialPath="/home" routes={routes}>
      <AppPage
        app={state.app}
        taskLists={state.taskLists}
        preferences={state.preferences}
      />
    </NavigationProvider>
  );
}
