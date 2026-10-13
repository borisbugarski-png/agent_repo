"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  Database,
  Eye,
  EyeOff,
  FileCode2,
  GitFork,
  Layers,
  Lock,
  Maximize2,
  RotateCcw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Table2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import {
  CatalogMetastore,
  CatalogTable,
  LineageEdge,
  LineageNode,
} from "@/types/lakehouse";

interface CatalogLineageViewProps {
  metastores: CatalogMetastore[];
  selectedTable: CatalogTable;
  onSelectTable: (tbl: CatalogTable) => void;
  lineageNodes: LineageNode[];
  lineageEdges: LineageEdge[];
  onQueryTableInNotebook: (tbl: CatalogTable) => void;
}

export function CatalogLineageView({
  metastores,
  selectedTable,
  onSelectTable,
  lineageNodes,
  lineageEdges,
  onQueryTableInNotebook,
}: CatalogLineageViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<
    "lineage" | "schema" | "quality" | "governance"
  >("lineage");
  const [catalogSearch, setCatalogSearch] = useState("");
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOrigin, setDragOrigin] = useState({ x: 0, y: 0 });
  const [selectedNodeId, setSelectedNodeId] = useState<string>("ln-gold-c360");
  const [simulateAdminUnmask, setSimulateAdminUnmask] = useState(false);

  const allTables = metastores.flatMap((m) =>
    m.schemas.flatMap((s) => s.tables)
  );
  const filteredTables = allTables.filter((t) => {
    const q = catalogSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      t.name.toLowerCase().includes(q) ||
      t.schemaName.toLowerCase().includes(q) ||
      t.format.toLowerCase().includes(q) ||
      t.dataplexZone.toLowerCase().includes(q)
    );
  });

  const inspectedNode =
    lineageNodes.find((n) => n.id === selectedNodeId) || lineageNodes[4];

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("[data-node-card]")) return;
    setIsDragging(true);
    setDragOrigin({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setPan({ x: e.clientX - dragOrigin.x, y: e.clientY - dragOrigin.y });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-slate-50 dark:bg-[#0B0F19]">
      {/* Top Catalog Header & Unified Search */}
      <div className="px-5 py-3 border-b border-slate-200 dark:border-white/10 bg-white dark:bg-[#111827] flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#00C49F]/15 text-[#00C49F] border border-[#00C49F]/30">
              Dataplex Universal Catalog + BigLake Metastore
            </span>
            <span className="text-xs font-mono text-slate-400 dark:text-zinc-500">
              {selectedTable.projectId}
            </span>
            <span className="text-slate-300 dark:text-zinc-600">/</span>
            <span className="text-xs font-mono text-[#4285F4]">
              {selectedTable.schemaName}
            </span>
            <span className="text-slate-300 dark:text-zinc-600">/</span>
            <span className="text-sm font-mono font-bold text-slate-900 dark:text-zinc-100">
              {selectedTable.name}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/15 text-amber-400 border border-amber-500/30">
              {selectedTable.format}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-3xl">
            {selectedTable.description}
          </p>
        </div>

        {/* Right Actions: Unified Asset Switcher & Open in Notebook */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={catalogSearch}
              onChange={(e) => setCatalogSearch(e.target.value)}
              placeholder="Unified search (BigQuery, Iceberg, GCS, Feature Store)..."
              className="w-64 pl-8 pr-3 py-1.5 rounded-lg bg-slate-100 dark:bg-[#0B0F19] border border-slate-200 dark:border-white/10 text-xs text-slate-800 dark:text-zinc-200 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-[#4285F4]"
            />
          </div>

          <select
            value={selectedTable.id}
            onChange={(e) => {
              const found = allTables.find((t) => t.id === e.target.value);
              if (found) onSelectTable(found);
            }}
            className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-[#0B0F19] border border-slate-200 dark:border-white/10 text-xs font-mono text-slate-800 dark:text-zinc-200"
          >
            {filteredTables.map((t) => (
              <option key={t.id} value={t.id}>
                {t.schemaName}.{t.name} [{t.tier}]
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => onQueryTableInNotebook(selectedTable)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1A73E8] hover:bg-[#1967D2] text-white text-xs font-medium transition-all duration-150 shadow-sm"
          >
            <FileCode2 className="w-3.5 h-3.5" />
            <span>Query in Notebook</span>
          </button>
        </div>
      </div>

      {/* Metadata KPI Strip */}
      <div className="px-5 py-2.5 border-b border-slate-200 dark:border-white/10 bg-slate-100/60 dark:bg-[#0E1422] grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
        <div className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/5">
          <div className="text-[10px] font-mono uppercase text-slate-400 dark:text-zinc-500">
            Row Count / Volume
          </div>
          <div className="font-mono font-semibold text-slate-800 dark:text-zinc-100">
            {selectedTable.rowCount} ({selectedTable.sizeBytes})
          </div>
        </div>
        <div className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/5">
          <div className="text-[10px] font-mono uppercase text-slate-400 dark:text-zinc-500">
            Partitioning
          </div>
          <div className="font-mono font-semibold text-[#4285F4]">
            {selectedTable.partitionBy}
          </div>
        </div>
        <div className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/5">
          <div className="text-[10px] font-mono uppercase text-slate-400 dark:text-zinc-500">
            Clustering / Sort Keys
          </div>
          <div className="font-mono font-semibold text-slate-800 dark:text-zinc-100 truncate">
            {selectedTable.clusteredBy.join(", ")}
          </div>
        </div>
        <div className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/5">
          <div className="text-[10px] font-mono uppercase text-slate-400 dark:text-zinc-500">
            Dataplex Zone
          </div>
          <div className="font-mono font-semibold text-[#00C49F]">
            {selectedTable.dataplexZone}
          </div>
        </div>
        <div className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/5">
          <div className="text-[10px] font-mono uppercase text-slate-400 dark:text-zinc-500">
            AutoDQ Score
          </div>
          <div className="font-mono font-semibold text-emerald-500">
            99.98% Passed ({selectedTable.qualityRules.length} rules)
          </div>
        </div>
        <div className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/5">
          <div className="text-[10px] font-mono uppercase text-slate-400 dark:text-zinc-500">
            Last Refreshed
          </div>
          <div className="font-mono font-semibold text-slate-800 dark:text-zinc-100">
            {selectedTable.lastUpdated}
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="px-5 py-2 border-b border-slate-200 dark:border-white/10 bg-white dark:bg-[#111827] flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveSubTab("lineage")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeSubTab === "lineage"
                ? "bg-[#1A73E8] text-white"
                : "text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-white/5"
            }`}
          >
            <GitFork className="w-3.5 h-3.5" />
            <span>Interactive Data Lineage Graph (DAG)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab("schema")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeSubTab === "schema"
                ? "bg-[#1A73E8] text-white"
                : "text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-white/5"
            }`}
          >
            <Table2 className="w-3.5 h-3.5" />
            <span>Schema & Column Masking ({selectedTable.columns.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab("quality")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeSubTab === "quality"
                ? "bg-[#1A73E8] text-white"
                : "text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-white/5"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Dataplex AutoDQ Rules ({selectedTable.qualityRules.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab("governance")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeSubTab === "governance"
                ? "bg-[#1A73E8] text-white"
                : "text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-white/5"
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>IAM & Policy Tag Governance</span>
          </button>
        </div>

        {/* Role-Based PII Unmask Toggle */}
        <button
          type="button"
          onClick={() => setSimulateAdminUnmask(!simulateAdminUnmask)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono border transition-colors ${
            simulateAdminUnmask
              ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
              : "bg-slate-100 dark:bg-[#0B0F19] text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-white/10"
          }`}
        >
          {simulateAdminUnmask ? (
            <Eye className="w-3.5 h-3.5" />
          ) : (
            <EyeOff className="w-3.5 h-3.5" />
          )}
          <span>
            {simulateAdminUnmask
              ? "Role: DATA_STEWARD_ADMIN (PII Unmasked)"
              : "Role: ANALYST (PII Policy Tags Enforced)"}
          </span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden flex">
        {activeSubTab === "lineage" && (
          <div className="flex-1 flex h-full overflow-hidden">
            {/* Interactive Zoomable & Pannable Lineage Graph Canvas */}
            <div
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="flex-1 relative overflow-hidden cursor-grab active:cursor-grabbing bg-[#080C15] select-none"
              style={{
                backgroundImage:
                  "radial-gradient(rgba(66, 133, 244, 0.16) 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            >
              {/* Floating Canvas Zoom & Pan Controls */}
              <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 bg-[#111827]/90 backdrop-blur-md border border-white/15 rounded-lg p-1.5 text-xs text-zinc-200">
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.min(1.4, +(z + 0.1).toFixed(2)))}
                  className="p-1.5 rounded hover:bg-white/10"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <span className="font-mono text-[11px] px-1.5">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.max(0.65, +(z - 0.1).toFixed(2)))}
                  className="p-1.5 rounded hover:bg-white/10"
                  title="Zoom Out"
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
                  title="Reset View"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Legend Overlay */}
              <div className="absolute bottom-3 left-3 z-20 flex flex-wrap items-center gap-3 px-3 py-1.5 rounded-lg bg-[#111827]/90 border border-white/10 text-[11px] font-mono text-zinc-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#00C49F]" />
                  Streaming Lineage (Dataflow / Vertex Sync)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#4285F4]" />
                  Batch / SQL Merge (BigQuery + Dataproc)
                </span>
                <span className="text-zinc-500">
                  Drag canvas to pan • Click any node to inspect
                </span>
              </div>

              {/* Transformed Stage */}
              <div
                style={{
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                  transformOrigin: "0 0",
                }}
                className="w-[1240px] h-[420px] relative"
              >
                {/* SVG Edges Layer */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <defs>
                    <marker
                      id="arrow-cyan"
                      viewBox="0 0 10 10"
                      refX="6"
                      refY="5"
                      markerWidth="6"
                      markerHeight="6"
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 1 L 10 5 L 0 9 z" fill="#00C49F" />
                    </marker>
                    <marker
                      id="arrow-blue"
                      viewBox="0 0 10 10"
                      refX="6"
                      refY="5"
                      markerWidth="6"
                      markerHeight="6"
                      orient="auto-start-reverse"
                    >
                      <path d="M 0 1 L 10 5 L 0 9 z" fill="#4285F4" />
                    </marker>
                  </defs>

                  {lineageEdges.map((edge) => {
                    const fromNode = lineageNodes.find((n) => n.id === edge.from);
                    const toNode = lineageNodes.find((n) => n.id === edge.to);
                    if (!fromNode || !toNode) return null;

                    const x1 = fromNode.x + 225;
                    const y1 = fromNode.y + 46;
                    const x2 = toNode.x;
                    const y2 = toNode.y + 46;
                    const midX = (x1 + x2) / 2;
                    const d = `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`;

                    return (
                      <g key={edge.id}>
                        <path
                          d={d}
                          fill="none"
                          stroke={edge.activeStream ? "#00C49F" : "#4285F4"}
                          strokeWidth="2.2"
                          strokeDasharray={edge.activeStream ? "6 4" : undefined}
                          markerEnd={
                            edge.activeStream
                              ? "url(#arrow-cyan)"
                              : "url(#arrow-blue)"
                          }
                          opacity="0.85"
                        />
                        <rect
                          x={midX - 68}
                          y={(y1 + y2) / 2 - 11}
                          width="136"
                          height="20"
                          rx="5"
                          fill="#0B0F19"
                          stroke="rgba(255,255,255,0.12)"
                        />
                        <text
                          x={midX}
                          y={(y1 + y2) / 2 + 3}
                          textAnchor="middle"
                          fill={edge.activeStream ? "#00C49F" : "#93C5FD"}
                          fontSize="9.5"
                          fontFamily="monospace"
                        >
                          {edge.engine}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {/* Node Cards Layer */}
                {lineageNodes.map((node) => {
                  const isSelected = node.id === selectedNodeId;
                  return (
                    <div
                      key={node.id}
                      data-node-card="true"
                      onClick={() => {
                        setSelectedNodeId(node.id);
                        if (node.tableId) {
                          const tbl = allTables.find(
                            (t) => t.id === node.tableId
                          );
                          if (tbl) onSelectTable(tbl);
                        }
                      }}
                      style={{ left: node.x, top: node.y }}
                      className={`absolute w-[225px] rounded-xl p-3 cursor-pointer transition-all duration-150 ${
                        isSelected
                          ? "bg-[#162238] border-2 border-[#00C49F] shadow-lg shadow-[#00C49F]/20 scale-[1.02]"
                          : "bg-[#111827]/95 border border-white/15 hover:border-[#4285F4]"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#1A73E8]/20 text-[#4285F4]">
                          {node.gcpService}
                        </span>
                        <span className="text-[10px] font-mono text-[#00C49F]">
                          DQ {node.qualityScore}%
                        </span>
                      </div>
                      <div className="font-mono text-xs font-bold text-zinc-100 truncate">
                        {node.label}
                      </div>
                      <div className="text-[10px] font-mono text-zinc-400 truncate mb-2">
                        {node.sublabel}
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-mono pt-1.5 border-t border-white/10 text-zinc-300">
                        <span>{node.rowCount}</span>
                        <span className="text-amber-400">
                          {node.policyTagsCount} Policy Tags
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Lineage Node Inspection Drawer */}
            <aside className="w-80 border-l border-slate-200 dark:border-white/10 bg-white dark:bg-[#111827] p-4 flex flex-col justify-between overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-[#00C49F]/15 text-[#00C49F]">
                    Node Inspector • Dataplex Lineage
                  </span>
                  <h3 className="mt-2 font-mono text-sm font-bold text-slate-900 dark:text-zinc-100">
                    {inspectedNode.label}
                  </h3>
                  <p className="text-xs font-mono text-slate-500 dark:text-zinc-400">
                    {inspectedNode.gcpService} • {inspectedNode.sublabel}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-white/10">
                    <div className="text-[10px] text-slate-400 dark:text-zinc-500">
                      Freshness
                    </div>
                    <div className="text-[#00C49F] font-semibold">
                      {inspectedNode.freshness}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-white/10">
                    <div className="text-[10px] text-slate-400 dark:text-zinc-500">
                      AutoDQ Score
                    </div>
                    <div className="text-emerald-400 font-semibold">
                      {inspectedNode.qualityScore}% Pass
                    </div>
                  </div>
                </div>

                {/* Upstream & Downstream Transform Edges */}
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    Active Lineage Transformations
                  </div>
                  {lineageEdges
                    .filter(
                      (e) =>
                        e.from === inspectedNode.id || e.to === inspectedNode.id
                    )
                    .map((edge) => (
                      <div
                        key={edge.id}
                        className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-white/10 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between font-mono text-[10px]">
                          <span className="text-[#4285F4]">{edge.engine}</span>
                          <span className="text-[#00C49F]">
                            {edge.activeStream ? "Continuous Stream" : "Scheduled"}
                          </span>
                        </div>
                        <div className="font-medium text-slate-800 dark:text-zinc-200">
                          {edge.transformLabel}
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-white/10 space-y-2">
                <button
                  type="button"
                  onClick={() => setActiveSubTab("schema")}
                  className="w-full py-2 px-3 rounded-lg bg-[#1A73E8] hover:bg-[#1967D2] text-white text-xs font-medium transition-colors"
                >
                  Inspect Column Schema & Policy Tags
                </button>
              </div>
            </aside>
          </div>
        )}

        {activeSubTab === "schema" && (
          <div className="flex-1 overflow-y-auto p-5">
            <div className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#111827] overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0B0F19] text-[11px] font-mono uppercase text-slate-500 dark:text-zinc-400">
                    <th className="py-2.5 px-4">Column Name</th>
                    <th className="py-2.5 px-4">Data Type</th>
                    <th className="py-2.5 px-4">Mode</th>
                    <th className="py-2.5 px-4">Dataplex Policy Tag / Masking</th>
                    <th className="py-2.5 px-4">Sample Values</th>
                    <th className="py-2.5 px-4">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/70 dark:divide-white/5 font-mono">
                  {selectedTable.columns.map((col) => (
                    <tr
                      key={col.name}
                      className="hover:bg-slate-50 dark:hover:bg-white/[0.02]"
                    >
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-zinc-100">
                        {col.name}
                      </td>
                      <td className="py-3 px-4 text-[#4285F4]">{col.type}</td>
                      <td className="py-3 px-4 text-slate-500 dark:text-zinc-400">
                        {col.mode}
                      </td>
                      <td className="py-3 px-4">
                        {col.policyTag ? (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-amber-500/15 text-amber-400 border border-amber-500/30">
                              <ShieldAlert className="w-3 h-3" />
                              {col.policyTag}
                            </span>
                            <div className="text-[10px] text-slate-400 dark:text-zinc-500">
                              {col.maskingRule}
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 dark:text-zinc-600">
                            Unrestricted
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-[#00C49F]">
                        {col.policyTag && simulateAdminUnmask
                          ? "unmasked_vip_01@enterprise.io, unmasked_vip_02@enterprise.io"
                          : col.sampleValues.join(", ")}
                      </td>
                      <td className="py-3 px-4 font-sans text-slate-600 dark:text-zinc-300">
                        {col.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeSubTab === "quality" && (
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {selectedTable.qualityRules.map((rule) => (
                <div
                  key={rule.id}
                  className="p-4 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/10 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/15 text-[#00C49F] border border-[#00C49F]/30">
                      {rule.dimension} • {rule.status}
                    </span>
                    <span className="font-mono text-sm font-bold text-[#00C49F]">
                      {rule.passRate}%
                    </span>
                  </div>
                  <div className="font-semibold text-sm text-slate-900 dark:text-zinc-100">
                    {rule.ruleName}
                  </div>
                  <div className="text-xs font-mono text-slate-500 dark:text-zinc-400">
                    Column: <span className="text-[#4285F4]">{rule.targetColumn}</span>
                  </div>
                  <div className="p-2 rounded bg-slate-900 text-zinc-200 font-mono text-[11px]">
                    {rule.sqlExpression}
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 dark:text-zinc-500">
                    Evaluated by Dataplex AutoDQ: {rule.lastEvaluated}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeSubTab === "governance" && (
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/10 space-y-3">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#4285F4]" />
                  <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                    BigQuery & BigLake Row-Level Access Policies (RLS)
                  </h4>
                </div>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Equivalent to Unity Catalog Row Filters, enforced natively at the BigQuery Storage & BigLake Iceberg scan layer.
                </p>
                <pre className="p-3 rounded-lg bg-slate-900 text-zinc-200 font-mono text-[11px] overflow-x-auto">
{`CREATE ROW ACCESS POLICY regional_manager_rls_filter
ON \`lustrous-stone-417013.${selectedTable.schemaName}.${selectedTable.name}\`
GRANT TO ('group:regional-commerce-leads@gcp-lakehouse.io')
FILTER USING (region_code IN ('US-EAST', 'EU-CENTRAL'));`}
                </pre>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/10 space-y-3">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#00C49F]" />
                  <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                    Dataplex Policy Tag Dynamic Data Masking
                  </h4>
                </div>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Fine-grained column access control via Cloud DLP & BigQuery Policy Tags (`PII_HIGH_CONFIDENTIAL`, `PCI_DSS_CARDHOLDER_DATA`).
                </p>
                <div className="space-y-2 text-xs font-mono">
                  <div className="p-2.5 rounded bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-white/10 flex justify-between">
                    <span>roles/datacatalog.categoryFineGrainedReader</span>
                    <span className="text-[#00C49F]">Unmasked Access</span>
                  </div>
                  <div className="p-2.5 rounded bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-white/10 flex justify-between">
                    <span>roles/bigquery.dataViewer (Standard Analyst)</span>
                    <span className="text-amber-400">SHA-256 Masked</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
