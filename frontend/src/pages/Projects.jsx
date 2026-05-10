import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";
import ProjectCard from "../components/ProjectCard";

const Projects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: "", description: "", deadline: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("created");
  const [filterBy, setFilterBy] = useState("all");
  const [addMemberModal, setAddMemberModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedMember, setSelectedMember] = useState("");

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

  const fetchMembers = async () => {
    try {
      const { data } = await api.get("/users");
      setMembers(data?.data || []);
    } catch {
      console.log("Failed to fetch members");
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchMembers();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post("/projects", form);
      toast.success("Project created");
      setForm({ title: "", description: "", deadline: "" });
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

  const handleAddMember = async () => {
    if (!selectedMember) {
      toast.error("Please select a member");
      return;
    }

    try {
      await api.post(`/projects/${selectedProject.id}/members`, {
        userId: selectedMember,
      });
      toast.success("Member added to project");
      setAddMemberModal(false);
      setSelectedMember("");
      setSelectedProject(null);
      fetchProjects();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add member");
    }
  };

  // Filter and sort projects
  const filteredProjects = useMemo(() => {
    let result = projects;

    // Search filter
    if (searchQuery.trim()) {
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (filterBy !== "all") {
      result = result.filter((p) => {
        if (filterBy === "with-deadline") return p.deadline;
        if (filterBy === "no-deadline") return !p.deadline;
        if (filterBy === "my-projects")
          return p.Members.some((m) => m.user_id?._id === user?.id);
        return true;
      });
    }

    // Sort
    if (sortBy === "deadline") {
      result.sort(
        (a, b) =>
          new Date(a.deadline || "9999-12-31") -
          new Date(b.deadline || "9999-12-31")
      );
    } else if (sortBy === "recent") {
      result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (sortBy === "oldest") {
      result.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    } else if (sortBy === "members") {
      result.sort((a, b) => b.Members.length - a.Members.length);
    }

    return result;
  }, [projects, searchQuery, sortBy, filterBy, user?.id]);

  if (loading) return <Loader message="Loading projects..." />;

  return (
    <div className="space-y-5">
      {/* Create Project Form */}
      {user?.role === "Admin" && (
        <form onSubmit={handleCreate} className="card grid gap-3 md:grid-cols-4">
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
          <input
            type="date"
            className="input"
            value={form.deadline}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, deadline: e.target.value }))
            }
          />
          <button className="btn btn-primary">Create Project</button>
        </form>
      )}

      {/* Search, Sort & Filter Controls */}
      <div className="card grid gap-3 md:grid-cols-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Search Projects
          </label>
          <input
            type="text"
            placeholder="Search by title or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Sort By
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input w-full"
          >
            <option value="created">Newest First</option>
            <option value="recent">Recently Updated</option>
            <option value="oldest">Oldest First</option>
            <option value="deadline">Deadline Ascending</option>
            <option value="members">Most Members</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Filter By
          </label>
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            className="input w-full"
          >
            <option value="all">All Projects</option>
            <option value="with-deadline">With Deadline</option>
            <option value="no-deadline">No Deadline</option>
            {user?.role !== "Admin" && (
              <option value="my-projects">My Projects</option>
            )}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Results
          </label>
          <div className="input w-full text-center font-semibold text-blue-600">
            {filteredProjects.length} Project{filteredProjects.length !== 1 ? "s" : ""}
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredProjects.map((project) => (
          <div key={project.id} className="relative">
            <ProjectCard
              project={project}
              onDelete={handleDelete}
              canDelete={user?.role === "Admin"}
            />
            {user?.role === "Admin" && (
              <button
                onClick={() => {
                  setSelectedProject(project);
                  setAddMemberModal(true);
                }}
                className="absolute top-4 right-4 text-sm px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                title="Add member to project"
              >
                +👥
              </button>
            )}
          </div>
        ))}

        {!filteredProjects.length && (
          <div className="card text-sm text-slate-500 col-span-full text-center py-8">
            No projects found
          </div>
        )}
      </div>

      {/* Add Member Modal */}
      {addMemberModal && selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Add Member to Project
            </h2>
            <p className="text-sm text-slate-600 mb-4">{selectedProject.title}</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Select Member
                </label>
                <select
                  value={selectedMember}
                  onChange={(e) => setSelectedMember(e.target.value)}
                  className="input w-full"
                >
                  <option value="">Choose a member...</option>
                  {members
                    .filter(
                      (m) =>
                        !selectedProject.Members.some(
                          (pm) => pm.user_id?._id === m.id
                        )
                    )
                    .map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name} ({member.role})
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleAddMember}
                  className="btn flex-1 bg-blue-600 text-white hover:bg-blue-700 font-semibold"
                >
                  Add Member
                </button>
                <button
                  onClick={() => {
                    setAddMemberModal(false);
                    setSelectedMember("");
                    setSelectedProject(null);
                  }}
                  className="btn flex-1 border border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
