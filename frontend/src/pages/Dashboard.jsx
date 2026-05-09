import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import Loader from "../components/Loader";

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get("/dashboard");
        setData(response.data);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const progress = useMemo(() => {
    if (!data?.stats?.totalTasks) return 0;
    return Math.round((data.stats.completedTasks / data.stats.totalTasks) * 100);
  }, [data]);

  if (loading) {
    return <Loader message="Loading dashboard..." />;
  }

  const stats = data?.stats || {};

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <div className="card">
          <p className="text-sm text-slate-500">Total Projects</p>
          <p className="mt-3 text-3xl font-bold text-slate-900">{stats.totalProjects || 0}</p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-500">Total Tasks</p>
          <p className="mt-3 text-3xl font-bold text-slate-900">{stats.totalTasks || 0}</p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-500">Completed</p>
          <p className="mt-3 text-3xl font-bold text-emerald-700">{stats.completedTasks || 0}</p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-500">Pending</p>
          <p className="mt-3 text-3xl font-bold text-amber-700">{stats.pendingTasks || 0}</p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-500">Overdue</p>
          <p className="mt-3 text-3xl font-bold text-rose-700">{stats.overdueTasks || 0}</p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="card lg:col-span-1">
          <p className="text-sm text-slate-500">Task Completion</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{progress}%</p>
          <div className="mt-4 h-3 rounded-full bg-slate-200">
            <div className="h-3 rounded-full bg-sky-600" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="card lg:col-span-2">
          <p className="text-sm text-slate-500">Recent Tasks</p>
          <div className="mt-3 space-y-2">
            {data?.recentTasks?.length ? (
              data.recentTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2">
                  <div>
                    <p className="font-medium text-slate-900">{task.title}</p>
                    <p className="text-xs text-slate-500">{task.project?.title || "No project"}</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{task.status}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">No recent tasks</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
