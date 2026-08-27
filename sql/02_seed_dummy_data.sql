-- ============================================================================
-- BigQuery Seed Data for German Logistics Network (<100 Records Total)
-- Includes Dedicated Metropolitan & Regional Hamburg Package Deliveries
-- ============================================================================

-- 1. Insert 8 Logistics Hubs
INSERT INTO `logistics_germany.logistics_hubs` (hub_id, hub_name, city, state, latitude, longitude, capacity_daily_parcels)
VALUES
  ('HUB-HAM', 'Hamburg Port & North Logistics (Billbrook)', 'Hamburg', 'Hamburg', 53.5511, 9.9937, 40000),
  ('HUB-BER', 'Berlin Central Hub (Ludwigsfelde)', 'Berlin', 'Berlin', 52.5200, 13.4050, 45000),
  ('HUB-MUC', 'Munich South Gateway (Garching)', 'Munich', 'Bavaria', 48.1351, 11.5820, 50000),
  ('HUB-FRA', 'Frankfurt CargoCity Cargo Hub', 'Frankfurt', 'Hesse', 50.1109, 8.6821, 65000),
  ('HUB-CGN', 'Cologne/Bonn Rhineland Crossdock', 'Cologne', 'North Rhine-Westphalia', 50.9375, 6.9603, 38000),
  ('HUB-STR', 'Stuttgart Neckar Distribution Center', 'Stuttgart', 'Baden-Württemberg', 48.7758, 9.1829, 32000),
  ('HUB-LEJ', 'Leipzig/Halle Air & Overland Hub', 'Leipzig', 'Saxony', 51.3397, 12.3731, 55000),
  ('HUB-NUE', 'Nuremberg Franconia Express Hub', 'Nuremberg', 'Bavaria', 49.4521, 11.0767, 30000);

-- 2. Insert 8 Historic Traffic Patterns
INSERT INTO `logistics_germany.historic_traffic_patterns` (corridor_id, corridor_name, origin_region, dest_region, typical_rush_hour_bottlenecks, base_speed_kmh, rush_hour_speed_kmh, historical_accident_risk_factor, weather_sensitivity_multiplier)
VALUES
  ('COR-A7', 'A7 Hamburg - Hanover - Kassel - Ulm', 'Hamburg', 'Lower Saxony / Hesse', 'Elbtunnel, Waltershof, Kasseler Berge, Salzgitter triangle', 110.0, 55.0, 1.40, 1.50),
  ('COR-A1', 'A1 Cologne - Dortmund - Bremen - Hamburg', 'NRW', 'Hamburg / Bremen', 'Harburg Kreuz, Moorfleet, Leverkusen Bridge, Bremen Kreuz', 105.0, 48.0, 1.55, 1.35),
  ('COR-A9', 'A9 Munich - Nuremberg - Leipzig - Berlin', 'Bavaria', 'Berlin/Saxony', 'Dreieck Holledau, Kindinger Berg, Hermsdorfer Kreuz', 115.0, 65.0, 1.35, 1.45),
  ('COR-A3', 'A3 Frankfurt - Würzburg - Nuremberg / Cologne', 'Hesse', 'NRW / Bavaria', 'Frankfurter Kreuz, Spessart ascent, Heumar', 110.0, 50.0, 1.50, 1.40),
  ('COR-A8', 'A8 Karlsruhe - Stuttgart - Ulm - Munich', 'Baden-Württemberg', 'Bavaria', 'Drackensteiner Hang, Albaufstieg, Stuttgart Kreuz', 105.0, 45.0, 1.60, 1.60),
  ('COR-A2', 'A2 Oberhausen - Dortmund - Hanover - Berlin', 'NRW', 'Lower Saxony / Berlin', 'Kamener Kreuz, Braunschweig, Bad Oeynhausen', 100.0, 52.0, 1.45, 1.30),
  ('COR-A5', 'A5 Frankfurt - Darmstadt - Karlsruhe - Basel', 'Hesse', 'Baden-Württemberg', 'Darmstädter Kreuz, Walldorf, Heidelberg', 115.0, 60.0, 1.25, 1.20),
  ('COR-A10', 'A10 Berliner Ring Orbital', 'Berlin', 'Brandenburg', 'Dreieck Havelland, Schönefelder Kreuz', 110.0, 68.0, 1.20, 1.25);

