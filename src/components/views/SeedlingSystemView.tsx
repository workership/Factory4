/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Thermometer, 
  Sun, 
  Droplets, 
  Wind, 
  RotateCcw, 
  Zap,
  Activity,
  Sprout,
  Binary,
  BarChart3,
  Network,
  Terminal,
  Gauge
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, PolarRadiusAxis } from 'recharts';

export function SeedlingSystemView() {
  const [env, setEnv] = useState({
    temp: 22.5,
    light: 450,
    humidity: 65,
    soilMoisture: 40
  });

  const [thresholds, setThresholds] = useState({
    temp: 23.8,
    light: 480,
    humidity: 68,
    moisture: 38
  });

  const [overrides, setOverrides] = useState({
    heating: null as boolean | null,
    lighting: null as boolean | null,
    humidifying: null as boolean | null,
    irrigating: null as boolean | null,
  });

  const [modelMetrics, setModelMetrics] = useState({
    confidence: 0.982,
    latency: 12, // ms
    iterations: 1500,
    gain: 42.5,
    sensitivity: 0.5
  });

  const [actions, setActions] = useState({
    heating: false,
    lighting: false,
    humidifying: false,
    irrigating: false,
    rotationSpeed: 5 // rpm
  });

  const [sensorInput, setSensorInput] = useState({
    currentTemp: 18.6,
    currentHumidity: 87.8,
    currentCO2: 620.0,
    currentLight: 0.0,
  });

  const [prediction, setPrediction] = useState<{
    targetTemp: number;
    humidityDeficit: number;
    co2Set: number;
    lightSet: number;
  } | null>(null);

  const [predictionStatus, setPredictionStatus] = useState('Loading model...');

  useEffect(() => {
    const fetchPrediction = async () => {
      setPredictionStatus('Loading model...');
      try {
        const response = await fetch('/api/predict');
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.error || '预测请求失败');
        }
        setSensorInput(data.input);
        setPrediction(data.prediction);
        setPredictionStatus('模型已加载');
      } catch (err) {
        console.error('Predict API error:', err);
        setPredictionStatus('预测失败');
      }
    };

    fetchPrediction();
    const interval = setInterval(fetchPrediction, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setEnv(prevEnv => ({
        temp: Math.max(15, Math.min(35, prevEnv.temp + (Math.random() - 0.5) * 0.4)),
        light: Math.max(0, Math.min(1000, prevEnv.light + (Math.random() - 0.5) * 15)),
        humidity: Math.max(30, Math.min(90, prevEnv.humidity + (Math.random() - 0.5) * 0.8)),
        soilMoisture: Math.max(15, Math.min(60, prevEnv.soilMoisture + (Math.random() - 0.5) * 0.6))
      }));

      setModelMetrics(prev => ({
        ...prev,
        confidence: Math.max(0.92, Math.min(0.99, prev.confidence + (Math.random() - 0.5) * 0.01)),
        latency: 10 + Math.floor(Math.random() * 5)
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const targetLight = prediction ? 200 + prediction.lightSet * 80 : thresholds.light;
    const humidityTarget = prediction ? thresholds.humidity - prediction.humidityDeficit : thresholds.humidity;

    setActions({
      heating: overrides.heating !== null ? overrides.heating : env.temp < (prediction ? prediction.targetTemp : thresholds.temp),
      lighting: overrides.lighting !== null ? overrides.lighting : env.light < targetLight,
      humidifying: overrides.humidifying !== null ? overrides.humidifying : env.humidity < humidityTarget,
      irrigating: overrides.irrigating !== null ? overrides.irrigating : env.soilMoisture < thresholds.moisture,
      rotationSpeed: env.light > 550 ? 7 : 4
    });
  }, [env, thresholds, overrides, prediction]);

  const normalize = (value: number, min: number, max: number) => Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));

  const radarData = [
    { subject: '温度', A: normalize(env.temp, 15, 35), B: normalize(prediction ? prediction.targetTemp : thresholds.temp, 15, 35), fullMark: 100 },
    { subject: '光照', A: normalize(env.light, 0, 1000), B: normalize(prediction ? 200 + prediction.lightSet * 80 : thresholds.light, 0, 1000), fullMark: 100 },
    { subject: '湿度', A: normalize(env.humidity, 30, 90), B: normalize(prediction ? thresholds.humidity - prediction.humidityDeficit : thresholds.humidity, 30, 90), fullMark: 100 },
    { subject: '水分', A: normalize(env.soilMoisture, 15, 60), B: normalize(thresholds.moisture, 15, 60), fullMark: 100 },
    { subject: '转速', A: normalize(actions.rotationSpeed, 1, 8), B: normalize(7, 1, 8), fullMark: 100 },
  ];

  return (
    <div className="h-full flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
      {/* Header with Algorithm Branding */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-1.5 h-8 bg-purple-600 rounded-full shadow-[0_0_15px_rgba(147,51,234,0.5)]" />
          <div className="flex flex-col">
            <h2 className="text-2xl font-black text-white tracking-tight leading-none">智能育秧控制系统</h2>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] mt-1">AI-Driven Environmental Correction Engine</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <ModelStat label="系统可靠度" value={`${(modelMetrics.confidence * 100).toFixed(2)}%`} icon={ShieldCheck} color="emerald" />
          <ModelStat label="响应延迟" value={`${modelMetrics.latency}ms`} icon={Zap} color="blue" />
          <div className="h-10 w-px bg-white/10" />
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">System Engine Online</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left: Algorithm Visualization */}
        <div className="col-span-4 flex flex-col gap-6">
          <div className="flex-1 bg-[#161B26] border border-white/5 rounded-3xl p-8 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.05)_0%,transparent_70%)]" />
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-8 self-start flex items-center gap-2">
              <Network className="w-4 h-4 text-purple-400" /> 环境特征向量空间
            </h3>
            
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="#ffffff10" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 10, fontWeight: 'bold' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} hide />
                  <Radar
                    name="当前"
                    dataKey="A"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.2}
                  />
                  <Radar
                    name="目标"
                    dataKey="B"
                    stroke="#8b5cf6"
                    fill="#8b5cf6"
                    fillOpacity={0.1}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4 w-full">
              <FeatureImportance label="温度特征" value={85} color="rose" />
              <FeatureImportance label="光照特征" value={92} color="orange" />
              <FeatureImportance label="湿度特征" value={64} color="blue" />
              <FeatureImportance label="水分特征" value={78} color="emerald" />
            </div>
          </div>

          <div className="bg-[#161B26] border border-white/5 rounded-3xl p-6 space-y-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
              <Terminal className="w-4 h-4 text-gray-400" /> 系统决策日志
            </h3>
            <div className="space-y-2 font-mono text-[10px]">
              <div className="text-emerald-400/80">[03:22:45] System::Execute(env_vector) -&gt; Success</div>
              <div className="text-blue-400/80">[03:22:47] FeatureMap::Update(temp, light)</div>
              <div className="text-emerald-400/80">[03:22:49] LogicTree::Traverse(depth=12)</div>
              <div className="text-gray-500">[03:22:51] ActionQueue::Push(lighting_active)</div>
            </div>
          </div>
        </div>

        {/* Middle: Real-time Control */}
        <div className="col-span-5 flex flex-col gap-6">
          <div className="flex-1 bg-[#161B26] border border-white/5 rounded-3xl p-8 space-y-8 overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Gauge className="w-5 h-5 text-blue-500" /> 实时修正执行器
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-gray-500 font-bold uppercase">人工干预模式</span>
                <div 
                  className={cn(
                    "w-8 h-4 rounded-full relative cursor-pointer transition-colors",
                    Object.values(overrides).some(v => v !== null) ? "bg-orange-500" : "bg-gray-700"
                  )}
                  onClick={() => setOverrides({ heating: null, lighting: null, humidifying: null, irrigating: null })}
                >
                  <div className={cn(
                    "absolute top-1 w-2 h-2 bg-white rounded-full transition-all",
                    Object.values(overrides).some(v => v !== null) ? "right-1" : "left-1"
                  )} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <ControlNode 
                label="加温补偿" 
                active={actions.heating} 
                icon={Thermometer} 
                color="rose" 
                value={`${env.temp.toFixed(1)}°C`}
                isOverridden={overrides.heating !== null}
                onToggle={() => setOverrides(prev => ({ ...prev, heating: prev.heating === null ? !actions.heating : (prev.heating ? false : null) }))}
              />
              <ControlNode 
                label="补光增强" 
                active={actions.lighting} 
                icon={Sun} 
                color="orange" 
                value={`${env.light.toFixed(0)} Lux`}
                isOverridden={overrides.lighting !== null}
                onToggle={() => setOverrides(prev => ({ ...prev, lighting: prev.lighting === null ? !actions.lighting : (prev.lighting ? false : null) }))}
              />
              <ControlNode 
                label="湿度调节" 
                active={actions.humidifying} 
                icon={Droplets} 
                color="blue" 
                value={`${env.humidity.toFixed(1)}%`}
                isOverridden={overrides.humidifying !== null}
                onToggle={() => setOverrides(prev => ({ ...prev, humidifying: prev.humidifying === null ? !actions.humidifying : (prev.humidifying ? false : null) }))}
              />
              <ControlNode 
                label="精准灌溉" 
                active={actions.irrigating} 
                icon={Wind} 
                color="emerald" 
                value={`${env.soilMoisture.toFixed(1)}%`}
                isOverridden={overrides.irrigating !== null}
                onToggle={() => setOverrides(prev => ({ ...prev, irrigating: prev.irrigating === null ? !actions.irrigating : (prev.irrigating ? false : null) }))}
              />
            </div>

            <div className="space-y-6 pt-4 border-t border-white/5">
              <h4 className="text-[10px] text-gray-500 font-black uppercase tracking-widest">控制决策阈值设定</h4>
              <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                <ThresholdSlider label="目标温度" value={thresholds.temp} min={15} max={35} unit="°C" onChange={(v) => setThresholds({...thresholds, temp: v})} />
                <ThresholdSlider label="目标光照" value={thresholds.light} min={200} max={800} unit="Lux" onChange={(v) => setThresholds({...thresholds, light: v})} />
                <ThresholdSlider label="目标湿度" value={thresholds.humidity} min={40} max={90} unit="%" onChange={(v) => setThresholds({...thresholds, humidity: v})} />
                <ThresholdSlider label="目标水分" value={thresholds.moisture} min={20} max={60} unit="%" onChange={(v) => setThresholds({...thresholds, moisture: v})} />
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-black/30 border border-white/5 flex flex-col items-center gap-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
              <div className="w-full flex justify-between items-center">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">系统反应灵敏度</span>
                <span className="text-xs font-bold text-emerald-400">{(modelMetrics.sensitivity * 100).toFixed(0)}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.01" 
                value={modelMetrics.sensitivity} 
                onChange={(e) => setModelMetrics({...modelMetrics, sensitivity: parseFloat(e.target.value)})}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Right: Metrics & Insights */}
        <div className="col-span-3 flex flex-col gap-6">
          <div className="bg-gradient-to-br from-purple-600 to-indigo-800 rounded-3xl p-6 text-white space-y-4 shadow-xl shadow-purple-600/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 opacity-80">
                <Binary className="w-4 h-4" />
                <h3 className="font-bold text-xs uppercase tracking-widest">智能预测与增益分析</h3>
              </div>
              <span className="text-[9px] text-white/60">{predictionStatus}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="text-[9px] opacity-60 uppercase font-bold">效率提升</div>
                <div className="text-2xl font-black">+{modelMetrics.gain}%</div>
              </div>
              <div>
                <div className="text-[9px] opacity-60 uppercase font-bold">目标温度</div>
                <div className="text-2xl font-black">{prediction ? `${prediction.targetTemp.toFixed(1)}°C` : '--'}</div>
              </div>
              <div>
                <div className="text-[9px] opacity-60 uppercase font-bold">能耗优化</div>
                <div className="text-lg font-bold">18.4%</div>
              </div>
              <div>
                <div className="text-[9px] opacity-60 uppercase font-bold">补光设定</div>
                <div className="text-2xl font-black">{prediction ? `${prediction.lightSet.toFixed(1)}` : '--'}</div>
              </div>
            </div>
          </div>

          <div className="bg-[#161B26] border border-white/5 rounded-3xl p-6 space-y-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
              <Sprout className="w-4 h-4" /> 预测调控目标
            </h3>
            <div className="grid grid-cols-2 gap-3 text-[11px]">
              <div className="rounded-xl bg-white/5 p-3 space-y-1">
                <div className="text-gray-400 uppercase font-bold">湿度赤字</div>
                <div className="text-lg font-black text-cyan-400">{prediction ? `${prediction.humidityDeficit.toFixed(2)}` : '--'}</div>
              </div>
              <div className="rounded-xl bg-white/5 p-3 space-y-1">
                <div className="text-gray-400 uppercase font-bold">CO2 设定</div>
                <div className="text-lg font-black text-emerald-400">{prediction ? `${prediction.co2Set.toFixed(1)}` : '--'}</div>
              </div>
              <div className="rounded-xl bg-white/5 p-3 space-y-1">
                <div className="text-gray-400 uppercase font-bold">实时温度</div>
                <div className="text-lg font-black text-orange-400">{sensorInput.currentTemp.toFixed(1)}°C</div>
              </div>
              <div className="rounded-xl bg-white/5 p-3 space-y-1">
                <div className="text-gray-400 uppercase font-bold">实时光照</div>
                <div className="text-lg font-black text-yellow-400">{sensorInput.currentLight.toFixed(0)}</div>
              </div>
            </div>
          </div>

          <div className="flex-1 bg-[#161B26] border border-white/5 rounded-3xl p-6 space-y-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-400" /> 系统运行统计
            </h3>
            <div className="space-y-4">
              <MetricProgress label="逻辑迭代" value={modelMetrics.iterations} max={2000} color="blue" />
              <MetricProgress label="控制偏差" value={0.042} max={0.1} color="rose" inverse />
              <MetricProgress label="特征覆盖" value={98.5} max={100} color="emerald" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ModelStat({ label, value, icon: Icon, color }: any) {
  return (
    <div className="flex flex-col items-end">
      <div className="flex items-center gap-2 text-gray-500">
        <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
        <Icon className={cn("w-3 h-3", `text-${color}-400`)} />
      </div>
      <span className="text-sm font-black text-white">{value}</span>
    </div>
  );
}

