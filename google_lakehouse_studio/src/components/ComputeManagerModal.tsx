"use client";

import React, { useState } from "react";
import {
  Activity,
  Cpu,
  Database,
  DollarSign,
  Gauge,
  Play,
  Power,
  Server,
  Sliders,
  Sparkles,
  X,
  Zap,
} from "lucide-react";
import { SparkPool, SqlWarehouse } from "@/types/lakehouse";

interface ComputeManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  sparkPools: SparkPool[];
  onUpdateSparkPools: (pools: SparkPool[]) => void;
  warehouses: SqlWarehouse[];
  onUpdateWarehouses: (warehouses: SqlWarehouse[]) => void;
}

export function ComputeManagerModal({
  isOpen,
  onClose,
  sparkPools,
  onUpdateSparkPools,
  warehouses,
  onUpdateWarehouses,
}: ComputeManagerModalProps) {
  const [activeTab, setActiveTab] = useState<"spark" | "warehouses">("spark");

  if (!isOpen) return null;

  const totalDpus = sparkPools.reduce(
    (acc, p) => acc + (p.status === "STOPPED" ? 0 : p.currentDpus),
    0
  );
  const totalSlots = warehouses.reduce(
    (acc, w) => acc + (w.status === "SUSPENDED" ? 0 : w.currentSlotsUsed),
    0
  );
  const totalCostPerHour =
    sparkPools.reduce(
      (acc, p) => acc + (p.status === "STOPPED" ? 0 : p.costPerHour),
      0
    ) +
    warehouses.reduce(
      (acc, w) => acc + (w.status === "SUSPENDED" ? 0 : w.costPerHour),
      0
    );

  const toggleSparkStatus = (poolId: string) => {
    onUpdateSparkPools(
      sparkPools.map((p) => {
        if (p.id !== poolId) return p;
        const nextStatus = p.status === "STOPPED" ? "RUNNING" : "STOPPED";
        return {
          ...p,
          status: nextStatus,
          currentDpus: nextStatus === "STOPPED" ? 0 : p.minDpus + 8,
          vCpuUtilization: nextStatus === "STOPPED" ? 0 : 64,
          ramUtilization: nextStatus === "STOPPED" ? 0 : 70,
        };
      })
    );
  };

  const updateSparkMaxDpus = (poolId: string, maxDpus: number) => {
    onUpdateSparkPools(
      sparkPools.map((p) => (p.id === poolId ? { ...p, maxDpus } : p))
    );
  };

  const toggleWarehouseStatus = (whId: string) => {
    onUpdateWarehouses(
      warehouses.map((w) => {
        if (w.id !== whId) return w;
        const nextStatus = w.status === "SUSPENDED" ? "ACTIVE" : "SUSPENDED";
        return {
          ...w,
          status: nextStatus,
          currentSlotsUsed:
            nextStatus === "SUSPENDED"
              ? 0
              : Math.max(100, w.baselineSlots + 200),
          costPerHour: nextStatus === "SUSPENDED" ? 0 : 19.2,
        };
      })
    );
  };

  const updateBiEngineCache = (whId: string, biEngineCacheGb: number) => {
    onUpdateWarehouses(
      warehouses.map((w) => (w.id === whId ? { ...w, biEngineCacheGb } : w))
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-5xl rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/15 shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0B0F19] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#00C49F]/15 text-[#00C49F] border border-[#00C49F]/30">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100">
                  Compute Engine Manager
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#1A73E8]/15 text-[#4285F4] border border-[#4285F4]/30">
                  Databricks Clusters & SQL Warehouses → Dataproc Serverless & BigQuery Editions
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Manage serverless Spark session pools, BigQuery Edition slot reservations, and BI Engine in-memory cache.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 text-slate-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Telemetry Summary Strip */}
        <div className="px-6 py-3 border-b border-slate-200 dark:border-white/10 bg-white dark:bg-[#111827] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-white/10">
            <div className="text-[10px] font-mono uppercase text-slate-400 dark:text-zinc-500">
              Active Dataproc DPUs
            </div>
            <div className="mt-1 font-mono text-lg font-bold text-[#00C49F]">
              {totalDpus} DPUs{" "}
              <span className="text-xs font-normal text-zinc-400">
                (Serverless)
              </span>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-white/10">
            <div className="text-[10px] font-mono uppercase text-slate-400 dark:text-zinc-500">
              BigQuery Slots Consumed
            </div>
            <div className="mt-1 font-mono text-lg font-bold text-[#4285F4]">
              {totalSlots.toLocaleString()} Slots
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-white/10">
            <div className="text-[10px] font-mono uppercase text-slate-400 dark:text-zinc-500">
              BI Engine Cache Hit Rate
            </div>
            <div className="mt-1 font-mono text-lg font-bold text-emerald-400">
              94.6%{" "}
              <span className="text-xs font-normal text-zinc-400">
                (160 GB Total)
              </span>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-white/10">
            <div className="text-[10px] font-mono uppercase text-slate-400 dark:text-zinc-500">
              Live Burn Rate Tracker
            </div>
            <div className="mt-1 font-mono text-lg font-bold text-amber-400">
              ${totalCostPerHour.toFixed(2)} / hr
            </div>
          </div>
        </div>

        {/* Sub-Tabs */}
        <div className="px-6 py-2.5 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0E1422] flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("spark")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === "spark"
                ? "bg-[#1A73E8] text-white"
                : "text-slate-600 dark:text-zinc-400 hover:bg-slate-200/70 dark:hover:bg-white/5"
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Serverless Spark Pools (Dataproc Serverless)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("warehouses")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeTab === "warehouses"
                ? "bg-[#1A73E8] text-white"
                : "text-slate-600 dark:text-zinc-400 hover:bg-slate-200/70 dark:hover:bg-white/5"
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>SQL Warehouses (BigQuery Editions + BI Engine)</span>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeTab === "spark" && (
            <div className="space-y-4">
              {sparkPools.map((pool) => (
                <div
                  key={pool.id}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-white/10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-mono text-sm font-bold text-slate-900 dark:text-zinc-100">
                        {pool.name}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          pool.status === "RUNNING"
                            ? "bg-[#00C49F]/15 text-[#00C49F]"
                            : pool.status === "SCALING"
                            ? "bg-amber-500/15 text-amber-400"
                            : "bg-slate-500/20 text-slate-400"
                        }`}
                      >
                        ● {pool.status}
                      </span>
                      {pool.gpuAccelerator && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/15 text-purple-400 border border-purple-500/30">
                          {pool.gpuAccelerator}
                        </span>
                      )}
                      {pool.bigLakeMetastore && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#1A73E8]/15 text-[#4285F4]">
                          BigLake Iceberg Metastore Attached
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-mono text-slate-500 dark:text-zinc-400">
                      {pool.runtimeVersion} • Active Notebook Sessions:{" "}
                      {pool.activeSessions} • Cost: ${pool.costPerHour.toFixed(2)}/hr
                    </div>

                    {/* Utilization Bars */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                      <div>
                        <div className="flex justify-between text-[10px] font-mono text-slate-500 dark:text-zinc-400 mb-1">
                          <span>vCPU Utilization</span>
                          <span className="text-[#00C49F]">
                            {pool.vCpuUtilization}%
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-200 dark:bg-[#111827] overflow-hidden">
                          <div
                            style={{ width: `${pool.vCpuUtilization}%` }}
                            className="h-full bg-[#00C49F] transition-all duration-300"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[10px] font-mono text-slate-500 dark:text-zinc-400 mb-1">
                          <span>Executor Memory</span>
                          <span className="text-[#4285F4]">
                            {pool.ramUtilization}%
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-200 dark:bg-[#111827] overflow-hidden">
                          <div
                            style={{ width: `${pool.ramUtilization}%` }}
                            className="h-full bg-[#4285F4] transition-all duration-300"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[10px] font-mono text-slate-500 dark:text-zinc-400 mb-1">
                          <span>
                            Autoscale Limit ({pool.minDpus} - {pool.maxDpus} DPUs)
                          </span>
                          <span className="text-amber-400">
                            Curr: {pool.currentDpus}
                          </span>
                        </div>
                        <input
                          type="range"
                          min={32}
                          max={160}
                          step={16}
                          value={pool.maxDpus}
                          onChange={(e) =>
                            updateSparkMaxDpus(pool.id, Number(e.target.value))
                          }
                          className="w-full accent-[#00C49F] cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleSparkStatus(pool.id)}
                    className={`px-3.5 py-2 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 shrink-0 transition-colors ${
                      pool.status === "STOPPED"
                        ? "bg-[#00C49F] text-slate-950 hover:bg-[#00C49F]/90"
                        : "bg-rose-500/15 text-rose-400 hover:bg-rose-500/25 border border-rose-500/30"
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>
                      {pool.status === "STOPPED" ? "Start Pool" : "Terminate Pool"}
                    </span>
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === "warehouses" && (
            <div className="space-y-4">
              {warehouses.map((wh) => (
                <div
                  key={wh.id}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-white/10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-mono text-sm font-bold text-slate-900 dark:text-zinc-100">
                        {wh.name}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#1A73E8]/15 text-[#4285F4] border border-[#4285F4]/30">
                        BigQuery {wh.edition} Edition
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          wh.status === "ACTIVE"
                            ? "bg-[#00C49F]/15 text-[#00C49F]"
                            : "bg-slate-500/20 text-slate-400"
                        }`}
                      >
                        ● {wh.status}
                      </span>
                    </div>

                    <div className="text-xs font-mono text-slate-500 dark:text-zinc-400">
                      Baseline: {wh.baselineSlots} Slots • Max Autoscale:{" "}
                      {wh.maxAutoscaleSlots} Slots • Active Queries:{" "}
                      {wh.activeQueries} • Cost: ${wh.costPerHour.toFixed(2)}/hr
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                      <div>
                        <div className="flex justify-between text-[10px] font-mono text-slate-500 dark:text-zinc-400 mb-1">
                          <span>Slot Consumption</span>
                          <span className="text-[#4285F4]">
                            {wh.currentSlotsUsed} / {wh.maxAutoscaleSlots} Slots
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-200 dark:bg-[#111827] overflow-hidden">
                          <div
                            style={{
                              width: `${Math.min(
                                100,
                                Math.round(
                                  (wh.currentSlotsUsed /
                                    Math.max(1, wh.maxAutoscaleSlots)) *
                                    100
                                )
                              )}%`,
                            }}
                            className="h-full bg-[#4285F4] transition-all duration-300"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-[10px] font-mono text-slate-500 dark:text-zinc-400 mb-1">
                          <span>BI Engine In-Memory Cache Allocation</span>
                          <span className="text-[#00C49F]">
                            {wh.biEngineCacheGb} GB ({wh.biEngineHitRatio}% Hit)
                          </span>
                        </div>
                        <input
                          type="range"
                          min={10}
                          max={250}
                          step={10}
                          value={wh.biEngineCacheGb}
                          onChange={(e) =>
                            updateBiEngineCache(wh.id, Number(e.target.value))
                          }
                          className="w-full accent-[#00C49F] cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleWarehouseStatus(wh.id)}
                    className={`px-3.5 py-2 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 shrink-0 transition-colors ${
                      wh.status === "SUSPENDED"
                        ? "bg-[#1A73E8] text-white hover:bg-[#1967D2]"
                        : "bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 border border-amber-500/30"
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>
                      {wh.status === "SUSPENDED"
                        ? "Resume Reservation"
                        : "Suspend Warehouse"}
                    </span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0B0F19] flex items-center justify-between text-xs">
          <span className="font-mono text-slate-500 dark:text-zinc-400">
            All compute pools auto-attach to Vertex AI Workbench & BigQuery Studio sessions.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#1A73E8] hover:bg-[#1967D2] text-white font-medium"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
