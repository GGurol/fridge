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
    <>
      <section className="mb-10 flex items-end justify-between">
        <h1 className="p-2 text-sm text-slate-400">
          Logged in as: {user?.email}
        </h1>
        <button
          type="button"
          className="rounded-md border border-slate-400 p-2 hover:bg-slate-200"
          onClick={() => logout()}
        >
          Log Out
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
                      <div className="flex items-center space-x-2">
                        <span className="text-slate-500">
                          {list.task_count}
                        </span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={3.0}
                          stroke="currentColor"
                          className="mt-[1px] size-4 text-slate-400"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m8.25 4.5 7.5 7.5-7.5 7.5"
                          />
                        </svg>
                      </div>
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
                      <div className="flex items-center space-x-2">
                        <span className="text-slate-500">
                          {list.task_count}
                        </span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={3.0}
                          stroke="currentColor"
                          className="mt-[1px] size-4 text-slate-400"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m8.25 4.5 7.5 7.5-7.5 7.5"
                          />
                        </svg>
                      </div>
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
    </>
  );
}
