from fastapi import FastAPI, Query
from pydantic import BaseModel
from typing import Dict
import pandas as pd
import joblib
import os
import json
from datetime import datetime
from geopy.distance import geodesic
from pyproj import Transformer
import numpy as np
from fastapi.middleware.cors import CORSMiddleware 

app = FastAPI(title="BeAware Water Quality API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model metadata and features
MODEL_DIR = 'models'  
FEATURES_PATH = 'feature_columns.json'
DATA_PATH = 'data/data_final_with_features.csv'

# Load feature list
with open(FEATURES_PATH, 'r') as f:
    model_features_dict = json.load(f)

# Load dataset and apply coordinate conversion
df = pd.read_csv(DATA_PATH)
transformer = Transformer.from_crs("epsg:27700", "epsg:4326", always_xy=True)
df[['longitude', 'latitude']] = df.apply(lambda row: pd.Series(transformer.transform(row['sample.samplingPoint.easting'], row['sample.samplingPoint.northing'])), axis=1)
df['sample.sampleDateTime'] = pd.to_datetime(df['sample.sampleDateTime'])

# Define a request schema
class LocationInput(BaseModel):
    latitude: float
    longitude: float

# Time-based feature update
def update_sample_to_now(row):
    now = datetime.now()
    row['sample.sampleDateTime'] = now
    row['Year'] = now.year
    row['Month'] = now.month
    row['Week'] = now.isocalendar().week
    row['Day'] = now.day
    row['Hour'] = now.hour
    row['weekday'] = now.weekday()
    season_labels = {0: 'Winter', 1: 'Winter', 2: 'Spring', 3: 'Spring', 4: 'Spring',
                     5: 'Summer', 6: 'Summer', 7: 'Summer', 8: 'Autumn', 9: 'Autumn',
                     10: 'Autumn', 11: 'Winter'}
    row['season_label'] = season_labels[now.month - 1]
    return row

from math import exp

# Ideal ranges and parameter weights (move these to the top of your file for clarity)
ideal_ranges_by_water = {
    "GROUNDWATER": {
        'Ammonia(N)': {'min': 0.0, 'max': 0.5},
        'BOD ATU': {'min': 0.0, 'max': 2.0},
        'Nitrate-N': {'min': 0.0, 'max': 10.0},
        'Nitrite-N': {'min': 0.0, 'max': 0.1},
        'O Diss %sat': {'min': 80, 'max': 100},
        'Orthophospht': {'min': 0.0, 'max': 0.5},
        'Phosphorus-P': {'min': 0.0, 'max': 0.05},
        'Temp Water': {'min': 5.0, 'max': 25.0},
        'TurbidityNTU': {'min': 0.0, 'max': 5.0},
        'pH': {'min': 6.5, 'max': 8.5}
    },
    "RIVER / RUNNING SURFACE WATER": {
        'Ammonia(N)': {'min': 0.0, 'max': 1.0},
        'BOD ATU': {'min': 0.0, 'max': 4.0},
        'Nitrate-N': {'min': 0.0, 'max': 30.0},
        'Nitrite-N': {'min': 0.0, 'max': 0.3},
        'O Diss %sat': {'min': 50, 'max': 120},
        'Orthophospht': {'min': 0.0, 'max': 2.0},
        'Phosphorus-P': {'min': 0.0, 'max': 0.15},
        'Temp Water': {'min': 0.0, 'max': 30.0},
        'TurbidityNTU': {'min': 0.0, 'max': 20.0},
        'pH': {'min': 6.0, 'max': 9.0}
    },
    "POND / LAKE / RESERVOIR WATER": {
        'Ammonia(N)': {'min': 0.0, 'max': 0.8},
        'BOD ATU': {'min': 0.0, 'max': 3.0},
        'Nitrate-N': {'min': 0.0, 'max': 20.0},
        'Nitrite-N': {'min': 0.0, 'max': 0.2},
        'O Diss %sat': {'min': 60, 'max': 110},
        'Orthophospht': {'min': 0.0, 'max': 1.5},
        'Phosphorus-P': {'min': 0.0, 'max': 0.1},
        'Temp Water': {'min': 0.0, 'max': 28.0},
        'TurbidityNTU': {'min': 0.0, 'max': 15.0},
        'pH': {'min': 6.5, 'max': 9.0}
    }
}

weights = {
    'Ammonia(N)': 0.1,
    'BOD ATU': 0.1,
    'Nitrate-N': 0.1,
    'Nitrite-N': 0.1,
    'O Diss %sat': 0.15,
    'Orthophospht': 0.1,
    'Phosphorus-P': 0.1,
    'Temp Water': 0.1,
    'TurbidityNTU': 0.1,
    'pH': 0.05
}

def calc_score(value, ideal, k=3):
    if ideal['min'] <= value <= ideal['max']:
        return 1.0
    deviation = abs((value - ideal['max']) if value > ideal['max'] else (ideal['min'] - value)) / (ideal['max'] or 1)
    return float(exp(-k * deviation))

@app.post("/predict")

def predict_water_quality(user_location: LocationInput):
    predictions = {}
    quality_scores = {}
    combined_score_sum = 0
    valid_scores = 0
    nearest_sources_info = {}

    for water_type in df['sample.sampledMaterialType.label'].unique():
        sub_df = df[df['sample.sampledMaterialType.label'] == water_type].copy()
        sub_df['distance'] = sub_df.apply(
            lambda row: geodesic((user_location.latitude, user_location.longitude), (row['latitude'], row['longitude'])).meters,
            axis=1
        )

        nearest_sample = sub_df.sort_values('distance').iloc[0]
        nearest_location = nearest_sample[['latitude', 'longitude']]

        # 🧭 Store distance and coordinates
        nearest_sources_info[water_type] = {
            "latitude": round(nearest_sample['latitude'], 6),
            "longitude": round(nearest_sample['longitude'], 6),
            "distance_meters": round(nearest_sample['distance'], 2)
        }
        location_mask = (
            (df['sample.sampledMaterialType.label'] == water_type) &
            (df['latitude'] == nearest_location['latitude']) &
            (df['longitude'] == nearest_location['longitude'])
        )

        recent_sample = df[location_mask].sort_values('sample.sampleDateTime', ascending=False).iloc[0]
        recent_sample = update_sample_to_now(recent_sample.copy())

        predictions[water_type] = {}
        score_sum = 0
        total_weight = 0

        for param in model_features_dict[water_type]:
            model_path = os.path.join(MODEL_DIR, f"{water_type}_{param}.pkl".replace("/", "_"))
            if os.path.exists(model_path):
                model = joblib.load(model_path)
                input_features = recent_sample[model_features_dict[water_type][param]].values.reshape(1, -1)
                prediction = float(model.predict(input_features)[0])
                predictions[water_type][param] = round(prediction, 3)

                # 💧 Compute param score
                if water_type in ideal_ranges_by_water and param in ideal_ranges_by_water[water_type]:
                    ideal_range = ideal_ranges_by_water[water_type][param]
                    score = calc_score(prediction, ideal_range)
                    score_sum += score * weights[param]
                    total_weight += weights[param]
            else:
                predictions[water_type][param] = None

        if total_weight > 0:
            final_score = round(score_sum / total_weight, 3)
            quality_scores[water_type] = final_score
            combined_score_sum += final_score
            valid_scores += 1
        else:
            quality_scores[water_type] = None

    # 🌍 Final overall score (average of all available types)
    overall_score = round(combined_score_sum / valid_scores, 3) if valid_scores else None

    return {
    "predictions": predictions,
    "scores": quality_scores,
    "overall_score": overall_score,
    "nearest_sources": nearest_sources_info,
    "ideal_ranges": ideal_ranges_by_water  # ✅ Include this!
}