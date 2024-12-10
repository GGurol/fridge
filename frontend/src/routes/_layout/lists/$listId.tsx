import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AxiosError } from "axios";
import toast from "react-hot-toast";
import { ApiError, ListsService, ListsUpdateListData } from "~/client";
import Spinner from "~/components/Common/Spinner";
import EditList from "~/components/Lists/EditList";

export const Route = createFileRoute("/_layout/lists/$listId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { listId } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isLoading, isError, data, error } = useQuery({
    queryKey: ["list", listId],
    queryFn: ({ queryKey }) => {
      const [_, listId] = queryKey;
      return ListsService.readList({ listId });
    },
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
      data?.is_family_list
        ? queryClient.invalidateQueries({ queryKey: ["family-lists"] })
        : queryClient.invalidateQueries({ queryKey: ["personal-lists"] });
    },
  });

  if (isLoading) {
    return <Spinner />;
  }

  if (isError) {
    return <span>Error: {error.message}</span>;
  }

  return (
    <>
      <h1>{data?.name}</h1>
      <h1>{data?.user_id}</h1>
      <h1 style={{ color: data?.color }}>{data?.color}</h1>
      <EditList listId={listId} name={data?.name} color={data?.color} />
      <button
        className="border p-2"
        type="button"
        onClick={() => {
          deleteMutation.mutateAsync();
        }}
      >
        delete
      </button>
    </>
  );
}
