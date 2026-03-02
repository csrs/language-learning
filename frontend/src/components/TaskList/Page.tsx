import { useEffect, useState } from "react";
import { Form } from "./Form";
import { TaskList } from "./TaskList";
import type { PriorityEnum, Task } from "./TaskItem";
import { StatusEnum } from "./TaskItem";

export const Page = () => {
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [filterLevel, setFilterLevel] = useState<
    StatusEnum | PriorityEnum | undefined
  >(undefined);

  const handleFiltering = (filterLevel?: StatusEnum | PriorityEnum) => {
    if (!filterLevel) {
      setFilterLevel(undefined);
    } else {
      setFilterLevel(filterLevel);
    }
  };

  const getFilteredTasks = (filterLevel: StatusEnum | PriorityEnum) => {
    return allTasks.filter(
      (t) => t.status === filterLevel || t.priority === filterLevel,
    );
  };

  const visibleTasks =
    filterLevel === undefined ? allTasks : getFilteredTasks(filterLevel);
  return (
    <>
      <h2>Form</h2>
      <Form
        onAddTask={(task) => setAllTasks((prevTasks) => [...prevTasks, task])}
      />
      <h2>List of all tasks</h2>
      <TaskList tasks={visibleTasks} />
      <button onClick={() => handleFiltering()}>View all tasks </button>
      {/* // todo: add radio buttons or a dropdown so you can filter/sort by any of the available statuses and priorities */}
      <button onClick={() => handleFiltering(StatusEnum.DONE)}>
        View tasks filtered by: Status "done"
      </button>
    </>
  );
};
