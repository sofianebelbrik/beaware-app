import axios from "axios";

const API_BASE = "http://localhost:8000";

export const getWaterQuality = async (latitude, longitude) => {
  const response = await axios.post(`${API_BASE}/predict`, {
    latitude,
    longitude
  });
  return response.data;
};