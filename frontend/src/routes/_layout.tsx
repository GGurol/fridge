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
  const { isLoading, isError, userError } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (isError) {
    return <>{userError?.message}</>;
  }

  return <Outlet />;
}
