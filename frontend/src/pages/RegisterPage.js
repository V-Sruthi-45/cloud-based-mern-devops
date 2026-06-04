import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import Alert from "../components/common/Alert";

const BoltSVG = () => (
  <svg viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd"/>
  </svg>
);

const RegisterPage = () => {
  const { register, isAuthenticated, error, clearError } = useAuth();
  const navigate = useNavigate();
  const [form,    setForm]    = useState({ name:"", email:"", password:"", confirm:"" });
  const [loading, setLoading] = useState(false);
  const [alert,   setAlert]   = useState(null);

  useEffect(() => { if (isAuthenticated) navigate("/dashboard", { replace:true }); }, [isAuthenticated]);
  useEffect(() => { if (error) { setAlert({ type:"error", message:error }); clearError(); } }, [error]);

  const onChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    if (form.name.trim().length < 2)    { setAlert({ type:"error", message:"Name must be at least 2 characters." }); return; }
    if (form.password.length < 6)       { setAlert({ type:"error", message:"Password must be at least 6 characters." }); return; }
    if (form.password !== form.confirm) { setAlert({ type:"error", message:"Passwords do not match." }); return; }
    setLoading(true);
    try { await register(form.name.trim(), form.email, form.password); }
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
        <h1 className="auth-heading">Create account</h1>
        <p className="auth-sub">Start managing your projects for free</p>

        {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

        <form className="auth-form" onSubmit={onSubmit}>
          {[
            { name:"name",     label:"Full name",        type:"text",     ph:"Jane Smith"        },
            { name:"email",    label:"Email address",    type:"email",    ph:"you@example.com"   },
            { name:"password", label:"Password",         type:"password", ph:"Min. 6 characters" },
            { name:"confirm",  label:"Confirm password", type:"password", ph:"Repeat password"   },
          ].map(({ name, label, type, ph }) => (
            <div className="form-group" key={name}>
              <label className="form-lbl">{label}</label>
              <input className="form-input" type={type} name={name}
                value={form[name]} onChange={onChange} placeholder={ph} required />
            </div>
          ))}
          <motion.button
            type="submit" className="btn btn-primary btn-full"
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.01 }}
            whileTap={{   scale: loading ? 1 : 0.98 }}
            style={{ marginTop:4 }}
          >
            {loading ? "Creating account…" : "Create account"}
          </motion.button>
        </form>
        <p className="auth-foot">Already have an account? <Link to="/login">Sign in</Link></p>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
