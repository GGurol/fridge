import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout")({
  component: Layout,
});

function Layout() {
  return (
    <>
      <div className="text-3xl text-red-500">nav</div>
      <Outlet />
    </>
  );
}
