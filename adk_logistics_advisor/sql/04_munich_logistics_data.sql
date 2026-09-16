-- ============================================================================
-- Dedicated Munich Logistics & Parcel Delivery Dataset
-- Central Bavaria & Munich Metropolitan Logistics Network
-- ============================================================================

-- 1. Insert Specialized Munich Distribution Hubs
INSERT INTO `logistics_germany.logistics_hubs` (hub_id, hub_name, city, state, latitude, longitude, capacity_daily_parcels)
VALUES
  ('HUB-MUC-GAR', 'Munich North Gateway (Garching-Hochbrück)', 'Munich', 'Bavaria', 48.2491, 11.6189, 52000),
  ('HUB-MUC-AIR', 'Munich Airport CargoCity (Franz Josef Strauß)', 'Munich', 'Bavaria', 48.3537, 11.7860, 48000),
  ('HUB-MUC-SUD', 'Munich South Logistics Hub (Neuperlach-Süd)', 'Munich', 'Bavaria', 48.0934, 11.6421, 35000),
  ('HUB-MUC-WST', 'Munich West Intermodal Rail & Road (Allach)', 'Munich', 'Bavaria', 48.1923, 11.4589, 42000);

-- 2. Insert Munich Metropolitan Scheduled Deliveries
INSERT INTO `logistics_germany.scheduled_deliveries` (
  delivery_id, package_id, client_name, recipient_name, origin_hub_id, origin_city,
  destination_address, destination_city, destination_postal_code, destination_lat, destination_lon,
  scheduled_departure, scheduled_delivery_window_start, scheduled_delivery_window_end,
  primary_transit_corridor, estimated_transit_hours, package_priority, status
)
VALUES
  -- 1. Critical Healthcare / Cold Chain: Großhadern to Rechts der Isar
  ('DEL-MUC-001', 'PKG-DE-MUC-01', 'LMU Klinikum Großhadern (Pharmacy)', 'TUM Klinikum rechts der Isar', 'HUB-MUC-SUD', 'Munich', 'Ismaninger Str. 22', 'Munich', '81675', 48.1362, 11.6003, '2026-08-27 18:30:00 UTC', '2026-08-27 19:30:00 UTC', '2026-08-27 20:15:00 UTC', 'COR-A9', 0.6, 'TEMPERATURE_SENSITIVE', 'DISPATCHED_IN_TRANSIT'),

  -- 2. Automotive High-Priority: BMW FIZ to MTU Aero Engines
  ('DEL-MUC-002', 'PKG-DE-MUC-02', 'BMW Group FIZ (Research Center)', 'MTU Aero Engines AG', 'HUB-MUC-GAR', 'Munich', 'Dachauer Str. 665', 'Munich', '80995', 48.1887, 11.5122, '2026-08-27 19:00:00 UTC', '2026-08-27 20:00:00 UTC', '2026-08-27 20:45:00 UTC', 'COR-A9', 0.7, 'EXPRESS_SAME_DAY', 'DISPATCHED_IN_TRANSIT'),

  -- 3. Semiconductor / High-Tech: Infineon Campeon to Siemens Neuperlach
  ('DEL-MUC-003', 'PKG-DE-MUC-03', 'Infineon Technologies Campeon', 'Siemens AG Energy Campus', 'HUB-MUC-SUD', 'Munich', 'Otto-Hahn-Ring 6', 'Munich', '81739', 48.0901, 11.6492, '2026-08-27 19:15:00 UTC', '2026-08-27 20:15:00 UTC', '2026-08-27 21:00:00 UTC', 'COR-A9', 0.5, 'EXPRESS_SAME_DAY', 'SCHEDULED_PENDING'),

  -- 4. Aerospace / Express Air Freight: Munich Airport to Knorr-Bremse
  ('DEL-MUC-004', 'PKG-DE-MUC-04', 'Lufthansa Cargo Terminal MUC', 'Knorr-Bremse Systeme für Schienenfahrzeuge', 'HUB-MUC-AIR', 'Munich', 'Moosacher Str. 80', 'Munich', '80809', 48.1794, 11.5582, '2026-08-27 18:45:00 UTC', '2026-08-27 20:00:00 UTC', '2026-08-27 20:45:00 UTC', 'COR-A9', 0.9, 'EXPRESS_SAME_DAY', 'DISPATCHED_IN_TRANSIT'),

  -- 5. Precision Electronics: Rohde & Schwarz to Krauss-Maffei Wegmann
  ('DEL-MUC-005', 'PKG-DE-MUC-05', 'Rohde & Schwarz GmbH & Co. KG', 'KNDS Krauss-Maffei Wegmann', 'HUB-MUC-WST', 'Munich', 'Krauss-Maffei-Straße 2', 'Munich', '80997', 48.1812, 11.4721, '2026-08-27 19:30:00 UTC', '2026-08-27 20:45:00 UTC', '2026-08-27 21:30:00 UTC', 'COR-A8', 0.8, 'STANDARD', 'SCHEDULED_PENDING'),

  -- 6. Luxury Retail: Maximilianstraße Express Transfer
  ('DEL-MUC-006', 'PKG-DE-MUC-06', 'Kaufingertor Retail Logistics', 'Boutique Maximilianstraße', 'HUB-MUC-GAR', 'Munich', 'Maximilianstraße 28', 'Munich', '80539', 48.1394, 11.5831, '2026-08-27 20:00:00 UTC', '2026-08-27 21:00:00 UTC', '2026-08-27 21:45:00 UTC', 'COR-A9', 0.6, 'EXPRESS_SAME_DAY', 'OUT_FOR_DELIVERY'),

  -- 7. Biotech / Lab Diagnostics: Martinsried Biotech Campus to Schwabing Hospital
  ('DEL-MUC-007', 'PKG-DE-MUC-07', 'Max-Planck-Institut für Biochemie', 'München Klinik Schwabing (Labor)', 'HUB-MUC-WST', 'Munich', 'Kölner Platz 1', 'Munich', '80804', 48.1723, 11.5794, '2026-08-27 20:15:00 UTC', '2026-08-27 21:15:00 UTC', '2026-08-27 22:00:00 UTC', 'COR-A9', 0.6, 'TEMPERATURE_SENSITIVE', 'OUT_FOR_DELIVERY'),

  -- 8. Industrial Gas / Chemical: Linde Engineering to Wacker Chemie Munich HQ
  ('DEL-MUC-008', 'PKG-DE-MUC-08', 'Linde Engineering Pullach', 'Wacker Chemie AG Hauptverwaltung', 'HUB-MUC-SUD', 'Munich', 'Hanns-Seidel-Platz 4', 'Munich', '81737', 48.1021, 11.6441, '2026-08-27 19:45:00 UTC', '2026-08-27 21:00:00 UTC', '2026-08-27 22:00:00 UTC', 'COR-A9', 0.8, 'STANDARD', 'SCHEDULED_PENDING'),

  -- 9. Consumer Electronics / Media: MediaMarktSaturn to Schwabing Flagship
  ('DEL-MUC-009', 'PKG-DE-MUC-09', 'MediaMarktSaturn Distribution Center', 'Saturn München Theresienhöhe', 'HUB-MUC-WST', 'Munich', 'Schwanthalerstraße 115', 'Munich', '80339', 48.1367, 11.5432, '2026-08-27 20:30:00 UTC', '2026-08-27 21:30:00 UTC', '2026-08-27 22:15:00 UTC', 'COR-A8', 0.7, 'STANDARD', 'OUT_FOR_DELIVERY'),

  -- 10. Sports & Merchandise: FC Bayern Säbener Straße to Allianz Arena Megastore
  ('DEL-MUC-010', 'PKG-DE-MUC-10', 'FC Bayern München Merchandising Hub', 'Allianz Arena Megastore', 'HUB-MUC-SUD', 'Munich', 'Werner-Heisenberg-Allee 25', 'Munich', '80939', 48.2188, 11.6247, '2026-08-27 20:45:00 UTC', '2026-08-27 21:45:00 UTC', '2026-08-27 22:30:00 UTC', 'COR-A9', 0.7, 'EXPRESS_SAME_DAY', 'OUT_FOR_DELIVERY');
