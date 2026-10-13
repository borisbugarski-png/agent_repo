# Google Lakehouse Studio (`google_lakehouse_studio`)

**Google Lakehouse Studio** is a dark-mode-first, high-density unified data & AI workspace built with **Next.js (App Router structure), React 19, TypeScript, Tailwind CSS, and Lucide Icons**. It mirrors the core workflows of **Databricks** (Polyglot Notebooks, Unity Catalog, Delta Live Tables/Workflows, Clusters & SQL Warehouses, and MLflow/Mosaic AI), powered natively by **Google Cloud** under the hood.

---

## 🗺️ Architectural Mapping (Databricks → Native Google Cloud)

| Lakehouse Capability | Databricks Equivalent | Native Google Cloud Engine |
| :--- | :--- | :--- |
| **1. Unified Workspace & Notebooks** | Databricks Workspace & Polyglot Notebooks | **Vertex AI Workbench + BigQuery Studio + Dataproc Serverless Spark 3.5** |
| **2. Data Governance & Catalog** | Unity Catalog & Lineage | **Dataplex Universal Catalog + BigLake Managed Iceberg + Cloud DLP Policy Tags** |
| **3. Pipelines & Orchestration** | Delta Live Tables (DLT) & Workflows | **Cloud Composer 3 + Dataflow Prime (Apache Beam) + Dataplex AutoDQ** |
| **4. Compute Engine Manager** | All-Purpose Clusters & SQL Warehouses | **Dataproc Serverless Spark Pools (DPUs) + BigQuery Editions & BI Engine** |
| **5. ML Lifecycle & GenAI Studio** | MLflow & Mosaic AI Playground | **Vertex AI Experiments, Model Registry & Vertex GenAI Studio (Gemini 2.5)** |

---

## ✨ Key Interactive Features

- **Multi-Tab Workspace with Persistent State**: Switch seamlessly between active polyglot notebooks, Dataplex lineage graphs, declarative DLT/Dataflow pipelines, and Vertex GenAI Studio without losing edits or execution state.
- **Global Command Palette (`Cmd + K` / `Ctrl + K`)**: Instant keyboard-driven navigation across notebooks, BigQuery/Iceberg tables, streaming pipelines, and compute pools.
- **Polyglot Notebook Editor (`%sql`, `%pyspark`)**:
  - **Floating Compute Switcher**: Attach/detach Dataproc Serverless Spark pools and BigQuery Edition slot reservations on the fly.
  - **Gemini 2.5 Code Assist**: Inline natural language to SQL/PySpark cell synthesis and one-click optimization suggestions.
  - **Rich Outputs**: Toggle between tabular results, BigQuery Studio auto-visualizations, and column distribution profiles, or export directly to **Looker Studio Pro**.
  - **Collapsible Live Schema Explorer**: Inspect table columns, PII policy tags, and sample values on the right rail.
- **Interactive Lineage & Pipeline DAG Canvas**: Pan, zoom, inspect node telemetry, configure Cron/Pub/Sub triggers, and auto-remediate schema drift failures with Gemini.

---

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
