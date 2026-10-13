import {
  CatalogMetastore,
  GenAiEvalScenario,
  LineageEdge,
  LineageNode,
  MlExperimentRun,
  NotebookDoc,
  PipelineWorkflow,
  RegisteredModel,
  SparkPool,
  SqlWarehouse,
  WorkspaceTab,
} from "@/types/lakehouse";

export const INITIAL_TABS: WorkspaceTab[] = [
  {
    id: "tab-nb-ltv",
    title: "01_omnicanal_customer_ltv_iceberg.ipynb",
    kind: "notebook",
    resourceId: "nb-ltv-iceberg",
    breadcrumb: [
      "Workspace",
      "ecommerce_lakehouse",
      "notebooks",
      "01_omnicanal_customer_ltv_iceberg.ipynb",
    ],
    gcpBadge: "Vertex AI Workbench + BigQuery Studio",
    databricksEquivalent: "Databricks Polyglot Notebook",
  },
  {
    id: "tab-cat-gov",
    title: "ecommerce_lakehouse.gold_customer_360",
    kind: "catalog",
    resourceId: "tbl-gold-customer-360",
    breadcrumb: [
      "Dataplex Catalog",
      "lustrous-stone-417013",
      "ecommerce_lakehouse",
      "gold_customer_360",
    ],
    gcpBadge: "Dataplex Universal Catalog + BigLake Iceberg",
    databricksEquivalent: "Unity Catalog & Lineage",
  },
  {
    id: "tab-pipe-fraud",
    title: "fraud_detection_stream_dlt",
    kind: "pipeline",
    resourceId: "pipe-fraud-stream",
    breadcrumb: [
      "Workflows & Pipelines",
      "us-central1",
      "fraud_detection_stream_dlt",
    ],
    gcpBadge: "Cloud Composer 3 + Dataflow Prime",
    databricksEquivalent: "Delta Live Tables (DLT) + Workflows",
  },
  {
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
  },
];

export const INITIAL_SPARK_POOLS: SparkPool[] = [
  {
    id: "spark-serverless-ecom-pool",
    name: "spark-serverless-ecom-pool",
    runtimeVersion: "Dataproc Serverless 2.2 (Spark 3.5 • Iceberg 1.6)",
    status: "RUNNING",
    minDpus: 8,
    maxDpus: 64,
    currentDpus: 24,
    vCpuUtilization: 68,
    ramUtilization: 72,
    idleTtlMinutes: 30,
    bigLakeMetastore: true,
    costPerHour: 8.64,
    activeSessions: 3,
  },
  {
    id: "spark-gpu-l4-ml-pool",
    name: "spark-gpu-l4-ml-pool",
    runtimeVersion: "Dataproc Serverless 2.2 ML (Spark 3.5 + RAPIDS cuDF)",
    status: "RUNNING",
    minDpus: 16,
    maxDpus: 128,
    currentDpus: 32,
    vCpuUtilization: 84,
    ramUtilization: 79,
    gpuAccelerator: "4x NVIDIA L4 (24GB VRAM)",
    idleTtlMinutes: 45,
    bigLakeMetastore: true,
    costPerHour: 16.2,
    activeSessions: 2,
  },
  {
    id: "spark-streaming-fraud-pool",
    name: "spark-streaming-fraud-pool",
    runtimeVersion: "Dataproc Serverless 2.2 Streaming (Structured Streaming)",
    status: "SCALING",
    minDpus: 12,
    maxDpus: 96,
    currentDpus: 40,
    vCpuUtilization: 91,
    ramUtilization: 83,
    idleTtlMinutes: 60,
    bigLakeMetastore: true,
    costPerHour: 14.4,
    activeSessions: 4,
  },
];

export const INITIAL_SQL_WAREHOUSES: SqlWarehouse[] = [
  {
    id: "bq-enterprise-plus-prod",
    name: "bq-enterprise-plus-prod",
    edition: "Enterprise Plus",
    status: "ACTIVE",
    baselineSlots: 800,
    maxAutoscaleSlots: 3200,
    currentSlotsUsed: 1450,
    biEngineCacheGb: 100,
    biEngineHitRatio: 94.6,
    queuedQueries: 0,
    activeQueries: 14,
    costPerHour: 58.0,
    region: "us-central1",
  },
  {
    id: "bq-enterprise-analytics",
    name: "bq-enterprise-analytics",
    edition: "Enterprise",
    status: "ACTIVE",
    baselineSlots: 200,
    maxAutoscaleSlots: 1200,
    currentSlotsUsed: 480,
    biEngineCacheGb: 50,
    biEngineHitRatio: 88.2,
    queuedQueries: 1,
    activeQueries: 6,
    costPerHour: 19.2,
    region: "us-central1",
  },
  {
    id: "bq-standard-adhoc",
    name: "bq-standard-adhoc",
    edition: "Standard",
    status: "SUSPENDED",
    baselineSlots: 0,
    maxAutoscaleSlots: 400,
    currentSlotsUsed: 0,
    biEngineCacheGb: 10,
    biEngineHitRatio: 71.0,
    queuedQueries: 0,
    activeQueries: 0,
    costPerHour: 0.0,
    region: "us-central1",
  },
];

