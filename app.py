"""
ADK Germany Logistics Advisor — Interactive Web Application & Dispatch Dashboard.
Visualizes BigQuery scheduled deliveries, Google WeatherNext2 atmospheric forecasts,
historic Autobahn traffic congestion, and interactive operator query summaries.
"""

import streamlit as st
import pandas as pd
import plotly.graph_objects as go
from datetime import datetime

from src.agent.advisor_agent import GermanyLogisticsAdvisorAgent
from src.agent.schemas import RiskLevel, PackagePriority, DeliveryStatus
from src.config import config

# Page Configuration
st.set_page_config(
    page_title="Logistics Delivery Advisor powered by Google Cloud",
    page_icon="🇩🇪",
    layout="wide",
    initial_sidebar_state="expanded"
)


# Custom Styling (Zinc / Dark Modern Aesthetic)
st.markdown("""
<style>
    .main-title {
        font-size: 2.2rem;
        font-weight: 800;
        letter-spacing: -0.03em;
        margin-bottom: 0.2rem;
    }
    .sub-title {
        font-size: 1.05rem;
        color: #94a3b8;
        margin-bottom: 1.5rem;
    }
    .metric-card {
        background-color: #1e293b;
        border: 1px solid #334155;
        border-radius: 10px;
        padding: 1.1rem;
        text-align: center;
    }
    .metric-value {
        font-size: 1.8rem;
        font-weight: 700;
        margin-top: 0.3rem;
    }
    .advisory-card {
        background-color: #0f172a;
        border: 1px solid #334155;
        border-radius: 12px;
        padding: 1.2rem;
        margin-bottom: 1rem;
    }
    .badge-critical {
        background-color: #ef4444;
        color: white;
        padding: 0.2rem 0.6rem;
        border-radius: 6px;
        font-weight: 600;
        font-size: 0.75rem;
    }
    .badge-high {
        background-color: #f97316;
        color: white;
        padding: 0.2rem 0.6rem;
        border-radius: 6px;
        font-weight: 600;
        font-size: 0.75rem;
    }
    .badge-medium {
        background-color: #eab308;
        color: black;
        padding: 0.2rem 0.6rem;
        border-radius: 6px;
        font-weight: 600;
        font-size: 0.75rem;
    }
    .badge-low {
        background-color: #22c55e;
        color: white;
        padding: 0.2rem 0.6rem;
        border-radius: 6px;
        font-weight: 600;
        font-size: 0.75rem;
    }
    .draft-box {
        background-color: #1e1b4b;
        border-left: 4px solid #6366f1;
        padding: 0.8rem;
        border-radius: 4px;
        font-style: italic;
        margin-top: 0.5rem;
    }
</style>
""", unsafe_allow_html=True)


@st.cache_resource
def get_agent():
    return GermanyLogisticsAdvisorAgent()


agent = get_agent()
repo = agent.repo

# Header
st.markdown('<div class="main-title">🇩🇪 Logistics Delivery Advisor powered by Google Cloud</div>', unsafe_allow_html=True)

st.markdown(
    '<div class="sub-title">Powered by <b>Google WeatherNext2 Atmospheric AI</b>, <b>BigQuery Central Repository</b> & <b>Historic Autobahn Traffic Models</b></div>',
    unsafe_allow_html=True
)

# Fetch current assessment data
rep = agent.generate_operator_advisory_report()
all_assessments = rep["assessments"]

# ---------------------------------------------------------
# Sidebar Controls & Filters
# ---------------------------------------------------------
st.sidebar.header("⚙️ Dispatch Controls")
st.sidebar.markdown(f"**GCP Project**: `{repo.project_id}`")
st.sidebar.markdown(f"**BigQuery Dataset**: `{repo.dataset_id}`")

st.sidebar.markdown("---")
st.sidebar.subheader("🔍 Filter Deliveries")

cities = sorted(list(set([a.origin_city for a in all_assessments] + [a.destination_city for a in all_assessments])))
selected_city = st.sidebar.selectbox("Filter by City", ["All Cities"] + cities)

corridors = sorted(list(set([a.transit_corridor for a in all_assessments])))
selected_corridor = st.sidebar.selectbox("Filter by Corridor", ["All Corridors"] + corridors)

priorities = ["All Priorities"] + [p.value for p in PackagePriority]
selected_priority = st.sidebar.selectbox("Filter by Priority", priorities)

