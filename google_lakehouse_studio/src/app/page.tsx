"use client";

import React, { useEffect, useState } from "react";
import {
  ArrowRightLeft,
  BrainCircuit,
  ChevronRight,
  Database,
  FileCode2,
  Sparkles,
  Workflow,
  X,
} from "lucide-react";
import {
  CATALOG_METASTORES,
  GENAI_EVAL_SCENARIOS,
  INITIAL_EXPERIMENTS,
  INITIAL_NOTEBOOKS,
  INITIAL_PIPELINES,
  INITIAL_REGISTERED_MODELS,
  INITIAL_SPARK_POOLS,
  INITIAL_SQL_WAREHOUSES,
  INITIAL_TABS,
  LINEAGE_EDGES,
  LINEAGE_NODES,
} from "@/data/mockLakehouseData";
import {
  CatalogTable,
  ModuleCategory,
  NotebookDoc,
  PipelineWorkflow,
  RegisteredModel,
  SparkPool,
  SqlWarehouse,
  WorkspaceTab,
} from "@/types/lakehouse";
import { TopCommandBar } from "@/components/TopCommandBar";
import { LeftNavigation } from "@/components/LeftNavigation";
import { NotebookWorkspace } from "@/components/NotebookWorkspace";
import { CatalogLineageView } from "@/components/CatalogLineageView";
import { PipelinesDagView } from "@/components/PipelinesDagView";
import { MlGenAiStudioView } from "@/components/MlGenAiStudioView";
import { ComputeManagerModal } from "@/components/ComputeManagerModal";
import { CommandPaletteModal } from "@/components/CommandPaletteModal";

