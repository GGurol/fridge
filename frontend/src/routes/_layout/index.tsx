import { createFileRoute } from "@tanstack/react-router";
import useAuth from "~/hooks/useAuth";

export const Route = createFileRoute("/_layout/")({
  component: Home,
});

function Home() {
  const { user, logout } = useAuth();

  return (
    <>
      <h1 className="text-3xl">Hi, {user?.name || user?.email} 👋🏼</h1>
      <button type="button" className="border p-2" onClick={() => logout()}>
        logout
      </button>
    </>
  );
}
