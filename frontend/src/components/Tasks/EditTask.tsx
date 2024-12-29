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
  TasksUpdateTaskStatusData,
  TasksUpdateTaskData,
  Task,
} from "~/client";
import useAuth from "~/hooks/useAuth";
import Spinner from "../Common/Spinner";
import { useEffect, useRef, useState } from "react";

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

const editTaskSchema = z.object({
  title: z
    .string()
    .min(1, { message: "This field  is required" })
    .max(255, { message: "Title must be 40 or fewer characters long" }),
  notes: z.string().optional(),
  completed: z.boolean().default(false),
  user_id: z.string().min(1, { message: "This field  is required" }),
});

type EditTask = z.infer<typeof editTaskSchema>;

interface EditTaskProps {
  task: Task;
}

function EditTask({ task }: EditTaskProps) {
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

  const form = useForm({
    defaultValues: {
      title: task.title,
      notes: task.notes,
      completed: task.completed,
      user_id: task.user_id,
    } as EditTask,
    onSubmit: async ({ value }) => {
      await updateMutation.mutateAsync({
        taskId: task.id!,
        requestBody: value,
      });
    },
    validatorAdapter: zodValidator(),
    validators: {
      onSubmit: editTaskSchema,
    },
  });
  const updateMutation = useMutation({
    mutationFn: async (data: TasksUpdateTaskData) =>
      await TasksService.updateTask(data),
    onSuccess: () => {
      toggleModal();
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
    },
  });
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const toggleModal = () => {
    setIsOpen(!isOpen);
    form.reset();
  };
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  if (isLoadingMembers) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (isErrorMembers) {
    return <span>Error: {errorMembers.message}</span>;
  }

  return (
    <>
      <button
        className="flex items-center justify-center space-x-2 rounded-md border border-slate-400 px-2 py-1 text-sm hover:bg-slate-200"
        onClick={toggleModal}
      >
        Edit
      </button>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-slate-900 bg-opacity-50">
          <div className="relative max-h-full w-full max-w-md">
            <div className="relative rounded-lg bg-white shadow">
              <form
                className="flex flex-col space-y-6"
                onSubmit={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  form.handleSubmit();
                }}
              >
                <section className="flex items-center justify-between border-b p-4">
                  <button type="button" onClick={toggleModal}>
                    Cancel
                  </button>
                  <h3 className="text-center text-xl font-bold text-slate-900">
                    Edit Task
                  </h3>
                  <form.Subscribe
                    selector={(state) => [state.canSubmit, state.isSubmitting]}
                    children={([canSubmit, isSubmitting]) => (
                      <button
                        type="submit"
                        disabled={!canSubmit}
                        className="font-semibold text-slate-800 disabled:cursor-not-allowed disabled:text-slate-400"
                      >
                        {isSubmitting ? "..." : "Done"}
                      </button>
                    )}
                  />
                </section>
                <section className="flex flex-col space-y-6 p-4">
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
                              ref={inputRef}
                              value={field.state.value}
                              defaultValue={task.title}
                              onBlur={field.handleBlur}
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
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
                              defaultValue={task.notes ?? ""}
                              onBlur={field.handleBlur}
                              onChange={(e) =>
                                field.handleChange(e.target.value)
                              }
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
                            className="rounded-md border border-slate-400 p-2 outline-0"
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            defaultValue={task.user_id}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                          >
                            <option value="">
                              --Please choose an option--
                            </option>
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
                </section>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default EditTask;
