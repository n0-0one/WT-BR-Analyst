import React from "react";
import { GitBranch, ShieldCheck } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full mt-20 border-t border-white/[0.06] bg-[#0A0A0C] py-12 px-6 sm:px-12 text-zinc-500 font-mono text-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col gap-2 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 text-zinc-300 font-dot tracking-widest text-sm">
            <span>WT // NOTHING</span>
            <span className="text-zinc-600">/</span>
            <span>VERIFIED INTELLIGENCE</span>
          </div>
          <p className="text-zinc-500 max-w-md">
            Engineered with Nothing OS 3.0 industrial minimalism. Synchronized with official War Thunder Wiki
            and datamined game files.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#141416] border border-white/[0.08] text-zinc-400">
            <ShieldCheck className="w-3.5 h-3.5 text-nothing-green" />
            <span>DATAMINE VERIFIED</span>
          </div>

          <a
            href="https://github.com/n0-0one/WT-BR-Analyst"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#141416] hover:bg-[#1E1E22] border border-white/[0.08] text-zinc-300 hover:text-white transition-all"
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>GitHub Repository</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
