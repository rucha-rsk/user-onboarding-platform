import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../services/api';
import { useAuthStore } from '../stores/authStore';

export default function AdminDashboard() {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      setError('');
      const [usersRes, statsRes] = await Promise.all([
        adminAPI.getPendingUsers(),
        adminAPI.getStats(),
      ]);

      setPendingUsers(usersRes.data.users);
      setStats(statsRes.data.stats);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        logout();
        navigate('/login');
      } else {
        setError('Failed to load data');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId) => {
    try {
      await adminAPI.approveUser(userId);
      setPendingUsers(pendingUsers.filter((u) => u.id !== userId));
    } catch (err) {
      setError('Failed to approve user');
    }
  };

  const handleReject = async (userId) => {
    try {
      await adminAPI.rejectUser(userId);
      setPendingUsers(pendingUsers.filter((u) => u.id !== userId));
    } catch (err) {
      setError('Failed to reject user');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {stats && (
        <div className="stats-section">
          <div className="stat-card">
            <h3>Pending Approvals</h3>
            <p className="stat-value">{stats.pending}</p>
          </div>
        </div>
      )}

      <div className="pending-users-section">
        <h2>Pending User Registrations</h2>

        {pendingUsers.length === 0 ? (
          <p className="empty-message">No pending users</p>
        ) : (
          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Registered</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingUsers.map((user) => (
                <tr key={user.id}>
                  <td>
                    {user.first_name} {user.last_name}
                  </td>
                  <td>{user.email}</td>
                  <td>
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="actions">
                    <button
                      onClick={() => handleApprove(user.id)}
                      className="btn-approve"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(user.id)}
                      className="btn-reject"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
