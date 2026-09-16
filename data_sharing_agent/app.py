"""Data Sharing Agent — SaaS Data Mesh & Conversational Analytics Web Application."""

import streamlit as st
import plotly.express as px
import plotly.graph_objects as go
import pandas as pd

from src.config import DATA_PRODUCTS, GCP_PROJECT_ID, BQ_DATASET_ID
from src.governance.personas import (
    UserRole,
    STORE_METADATA,
    REGION_METADATA,
    get_store_manager_persona,
    get_regional_manager_persona,
    get_admin_persona,
    StakeholderPersona,
)
from src.governance.policy_engine import POLICY_ENGINE
from src.repository.bigquery_client import BQ_REPO
from src.agent.data_sharing_agent import DATA_SHARING_AGENT
from src.agent.tools import get_persona_suggestions

# 1. Page Configuration (MUST be first Streamlit call)
st.set_page_config(
    page_title="Data Sharing Agent — BigQuery Data Mesh",
    page_icon="◆",
    layout="wide",
    initial_sidebar_state="expanded",
)

# 2. Theme Toggle State — Default to Light Mode
if "theme" not in st.session_state:
    st.session_state.theme = "light"


def toggle_theme() -> None:
    st.session_state.theme = "dark" if st.session_state.theme == "light" else "light"


IS_DARK = st.session_state.theme == "dark"

# 3. High-Contrast Theme Variables (Dark charcoal/black fonts in Light Mode)
bg_val = "#09090b" if IS_DARK else "#ffffff"
bg_subtle_val = "#0c0c0f" if IS_DARK else "#f8fafc"
card_val = "#0c0c0f" if IS_DARK else "#ffffff"
card_hover_val = "#18181b" if IS_DARK else "#f1f5f9"
border_val = "#27272a" if IS_DARK else "#cbd5e1"
border_subtle_val = "#1f1f23" if IS_DARK else "#e2e8f0"
text_val = "#fafafa" if IS_DARK else "#0f172a"          # Deep slate-black (#0f172a) in Light Mode
text_muted_val = "#a1a1aa" if IS_DARK else "#334155"    # Dark charcoal grey (#334155) in Light Mode
text_dim_val = "#71717a" if IS_DARK else "#475569"      # Medium-dark slate (#475569) in Light Mode
green_val = "#22c55e" if IS_DARK else "#15803d"
green_muted_val = "rgba(34,197,94,0.14)" if IS_DARK else "rgba(21,128,61,0.10)"
red_val = "#ef4444" if IS_DARK else "#b91c1c"
red_muted_val = "rgba(239,68,68,0.14)" if IS_DARK else "rgba(185,28,28,0.10)"
amber_val = "#f59e0b" if IS_DARK else "#b45309"
amber_muted_val = "rgba(245,158,11,0.14)" if IS_DARK else "rgba(180,83,9,0.10)"
shadow_val = "none" if IS_DARK else "0 1px 3px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.04)"

