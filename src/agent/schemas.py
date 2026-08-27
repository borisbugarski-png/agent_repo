"""
Pydantic data schemas for Logistics Advisor Agent, BigQuery models,
WeatherNext2 forecasts, and Delay Assessments across Germany.
"""

from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field


class PackagePriority(str, Enum):
    TEMPERATURE_SENSITIVE = "TEMPERATURE_SENSITIVE"
    EXPRESS_SAME_DAY = "EXPRESS_SAME_DAY"
    EXPRESS_NEXT_DAY = "EXPRESS_NEXT_DAY"
    STANDARD = "STANDARD"


class DeliveryStatus(str, Enum):
    SCHEDULED_PENDING = "SCHEDULED_PENDING"
    DISPATCHED_IN_TRANSIT = "DISPATCHED_IN_TRANSIT"
    OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY"
    DELIVERED_ON_TIME = "DELIVERED_ON_TIME"
    DELIVERED_DELAYED = "DELIVERED_DELAYED"


class RiskLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class LogisticsHub(BaseModel):
    hub_id: str
    hub_name: str
    city: str
    state: str
    latitude: float
    longitude: float
    capacity_daily_parcels: int


class HistoricTrafficPattern(BaseModel):
    corridor_id: str
    corridor_name: str
    origin_region: str
    dest_region: str
    typical_rush_hour_bottlenecks: str
    base_speed_kmh: float
    rush_hour_speed_kmh: float
    historical_accident_risk_factor: float
    weather_sensitivity_multiplier: float


class ScheduledDelivery(BaseModel):
    delivery_id: str
    package_id: str
    client_name: str
    recipient_name: str
    origin_hub_id: str
    origin_city: str
    destination_address: str
    destination_city: str
    destination_postal_code: str
    destination_lat: float
    destination_lon: float
    scheduled_departure: str
    scheduled_delivery_window_start: str
    scheduled_delivery_window_end: str
    primary_transit_corridor: str
    estimated_transit_hours: float
    package_priority: PackagePriority
    status: DeliveryStatus


class CompletedDelivery(BaseModel):
    delivery_id: str
    package_id: str
    origin_city: str
    destination_city: str
    transit_corridor: str
    scheduled_delivery_time: str
    actual_delivery_time: str
    delay_minutes: int
    weather_condition_encountered: str
    traffic_condition_encountered: str
    delivery_status: str


class WeatherNext2Forecast(BaseModel):
    target_region_or_corridor: str
    weather_condition: str
    severity: RiskLevel
    precipitation_mm_hr: float
    wind_gust_kmh: float
    visibility_meters: int
    surface_hazard: Optional[str] = None
    speed_reduction_percent: float = Field(..., description="Estimated speed reduction in %")
    forecast_confidence: float = Field(..., ge=0.0, le=1.0)
    weathernext2_summary: str


class TrafficRiskAssessment(BaseModel):
    corridor_id: str
    corridor_name: str
    base_speed_kmh: float
    expected_speed_kmh: float
    congestion_level: str
    bottleneck_warning: str
    traffic_delay_minutes: int


class DelayAssessment(BaseModel):
    delivery_id: str
    package_id: str
    client_name: str
    recipient_name: str
    origin_city: str
    destination_city: str
    transit_corridor: str
    package_priority: PackagePriority
    status: DeliveryStatus
    base_transit_hours: float
    weather_condition: str
    weather_severity: RiskLevel
    weather_delay_minutes: int
    traffic_delay_minutes: int
    total_predicted_delay_minutes: int
    original_window_end: str
    predicted_arrival_time: str
    will_miss_window: bool
    risk_level: RiskLevel
    primary_cause: str
    recommended_action: str
    operator_advisory: str
    client_notification_draft: str
