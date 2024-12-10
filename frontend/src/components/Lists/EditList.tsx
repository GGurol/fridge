import { FieldApi, useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { AxiosError } from "axios";
import toast from "react-hot-toast";
import { z } from "zod";
import { ApiError, ListsService, ListsUpdateListData } from "~/client";

const colors = [
  "#EF4444",
  "#F97316",
  "#EAB308",
  "#84CC16",
  "#3B82F6",
  "#A855F7",
];

function FieldInfo({ field }: { field: FieldApi<any, any, any, any> }) {
  return (
    <>
      {field.state.meta.isTouched && field.state.meta.errors.length ? (
        <em className="text-red-700">{field.state.meta.errors.join(",")}</em>
      ) : null}
      {field.state.meta.isValidating ? "Validating..." : null}
    </>
  );
}

const listSchema = z.object({
  name: z
    .string()
    .min(1, { message: "This field  is required" })
    .max(255, { message: "Name must be 40 or fewer characters long" }),
  color: z
    .string()
    .min(1, { message: "This field  is required" })
    .length(7, { message: "Color must be a valid hex color" }),
});

type List = z.infer<typeof listSchema>;

interface EditListProps {
  listId: string;
  name?: string;
  color?: string;
  isFamilyList?: string;
}

function EditList({ listId, name, color, isFamilyList }: EditListProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const form = useForm({
    defaultValues: {
      name: name,
      color: color,
    } as List,
    onSubmit: async ({ value }) => {
      await mutation.mutateAsync({ listId, requestBody: value });
    },
    validatorAdapter: zodValidator(),
    validators: {
      onSubmit: listSchema,
    },
  });
  const mutation = useMutation({
    mutationFn: async (data: ListsUpdateListData) =>
      await ListsService.updateList(data),
    onSuccess: () => {
      navigate({ to: "/" });
      toast.success("List has been updated successfully.");
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
      isFamilyList
        ? queryClient.invalidateQueries({ queryKey: ["family-lists"] })
        : queryClient.invalidateQueries({ queryKey: ["personal-lists"] });
    },
  });

  return (
    <>
      <h1 className="text-center text-3xl">edit list</h1>
      <form
        className="flex flex-col space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <div className="flex flex-col">
          <form.Field
            name="name"
            children={(field) => {
              return (
                <>
                  <input
                    className="rounded-md border border-slate-400 p-2 outline-0"
                    id={field.name}
                    name={field.name}
                    placeholder={name}
                    value={field.state.value}
                    defaultValue={name}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  <FieldInfo field={field} />
                </>
              );
            }}
          />
        </div>
        <div className="flex space-x-2">
          <form.Field
            name="color"
            children={(field) => (
              <>
                {colors.map((value, index) => (
                  <input
                    key={index}
                    className="flex h-10 w-10 appearance-none rounded-full p-1 outline-offset-2 checked:outline"
                    style={{ backgroundColor: value, outlineColor: value }}
                    id={`${field.name}-${index}`}
                    name={field.name}
                    value={value}
                    onBlur={field.handleBlur}
                    type="radio"
                    defaultChecked={value === color}
                    onChange={(e) => {
                      field.handleChange(e.target.value);
                    }}
                  />
                ))}
                <FieldInfo field={field} />
              </>
            )}
          />
        </div>
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
          children={([canSubmit, isSubmitting]) => (
            <button
              type="submit"
              disabled={!canSubmit}
              className="rounded-md bg-slate-700 p-2 font-semibold text-slate-50 hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-700"
            >
              {isSubmitting ? "..." : "edit list"}
            </button>
          )}
        />
      </form>
    </>
  );
}

export default EditList;
