import { useEffect, useRef, useState } from "react";
import { List } from "~/client";
import EditList from "~/components/Lists/EditList";
import { Route } from "~/routes/_layout/lists/$listId";
import DeleteList from "~/components/Lists/DeleteList";

interface SettingsMenuProps {
  list?: List;
}

function SettingsMenu({ list }: SettingsMenuProps) {
  const { listId } = Route.useParams();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={toggleMenu}
        className="rounded-md border border-slate-400 p-2 text-slate-900 hover:bg-slate-200"
      >
        Settings
      </button>
      {isOpen && (
        <ul className="absolute right-0 w-48 rounded-xl border bg-white shadow-sm">
          <li className="cursor-pointer border-b px-4 py-2 hover:bg-slate-200">
            <EditList
              listId={listId}
              color={list?.color}
              onToggleMenu={toggleMenu}
              name={list?.name}
            />
          </li>
          <li className="cursor-pointer px-4 py-2 hover:bg-slate-200">
            <DeleteList listId={listId} is_family_list={list?.is_family_list} />
          </li>
        </ul>
      )}
    </div>
  );
}

export default SettingsMenu;
