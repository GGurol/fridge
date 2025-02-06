import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { FamiliesService, ListsService } from "~/client";
import Spinner from "~/components/Common/Spinner";
import AddListMenu from "~/components/Lists/AddListMenu";
import useAuth from "~/hooks/useAuth";

export const Route = createFileRoute("/_layout/")({
  component: Home,
});

function Home() {
  const { user, logout } = useAuth();
  const [copied, setCopied] = useState(false);
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
  const {
    isLoading: isLoadingInviteCode,
    isError: isErrorInviteCode,
    data: inviteCode,
    error: errorInviteCode,
  } = useQuery({
    queryKey: ["invite-code"],
    queryFn: () => {
      if (user?.family_id) {
        return FamiliesService.readFamilyInviteCode({
          familyId: user?.family_id,
        });
      }
    },
    enabled: !!user?.family_id,
  });
  const handleClick = async () => {
    try {
      if (inviteCode) {
        await navigator.clipboard.writeText(inviteCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  if (isLoadingFamilyList || isLoadingPersonalList || isLoadingInviteCode) {
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

  if (isErrorInviteCode) {
    return <span>Error: {errorInviteCode.message}</span>;
  }

  return (
    <>
      <section className="mb-10 flex items-end justify-between">
        <h1 className="p-2 text-sm text-slate-400">
          Logged in as: {user?.email}
        </h1>
        <button
          type="button"
          className="rounded-md border border-slate-400 px-3 py-2 hover:bg-slate-200"
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
      <section className="my-14 flex w-full justify-between">
        <AddListMenu />
      </section>
      <section className="flex flex-col items-center justify-center space-y-2">
        <h2 className="text-base text-slate-600">Invite your family members</h2>
        <div className="flex">
          <span
            data-testid="invite-code"
            onClick={handleClick}
            className="cursor-pointer border bg-slate-100 px-3 py-2 text-lg font-bold text-slate-600"
          >
            {inviteCode}
          </span>
        </div>
        {copied && <span>Copied!</span>}
      </section>
    </>
  );
}
