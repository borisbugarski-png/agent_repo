-- ==============================================================================
-- DATA MESH & DATA PRODUCTS LAYER FOR E-COMMERCE DATA SHARING AGENT
-- Project: lustrous-stone-417013 | Dataset: ecommerce
-- ==============================================================================

-- 1. Data Product: Organization & Governance Topology (dp_store_region_governance)
CREATE OR REPLACE VIEW `lustrous-stone-417013.ecommerce.dp_store_region_governance` AS
SELECT
  dc.id AS store_id,
  dc.name AS store_name,
  CASE
    WHEN dc.id IN (6, 7) THEN 'NORTHEAST'
    WHEN dc.id IN (2) THEN 'MIDWEST'
    WHEN dc.id IN (1, 3, 5, 8) THEN 'SOUTH_CENTRAL'
    WHEN dc.id IN (9, 10) THEN 'SOUTHEAST'
    WHEN dc.id IN (4) THEN 'WEST'
    ELSE 'OTHER'
  END AS region_id,
  CASE
    WHEN dc.id IN (6, 7) THEN 'Northeast Region'
    WHEN dc.id IN (2) THEN 'Midwest Region'
    WHEN dc.id IN (1, 3, 5, 8) THEN 'South Central Region'
    WHEN dc.id IN (9, 10) THEN 'Southeast Region'
    WHEN dc.id IN (4) THEN 'West Region'
    ELSE 'Other Region'
  END AS region_name,
  dc.latitude,
  dc.longitude,
  'Retail Store Operations' AS domain_owner,
  'v1.2.0' AS data_contract_version,
  'Real-time BigQuery View' AS refresh_sla
FROM
  `lustrous-stone-417013.ecommerce.distribution_centers` dc;


-- 2. Data Product: Sales & Order Fulfillment Domain (dp_sales_and_orders)
CREATE OR REPLACE VIEW `lustrous-stone-417013.ecommerce.dp_sales_and_orders` AS
SELECT
  oi.id AS order_item_id,
  oi.order_id,
  oi.user_id,
  oi.product_id,
  p.name AS product_name,
  p.category AS product_category,
  p.brand AS product_brand,
  p.department AS product_department,
  p.sku AS product_sku,
  gov.store_id,
  gov.store_name,
  gov.region_id,
  gov.region_name,
  oi.status AS order_status,
  ROUND(oi.sale_price, 2) AS sale_price,
  ROUND(p.cost, 2) AS product_cost,
  ROUND(oi.sale_price - p.cost, 2) AS gross_profit,
  ROUND(SAFE_DIVIDE(oi.sale_price - p.cost, oi.sale_price) * 100, 2) AS margin_pct,
  TIMESTAMP_MICROS(oi.created_at) AS created_at_ts,
  DATE(TIMESTAMP_MICROS(oi.created_at)) AS order_date,
  FORMAT_DATE('%Y-%m', DATE(TIMESTAMP_MICROS(oi.created_at))) AS order_month,
  TIMESTAMP_MICROS(oi.shipped_at) AS shipped_at_ts,
  TIMESTAMP_MICROS(oi.delivered_at) AS delivered_at_ts,
  TIMESTAMP_MICROS(oi.returned_at) AS returned_at_ts
FROM
  `lustrous-stone-417013.ecommerce.order_items` oi
JOIN
  `lustrous-stone-417013.ecommerce.products` p
  ON oi.product_id = p.id
JOIN
  `lustrous-stone-417013.ecommerce.dp_store_region_governance` gov
  ON p.distribution_center_id = gov.store_id;


-- 3. Data Product: Inventory & Supply Chain Domain (dp_inventory_health)
CREATE OR REPLACE VIEW `lustrous-stone-417013.ecommerce.dp_inventory_health` AS
SELECT
  gov.store_id,
  gov.store_name,
  gov.region_id,
  gov.region_name,
  ii.product_department,
  ii.product_category,
  ii.product_brand,
  COUNT(ii.id) AS total_inventory_units,
  COUNTIF(ii.sold_at IS NULL) AS available_units,
  COUNTIF(ii.sold_at IS NOT NULL) AS sold_units,
  ROUND(SUM(CASE WHEN ii.sold_at IS NULL THEN ii.cost ELSE 0 END), 2) AS available_inventory_cost,
  ROUND(SUM(CASE WHEN ii.sold_at IS NULL THEN ii.product_retail_price ELSE 0 END), 2) AS available_retail_value,
  ROUND(SAFE_DIVIDE(COUNTIF(ii.sold_at IS NOT NULL), COUNT(ii.id)) * 100, 2) AS sell_through_rate_pct
FROM
  `lustrous-stone-417013.ecommerce.inventory_items` ii
JOIN
  `lustrous-stone-417013.ecommerce.dp_store_region_governance` gov
  ON ii.product_distribution_center_id = gov.store_id
GROUP BY
  gov.store_id,
  gov.store_name,
  gov.region_id,
  gov.region_name,
  ii.product_department,
  ii.product_category,
  ii.product_brand;


-- 4. Data Product: Customer & Demographics Domain (dp_customer_segments)
CREATE OR REPLACE VIEW `lustrous-stone-417013.ecommerce.dp_customer_segments` AS
SELECT
  gov.store_id,
  gov.store_name,
  gov.region_id,
  gov.region_name,
  u.id AS customer_id,
  u.gender,
  u.age,
  CASE
    WHEN u.age < 25 THEN '18-24 (Gen Z)'
    WHEN u.age BETWEEN 25 AND 39 THEN '25-39 (Millennials)'
    WHEN u.age BETWEEN 40 AND 54 THEN '40-54 (Gen X)'
    ELSE '55+ (Boomers & Seniors)'
  END AS age_segment,
  u.traffic_source,
  u.country AS customer_country,
  u.state AS customer_state,
  COUNT(DISTINCT oi.order_id) AS total_orders,
  COUNT(oi.id) AS total_items_purchased,
  ROUND(SUM(oi.sale_price), 2) AS total_lifetime_spend,
  ROUND(SUM(oi.sale_price - p.cost), 2) AS total_lifetime_profit
FROM
  `lustrous-stone-417013.ecommerce.order_items` oi
JOIN
  `lustrous-stone-417013.ecommerce.users` u
  ON oi.user_id = u.id
JOIN
  `lustrous-stone-417013.ecommerce.products` p
  ON oi.product_id = p.id
JOIN
  `lustrous-stone-417013.ecommerce.dp_store_region_governance` gov
  ON p.distribution_center_id = gov.store_id
GROUP BY
  gov.store_id,
  gov.store_name,
  gov.region_id,
  gov.region_name,
  u.id,
  u.gender,
  u.age,
  age_segment,
  u.traffic_source,
  u.country,
  u.state;
