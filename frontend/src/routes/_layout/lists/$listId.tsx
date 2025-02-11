import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AxiosError } from "axios";
import toast from "react-hot-toast";
import {
  ApiError,
  ListsService,
  TasksClearTasksData,
  TasksService,
} from "~/client";
import Spinner from "~/components/Common/Spinner";
import SettingsMenu from "~/components/Lists/SettingsMenu";
import AddTask from "~/components/Tasks/AddTask";
import Task from "~/components/Tasks/Task";

export const Route = createFileRoute("/_layout/lists/$listId")({
  component: List,
});

function List() {
  const { listId } = Route.useParams();

  const {
    isLoading: isLoadingList,
    isError: isErrorList,
    data: list,
    error: errorLists,
  } = useQuery({
    queryKey: ["list", listId],
    queryFn: () => ListsService.readList({ listId }),
  });
  const {
    isLoading: isLoadingTasks,
    isError: isErrorTasks,
    data: tasks,
    error: errorTasks,
  } = useQuery({
    queryKey: ["tasks", listId],
    queryFn: () => TasksService.readTasks({ listId }),
  });
  const queryClient = useQueryClient();
  const clearMutation = useMutation({
    mutationFn: async (data: TasksClearTasksData) =>
      await TasksService.clearTasks(data),
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
  const handleClear = async () => {
    await clearMutation.mutateAsync({ listId });
  };

  if (isLoadingList || isLoadingTasks) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (isErrorList) {
    return <span>Error: {errorLists.message}</span>;
  }

  if (isErrorTasks) {
    return <span>Error: {errorTasks.message}</span>;
  }

  return (
    <div>
      <nav className="mb-5 flex items-center justify-between">
        <Link to={"/"}>
          <div className="flex items-center space-x-1 rounded-md border border-slate-400 p-2 hover:bg-slate-200">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={3.0}
              stroke="currentColor"
              className="mt-[1px] size-4 text-slate-900"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5 8.25 12l7.5-7.5"
              />
            </svg>
            <span className="text-slate-900">Home</span>
          </div>
        </Link>
        <SettingsMenu list={list} />
      </nav>
      <section className="flex flex-col space-y-5">
        <h1 style={{ color: list?.color }} className="text-3xl font-bold">
          {list?.name}
        </h1>
        <div className="flex items-center space-x-4 border-b pb-2">
          <button
            className="rounded-md border border-slate-400 px-3 py-1 text-sm hover:bg-slate-200"
            onClick={handleClear}
          >
            Clear Completed
          </button>
        </div>
        <ul className="flex flex-col space-y-2">
          {tasks?.data.map((task) => (
            <li key={task.id}>
              <Task
                task={task}
                color={list?.color}
                listId={listId}
                isFamilyList={list?.is_family_list}
              />
            </li>
          ))}
        </ul>
        <div>
          <AddTask isFamilyList={list?.is_family_list} />
        </div>
      </section>
    </div>
  );
}
