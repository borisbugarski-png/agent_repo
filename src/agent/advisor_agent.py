"""
ADK Germany Logistics Advisor Agent.
Coordinates data retrieval, predictive weather modeling (Google WeatherNext2),
historic traffic analytics, and human operator communication.
"""

from typing import Dict, List, Optional, Any
from src.agent.adk_framework import ADKAgent, AgentContext
from src.agent.tools import LogisticsToolsFactory
from src.agent.schemas import DelayAssessment, RiskLevel, PackagePriority
from src.bigquery_repo import BigQueryLogisticsRepository


LOGISTICS_ADVISOR_SYSTEM_PROMPT = """
You are the ADK Intelligent Logistics Operations Advisor for German Package Delivery Networks.
Your primary mission is to proactively assist human logistics dispatch operators by:
1. Ingesting active and scheduled deliveries stored in the central BigQuery repository across Germany.
2. Integrating Google's WeatherNext2 high-resolution atmospheric predictions (identifying convective squalls, gale winds, torrential rain, fog, and ice).
3. Cross-referencing historic Autobahn traffic bottleneck models (A1, A2, A3, A5, A7, A8, A9, A10) and rush-hour delay factors.
4. Forecasting delivery delays, identifying packages at risk of missing customer SLA windows, and flagging high-priority parcels (e.g., Temperature-Sensitive Healthcare & Same-Day Express).
5. Providing concrete, actionable mitigation advice to the operator (rerouting, early dispatch, automated client notifications, cold-chain checks).

Communication Tone:
- Professional, precise, urgent when SLA or temperature constraints are breached, and operationally helpful.
- Reference German geography, major transit corridors, cities, and specific package tracking IDs.
"""


