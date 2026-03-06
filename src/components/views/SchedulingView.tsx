/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Calendar, Clock, CheckCircle2, Loader2, AlertCircle, Package, Truck, User } from 'lucide-react';
import { Task } from '../../types';
import { cn } from '../../lib/utils';

interface SchedulingViewProps {
  tasks: Task[];
}

export function SchedulingView({ tasks }: SchedulingViewProps) {
  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-1.5 h-8 bg-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
          <div className="flex flex-col">
            <h2 className="text-2xl font-black text-white tracking-tight leading-none">生产排产与任务进度</h2>
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] mt-1">Production Queue & Real-time Status</span>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-white/5 border border-white/10">
            <span className="text-xs text-gray-500 font-bold uppercase">总任务数:</span>
            <span className="text-xs font-bold text-white">{tasks.length}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {tasks.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
            <div className="p-6 rounded-full bg-white/5 border border-white/10">
              <Package className="w-12 h-12 text-gray-500" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">暂无排产任务</h3>
              <p className="text-sm text-gray-500">请在决策看板中提交新的生产任务</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {tasks.map((task) => (
              <div key={task.id} className="bg-[#161B26] border border-white/5 rounded-3xl p-6 flex items-center gap-8 group hover:border-blue-500/30 transition-all duration-300">
                {/* Status Icon */}
                <div className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 border",
                  task.status === 'completed' ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500" :
                  task.status === 'processing' ? "bg-blue-500/10 border-blue-500/30 text-blue-500" :
                  "bg-white/5 border-white/10 text-gray-500"
                )}>
                  {task.status === 'completed' ? <CheckCircle2 className="w-8 h-8" /> :
                   task.status === 'processing' ? <Loader2 className="w-8 h-8 animate-spin" /> :
                   <Clock className="w-8 h-8" />}
                </div>

                {/* Task Info */}
                <div className="flex-1 grid grid-cols-4 gap-8">
                  <div className="space-y-1">
                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">任务 ID</div>
                    <div className="text-sm font-black text-white">{task.id}</div>
                    <div className="text-[10px] text-gray-600 font-mono">{task.timestamp}</div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">秧苗详情</div>
                    <div className="text-sm font-bold text-white">{task.type}</div>
                    <div className="text-xs text-gray-400">{task.seedlings} kg / {task.area} 亩</div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">预估成本</div>
                    <div className="text-sm font-bold text-emerald-500">¥ {task.totalCost.toLocaleString()}</div>
                    <div className="text-[10px] text-gray-600 uppercase font-bold">已核算完成</div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-end">
                      <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">生产进度</div>
                      <div className="text-xs font-black text-white">{task.progress}%</div>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "h-full transition-all duration-1000",
                          task.status === 'completed' ? "bg-emerald-500" : "bg-blue-500"
                        )} 
                        style={{ width: `${task.progress}%` }} 
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button className="p-3 rounded-xl bg-white/5 border border-white/10 text-gray-500 hover:text-white hover:bg-white/10 transition-all">
                    <AlertCircle className="w-5 h-5" />
                  </button>
                  <button className="p-3 rounded-xl bg-white/5 border border-white/10 text-gray-500 hover:text-white hover:bg-white/10 transition-all">
                    <Truck className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
