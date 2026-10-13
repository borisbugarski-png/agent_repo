"use client";

import React, { useState } from "react";
import {
  BarChart3,
  Check,
  ChevronDown,
  Code2,
  Copy,
  Cpu,
  Database,
  ExternalLink,
  FileSpreadsheet,
  Loader2,
  PanelRightClose,
  PanelRightOpen,
  Play,
  Plus,
  ShieldAlert,
  Sparkles,
  Table2,
  Trash2,
  Wand2,
  X,
} from "lucide-react";
import {
  CatalogMetastore,
  CatalogTable,
  CellLanguage,
  CellOutputTab,
  NotebookCell,
  NotebookDoc,
  SparkPool,
  SqlWarehouse,
} from "@/types/lakehouse";

interface NotebookWorkspaceProps {
  notebook: NotebookDoc;
  onUpdateNotebook: (updated: NotebookDoc) => void;
  sparkPools: SparkPool[];
  warehouses: SqlWarehouse[];
  metastores: CatalogMetastore[];
  onOpenComputeModal: () => void;
  onInspectCatalogTable: (tbl: CatalogTable) => void;
}

export function NotebookWorkspace({
  notebook,
  onUpdateNotebook,
  sparkPools,
  warehouses,
  metastores,
  onOpenComputeModal,
  onInspectCatalogTable,
}: NotebookWorkspaceProps) {
  const [schemaDrawerOpen, setSchemaDrawerOpen] = useState(true);
  const [computeDropdownOpen, setComputeDropdownOpen] = useState(false);
  const [selectedSchemaTableId, setSelectedSchemaTableId] = useState<string>(
    "tbl-gold-customer-360"
  );
  const [geminiPrompt, setGeminiPrompt] = useState("");
  const [geminiGenerating, setGeminiGenerating] = useState(false);
  const [lookerModalCell, setLookerModalCell] = useState<NotebookCell | null>(
    null
  );
  const [copiedCellId, setCopiedCellId] = useState<string | null>(null);
  const [runningAll, setRunningAll] = useState(false);

  const allTables: CatalogTable[] = metastores.flatMap((m) =>
    m.schemas.flatMap((s) => s.tables)
  );
  const activeSchemaTable =
    allTables.find((t) => t.id === selectedSchemaTableId) || allTables[0];

  const attachedSpark =
    sparkPools.find((s) => s.id === notebook.attachedSparkPoolId) ||
    sparkPools[0];
  const attachedWarehouse =
    warehouses.find((w) => w.id === notebook.attachedBqWarehouseId) ||
    warehouses[0];

  const runSingleCell = (cellId: string) => {
    const updatedCells = notebook.cells.map((c) =>
      c.id === cellId ? { ...c, status: "running" as const } : c
    );
    onUpdateNotebook({ ...notebook, cells: updatedCells });

    setTimeout(() => {
      const finishedCells = notebook.cells.map((c) =>
        c.id === cellId
          ? {
              ...c,
              status: "succeeded" as const,
              lastRunDuration:
                c.language === "sql" ? "0.72s" : "1.94s",
              lastRunTimestamp: "Just now • Oct 13, 2026",
              bytesScannedOrWorkers:
                c.language === "sql"
                  ? `34.1 MB scanned • ${attachedWarehouse.biEngineHitRatio}% BI Engine Hit`
                  : `${attachedSpark.currentDpus} Dataproc DPUs • Spark 3.5 AQE Enabled`,
            }
          : c
      );
      onUpdateNotebook({ ...notebook, cells: finishedCells });
    }, 650);
  };

  const handleRunAllCells = () => {
    setRunningAll(true);
    const runningCells = notebook.cells.map((c) => ({
      ...c,
      status: "running" as const,
    }));
    onUpdateNotebook({ ...notebook, cells: runningCells });

    setTimeout(() => {
      const doneCells = notebook.cells.map((c) => ({
        ...c,
        status: "succeeded" as const,
        lastRunTimestamp: "Just now • Oct 13, 2026",
      }));
      onUpdateNotebook({ ...notebook, cells: doneCells });
      setRunningAll(false);
    }, 900);
  };

  const handleUpdateCellCode = (cellId: string, newCode: string) => {
    onUpdateNotebook({
      ...notebook,
      cells: notebook.cells.map((c) =>
        c.id === cellId ? { ...c, code: newCode } : c
      ),
    });
  };

  const handleSwitchOutputTab = (cellId: string, tab: CellOutputTab) => {
    onUpdateNotebook({
      ...notebook,
      cells: notebook.cells.map((c) =>
        c.id === cellId ? { ...c, activeOutputTab: tab } : c
      ),
    });
  };

  const handleDeleteCell = (cellId: string) => {
    if (notebook.cells.length <= 1) return;
    onUpdateNotebook({
      ...notebook,
      cells: notebook.cells.filter((c) => c.id !== cellId),
    });
  };

  const handleAddCell = (language: CellLanguage) => {
    const newCell: NotebookCell = {
      id: `cell-${Date.now()}`,
      title:
        language === "sql"
          ? "Ad-Hoc BigQuery Studio SQL Exploration"
          : "Dataproc Serverless PySpark DataFrame Transformation",
      language,
      engineLabel:
        language === "sql"
          ? `BigQuery Studio • ${attachedWarehouse.name}`
          : `Dataproc Serverless • ${attachedSpark.name}`,
      code:
        language === "sql"
          ? `-- Query governed Dataplex / BigLake table\nSELECT\n  loyalty_tier,\n  COUNT(*) AS customer_count,\n  ROUND(AVG(lifetime_value_usd), 2) AS avg_ltv\nFROM \`lustrous-stone-417013.ecommerce_lakehouse.gold_customer_360\`\nGROUP BY loyalty_tier\nORDER BY avg_ltv DESC;`
          : `# PySpark transformation on Dataproc Serverless\ndf = spark.read.table("ecommerce_lakehouse.gold_customer_360")\ndisplay(df.groupBy("region_code").count())`,
      status: "succeeded",
      lastRunDuration: "0.58s",
      lastRunTimestamp: "Just now • Oct 13, 2026",
      bytesScannedOrWorkers:
        language === "sql"
          ? "14.2 MB scanned • BI Engine Accelerated"
          : `${attachedSpark.currentDpus} Dataproc DPUs`,
      activeOutputTab: "table",
      chartType: "bar",
      chartMetricLabel: "Customer Count",
      chartSecondaryLabel: "Avg LTV ($)",
      tableColumns: ["loyalty_tier", "customer_count", "avg_ltv"],
      tableRows: [
        { loyalty_tier: "DIAMOND", customer_count: 103950, avg_ltv: 4485.2 },
        { loyalty_tier: "PLATINUM", customer_count: 184200, avg_ltv: 2268.4 },
        { loyalty_tier: "GOLD", customer_count: 412800, avg_ltv: 980.4 },
      ],
      chartData: [
        { label: "DIAMOND", primary: 103950, secondary: 4485 },
        { label: "PLATINUM", primary: 184200, secondary: 2268 },
        { label: "GOLD", primary: 412800, secondary: 980 },
      ],
      profileStats: [
        {
          column: "loyalty_tier",
          type: "STRING",
          nullPct: 0.0,
          distinctCount: 3,
          min: "DIAMOND",
          max: "PLATINUM",
          distribution: [35, 62, 100, 0, 0],
        },
        {
          column: "avg_ltv",
          type: "FLOAT64",
          nullPct: 0.0,
          distinctCount: 3,
          min: "$980.40",
          max: "$4,485.20",
          distribution: [25, 55, 100, 0, 0],
        },
      ],
    };

    onUpdateNotebook({
      ...notebook,
      cells: [...notebook.cells, newCell],
    });
  };

  const handleGeminiGenerateCell = (customPrompt?: string) => {
    const promptToUse = (customPrompt ?? geminiPrompt).trim();
    if (!promptToUse) return;
    setGeminiGenerating(true);

    setTimeout(() => {
      const isPySpark =
        promptToUse.toLowerCase().includes("pyspark") ||
        promptToUse.toLowerCase().includes("spark");
      const generatedCell: NotebookCell = {
        id: `cell-gemini-${Date.now()}`,
        title: `Gemini Synthesized: ${promptToUse.slice(0, 56)}${
          promptToUse.length > 56 ? "..." : ""
        }`,
        language: isPySpark ? "pyspark" : "sql",
        engineLabel: isPySpark
          ? `Gemini 2.5 Pro • Dataproc Serverless (${attachedSpark.currentDpus} DPUs)`
          : `Gemini 2.5 Pro • BigQuery Studio (${attachedWarehouse.edition})`,
        code: isPySpark
          ? `# Synthesized by Gemini Code Assist (${promptToUse})\nfrom pyspark.sql import functions as F\n\ndf_c360 = spark.read.format("bigquery").load("lustrous-stone-417013.ecommerce_lakehouse.gold_customer_360")\ndf_tx = spark.read.format("bigquery").load("lustrous-stone-417013.fraud_detection_stream.realtime_card_transactions")\n\ndf_joined = (\n    df_c360.join(df_tx, on="customer_id", how="inner")\n    .groupBy("region_code", "loyalty_tier")\n    .agg(\n        F.countDistinct("transaction_id").alias("tx_volume"),\n        F.round(F.avg("lifetime_value_usd"), 2).alias("mean_ltv_usd"),\n        F.round(F.max("velocity_15m_count"), 0).alias("peak_velocity_15m")\n    )\n    .orderBy(F.col("tx_volume").desc())\n)\ndisplay(df_joined)`
          : `-- Synthesized by Gemini Code Assist: ${promptToUse}\nSELECT\n  c.region_code,\n  c.loyalty_tier,\n  COUNT(DISTINCT c.customer_id) AS high_value_accounts,\n  ROUND(AVG(c.lifetime_value_usd), 2) AS avg_ltv_usd,\n  ROUND(AVG(c.churn_probability_score) * 100, 2) AS churn_risk_pct\nFROM \`lustrous-stone-417013.ecommerce_lakehouse.gold_customer_360\`
  FOR SYSTEM_TIME AS OF TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 24 HOUR) AS c\nWHERE c.snapshot_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)\nGROUP BY 1, 2\nORDER BY avg_ltv_usd DESC;`,
        status: "succeeded",
        lastRunDuration: "0.91s",
        lastRunTimestamp: "Synthesized & verified • Oct 13, 2026",
        bytesScannedOrWorkers: isPySpark
          ? `${attachedSpark.currentDpus} DPUs • Adaptive Query Execution`
          : "22.6 MB scanned • 98% BI Engine Cache",
        activeOutputTab: "chart",
        chartType: "bar",
        chartMetricLabel: "Avg LTV ($ USD)",
        chartSecondaryLabel: "Churn Risk (%)",
        tableColumns: [
          "region_code",
          "loyalty_tier",
          "high_value_accounts",
          "avg_ltv_usd",
          "churn_risk_pct",
        ],
        tableRows: [
          {
            region_code: "US-EAST",
            loyalty_tier: "DIAMOND",
            high_value_accounts: 42810,
            avg_ltv_usd: 4820.5,
            churn_risk_pct: 4.2,
          },
          {
            region_code: "EU-CENTRAL",
            loyalty_tier: "DIAMOND",
            high_value_accounts: 36190,
            avg_ltv_usd: 4510.2,
            churn_risk_pct: 5.1,
          },
          {
            region_code: "APAC-SG",
            loyalty_tier: "DIAMOND",
            high_value_accounts: 24950,
            avg_ltv_usd: 4125.0,
            churn_risk_pct: 6.4,
          },
        ],
        chartData: [
          { label: "US-EAST • Diamond", primary: 4821, secondary: 4.2 },
          { label: "EU-CENTRAL • Diamond", primary: 4510, secondary: 5.1 },
          { label: "APAC-SG • Diamond", primary: 4125, secondary: 6.4 },
        ],
        profileStats: [
          {
            column: "avg_ltv_usd",
            type: "FLOAT64",
            nullPct: 0.0,
            distinctCount: 3,
            min: "$4,125.00",
            max: "$4,820.50",
            distribution: [75, 90, 100, 0, 0],
          },
        ],
      };

      onUpdateNotebook({
        ...notebook,
        cells: [generatedCell, ...notebook.cells],
      });
      setGeminiPrompt("");
      setGeminiGenerating(false);
    }, 600);
  };

  return (
    <div className="flex h-full overflow-hidden bg-slate-50 dark:bg-[#0B0F19]">
      {/* Main Notebook Editor Column */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Notebook Action Bar + Floating Compute Switcher */}
        <div className="px-4 py-2.5 border-b border-slate-200 dark:border-white/10 bg-white dark:bg-[#111827] flex flex-wrap items-center justify-between gap-3 relative z-30">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#1A73E8]/15 text-[#4285F4] border border-[#4285F4]/30">
              Vertex AI Workbench + BigQuery Studio
            </span>
            <span className="text-xs text-slate-400 dark:text-zinc-500 hidden md:inline">
              •
            </span>
            <span className="text-xs text-slate-500 dark:text-zinc-400 hidden md:inline truncate">
              Modified {notebook.lastModified} by{" "}
              <span className="font-mono text-slate-700 dark:text-zinc-300">
                {notebook.author}
              </span>
            </span>
          </div>

          {/* Right Toolbar: Run All, Add Cells, Floating Compute Switcher, Schema Drawer Toggle */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleRunAllCells}
              disabled={runningAll}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white text-xs font-medium transition-all duration-150 shadow-sm"
            >
              {runningAll ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-current" />
              )}
              <span>{runningAll ? "Executing..." : "Run All Cells"}</span>
            </button>

            <button
              type="button"
              onClick={() => handleAddCell("sql")}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-slate-100 dark:bg-[#0B0F19] hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-xs text-slate-700 dark:text-zinc-200 transition-all duration-150"
            >
              <Plus className="w-3.5 h-3.5 text-[#4285F4]" />
              <span className="font-mono">%sql</span>
            </button>

            <button
              type="button"
              onClick={() => handleAddCell("pyspark")}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-slate-100 dark:bg-[#0B0F19] hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-xs text-slate-700 dark:text-zinc-200 transition-all duration-150"
            >
              <Plus className="w-3.5 h-3.5 text-[#00C49F]" />
              <span className="font-mono">%pyspark</span>
            </button>

            {/* Floating Compute Switcher Dropdown */}
            <div className="relative z-30">
              <button
                type="button"
                onClick={() => setComputeDropdownOpen(!computeDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-100 dark:bg-[#0B0F19] hover:bg-slate-200/80 dark:hover:bg-white/10 border border-slate-200 dark:border-white/15 text-xs text-slate-800 dark:text-zinc-200 transition-all duration-150"
              >
                <span className="w-2 h-2 rounded-full bg-[#00C49F] animate-pulse" />
                <span className="font-mono text-[11px]">
                  {attachedSpark.name} ({attachedSpark.currentDpus} DPUs) +{" "}
                  {attachedWarehouse.edition}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {computeDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-80 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/15 shadow-2xl p-3 z-50 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-2">
                    <span className="text-xs font-semibold text-slate-800 dark:text-zinc-100">
                      Attach Serverless Compute Runtime
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setComputeDropdownOpen(false);
                        onOpenComputeModal();
                      }}
                      className="text-[11px] font-mono text-[#4285F4] hover:underline"
                    >
                      Configure Pools →
                    </button>
                  </div>

                  {/* Spark Pool Selection */}
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-zinc-400 mb-1.5 flex items-center gap-1.5">
                      <Cpu className="w-3 h-3 text-[#00C49F]" />
                      <span>Dataproc Serverless Spark Session (%pyspark)</span>
                    </div>
                    <div className="space-y-1">
                      {sparkPools.map((pool) => {
                        const selected =
                          pool.id === notebook.attachedSparkPoolId;
                        return (
                          <button
                            key={pool.id}
                            type="button"
                            onClick={() => {
                              onUpdateNotebook({
                                ...notebook,
                                attachedSparkPoolId: pool.id,
                              });
                              setComputeDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-xs transition-colors ${
                              selected
                                ? "bg-[#00C49F]/15 text-[#00C49F] border border-[#00C49F]/30 font-medium"
                                : "hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-zinc-300"
                            }`}
                          >
                            <div>
                              <div className="font-mono text-[11px]">
                                {pool.name}
                              </div>
                              <div className="text-[10px] text-slate-400 dark:text-zinc-500">
                                {pool.currentDpus}/{pool.maxDpus} DPUs • $
                                {pool.costPerHour.toFixed(2)}/hr
                              </div>
                            </div>
                            {selected && <Check className="w-3.5 h-3.5" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* SQL Warehouse Selection */}
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-zinc-400 mb-1.5 flex items-center gap-1.5">
                      <Database className="w-3 h-3 text-[#4285F4]" />
                      <span>BigQuery Edition Reservation (%sql)</span>
                    </div>
                    <div className="space-y-1">
                      {warehouses.map((wh) => {
                        const selected =
                          wh.id === notebook.attachedBqWarehouseId;
                        return (
                          <button
                            key={wh.id}
                            type="button"
                            onClick={() => {
                              onUpdateNotebook({
                                ...notebook,
                                attachedBqWarehouseId: wh.id,
                              });
                              setComputeDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-xs transition-colors ${
                              selected
                                ? "bg-[#1A73E8]/15 text-[#4285F4] border border-[#4285F4]/30 font-medium"
                                : "hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-zinc-300"
                            }`}
                          >
                            <div>
                              <div className="font-mono text-[11px]">
                                {wh.name} ({wh.edition})
                              </div>
                              <div className="text-[10px] text-slate-400 dark:text-zinc-500">
                                {wh.maxAutoscaleSlots} Max Slots •{" "}
                                {wh.biEngineCacheGb}GB BI Engine
                              </div>
                            </div>
                            {selected && <Check className="w-3.5 h-3.5" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Schema Explorer Drawer Toggle */}
            <button
              type="button"
              onClick={() => setSchemaDrawerOpen(!schemaDrawerOpen)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-xs transition-all duration-150 ${
                schemaDrawerOpen
                  ? "bg-[#1A73E8]/15 text-[#4285F4] border-[#4285F4]/30"
                  : "bg-slate-100 dark:bg-[#0B0F19] text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-white/10"
              }`}
              title="Toggle Schema Explorer Drawer"
            >
              {schemaDrawerOpen ? (
                <PanelRightClose className="w-3.5 h-3.5" />
              ) : (
                <PanelRightOpen className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">Schema Explorer</span>
            </button>
          </div>
        </div>

        {/* Inline Gemini Code-Assist Bar */}
        <div className="px-4 py-2.5 border-b border-slate-200 dark:border-white/10 bg-gradient-to-r from-[#1A73E8]/10 via-[#4285F4]/5 to-[#00C49F]/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 flex-1">
            <div className="p-1.5 rounded-md bg-[#1A73E8]/20 text-[#4285F4] shrink-0">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <input
              type="text"
              value={geminiPrompt}
              onChange={(e) => setGeminiPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleGeminiGenerateCell();
              }}
              placeholder="Ask Gemini 2.5 Code Assist: e.g. 'Time-travel query on gold_customer_360 for Diamond churn spikes' or 'PySpark join velocity'..."
              className="w-full bg-white/90 dark:bg-[#0B0F19]/90 border border-slate-200 dark:border-white/15 rounded-md px-3 py-1.5 text-xs text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-[#4285F4]"
            />
            <button
              type="button"
              onClick={() => handleGeminiGenerateCell()}
              disabled={geminiGenerating || !geminiPrompt.trim()}
              className="px-3 py-1.5 rounded-md bg-[#1A73E8] hover:bg-[#1967D2] disabled:opacity-50 text-white text-xs font-medium flex items-center gap-1.5 shrink-0 transition-all duration-150"
            >
              {geminiGenerating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Wand2 className="w-3.5 h-3.5" />
              )}
              <span>Generate Cell</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] shrink-0">
            <button
              type="button"
              onClick={() =>
                handleGeminiGenerateCell(
                  "BigLake Iceberg 24h time-travel cohort LTV comparison"
                )
              }
              className="px-2 py-1 rounded bg-white/70 dark:bg-[#111827] hover:bg-white dark:hover:bg-[#182236] border border-slate-200 dark:border-white/10 text-slate-600 dark:text-zinc-300 font-mono text-[10px] transition-colors"
            >
              + Iceberg Time-Travel SQL
            </button>
            <button
              type="button"
              onClick={() =>
                handleGeminiGenerateCell(
                  "PySpark distributed join of gold_customer_360 with fraud velocity"
                )
              }
              className="px-2 py-1 rounded bg-white/70 dark:bg-[#111827] hover:bg-white dark:hover:bg-[#182236] border border-slate-200 dark:border-white/10 text-slate-600 dark:text-zinc-300 font-mono text-[10px] transition-colors"
            >
              + PySpark Velocity Join
            </button>
          </div>
        </div>

        {/* Scrollable Polyglot Cells Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {notebook.cells.map((cell, index) => (
            <div
              key={cell.id}
              className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111827] shadow-sm overflow-hidden transition-all duration-150"
            >
              {/* Cell Header */}
              <div className="px-3.5 py-2 border-b border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-[#0B0F19]/60 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-[11px] font-mono text-slate-400 dark:text-zinc-500">
                    Cmd [{index + 1}]
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase ${
                      cell.language === "sql"
                        ? "bg-[#1A73E8]/15 text-[#4285F4] border border-[#4285F4]/30"
                        : "bg-[#00C49F]/15 text-[#00C49F] border border-[#00C49F]/30"
                    }`}
                  >
                    %{cell.language}
                  </span>
                  <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                    {cell.title}
                  </span>
                  <span className="hidden lg:inline text-[11px] font-mono text-slate-400 dark:text-zinc-500">
                    ({cell.engineLabel})
                  </span>
                </div>

                {/* Cell Action Controls */}
                <div className="flex items-center gap-2">
                  {cell.status === "running" ? (
                    <span className="flex items-center gap-1.5 text-[11px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Executing on GCP...
                    </span>
                  ) : (
                    <span className="text-[11px] font-mono text-emerald-600 dark:text-[#00C49F] bg-emerald-500/10 px-2 py-0.5 rounded">
                      ✓ {cell.lastRunDuration} • {cell.bytesScannedOrWorkers}
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => runSingleCell(cell.id)}
                    disabled={cell.status === "running"}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#1A73E8] hover:bg-[#1967D2] disabled:opacity-50 text-white text-[11px] font-medium transition-colors"
                    title="Execute Cell (Shift+Enter)"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Run</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(cell.code);
                      setCopiedCellId(cell.id);
                      setTimeout(() => setCopiedCellId(null), 1500);
                    }}
                    className="p-1 rounded hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-zinc-400"
                    title="Copy Code"
                  >
                    {copiedCellId === cell.id ? (
                      <Check className="w-3.5 h-3.5 text-[#00C49F]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteCell(cell.id)}
                    className="p-1 rounded hover:bg-rose-500/15 text-slate-400 hover:text-rose-400 transition-colors"
                    title="Delete Cell"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Code Editor Textarea */}
              <div className="p-3 bg-slate-900 dark:bg-[#080B12] border-b border-slate-200 dark:border-white/10">
                <textarea
                  value={cell.code}
                  onChange={(e) => handleUpdateCellCode(cell.id, e.target.value)}
                  rows={Math.min(16, Math.max(4, cell.code.split("\n").length))}
                  spellCheck={false}
                  className="w-full font-mono text-xs leading-relaxed bg-transparent text-zinc-100 focus:outline-none resize-y"
                />

                {/* Inline Gemini Code Suggestion Banner */}
                {cell.geminiSuggestion && (
                  <div className="mt-2 pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                    <div className="flex items-center gap-2 text-zinc-300">
                      <Sparkles className="w-3.5 h-3.5 text-[#4285F4] shrink-0" />
                      <span>
                        <strong className="text-[#4285F4]">
                          Gemini Inline Assist:
                        </strong>{" "}
                        {cell.geminiSuggestion}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        handleUpdateCellCode(
                          cell.id,
                          `${cell.code}\n-- [Gemini Optimization Applied]: ${cell.geminiSuggestion}`
                        )
                      }
                      className="px-2 py-0.5 rounded bg-[#1A73E8]/25 hover:bg-[#1A73E8]/40 text-[#4285F4] font-mono text-[10px] shrink-0 transition-colors"
                    >
                      Accept Suggestion (Tab)
                    </button>
                  </div>
                )}
              </div>

              {/* Cell Output Toolbar: Table | Auto-Chart | Schema Profile | Export to Looker Studio */}
              <div className="px-3.5 py-2 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#111827] flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleSwitchOutputTab(cell.id, "table")}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                      cell.activeOutputTab === "table"
                        ? "bg-[#1A73E8] text-white"
                        : "text-slate-600 dark:text-zinc-400 hover:bg-slate-200/70 dark:hover:bg-white/5"
                    }`}
                  >
                    <Table2 className="w-3.5 h-3.5" />
                    <span>Table ({cell.tableRows?.length ?? 0} rows)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSwitchOutputTab(cell.id, "chart")}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                      cell.activeOutputTab === "chart"
                        ? "bg-[#1A73E8] text-white"
                        : "text-slate-600 dark:text-zinc-400 hover:bg-slate-200/70 dark:hover:bg-white/5"
                    }`}
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>Auto-Visualization</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSwitchOutputTab(cell.id, "profile")}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                      cell.activeOutputTab === "profile"
                        ? "bg-[#1A73E8] text-white"
                        : "text-slate-600 dark:text-zinc-400 hover:bg-slate-200/70 dark:hover:bg-white/5"
                    }`}
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Schema Profile</span>
                  </button>
                </div>

                {/* Direct Export to Looker Studio */}
                <button
                  type="button"
                  onClick={() => setLookerModalCell(cell)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#00C49F]/15 hover:bg-[#00C49F]/25 text-[#00C49F] border border-[#00C49F]/30 text-xs font-medium transition-all duration-150"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Explore in Looker Studio</span>
                </button>
              </div>

              {/* Cell Output Content */}
              <div className="p-3.5 bg-white dark:bg-[#0E1422]">
                {cell.activeOutputTab === "table" &&
                  cell.tableColumns &&
                  cell.tableRows && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-slate-200 dark:border-white/10 text-[11px] font-mono uppercase text-slate-500 dark:text-zinc-400 bg-slate-50 dark:bg-[#111827]">
                            <th className="py-2 px-3 w-10">#</th>
                            {cell.tableColumns.map((col) => (
                              <th key={col} className="py-2 px-3">
                                {col}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200/60 dark:divide-white/5 font-mono text-[11px]">
                          {cell.tableRows.map((row, rIdx) => (
                            <tr
                              key={rIdx}
                              className="hover:bg-slate-100/70 dark:hover:bg-white/[0.03] transition-colors"
                            >
                              <td className="py-2 px-3 text-slate-400 dark:text-zinc-500">
                                {rIdx + 1}
                              </td>
                              {cell.tableColumns!.map((col) => {
                                const val = row[col];
                                const isNum = typeof val === "number";
                                return (
                                  <td
                                    key={col}
                                    className={`py-2 px-3 ${
                                      isNum
                                        ? "text-[#00C49F] font-medium"
                                        : "text-slate-800 dark:text-zinc-200"
                                    }`}
                                  >
                                    {isNum ? val.toLocaleString() : String(val)}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                {cell.activeOutputTab === "chart" && cell.chartData && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-slate-800 dark:text-zinc-200">
                          {cell.chartMetricLabel} vs. {cell.chartSecondaryLabel}
                        </span>
                        <span className="text-[11px] font-mono text-slate-500 dark:text-zinc-400">
                          Rendered via BigQuery Studio Auto-Chart
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] font-mono">
                        <span className="flex items-center gap-1.5 text-[#4285F4]">
                          <span className="w-2.5 h-2.5 rounded-sm bg-[#4285F4]" />
                          {cell.chartMetricLabel}
                        </span>
                        <span className="flex items-center gap-1.5 text-[#00C49F]">
                          <span className="w-2.5 h-2.5 rounded-sm bg-[#00C49F]" />
                          {cell.chartSecondaryLabel}
                        </span>
                      </div>
                    </div>

                    {/* Interactive Bar + Metric Comparison Chart */}
                    <div className="grid grid-cols-1 gap-2.5 pt-1">
                      {(() => {
                        const maxPrimary = Math.max(
                          ...cell.chartData.map((d) => d.primary),
                          1
                        );
                        return cell.chartData.map((pt) => {
                          const widthPct = Math.max(
                            8,
                            Math.round((pt.primary / maxPrimary) * 100)
                          );
                          return (
                            <div
                              key={pt.label}
                              className="flex items-center gap-3 text-xs group"
                            >
                              <div className="w-40 font-mono text-[11px] text-slate-700 dark:text-zinc-300 truncate">
                                {pt.label}
                              </div>
                              <div className="flex-1 h-7 bg-slate-100 dark:bg-[#111827] rounded-md overflow-hidden relative flex items-center border border-slate-200/70 dark:border-white/5">
                                <div
                                  style={{ width: `${widthPct}%` }}
                                  className="h-full bg-gradient-to-r from-[#1A73E8] to-[#00C49F] opacity-85 group-hover:opacity-100 transition-all duration-300 rounded-r"
                                />
                                <span className="ml-2.5 font-mono text-[11px] text-slate-800 dark:text-zinc-100 relative z-10">
                                  {pt.primary.toLocaleString()}
                                </span>
                              </div>
                              {pt.secondary !== undefined && (
                                <div className="w-28 text-right font-mono text-[11px] text-[#00C49F]">
                                  {pt.secondary.toLocaleString()}
                                </div>
                              )}
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                )}

                {cell.activeOutputTab === "profile" && cell.profileStats && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {cell.profileStats.map((stat) => (
                      <div
                        key={stat.column}
                        className="p-3 rounded-lg bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-white/10 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-semibold text-slate-800 dark:text-zinc-100">
                            {stat.column}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#1A73E8]/15 text-[#4285F4]">
                            {stat.type}
                          </span>
                        </div>
                        <div className="flex items-end gap-1 h-10 pt-2">
                          {stat.distribution.map((bucket, bIdx) => (
                            <div
                              key={bIdx}
                              style={{ height: `${Math.max(12, bucket)}%` }}
                              className="flex-1 rounded-t bg-gradient-to-t from-[#1A73E8] to-[#00C49F]"
                            />
                          ))}
                        </div>
                        <div className="grid grid-cols-2 gap-1 text-[10px] font-mono text-slate-500 dark:text-zinc-400 pt-1 border-t border-slate-200 dark:border-white/10">
                          <div>Nulls: {stat.nullPct}%</div>
                          <div>Distinct: {stat.distinctCount}</div>
                          <div>Min: {stat.min}</div>
                          <div>Max: {stat.max}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right-Side Collapsible Schema Explorer Drawer */}
      {schemaDrawerOpen && activeSchemaTable && (
        <aside className="w-80 border-l border-slate-200 dark:border-white/10 bg-white dark:bg-[#111827] flex flex-col h-full shrink-0 select-none">
          <div className="p-3 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-800 dark:text-zinc-100 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-[#00C49F]" />
                <span>Live Schema Explorer</span>
              </div>
              <div className="text-[10px] font-mono text-slate-400 dark:text-zinc-400">
                Dataplex Metadata + Sample Values
              </div>
            </div>
            <button
              type="button"
              onClick={() => onInspectCatalogTable(activeSchemaTable)}
              className="text-[10px] font-mono text-[#4285F4] hover:underline"
            >
              Open in Catalog →
            </button>
          </div>

          {/* Table Selector Dropdown */}
          <div className="p-2.5 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0B0F19]/60 space-y-2">
            <label className="block text-[10px] font-mono uppercase text-slate-400 dark:text-zinc-400">
              Active Table Context
            </label>
            <select
              value={activeSchemaTable.id}
              onChange={(e) => setSelectedSchemaTableId(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-md bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/15 text-xs font-mono text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-[#4285F4]"
            >
              {allTables.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.schemaName}.{t.name} ({t.tier})
                </option>
              ))}
            </select>

            <div className="grid grid-cols-3 gap-1.5 text-[10px] font-mono">
              <div className="p-1.5 rounded bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/5">
                <div className="text-slate-400 dark:text-zinc-500">Rows</div>
                <div className="text-slate-800 dark:text-zinc-200 font-semibold">
                  {activeSchemaTable.rowCount}
                </div>
              </div>
              <div className="p-1.5 rounded bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/5">
                <div className="text-slate-400 dark:text-zinc-500">Size</div>
                <div className="text-slate-800 dark:text-zinc-200 font-semibold">
                  {activeSchemaTable.sizeBytes}
                </div>
              </div>
              <div className="p-1.5 rounded bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/5">
                <div className="text-slate-400 dark:text-zinc-500">Format</div>
                <div className="text-[#00C49F] font-semibold truncate">
                  {activeSchemaTable.format.split(" ")[0]}
                </div>
              </div>
            </div>
          </div>

          {/* Columns List with One-Click Insert & Sample Values */}
          <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
            {activeSchemaTable.columns.map((col) => (
              <div
                key={col.name}
                className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#0B0F19]/80 border border-slate-200 dark:border-white/10 hover:border-[#4285F4]/40 transition-all duration-150 space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-semibold text-slate-800 dark:text-zinc-100">
                    {col.name}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#1A73E8]/15 text-[#4285F4]">
                      {col.type}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const firstCell = notebook.cells[0];
                        if (firstCell) {
                          handleUpdateCellCode(
                            firstCell.id,
                            `${firstCell.code}\n-- Referenced column: ${activeSchemaTable.schemaName}.${activeSchemaTable.name}.${col.name}`
                          );
                        }
                      }}
                      className="p-1 rounded hover:bg-[#4285F4]/20 text-slate-400 hover:text-[#4285F4]"
                      title="Insert column into top cell"
                    >
                      <Code2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-snug">
                  {col.description}
                </p>

                {col.policyTag && (
                  <div className="flex items-center gap-1 text-[10px] font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                    <ShieldAlert className="w-3 h-3 shrink-0" />
                    <span className="truncate">{col.policyTag}</span>
                  </div>
                )}

                <div className="text-[10px] font-mono text-slate-400 dark:text-zinc-500 truncate">
                  Sample:{" "}
                  <span className="text-slate-600 dark:text-zinc-300">
                    {col.sampleValues.join(", ")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </aside>
      )}

      {/* Looker Studio Direct Export Modal */}
      {lookerModalCell && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/15 shadow-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-[#00C49F]/15 text-[#00C49F]">
                  <ExternalLink className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                    Direct Export to Looker Studio Pro
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    BI Engine Sub-Second Accelerated Connection
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setLookerModalCell(null)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-white/10 space-y-1.5">
                <div className="text-[11px] font-semibold text-slate-700 dark:text-zinc-300">
                  Source Cell Query
                </div>
                <div className="font-mono text-[11px] text-[#4285F4]">
                  {lookerModalCell.title}
                </div>
                <div className="text-[11px] font-mono text-slate-500 dark:text-zinc-400">
                  Reservation: {attachedWarehouse.name} ({attachedWarehouse.edition}) •{" "}
                  {attachedWarehouse.biEngineCacheGb} GB BI Engine Cache
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-slate-400 dark:text-zinc-400 mb-1">
                  Generated Looker Studio Deep-Link URI
                </label>
                <div className="p-2.5 rounded-lg bg-slate-900 text-[#00C49F] font-mono text-[11px] break-all border border-white/10">
                  {`https://lookerstudio.google.com/c/u/0/reporting/create?c.mode=edit&ds.connector=bigQuery&ds.projectId=lustrous-stone-417013&ds.type=CUSTOM_QUERY&ds.cellId=${lookerModalCell.id}`}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setLookerModalCell(null)}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-zinc-200 font-medium"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => setLookerModalCell(null)}
                  className="px-4 py-1.5 rounded-lg bg-[#1A73E8] hover:bg-[#1967D2] text-white font-medium flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Materialize View & Launch Looker</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
