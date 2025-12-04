from fastapi import FastAPI, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
import matplotlib.pyplot as plt
import io
import base64
import joblib
import os
from typing import List, Optional

from keras.models import load_model



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
    # dont use linear_model.pkl since it takes 8 features as input, use linear_model2.pkl
    'linear': 'models/pemfc_linear_regressor2.pkl',
    'svr': 'models/pemfc_svr_model.pkl',
    'ann': 'models/ann_model.h5',
    'stack_model': 'models/pemfc_stack_model.pkl',
}

class PredictionRequest(BaseModel):
    model_type: str
    # current will be a list of values
    I: List[float]
    T: float
    Hydrogen: float
    Oxygen: float
    RH_Anode: Optional[float] = None
    RH_Cathode: Optional[float] = None


@app.post('/predict-output')
async def predict(data: PredictionRequest):
    model_type = data.model_type.lower()

    if model_type not in MODEL_PATHS:
        raise HTTPException(status_code = 400, detail = "Invalid model type")
    
    model_path = MODEL_PATHS[model_type]

    if not os.path.exists(model_path):
        raise HTTPException(status_code = 500, detail = "Model file not found")

    if model_type == 'ann':
        model = load_model(model_path, compile = False)
    else:
        model = joblib.load(model_path)

    voltages = []
    powers = []

    # heats = []

    for current in data.I:
        input_data = np.array([[current, data.T, data.Hydrogen, data.Oxygen, data.RH_Anode, data.RH_Cathode]])

        # if model_type == 'linear' or model_type == 'ann' or model_type == 'stack_model' or model_type == 'svr':
        #     input_data = np.append(input_data, [[data.RH_Anode, data.RH_Cathode]], axis = 1)

        
        voltage_pred = float(model.predict(input_data)[0])
        power = current * voltage_pred

        voltages.append(voltage_pred)
        powers.append(power)

    return {
        "currents": data.I,
        "voltages": voltages,
        "powers": powers
    }

