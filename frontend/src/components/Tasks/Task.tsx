import { clsx } from "clsx";
import {
  ApiError,
  TasksService,
  TasksUpdateTaskStatusData,
  UsersService,
  type Task,
} from "~/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import EditTask from "./EditTask";

interface TaskProps {
  task: Task;
  listId: string;
  isFamilyList?: boolean;
  color?: string;
}

function Task({ task, color, isFamilyList, listId }: TaskProps) {
  const queryClient = useQueryClient();
  const { data: user } = useQuery({
    queryKey: ["user", task.user_id],
    queryFn: () => UsersService.readUser({ userId: task.user_id }),
  });
  const completeMutation = useMutation({
    mutationFn: async (data: TasksUpdateTaskStatusData) =>
      await TasksService.updateTaskStatus(data),
    onSuccess: () => {},
    onError: (err: ApiError) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let errDetail = (err.body as any)?.detail;

      if (err instanceof AxiosError) {
        errDetail = err.message;
      }

      if (Array.isArray(errDetail)) {
        errDetail = "Something went wrong";
      }

      toast.error(`${errDetail}`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", listId] });
    },
  });
  const handleClick = async () => {
    const isCompleted = task.completed;
    const newStatus = isCompleted ? false : true;
    if (task.id) {
      await completeMutation.mutateAsync({
        taskId: task.id,
        completed: newStatus,
      });
    }
  };

  return (
    <>
      <div className="flex border-b py-2">
        <div className="flex grow items-start space-x-2">
          <button
            key={task.id}
            className="flex h-5 w-5 rounded-full border-2 border-slate-400"
            style={task.completed ? { backgroundColor: color } : undefined}
            id={task.id}
            name={task.id}
            onClick={handleClick}
          />
          <div className="grow">
            <div className={clsx(task.completed && "text-slate-400")}>
              {task.title}
            </div>
            <div className={clsx(task.completed && "text-slate-400")}>
              {task.notes}
            </div>
          </div>
        </div>
        <div className="flex space-x-4">
          <div>
            <span>{user?.name ? user.name : user?.email}</span>
          </div>
          <div className="flex h-1/2 flex-none space-x-4">
            <EditTask isFamilyList={isFamilyList} task={task} />
          </div>
        </div>
      </div>
    </>
  );
}

export default Task;
