import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import Sidebar, { SB_W, SB_COL } from "./components/layout/Sidebar";

import LoginPage     from "./pages/LoginPage";
import RegisterPage  from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import ProjectsPage  from "./pages/ProjectsPage";
import TasksPage     from "./pages/TasksPage";
import ProfilePage   from "./pages/ProfilePage";
import NotFoundPage  from "./pages/NotFoundPage";

const HamIcon = () => (
  <svg viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
  </svg>
);

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  enter:   { opacity: 1, y: 0, transition: { duration: 0.28, ease: [0.4,0,0.2,1] } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.18 } },
};

const AppShell = ({ children }) => {
  const [collapsed,  setCollapsed]  = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile,   setIsMobile]   = useState(window.innerWidth < 900);

  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  useEffect(() => { if (!isMobile) setMobileOpen(false); }, [isMobile]);

  const ml = isMobile ? 0 : collapsed ? SB_COL : SB_W;

  return (
    <div className="app-shell">
      {isMobile && (
        <button className="mobile-ham" onClick={() => setMobileOpen(o => !o)}>
          <HamIcon />
        </button>
      )}
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(c => !c)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <motion.main
        className="main-content"
        animate={{ marginLeft: ml }}
        transition={{ duration: 0.28, ease: [0.4,0,0.2,1] }}
      >
        <div className="page-wrap">
          <motion.div
            key={window.location.pathname}
            variants={pageVariants}
            initial="initial"
            animate="enter"
            exit="exit"
          >
            {children}
          </motion.div>
        </div>
      </motion.main>
    </div>
  );
};

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();
  const wrap = (Page) => (
    <ProtectedRoute><AppShell><Page /></AppShell></ProtectedRoute>
  );
  return (
    <Routes>
      <Route path="/login"     element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/register"  element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage />} />
      <Route path="/dashboard" element={wrap(DashboardPage)} />
      <Route path="/projects"  element={wrap(ProjectsPage)} />
      <Route path="/tasks"     element={wrap(TasksPage)} />
      <Route path="/profile"   element={wrap(ProfilePage)} />
      <Route path="/"          element={<Navigate to="/dashboard" replace />} />
      <Route path="*"          element={<NotFoundPage />} />
    </Routes>
  );
};

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  </BrowserRouter>
);

export default App;
