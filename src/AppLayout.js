// src/layout/AppLayout.jsx
import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import Header from "./components/Header";

function AppLayout() {
  return (
    <div className="app">
      <div className="shell-layout">
        <aside className="sidebar">
          <div className="sidebar-logo">
            <div className="sidebar-icon">🔗</div>
            <div className="sidebar-title">LinkBottle</div>
          </div>
          <nav className="sidebar-nav">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                "sidebar-link" + (isActive ? " sidebar-link-active" : "")
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/bulk"
              className={({ isActive }) =>
                "sidebar-link" + (isActive ? " sidebar-link-active" : "")
              }
            >
              Bulk Upload
            </NavLink>
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                "sidebar-link" + (isActive ? " sidebar-link-active" : "")
              }
            >
              Profile
            </NavLink>
          </nav>
        </aside>

        <div className="main-content">
          <Header />
          <div className="page-content">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AppLayout;