export const INITIAL_NOTEBOOKS: NotebookDoc[] = [
  {
    id: "nb-ltv-iceberg",
    name: "01_omnicanal_customer_ltv_iceberg.ipynb",
    folderPath: "/Workspace/ecommerce_lakehouse/notebooks",
    attachedSparkPoolId: "spark-serverless-ecom-pool",
    attachedBqWarehouseId: "bq-enterprise-plus-prod",
    lastModified: "Oct 13, 2026 • 10:42 AM",
    author: "boris.bugarski@gcp-lakehouse.io",
    cells: [
      {
        id: "cell-1",
        title: "BigLake Iceberg Regional Cohort Revenue & LTV Aggregation",
        language: "sql",
        engineLabel: "BigQuery Studio • Enterprise Plus (BI Engine Accelerated)",
        code: `-- Querying governed BigLake Iceberg table via Dataplex Universal Catalog
SELECT
  region_code,
  loyalty_tier,
  COUNT(DISTINCT customer_id) AS active_customers,
  ROUND(AVG(lifetime_value_usd), 2) AS avg_ltv_usd,
  ROUND(SUM(gross_merchandise_value_90d), 0) AS gmv_90d_usd,
  ROUND(AVG(churn_probability_score) * 100, 1) AS avg_churn_risk_pct
FROM \`lustrous-stone-417013.ecommerce_lakehouse.gold_customer_360\`
WHERE snapshot_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY)
  AND account_status = 'ACTIVE'
GROUP BY region_code, loyalty_tier
ORDER BY gmv_90d_usd DESC
LIMIT 8;`,
        status: "succeeded",
        lastRunDuration: "0.84s",
        lastRunTimestamp: "Oct 13, 2026 10:41:18 AM",
        bytesScannedOrWorkers: "38.4 MB scanned • 96% BI Engine Cache Hit",
        activeOutputTab: "table",
        chartType: "bar",
        chartMetricLabel: "90d GMV ($ USD)",
        chartSecondaryLabel: "Avg LTV ($ USD)",
        tableColumns: [
          "region_code",
          "loyalty_tier",
          "active_customers",
          "avg_ltv_usd",
          "gmv_90d_usd",
          "avg_churn_risk_pct",
        ],
        tableRows: [
          {
            region_code: "US-EAST",
            loyalty_tier: "DIAMOND",
            active_customers: 42810,
            avg_ltv_usd: 4820.5,
            gmv_90d_usd: 19420000,
            avg_churn_risk_pct: 4.2,
          },
          {
            region_code: "EU-CENTRAL",
            loyalty_tier: "DIAMOND",
            active_customers: 36190,
            avg_ltv_usd: 4510.2,
            gmv_90d_usd: 16890000,
            avg_churn_risk_pct: 5.1,
          },
          {
            region_code: "US-WEST",
            loyalty_tier: "PLATINUM",
            active_customers: 68400,
            avg_ltv_usd: 2390.8,
            gmv_90d_usd: 15110000,
            avg_churn_risk_pct: 8.7,
          },
          {
            region_code: "APAC-SG",
            loyalty_tier: "DIAMOND",
            active_customers: 24950,
            avg_ltv_usd: 4125.0,
            gmv_90d_usd: 11840000,
            avg_churn_risk_pct: 6.4,
          },
          {
            region_code: "EU-CENTRAL",
            loyalty_tier: "PLATINUM",
            active_customers: 54120,
            avg_ltv_usd: 2145.6,
            gmv_90d_usd: 10920000,
            avg_churn_risk_pct: 9.8,
          },
          {
            region_code: "US-EAST",
            loyalty_tier: "GOLD",
            active_customers: 112400,
            avg_ltv_usd: 980.4,
            gmv_90d_usd: 9410000,
            avg_churn_risk_pct: 14.3,
          },
        ],
        chartData: [
          { label: "US-EAST • Diamond", primary: 19420000, secondary: 4820 },
          { label: "EU-CENTRAL • Diamond", primary: 16890000, secondary: 4510 },
          { label: "US-WEST • Platinum", primary: 15110000, secondary: 2391 },
          { label: "APAC-SG • Diamond", primary: 11840000, secondary: 4125 },
          { label: "EU-CENTRAL • Platinum", primary: 10920000, secondary: 2146 },
          { label: "US-EAST • Gold", primary: 9410000, secondary: 980 },
        ],
        profileStats: [
          {
            column: "region_code",
            type: "STRING",
            nullPct: 0.0,
            distinctCount: 4,
            min: "APAC-SG",
            max: "US-WEST",
            distribution: [85, 72, 68, 45, 30],
          },
          {
            column: "avg_ltv_usd",
            type: "FLOAT64",
            nullPct: 0.0,
            distinctCount: 6,
            min: "$980.40",
            max: "$4,820.50",
            distribution: [20, 45, 60, 90, 75],
          },
          {
            column: "gmv_90d_usd",
            type: "FLOAT64",
            nullPct: 0.0,
            distinctCount: 6,
            min: "$9.41M",
            max: "$19.42M",
            distribution: [40, 65, 80, 92, 100],
          },
          {
            column: "avg_churn_risk_pct",
            type: "FLOAT64",
            nullPct: 0.2,
            distinctCount: 6,
            min: "4.2%",
            max: "14.3%",
            distribution: [95, 80, 55, 40, 25],
          },
        ],
        geminiSuggestion:
          "Add `QUALIFY ROW_NUMBER() OVER (PARTITION BY region_code ORDER BY gmv_90d_usd DESC) <= 2` to isolate top-performing tiers per region without a subquery.",
      },
      {
        id: "cell-2",
        title: "PySpark Distributed Feature Engineering on Dataproc Serverless",
        language: "pyspark",
        engineLabel: "Dataproc Serverless Spark 3.5 • 24 DPUs Attached",
        code: `# Read BigLake Iceberg table directly via Spark BigQuery / Iceberg connector
from pyspark.sql import functions as F
from pyspark.sql.window import Window

df_orders = (
    spark.read.format("bigquery")
    .option("table", "lustrous-stone-417013.ecommerce_lakehouse.silver_orders_enriched")
    .load()
)

w_customer = Window.partitionBy("customer_id").orderBy(F.col("order_ts").desc())

df_velocity_features = (
    df_orders
    .withColumn("prev_order_ts", F.lag("order_ts", 1).over(w_customer))
    .withColumn("inter_purchase_hours",
        (F.unix_timestamp("order_ts") - F.unix_timestamp("prev_order_ts")) / 3600.0
    )
    .groupBy("channel_category", "device_os")
    .agg(
        F.count("order_id").alias("order_volume"),
        F.round(F.avg("order_total_usd"), 2).alias("aov_usd"),
        F.round(F.expr("percentile_approx(inter_purchase_hours, 0.5)"), 1).alias("median_repurchase_hrs"),
        F.round(F.avg("cart_abandon_recovery_flag") * 100, 1).alias("recovery_rate_pct")
    )
    .orderBy(F.col("order_volume").desc())
)

display(df_velocity_features)`,
        status: "succeeded",
        lastRunDuration: "2.31s",
        lastRunTimestamp: "Oct 13, 2026 10:42:05 AM",
        bytesScannedOrWorkers: "24 Dataproc DPUs • Stage 1-3 (128 tasks) • Shuffle 14.2 MB",
        activeOutputTab: "chart",
        chartType: "area",
        chartMetricLabel: "Order Volume",
        chartSecondaryLabel: "AOV ($ USD)",
        tableColumns: [
          "channel_category",
          "device_os",
          "order_volume",
          "aov_usd",
          "median_repurchase_hrs",
          "recovery_rate_pct",
        ],
        tableRows: [
          {
            channel_category: "Mobile App Native",
            device_os: "iOS 19",
            order_volume: 482900,
            aov_usd: 164.8,
            median_repurchase_hrs: 118.4,
            recovery_rate_pct: 34.2,
          },
          {
            channel_category: "Mobile App Native",
            device_os: "Android 16",
            order_volume: 391450,
            aov_usd: 138.5,
            median_repurchase_hrs: 142.0,
            recovery_rate_pct: 29.8,
          },
          {
            channel_category: "Web Storefront",
            device_os: "macOS / Chrome",
            order_volume: 274120,
            aov_usd: 219.4,
            median_repurchase_hrs: 186.5,
            recovery_rate_pct: 24.5,
          },
          {
            channel_category: "Social Commerce",
            device_os: "iOS In-App",
            order_volume: 198600,
            aov_usd: 94.2,
            median_repurchase_hrs: 96.2,
            recovery_rate_pct: 41.7,
          },
          {
            channel_category: "Web Storefront",
            device_os: "Windows / Edge",
            order_volume: 164300,
            aov_usd: 188.9,
            median_repurchase_hrs: 204.1,
            recovery_rate_pct: 21.3,
          },
        ],
        chartData: [
          { label: "Mobile • iOS 19", primary: 482900, secondary: 165 },
          { label: "Mobile • Android 16", primary: 391450, secondary: 139 },
          { label: "Web • macOS", primary: 274120, secondary: 219 },
          { label: "Social • iOS", primary: 198600, secondary: 94 },
          { label: "Web • Windows", primary: 164300, secondary: 189 },
        ],
        profileStats: [
          {
            column: "channel_category",
            type: "STRING",
            nullPct: 0.0,
            distinctCount: 3,
            min: "Mobile App",
            max: "Web Storefront",
            distribution: [100, 75, 45, 20, 10],
          },
          {
            column: "order_volume",
            type: "INT64",
            nullPct: 0.0,
            distinctCount: 5,
            min: "164,300",
            max: "482,900",
            distribution: [35, 45, 62, 82, 100],
          },
          {
            column: "aov_usd",
            type: "DOUBLE",
            nullPct: 0.0,
            distinctCount: 5,
            min: "$94.20",
            max: "$219.40",
            distribution: [42, 65, 78, 88, 100],
          },
        ],
        geminiSuggestion:
          "Sync `df_velocity_features` directly to Vertex AI Feature Store using `vertex_ai.feature_store.write_feature_values()` for low-latency online inference.",
      },
      {
        id: "cell-3",
        title: "Real-Time Fraud Velocity & Vertex AI Feature Store Join",
        language: "sql",
        engineLabel: "BigQuery Studio • Enterprise Plus + Vertex AI Remote Model",
        code: `-- Invoke Vertex AI deployed XGBoost + Gemini Fraud Reasoner directly from BigQuery SQL
SELECT
  tx.transaction_id,
  tx.merchant_category,
  tx.country_iso,
  tx.amount_usd,
  ROUND(pred.fraud_probability, 4) AS fraud_score,
  pred.risk_reason_code
FROM ML.PREDICT(
  MODEL \`lustrous-stone-417013.fraud_detection_stream.vertex_xgb_fraud_v4\`,
  (
    SELECT
      transaction_id,
      merchant_category,
      country_iso,
      amount_usd,
      velocity_15m_count,
      geo_distance_km_last_tx
    FROM \`lustrous-stone-417013.fraud_detection_stream.realtime_card_transactions\`
    WHERE event_ts >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 15 MINUTE)
  )
) AS pred
JOIN \`lustrous-stone-417013.fraud_detection_stream.realtime_card_transactions\` AS tx
  USING (transaction_id)
WHERE pred.fraud_probability >= 0.85
ORDER BY pred.fraud_probability DESC
LIMIT 5;`,
        status: "succeeded",
        lastRunDuration: "1.12s",
        lastRunTimestamp: "Oct 13, 2026 10:43:10 AM",
        bytesScannedOrWorkers: "12.1 MB scanned • Vertex Endpoint p95: 14ms",
        activeOutputTab: "table",
        chartType: "bar",
        chartMetricLabel: "Fraud Score (0-1)",
        chartSecondaryLabel: "Tx Amount ($)",
        tableColumns: [
          "transaction_id",
          "merchant_category",
          "country_iso",
          "amount_usd",
          "fraud_score",
          "risk_reason_code",
        ],
        tableRows: [
          {
            transaction_id: "tx_9948102a",
            merchant_category: "Crypto Exchange Gift",
            country_iso: "GB",
            amount_usd: 4850.0,
            fraud_score: 0.9842,
            risk_reason_code: "GEO_IMPOSSIBLE_TRAVEL + HIGH_VELOCITY_15M",
          },
          {
            transaction_id: "tx_9948087c",
            merchant_category: "Luxury Electronics",
            country_iso: "DE",
            amount_usd: 3290.0,
            fraud_score: 0.9518,
            risk_reason_code: "NEW_DEVICE_FINGERPRINT + CARD_TESTING_PATTERN",
          },
          {
            transaction_id: "tx_9947941f",
            merchant_category: "Wire Transfer Utility",
            country_iso: "US",
            amount_usd: 2750.5,
            fraud_score: 0.919,
            risk_reason_code: "AMOUNT_3X_STDDEV_ABOVE_90D_MEAN",
          },
          {
            transaction_id: "tx_9947812b",
            merchant_category: "Gaming Digital Goods",
            country_iso: "SG",
            amount_usd: 890.0,
            fraud_score: 0.8845,
            risk_reason_code: "BURST_TX_8_IN_120_SECONDS",
          },
        ],
        chartData: [
          { label: "tx_9948102a (GB)", primary: 98.4, secondary: 4850 },
          { label: "tx_9948087c (DE)", primary: 95.2, secondary: 3290 },
          { label: "tx_9947941f (US)", primary: 91.9, secondary: 2751 },
          { label: "tx_9947812b (SG)", primary: 88.5, secondary: 890 },
        ],
        profileStats: [
          {
            column: "fraud_score",
            type: "FLOAT64",
            nullPct: 0.0,
            distinctCount: 4,
            min: "0.8845",
            max: "0.9842",
            distribution: [15, 25, 50, 85, 100],
          },
          {
            column: "amount_usd",
            type: "FLOAT64",
            nullPct: 0.0,
            distinctCount: 4,
            min: "$890.00",
            max: "$4,850.00",
            distribution: [30, 55, 70, 90, 100],
          },
        ],
        geminiSuggestion:
          "Stream flagged transactions with `fraud_score >= 0.90` directly to Pub/Sub topic `projects/lustrous-stone-417013/topics/fraud-step-up-auth` via BigQuery Continuous Queries.",
      },
    ],
  },
  {
    id: "nb-fraud-stream",
    name: "02_realtime_fraud_velocity_investigation.ipynb",
    folderPath: "/Workspace/fraud_detection_stream/notebooks",
    attachedSparkPoolId: "spark-streaming-fraud-pool",
    attachedBqWarehouseId: "bq-enterprise-plus-prod",
    lastModified: "Oct 13, 2026 • 09:58 AM",
    author: "secops-ml@gcp-lakehouse.io",
    cells: [
      {
        id: "cell-f1",
        title: "Streaming Window Aggregation over Card Velocity Anomalies",
        language: "sql",
        engineLabel: "BigQuery Studio • Continuous Query Mode",
        code: `SELECT
  country_iso,
  payment_network,
  COUNT(*) AS tx_count_15m,
  SUM(CASE WHEN is_flagged_anomaly THEN 1 ELSE 0 END) AS flagged_count,
  ROUND(AVG(auth_latency_ms), 1) AS avg_auth_latency_ms
FROM \`lustrous-stone-417013.fraud_detection_stream.realtime_card_transactions\`
GROUP BY country_iso, payment_network
ORDER BY flagged_count DESC;`,
        status: "succeeded",
        lastRunDuration: "0.61s",
        lastRunTimestamp: "Oct 13, 2026 09:57:42 AM",
        bytesScannedOrWorkers: "9.2 MB scanned • BI Engine Cached",
        activeOutputTab: "table",
        chartType: "bar",
        chartMetricLabel: "Flagged Anomalies",
        chartSecondaryLabel: "Avg Latency (ms)",
        tableColumns: [
          "country_iso",
          "payment_network",
          "tx_count_15m",
          "flagged_count",
          "avg_auth_latency_ms",
        ],
        tableRows: [
          {
            country_iso: "US",
            payment_network: "VISA_INFINITE",
            tx_count_15m: 84210,
            flagged_count: 142,
            avg_auth_latency_ms: 18.4,
          },
          {
            country_iso: "GB",
            payment_network: "MASTERCARD_WORLD",
            tx_count_15m: 41920,
            flagged_count: 98,
            avg_auth_latency_ms: 21.2,
          },
          {
            country_iso: "DE",
            payment_network: "VISA_PLATINUM",
            tx_count_15m: 38100,
            flagged_count: 64,
            avg_auth_latency_ms: 19.7,
          },
        ],
        chartData: [
          { label: "US • Visa Infinite", primary: 142, secondary: 18.4 },
          { label: "GB • MC World", primary: 98, secondary: 21.2 },
          { label: "DE • Visa Platinum", primary: 64, secondary: 19.7 },
        ],
        profileStats: [
          {
            column: "flagged_count",
            type: "INT64",
            nullPct: 0.0,
            distinctCount: 3,
            min: "64",
            max: "142",
            distribution: [45, 70, 100, 0, 0],
          },
        ],
      },
    ],
  },
];