st.markdown(
    f"""
<style>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');

:root {{
    --bg: {bg_val};
    --bg-subtle: {bg_subtle_val};
    --card: {card_val};
    --card-hover: {card_hover_val};
    --border: {border_val};
    --border-subtle: {border_subtle_val};
    --text: {text_val};
    --text-muted: {text_muted_val};
    --text-dim: {text_dim_val};
    --accent: #2563eb;
    --accent-muted: #1d4ed8;
    --green: {green_val};
    --green-muted: {green_muted_val};
    --red: {red_val};
    --red-muted: {red_muted_val};
    --amber: {amber_val};
    --amber-muted: {amber_muted_val};
    --shadow: {shadow_val};
    --radius: 10px;
}}

header[data-testid="stHeader"], #MainMenu, footer, [data-testid="stToolbar"],
[data-testid="stDecoration"], [data-testid="stStatusWidget"], .stDeployButton {{
    display: none !important;
}}

html, body, [data-testid="stAppViewContainer"], [data-testid="stApp"], .main, .block-container, section[data-testid="stMain"] {{
    background-color: var(--bg) !important;
    color: var(--text) !important;
    font-family: 'DM Sans', -apple-system, sans-serif !important;
}}

/* Global typography legibility overrides */
p, span, label, li, h1, h2, h3, h4, h5, h6,
div[data-testid="stMarkdownContainer"] p,
div[data-testid="stMarkdownContainer"] li,
div[data-testid="stMarkdownContainer"] span,
div[data-testid="stMarkdownContainer"] strong,
div[data-testid="stMarkdownContainer"] h1,
div[data-testid="stMarkdownContainer"] h2,
div[data-testid="stMarkdownContainer"] h3,
div[data-testid="stMarkdownContainer"] h4,
div[data-testid="stMarkdownContainer"] h5 {{
    color: var(--text) !important;
}}

div[data-testid="stCaptionContainer"],
div[data-testid="stCaptionContainer"] p {{
    color: var(--text-muted) !important;
    font-size: 0.82rem !important;
}}

/* Sidebar & Widget Text Legibility */
[data-testid="stSidebar"] {{
    background-color: var(--bg-subtle) !important;
    border-right: 1px solid var(--border) !important;
}}
[data-testid="stSidebar"] p,
[data-testid="stSidebar"] span,
[data-testid="stSidebar"] label,
[data-testid="stSidebar"] h1,
[data-testid="stSidebar"] h2,
[data-testid="stSidebar"] h3,
[data-testid="stSidebar"] h4 {{
    color: var(--text) !important;
}}

/* Radio & Selectbox controls */
div[role="radiogroup"] label p,
div[role="radiogroup"] label span,
div[data-testid="stSelectbox"] label p,
div[data-testid="stSelectbox"] div[data-baseweb="select"] * {{
    color: var(--text) !important;
}}
div[data-baseweb="select"] > div {{
    background-color: var(--card) !important;
    border-color: var(--border) !important;
}}
div[data-baseweb="popover"] ul,
div[data-baseweb="popover"] li {{
    background-color: var(--card) !important;
    color: var(--text) !important;
}}

/* Buttons */
button[kind="secondary"],
button[data-testid="baseButton-secondary"] {{
    background-color: var(--card) !important;
    color: var(--text) !important;
    border: 1px solid var(--border) !important;
    font-weight: 500 !important;
    box-shadow: var(--shadow) !important;
}}
button[kind="secondary"]:hover,
button[data-testid="baseButton-secondary"]:hover {{
    background-color: var(--card-hover) !important;
    border-color: var(--accent) !important;
    color: var(--accent) !important;
}}
button[kind="secondary"] p,
button[data-testid="baseButton-secondary"] p {{
    color: inherit !important;
}}

/* Chat Messages & Input */
[data-testid="stChatMessage"] {{
    background-color: var(--card) !important;
    border: 1px solid var(--border) !important;
    border-radius: var(--radius) !important;
    padding: 1rem 1.2rem !important;
    margin-bottom: 0.8rem !important;
    box-shadow: var(--shadow) !important;
}}
[data-testid="stChatMessageContent"] p,
[data-testid="stChatMessageContent"] li,
[data-testid="stChatMessageContent"] td,
[data-testid="stChatMessageContent"] th {{
    color: var(--text) !important;
}}
[data-testid="stChatInput"] textarea {{
    color: var(--text) !important;
    background-color: var(--card) !important;
}}

/* Expanders */
[data-testid="stExpander"] {{
    background-color: var(--bg-subtle) !important;
    border: 1px solid var(--border) !important;
    border-radius: 8px !important;
}}
[data-testid="stExpander"] summary p,
[data-testid="stExpander"] summary span {{
    color: var(--text) !important;
    font-weight: 600 !important;
}}

.block-container {{
    padding: 1.5rem 2.2rem 2.5rem !important;
    max-width: 1440px !important;
}}

/* Pill-style Tabs */
button[data-baseweb="tab"] {{
    background: transparent !important;
    color: var(--text-muted) !important;
    font-size: 0.86rem !important;
    font-weight: 600 !important;
    padding: 0.55rem 1.15rem !important;
    border: 1px solid transparent !important;
    border-radius: 7px !important;
    transition: all 0.15s ease !important;
}}
button[data-baseweb="tab"][aria-selected="true"] {{
    color: var(--text) !important;
    background: var(--card) !important;
    border-color: var(--border) !important;
    box-shadow: var(--shadow);
}}
[data-baseweb="tab-highlight"], [data-baseweb="tab-border"] {{
    display: none !important;
}}
[data-baseweb="tab-list"] {{
    gap: 6px !important;
    background: var(--bg-subtle) !important;
    border: 1px solid var(--border) !important;
    border-radius: 10px !important;
    padding: 4px;
    margin-bottom: 1rem;
}}

/* Metric Cards */
.metric-card {{
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 1.2rem 1.35rem;
    box-shadow: var(--shadow);
    transition: transform 0.15s ease, border-color 0.15s ease;
}}
.metric-card:hover {{
    border-color: var(--accent);
}}
.metric-label {{
    font-size: 0.76rem;
    color: var(--text-muted) !important;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
}}
.metric-value {{
    font-size: 1.7rem;
    font-weight: 700;
    color: var(--text) !important;
    letter-spacing: -0.03em;
    margin-top: 0.25rem;
    font-family: 'JetBrains Mono', monospace;
}}
.metric-delta {{
    font-size: 0.74rem;
    font-weight: 600;
    margin-top: 0.45rem;
    padding: 3px 9px;
    border-radius: 6px;
    display: inline-flex;
    align-items: center;
    gap: 4px;
}}
.delta-up {{ color: var(--green) !important; background: var(--green-muted); }}
.delta-down {{ color: var(--red) !important; background: var(--red-muted); }}
.delta-warn {{ color: var(--amber) !important; background: var(--amber-muted); }}
.delta-blue {{ color: var(--accent) !important; background: rgba(37,99,235,0.12); }}

/* Chart Containers */
.chart-wrap {{
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 1.2rem 1.25rem 0.6rem;
    box-shadow: var(--shadow);
    margin-bottom: 1rem;
}}
.chart-title {{ font-size: 0.92rem; font-weight: 700; color: var(--text) !important; }}
.chart-subtitle {{ font-size: 0.78rem; color: var(--text-muted) !important; margin-bottom: 0.6rem; }}

/* Custom HTML Data Table */
.data-table {{ width: 100%; border-collapse: separate; border-spacing: 0; font-size: 0.83rem; }}
.data-table th {{
    text-align: left;
    padding: 0.65rem 0.85rem;
    color: var(--text-muted) !important;
    font-weight: 700;
    font-size: 0.73rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    border-bottom: 1px solid var(--border);
    background: var(--bg-subtle);
}}
.data-table td {{
    padding: 0.65rem 0.85rem;
    color: var(--text) !important;
    border-bottom: 1px solid var(--border-subtle);
    font-family: 'DM Sans', sans-serif;
}}
.data-table td.mono {{
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.79rem;
    color: var(--text) !important;
}}
.data-table tr:hover td {{
    background: var(--card-hover);
}}

/* Badges */
.badge {{ display: inline-block; padding: 2px 9px; border-radius: 6px; font-size: 0.73rem; font-weight: 600; font-family: 'JetBrains Mono', monospace; }}
.badge-green {{ color: var(--green) !important; background: var(--green-muted); }}
.badge-red {{ color: var(--red) !important; background: var(--red-muted); }}
.badge-amber {{ color: var(--amber) !important; background: var(--amber-muted); }}
.badge-blue {{ color: var(--accent) !important; background: rgba(37,99,235,0.12); }}
</style>
""",
    unsafe_allow_html=True,
)

