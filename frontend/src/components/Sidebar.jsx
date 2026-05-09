import { Link, NavLink } from "react-router-dom";

const navClass = ({ isActive }) =>
  `block rounded-lg px-3 py-2 text-sm font-medium ${isActive ? "bg-sky-600 text-white" : "text-slate-700 hover:bg-slate-200"}`;

const Sidebar = () => {
  return (
    <aside className="hidden w-64 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:block">
      <Link to="/dashboard" className="mb-6 block text-lg font-bold text-slate-900">
        Ethara AI
      </Link>
      <nav className="space-y-2">
        <NavLink to="/dashboard" className={navClass}>Dashboard</NavLink>
        <NavLink to="/projects" className={navClass}>Projects</NavLink>
        <NavLink to="/tasks" className={navClass}>Tasks</NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;
