// src/pages/ForgetPasswordPage.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { requestOtp, forgetPassword } from "../Api";

function ForgetPasswordPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
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
      showError("Please enter your email first.");
      return;
    }

    try {
      setIsRequestingOtp(true);
      setMessage("");
      const res = await requestOtp(email);
      // For now, display the OTP code
      showInfo(`OTP sent. Code: ${res.code}`);
    } catch (err) {
      showError(err.message || "Failed to request OTP.");
    } finally {
      setIsRequestingOtp(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (isSubmitting) return;

    setMessage("");

    if (!email || !newPassword || !confirmNewPassword || !otp) {
      showError("Please fill email, new password, confirmation, and OTP.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      showError("New passwords do not match.");
      return;
    }

    if (newPassword.length < 8) {
      showError("New password must be at least 8 characters long.");
      return;
    }

    setIsSubmitting(true);
    try {
      await forgetPassword({
        email: email.trim(),
        new_password: newPassword,
        otp: otp.trim(),
      });

      showInfo("Password changed successfully. Redirecting to login…");
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1000);
    } catch (err) {
      showError(err.message || "Failed to reset password.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const locked = isSubmitting;

  return (
    <div className="login-shell">
      <div className="card login-card">
        <h1 className="card-title">Forgot Password</h1>
        <p className="card-text">
          Reset your password using an OTP sent to your email.
        </p>

        {message && (
          <p className={isError ? "error-text" : "info-text"}>{message}</p>
        )}

        <form onSubmit={handleSubmit} className="form" style={{ marginTop: 8 }}>
          <label className="form-label">
            Email
            <input
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={locked}
              required
            />
          </label>

          <label className="form-label">
            New password
            <input
              className="input"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={locked}
              required
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
              required
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
                required
              />
              <button
                type="button"
                className="btn-secondary"
                onClick={handleRequestOtp}
                disabled={isRequestingOtp || locked || !email}
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

        <p className="card-text" style={{ marginTop: 12 }}>
          Remembered your password?{" "}
          <Link to="/login" className="link-inline">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default ForgetPasswordPage;