risks = ["All Risk Levels", "CRITICAL", "HIGH", "MEDIUM", "LOW"]
selected_risk = st.sidebar.selectbox("Filter by Risk Level", risks)

# Filter assessments
filtered_assessments = all_assessments
if selected_city != "All Cities":
    filtered_assessments = [a for a in filtered_assessments if a.origin_city == selected_city or a.destination_city == selected_city]
if selected_corridor != "All Corridors":
    filtered_assessments = [a for a in filtered_assessments if a.transit_corridor == selected_corridor]
if selected_priority != "All Priorities":
    filtered_assessments = [a for a in filtered_assessments if a.package_priority.value == selected_priority]
if selected_risk != "All Risk Levels":
    filtered_assessments = [a for a in filtered_assessments if a.risk_level.value == selected_risk]

# ---------------------------------------------------------
# Top KPI Metrics Strip
# ---------------------------------------------------------
c1, c2, c3, c4, c5, c6 = st.columns(6)
with c1:
    st.markdown(f"""
    <div class="metric-card">
        <div style="color: #94a3b8; font-size: 0.85rem;">Active Shipments</div>
        <div class="metric-value" style="color: #38bdf8;">{rep['total_active_deliveries']}</div>
    </div>
    """, unsafe_allow_html=True)
with c2:
    st.markdown(f"""
    <div class="metric-card">
        <div style="color: #94a3b8; font-size: 0.85rem;">On-Time (Not at Risk)</div>
        <div class="metric-value" style="color: #22c55e;">{rep.get('on_time_count', 0)} <span style="font-size: 0.95rem;">({rep.get('on_time_percentage', 0)}%)</span></div>
    </div>
    """, unsafe_allow_html=True)
with c3:
    st.markdown(f"""
    <div class="metric-card">
        <div style="color: #94a3b8; font-size: 0.85rem;">Predicted Delayed (≥20m)</div>
        <div class="metric-value" style="color: #f59e0b;">{rep['deliveries_delayed_count']} <span style="font-size: 0.95rem;">({rep['percentage_affected']}%)</span></div>
    </div>
    """, unsafe_allow_html=True)
with c4:
    st.markdown(f"""
    <div class="metric-card">
        <div style="color: #94a3b8; font-size: 0.85rem;">SLA Window Breaches</div>
        <div class="metric-value" style="color: #ef4444;">{rep['predicted_sla_window_breaches']}</div>
    </div>
    """, unsafe_allow_html=True)
with c5:
    st.markdown(f"""
    <div class="metric-card">
        <div style="color: #94a3b8; font-size: 0.85rem;">Pharma at Risk</div>
        <div class="metric-value" style="color: #a855f7;">{rep['temperature_sensitive_at_risk']}</div>
    </div>
    """, unsafe_allow_html=True)
with c6:
    st.markdown(f"""
    <div class="metric-card">
        <div style="color: #94a3b8; font-size: 0.85rem;">High / Critical Risk</div>
        <div class="metric-value" style="color: #fb7185;">{rep['critical_risk_count']}</div>
    </div>
    """, unsafe_allow_html=True)

st.markdown("<br>", unsafe_allow_html=True)

# ---------------------------------------------------------
# Interactive Operator Query Interface
# ---------------------------------------------------------
st.subheader("💬 Operator Query & Advisor Copilot")

# Quick Suggestion Chips
col_chips = st.columns(6)
quick_queries = [
    ("📊 Shift Overview", "Give me a live shift briefing for the dispatch operator"),
    ("✅ On-Time Deliveries", "Show all on-time deliveries that are not at risk"),
    ("❄️ Pharma Cold-Chain", "Show all temperature-sensitive pharma packages at risk"),
    ("🥨 Munich Operations", "What deliveries are in transit around Munich?"),
    ("⛈️ A9 Squall Line", "Which deliveries are affected by weather on the A9 corridor?"),
    ("🚨 SLA Window Breaches", "What packages are at risk of missing the delivery window?")
]

selected_chip_query = None
for idx, (label, query_text) in enumerate(quick_queries):
    with col_chips[idx]:
        if st.button(label, use_container_width=True):
            selected_chip_query = query_text


