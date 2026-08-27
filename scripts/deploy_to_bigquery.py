"""
Deployment script to create BigQuery schema, seed dummy data, and create views
directly using the Google Cloud BigQuery Python Client.
"""

import sys
from pathlib import Path
from google.cloud import bigquery
from google.api_core.exceptions import GoogleAPICallError

PROJECT_ID = "lustrous-stone-417013"
LOCATION = "europe-west1"
DATASET_ID = "logistics_germany"


def deploy():
    print(f"🚀 Initializing BigQuery Client for project '{PROJECT_ID}' in location '{LOCATION}'...")
    try:
        client = bigquery.Client(project=PROJECT_ID, location=LOCATION)
    except Exception as e:
        print(f"❌ Failed to initialize BigQuery client: {e}")
        sys.exit(1)

    # Ensure dataset exists
    dataset_ref = bigquery.DatasetReference(PROJECT_ID, DATASET_ID)
    dataset = bigquery.Dataset(dataset_ref)
    dataset.location = LOCATION
    dataset.description = "Central Data Repository for German Logistics & Delivery Network"

    try:
        dataset = client.create_dataset(dataset, exists_ok=True)
        print(f"✅ Dataset '{PROJECT_ID}.{DATASET_ID}' confirmed/created in {LOCATION}.")
    except Exception as e:
        print(f"⚠️ Dataset creation note: {e}")

    sql_dir = Path(__file__).parent.parent / "sql"
    sql_files = [
        ("01_create_tables.sql", "Creating Tables DDL"),
        ("02_seed_dummy_data.sql", "Seeding Logistics Dummy Records (<100 records)"),
        ("03_analytical_views.sql", "Creating Analytical Views"),
    ]

    for filename, description in sql_files:
        filepath = sql_dir / filename
        print(f"\n📄 [{description}] Executing {filename}...")
        with open(filepath, "r", encoding="utf-8") as f:
            sql_content = f.read()

        # Split multiple statements if necessary or run as script
        # BigQuery query execution supports multiple statements in standard SQL
        try:
            job = client.query(sql_content, location=LOCATION)
            job.result()  # Wait for job completion
            print(f"✅ Successfully executed {filename} (Job ID: {job.job_id})")
        except GoogleAPICallError as e:
            print(f"❌ Error executing {filename}: {e}")
            return False
        except Exception as e:
            print(f"❌ Unexpected error executing {filename}: {e}")
            return False

    # Verify tables and row counts
    print("\n🔍 Verifying deployed tables and row counts in BigQuery:")
    tables = [
        "logistics_hubs",
        "historic_traffic_patterns",
        "scheduled_deliveries",
        "completed_deliveries",
    ]
    for table_name in tables:
        try:
            table = client.get_table(f"{PROJECT_ID}.{DATASET_ID}.{table_name}")
            print(f"  • Table `{DATASET_ID}.{table_name}`: {table.num_rows} rows")
        except Exception as e:
            print(f"  • Table `{DATASET_ID}.{table_name}` check: {e}")

    print("\n🎉 Option 2: Live BigQuery Deployment Complete!")
    return True


if __name__ == "__main__":
    deploy()
