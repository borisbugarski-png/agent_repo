-- ============================================================================
-- BigQuery Schema Definition for Germany Logistics Advisor Agent
-- Dataset: logistics_germany
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS `logistics_germany`
OPTIONS (
  location = 'europe-west1',
  description = 'Central Data Repository for German Logistics & Delivery Network'
);

-- 1. Logistics Hubs Table
DROP TABLE IF EXISTS `logistics_germany.logistics_hubs`;
CREATE TABLE `logistics_germany.logistics_hubs` (
  hub_id STRING NOT NULL OPTIONS(description="Unique identifier for logistics hub"),
  hub_name STRING NOT NULL OPTIONS(description="Full name of hub facility"),
  city STRING NOT NULL OPTIONS(description="City location"),
  state STRING NOT NULL OPTIONS(description="German federal state (Bundesland)"),
  latitude FLOAT64 NOT NULL OPTIONS(description="Geographic latitude"),
  longitude FLOAT64 NOT NULL OPTIONS(description="Geographic longitude"),
  capacity_daily_parcels INT64 OPTIONS(description="Maximum daily parcel sorting throughput"),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
)
CLUSTER BY city;

-- 2. Historic Traffic Patterns Table
DROP TABLE IF EXISTS `logistics_germany.historic_traffic_patterns`;
CREATE TABLE `logistics_germany.historic_traffic_patterns` (
  corridor_id STRING NOT NULL OPTIONS(description="Highway corridor ID (e.g. A9_MUC_NUE)"),
  corridor_name STRING NOT NULL OPTIONS(description="Autobahn corridor name"),
  origin_region STRING NOT NULL OPTIONS(description="Origin region/hub"),
  dest_region STRING NOT NULL OPTIONS(description="Destination region/hub"),
  typical_rush_hour_bottlenecks STRING OPTIONS(description="Known recurring bottleneck zones"),
  base_speed_kmh FLOAT64 NOT NULL OPTIONS(description="Standard freeflow speed in km/h"),
  rush_hour_speed_kmh FLOAT64 NOT NULL OPTIONS(description="Average rush hour speed in km/h"),
  historical_accident_risk_factor FLOAT64 NOT NULL OPTIONS(description="1.0 baseline, >1.0 elevated accident probability"),
  weather_sensitivity_multiplier FLOAT64 NOT NULL OPTIONS(description="Multiplier for weather-induced slowdown")
)
CLUSTER BY corridor_id;

-- 3. Scheduled Deliveries Table
DROP TABLE IF EXISTS `logistics_germany.scheduled_deliveries`;
CREATE TABLE `logistics_germany.scheduled_deliveries` (
  delivery_id STRING NOT NULL OPTIONS(description="Unique delivery job identifier"),
  package_id STRING NOT NULL OPTIONS(description="Tracking identifier for package"),
  client_name STRING NOT NULL OPTIONS(description="Corporate or retail client sender"),
  recipient_name STRING NOT NULL OPTIONS(description="Consignee / recipient"),
  origin_hub_id STRING NOT NULL OPTIONS(description="Origin distribution center"),
  origin_city STRING NOT NULL,
  destination_address STRING NOT NULL,
  destination_city STRING NOT NULL,
  destination_postal_code STRING NOT NULL,
  destination_lat FLOAT64 NOT NULL,
  destination_lon FLOAT64 NOT NULL,
  scheduled_departure TIMESTAMP NOT NULL,
  scheduled_delivery_window_start TIMESTAMP NOT NULL,
  scheduled_delivery_window_end TIMESTAMP NOT NULL,
  primary_transit_corridor STRING NOT NULL OPTIONS(description="Primary Autobahn route corridor"),
  estimated_transit_hours FLOAT64 NOT NULL,
  package_priority STRING NOT NULL OPTIONS(description="EXPRESS_SAME_DAY, EXPRESS_NEXT_DAY, STANDARD, TEMPERATURE_SENSITIVE"),
  status STRING NOT NULL OPTIONS(description="SCHEDULED_PENDING, DISPATCHED_IN_TRANSIT, OUT_FOR_DELIVERY")
)
PARTITION BY DATE(scheduled_delivery_window_start)
CLUSTER BY primary_transit_corridor, destination_city, package_priority;

-- 4. Completed Deliveries Table (Historical Performance Baseline)
DROP TABLE IF EXISTS `logistics_germany.completed_deliveries`;
CREATE TABLE `logistics_germany.completed_deliveries` (
  delivery_id STRING NOT NULL,
  package_id STRING NOT NULL,
  origin_city STRING NOT NULL,
  destination_city STRING NOT NULL,
  transit_corridor STRING NOT NULL,
  scheduled_delivery_time TIMESTAMP NOT NULL,
  actual_delivery_time TIMESTAMP NOT NULL,
  delay_minutes INT64 NOT NULL,
  weather_condition_encountered STRING NOT NULL,
  traffic_condition_encountered STRING NOT NULL,
  delivery_status STRING NOT NULL OPTIONS(description="DELIVERED_ON_TIME, DELIVERED_DELAYED")
)
PARTITION BY DATE(scheduled_delivery_time)
CLUSTER BY transit_corridor, delivery_status;

