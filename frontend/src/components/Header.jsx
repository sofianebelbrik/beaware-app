import React from "react";

const Header = () => (
  <div
    style={{
      position: "relative",
      top: 0,
      left: 0,
      width: "100%",
      textAlign: "center",
      padding: "30px 20px",
      color: "#0a1e3f",
      backgroundColor: "#dff2fd", 
      boxSizing: "border-box",
      fontWeight: 500,
    }}
  >
    <h1 style={{ fontSize: "3.5rem", margin: 0, fontWeight: "700" }}>BeAware</h1>
    <h2 style={{ fontSize: "1.8rem", fontWeight: "400", marginTop: "0px" ,fontWeight: "500"}}>
      Water Quality
    </h2>
  </div>
);

export default Header;