"use client";

import React, { useEffect, useState } from "react";
import {
  ArrowRight,
  BrainCircuit,
  Cpu,
  Database,
  FileCode2,
  Search,
  Sparkles,
  Table2,
  Workflow,
  X,
} from "lucide-react";
import {
  CatalogMetastore,
  CatalogTable,
  NotebookDoc,
  PipelineWorkflow,
} from "@/types/lakehouse";

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  notebooks: NotebookDoc[];
  metastores: CatalogMetastore[];
  pipelines: PipelineWorkflow[];
  onSelectNotebook: (nb: NotebookDoc) => void;
  onSelectTable: (tbl: CatalogTable) => void;
  onSelectPipeline: (pipe: PipelineWorkflow) => void;
  onOpenComputeModal: () => void;
  onOpenMlStudio: (subtab?: "experiments" | "registry" | "playground") => void;
  onCreateNewNotebook: () => void;
}

interface CommandItem {
  id: string;
  category: string;
  title: string;
  subtitle: string;
  gcpBadge: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
}

export function CommandPaletteModal({
  isOpen,
  onClose,
  notebooks,
  metastores,
  pipelines,
  onSelectNotebook,
  onSelectTable,
  onSelectPipeline,
  onOpenComputeModal,
  onOpenMlStudio,
  onCreateNewNotebook,
}: CommandPaletteModalProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const allTables = metastores.flatMap((m) =>
    m.schemas.flatMap((s) => s.tables)
  );

  const items: CommandItem[] = [
    ...notebooks.map((nb) => ({
      id: `cmd-nb-${nb.id}`,
      category: "Polyglot Notebooks",
      title: nb.name,
      subtitle: nb.folderPath,
      gcpBadge: "Vertex Workbench + BQ Studio",
      icon: FileCode2,
      action: () => {
        onSelectNotebook(nb);
        onClose();
      },
    })),
    ...allTables.map((tbl) => ({
      id: `cmd-tbl-${tbl.id}`,
      category: "Dataplex Catalog",
      title: `${tbl.schemaName}.${tbl.name}`,
      subtitle: `${tbl.format} • ${tbl.rowCount} rows`,
      gcpBadge: tbl.tier,
      icon: Table2,
      action: () => {
        onSelectTable(tbl);
        onClose();
      },
    })),
    ...pipelines.map((pipe) => ({
      id: `cmd-pipe-${pipe.id}`,
      category: "Pipelines & Orchestration",
      title: pipe.name,
      subtitle: pipe.orchestrator,
      gcpBadge: pipe.status,
      icon: Workflow,
      action: () => {
        onSelectPipeline(pipe);
        onClose();
      },
    })),
    {
      id: "cmd-act-compute",
      category: "Compute & Infrastructure",
      title: "Open Compute Engine Manager",
      subtitle: "Manage Dataproc Serverless Spark Pools & BigQuery Slot Reservations",
      gcpBadge: "Serverless",
      icon: Cpu,
      action: () => {
        onClose();
        onOpenComputeModal();
      },
    },
    {
      id: "cmd-act-ml-playground",
      category: "ML & GenAI Studio",
      title: "Launch Vertex GenAI Side-by-Side Playground",
      subtitle: "Compare Gemini 2.5 Pro vs Gemini 2.5 Flash grounded on Dataplex",
      gcpBadge: "Vertex AI",
      icon: Sparkles,
      action: () => {
        onOpenMlStudio("playground");
        onClose();
      },
    },
    {
      id: "cmd-act-new-nb",
      category: "Quick Actions",
      title: "Create New Polyglot Notebook",
      subtitle: "Attach BigQuery Enterprise Plus + Dataproc Serverless Spark 3.5",
      gcpBadge: "Action",
      icon: BrainCircuit,
      action: () => {
        onCreateNewNotebook();
        onClose();
      },
    },
  ];

  const filtered = items.filter((item) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      item.title.toLowerCase().includes(q) ||
      item.subtitle.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.gcpBadge.toLowerCase().includes(q)
    );
  });

  useEffect(() => {
    setSelectedIndex(0);
  }, [query, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          filtered.length > 0 ? (prev + 1) % filtered.length : 0
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          filtered.length > 0
            ? (prev - 1 + filtered.length) % filtered.length
            : 0
        );
      } else if (e.key === "Enter" && filtered[selectedIndex]) {
        e.preventDefault();
        filtered[selectedIndex].action();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filtered, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-start justify-center pt-20 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/15 shadow-2xl overflow-hidden"
      >
        {/* Search Input */}
        <div className="px-4 py-3.5 border-b border-slate-200 dark:border-white/10 flex items-center gap-3">
          <Search className="w-4 h-4 text-[#4285F4]" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Jump to any dataset, Iceberg table, polyglot notebook, DLT pipeline, or compute pool..."
            className="flex-1 bg-transparent text-sm text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-zinc-400"
          >
            ESC
          </button>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-400 dark:text-zinc-500">
              No matching Lakehouse resources found for &ldquo;{query}&rdquo;.
            </div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              const active = idx === selectedIndex;
              return (
                <button
                  key={item.id}
                  type="button"
                  onMouseEnter={() => setSelectedIndex(idx)}
                  onClick={item.action}
                  className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
                    active
                      ? "bg-[#1A73E8]/15 text-[#4285F4] border border-[#4285F4]/30"
                      : "hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-zinc-300"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-slate-100 dark:bg-[#0B0F19] text-[#4285F4] shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900 dark:text-zinc-100 truncate">
                          {item.title}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200/70 dark:bg-white/10 text-slate-600 dark:text-zinc-300">
                          {item.category}
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-slate-500 dark:text-zinc-400 truncate">
                        {item.subtitle}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#00C49F]/15 text-[#00C49F]">
                      {item.gcpBadge}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0B0F19] flex items-center justify-between text-[11px] font-mono text-slate-400 dark:text-zinc-500">
          <span>↑↓ Navigate • Enter to Open • Esc to Dismiss</span>
          <span>Google Lakehouse Studio Global Search (Dataplex + Vertex AI)</span>
        </div>
      </div>
    </div>
  );
}
