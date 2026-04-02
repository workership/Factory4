#!/usr/bin/env python3
import json
import os
import sys

import joblib
import pandas as pd


def load_model():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(script_dir, "rice_model.pkl")
    return joblib.load(model_path)


def predict_from_input(input_data, model):
    df = pd.DataFrame([{
        "Tair": input_data.get("currentTemp"),
        "Rhair": input_data.get("currentHumidity"),
        "CO2air": input_data.get("currentCO2"),
        "Tot_PAR": input_data.get("currentLight"),
    }])
    prediction = model.predict(df)[0]
    return {
        "targetTemp": float(prediction[0]),
        "humidityDeficit": float(prediction[1]),
        "co2Set": float(prediction[2]),
        "lightSet": float(prediction[3]),
    }


def main():
    raw_input = sys.stdin.read()
    if not raw_input.strip():
        payload = {
            "currentTemp": 18.6,
            "currentHumidity": 87.8,
            "currentCO2": 620.0,
            "currentLight": 0.0,
        }
    else:
        payload = json.loads(raw_input)

    model = load_model()
    output = predict_from_input(payload, model)
    sys.stdout.write(json.dumps(output))


if __name__ == "__main__":
    main()
