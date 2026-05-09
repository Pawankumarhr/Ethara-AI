const statusBadge = {
  PENDING: "bg-amber-100 text-amber-700",
  IN_PROGRESS: "bg-sky-100 text-sky-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
};

const TaskCard = ({ task, onStatusChange, onDelete, canDelete }) => {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-semibold text-slate-900">{task.title}</p>
          <p className="text-xs text-slate-500">{task.project?.title || "No project"}</p>
        </div>
        <span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusBadge[task.status] || "bg-slate-100 text-slate-700"}`}>
          {task.status}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <span>Priority: {task.priority}</span>
        <span>Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "-"}</span>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <select className="input w-44" value={task.status} onChange={(e) => onStatusChange(task.id, e.target.value)}>
          <option value="PENDING">PENDING</option>
          <option value="IN_PROGRESS">IN_PROGRESS</option>
          <option value="COMPLETED">COMPLETED</option>
        </select>
        {canDelete && (
          <button className="btn bg-rose-600 text-white hover:bg-rose-700" onClick={() => onDelete(task.id)}>
            Delete
          </button>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