# Text input for query
user_query = st.text_input(
    "Ask the ADK Advisor any question about shipments, WeatherNext2 forecasts, or traffic bottlenecks:",
    value=selected_chip_query or "",
    placeholder="e.g. 'Assess PKG-DE-MUC-01', 'Show all pharma packages', 'What is delayed in Bavaria?'"
)

if user_query:
    with st.spinner("ADK Agent reasoning across BigQuery repository & Google WeatherNext2 atmospheric radar..."):
        # Synthesize answer
        agent_reply = agent.answer_operator_query(user_query)

    st.markdown("### 🤖 ADK Advisor Response")
    st.info(agent_reply)

st.markdown("---")

# ---------------------------------------------------------
# Visual Summary Cards for Filtered Deliveries
# ---------------------------------------------------------
st.subheader(f"📦 Scheduled Deliveries Delay Assessments ({len(filtered_assessments)} records)")

tabs = st.tabs(["🗂️ Visual Cards Summary", "🗺️ Germany Route Map", "📋 Structured BigQuery Table", "⛈️ WeatherNext2 Radar Status"])

# TAB 1: Visual Cards
with tabs[0]:
    card_cols = st.columns(2)
    for i, a in enumerate(filtered_assessments):
        with card_cols[i % 2]:
            badge_class = f"badge-{a.risk_level.value.lower()}"
            sla_badge = "🚨 <b>MISSED SLA WINDOW</b>" if a.will_miss_window else "✅ <b>ON TIME</b>"
            prio_icon = "❄️" if a.package_priority == PackagePriority.TEMPERATURE_SENSITIVE else ("⚡" if a.package_priority == PackagePriority.EXPRESS_SAME_DAY else "📦")

            st.markdown(f"""
            <div class="advisory-card">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                    <div>
                        <span style="font-size: 1.1rem; font-weight: 700; color: #38bdf8;">{a.package_id}</span>
                        <span style="color: #94a3b8; font-size: 0.85rem; margin-left: 0.5rem;">({a.delivery_id})</span>
                    </div>
                    <div>
                        <span class="{badge_class}">{a.risk_level.value} RISK</span>
                    </div>
                </div>
                <div style="font-size: 0.95rem; margin-bottom: 0.4rem;">
                    <b>{prio_icon} {a.package_priority.value}</b> | <b>{a.client_name}</b> ➔ <b>{a.recipient_name}</b>
                </div>
                <div style="color: #cbd5e1; font-size: 0.85rem; margin-bottom: 0.6rem;">
                    📍 <b>{a.origin_city}</b> ➔ <b>{a.destination_city}</b> via <code>{a.transit_corridor}</code>
                </div>
                <div style="background-color: #1e293b; padding: 0.6rem; border-radius: 6px; margin-bottom: 0.6rem; font-size: 0.85rem;">
                    ⏱️ <b>Predicted Delay:</b> <span style="color: #ef4444; font-weight: 700;">+{a.total_predicted_delay_minutes} min</span> 
                    (Weather: +{a.weather_delay_minutes}m | Traffic: +{a.traffic_delay_minutes}m)
                    <br>
                    🎯 <b>SLA Status:</b> {sla_badge}
                </div>
                <div style="font-size: 0.82rem; color: #94a3b8; margin-bottom: 0.4rem;">
                    ⛈️ <b>WeatherNext2:</b> <code>{a.weather_condition}</code> ({a.weather_severity.value})
                </div>
                <div style="font-size: 0.85rem; color: #fbbf24; margin-top: 0.4rem;">
                    💡 <b>Action:</b> {a.recommended_action}
                </div>
                <div class="draft-box">
                    ✉️ <b>Draft Client ETA Push Notification:</b><br>
                    "{a.client_notification_draft}"
                </div>
            </div>
            """, unsafe_allow_html=True)

