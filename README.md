# ADK Germany Logistics Delivery Advisor Agent

An intelligent operations advisor built with the **Agent Development Kit (ADK)** for logistics dispatchers in Germany. The agent ingests live and historical delivery data from **Google Cloud BigQuery**, integrates high-resolution meteorological predictions from **Google WeatherNext2**, cross-references historic **Autobahn traffic bottlenecks**, and proactively advises operators on delivery delays, SLA window breaches, and mitigation strategies.

---

## 🌟 Key Features

1. **ADK Agent Architecture**:
   - Built on a modular **Agent Development Kit (ADK)** architecture with typed tool abstractions, multi-step reasoning, conversation memory, and operator advisory interfaces.
   - Natural language interactive console for querying affected corridors, high-risk packages, and healthcare/temperature-sensitive shipments.

2. **Google WeatherNext2 Integration**:
   - Seamlessly integrates Google's **WeatherNext2** predictive atmospheric AI model.
   - Accurately models localized meteorological hazards across Germany: convective thunderstorm squalls in Franconia/Bavaria (A9), severe downpours & fog over the Swabian Alb (A8), gale-force crosswinds in Lower Saxony (A7), and torrential rain in the Rhineland (A3).

3. **Historic Autobahn Traffic Analytics**:
   - Incorporates historical traffic bottleneck models across major German transit arteries: **A1, A2, A3, A5, A7, A8, A9, A10**.
   - Calculates compound delay multipliers where severe weather intersects with known recurring bottlenecks (e.g. *Dreieck Holledau*, *Frankfurter Kreuz*, *Kasseler Berge*, *Albaufstieg*).

4. **BigQuery Central Data Repository**:
   - Full BigQuery SQL DDL (`01_create_tables.sql`), seed dataset (`02_seed_dummy_data.sql`), and analytical views (`03_analytical_views.sql`).
   - Clean, realistic dummy dataset of **86 records (< 100 limit)** representing hubs, active deliveries, and historical baselines across German geography.
   - Dual-mode Python BigQuery client: connects to live BigQuery (`lustrous-stone-417013.logistics_germany`) or executes standalone via local seed cache.

5. **Operator Proactive Advisories**:
   - Automatically categorizes deliveries by priority (`TEMPERATURE_SENSITIVE`, `EXPRESS_SAME_DAY`, `EXPRESS_NEXT_DAY`, `STANDARD`).
   - Computes expected delay durations and predicts delivery SLA window breaches.
   - Generates automated client notification drafts and actionable dispatch recommendations.

---

## 📂 Project Structure

```
adk_logistics_advisor/
├── README.md                           # Documentation & quickstart
├── requirements.txt                    # Project Python dependencies
├── .env.example                        # Configuration template
├── sql/
│   ├── 01_create_tables.sql            # BigQuery DDL: hubs, traffic patterns, scheduled & completed deliveries
│   ├── 02_seed_dummy_data.sql          # Seed dataset (<100 records) for Germany
│   └── 03_analytical_views.sql         # BigQuery views for reliability & priority tracking
├── data/
│   └── seed_data.json                  # Embedded seed dataset matching BigQuery schema
├── src/
│   ├── __init__.py
│   ├── config.py                       # Configuration & environment variables
│   ├── bigquery_repo.py                # BigQuery repository with dual-mode fallback
│   ├── weathernext2_client.py          # Google WeatherNext2 forecast simulator & client
│   ├── traffic_service.py              # German Autobahn historic traffic service
│   ├── agent/
│   │   ├── __init__.py
│   │   ├── schemas.py                  # Pydantic schemas for deliveries, weather, and delays
│   │   ├── adk_framework.py            # ADK core agent orchestration & tool engine
│   │   ├── tools.py                    # ADK tools for BigQuery, WeatherNext2, and delays
│   │   └── advisor_agent.py            # Logistics Advisor Agent with reasoning logic
│   ├── cli.py                          # Interactive CLI operator console
│   └── run_advisor.py                  # End-to-end evaluation & visual report
└── tests/
    └── test_advisor.py                 # Automated unit & integration tests
```

---

