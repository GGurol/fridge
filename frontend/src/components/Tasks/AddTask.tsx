import { FieldApi, useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { AxiosError } from "axios";
import toast from "react-hot-toast";
import { z } from "zod";
import {
  ApiError,
  TasksService,
  TasksCreateTaskData,
  ListsService,
  UsersService,
  TaskPublic,
} from "~/client";
import useAuth from "~/hooks/useAuth";
import Spinner from "../Common/Spinner";

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

const addTaskSchema = z.object({
  title: z
    .string()
    .min(1, { message: "This field  is required" })
    .max(255, { message: "Title must be 40 or fewer characters long" }),
  notes: z.string().optional(),
  completed: z.boolean().default(false),
  user_id: z.string().min(1, { message: "This field  is required" }),
  list_id: z.string().min(1, { message: "This field  is required" }),
});

type AddTask = z.infer<typeof addTaskSchema>;

function AddTask() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const {
    isLoading: isLoadingMembers,
    isError: isErrorMembers,
    data: members,
    error: errorMembers,
  } = useQuery({
    queryKey: ["members"],
    queryFn: () =>
      UsersService.readFamilyMembers({ familyId: user?.family_id! }),
  });
  const {
    isLoading: isLoadingFamilyList,
    isError: isErrorFamilyList,
    data: familyList,
    error: errorFamilyList,
  } = useQuery({
    queryKey: ["family-lists"],
    queryFn: ListsService.readFamilyLists,
  });
  const {
    isLoading: isLoadingPersonalList,
    isError: isErrorPersonalList,
    data: personalList,
    error: errorPersonalList,
  } = useQuery({
    queryKey: ["personal-lists"],
    queryFn: ListsService.readPersonalLists,
  });
  const form = useForm({
    defaultValues: {
      title: "",
      notes: "",
      completed: false,
      user_id: "",
      list_id: "",
    } as AddTask,
    onSubmit: async ({ value }) => {
      await createMutation.mutateAsync({ requestBody: value });
    },
    validatorAdapter: zodValidator(),
    validators: {
      onSubmit: addTaskSchema,
    },
  });
  const createMutation = useMutation({
    mutationFn: async (data: TasksCreateTaskData) =>
      await TasksService.createTask(data),
    onSuccess: () => {
      toast.success("Task has been created successfully.");
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
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["family-lists"] });
      queryClient.invalidateQueries({ queryKey: ["personal-lists"] });
    },
  });

  if (isLoadingMembers || isLoadingFamilyList || isLoadingPersonalList) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (isErrorFamilyList) {
    return <span>Error: {errorFamilyList.message}</span>;
  }

  if (isErrorPersonalList) {
    return <span>Error: {errorPersonalList.message}</span>;
  }

  if (isErrorMembers) {
    return <span>Error: {errorMembers.message}</span>;
  }

  return (
    <>
      <h1 className="text-center text-3xl">new task</h1>
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
            name="title"
            children={(field) => {
              return (
                <>
                  <input
                    className="rounded-md border border-slate-400 p-2 outline-0"
                    id={field.name}
                    name={field.name}
                    placeholder="Title"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  <FieldInfo field={field} />
                </>
              );
            }}
          />
        </div>
        <div className="flex flex-col">
          <form.Field
            name="notes"
            children={(field) => {
              return (
                <>
                  <input
                    className="rounded-md border border-slate-400 p-2 outline-0"
                    id={field.name}
                    name={field.name}
                    placeholder="Notes"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  <FieldInfo field={field} />
                </>
              );
            }}
          />
        </div>
        <div className="flex flex-col">
          <form.Field
            name="user_id"
            children={(field) => (
              <>
                <label htmlFor={field.name}>
                  Assignee: <span className="text-red-500">*</span>
                </label>
                <select
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                >
                  <option value="">--Please choose an option--</option>
                  {members?.data.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name ?? user.email}
                    </option>
                  ))}
                </select>
                <FieldInfo field={field} />
              </>
            )}
          />
        </div>
        <div className="flex flex-col">
          <form.Field
            name="list_id"
            children={(field) => (
              <>
                <label htmlFor={field.name}>
                  List: <span className="text-red-500">*</span>
                </label>
                <select
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                >
                  <option value="">--Please choose an option--</option>
                  {[...familyList?.data!, ...personalList?.data!].map(
                    (list) => (
                      <option key={list.id} value={list.id}>
                        {list.name}
                      </option>
                    ),
                  )}
                </select>
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
              {isSubmitting ? "..." : "Add list"}
            </button>
          )}
        />
      </form>
    </>
  );
}

export default AddTask;
