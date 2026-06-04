import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { projectService } from "../services/projectService";
import Alert   from "../components/common/Alert";
import Spinner from "../components/common/Spinner";

/* ── Icons ───────────────────────────────────────────── */
const Ic = {
  plus:   <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/></svg>,
  search: <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/></svg>,
  folder: <svg viewBox="0 0 20 20" fill="currentColor"><path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/></svg>,
  edit:   <svg viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/></svg>,
  trash:  <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/></svg>,
};

const SB = { active:"b-active", "on-hold":"b-hold", completed:"b-done", archived:"b-archived" };
const PB = { low:"b-low", medium:"b-medium", high:"b-high", critical:"b-critical" };

/* ── Modal ───────────────────────────────────────────── */
const Modal = ({ project, onClose, onSave }) => {
  const [f, setF] = useState(project || { title:"", description:"", status:"active", priority:"medium", color:"#8B6F47" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const save = async e => {
    e.preventDefault();
    if (!f.title || f.title.length < 3) { setErr("Title must be at least 3 characters."); return; }
    setLoading(true);
    try {
      const res = project?._id
        ? await projectService.update(project._id, f)
        : await projectService.create(f);
      onSave(res.data.project, project?._id ? "update" : "create");
      onClose();
    } catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  };

  return (
    <motion.div
      className="modal-backdrop"
      initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      transition={{ duration:0.18 }}
      onClick={onClose}
    >
      <motion.div
        className="modal"
        initial={{ opacity:0, y:24, scale:0.97 }}
        animate={{ opacity:1, y:0,  scale:1   }}
        exit={{    opacity:0, y:16, scale:0.97 }}
        transition={{ duration:0.22, ease:[0.4,0,0.2,1] }}
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-hdr">
          <span className="modal-title">{project ? "Edit Project" : "New Project"}</span>
          <button className="modal-x" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {err && <Alert type="error" message={err} onClose={() => setErr(null)} />}
          <div className="form-group">
            <label className="form-lbl">Title *</label>
            <input className="form-input" value={f.title} onChange={e => setF({...f,title:e.target.value})} placeholder="Project name" required />
          </div>
          <div className="form-group">
            <label className="form-lbl">Description</label>
            <textarea className="form-textarea" value={f.description} onChange={e => setF({...f,description:e.target.value})} placeholder="Brief description…" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-lbl">Status</label>
              <select className="form-select" value={f.status} onChange={e => setF({...f,status:e.target.value})}>
                <option value="active">Active</option>
                <option value="on-hold">On Hold</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-lbl">Priority</label>
              <select className="form-select" value={f.priority} onChange={e => setF({...f,priority:e.target.value})}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-lbl">Accent color</label>
            <input type="color" className="form-input" value={f.color} onChange={e => setF({...f,color:e.target.value})} />
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <motion.button
            className="btn btn-primary" onClick={save} disabled={loading}
            whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}
          >
            {loading ? "Saving…" : project ? "Update" : "Create"}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ── Projects Page ───────────────────────────────────── */
const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [alert,    setAlert]    = useState(null);
  const [search,   setSearch]   = useState("");
  const [statusF,  setStatusF]  = useState("");
  const [modal,    setModal]    = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const p = {};
      if (search)  p.search = search;
      if (statusF) p.status = statusF;
      setProjects((await projectService.getAll(p)).data.projects);
    } catch (e) { setAlert({ type:"error", message:e.message }); }
    finally { setLoading(false); }
  }, [search, statusF]);

  useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t); }, [load]);

  const onSave = (p, action) => {
    setProjects(prev => action === "create" ? [p,...prev] : prev.map(x => x._id===p._id ? p : x));
    setAlert({ type:"success", message: action==="create" ? "Project created!" : "Project updated!" });
  };

  const onDelete = async id => {
    if (!window.confirm("Delete this project and all its tasks?")) return;
    try {
      await projectService.delete(id);
      setProjects(prev => prev.filter(p => p._id !== id));
      setAlert({ type:"success", message:"Project deleted." });
    } catch (e) { setAlert({ type:"error", message:e.message }); }
  };

  const containerVariants = {
    hidden: {},
    show:   { transition: { staggerChildren:0.06 } },
  };
  const itemVariants = {
    hidden: { opacity:0, y:16 },
    show:   { opacity:1, y:0, transition:{ duration:0.28, ease:[0.4,0,0.2,1] } },
  };

  return (
    <div>
      <div className="page-hdr">
        <div>
          <h1>Projects</h1>
          <p>{projects.length} project{projects.length !== 1 ? "s" : ""} in your workspace</p>
        </div>
        <motion.button
          className="btn btn-primary"
          onClick={() => setModal("new")}
          whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}
        >
          {Ic.plus} New Project
        </motion.button>
      </div>

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      <div className="filters-bar">
        <div className="search-wrap">
          <span className="s-ico">{Ic.search}</span>
          <input className="search-input" placeholder="Search projects…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="filter-sel" value={statusF} onChange={e => setStatusF(e.target.value)}>
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="on-hold">On Hold</option>
          <option value="completed">Completed</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {loading ? <Spinner text="Loading projects…" /> : projects.length === 0 ? (
        <div className="empty-state">
          <div className="empty-ico">{Ic.folder}</div>
          <h3>No projects yet</h3>
          <p>Create your first project to start organising work.</p>
          <motion.button className="btn btn-primary" onClick={() => setModal("new")} whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}>
            {Ic.plus} New Project
          </motion.button>
        </div>
      ) : (
        <motion.div
          className="projects-grid"
          variants={containerVariants} initial="hidden" animate="show"
        >
          {projects.map(p => (
            <motion.div
              key={p._id}
              className="proj-card"
              style={{ "--pc": p.color || "#8B6F47" }}
              variants={itemVariants}
              whileHover={{ y:-3, boxShadow:"0 8px 24px rgba(28,25,23,0.12)" }}
            >
              <div className="proj-card-top">
                <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                  <div style={{ width:10, height:10, borderRadius:3, background: p.color||"#8B6F47", flexShrink:0 }} />
                  <span className="proj-title">{p.title}</span>
                </div>
                <div style={{ display:"flex", gap:4, flexShrink:0 }}>
                  <button className="btn-icon" title="Edit" onClick={() => setModal(p)}>{Ic.edit}</button>
                  <button className="btn-icon del" title="Delete" onClick={() => onDelete(p._id)}>{Ic.trash}</button>
                </div>
              </div>
              {p.description && <p className="proj-desc">{p.description}</p>}
              <div className="proj-meta">
                <span className={`badge ${SB[p.status]||""}`}>{p.status}</span>
                <span className={`badge ${PB[p.priority]||""}`}>{p.priority}</span>
              </div>
              <div className="proj-foot">
                <span className="proj-date">{new Date(p.createdAt).toLocaleDateString()}</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      <AnimatePresence>
        {modal && (
          <Modal
            project={modal === "new" ? null : modal}
            onClose={() => setModal(null)}
            onSave={onSave}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProjectsPage;