# Plotly Chart Styling with high-contrast dark charcoal fonts in Light Mode
chart_font_color = "#a1a1aa" if IS_DARK else "#1e293b"
chart_grid_color = "rgba(255,255,255,0.06)" if IS_DARK else "rgba(15,23,42,0.08)"

PLOT_LAYOUT = dict(
    paper_bgcolor="rgba(0,0,0,0)",
    plot_bgcolor="rgba(0,0,0,0)",
    font=dict(family="DM Sans, sans-serif", color=chart_font_color, size=12),
    margin=dict(l=8, r=8, t=12, b=8),
    xaxis=dict(
        gridcolor=chart_grid_color,
        zerolinecolor=chart_grid_color,
        tickfont=dict(size=11, color=chart_font_color),
        title_font=dict(color=chart_font_color),
    ),
    yaxis=dict(
        gridcolor=chart_grid_color,
        zerolinecolor=chart_grid_color,
        tickfont=dict(size=11, color=chart_font_color),
        title_font=dict(color=chart_font_color),
    ),
    legend=dict(
        font=dict(color=chart_font_color, size=11),
    ),
)


def metric_card(label: str, value: str, delta: str = "", delta_type: str = "up") -> None:
    cls = f"delta-{delta_type}"
    arrow = "↑" if delta_type == "up" else ("↓" if delta_type == "down" else "🛡️")
    delta_html = f'<div class="metric-delta {cls}">{arrow} {delta}</div>' if delta else ""
    st.markdown(
        f"""
    <div class="metric-card">
        <div class="metric-label">{label}</div>
        <div class="metric-value">{value}</div>
        {delta_html}
    </div>
    """,
        unsafe_allow_html=True,
    )


