import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ok = await login(form);
    if (ok) navigate("/dashboard");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Login</h1>
        <p className="mt-1 text-sm text-slate-500">Welcome to Ethara AI Team Task Manager</p>
        <p className="mt-3 text-center font-semibold text-sky-600">Manage Teams. Track Progress. Deliver Faster.</p>

        <div className="mt-5 space-y-4">
          <input
            className="input"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            required
          />
          <input
            className="input"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
            required
          />
        </div>

        <button className="btn btn-primary mt-5 w-full" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="mt-4 text-sm text-slate-600">
          Don&apos;t have an account? <Link className="font-semibold text-sky-700" to="/register">Register</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
