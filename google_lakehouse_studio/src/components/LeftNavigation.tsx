"use client";

import React, { useState } from "react";
import {
  BookOpen,
  Boxes,
  BrainCircuit,
  ChevronDown,
  ChevronRight,
  Cpu,
  Database,
  FileCode2,
  Folder,
  FolderOpen,
  GitBranch,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  ShieldCheck,
  Sparkles,
  Table2,
  Workflow,
} from "lucide-react";
import {
  CatalogMetastore,
  CatalogTable,
  ModuleCategory,
  NotebookDoc,
  PipelineWorkflow,
  SparkPool,
  SqlWarehouse,
} from "@/types/lakehouse";

interface LeftNavigationProps {
  activeCategory: ModuleCategory;
  onSelectCategory: (cat: ModuleCategory) => void;
  notebooks: NotebookDoc[];
  metastores: CatalogMetastore[];
  pipelines: PipelineWorkflow[];
  sparkPools: SparkPool[];
  warehouses: SqlWarehouse[];
  onOpenNotebook: (nb: NotebookDoc) => void;
  onOpenCatalogTable: (table: CatalogTable) => void;
  onOpenPipeline: (pipe: PipelineWorkflow) => void;
  onOpenMlStudio: (subtab?: "experiments" | "registry" | "playground") => void;
  onOpenComputeModal: () => void;
  activeResourceId: string;
}