# ==============================================================================
# SIDEBAR: STAKEHOLDER PERSONA & DATA MESH GOVERNANCE SWITCHER
# ==============================================================================
with st.sidebar:
    st.markdown("### 🛡️ Stakeholder Persona")
    st.caption("Select a stakeholder user type to dynamically scope BigQuery Data Mesh access and conversational analytics.")

    role_choice = st.radio(
        "Select User Role:",
        options=[
            "Store Manager (Store Scope)",
            "Regional Manager (Region Scope)",
            "Admin User (Global Scope)",
        ],
        index=0,
    )

    if "Store Manager" in role_choice:
        store_options = {s_id: f"Store #{s_id} — {meta['name']}" for s_id, meta in sorted(STORE_METADATA.items())}
        selected_store_id = st.selectbox(
            "Assigned Retail Store:",
            options=list(store_options.keys()),
            format_func=lambda k: store_options[k],
            index=1,  # Default: Store #2 Chicago IL
        )
        active_persona: StakeholderPersona = get_store_manager_persona(selected_store_id)
    elif "Regional Manager" in role_choice:
        region_options = {r_id: f"{meta['name']} ({r_id})" for r_id, meta in REGION_METADATA.items()}
        selected_region_id = st.selectbox(
            "Assigned US Region:",
            options=list(region_options.keys()),
            format_func=lambda k: region_options[k],
            index=2,  # Default: SOUTH_CENTRAL
        )
        active_persona = get_regional_manager_persona(selected_region_id)
    else:
        active_persona = get_admin_persona()

    rls_predicate = POLICY_ENGINE.get_sql_filter(active_persona)
    scope_label = POLICY_ENGINE.get_scope_label(active_persona)

    st.markdown("---")
    st.markdown("#### 📜 Active Governance Contract")
    st.markdown(
        f"""
    <div style="background: var(--card); border: 1px solid var(--border); border-radius: 8px; padding: 0.9rem; font-size: 0.82rem; color: var(--text);">
        <div><b>Stakeholder</b>: {active_persona.full_name}</div>
        <div style="margin-top:5px;"><b>Role</b>: <span class="badge badge-blue">{active_persona.role.value}</span></div>
        <div style="margin-top:6px;"><b>Authorized Scope</b>:<br/><span style="color: var(--text-muted); font-weight: 500;">{scope_label}</span></div>
        <div style="margin-top:8px;"><b>Enforced BigQuery RLS</b>:<br/>
            <code style="font-family:'JetBrains Mono',monospace; font-size:0.76rem; color:var(--green); font-weight: 600;">WHERE {rls_predicate}</code>
        </div>
    </div>
    """,
        unsafe_allow_html=True,
    )

    st.markdown("---")
    st.markdown("#### 🗄️ Data Mesh Datasource")
    st.caption(f"**Project**: `{GCP_PROJECT_ID}`\n\n**Dataset**: `{BQ_DATASET_ID}` (BigQuery)")


# Reset chat history if persona changes
if "last_persona_id" not in st.session_state or st.session_state.last_persona_id != active_persona.persona_id:
    st.session_state.last_persona_id = active_persona.persona_id
    st.session_state.messages = [
        {
            "role": "assistant",
            "content": (
                f"Welcome, **{active_persona.full_name}** ({active_persona.title}).\n\n"
                f"I am your **Data Sharing Agent**. Your session is actively governed under the Data Mesh contract for **{scope_label}** "
                f"(enforcing row-level security predicate `WHERE {rls_predicate}`).\n\n"
                f"Ask me any analytical question about sales revenue, gross profit margins, customer segments, or inventory health!"
            ),
            "thoughts": [
                f"Initialized session for {active_persona.full_name} ({active_persona.role.value})",
                f"Active Row-Level Security Policy: WHERE {rls_predicate}",
            ],
            "sql": f"SELECT * FROM `{GCP_PROJECT_ID}.{BQ_DATASET_ID}.dp_sales_and_orders` WHERE {rls_predicate} LIMIT 10;",
            "status": "ALLOWED" if active_persona.role == UserRole.ADMIN else "RLS_APPLIED",
        }
    ]


