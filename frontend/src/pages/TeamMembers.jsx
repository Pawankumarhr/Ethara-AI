import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import Loader from "../components/Loader";
import toast from "react-hot-toast";

export default function TeamMembers() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editingRole, setEditingRole] = useState("");
  const [deleting, setDeleting] = useState(false);

  // Redirect non-admin users
  useEffect(() => {
    if (user && user.role !== "Admin") {
      navigate("/dashboard");
      toast.error("Admin access required");
    }
  }, [user, navigate]);

  // Fetch all team members
  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await api.get("/users");
      setMembers(response.data.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch team members");
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEditRole = (memberId, currentRole) => {
    setEditingId(memberId);
    setEditingRole(currentRole);
  };

  const handleSaveRole = async (memberId) => {
    try {
      setDeleting(true);
      await api.put("/users/role", {
        userId: memberId,
        role: editingRole,
      });

      setMembers(
        members.map((m) =>
          m.id === memberId ? { ...m, role: editingRole } : m
        )
      );

      toast.success("Role updated successfully");
      setEditingId(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update role");
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteMember = async (memberId, memberName) => {
    if (!window.confirm(`Are you sure you want to remove ${memberName}?`)) {
      return;
    }

    try {
      setDeleting(true);
      await api.delete(`/users/${memberId}`);

      setMembers(members.filter((m) => m.id !== memberId));
      toast.success("Member removed successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to remove member");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            👥 Team Members
          </h1>
          <p className="text-lg text-gray-600">
            Manage your team and assign roles
          </p>
        </div>

        {/* Team Members Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Members</p>
                <p className="text-4xl font-bold text-gray-900 mt-2">{members.length}</p>
              </div>
              <span className="text-5xl">👥</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Admins</p>
                <p className="text-4xl font-bold text-gray-900 mt-2">
                  {members.filter((m) => m.role === "Admin").length}
                </p>
              </div>
              <span className="text-5xl">🔑</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Members</p>
                <p className="text-4xl font-bold text-gray-900 mt-2">
                  {members.filter((m) => m.role === "Member").length}
                </p>
              </div>
              <span className="text-5xl">👤</span>
            </div>
          </div>
        </div>

        {/* Team Members Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                  <th className="px-6 py-4 text-left text-sm font-semibold">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Role</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Joined</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member, idx) => (
                  <tr
                    key={member.id}
                    className={`border-b transition-colors hover:bg-gray-50 ${
                      idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white font-bold">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-900">{member.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{member.email}</td>
                    <td className="px-6 py-4">
                      {editingId === member.id ? (
                        <select
                          value={editingRole}
                          onChange={(e) => setEditingRole(e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="Admin">🔑 Admin</option>
                          <option value="Member">👤 Member</option>
                        </select>
                      ) : (
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            member.role === "Admin"
                              ? "bg-green-100 text-green-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {member.role === "Admin" ? "🔑 Admin" : "👤 Member"}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm">
                      {member.joinedDate
                        ? new Date(member.joinedDate).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {editingId === member.id ? (
                          <>
                            <button
                              onClick={() => handleSaveRole(member.id)}
                              disabled={deleting}
                              className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors text-sm font-medium"
                            >
                              ✓ Save
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              disabled={deleting}
                              className="px-3 py-1 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 disabled:opacity-50 transition-colors text-sm font-medium"
                            >
                              ✕ Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEditRole(member.id, member.role)}
                              disabled={deleting}
                              className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors text-sm font-medium"
                            >
                              ✎ Edit
                            </button>
                            {user?.id !== member.id && (
                              <button
                                onClick={() => handleDeleteMember(member.id, member.name)}
                                disabled={deleting}
                                className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors text-sm font-medium"
                              >
                                🗑 Remove
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {members.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No team members found</p>
            </div>
          )}
        </div>

        {/* Back Button */}
        <div className="mt-8">
          <button
            onClick={() => navigate("/dashboard")}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
