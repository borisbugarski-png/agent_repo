"use client";

import React, { useState } from "react";
import {
  Activity,
  AlertTriangle,
  Bell,
  CalendarClock,
  CheckCircle2,
  Clock,
  Cpu,
  GitBranch,
  Loader2,
  Play,
  RotateCcw,
  Sparkles,
  Wand2,
  Workflow,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { PipelineNode, PipelineWorkflow } from "@/types/lakehouse";

interface PipelinesDagViewProps {
  pipelines: PipelineWorkflow[];
  selectedPipeline: PipelineWorkflow;
  onSelectPipeline: (pipe: PipelineWorkflow) => void;
  onUpdatePipeline: (updated: PipelineWorkflow) => void;
}

export function PipelinesDagView({
  pipelines,
  selectedPipeline,
  onSelectPipeline,
  onUpdatePipeline,
}: PipelinesDagViewProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string>(
    selectedPipeline.nodes[0]?.id || "pn-ingest"
  );
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOrigin, setDragOrigin] = useState({ x: 0, y: 0 });
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [triggeringRun, setTriggeringRun] = useState(false);
  const [remediatingNode, setRemediatingNode] = useState(false);

  const [cronInput, setCronInput] = useState(selectedPipeline.cronSchedule);
  const [pubsubInput, setPubsubInput] = useState(
    selectedPipeline.pubsubTriggerTopic
  );
  const [alertInput, setAlertInput] = useState(selectedPipeline.alertChannel);

  const inspectedNode: PipelineNode =
    selectedPipeline.nodes.find((n) => n.id === selectedNodeId) ||
    selectedPipeline.nodes[0];

  const handleTriggerPipeline = () => {
    setTriggeringRun(true);
    setTimeout(() => {
      onUpdatePipeline({
        ...selectedPipeline,
        status: "RUNNING",
        lastRunTime: "Triggered just now • Checkpoint #88,413",
        nodes: selectedPipeline.nodes.map((n) => ({
          ...n,
          state: n.state === "FAILED" ? "RUNNING" : n.state,
        })),
      });
      setTriggeringRun(false);
    }, 650);
  };

  const handleGeminiRemediate = (node: PipelineNode) => {
    setRemediatingNode(true);
    setTimeout(() => {
      const updatedNodes = selectedPipeline.nodes.map((n) =>
        n.id === node.id
          ? {
              ...n,
              state: "SUCCEEDED" as const,
              throughput: "41.8K rec/s (Recovered)",
              watermarkLatency: "1.9s",
              workersOrSlots: "320 BQ Slots",
              recordsProcessed: "Commit #143 Succeeded",
              errorMessage: undefined,
            }
          : n
      );
      onUpdatePipeline({
        ...selectedPipeline,
        status: "SUCCEEDED",
        lastRunTime: "Remediated by Gemini • All Tasks Healthy",
        nodes: updatedNodes,
      });
      setRemediatingNode(false);
    }, 700);
  };

  const handleSaveSchedule = () => {
    onUpdatePipeline({
      ...selectedPipeline,
      cronSchedule: cronInput,
      pubsubTriggerTopic: pubsubInput,
      alertChannel: alertInput,
    });
    setScheduleModalOpen(false);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-slate-50 dark:bg-[#0B0F19]">
      {/* Top Pipeline Header & Action Bar */}
      <div className="px-5 py-3 border-b border-slate-200 dark:border-white/10 bg-white dark:bg-[#111827] flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-purple-500/15 text-purple-400 border border-purple-500/30">
              {selectedPipeline.orchestrator}
            </span>
            <select
              value={selectedPipeline.id}
              onChange={(e) => {
                const found = pipelines.find((p) => p.id === e.target.value);
                if (found) {
                  onSelectPipeline(found);
                  setSelectedNodeId(found.nodes[0]?.id || "");
                  setCronInput(found.cronSchedule);
                  setPubsubInput(found.pubsubTriggerTopic);
                  setAlertInput(found.alertChannel);
                }
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-[#0B0F19] border border-slate-200 dark:border-white/15 font-mono text-sm font-bold text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-[#4285F4]"
            >
              {pipelines.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.status})
                </option>
              ))}
            </select>

            <span
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                selectedPipeline.status === "RUNNING"
                  ? "bg-[#00C49F]/15 text-[#00C49F] border border-[#00C49F]/30"
                  : selectedPipeline.status === "FAILED"
                  ? "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                  : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
              }`}
            >
              ● {selectedPipeline.status}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            {selectedPipeline.description}
          </p>
        </div>

        {/* Right Controls: Schedule/Triggers Modal & Trigger Update */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setScheduleModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-[#0B0F19] hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/15 text-xs text-slate-700 dark:text-zinc-200 transition-colors"
          >
            <CalendarClock className="w-3.5 h-3.5 text-[#4285F4]" />
            <span>Cron & Pub/Sub Triggers</span>
          </button>

          <button
            type="button"
            onClick={handleTriggerPipeline}
            disabled={triggeringRun}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#1A73E8] hover:bg-[#1967D2] disabled:opacity-60 text-white text-xs font-medium transition-all duration-150 shadow-sm"
          >
            {triggeringRun ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current" />
            )}
            <span>
              {triggeringRun ? "Starting DAG..." : "Start Pipeline Update"}
            </span>
          </button>
        </div>
      </div>

      {/* Live Streaming & Autoscale Telemetry Strip */}
      <div className="px-5 py-2.5 border-b border-slate-200 dark:border-white/10 bg-slate-100/70 dark:bg-[#0E1422] grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
        <div className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/5">
          <div className="text-[10px] font-mono uppercase text-slate-400 dark:text-zinc-500">
            Streaming Throughput
          </div>
          <div className="font-mono font-bold text-[#00C49F]">
            {selectedPipeline.totalThroughput}
          </div>
        </div>
        <div className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/5">
          <div className="text-[10px] font-mono uppercase text-slate-400 dark:text-zinc-500">
            p99 Watermark Lag
          </div>
          <div className="font-mono font-bold text-[#4285F4]">
            {selectedPipeline.p99WatermarkLatency}
          </div>
        </div>
        <div className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/5">
          <div className="text-[10px] font-mono uppercase text-slate-400 dark:text-zinc-500">
            Dataflow / Spark Autoscale
          </div>
          <div className="font-mono font-bold text-slate-800 dark:text-zinc-100">
            {selectedPipeline.activeWorkers} / {selectedPipeline.maxWorkers} Workers
          </div>
        </div>
        <div className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/5">
          <div className="text-[10px] font-mono uppercase text-slate-400 dark:text-zinc-500">
            Dead-Letter Queue (DLQ)
          </div>
          <div className="font-mono font-bold text-emerald-400">
            {selectedPipeline.dlqRate}
          </div>
        </div>
        <div className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/5">
          <div className="text-[10px] font-mono uppercase text-slate-400 dark:text-zinc-500">
            Schedule / Mode
          </div>
          <div className="font-mono font-semibold text-slate-800 dark:text-zinc-200 truncate">
            {selectedPipeline.cronSchedule}
          </div>
        </div>
        <div className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/5">
          <div className="text-[10px] font-mono uppercase text-slate-400 dark:text-zinc-500">
            Run Rate Cost
          </div>
          <div className="font-mono font-bold text-amber-400">
            ${selectedPipeline.costPerHour.toFixed(2)}/hr
          </div>
        </div>
      </div>

      {/* Main DAG Canvas + Right Node Inspector */}
      <div className="flex-1 flex overflow-hidden">
        {/* Interactive DAG Canvas */}
        <div
          onMouseDown={(e) => {
            if ((e.target as HTMLElement).closest("[data-dag-node]")) return;
            setIsDragging(true);
            setDragOrigin({ x: e.clientX - pan.x, y: e.clientY - pan.y });
          }}
          onMouseMove={(e) => {
            if (!isDragging) return;
            setPan({
              x: e.clientX - dragOrigin.x,
              y: e.clientY - dragOrigin.y,
            });
          }}
          onMouseUp={() => setIsDragging(false)}
          onMouseLeave={() => setIsDragging(false)}
          className="flex-1 relative overflow-hidden cursor-grab active:cursor-grabbing bg-[#080C15] select-none"
          style={{
            backgroundImage:
              "radial-gradient(rgba(0, 196, 159, 0.14) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        >
          {/* Floating Zoom Controls */}
          <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 bg-[#111827]/90 backdrop-blur-md border border-white/15 rounded-lg p-1.5 text-xs text-zinc-200">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(1.35, +(z + 0.1).toFixed(2)))}
              className="p-1.5 rounded hover:bg-white/10"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-[11px] px-1.5">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(0.7, +(z - 0.1).toFixed(2)))}
              className="p-1.5 rounded hover:bg-white/10"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => {
                setZoom(1);
                setPan({ x: 0, y: 0 });
              }}
              className="p-1.5 rounded hover:bg-white/10"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* DAG Stage */}
          <div
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: "0 0",
            }}
            className="w-[1180px] h-[420px] relative"
          >
            {/* SVG Edges */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {selectedPipeline.edges.map((edge) => {
                const from = selectedPipeline.nodes.find(
                  (n) => n.id === edge.from
                );
                const to = selectedPipeline.nodes.find((n) => n.id === edge.to);
                if (!from || !to) return null;

                const x1 = from.x + 235;
                const y1 = from.y + 52;
                const x2 = to.x;
                const y2 = to.y + 52;
                const midX = (x1 + x2) / 2;
                const d = `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`;

                return (
                  <g key={edge.id}>
                    <path
                      d={d}
                      fill="none"
                      stroke={edge.streaming ? "#00C49F" : "#4285F4"}
                      strokeWidth="2.4"
                      strokeDasharray={edge.streaming ? "7 4" : undefined}
                      opacity="0.9"
                    />
                    <rect
                      x={midX - 48}
                      y={(y1 + y2) / 2 - 10}
                      width="96"
                      height="19"
                      rx="5"
                      fill="#0B0F19"
                      stroke="rgba(255,255,255,0.15)"
                    />
                    <text
                      x={midX}
                      y={(y1 + y2) / 2 + 3}
                      textAnchor="middle"
                      fill="#E4E4E7"
                      fontSize="9.5"
                      fontFamily="monospace"
                    >
                      {edge.throughputLabel}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* DAG Nodes */}
            {selectedPipeline.nodes.map((node) => {
              const isSelected = node.id === inspectedNode?.id;
              return (
                <div
                  key={node.id}
                  data-dag-node="true"
                  onClick={() => setSelectedNodeId(node.id)}
                  style={{ left: node.x, top: node.y }}
                  className={`absolute w-[235px] rounded-xl p-3 cursor-pointer transition-all duration-150 ${
                    node.state === "FAILED"
                      ? "bg-rose-950/80 border-2 border-rose-500 shadow-lg shadow-rose-500/20"
                      : isSelected
                      ? "bg-[#162238] border-2 border-[#00C49F] shadow-lg shadow-[#00C49F]/20 scale-[1.02]"
                      : "bg-[#111827]/95 border border-white/15 hover:border-[#4285F4]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#1A73E8]/20 text-[#4285F4]">
                      {node.gcpEngine}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        node.state === "RUNNING"
                          ? "bg-[#00C49F]/20 text-[#00C49F]"
                          : node.state === "FAILED"
                          ? "bg-rose-500/25 text-rose-300"
                          : "bg-emerald-500/20 text-emerald-300"
                      }`}
                    >
                      {node.state}
                    </span>
                  </div>

                  <div className="font-mono text-xs font-bold text-zinc-100 truncate">
                    {node.title}
                  </div>
                  <div className="text-[10px] font-mono text-zinc-400 truncate mb-2">
                    {node.subtitle}
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono pt-1.5 border-t border-white/10 text-zinc-300">
                    <span>{node.throughput}</span>
                    <span className="text-[#00C49F]">
                      Lag: {node.watermarkLatency}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right DAG Node Inspection Drawer */}
        {inspectedNode && (
          <aside className="w-96 border-l border-slate-200 dark:border-white/10 bg-white dark:bg-[#111827] p-4 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#1A73E8]/15 text-[#4285F4]">
                    {inspectedNode.dltType}
                  </span>
                  <span className="text-xs font-mono text-slate-400 dark:text-zinc-400">
                    {inspectedNode.gcpEngine}
                  </span>
                </div>
                <h3 className="mt-2 font-mono text-sm font-bold text-slate-900 dark:text-zinc-100">
                  {inspectedNode.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  {inspectedNode.subtitle}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-white/10">
                  <div className="text-[10px] text-slate-400 dark:text-zinc-500">
                    Throughput
                  </div>
                  <div className="text-[#00C49F] font-semibold">
                    {inspectedNode.throughput}
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-white/10">
                  <div className="text-[10px] text-slate-400 dark:text-zinc-500">
                    Compute Allocation
                  </div>
                  <div className="text-[#4285F4] font-semibold">
                    {inspectedNode.workersOrSlots}
                  </div>
                </div>
              </div>

              {/* Error Diagnostic & Gemini Auto-Remediation if FAILED */}
              {inspectedNode.errorMessage && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-2.5 text-xs">
                  <div className="flex items-center gap-1.5 text-rose-400 font-bold">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Task Execution Halted</span>
                  </div>
                  <p className="font-mono text-[11px] text-rose-200 leading-relaxed">
                    {inspectedNode.errorMessage}
                  </p>
                  {inspectedNode.geminiRemediation && (
                    <div className="p-2.5 rounded-lg bg-[#0B0F19] border border-[#4285F4]/30 space-y-2">
                      <div className="flex items-center gap-1.5 text-[#4285F4] font-semibold text-[11px]">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Gemini Root-Cause Fix Ready</span>
                      </div>
                      <p className="text-[11px] text-zinc-300">
                        {inspectedNode.geminiRemediation}
                      </p>
                      <button
                        type="button"
                        onClick={() => handleGeminiRemediate(inspectedNode)}
                        disabled={remediatingNode}
                        className="w-full py-1.5 px-3 rounded-lg bg-[#1A73E8] hover:bg-[#1967D2] text-white font-medium text-xs flex items-center justify-center gap-1.5"
                      >
                        {remediatingNode ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Wand2 className="w-3.5 h-3.5" />
                        )}
                        <span>Apply Schema Evolution & Resume Task</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Transform Definition Code */}
              <div>
                <div className="text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5">
                  Declarative Transform Definition
                </div>
                <pre className="p-3 rounded-lg bg-slate-900 text-zinc-100 font-mono text-[11px] overflow-x-auto leading-relaxed border border-white/10">
                  {inspectedNode.codeSnippet}
                </pre>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-white/10 text-[11px] font-mono text-slate-400 dark:text-zinc-500">
              Processed Volume: {inspectedNode.recordsProcessed}
            </div>
          </aside>
        )}
      </div>

      {/* Cron Schedule & Alert Triggers Configuration Modal */}
      {scheduleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/15 shadow-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CalendarClock className="w-5 h-5 text-[#4285F4]" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                    Cloud Scheduler, Pub/Sub & Alerting
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    {selectedPipeline.name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setScheduleModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-mono uppercase text-slate-400 dark:text-zinc-400 mb-1">
                  Cloud Scheduler Cron Expression
                </label>
                <input
                  type="text"
                  value={cronInput}
                  onChange={(e) => setCronInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-white/15 font-mono text-slate-800 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-slate-400 dark:text-zinc-400 mb-1">
                  Cloud Pub/Sub Event Trigger Topic
                </label>
                <input
                  type="text"
                  value={pubsubInput}
                  onChange={(e) => setPubsubInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-white/15 font-mono text-slate-800 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-slate-400 dark:text-zinc-400 mb-1">
                  Cloud Monitoring SLA Breach Notification Channel
                </label>
                <input
                  type="text"
                  value={alertInput}
                  onChange={(e) => setAlertInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-white/15 font-mono text-slate-800 dark:text-zinc-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setScheduleModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-zinc-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveSchedule}
                  className="px-4 py-1.5 rounded-lg bg-[#1A73E8] hover:bg-[#1967D2] text-white font-medium"
                >
                  Save Trigger Policy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
