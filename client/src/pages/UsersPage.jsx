import { useEffect, useState } from "react";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";
import { Edit, Trash2, X } from "lucide-react";

const initialForm = {
  name: "",  email: "",
  password: "",
  role: "bdm",
  phone: "",
  designation: ""
};

export default function UsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editMessage, setEditMessage] = useState("");
  const isAdmin = user?.role === "admin";

  const fetchUsers = async () => {
    try {
      const { data } = await api.get("/users");
      setUsers(data);
    } catch {
      setUsers([]);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");

    try {
      await api.post("/users", form);
      setForm(initialForm);
      setMessage("Team member created successfully.");
      fetchUsers();
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to create user.");
    }
  };

  const toggleStatus = async (targetUser) => {
    await api.put(`/users/${targetUser.id || targetUser._id}/status`, { isActive: !targetUser.isActive });
    fetchUsers();
  };

  const deleteUser = async (targetUser) => {
    const confirmed = window.confirm(`Delete ${targetUser.name}? This cannot be undone.`);
    if (!confirmed) return;

    try {
      await api.delete(`/users/${targetUser.id || targetUser._id}`);
      setMessage("User deleted successfully.");
      fetchUsers();
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to delete user.");
    }
  };

  const openEditModal = (targetUser) => {
    setEditingUser(targetUser);
    setEditForm({
      name: targetUser.name,
      phone: targetUser.phone || "",
      designation: targetUser.designation || "",
      role: targetUser.role
    });
    setEditMessage("");
  };

  const closeEditModal = () => {
    setEditingUser(null);
    setEditForm({});
    setEditMessage("");
  };

  const handleEditSubmit = async (event) => {
    event.preventDefault();
    setEditMessage("");

    if (!editForm.name.trim()) {
      setEditMessage("Name is required.");
      return;
    }

    try {
      await api.put(`/users/${editingUser.id || editingUser._id}`, editForm);
      setEditMessage("User updated successfully.");
      fetchUsers();
      closeEditModal();
    } catch (error) {
      setEditMessage(error.response?.data?.message || "Unable to update user.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <h3 className="text-lg font-semibold">Team Management</h3>
        <p className="mt-1 text-sm text-slate-500">Manage admin, operations, and BDM user access for your company.</p>
      </div>

      {isAdmin ? (
        <form onSubmit={handleSubmit} className="card grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <input className="input" placeholder="Full name" value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} required />
          <input className="input" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} required />
          <input className="input" type="password" placeholder="Temporary password" value={form.password} onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))} required />
          <select className="input" value={form.role} onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}>
            <option value="admin">Admin</option>
            <option value="operations">Operations</option>
            <option value="bdm">BDM</option>
          </select>
          <input className="input" placeholder="Phone number" value={form.phone} onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))} />
          <input className="input" placeholder="Designation" value={form.designation} onChange={(e) => setForm((prev) => ({ ...prev, designation: e.target.value }))} />
          <div className="xl:col-span-3 flex items-center justify-between gap-3">
            <p className={`text-sm ${message.includes("success") ? "text-emerald-600" : "text-slate-500"}`}>{message}</p>
            <button className="btn-primary" type="submit">Add Team Member</button>
          </div>
        </form>
      ) : (
        <div className="card text-sm text-slate-600">Only admins can create or deactivate team accounts.</div>
      )}

      <div className="space-y-3 md:hidden">
        {users.map((member) => (
          <div key={member.id || member._id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-900">{member.name}</p>
                <p className="mt-1 text-sm text-slate-600">{member.email}</p>
                <p className="text-xs uppercase tracking-wide text-slate-500">{member.role}</p>
              </div>
              <span className={`badge ${member.isActive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                {member.isActive ? "Active" : "Inactive"}
              </span>
            </div>

            <div className="mt-3 text-sm text-slate-600">
              <p>Phone: {member.phone || "—"}</p>
              <p>Designation: {member.designation || "—"}</p>
            </div>

            {isAdmin ? (
              <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
                <button type="button" onClick={() => openEditModal(member)} className="inline-flex items-center justify-center gap-1 rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100">
                  <Edit size={16} />
                  Edit
                </button>
                <button type="button" onClick={() => toggleStatus(member)} className="btn-secondary">
                  {member.isActive ? "Deactivate" : "Activate"}
                </button>
                {String(member.id || member._id) !== String(user?.id) ? (
                  <button
                    type="button"
                    onClick={() => deleteUser(member)}
                    className="inline-flex items-center justify-center gap-1 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
        ))}
      </div>

      <div className="card hidden overflow-x-auto md:block">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Role</th>
              <th className="px-3 py-2">Contact</th>
              <th className="px-3 py-2">Designation</th>
              <th className="px-3 py-2">Status</th>
              {isAdmin ? <th className="px-3 py-2">Action</th> : null}
            </tr>
          </thead>
          <tbody>
            {users.map((member) => (
              <tr key={member.id || member._id} className="border-t border-slate-200">
                <td className="px-3 py-3 font-medium">{member.name}<br /><span className="text-xs text-slate-500">{member.email}</span></td>
                <td className="px-3 py-3 uppercase">{member.role}</td>
                <td className="px-3 py-3">{member.phone || "—"}</td>
                <td className="px-3 py-3">{member.designation || "—"}</td>
                <td className="px-3 py-3">
                  <span className={`badge ${member.isActive ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                    {member.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                {isAdmin ? (
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => openEditModal(member)} className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-700 hover:bg-blue-100">
                        <Edit size={16} />
                        Edit
                      </button>
                      <button onClick={() => toggleStatus(member)} className="btn-secondary">
                        {member.isActive ? "Deactivate" : "Activate"}
                      </button>
                      {String(member.id || member._id) !== String(user?.id) ? (
                        <button
                          onClick={() => deleteUser(member)}
                          className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-3 py-1.5 text-sm font-semibold text-red-700 hover:bg-red-100"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      ) : null}
                    </div>
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-slate-200 sm:min-w-96">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Edit Team Member</h3>
              <button onClick={closeEditModal} className="text-slate-500 hover:text-slate-700">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Full Name</label>
                <input
                  className="input"
                  value={editForm.name || ""}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Phone</label>
                <input
                  className="input"
                  value={editForm.phone || ""}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, phone: e.target.value }))}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Designation</label>
                <input
                  className="input"
                  value={editForm.designation || ""}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, designation: e.target.value }))}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Role</label>
                <select
                  className="input"
                  value={editForm.role || "bdm"}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, role: e.target.value }))}
                >
                  <option value="admin">Admin</option>
                  <option value="operations">Operations</option>
                  <option value="bdm">BDM</option>
                </select>
              </div>

              {editMessage && (
                <div className={`rounded-lg px-4 py-3 text-sm ${editMessage.includes("success") ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" : "bg-red-50 text-red-700 ring-1 ring-red-200"}`}>
                  {editMessage}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={closeEditModal} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
