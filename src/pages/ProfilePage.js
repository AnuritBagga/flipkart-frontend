import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import './ProfilePage.css';

const ProfilePage = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [signing, setSigning] = useState(false);

  if (!user) { navigate('/auth'); return null; }

  const handleSignOut = async () => {
    setSigning(true);
    await signOut();
    navigate('/');
  };

  const name = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
  const email = user.email;
  const phone = user.phone;
  const avatar = user.user_metadata?.avatar_url;

  const menuItems = [
    { icon: '📦', label: 'My Orders', path: '/orders' },
    { icon: '🤍', label: 'My Wishlist', path: '/wishlist' },
    { icon: '🏠', label: 'My Addresses', path: '/orders' },
    { icon: '🤖', label: 'AI Assistant', path: '/ai-assistant' },
  ];

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Left Sidebar */}
        <div className="profile-sidebar">
          <div className="profile-user-info">
            {avatar ? (
              <img src={avatar} alt={name} className="profile-avatar" />
            ) : (
              <div className="profile-avatar-placeholder">
                {name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <div className="profile-greeting">Hello,</div>
              <div className="profile-name">{name}</div>
            </div>
          </div>

          <nav className="profile-nav">
            {menuItems.map(item => (
              <Link key={item.label} to={item.path} className="profile-nav-item">
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
            <button className="profile-nav-item logout" onClick={handleSignOut} disabled={signing}>
              <span>🚪</span>
              <span>{signing ? 'Signing out...' : 'Logout'}</span>
            </button>
          </nav>
        </div>

        {/* Right: Profile Details */}
        <div className="profile-main">
          <h2 className="profile-section-title">Personal Information</h2>
          <div className="profile-card">
            <div className="profile-field">
              <label>Full Name</label>
              <div className="profile-value">{name}</div>
            </div>
            {email && (
              <div className="profile-field">
                <label>Email Address</label>
                <div className="profile-value">{email}</div>
              </div>
            )}
            {phone && (
              <div className="profile-field">
                <label>Mobile Number</label>
                <div className="profile-value">{phone}</div>
              </div>
            )}
            <div className="profile-field">
              <label>Account Created</label>
              <div className="profile-value">
                {new Date(user.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