export const CATALOG_METASTORES: CatalogMetastore[] = [
  {
    projectId: "lustrous-stone-417013",
    displayName: "lustrous-stone-417013 (Enterprise Prod Metastore)",
    environment: "PROD",
    schemas: [
      {
        id: "schema-ecommerce",
        name: "ecommerce_lakehouse",
        projectId: "lustrous-stone-417013",
        dataplexLake: "omnicanal-commerce-lake",
        region: "us-central1",
        description:
          "Curated Medallion architecture tables (Bronze GCS Parquet, Silver BigQuery Native, Gold BigLake Iceberg) for omnichannel retail & LTV.",
        tables: [
          {
            id: "tbl-gold-customer-360",
            name: "gold_customer_360",
            schemaName: "ecommerce_lakehouse",
            projectId: "lustrous-stone-417013",
            format: "BigLake Iceberg Table",
            tier: "Gold",
            rowCount: "14,820,450",
            sizeBytes: "48.6 GB",
            partitionBy: "DAY(snapshot_date)",
            clusteredBy: ["region_code", "loyalty_tier", "customer_id"],
            lastUpdated: "4 mins ago",
            owner: "data-mesh-stewards@gcp-lakehouse.io",
            dataplexZone: "curated-gold-zone",
            storageUri:
              "gs://lustrous-stone-417013-iceberg-gold/ecommerce_lakehouse/gold_customer_360/metadata/v142.metadata.json",
            description:
              "Enterprise Gold Customer 360 BigLake Apache Iceberg table unifying omnichannel orders, clickstream propensity, and Vertex AI churn scores with column-level PII masking.",
            columns: [
              {
                name: "customer_id",
                type: "STRING",
                mode: "REQUIRED",
                description: "Global canonical UUIDv7 customer identifier",
                sampleValues: ["cust_019283a4", "cust_019283b9", "cust_019283f1"],
                nullPercentage: 0.0,
              },
              {
                name: "email_address",
                type: "STRING",
                mode: "NULLABLE",
                description: "Customer contact email protected by Dataplex Policy Tag",
                policyTag: "PII_HIGH_CONFIDENTIAL",
                maskingRule: "SHA-256 Hash Mask (Non-Admin Roles)",
                sampleValues: ["a8f9...3e21@masked.io", "c4d1...9b02@masked.io"],
                nullPercentage: 0.4,
              },
              {
                name: "region_code",
                type: "STRING",
                mode: "REQUIRED",
                description: "Operating geographic market subject to Row-Level Access Policy",
                policyTag: "RLS_REGION_SCOPED",
                maskingRule: "Row-Level Security Filter (region_code IN session_user_regions)",
                sampleValues: ["US-EAST", "EU-CENTRAL", "US-WEST", "APAC-SG"],
                nullPercentage: 0.0,
              },
              {
                name: "loyalty_tier",
                type: "STRING",
                mode: "REQUIRED",
                description: "Loyalty membership tier (DIAMOND, PLATINUM, GOLD, CORE)",
                sampleValues: ["DIAMOND", "PLATINUM", "GOLD"],
                nullPercentage: 0.0,
              },
              {
                name: "lifetime_value_usd",
                type: "FLOAT64",
                mode: "REQUIRED",
                description: "Predicted 24-month Customer Lifetime Value from Vertex AI LTV model",
                sampleValues: ["4820.50", "2390.80", "980.40"],
                nullPercentage: 0.0,
              },
              {
                name: "gross_merchandise_value_90d",
                type: "FLOAT64",
                mode: "REQUIRED",
                description: "Rolling 90-day net settled order value in USD",
                sampleValues: ["1840.00", "920.50", "310.00"],
                nullPercentage: 0.0,
              },
              {
                name: "churn_probability_score",
                type: "FLOAT64",
                mode: "NULLABLE",
                description: "Calibrated 30-day churn probability [0.0 - 1.0]",
                sampleValues: ["0.042", "0.087", "0.143"],
                nullPercentage: 0.2,
              },
              {
                name: "snapshot_date",
                type: "DATE",
                mode: "REQUIRED",
                description: "Daily partition snapshot date",
                sampleValues: ["2026-10-13", "2026-10-12"],
                nullPercentage: 0.0,
              },
            ],
            qualityRules: [
              {
                id: "dq-1",
                ruleName: "Primary Key Not Null & Unique",
                dimension: "Uniqueness",
                targetColumn: "customer_id",
                sqlExpression: "COUNT( customer_id ) = COUNT( DISTINCT customer_id )",
                passRate: 100.0,
                status: "PASSED",
                lastEvaluated: "4 mins ago",
              },
              {
                id: "dq-2",
                ruleName: "Valid Churn Probability Bounds",
                dimension: "Validity",
                targetColumn: "churn_probability_score",
                sqlExpression: "churn_probability_score BETWEEN 0.0 AND 1.0",
                passRate: 99.98,
                status: "PASSED",
                lastEvaluated: "4 mins ago",
              },
              {
                id: "dq-3",
                ruleName: "SLA Freshness < 15 Minutes",
                dimension: "Freshness",
                targetColumn: "snapshot_date",
                sqlExpression: "TIMESTAMP_DIFF(CURRENT_TIMESTAMP(), _PARTITIONTIME, MINUTE) <= 15",
                passRate: 100.0,
                status: "PASSED",
                lastEvaluated: "4 mins ago",
              },
            ],
          },
          {
            id: "tbl-silver-orders",
            name: "silver_orders_enriched",
            schemaName: "ecommerce_lakehouse",
            projectId: "lustrous-stone-417013",
            format: "BigQuery Native Table",
            tier: "Silver",
            rowCount: "184,920,110",
            sizeBytes: "312.4 GB",
            partitionBy: "DAY(order_ts)",
            clusteredBy: ["customer_id", "channel_category"],
            lastUpdated: "7 mins ago",
            owner: "commerce-data-eng@gcp-lakehouse.io",
            dataplexZone: "cleansed-silver-zone",
            storageUri:
              "bq://lustrous-stone-417013/ecommerce_lakehouse/silver_orders_enriched",
            description:
              "Deduplicated and currency-normalized omnichannel order lines joined with inventory fulfillment telemetry.",
            columns: [
              {
                name: "order_id",
                type: "STRING",
                mode: "REQUIRED",
                description: "Unique order transaction key",
                sampleValues: ["ord_884120a", "ord_884121b"],
                nullPercentage: 0.0,
              },
              {
                name: "customer_id",
                type: "STRING",
                mode: "REQUIRED",
                description: "Foreign key to gold_customer_360",
                sampleValues: ["cust_019283a4", "cust_019283b9"],
                nullPercentage: 0.0,
              },
              {
                name: "channel_category",
                type: "STRING",
                mode: "REQUIRED",
                description: "Acquisition storefront channel",
                sampleValues: ["Mobile App Native", "Web Storefront", "Social Commerce"],
                nullPercentage: 0.0,
              },
              {
                name: "order_total_usd",
                type: "FLOAT64",
                mode: "REQUIRED",
                description: "Normalized USD order value",
                sampleValues: ["164.80", "219.40", "94.20"],
                nullPercentage: 0.0,
              },
              {
                name: "order_ts",
                type: "TIMESTAMP",
                mode: "REQUIRED",
                description: "UTC checkout completion timestamp",
                sampleValues: ["2026-10-13 10:35:12 UTC", "2026-10-13 10:34:59 UTC"],
                nullPercentage: 0.0,
              },
            ],
            qualityRules: [
              {
                id: "dq-s1",
                ruleName: "Non-Negative Order Total",
                dimension: "Validity",
                targetColumn: "order_total_usd",
                sqlExpression: "order_total_usd > 0",
                passRate: 99.94,
                status: "PASSED",
                lastEvaluated: "7 mins ago",
              },
            ],
          },
          {
            id: "tbl-bronze-clickstream",
            name: "bronze_clickstream_events",
            schemaName: "ecommerce_lakehouse",
            projectId: "lustrous-stone-417013",
            format: "GCS External Parquet",
            tier: "Bronze",
            rowCount: "2,410,800,000",
            sizeBytes: "1.84 TB",
            partitionBy: "HOUR(event_timestamp)",
            clusteredBy: ["session_id", "event_name"],
            lastUpdated: "1 min ago",
            owner: "streaming-ingest@gcp-lakehouse.io",
            dataplexZone: "raw-bronze-zone",
            storageUri:
              "gs://lustrous-stone-417013-raw-bronze/clickstream/dt=2026-10-13/*.parquet",
            description:
              "Raw high-throughput web & mobile telemetry events landed in Cloud Storage via Pub/Sub + Dataflow.",
            columns: [
              {
                name: "event_id",
                type: "STRING",
                mode: "REQUIRED",
                description: "Raw telemetry UUID",
                sampleValues: ["evt_99102a", "evt_99103b"],
                nullPercentage: 0.0,
              },
              {
                name: "session_id",
                type: "STRING",
                mode: "REQUIRED",
                description: "Client session identifier",
                sampleValues: ["sess_7721a", "sess_7722c"],
                nullPercentage: 0.0,
              },
              {
                name: "client_ip_address",
                type: "STRING",
                mode: "NULLABLE",
                description: "Client network IP address",
                policyTag: "PII_NETWORK_IDENTIFIER",
                maskingRule: "Last Octet Redacted (xxx.xxx.xxx.0)",
                sampleValues: ["172.56.21.0", "84.19.104.0"],
                nullPercentage: 1.2,
              },
            ],
            qualityRules: [
              {
                id: "dq-b1",
                ruleName: "Session ID Completeness",
                dimension: "Completeness",
                targetColumn: "session_id",
                sqlExpression: "session_id IS NOT NULL",
                passRate: 99.82,
                status: "PASSED",
                lastEvaluated: "2 mins ago",
              },
            ],
          },
        ],
      },
      {
        id: "schema-fraud",
        name: "fraud_detection_stream",
        projectId: "lustrous-stone-417013",
        dataplexLake: "risk-security-lake",
        region: "us-central1",
        description:
          "Sub-second streaming payment authorization telemetry, velocity aggregates, and real-time anomaly dead-letter tables.",
        tables: [
          {
            id: "tbl-realtime-tx",
            name: "realtime_card_transactions",
            schemaName: "fraud_detection_stream",
            projectId: "lustrous-stone-417013",
            format: "BigQuery Native Table",
            tier: "Silver",
            rowCount: "642,190,400",
            sizeBytes: "540.2 GB",
            partitionBy: "HOUR(event_ts)",
            clusteredBy: ["country_iso", "merchant_category"],
            lastUpdated: "Streaming (1.4s lag)",
            owner: "risk-engineering@gcp-lakehouse.io",
            dataplexZone: "streaming-silver-zone",
            storageUri:
              "bq://lustrous-stone-417013/fraud_detection_stream/realtime_card_transactions",
            description:
              "BigQuery Storage Write API streaming table receiving enriched payment authorizations from Dataflow Prime.",
            columns: [
              {
                name: "transaction_id",
                type: "STRING",
                mode: "REQUIRED",
                description: "Global payment switch authorization ID",
                sampleValues: ["tx_9948102a", "tx_9948087c"],
                nullPercentage: 0.0,
              },
              {
                name: "card_pan_token",
                type: "STRING",
                mode: "REQUIRED",
                description: "Cloud KMS / DLP format-preserving tokenized card number",
                policyTag: "PCI_DSS_CARDHOLDER_DATA",
                maskingRule: "Cloud DLP Format-Preserving Tokenization",
                sampleValues: ["tok_4111_xxxx_9821", "tok_5421_xxxx_1104"],
                nullPercentage: 0.0,
              },
              {
                name: "amount_usd",
                type: "FLOAT64",
                mode: "REQUIRED",
                description: "Authorization amount in USD",
                sampleValues: ["4850.00", "3290.00", "890.00"],
                nullPercentage: 0.0,
              },
              {
                name: "velocity_15m_count",
                type: "INT64",
                mode: "REQUIRED",
                description: "Sliding 15-minute window transaction count per card token",
                sampleValues: ["9", "6", "1"],
                nullPercentage: 0.0,
              },
            ],
            qualityRules: [
              {
                id: "dq-f1",
                ruleName: "PCI Tokenization Enforcement",
                dimension: "Validity",
                targetColumn: "card_pan_token",
                sqlExpression: "STARTS_WITH(card_pan_token, 'tok_')",
                passRate: 100.0,
                status: "PASSED",
                lastEvaluated: "1 min ago",
              },
            ],
          },
        ],
      },
      {
        id: "schema-vertex-fs",
        name: "vertex_feature_store",
        projectId: "lustrous-stone-417013",
        dataplexLake: "ml-feature-platform-lake",
        region: "us-central1",
        description:
          "Dual-tier (BigQuery Offline + Bigtable/Optimized Online) Vertex AI Feature Store views for low-latency model serving.",
        tables: [
          {
            id: "tbl-vertex-features",
            name: "customer_fraud_embeddings_v4",
            schemaName: "vertex_feature_store",
            projectId: "lustrous-stone-417013",
            format: "Vertex AI Feature View",
            tier: "Feature Store",
            rowCount: "14,820,450",
            sizeBytes: "92.1 GB",
            partitionBy: "DAY(feature_timestamp)",
            clusteredBy: ["entity_customer_id"],
            lastUpdated: "Continuous Sync (p99: 11ms)",
            owner: "ml-platform@gcp-lakehouse.io",
            dataplexZone: "vertex-online-serving-zone",
            storageUri:
              "vertex://projects/lustrous-stone-417013/locations/us-central1/featureOnlineStores/google_lakehouse_online_store/featureViews/customer_fraud_embeddings_v4",
            description:
              "Online/Offline synchronized 128-dim behavioral graph embeddings + real-time card velocity features.",
            columns: [
              {
                name: "entity_customer_id",
                type: "STRING",
                mode: "REQUIRED",
                description: "Entity key for Vertex Feature Online Store lookup",
                sampleValues: ["cust_019283a4", "cust_019283b9"],
                nullPercentage: 0.0,
              },
              {
                name: "graph_embedding_128d",
                type: "ARRAY<FLOAT64>",
                mode: "REQUIRED",
                description: "128-dimensional GNN transaction graph vector",
                sampleValues: ["[0.041, -0.192, 0.884, ...]", "[-0.118, 0.402, 0.019, ...]"],
                nullPercentage: 0.0,
              },
            ],
            qualityRules: [
              {
                id: "dq-v1",
                ruleName: "Vector Dimension Integrity (128d)",
                dimension: "Validity",
                targetColumn: "graph_embedding_128d",
                sqlExpression: "ARRAY_LENGTH(graph_embedding_128d) = 128",
                passRate: 100.0,
                status: "PASSED",
                lastEvaluated: "2 mins ago",
              },
            ],
          },
        ],
      },
    ],
  },
];

