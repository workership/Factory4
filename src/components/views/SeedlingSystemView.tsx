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

  // XGBoost Mock Algorithm
  useEffect(() => {
    const interval = setInterval(() => {
      const sensitivityFactor = modelMetrics.sensitivity * 2;
      const newEnv = {
        temp: env.temp + (Math.random() - 0.5) * 0.4 * sensitivityFactor,
        light: env.light + (Math.random() - 0.5) * 15 * sensitivityFactor,
        humidity: env.humidity + (Math.random() - 0.5) * 0.8 * sensitivityFactor,
        soilMoisture: env.soilMoisture - 0.05
      };
      setEnv(newEnv);

      // XGBoost Decision Logic with Overrides
      const newActions = {
        heating: overrides.heating !== null ? overrides.heating : newEnv.temp < thresholds.temp,
        lighting: overrides.lighting !== null ? overrides.lighting : newEnv.light < thresholds.light,
        humidifying: overrides.humidifying !== null ? overrides.humidifying : newEnv.humidity < thresholds.humidity,
        irrigating: overrides.irrigating !== null ? overrides.irrigating : newEnv.soilMoisture < thresholds.moisture,
        rotationSpeed: newEnv.light > 550 ? 7 : 4
      };
      setActions(newActions);
      
      setModelMetrics(prev => ({
        ...prev,
        confidence: 0.97 + Math.random() * 0.02,
        latency: 10 + Math.floor(Math.random() * 5)
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, [env, thresholds, overrides, modelMetrics.sensitivity]);

  const radarData = [
    { subject: '温度', A: (env.temp / 30) * 100, fullMark: 100 },
    { subject: '光照', A: (env.light / 1000) * 100, fullMark: 100 },
    { subject: '湿度', A: env.humidity, fullMark: 100 },
    { subject: '水分', A: env.soilMoisture * 2, fullMark: 100 },
    { subject: '转速', A: actions.rotationSpeed * 10, fullMark: 100 },
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
                    name="Environment"
                    dataKey="A"
                    stroke="#8b5cf6"
                    fill="#8b5cf6"
                    fillOpacity={0.3}
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
          <div className="bg-gradient-to-br from-purple-600 to-indigo-800 rounded-3xl p-8 text-white space-y-6 shadow-xl shadow-purple-600/20">
            <div className="flex items-center gap-2 opacity-80">
              <Binary className="w-5 h-5" />
              <h3 className="font-bold text-sm uppercase tracking-widest">系统增益分析</h3>
            </div>
            <div className="space-y-1">
              <div className="text-xs opacity-70">预估生产效率提升</div>
              <div className="text-4xl font-black">+{modelMetrics.gain}%</div>
            </div>
            <div className="pt-4 border-t border-white/10 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] opacity-60 uppercase font-bold">能耗优化率</span>
                <span className="text-sm font-bold">18.4%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] opacity-60 uppercase font-bold">秧苗健壮度提升</span>
                <span className="text-sm font-bold">12.5%</span>
              </div>
            </div>
          </div>

          <div className="flex-1 bg-[#161B26] border border-white/5 rounded-3xl p-8 space-y-6">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-400" /> 系统运行统计
            </h3>
            <div className="space-y-6">
              <MetricProgress label="逻辑迭代次数" value={modelMetrics.iterations} max={2000} color="blue" />
              <MetricProgress label="控制偏差率" value={0.042} max={0.1} color="rose" inverse />
              <MetricProgress label="特征覆盖率" value={98.5} max={100} color="emerald" />
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
