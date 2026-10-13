"use client";

import React, { useState } from "react";
import {
  Activity,
  ArrowUpRight,
  Boxes,
  BrainCircuit,
  CheckCircle2,
  FolderGit2,
  Gauge,
  Loader2,
  Play,
  Rocket,
  Sliders,
  Sparkles,
  TrendingDown,
} from "lucide-react";
import {
  GenAiEvalScenario,
  MlExperimentRun,
  RegisteredModel,
} from "@/types/lakehouse";

interface MlGenAiStudioViewProps {
  experiments: MlExperimentRun[];
  models: RegisteredModel[];
  onUpdateModels: (models: RegisteredModel[]) => void;
  evalScenarios: GenAiEvalScenario[];
  initialSubTab?: "experiments" | "registry" | "playground";
}

export function MlGenAiStudioView({
  experiments,
  models,
  onUpdateModels,
  evalScenarios,
  initialSubTab = "experiments",
}: MlGenAiStudioViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<
    "experiments" | "registry" | "playground"
  >(initialSubTab);
  const [selectedRunId, setSelectedRunId] = useState<string>(
    experiments[0]?.id || "run-xgb-v42"
  );
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(
    evalScenarios[0]?.id || "eval-nl2sql"
  );
  const [temperature, setTemperature] = useState(0.15);
  const [dataplexGrounding, setDataplexGrounding] = useState(true);
  const [runningEval, setRunningEval] = useState(false);

  const activeRun =
    experiments.find((r) => r.id === selectedRunId) || experiments[0];
  const activeScenario =
    evalScenarios.find((s) => s.id === selectedScenarioId) || evalScenarios[0];

  const [promptText, setPromptText] = useState(activeScenario.userPrompt);
  const [systemText, setSystemText] = useState(
    activeScenario.systemInstruction
  );

  const handlePromoteToProduction = (modelId: string) => {
    onUpdateModels(
      models.map((m) =>
        m.id === modelId
          ? {
              ...m,
              stage: "Production",
              endpointStatus: "DEPLOYED",
              trafficSplit: "100% Traffic (Promoted)",
              updatedAt: "Just now",
            }
          : m
      )
    );
  };

  const handleRunPlaygroundEval = () => {
    setRunningEval(true);
    setTimeout(() => {
      setRunningEval(false);
    }, 600);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-slate-50 dark:bg-[#0B0F19]">
      {/* Header */}
      <div className="px-5 py-3 border-b border-slate-200 dark:border-white/10 bg-white dark:bg-[#111827] flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
              MLflow & Mosaic AI → Vertex AI Experiments, Registry & GenAI Studio
            </span>
            <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
              Enterprise ML Lifecycle & Gemini Evaluation Studio
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Track distributed training runs, manage Vertex AI Model Registry endpoints, and benchmark Gemini models side-by-side.
          </p>
        </div>

        {/* Sub-Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-[#0B0F19] p-1 rounded-xl border border-slate-200 dark:border-white/10">
          <button
            type="button"
            onClick={() => setActiveSubTab("experiments")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeSubTab === "experiments"
                ? "bg-[#1A73E8] text-white"
                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100"
            }`}
          >
            <BrainCircuit className="w-3.5 h-3.5" />
            <span>Vertex AI Experiments ({experiments.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab("registry")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeSubTab === "registry"
                ? "bg-[#1A73E8] text-white"
                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100"
            }`}
          >
            <Boxes className="w-3.5 h-3.5" />
            <span>Model Registry & Endpoints ({models.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab("playground")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeSubTab === "playground"
                ? "bg-[#1A73E8] text-white"
                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Vertex GenAI Playground</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {activeSubTab === "experiments" && (
          <div className="space-y-5">
            {/* Top Comparison Table */}
            <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111827] overflow-hidden shadow-sm">
              <div className="px-4 py-3 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-zinc-100">
                  Experiment Run Comparison (Click any run to inspect loss curve & GCS artifacts)
                </span>
                <span className="text-[11px] font-mono text-[#00C49F]">
                  Vertex AI TensorBoard + Metadata Store
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0B0F19] text-[11px] font-mono uppercase text-slate-500 dark:text-zinc-400">
                      <th className="py-2.5 px-4">Run Name</th>
                      <th className="py-2.5 px-4">Framework / Compute</th>
                      <th className="py-2.5 px-4">AUC-ROC</th>
                      <th className="py-2.5 px-4">F1 Score</th>
                      <th className="py-2.5 px-4">Precision@99</th>
                      <th className="py-2.5 px-4">Latency p95</th>
                      <th className="py-2.5 px-4">Hyperparameters</th>
                      <th className="py-2.5 px-4">Cloud Storage Artifact URI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/70 dark:divide-white/5 font-mono text-[11px]">
                    {experiments.map((run) => {
                      const isSelected = run.id === activeRun.id;
                      return (
                        <tr
                          key={run.id}
                          onClick={() => setSelectedRunId(run.id)}
                          className={`cursor-pointer transition-colors ${
                            isSelected
                              ? "bg-[#1A73E8]/15 dark:bg-[#1A73E8]/20"
                              : "hover:bg-slate-50 dark:hover:bg-white/[0.02]"
                          }`}
                        >
                          <td className="py-3 px-4 font-bold text-slate-900 dark:text-zinc-100">
                            <div className="flex items-center gap-2">
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  run.status === "RUNNING"
                                    ? "bg-amber-400 animate-pulse"
                                    : "bg-[#00C49F]"
                                }`}
                              />
                              <span>{run.runName}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-[#4285F4]">
                            {run.framework}
                          </td>
                          <td className="py-3 px-4 font-bold text-[#00C49F]">
                            {run.aucRoc.toFixed(4)}
                          </td>
                          <td className="py-3 px-4 text-slate-800 dark:text-zinc-200">
                            {run.f1Score.toFixed(3)}
                          </td>
                          <td className="py-3 px-4 text-slate-800 dark:text-zinc-200">
                            {run.precisionAt99.toFixed(3)}
                          </td>
                          <td className="py-3 px-4 text-amber-400">
                            {run.latencyP95Ms} ms
                          </td>
                          <td className="py-3 px-4 text-slate-500 dark:text-zinc-400">
                            lr={run.learningRate}, {run.maxDepthOrRank}
                          </td>
                          <td className="py-3 px-4 text-slate-400 dark:text-zinc-500 truncate max-w-[220px]">
                            {run.gcsArtifactUri}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom Loss Curve Visualizer & Artifact Details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 p-4 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-[#00C49F]" />
                    <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                      Training vs. Validation Loss Curve — {activeRun.runName}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] font-mono">
                    <span className="flex items-center gap-1.5 text-[#00C49F]">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#00C49F]" />
                      Train Loss
                    </span>
                    <span className="flex items-center gap-1.5 text-[#4285F4]">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#4285F4]" />
                      Validation Loss
                    </span>
                  </div>
                </div>

                {/* SVG Loss Curve */}
                <div className="h-48 w-full bg-slate-950 rounded-lg p-3 border border-white/10">
                  <svg viewBox="0 0 500 150" className="w-full h-full">
                    {[30, 65, 100, 135].map((y) => (
                      <line
                        key={y}
                        x1="30"
                        y1={y}
                        x2="480"
                        y2={y}
                        stroke="rgba(255,255,255,0.07)"
                        strokeDasharray="4 4"
                      />
                    ))}
                    <polyline
                      fill="none"
                      stroke="#00C49F"
                      strokeWidth="2.8"
                      points={activeRun.lossCurve
                        .map(
                          (val, idx) =>
                            `${40 + idx * 48},${140 - Math.min(130, val * 145)}`
                        )
                        .join(" ")}
                    />
                    <polyline
                      fill="none"
                      stroke="#4285F4"
                      strokeWidth="2.4"
                      strokeDasharray="5 3"
                      points={activeRun.valLossCurve
                        .map(
                          (val, idx) =>
                            `${40 + idx * 48},${140 - Math.min(130, val * 145)}`
                        )
                        .join(" ")}
                    />
                    {activeRun.lossCurve.map((val, idx) => (
                      <circle
                        key={idx}
                        cx={40 + idx * 48}
                        cy={140 - Math.min(130, val * 145)}
                        r="3.5"
                        fill="#00C49F"
                      />
                    ))}
                  </svg>
                </div>
              </div>

              {/* Run Metadata & GCS Artifacts Card */}
              <div className="p-4 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/10 space-y-3 text-xs">
                <div className="font-bold text-slate-900 dark:text-zinc-100">
                  Cloud Storage Artifact Lineage
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-white/10 font-mono text-[11px] text-[#00C49F] break-all">
                  {activeRun.gcsArtifactUri}
                </div>
                <div className="space-y-1.5 font-mono text-[11px] text-slate-600 dark:text-zinc-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Experiment Group:</span>
                    <span>{activeRun.experimentGroup}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Created At:</span>
                    <span>{activeRun.createdAt}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Author:</span>
                    <span>{activeRun.author}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSubTab === "registry" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {models.map((mdl) => (
              <div
                key={mdl.id}
                className="p-4 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/10 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-mono text-sm font-bold text-slate-900 dark:text-zinc-100">
                      {mdl.name}{" "}
                      <span className="text-xs text-[#4285F4]">
                        ({mdl.version})
                      </span>
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                        mdl.stage === "Production"
                          ? "bg-[#00C49F]/15 text-[#00C49F] border border-[#00C49F]/30"
                          : mdl.stage === "Staging"
                          ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                          : "bg-sky-500/15 text-sky-400 border border-sky-500/30"
                      }`}
                    >
                      Stage: {mdl.stage}
                    </span>
                  </div>

                  <div className="text-xs font-mono text-slate-500 dark:text-zinc-400">
                    Vertex Endpoint:{" "}
                    <span className="text-slate-800 dark:text-zinc-200">
                      {mdl.vertexEndpointName}
                    </span>{" "}
                    • {mdl.trafficSplit}
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 text-xs font-mono">
                    <div className="p-2 rounded bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-white/5">
                      <div className="text-[10px] text-slate-400">Throughput</div>
                      <div className="font-bold text-[#00C49F]">
                        {mdl.qps.toLocaleString()} QPS
                      </div>
                    </div>
                    <div className="p-2 rounded bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-white/5">
                      <div className="text-[10px] text-slate-400">
                        p50 / p99 Latency
                      </div>
                      <div className="font-bold text-[#4285F4]">
                        {mdl.latencyP50Ms}ms / {mdl.latencyP99Ms}ms
                      </div>
                    </div>
                    <div className="p-2 rounded bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-white/5">
                      <div className="text-[10px] text-slate-400">
                        Feature Drift
                      </div>
                      <div className="font-bold text-emerald-400">
                        {mdl.driftStatus}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-xs">
                  <span className="font-mono text-[11px] text-slate-400">
                    Updated {mdl.updatedAt}
                  </span>
                  {mdl.stage !== "Production" && (
                    <button
                      type="button"
                      onClick={() => handlePromoteToProduction(mdl.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1A73E8] hover:bg-[#1967D2] text-white text-xs font-medium transition-colors"
                    >
                      <Rocket className="w-3.5 h-3.5" />
                      <span>Promote to Production</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeSubTab === "playground" && (
          <div className="space-y-4">
            {/* Prompt & Grounding Configuration Card */}
            <div className="p-4 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/10 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                    Vertex GenAI Side-by-Side Evaluation Testbed
                  </span>
                  <select
                    value={activeScenario.id}
                    onChange={(e) => {
                      const found = evalScenarios.find(
                        (s) => s.id === e.target.value
                      );
                      if (found) {
                        setSelectedScenarioId(found.id);
                        setPromptText(found.userPrompt);
                        setSystemText(found.systemInstruction);
                      }
                    }}
                    className="px-2.5 py-1 rounded bg-slate-100 dark:bg-[#0B0F19] border border-slate-200 dark:border-white/15 text-xs font-mono text-slate-800 dark:text-zinc-200"
                  >
                    {evalScenarios.map((s) => (
                      <option key={s.id} value={s.id}>
                        Preset: {s.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <label className="flex items-center gap-1.5 font-mono text-[11px] text-slate-600 dark:text-zinc-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={dataplexGrounding}
                      onChange={(e) => setDataplexGrounding(e.target.checked)}
                      className="accent-[#00C49F]"
                    />
                    <span>Ground on Dataplex Catalog</span>
                  </label>

                  <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-600 dark:text-zinc-300">
                    <span>Temp: {temperature}</span>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={temperature}
                      onChange={(e) => setTemperature(Number(e.target.value))}
                      className="w-20 accent-[#4285F4]"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleRunPlaygroundEval}
                    disabled={runningEval}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1A73E8] hover:bg-[#1967D2] text-white font-medium transition-colors"
                  >
                    {runningEval ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Play className="w-3.5 h-3.5 fill-current" />
                    )}
                    <span>Run Side-by-Side Eval</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                    System Instruction
                  </label>
                  <textarea
                    rows={2}
                    value={systemText}
                    onChange={(e) => setSystemText(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-white/10 font-mono text-[11px] text-slate-800 dark:text-zinc-200"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase text-slate-400 mb-1">
                    Evaluation Prompt
                  </label>
                  <textarea
                    rows={2}
                    value={promptText}
                    onChange={(e) => setPromptText(e.target.value)}
                    className="w-full p-2.5 rounded-lg bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-white/10 font-mono text-[11px] text-slate-800 dark:text-zinc-200"
                  />
                </div>
              </div>
            </div>

            {/* Side-by-Side Model Comparison Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {[activeScenario.modelA, activeScenario.modelB].map((mdl, idx) => (
                <div
                  key={mdl.name}
                  className="rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/10 overflow-hidden flex flex-col"
                >
                  <div className="px-4 py-3 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0B0F19] flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          idx === 0
                            ? "bg-[#1A73E8]/20 text-[#4285F4]"
                            : "bg-[#00C49F]/20 text-[#00C49F]"
                        }`}
                      >
                        Model {idx === 0 ? "A" : "B"}
                      </span>
                      <span className="font-mono text-xs font-bold text-slate-900 dark:text-zinc-100">
                        {mdl.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 text-[11px] font-mono">
                      <span className="text-[#00C49F]">
                        Groundedness: {mdl.groundednessScore}%
                      </span>
                      <span className="text-[#4285F4]">
                        {mdl.latencyMs}ms
                      </span>
                      <span className="text-slate-400">
                        {mdl.tokens} tok ({mdl.costUsd})
                      </span>
                    </div>
                  </div>

                  <pre className="p-4 bg-slate-950 text-zinc-100 font-mono text-[11px] leading-relaxed overflow-x-auto flex-1">
                    {mdl.response}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