export const LINEAGE_NODES: LineageNode[] = [
  {
    id: "ln-pubsub",
    label: "pubsub_omnicanal_events",
    sublabel: "Cloud Pub/Sub Topic",
    kind: "source_stream",
    gcpService: "Cloud Pub/Sub (148k msg/s)",
    x: 40,
    y: 75,
    freshness: "Real-time (0.2s)",
    qualityScore: 100,
    rowCount: "148.4K/sec",
    policyTagsCount: 1,
  },
  {
    id: "ln-gcs-raw",
    label: "gcs_raw_clickstream",
    sublabel: "Cloud Storage Bucket",
    kind: "gcs_bucket",
    gcpService: "Cloud Storage Parquet",
    x: 40,
    y: 250,
    freshness: "1 min ago",
    qualityScore: 99.8,
    rowCount: "2.41B rows",
    policyTagsCount: 1,
    tableId: "tbl-bronze-clickstream",
  },
  {
    id: "ln-bronze-tx",
    label: "realtime_card_transactions",
    sublabel: "fraud_detection_stream",
    kind: "bronze_table",
    gcpService: "BigQuery Streaming Table",
    x: 330,
    y: 75,
    freshness: "1.4s lag",
    qualityScore: 100,
    rowCount: "642.2M rows",
    policyTagsCount: 2,
    tableId: "tbl-realtime-tx",
  },
  {
    id: "ln-silver-orders",
    label: "silver_orders_enriched",
    sublabel: "ecommerce_lakehouse",
    kind: "silver_table",
    gcpService: "BigQuery Native Table",
    x: 330,
    y: 250,
    freshness: "7 mins ago",
    qualityScore: 99.9,
    rowCount: "184.9M rows",
    policyTagsCount: 1,
    tableId: "tbl-silver-orders",
  },
  {
    id: "ln-gold-c360",
    label: "gold_customer_360",
    sublabel: "ecommerce_lakehouse (Iceberg)",
    kind: "gold_table",
    gcpService: "BigLake Managed Iceberg",
    x: 640,
    y: 160,
    freshness: "4 mins ago",
    qualityScore: 100,
    rowCount: "14.8M rows",
    policyTagsCount: 3,
    tableId: "tbl-gold-customer-360",
  },
  {
    id: "ln-vertex-fs",
    label: "customer_fraud_embeddings_v4",
    sublabel: "vertex_feature_store",
    kind: "feature_store",
    gcpService: "Vertex AI Feature Store",
    x: 940,
    y: 80,
    freshness: "11ms Online Sync",
    qualityScore: 100,
    rowCount: "14.8M entities",
    policyTagsCount: 1,
    tableId: "tbl-vertex-features",
  },
  {
    id: "ln-looker-exec",
    label: "omnicanal_ltv_exec_board",
    sublabel: "Looker Studio Pro Dashboard",
    kind: "bi_dashboard",
    gcpService: "Looker + BI Engine Cache",
    x: 940,
    y: 245,
    freshness: "Live BI Engine",
    qualityScore: 100,
    rowCount: "12 KPI Tiles",
    policyTagsCount: 3,
  },
];

