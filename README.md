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