# ==============================================================================
# HEADER BAR WITH BRAND + THEME TOGGLE
# ==============================================================================
head_left, head_right = st.columns([8.5, 1.5])
with head_left:
    role_badge_cls = (
        "badge-green" if active_persona.role == UserRole.ADMIN else ("badge-blue" if active_persona.role == UserRole.REGIONAL_MANAGER else "badge-amber")
    )
    st.markdown(
        f"""
    <div style="display:flex; align-items:center; gap: 12px; margin-bottom: 0.3rem;">
        <span style="font-size: 1.55rem; font-weight: 700; letter-spacing: -0.03em; color: var(--text);">◆ Data Sharing Agent</span>
        <span class="badge {role_badge_cls}">{active_persona.role.value}</span>
        <span class="badge badge-blue">BigQuery Data Mesh</span>
    </div>
    <div style="font-size: 0.86rem; color: var(--text-muted); font-weight: 500; margin-bottom: 1rem;">
        Active Stakeholder: <b style="color: var(--text);">{active_persona.full_name}</b> ({active_persona.title}) &nbsp;|&nbsp;
        Enforced Scope: <code style="font-family:'JetBrains Mono',monospace; color: var(--green); font-weight: 600;">WHERE {rls_predicate}</code>
    </div>
    """,
        unsafe_allow_html=True,
    )

with head_right:
    theme_label = "🌙 Dark Mode" if not IS_DARK else "☀️ Light Mode"
    st.button(theme_label, on_click=toggle_theme, width="stretch")


# ==============================================================================
# NAVIGATION TABS
# ==============================================================================
tab_chat, tab_dashboard, tab_catalog, tab_audit = st.tabs(
    [
        "💬 Conversational Analytics (AI Agent)",
        "📊 Governed Data Product Dashboard",
        "🕸️ Data Mesh Catalog & Contracts",
        f"🛡️ Governance Audit Log ({len(POLICY_ENGINE.audit_log)})",
    ]
)


# ==============================================================================
# TAB 1: CONVERSATIONAL ANALYTICS (AI AGENT)
# ==============================================================================
with tab_chat:
    # Render suggested follow-up prompt buttons
    suggestions = get_persona_suggestions(active_persona)
    if active_persona.role == UserRole.STORE_MANAGER:
        other_store = "Houston TX" if active_persona.assigned_store_id != 3 else "Chicago IL"
        test_violation_prompt = f"Show me total sales revenue and profit for {other_store} store"
    elif active_persona.role == UserRole.REGIONAL_MANAGER:
        other_reg = "Northeast Region" if active_persona.assigned_region_id != "NORTHEAST" else "West Region"
        test_violation_prompt = f"Show me total sales revenue and store rankings in {other_reg}"
    else:
        test_violation_prompt = "Give me a complete executive stakeholder briefing across all regions"

    st.markdown("##### 💡 Suggested Stakeholder Prompts & Governance Tests")
    sug_cols = st.columns(4)
    prompt_to_run = None

    for idx, sug in enumerate(suggestions[:3]):
        with sug_cols[idx]:
            if st.button(f"🔍 {sug}", key=f"sug_{idx}", width="stretch"):
                prompt_to_run = sug

    with sug_cols[3]:
        btn_label = (
            f"🛡️ Test Cross-Boundary Block ({'Other Store' if active_persona.role == UserRole.STORE_MANAGER else 'Other Region'})"
            if active_persona.role != UserRole.ADMIN
            else "📋 Executive Global Briefing"
        )
        if st.button(btn_label, key="sug_test_boundary", width="stretch"):
            prompt_to_run = test_violation_prompt

    st.markdown("---")

    # Render conversation history
    for i, msg in enumerate(st.session_state.messages):
        with st.chat_message(msg["role"]):
            st.markdown(msg["content"])
            if msg.get("thoughts") or msg.get("sql"):
                with st.expander("🔍 View Data Mesh Governance Reasoning & Executed BigQuery SQL"):
                    status_val = msg.get("status", "RLS_APPLIED")
                    b_cls = "badge-red" if status_val == "CROSS_BOUNDARY_BLOCKED" else ("badge-green" if status_val == "ALLOWED" else "badge-blue")
                    st.markdown(f"**Policy Status**: <span class='badge {b_cls}'>{status_val}</span>", unsafe_allow_html=True)
                    if msg.get("thoughts"):
                        st.markdown("**Step-by-Step Governance & Analytical Trace:**")
                        for t in msg["thoughts"]:
                            st.markdown(f"- `{t}`")
                    if msg.get("sql"):
                        st.markdown("**Governed BigQuery SQL (with RLS Predicate Injected):**")
                        st.code(msg["sql"], language="sql")

    # Chat input box
    user_chat_input = st.chat_input(f"Ask a question as {active_persona.full_name} ({active_persona.role.value})...")
    active_query = prompt_to_run or user_chat_input

    if active_query:
        st.session_state.messages.append({"role": "user", "content": active_query})
        with st.chat_message("user"):
            st.markdown(active_query)

        with st.chat_message("assistant"):
            with st.spinner(f"Enforcing Data Mesh Governance ({scope_label}) & querying BigQuery..."):
                resp = DATA_SHARING_AGENT.answer_question(active_persona, active_query)
            st.markdown(resp.content)
            with st.expander("🔍 View Data Mesh Governance Reasoning & Executed BigQuery SQL", expanded=(resp.policy_status == "CROSS_BOUNDARY_BLOCKED")):
                b_cls = "badge-red" if resp.policy_status == "CROSS_BOUNDARY_BLOCKED" else ("badge-green" if resp.policy_status == "ALLOWED" else "badge-blue")
                st.markdown(f"**Policy Status**: <span class='badge {b_cls}'>{resp.policy_status}</span>", unsafe_allow_html=True)
                for t in resp.thoughts:
                    st.markdown(f"- `{t}`")
                if resp.governed_sql:
                    st.code(resp.governed_sql, language="sql")

        st.session_state.messages.append(
            {
                "role": "assistant",
                "content": resp.content,
                "thoughts": resp.thoughts,
                "sql": resp.governed_sql,
                "status": resp.policy_status,
            }
        )
        st.rerun()


