import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';

export const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    email: '',
    role: 'LEGAL_OFFICER',
    department: 'Legal Department',
    status: 'ACTIVE',
  });
  const [msg, setMsg] = useState('');

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await api.getUsers();
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const created = await api.createUser(formData);
      setUsers((prev) => [...prev, created]);
      setMsg(`User ${created.username} created successfully.`);
      setFormData({
        username: '',
        name: '',
        email: '',
        role: 'LEGAL_OFFICER',
        department: 'Legal Department',
        status: 'ACTIVE',
      });
    } catch (err) {
      alert('Failed to create user');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Are you sure you want to delete user ${id}?`)) return;
    try {
      await api.deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      setMsg('User deleted successfully.');
    } catch (err) {
      alert('Failed to delete user');
    }
  };

  const columns = [
    { header: 'User ID', key: 'id' },
    { header: 'Username', render: (row) => <strong>{row.username}</strong> },
    { header: 'Full Official Name', key: 'name' },
    { header: 'Email Address', key: 'email' },
    { header: 'Assigned Role', render: (row) => <code>{row.role}</code> },
    { header: 'Department', key: 'department' },
    { header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      header: 'Actions',
      render: (row) => (
        <button type="button" onClick={() => handleDelete(row.id)}>
          Delete User
        </button>
      ),
    },
  ];

  return (
    <article>
      <header>
        <h2>User Account &amp; Access Administration</h2>
        <p>Manage government officer credentials, roles, and administrative departments</p>
      </header>

      {msg && (
        <aside>
          <p>
            <strong>Notice:</strong> {msg}
          </p>
        </aside>
      )}

      {/* Form to add user */}
      <section>
        <form onSubmit={handleCreate}>
          <fieldset>
            <legend>Provision New System User</legend>

            <div>
              <label htmlFor="uname">Username: </label>
              <input
                id="uname"
                name="username"
                type="text"
                placeholder="e.g. adv_desai or sec_law"
                value={formData.username}
                onChange={handleChange}
                required
              />
              {' '}
              <label htmlFor="fullname">Full Official Name: </label>
              <input
                id="fullname"
                name="name"
                type="text"
                placeholder="e.g. Smt. Ananya Desai"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <br />

            <div>
              <label htmlFor="uemail">Official Government Email: </label>
              <input
                id="uemail"
                name="email"
                type="email"
                placeholder="e.g. ananya.desai@gujarat.gov.in"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <br />

            <div>
              <label htmlFor="urole">Assigned Role: </label>
              <select id="urole" name="role" value={formData.role} onChange={handleChange}>
                <option value="ADVOCATE">ADVOCATE</option>
                <option value="LEGAL_OFFICER">LEGAL_OFFICER</option>
                <option value="BILL_PREPARER">BILL_PREPARER</option>
                <option value="VERIFIER">VERIFIER</option>
                <option value="APPROVER">APPROVER</option>
                <option value="FINANCE_OFFICER">FINANCE_OFFICER</option>
                <option value="DEPARTMENT_HEAD">DEPARTMENT_HEAD</option>
                <option value="ADMIN">ADMIN</option>
                <option value="AUDITOR">AUDITOR</option>
              </select>
              {' '}
              <label htmlFor="udept">Department: </label>
              <input
                id="udept"
                name="department"
                type="text"
                value={formData.department}
                onChange={handleChange}
                required
              />
            </div>

            <br />

            <button type="submit">Create User Account</button>
          </fieldset>
        </form>
      </section>

      <br />

      {/* Table */}
      <section>
        <header>
          <h3>Active User Directory</h3>
        </header>
        {loading ? <p>Loading users...</p> : <DataTable columns={columns} data={users} />}
      </section>
    </article>
  );
};

export default UserManagementPage;
