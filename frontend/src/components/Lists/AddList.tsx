/* eslint-disable @typescript-eslint/no-explicit-any */
import { FieldApi, useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { AxiosError } from "axios";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { z } from "zod";
import { ApiError, ListsService, ListsCreateListData } from "~/client";

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

const addListSchema = z.object({
  name: z
    .string()
    .min(1, { message: "This field  is required" })
    .max(255, { message: "Name must be 40 or fewer characters long" }),
  color: z
    .string()
    .min(1, { message: "This field  is required" })
    .length(7, { message: "Color must be a valid hex color" }),
  is_family_list: z.boolean(),
});

type AddList = z.infer<typeof addListSchema>;

interface AddListProps {
  isFamilyList?: boolean;
  onToggleMenu: () => void;
}

function AddList({ isFamilyList = false, onToggleMenu }: AddListProps) {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const form = useForm({
    defaultValues: {
      name: "",
      color: "#3B82F6",
      is_family_list: isFamilyList,
    } as AddList,
    onSubmit: async ({ value }) => {
      await mutation.mutateAsync({ requestBody: value });
    },
    validatorAdapter: zodValidator(),
    validators: {
      onSubmit: addListSchema,
    },
  });
  const mutation = useMutation({
    mutationFn: async (data: ListsCreateListData) =>
      await ListsService.createList(data),
    onSuccess: () => {
      toast.success("List has been created successfully.");
      toggleModal();
      onToggleMenu();
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
      if (isFamilyList) {
        queryClient.invalidateQueries({ queryKey: ["family-lists"] });
      } else {
        queryClient.invalidateQueries({ queryKey: ["personal-lists"] });
      }
    },
  });
  const toggleModal = () => {
    setIsOpen(!isOpen);
    form.reset();
  };
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  return (
    <>
      <button onClick={toggleModal} className="flex w-full">
        {isFamilyList ? "Family" : "Personal"}
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
                    New {isFamilyList ? "Family" : "Personal"} List
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
                  <div>
                    <form.Field
                      name="name"
                      children={(field) => {
                        return (
                          <>
                            <input
                              className="w-full rounded-md border border-slate-400 p-2 outline-0"
                              id={field.name}
                              name={field.name}
                              placeholder="Name"
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
                  <div className="flex items-center justify-center space-x-2">
                    <form.Field
                      name="color"
                      children={(field) => (
                        <>
                          {colors.map((value, index) => (
                            <input
                              key={index}
                              className="flex h-10 w-10 appearance-none rounded-full p-1 outline-offset-2 checked:outline"
                              style={{
                                backgroundColor: value,
                                outlineColor: value,
                              }}
                              id={`${field.name}-${index}`}
                              name={field.name}
                              value={value}
                              onBlur={field.handleBlur}
                              type="radio"
                              defaultChecked={value === "#3B82F6"}
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
                </section>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AddList;
