import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";
import toast from "react-hot-toast";

const statusColors = {
  PENDING: "bg-orange-100 text-orange-700 border-orange-200",
  IN_PROGRESS: "bg-blue-100 text-blue-700 border-blue-200",
  COMPLETED: "bg-green-100 text-green-700 border-green-200",
  OVERDUE: "bg-red-100 text-red-700 border-red-200",
};

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [projectFormData, setProjectFormData] = useState({
    title: "",
    description: "",
    deadline: "",
  });
  const [taskFormData, setTaskFormData] = useState({
    title: "",
    description: "",
    priority: "MEDIUM",
    due_date: "",
    status: "PENDING",
    project_id: "",
    assigned_to: "",
  });

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const [dashboardRes, projectsRes, membersRes] = await Promise.all([
        api.get("/dashboard"),
        api.get("/projects"),
        api.get("/users"),
      ]);
      setData(dashboardRes.data);
      setProjects(projectsRes.data || []);
      setMembers(membersRes.data?.data || []);
    } catch (error) {
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const progress = useMemo(() => {
    if (!data?.stats?.totalTasks) return 0;
    return Math.round((data.stats.completedTasks / data.stats.totalTasks) * 100);
  }, [data]);

  const filteredTasks = useMemo(() => {
    if (!data?.recentTasks) return [];
    let tasks = data.recentTasks;
    if (statusFilter !== "ALL") {
      tasks = tasks.filter((t) => t.status === statusFilter);
    }
    if (searchQuery.trim()) {
      tasks = tasks.filter((t) =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return tasks;
  }, [data, statusFilter, searchQuery]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!projectFormData.title.trim()) {
      toast.error("Project title is required");
      return;
    }

    setCreating(true);
    try {
      await api.post("/projects", {
        title: projectFormData.title,
        description: projectFormData.description,
        deadline: projectFormData.deadline || null,
      });
      toast.success("Project created successfully");
      setProjectFormData({ title: "", description: "", deadline: "" });
      setShowProjectModal(false);
      await fetchDashboard();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create project");
    } finally {
      setCreating(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskFormData.title.trim()) {
      toast.error("Task title is required");
      return;
    }
    if (!taskFormData.project_id) {
      toast.error("Please select a project");
      return;
    }

    setCreating(true);
    try {
      await api.post("/tasks", {
        title: taskFormData.title,
        description: taskFormData.description,
        priority: taskFormData.priority,
        due_date: taskFormData.due_date || null,
        status: taskFormData.status,
        projectId: taskFormData.project_id,
        assignedTo: taskFormData.assigned_to || null,
      });
      toast.success("Task created successfully");
      setTaskFormData({
        title: "",
        description: "",
        priority: "MEDIUM",
        due_date: "",
        status: "PENDING",
        project_id: "",
        assigned_to: "",
      });
      setShowTaskModal(false);
      await fetchDashboard();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create task");
    } finally {
      setCreating(false);
    }
  };

  const handleAssignTask = async (taskId, memberId) => {
    try {
      await api.put(`/tasks/${taskId}`, {
        assigned_to: memberId || null,
      });
      toast.success("Task assigned successfully");
      await fetchDashboard();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to assign task");
    }
  };

  if (loading) {
    return <Loader message="Loading dashboard..." />;
  }

  const stats = data?.stats || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        {user?.role === "Admin" && (
          <div className="flex gap-2">
            <button
              onClick={() => setShowProjectModal(true)}
              className="btn bg-sky-600 text-white hover:bg-sky-700 flex items-center gap-2"
            >
              <span>📁</span>
              <span>New Project</span>
            </button>
            <button
              onClick={() => setShowTaskModal(true)}
              className="btn bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-2"
            >
              <span>✓</span>
              <span>New Task</span>
            </button>
          </div>
        )}
      </div>

      {/* Admin Actions Panel */}
      {user?.role === "Admin" && (
        <div className="grid gap-4 sm:grid-cols-3">
          <button
            onClick={() => setShowProjectModal(true)}
            className="card border-2 border-slate-200 hover:border-sky-400 hover:bg-sky-50 transition cursor-pointer"
          >
            <div className="text-center py-4">
              <div className="text-4xl mb-3">📁</div>
              <p className="font-bold text-slate-900">Create Project</p>
              <p className="text-xs text-slate-500 mt-1">Start organizing work</p>
            </div>
          </button>
          <button
            onClick={() => setShowTaskModal(true)}
            className="card border-2 border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 transition cursor-pointer"
          >
            <div className="text-center py-4">
              <div className="text-4xl mb-3">✓</div>
              <p className="font-bold text-slate-900">Create Task</p>
              <p className="text-xs text-slate-500 mt-1">Assign work items</p>
            </div>
          </button>
          <button className="card border-2 border-slate-200 hover:border-purple-400 hover:bg-purple-50 transition cursor-pointer"
            onClick={() => navigate("/team")}
          >
            <div className="text-center py-4">
              <div className="text-4xl mb-3">👥</div>
              <p className="font-bold text-slate-900">Team Members</p>
              <p className="text-xs text-slate-500 mt-1">Manage & invite</p>
            </div>
          </button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <div className="card">
          <p className="text-sm text-slate-500">Total Projects</p>
          <p className="mt-2 text-3xl font-bold text-sky-600">{stats.totalProjects || 0}</p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-500">Total Tasks</p>
          <p className="mt-2 text-3xl font-bold text-blue-600">{stats.totalTasks || 0}</p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-500">Completed</p>
          <p className="mt-2 text-3xl font-bold text-emerald-600">{stats.completedTasks || 0}</p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-500">Pending</p>
          <p className="mt-2 text-3xl font-bold text-amber-600">{stats.pendingTasks || 0}</p>
        </div>
        <div className="card">
          <p className="text-sm text-slate-500">Overdue</p>
          <p className="mt-2 text-3xl font-bold text-red-600">{stats.overdueTasks || 0}</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Task Completion Card */}
        <div className="card lg:col-span-1">
          <p className="text-sm font-semibold text-slate-900">Task Completion</p>
          <p className="mt-4 text-4xl font-bold text-sky-600">{progress}%</p>
          <div className="mt-6 h-3 rounded-full bg-slate-200 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-sky-500 to-sky-600 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="mt-4 text-xs text-slate-600">
            {stats.completedTasks}/{stats.totalTasks} tasks completed
          </p>
        </div>

        {/* Recent Tasks Card */}
        <div className="card lg:col-span-2">
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="font-semibold text-slate-900">Recent Tasks</p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input text-sm px-3 py-2 w-32"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input text-sm px-3 py-2"
              >
                <option value="ALL">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="OVERDUE">Overdue</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            {filteredTasks?.length ? (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-300">
                    <th className="text-left py-3 px-3 font-semibold text-slate-700">Task</th>
                    <th className="text-left py-3 px-3 font-semibold text-slate-700">Assigned To</th>
                    <th className="text-left py-3 px-3 font-semibold text-slate-700">Status</th>
                    <th className="text-left py-3 px-3 font-semibold text-slate-700">Due Date</th>
                    <th className="text-left py-3 px-3 font-semibold text-slate-700">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredTasks.map((task) => (
                    <tr key={task._id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-3">
                        <p className="font-medium text-slate-900 truncate">{task.title}</p>
                        <p className="text-xs text-slate-500 mt-1">{task.project?.title || "No Project"}</p>
                      </td>
                      <td className="py-3 px-3 text-sm">
                        <select
                          value={task.assigned_to?._id || ""}
                          onChange={(e) => handleAssignTask(task._id, e.target.value)}
                          className="input text-sm px-2 py-1 w-full max-w-40"
                        >
                          <option value="">Unassigned</option>
                          {members.map((member) => (
                            <option key={member.id} value={member.id}>
                              {member.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${
                            statusColors[task.status] || "bg-slate-100 text-slate-700 border-slate-200"
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${
                            task.status === "PENDING" ? "bg-orange-500" :
                            task.status === "IN_PROGRESS" ? "bg-blue-500" :
                            task.status === "COMPLETED" ? "bg-green-500" :
                            "bg-red-500"
                          }`} />
                          {task.status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-sm text-slate-700">
                        {task.due_date
                          ? new Date(task.due_date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "—"}
                      </td>
                      <td className="py-3 px-3 text-sm">
                        <button
                          onClick={() => fetchDashboard()}
                          className="text-blue-600 hover:text-blue-800 font-medium text-xs"
                        >
                          Refresh
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-8">
                <p className="text-slate-500">No tasks found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Project Modal */}
      {showProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            <h2 className="text-2xl font-bold text-slate-900">Create New Project</h2>
            <form onSubmit={handleCreateProject} className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Project Title*</label>
                <input
                  type="text"
                  placeholder="e.g., Q2 Marketing Campaign"
                  value={projectFormData.title}
                  onChange={(e) =>
                    setProjectFormData({ ...projectFormData, title: e.target.value })
                  }
                  className="input w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  placeholder="Describe your project goals and scope..."
                  value={projectFormData.description}
                  onChange={(e) =>
                    setProjectFormData({
                      ...projectFormData,
                      description: e.target.value,
                    })
                  }
                  className="input w-full"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Deadline</label>
                <input
                  type="date"
                  value={projectFormData.deadline}
                  onChange={(e) =>
                    setProjectFormData({
                      ...projectFormData,
                      deadline: e.target.value,
                    })
                  }
                  className="input w-full"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={creating}
                  className="btn flex-1 bg-sky-600 text-white hover:bg-sky-700 disabled:opacity-50 font-semibold"
                >
                  {creating ? "Creating..." : "Create Project"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowProjectModal(false)}
                  className="btn flex-1 border border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            <h2 className="text-2xl font-bold text-slate-900">Create New Task</h2>
            <form onSubmit={handleCreateTask} className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Task Title*</label>
                <input
                  type="text"
                  placeholder="e.g., Design landing page"
                  value={taskFormData.title}
                  onChange={(e) =>
                    setTaskFormData({ ...taskFormData, title: e.target.value })
                  }
                  className="input w-full"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  placeholder="Add task details..."
                  value={taskFormData.description}
                  onChange={(e) =>
                    setTaskFormData({
                      ...taskFormData,
                      description: e.target.value,
                    })
                  }
                  className="input w-full"
                  rows="2"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Project*</label>
                <select
                  value={taskFormData.project_id}
                  onChange={(e) =>
                    setTaskFormData({
                      ...taskFormData,
                      project_id: e.target.value,
                    })
                  }
                  className="input w-full"
                  required
                >
                  <option value="">Select a project...</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.title}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Assign To</label>
                <select
                  value={taskFormData.assigned_to}
                  onChange={(e) =>
                    setTaskFormData({
                      ...taskFormData,
                      assigned_to: e.target.value,
                    })
                  }
                  className="input w-full"
                >
                  <option value="">Leave Unassigned</option>
                  {members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name} ({member.role})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={taskFormData.priority}
                    onChange={(e) =>
                      setTaskFormData({
                        ...taskFormData,
                        priority: e.target.value,
                      })
                    }
                    className="input w-full"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={taskFormData.status}
                    onChange={(e) =>
                      setTaskFormData({
                        ...taskFormData,
                        status: e.target.value,
                      })
                    }
                    className="input w-full"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={taskFormData.due_date}
                    onChange={(e) =>
                      setTaskFormData({
                        ...taskFormData,
                        due_date: e.target.value,
                      })
                    }
                    className="input w-full"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={creating}
                  className="btn flex-1 bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 font-semibold"
                >
                  {creating ? "Creating..." : "Create Task"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="btn flex-1 border border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
