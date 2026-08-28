#!/usr/bin/env python3
"""
Interactive CLI for Logistics Operators to query the ADK Advisor Agent.
Includes simulated 2-second animated reasoning progress bar for real-time operator feedback.
"""

import sys
import os
import time

# Ensure project root is in sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from rich.console import Console
from rich.panel import Panel
from rich.prompt import Prompt
from rich.progress import Progress, SpinnerColumn, BarColumn, TextColumn, TaskProgressColumn

from src.agent.advisor_agent import GermanyLogisticsAdvisorAgent
from src.agent.adk_framework import AgentContext

console = Console()



def show_reasoning_progress_bar():
    """
    Displays a sleek 2-second animated progress bar illustrating
    ADK agent reasoning, BigQuery lookups, WeatherNext2 integration, and traffic modeling.
    """
    with Progress(
        SpinnerColumn(spinner_name="dots"),
        TextColumn("[bold cyan]{task.description}[/bold cyan]"),
        BarColumn(bar_width=30, style="dim white", complete_style="cyan", finished_style="bold green"),
        TaskProgressColumn(),
        console=console,
        transient=True
    ) as progress:
        task = progress.add_task("Initializing ADK reasoning...", total=100)
        
        stages = [
            (25, "🔍 Querying BigQuery logistics repository..."),
            (55, "⛈️ Ingesting Google WeatherNext2 atmospheric radar..."),
            (80, "🚦 Analyzing historic Autobahn traffic bottlenecks..."),
            (100, "🧠 Formulating dispatch operator advisory..."),
        ]
        
        for target_pct, stage_text in stages:
            progress.update(task, description=stage_text)
            current = progress.tasks[0].completed
            step_increment = 2.5
            while current < target_pct:
                progress.advance(task, step_increment)
                current += step_increment
                time.sleep(0.025)  # Total 40 steps * 0.025s = 1.0 second


def interactive_cli():
    console.print(
        Panel(
            "[bold green]Welcome to Logistics Delivery Advisor powered by Google Cloud[/bold green]\n"
            "Ask questions regarding scheduled package deliveries, weather impacts (Google WeatherNext2),\n"
            "historic traffic bottlenecks, or specific package IDs across Germany.\n\n"
            "Type [bold cyan]'exit'[/bold cyan] or [bold cyan]'quit'[/bold cyan] to terminate.",
            title="Logistics Delivery Advisor powered by Google Cloud",
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

            # 2-second animated reasoning progress bar
            show_reasoning_progress_bar()

            response = agent.answer_operator_query(query, context=context)
            console.print(Panel(response, title="[bold green]ADK Advisor Response[/bold green]", border_style="green"))
        except (KeyboardInterrupt, EOFError):
            break


if __name__ == "__main__":
    interactive_cli()
