🇩🇪 ADK Logistics Delivery Advisor Agent — Overview
The ADK Germany Logistics Advisor is an intelligent AI co-pilot designed for logistics dispatchers and operations teams managing package delivery networks across Germany.

The agent proactively evaluates active shipments against real-time predictive atmospheric models and historical traffic bottlenecks, forecasting delays before they happen and providing actionable mitigation strategies to protect delivery SLAs.

🌟 Core Capabilities
Centralized Data Intelligence via BigQuery:

Connects to Google Cloud BigQuery (logistics_germany) containing logistics distribution hubs, scheduled shipments, and historical delivery performance across Germany.
Tracks package metadata, priority tiers (TEMPERATURE_SENSITIVE, EXPRESS_SAME_DAY, EXPRESS_NEXT_DAY, STANDARD), route corridors, and customer SLA delivery windows.
Google WeatherNext2 AI Forecasting:

Ingests high-resolution atmospheric predictions from Google's WeatherNext2 model.
Identifies localized weather hazards across German transit corridors (convective squall lines and hail in Bavaria, gale-force crosswinds in Hamburg/Lower Saxony, cloud-base fog over the Swabian Alb, and torrential downpours in the Rhineland).
Historic Autobahn Traffic Analytics:

Cross-references historical congestion patterns and rush-hour bottlenecks on major German arteries (A1, A2, A3, A5, A7, A8, A9, A10).
Calculates compound delay multipliers where severe weather intersects with known high-friction bottleneck zones (e.g. Dreieck Holledau, Elbtunnel, Frankfurter Kreuz, Albaufstieg).
Predictive SLA & Cold-Chain Protection:

SLA Breach Warnings: Calculates compound delay minutes and flags packages at risk of missing their guaranteed delivery window.
Temperature-Sensitive / Pharma Alerts: Specifically monitors medical and cold-chain shipments (e.g. BioNTech, UKE Hamburg, LMU Großhadern) to safeguard active cooling unit limits.
Actionable Operator Advisories & Client Communications:

Recommends concrete interventions (rerouting, driver advisories, last-mile courier reassignment).
Automatically drafts customized recipient ETA update notifications.


Questions to ask:

- overview
- Give me a live shift briefing for the dispatch operator
- What are the top 5 delayed packages requiring immediate operator action?
- What delivieries are in transit around Munich?
- What deliviery/packages are at risk of temperature deviation?
- What deliviery/packages are at risk of SLA breach?
- What deliviery/packages are at risk of not making the delivery window?
- Show pharma packages
- Assess PKG-DE-1001