// src/pages/OAuthPage.jsx
import React, { useEffect, useState} from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { oauthCompleteSignup, oauthBindAccount } from "../Api";

function GitHubOAuthPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithAccessToken } = useAuth();

  const status = searchParams.get("status");
  const pendingToken = searchParams.get("pending_token") || "";
  const suggestedUsername = searchParams.get("suggested_username") || "";
  const email = searchParams.get("email") || "";
  const accessToken = searchParams.get("access_token") || "";

  const [username, setUsername] = useState(suggestedUsername);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // If already have access token → log in immediately
  useEffect(() => {
    async function doLogin() {
      if (status === "logged_in" && accessToken) {
        setBusy(true);
        try {
          await loginWithAccessToken(accessToken);
          navigate("/", { replace: true });
        } catch (err) {
          setError(err.message || "Failed to log in");
        } finally {
          setBusy(false);
        }
      }
    }
    doLogin();
  }, [status, accessToken, loginWithAccessToken, navigate]);

  if (status === "logged_in") {
    return (
      <div className="card">
        <h2 className="card-title">Signing you in…</h2>
        {error && <p className="error-text">{error}</p>}
      </div>
    );
  }

  async function handleSignup(e) {
    e.preventDefault();
    if (!pendingToken) return;
    setBusy(true);
    setError("");
    try {
      const res = await oauthCompleteSignup(pendingToken, username);
      await loginWithAccessToken(res.access_token);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message || "Failed to complete signup");
    } finally {
      setBusy(false);
    }
  }

  async function handleBind(e) {
    e.preventDefault();
    if (!pendingToken) return;
    setBusy(true);
    setError("");
    try {
      const res = await oauthBindAccount(pendingToken, password);
      await loginWithAccessToken(res.access_token);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message || "Failed to bind account");
    } finally {
      setBusy(false);
    }
  }

  if (status === "new_user") {
    return (
      <div className="card">
        <h2 className="card-title">Complete your signup</h2>
        <p className="card-text">
          Choose a username to finish creating your account with GitHub.
        </p>
        {error && <p className="error-text">{error}</p>}

        <form onSubmit={handleSignup} className="form">
          <label className="form-label">
            Username
            <input
              className="input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </label>
          <button className="btn-primary" type="submit" disabled={busy}>
            {busy ? "Creating account..." : "Create account"}
          </button>
        </form>
      </div>
    );
  }

  if (status === "link_existing") {
    return (
      <div className="card">
        <h2 className="card-title">Link your account</h2>
        <p className="card-text">
          We found an existing account with <strong>{email}</strong>.  
          Enter your password to link it with GitHub.
        </p>
        {error && <p className="error-text">{error}</p>}

        <form onSubmit={handleBind} className="form">
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
          <button className="btn-primary" type="submit" disabled={busy}>
            {busy ? "Linking..." : "Link account"}
          </button>
        </form>
      </div>
    );
  }

  // Unknown or missing status
  return (
    <div className="card">
      <h2 className="card-title">GitHub sign-in</h2>
      <p className="card-text">
        Something went wrong or this link is invalid. Please try signing in
        again.
      </p>
      <button className="btn-primary" onClick={() => navigate("/login")}>
        Back to login
      </button>
    </div>
  );
}

export default GitHubOAuthPage;