export const LINEAGE_EDGES: LineageEdge[] = [
  {
    id: "le-1",
    from: "ln-pubsub",
    to: "ln-bronze-tx",
    transformLabel: "Dataflow Prime Streaming + DLP Tokenize",
    engine: "Dataflow Beam",
    activeStream: true,
  },
  {
    id: "le-2",
    from: "ln-gcs-raw",
    to: "ln-silver-orders",
    transformLabel: "Spark 3.5 Session Dedupe & Join",
    engine: "Dataproc Spark",
    activeStream: false,
  },
  {
    id: "le-3",
    from: "ln-bronze-tx",
    to: "ln-gold-c360",
    transformLabel: "15m Velocity Rollup SQL",
    engine: "BigQuery SQL",
    activeStream: true,
  },
  {
    id: "le-4",
    from: "ln-silver-orders",
    to: "ln-gold-c360",
    transformLabel: "Iceberg MERGE INTO Customer 360",
    engine: "BigQuery SQL",
    activeStream: false,
  },
  {
    id: "le-5",
    from: "ln-gold-c360",
    to: "ln-vertex-fs",
    transformLabel: "Online Store Low-Latency Sync",
    engine: "Vertex Sync",
    activeStream: true,
  },
  {
    id: "le-6",
    from: "ln-gold-c360",
    to: "ln-looker-exec",
    transformLabel: "BI Engine Sub-Second Query",
    engine: "BigQuery SQL",
    activeStream: false,
  },
];

