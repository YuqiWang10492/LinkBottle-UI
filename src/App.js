// App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import AppLayout from "./AppLayout";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import BulkUploadPage from "./pages/BulkUploadPage";
import LinkDetailPage from "./pages/LinkDetailPage";
import GoogleOAuthPage from "./pages/GoogleOAuthPage";
import GitHubOAuthPage from "./pages/GitHubOAuthPage";
import ProfilePage from "./pages/ProfilePage";
import SignupPage from "./pages/SignupPage";
import ChangePasswordPage from "./pages/ChangePasswordPage";
import ForgetPasswordPage from "./pages/ForgetPasswordPage";

function App() {
  const { token, user } = useAuth();

  // If not logged in -> login page only
  if (!token || !user) {
    return (
      <Routes>
        <Route path="/oauth/google" element={<GoogleOAuthPage />} />
        <Route path="/oauth/github" element={<GitHubOAuthPage />} />
        <Route path="/forgot-password" element={<ForgetPasswordPage />} />
        <Route path="*" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Routes>
    );
  }

  // Logged in -> show layout with nested routes
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="bulk" element={<BulkUploadPage />} />
        <Route path="link/:id" element={<LinkDetailPage />} />
        <Route path="profile" element={<ProfilePage />} /> 
        <Route path="profile/password" element={<ChangePasswordPage />} />
        {/* fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
