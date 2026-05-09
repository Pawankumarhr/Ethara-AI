const Loader = ({ message = "Loading..." }) => {
  return (
    <div className="card flex items-center gap-3">
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-sky-600" />
      <p className="text-sm text-slate-600">{message}</p>
    </div>
  );
};

export default Loader;