export const INITIAL_PIPELINES: PipelineWorkflow[] = [
  {
    id: "pipe-fraud-stream",
    name: "fraud_detection_stream_dlt",
    description:
      "Declarative real-time payment fraud & Customer 360 streaming pipeline with automated Dataplex quality gates and Vertex AI Feature Store sink.",
    orchestrator: "Cloud Composer 3 (Airflow 2.10) + Dataflow Prime + Dataproc Serverless",
    databricksEquivalent: "Delta Live Tables (DLT) Continuous Pipeline",
    mode: "CONTINUOUS_STREAMING",
    cronSchedule: "*/5 * * * * (Continuous Watermark Checkpoints)",
    pubsubTriggerTopic: "projects/lustrous-stone-417013/topics/omnicanal-payment-events",
    alertChannel: "Cloud Monitoring -> #secops-data-alerts (Slack + PagerDuty)",
    status: "RUNNING",
    lastRunTime: "Active for 14d 06h • Checkpoint #88,412",
    totalThroughput: "148,400 events/sec",
    p99WatermarkLatency: "1.8s",
    activeWorkers: 24,
    maxWorkers: 64,
    dlqRate: "0.002%",
    costPerHour: 24.8,
    nodes: [
      {
        id: "pn-ingest",
        title: "bronze_pubsub_ingest",
        subtitle: "Pub/Sub -> Dataflow Prime",
        dltType: "STREAMING_TABLE",
        gcpEngine: "Cloud Pub/Sub",
        state: "RUNNING",
        x: 35,
        y: 135,
        throughput: "148.4K msg/s",
        watermarkLatency: "0.3s",
        workersOrSlots: "8 Dataflow Workers",
        recordsProcessed: "1.42B today",
        codeSnippet: `beam.io.ReadFromPubSub(
    topic="projects/lustrous-stone-417013/topics/omnicanal-payment-events",
    with_attributes=True
) | "DLP Tokenize PAN" >> ParDo(CloudDlpTokenizeFn())`,
      },
      {
        id: "pn-silver-velocity",
        title: "silver_velocity_window",
        subtitle: "Sliding 15m Hopping Window",
        dltType: "STREAMING_TABLE",
        gcpEngine: "Dataflow Prime (Beam)",
        state: "RUNNING",
        x: 310,
        y: 55,
        throughput: "148.1K rec/s",
        watermarkLatency: "1.1s",
        workersOrSlots: "16 Dataflow Prime Workers",
        recordsProcessed: "1.41B today",
        codeSnippet: `pcoll | WindowInto(
    SlidingWindows(size=15*60, period=30),
    trigger=AfterWatermark(early=AfterProcessingTime(5)),
    accumulation_mode=AccumulationMode.ACCUMULATING
)`,
      },
      {
        id: "pn-spark-enrich",
        title: "silver_orders_iceberg_merge",
        subtitle: "PySpark Structured Streaming",
        dltType: "SPARK_BATCH",
        gcpEngine: "Dataproc Serverless",
        state: "SUCCEEDED",
        x: 310,
        y: 225,
        throughput: "42.0K rec/s",
        watermarkLatency: "4.2s",
        workersOrSlots: "24 Dataproc DPUs",
        recordsProcessed: "184.9M today",
        codeSnippet: `MERGE INTO ecommerce_lakehouse.gold_customer_360 AS target
USING silver_orders_delta AS source
ON target.customer_id = source.customer_id
WHEN MATCHED THEN UPDATE SET *
WHEN NOT MATCHED THEN INSERT *`,
      },
      {
        id: "pn-dq-gate",
        title: "dataplex_autodq_expectation",
        subtitle: "EXPECT (card_token IS NOT NULL)",
        dltType: "QUALITY_GATE",
        gcpEngine: "Dataplex AutoDQ",
        state: "SUCCEEDED",
        x: 600,
        y: 135,
        throughput: "190.1K checks/s",
        watermarkLatency: "1.4s",
        workersOrSlots: "320 BQ Slots",
        recordsProcessed: "99.998% Pass (0.002% DLQ)",
        codeSnippet: `-- Equivalent to DLT @dlt.expect_or_drop("valid_pan_token")
ASSERT (
  STARTS_WITH(card_pan_token, 'tok_')
  AND amount_usd BETWEEN 0.01 AND 250000.00
) AS dataplex_quality_contract`,
      },
      {
        id: "pn-gold-mv",
        title: "gold_customer_360_iceberg",
        subtitle: "BigLake Managed Iceberg Table",
        dltType: "MATERIALIZED_VIEW",
        gcpEngine: "BigQuery Materialized View",
        state: "RUNNING",
        x: 880,
        y: 55,
        throughput: "64.5K upserts/s",
        watermarkLatency: "1.6s",
        workersOrSlots: "640 BQ Enterprise+ Slots",
        recordsProcessed: "14.8M active entities",
        codeSnippet: `CREATE OR REPLACE TABLE \`lustrous-stone-417013.ecommerce_lakehouse.gold_customer_360\`
CLUSTER BY region_code, loyalty_tier
WITH CONNECTION \`us-central1.biglake-iceberg-conn\`
OPTIONS (file_format = 'PARQUET', table_format = 'ICEBERG')`,
      },
      {
        id: "pn-vertex-sink",
        title: "vertex_online_feature_sync",
        subtitle: "Sub-15ms Online Feature Store",
        dltType: "VERTEX_SINK",
        gcpEngine: "Vertex Feature Store",
        state: "RUNNING",
        x: 880,
        y: 225,
        throughput: "64.5K vectors/s",
        watermarkLatency: "1.8s",
        workersOrSlots: "12 Bigtable Nodes + Vector Index",
        recordsProcessed: "p99 Serving Latency: 11ms",
        codeSnippet: `aiplatform.FeatureOnlineStore(
    "projects/lustrous-stone-417013/locations/us-central1/featureOnlineStores/google_lakehouse_online_store"
).sync_feature_view("customer_fraud_embeddings_v4")`,
      },
    ],
    edges: [
      {
        id: "pe-1",
        from: "pn-ingest",
        to: "pn-silver-velocity",
        streaming: true,
        throughputLabel: "148.4k/s",
      },
      {
        id: "pe-2",
        from: "pn-ingest",
        to: "pn-spark-enrich",
        streaming: true,
        throughputLabel: "42.0k/s",
      },
      {
        id: "pe-3",
        from: "pn-silver-velocity",
        to: "pn-dq-gate",
        streaming: true,
        throughputLabel: "148.1k/s",
      },
      {
        id: "pe-4",
        from: "pn-spark-enrich",
        to: "pn-dq-gate",
        streaming: false,
        throughputLabel: "Micro-batch",
      },
      {
        id: "pe-5",
        from: "pn-dq-gate",
        to: "pn-gold-mv",
        streaming: true,
        throughputLabel: "99.998% valid",
      },
      {
        id: "pe-6",
        from: "pn-dq-gate",
        to: "pn-vertex-sink",
        streaming: true,
        throughputLabel: "Online Sync",
      },
    ],
  },
  {
    id: "pipe-medallion-batch",
    name: "ecommerce_medallion_iceberg_elt",
    description:
      "15-minute scheduled medallion compaction & attribution DAG across GCS Parquet, BigQuery Silver, and BigLake Iceberg Gold.",
    orchestrator: "Cloud Workflows + Cloud Composer 3 + BigQuery Editions",
    databricksEquivalent: "Databricks Workflows Multi-Task Job",
    mode: "SCHEDULED_BATCH",
    cronSchedule: "*/15 * * * * (Every 15 Minutes)",
    pubsubTriggerTopic: "projects/lustrous-stone-417013/topics/gcs-object-finalize",
    alertChannel: "Cloud Monitoring -> #data-eng-oncall (PagerDuty)",
    status: "FAILED",
    lastRunTime: "8 mins ago • Task 3 Schema Evolution Warning",
    totalThroughput: "38,200 rows/sec",
    p99WatermarkLatency: "4.6s",
    activeWorkers: 16,
    maxWorkers: 48,
    dlqRate: "0.14%",
    costPerHour: 11.4,
    nodes: [
      {
        id: "mb-1",
        title: "gcs_parquet_autoloader",
        subtitle: "BigQuery Storage Transfer / Load",
        dltType: "STREAMING_TABLE",
        gcpEngine: "Cloud Pub/Sub",
        state: "SUCCEEDED",
        x: 60,
        y: 140,
        throughput: "62.0K rec/s",
        watermarkLatency: "1.2s",
        workersOrSlots: "200 BQ Slots",
        recordsProcessed: "19.4M rows",
        codeSnippet: `LOAD DATA INTO ecommerce_lakehouse.bronze_clickstream_events
FROM FILES (format = 'PARQUET', uris = ['gs://lustrous-stone-417013-raw-bronze/clickstream/*'])`,
      },
      {
        id: "mb-2",
        title: "spark_sessionization_job",
        subtitle: "Dataproc Serverless Batch",
        dltType: "SPARK_BATCH",
        gcpEngine: "Dataproc Serverless",
        state: "SUCCEEDED",
        x: 380,
        y: 140,
        throughput: "45.1K rec/s",
        watermarkLatency: "2.8s",
        workersOrSlots: "16 Dataproc DPUs",
        recordsProcessed: "4.8M sessions",
        codeSnippet: `spark.sql("""
  SELECT session_id, customer_id, MIN(event_ts) AS session_start
  FROM bronze_clickstream_events GROUP BY 1, 2
""")`,
      },
      {
        id: "mb-3",
        title: "iceberg_schema_compaction",
        subtitle: "BigLake Iceberg Snapshot Commit",
        dltType: "MATERIALIZED_VIEW",
        gcpEngine: "BigQuery Materialized View",
        state: "FAILED",
        x: 700,
        y: 140,
        throughput: "0 rec/s (Halted)",
        watermarkLatency: "8m 12s",
        workersOrSlots: "0 Slots (Awaiting Schema Evolution)",
        recordsProcessed: "Halted at Commit #143",
        codeSnippet: `EXPORT DATA OPTIONS(format='ICEBERG') AS
SELECT * FROM ecommerce_lakehouse.silver_orders_enriched`,
        errorMessage:
          "BigLake Iceberg SchemaMismatchException: Upstream source added column `apple_pay_biometric_token (STRING)` not present in target Iceberg table specification.",
        geminiRemediation:
          "Enable automatic schema evolution on the BigLake Iceberg table with `ALTER TABLE ecommerce_lakehouse.gold_customer_360 ADD COLUMN IF NOT EXISTS apple_pay_biometric_token STRING` and retry task `iceberg_schema_compaction`.",
      },
    ],
    edges: [
      {
        id: "mbe-1",
        from: "mb-1",
        to: "mb-2",
        streaming: false,
        throughputLabel: "19.4M rows",
      },
      {
        id: "mbe-2",
        from: "mb-2",
        to: "mb-3",
        streaming: false,
        throughputLabel: "Schema Drift",
      },
    ],
  },
];

