"""Governed BigQuery Repository enforcing Data Mesh Row-Level Security & Attribution."""

from typing import Any, Dict, List, Optional
import pandas as pd
from google.cloud import bigquery

from src.config import GCP_PROJECT_ID, BQ_DATASET_ID
from src.governance.personas import StakeholderPersona
from src.governance.policy_engine import POLICY_ENGINE


class GovernedBigQueryRepository:
    """Executes BigQuery queries with mandatory Data Mesh RLS policies and attribution labels."""

    def __init__(self, project_id: str = GCP_PROJECT_ID) -> None:
        self.project_id = project_id
        self.dataset_id = BQ_DATASET_ID
        self._client: Optional[bigquery.Client] = None

    @property
    def client(self) -> bigquery.Client:
        if self._client is None:
            self._client = bigquery.Client(project=self.project_id)
        return self._client

    def _run_governed_query(
        self,
        persona: StakeholderPersona,
        raw_sql: str,
        action_description: str,
    ) -> pd.DataFrame:
        """Rewrites SQL with persona's RLS filter, tags with datacloud:jetski, and returns DataFrame."""
        governed_sql = POLICY_ENGINE.validate_and_rewrite_sql(
            persona=persona,
            sql_query=raw_sql,
            action_description=action_description,
        )
        job_config = bigquery.QueryJobConfig(
            labels={"datacloud": "jetski"}
        )
        query_job = self.client.query(governed_sql, job_config=job_config)
        return query_job.to_dataframe()

    def get_kpi_summary(self, persona: StakeholderPersona) -> Dict[str, Any]:
        """Fetches high-level KPI metrics scoped to the active stakeholder."""
        sql = f"""
        SELECT
            COUNT(DISTINCT store_id) AS active_stores,
            COUNT(DISTINCT region_id) AS active_regions,
            COUNT(DISTINCT order_id) AS total_orders,
            COUNT(order_item_id) AS total_items,
            ROUND(COALESCE(SUM(sale_price), 0), 2) AS total_revenue,
            ROUND(COALESCE(SUM(gross_profit), 0), 2) AS total_profit,
            ROUND(SAFE_DIVIDE(SUM(gross_profit), SUM(sale_price)) * 100, 2) AS gross_margin_pct,
            ROUND(SAFE_DIVIDE(COUNTIF(order_status = 'Returned'), COUNT(order_item_id)) * 100, 2) AS return_rate_pct
        FROM `{self.project_id}.{self.dataset_id}.dp_sales_and_orders`
        """
        df = self._run_governed_query(persona, sql, "KPI Summary Snapshot")
        if df.empty:
            return {
                "active_stores": 0,
                "active_regions": 0,
                "total_orders": 0,
                "total_items": 0,
                "total_revenue": 0.0,
                "total_profit": 0.0,
                "gross_margin_pct": 0.0,
                "return_rate_pct": 0.0,
            }
        row = df.iloc[0]
        return {
            "active_stores": int(row["active_stores"] or 0),
            "active_regions": int(row["active_regions"] or 0),
            "total_orders": int(row["total_orders"] or 0),
            "total_items": int(row["total_items"] or 0),
            "total_revenue": float(row["total_revenue"] or 0.0),
            "total_profit": float(row["total_profit"] or 0.0),
            "gross_margin_pct": float(row["gross_margin_pct"] or 0.0),
            "return_rate_pct": float(row["return_rate_pct"] or 0.0),
        }

    def get_store_performance(self, persona: StakeholderPersona) -> pd.DataFrame:
        """Returns store-level sales, profit, margin, and return rate within authorized scope."""
        sql = f"""
        SELECT
            store_id,
            store_name,
            region_name,
            COUNT(DISTINCT order_id) AS orders_count,
            COUNT(order_item_id) AS items_sold,
            ROUND(SUM(sale_price), 2) AS revenue,
            ROUND(SUM(gross_profit), 2) AS profit,
            ROUND(SAFE_DIVIDE(SUM(gross_profit), SUM(sale_price)) * 100, 2) AS margin_pct,
            ROUND(SAFE_DIVIDE(COUNTIF(order_status = 'Returned'), COUNT(order_item_id)) * 100, 2) AS return_rate_pct
        FROM `{self.project_id}.{self.dataset_id}.dp_sales_and_orders`
        GROUP BY store_id, store_name, region_name
        ORDER BY revenue DESC
        """
        return self._run_governed_query(persona, sql, "Store Performance Comparison")

    def get_category_performance(self, persona: StakeholderPersona, limit: int = 10) -> pd.DataFrame:
        """Returns top product categories by revenue and gross profit."""
        sql = f"""
        SELECT
            product_category,
            product_department,
            COUNT(order_item_id) AS units_sold,
            ROUND(SUM(sale_price), 2) AS revenue,
            ROUND(SUM(gross_profit), 2) AS profit,
            ROUND(SAFE_DIVIDE(SUM(gross_profit), SUM(sale_price)) * 100, 2) AS margin_pct
        FROM `{self.project_id}.{self.dataset_id}.dp_sales_and_orders`
        GROUP BY product_category, product_department
        ORDER BY revenue DESC
        LIMIT {int(limit)}
        """
        return self._run_governed_query(persona, sql, f"Top {limit} Product Categories")

    def get_monthly_sales_trend(self, persona: StakeholderPersona, months: int = 24) -> pd.DataFrame:
        """Returns monthly revenue and profit trend."""
        sql = f"""
        SELECT
            order_month,
            COUNT(order_item_id) AS items_sold,
            ROUND(SUM(sale_price), 2) AS revenue,
            ROUND(SUM(gross_profit), 2) AS profit
        FROM `{self.project_id}.{self.dataset_id}.dp_sales_and_orders`
        WHERE order_month IS NOT NULL
        GROUP BY order_month
        ORDER BY order_month DESC
        LIMIT {int(months)}
        """
        df = self._run_governed_query(persona, sql, "Monthly Revenue & Profit Trend")
        return df.sort_values("order_month", ascending=True).reset_index(drop=True)

    def get_order_status_breakdown(self, persona: StakeholderPersona) -> pd.DataFrame:
        """Returns breakdown of order statuses (Complete, Shipped, Processing, Returned, Cancelled)."""
        sql = f"""
        SELECT
            order_status,
            COUNT(order_item_id) AS item_count,
            ROUND(SUM(sale_price), 2) AS total_value
        FROM `{self.project_id}.{self.dataset_id}.dp_sales_and_orders`
        GROUP BY order_status
        ORDER BY item_count DESC
        """
        return self._run_governed_query(persona, sql, "Order Fulfillment Status Breakdown")

    def get_inventory_summary(self, persona: StakeholderPersona) -> pd.DataFrame:
        """Returns inventory health metrics from dp_inventory_health."""
        sql = f"""
        SELECT
            store_id,
            store_name,
            region_name,
            product_department,
            SUM(total_inventory_units) AS total_units,
            SUM(available_units) AS available_units,
            SUM(sold_units) AS sold_units,
            ROUND(SUM(available_inventory_cost), 2) AS available_cost_usd,
            ROUND(SUM(available_retail_value), 2) AS available_retail_usd,
            ROUND(SAFE_DIVIDE(SUM(sold_units), SUM(total_inventory_units)) * 100, 2) AS sell_through_pct
        FROM `{self.project_id}.{self.dataset_id}.dp_inventory_health`
        GROUP BY store_id, store_name, region_name, product_department
        ORDER BY available_retail_usd DESC
        """
        return self._run_governed_query(persona, sql, "Inventory Health & Valuation Summary")

    def get_customer_demographics(self, persona: StakeholderPersona) -> pd.DataFrame:
        """Returns customer age segments and acquisition traffic source performance."""
        sql = f"""
        SELECT
            age_segment,
            traffic_source,
            COUNT(DISTINCT customer_id) AS customer_count,
            SUM(total_orders) AS total_orders,
            ROUND(SUM(total_lifetime_spend), 2) AS total_revenue,
            ROUND(SAFE_DIVIDE(SUM(total_lifetime_spend), COUNT(DISTINCT customer_id)), 2) AS avg_spend_per_customer
        FROM `{self.project_id}.{self.dataset_id}.dp_customer_segments`
        GROUP BY age_segment, traffic_source
        ORDER BY total_revenue DESC
        """
        return self._run_governed_query(persona, sql, "Customer Demographics & Acquisition Analysis")

    def execute_custom_sql(
        self, persona: StakeholderPersona, sql_query: str, description: str = "Custom Analytics Query"
    ) -> pd.DataFrame:
        """Executes an arbitrary read-only SQL query with mandatory RLS policy rewriting."""
        return self._run_governed_query(persona, sql_query, description)


# Shared repository singleton
BQ_REPO = GovernedBigQueryRepository()
