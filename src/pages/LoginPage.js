import React from "react";
import Header from "../components/Header";
import LoginForm from "../components/LoginForm";

export default function LoginPage() {
  return (
    <div className="app">
      <div className="shell">
        <Header />
        <LoginForm />
      </div>
    </div>
  );
}