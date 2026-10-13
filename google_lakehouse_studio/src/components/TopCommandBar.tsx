"use client";

import React from "react";
import {
  Cloud,
  Command,
  Cpu,
  Database,
  Layers,
  Moon,
  Plus,
  Search,
  Sparkles,
  Sun,
  Zap,
} from "lucide-react";
import { SparkPool, SqlWarehouse } from "@/types/lakehouse";

interface TopCommandBarProps {
  onOpenCommandPalette: () => void;
  onOpenComputeModal: () => void;
  onCreateNewNotebook: () => void;
  activeSparkPool: SparkPool;
  activeWarehouse: SqlWarehouse;
  isDark: boolean;
  onToggleTheme: () => void;
}

export function TopCommandBar({
  onOpenCommandPalette,
  onOpenComputeModal,
  onCreateNewNotebook,
  activeSparkPool,
  activeWarehouse,
  isDark,
  onToggleTheme,
}: TopCommandBarProps) {
  return (
    <header className="h-13 border-b border-slate-200 dark:border-white/10 bg-white/95 dark:bg-[#0B0F19]/95 backdrop-blur-md px-3.5 py-2 flex items-center justify-between gap-3 select-none relative z-30">
      {/* Left: Brand & GCP Project Context */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1A73E8] via-[#4285F4] to-[#00C49F] flex items-center justify-center shadow-md shadow-blue-500/20">
            <Layers className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-sm text-slate-900 dark:text-zinc-100">
                Google Lakehouse Studio
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#1A73E8]/15 text-[#4285F4] border border-[#4285F4]/30 font-semibold">
                GCP Native Studio
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-zinc-400 font-mono">
              <Cloud className="w-3 h-3 text-[#00C49F]" />
              <span>lustrous-stone-417013</span>
              <span className="text-slate-300 dark:text-zinc-600">•</span>
              <span>us-central1</span>
            </div>
          </div>
        </div>
      </div>

      {/* Center: Global Command Bar (Cmd + K) */}
      <div className="flex-1 max-w-xl">
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="w-full flex items-center justify-between gap-3 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200/70 dark:bg-[#111827] dark:hover:bg-[#182236] border border-slate-200/80 dark:border-white/10 text-xs text-slate-500 dark:text-zinc-400 transition-all duration-150 group shadow-inner"
        >
          <div className="flex items-center gap-2.5 truncate">
            <Search className="w-3.5 h-3.5 text-[#4285F4] group-hover:scale-110 transition-transform" />
            <span className="truncate">
              Search Dataplex catalog, BigQuery tables, notebooks, DLT pipelines, or ask Gemini...
            </span>
          </div>
          <kbd className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono bg-white dark:bg-[#0B0F19] text-slate-600 dark:text-zinc-300 border border-slate-300 dark:border-white/10 shrink-0">
            <Command className="w-2.5 h-2.5" />K
          </kbd>
        </button>
      </div>

      {/* Right: Live Compute Status Pills, New Notebook & Theme Toggle */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Compute Manager Quick Trigger */}
        <button
          type="button"
          onClick={onOpenComputeModal}
          className="hidden xl:flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-[#111827] hover:bg-slate-200/70 dark:hover:bg-[#182236] border border-slate-200 dark:border-white/10 transition-all duration-150 text-xs"
          title="Open Compute Engine Manager (Dataproc Serverless & BigQuery Editions)"
        >
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#00C49F] animate-pulse" />
            <Cpu className="w-3.5 h-3.5 text-[#00C49F]" />
            <span className="font-mono text-[11px] text-slate-700 dark:text-zinc-200">
              {activeSparkPool.currentDpus} DPUs
            </span>
          </div>
          <span className="text-slate-300 dark:text-zinc-700">|</span>
          <div className="flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-[#4285F4]" />
            <span className="font-mono text-[11px] text-slate-700 dark:text-zinc-200">
              {activeWarehouse.currentSlotsUsed.toLocaleString()} Slots
            </span>
            <span className="text-[10px] font-mono px-1 rounded bg-[#00C49F]/15 text-[#00C49F]">
              BI {activeWarehouse.biEngineHitRatio}%
            </span>
          </div>
        </button>

        <button
          type="button"
          onClick={onOpenComputeModal}
          className="xl:hidden flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-[#111827] border border-slate-200 dark:border-white/10 text-xs text-slate-700 dark:text-zinc-200"
        >
          <Zap className="w-3.5 h-3.5 text-[#00C49F]" />
          <span>Compute</span>
        </button>

        <button
          type="button"
          onClick={onCreateNewNotebook}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#1A73E8] hover:bg-[#1967D2] text-white text-xs font-medium transition-all duration-150 shadow-sm shadow-blue-600/20"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">New Notebook</span>
        </button>

        <button
          type="button"
          onClick={onToggleTheme}
          aria-label="Toggle Dark or Light Mode"
          className="p-1.5 rounded-lg bg-slate-100 dark:bg-[#111827] hover:bg-slate-200 dark:hover:bg-[#182236] border border-slate-200 dark:border-white/10 text-slate-600 dark:text-zinc-300 transition-all duration-150"
          title={isDark ? "Switch to Light Theme" : "Switch to Dark Theme"}
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-700" />
          )}
        </button>
      </div>
    </header>
  );
}
