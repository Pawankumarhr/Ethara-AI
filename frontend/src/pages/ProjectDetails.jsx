import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";

const emptyTask = {
  title: "",
  description: "",
  priority: "MEDIUM",
  dueDate: "",
  assignedTo: "",
};

const ProjectDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [users, setUsers] = useState([]);
  const [memberId, setMemberId] = useState("");
  const [taskForm, setTaskForm] = useState(emptyTask);

  const fetchProject = async () => {
    try {
      const { data } = await api.get(`/projects/${id}`);
      setProject(data);
    } catch {
      toast.error("Failed to fetch project details");
    }
  };

  useEffect(() => {
    fetchProject();
  }, [id]);

  useEffect(() => {
    const fetchUsers = async () => {
      if (user?.role !== "ADMIN") return;
      try {
        const { data } = await api.get("/auth/users");
        setUsers(data);
      } catch {
        setUsers([]);
      }
    };

    fetchUsers();
  }, [user?.role]);

  const addMember = async (e) => {
    e.preventDefault();
    if (!memberId) return;

    try {
      await api.post(`/projects/${id}/members`, { userId: Number(memberId) });
      toast.success("Member added");
      setMemberId("");
      fetchProject();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add member");
    }
  };

  const createTask = async (e) => {
    e.preventDefault();

    try {
      await api.post("/tasks", {
        ...taskForm,
        projectId: Number(id),
        assignedTo: taskForm.assignedTo ? Number(taskForm.assignedTo) : null,
      });
      toast.success("Task created");
      setTaskForm(emptyTask);
      fetchProject();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create task");
    }
  };

  if (!project) return <Loader message="Loading project..." />;

  return (
    <div className="space-y-5">
      <div className="card">
        <h2 className="text-xl font-bold text-slate-900">{project.title}</h2>
        <p className="mt-1 text-sm text-slate-600">{project.description || "No description"}</p>
      </div>

      {user?.role === "ADMIN" && (
        <div className="grid gap-5 lg:grid-cols-2">
          <form onSubmit={addMember} className="card space-y-3">
            <p className="font-semibold text-slate-900">Add Member</p>
            <select className="input" value={memberId} onChange={(e) => setMemberId(e.target.value)}>
              <option value="">Select user</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
              ))}
            </select>
            <button className="btn btn-primary">Add Member</button>
          </form>

          <form onSubmit={createTask} className="card grid gap-3 md:grid-cols-2">
            <p className="md:col-span-2 font-semibold text-slate-900">Create Task</p>
            <input className="input" placeholder="Title" value={taskForm.title} onChange={(e) => setTaskForm((p) => ({ ...p, title: e.target.value }))} required />
            <input className="input" placeholder="Description" value={taskForm.description} onChange={(e) => setTaskForm((p) => ({ ...p, description: e.target.value }))} />
            <select className="input" value={taskForm.priority} onChange={(e) => setTaskForm((p) => ({ ...p, priority: e.target.value }))}>
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
            </select>
            <input className="input" type="date" value={taskForm.dueDate} onChange={(e) => setTaskForm((p) => ({ ...p, dueDate: e.target.value }))} />
            <select className="input md:col-span-2" value={taskForm.assignedTo} onChange={(e) => setTaskForm((p) => ({ ...p, assignedTo: e.target.value }))}>
              <option value="">Assign to (optional)</option>
              {project.members.map((m) => (
                <option key={m.user.id} value={m.user.id}>{m.user.name}</option>
              ))}
            </select>
            <button className="btn btn-primary md:col-span-2">Create Task</button>
          </form>
        </div>
      )}

      <div className="card">
        <p className="font-semibold text-slate-900">Project Tasks</p>
        <div className="mt-3 space-y-2">
          {project.tasks.length ? (
            project.tasks.map((task) => (
              <div key={task.id} className="rounded-lg border border-slate-200 px-3 py-2">
                <p className="font-medium text-slate-900">{task.title}</p>
                <p className="text-xs text-slate-500">{task.assignee?.name || "Unassigned"} • {task.status}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">No tasks yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
