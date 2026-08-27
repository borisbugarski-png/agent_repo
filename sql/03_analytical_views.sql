-- ============================================================================
-- BigQuery Analytical Views for Logistics Advisor Operations
-- ============================================================================

-- 1. Corridor Reliability & Weather Vulnerability View
CREATE OR REPLACE VIEW `logistics_germany.v_corridor_historical_reliability` AS
SELECT
  transit_corridor,
  COUNT(delivery_id) AS total_deliveries,
  COUNTIF(delivery_status = 'DELIVERED_DELAYED') AS delayed_deliveries,
  ROUND(COUNTIF(delivery_status = 'DELIVERED_DELAYED') / COUNT(delivery_id) * 100, 1) AS delay_percentage,
  ROUND(AVG(delay_minutes), 1) AS avg_delay_minutes,
  ROUND(AVG(CASE WHEN delivery_status = 'DELIVERED_DELAYED' THEN delay_minutes ELSE NULL END), 1) AS avg_delayed_only_minutes,
  ARRAY_AGG(DISTINCT weather_condition_encountered IGNORE NULLS) AS adverse_weather_conditions_recorded
FROM
  `logistics_germany.completed_deliveries`
GROUP BY
  transit_corridor;

-- 2. Priority Scheduled Deliveries by Transit Corridor
CREATE OR REPLACE VIEW `logistics_germany.v_active_scheduled_priority_deliveries` AS
SELECT
  sd.delivery_id,
  sd.package_id,
  sd.client_name,
  sd.origin_city,
  sd.destination_city,
  sd.primary_transit_corridor,
  tp.corridor_name,
  tp.typical_rush_hour_bottlenecks,
  tp.historical_accident_risk_factor,
  tp.weather_sensitivity_multiplier,
  sd.package_priority,
  sd.status,
  sd.scheduled_departure,
  sd.scheduled_delivery_window_start,
  sd.scheduled_delivery_window_end,
  sd.estimated_transit_hours
FROM
  `logistics_germany.scheduled_deliveries` sd
LEFT JOIN
  `logistics_germany.historic_traffic_patterns` tp
  ON sd.primary_transit_corridor = tp.corridor_id
ORDER BY
  CASE sd.package_priority
    WHEN 'TEMPERATURE_SENSITIVE' THEN 1
    WHEN 'EXPRESS_SAME_DAY' THEN 2
    WHEN 'EXPRESS_NEXT_DAY' THEN 3
    ELSE 4
  END,
  sd.scheduled_delivery_window_start ASC;
