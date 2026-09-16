"""Tools for querying BigQuery Data Products with automatic Data Mesh Governance."""

from typing import Dict, Any, List
import pandas as pd

from src.config import DATA_PRODUCTS, GCP_PROJECT_ID, BQ_DATASET_ID
from src.governance.personas import StakeholderPersona, UserRole
from src.governance.policy_engine import POLICY_ENGINE
from src.repository.bigquery_client import BQ_REPO


def format_df_as_markdown(df: pd.DataFrame, max_rows: int = 12) -> str:
    """Formats a pandas DataFrame into clean GitHub-style Markdown table."""
    if df.empty:
        return "_No records found within your authorized Data Mesh scope._"
    sub = df.head(max_rows).copy()
    # Format floats nicely
    for col in sub.columns:
        if pd.api.types.is_float_dtype(sub[col]):
            if "pct" in col or "rate" in col or "margin" in col:
                sub[col] = sub[col].map(lambda x: f"{x:,.2f}%" if pd.notnull(x) else "-")
            elif "price" in col or "revenue" in col or "profit" in col or "cost" in col or "spend" in col or "usd" in col:
                sub[col] = sub[col].map(lambda x: f"${x:,.2f}" if pd.notnull(x) else "-")
            else:
                sub[col] = sub[col].map(lambda x: f"{x:,.2f}" if pd.notnull(x) else "-")
        elif pd.api.types.is_integer_dtype(sub[col]):
            if "id" not in col.lower():
                sub[col] = sub[col].map(lambda x: f"{x:,}" if pd.notnull(x) else "-")
    headers = list(sub.columns)
    lines = [
        "| " + " | ".join(str(h) for h in headers) + " |",
        "| " + " | ".join("---" for _ in headers) + " |",
    ]
    for _, row in sub.iterrows():
        lines.append("| " + " | ".join(str(row[h]) for h in headers) + " |")
    if len(df) > max_rows:
        lines.append(f"\n*Showing top {max_rows} of {len(df)} rows.*")
    return "\n".join(lines)


def build_stakeholder_briefing(persona: StakeholderPersona) -> Dict[str, Any]:
    """Generates a live Data Mesh Executive Briefing tailored to the active stakeholder persona."""
    kpi = BQ_REPO.get_kpi_summary(persona)
    stores_df = BQ_REPO.get_store_performance(persona)
    cats_df = BQ_REPO.get_category_performance(persona, limit=5)
    inv_df = BQ_REPO.get_inventory_summary(persona)

    scope_badge = POLICY_ENGINE.get_scope_label(persona)
    rls_predicate = POLICY_ENGINE.get_sql_filter(persona)

    available_retail_total = inv_df["available_retail_usd"].sum() if not inv_df.empty else 0.0
    avg_sell_through = inv_df["sell_through_pct"].mean() if not inv_df.empty else 0.0

    lines = [
        f"### 🛡️ Data Mesh Stakeholder Briefing — {persona.title}",
        f"**Active Governance Policy**: `{scope_badge}`  ",
        f"**Enforced BigQuery RLS Filter**: `WHERE {rls_predicate}`",
        "",
        "#### 📊 Authorized Scope Key Performance Indicators",
        f"- **Total Sales Revenue**: **${kpi['total_revenue']:,.2f}** across **{kpi['total_orders']:,}** orders ({kpi['total_items']:,} items)",
        f"- **Gross Profit & Margin**: **${kpi['total_profit']:,.2f}** (**{kpi['gross_margin_pct']:.2f}%** gross margin)",
        f"- **Order Return Rate**: **{kpi['return_rate_pct']:.2f}%**",
        f"- **Available Inventory Valuation**: **${available_retail_total:,.2f}** retail value (**{avg_sell_through:.1f}%** sell-through rate)",
        "",
    ]

    if persona.role == UserRole.STORE_MANAGER:
        lines.append(f"#### 🏪 Store #{persona.assigned_store_id} ({persona.assigned_store_name}) Top Product Categories")
        lines.append(format_df_as_markdown(cats_df, max_rows=5))
    elif persona.role == UserRole.REGIONAL_MANAGER:
        lines.append(f"#### 🗺️ Store Performance Comparison in {persona.assigned_region_name}")
        lines.append(format_df_as_markdown(stores_df[["store_id", "store_name", "orders_count", "revenue", "profit", "margin_pct", "return_rate_pct"]], max_rows=10))
        lines.append("")
        lines.append(f"#### 🏆 Top Selling Product Categories in {persona.assigned_region_name}")
        lines.append(format_df_as_markdown(cats_df, max_rows=5))
    else:
        lines.append("#### 🌐 Global Enterprise Store Ranking (All 10 Stores Across 5 US Regions)")
        lines.append(format_df_as_markdown(stores_df[["store_id", "store_name", "region_name", "revenue", "profit", "margin_pct", "return_rate_pct"]], max_rows=10))
        lines.append("")
        lines.append("#### 🏆 Top Enterprise Product Categories")
        lines.append(format_df_as_markdown(cats_df, max_rows=5))

    return {
        "markdown": "\n".join(lines),
        "kpi": kpi,
        "stores_df": stores_df,
        "cats_df": cats_df,
    }


def get_persona_suggestions(persona: StakeholderPersona) -> List[str]:
    """Returns 3 tailored follow-up natural language questions for the active persona."""
    if persona.role == UserRole.STORE_MANAGER:
        return [
            f"What are the top 5 most profitable brands in {persona.assigned_store_name}?",
            f"Show monthly sales revenue and profit trends for Store #{persona.assigned_store_id}.",
            f"What is our inventory sell-through rate by department in {persona.assigned_store_name}?",
        ]
    if persona.role == UserRole.REGIONAL_MANAGER:
        return [
            f"Compare revenue and return rates across all stores in {persona.assigned_region_name}.",
            f"Which customer age segments spend the most in {persona.assigned_region_name}?",
            f"Show top product categories and inventory health across {persona.assigned_region_name}.",
        ]
    return [
        "Compare total sales revenue, profit margin, and return rates across all 5 US Regions.",
        "Which 5 stores have the highest gross profit margin and fastest inventory turnover?",
        "Show customer acquisition traffic sources and lifetime value across the enterprise.",
    ]