## 🚀 Quickstart

### 1. Environment Setup
```bash
cd /Users/borisbugarski/.gemini/jetski/scratch/adk_logistics_advisor
source .venv/bin/activate
```

### 2. 🌐 Launch the Streamlit Web Dashboard *(Recommended)*
Start the interactive dispatch operations web application:
```bash
.venv/bin/streamlit run app.py
```
*(Or if your virtual environment is active: `streamlit run app.py`)*

👉 Open your browser at: **[http://localhost:8501](http://localhost:8501)**

#### 🌟 Web Dashboard Features:
- **Live KPI Strip**: Instant metrics for Active Shipments, On-Time % (Not at Risk), Predicted Delayed %, SLA Window Breaches, and Pharma Cold-Chain at Risk.
- **Interactive German Transit Map**: Visualizes delivery routes, origin/destination hubs, and weather-impacted corridors using Plotly.
- **Advisor Copilot & Query Bar**: Ask natural language operational questions with 1-click suggestion chips (`Shift Overview`, `On-Time Deliveries`, `Pharma Cold-Chain`, `Munich Operations`, `A9 Squall Line`, `SLA Breaches`).
- **Sidebar Dispatch Filters**: Filter shipments in real-time by City, Corridor, Priority, or Risk Level.
- **Actionable Delay Cards**: Detailed breakdowns of Weather slowdown + Traffic bottleneck minutes, recommended mitigation actions, and auto-generated client notifications.

---

### 3. 💻 Launch the Interactive Operator CLI Console
Chat directly with the ADK Advisor Agent in your terminal:
```bash
PYTHONPATH=. .venv/bin/python src/cli.py
```

### 4. 📊 Run the Automated Evaluation Batch Report
Execute a complete batch scan across all German routes:
```bash
PYTHONPATH=. .venv/bin/python src/run_advisor.py
```

### 5. 🧪 Run the Test Suite
```bash
PYTHONPATH=. .venv/bin/pytest tests/
```


---

## 🗄️ BigQuery Setup

To deploy the schema and seed data directly to Google Cloud BigQuery:

```bash
# 1. Create dataset and tables in BigQuery (Location: europe-west1)
bq query --use_legacy_sql=false < sql/01_create_tables.sql

# 2. Seed dummy data (< 100 records)
bq query --use_legacy_sql=false < sql/02_seed_dummy_data.sql

# 3. Create analytical views
bq query --use_legacy_sql=false < sql/03_analytical_views.sql
```

---

## 🗺️ German Transit Corridors Covered

| Corridor ID | Route | Key Bottlenecks | WeatherNext2 Meteorological Profile |
|---|---|---|---|
| **COR-A9** | Munich ➔ Nuremberg ➔ Leipzig ➔ Berlin | Dreieck Holledau, Kindinger Berg | Severe Thunderstorm Squall Line & Hail |
| **COR-A8** | Karlsruhe ➔ Stuttgart ➔ Ulm ➔ Munich | Albaufstieg, Drackensteiner Hang | Torrential Rain & Cloud-Base Dense Fog |
| **COR-A7** | Hamburg ➔ Hanover ➔ Kassel ➔ Ulm | Elbtunnel, Kasseler Berge | Gale Force Winds & Crosswind Buffeting |
| **COR-A3** | Frankfurt ➔ Würzburg ➔ Cologne | Frankfurter Kreuz, Spessart | Frontal Rain Bands & Hydroplaning |
| **COR-A1** | Cologne ➔ Dortmund ➔ Bremen ➔ Hamburg | Leverkusen Bridge, Bremen Kreuz | Passing Rain Squalls & Wet Rutting |
| **COR-A2** | Oberhausen ➔ Hanover ➔ Berlin | Kamener Kreuz, Braunschweig | Overcast & Light Mist (Nominal) |
| **COR-A5** | Frankfurt ➔ Karlsruhe ➔ Basel | Darmstädter Kreuz, Walldorf | Scattered Light Showers (Nominal) |
| **COR-A10** | Berliner Ring Orbital | Dreieck Havelland, Schönefeld | Clear to Partly Cloudy (Optimal) |
