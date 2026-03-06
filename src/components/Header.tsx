/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Cpu, ShieldCheck } from 'lucide-react';

export function Header() {
  return (
    <header className="h-16 border-b border-white/5 bg-[#0F1219]/80 backdrop-blur-xl flex items-center justify-between px-8 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative w-11 h-11 bg-[#161B26] border border-white/10 rounded-lg flex items-center justify-center text-blue-400 shadow-2xl">
            <img src="/sources/东北农业大学-logo.svg" alt="NEAU" className="w-10 h-10" />
          </div>
        </div>
        <div className="flex flex-col">
          <h2 className="text-lg font-extrabold text-white tracking-tight leading-none">农业农村部东北智慧农业技术重点实验室 <span className="text-blue-500">NEAU</span></h2>
          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] mt-1">Digital Twin Control Center</span>
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/5 border border-emerald-500/10">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Secure Connection</span>
        </div>
        <div className="h-4 w-[1px] bg-white/10 mx-2" />
        <span className="text-[10px] text-gray-500 font-mono font-bold">V4.5.0-STABLE</span>
      </div>
    </header>
  );
}
