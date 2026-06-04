import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { taskService }    from "../services/taskService";
import { projectService } from "../services/projectService";
import Alert   from "../components/common/Alert";
import Spinner from "../components/common/Spinner";

const Ic = {
  plus:   <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/></svg>,
  search: <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/></svg>,
  check:  <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>,
  edit:   <svg viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/></svg>,
  trash:  <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/></svg>,
};

const ST = ["todo","in-progress","review","completed"];
const PR = ["low","medium","high","critical"];
const SB = { todo:"b-todo","in-progress":"b-progress",review:"b-review",completed:"b-done" };
const PB = { low:"b-low",medium:"b-medium",high:"b-high",critical:"b-critical" };

/* ── Modal ───────────────────────────────────────────── */
const Modal = ({ task, projects, onClose, onSave }) => {
  const [f, setF] = useState(task || { title:"", description:"", status:"todo", priority:"medium", project: projects[0]?._id||"" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  const save = async e => {
    e.preventDefault();
    if (!f.title || f.title.length < 3) { setErr("Title must be at least 3 characters."); return; }
    if (!f.project) { setErr("Please select a project."); return; }
    setLoading(true);
    try {
      const res = task?._id
        ? await taskService.update(task._id, f)
        : await taskService.create(f);
      onSave(res.data.task, task?._id ? "update" : "create");
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
          <span className="modal-title">{task ? "Edit Task" : "New Task"}</span>
          <button className="modal-x" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {err && <Alert type="error" message={err} onClose={() => setErr(null)} />}
          <div className="form-group">
            <label className="form-lbl">Title *</label>
            <input className="form-input" value={f.title} onChange={e => setF({...f,title:e.target.value})} placeholder="Task title" required />
          </div>
          <div className="form-group">
            <label className="form-lbl">Description</label>
            <textarea className="form-textarea" value={f.description} onChange={e => setF({...f,description:e.target.value})} placeholder="Task details…" />
          </div>
          <div className="form-group">
            <label className="form-lbl">Project *</label>
            <select className="form-select" value={f.project} onChange={e => setF({...f,project:e.target.value})} required>
              <option value="">Select project</option>
              {projects.map(p => <option key={p._id} value={p._id}>{p.title}</option>)}
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-lbl">Status</label>
              <select className="form-select" value={f.status} onChange={e => setF({...f,status:e.target.value})}>
                {ST.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-lbl">Priority</label>
              <select className="form-select" value={f.priority} onChange={e => setF({...f,priority:e.target.value})}>
                {PR.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
        </div>
        <div className="modal-foot">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <motion.button
            className="btn btn-primary" onClick={save} disabled={loading}
            whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}
          >
            {loading ? "Saving…" : task ? "Update" : "Create"}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ── Tasks Page ──────────────────────────────────────── */
const TasksPage = () => {
  const [searchParams] = useSearchParams();
  const [tasks,    setTasks]    = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [alert,    setAlert]    = useState(null);
  const [search,   setSearch]   = useState("");
  const [statusF,  setStatusF]  = useState(searchParams.get("status") || "");
  const [projF,    setProjF]    = useState("");
  const [modal,    setModal]    = useState(null);

  useEffect(() => {
    projectService.getAll({ limit:100 }).then(r => setProjects(r.data.projects)).catch(() => {});
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const p = {};
      if (search)  p.search  = search;
      if (statusF) p.status  = statusF;
      if (projF)   p.project = projF;
      setTasks((await taskService.getAll(p)).data.tasks);
    } catch (e) { setAlert({ type:"error", message:e.message }); }
    finally { setLoading(false); }
  }, [search, statusF, projF]);

  useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t); }, [load]);

  const onSave = (task, action) => {
    setTasks(prev => action==="create" ? [task,...prev] : prev.map(t => t._id===task._id ? task : t));
    setAlert({ type:"success", message: action==="create" ? "Task created!" : "Task updated!" });
  };

  const onStatusChange = async (id, status) => {
    try {
      setTasks(prev => prev.map(t => t._id===id ? {...t, status} : t));
      await taskService.update(id, { status });
    } catch (e) { setAlert({ type:"error", message:e.message }); load(); }
  };

  const onDelete = async id => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await taskService.delete(id);
      setTasks(prev => prev.filter(t => t._id !== id));
      setAlert({ type:"success", message:"Task deleted." });
    } catch (e) { setAlert({ type:"error", message:e.message }); }
  };

  return (
    <div>
      <div className="page-hdr">
        <div>
          <h1>Tasks</h1>
          <p>{tasks.length} task{tasks.length !== 1 ? "s" : ""} found</p>
        </div>
        <motion.button
          className="btn btn-primary"
          onClick={() => setModal("new")}
          disabled={projects.length === 0}
          title={projects.length === 0 ? "Create a project first" : ""}
          whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}
        >
          {Ic.plus} New Task
        </motion.button>
      </div>

      {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      <div className="filters-bar">
        <div className="search-wrap">
          <span className="s-ico">{Ic.search}</span>
          <input className="search-input" placeholder="Search tasks…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="filter-sel" value={statusF} onChange={e => setStatusF(e.target.value)}>
          <option value="">All statuses</option>
          {ST.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="filter-sel" value={projF} onChange={e => setProjF(e.target.value)}>
          <option value="">All projects</option>
          {projects.map(p => <option key={p._id} value={p._id}>{p.title}</option>)}
        </select>
      </div>

      {loading ? <Spinner text="Loading tasks…" /> : tasks.length === 0 ? (
        <div className="empty-state">
          <div className="empty-ico">{Ic.check}</div>
          <h3>No tasks found</h3>
          <p>Create your first task or adjust filters.</p>
          {projects.length > 0 && (
            <motion.button className="btn btn-primary" onClick={() => setModal("new")} whileHover={{ scale:1.02 }} whileTap={{ scale:0.98 }}>
              {Ic.plus} New Task
            </motion.button>
          )}
        </div>
      ) : (
        <motion.div
          className="task-table"
          initial={{ opacity:0, y:12 }}
          animate={{ opacity:1, y:0 }}
          transition={{ duration:0.28, ease:[0.4,0,0.2,1] }}
        >
          <div className="task-thead">
            <span>TASK</span>
            <span>PROJECT</span>
            <span>PRIORITY</span>
            <span>STATUS</span>
            <span>CREATED</span>
            <span style={{ textAlign:"right" }}>ACTIONS</span>
          </div>
          <AnimatePresence>
            {tasks.map((t, i) => (
              <motion.div
                key={t._id}
                className="task-row"
                initial={{ opacity:0, x:-8 }}
                animate={{ opacity:1, x:0 }}
                exit={{    opacity:0, x:8  }}
                transition={{ delay: i * 0.03, duration:0.22 }}
              >
                <div className="task-title-cell">
                  <span className={`task-title-txt${t.status==="completed" ? " done" : ""}`}>{t.title}</span>
                  {t.description && (
                    <span className="task-sub-txt">
                      {t.description.slice(0,55)}{t.description.length>55?"…":""}
                    </span>
                  )}
                </div>
                <span className="task-proj-nm">{t.project?.title || "—"}</span>
                <span><span className={`badge ${PB[t.priority]||""}`}>{t.priority}</span></span>
                <select
                  className="task-status-sel"
                  value={t.status}
                  onChange={e => onStatusChange(t._id, e.target.value)}
                >
                  {ST.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <span style={{ fontSize:"0.78rem", color:"var(--tx-3)" }}>
                  {new Date(t.createdAt).toLocaleDateString()}
                </span>
                <div className="task-row-btns">
                  <button className="btn-icon" title="Edit" onClick={() => setModal(t)}>{Ic.edit}</button>
                  <button className="btn-icon del" title="Delete" onClick={() => onDelete(t._id)}>{Ic.trash}</button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <AnimatePresence>
        {modal && (
          <Modal
            task={modal === "new" ? null : modal}
            projects={projects}
            onClose={() => setModal(null)}
            onSave={onSave}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default TasksPage;
