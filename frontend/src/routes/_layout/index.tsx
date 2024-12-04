import { createFileRoute } from "@tanstack/react-router";
import useAuth from "~/hooks/useAuth";

export const Route = createFileRoute("/_layout/")({
  component: Dashboard,
});

function Dashboard() {
  const { user } = useAuth();
  console.log(user);
  return (
    <>
      <h1 className="text-3xl">Hi, {user?.name || user?.email} 👋🏼</h1>
    </>
  );
}
