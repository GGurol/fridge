import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/")({
  component: Dashboard,
});

function Dashboard() {
  return (
    <>
      <span className="text-3xl">layout index</span>
    </>
  );
}