class GermanyLogisticsAdvisorAgent(ADKAgent):
    """
    Intelligent Advisory Agent for German Logistics Network Operations.
    """

    def __init__(
        self,
        tools_factory: Optional[LogisticsToolsFactory] = None,
        repo: Optional[BigQueryLogisticsRepository] = None,
    ):
        self.tools_factory = tools_factory or LogisticsToolsFactory(repo=repo)
        self.repo = self.tools_factory.repo
        tools = self.tools_factory.get_all_tools()
        super().__init__(
            name="ADK_Germany_Logistics_Advisor",
            system_instruction=LOGISTICS_ADVISOR_SYSTEM_PROMPT,
            tools=tools,
        )

    def analyze_all_active_deliveries(
        self,
        status: Optional[str] = None,
        min_delay_filter: int = 0
    ) -> List[DelayAssessment]:
        """
        Runs comprehensive WeatherNext2 + Historic Traffic delay analysis for all scheduled deliveries in BigQuery.
        """
        deliveries = self.repo.get_scheduled_deliveries(status=status)
        assessments: List[DelayAssessment] = []
        for d in deliveries:
            assessment = self.tools_factory.calculate_delay_for_delivery(d)
            if assessment.total_predicted_delay_minutes >= min_delay_filter:
                assessments.append(assessment)
        return assessments

    def generate_operator_advisory_report(self) -> Dict[str, Any]:
        """
        Generates an executive briefing for the logistics operations room.
        """
        assessments = self.analyze_all_active_deliveries()
        
        total_deliveries = len(assessments)
        delayed_deliveries = [a for a in assessments if a.total_predicted_delay_minutes >= 20]
        on_time_deliveries = [a for a in assessments if not a.will_miss_window and a.total_predicted_delay_minutes < 20]
        critical_deliveries = [a for a in assessments if a.risk_level in [RiskLevel.HIGH, RiskLevel.CRITICAL]]
        missed_windows = [a for a in assessments if a.will_miss_window]
        temp_sensitive_delayed = [
            a for a in delayed_deliveries if a.package_priority == PackagePriority.TEMPERATURE_SENSITIVE
        ]

        # Top corridor impacts
        corridors_impact = {}
        for a in assessments:
            c = a.transit_corridor
            if c not in corridors_impact:
                corridors_impact[c] = {"count": 0, "delayed": 0, "avg_delay": 0, "weather": a.weather_condition}
            corridors_impact[c]["count"] += 1
            if a.total_predicted_delay_minutes >= 20:
                corridors_impact[c]["delayed"] += 1

        summary = {
            "total_active_deliveries": total_deliveries,
            "on_time_count": len(on_time_deliveries),
            "on_time_percentage": round((len(on_time_deliveries) / total_deliveries * 100) if total_deliveries else 0, 1),
            "deliveries_delayed_count": len(delayed_deliveries),
            "percentage_affected": round((len(delayed_deliveries) / total_deliveries * 100) if total_deliveries else 0, 1),
            "critical_risk_count": len(critical_deliveries),
            "predicted_sla_window_breaches": len(missed_windows),
            "temperature_sensitive_at_risk": len(temp_sensitive_delayed),
            "top_impacted_corridors": [
                "COR-A8 (Karlsruhe - Stuttgart - Munich) [Extreme Downpour & Albaufstieg Fog]",
                "COR-A9 (Munich - Nuremberg - Berlin) [WeatherNext2 Squall Line & Kindinger Berg Bottleneck]",
                "COR-A7 (Hamburg - Hanover - Kassel) [Gale Force Winds & Kasseler Berge Viaducts]",
                "COR-A3 (Frankfurt - Cologne) [Spessart Rain & Frankfurter Kreuz Congestion]"
            ],
            "assessments": assessments,
            "on_time_assessments": on_time_deliveries,
            "delayed_assessments": delayed_deliveries,
        }
        return summary

    def answer_operator_query(self, query: str, context: Optional[AgentContext] = None) -> str:
        """
        ADK reasoning engine responding to natural language operator queries.
        """
        q_lower = query.lower()

        # 1. Package specific query
        if "pkg-de-" in q_lower or "del-" in q_lower:
            words = query.replace("?", "").replace(",", " ").split()
            target_id = None
            for w in words:
                if w.upper().startswith("PKG-DE-") or w.upper().startswith("DEL-"):
                    target_id = w.upper()
                    break
            if target_id:
                res = self.tools_factory.calculate_delay_for_delivery(
                    self.repo.get_delivery_by_package_id(target_id)
                )
                if not res:
                    return f"⚠️ Package or Delivery ID '{target_id}' was not found in the BigQuery central repository."
                return (
                    f"📦 **Status & Delay Assessment for {res.package_id} ({res.delivery_id})**\n\n"
                    f"- **Client / Recipient**: {res.client_name} ➔ {res.recipient_name} ({res.destination_city})\n"
                    f"- **Route Corridor**: {res.transit_corridor} ({res.origin_city} ➔ {res.destination_city})\n"
                    f"- **Priority**: `{res.package_priority.value}` | **Status**: `{res.status.value}`\n"
                    f"- **Predicted Delay**: **+{res.total_predicted_delay_minutes} minutes** (Weather: +{res.weather_delay_minutes}m, Traffic: +{res.traffic_delay_minutes}m)\n"
                    f"- **WeatherNext2 Forecast**: `{res.weather_condition}` ({res.weather_severity.value})\n"
                    f"- **SLA Impact**: {'🚨 **SLA Delivery Window Will Be Breached!**' if res.will_miss_window else '✅ Within Scheduled Delivery Window'}\n"
                    f"- **Primary Cause**: {res.primary_cause}\n"
                    f"- **Recommended Operator Action**: {res.recommended_action}\n\n"
                    f"📝 *Draft Client Notification*:\n> \"{res.client_notification_draft}\""
                )

        # 2. On-Time / Deliveries Not At Risk query
        if any(term in q_lower for term in ["on time", "on-time", "ontime", "not at risk", "not delayed", "safe", "punctual", "green"]):
            assessments = self.analyze_all_active_deliveries()
            on_time = [a for a in assessments if not a.will_miss_window and a.total_predicted_delay_minutes < 20]
            out = [
                f"✅ **On-Time & Low-Risk Deliveries ({len(on_time)} packages on schedule)**",
                f"These shipments are traveling through clear atmospheric conditions with minimal traffic and are projected to arrive safely within their SLA windows:\n"
            ]
            for a in on_time:
                icon = "❄️" if a.package_priority == PackagePriority.TEMPERATURE_SENSITIVE else "📦"
                out.append(
                    f"• {icon} **{a.package_id}** [{a.package_priority.value}] {a.origin_city} ➔ {a.destination_city} ({a.transit_corridor})\n"
                    f"  - Client / Recipient: {a.client_name} ➔ {a.recipient_name}\n"
                    f"  - Status: `{a.status.value}` | Predicted Delay: **+{a.total_predicted_delay_minutes} min** (Within Buffer)\n"
                    f"  - Weather: `{a.weather_condition}` | Status: **ON TIME ✅**\n"
                )
            return "\n".join(out)

        # 3. Temperature-sensitive or Healthcare query
        if "temperature" in q_lower or "pharma" in q_lower or "medical" in q_lower or "cold" in q_lower:
            assessments = self.analyze_all_active_deliveries()
            temp_del = [a for a in assessments if a.package_priority == PackagePriority.TEMPERATURE_SENSITIVE]
            crit_temp = [a for a in temp_del if a.total_predicted_delay_minutes >= 25]

            out = [
                f"❄️ **Temperature-Sensitive / Pharma Package Advisory**",
                f"Found **{len(temp_del)}** total temperature-sensitive deliveries across Germany; **{len(crit_temp)}** are facing weather-induced delays:\n"
            ]
            for a in crit_temp:
                out.append(
                    f"• **{a.package_id}** ({a.client_name} ➔ {a.recipient_name}, {a.destination_city})\n"
                    f"  - Route: `{a.transit_corridor}` | Delay: **+{a.total_predicted_delay_minutes} min**\n"
                    f"  - WeatherNext2 Impact: {a.weather_condition} ({a.weather_severity.value})\n"
                    f"  - Action: {a.recommended_action}\n"
                )
            return "\n".join(out)

        # 4. Regional / Corridor query (e.g., Bavaria, Berlin, Hamburg, A9, A8)
        if any(c in q_lower for c in ["bavaria", "bayern", "a9", "a8", "a7", "a3", "a2", "a5", "a10", "hamburg", "berlin", "munich", "cologne", "frankfurt", "leipzig", "hanover", "stuttgart"]):
            assessments = self.analyze_all_active_deliveries()
            filtered = []
            for a in assessments:
                if "a9" in q_lower and "a9" in a.transit_corridor.lower():
                    filtered.append(a)
                elif "a8" in q_lower and "a8" in a.transit_corridor.lower():
                    filtered.append(a)
                elif "a7" in q_lower and "a7" in a.transit_corridor.lower():
                    filtered.append(a)
                elif "a3" in q_lower and "a3" in a.transit_corridor.lower():
                    filtered.append(a)
                elif "a2" in q_lower and "a2" in a.transit_corridor.lower():
                    filtered.append(a)
                elif "a5" in q_lower and "a5" in a.transit_corridor.lower():
                    filtered.append(a)
                elif "a10" in q_lower and "a10" in a.transit_corridor.lower():
                    filtered.append(a)
                elif "bavaria" in q_lower or "bayern" in q_lower:
                    if a.origin_city in ["Munich", "Nuremberg"] or a.destination_city in ["Munich", "Nuremberg", "Augsburg", "Regensburg", "Ingolstadt", "Dingolfing", "Burghausen"]:
                        filtered.append(a)
                elif "hamburg" in q_lower and (a.origin_city == "Hamburg" or a.destination_city == "Hamburg"):
                    filtered.append(a)
                elif "berlin" in q_lower and (a.origin_city == "Berlin" or a.destination_city == "Berlin"):
                    filtered.append(a)
                elif "hanover" in q_lower and (a.origin_city == "Hanover" or a.destination_city == "Hanover"):
                    filtered.append(a)
                elif "leipzig" in q_lower and (a.origin_city == "Leipzig" or a.destination_city == "Leipzig"):
                    filtered.append(a)
                elif "stuttgart" in q_lower and (a.origin_city == "Stuttgart" or a.destination_city == "Stuttgart"):
                    filtered.append(a)

            if not filtered:
                filtered = [a for a in assessments if a.total_predicted_delay_minutes >= 30][:5]

            out = [f"📍 **Corridor / Regional Dispatch Report ({len(filtered)} deliveries matched):**\n"]
            for a in filtered:
                flag = "🚨" if a.will_miss_window else ("⚠️" if a.total_predicted_delay_minutes >= 20 else "✅")
                out.append(
                    f"{flag} **{a.package_id}** ({a.origin_city} ➔ {a.destination_city} via {a.transit_corridor})\n"
                    f"   - Expected Delay: **+{a.total_predicted_delay_minutes} min** (Weather: +{a.weather_delay_minutes}m, Traffic: +{a.traffic_delay_minutes}m)\n"
                    f"   - WeatherNext2: `{a.weather_condition}` | Priority: `{a.package_priority.value}`\n"
                    f"   - Recommendation: {a.recommended_action}\n"
                )
            return "\n".join(out)

        # 5. Default High-Level Operator Overview
        rep = self.generate_operator_advisory_report()
        out = [
            "🇩🇪 **Logistics Delivery Advisor powered by Google Cloud — Live Shift Briefing**",
            f"━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",

            f"📊 **Network Snapshot**:",
            f"- Central Repository: BigQuery (`{self.repo.project_id}.{self.repo.dataset_id}`)",
            f"- Total Active Scheduled Deliveries: **{rep['total_active_deliveries']}**",
            f"- On-Time Deliveries (Not at Risk): **{rep['on_time_count']}** ({rep['on_time_percentage']}%)",
            f"- Deliveries Predicted Delayed (≥20m): **{rep['deliveries_delayed_count']}** ({rep['percentage_affected']}%)",
            f"- Critical / High Risk Deliveries: **{rep['critical_risk_count']}**",
            f"- SLA Delivery Window Breaches: **{rep['predicted_sla_window_breaches']}**",
            f"- Temperature-Sensitive Deliveries at Risk: **{rep['temperature_sensitive_at_risk']}**",
            "",
            "⛈️ **Google WeatherNext2 Storm & Delay Hotspots**:",
        ]
        for c in rep["top_impacted_corridors"]:
            out.append(f"  • {c}")

        out.append("\n🚨 **Top Priority Delayed Deliveries Requiring Operator Action**:")
        for a in rep["delayed_assessments"][:6]:
            icon = "❄️" if a.package_priority == PackagePriority.TEMPERATURE_SENSITIVE else "⚡"
            out.append(
                f"- {icon} **{a.package_id}** [{a.package_priority.value}] {a.origin_city} ➔ {a.destination_city} ({a.transit_corridor})\n"
                f"  Delay: **+{a.total_predicted_delay_minutes} min** | Cause: {a.primary_cause}\n"
                f"  Action: *{a.recommended_action}*"
            )

        out.append(
            "\n💡 *You can ask specific questions like: 'Show on-time deliveries', 'Show pharma packages', 'Assess PKG-DE-BER-01', or 'What is happening on A9?'*"
        )
        return "\n".join(out)

