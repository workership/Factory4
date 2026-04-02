/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Activity, Thermometer, Zap, ShieldCheck, AlertCircle, Cpu, Wind } from 'lucide-react';
import { cn } from '../../lib/utils';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export function MonitoringView() {
  const [stats, setStats] = useState({
    temp: 24.2,
    utilization: 68.5,
    energy: 1.25,
    status: 'Running'
  });

  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const newStats = {
        temp: 24 + Math.random() * 2,
        utilization: 60 + Math.random() * 20,
        energy: 1.1 + Math.random() * 0.4,
        status: Math.random() > 0.95 ? 'Idle' : 'Running'
      };
      setStats(newStats);
      
      setHistory(prev => {
        const newHistory = [...prev, { time: new Date().toLocaleTimeString(), value: newStats.utilization }];
        if (newHistory.length > 20) return newHistory.slice(1);
        return newHistory;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-1.5 h-8 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
          <div className="flex flex-col">
            <h2 className="text-2xl font-black text-white tracking-tight leading-none">实时设备监控</h2>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] mt-1">Live Telemetry & System Health</span>
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Live Updates</span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        <StatCard icon={Thermometer} label="当前温度" value={`${stats.temp.toFixed(1)}°C`} trend={stats.temp > 25 ? 'High' : 'Normal'} color="orange" />
        <StatCard icon={Cpu} label="设备利用率" value={`${stats.utilization.toFixed(1)}%`} trend="+1.2%" color="blue" />
        <StatCard icon={Zap} label="实时能耗" value={`${stats.energy.toFixed(2)} kWh`} trend="-0.4%" color="emerald" />
        <StatCard icon={ShieldCheck} label="系统状态" value={stats.status} trend="Stable" color="emerald" />
      </div>

      <div className="flex-1 grid grid-cols-3 gap-8 overflow-hidden">
        <div className="col-span-2 bg-[#161B26] border border-white/5 rounded-3xl p-8 space-y-6 flex flex-col">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-500" /> 设备利用率趋势 (Real-time)
          </h3>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history}>
                <defs>
                  <linearGradient id="colorUtil" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="time" hide />
                <YAxis stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#161B26', border: '1px solid #ffffff10', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="value" stroke="#3b82f6" fillOpacity={1} fill="url(#colorUtil)" isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#161B26] border border-white/5 rounded-3xl p-8 space-y-6 overflow-y-auto custom-scrollbar">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-500" /> 关键工位状态
          </h3>
          <div className="space-y-4">
            <StationStatus name="播种线 A-01" status="Running" health={98} />
            <StationStatus name="播种线 A-02" status="Running" health={95} />
            <StationStatus name="催芽室 B-01" status="Idle" health={100} />
            <StationStatus name="包装线 C-01" status="Running" health={88} />
            <StationStatus name="物流 AGV-04" status="Charging" health={92} />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, trend, color }: any) {
  return (
    <div className="bg-[#161B26] border border-white/5 rounded-2xl p-6 space-y-3">
      <div className="flex justify-between items-center">
        <div className={cn("p-2 rounded-xl bg-white/5", `text-${color}-400`)}>
          <Icon className="w-5 h-5" />
        </div>
        <span className={cn("text-[10px] font-bold uppercase tracking-widest", `text-${color}-500`)}>{trend}</span>
      </div>
      <div>
        <div className="text-xs text-gray-500 font-bold uppercase mb-1">{label}</div>
        <div className="text-2xl font-black text-white">{value}</div>
      </div>
    </div>
  );
}

function StationStatus({ name, status, health }: any) {
  return (
    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-xs font-bold text-white">{name}</span>
        <span className={cn(
          "text-[10px] font-bold uppercase px-2 py-0.5 rounded-full",
          status === 'Running' ? "bg-emerald-500/10 text-emerald-500" : "bg-gray-500/10 text-gray-500"
        )}>{status}</span>
      </div>
      <div className="space-y-1.5">
        <div className="flex justify-between text-[10px] text-gray-500 font-bold uppercase">
          <span>Health</span>
          <span>{health}%</span>
        </div>
        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500" style={{ width: `${health}%` }} />
        </div>
      </div>
    </div>
  );
}
