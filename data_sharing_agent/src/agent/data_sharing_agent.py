"""Conversational Analytics Agent for Governed Data Sharing over BigQuery Data Products."""

import json
import os
import re
from typing import Any, Dict, List, Optional
from pydantic import BaseModel
from google import genai
from google.genai import types

from src.config import GCP_PROJECT_ID, BQ_DATASET_ID, GEMINI_MODEL, GCP_LOCATION, DATA_PRODUCTS
from src.governance.personas import StakeholderPersona, UserRole
from src.governance.policy_engine import POLICY_ENGINE
from src.repository.bigquery_client import BQ_REPO
from src.agent.tools import (
    build_stakeholder_briefing,
    format_df_as_markdown,
    get_persona_suggestions,
)


class AgentResponse(BaseModel):
    thoughts: List[str]
    content: str
    governed_sql: Optional[str] = None
    policy_status: str  # ALLOWED | RLS_APPLIED | CROSS_BOUNDARY_BLOCKED
    suggestions: List[str]


SYSTEM_INSTRUCTION_TEMPLATE = """You are the **Data Sharing Agent**, an enterprise Conversational Analytics AI built on a **Data Mesh & Data Products** architecture on Google Cloud BigQuery (`lustrous-stone-417013.ecommerce`).

Your active stakeholder user is:
- **Name & Title**: {full_name} ({title})
- **Stakeholder Role**: `{role}`
- **Governance Scope**: {scope_summary}
- **Mandatory SQL Row-Level Security Predicate**: `WHERE {rls_filter}`

### Available BigQuery Data Product Views in `{project_id}.{dataset_id}`:
1. `{project_id}.{dataset_id}.dp_sales_and_orders`
   Columns: `order_item_id`, `order_id`, `user_id`, `product_id`, `product_name`, `product_category`, `product_brand`, `product_department`, `product_sku`, `store_id`, `store_name`, `region_id`, `region_name`, `order_status`, `sale_price`, `product_cost`, `gross_profit`, `margin_pct`, `created_at_ts`, `order_date`, `order_month`
2. `{project_id}.{dataset_id}.dp_inventory_health`
   Columns: `store_id`, `store_name`, `region_id`, `region_name`, `product_department`, `product_category`, `product_brand`, `total_inventory_units`, `available_units`, `sold_units`, `available_inventory_cost`, `available_retail_value`, `sell_through_rate_pct`
3. `{project_id}.{dataset_id}.dp_customer_segments`
   Columns: `store_id`, `store_name`, `region_id`, `region_name`, `customer_id`, `gender`, `age`, `age_segment`, `traffic_source`, `customer_country`, `customer_state`, `total_orders`, `total_items_purchased`, `total_lifetime_spend`, `total_lifetime_profit`
4. `{project_id}.{dataset_id}.dp_store_region_governance`
   Columns: `store_id`, `store_name`, `region_id`, `region_name`, `latitude`, `longitude`, `domain_owner`, `data_contract_version`, `refresh_sla`

### Instructions:
- Always answer the user's analytical question accurately using data from BigQuery.
- Never expose or fabricate data outside the user's governance scope (`{rls_filter}`).
- Format numbers clearly (currency as `$X,XXX.XX`, percentages as `XX.X%`).
- Provide concise executive insights highlighting top performers, anomalies, or actionable recommendations.
"""


