import React from "react";

const LocationButton = ({ onLocate }) => {
  return (
    <div style={{ display: "flex", justifyContent: "center", marginTop: "30px" }}>
      <button
        onClick={onLocate}
        style={{
          padding: "12px 24px",
          backgroundColor: "#0a1e3f",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          fontSize: "1rem",
          cursor: "pointer",
          fontWeight: "400",
        }}
      >
        📍 Use My Location
      </button>
    </div>
  );
};

export default LocationButton;