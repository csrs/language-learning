export enum PriorityEnum {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
}

export enum StatusEnum {
  TODO = "todo",
  INPROGRESS = "in progress",
  DONE = "done",
}

export type Task = {
  id: string;
  title: string;
  description: string;
  priority: PriorityEnum;
  status: StatusEnum;
  createdAt: number;
};

export const TaskItem = ({ task }: { task: Task }) => {
  return (
    <li>
      <p>
        {`Title: ${task.title}, Description: ${task.description}, Created at: ${task.createdAt}, Priority: ${task.priority}, Status: ${task.status}`}{" "}
      </p>
    </li>
  );
};
