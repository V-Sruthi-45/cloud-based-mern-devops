import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const NotFoundPage = () => (
  <div className="not-found">
    <motion.div
      initial={{ opacity:0, scale:0.9 }}
      animate={{ opacity:1, scale:1 }}
      transition={{ duration:0.4, ease:[0.4,0,0.2,1] }}
      style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:14 }}
    >
      <div className="not-found-num">404</div>
      <h2>Page not found</h2>
      <p>The page you're looking for doesn't exist or has been moved.</p>
      <Link to="/dashboard" className="btn btn-primary" style={{ marginTop:8 }}>
        ← Back to Dashboard
      </Link>
    </motion.div>
  </div>
);

export default NotFoundPage;
