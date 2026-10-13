export type ModuleCategory =
  | "workspace"
  | "catalog"
  | "pipelines"
  | "compute"
  | "ml_genai";

export type TabKind =
  | "notebook"
  | "catalog"
  | "pipeline"
  | "ml_studio"
  | "compute";

export interface WorkspaceTab {
  id: string;
  title: string;
  kind: TabKind;
  resourceId: string;
  breadcrumb: string[];
  gcpBadge: string;
  databricksEquivalent: string;
  dirty?: boolean;
}

export type CellLanguage = "sql" | "pyspark" | "markdown";
export type CellStatus = "idle" | "running" | "succeeded" | "failed";
export type CellOutputTab = "table" | "chart" | "profile";

export interface ColumnProfileStat {
  column: string;
  type: string;
  nullPct: number;
  distinctCount: number;
  min?: string;
  max?: string;
  distribution: number[]; // 5-bucket mini histogram 0-100
}

export interface ChartSeriesPoint {
  label: string;
  primary: number;
  secondary?: number;
  category?: string;
}

export interface NotebookCell {
  id: string;
  title: string;
  language: CellLanguage;
  engineLabel: string; // e.g. "BigQuery Studio (BI Engine)" or "Dataproc Serverless Spark 3.5"
  code: string;
  status: CellStatus;
  lastRunDuration?: string;
  lastRunTimestamp?: string;
  bytesScannedOrWorkers?: string;
  activeOutputTab: CellOutputTab;
  chartType?: "bar" | "area" | "scatter";
  chartMetricLabel?: string;
  chartSecondaryLabel?: string;
  tableColumns?: string[];
  tableRows?: Record<string, string | number>[];
  chartData?: ChartSeriesPoint[];
  profileStats?: ColumnProfileStat[];
  geminiSuggestion?: string;
}

export interface NotebookDoc {
  id: string;
  name: string;
  folderPath: string;
  attachedSparkPoolId: string;
  attachedBqWarehouseId: string;
  lastModified: string;
  author: string;
  cells: NotebookCell[];
}

export interface CatalogColumn {
  name: string;
  type: string;
  mode: "REQUIRED" | "NULLABLE" | "REPEATED";
  description: string;
  policyTag?: string;
  maskingRule?: string;
  sampleValues: string[];
  nullPercentage: number;
}

export interface DataQualityRule {
  id: string;
  ruleName: string;
  dimension: "Completeness" | "Uniqueness" | "Freshness" | "Validity";
  targetColumn: string;
  sqlExpression: string;
  passRate: number;
  status: "PASSED" | "WARNING" | "FAILED";
  lastEvaluated: string;
}

export interface CatalogTable {
  id: string;
  name: string;
  schemaName: string;
  projectId: string;
  format:
    | "BigQuery Native Table"
    | "BigLake Iceberg Table"
    | "GCS External Parquet"
    | "Vertex AI Feature View";
  tier: "Bronze" | "Silver" | "Gold" | "Feature Store";
  rowCount: string;
  sizeBytes: string;
  partitionBy: string;
  clusteredBy: string[];
  lastUpdated: string;
  owner: string;
  dataplexZone: string;
  storageUri: string;
  description: string;
  columns: CatalogColumn[];
  qualityRules: DataQualityRule[];
}

export interface CatalogSchema {
  id: string;
  name: string;
  projectId: string;
  dataplexLake: string;
  region: string;
  description: string;
  tables: CatalogTable[];
}

export interface CatalogMetastore {
  projectId: string;
  displayName: string;
  environment: "PROD" | "STAGE";
  schemas: CatalogSchema[];
}

export interface LineageNode {
  id: string;
  label: string;
  sublabel: string;
  kind:
    | "source_stream"
    | "gcs_bucket"
    | "bronze_table"
    | "silver_table"
    | "gold_table"
    | "feature_store"
    | "bi_dashboard";
  gcpService: string;
  x: number;
  y: number;
  freshness: string;
  qualityScore: number;
  rowCount: string;
  policyTagsCount: number;
  tableId?: string;
}

export interface LineageEdge {
  id: string;
  from: string;
  to: string;
  transformLabel: string;
  engine: "Dataflow Beam" | "BigQuery SQL" | "Dataproc Spark" | "Vertex Sync";
  activeStream?: boolean;
}

export type PipelineNodeState = "RUNNING" | "SUCCEEDED" | "FAILED" | "QUEUED";

