// src/pages/ProfilePage.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getCurrentUser } from "../Api";
import { useNavigate } from "react-router-dom";

function ProfilePage() {
  const { token, handleApiError } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;

    async function loadProfile() {
      try {
        setLoading(true);
        setError("");
        const data = await getCurrentUser(token);
        setProfile(data);
      } catch (err) {
        if (handleApiError && handleApiError(err)) return;
        setError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [token, handleApiError]);

  if (loading) {
    return (
      <div className="card">
        <p className="card-text">Loading profile…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <p className="error-text">{error}</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="card">
        <p className="card-text">No profile data.</p>
      </div>
    );
  }

  const {
    username,
    first_name,
    last_name,
    phone_number,
    email,
    has_google_auth,
    has_github_auth,
  } = profile;

  const isGoogleLinked = !!has_google_auth;
  const isGithubLinked = !!has_github_auth;

  return (
    <div className="card profile-card">
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
        <div>
          <h2 className="card-title">Profile</h2>
          <p className="card-text">
            View your account information and linked sign-in methods.
          </p>
        </div>
        <button
          type="button"
          className="btn-primary"
          onClick={() => navigate("/profile/password")}
        >
          Change password
        </button>
      </div>

      <div className="profile-grid" style={{ marginTop: 16 }}>
        <div className="profile-section">
          <h3 className="profile-section-title">Basic Info</h3>
          <div className="profile-row">
            <span className="profile-label">Username</span>
            <span className="profile-value">{username}</span>
          </div>
          <div className="profile-row">
            <span className="profile-label">First name</span>
            <span className="profile-value">{first_name || "—"}</span>
          </div>
          <div className="profile-row">
            <span className="profile-label">Last name</span>
            <span className="profile-value">{last_name || "—"}</span>
          </div>
          <div className="profile-row">
            <span className="profile-label">Email</span>
            <span className="profile-value">{email || "—"}</span>
          </div>
          <div className="profile-row">
            <span className="profile-label">Phone</span>
            <span className="profile-value">{phone_number || "—"}</span>
          </div>
        </div>

        <div className="profile-section">
          <h3 className="profile-section-title">Linked Accounts</h3>

          <div className="profile-row">
            <span className="profile-label">Google</span>
            <span className="profile-value">
              <span
                className={
                  "link-chip " + (isGoogleLinked ? "link-chip-yes" : "link-chip-no")
                }
              >
                {isGoogleLinked ? "Linked" : "Not linked"}
              </span>
            </span>
          </div>

          <div className="profile-row">
            <span className="profile-label">GitHub</span>
            <span className="profile-value">
              <span
                className={
                  "link-chip " + (isGithubLinked ? "link-chip-yes" : "link-chip-no")
                }
              >
                {isGithubLinked ? "Linked" : "Not linked"}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;