import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";
import ProjectCard from "../components/ProjectCard";

const Projects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: "", description: "" });

  const fetchProjects = async () => {
    try {
      const { data } = await api.get("/projects");
      setProjects(data);
    } catch {
      toast.error("Failed to fetch projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post("/projects", form);
      toast.success("Project created");
      setForm({ title: "", description: "" });
      fetchProjects();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create project");
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/projects/${id}`);
      toast.success("Project deleted");
      fetchProjects();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete project");
    }
  };

  if (loading) return <Loader message="Loading projects..." />;

  return (
    <div className="space-y-5">
      {user?.role === "ADMIN" && (
        <form onSubmit={handleCreate} className="card grid gap-3 md:grid-cols-3">
          <input
            className="input"
            placeholder="Project title"
            value={form.title}
            onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
            required
          />
          <input
            className="input"
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
          />
          <button className="btn btn-primary">Create Project</button>
        </form>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onDelete={handleDelete}
            canDelete={user?.role === "ADMIN"}
          />
        ))}

        {!projects.length && <div className="card text-sm text-slate-500">No projects found</div>}
      </div>
    </div>
  );
};

export default Projects;
