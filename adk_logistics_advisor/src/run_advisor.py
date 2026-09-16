"""
Main executable entry point for ADK Germany Logistics Advisor.
Runs an automated end-to-end evaluation of all scheduled package deliveries across Germany,
correlating BigQuery records with Google WeatherNext2 atmospheric forecasts and historic traffic data.
"""

import sys
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.text import Text

from src.agent.advisor_agent import GermanyLogisticsAdvisorAgent
from src.agent.schemas import RiskLevel, PackagePriority

console = Console()


def run_advisory_dashboard():
    console.print(
        Panel.fit(
            "[bold cyan]Logistics Delivery Advisor powered by Google Cloud[/bold cyan]\n"
            "[dim]Powered by Google WeatherNext2 Atmospheric Predictions, BigQuery Repository & Historic Traffic Models[/dim]",
            border_style="cyan"
        )
    )


    agent = GermanyLogisticsAdvisorAgent()
    rep = agent.generate_operator_advisory_report()

    # Executive Metric Cards
    metrics_table = Table.grid(padding=1)
    metrics_table.add_column(style="bold white")
    metrics_table.add_column(style="bold yellow")
    metrics_table.add_column(style="bold white")
    metrics_table.add_column(style="bold red")

    console.print(
        Panel(
            f"📦 [bold]Total Scheduled Deliveries:[/bold] {rep['total_active_deliveries']}    "
            f"⚠️ [bold yellow]Predicted Delayed:[/bold yellow] {rep['deliveries_delayed_count']} ({rep['percentage_affected']}%)    "
            f"🚨 [bold red]Critical / Window Breaches:[/bold red] {rep['predicted_sla_window_breaches']}    "
            f"❄️ [bold cyan]Pharma / Temp-Sensitive at Risk:[/bold cyan] {rep['temperature_sensitive_at_risk']}",
            title="[bold green]Operations Summary[/bold green]",
            border_style="green"
        )
    )

    # Deliveries Detailed Table
    table = Table(
        title="[bold]Detailed Package Delay Assessment Across Germany[/bold]",
        header_style="bold magenta",
        show_lines=True
    )
    table.add_column("Package ID", style="bold cyan", width=12)
    table.add_column("Priority", width=18)
    table.add_column("Route & Corridor", width=22)
    table.add_column("WeatherNext2 Forecast", width=26)
    table.add_column("Delay Breakdown", justify="right", width=16)
    table.add_column("SLA Window", width=14)
    table.add_column("Risk", justify="center", width=10)
    table.add_column("Operator Action", width=30)

    for a in rep["assessments"]:
        # Priority style
        if a.package_priority == PackagePriority.TEMPERATURE_SENSITIVE:
            prio_text = f"[bold blue]❄️ {a.package_priority.value}[/bold blue]"
        elif a.package_priority == PackagePriority.EXPRESS_SAME_DAY:
            prio_text = f"[bold yellow]⚡ {a.package_priority.value}[/bold yellow]"
        else:
            prio_text = f"[dim]{a.package_priority.value}[/dim]"

        # Risk style
        if a.risk_level == RiskLevel.CRITICAL:
            risk_text = "[bold white on red] CRITICAL [/bold white on red]"
        elif a.risk_level == RiskLevel.HIGH:
            risk_text = "[bold red] HIGH [/bold red]"
        elif a.risk_level == RiskLevel.MEDIUM:
            risk_text = "[yellow] MEDIUM [/yellow]"
        else:
            risk_text = "[green] LOW [/green]"

        sla_text = "[bold red]🚨 MISSED[/bold red]" if a.will_miss_window else "[green]✅ ON TIME[/green]"
        delay_text = f"[bold red]+{a.total_predicted_delay_minutes} min[/bold red]\n[dim]W:+{a.weather_delay_minutes}m T:+{a.traffic_delay_minutes}m[/dim]"

        table.add_row(
            a.package_id,
            prio_text,
            f"{a.origin_city} ➔ {a.destination_city}\n[dim]{a.transit_corridor}[/dim]",
            f"[bold]{a.weather_condition}[/bold]\n[dim]{a.weather_severity.value}[/dim]",
            delay_text,
            sla_text,
            risk_text,
            a.recommended_action
        )

    console.print(table)

    # Sample Natural Language Operator Interactivity Demonstration
    console.print("\n[bold cyan]🤖 Sample ADK Operator Query Reasoning Demonstration:[/bold cyan]")
    sample_queries = [
        "What is the status of temperature-sensitive medical packages?",
        "Assess package PKG-DE-1001",
        "Which deliveries are affected by the weather on the A9 corridor?"
    ]

    for q in sample_queries:
        console.print(Panel(f"[bold yellow]Operator Query:[/bold yellow] [italic]{q}[/italic]\n\n[bold green]ADK Advisor Response:[/bold green]\n{agent.answer_operator_query(q)}", border_style="blue"))


if __name__ == "__main__":
    run_advisory_dashboard()
