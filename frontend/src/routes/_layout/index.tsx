import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ListsService } from "~/client";
import Spinner from "~/components/Common/Spinner";
import AddList from "~/components/Lists/AddList";
import AddListMenu from "~/components/Lists/AddListMenu";
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
      <section className="mb-10 flex justify-between border-b px-4 py-2">
        <h1 className="text-3xl">Hi, {user?.name || user?.email} 👋🏼</h1>
        <button
          type="button"
          className="rounded-md border border-slate-400 p-2 hover:bg-slate-200"
          onClick={() => logout()}
        >
          logout
        </button>
      </section>
      <section>
        <div>
          <h2 className="py-4 text-2xl font-bold">Family</h2>
          <ul className="flex flex-col space-y-4">
            {familyList?.data.map((list, index) => (
              <li
                key={index}
                className="rounded-md border-b border-slate-400 px-4 py-2 shadow-sm hover:bg-slate-200"
              >
                <Link to="/lists/$listId" params={{ listId: list.id }}>
                  <div className="flex items-center space-x-4">
                    <div
                      className="h-10 w-10 flex-none rounded-full"
                      style={{ backgroundColor: list.color }}
                    ></div>
                    <div className="flex flex-1 justify-between font-semibold">
                      <span>{list.name}</span>
                      <span className="text-slate-500">{list.task_count}</span>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="py-4 text-2xl font-bold">Personal</h2>
          <ul className="flex flex-col space-y-4">
            {personalList?.data.map((list, index) => (
              <li
                key={index}
                className="rounded-md border-b border-slate-400 px-4 py-2 shadow-sm hover:bg-slate-200"
              >
                <Link to="/lists/$listId" params={{ listId: list.id }}>
                  <div className="flex items-center space-x-4">
                    <div
                      className="h-10 w-10 flex-none rounded-full"
                      style={{ backgroundColor: list.color }}
                    ></div>
                    <div className="flex flex-1 justify-between border-slate-400 py-2 font-semibold">
                      <span>{list.name}</span>
                      <span className="text-slate-500">{list.task_count}</span>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <section className="my-24 flex w-full justify-between">
        <AddTask />
        <AddListMenu />
      </section>
    </div>
  );
}
