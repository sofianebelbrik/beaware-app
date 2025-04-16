
import React from "react";
import "./WaterLoader.css";

const WaterLoader = () => {
  return (
    <div className="spinner-container">
      <div className="spinner">
        <div className="droplet d1"></div>
        <div className="droplet d2"></div>
        <div className="droplet d3"></div>
        <div className="droplet d4"></div>
      </div>
      <p className="loading-text">Loading...</p>
    </div>
  );
};

export default WaterLoader;