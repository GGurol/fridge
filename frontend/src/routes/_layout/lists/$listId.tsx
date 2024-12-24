import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ListsService, TasksService } from "~/client";
import Spinner from "~/components/Common/Spinner";
import SettingsMenu from "~/components/Lists/SettingsMenu";

export const Route = createFileRoute("/_layout/lists/$listId")({
  component: List,
});

function List() {
  const { listId } = Route.useParams();

  const {
    isLoading: isLoadingList,
    isError: isErrorList,
    data: list,
    error: errorLists,
  } = useQuery({
    queryKey: ["list", listId],
    queryFn: () => ListsService.readList({ listId }),
  });
  const {
    isLoading: isLoadingTasks,
    isError: isErrorTasks,
    data: tasks,
    error: errorTasks,
  } = useQuery({
    queryKey: ["tasks", listId],
    queryFn: () => TasksService.readTasks({ listId }),
  });

  if (isLoadingList || isLoadingTasks) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (isErrorList) {
    return <span>Error: {errorLists.message}</span>;
  }

  if (isErrorTasks) {
    return <span>Error: {errorTasks.message}</span>;
  }

  return (
    <>
      <nav className="mb-5 flex items-center justify-between">
        <Link to={"/"}>
          <div className="flex items-center space-x-1 rounded-md border border-slate-400 p-2 hover:bg-slate-200">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={3.0}
              stroke="currentColor"
              className="mt-[1px] size-4 text-slate-900"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5 8.25 12l7.5-7.5"
              />
            </svg>
            <span className="text-slate-900">Home</span>
          </div>
        </Link>
        <SettingsMenu list={list} />
      </nav>
      <section>
        <h1 style={{ color: list?.color }} className="text-3xl font-bold">
          {list?.name}
        </h1>
      </section>
    </>

    // <div className="flex flex-col space-y-10">
    //   <h1>{list?.name}</h1>
    //   <h1 style={{ color: list?.color }}>COLOR</h1>
    //   <section>
    //     <ul>
    //       {tasks?.data.map((value) => (
    //         <li key={value.id}>{JSON.stringify(value)}</li>
    //       ))}
    //     </ul>
    //   </section>
    //   <AddTask />
    //   <EditList listId={listId} name={list?.name} color={list?.color} />

    // </div>
  );
}
