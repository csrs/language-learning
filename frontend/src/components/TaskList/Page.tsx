import { useState } from "react";
import { Form } from "./Form";
import { TaskList } from "./TaskList";
import { PriorityEnum, type Task } from "./TaskItem";
import { StatusEnum } from "./TaskItem";
import { CheckboxFilterList } from "./CheckboxFilterList";

export const Page = () => {
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [filterLevels, setFilterLevels] = useState<
    (StatusEnum | PriorityEnum)[]
  >([]);

  const handleFiltering = (
    isChecked: boolean,
    newFilter?: StatusEnum | PriorityEnum,
  ) => {
    if (!newFilter) {
      setFilterLevels(undefined);
    } else {
      if (isChecked) {
        setFilterLevels((prev) => [...prev, newFilter]);
      } else {
        const newFilters = filterLevels.filter((f) => f !== newFilter);
        setFilterLevels(newFilters);
      }
    }
  };

  const visibleTasks =
    filterLevels.length === 0
      ? allTasks
      : allTasks.filter(
          (t) =>
            filterLevels.includes(t.status) ||
            filterLevels.includes(t.priority),
        );

  return (
    <>
      <h2>Form</h2>
      <Form
        onAddTask={(task) => setAllTasks((prevTasks) => [...prevTasks, task])}
      />
      <h2>List of all tasks</h2>
      <TaskList tasks={visibleTasks} />
      <h2>Filter by completion status: </h2>
      <CheckboxFilterList
        filterSet={Object.values(StatusEnum)}
        typeOfFilter="status"
        onSelectCheckbox={(filterLevel: StatusEnum, isChecked: boolean) =>
          handleFiltering(isChecked, filterLevel)
        }
      />

      <CheckboxFilterList
        filterSet={Object.values(PriorityEnum)}
        typeOfFilter="priority"
        onSelectCheckbox={(filterLevel: PriorityEnum, isChecked: boolean) =>
          handleFiltering(isChecked, filterLevel)
        }
      />
    </>
  );
};
