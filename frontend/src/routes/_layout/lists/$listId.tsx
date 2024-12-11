import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AxiosError } from "axios";
import toast from "react-hot-toast";
import { ApiError, ListsService, TasksService } from "~/client";
import Spinner from "~/components/Common/Spinner";
import EditList from "~/components/Lists/EditList";
import AddTask from "~/components/Tasks/AddTask";

export const Route = createFileRoute("/_layout/lists/$listId")({
  component: List,
});

function List() {
  const { listId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
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

  const deleteMutation = useMutation({
    mutationFn: async () => await ListsService.deleteList({ listId }),
    onSuccess: () => {
      navigate({ to: "/" });
      toast.success("List has been deleted successfully");
    },
    onError: (err: ApiError) => {
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
      list?.is_family_list
        ? queryClient.invalidateQueries({ queryKey: ["family-lists"] })
        : queryClient.invalidateQueries({ queryKey: ["personal-lists"] });
    },
  });

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
    <div className="flex flex-col space-y-10">
      <h1>{list?.name}</h1>
      <h1 style={{ color: list?.color }}>COLOR</h1>
      <section>
        <ul>
          {tasks?.data.map((value) => (
            <li key={value.id}>{JSON.stringify(value)}</li>
          ))}
        </ul>
      </section>
      <AddTask />
      <EditList listId={listId} name={list?.name} color={list?.color} />
      <button
        className="border p-2"
        type="button"
        onClick={async () => {
          await deleteMutation.mutateAsync();
        }}
      >
        delete
      </button>
    </div>
  );
}
