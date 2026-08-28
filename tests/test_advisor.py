"""
Automated unit and integration test suite for ADK Germany Logistics Advisor.
"""

import pytest
from src.bigquery_repo import BigQueryLogisticsRepository
from src.weathernext2_client import WeatherNext2Client
from src.traffic_service import TrafficService
from src.agent.tools import LogisticsToolsFactory
from src.agent.advisor_agent import GermanyLogisticsAdvisorAgent
from src.agent.schemas import RiskLevel, PackagePriority


def test_bigquery_repo_seed_records_count():
    repo = BigQueryLogisticsRepository()
    hubs = repo.get_logistics_hubs()
    traffic_patterns = repo.get_historic_traffic_patterns()
    deliveries = repo.get_scheduled_deliveries()

    total_records = len(hubs) + len(traffic_patterns) + len(deliveries)
    assert total_records < 100, f"Total records ({total_records}) exceeds 100 limit!"
    assert len(hubs) >= 5, "Should have at least 5 German logistics hubs"
    assert len(deliveries) >= 20, "Should have realistic scheduled delivery dataset"


def test_weathernext2_client_predictions():
    client = WeatherNext2Client()
    a9_forecast = client.get_corridor_forecast("COR-A9")
    assert a9_forecast.weather_condition == "SEVERE_THUNDERSTORM_SQUALL"
    assert a9_forecast.severity in [RiskLevel.HIGH, RiskLevel.CRITICAL]
    assert a9_forecast.speed_reduction_percent > 20.0
    assert a9_forecast.forecast_confidence >= 0.85

    # Geo lookup
    munich_geo = client.get_geo_forecast(48.1351, 11.5820, "Munich")
    assert munich_geo is not None
    assert munich_geo.speed_reduction_percent > 0


def test_traffic_service_bottlenecks():
    service = TrafficService()
    assessment = service.assess_traffic_risk("COR-A3", estimated_hours=3.0, departure_hour=18)
    assert assessment.traffic_delay_minutes > 0
    assert "Frankfurter Kreuz" in assessment.bottleneck_warning


def test_compound_delay_prediction():
    factory = LogisticsToolsFactory()
    repo = factory.repo
    delivery = repo.get_delivery_by_package_id("PKG-DE-1001")
    assert delivery is not None

    assessment = factory.calculate_delay_for_delivery(delivery)
    assert assessment.package_id == "PKG-DE-1001"
    assert assessment.total_predicted_delay_minutes > 0
    assert assessment.weather_delay_minutes > 0
    assert assessment.traffic_delay_minutes > 0
    assert assessment.operator_advisory is not None


def test_advisor_agent_queries():
    agent = GermanyLogisticsAdvisorAgent()
    
    # Overview query
    overview = agent.answer_operator_query("Give me an overview of all delayed deliveries")
    assert "Live Shift Briefing" in overview
    assert "BigQuery" in overview

    # Package query
    pkg_query = agent.answer_operator_query("What is the status of PKG-DE-1001?")
    assert "Siemens Healthineers" in pkg_query
    assert "COR-A9" in pkg_query

    # Pharma / Temperature-Sensitive query
    temp_query = agent.answer_operator_query("Show me temperature-sensitive packages affected by weather")
    assert "Temperature-Sensitive" in temp_query or "Pharma" in temp_query

    # On-Time Deliveries query
    ontime_query = agent.answer_operator_query("Show me all deliveries that are on time and not at risk")
    assert "On-Time & Low-Risk Deliveries" in ontime_query
    assert "PKG-DE-BER-01" in ontime_query or "PKG-DE-HAJ-01" in ontime_query


def test_on_time_deliveries_metrics():
    agent = GermanyLogisticsAdvisorAgent()
    rep = agent.generate_operator_advisory_report()
    assert rep["on_time_count"] >= 10, "Should detect at least 10 on-time deliveries"
    assert rep["on_time_percentage"] > 0
    assert rep["total_active_deliveries"] == rep["on_time_count"] + rep["deliveries_delayed_count"]

