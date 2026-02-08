import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../services/api';
import { useAuthStore } from '../stores/authStore';

export default function UserDashboard() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    loadProfile();
    const interval = setInterval(loadProfile, 5000); // Poll every 5s for status changes
    return () => clearInterval(interval);
  }, []);

  const loadProfile = async () => {
    try {
      setError('');
      const response = await userAPI.getProfile();
      setProfile(response.data.user);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        logout();
        navigate('/login');
      } else {
        setError('Failed to load profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  const getStatusColor = (status) => {
    return {
      PENDING: 'status-pending',
      APPROVED: 'status-approved',
      REJECTED: 'status-rejected',
      ACTIVE: 'status-active',
    }[status] || '';
  };

  return (
    <div className="user-container">
      <div className="user-header">
        <h1>Welcome, {profile?.firstName}</h1>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {profile && (
        <div className="profile-card">
          <h2>Your Profile</h2>

          <div className="profile-info">
            <div className="info-group">
              <label>Name</label>
              <p>
                {profile.firstName} {profile.lastName}
              </p>
            </div>

            <div className="info-group">
              <label>Email</label>
              <p>{profile.email}</p>
            </div>

            <div className="info-group">
              <label>Registration Status</label>
              <p className={`status-badge ${getStatusColor(profile.status)}`}>
                {profile.status}
              </p>
            </div>

            <div className="info-group">
              <label>Registered</label>
              <p>{new Date(profile.createdAt).toLocaleDateString()}</p>
            </div>

            {profile.approvedAt && (
              <div className="info-group">
                <label>Approved</label>
                <p>{new Date(profile.approvedAt).toLocaleDateString()}</p>
              </div>
            )}
          </div>

          {profile.status === 'PENDING' && (
            <div className="status-message pending">
              <h3>Awaiting Admin Approval</h3>
              <p>
                Your registration is pending review by an administrator. You
                will be notified when your account is approved.
              </p>
            </div>
          )}

          {profile.status === 'APPROVED' && (
            <div className="status-message approved">
              <h3>Account Approved</h3>
              <p>
                Your account has been approved and is now active. Enjoy full
                access to the platform.
              </p>
            </div>
          )}

          {profile.status === 'REJECTED' && (
            <div className="status-message rejected">
              <h3>Account Rejected</h3>
              <p>
                Unfortunately, your registration was rejected. Please contact
                support for more information.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
