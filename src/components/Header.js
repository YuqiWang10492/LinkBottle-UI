import React from "react";
import { useAuth } from "../context/AuthContext";

function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="hero">
      <div className="hero-icon">🔗</div>
      <h1 className="hero-title">LinkBottle</h1>
      <p className="hero-subtitle">
        Create short, memorable links in seconds
      </p>

      {user && (
        <div className="hero-welcome">
          <span>Welcome, {user.username}</span>
          <button className="btn-secondary" onClick={logout}>
            Logout
          </button>
        </div>
      )}
    </header>
  );
}

export default Header;