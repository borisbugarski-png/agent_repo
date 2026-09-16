"""Configuration settings for the Data Sharing Agent and BigQuery Data Mesh."""

import os
from dotenv import load_dotenv

load_dotenv()

GCP_PROJECT_ID = os.getenv("GCP_PROJECT_ID", "lustrous-stone-417013")
BQ_DATASET_ID = os.getenv("BQ_DATASET_ID", "ecommerce")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
GCP_LOCATION = os.getenv("GCP_LOCATION", "us-central1")

# Data Product Views in BigQuery
DATA_PRODUCTS = {
    "dp_store_region_governance": {
        "view_name": f"{GCP_PROJECT_ID}.{BQ_DATASET_ID}.dp_store_region_governance",
        "domain": "Governance & Organization Topology",
        "owner": "Enterprise Data Governance Office",
        "sla": "Real-time / Tier-1 Critical",
        "description": "Maps all 10 retail distribution centers (stores) to their assigned US geographic regions and data contracts.",
    },
    "dp_sales_and_orders": {
        "view_name": f"{GCP_PROJECT_ID}.{BQ_DATASET_ID}.dp_sales_and_orders",
        "domain": "Sales & Order Fulfillment",
        "owner": "Commercial Operations Domain Team",
        "sla": "Real-time / 99.9% Availability",
        "description": "Line-item sales revenue, product cost, gross margin, fulfillment timestamps, and order status scoped by store and region.",
    },
    "dp_inventory_health": {
        "view_name": f"{GCP_PROJECT_ID}.{BQ_DATASET_ID}.dp_inventory_health",
        "domain": "Inventory & Supply Chain",
        "owner": "Supply Chain & Logistics Domain Team",
        "sla": "Hourly Sync / Tier-1",
        "description": "Available stock units, sold units, inventory cost, retail valuation, and sell-through rates per store, region, and department.",
    },
    "dp_customer_segments": {
        "view_name": f"{GCP_PROJECT_ID}.{BQ_DATASET_ID}.dp_customer_segments",
        "domain": "Customer Analytics & Marketing",
        "owner": "Customer Experience Domain Team",
        "sla": "Daily Curated / GDPR & Privacy Compliant",
        "description": "Aggregated customer lifetime value, order frequency, age segments, and acquisition channels attributed to stores and regions.",
    },
}
