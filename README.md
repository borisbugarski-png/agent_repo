# Google Cloud Agent Repository (`agent_repo`)

This repository hosts enterprise AI agents built with **Google Cloud BigQuery**, **Vertex AI / Gemini**, and **Google Agent Development Kit (ADK)**.

---

## 📂 Agents Included in this Repository

### 1. [◆ Data Sharing Agent (`data_sharing_agent/`)](./data_sharing_agent)
An enterprise **Data Mesh & Data Products** conversational analytics agent built on top of BigQuery (`lustrous-stone-417013.ecommerce`) and **Gemini 2.5 Flash**.
- **Data Mesh Architecture**: 4 governed BigQuery Data Product views (`dp_store_region_governance`, `dp_sales_and_orders`, `dp_inventory_health`, `dp_customer_segments`).
- **Role-Based Data Sharing (RBAC / Row-Level Security)**:
  - **Store Manager (`STORE_MANAGER`)**: Scoped exclusively to their assigned retail store (`WHERE store_id = X`).
  - **Regional Manager (`REGIONAL_MANAGER`)**: Scoped to all stores within their assigned US region (`WHERE region_id = 'Y'`).
  - **Admin User (`ADMIN`)**: Unrestricted enterprise-wide access across all 5 Regions and 10 Stores.
- **Interfaces**: SaaS Streamlit Dashboard & Conversational Analytics UI (`app.py` with high-contrast Light/Dark themes) + Rich CLI (`src/cli.py`).

---

### 2. [🚚 ADK Logistics Delivery Advisor (`adk_logistics_advisor/`)](./adk_logistics_advisor)
A real-time logistics & supply chain shift advisor powered by BigQuery (`lustrous-stone-417013.logistics_germany`), **WeatherNext2**, and Google ADK.
- **Capabilities**: Evaluates weather/traffic bottlenecks across German transport corridors (`A8`, `A9`, `A7`, `A3`), flags SLA window breaches, and prioritizes temperature-sensitive pharmaceutical shipments.
- **Interfaces**: Streamlit Operations Center (`app.py`) + Rich Shift Briefing CLI (`src/cli.py`).

---

### 3. [⚡ Google Lakehouse Studio (`google_lakehouse_studio/`)](./google_lakehouse_studio)
A modern, dark-mode-first **Databricks-equivalent Google Lakehouse Studio UI** built with **Next.js (App Router), React 19, TypeScript, and Tailwind CSS**, unifying native Google Cloud data & AI services:
- **Polyglot Notebooks**: Vertex AI Workbench + BigQuery Studio (`%sql`) + Dataproc Serverless Spark 3.5 (`%pyspark`) with inline Gemini 2.5 Code Assist, auto-charts, schema profiling, and direct Looker Studio export.
- **Unified Governance & Catalog**: 3-level Dataplex Universal Catalog + BigLake Managed Iceberg browser, interactive SVG lineage graph, AutoDQ rules, and Cloud DLP / IAM Policy Tag dynamic masking.
- **Declarative Pipelines & Orchestration**: Cloud Composer 3 + Dataflow Prime visual DAG canvas with streaming throughput/watermark telemetry and Gemini auto-remediation.
- **Compute Engine Manager & Vertex GenAI Studio**: Serverless Spark DPU pools, BigQuery Editions + BI Engine cache reservations, Vertex AI Experiments, Model Registry, and side-by-side Gemini 2.5 Pro vs. Flash evaluation playground.

