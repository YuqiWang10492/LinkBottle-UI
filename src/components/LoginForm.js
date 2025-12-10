import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

import googleLogo from "../assets/google_logo.png";
import githubLogo from "../assets/github_logo.png";
import { API_BASE_URL } from "../config";

function LoginForm() {
  const { loginUser, authError, loadingUser } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    await loginUser(username, password);
  }

  function handleGoogleSignIn() {
    window.location.href = `${API_BASE_URL}/auth/google/login`;
  }

  function handleGithubSignIn() {
  window.location.href = `${API_BASE_URL}/auth/github/login`;
}

  return (
    <div className="login-shell">
      <div className="card login-card">
        <h1 className="card-title">Login</h1>

        {authError && <p className="error-text">{authError}</p>}

        <form onSubmit={handleSubmit} className="form">
          <label className="form-label">
            Username
            <input
              className="input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </label>

          <label className="form-label">
            Password
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          <button className="btn-primary" type="submit" disabled={loadingUser}>
            {loadingUser ? "Logging in..." : "Login"}
          </button>
        </form>

        <button
          type="button"
          className="btn-google"
          onClick={handleGoogleSignIn}
        >
          <img src={googleLogo} alt="Google" className="btn-google-logo" />
          <span>Sign in with Google</span>
        </button>

        <button
          type="button"
          className="btn-github"
          onClick={handleGithubSignIn}
        >
          <img src={githubLogo} alt="GitHub" className="btn-github-logo" />
          <span>Sign in with GitHub</span>
        </button>
      </div>
    </div>
  );
}

export default LoginForm;