class DataSharingAgent:
    """Conversational Analytics Agent with strict Data Mesh Governance enforcement."""

    def __init__(self) -> None:
        self._genai_client: Optional[genai.Client] = None

    @property
    def genai_client(self) -> Optional[genai.Client]:
        if self._genai_client is None:
            try:
                api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
                if api_key:
                    self._genai_client = genai.Client(api_key=api_key)
                else:
                    self._genai_client = genai.Client(
                        vertexai=True,
                        project=GCP_PROJECT_ID,
                        location=GCP_LOCATION,
                    )
            except Exception:
                self._genai_client = None
        return self._genai_client

    def _generate_sql_via_gemini(self, persona: StakeholderPersona, user_query: str) -> Optional[str]:
        """Asks Gemini 2.5 Flash to generate a BigQuery SQL query against the Data Product views."""
        if not self.genai_client:
            return None
        rls_filter = POLICY_ENGINE.get_sql_filter(persona)
        prompt = f"""Generate a single read-only GoogleSQL SELECT query for BigQuery to answer the following user question:
Question: "{user_query}"

Rules:
1. Query ONLY from these views in `{GCP_PROJECT_ID}.{BQ_DATASET_ID}`:
   - `{GCP_PROJECT_ID}.{BQ_DATASET_ID}.dp_sales_and_orders`
   - `{GCP_PROJECT_ID}.{BQ_DATASET_ID}.dp_inventory_health`
   - `{GCP_PROJECT_ID}.{BQ_DATASET_ID}.dp_customer_segments`
   - `{GCP_PROJECT_ID}.{BQ_DATASET_ID}.dp_store_region_governance`
2. Include `WHERE {rls_filter}` (or incorporate `{rls_filter}` in your WHERE clause).
3. Limit results to at most 15 rows (`LIMIT 15`).
4. Return ONLY valid SQL inside a ```sql ... ``` block. Do not include any other text.
"""
        try:
            response = self.genai_client.models.generate_content(
                model=GEMINI_MODEL,
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=0.1,
                ),
            )
            text = response.text or ""
            match = re.search(r"```(?:sql)?\s*(SELECT[\s\S]+?)```", text, re.IGNORECASE)
            if match:
                return match.group(1).strip()
            if text.strip().upper().startswith("SELECT"):
                return text.strip()
        except Exception:
            return None
        return None

    def _fallback_sql_router(self, persona: StakeholderPersona, user_query: str) -> str:
        """Deterministic SQL generator mapping natural language intents to governed Data Product queries."""
        q = user_query.lower()
        base_table = f"`{GCP_PROJECT_ID}.{BQ_DATASET_ID}.dp_sales_and_orders`"
        inv_table = f"`{GCP_PROJECT_ID}.{BQ_DATASET_ID}.dp_inventory_health`"
        cust_table = f"`{GCP_PROJECT_ID}.{BQ_DATASET_ID}.dp_customer_segments`"

        if any(w in q for w in ["inventory", "stock", "sell-through", "sell through", "turnover", "available", "supply"]):
            return f"""
            SELECT
                store_name,
                region_name,
                product_department,
                SUM(available_units) AS available_units,
                SUM(sold_units) AS sold_units,
                ROUND(SUM(available_retail_value), 2) AS retail_value_usd,
                ROUND(SAFE_DIVIDE(SUM(sold_units), SUM(total_inventory_units)) * 100, 2) AS sell_through_pct
            FROM {inv_table}
            GROUP BY store_name, region_name, product_department
            ORDER BY retail_value_usd DESC
            LIMIT 12
            """

        if any(w in q for w in ["customer", "age", "demographic", "traffic", "acquisition", "gender", "segment"]):
            return f"""
            SELECT
                age_segment,
                traffic_source,
                COUNT(DISTINCT customer_id) AS customers,
                SUM(total_orders) AS total_orders,
                ROUND(SUM(total_lifetime_spend), 2) AS total_revenue,
                ROUND(SAFE_DIVIDE(SUM(total_lifetime_spend), COUNT(DISTINCT customer_id)), 2) AS avg_ltv_usd
            FROM {cust_table}
            GROUP BY age_segment, traffic_source
            ORDER BY total_revenue DESC
            LIMIT 12
            """

        if any(w in q for w in ["month", "trend", "time", "history", "growth", "year"]):
            return f"""
            SELECT
                order_month,
                COUNT(DISTINCT order_id) AS orders,
                COUNT(order_item_id) AS items_sold,
                ROUND(SUM(sale_price), 2) AS revenue,
                ROUND(SUM(gross_profit), 2) AS gross_profit,
                ROUND(SAFE_DIVIDE(SUM(gross_profit), SUM(sale_price)) * 100, 2) AS margin_pct
            FROM {base_table}
            WHERE order_month IS NOT NULL
            GROUP BY order_month
            ORDER BY order_month DESC
            LIMIT 12
            """

        if any(w in q for w in ["brand", "brands"]):
            return f"""
            SELECT
                product_brand,
                product_department,
                COUNT(order_item_id) AS units_sold,
                ROUND(SUM(sale_price), 2) AS revenue,
                ROUND(SUM(gross_profit), 2) AS gross_profit,
                ROUND(SAFE_DIVIDE(SUM(gross_profit), SUM(sale_price)) * 100, 2) AS margin_pct
            FROM {base_table}
            GROUP BY product_brand, product_department
            ORDER BY gross_profit DESC
            LIMIT 10
            """

        if any(w in q for w in ["region", "regions"]) and persona.role == UserRole.ADMIN:
            return f"""
            SELECT
                region_id,
                region_name,
                COUNT(DISTINCT store_id) AS stores_count,
                COUNT(DISTINCT order_id) AS total_orders,
                ROUND(SUM(sale_price), 2) AS revenue,
                ROUND(SUM(gross_profit), 2) AS gross_profit,
                ROUND(SAFE_DIVIDE(SUM(gross_profit), SUM(sale_price)) * 100, 2) AS margin_pct,
                ROUND(SAFE_DIVIDE(COUNTIF(order_status = 'Returned'), COUNT(order_item_id)) * 100, 2) AS return_rate_pct
            FROM {base_table}
            GROUP BY region_id, region_name
            ORDER BY revenue DESC
            """

        if any(w in q for w in ["status", "return", "returned", "cancelled", "shipped", "delivery"]):
            return f"""
            SELECT
                store_name,
                order_status,
                COUNT(order_item_id) AS item_count,
                ROUND(SUM(sale_price), 2) AS total_revenue,
                ROUND(SUM(gross_profit), 2) AS gross_profit
            FROM {base_table}
            GROUP BY store_name, order_status
            ORDER BY total_revenue DESC
            LIMIT 12
            """

        if any(w in q for w in ["store", "stores", "compare", "ranking", "center"]) and persona.role != UserRole.STORE_MANAGER:
            return f"""
            SELECT
                store_id,
                store_name,
                region_name,
                COUNT(DISTINCT order_id) AS orders_count,
                ROUND(SUM(sale_price), 2) AS revenue,
                ROUND(SUM(gross_profit), 2) AS gross_profit,
                ROUND(SAFE_DIVIDE(SUM(gross_profit), SUM(sale_price)) * 100, 2) AS margin_pct,
                ROUND(SAFE_DIVIDE(COUNTIF(order_status = 'Returned'), COUNT(order_item_id)) * 100, 2) AS return_rate_pct
            FROM {base_table}
            GROUP BY store_id, store_name, region_name
            ORDER BY revenue DESC
            LIMIT 10
            """

        # Default: Top Product Categories in Authorized Scope
        return f"""
        SELECT
            product_category,
            product_department,
            COUNT(order_item_id) AS units_sold,
            ROUND(SUM(sale_price), 2) AS revenue,
            ROUND(SUM(gross_profit), 2) AS gross_profit,
            ROUND(SAFE_DIVIDE(SUM(gross_profit), SUM(sale_price)) * 100, 2) AS margin_pct
        FROM {base_table}
        GROUP BY product_category, product_department
        ORDER BY revenue DESC
        LIMIT 10
        """

    def _synthesize_answer_with_gemini(
        self,
        persona: StakeholderPersona,
        user_query: str,
        df_markdown: str,
        governed_sql: str,
    ) -> Optional[str]:
        """Uses Gemini 2.5 Flash to synthesize a rich analytical narrative from the BigQuery table."""
        if not self.genai_client:
            return None
        sys_inst = SYSTEM_INSTRUCTION_TEMPLATE.format(
            full_name=persona.full_name,
            title=persona.title,
            role=persona.role.value,
            scope_summary=persona.governance_scope_summary,
            rls_filter=POLICY_ENGINE.get_sql_filter(persona),
            project_id=GCP_PROJECT_ID,
            dataset_id=BQ_DATASET_ID,
        )
        prompt = f"""User Question: "{user_query}"

Governed BigQuery Results (Scoped to `{POLICY_ENGINE.get_scope_label(persona)}`):
{df_markdown}

Please provide a clear, executive-ready response:
1. Directly answer the user's question with key numbers highlighted in bold.
2. Include the Markdown table of results.
3. Provide 2-3 bullet points of actionable business & Data Mesh insights based on these numbers.
4. Explicitly mention the active Data Mesh governance scope ({POLICY_ENGINE.get_scope_label(persona)}) that was enforced.
"""
        try:
            response = self.genai_client.models.generate_content(
                model=GEMINI_MODEL,
                contents=prompt,
                config=types.GenerateContentConfig(
                    system_instruction=sys_inst,
                    temperature=0.2,
                ),
            )
            return response.text
        except Exception:
            return None

    def answer_question(
        self,
        persona: StakeholderPersona,
        user_query: str,
    ) -> AgentResponse:
        """Executes governed conversational analytics for the given stakeholder persona."""
        thoughts: List[str] = []
        scope_label = POLICY_ENGINE.get_scope_label(persona)
        rls_filter = POLICY_ENGINE.get_sql_filter(persona)

        thoughts.append(f"Authenticating stakeholder persona: {persona.full_name} ({persona.role.value})")
        thoughts.append(f"Active Data Mesh Governance Scope: {scope_label}")

        # Step 1: Check for cross-boundary policy violation
        is_violation, violation_reason = POLICY_ENGINE.check_query_for_cross_boundary_violation(
            persona, user_query
        )
        if is_violation:
            thoughts.append(f"⚠️ Policy Enforcement Block: {violation_reason}")
            thoughts.append(f"Fetching authorized baseline metrics for {scope_label} instead.")
            kpi = BQ_REPO.get_kpi_summary(persona)
            cats_df = BQ_REPO.get_category_performance(persona, limit=5)
            tbl_md = format_df_as_markdown(cats_df, max_rows=5)

            content = (
                f"### 🛡️ Data Mesh Governance Policy Enforcement\n\n"
                f"> **[!CAUTION] Cross-Boundary Access Restricted**  \n"
                f"> {violation_reason}\n\n"
                f"Under the **Enterprise Data Mesh Sharing Contract**, your active role (`{persona.role.value}`) "
                f"enforces row-level security predicate `WHERE {rls_filter}`.\n\n"
                f"---\n"
                f"#### 📊 Authorized Insights for Your Scope ({scope_label})\n"
                f"- **Authorized Revenue**: **${kpi['total_revenue']:,.2f}** ({kpi['total_orders']:,} orders)\n"
                f"- **Authorized Gross Profit**: **${kpi['total_profit']:,.2f}** (**{kpi['gross_margin_pct']:.2f}%** margin)\n\n"
                f"**Top Product Categories in {scope_label}**:\n\n"
                f"{tbl_md}\n\n"
                f"*Tip: To inspect data outside {scope_label}, switch your Stakeholder Persona in the sidebar/CLI to a Regional Manager or Global Admin.*"
            )
            return AgentResponse(
                thoughts=thoughts,
                content=content,
                governed_sql=f"-- BLOCKED CROSS-BOUNDARY REQUEST\n-- Fallback Authorized Query:\nSELECT * FROM `dp_sales_and_orders` WHERE {rls_filter} LIMIT 5;",
                policy_status="CROSS_BOUNDARY_BLOCKED",
                suggestions=get_persona_suggestions(persona),
            )

        # Step 2: Check if user asked for a general briefing or contract inspection
        if any(w in user_query.lower() for w in ["briefing", "snapshot", "overview", "summary report"]):
            thoughts.append("Intent matched: Executive Stakeholder Briefing.")
            briefing = build_stakeholder_briefing(persona)
            return AgentResponse(
                thoughts=thoughts,
                content=briefing["markdown"],
                governed_sql=f"SELECT * FROM `{GCP_PROJECT_ID}.{BQ_DATASET_ID}.dp_sales_and_orders` WHERE {rls_filter}",
                policy_status="ALLOWED" if persona.role == UserRole.ADMIN else "RLS_APPLIED",
                suggestions=get_persona_suggestions(persona),
            )

        if any(w in user_query.lower() for w in ["contract", "data mesh", "schema", "catalog", "sla"]):
            thoughts.append("Intent matched: Data Mesh Catalog & Contracts Inspection.")
            lines = [
                f"### 🕸️ Enterprise Data Mesh Catalog & Active Governance Contracts",
                f"**Active Stakeholder**: `{persona.full_name}` (`{persona.role.value}`)  ",
                f"**Enforced Row-Level Security Filter**: `WHERE {rls_filter}`\n",
                "| Data Product ID | Domain | Owner | Refresh SLA | Description |",
                "| --- | --- | --- | --- | --- |",
            ]
            for dp_id, meta in DATA_PRODUCTS.items():
                lines.append(
                    f"| `{dp_id}` | {meta['domain']} | {meta['owner']} | {meta['sla']} | {meta['description']} |"
                )
            return AgentResponse(
                thoughts=thoughts,
                content="\n".join(lines),
                governed_sql=f"SELECT * FROM `{GCP_PROJECT_ID}.{BQ_DATASET_ID}.dp_store_region_governance` WHERE {rls_filter}",
                policy_status="ALLOWED" if persona.role == UserRole.ADMIN else "RLS_APPLIED",
                suggestions=get_persona_suggestions(persona),
            )

        # Step 3: Generate SQL via Gemini or fallback router
        thoughts.append("Generating BigQuery SQL query over Data Mesh views...")
        candidate_sql = self._generate_sql_via_gemini(persona, user_query)
        if not candidate_sql:
            candidate_sql = self._fallback_sql_router(persona, user_query)
            thoughts.append("Selected governed analytical query template.")
        else:
            thoughts.append("Generated SQL query via Gemini 2.5 Flash.")

        # Step 4: Execute query with Policy Engine RLS rewriting
        thoughts.append(f"Injecting Row-Level Security filter (`WHERE {rls_filter}`) via GovernancePolicyEngine...")
        try:
            df = BQ_REPO.execute_custom_sql(persona, candidate_sql, description=f"Chat Query: {user_query[:60]}")
            governed_sql = POLICY_ENGINE.audit_log[0].sql_executed if POLICY_ENGINE.audit_log else candidate_sql
            thoughts.append(f"Executed BigQuery job (labeled `datacloud:jetski`). Returned {len(df)} rows.")
        except Exception as exc:
            thoughts.append(f"Primary query encountered error ({exc}). Falling back to governed category query.")
            fallback_sql = self._fallback_sql_router(persona, user_query)
            df = BQ_REPO.execute_custom_sql(persona, fallback_sql, description=f"Fallback Chat Query: {user_query[:60]}")
            governed_sql = POLICY_ENGINE.audit_log[0].sql_executed if POLICY_ENGINE.audit_log else fallback_sql

        df_md = format_df_as_markdown(df, max_rows=12)

        # Step 5: Synthesize final response
        thoughts.append("Synthesizing executive insights...")
        synthesized = self._synthesize_answer_with_gemini(persona, user_query, df_md, governed_sql or candidate_sql)
        if not synthesized:
            kpi = BQ_REPO.get_kpi_summary(persona)
            synthesized = (
                f"### 📈 Governed Analytics Insights ({scope_label})\n\n"
                f"**Active Governance Policy**: `{persona.role.value}` (`WHERE {rls_filter}`)\n\n"
                f"Here are the BigQuery Data Mesh results for your query **\"{user_query}\"**:\n\n"
                f"{df_md}\n\n"
                f"#### 💡 Key Analytical Takeaways\n"
                f"- **Scope Context**: Your view is governed under `{scope_label}` representing **${kpi['total_revenue']:,.2f}** in total revenue and **${kpi['total_profit']:,.2f}** in gross profit (**{kpi['gross_margin_pct']:.2f}%** margin).\n"
                f"- **Data Product Lineage**: Sourced live from BigQuery Data Mesh (`lustrous-stone-417013.ecommerce`) with automatic row-level security filtering."
            )

        status = "ALLOWED" if persona.role == UserRole.ADMIN else "RLS_APPLIED"
        return AgentResponse(
            thoughts=thoughts,
            content=synthesized,
            governed_sql=governed_sql,
            policy_status=status,
            suggestions=get_persona_suggestions(persona),
        )


# Singleton agent instance
DATA_SHARING_AGENT = DataSharingAgent()
