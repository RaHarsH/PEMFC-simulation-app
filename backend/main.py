from fastapi import FastAPI, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
import matplotlib.pyplot as plt
import io
import base64
import joblib
import os
from typing import List



app = FastAPI()

# config the cors
app.add_middleware(
    CORSMiddleware,
    allow_origins = ['http://localhost:3000'],
    allow_credentials = True,
    allow_methods = ['*'],
    allow_headers = ['*'],
)

MODEL_PATHS = {
    'linear': 'models/linear_model.pkl',
    'svr': 'models/svr_model.pkl',
    # 'ann': 'models/ann_model.h5',
}

class PredictionRequest(BaseModel):
    model_type: str
    # current will be a list of values
    I: List[float]
    T: float
    Hydrogen: float
    Oxygen: float


@app.post('/predict-output')
async def predict(data: PredictionRequest):
    model_type = data.model_type.lower()

    if model_type not in MODEL_PATHS:
        raise HTTPException(status_code = 400, detail = "Invalid model type")
    
    model_path = MODEL_PATHS[model_type]

    if not os.path.exists(model_path):
        raise HTTPException(status_code = 500, detail = "Model file not found")

    
    model = joblib.load(model_path)

    voltages = []
    powers = []

    # heats = []

    for current in data.I:
        input_data = np.array([[current, data.T, data.Hydrogen, data.Oxygen]])
        voltage_pred = float(model.predict(input_data)[0])
        power = current * voltage_pred

        voltages.append(voltage_pred)
        powers.append(power)

    return {
        "currents": data.I,
        "voltages": voltages,
        "powers": powers
    }

