import { useState } from "react";

const initialForm = {
  firstName: "",
  lastName: "",
  fullName: "",
  email: "",
  username: "",
  password: "",
  phone: "",
  officeNumber: "",
  jobTitle: "Technician",
  region: "",
  notes: "",
  roleId: 2,
};

export function UsersPage({ users, onCreateUser, onDeleteUser, loading }) {
  const [form, setForm] = useState(initialForm);

  const submit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      fullName: form.fullName || `${form.firstName} ${form.lastName}`.trim(),
    };
    await onCreateUser(payload);
    setForm(initialForm);
  };

  return (
    <section className="card">
      <h2>Users</h2>
      <form className="grid-form three-col" onSubmit={submit}>
        <label>
          First Name
          <input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
        </label>
        <label>
          Last Name
          <input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
        </label>
        <label>
          Username
          <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
        </label>
        <label>
          Email
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        </label>
        <label>
          Password
          <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        </label>
        <label>
          Office Number
          <input value={form.officeNumber} onChange={(e) => setForm({ ...form, officeNumber: e.target.value })} />
        </label>
        <button type="submit" disabled={loading}>
          Add User
        </button>
      </form>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.fullName || `${user.firstName || ""} ${user.lastName || ""}`.trim()}</td>
              <td>{user.email}</td>
              <td>{user.role?.name || user.jobTitle || "-"}</td>
              <td>
                <button className="danger" onClick={() => onDeleteUser(user.id)} disabled={loading}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

