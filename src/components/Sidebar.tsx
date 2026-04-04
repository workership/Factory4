/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  LayoutDashboard, 
  Box, 
  Activity, 
  Calendar, 
  Cpu,
  LogOut,
  MessageSquareText,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const navItems = [
  { id: 'dashboard', label: '决策看板', icon: LayoutDashboard },
  { id: '3d-view', label: '3D 仿真视图', icon: Box },
  { id: 'monitoring', label: '设备监控', icon: Activity },
  { id: 'seedling-system', label: '育秧系统', icon: Cpu },
  { id: 'scheduling', label: '生产排产', icon: Calendar },
  { id: 'feedback', label: 'AI 对话', icon: MessageSquareText },
];

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  return (
    <aside className="w-64 bg-[#0F1219] border-r border-white/5 flex flex-col h-screen sticky top-0">
      <div className="p-6 flex items-center gap-3">
        <div className="w-9 h-9 bg-blue-600/10 rounded-xl flex items-center justify-center shadow-xl shadow-blue-600/20">
          <img src="/icon_.svg" alt="icon" className="w-6 h-6" />
        </div>
        <div className="flex flex-col">
          <h1 className="text-lg font-black text-white tracking-tight leading-none">智秧工厂</h1>
          <span className="text-[8px] text-gray-500 font-bold uppercase tracking-widest mt-1">Industrial OS</span>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group relative overflow-hidden",
              activeTab === item.id 
                ? "bg-blue-600 text-white shadow-xl shadow-blue-600/30" 
                : "text-gray-400 hover:bg-white/5 hover:text-white"
            )}
          >
            <item.icon className={cn("w-5 h-5 transition-transform duration-300 group-hover:scale-110", activeTab === item.id ? "text-white" : "text-gray-500 group-hover:text-white")} />
            <span className="font-bold text-sm tracking-wide">{item.label}</span>
            {activeTab === item.id && (
              <div className="ml-auto w-1 h-4 bg-white/30 rounded-full" />
            )}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-white/5">
        <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-500 hover:text-white transition-colors group">
          <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          <a href="https://dbzhnyjs.neau.edu.cn/" className="font-bold text-xs uppercase tracking-widest">退出系统</a>
        </button>
      </div>
    </aside>
  );
}
