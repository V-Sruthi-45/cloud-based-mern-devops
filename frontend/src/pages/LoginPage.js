import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import Alert from "../components/common/Alert";

const BoltSVG = () => (
  <svg viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"/>
  </svg>
);

const LoginPage = () => {
  const { login, isAuthenticated, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard";
  const [form,    setForm]    = useState({ email:"", password:"" });
  const [loading, setLoading] = useState(false);
  const [alert,   setAlert]   = useState(null);

  useEffect(() => { if (isAuthenticated) navigate(from, { replace:true }); }, [isAuthenticated]);
  useEffect(() => { if (error) { setAlert({ type:"error", message:error }); clearError(); } }, [error]);

  const onChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    if (!form.email || !form.password) { setAlert({ type:"error", message:"Please fill in all fields." }); return; }
    setLoading(true);
    try { await login(form.email, form.password); }
    catch (err) { setAlert({ type:"error", message:err.message }); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <motion.div
        className="auth-card"
        initial={{ opacity:0, y:24, scale:0.98 }}
        animate={{ opacity:1, y:0,  scale:1   }}
        transition={{ duration:0.38, ease:[0.4,0,0.2,1] }}
      >
        <div className="auth-logo-row">
          <div className="auth-logo-ico"><BoltSVG /></div>
          <span className="auth-logo-name">TaskFlow</span>
        </div>
        <h1 className="auth-heading">Welcome back</h1>
        <p className="auth-sub">Sign in to your workspace</p>

        {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

        <form className="auth-form" onSubmit={onSubmit}>
          <div className="form-group">
            <label className="form-lbl">Email address</label>
            <input className="form-input" type="email" name="email" value={form.email}
              onChange={onChange} placeholder="you@example.com" autoComplete="email" required />
          </div>
          <div className="form-group">
            <label className="form-lbl">Password</label>
            <input className="form-input" type="password" name="password" value={form.password}
              onChange={onChange} placeholder="••••••••" autoComplete="current-password" required />
          </div>
          <motion.button
            type="submit" className="btn btn-primary btn-full"
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.01 }}
            whileTap={{   scale: loading ? 1 : 0.98 }}
            style={{ marginTop:4 }}
          >
            {loading ? "Signing in…" : "Sign in"}
          </motion.button>
        </form>
        <p className="auth-foot">Don't have an account? <Link to="/register">Create one free</Link></p>
      </motion.div>
    </div>
  );
};

export default LoginPage;
