import { FieldApi, useForm } from "@tanstack/react-form";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { useState } from "react";
import { z } from "zod";
import useAuth, { isLoggedIn } from "~/hooks/useAuth";

export const Route = createFileRoute("/signup")({
  component: SignUp,
  beforeLoad: async () => {
    if (isLoggedIn()) {
      throw redirect({
        to: "/",
      });
    }
  },
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

const userSignUpSchema = z
  .object({
    email: z
      .string()
      .email({ message: "Email must be a valid email" })
      .max(255, { message: "Email must be 255 or fewer characters long" }),
    name: z
      .string()
      .max(255, { message: "Name must be 255 or fewer characters long" }),
    password: z
      .string()
      .min(4, { message: "Password must be at least 4 characters" })
      .max(40, { message: "Password must be 40 or fewer characters long" }),
    confirm_password: z
      .string()
      .min(4, { message: "Password must be at least 4 characters" })
      .max(40, { message: "Password must be 40 or fewer characters long" }),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords must match",
    path: ["confirm_password"],
  });

type userSignUpSchema = z.infer<typeof userSignUpSchema>;

function SignUp() {
  const { signUpMutation } = useAuth();
  const [show, setShow] = useState(false);

  const form = useForm({
    defaultValues: {
      email: "",
      name: "",
      password: "",
      confirm_password: "",
    } as userSignUpSchema,
    onSubmit: async ({ value }) => {
      try {
        await signUpMutation.mutateAsync(value);
      } catch {
        // error is handled by useAuth hook
      }
    },
    validatorAdapter: zodValidator(),
    validators: {
      onSubmit: userSignUpSchema,
    },
  });

  const handleShow = () => {
    setShow((prevState) => !prevState);
  };

  return (
    <div className="flex h-screen min-w-full flex-col items-center justify-center">
      <div className="flex w-96 flex-col space-y-8 p-4">
        <h1 className="text-center text-4xl font-medium text-slate-900">
          Fridge
        </h1>
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
              name="email"
              children={(field) => {
                return (
                  <>
                    <input
                      className="rounded-md border border-slate-400 p-2 outline-0"
                      id={field.name}
                      name={field.name}
                      placeholder="Email"
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
              name="name"
              children={(field) => {
                return (
                  <>
                    <input
                      className="rounded-md border border-slate-400 p-2 outline-0"
                      id={field.name}
                      name={field.name}
                      placeholder="Name"
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
              name="password"
              children={(field) => (
                <>
                  <div className="flex space-x-1 rounded-md border border-slate-400 p-2">
                    <input
                      className="flex flex-grow outline-0"
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      placeholder="Password"
                      type={show ? "text" : "password"}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={handleShow}
                      className="text-slate-800"
                    >
                      {show ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.0}
                          stroke="currentColor"
                          className="size-6"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                          />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.0}
                          stroke="currentColor"
                          className="size-6"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                  <FieldInfo field={field} />
                </>
              )}
            />
          </div>
          <div className="flex flex-col">
            <form.Field
              name="confirm_password"
              children={(field) => (
                <>
                  <div className="flex space-x-1 rounded-md border border-slate-400 p-2">
                    <input
                      className="flex flex-grow outline-0"
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      placeholder="Confirm Password"
                      type={show ? "text" : "password"}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={handleShow}
                      className="text-slate-800"
                    >
                      {show ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.0}
                          stroke="currentColor"
                          className="size-6"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                          />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.0}
                          stroke="currentColor"
                          className="size-6"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
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
                {isSubmitting ? "..." : "Sign Up"}
              </button>
            )}
          />
        </form>
        <div className="pt-2 text-center">
          Already have an account?{" "}
          <span>
            <Link className="text-blue-500 hover:underline" to="/login">
              Log In
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
}
