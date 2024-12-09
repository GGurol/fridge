import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import Spinner from "~/components/Common/Spinner";
import useAuth, { isLoggedIn } from "~/hooks/useAuth";

export const Route = createFileRoute("/_layout")({
  component: Layout,
  beforeLoad: async () => {
    if (!isLoggedIn()) {
      throw redirect({
        to: "/login",
      });
    }
  },
});

function Layout() {
  const { isLoading } = useAuth();

  return <div>{isLoading ? <Spinner /> : <Outlet />}</div>;
}
