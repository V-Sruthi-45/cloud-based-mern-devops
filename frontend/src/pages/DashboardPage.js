// DashboardPage.js — ClickUp-inspired light dashboard
// Sections: Welcome banner | Stats | Activity chart + Ring | Priority bar + Status donut
//           Recent Projects | Recent Tasks | Productivity Insights | Activity Timeline
import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { useAuth }         from "../context/AuthContext";
import { taskService }     from "../services/taskService";
import { projectService }  from "../services/projectService";
import Spinner from "../components/common/Spinner";
import Alert   from "../components/common/Alert";

/* ── helpers ─────────────────────────────────────────── */
const greet = () => {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
};

const PALETTE = {
  coffee:  "#8B6F47",
  caramel: "#B08968",
  purple:  "#7C6B8A",
  green:   "#16A34A",
  amber:   "#D97706",
  rose:    "#E11D48",
  blue:    "#2563EB",
  slate:   "#475569",
};

const STATUS_META = {
  "todo":        { label: "To Do",       color: PALETTE.slate  },
  "in-progress": { label: "In Progress", color: PALETTE.amber  },
  "review":      { label: "In Review",   color: PALETTE.purple },
  "completed":   { label: "Completed",   color: PALETTE.green  },
};

const buildTrend = (n) => {
  const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  const s = Math.max(n || 5, 5);
  return days.map((d, i) => ({
    day: d,
    created:   Math.max(1, Math.round(s * (0.12 + 0.05 * Math.sin(i)))),
    completed: Math.max(0, Math.round(s * (0.07 + 0.04 * Math.cos(i+1)))),
  }));
};

const buildPriority = (tasks) => {
  const c = { low:0, medium:0, high:0, critical:0 };
  tasks.forEach(t => { if (c[t.priority] !== undefined) c[t.priority]++; });
  return [
    { name:"Low",      value:c.low,      color:PALETTE.blue   },
    { name:"Medium",   value:c.medium,   color:PALETTE.amber  },
    { name:"High",     value:c.high,     color:"#EA580C"       },
    { name:"Critical", value:c.critical, color:PALETTE.rose   },
  ].filter(d => d.value > 0);
};

const buildTimeline = (tasks, projects) => {
  const items = [];
  [...tasks].slice(0,3).forEach(t => items.push({ type:"task",    label:`Task created: ${t.title}`, time: t.createdAt, init: t.title.charAt(0).toUpperCase() }));
  [...projects].slice(0,2).forEach(p => items.push({ type:"proj", label:`Project: ${p.title}`,      time: p.createdAt, init: p.title.charAt(0).toUpperCase() }));
  return items.sort((a,b) => new Date(b.time) - new Date(a.time)).slice(0,5);
};

/* ── Custom Tooltip ──────────────────────────────────── */
const ChartTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:"#fff", border:"1px solid #E8E2D9", borderRadius:8, padding:"8px 12px", fontSize:"0.78rem", boxShadow:"0 4px 12px rgba(28,25,23,0.10)" }}>
      <p style={{ color:"#A8A29E", marginBottom:4 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color || "#1C1917" }}>{p.name}: <strong>{p.value}</strong></p>
      ))}
    </div>
  );
};

