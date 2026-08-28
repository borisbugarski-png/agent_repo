"""
ADK Tools for German Logistics Advisor.
Connects the agent to BigQuery, Google WeatherNext2, and Historic Traffic services.
"""

from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any

from src.agent.adk_framework import ADKTool, ToolParameter
from src.agent.schemas import (
    DelayAssessment,
    PackagePriority,
    RiskLevel,
    DeliveryStatus,
)
from src.bigquery_repo import BigQueryLogisticsRepository
from src.weathernext2_client import WeatherNext2Client
from src.traffic_service import TrafficService


class LogisticsToolsFactory:
    """
    Constructs and registers all ADK tools for the Logistics Advisor.
    """

    def __init__(
        self,
        repo: Optional[BigQueryLogisticsRepository] = None,
        weather_client: Optional[WeatherNext2Client] = None,
        traffic_service: Optional[TrafficService] = None,
    ):
        self.repo = repo or BigQueryLogisticsRepository()
        self.weather_client = weather_client or WeatherNext2Client()
        self.traffic_service = traffic_service or TrafficService()

    def get_all_tools(self) -> List[ADKTool]:
        return [
            self.create_query_deliveries_tool(),
            self.create_weathernext2_tool(),
            self.create_traffic_analysis_tool(),
            self.create_compound_delay_prediction_tool(),
            self.create_corridor_overview_tool(),
        ]

    def create_query_deliveries_tool(self) -> ADKTool:
        def _query_deliveries(
            status: Optional[str] = None,
            corridor: Optional[str] = None,
            priority: Optional[str] = None,
            destination_city: Optional[str] = None,
        ) -> List[Dict[str, Any]]:
            deliveries = self.repo.get_scheduled_deliveries(
                status=status,
                corridor=corridor,
                priority=priority,
                destination_city=destination_city,
            )
            return [d.model_dump() for d in deliveries]

        return ADKTool(
            name="query_bigquery_deliveries",
            description="Queries scheduled package deliveries from BigQuery central repository with optional filters.",
            func=_query_deliveries,
            parameters=[
                ToolParameter("status", "string", "Filter by delivery status (e.g. DISPATCHED_IN_TRANSIT, SCHEDULED_PENDING)", False),
                ToolParameter("corridor", "string", "Filter by transit corridor (e.g. COR-A9, COR-A8, COR-A7, COR-A3, COR-A1, COR-A2, COR-A5)", False),
                ToolParameter("priority", "string", "Filter by priority (e.g. TEMPERATURE_SENSITIVE, EXPRESS_SAME_DAY)", False),
                ToolParameter("destination_city", "string", "Filter by German destination city (e.g. Berlin, Munich, Hamburg)", False),
            ],
        )

    def create_weathernext2_tool(self) -> ADKTool:
        def _get_weather(corridor_or_city: str) -> Dict[str, Any]:
            # If passed corridor code directly
            if corridor_or_city.startswith("COR-"):
                forecast = self.weather_client.get_corridor_forecast(corridor_or_city)
            else:
                # Map German city to regional corridor
                city_corridor_map = {
                    "munich": "COR-A9",
                    "berlin": "COR-A10",
                    "hamburg": "COR-A7",
                    "frankfurt": "COR-A3",
                    "cologne": "COR-A1",
                    "stuttgart": "COR-A8",
                    "leipzig": "COR-A9",
                    "nuremberg": "COR-A9",
                    "freiburg": "COR-A5",
                    "dresden": "COR-A2",
                }
                corridor_id = city_corridor_map.get(corridor_or_city.lower(), "COR-A9")
                forecast = self.weather_client.get_corridor_forecast(corridor_id)
            return forecast.model_dump()

        return ADKTool(
            name="get_google_weathernext2_forecast",
            description="Fetches high-resolution weather forecast and storm/rain/snow predictions from Google WeatherNext2 for a German corridor or city.",
            func=_get_weather,
            parameters=[
                ToolParameter("corridor_or_city", "string", "Autobahn corridor ID (e.g. COR-A9, COR-A8) or German city name", True)
            ],
        )

    def create_traffic_analysis_tool(self) -> ADKTool:
        def _get_traffic(corridor_id: str, estimated_hours: float = 4.0) -> Dict[str, Any]:
            assessment = self.traffic_service.assess_traffic_risk(corridor_id, estimated_hours)
            return assessment.model_dump()

        return ADKTool(
            name="analyze_historic_traffic_risk",
            description="Analyzes historical traffic bottlenecks, rush hour slowdowns, and incident probabilities on a German Autobahn corridor.",
            func=_get_traffic,
            parameters=[
                ToolParameter("corridor_id", "string", "Autobahn corridor ID (e.g. COR-A9, COR-A8, COR-A3)", True),
                ToolParameter("estimated_hours", "number", "Estimated baseline transit hours", False, 4.0),
            ],
        )

    def create_compound_delay_prediction_tool(self) -> ADKTool:
        def _predict_delivery_delay(package_id_or_delivery_id: str) -> Dict[str, Any]:
            delivery = self.repo.get_delivery_by_package_id(package_id_or_delivery_id)
            if not delivery:
                return {"error": f"Delivery not found for identifier: {package_id_or_delivery_id}"}

            return self.calculate_delay_for_delivery(delivery).model_dump()

        return ADKTool(
            name="predict_package_delay",
            description="Calculates comprehensive compound delay for a specific package combining WeatherNext2 forecast, historic traffic, and route geometry.",
            func=_predict_delivery_delay,
            parameters=[
                ToolParameter("package_id_or_delivery_id", "string", "Package ID (e.g. PKG-DE-1001) or Delivery ID (e.g. DEL-20260827-001)", True)
            ],
        )

    def create_corridor_overview_tool(self) -> ADKTool:
        def _get_all_corridors_status() -> List[Dict[str, Any]]:
            corridors = ["COR-A9", "COR-A8", "COR-A3", "COR-A7", "COR-A1", "COR-A2", "COR-A5", "COR-A10"]
            summary = []
            for c in corridors:
                weather = self.weather_client.get_corridor_forecast(c)
                traffic = self.traffic_service.assess_traffic_risk(c, estimated_hours=4.0)
                affected_deliveries = self.repo.get_scheduled_deliveries(corridor=c)
                summary.append({
                    "corridor_id": c,
                    "corridor_name": traffic.corridor_name,
                    "weather_condition": weather.weather_condition,
                    "weather_severity": weather.severity.value,
                    "speed_reduction_percent": weather.speed_reduction_percent,
                    "traffic_congestion": traffic.congestion_level,
                    "bottlenecks": traffic.bottleneck_warning,
                    "active_scheduled_deliveries_count": len(affected_deliveries),
                })
            return summary

        return ADKTool(
            name="get_all_german_corridors_status",
            description="Provides a high-level meteorological and traffic status summary across all 8 major German Autobahn corridors.",
            func=_get_all_corridors_status,
            parameters=[],
        )

    def calculate_delay_for_delivery(self, delivery) -> DelayAssessment:
        """
        Internal logic synthesizing WeatherNext2 forecast + Historic traffic bottlenecks into a DelayAssessment.
        """
        # Parse departure hour to determine traffic congestion period (rush hour vs off-peak)
        dep_hour = 18
        try:
            dep_dt = datetime.fromisoformat(delivery.scheduled_departure.replace("Z", "+00:00"))
            dep_hour = dep_dt.hour
        except Exception:
            pass


        weather = self.weather_client.get_corridor_forecast(delivery.primary_transit_corridor)
        traffic = self.traffic_service.assess_traffic_risk(
            delivery.primary_transit_corridor,
            delivery.estimated_transit_hours,
            departure_hour=dep_hour
        )

        # Calculate weather slowdown in minutes
        # Baseline transit minutes * speed reduction factor * corridor weather sensitivity
        pattern = self.traffic_service.patterns.get(delivery.primary_transit_corridor)
        sensitivity = pattern.weather_sensitivity_multiplier if pattern else 1.2

        base_minutes = delivery.estimated_transit_hours * 60.0
        weather_delay_mins = int(base_minutes * (weather.speed_reduction_percent / 100.0) * (sensitivity / 1.2))

        # Traffic delay from bottlenecks
        traffic_delay_mins = traffic.traffic_delay_minutes

        # Compound synergy: Severe weather creates exponential jam multipliers in known bottleneck zones
        compound_synergy = 0
        if weather.severity in [RiskLevel.HIGH, RiskLevel.CRITICAL] and traffic.congestion_level in ["HIGH", "SEVERE"]:
            compound_synergy = int((weather_delay_mins + traffic_delay_mins) * 0.25)

        total_delay_mins = weather_delay_mins + traffic_delay_mins + compound_synergy

        # Parse timestamps and compute expected arrival
        try:
            dep_dt = datetime.fromisoformat(delivery.scheduled_departure.replace("Z", "+00:00"))
            win_end_dt = datetime.fromisoformat(delivery.scheduled_delivery_window_end.replace("Z", "+00:00"))
        except Exception:
            dep_dt = datetime.utcnow()
            win_end_dt = dep_dt + timedelta(hours=delivery.estimated_transit_hours + 1.0)

        predicted_arrival_dt = dep_dt + timedelta(hours=delivery.estimated_transit_hours, minutes=total_delay_mins)
        will_miss_window = predicted_arrival_dt > win_end_dt

        # Determine overall Risk Level
        if total_delay_mins >= 70 or (will_miss_window and delivery.package_priority == PackagePriority.TEMPERATURE_SENSITIVE):
            risk_level = RiskLevel.CRITICAL
        elif total_delay_mins >= 40 or will_miss_window:
            risk_level = RiskLevel.HIGH
        elif total_delay_mins >= 20:
            risk_level = RiskLevel.MEDIUM
        else:
            risk_level = RiskLevel.LOW

        # Primary cause
        if total_delay_mins < 15 and not will_miss_window:
            primary_cause = "Nominal Road & Atmospheric Conditions (Optimal Transit)"
        elif weather_delay_mins > traffic_delay_mins * 1.3:
            primary_cause = f"WeatherNext2 Alert: {weather.weather_condition} ({weather.precipitation_mm_hr} mm/h rain/snow, {weather.wind_gust_kmh} km/h gusts)"
        elif traffic_delay_mins > weather_delay_mins * 1.3:
            primary_cause = f"Historic Traffic: {traffic.congestion_level} congestion ({traffic.bottleneck_warning})"
        else:
            primary_cause = f"Compound Adverse Weather ({weather.weather_condition}) intersecting with Rush Hour Bottlenecks"

        # Action recommendation
        if total_delay_mins < 15 and not will_miss_window:
            recommended_action = "ON TRACK: Delivery on schedule. No intervention required. Expected on-time arrival within SLA window."
        elif delivery.package_priority == PackagePriority.TEMPERATURE_SENSITIVE:
            recommended_action = "CRITICAL PHARMA: Verify active cooling unit runtime. Consider immediate rerouting or priority bypass protocol."
        elif delivery.package_priority == PackagePriority.EXPRESS_SAME_DAY and will_miss_window:
            recommended_action = "EXPRESS BREACH: Notify dispatch operator to reassign last-mile courier or alert client of adjusted ETA."
        elif will_miss_window:
            recommended_action = "WINDOW BREACH: Automated ETA push notification to recipient recommended."
        else:
            recommended_action = "MONITOR: Transit buffer currently absorbs delay. Monitor WeatherNext2 radar updates."

        # Operator advisory note
        if total_delay_mins < 15 and not will_miss_window:
            operator_advisory = (
                f"Package {delivery.package_id} ({delivery.origin_city} -> {delivery.destination_city} via {delivery.primary_transit_corridor}) "
                f"is ON TRACK with minimal delay (+{total_delay_mins} min). "
                f"Expected Arrival: {predicted_arrival_dt.strftime('%H:%M UTC')} safely within Scheduled Window End {win_end_dt.strftime('%H:%M UTC')}."
            )
            client_notification_draft = (
                f"Dear {delivery.recipient_name}, your delivery ({delivery.package_id}) from {delivery.client_name} is proceeding on schedule. "
                f"Expected on-time arrival is {predicted_arrival_dt.strftime('%H:%M UTC')}."
            )
        else:
            operator_advisory = (
                f"Package {delivery.package_id} ({delivery.origin_city} -> {delivery.destination_city} via {delivery.primary_transit_corridor}) "
                f"faces a predicted delay of ~{total_delay_mins} min (Weather: +{weather_delay_mins}m, Traffic: +{traffic_delay_mins}m). "
                f"Expected Arrival: {predicted_arrival_dt.strftime('%H:%M UTC')} vs Scheduled Window End {win_end_dt.strftime('%H:%M UTC')}."
            )
            client_notification_draft = (
                f"Dear {delivery.recipient_name}, your delivery ({delivery.package_id}) from {delivery.client_name} is in transit. "
                f"Due to severe weather ({weather.weather_condition.replace('_', ' ').lower()}) along the {delivery.primary_transit_corridor} corridor, "
                f"our logistics team anticipates a slight delay. Your updated estimated arrival is {predicted_arrival_dt.strftime('%H:%M UTC')}."
            )


        return DelayAssessment(
            delivery_id=delivery.delivery_id,
            package_id=delivery.package_id,
            client_name=delivery.client_name,
            recipient_name=delivery.recipient_name,
            origin_city=delivery.origin_city,
            destination_city=delivery.destination_city,
            transit_corridor=delivery.primary_transit_corridor,
            package_priority=delivery.package_priority,
            status=delivery.status,
            base_transit_hours=delivery.estimated_transit_hours,
            weather_condition=weather.weather_condition,
            weather_severity=weather.severity,
            weather_delay_minutes=weather_delay_mins,
            traffic_delay_minutes=traffic_delay_mins,
            total_predicted_delay_minutes=total_delay_mins,
            original_window_end=delivery.scheduled_delivery_window_end,
            predicted_arrival_time=predicted_arrival_dt.isoformat(),
            will_miss_window=will_miss_window,
            risk_level=risk_level,
            primary_cause=primary_cause,
            recommended_action=recommended_action,
            operator_advisory=operator_advisory,
            client_notification_draft=client_notification_draft,
        )
