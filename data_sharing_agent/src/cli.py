"""Interactive Rich CLI for the Data Sharing Agent (Data Mesh & Conversational Analytics)."""

import argparse
import sys
from rich.console import Console
from rich.markdown import Markdown
from rich.panel import Panel
from rich.table import Table

from src.governance.personas import (
    get_store_manager_persona,
    get_regional_manager_persona,
    get_admin_persona,
    STORE_METADATA,
    REGION_METADATA,
    StakeholderPersona,
)
from src.governance.policy_engine import POLICY_ENGINE
from src.agent.tools import build_stakeholder_briefing
from src.agent.data_sharing_agent import DATA_SHARING_AGENT

console = Console()


def print_briefing(persona: StakeholderPersona) -> None:
    briefing = build_stakeholder_briefing(persona)
    console.print(
        Panel(
            Markdown(briefing["markdown"]),
            title=f"[bold cyan]Data Mesh Live Stakeholder Briefing ({persona.role.value})[/bold cyan]",
            border_style="cyan",
            padding=(1, 2),
        )
    )


def print_audit_log() -> None:
    if not POLICY_ENGINE.audit_log:
        console.print("[yellow]No governance audit events recorded yet.[/yellow]")
        return
    table = Table(title="🛡️ Data Mesh Governance Audit Log", show_lines=True)
    table.add_column("Timestamp", style="dim", width=19)
    table.add_column("Role & Scope", style="cyan", width=28)
    table.add_column("Status", width=18)
    table.add_column("Action / Governance Note", style="white")

    for ev in POLICY_ENGINE.audit_log[:10]:
        status_badge = (
            f"[green]{ev.status}[/green]"
            if ev.status == "ALLOWED"
            else (
                f"[blue]{ev.status}[/blue]"
                if ev.status == "RLS_APPLIED"
                else f"[bold red]{ev.status}[/bold red]"
            )
        )
        table.add_row(
            ev.timestamp,
            f"{ev.role}\n({ev.scope})",
            status_badge,
            f"{ev.action}\n[dim]{ev.governance_note}[/dim]",
        )
    console.print(table)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Data Sharing Agent — Conversational Analytics CLI")
    parser.add_argument(
        "--role",
        choices=["store", "region", "admin"],
        default="store",
        help="Initial stakeholder role (store, region, or admin). Default: store",
    )
    parser.add_argument(
        "--store-id",
        type=int,
        default=2,
        help="Store ID (1-10) when --role=store. Default: 2 (Chicago IL)",
    )
    parser.add_argument(
        "--region-id",
        type=str,
        default="SOUTH_CENTRAL",
        help="Region ID (NORTHEAST, MIDWEST, SOUTH_CENTRAL, SOUTHEAST, WEST) when --role=region.",
    )
    parser.add_argument(
        "--query",
        type=str,
        default=None,
        help="Optional single query to execute non-interactively and exit.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()

    if args.role == "admin":
        persona = get_admin_persona()
    elif args.role == "region":
        persona = get_regional_manager_persona(args.region_id.upper())
    else:
        persona = get_store_manager_persona(args.store_id)

    if args.query:
        resp = DATA_SHARING_AGENT.answer_question(persona, args.query)
        console.print(Panel(Markdown(resp.content), title=f"[bold green]{persona.title}[/bold green]", border_style="green"))
        return

    # Interactive Mode
    print_briefing(persona)

    console.print(
        "\n[bold yellow]💡 Interactive Commands:[/bold yellow]\n"
        "  • Ask any natural language question (e.g. [italic]'What are my top selling categories?'[/italic], [italic]'Show Houston TX revenue'[/italic])\n"
        "  • Switch persona: [bold]role store <1-10>[/bold] | [bold]role region <NORTHEAST|MIDWEST|SOUTH_CENTRAL|SOUTHEAST|WEST>[/bold] | [bold]role admin[/bold]\n"
        "  • Inspect governance audit log: [bold]audit[/bold] | Refresh briefing: [bold]briefing[/bold] | Quit: [bold]exit[/bold]\n"
    )

    while True:
        try:
            prompt_label = f"[bold cyan][{persona.role.value} | {POLICY_ENGINE.get_scope_label(persona)}][/bold cyan] Query: "
            user_input = console.input(prompt_label).strip()
        except (EOFError, KeyboardInterrupt):
            console.print("\nExiting Data Sharing Agent. Goodbye!")
            break

        if not user_input:
            continue

        cmd_lower = user_input.lower()
        if cmd_lower in ("exit", "quit", "q"):
            console.print("Exiting Data Sharing Agent. Goodbye!")
            break

        if cmd_lower == "audit":
            print_audit_log()
            continue

        if cmd_lower == "briefing":
            print_briefing(persona)
            continue

        if cmd_lower.startswith("role "):
            parts = user_input.split()
            if len(parts) >= 2:
                target_role = parts[1].lower()
                if target_role == "admin":
                    persona = get_admin_persona()
                    console.print(f"[green]Switched active persona to: {persona.title}[/green]")
                    print_briefing(persona)
                elif target_role == "store":
                    s_id = int(parts[2]) if len(parts) >= 3 and parts[2].isdigit() else 2
                    if s_id not in STORE_METADATA:
                        console.print(f"[red]Invalid store ID {s_id}. Choose 1-10.[/red]")
                    else:
                        persona = get_store_manager_persona(s_id)
                        console.print(f"[green]Switched active persona to: {persona.title}[/green]")
                        print_briefing(persona)
                elif target_role == "region":
                    r_id = parts[2].upper() if len(parts) >= 3 else "SOUTH_CENTRAL"
                    if r_id not in REGION_METADATA:
                        console.print(f"[red]Invalid region ID {r_id}. Choose from {list(REGION_METADATA.keys())}.[/red]")
                    else:
                        persona = get_regional_manager_persona(r_id)
                        console.print(f"[green]Switched active persona to: {persona.title}[/green]")
                        print_briefing(persona)
            continue

        # Answer analytical query
        with console.status("[bold blue]Enforcing Data Mesh Governance & querying BigQuery Data Products...[/bold blue]"):
            resp = DATA_SHARING_AGENT.answer_question(persona, user_input)

        border_col = "red" if resp.policy_status == "CROSS_BOUNDARY_BLOCKED" else "green"
        console.print(
            Panel(
                Markdown(resp.content),
                title=f"[bold {border_col}]Data Mesh Conversational Analytics ({resp.policy_status})[/bold {border_col}]",
                border_style=border_col,
                padding=(1, 2),
            )
        )
        if resp.governed_sql:
            console.print(f"[dim]Governed SQL Executed:[/dim] [italic cyan]{resp.governed_sql}[/italic cyan]\n")


if __name__ == "__main__":
    main()
