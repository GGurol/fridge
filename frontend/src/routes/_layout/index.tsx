import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ListsService } from "~/client";
import Spinner from "~/components/Common/Spinner";
import AddList from "~/components/Lists/AddList";
import AddTask from "~/components/Tasks/AddTask";
import useAuth from "~/hooks/useAuth";

export const Route = createFileRoute("/_layout/")({
  component: Home,
});

function Home() {
  const { user, logout } = useAuth();
  const {
    isLoading: isLoadingFamilyList,
    isError: isErrorFamilyList,
    data: familyList,
    error: errorFamilyList,
  } = useQuery({
    queryKey: ["family-lists"],
    queryFn: ListsService.readFamilyLists,
  });
  const {
    isLoading: isLoadingPersonalList,
    isError: isErrorPersonalList,
    data: personalList,
    error: errorPersonalList,
  } = useQuery({
    queryKey: ["personal-lists"],
    queryFn: ListsService.readPersonalLists,
  });

  if (isLoadingFamilyList || isLoadingPersonalList) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (isErrorFamilyList) {
    return <span>Error: {errorFamilyList.message}</span>;
  }

  if (isErrorPersonalList) {
    return <span>Error: {errorPersonalList.message}</span>;
  }

  return (
    <div className="mx-auto max-w-3xl">
      <section className="flex justify-between">
        <h1 className="text-3xl">Hi, {user?.name || user?.email} 👋🏼</h1>
        <button type="button" className="border p-2" onClick={() => logout()}>
          logout
        </button>
      </section>
      <div className="border-t"></div>
      <section className="flex">
        <div className="flex-grow">
          <AddList />
        </div>
        <div className="flex-grow">
          <AddList isFamilyList={true} />
        </div>
      </section>
      <section>
        <div>
          <h2 className="text-2xl font-bold">Family</h2>
          <ul>
            {familyList?.data.map((list, index) => (
              <li key={index}>
                <Link to="/lists/$listId" params={{ listId: list.id }}>
                  <div className="flex justify-between">
                    <span
                      className="h-10 w-10 rounded-full"
                      style={{ backgroundColor: list.color }}
                    ></span>
                    <span>{list.name}</span>
                    <span>{list.task_count}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-2xl font-bold">Personal</h2>
          <ul>
            {personalList?.data.map((list, index) => (
              <li key={index}>
                <Link to="/lists/$listId" params={{ listId: list.id }}>
                  <div className="flex justify-between">
                    <span
                      className="h-10 w-10 rounded-full"
                      style={{ backgroundColor: list.color }}
                    ></span>
                    <span>{list.name}</span>
                    <span>{list.task_count}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <section>
        <AddTask />
      </section>
    </div>
  );
}
