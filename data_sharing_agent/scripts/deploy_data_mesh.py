"""Script to deploy and verify BigQuery Data Mesh Data Product views."""

import os
import sys
from pathlib import Path
from google.cloud import bigquery

PROJECT_ID = os.getenv("GCP_PROJECT_ID", "lustrous-stone-417013")
DATASET_ID = os.getenv("BQ_DATASET_ID", "ecommerce")
SQL_PATH = Path(__file__).resolve().parent.parent / "sql" / "01_data_mesh_views.sql"


def deploy_data_mesh() -> None:
    print(f"Deploying Data Mesh Data Products to `{PROJECT_ID}.{DATASET_ID}`...")
    client = bigquery.Client(project=PROJECT_ID)
    sql_script = SQL_PATH.read_text(encoding="utf-8")

    # Split statements by semicolon and execute each DDL statement
    statements = [s.strip() for s in sql_script.split(";") if s.strip()]
    for idx, stmt in enumerate(statements, 1):
        job_config = bigquery.QueryJobConfig(
            labels={"datacloud": "jetski"}
        )
        print(f"Executing statement {idx}/{len(statements)}...")
        query_job = client.query(stmt, job_config=job_config)
        query_job.result()
        print(f"  ✓ Statement {idx} completed.")

    # Verify views
    views = [
        "dp_store_region_governance",
        "dp_sales_and_orders",
        "dp_inventory_health",
        "dp_customer_segments",
    ]
    print("\nVerifying Data Product views:")
    for view in views:
        table_ref = f"{PROJECT_ID}.{DATASET_ID}.{view}"
        query = f"SELECT COUNT(*) as cnt FROM `{table_ref}`"
        job = client.query(query, job_config=bigquery.QueryJobConfig(labels={"datacloud": "jetski"}))
        row = list(job.result())[0]
        print(f"  • {view}: {row.cnt:,} rows available")


if __name__ == "__main__":
    try:
        deploy_data_mesh()
        print("\nAll Data Mesh Data Products deployed and verified successfully!")
    except Exception as exc:
        print(f"Error deploying Data Mesh views: {exc}", file=sys.stderr)
        sys.exit(1)