export default function GoogleLakehouseStudioPage() {
  const [isDark, setIsDark] = useState(true);
  const [activeCategory, setActiveCategory] =
    useState<ModuleCategory>("workspace");

  // Multi-tab workspace state
  const [tabs, setTabs] = useState<WorkspaceTab[]>(INITIAL_TABS);
  const [activeTabId, setActiveTabId] = useState<string>(INITIAL_TABS[0].id);

  // Domain state preserved across tab switches
  const [notebooks, setNotebooks] = useState<NotebookDoc[]>(INITIAL_NOTEBOOKS);
  const [pipelines, setPipelines] =
    useState<PipelineWorkflow[]>(INITIAL_PIPELINES);
  const [sparkPools, setSparkPools] =
    useState<SparkPool[]>(INITIAL_SPARK_POOLS);
  const [warehouses, setWarehouses] = useState<SqlWarehouse[]>(
    INITIAL_SQL_WAREHOUSES
  );
  const [models, setModels] = useState<RegisteredModel[]>(
    INITIAL_REGISTERED_MODELS
  );
  const [mlSubTab, setMlSubTab] = useState<
    "experiments" | "registry" | "playground"
  >("experiments");

  // Modals
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [computeModalOpen, setComputeModalOpen] = useState(false);

  const allTables: CatalogTable[] = CATALOG_METASTORES.flatMap((m) =>
    m.schemas.flatMap((s) => s.tables)
  );

  // Global Cmd+K / Ctrl+K shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  const handleOpenNotebookTab = (nb: NotebookDoc) => {
    setActiveCategory("workspace");
    const existing = tabs.find(
      (t) => t.kind === "notebook" && t.resourceId === nb.id
    );
    if (existing) {
      setActiveTabId(existing.id);
      return;
    }
    const newTab: WorkspaceTab = {
      id: `tab-nb-${nb.id}`,
      title: nb.name,
      kind: "notebook",
      resourceId: nb.id,
      breadcrumb: ["Workspace", "Repos", nb.name],
      gcpBadge: "Vertex AI Workbench + BigQuery Studio",
      databricksEquivalent: "Databricks Polyglot Notebook",
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newTab.id);
  };

  const handleOpenCatalogTab = (tbl: CatalogTable) => {
    setActiveCategory("catalog");
    const existing = tabs.find(
      (t) => t.kind === "catalog" && t.resourceId === tbl.id
    );
    if (existing) {
      setActiveTabId(existing.id);
      return;
    }
    const newTab: WorkspaceTab = {
      id: `tab-cat-${tbl.id}`,
      title: `${tbl.schemaName}.${tbl.name}`,
      kind: "catalog",
      resourceId: tbl.id,
      breadcrumb: [
        "Dataplex Catalog",
        tbl.projectId,
        tbl.schemaName,
        tbl.name,
      ],
      gcpBadge: `Dataplex + ${tbl.format}`,
      databricksEquivalent: "Unity Catalog & Lineage",
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newTab.id);
  };

  const handleOpenPipelineTab = (pipe: PipelineWorkflow) => {
    setActiveCategory("pipelines");
    const existing = tabs.find(
      (t) => t.kind === "pipeline" && t.resourceId === pipe.id
    );
    if (existing) {
      setActiveTabId(existing.id);
      return;
    }
    const newTab: WorkspaceTab = {
      id: `tab-pipe-${pipe.id}`,
      title: pipe.name,
      kind: "pipeline",
      resourceId: pipe.id,
      breadcrumb: ["Workflows & Pipelines", "us-central1", pipe.name],
      gcpBadge: "Cloud Composer 3 + Dataflow Prime",
      databricksEquivalent: "Delta Live Tables (DLT) + Workflows",
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newTab.id);
  };

  const handleOpenMlStudioTab = (
    subtab?: "experiments" | "registry" | "playground"
  ) => {
    setActiveCategory("ml_genai");
    if (subtab) setMlSubTab(subtab);
    const existing = tabs.find((t) => t.kind === "ml_studio");
    if (existing) {
      setActiveTabId(existing.id);
      return;
    }
    const newTab: WorkspaceTab = {
      id: "tab-ml-genai",
      title: "Vertex Experiments & GenAI Studio",
      kind: "ml_studio",
      resourceId: "ml-vertex-studio",
      breadcrumb: [
        "ML & GenAI",
        "lustrous-stone-417013",
        "Experiments, Registry & Gemini Playground",
      ],
      gcpBadge: "Vertex AI Experiments + GenAI Studio",
      databricksEquivalent: "MLflow & Mosaic AI Playground",
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newTab.id);
  };

  const handleCreateNewNotebook = () => {
    const newNb: NotebookDoc = {
      id: `nb-${Date.now()}`,
      name: `0${notebooks.length + 1}_adhoc_lakehouse_exploration.ipynb`,
      folderPath: "/Workspace/ecommerce_lakehouse/notebooks",
      attachedSparkPoolId: sparkPools[0].id,
      attachedBqWarehouseId: warehouses[0].id,
      lastModified: "Just now • Oct 13, 2026",
      author: "boris.bugarski@gcp-lakehouse.io",
      cells: [
        {
          id: `cell-init-${Date.now()}`,
          title: "BigQuery Studio + BigLake Iceberg Exploration",
          language: "sql",
          engineLabel: "BigQuery Studio • Enterprise Plus (BI Engine)",
          code: `SELECT\n  region_code,\n  loyalty_tier,\n  COUNT(*) AS customers,\n  ROUND(AVG(lifetime_value_usd), 2) AS avg_ltv_usd\nFROM \`lustrous-stone-417013.ecommerce_lakehouse.gold_customer_360\`\nGROUP BY 1, 2\nORDER BY avg_ltv_usd DESC;`,
          status: "succeeded",
          lastRunDuration: "0.64s",
          lastRunTimestamp: "Just now",
          bytesScannedOrWorkers: "18.4 MB scanned • BI Engine Hit",
          activeOutputTab: "table",
          chartType: "bar",
          chartMetricLabel: "Avg LTV ($ USD)",
          chartSecondaryLabel: "Customers",
          tableColumns: [
            "region_code",
            "loyalty_tier",
            "customers",
            "avg_ltv_usd",
          ],
          tableRows: [
            {
              region_code: "US-EAST",
              loyalty_tier: "DIAMOND",
              customers: 42810,
              avg_ltv_usd: 4820.5,
            },
            {
              region_code: "EU-CENTRAL",
              loyalty_tier: "DIAMOND",
              customers: 36190,
              avg_ltv_usd: 4510.2,
            },
          ],
          chartData: [
            { label: "US-EAST • Diamond", primary: 4820, secondary: 42810 },
            { label: "EU-CENTRAL • Diamond", primary: 4510, secondary: 36190 },
          ],
          profileStats: [
            {
              column: "avg_ltv_usd",
              type: "FLOAT64",
              nullPct: 0.0,
              distinctCount: 2,
              min: "$4,510.20",
              max: "$4,820.50",
              distribution: [85, 100, 0, 0, 0],
            },
          ],
        },
      ],
    };
    setNotebooks((prev) => [...prev, newNb]);
    handleOpenNotebookTab(newNb);
  };

  const handleCloseTab = (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tabs.length <= 1) return;
    const nextTabs = tabs.filter((t) => t.id !== tabId);
    setTabs(nextTabs);
    if (activeTabId === tabId) {
      setActiveTabId(nextTabs[nextTabs.length - 1].id);
    }
  };

  const renderTabIcon = (kind: WorkspaceTab["kind"]) => {
    switch (kind) {
      case "notebook":
        return <FileCode2 className="w-3.5 h-3.5 text-[#4285F4] shrink-0" />;
      case "catalog":
        return <Database className="w-3.5 h-3.5 text-[#00C49F] shrink-0" />;
      case "pipeline":
        return <Workflow className="w-3.5 h-3.5 text-purple-400 shrink-0" />;
      case "ml_studio":
        return <BrainCircuit className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-[#4285F4] shrink-0" />;
    }
  };

  return (
    <div className={isDark ? "dark" : ""}>
      <div className="h-screen w-screen flex flex-col overflow-hidden bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-zinc-100">
        {/* Global Top Command Bar */}
        <TopCommandBar
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          onOpenComputeModal={() => setComputeModalOpen(true)}
          onCreateNewNotebook={handleCreateNewNotebook}
          activeSparkPool={sparkPools[0]}
          activeWarehouse={warehouses[0]}
          isDark={isDark}
          onToggleTheme={() => setIsDark(!isDark)}
        />

        {/* Workspace Body: Left Navigation + Multi-Tab Workspace */}
        <div className="flex-1 flex overflow-hidden">
          <LeftNavigation
            activeCategory={activeCategory}
            onSelectCategory={setActiveCategory}
            notebooks={notebooks}
            metastores={CATALOG_METASTORES}
            pipelines={pipelines}
            sparkPools={sparkPools}
            warehouses={warehouses}
            onOpenNotebook={handleOpenNotebookTab}
            onOpenCatalogTable={handleOpenCatalogTab}
            onOpenPipeline={handleOpenPipelineTab}
            onOpenMlStudio={handleOpenMlStudioTab}
            onOpenComputeModal={() => setComputeModalOpen(true)}
            activeResourceId={activeTab.resourceId}
          />

          {/* Right Multi-Tab Content Area */}
          <main className="flex-1 flex flex-col overflow-hidden">
            {/* Multi-Tab Bar */}
            <div className="h-10 border-b border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-[#0E1422] px-2 flex items-center gap-1 overflow-x-auto select-none shrink-0">
              {tabs.map((tab) => {
                const isActive = tab.id === activeTab.id;
                return (
                  <div
                    key={tab.id}
                    onClick={() => setActiveTabId(tab.id)}
                    className={`group flex items-center gap-2 px-3 py-1.5 rounded-t-lg text-xs cursor-pointer border-t border-x transition-all duration-150 shrink-0 max-w-[260px] ${
                      isActive
                        ? "bg-white dark:bg-[#111827] text-slate-900 dark:text-zinc-100 border-slate-200 dark:border-white/15 font-semibold"
                        : "bg-transparent text-slate-500 dark:text-zinc-400 border-transparent hover:bg-white/50 dark:hover:bg-white/5"
                    }`}
                  >
                    {renderTabIcon(tab.kind)}
                    <span className="truncate font-mono text-[11px]">
                      {tab.title}
                    </span>
                    {tabs.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => handleCloseTab(tab.id, e)}
                        className="p-0.5 rounded hover:bg-slate-200 dark:hover:bg-white/10 opacity-60 group-hover:opacity-100"
                        title="Close Tab"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Breadcrumb Path + Databricks -> GCP Service Mapping Strip */}
            <div className="px-4 py-1.5 border-b border-slate-200 dark:border-white/10 bg-white dark:bg-[#111827] flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
              <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-500 dark:text-zinc-400 overflow-x-auto">
                {activeTab.breadcrumb.map((crumb, idx) => (
                  <React.Fragment key={`${crumb}-${idx}`}>
                    {idx > 0 && (
                      <ChevronRight className="w-3 h-3 text-slate-400 dark:text-zinc-600 shrink-0" />
                    )}
                    <span
                      className={
                        idx === activeTab.breadcrumb.length - 1
                          ? "text-slate-900 dark:text-zinc-100 font-semibold"
                          : ""
                      }
                    >
                      {crumb}
                    </span>
                  </React.Fragment>
                ))}
              </div>

              <div className="flex items-center gap-2 text-[11px] font-mono">
                <span className="text-slate-400 dark:text-zinc-500">
                  {activeTab.databricksEquivalent}
                </span>
                <ArrowRightLeft className="w-3 h-3 text-[#4285F4]" />
                <span className="px-2 py-0.5 rounded bg-[#00C49F]/15 text-[#00C49F] border border-[#00C49F]/30 font-semibold">
                  Powered by {activeTab.gcpBadge}
                </span>
              </div>
            </div>

            {/* Active Tab Viewport (Preserves State) */}
            <div className="flex-1 overflow-hidden">
              {activeTab.kind === "notebook" && (
                <NotebookWorkspace
                  notebook={
                    notebooks.find((n) => n.id === activeTab.resourceId) ||
                    notebooks[0]
                  }
                  onUpdateNotebook={(updated) =>
                    setNotebooks((prev) =>
                      prev.map((n) => (n.id === updated.id ? updated : n))
                    )
                  }
                  sparkPools={sparkPools}
                  warehouses={warehouses}
                  metastores={CATALOG_METASTORES}
                  onOpenComputeModal={() => setComputeModalOpen(true)}
                  onInspectCatalogTable={handleOpenCatalogTab}
                />
              )}

              {activeTab.kind === "catalog" && (
                <CatalogLineageView
                  metastores={CATALOG_METASTORES}
                  selectedTable={
                    allTables.find((t) => t.id === activeTab.resourceId) ||
                    allTables[0]
                  }
                  onSelectTable={(tbl) => {
                    setTabs((prev) =>
                      prev.map((t) =>
                        t.id === activeTab.id
                          ? {
                              ...t,
                              title: `${tbl.schemaName}.${tbl.name}`,
                              resourceId: tbl.id,
                              breadcrumb: [
                                "Dataplex Catalog",
                                tbl.projectId,
                                tbl.schemaName,
                                tbl.name,
                              ],
                              gcpBadge: `Dataplex + ${tbl.format}`,
                            }
                          : t
                      )
                    );
                  }}
                  lineageNodes={LINEAGE_NODES}
                  lineageEdges={LINEAGE_EDGES}
                  onQueryTableInNotebook={() => {
                    handleOpenNotebookTab(notebooks[0]);
                  }}
                />
              )}

              {activeTab.kind === "pipeline" && (
                <PipelinesDagView
                  pipelines={pipelines}
                  selectedPipeline={
                    pipelines.find((p) => p.id === activeTab.resourceId) ||
                    pipelines[0]
                  }
                  onSelectPipeline={(pipe) => {
                    setTabs((prev) =>
                      prev.map((t) =>
                        t.id === activeTab.id
                          ? {
                              ...t,
                              title: pipe.name,
                              resourceId: pipe.id,
                              breadcrumb: [
                                "Workflows & Pipelines",
                                "us-central1",
                                pipe.name,
                              ],
                            }
                          : t
                      )
                    );
                  }}
                  onUpdatePipeline={(updated) =>
                    setPipelines((prev) =>
                      prev.map((p) => (p.id === updated.id ? updated : p))
                    )
                  }
                />
              )}

              {activeTab.kind === "ml_studio" && (
                <MlGenAiStudioView
                  experiments={INITIAL_EXPERIMENTS}
                  models={models}
                  onUpdateModels={setModels}
                  evalScenarios={GENAI_EVAL_SCENARIOS}
                  initialSubTab={mlSubTab}
                />
              )}
            </div>
          </main>
        </div>

        {/* Global Command Palette Modal (Cmd+K) */}
        <CommandPaletteModal
          isOpen={commandPaletteOpen}
          onClose={() => setCommandPaletteOpen(false)}
          notebooks={notebooks}
          metastores={CATALOG_METASTORES}
          pipelines={pipelines}
          onSelectNotebook={handleOpenNotebookTab}
          onSelectTable={handleOpenCatalogTab}
          onSelectPipeline={handleOpenPipelineTab}
          onOpenComputeModal={() => setComputeModalOpen(true)}
          onOpenMlStudio={handleOpenMlStudioTab}
          onCreateNewNotebook={handleCreateNewNotebook}
        />

        {/* Compute Engine Manager Modal */}
        <ComputeManagerModal
          isOpen={computeModalOpen}
          onClose={() => setComputeModalOpen(false)}
          sparkPools={sparkPools}
          onUpdateSparkPools={setSparkPools}
          warehouses={warehouses}
          onUpdateWarehouses={setWarehouses}
        />
      </div>
    </div>
  );
}
