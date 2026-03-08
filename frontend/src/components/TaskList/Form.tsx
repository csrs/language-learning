import { PriorityEnum, StatusEnum, type Task } from "./TaskItem";

export const Form = ({ onAddTask }: { onAddTask: (task: Task) => void }) => {
  const handleAddTask = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const createdTask: Task = {
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      title: formData.get("title").toString(),
      description: formData.get("description").toString(),
      priority:
        (formData.get("priority").toString() as PriorityEnum) ??
        PriorityEnum.LOW,
      status:
        (formData.get("status").toString() as StatusEnum) ?? StatusEnum.TODO,
    };

    onAddTask(createdTask);
    e.currentTarget.reset();
  };

  return (
    <form onSubmit={handleAddTask}>
      <input type="text" name="title" placeholder="title" required />
      <input type="text" name="description" placeholder="description" />

      <input type="text" name="priority" placeholder="low, medium, or high" />
      <input
        type="text"
        name="status"
        placeholder="todo, in-progress, or done"
      />

      <button type="submit">Add task</button>
    </form>
  );
};
