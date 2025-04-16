import React, { useState } from "react";
import Header from "../components/Header";
import LocationButton from "../components/LocationButton";
import QualityTable from "../components/QualityTable";
import { getWaterQuality } from "../services/api";
import WaterLoader from "../components/WaterLoader";

export default function Home() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
  
    const handleLocate = () => {
      if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser.");
        return;
      }
  
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            setLoading(true);
            const result = await getWaterQuality(latitude, longitude);
            console.log("✅ Received from backend:", result);
            setData(result);
          } catch (err) {
            alert("❌ Failed to retrieve water quality data.");
            console.error("Frontend error:", err);
          } finally {
            setLoading(false);
          }
        },
        (error) => {
          alert("❌ Could not get your location.");
          console.error("Location error:", error);
        }
      );
    };
  
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#dff2fd" }}>
        {/* This stays at the top always */}
        <Header />
  
        {/* This centers the table + button */}
        <div
          style={{
            maxWidth: "800px",
            margin: "0 auto",
            padding: "40px 20px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center"
          }}
        >
          {loading ? <WaterLoader /> : <QualityTable data={data} />}
  
          <div style={{ textAlign: "center", marginTop: "30px" }}>
            <LocationButton onLocate={handleLocate} />
          </div>
        </div>
      </div>
    );
  }