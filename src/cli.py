"""
Interactive CLI for Logistics Operators to query the ADK Advisor Agent.
"""

import sys
from rich.console import Console
from rich.panel import Panel
from rich.prompt import Prompt

from src.agent.advisor_agent import GermanyLogisticsAdvisorAgent
from src.agent.adk_framework import AgentContext

console = Console()


def interactive_cli():
    console.print(
        Panel(
            "[bold green]🇩🇪 Welcome to ADK Logistics Advisor Interactive Console[/bold green]\n"
            "Ask questions regarding scheduled package deliveries, weather impacts (Google WeatherNext2),\n"
            "historic traffic bottlenecks, or specific package IDs across Germany.\n\n"
            "Type [bold cyan]'exit'[/bold cyan] or [bold cyan]'quit'[/bold cyan] to terminate.",
            title="Logistics Advisor",
            border_style="green"
        )
    )

    agent = GermanyLogisticsAdvisorAgent()
    context = AgentContext(session_id="cli-session-001")

    # Initial briefing
    briefing = agent.answer_operator_query("overview", context=context)
    console.print(Panel(briefing, title="[bold blue]Initial Shift Briefing[/bold blue]", border_style="blue"))

    while True:
        try:
            query = Prompt.ask("\n[bold yellow]Operator Query[/bold yellow]")
            if not query.strip():
                continue
            if query.lower() in ["exit", "quit", "q"]:
                console.print("[dim]Exiting ADK Logistics Advisor. Gute Fahrt![/dim]")
                break

            response = agent.answer_operator_query(query, context=context)
            console.print(Panel(response, title="[bold green]ADK Advisor Response[/bold green]", border_style="green"))
        except (KeyboardInterrupt, EOFError):
            break


if __name__ == "__main__":
    interactive_cli()