export interface PipelineNode {
  id: string;
  title: string;
  subtitle: string;
  dltType:
    | "STREAMING_TABLE"
    | "MATERIALIZED_VIEW"
    | "SPARK_BATCH"
    | "QUALITY_GATE"
    | "VERTEX_SINK";
  gcpEngine:
    | "Cloud Pub/Sub"
    | "Dataflow Prime (Beam)"
    | "Dataproc Serverless"
    | "BigQuery Materialized View"
    | "Dataplex AutoDQ"
    | "Vertex Feature Store";
  state: PipelineNodeState;
  x: number;
  y: number;
  throughput: string;
  watermarkLatency: string;
  workersOrSlots: string;
  recordsProcessed: string;
  codeSnippet: string;
  errorMessage?: string;
  geminiRemediation?: string;
}

export interface PipelineEdge {
  id: string;
  from: string;
  to: string;
  streaming: boolean;
  throughputLabel: string;
}

export interface PipelineWorkflow {
  id: string;
  name: string;
  description: string;
  orchestrator: string; // e.g. "Cloud Composer 3 (Airflow 2.10) + Dataflow Prime"
  databricksEquivalent: string; // e.g. "Delta Live Tables (DLT) + Workflows"
  mode: "CONTINUOUS_STREAMING" | "SCHEDULED_BATCH";
  cronSchedule: string;
  pubsubTriggerTopic: string;
  alertChannel: string;
  status: PipelineNodeState;
  lastRunTime: string;
  totalThroughput: string;
  p99WatermarkLatency: string;
  activeWorkers: number;
  maxWorkers: number;
  dlqRate: string;
  costPerHour: number;
  nodes: PipelineNode[];
  edges: PipelineEdge[];
}

export interface SparkPool {
  id: string;
  name: string;
  runtimeVersion: string;
  status: "RUNNING" | "IDLE" | "SCALING" | "STOPPED";
  minDpus: number;
  maxDpus: number;
  currentDpus: number;
  vCpuUtilization: number;
  ramUtilization: number;
  gpuAccelerator?: string;
  idleTtlMinutes: number;
  bigLakeMetastore: boolean;
  costPerHour: number;
  activeSessions: number;
}

export interface SqlWarehouse {
  id: string;
  name: string;
  edition: "Enterprise Plus" | "Enterprise" | "Standard";
  status: "ACTIVE" | "SCALING" | "SUSPENDED";
  baselineSlots: number;
  maxAutoscaleSlots: number;
  currentSlotsUsed: number;
  biEngineCacheGb: number;
  biEngineHitRatio: number;
  queuedQueries: number;
  activeQueries: number;
  costPerHour: number;
  region: string;
}

export interface MlExperimentRun {
  id: string;
  runName: string;
  experimentGroup: string;
  framework: "XGBoost • Vertex Training" | "PyTorch • L4 GPU" | "BigQuery ML" | "Gemini 2.5 LoRA Tuning";
  status: "COMPLETED" | "RUNNING";
  aucRoc: number;
  f1Score: number;
  precisionAt99: number;
  latencyP95Ms: number;
  learningRate: number;
  maxDepthOrRank: string;
  gcsArtifactUri: string;
  createdAt: string;
  author: string;
  lossCurve: number[];
  valLossCurve: number[];
}

export interface RegisteredModel {
  id: string;
  name: string;
  version: string;
  stage: "Production" | "Staging" | "Development" | "Archived";
  vertexEndpointName: string;
  endpointStatus: "DEPLOYED" | "CANARY_10%" | "UNDEPLOYED";
  trafficSplit: string;
  qps: number;
  latencyP50Ms: number;
  latencyP99Ms: number;
  driftStatus: "HEALTHY" | "DRIFT_DETECTED";
  sourceRunId: string;
  updatedAt: string;
}

export interface GenAiEvalScenario {
  id: string;
  title: string;
  category: string;
  systemInstruction: string;
  userPrompt: string;
  groundingSource: string;
  modelA: {
    name: string;
    latencyMs: number;
    tokens: number;
    costUsd: string;
    groundednessScore: number;
    sqlAccuracyScore: number;
    response: string;
  };
  modelB: {
    name: string;
    latencyMs: number;
    tokens: number;
    costUsd: string;
    groundednessScore: number;
    sqlAccuracyScore: number;
    response: string;
  };
}
