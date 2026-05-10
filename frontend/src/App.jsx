import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import { useAuth } from "./context/AuthContext";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import ProjectDetails from "./pages/ProjectDetails";
import Projects from "./pages/Projects";
import Register from "./pages/Register";
import Tasks from "./pages/Tasks";
import TeamMembers from "./pages/TeamMembers";

const ProtectedRoute = ({ children, roles }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles?.length && !roles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const ProtectedPage = ({ children, roles }) => (
  <ProtectedRoute roles={roles}>
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto flex max-w-7xl gap-5 p-4">
        <Sidebar />
        <div className="flex-1">
          <Navbar />
          <main>{children}</main>
        </div>
      </div>
    </div>
  </ProtectedRoute>
);

const App = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedPage>
            <Dashboard />
          </ProtectedPage>
        }
      />

      <Route
        path="/projects"
        element={
          <ProtectedPage>
            <Projects />
          </ProtectedPage>
        }
      />

      <Route
        path="/projects/:id"
        element={
          <ProtectedPage>
            <ProjectDetails />
          </ProtectedPage>
        }
      />

      <Route
        path="/tasks"
        element={
          <ProtectedPage>
            <Tasks />
          </ProtectedPage>
        }
      />

      <Route
        path="/team"
        element={
          <ProtectedPage roles={["Admin"]}>
            <TeamMembers />
          </ProtectedPage>
        }
      />

      <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
    </Routes>
  );
};

export default App;
