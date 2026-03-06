/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Info, 
  Settings, 
  Calculator, 
  CheckCircle2, 
  PlusCircle,
  TrendingUp,
  Zap,
  Droplets,
  Package,
  Truck,
  Loader2,
  ChevronRight,
  Database,
  Cpu,
  Coins
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { 
  BasicConfig, 
  ClientConfig, 
  ServerConfig, 
  ServerConfigSection,
  Task 
} from '../../types';
import { 
  DEFAULT_BASIC_CONFIG, 
  DEFAULT_CLIENT_CONFIG, 
  DEFAULT_SERVER_CONFIG 
} from '../../constants';
import { calculateTaskResults } from '../../services/calculationService';

interface DashboardViewProps {
  onAddTask: (task: Task) => void;
}

export function DashboardView({ onAddTask }: DashboardViewProps) {
  const [basicConfig, setBasicConfig] = useState<BasicConfig>(DEFAULT_BASIC_CONFIG);
  const [clientConfig, setClientConfig] = useState<ClientConfig>(DEFAULT_CLIENT_CONFIG);
  const [serverConfig, setServerConfig] = useState<ServerConfig>(DEFAULT_SERVER_CONFIG);
  
  const [results, setResults] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Ratio: seeds per mu (5kg/mu)
  const SEEDS_PER_MU = 5;

  // Initial calculation
  useEffect(() => {
    handleCalculate();
  }, []);

  const handleCalculate = () => {
    setIsCalculating(true);
    // Simulate backend processing delay
    setTimeout(() => {
      const res = calculateTaskResults(basicConfig, clientConfig, serverConfig);
      setResults(res);
      setIsCalculating(false);
    }, 1000);
  };

  const handleSeedlingsChange = (val: number) => {
    setClientConfig({
      ...clientConfig,
      seedlings: val,
      area: Number((val / SEEDS_PER_MU).toFixed(2))
    });
  };

  const handleAreaChange = (val: number) => {
    setClientConfig({
      ...clientConfig,
      area: val,
      seedlings: Number((val * SEEDS_PER_MU).toFixed(2))
    });
  };

  const handleConfirmSubmit = async () => {
    const newTask: Task = {
      id: `TASK-${Math.floor(Math.random() * 1000000)}`,
      seedlings: clientConfig.seedlings,
      type: clientConfig.selected_type,
      area: clientConfig.area,
      status: 'pending',
      progress: 0,
      timestamp: new Date().toLocaleString(),
      totalCost: results.totalCost,
      details: results.details
    };

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTask),
      });

      if (response.ok) {
        onAddTask(newTask);
        setIsSubmitted(true);
        setTimeout(() => setIsSubmitted(false), 3000);
      }
    } catch (error) {
      console.error('Failed to submit task:', error);
    }
  };

  const updateServerConfig = (section: keyof ServerConfig, sub: keyof ServerConfigSection, key: string, val: number) => {
    setServerConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [sub]: {
          ...prev[section][sub],
          [key]: val
        }
      }
    }));
  };

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <div className="w-1.5 h-8 bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.5)]" />
        <div className="flex flex-col">
          <h2 className="text-2xl font-black text-white tracking-tight leading-none">数字化决策看板</h2>
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] mt-1">Digital Twin Analysis & Forecasting</span>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-3 gap-8 overflow-hidden">
        {/* Column 1: Intro & Client Input */}
        <div className="flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
          {/* System Intro */}
          <div className="bg-[#161B26] border border-white/5 rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-blue-400">
              <Info className="w-5 h-5" />
              <h3 className="font-bold text-sm uppercase tracking-widest">系统基本介绍</h3>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              本系统集成先进的工业4.0数字孪生技术与XGBoost非线性损耗模型，为寒地立体育秧工厂提供全方位的成本核算、资源调度与稳健性分析。
            </p>
          </div>

          {/* Client Input */}
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-3xl p-6 space-y-6">
            <div className="flex items-center gap-2 text-emerald-400">
              <Calculator className="w-5 h-5" />
              <h3 className="font-bold text-sm uppercase tracking-widest">用户端输入 (Client)</h3>
            </div>
            
            <div className="space-y-4">
              <InputGroup label="水稻种子量 (kg)" value={clientConfig.seedlings} onChange={handleSeedlingsChange} />
              <div className="space-y-1.5">
                <label className="text-xs text-gray-400">水稻品种</label>
                <select 
                  value={clientConfig.selected_type}
                  onChange={(e) => setClientConfig({...clientConfig, selected_type: e.target.value})}
                  className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-all"
                >
                  {clientConfig.seedings_type.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <InputGroup label="播种面积 (亩)" value={clientConfig.area} onChange={handleAreaChange} />

              <button 
                onClick={handleCalculate}
                disabled={isCalculating}
                className="w-full py-4 bg-emerald-600 text-white rounded-xl font-bold text-sm hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-600/20 active:scale-95 flex items-center justify-center gap-2"
              >
                {isCalculating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Database className="w-5 h-5" />}
                {isCalculating ? "后端计算中..." : "同步决策方案"}
              </button>
            </div>
          </div>
        </div>

        {/* Column 2: Management Input (Detailed) */}
        <div className="flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
          <div className="bg-orange-500/5 border border-orange-500/20 rounded-3xl p-6 space-y-6">
            <div className="flex items-center gap-2 text-orange-400">
              <Settings className="w-5 h-5" />
              <h3 className="font-bold text-sm uppercase tracking-widest">管理端输入 (Server)</h3>
            </div>

            <div className="space-y-8">
              {/* Basic Config */}
              <ConfigSection title="基础能源单价">
                <div className="grid grid-cols-2 gap-4">
                  <InputGroup label="电价 (元/度)" value={basicConfig.electricity} onChange={(v) => setBasicConfig({...basicConfig, electricity: v})} step={0.01} />
                  <InputGroup label="水价 (元/吨)" value={basicConfig.water} onChange={(v) => setBasicConfig({...basicConfig, water: v})} step={0.1} />
                </div>
              </ConfigSection>

              {Object.entries(serverConfig).map(([sectionKey, section]) => {
                const sectionLabels: Record<string, string> = {
                  rice_seed_soaking: '浸种环节',
                  soil_preparation_and_seeds: '播种合盘',
                  seedling_nursery: '育秧环节',
                  conveying: '传送入库'
                };
                const subLabels: Record<string, string> = {
                  flexible: '变动参数',
                  fixed: '固定资产',
                  fixed_power: '设备功率',
                  fixed_number: '设备数量'
                };
                const keyLabels: Record<string, string> = {
                  water_assumptions: '用水量 (kg/kg)',
                  salt_assumptions: '盐分消耗 (kg/kg)',
                  seed_fee: '种子单价 (元/kg)',
                  soaking_pool: '浸种池原值 (元)',
                  soaking_pool_power: '处理能力 (kg/h)',
                  soaking_pool_number: '池体数量',
                  growing_medium: '育秧土消耗 (kg/kg)',
                  electric_assumptions: '电耗系数 (度/kg)',
                  seeding_tray: '秧盘配比 (个/kg)',
                  oil_preparation: '燃油消耗 (L/kg)',
                  humidifier: '加湿器原值 (元)',
                  thermostatic_system: '恒温系统原值 (元)',
                  mixer: '搅拌机原值 (元)',
                  humidifier_power: '加湿器功率 (W)',
                  thermostatic_system_power: '恒温功率 (W)',
                  mixer_power: '搅拌机功率 (W)',
                  humidifier_number: '加湿器数量',
                  thermostatic_system_number: '系统数量',
                  mixer_number: '搅拌机数量',
                  moto_electric_assumptions: '电机电耗 (度/kg)',
                  hotair_assumptions: '热风电耗 (度/kg)',
                  lighting_assumptions: '补光电耗 (度/kg)',
                  heater: '加热器原值 (元)',
                  grow_light: '补光灯原值 (元)',
                  nursing_frame: '育秧架原值 (元)',
                  heater_power: '加热器功率 (W)',
                  grow_light_power: '补光灯功率 (W)',
                  nursing_frame_power: '育秧架功率 (W)',
                  heater_number: '加热器数量',
                  grow_light_number: '补光灯数量',
                  nursing_frame_number: '育秧架数量',
                  conveyor_belt: '传送带原值 (元)',
                  conveyor_belt_power: '传送带功率 (W)',
                  conveyor_belt_number: '传送带数量'
                };

                return (
                  <ConfigSection key={sectionKey} title={sectionLabels[sectionKey] || sectionKey}>
                    <div className="space-y-4">
                      {Object.entries(section).map(([subKey, sub]) => (
                        <div key={subKey} className="space-y-2">
                          <div className="text-[9px] text-gray-600 font-black uppercase tracking-widest">{subLabels[subKey] || subKey}</div>
                          <div className="grid grid-cols-2 gap-3">
                            {Object.entries(sub as Record<string, number>).map(([key, val]) => (
                              <InputGroup 
                                key={key} 
                                label={keyLabels[key] || key} 
                                value={val} 
                                onChange={(v) => updateServerConfig(sectionKey as keyof ServerConfig, subKey as keyof ServerConfigSection, key, v)} 
                                step={val < 1 ? 0.001 : 1}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ConfigSection>
                );
              })}
            </div>
          </div>
        </div>

        {/* Column 3: Results (Detailed) */}
        <div className="flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar relative">
          {isCalculating && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-10 flex flex-col items-center justify-center space-y-4 rounded-3xl">
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
              <div className="text-sm font-bold text-white uppercase tracking-widest animate-pulse">正在同步后端数据...</div>
            </div>
          )}

          {results && (
            <>
              {/* User View */}
              <div className="bg-gradient-to-br from-blue-600 to-blue-800 border border-blue-500/20 rounded-3xl p-8 text-white space-y-6 shadow-xl shadow-blue-600/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 opacity-80">
                    <Package className="w-5 h-5" />
                    <h3 className="font-bold text-sm uppercase tracking-widest">用户决策概览</h3>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-white/10 text-[10px] font-bold uppercase tracking-widest">
                    方案 ID: {Math.floor(Math.random() * 10000)}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="text-xs opacity-70">预估总生产费用</div>
                  <div className="text-5xl font-black tracking-tighter">¥ {results.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/10">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                    <div className="text-[10px] opacity-60 uppercase font-bold mb-1">平均亩产成本</div>
                    <div className="text-xl font-bold">¥ {(results.totalCost / clientConfig.area).toFixed(2)}</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                    <div className="text-[10px] opacity-60 uppercase font-bold mb-1">单位产量成本</div>
                    <div className="text-xl font-bold">¥ {(results.totalCost / clientConfig.seedlings).toFixed(2)}</div>
                  </div>
                </div>
              </div>

              {/* Management View (Detailed Breakdown) */}
              <div className="bg-[#161B26] border border-white/5 rounded-3xl p-8 space-y-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-purple-400">
                    <Coins className="w-5 h-5" />
                    <h3 className="font-bold text-sm uppercase tracking-widest">资源消耗汇总清单</h3>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <ResourceItem label="总耗电量" value={`${results.resources.elecAmount.toFixed(2)} 度`} icon={Zap} color="blue" />
                  <ResourceItem label="总耗水量" value={`${results.resources.waterAmount.toFixed(2)} kg`} icon={Droplets} color="emerald" />
                  <ResourceItem label="育秧土消耗" value={`${results.resources.soilAmount.toFixed(2)} kg`} icon={Package} color="orange" />
                  <ResourceItem label="燃油消耗" value={`${results.resources.oilAmount.toFixed(2)} L`} icon={TrendingUp} color="rose" />
                  <ResourceItem label="秧盘需求" value={`${results.resources.trayAmount.toFixed(0)} 个`} icon={CheckCircle2} color="emerald" />
                  <ResourceItem label="固定资产原值" value={`¥ ${results.details.fixed.toLocaleString()}`} icon={Database} color="purple" />
                </div>

                <div className="pt-6 border-t border-white/5">
                  <button 
                    onClick={handleConfirmSubmit}
                    disabled={isSubmitted}
                    className={cn(
                      "w-full py-5 rounded-2xl flex items-center justify-center gap-3 font-bold text-sm transition-all duration-300 shadow-lg",
                      isSubmitted 
                        ? "bg-emerald-600 text-white shadow-emerald-600/20" 
                        : "bg-white text-black hover:bg-gray-100 shadow-white/10"
                    )}
                  >
                    {isSubmitted ? (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        <span>任务已成功提交至队列</span>
                      </>
                    ) : (
                      <>
                        <PlusCircle className="w-5 h-5" />
                        <span>确认并提交生产任务</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ResourceItem({ label, value, icon: Icon, color }: any) {
  return (
    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Icon className={cn("w-4 h-4", `text-${color}-400`)} />
        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{label}</span>
      </div>
      <span className="text-lg font-black text-white">{value}</span>
    </div>
  );
}

function InputGroup({ label, value, onChange, step = 1 }: { label: string, value: number, onChange: (v: number) => void, step?: number, key?: React.Key }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{label}</label>
      <input 
        type="number" 
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 transition-all"
      />
    </div>
  );
}

function ConfigSection({ title, children }: { title: string, children: React.ReactNode, key?: React.Key }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-1 h-4 bg-blue-500 rounded-full" />
        <h4 className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">{title}</h4>
      </div>
      {children}
    </div>
  );
}

function StageBreakdown({ title, data, icon: Icon, color }: any) {
  return null; // Unused
}
