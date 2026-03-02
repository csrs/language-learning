import { TaskItem, type Task } from "./TaskItem";

export const TaskList = ({ tasks }: { tasks: Task[] }) => {
  return tasks.map((t) => <TaskItem key={t.id} task={t} />);
};
