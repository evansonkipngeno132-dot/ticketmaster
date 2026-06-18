import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import './AdminPanel.css';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('tm_token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetchUsers();
  }, [navigate]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('tm_token');
      const res = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.ok ? await res.json() : [];
      setUsers(data);
    } catch (err) {
      setMessage({ text: 'Error loading users list. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAccess = async (userId) => {
    try {
      const token = localStorage.getItem('tm_token');
      const res = await fetch('/api/admin/users/toggle-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId })
      });
      const data = await res.json();
      if (data.success) {
        setUsers(prev => prev.map(u => u.id === userId ? data.user : u));
        setMessage({ text: data.message, type: 'success' });
        setTimeout(() => setMessage({ text: '', type: '' }), 4000);
      } else {
        setMessage({ text: data.message || 'Action failed', type: 'error' });
      }
    } catch {
      setMessage({ text: 'Something went wrong. Please try again.', type: 'error' });
    }
  };

  return (
    <motion.div
      className="admin-panel-page container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
    >
      <div className="page-header">
        <h1>Admin Control Panel</h1>
        <p>Manage registered user accounts and grant/revoke access permissions</p>
      </div>

      {message.text && (
        <div className={`admin-alert ${message.type}`}>
          {message.text}
        </div>
      )}

      {loading ? (
        <div className="loading-state">Loading user directories...</div>
      ) : (
        <div className="admin-card">
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Full Name</th>
                  <th>Email Address</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} className={user.role === 'admin' ? 'admin-row' : ''}>
                    <td>#{user.id}</td>
                    <td className="user-name-cell">
                      <div className="user-avatar">{user.name.charAt(0).toUpperCase()}</div>
                      <span>{user.name}</span>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`role-badge ${user.role}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${user.approved ? 'approved' : 'pending'}`}>
                        {user.approved ? 'Approved' : 'Pending'}
                      </span>
                    </td>
                    <td>
                      {user.role === 'admin' ? (
                        <span className="admin-action-locked">System Lock</span>
                      ) : (
                        <button
                          onClick={() => handleToggleAccess(user.id)}
                          className={`btn-action-toggle ${user.approved ? 'btn-revoke' : 'btn-approve'}`}
                        >
                          {user.approved ? 'Revoke Access' : 'Allow Access'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default AdminPanel;
