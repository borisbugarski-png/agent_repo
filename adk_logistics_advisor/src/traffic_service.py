"""
Historic Traffic Pattern Service for German Autobahn and Logistics Corridors.
Evaluates typical bottleneck slowdowns, rush hour variances, and historical accident statistics.
"""

from typing import Dict, Optional
from src.agent.schemas import TrafficRiskAssessment, HistoricTrafficPattern


class TrafficService:
    """
    Evaluates historic traffic patterns and active congestion along German delivery corridors.
    """

    def __init__(self, patterns_by_corridor: Optional[Dict[str, HistoricTrafficPattern]] = None):
        self.patterns = patterns_by_corridor or self._load_default_patterns()

    def _load_default_patterns(self) -> Dict[str, HistoricTrafficPattern]:
        return {
            "COR-A9": HistoricTrafficPattern(
                corridor_id="COR-A9",
                corridor_name="A9 Munich - Nuremberg - Leipzig - Berlin",
                origin_region="Bavaria",
                dest_region="Berlin/Saxony",
                typical_rush_hour_bottlenecks="Dreieck Holledau, Kindinger Berg, Hermsdorfer Kreuz",
                base_speed_kmh=115.0,
                rush_hour_speed_kmh=65.0,
                historical_accident_risk_factor=1.35,
                weather_sensitivity_multiplier=1.45
            ),
            "COR-A3": HistoricTrafficPattern(
                corridor_id="COR-A3",
                corridor_name="A3 Frankfurt - Würzburg - Nuremberg / Cologne",
                origin_region="Hesse",
                dest_region="NRW / Bavaria",
                typical_rush_hour_bottlenecks="Frankfurter Kreuz, Spessart ascent, Heumar",
                base_speed_kmh=110.0,
                rush_hour_speed_kmh=50.0,
                historical_accident_risk_factor=1.50,
                weather_sensitivity_multiplier=1.40
            ),
            "COR-A7": HistoricTrafficPattern(
                corridor_id="COR-A7",
                corridor_name="A7 Hamburg - Hanover - Kassel - Ulm",
                origin_region="Hamburg",
                dest_region="Lower Saxony / Hesse",
                typical_rush_hour_bottlenecks="Elbtunnel, Kasseler Berge, Salzgitter triangle",
                base_speed_kmh=110.0,
                rush_hour_speed_kmh=55.0,
                historical_accident_risk_factor=1.40,
                weather_sensitivity_multiplier=1.50
            ),
            "COR-A8": HistoricTrafficPattern(
                corridor_id="COR-A8",
                corridor_name="A8 Karlsruhe - Stuttgart - Ulm - Munich",
                origin_region="Baden-Württemberg",
                dest_region="Bavaria",
                typical_rush_hour_bottlenecks="Drackensteiner Hang, Albaufstieg, Stuttgart Kreuz",
                base_speed_kmh=105.0,
                rush_hour_speed_kmh=45.0,
                historical_accident_risk_factor=1.60,
                weather_sensitivity_multiplier=1.60
            ),
            "COR-A2": HistoricTrafficPattern(
                corridor_id="COR-A2",
                corridor_name="A2 Oberhausen - Dortmund - Hanover - Berlin",
                origin_region="NRW",
                dest_region="Lower Saxony / Berlin",
                typical_rush_hour_bottlenecks="Kamener Kreuz, Braunschweig, Bad Oeynhausen",
                base_speed_kmh=100.0,
                rush_hour_speed_kmh=52.0,
                historical_accident_risk_factor=1.45,
                weather_sensitivity_multiplier=1.30
            ),
            "COR-A1": HistoricTrafficPattern(
                corridor_id="COR-A1",
                corridor_name="A1 Cologne - Dortmund - Bremen - Hamburg",
                origin_region="NRW",
                dest_region="Hamburg / Bremen",
                typical_rush_hour_bottlenecks="Leverkusen Bridge, Bremen Kreuz, Harburg",
                base_speed_kmh=105.0,
                rush_hour_speed_kmh=48.0,
                historical_accident_risk_factor=1.55,
                weather_sensitivity_multiplier=1.35
            ),
            "COR-A5": HistoricTrafficPattern(
                corridor_id="COR-A5",
                corridor_name="A5 Frankfurt - Darmstadt - Karlsruhe - Basel",
                origin_region="Hesse",
                dest_region="Baden-Württemberg",
                typical_rush_hour_bottlenecks="Darmstädter Kreuz, Walldorf, Heidelberg",
                base_speed_kmh=115.0,
                rush_hour_speed_kmh=60.0,
                historical_accident_risk_factor=1.25,
                weather_sensitivity_multiplier=1.20
            ),
            "COR-A10": HistoricTrafficPattern(
                corridor_id="COR-A10",
                corridor_name="A10 Berliner Ring Orbital",
                origin_region="Berlin",
                dest_region="Brandenburg",
                typical_rush_hour_bottlenecks="Dreieck Havelland, Schönefelder Kreuz",
                base_speed_kmh=110.0,
                rush_hour_speed_kmh=68.0,
                historical_accident_risk_factor=1.20,
                weather_sensitivity_multiplier=1.25
            )
        }

    def assess_traffic_risk(self, corridor_id: str, estimated_hours: float, departure_hour: int = 18) -> TrafficRiskAssessment:
        """
        Assess traffic risk based on corridor bottlenecks and transit time.
        """
        pattern = self.patterns.get(corridor_id)
        if not pattern:
            return TrafficRiskAssessment(
                corridor_id=corridor_id,
                corridor_name="Standard German Road Network",
                base_speed_kmh=100.0,
                expected_speed_kmh=90.0,
                congestion_level="LOW",
                bottleneck_warning="No recurring major bottleneck",
                traffic_delay_minutes=5
            )

        # Evaluate rush hour overlap (e.g. 16:30 - 19:30)
        is_rush_hour = 16 <= departure_hour <= 20

        if is_rush_hour:
            # Significant bottleneck delay
            speed_ratio = pattern.rush_hour_speed_kmh / pattern.base_speed_kmh
            effective_speed = pattern.rush_hour_speed_kmh
            congestion_level = "HIGH" if pattern.historical_accident_risk_factor >= 1.4 else "MEDIUM"
            # Calculate additional minutes
            transit_distance_km = pattern.base_speed_kmh * estimated_hours
            congested_hours = transit_distance_km / effective_speed
            delay_minutes = max(10, int((congested_hours - estimated_hours) * 60 * 0.55))
        else:
            effective_speed = pattern.base_speed_kmh * 0.92
            congestion_level = "LOW"
            delay_minutes = int(estimated_hours * 5)

        return TrafficRiskAssessment(
            corridor_id=pattern.corridor_id,
            corridor_name=pattern.corridor_name,
            base_speed_kmh=pattern.base_speed_kmh,
            expected_speed_kmh=effective_speed,
            congestion_level=congestion_level,
            bottleneck_warning=f"Bottlenecks at: {pattern.typical_rush_hour_bottlenecks}",
            traffic_delay_minutes=delay_minutes
        )