# ==============================================================================
# TAB 2: GOVERNED DATA PRODUCT DASHBOARD
# ==============================================================================
with tab_dashboard:
    with st.spinner("Loading governed BigQuery Data Product metrics..."):
        kpi = BQ_REPO.get_kpi_summary(active_persona)
        stores_df = BQ_REPO.get_store_performance(active_persona)
        cats_df = BQ_REPO.get_category_performance(active_persona, limit=10)
        trend_df = BQ_REPO.get_monthly_sales_trend(active_persona, months=18)
        status_df = BQ_REPO.get_order_status_breakdown(active_persona)
        inv_df = BQ_REPO.get_inventory_summary(active_persona)

    available_retail_val = inv_df["available_retail_usd"].sum() if not inv_df.empty else 0.0

    # Row of 4 KPI Cards
    c1, c2, c3, c4 = st.columns(4)
    with c1:
        metric_card(
            "Authorized Sales Revenue",
            f"${kpi['total_revenue']:,.2f}",
            delta=f"{kpi['total_orders']:,} Orders ({kpi['total_items']:,} items)",
            delta_type="up",
        )
    with c2:
        metric_card(
            "Authorized Gross Profit",
            f"${kpi['total_profit']:,.2f}",
            delta=f"{kpi['gross_margin_pct']:.2f}% Gross Margin",
            delta_type="up",
        )
    with c3:
        metric_card(
            "Available Inventory Value",
            f"${available_retail_val:,.2f}",
            delta=f"{kpi['active_stores']} Store(s) in Scope",
            delta_type="blue",
        )
    with c4:
        metric_card(
            "Order Return Rate",
            f"{kpi['return_rate_pct']:.2f}%",
            delta=f"RLS: WHERE {rls_predicate}",
            delta_type="warn" if kpi["return_rate_pct"] > 10 else "up",
        )

    st.markdown("<div style='height: 1rem;'></div>", unsafe_allow_html=True)

    # Row 1 Charts: Left = Store / Category Bar Chart, Right = Monthly Sales Trend
    col_left, col_right = st.columns(2)

    with col_left:
        st.markdown(
            f"""
        <div class="chart-wrap">
            <div class="chart-title">Revenue & Gross Profit by {'Store' if active_persona.role != UserRole.STORE_MANAGER else 'Top Product Categories'}</div>
            <div class="chart-subtitle">Governed under {scope_label} (BigQuery Data Product: dp_sales_and_orders)</div>
        """,
            unsafe_allow_html=True,
        )
        if active_persona.role != UserRole.STORE_MANAGER and not stores_df.empty:
            fig_bar = go.Figure()
            fig_bar.add_trace(
                go.Bar(
                    x=stores_df["store_name"],
                    y=stores_df["revenue"],
                    name="Revenue ($)",
                    marker_color="#2563eb",
                )
            )
            fig_bar.add_trace(
                go.Bar(
                    x=stores_df["store_name"],
                    y=stores_df["profit"],
                    name="Gross Profit ($)",
                    marker_color="#15803d" if not IS_DARK else "#22c55e",
                )
            )
            fig_bar.update_layout(**PLOT_LAYOUT, barmode="group", height=320)
            fig_bar.update_layout(legend=dict(orientation="h", y=1.12, font=dict(color=chart_font_color)))
            st.plotly_chart(fig_bar, width="stretch", config={"displayModeBar": False})
        else:
            fig_cat = go.Figure()
            fig_cat.add_trace(
                go.Bar(
                    x=cats_df["product_category"],
                    y=cats_df["revenue"],
                    name="Revenue ($)",
                    marker_color="#2563eb",
                )
            )
            fig_cat.add_trace(
                go.Bar(
                    x=cats_df["product_category"],
                    y=cats_df["profit"],
                    name="Gross Profit ($)",
                    marker_color="#15803d" if not IS_DARK else "#22c55e",
                )
            )
            fig_cat.update_layout(**PLOT_LAYOUT, barmode="group", height=320)
            fig_cat.update_layout(legend=dict(orientation="h", y=1.12, font=dict(color=chart_font_color)))
            st.plotly_chart(fig_cat, width="stretch", config={"displayModeBar": False})
        st.markdown("</div>", unsafe_allow_html=True)

    with col_right:
        st.markdown(
            f"""
        <div class="chart-wrap">
            <div class="chart-title">Monthly Revenue & Profit Trajectory</div>
            <div class="chart-subtitle">Historical performance within {scope_label}</div>
        """,
            unsafe_allow_html=True,
        )
        if not trend_df.empty:
            fig_trend = go.Figure()
            fig_trend.add_trace(
                go.Scatter(
                    x=trend_df["order_month"],
                    y=trend_df["revenue"],
                    mode="lines+markers",
                    name="Revenue ($)",
                    line=dict(color="#2563eb", width=2.5),
                )
            )
            fig_trend.add_trace(
                go.Scatter(
                    x=trend_df["order_month"],
                    y=trend_df["profit"],
                    mode="lines+markers",
                    name="Gross Profit ($)",
                    line=dict(color="#15803d" if not IS_DARK else "#22c55e", width=2.5),
                )
            )
            fig_trend.update_layout(**PLOT_LAYOUT, height=320)
            fig_trend.update_layout(legend=dict(orientation="h", y=1.12, font=dict(color=chart_font_color)))
            st.plotly_chart(fig_trend, width="stretch", config={"displayModeBar": False})
        st.markdown("</div>", unsafe_allow_html=True)

    # Row 2: Order Status Breakdown + HTML Styled Table of Stores or Categories
    col_b1, col_b2 = st.columns([1.1, 1.9])

    with col_b1:
        st.markdown(
            """
        <div class="chart-wrap">
            <div class="chart-title">Order Fulfillment Status Distribution</div>
            <div class="chart-subtitle">Breakdown by item count (dp_sales_and_orders)</div>
        """,
            unsafe_allow_html=True,
        )
        if not status_df.empty:
            fig_pie = px.pie(
                status_df,
                names="order_status",
                values="item_count",
                hole=0.55,
                color_discrete_sequence=["#2563eb", "#15803d", "#d97706", "#dc2626", "#7c3aed"],
            )
            fig_pie.update_layout(**PLOT_LAYOUT, height=310, showlegend=True)
            fig_pie.update_traces(textfont=dict(color=chart_font_color, size=11))
            st.plotly_chart(fig_pie, width="stretch", config={"displayModeBar": False})
        st.markdown("</div>", unsafe_allow_html=True)

    with col_b2:
        st.markdown(
            f"""
        <div class="chart-wrap">
            <div class="chart-title">Governed Store Performance Breakdown ({scope_label})</div>
            <div class="chart-subtitle">Live row-level security filtered table from BigQuery</div>
        """,
            unsafe_allow_html=True,
        )
        rows_html = ""
        for _, r in stores_df.iterrows():
            ret_badge = (
                f"<span class='badge badge-green'>{r['return_rate_pct']:.1f}%</span>"
                if r["return_rate_pct"] <= 10.2
                else f"<span class='badge badge-amber'>{r['return_rate_pct']:.1f}%</span>"
            )
            rows_html += f"""
            <tr>
                <td class="mono">#{int(r['store_id'])}</td>
                <td><b>{r['store_name']}</b></td>
                <td><span class="badge badge-blue">{r['region_name']}</span></td>
                <td class="mono">{int(r['orders_count']):,}</td>
                <td class="mono">${r['revenue']:,.2f}</td>
                <td class="mono">${r['profit']:,.2f}</td>
                <td class="mono">{r['margin_pct']:.1f}%</td>
                <td>{ret_badge}</td>
            </tr>
            """
        st.markdown(
            f"""
        <table class="data-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Store Name</th>
                    <th>Region</th>
                    <th>Orders</th>
                    <th>Revenue</th>
                    <th>Gross Profit</th>
                    <th>Margin</th>
                    <th>Return Rate</th>
                </tr>
            </thead>
            <tbody>{rows_html}</tbody>
        </table>
        </div>
        """,
            unsafe_allow_html=True,
        )