-- 3. Insert 35 Scheduled Deliveries (Featuring Major Hamburg Logistics Nodes)
INSERT INTO `logistics_germany.scheduled_deliveries` (delivery_id, package_id, client_name, recipient_name, origin_hub_id, origin_city, destination_address, destination_city, destination_postal_code, destination_lat, destination_lon, scheduled_departure, scheduled_delivery_window_start, scheduled_delivery_window_end, primary_transit_corridor, estimated_transit_hours, package_priority, status)
VALUES
  -- Dedicated Hamburg Deliveries
  ('DEL-20260827-001', 'PKG-DE-HAM-01', 'Airbus Commercial Aircraft (Finkenwerder)', 'Lufthansa Technik AG (Airport)', 'HUB-HAM', 'Hamburg', 'Weg beim Jäger 193', 'Hamburg', '22335', 53.6336, 9.9961, '2026-08-27 18:30:00 UTC', '2026-08-27 19:45:00 UTC', '2026-08-27 20:30:00 UTC', 'COR-A7', 0.9, 'EXPRESS_SAME_DAY', 'DISPATCHED_IN_TRANSIT'),
  ('DEL-20260827-002', 'PKG-DE-HAM-02', 'Universitätsklinikum Hamburg (UKE)', 'Asklepios Klinik Barmbek', 'HUB-HAM', 'Hamburg', 'Rübenkamp 220', 'Hamburg', '22291', 53.6047, 10.0436, '2026-08-27 19:00:00 UTC', '2026-08-27 20:00:00 UTC', '2026-08-27 20:45:00 UTC', 'COR-A7', 0.7, 'TEMPERATURE_SENSITIVE', 'DISPATCHED_IN_TRANSIT'),
  ('DEL-20260827-003', 'PKG-DE-HAM-03', 'Hafen Hamburg Container Terminal (CTA)', 'Kühne + Nagel Central Logistics', 'HUB-HAM', 'Hamburg', 'Großer Grasbrook 17', 'Hamburg', '20457', 53.5412, 9.9958, '2026-08-27 18:45:00 UTC', '2026-08-27 20:15:00 UTC', '2026-08-27 21:00:00 UTC', 'COR-A7', 0.8, 'EXPRESS_SAME_DAY', 'DISPATCHED_IN_TRANSIT'),
  ('DEL-20260827-004', 'PKG-DE-HAM-04', 'Beiersdorf AG Eimsbüttel', 'Budnikowsky Logistikzentrum', 'HUB-HAM', 'Hamburg', 'Sperlsdeicher Weg 11', 'Hamburg', '21109', 53.4981, 10.0211, '2026-08-27 19:30:00 UTC', '2026-08-27 21:00:00 UTC', '2026-08-27 22:00:00 UTC', 'COR-A1', 1.1, 'STANDARD', 'SCHEDULED_PENDING'),
  ('DEL-20260827-005', 'PKG-DE-HAM-05', 'NXP Semiconductors Hamburg', 'Philips Medical Systems', 'HUB-HAM', 'Hamburg', 'Röntgenstraße 24', 'Hamburg', '22335', 53.6312, 10.0124, '2026-08-27 20:00:00 UTC', '2026-08-27 21:15:00 UTC', '2026-08-27 22:00:00 UTC', 'COR-A7', 0.8, 'EXPRESS_SAME_DAY', 'SCHEDULED_PENDING'),
  ('DEL-20260827-006', 'PKG-DE-HAM-06', 'Otto Group Bramfeld', 'Elbphilharmonie Hamburg', 'HUB-HAM', 'Hamburg', 'Platz der Deutschen Einheit 1', 'Hamburg', '20457', 53.5413, 9.9841, '2026-08-27 19:15:00 UTC', '2026-08-27 20:45:00 UTC', '2026-08-27 21:45:00 UTC', 'COR-A1', 0.9, 'STANDARD', 'DISPATCHED_IN_TRANSIT'),
  ('DEL-20260827-007', 'PKG-DE-HAM-07', 'Aurubis AG Kupferwerk Veddel', 'Jungheinrich AG Zentrale', 'HUB-HAM', 'Hamburg', 'Friedrich-Ebert-Damm 129', 'Hamburg', '22047', 53.5874, 10.0987, '2026-08-27 19:45:00 UTC', '2026-08-27 21:15:00 UTC', '2026-08-27 22:15:00 UTC', 'COR-A1', 1.0, 'STANDARD', 'SCHEDULED_PENDING'),
  ('DEL-20260827-008', 'PKG-DE-HAM-08', 'Dräger Medical Diagnostic', 'Kinder-UKE Universitätsklinik', 'HUB-HAM', 'Hamburg', 'Martinistraße 52', 'Hamburg', '20246', 53.5912, 9.9774, '2026-08-27 20:15:00 UTC', '2026-08-27 21:30:00 UTC', '2026-08-27 22:15:00 UTC', 'COR-A7', 0.7, 'TEMPERATURE_SENSITIVE', 'OUT_FOR_DELIVERY'),
  ('DEL-20260827-009', 'PKG-DE-HAM-09', 'Montblanc International', 'Alsterhaus Luxury Department', 'HUB-HAM', 'Hamburg', 'Jungfernstieg 16', 'Hamburg', '20354', 53.5532, 9.9912, '2026-08-27 20:30:00 UTC', '2026-08-27 21:30:00 UTC', '2026-08-27 22:15:00 UTC', 'COR-A7', 0.6, 'EXPRESS_SAME_DAY', 'OUT_FOR_DELIVERY'),
  ('DEL-20260827-010', 'PKG-DE-HAM-10', 'Tchibo Logistics Hub', 'REWE Logistik Center Nord', 'HUB-HAM', 'Hamburg', 'Billbrookdeich 36', 'Hamburg', '22113', 53.5321, 10.0891, '2026-08-27 20:45:00 UTC', '2026-08-27 21:45:00 UTC', '2026-08-27 22:30:00 UTC', 'COR-A1', 0.7, 'STANDARD', 'OUT_FOR_DELIVERY'),
  -- Hamburg Cross-Regional Arteries
  ('DEL-20260827-011', 'PKG-DE-1002', 'BMW AG Parts', 'Autohaus Hamburg-Nord', 'HUB-MUC', 'Munich', 'Nedderfeld 45', 'Hamburg', '22529', 53.5982, 9.9721, '2026-08-27 18:30:00 UTC', '2026-08-28 02:00:00 UTC', '2026-08-28 04:00:00 UTC', 'COR-A7', 7.5, 'EXPRESS_NEXT_DAY', 'SCHEDULED_PENDING'),
  ('DEL-20260827-012', 'PKG-DE-1007', 'Otto Group', 'Erika Meier', 'HUB-HAM', 'Hamburg', 'Zeil 106', 'Frankfurt', '60313', 50.1141, 8.6865, '2026-08-27 18:00:00 UTC', '2026-08-27 23:45:00 UTC', '2026-08-28 01:15:00 UTC', 'COR-A7', 5.0, 'STANDARD', 'DISPATCHED_IN_TRANSIT'),
  ('DEL-20260827-013', 'PKG-DE-1008', 'Airbus Operations', 'MTU Aero Engines', 'HUB-HAM', 'Hamburg', 'Dachauer Str. 665', 'Munich', '80995', 48.1887, 11.5122, '2026-08-27 18:30:00 UTC', '2026-08-28 03:00:00 UTC', '2026-08-28 04:30:00 UTC', 'COR-A7', 7.8, 'EXPRESS_NEXT_DAY', 'SCHEDULED_PENDING'),
  ('DEL-20260827-014', 'PKG-DE-1014', 'Drägerwerk AG', 'Universitätsklinikum Regensburg', 'HUB-HAM', 'Hamburg', 'Franz-Josef-Strauß-Allee 11', 'Regensburg', '93053', 48.9892, 12.0911, '2026-08-27 18:00:00 UTC', '2026-08-28 01:30:00 UTC', '2026-08-28 03:00:00 UTC', 'COR-A9', 6.8, 'TEMPERATURE_SENSITIVE', 'DISPATCHED_IN_TRANSIT'),
  ('DEL-20260827-015', 'PKG-DE-1015', 'Continental AG', 'Audi AG Forum', 'HUB-HAM', 'Hamburg', 'Auto-Union-Straße 1', 'Ingolstadt', '85057', 48.7842, 11.4132, '2026-08-27 18:15:00 UTC', '2026-08-28 01:45:00 UTC', '2026-08-28 03:15:00 UTC', 'COR-A7', 6.5, 'EXPRESS_NEXT_DAY', 'SCHEDULED_PENDING'),
  ('DEL-20260827-016', 'PKG-DE-1019', 'Beiersdorf AG', 'Rossmann Logistik', 'HUB-HAM', 'Hamburg', 'Isernhägener Str. 16', 'Burgwedel', '30938', 52.4931, 9.8541, '2026-08-27 19:45:00 UTC', '2026-08-27 21:30:00 UTC', '2026-08-27 22:30:00 UTC', 'COR-A7', 1.5, 'STANDARD', 'DISPATCHED_IN_TRANSIT'),
  ('DEL-20260827-017', 'PKG-DE-1028', 'Sartorius AG', 'Bayer Pharma Berlin', 'HUB-HAM', 'Hamburg', 'Müllerstraße 178', 'Berlin', '13353', 52.5441, 13.3571, '2026-08-27 19:00:00 UTC', '2026-08-27 22:45:00 UTC', '2026-08-28 00:00:00 UTC', 'COR-A10', 3.2, 'TEMPERATURE_SENSITIVE', 'SCHEDULED_PENDING'),
  ('DEL-20260827-018', 'PKG-DE-1031', 'Hapag-Lloyd Logistik', 'Bremische Hafengesellschaft', 'HUB-HAM', 'Hamburg', 'Senator-Borttscheller-Str.', 'Bremerhaven', '27568', 53.5489, 8.5812, '2026-08-27 20:00:00 UTC', '2026-08-27 22:00:00 UTC', '2026-08-27 23:00:00 UTC', 'COR-A1', 1.8, 'STANDARD', 'DISPATCHED_IN_TRANSIT'),
  -- Other Key National Routes
  ('DEL-20260827-019', 'PKG-DE-1001', 'Siemens Healthineers', 'Charité Universitätsmedizin', 'HUB-MUC', 'Munich', 'Charitéplatz 1', 'Berlin', '10117', 52.5256, 13.3777, '2026-08-27 18:00:00 UTC', '2026-08-27 23:30:00 UTC', '2026-08-28 01:00:00 UTC', 'COR-A9', 5.5, 'TEMPERATURE_SENSITIVE', 'DISPATCHED_IN_TRANSIT'),
  ('DEL-20260827-020', 'PKG-DE-1003', 'BioNTech SE', 'Universitätsklinikum Freiburg', 'HUB-FRA', 'Frankfurt', 'Hugstetter Str. 55', 'Freiburg', '79106', 48.0069, 7.8378, '2026-08-27 19:00:00 UTC', '2026-08-27 22:00:00 UTC', '2026-08-27 23:30:00 UTC', 'COR-A5', 2.8, 'TEMPERATURE_SENSITIVE', 'SCHEDULED_PENDING'),
  ('DEL-20260827-021', 'PKG-DE-1004', 'Zalando Logistics', 'Klaus Weber', 'HUB-BER', 'Berlin', 'Maximilianstraße 12', 'Munich', '80539', 48.1391, 11.5802, '2026-08-27 18:00:00 UTC', '2026-08-28 00:30:00 UTC', '2026-08-28 02:30:00 UTC', 'COR-A9', 5.8, 'STANDARD', 'DISPATCHED_IN_TRANSIT'),
  ('DEL-20260827-022', 'PKG-DE-1005', 'Bosch Automotive', 'Porsche Werk Leipzig', 'HUB-STR', 'Stuttgart', 'Porschestraße 1', 'Leipzig', '04158', 51.4022, 12.2981, '2026-08-27 19:15:00 UTC', '2026-08-28 00:45:00 UTC', '2026-08-28 02:00:00 UTC', 'COR-A9', 4.8, 'EXPRESS_SAME_DAY', 'SCHEDULED_PENDING'),
  ('DEL-20260827-023', 'PKG-DE-1006', 'Merck KGaA', 'Bayer AG Pharma Campus', 'HUB-FRA', 'Frankfurt', 'Kaiser-Wilhelm-Allee 1', 'Leverkusen', '51373', 51.0156, 6.9839, '2026-08-27 19:30:00 UTC', '2026-08-27 21:45:00 UTC', '2026-08-27 22:45:00 UTC', 'COR-A3', 2.1, 'EXPRESS_SAME_DAY', 'DISPATCHED_IN_TRANSIT'),
  ('DEL-20260827-024', 'PKG-DE-1009', 'BASF SE', 'Henkel AG & Co.', 'HUB-FRA', 'Frankfurt', 'Henkelstraße 67', 'Düsseldorf', '40589', 51.1738, 6.8372, '2026-08-27 20:00:00 UTC', '2026-08-27 22:30:00 UTC', '2026-08-27 23:30:00 UTC', 'COR-A3', 2.4, 'STANDARD', 'SCHEDULED_PENDING'),
  ('DEL-20260827-025', 'PKG-DE-1010', 'Infineon Technologies', 'SAP SE HQ', 'HUB-MUC', 'Munich', 'Dietmar-Hopp-Allee 16', 'Walldorf', '69190', 49.2934, 8.6425, '2026-08-27 18:45:00 UTC', '2026-08-27 22:30:00 UTC', '2026-08-27 23:45:00 UTC', 'COR-A8', 3.3, 'EXPRESS_SAME_DAY', 'DISPATCHED_IN_TRANSIT'),
  ('DEL-20260827-026', 'PKG-DE-1012', 'Brose Fahrzeugteile', 'Mercedes-Benz Group', 'HUB-NUE', 'Nuremberg', 'Mercedesstraße 120', 'Stuttgart', '70372', 48.7909, 9.2319, '2026-08-27 19:30:00 UTC', '2026-08-27 22:15:00 UTC', '2026-08-27 23:30:00 UTC', 'COR-A8', 2.4, 'EXPRESS_SAME_DAY', 'SCHEDULED_PENDING'),
  ('DEL-20260827-027', 'PKG-DE-1013', 'Amazon Fulfillment', 'Stefan Schmidt', 'HUB-CGN', 'Cologne', 'Kurfürstendamm 195', 'Berlin', '10707', 52.5015, 13.3214, '2026-08-27 18:00:00 UTC', '2026-08-28 00:15:00 UTC', '2026-08-28 01:45:00 UTC', 'COR-A2', 5.7, 'STANDARD', 'DISPATCHED_IN_TRANSIT'),
  ('DEL-20260827-028', 'PKG-DE-1017', 'Fresenius Medical', 'Klinikum Kassel', 'HUB-FRA', 'Frankfurt', 'Mönchebergstraße 41', 'Kassel', '34125', 51.3262, 9.5085, '2026-08-27 20:00:00 UTC', '2026-08-27 22:30:00 UTC', '2026-08-27 23:30:00 UTC', 'COR-A7', 2.0, 'TEMPERATURE_SENSITIVE', 'SCHEDULED_PENDING'),
  ('DEL-20260827-029', 'PKG-DE-1018', 'Würth Elektronik', 'TRUMPF Laser GmbH', 'HUB-STR', 'Stuttgart', 'Johann-Maus-Str. 2', 'Ditzingen', '71254', 48.8242, 9.0712, '2026-08-27 20:15:00 UTC', '2026-08-27 21:15:00 UTC', '2026-08-27 22:00:00 UTC', 'COR-A8', 0.8, 'EXPRESS_SAME_DAY', 'OUT_FOR_DELIVERY'),
  ('DEL-20260827-030', 'PKG-DE-1022', 'Roche Diagnostics', 'Klinikum Augsburg', 'HUB-STR', 'Stuttgart', 'Stenglinstraße 2', 'Augsburg', '86156', 48.3842, 10.8431, '2026-08-27 19:30:00 UTC', '2026-08-27 21:30:00 UTC', '2026-08-27 22:30:00 UTC', 'COR-A8', 1.8, 'TEMPERATURE_SENSITIVE', 'DISPATCHED_IN_TRANSIT'),
  ('DEL-20260827-031', 'PKG-DE-1025', 'Adidas Group', 'SportScheck Flagship Store', 'HUB-NUE', 'Nuremberg', 'Neuhauser Str. 21', 'Munich', '80331', 48.1384, 11.5699, '2026-08-27 20:00:00 UTC', '2026-08-27 22:00:00 UTC', '2026-08-27 23:00:00 UTC', 'COR-A9', 1.7, 'EXPRESS_SAME_DAY', 'SCHEDULED_PENDING'),
  ('DEL-20260827-032', 'PKG-DE-1026', 'Evonik Industries', 'Chempark Dormagen', 'HUB-CGN', 'Cologne', 'Alte Heerstraße', 'Dormagen', '41538', 51.0921, 6.8402, '2026-08-27 20:45:00 UTC', '2026-08-27 21:45:00 UTC', '2026-08-27 22:30:00 UTC', 'COR-A1', 0.8, 'EXPRESS_SAME_DAY', 'OUT_FOR_DELIVERY'),
  ('DEL-20260827-033', 'PKG-DE-1027', 'Helmholtz Zentrum', 'Max Planck Institut Heidelberg', 'HUB-BER', 'Berlin', 'Saupfercheckweg 1', 'Heidelberg', '69117', 49.4001, 8.7103, '2026-08-27 18:00:00 UTC', '2026-08-28 01:15:00 UTC', '2026-08-28 02:45:00 UTC', 'COR-A5', 6.2, 'TEMPERATURE_SENSITIVE', 'DISPATCHED_IN_TRANSIT'),
  ('DEL-20260827-034', 'PKG-DE-1033', 'Carl Zeiss SMT', 'ASML Germany Branch', 'HUB-STR', 'Stuttgart', 'Waldstraße 23', 'Oberkochen', '73447', 48.7841, 10.1039, '2026-08-27 20:45:00 UTC', '2026-08-27 22:00:00 UTC', '2026-08-27 23:00:00 UTC', 'COR-A8', 1.1, 'EXPRESS_SAME_DAY', 'OUT_FOR_DELIVERY'),
  ('DEL-20260827-035', 'PKG-DE-1035', 'Lufthansa Cargo', 'Fraport Ground Handling', 'HUB-FRA', 'Frankfurt', 'Flughafen Gebäude 451', 'Frankfurt', '60549', 50.0379, 8.5622, '2026-08-27 21:00:00 UTC', '2026-08-27 21:45:00 UTC', '2026-08-27 22:30:00 UTC', 'COR-A3', 0.5, 'EXPRESS_SAME_DAY', 'OUT_FOR_DELIVERY');

