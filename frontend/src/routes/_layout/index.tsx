import { createFileRoute, useNavigate } from "@tanstack/react-router";
import useAuth from "~/hooks/useAuth";

export const Route = createFileRoute("/_layout/")({
  component: Home,
});

function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user?.family_id) {
    navigate({ to: "/setup" });
  }

  console.log(user);

  return (
    <>
      <h1 className="text-3xl">Hi, {user?.name || user?.email} 👋🏼</h1>
    </>
  );
}