export const INITIAL_EXPERIMENTS: MlExperimentRun[] = [
  {
    id: "run-xgb-v42",
    runName: "xgb-fraud-velocity-v4.2-gpu",
    experimentGroup: "fraud_detection_realtime_v4",
    framework: "XGBoost • Vertex Training",
    status: "COMPLETED",
    aucRoc: 0.9914,
    f1Score: 0.948,
    precisionAt99: 0.964,
    latencyP95Ms: 11.4,
    learningRate: 0.035,
    maxDepthOrRank: "max_depth=10, colsample=0.85",
    gcsArtifactUri: "gs://lustrous-stone-417013-ml-artifacts/fraud_v4/run-xgb-v42/model.bst",
    createdAt: "Oct 13, 2026 • 09:15 AM",
    author: "boris.bugarski@gcp-lakehouse.io",
    lossCurve: [0.68, 0.42, 0.28, 0.19, 0.13, 0.095, 0.072, 0.058, 0.049, 0.043],
    valLossCurve: [0.71, 0.45, 0.31, 0.22, 0.16, 0.121, 0.094, 0.079, 0.068, 0.062],
  },
  {
    id: "run-gnn-v43",
    runName: "gnn-pyg-graph-fraud-v4.3-canary",
    experimentGroup: "fraud_detection_realtime_v4",
    framework: "PyTorch • L4 GPU",
    status: "COMPLETED",
    aucRoc: 0.9942,
    f1Score: 0.961,
    precisionAt99: 0.978,
    latencyP95Ms: 16.8,
    learningRate: 0.0012,
    maxDepthOrRank: "3-Hop GraphSAGE • 128d",
    gcsArtifactUri: "gs://lustrous-stone-417013-ml-artifacts/fraud_v4/run-gnn-v43/model.pt",
    createdAt: "Oct 13, 2026 • 10:12 AM",
    author: "secops-ml@gcp-lakehouse.io",
    lossCurve: [0.64, 0.38, 0.24, 0.16, 0.11, 0.081, 0.059, 0.045, 0.036, 0.031],
    valLossCurve: [0.66, 0.41, 0.27, 0.19, 0.135, 0.098, 0.074, 0.061, 0.052, 0.047],
  },
  {
    id: "run-bqml-ltv",
    runName: "bqml-boosted-tree-ltv-v3.1",
    experimentGroup: "omnicanal_customer_ltv",
    framework: "BigQuery ML",
    status: "COMPLETED",
    aucRoc: 0.952,
    f1Score: 0.894,
    precisionAt99: 0.912,
    latencyP95Ms: 8.2,
    learningRate: 0.05,
    maxDepthOrRank: "max_depth=8, l2_reg=1.2",
    gcsArtifactUri: "gs://lustrous-stone-417013-ml-artifacts/ltv_v3/run-bqml-ltv/",
    createdAt: "Oct 12, 2026 • 05:40 PM",
    author: "data-mesh-stewards@gcp-lakehouse.io",
    lossCurve: [0.78, 0.54, 0.39, 0.29, 0.22, 0.18, 0.15, 0.13, 0.118, 0.11],
    valLossCurve: [0.81, 0.58, 0.43, 0.33, 0.26, 0.21, 0.18, 0.16, 0.148, 0.141],
  },
  {
    id: "run-gemini-lora",
    runName: "gemini-2.5-flash-sql-copilot-lora",
    experimentGroup: "lakehouse_nl2sql_adapter",
    framework: "Gemini 2.5 LoRA Tuning",
    status: "RUNNING",
    aucRoc: 0.987,
    f1Score: 0.955,
    precisionAt99: 0.969,
    latencyP95Ms: 310.0,
    learningRate: 0.0002,
    maxDepthOrRank: "LoRA rank=16 • 4 Epochs",
    gcsArtifactUri: "gs://lustrous-stone-417013-ml-artifacts/gemini_tuning/nl2sql_r16/",
    createdAt: "Oct 13, 2026 • 10:30 AM",
    author: "boris.bugarski@gcp-lakehouse.io",
    lossCurve: [0.89, 0.51, 0.32, 0.21, 0.15, 0.108, 0.082, 0.064, 0.051, 0.044],
    valLossCurve: [0.92, 0.55, 0.36, 0.25, 0.18, 0.134, 0.105, 0.088, 0.076, 0.069],
  },
];

