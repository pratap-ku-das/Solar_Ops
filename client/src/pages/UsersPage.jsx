import { useEffect, useState } from "react";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";

const initialForm = {
  name: "",
  email: "",
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

      <div className="card overflow-x-auto">
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
                    <button onClick={() => toggleStatus(member)} className="btn-secondary">
                      {member.isActive ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
