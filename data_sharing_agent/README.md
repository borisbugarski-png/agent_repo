# ◆ Data Sharing Agent — BigQuery Data Mesh & Conversational Analytics

An enterprise **Data Mesh & Data Products** conversational analytics agent powered by **Google Cloud BigQuery** (`lustrous-stone-417013.ecommerce`) and **Gemini 2.5 Flash**.

## 🌟 Key Capabilities

1. **Data Mesh & Curated Data Products (`sql/01_data_mesh_views.sql`)**:
   - `dp_store_region_governance`: Maps all 10 retail distribution centers (Stores #1–#10) to 5 US geographic Regions (`NORTHEAST`, `MIDWEST`, `SOUTH_CENTRAL`, `SOUTHEAST`, `WEST`) with Data Product SLAs.
   - `dp_sales_and_orders`: Line-item sales revenue, product cost, gross profit margin, and fulfillment status.
   - `dp_inventory_health`: Available stock units, sold units, inventory cost, retail valuation, and sell-through rates.
   - `dp_customer_segments`: Aggregated customer demographics, age segments, acquisition channels, and lifetime spend.

2. **Role-Based Data Sharing & Governance Engine (`src/governance/policy_engine.py`)**:
   - **Store Manager (`STORE_MANAGER`)**: Scoped strictly to their assigned store (`WHERE store_id = :assigned_store_id`). Cross-store queries are intercepted, logged in the Governance Audit Log, and blocked.
   - **Regional Manager (`REGIONAL_MANAGER`)**: Scoped to all stores within their assigned region (`WHERE region_id = :assigned_region_id`). Can compare stores inside their region while other regions remain isolated.
   - **Admin User (`ADMIN`)**: Enterprise-wide read access across all 5 US Regions and all 10 Stores.

3. **Dual Interface (SaaS Streamlit Dashboard + Rich CLI)**:
   - **Streamlit Web App (`app.py`)**: SaaS-grade UI with Dark/Light mode toggle, Stakeholder Persona Switcher, interactive Plotly charts, multi-turn Conversational Analytics Chat with SQL & Thought inspection drawers, and live Governance Audit Log.
   - **Rich Interactive CLI (`src/cli.py`)**: Terminal-based executive briefings, live role switching (`role store 3`, `role region NORTHEAST`, `role admin`), and natural language Q&A.

---

## 🚀 Quickstart

### 1. Activate Virtual Environment
```bash
cd /Users/borisbugarski/.gemini/jetski/scratch/agent_repo/data_sharing_agent
source .venv/bin/activate
```

### 2. Deploy/Verify BigQuery Data Mesh Views
```bash
PYTHONPATH=. .venv/bin/python scripts/deploy_data_mesh.py
```

### 3. Run the Interactive Rich CLI
```bash
# Start as Store Manager for Store #2 (Chicago IL)
PYTHONPATH=. .venv/bin/python src/cli.py --role store --store-id 2

# Start as Regional Manager for South Central Region
PYTHONPATH=. .venv/bin/python src/cli.py --role region --region-id SOUTH_CENTRAL

# Start as Global Enterprise Admin
PYTHONPATH=. .venv/bin/python src/cli.py --role admin
```

### 4. Launch the Streamlit Web Application
```bash
PYTHONPATH=. .venv/bin/streamlit run app.py
```

### 5. Run Automated Governance & Integration Tests
```bash
PYTHONPATH=. .venv/bin/pytest tests/ -v
```
