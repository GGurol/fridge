import { useEffect, useRef, useState } from "react";
import AddList from "~/components/Lists/AddList";

function AddListMenu() {
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
        className="rounded-md border border-slate-400 p-2 font-semibold text-slate-900 hover:bg-slate-200"
      >
        Add list
      </button>
      {isOpen && (
        <ul className="absolute bottom-12 right-0 w-48 rounded-xl border bg-white shadow-sm">
          <li className="cursor-pointer border-b px-4 py-2 hover:bg-slate-200">
            <AddList onToggleMenu={toggleMenu} />
          </li>
          <li className="cursor-pointer px-4 py-2 hover:bg-slate-200">
            <AddList isFamilyList={true} onToggleMenu={toggleMenu} />
          </li>
        </ul>
      )}
    </div>
  );
}

export default AddListMenu;
