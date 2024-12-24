import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { AxiosError } from "axios";
import toast from "react-hot-toast";
import { ListsService, ApiError } from "~/client";

interface DeleteListProps {
  listId: string;
  is_family_list?: boolean;
}

function DeleteList({ listId, is_family_list }: DeleteListProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

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
      is_family_list
        ? queryClient.invalidateQueries({ queryKey: ["family-lists"] })
        : queryClient.invalidateQueries({ queryKey: ["personal-lists"] });
    },
  });

  const handleDelete = async () => await deleteMutation.mutateAsync();

  return (
    <>
      <button
        className="flex w-full text-red-500"
        type="button"
        onClick={handleDelete}
      >
        Delete List
      </button>
    </>
  );
}

export default DeleteList;
