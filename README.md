# 💧 Water Pollution Prediction App

This project is an interactive web-based UI designed to provide real-time water quality predictions based on user location. It is powered by a machine learning backend trained on over 1.6 million UK government samples (2020–2025), capable of forecasting 10 key pollutants across groundwater, rivers, and lakes.

## 🚀 Features

- 📍 **Geolocation-Based Predictions**  
  Detects user location and fetches water quality predictions for the nearest available sample zone.

- 📊 **Parameter Breakdown**  
  Displays individual pollutant predictions (e.g., pH, ammonia, nitrates) with safety indicators (Safe, Moderate, Risky).

- 💡 **Environmental Scoring**  
  Aggregates results to provide an overall water quality score.

- 🔄 **Real-Time Loader**  
  Custom animated spinner using CSS to indicate prediction is in progress.


<img width="1440" alt="Screenshot 2025-04-16 at 21 42 36" src="https://github.com/user-attachments/assets/1ba7f31a-ad36-4586-ab1e-587b9e0518d9" />
<img width="1440" alt="Screenshot 2025-04-16 at 21 42 57" src="https://github.com/user-attachments/assets/50697eda-851f-4048-9f0c-d5c1074948d9" />
<img width="1440" alt="Screenshot 2025-04-16 at 21 43 07" src="https://github.com/user-attachments/assets/5b33daa0-0323-4239-8458-20b430a3e1a2" />
<img width="1440" alt="Screenshot 2025-04-16 at 21 43 15" src="https://github.com/user-attachments/assets/81ee8d00-45e0-4e0e-9478-18a4f1c426ca" />


## 🛠️ Tech Stack

- **Frontend:** React, JavaScript, HTML, CSS  
- **Backend:** FastAPI (Python)  
- **API Communication:** Axios  
- **Machine Learning:** LightGBM models (served via API)

## 📍 How It Works

1. User clicks the location button.  
2. Their coordinates are passed to the backend via a POST request.  
3. The backend returns predictions for 10 pollutants across 3 water types.  
4. Results are scored, labeled (Safe/Moderate/Risky), and displayed in the UI.

## 🔍 Future Improvements

- Add support for time-based predictions (e.g., next-day forecasts)  
- Deploy backend and frontend for public access  

## 🙌 Acknowledgements

This system was developed as part of a broader research initiative focused on environmental monitoring and machine learning for public health applications.
🔍 Future Improvements
	•	Add support for time-based predictions (e.g., next-day forecasts)
	•	Deploy backend and frontend for public use

