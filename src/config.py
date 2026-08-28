"""
Configuration settings for ADK Logistics Advisor Agent.
Supports GCP BigQuery integration and local environment settings.
"""

import os
from dataclasses import dataclass

@dataclass
class Config:
    # Google Cloud Project Configuration
    GCP_PROJECT_ID: str = os.getenv("GCP_PROJECT_ID", "lustrous-stone-417013")
    BIGQUERY_DATASET: str = os.getenv("BIGQUERY_DATASET", "logistics_germany")
    BIGQUERY_LOCATION: str = os.getenv("BIGQUERY_LOCATION", "europe-west1")
    
    # Execution Mode: 'bigquery' or 'mock' (defaults to mock if credentials not configured)
    DATA_SOURCE_MODE: str = os.getenv("DATA_SOURCE_MODE", "auto")
    
    # WeatherNext2 API settings
    WEATHERNEXT2_API_KEY: str = os.getenv("WEATHERNEXT2_API_KEY", "mock_key_google_weathernext2")
    WEATHERNEXT2_SIMULATION_SCENARIO: str = os.getenv("WEATHERNEXT2_SCENARIO", "STORM_FRONT_SOUTH_WEST")
    
    # Agent Parameters
    AGENT_NAME: str = "Logistics Delivery Advisor powered by Google Cloud"
    MAX_REASONING_STEPS: int = 5

    DELAY_THRESHOLD_MINUTES_FLAG: int = 25  # Flag operator if delay exceeds 25 mins

config = Config()