# TAB 2: Germany Route Map
with tabs[1]:
    st.markdown("#### 🇩🇪 Transit Route Corridors & Weather Hazard Map")
    
    # Hub locations dictionary
    hub_coords = {
        "Munich": (48.1351, 11.5820),
        "Hamburg": (53.5511, 9.9937),
        "Berlin": (52.5200, 13.4050),
        "Frankfurt": (50.1109, 8.6821),
        "Cologne": (50.9375, 6.9603),
        "Stuttgart": (48.7758, 9.1829),
        "Leipzig": (51.3397, 12.3731),
        "Nuremberg": (49.4521, 11.0767),
        "Freiburg": (47.9990, 7.8421),
        "Dresden": (51.0504, 13.7373),
        "Kassel": (51.3127, 9.4797),
        "Augsburg": (48.3705, 10.8978),
        "Ingolstadt": (48.7665, 11.4257),
        "Bremerhaven": (53.5396, 8.5809),
        "Heidelberg": (49.3988, 8.6724),
        "Oberkochen": (48.7841, 10.1039),
        "Leverkusen": (51.0459, 7.0192),
        "Düsseldorf": (51.2277, 6.7735),
        "Burgwedel": (52.4931, 9.8541),
        "Walldorf": (49.3053, 8.6441),
    }

    fig = go.Figure()

    # Add Hub Markers
    hubs = repo.get_logistics_hubs()
    hub_lats = [h.latitude for h in hubs]
    hub_lons = [h.longitude for h in hubs]
    hub_texts = [f"<b>{h.city} Hub</b><br>{h.hub_name}<br>Capacity: {h.capacity_daily_parcels:,} parcels/day" for h in hubs]

    fig.add_trace(go.Scattergeo(
        lon=hub_lons,
        lat=hub_lats,
        text=hub_texts,
        mode='markers+text',
        marker=dict(size=14, color='#38bdf8', symbol='hexagon'),
        textposition='top center',
        name='Major Logistics Hubs'
    ))

    # Add Delivery Route Lines
    color_map = {
        RiskLevel.CRITICAL: "#ef4444",
        RiskLevel.HIGH: "#f97316",
        RiskLevel.MEDIUM: "#eab308",
        RiskLevel.LOW: "#22c55e"
    }

    for a in filtered_assessments[:20]:  # render top routes
        orig_pt = hub_coords.get(a.origin_city, (48.1351, 11.5820))
        dest_pt = hub_coords.get(a.destination_city, (52.5200, 13.4050))
        
        fig.add_trace(go.Scattergeo(
            lon=[orig_pt[1], dest_pt[1]],
            lat=[orig_pt[0], dest_pt[0]],
            mode='lines',
            line=dict(width=3, color=color_map.get(a.risk_level, "#38bdf8")),
            hoverinfo='text',
            text=f"<b>{a.package_id}</b> ({a.client_name})<br>{a.origin_city} ➔ {a.destination_city}<br>Delay: +{a.total_predicted_delay_minutes}m<br>Weather: {a.weather_condition}",
            name=f"{a.package_id} ({a.risk_level.value})"
        ))

    fig.update_layout(
        geo=dict(
            scope='europe',
            center=dict(lat=51.1657, lon=10.4515),
            projection_scale=6.5,
            showland=True,
            landcolor='#0f172a',
            countrycolor='#334155',
            coastlinecolor='#334155',
            bgcolor='#020617'
        ),
        margin=dict(l=0, r=0, t=0, b=0),
        height=550,
        showlegend=False
    )

    st.plotly_chart(fig, use_container_width=True)

# TAB 3: Structured BigQuery Table
with tabs[2]:
    st.markdown("#### 📋 Live BigQuery Query Result View (`scheduled_deliveries`)")
    
    table_data = []
    for a in filtered_assessments:
        table_data.append({
            "Package ID": a.package_id,
            "Client": a.client_name,
            "Recipient": a.recipient_name,
            "Origin": a.origin_city,
            "Destination": a.destination_city,
            "Corridor": a.transit_corridor,
            "Priority": a.package_priority.value,
            "Status": a.status.value,
            "Weather Delay": f"+{a.weather_delay_minutes}m",
            "Traffic Delay": f"+{a.traffic_delay_minutes}m",
            "Total Delay": f"+{a.total_predicted_delay_minutes}m",
            "Missed Window": "🚨 YES" if a.will_miss_window else "✅ NO",
            "Risk Tier": a.risk_level.value,
            "Weather Forecast": a.weather_condition
        })

    df = pd.DataFrame(table_data)
    st.dataframe(df, use_container_width=True, height=450)

# TAB 4: WeatherNext2 Radar Status
with tabs[3]:
    st.markdown("#### ⛈️ Active Google WeatherNext2 Corridor Radar Intelligence")
    
    corridors_status = agent.tools_factory.create_corridor_overview_tool().func()
    c_df = pd.DataFrame(corridors_status)
    st.dataframe(c_df, use_container_width=True)
