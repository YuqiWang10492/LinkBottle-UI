// src/pages/ChangePasswordPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getCurrentUser} from "../Api";
import ChangePasswordForm from "../components/profile/ChangePasswordForm";

function ChangePasswordPage() {
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
        <p className="card-text">Loading…</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="card">
        {error ? (
          <p className="error-text">{error}</p>
        ) : (
          <p className="card-text">No profile data.</p>
        )}
        <button
          type="button"
          className="btn-secondary"
          style={{ marginTop: 8 }}
          onClick={() => navigate("/profile")}
        >
          ← Back to profile
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        className="btn-secondary"
        style={{ marginBottom: 12 }}
        onClick={() => navigate("/profile")}
      >
        ← Back to profile
      </button>

      <ChangePasswordForm
        hasPassword={!!profile.has_password}
        email={profile.email}
        onSuccess={() => navigate("/profile")}
      />
    </div>
  );
}

export default ChangePasswordPage;
