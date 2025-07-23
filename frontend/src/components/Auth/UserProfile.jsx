import React from 'react';
import useAuth from '../../hooks/useAuth';
import './UserProfile.css';

const UserProfile = () => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  if (!user) return null;

  return (
    <div className="user-profile">
      <div className="user-info">
        {user.user_metadata?.avatar_url && (
          <img 
            src={user.user_metadata.avatar_url} 
            alt="User avatar" 
            className="user-avatar"
          />
        )}
        <span className="user-name">
          {user.user_metadata?.full_name || user.email || 'User'}
        </span>
      </div>
      <button className="sign-out-button" onClick={handleSignOut}>
        <i className="fas fa-sign-out-alt"></i>
        Sign Out
      </button>
    </div>
  );
};

export default UserProfile;