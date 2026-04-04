import { Router } from "express";
import { sensorData } from "../state";
import { runPythonPrediction } from "../services/python";

const router = Router();

router.get("/", (req, res) => {
  const envInput = {
    currentTemp: sensorData.temperature || sensorData.temp || 18 + Math.random() * 6,
    currentHumidity: sensorData.humidity || 70 + Math.random() * 20,
    currentCO2: sensorData.co2 || 420 + Math.random() * 260,
    currentLight: sensorData.light || sensorData.illuminance || Math.random() * 1000,
  };

  runPythonPrediction(envInput, (err, prediction) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ input: envInput, prediction, source: Object.keys(sensorData).length > 0 ? "MQTT 传感器" : "模拟数据" });
  });
});

router.post("/", (req, res) => {
  const body = req.body || {};
  const envInput = {
    currentTemp: typeof body.currentTemp === "number" ? body.currentTemp : sensorData.temperature || 18.6,
    currentHumidity: typeof body.currentHumidity === "number" ? body.currentHumidity : sensorData.humidity || 87.8,
    currentCO2: typeof body.currentCO2 === "number" ? body.currentCO2 : sensorData.co2 || 620.0,
    currentLight: typeof body.currentLight === "number" ? body.currentLight : sensorData.light || 0.0,
  };

  runPythonPrediction(envInput, (err, prediction) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ input: envInput, prediction });
  });
});

export default router;