export const INITIAL_REGISTERED_MODELS: RegisteredModel[] = [
  {
    id: "mdl-fraud-xgb",
    name: "vertex_xgb_fraud_v4",
    version: "v4.2.0",
    stage: "Production",
    vertexEndpointName: "fraud-realtime-us-central1-ep",
    endpointStatus: "DEPLOYED",
    trafficSplit: "90% Traffic (Primary)",
    qps: 14200,
    latencyP50Ms: 6.4,
    latencyP99Ms: 14.2,
    driftStatus: "HEALTHY",
    sourceRunId: "run-xgb-v42",
    updatedAt: "2 hours ago",
  },
  {
    id: "mdl-fraud-gnn",
    name: "vertex_gnn_fraud_graph_v4",
    version: "v4.3.0-rc1",
    stage: "Staging",
    vertexEndpointName: "fraud-realtime-us-central1-ep",
    endpointStatus: "CANARY_10%",
    trafficSplit: "10% Traffic (Shadow/Canary)",
    qps: 1580,
    latencyP50Ms: 9.8,
    latencyP99Ms: 19.4,
    driftStatus: "HEALTHY",
    sourceRunId: "run-gnn-v43",
    updatedAt: "45 mins ago",
  },
  {
    id: "mdl-ltv-bqml",
    name: "omnicanal_customer_ltv_predictor",
    version: "v3.1.4",
    stage: "Production",
    vertexEndpointName: "ltv-batch-and-online-ep",
    endpointStatus: "DEPLOYED",
    trafficSplit: "100% Traffic",
    qps: 840,
    latencyP50Ms: 5.1,
    latencyP99Ms: 10.9,
    driftStatus: "HEALTHY",
    sourceRunId: "run-bqml-ltv",
    updatedAt: "1 day ago",
  },
  {
    id: "mdl-gemini-sql",
    name: "google_lakehouse_nl2sql_gemini_adapter",
    version: "v1.4.0-beta",
    stage: "Development",
    vertexEndpointName: "vertex-genai-code-assist-ep",
    endpointStatus: "DEPLOYED",
    trafficSplit: "Internal Studio Users",
    qps: 65,
    latencyP50Ms: 240.0,
    latencyP99Ms: 410.0,
    driftStatus: "HEALTHY",
    sourceRunId: "run-gemini-lora",
    updatedAt: "15 mins ago",
  },
];

export const GENAI_EVAL_SCENARIOS: GenAiEvalScenario[] = [
  {
    id: "eval-nl2sql",
    title: "BigLake Iceberg Time-Travel & Cohort Retention SQL Synthesis",
    category: "NL2SQL + BigQuery Optimization",
    systemInstruction:
      "You are Google Lakehouse Studio Copilot powered by Vertex AI. Generate production-grade GoogleSQL optimized for BigQuery Enterprise Plus and BigLake Iceberg tables, enforcing partition pruning and Dataplex governance compliance.",
    userPrompt:
      "Compare the current gold_customer_360 table against its snapshot from 7 days ago to identify DIAMOND loyalty customers whose churn_probability_score jumped by more than 0.25, and join their 15m fraud velocity.",
    groundingSource:
      "Dataplex Universal Catalog Schema: lustrous-stone-417013.ecommerce_lakehouse.gold_customer_360 + fraud_detection_stream.realtime_card_transactions",
    modelA: {
      name: "gemini-2.5-pro (Vertex AI)",
      latencyMs: 840,
      tokens: 312,
      costUsd: "$0.0019",
      groundednessScore: 99.4,
      sqlAccuracyScore: 98.8,
      response: `WITH historical_c360 AS (
  SELECT customer_id, churn_probability_score AS prev_churn_score
  FROM \`lustrous-stone-417013.ecommerce_lakehouse.gold_customer_360\`
  FOR SYSTEM_TIME AS OF TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 7 DAY)
  WHERE snapshot_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 14 DAY)
    AND loyalty_tier = 'DIAMOND'
),
velocity_15m AS (
  SELECT customer_id, MAX(velocity_15m_count) AS max_velocity_15m
  FROM \`lustrous-stone-417013.fraud_detection_stream.realtime_card_transactions\`
  WHERE event_ts >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 15 MINUTE)
  GROUP BY customer_id
)
SELECT
  curr.customer_id,
  curr.region_code,
  ROUND(hist.prev_churn_score, 3) AS churn_7d_ago,
  ROUND(curr.churn_probability_score, 3) AS churn_now,
  ROUND(curr.churn_probability_score - hist.prev_churn_score, 3) AS churn_delta,
  COALESCE(v.max_velocity_15m, 0) AS recent_tx_velocity
FROM \`lustrous-stone-417013.ecommerce_lakehouse.gold_customer_360\` AS curr
JOIN historical_c360 AS hist USING (customer_id)
LEFT JOIN velocity_15m AS v USING (customer_id)
WHERE curr.snapshot_date = CURRENT_DATE()
  AND curr.loyalty_tier = 'DIAMOND'
  AND (curr.churn_probability_score - hist.prev_churn_score) > 0.25
ORDER BY churn_delta DESC;`,
    },
    modelB: {
      name: "gemini-2.5-flash (Vertex AI)",
      latencyMs: 320,
      tokens: 268,
      costUsd: "$0.0003",
      groundednessScore: 97.8,
      sqlAccuracyScore: 96.5,
      response: `SELECT
  c.customer_id,
  c.region_code,
  old.churn_probability_score AS score_7d_ago,
  c.churn_probability_score AS score_today,
  (c.churn_probability_score - old.churn_probability_score) AS delta_score,
  MAX(tx.velocity_15m_count) AS velocity_15m
FROM \`lustrous-stone-417013.ecommerce_lakehouse.gold_customer_360\` c
JOIN \`lustrous-stone-417013.ecommerce_lakehouse.gold_customer_360\`
  FOR SYSTEM_TIME AS OF TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 7 DAY) old
  ON c.customer_id = old.customer_id
LEFT JOIN \`lustrous-stone-417013.fraud_detection_stream.realtime_card_transactions\` tx
  ON c.customer_id = tx.customer_id
  AND tx.event_ts >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 15 MINUTE)
WHERE c.loyalty_tier = 'DIAMOND'
  AND c.snapshot_date = CURRENT_DATE()
  AND (c.churn_probability_score - old.churn_probability_score) > 0.25
GROUP BY 1, 2, 3, 4, 5
ORDER BY delta_score DESC;`,
    },
  },
  {
    id: "eval-pyspark",
    title: "Dataproc Serverless PySpark Skew Mitigation & Iceberg Compaction",
    category: "PySpark + BigLake Iceberg",
    systemInstruction:
      "You are a Principal Spark Architect on Google Cloud Dataproc Serverless. Provide production PySpark 3.5 code leveraging Adaptive Query Execution (AQE) and Iceberg maintenance procedures.",
    userPrompt:
      "Write a PySpark job for Dataproc Serverless that resolves join skew on hot merchant_id keys in silver_orders_enriched and compacts small Parquet files in gold_customer_360.",
    groundingSource:
      "Dataproc Serverless 2.2 Runtime + BigLake Metastore Iceberg Procedures",
    modelA: {
      name: "gemini-2.5-pro (Vertex AI)",
      latencyMs: 910,
      tokens: 340,
      costUsd: "$0.0021",
      groundednessScore: 99.6,
      sqlAccuracyScore: 99.1,
      response: `# Enable Spark 3.5 Adaptive Query Execution (AQE) skewed join optimization
spark.conf.set("spark.sql.adaptive.enabled", "true")
spark.conf.set("spark.sql.adaptive.skewJoin.enabled", "true")
spark.conf.set("spark.sql.adaptive.skewJoin.skewedPartitionFactor", "3")
spark.conf.set("spark.sql.adaptive.skewJoin.skewedPartitionThresholdInBytes", "64MB")

# Execute Iceberg bin-pack + Z-Order compaction on BigLake catalog
spark.sql("""
  CALL biglake_catalog.system.rewrite_data_files(
    table => 'ecommerce_lakehouse.gold_customer_360',
    strategy => 'sort',
    sort_order => 'zorder(region_code, customer_id)',
    options => map(
      'target-file-size-bytes', '268435456',
      'min-input-files', '5'
    )
  )
""")`,
    },
    modelB: {
      name: "gemini-2.5-flash (Vertex AI)",
      latencyMs: 295,
      tokens: 245,
      costUsd: "$0.0002",
      groundednessScore: 96.9,
      sqlAccuracyScore: 95.8,
      response: `# Configure AQE in Dataproc Serverless Spark 3.5
spark.conf.set("spark.sql.adaptive.enabled", "true")
spark.conf.set("spark.sql.adaptive.skewJoin.enabled", "true")

# Run Iceberg rewrite_data_files procedure to compact small files
spark.sql("""
  CALL biglake_catalog.system.rewrite_data_files(
    table => 'ecommerce_lakehouse.gold_customer_360',
    options => map('target-file-size-bytes', '134217728')
  )
""")`,
    },
  },
];