# ==============================================================================
# TAB 3: DATA MESH CATALOG & CONTRACTS
# ==============================================================================
with tab_catalog:
    st.markdown("#### 🕸️ BigQuery Data Mesh Products & Governance Contracts")
    st.caption(
        "In a Data Mesh architecture, data is treated as a product with explicit schemas, SLAs, domain owners, and automated policy enforcement points."
    )

    cat_rows = ""
    for dp_id, meta in DATA_PRODUCTS.items():
        cat_rows += f"""
        <tr>
            <td class="mono"><b>{dp_id}</b></td>
            <td><span class="badge badge-blue">{meta['domain']}</span></td>
            <td>{meta['owner']}</td>
            <td><span class="badge badge-green">{meta['sla']}</span></td>
            <td>{meta['description']}</td>
            <td class="mono"><code>WHERE {rls_predicate}</code></td>
        </tr>
        """

    st.markdown(
        f"""
    <div class="chart-wrap">
        <table class="data-table">
            <thead>
                <tr>
                    <th>Data Product View</th>
                    <th>Domain</th>
                    <th>Domain Owner</th>
                    <th>Refresh SLA</th>
                    <th>Contract Description</th>
                    <th>Active Stakeholder RLS Filter</th>
                </tr>
            </thead>
            <tbody>{cat_rows}</tbody>
        </table>
    </div>
    """,
        unsafe_allow_html=True,
    )


