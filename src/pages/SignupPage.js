// src/pages/SignupPage.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { requestOtp, createUser } from "../Api";
import { useAuth } from "../context/AuthContext";

function deriveUsernameFromEmail(email) {
  if (!email || !email.includes("@")) return "";

  const base = email.split("@")[0];
  // Allowed: letters, numbers, _ and -
  let cleaned = base.replace(/[^A-Za-z0-9_-]/g, "_");

  // length 3–30
  if (cleaned.length < 3) {
    cleaned = (cleaned + "___").slice(0, 3);
  } else if (cleaned.length > 30) {
    cleaned = cleaned.slice(0, 30);
  }

  return cleaned;
}

function SignupPage() {
  const navigate = useNavigate();
  const { loginUser } = useAuth();

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRequestingOtp, setIsRequestingOtp] = useState(false);
  const [message, setMessage] = useState("");       // shared info/error area
  const [messageIsError, setMessageIsError] = useState(false);
  
  function showError(msg) {
    setMessage(msg);
    setMessageIsError(true);
  }

  function showInfo(msg) {
    setMessage(msg);
    setMessageIsError(false);
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
      // For now, show the OTP code in the same place as error
      showInfo(`OTP sent. Code: ${res.code}`);
    } catch (err) {
      showError(err.message || "Failed to request OTP code.");
    } finally {
      setIsRequestingOtp(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (isSubmitting) return;

    setMessage("");

    if (!email || !password || !confirmPassword || !otp) {
      showError("Please fill in email, password, confirm password, and OTP.");
      return;
    }

    if (password !== confirmPassword) {
      showError("Passwords do not match.");
      return;
    }

    let finalUsername = username.trim();
    if (!finalUsername) {
      finalUsername = deriveUsernameFromEmail(email.trim());
    }

    setIsSubmitting(true);
    try {
      const body = {
        username: finalUsername,
        email: email.trim(),
        first_name: firstName.trim() || null,
        last_name: lastName.trim() || null,
        password,
        phone_number: phoneNumber.trim() || null,
        otp: otp.trim(),
      };

      await createUser(body);

    // ✅ Account created – now automatically sign in
    showInfo("Account created. Signing you in...");
    await loginUser(finalUsername, password);

    // If login succeeds, App will re-render to Dashboard.
    // Optionally push to "/" explicitly:
    navigate("/", { replace: true });
    } catch (err) {
        showError(err.message || "Failed to create account.");
    } finally {
        setIsSubmitting(false);
    }
  }

  const isFormLocked = isSubmitting;

  return (
    <div className="login-shell">
      <div className="card login-card">
        <h1 className="card-title">Create Account</h1>
        <p className="card-text">
          Only email, password, confirm password, and OTP are required.  
          You can add other details anytime later.
        </p>

        {message && (
          <p className={messageIsError ? "error-text" : "info-text"}>
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit} className="form">
          <label className="form-label">
            Email *
            <input
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isFormLocked}
            />
          </label>

          <label className="form-label">
            Username (optional)
            <input
              className="input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Leave blank to auto-generate from email"
              disabled={isFormLocked}
            />
          </label>

          <label className="form-label">
            First name (optional)
            <input
              className="input"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              disabled={isFormLocked}
            />
          </label>

          <label className="form-label">
            Last name (optional)
            <input
              className="input"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              disabled={isFormLocked}
            />
          </label>

          <label className="form-label">
            Phone number (optional)
            <input
              className="input"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              disabled={isFormLocked}
            />
          </label>

          <label className="form-label">
            Password *
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isFormLocked}
            />
          </label>

          <label className="form-label">
            Confirm Password *
            <input
              className="input"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={isFormLocked}
            />
          </label>

          <label className="form-label">
            One Time Passcode (OTP)*
            <div className="otp-row">
              <input
                className="input"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="6-digit code"
                maxLength={6}
                disabled={isFormLocked}
                required
              />
              <button
                type="button"
                className="btn-secondary"
                onClick={handleRequestOtp}
                disabled={isRequestingOtp || !email || isFormLocked}
              >
                {isRequestingOtp ? "Sending..." : "Get OTP"}
              </button>
            </div>
          </label>

          <button
            className="btn-primary"
            type="submit"
            disabled={isFormLocked}
          >
            {isFormLocked ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="card-text" style={{ marginTop: 12 }}>
          Already have an account?{" "}
          <Link to="/login" className="link-inline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default SignupPage;
