import React from "react";
const Spinner = ({ text = "Loading…" }) => (
  <div className="spinner-wrap">
    <div className="spinner" />
    {text && <span>{text}</span>}
  </div>
);
export default Spinner;
