// Sidebar.js — Collapsible with Framer Motion smooth animation
import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";

const SB_W   = 240;
const SB_COL = 68;

const Ic = {
  bolt:    <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"/></svg>,
  grid:    <svg viewBox="0 0 20 20" fill="currentColor"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg>,
  folder:  <svg viewBox="0 0 20 20" fill="currentColor"><path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/></svg>,
  check:   <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>,
  user:    <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/></svg>,
  logout:  <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 01-1 1 1 1 0 01-1-1V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L8.414 10H15a1 1 0 110 2H8.414l2.293 2.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd"/></svg>,
  chevL:   <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd"/></svg>,
  ham:     <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/></svg>,
};

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: Ic.grid   },
  { to: "/projects",  label: "Projects",  icon: Ic.folder },
  { to: "/tasks",     label: "Tasks",     icon: Ic.check  },
  { to: "/profile",   label: "Profile",   icon: Ic.user   },
];

const labelVariants = {
  show: { opacity: 1, x: 0,  transition: { duration: 0.18, delay: 0.05 } },
  hide: { opacity: 0, x: -8, transition: { duration: 0.12 } },
};

const Sidebar = ({ collapsed, onToggle, mobileOpen, onMobileClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = async () => { await logout(); navigate("/login"); };

  return (
    <>
      {/* Mobile backdrop */}
      <div className={`sb-backdrop${mobileOpen ? " on" : ""}`} onClick={onMobileClose} />

      {/* Mobile hamburger */}
      <button className="mobile-ham" onClick={onMobileClose} style={{ display: "flex" }}>
        {Ic.ham}
      </button>

      <motion.aside
        className={`sidebar${mobileOpen ? " mob-open" : ""}`}
        animate={{ width: collapsed ? SB_COL : SB_W }}
        transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
        style={{ overflow: "hidden" }}
      >
        {/* Toggle chevron */}
        <button className="sb-toggle" onClick={onToggle} title={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
          <motion.span animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: 0.28, ease: [0.4,0,0.2,1] }}>
            {Ic.chevL}
          </motion.span>
        </button>

        {/* Logo */}
        <div className="sb-logo">
          <div className="sb-logo-mark">{Ic.bolt}</div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                className="sb-logo-text"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{   opacity: 0, x: -8 }}
                transition={{ duration: 0.18 }}
              >
                TaskFlow
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Nav */}
        <nav className="sb-nav">
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                className="sb-section-lbl"
                variants={labelVariants} initial="hide" animate="show" exit="hide"
              >
                Workspace
              </motion.span>
            )}
          </AnimatePresence>

          {NAV.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              data-tip={label}
              className={({ isActive }) =>
                `sb-item${isActive ? " active" : ""}${collapsed ? " collapsed-tip" : ""}`
              }
              onClick={onMobileClose}
            >
              <span className="sb-icon">{icon}</span>
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    className="sb-label"
                    variants={labelVariants} initial="hide" animate="show" exit="hide"
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="sb-footer">
          <div className="sb-user">
            <div className="sb-avatar">
              <div className="sb-avatar-inner">{user?.name?.charAt(0).toUpperCase()}</div>
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  className="sb-user-info"
                  variants={labelVariants} initial="hide" animate="show" exit="hide"
                >
                  <div className="sb-user-name">{user?.name}</div>
                  <div className="sb-user-role">{user?.role}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            data-tip="Logout"
            className={`sb-item logout${collapsed ? " collapsed-tip" : ""}`}
            onClick={handleLogout}
            style={{ width: "100%", background: "none", border: "none" }}
          >
            <span className="sb-icon">{Ic.logout}</span>
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  className="sb-label"
                  variants={labelVariants} initial="hide" animate="show" exit="hide"
                >
                  Logout
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.aside>
    </>
  );
};

export { SB_W, SB_COL };
export default Sidebar;
