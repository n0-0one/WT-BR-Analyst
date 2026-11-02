import React from "react";
import { GitBranch, ShieldCheck, Flame } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full mt-20 border-t border-[#2E4259] bg-[#11161D] py-12 px-6 sm:px-12 text-slate-400 font-mono text-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col gap-2 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 text-white font-bold tracking-wider text-sm">
            <span className="flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-[#F57C00]" />
              <span>WAR THUNDER // BR ANALYST</span>
            </span>
            <span className="text-slate-600">/</span>
            <span className="text-[#38BDF8]">ECOSYSTEM INTELLIGENCE</span>
          </div>
          <p className="text-slate-400 max-w-md">
            Engineered with authentic War Thunder Hangar aesthetics. Synchronized directly with official War Thunder
            datamined files (<code className="text-slate-300">wpcost.blkx</code> &amp; <code className="text-slate-300">units.csv</code>) and Gaijin forum announcements.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#171E27] border border-emerald-500/30 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>3,380+ DATAMINE VERIFIED</span>
          </div>

          <a
            href="https://github.com/n0-0one/WT-BR-Analyst"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#171E27] hover:bg-[#1E2733] border border-[#2E4259] text-slate-300 hover:text-white transition-all"
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>GitHub Repository</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
