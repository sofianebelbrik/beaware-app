import React, { useState } from "react";

const QualityTable = ({ data }) => {
  const [openSections, setOpenSections] = useState({});

  const toggleSection = (source) => {
    setOpenSections((prev) => ({
      ...prev,
      [source]: !prev[source]
    }));
  };

  if (!data) {
    return (
      <div style={{
        borderRadius: "8px",
        padding: "20px",
        backgroundColor: "#0a1e3f",
        color: "white",
        textAlign: "center"
      }}>
        <h3 style={{ fontSize: "1.5rem", marginBottom: "10px" }}>
          💧 Water Quality
        </h3>
        <hr style={{ border: "1px solid white", marginBottom: "20px" }} />
        <p style={{ fontSize: "1rem", opacity: 0.8 }}>
          No data yet — click the button below to analyze your local water quality.
        </p>
      </div>
    );
  }

  return (
    <div style={{
      borderRadius: "8px",
      padding: "20px",
      backgroundColor: "#0a1e3f",
      color: "white"
    }}>
      <h3 style={{ textAlign: "center", fontSize: "1.3rem", marginBottom: "10px", fontWeight: 500 }}>
        💧 Water Quality: {Math.round(data.overall_score * 100)}%
      </h3>

      <hr style={{ border: "1px solid white", marginBottom: "20px" }} />

      {Object.entries(data.predictions).map(([source, params]) => (
        <div key={source} style={{ marginBottom: "20px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              cursor: "pointer",
              padding: "10px 20px",
              borderBottom: "2px solid white"
            }}
            onClick={() => toggleSection(source)}
          >
            <strong style={{ fontSize: "1.rem", fontWeight: 500 }}>{source}</strong>
            <div
              style={{
                width: "130px",
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "flex-start",
                fontFamily: "monospace",
                marginLeft: "70px" 
              }}
            >
              <div
                style={{
                  fontSize: "1rem",
                  fontWeight: 500,
                  width: "90px",
                  textAlign: "left"
                }}
              >
                Score: {Math.round(data.scores[source] * 100)}%
              </div>
              <span style={{ fontSize: "1rem" }}>
                {openSections[source] ? "▲" : "▼"}
              </span>
            </div>
          </div>

          {openSections[source] && (
  <div style={{ marginTop: "10px" }}>
    {/* Headers */}
    <div style={{ display: "flex", fontWeight: 600 }}>
      <div style={{ flex: 1, padding: "6px 12px" }}>Parameter</div>
      <div style={{ flex: 1, padding: "6px 12px" }}>Value</div>
      <div
        style={{
          width: "130px",
          padding: "6px 12px",
          textAlign: "left"
        }}
      >
        Result
      </div>
    </div>
    <hr style={{ border: "0.5px solid white", marginBottom: "10px" }} />

    {/* Rows */}
    {Object.entries(params).map(([param, value]) => {
      const idealRange = data.ideal_ranges?.[source]?.[param];
      let resultLabel = "N/A";
      let bgColor = "#ccc";
      let textColor = "#000";

      if (idealRange && value !== null) {
        if (value >= idealRange.min && value <= idealRange.max) {
          resultLabel = "Safe";
          bgColor = "#00cc99";
          textColor = "white";
        } else if (
          value < idealRange.min * 0.9 ||
          value > idealRange.max * 1.1
        ) {
          resultLabel = "Risky";
          bgColor = "#e74c3c";
          textColor = "white";
        } else {
          resultLabel = "Moderate";
          bgColor = "#f1c40f";
          textColor = "black";
        }
      }

      return (
        <div
          key={param}
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "6px"
          }}
        >
          <div style={{ flex: 1, padding: "6px 12px" }}>{param}</div>
          <div style={{ flex: 1, padding: "6px 12px" }}>{value !== null ? value : "N/A"}</div>
          <div
            style={{
              width: "130px",
              padding: "6px 12px"
            }}
          >
            <span
              style={{
                backgroundColor: bgColor,
                color: textColor,
                padding: "4px 10px",
                borderRadius: "16px",
                fontSize: "0.85rem",
                fontWeight: 500,
                display: "inline-block",
                minWidth: "80px",
                textAlign: "center"
              }}
            >
              {resultLabel}
            </span>
          </div>
        </div>
      );
    })}
  </div>
)}
        </div>
      ))}
    </div>
  );
};

export default QualityTable;