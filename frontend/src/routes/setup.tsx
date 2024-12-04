import { FieldApi, useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { AxiosError } from "axios";
import toast from "react-hot-toast";
import { z } from "zod";
import {
  ApiError,
  FamiliesCreateFamilyData,
  FamiliesJoinFamilyData,
  FamiliesService,
} from "~/client";

export const Route = createFileRoute("/setup")({
  component: Setup,
});

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

const createSchema = z.object({ name: z.string() });
const joinSchema = z.object({ inviteCode: z.string() });

type Create = z.infer<typeof createSchema>;
type Join = z.infer<typeof joinSchema>;

function Setup() {
  const navigate = useNavigate();
  const createForm = useForm({
    defaultValues: { name: "" } as Create,
    onSubmit: async ({ value }) => {
      await createMutation.mutateAsync(value);
    },
    validatorAdapter: zodValidator(),
    validators: {
      onSubmit: createSchema,
    },
  });
  const createMutation = useMutation({
    mutationFn: (data: FamiliesCreateFamilyData) =>
      FamiliesService.createFamily(data),
    onSuccess: () => {
      navigate({ to: "/" });
      toast.success("Family has been created successfully.");
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
  });

  const joinForm = useForm({
    defaultValues: { inviteCode: "" } as Join,
    onSubmit: async ({ value }) => {
      await joinMutation.mutateAsync(value);
    },
    validatorAdapter: zodValidator(),
    validators: {
      onSubmit: joinSchema,
    },
  });
  const joinMutation = useMutation({
    mutationFn: (data: FamiliesJoinFamilyData) =>
      FamiliesService.joinFamily(data),
    onSuccess: () => {
      navigate({ to: "/" });
      toast.success("Joined the family successfully.");
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
  });

  return (
    <>
      <div className="flex h-screen w-full flex-col items-center justify-center space-y-10">
        <section className="flex w-96 flex-col space-y-8 p-4">
          <h1 className="text-center text-2xl font-medium text-slate-900">
            Create Family
          </h1>
          <form
            className="flex flex-col space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              createForm.handleSubmit();
            }}
          >
            <div className="flex flex-col">
              <createForm.Field
                name="name"
                children={(field) => {
                  return (
                    <>
                      <input
                        className="rounded-md border border-slate-400 p-2 outline-0"
                        id={field.name}
                        name={field.name}
                        placeholder="Family Name"
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
            <createForm.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
              children={([canSubmit, isSubmitting]) => (
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="rounded-md bg-slate-700 p-2 font-semibold text-slate-50 hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-700"
                >
                  {isSubmitting ? "..." : "Create"}
                </button>
              )}
            />
          </form>
        </section>
        <div className="w-full border-b border-slate-400"></div>
        <section className="flex w-96 flex-col space-y-8 p-4">
          <h1 className="text-center text-2xl font-medium text-slate-900">
            Join Family
          </h1>
          <form
            className="flex flex-col space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              joinForm.handleSubmit();
            }}
          >
            <div className="flex flex-col">
              <joinForm.Field
                name="inviteCode"
                children={(field) => {
                  return (
                    <>
                      <input
                        className="rounded-md border border-slate-400 p-2 outline-0"
                        id={field.name}
                        name={field.name}
                        placeholder="Invite Code"
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
            <joinForm.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
              children={([canSubmit, isSubmitting]) => (
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="rounded-md bg-slate-700 p-2 font-semibold text-slate-50 hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-700"
                >
                  {isSubmitting ? "..." : "Join"}
                </button>
              )}
            />
          </form>
        </section>
      </div>
    </>
  );
}