export function LeftNavigation({
  activeCategory,
  onSelectCategory,
  notebooks,
  metastores,
  pipelines,
  sparkPools,
  warehouses,
  onOpenNotebook,
  onOpenCatalogTable,
  onOpenPipeline,
  onOpenMlStudio,
  onOpenComputeModal,
  activeResourceId,
}: LeftNavigationProps) {
  const [treeCollapsed, setTreeCollapsed] = useState(false);
  const [treeFilter, setTreeFilter] = useState("");
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    "ws-root": true,
    "cat-root": true,
    "schema-ecommerce": true,
    "schema-fraud": true,
    "schema-vertex-fs": true,
    "pipe-root": true,
    "ml-root": true,
  });

  const toggleNode = (key: string) => {
    setExpandedNodes((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const navItems: {
    id: ModuleCategory;
    label: string;
    gcpSub: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    {
      id: "workspace",
      label: "Workspace",
      gcpSub: "Workbench + BQ Studio",
      icon: BookOpen,
    },
    {
      id: "catalog",
      label: "Catalog",
      gcpSub: "Dataplex + BigLake",
      icon: Database,
    },
    {
      id: "pipelines",
      label: "Workflows",
      gcpSub: "Composer + Dataflow",
      icon: Workflow,
    },
    {
      id: "compute",
      label: "Compute",
      gcpSub: "Dataproc + BQ Slots",
      icon: Cpu,
    },
    {
      id: "ml_genai",
      label: "ML & GenAI",
      gcpSub: "Vertex AI Studio",
      icon: BrainCircuit,
    },
  ];

  const q = treeFilter.trim().toLowerCase();

  return (
    <aside className="flex h-full shrink-0 select-none border-r border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0B0F19]">
      {/* Primary Icon Rail */}
      <div className="w-14 flex flex-col items-center justify-between py-3 border-r border-slate-200 dark:border-white/10 bg-white dark:bg-[#0B0F19] z-20">
        <div className="flex flex-col items-center gap-1.5 w-full px-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeCategory === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectCategory(item.id);
                  if (treeCollapsed) setTreeCollapsed(false);
                  if (item.id === "compute") {
                    onOpenComputeModal();
                  } else if (item.id === "ml_genai") {
                    onOpenMlStudio();
                  } else if (item.id === "pipelines" && pipelines[0]) {
                    onOpenPipeline(pipelines[0]);
                  } else if (
                    item.id === "catalog" &&
                    metastores[0]?.schemas[0]?.tables[0]
                  ) {
                    onOpenCatalogTable(metastores[0].schemas[0].tables[0]);
                  } else if (item.id === "workspace" && notebooks[0]) {
                    onOpenNotebook(notebooks[0]);
                  }
                }}
                className={`w-full py-2 px-1 rounded-lg flex flex-col items-center gap-1 transition-all duration-150 group relative ${
                  isActive
                    ? "bg-[#1A73E8]/15 text-[#4285F4] border border-[#4285F4]/30"
                    : "text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-white/5"
                }`}
                title={`${item.label} (${item.gcpSub})`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[9px] font-medium leading-none tracking-tight">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Bottom Collapse / Expand Toggle */}
        <button
          type="button"
          onClick={() => setTreeCollapsed(!treeCollapsed)}
          className="p-2 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-white/5 transition-all duration-150"
          title={treeCollapsed ? "Expand Resource Explorer" : "Collapse Resource Explorer"}
        >
          {treeCollapsed ? (
            <PanelLeftOpen className="w-4 h-4" />
          ) : (
            <PanelLeftClose className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Secondary Nested Resource Tree */}
      {!treeCollapsed && (
        <div className="w-68 flex flex-col h-full bg-slate-50/80 dark:bg-[#111827]/75 overflow-hidden">
          {/* Explorer Header */}
          <div className="p-2.5 border-b border-slate-200 dark:border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                Lakehouse Explorer
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-[#00C49F] border border-[#00C49F]/20">
                Dataplex Synced
              </span>
            </div>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={treeFilter}
                onChange={(e) => setTreeFilter(e.target.value)}
                placeholder="Filter workspace & catalog..."
                className="w-full pl-8 pr-2.5 py-1 text-xs rounded-md bg-white dark:bg-[#0B0F19] border border-slate-200 dark:border-white/10 text-slate-800 dark:text-zinc-200 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-[#4285F4]"
              />
            </div>
          </div>

          {/* Scrollable Nested Resource Tree */}
          <div className="flex-1 overflow-y-auto p-2 space-y-3 text-xs">
            {/* 1. Workspace Notebooks Section */}
            <div>
              <button
                type="button"
                onClick={() => toggleNode("ws-root")}
                className="w-full flex items-center justify-between px-1.5 py-1 rounded text-left font-semibold text-slate-700 dark:text-zinc-300 hover:bg-slate-200/50 dark:hover:bg-white/5 transition-colors"
              >
                <span className="flex items-center gap-1.5">
                  {expandedNodes["ws-root"] ? (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  )}
                  <FolderOpen className="w-3.5 h-3.5 text-[#4285F4]" />
                  <span>/Workspace/Repos</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500">
                  {notebooks.length}
                </span>
              </button>

              {expandedNodes["ws-root"] && (
                <div className="mt-1 ml-3 pl-2 border-l border-slate-200 dark:border-white/10 space-y-0.5">
                  {notebooks
                    .filter((nb) => !q || nb.name.toLowerCase().includes(q))
                    .map((nb) => {
                      const active = activeResourceId === nb.id;
                      return (
                        <button
                          key={nb.id}
                          type="button"
                          onClick={() => onOpenNotebook(nb)}
                          className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left transition-all duration-150 ${
                            active
                              ? "bg-[#1A73E8]/15 text-[#4285F4] font-medium border border-[#4285F4]/30"
                              : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-200/50 dark:hover:bg-white/5"
                          }`}
                        >
                          <FileCode2 className="w-3.5 h-3.5 shrink-0 text-[#4285F4]" />
                          <span className="truncate text-[11px]">{nb.name}</span>
                        </button>
                      );
                    })}
                </div>
              )}
            </div>

            {/* 2. Unity Catalog -> Dataplex 3-Level Namespace */}
            <div>
              <button
                type="button"
                onClick={() => toggleNode("cat-root")}
                className="w-full flex items-center justify-between px-1.5 py-1 rounded text-left font-semibold text-slate-700 dark:text-zinc-300 hover:bg-slate-200/50 dark:hover:bg-white/5 transition-colors"
              >
                <span className="flex items-center gap-1.5">
                  {expandedNodes["cat-root"] ? (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  )}
                  <ShieldCheck className="w-3.5 h-3.5 text-[#00C49F]" />
                  <span>Dataplex Metastore</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500">
                  3-Lvl
                </span>
              </button>

              {expandedNodes["cat-root"] &&
                metastores.map((meta) => (
                  <div
                    key={meta.projectId}
                    className="mt-1 ml-2 pl-2 border-l border-slate-200 dark:border-white/10 space-y-1"
                  >
                    <div className="px-1.5 py-0.5 text-[10px] font-mono text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                      <Boxes className="w-3 h-3 text-amber-400" />
                      <span className="truncate">{meta.projectId}</span>
                    </div>

                    {meta.schemas.map((schema) => {
                      const isExpanded = expandedNodes[schema.id] ?? true;
                      const filteredTables = schema.tables.filter(
                        (t) =>
                          !q ||
                          t.name.toLowerCase().includes(q) ||
                          schema.name.toLowerCase().includes(q)
                      );
                      if (q && filteredTables.length === 0) return null;

                      return (
                        <div key={schema.id} className="space-y-0.5">
                          <button
                            type="button"
                            onClick={() => toggleNode(schema.id)}
                            className="w-full flex items-center justify-between px-1.5 py-1 rounded text-left text-slate-700 dark:text-zinc-300 hover:bg-slate-200/50 dark:hover:bg-white/5 transition-colors"
                          >
                            <span className="flex items-center gap-1.5 truncate">
                              {isExpanded ? (
                                <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
                              ) : (
                                <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
                              )}
                              <Database className="w-3 h-3 text-[#4285F4] shrink-0" />
                              <span className="font-mono text-[11px] truncate">
                                {schema.name}
                              </span>
                            </span>
                          </button>

                          {isExpanded && (
                            <div className="ml-3 pl-2 border-l border-slate-200 dark:border-white/10 space-y-0.5">
                              {filteredTables.map((tbl) => {
                                const active = activeResourceId === tbl.id;
                                return (
                                  <button
                                    key={tbl.id}
                                    type="button"
                                    onClick={() => onOpenCatalogTable(tbl)}
                                    className={`w-full flex items-center justify-between gap-1.5 px-2 py-1 rounded-md text-left transition-all duration-150 ${
                                      active
                                        ? "bg-[#1A73E8]/15 text-[#4285F4] font-medium border border-[#4285F4]/30"
                                        : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-200/50 dark:hover:bg-white/5"
                                    }`}
                                  >
                                    <span className="flex items-center gap-1.5 truncate">
                                      <Table2 className="w-3 h-3 shrink-0 text-[#00C49F]" />
                                      <span className="font-mono text-[11px] truncate">
                                        {tbl.name}
                                      </span>
                                    </span>
                                    <span
                                      className={`text-[9px] font-mono px-1 rounded shrink-0 ${
                                        tbl.tier === "Gold"
                                          ? "bg-amber-500/15 text-amber-400"
                                          : tbl.tier === "Silver"
                                          ? "bg-sky-500/15 text-sky-400"
                                          : tbl.tier === "Feature Store"
                                          ? "bg-purple-500/15 text-purple-400"
                                          : "bg-slate-500/15 text-slate-400"
                                      }`}
                                    >
                                      {tbl.tier === "Feature Store" ? "FS" : tbl.tier}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
            </div>

            {/* 3. Pipelines & Orchestration (DLT -> Composer + Dataflow) */}
            <div>
              <button
                type="button"
                onClick={() => toggleNode("pipe-root")}
                className="w-full flex items-center justify-between px-1.5 py-1 rounded text-left font-semibold text-slate-700 dark:text-zinc-300 hover:bg-slate-200/50 dark:hover:bg-white/5 transition-colors"
              >
                <span className="flex items-center gap-1.5">
                  {expandedNodes["pipe-root"] ? (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  )}
                  <GitBranch className="w-3.5 h-3.5 text-purple-400" />
                  <span>Declarative Pipelines</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500">
                  {pipelines.length}
                </span>
              </button>

              {expandedNodes["pipe-root"] && (
                <div className="mt-1 ml-3 pl-2 border-l border-slate-200 dark:border-white/10 space-y-0.5">
                  {pipelines
                    .filter((p) => !q || p.name.toLowerCase().includes(q))
                    .map((pipe) => {
                      const active = activeResourceId === pipe.id;
                      return (
                        <button
                          key={pipe.id}
                          type="button"
                          onClick={() => onOpenPipeline(pipe)}
                          className={`w-full flex items-center justify-between gap-1.5 px-2 py-1.5 rounded-md text-left transition-all duration-150 ${
                            active
                              ? "bg-[#1A73E8]/15 text-[#4285F4] font-medium border border-[#4285F4]/30"
                              : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-200/50 dark:hover:bg-white/5"
                          }`}
                        >
                          <span className="flex items-center gap-1.5 truncate">
                            <Workflow className="w-3.5 h-3.5 shrink-0 text-purple-400" />
                            <span className="font-mono text-[11px] truncate">
                              {pipe.name}
                            </span>
                          </span>
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 ${
                              pipe.status === "RUNNING"
                                ? "bg-[#00C49F] animate-pulse"
                                : pipe.status === "FAILED"
                                ? "bg-rose-500"
                                : "bg-emerald-400"
                            }`}
                          />
                        </button>
                      );
                    })}
                </div>
              )}
            </div>

            {/* 4. Vertex AI ML & GenAI Studio */}
            <div>
              <button
                type="button"
                onClick={() => toggleNode("ml-root")}
                className="w-full flex items-center justify-between px-1.5 py-1 rounded text-left font-semibold text-slate-700 dark:text-zinc-300 hover:bg-slate-200/50 dark:hover:bg-white/5 transition-colors"
              >
                <span className="flex items-center gap-1.5">
                  {expandedNodes["ml-root"] ? (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  )}
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Vertex AI & GenAI</span>
                </span>
              </button>

              {expandedNodes["ml-root"] && (
                <div className="mt-1 ml-3 pl-2 border-l border-slate-200 dark:border-white/10 space-y-0.5">
                  <button
                    type="button"
                    onClick={() => onOpenMlStudio("experiments")}
                    className="w-full flex items-center gap-2 px-2 py-1 rounded-md text-left text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-200/50 dark:hover:bg-white/5 text-[11px]"
                  >
                    <BrainCircuit className="w-3 h-3 text-[#4285F4]" />
                    <span>Vertex AI Experiments (4)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenMlStudio("registry")}
                    className="w-full flex items-center gap-2 px-2 py-1 rounded-md text-left text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-200/50 dark:hover:bg-white/5 text-[11px]"
                  >
                    <Boxes className="w-3 h-3 text-[#00C49F]" />
                    <span>Model Registry & Endpoints</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenMlStudio("playground")}
                    className="w-full flex items-center gap-2 px-2 py-1 rounded-md text-left text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-200/50 dark:hover:bg-white/5 text-[11px]"
                  >
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>Gemini Eval Playground</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Compute Summary Footer */}
          <div className="p-2.5 border-t border-slate-200 dark:border-white/10 bg-white/60 dark:bg-[#0B0F19]/80">
            <button
              type="button"
              onClick={onOpenComputeModal}
              className="w-full flex items-center justify-between text-xs px-2.5 py-2 rounded-lg bg-slate-100 dark:bg-[#111827] hover:bg-slate-200/70 dark:hover:bg-[#182236] border border-slate-200 dark:border-white/10 transition-all duration-150"
            >
              <div className="flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5 text-[#00C49F]" />
                <div className="text-left">
                  <div className="text-[11px] font-medium text-slate-800 dark:text-zinc-200">
                    Compute Pools ({sparkPools.length + warehouses.length})
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 dark:text-zinc-400">
                    Dataproc + BQ Reservations
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-mono text-[#4285F4]">Manage</span>
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
