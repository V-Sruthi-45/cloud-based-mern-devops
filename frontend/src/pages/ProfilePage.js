import React, { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import Alert from "../components/common/Alert";

const cardV = {
  hidden: { opacity:0, y:18 },
  show: (i=0) => ({ opacity:1, y:0, transition:{ delay:i*0.08, duration:0.3, ease:[0.4,0,0.2,1] } }),
};

const ProfilePage = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const [pf, setPf] = useState({ name: user?.name || "" });
  const [pw, setPw] = useState({ currentPassword:"", newPassword:"", confirmPassword:"" });
  const [pLoading, setPLoading] = useState(false);
  const [wLoading, setWLoading] = useState(false);
  const [alert,    setAlert]    = useState(null);

  const onProfile = async e => {
    e.preventDefault();
    if (!pf.name || pf.name.trim().length < 2) {
      setAlert({ type:"error", message:"Name must be at least 2 characters." }); return;
    }
    setPLoading(true);
    try {
      await updateProfile({ name: pf.name.trim() });
      setAlert({ type:"success", message:"Profile updated successfully!" });
    } catch (err) { setAlert({ type:"error", message:err.message }); }
    finally { setPLoading(false); }
  };

  const onPassword = async e => {
    e.preventDefault();
    if (pw.newPassword.length < 6) {
      setAlert({ type:"error", message:"New password must be at least 6 characters." }); return;
    }
    if (pw.newPassword !== pw.confirmPassword) {
      setAlert({ type:"error", message:"Passwords do not match." }); return;
    }
    setWLoading(true);
    try {
      await changePassword(pw.currentPassword, pw.newPassword);
      setAlert({ type:"success", message:"Password changed! Please log in again." });
      setPw({ currentPassword:"", newPassword:"", confirmPassword:"" });
    } catch (err) { setAlert({ type:"error", message:err.message }); }
    finally { setWLoading(false); }
  };

  return (
    <div>
      <div className="page-hdr">
        <div>
          <h1>Profile</h1>
          <p>Manage your account and security settings</p>
        </div>
      </div>

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      <div className="profile-grid">
        {/* ── Left column ── */}
        <div style={{ display:"flex", flexDirection:"column", gap:18 }}>

          {/* Avatar hero */}
          <motion.div custom={0} variants={cardV} initial="hidden" animate="show">
            <div className="profile-hero">
              <div className="profile-av-xl">{user?.name?.charAt(0).toUpperCase()}</div>
              <div style={{ position:"relative", zIndex:1 }}>
                <div className="profile-name">{user?.name}</div>
                <div className="profile-email">{user?.email}</div>
                <span className="badge b-active" style={{ marginTop:8, display:"inline-flex", background:"rgba(255,255,255,0.2)", color:"#fff", borderColor:"rgba(255,255,255,0.3)" }}>
                  {user?.role}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Edit profile form */}
          <motion.div className="card" custom={1} variants={cardV} initial="hidden" animate="show">
            <div className="card-hdr"><span className="card-label">EDIT PROFILE</span></div>
            <form onSubmit={onProfile} style={{ display:"flex", flexDirection:"column", gap:14 }}>
              <div className="form-group">
                <label className="form-lbl">Full name</label>
                <input className="form-input" value={pf.name}
                  onChange={e => setPf({ name:e.target.value })} placeholder="Your full name" />
              </div>
              <div className="form-group">
                <label className="form-lbl">Email address</label>
                <input className="form-input" value={user?.email || ""} disabled />
                <span className="form-hint">Email address cannot be changed</span>
              </div>
              <motion.button
                type="submit" className="btn btn-primary"
                disabled={pLoading} style={{ alignSelf:"flex-start" }}
                whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}
              >
                {pLoading ? "Saving…" : "Save changes"}
              </motion.button>
            </form>
          </motion.div>
        </div>

        {/* ── Right column ── */}
        <div style={{ display:"flex", flexDirection:"column", gap:18 }}>

          {/* Change password */}
          <motion.div className="card" custom={2} variants={cardV} initial="hidden" animate="show">
            <div className="card-hdr"><span className="card-label">CHANGE PASSWORD</span></div>
            <form onSubmit={onPassword} style={{ display:"flex", flexDirection:"column", gap:14 }}>
              {[
                { key:"currentPassword", label:"Current password",  ph:"Current password"  },
                { key:"newPassword",     label:"New password",      ph:"Min. 6 characters" },
                { key:"confirmPassword", label:"Confirm new password", ph:"Repeat new password" },
              ].map(({ key, label, ph }) => (
                <div className="form-group" key={key}>
                  <label className="form-lbl">{label}</label>
                  <input className="form-input" type="password" value={pw[key]}
                    onChange={e => setPw({...pw,[key]:e.target.value})} placeholder={ph} required />
                </div>
              ))}
              <motion.button
                type="submit" className="btn btn-primary"
                disabled={wLoading} style={{ alignSelf:"flex-start" }}
                whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}
              >
                {wLoading ? "Updating…" : "Update password"}
              </motion.button>
            </form>
          </motion.div>

          {/* Account details */}
          <motion.div className="card" custom={3} variants={cardV} initial="hidden" animate="show">
            <div className="card-hdr"><span className="card-label">ACCOUNT DETAILS</span></div>
            <div className="info-list">
              <div className="info-row">
                <span className="info-key">Member since</span>
                <span className="info-val">
                  {new Date(user?.createdAt).toLocaleDateString("en-US",{ year:"numeric", month:"long", day:"numeric" })}
                </span>
              </div>
              <div className="info-row">
                <span className="info-key">Account role</span>
                <span className="info-val" style={{ textTransform:"capitalize" }}>{user?.role}</span>
              </div>
              <div className="info-row">
                <span className="info-key">Status</span>
                <span className="badge b-active">Active</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
