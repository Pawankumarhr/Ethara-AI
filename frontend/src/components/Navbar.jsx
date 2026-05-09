import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="mb-5 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div>
        <p className="text-sm text-slate-500">Welcome back</p>
        <p className="font-semibold text-slate-900">{user?.name}</p>
      </div>
      <div className="flex items-center gap-3">
        <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">{user?.role}</span>
        <button className="btn btn-secondary" onClick={logout}>Logout</button>
      </div>
    </header>
  );
};

export default Navbar;
