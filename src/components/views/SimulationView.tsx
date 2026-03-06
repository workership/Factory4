/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Box, Play, Maximize2, Layers } from 'lucide-react';

export function SimulationView() {
  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Box className="w-6 h-6 text-blue-500" />
          <h2 className="text-2xl font-bold text-white tracking-tight">3D 仿真视图</h2>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-xs font-bold text-gray-400 hover:text-white transition-colors flex items-center gap-2">
            <Layers className="w-4 h-4" /> 切换场景
          </button>
          <button className="px-4 py-2 rounded-lg bg-blue-600 border border-blue-500 text-xs font-bold text-white hover:bg-blue-500 transition-colors flex items-center gap-2">
            <Maximize2 className="w-4 h-4" /> 全屏查看
          </button>
        </div>
      </div>

      <div className="flex-1 bg-[#161B26] border border-white/5 rounded-3xl overflow-hidden relative group">
        {/* Video Player */}
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          className="w-full h-full object-cover opacity-80"
        >
          <source src="/sources/仿真.mp4" type="video/mp4" />
          您的浏览器不支持视频播放。
        </video>

        {/* Overlay Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
        
        {/* HUD Overlay */}
        <div className="absolute inset-0 p-8 flex flex-col justify-between pointer-events-none">
          <div className="flex justify-between items-start">
            <div className="px-4 py-2 rounded-xl bg-black/60 border border-white/10 backdrop-blur-md flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-white uppercase tracking-widest">Simulation Active</span>
            </div>
            
          </div>

         { /*<div className="flex justify-center">
            <div className="px-8 py-3 rounded-2xl bg-black/60 border border-white/10 backdrop-blur-md flex items-center gap-6">
              <HUDStat label="CPU" value="42%" />
              <div className="w-px h-6 bg-white/10" />
              <HUDStat label="GPU" value="68%" />
              <div className="w-px h-6 bg-white/10" />
              <HUDStat label="MEM" value="4.2GB" />
            </div>
          </div>*/}
        </div>

        {/* Playback Controls (Visual Only) */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          
        </div>
      </div>
    </div>
  );
}

function HUDStat({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">{label}</span>
      <span className="text-xs font-bold text-white">{value}</span>
    </div>
  );
}
