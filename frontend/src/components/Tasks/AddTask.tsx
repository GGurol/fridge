/* eslint-disable @typescript-eslint/no-explicit-any */
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
  FamiliesService,
} from "~/client";
import useAuth from "~/hooks/useAuth";
import Spinner from "../Common/Spinner";
import { useEffect, useRef, useState } from "react";
import { Route } from "~/routes/_layout/lists/$listId";

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
});

type AddTask = z.infer<typeof addTaskSchema>;

interface AddTaskProps {
  isFamilyList?: boolean;
}

function AddTask({ isFamilyList }: AddTaskProps) {
  const { user } = useAuth();
  const { listId } = Route.useParams();
  const queryClient = useQueryClient();
  const {
    isLoading: isLoadingMembers,
    isError: isErrorMembers,
    data: members,
    error: errorMembers,
  } = useQuery({
    queryKey: ["members"],
    queryFn: () => {
      if (user?.family_id) {
        return FamiliesService.readFamilyMembers({ familyId: user.family_id });
      }
    },
  });

  const form = useForm({
    defaultValues: {
      title: "",
      notes: "",
      completed: false,
      user_id: user?.id ?? "",
    },
    onSubmit: async ({ value }) => {
      console.log(value);
      await createMutation.mutateAsync({
        requestBody: { ...value, list_id: listId },
      });
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
      queryClient.invalidateQueries({ queryKey: ["tasks", listId] });
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
        className="flex items-center justify-center space-x-2 rounded-md border border-slate-400 p-2 font-semibold hover:bg-slate-200"
        onClick={toggleModal}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="black"
          viewBox="0 0 24 24"
          strokeWidth={2.0}
          stroke="white"
          className="size-7"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
          />
        </svg>
        New Task
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
                    New Task
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
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                          >
                            <option value="">
                              --Please choose an option--
                            </option>
                            {isFamilyList ? (
                              members?.data.map((user) => (
                                <option key={user.id} value={user.id}>
                                  {user.name ? user.name : user.email}
                                </option>
                              ))
                            ) : (
                              <option key="single" value={user?.id}>
                                {user?.name ? user?.name : user?.email}
                              </option>
                            )}
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

export default AddTask;
