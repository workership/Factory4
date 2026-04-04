import { Router } from "express";
import { sensorData } from "../state";

const router = Router();

router.get("/", (req, res) => {
  res.json({ status: Object.keys(sensorData).length > 0 ? "ok" : "waiting", data: sensorData });
});

router.get("/summary", (req, res) => {
  res.json({
    currentTemp: sensorData.temperature || sensorData.temp || 0,
    currentHumidity: sensorData.humidity || 0,
    currentCO2: sensorData.co2 || 0,
    currentLight: sensorData.light || sensorData.illuminance || 0,
  });
});

router.get("/:name", (req, res) => {
  const name = req.params.name;
  if (sensorData[name] !== undefined) {
    return res.json({ name, value: sensorData[name] });
  }
  return res.status(404).json({ error: `传感器 ${name} 未找到`, available: Object.keys(sensorData) });
});

export default router;
