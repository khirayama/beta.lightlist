import { type Preferences, type TaskList } from "sdk";

import {
  Carousel,
  CarouselIndicator,
  CarouselList,
  CarouselItem,
} from "components/Carousel";
import { TaskList as TaskListComponent } from "appcomponents/TaskList";
import { NavigateLink } from "navigation/react";

export function Home(props: {
  index: number;
  handleIndexChange?: () => void;
  taskLists: TaskList[];
  preferences: Preferences;
}) {
  return (
    <>
      <NavigateLink to="/menu">menu</NavigateLink>
      <div className="w-full bg-red-400">
        <Carousel
          index={props.index}
          handleIndexChange={props.handleIndexChange}
        >
          <CarouselIndicator />
          <CarouselList>
            {props.taskLists.map((tl) => {
              if (!tl) {
                return null;
              }
              return (
                <CarouselItem key={tl.id}>
                  <TaskListComponent
                    key={tl.id}
                    taskList={tl}
                    preferences={props.preferences}
                  />
                </CarouselItem>
              );
            })}
          </CarouselList>
        </Carousel>
      </div>
    </>
  );
}
