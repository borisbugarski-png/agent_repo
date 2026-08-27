"""
BigQuery Data Repository for German Logistics Network.
Provides dual-mode access: Live BigQuery Client via google-cloud-bigquery
with intelligent fallback to the local seed dataset for zero-friction standalone testing.
"""

import json
import logging
from pathlib import Path
from typing import List, Optional, Dict

from src.config import config
from src.agent.schemas import (
    LogisticsHub,
    ScheduledDelivery,
    CompletedDelivery,
    HistoricTrafficPattern,
    PackagePriority,
    DeliveryStatus,
)

logger = logging.getLogger(__name__)


class BigQueryLogisticsRepository:
    """
    Central repository for logistics, delivery schedules, and historical transit data.
    """

    def __init__(self, project_id: Optional[str] = None, dataset_id: Optional[str] = None):
        self.project_id = project_id or config.GCP_PROJECT_ID
        self.dataset_id = dataset_id or config.BIGQUERY_DATASET
        self.location = config.BIGQUERY_LOCATION
        self.bq_client = None
        self.use_live_bq = False
        self._local_data: Dict[str, List] = {}

        self._initialize_client()

    def _initialize_client(self):
        """Attempts to initialize Google Cloud BigQuery client."""
        try:
            from google.cloud import bigquery
            self.bq_client = bigquery.Client(project=self.project_id, location=self.location)
            # Verify if dataset/project accessible
            # We will use live BigQuery if configured explicitly or if queries succeed
            if config.DATA_SOURCE_MODE == "bigquery":
                self.use_live_bq = True
                logger.info(f"Connected to live BigQuery project {self.project_id}.{self.dataset_id}")
            else:
                self._load_local_seed_data()
        except Exception as e:
            logger.info(f"BigQuery live client initialized with local cache fallback: {e}")
            self._load_local_seed_data()

    def _load_local_seed_data(self):
        """Loads embedded seed data from data/seed_data.json."""
        seed_path = Path(__file__).parent.parent / "data" / "seed_data.json"
        if seed_path.exists():
            with open(seed_path, "r", encoding="utf-8") as f:
                self._local_data = json.load(f)
        else:
            self._local_data = {
                "logistics_hubs": [],
                "historic_traffic_patterns": [],
                "scheduled_deliveries": []
            }

    def get_logistics_hubs(self) -> List[LogisticsHub]:
        """Fetch all German distribution hubs."""
        if self.use_live_bq and self.bq_client:
            query = f"SELECT * FROM `{self.project_id}.{self.dataset_id}.logistics_hubs`"
            try:
                rows = self.bq_client.query(query).result()
                return [LogisticsHub(**dict(row)) for row in rows]
            except Exception as e:
                logger.warning(f"BigQuery query failed, using local cache: {e}")

        hubs_raw = self._local_data.get("logistics_hubs", [])
        return [LogisticsHub(**h) for h in hubs_raw]

    def get_historic_traffic_patterns(self) -> List[HistoricTrafficPattern]:
        """Fetch historical Autobahn traffic patterns."""
        if self.use_live_bq and self.bq_client:
            query = f"SELECT * FROM `{self.project_id}.{self.dataset_id}.historic_traffic_patterns`"
            try:
                rows = self.bq_client.query(query).result()
                return [HistoricTrafficPattern(**dict(row)) for row in rows]
            except Exception as e:
                logger.warning(f"BigQuery query failed, using local cache: {e}")

        patterns_raw = self._local_data.get("historic_traffic_patterns", [])
        return [HistoricTrafficPattern(**p) for p in patterns_raw]

    def get_scheduled_deliveries(
        self,
        status: Optional[str] = None,
        corridor: Optional[str] = None,
        priority: Optional[str] = None,
        origin_city: Optional[str] = None,
        destination_city: Optional[str] = None
    ) -> List[ScheduledDelivery]:
        """
        Query scheduled deliveries with optional filtering parameters.
        """
        if self.use_live_bq and self.bq_client:
            conditions = []
            if status:
                conditions.append(f"status = '{status}'")
            if corridor:
                conditions.append(f"primary_transit_corridor = '{corridor}'")
            if priority:
                conditions.append(f"package_priority = '{priority}'")
            if origin_city:
                conditions.append(f"origin_city = '{origin_city}'")
            if destination_city:
                conditions.append(f"destination_city = '{destination_city}'")

            where_clause = f"WHERE {' AND '.join(conditions)}" if conditions else ""
            query = f"""
                SELECT * FROM `{self.project_id}.{self.dataset_id}.scheduled_deliveries`
                {where_clause}
                ORDER BY scheduled_delivery_window_start ASC
            """
            try:
                rows = self.bq_client.query(query).result()
                return [ScheduledDelivery(**dict(row)) for row in rows]
            except Exception as e:
                logger.warning(f"BigQuery scheduled deliveries query failed, fallback: {e}")

        # Local query filtering
        deliveries_raw = self._local_data.get("scheduled_deliveries", [])
        results = []
        for d in deliveries_raw:
            if status and d.get("status") != status:
                continue
            if corridor and d.get("primary_transit_corridor") != corridor:
                continue
            if priority and d.get("package_priority") != priority:
                continue
            if origin_city and d.get("origin_city").lower() != origin_city.lower():
                continue
            if destination_city and d.get("destination_city").lower() != destination_city.lower():
                continue
            results.append(ScheduledDelivery(
                delivery_id=d["delivery_id"],
                package_id=d["package_id"],
                client_name=d["client_name"],
                recipient_name=d["recipient_name"],
                origin_hub_id=d["origin_hub_id"],
                origin_city=d["origin_city"],
                destination_address=d["destination_address"],
                destination_city=d["destination_city"],
                destination_postal_code=d["destination_postal_code"],
                destination_lat=float(d["destination_lat"]),
                destination_lon=float(d["destination_lon"]),
                scheduled_departure=d["scheduled_departure"],
                scheduled_delivery_window_start=d["scheduled_delivery_window_start"],
                scheduled_delivery_window_end=d["scheduled_delivery_window_end"],
                primary_transit_corridor=d["primary_transit_corridor"],
                estimated_transit_hours=float(d["estimated_transit_hours"]),
                package_priority=PackagePriority(d["package_priority"]),
                status=DeliveryStatus(d["status"])
            ))
        return results

    def get_delivery_by_package_id(self, package_id: str) -> Optional[ScheduledDelivery]:
        """Lookup specific package delivery by package ID or delivery ID."""
        for d in self.get_scheduled_deliveries():
            if d.package_id.upper() == package_id.upper() or d.delivery_id.upper() == package_id.upper():
                return d
        return None