# ==============================================================================
# TAB 4: GOVERNANCE AUDIT LOG
# ==============================================================================
with tab_audit:
    st.markdown("#### 🛡️ Real-Time Data Mesh Policy Enforcement & Security Audit Log")
    st.caption("Every query executed by the dashboard or conversational analytics agent is inspected, rewritten with Row-Level Security predicates, and logged.")

    if not POLICY_ENGINE.audit_log:
        st.info("No audit events logged yet. Interact with the dashboard or ask a question in chat.")
    else:
        audit_rows = ""
        for ev in POLICY_ENGINE.audit_log[:25]:
            badge_cls = (
                "badge-green"
                if ev.status == "ALLOWED"
                else ("badge-blue" if ev.status == "RLS_APPLIED" else "badge-red")
            )
            sql_snippet = (ev.sql_executed or "N/A").replace("<", "&lt;").replace(">", "&gt;")
            audit_rows += f"""
            <tr>
                <td class="mono">{ev.timestamp}</td>
                <td><b>{ev.persona_name}</b></td>
                <td><span class="badge {badge_cls}">{ev.status}</span></td>
                <td>{ev.action}</td>
                <td>{ev.governance_note}</td>
                <td class="mono" style="max-width: 340px; overflow-x: auto;"><code>{sql_snippet[:120]}...</code></td>
            </tr>
            """
        st.markdown(
            f"""
        <div class="chart-wrap">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Timestamp</th>
                        <th>Stakeholder Persona</th>
                        <th>Policy Action</th>
                        <th>Operation</th>
                        <th>Governance Enforcement Note</th>
                        <th>Rewritten SQL</th>
                    </tr>
                </thead>
                <tbody>{audit_rows}</tbody>
            </table>
        </div>
        """,
            unsafe_allow_html=True,
        )