/* ── SVG Ring ────────────────────────────────────────── */
const Ring = ({ pct, size=110, stroke=9 }) => {
  const r = (size-stroke)/2, circ = 2*Math.PI*r, dash = (pct/100)*circ;
  return (
    <svg width={size} height={size} style={{ transform:"rotate(-90deg)", flexShrink:0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#EDE8DF" strokeWidth={stroke}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="url(#rg-light)" strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        style={{ transition:"stroke-dasharray 0.8s cubic-bezier(.4,0,.2,1)" }}/>
      <defs>
        <linearGradient id="rg-light" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#8B6F47"/>
          <stop offset="100%" stopColor="#B08968"/>
        </linearGradient>
      </defs>
    </svg>
  );
};

/* ── Card variants for Framer Motion ─────────────────── */
const cardVariants = {
  hidden: { opacity:0, y:20 },
  show:   (i=0) => ({ opacity:1, y:0, transition:{ delay: i*0.07, duration:0.32, ease:[0.4,0,0.2,1] } }),
};

/* ── Stat Card ───────────────────────────────────────── */
const StatCard = ({ label, value, sub, topGrad, iconBg, iconColor, icon, i }) => (
  <motion.div
    custom={i} variants={cardVariants} initial="hidden" animate="show"
    whileHover={{ y:-3, boxShadow:"0 8px 24px rgba(28,25,23,0.12)" }}
    className="stat-card" style={{ "--sc-top": topGrad }}
  >
    <div className="stat-top">
      <span className="stat-lbl">{label}</span>
      <div className="stat-ico" style={{ background: iconBg }}>{icon(iconColor)}</div>
    </div>
    <div className="stat-val">{value}</div>
    {sub && <div className="stat-sub">{sub}</div>}
  </motion.div>
);

/* ── Main ────────────────────────────────────────────── */
const DashboardPage = () => {
  const { user }  = useAuth();
  const [stats,    setStats]    = useState(null);
  const [tasks,    setTasks]    = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [sR, tR, pR] = await Promise.all([
        taskService.getStats(),
        taskService.getAll({ limit:200 }),
        projectService.getAll({ limit:20 }),
      ]);
      setStats(sR.data.stats);
      setTasks(tR.data.tasks || []);
      setProjects(pR.data.projects || []);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  if (loading) return <Spinner text="Loading dashboard…" />;

  const { totalProjects=0, totalTasks=0, tasksByStatus={} } = stats || {};
  const completed  = tasksByStatus.completed      || 0;
  const inProgress = tasksByStatus["in-progress"] || 0;
  const todo       = tasksByStatus.todo           || 0;
  const review     = tasksByStatus.review         || 0;
  const rate       = totalTasks > 0 ? Math.round((completed/totalTasks)*100) : 0;

  const trendData    = buildTrend(totalTasks);
  const priorityData = buildPriority(tasks);
  const donutData    = Object.entries(STATUS_META).map(([key,m]) => ({ name:m.label, value:tasksByStatus[key]||0, color:m.color })).filter(d=>d.value>0);
  const timeline     = buildTimeline(tasks, projects);
  const recentProj   = [...projects].slice(0, 5);
  const recentTasks  = [...tasks].slice(0, 6);

  const icoFn = (color) => (c) => (
    <svg viewBox="0 0 20 20" fill={c} style={{ width:17,height:17 }}><path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/></svg>
  );

  return (
    <div>
      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {/* ── 1. Welcome Banner ────────────────── */}
      <motion.div
        className="welcome-banner"
        initial={{ opacity:0, y:-16 }} animate={{ opacity:1, y:0 }}
        transition={{ duration:0.38, ease:[0.4,0,0.2,1] }}
      >
        <h2>{greet()}, {user?.name?.split(" ")[0]} 👋</h2>
        <p>Here's your workspace overview. You're doing great — keep it up!</p>
        <div className="welcome-banner-meta">
          {[
            { val: totalProjects, lbl: "Projects" },
            { val: totalTasks,    lbl: "Tasks" },
            { val: completed,     lbl: "Completed" },
            { val: `${rate}%`,    lbl: "Rate" },
          ].map(({ val, lbl }) => (
            <div key={lbl} className="welcome-stat">
              <span className="welcome-stat-val">{val}</span>
              <span className="welcome-stat-lbl">{lbl}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── 2. Stat Cards ────────────────────── */}
      <div className="stats-row">
        <StatCard i={0} label="Total Projects" value={totalProjects} sub="Active workspace"
          topGrad="linear-gradient(90deg,#8B6F47,#B08968)"
          iconBg="rgba(139,111,71,0.10)" iconColor="#8B6F47"
          icon={(c) => <svg viewBox="0 0 20 20" fill={c} style={{width:17,height:17}}><path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"/></svg>}
        />
        <StatCard i={1} label="Total Tasks" value={totalTasks} sub={`${inProgress} in progress`}
          topGrad="linear-gradient(90deg,#7C6B8A,#9D8CAD)"
          iconBg="rgba(124,107,138,0.10)" iconColor="#7C6B8A"
          icon={(c) => <svg viewBox="0 0 20 20" fill={c} style={{width:17,height:17}}><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"/></svg>}
        />
        <StatCard i={2} label="Completed" value={completed} sub={`${rate}% completion rate`}
          topGrad="linear-gradient(90deg,#16A34A,#22C55E)"
          iconBg="rgba(22,163,74,0.10)" iconColor="#16A34A"
          icon={(c) => <svg viewBox="0 0 20 20" fill={c} style={{width:17,height:17}}><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>}
        />
        <StatCard i={3} label="Pending" value={todo+review} sub={`${todo} to-do · ${review} reviewing`}
          topGrad="linear-gradient(90deg,#D97706,#F59E0B)"
          iconBg="rgba(217,119,6,0.10)" iconColor="#D97706"
          icon={(c) => <svg viewBox="0 0 20 20" fill={c} style={{width:17,height:17}}><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/></svg>}
        />
      </div>

      {/* ── 3. Activity chart + Completion Ring ─ */}
      <div className="dash-grid-2" style={{ marginBottom:16 }}>
        <motion.div className="card" custom={4} variants={cardVariants} initial="hidden" animate="show">
          <div className="card-hdr">
            <span className="card-label">7-DAY TASK ACTIVITY</span>
            <span style={{ fontSize:"0.72rem", color:"var(--tx-3)" }}>Created vs Completed</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={trendData} margin={{ top:4,right:4,left:-26,bottom:0 }}>
              <defs>
                <linearGradient id="ga" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#8B6F47" stopOpacity={0.22}/>
                  <stop offset="100%" stopColor="#8B6F47" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="gb" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#16A34A" stopOpacity={0.22}/>
                  <stop offset="100%" stopColor="#16A34A" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#EDE8DF"/>
              <XAxis dataKey="day" tick={{ fill:"#A8A29E",fontSize:11 }} axisLine={false} tickLine={false}/>
              <YAxis tick={{ fill:"#A8A29E",fontSize:11 }} axisLine={false} tickLine={false} allowDecimals={false}/>
              <Tooltip content={<ChartTip />}/>
              <Area type="monotone" dataKey="created"   name="Created"   stroke="#8B6F47" strokeWidth={2} fill="url(#ga)" dot={false} activeDot={{ r:4, fill:"#8B6F47" }}/>
              <Area type="monotone" dataKey="completed" name="Completed" stroke="#16A34A" strokeWidth={2} fill="url(#gb)" dot={false} activeDot={{ r:4, fill:"#16A34A" }}/>
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div className="card" custom={5} variants={cardVariants} initial="hidden" animate="show"
          style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <div className="card-hdr" style={{ marginBottom:0 }}>
            <span className="card-label">COMPLETION OVERVIEW</span>
            <span style={{ fontSize:"1.25rem", fontWeight:800, letterSpacing:"-0.04em", color:"var(--tx-1)" }}>{rate}%</span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:18 }}>
            <div style={{ position:"relative" }}>
              <Ring pct={rate}/>
              <div style={{ position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center" }}>
                <span style={{ fontSize:"1.25rem",fontWeight:800,letterSpacing:"-0.04em",color:"var(--tx-1)" }}>{rate}%</span>
                <span style={{ fontSize:"0.6rem",color:"var(--tx-3)" }}>done</span>
              </div>
            </div>
            <div style={{ flex:1,fontSize:"0.82rem",color:"var(--tx-2)",lineHeight:1.6 }}>
              <strong style={{ color:"var(--tx-1)",fontSize:"1rem" }}>{completed}</strong> of{" "}
              <strong style={{ color:"var(--tx-1)",fontSize:"1rem" }}>{totalTasks}</strong> tasks completed
            </div>
          </div>
          <div className="status-rows">
            {Object.entries(STATUS_META).map(([key, m]) => {
              const cnt = tasksByStatus[key] || 0;
              const pct = totalTasks > 0 ? Math.round((cnt/totalTasks)*100) : 0;
              return (
                <div key={key} className="status-row">
                  <div className="s-pip" style={{ background:m.color }}/>
                  <span className="s-name">{m.label}</span>
                  <div className="s-bar"><div className="s-bar-fill" style={{ width:`${pct}%`,background:m.color }}/></div>
                  <span className="s-num">{cnt}</span>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* ── 4. Priority bar + Status donut ──── */}
      <div className="dash-grid-2" style={{ marginBottom:24 }}>
        <motion.div className="card" custom={6} variants={cardVariants} initial="hidden" animate="show">
          <div className="card-hdr"><span className="card-label">TASKS BY PRIORITY</span></div>
          {priorityData.length === 0 ? (
            <div style={{ display:"flex",alignItems:"center",justifyContent:"center",height:160,color:"var(--tx-3)",fontSize:"0.84rem" }}>
              Create tasks to see priority data
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={priorityData} margin={{ top:4,right:4,left:-26,bottom:0 }} barSize={32} barCategoryGap="35%">
                <CartesianGrid strokeDasharray="3 3" stroke="#EDE8DF" vertical={false}/>
                <XAxis dataKey="name" tick={{ fill:"#A8A29E",fontSize:11 }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fill:"#A8A29E",fontSize:11 }} axisLine={false} tickLine={false} allowDecimals={false}/>
                <Tooltip content={<ChartTip />} cursor={{ fill:"rgba(139,111,71,0.04)" }}/>
                <Bar dataKey="value" name="Tasks" radius={[4,4,0,0]}>
                  {priorityData.map((d, i) => <Cell key={i} fill={d.color}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        <motion.div className="card" custom={7} variants={cardVariants} initial="hidden" animate="show">
          <div className="card-hdr"><span className="card-label">STATUS DISTRIBUTION</span></div>
          {donutData.length === 0 ? (
            <div style={{ display:"flex",alignItems:"center",justifyContent:"center",height:160,color:"var(--tx-3)",fontSize:"0.84rem" }}>
              No tasks yet
            </div>
          ) : (
            <div style={{ display:"flex",alignItems:"center",gap:20 }}>
              <ResponsiveContainer width={150} height={150}>
                <PieChart>
                  <Pie data={donutData} cx="50%" cy="50%" innerRadius={44} outerRadius={68} paddingAngle={3} dataKey="value" strokeWidth={0}>
                    {donutData.map((d,i) => <Cell key={i} fill={d.color}/>)}
                  </Pie>
                  <Tooltip content={<ChartTip />}/>
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display:"flex",flexDirection:"column",gap:9,flex:1 }}>
                {donutData.map((d,i) => (
                  <div key={i} style={{ display:"flex",alignItems:"center",gap:8 }}>
                    <div style={{ width:8,height:8,borderRadius:"50%",background:d.color,flexShrink:0 }}/>
                    <span style={{ fontSize:"0.8rem",color:"var(--tx-2)",flex:1 }}>{d.name}</span>
                    <span style={{ fontSize:"0.8rem",fontWeight:700,color:"var(--tx-1)" }}>{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* ── 5. Recent Projects + Recent Tasks ── */}
      <div className="dash-grid-2" style={{ marginBottom:24 }}>
        <motion.div className="card" custom={8} variants={cardVariants} initial="hidden" animate="show">
          <div className="card-hdr">
            <span className="card-label">RECENT PROJECTS</span>
            <Link to="/projects" style={{ fontSize:"0.78rem",color:"var(--accent)",fontWeight:600 }}>View all →</Link>
          </div>
          {recentProj.length === 0 ? (
            <p style={{ fontSize:"0.84rem",color:"var(--tx-3)",textAlign:"center",padding:"20px 0" }}>No projects yet</p>
          ) : (
            recentProj.map(p => (
              <div key={p._id} className="recent-proj-item">
                <div className="recent-proj-dot" style={{ background: p.color || "#8B6F47" }}/>
                <div className="recent-proj-info">
                  <div className="recent-proj-name">{p.title}</div>
                  <div className="recent-proj-meta">{p.status} · {new Date(p.createdAt).toLocaleDateString()}</div>
                </div>
                <span className={`badge b-${p.status === "active" ? "active" : p.status === "completed" ? "done" : "hold"}`}>{p.status}</span>
              </div>
            ))
          )}
        </motion.div>

        <motion.div className="card" custom={9} variants={cardVariants} initial="hidden" animate="show">
          <div className="card-hdr">
            <span className="card-label">RECENT TASKS</span>
            <Link to="/tasks" style={{ fontSize:"0.78rem",color:"var(--accent)",fontWeight:600 }}>View all →</Link>
          </div>
          {recentTasks.length === 0 ? (
            <p style={{ fontSize:"0.84rem",color:"var(--tx-3)",textAlign:"center",padding:"20px 0" }}>No tasks yet</p>
          ) : (
            recentTasks.map(t => (
              <div key={t._id} className="recent-task-item">
                <div className="task-dot" style={{ background: STATUS_META[t.status]?.color || "#A8A29E" }}/>
                <span className={`recent-task-title${t.status==="completed"?" done":""}`}>{t.title}</span>
                <span className={`badge b-${t.priority==="low"?"low":t.priority==="medium"?"medium":t.priority==="high"?"high":"critical"}`}>{t.priority}</span>
              </div>
            ))
          )}
        </motion.div>
      </div>

      {/* ── 6. Productivity Insights + Activity Timeline ── */}
      <div className="dash-grid-3">
        <motion.div className="card" custom={10} variants={cardVariants} initial="hidden" animate="show">
          <div className="card-hdr"><span className="card-label">ACTIVITY TIMELINE</span></div>
          {timeline.length === 0 ? (
            <p style={{ fontSize:"0.84rem",color:"var(--tx-3)",textAlign:"center",padding:"20px 0" }}>No activity yet</p>
          ) : (
            <div className="timeline">
              {timeline.map((item, i) => (
                <div key={i} className="timeline-item">
                  <div className="timeline-dot" style={{ background: item.type==="task" ? "rgba(139,111,71,0.10)" : "rgba(124,107,138,0.10)", color: item.type==="task" ? "#8B6F47" : "#7C6B8A", borderColor: item.type==="task" ? "rgba(139,111,71,0.20)" : "rgba(124,107,138,0.20)" }}>
                    {item.init}
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-action">{item.label}</div>
                    <div className="timeline-time">{new Date(item.time).toLocaleDateString()}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div className="card" custom={11} variants={cardVariants} initial="hidden" animate="show">
          <div className="card-hdr"><span className="card-label">PRODUCTIVITY INSIGHTS</span></div>
          <div className="insight-grid">
            <div className="insight-item">
              <div className="insight-val">{rate}%</div>
              <div className="insight-lbl">Completion rate</div>
            </div>
            <div className="insight-item">
              <div className="insight-val">{totalProjects > 0 ? (totalTasks/totalProjects).toFixed(1) : 0}</div>
              <div className="insight-lbl">Tasks per project</div>
            </div>
            <div className="insight-item">
              <div className="insight-val">{inProgress}</div>
              <div className="insight-lbl">Active now</div>
            </div>
            <div className="insight-item">
              <div className="insight-val">{totalTasks - completed}</div>
              <div className="insight-lbl">Remaining</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardPage;
