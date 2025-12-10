import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { login as apiLogin, getCurrentUser } from "../Api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [user, setUser] = useState(null);
  const [authError, setAuthError] = useState("");
  const [loadingUser, setLoadingUser] = useState(false);

  // whenever we have a token, load user info
  useEffect(() => {
    if (!token) {
      setUser(null);
      return;
    }

    async function loadUser() {
      try {
        setLoadingUser(true);
        setAuthError("");
        const info = await getCurrentUser(token);
        setUser(info);
      } catch (err) {
        setAuthError(err.message || "Session expired");
        setUser(null);
        setToken("");
        localStorage.removeItem("token");
      } finally {
        setLoadingUser(false);
      }
    }

    loadUser();
  }, [token]);

  async function loginUser(username, password) {
    try {
      setLoadingUser(true);
      setAuthError("");

      const data = await apiLogin(username, password); // { access_token, ... }

      setToken(data.access_token);
      const me = await getCurrentUser(data.access_token);
      setUser(me);
    } catch (err) {
      // Don’t rethrow – just store the error and reset auth state
      console.error("login error", err);
      if (err.status === 401) {
        setAuthError("Incorrect username or password.");
      } else {
        setAuthError(err.message || "Login failed");
      }
      setToken(null);
      setUser(null);
    } finally {
      setLoadingUser(false);
    }
  }

  async function loginWithAccessToken(accessToken) {
    try {
      setLoadingUser(true);
      setAuthError("");
      setToken(accessToken);
      const me = await getCurrentUser(accessToken);
      setUser(me);
    } catch (err) {
      setAuthError(err.message);
      setToken(null);
      setUser(null);
    } finally {
      setLoadingUser(false);
    }
  }

  function logout() {
    setToken("");
    setUser(null);
    localStorage.removeItem("token");
  }

  function handleApiError(err) {
    if (err && err.status === 401) {
      // session is no longer valid
      setAuthError("Session expired. Please log in again.");
      logout();  // clears token + user
      return true;
    }
    return false;
  } 

  const value = {
    token,
    user,
    authError,
    loadingUser,
    loginUser,
    logout,
    setAuthError,
    handleApiError,
    loginWithAccessToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}