-- 4. Insert 35 Completed Historical Deliveries
INSERT INTO `logistics_germany.completed_deliveries` (delivery_id, package_id, origin_city, destination_city, transit_corridor, scheduled_delivery_time, actual_delivery_time, delay_minutes, weather_condition_encountered, traffic_condition_encountered, delivery_status)
VALUES
  ('DEL-HIST-001', 'PKG-HIST-01', 'Munich', 'Berlin', 'COR-A9', '2026-08-20 22:00:00 UTC', '2026-08-20 22:10:00 UTC', 10, 'CLEAR', 'NORMAL', 'DELIVERED_ON_TIME'),
  ('DEL-HIST-002', 'PKG-HIST-02', 'Frankfurt', 'Cologne', 'COR-A3', '2026-08-20 21:00:00 UTC', '2026-08-20 22:15:00 UTC', 75, 'HEAVY_RAIN', 'SEVERE_CONGESTION', 'DELIVERED_DELAYED'),
  ('DEL-HIST-003', 'PKG-HIST-03', 'Hamburg', 'Frankfurt', 'COR-A7', '2026-08-21 23:00:00 UTC', '2026-08-22 00:40:00 UTC', 100, 'STORM_GALE', 'ACCIDENT_BLOCKAGE', 'DELIVERED_DELAYED'),
  ('DEL-HIST-004', 'PKG-HIST-04', 'Hamburg', 'Hamburg', 'COR-A7', '2026-08-21 20:30:00 UTC', '2026-08-21 21:25:00 UTC', 55, 'GALE_WINDS', 'ELBTUNNEL_CLOSURE', 'DELIVERED_DELAYED'),
  ('DEL-HIST-005', 'PKG-HIST-05', 'Berlin', 'Hanover', 'COR-A2', '2026-08-22 22:00:00 UTC', '2026-08-22 22:05:00 UTC', 5, 'PARTLY_CLOUDY', 'NORMAL', 'DELIVERED_ON_TIME'),
  ('DEL-HIST-006', 'PKG-HIST-06', 'Cologne', 'Bremen', 'COR-A1', '2026-08-22 21:30:00 UTC', '2026-08-22 22:20:00 UTC', 50, 'MODERATE_RAIN', 'CONGESTION_BRIDGE_WORKS', 'DELIVERED_DELAYED'),
  ('DEL-HIST-007', 'PKG-HIST-07', 'Frankfurt', 'Karlsruhe', 'COR-A5', '2026-08-23 20:00:00 UTC', '2026-08-23 20:08:00 UTC', 8, 'CLEAR', 'NORMAL', 'DELIVERED_ON_TIME'),
  ('DEL-HIST-008', 'PKG-HIST-08', 'Hamburg', 'Hamburg', 'COR-A1', '2026-08-23 21:30:00 UTC', '2026-08-23 22:18:00 UTC', 48, 'RAIN_SQUALLS', 'HARBURG_RUSH_HOUR', 'DELIVERED_DELAYED'),
  ('DEL-HIST-009', 'PKG-HIST-09', 'Munich', 'Nuremberg', 'COR-A9', '2026-08-23 22:00:00 UTC', '2026-08-23 23:20:00 UTC', 80, 'HEAVY_SNOWFALL', 'STANDSTILL_HOLLEDAU', 'DELIVERED_DELAYED'),
  ('DEL-HIST-010', 'PKG-HIST-10', 'Hamburg', 'Kassel', 'COR-A7', '2026-08-24 23:30:00 UTC', '2026-08-25 00:15:00 UTC', 45, 'DENSE_FOG', 'REDUCED_SPEED_SAFETY', 'DELIVERED_DELAYED'),
  ('DEL-HIST-011', 'PKG-HIST-11', 'Hamburg', 'Hamburg', 'COR-A7', '2026-08-24 21:00:00 UTC', '2026-08-24 21:10:00 UTC', 10, 'CLEAR', 'NORMAL', 'DELIVERED_ON_TIME'),
  ('DEL-HIST-012', 'PKG-HIST-12', 'Cologne', 'Berlin', 'COR-A2', '2026-08-24 23:45:00 UTC', '2026-08-25 00:00:00 UTC', 15, 'CLEAR', 'LIGHT_CONGESTION', 'DELIVERED_ON_TIME'),
  ('DEL-HIST-013', 'PKG-HIST-13', 'Frankfurt', 'Munich', 'COR-A3', '2026-08-25 22:00:00 UTC', '2026-08-25 23:10:00 UTC', 70, 'SEVERE_SQUALL_LINE', 'STOP_AND_GO', 'DELIVERED_DELAYED'),
  ('DEL-HIST-014', 'PKG-HIST-14', 'Stuttgart', 'Freiburg', 'COR-A5', '2026-08-25 20:30:00 UTC', '2026-08-25 20:35:00 UTC', 5, 'CLEAR', 'NORMAL', 'DELIVERED_ON_TIME'),
  ('DEL-HIST-015', 'PKG-HIST-15', 'Hamburg', 'Hamburg', 'COR-A7', '2026-08-25 21:00:00 UTC', '2026-08-25 21:40:00 UTC', 40, 'HIGH_WINDS', 'WALTERSHOF_PORT_CONGESTION', 'DELIVERED_DELAYED'),
  ('DEL-HIST-016', 'PKG-HIST-16', 'Hamburg', 'Munich', 'COR-A7', '2026-08-25 02:00:00 UTC', '2026-08-25 03:50:00 UTC', 110, 'FREEZING_RAIN', 'MULTIPLE_ACCIDENTS', 'DELIVERED_DELAYED'),
  ('DEL-HIST-017', 'PKG-HIST-17', 'Munich', 'Augsburg', 'COR-A8', '2026-08-26 19:30:00 UTC', '2026-08-26 19:38:00 UTC', 8, 'CLEAR', 'NORMAL', 'DELIVERED_ON_TIME'),
  ('DEL-HIST-018', 'PKG-HIST-18', 'Frankfurt', 'Dortmund', 'COR-A3', '2026-08-26 21:45:00 UTC', '2026-08-26 22:50:00 UTC', 65, 'HEAVY_DOWNPOUR', 'CONGESTION_LEVERKUSEN', 'DELIVERED_DELAYED'),
  ('DEL-HIST-019', 'PKG-HIST-19', 'Leipzig', 'Nuremberg', 'COR-A9', '2026-08-26 22:15:00 UTC', '2026-08-26 22:20:00 UTC', 5, 'PARTLY_CLOUDY', 'NORMAL', 'DELIVERED_ON_TIME'),
  ('DEL-HIST-020', 'PKG-HIST-20', 'Cologne', 'Düsseldorf', 'COR-A1', '2026-08-26 20:00:00 UTC', '2026-08-26 20:40:00 UTC', 40, 'RAIN', 'RUSH_HOUR_BOTTLENECK', 'DELIVERED_DELAYED'),
  ('DEL-HIST-021', 'PKG-HIST-21', 'Hamburg', 'Hamburg', 'COR-A1', '2026-08-26 21:00:00 UTC', '2026-08-26 21:35:00 UTC', 35, 'DOWNPOUR', 'MOORFLEET_CONGESTION', 'DELIVERED_DELAYED'),
  ('DEL-HIST-022', 'PKG-HIST-22', 'Hamburg', 'Lübeck', 'COR-A1', '2026-08-26 19:30:00 UTC', '2026-08-26 19:33:00 UTC', 3, 'CLEAR', 'NORMAL', 'DELIVERED_ON_TIME'),
  ('DEL-HIST-023', 'PKG-HIST-23', 'Stuttgart', 'Ulm', 'COR-A8', '2026-08-26 21:00:00 UTC', '2026-08-26 22:05:00 UTC', 65, 'THUNDERSTORM', 'ALBAUFSTIEG_BOTTLENECK', 'DELIVERED_DELAYED'),
  ('DEL-HIST-024', 'PKG-HIST-24', 'Frankfurt', 'Mannheim', 'COR-A5', '2026-08-26 20:15:00 UTC', '2026-08-26 20:20:00 UTC', 5, 'CLEAR', 'NORMAL', 'DELIVERED_ON_TIME'),
  ('DEL-HIST-025', 'PKG-HIST-25', 'Nuremberg', 'Würzburg', 'COR-A3', '2026-08-26 21:30:00 UTC', '2026-08-26 21:35:00 UTC', 5, 'OVERCAST', 'NORMAL', 'DELIVERED_ON_TIME'),
  ('DEL-HIST-026', 'PKG-HIST-26', 'Munich', 'Regensburg', 'COR-A9', '2026-08-26 22:00:00 UTC', '2026-08-26 22:12:00 UTC', 12, 'CLEAR', 'NORMAL', 'DELIVERED_ON_TIME'),
  ('DEL-HIST-027', 'PKG-HIST-27', 'Hamburg', 'Hanover', 'COR-A7', '2026-08-26 20:45:00 UTC', '2026-08-26 21:30:00 UTC', 45, 'HEAVY_RAIN', 'ELBTUNNEL_CONGESTION', 'DELIVERED_DELAYED'),
  ('DEL-HIST-028', 'PKG-HIST-28', 'Cologne', 'Frankfurt', 'COR-A3', '2026-08-26 22:00:00 UTC', '2026-08-26 22:08:00 UTC', 8, 'CLEAR', 'NORMAL', 'DELIVERED_ON_TIME'),
  ('DEL-HIST-029', 'PKG-HIST-29', 'Hamburg', 'Hamburg', 'COR-A7', '2026-08-26 19:00:00 UTC', '2026-08-26 19:12:00 UTC', 12, 'CLEAR', 'NORMAL', 'DELIVERED_ON_TIME'),
  ('DEL-HIST-030', 'PKG-HIST-30', 'Leipzig', 'Dresden', 'COR-A9', '2026-08-26 20:30:00 UTC', '2026-08-26 20:35:00 UTC', 5, 'CLEAR', 'NORMAL', 'DELIVERED_ON_TIME'),
  ('DEL-HIST-031', 'PKG-HIST-31', 'Frankfurt', 'Stuttgart', 'COR-A5', '2026-08-26 21:00:00 UTC', '2026-08-26 21:40:00 UTC', 40, 'FOG', 'WALLDORF_BOTTLENECK', 'DELIVERED_DELAYED'),
  ('DEL-HIST-032', 'PKG-HIST-32', 'Munich', 'Innsbruck Border', 'COR-A8', '2026-08-26 21:30:00 UTC', '2026-08-26 21:42:00 UTC', 12, 'CLEAR', 'NORMAL', 'DELIVERED_ON_TIME'),
  ('DEL-HIST-033', 'PKG-HIST-33', 'Bremen', 'Hamburg', 'COR-A1', '2026-08-26 20:15:00 UTC', '2026-08-26 21:10:00 UTC', 55, 'GALE_WINDS', 'HARBURG_RESTRICTION', 'DELIVERED_DELAYED'),
  ('DEL-HIST-034', 'PKG-HIST-34', 'Hanover', 'Berlin', 'COR-A2', '2026-08-26 22:00:00 UTC', '2026-08-26 22:10:00 UTC', 10, 'CLEAR', 'NORMAL', 'DELIVERED_ON_TIME'),
  ('DEL-HIST-035', 'PKG-HIST-35', 'Stuttgart', 'Karlsruhe', 'COR-A8', '2026-08-26 20:00:00 UTC', '2026-08-26 20:50:00 UTC', 50, 'HEAVY_RAIN', 'PFORZHEIM_ENZ_BOTTLENECK', 'DELIVERED_DELAYED');
