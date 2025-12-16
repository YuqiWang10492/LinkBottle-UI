// src/components/profile/ChangePasswordForm.jsx
import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { requestOtp, changePassword } from "../../Api";

function ChangePasswordForm({ hasPassword, email, onSuccess }) {
  const { token, handleApiError } = useAuth();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [otp, setOtp] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRequestingOtp, setIsRequestingOtp] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  function showError(msg) {
    setMessage(msg);
    setIsError(true);
  }

  function showInfo(msg) {
    setMessage(msg);
    setIsError(false);
  }

  async function handleRequestOtp() {
    if (!email) {
      showError("No email available for OTP.");
      return;
    }

    try {
      setIsRequestingOtp(true);
      setMessage("");
      const res = await requestOtp(email);
      // For now, show the OTP code in the info line
      showInfo(`OTP sent. Code: ${res.code}`);
    } catch (err) {
      if (handleApiError && handleApiError(err)) return;
      showError(err.message || "Failed to request OTP.");
    } finally {
      setIsRequestingOtp(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!token || isSubmitting) return;

    setMessage("");

    if (!otp.trim()) {
      showError("OTP is required.");
      return;
    }

    if (!newPassword || !confirmNewPassword) {
      showError("New password and confirmation are required.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      showError("New passwords do not match.");
      return;
    }

    if (hasPassword && !oldPassword) {
      showError("Old password is required to change your password.");
      return;
    }

    if (newPassword.length < 8) {
      showError("New password must be at least 8 characters long.");
      return;
    }

    setIsSubmitting(true);
    try {
      await changePassword(
        {
          old_password: hasPassword ? oldPassword : undefined,
          new_password: newPassword,
          otp: otp.trim(),
        },
        token
      );
      showInfo("Password changed successfully.");
      setTimeout(() => {
        if (onSuccess) onSuccess();
        }, 600);
    } catch (err) {
      if (handleApiError && handleApiError(err)) return;
      showError(err.message || "Failed to change password.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const locked = isSubmitting;

  return (
    <div className="card link-detail-card">
      <h2 className="card-title">Change Password</h2>
      <p className="card-text">
        {hasPassword
          ? "Update your existing password using an OTP sent to your email."
          : "Set a new password for your account using an OTP sent to your email."}
      </p>

      {message && (
        <p className={isError ? "error-text" : "info-text"}>{message}</p>
      )}

      <form onSubmit={handleSubmit} className="form" style={{ marginTop: 8 }}>
        {hasPassword && (
          <label className="form-label">
            Old password
            <input
              className="input"
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              disabled={locked}
            />
          </label>
        )}

        <label className="form-label">
          New password
          <input
            className="input"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={locked}
          />
        </label>

        <label className="form-label">
          Confirm new password
          <input
            className="input"
            type="password"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            disabled={locked}
          />
        </label>

        <label className="form-label">
          One Time Passcode (OTP)
          <div className="otp-row">
            <input
              className="input"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="6-digit code"
              maxLength={6}
              disabled={locked}
            />
            <button
              type="button"
              className="btn-secondary"
              onClick={handleRequestOtp}
              disabled={isRequestingOtp || locked}
            >
              {isRequestingOtp ? "Sending..." : "Get OTP"}
            </button>
          </div>
        </label>

        <button
          className="btn-primary"
          type="submit"
          disabled={locked}
        >
          {locked ? "Changing password..." : "Change password"}
        </button>
      </form>
    </div>
  );
}

export default ChangePasswordForm;