function FeatureImportance({ label, value, color }: any) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-[9px] text-gray-500 font-bold uppercase">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
        <div className={cn("h-full transition-all duration-1000", `bg-${color}-500`)} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function ControlNode({ label, active, icon: Icon, color, value, isOverridden, onToggle }: any) {
  return (
    <div 
      onClick={onToggle}
      className={cn(
        "p-5 rounded-2xl border transition-all duration-500 flex flex-col gap-4 cursor-pointer group",
        active ? `bg-${color}-500/10 border-${color}-500/30 shadow-lg shadow-${color}-500/5` : "bg-white/5 border-white/5 opacity-40 hover:opacity-60",
        isOverridden && "ring-1 ring-orange-500 ring-offset-2 ring-offset-[#161B26]"
      )}
    >
      <div className="flex justify-between items-start">
        <div className={cn("p-2.5 rounded-xl bg-white/5", active ? `text-${color}-400` : "text-gray-500")}>
          <Icon className="w-5 h-5" />
        </div>
        <div className={cn(
          "px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest",
          active ? `bg-${color}-500 text-white` : "bg-white/5 text-gray-600"
        )}>
          {isOverridden ? 'Manual' : (active ? 'Active' : 'Standby')}
        </div>
      </div>
      <div>
        <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-0.5">{label}</div>
        <div className="text-lg font-black text-white">{value}</div>
      </div>
    </div>
  );
}

function ThresholdSlider({ label, value, min, max, unit, onChange }: any) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-[9px] text-gray-500 font-bold uppercase">{label}</span>
        <span className="text-[10px] font-mono text-white">{value.toFixed(1)}{unit}</span>
      </div>
      <input 
        type="range" 
        min={min} 
        max={max} 
        step="0.1" 
        value={value} 
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1 bg-white/5 rounded-lg appearance-none cursor-pointer accent-blue-500"
      />
    </div>
  );
}

function MetricProgress({ label, value, max, color, inverse }: any) {
  const percentage = inverse ? (1 - value / max) * 100 : (value / max) * 100;
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-[10px] text-gray-500 font-bold uppercase">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
        <div className={cn("h-full transition-all duration-1000", `bg-${color}-500`)} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

function ShieldCheck(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
