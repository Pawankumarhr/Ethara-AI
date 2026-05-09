import { Link } from "react-router-dom";

const ProjectCard = ({ project, onDelete, canDelete }) => {
  return (
    <div className="card">
      <p className="text-lg font-semibold text-slate-900">{project.title}</p>
      <p className="mt-1 text-sm text-slate-600">{project.description || "No description"}</p>
      <p className="mt-3 text-xs text-slate-500">Tasks: {project.tasks?.length || 0}</p>
      <div className="mt-4 flex items-center gap-2">
        <Link className="btn btn-secondary" to={`/projects/${project.id}`}>Open</Link>
        {canDelete && (
          <button className="btn bg-rose-600 text-white hover:bg-rose-700" onClick={() => onDelete(project.id)}>
            Delete
          </button>
        )}
      </div>
    </div>
  );
};

export default ProjectCard;
