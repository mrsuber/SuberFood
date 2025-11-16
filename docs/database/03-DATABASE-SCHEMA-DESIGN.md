# SuberFood - Database Schema Design

**Version:** 1.0
**Date:** November 16, 2025
**Status:** Draft

---

## Table of Contents

1. [Schema Overview](#schema-overview)
2. [Core Services Schemas](#core-services-schemas)
3. [Platform Services Schemas](#platform-services-schemas)
4. [Data Relationships](#data-relationships)
5. [Indexing Strategy](#indexing-strategy)
6. [Data Migration Strategy](#data-migration-strategy)

---

## 1. Schema Overview

### 1.1 Database Distribution

Each microservice has its own database schema to maintain loose coupling and independent scalability.

### 1.2 Naming Conventions

- **Tables**: Plural, lowercase with underscores (`orders`, `order_items`)
- **Columns**: Lowercase with underscores (`customer_id`, `created_at`)
- **Primary Keys**: `id` (UUID)
- **Foreign Keys**: `{table_singular}_id` (`customer_id`, `product_id`)
- **Timestamps**: `created_at`, `updated_at`, `deleted_at` (soft delete)
- **Boolean**: `is_{attribute}` (`is_active`, `is_organic`)

### 1.3 Common Patterns

**Standard Columns (all tables):**
```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
created_at TIMESTAMP DEFAULT NOW(),
updated_at TIMESTAMP DEFAULT NOW(),
deleted_at TIMESTAMP NULL  -- Soft delete
```

**Audit Columns (critical tables):**
```sql
created_by UUID REFERENCES users(id),
updated_by UUID REFERENCES users(id)
```

---

## 2. Core Services Schemas

### 2.1 Farm Service (PostgreSQL)

#### 2.1.1 Farms & Plots

```sql
-- Farms (main farm locations)
CREATE TABLE farms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  farm_type VARCHAR(50) NOT NULL, -- crop, livestock, aquaculture, poultry, mixed
  country_code VARCHAR(3) NOT NULL,
  address JSONB NOT NULL,
  coordinates POINT, -- PostGIS for geospatial
  total_area_hectares DECIMAL(10,2),
  manager_id UUID NOT NULL,
  status VARCHAR(20) DEFAULT 'active', -- active, inactive, under_development
  certifications JSONB, -- organic, fair-trade, etc.
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

-- Plots (subdivisions within a farm)
CREATE TABLE plots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  plot_code VARCHAR(50) NOT NULL,
  name VARCHAR(255),
  area_hectares DECIMAL(10,2) NOT NULL,
  coordinates POLYGON, -- Plot boundaries
  soil_type VARCHAR(100),
  soil_ph DECIMAL(3,1),
  irrigation_type VARCHAR(50), -- drip, sprinkler, flood, rainfed
  status VARCHAR(20) DEFAULT 'available', -- available, planted, fallow, maintenance
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(farm_id, plot_code)
);

-- Soil Health Records
CREATE TABLE soil_health_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plot_id UUID NOT NULL REFERENCES plots(id) ON DELETE CASCADE,
  test_date DATE NOT NULL,
  ph_level DECIMAL(3,1),
  nitrogen_ppm DECIMAL(10,2),
  phosphorus_ppm DECIMAL(10,2),
  potassium_ppm DECIMAL(10,2),
  organic_matter_percent DECIMAL(5,2),
  notes TEXT,
  tested_by UUID,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 2.1.2 Crop Management

```sql
-- Crop Types (reference data)
CREATE TABLE crop_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  scientific_name VARCHAR(100),
  category VARCHAR(50), -- vegetable, fruit, grain, legume
  typical_growth_days INTEGER,
  water_requirements VARCHAR(20), -- low, medium, high
  sun_requirements VARCHAR(20), -- full, partial, shade
  created_at TIMESTAMP DEFAULT NOW()
);

-- Plantings (specific crop planting instances)
CREATE TABLE plantings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plot_id UUID NOT NULL REFERENCES plots(id),
  crop_type_id UUID NOT NULL REFERENCES crop_types(id),
  planting_code VARCHAR(50) UNIQUE NOT NULL,
  variety VARCHAR(100),
  planting_date DATE NOT NULL,
  expected_harvest_date DATE,
  actual_harvest_date DATE,
  area_planted_hectares DECIMAL(10,2),
  seed_quantity_kg DECIMAL(10,2),
  seed_source VARCHAR(100),
  is_organic BOOLEAN DEFAULT false,
  status VARCHAR(20) DEFAULT 'planted', -- planted, growing, ready, harvested, failed
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Growth Records (tracking crop progress)
CREATE TABLE growth_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  planting_id UUID NOT NULL REFERENCES plantings(id) ON DELETE CASCADE,
  record_date DATE NOT NULL,
  growth_stage VARCHAR(50), -- germination, vegetative, flowering, fruiting
  height_cm DECIMAL(10,2),
  health_score INTEGER CHECK (health_score BETWEEN 1 AND 10),
  pest_presence BOOLEAN DEFAULT false,
  disease_presence BOOLEAN DEFAULT false,
  observations TEXT,
  photos JSONB, -- Array of S3 URLs
  recorded_by UUID,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Pest & Disease Management
CREATE TABLE pest_disease_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  planting_id UUID REFERENCES plantings(id),
  plot_id UUID REFERENCES plots(id),
  report_date DATE NOT NULL,
  type VARCHAR(20) NOT NULL, -- pest, disease
  name VARCHAR(100) NOT NULL,
  severity VARCHAR(20), -- low, medium, high, critical
  affected_area_percent DECIMAL(5,2),
  treatment_applied VARCHAR(255),
  treatment_date DATE,
  pesticide_used VARCHAR(100),
  quantity_applied DECIMAL(10,2),
  quantity_unit VARCHAR(20),
  resolution_status VARCHAR(20) DEFAULT 'open', -- open, treating, resolved
  photos JSONB,
  reported_by UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Harvests
CREATE TABLE harvests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  planting_id UUID NOT NULL REFERENCES plantings(id),
  harvest_code VARCHAR(50) UNIQUE NOT NULL,
  harvest_date DATE NOT NULL,
  quantity_kg DECIMAL(10,2) NOT NULL,
  quality_grade VARCHAR(20), -- A, B, C, reject
  average_size VARCHAR(20),
  moisture_content_percent DECIMAL(5,2),
  destination VARCHAR(50), -- processing, direct_sale, storage, waste
  warehouse_id UUID, -- Reference to warehouse if stored
  processing_plant_id UUID, -- Reference if sent to processing
  notes TEXT,
  harvested_by UUID,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 2.1.3 Irrigation & Resources

```sql
-- Irrigation Events
CREATE TABLE irrigation_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plot_id UUID NOT NULL REFERENCES plots(id),
  irrigation_date DATE NOT NULL,
  duration_minutes INTEGER,
  water_volume_liters DECIMAL(10,2),
  irrigation_method VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Fertilizer Applications
CREATE TABLE fertilizer_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plot_id UUID REFERENCES plots(id),
  planting_id UUID REFERENCES plantings(id),
  application_date DATE NOT NULL,
  fertilizer_type VARCHAR(100) NOT NULL,
  quantity_kg DECIMAL(10,2) NOT NULL,
  nitrogen_percent DECIMAL(5,2),
  phosphorus_percent DECIMAL(5,2),
  potassium_percent DECIMAL(5,2),
  application_method VARCHAR(50), -- broadcast, banding, foliar
  applied_by UUID,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Equipment
CREATE TABLE farm_equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL REFERENCES farms(id),
  equipment_code VARCHAR(50) UNIQUE NOT NULL,
  equipment_type VARCHAR(100) NOT NULL, -- tractor, harvester, sprayer
  make VARCHAR(100),
  model VARCHAR(100),
  year INTEGER,
  status VARCHAR(20) DEFAULT 'operational', -- operational, maintenance, broken, retired
  purchase_date DATE,
  last_maintenance_date DATE,
  next_maintenance_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

### 2.2 Livestock Service (PostgreSQL)

```sql
-- Herds/Flocks
CREATE TABLE herds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id UUID NOT NULL,
  herd_code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255),
  animal_type VARCHAR(50) NOT NULL, -- cattle, sheep, goat, pig
  purpose VARCHAR(50), -- dairy, meat, breeding
  current_count INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Animals
CREATE TABLE animals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  herd_id UUID NOT NULL REFERENCES herds(id),
  tag_number VARCHAR(50) UNIQUE NOT NULL,
  rfid VARCHAR(100),
  name VARCHAR(100),
  species VARCHAR(50) NOT NULL,
  breed VARCHAR(100),
  sex VARCHAR(10), -- male, female
  date_of_birth DATE,
  acquisition_date DATE,
  acquisition_type VARCHAR(50), -- born, purchased, transferred
  mother_id UUID REFERENCES animals(id),
  father_id UUID REFERENCES animals(id),
  genetic_line VARCHAR(100),
  current_weight_kg DECIMAL(10,2),
  status VARCHAR(20) DEFAULT 'active', -- active, sick, pregnant, sold, deceased
  disposal_date DATE,
  disposal_reason VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Health Records
CREATE TABLE animal_health_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_id UUID NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
  record_date DATE NOT NULL,
  record_type VARCHAR(50), -- vaccination, treatment, checkup, injury, illness
  diagnosis VARCHAR(255),
  symptoms TEXT,
  treatment TEXT,
  medication VARCHAR(100),
  dosage VARCHAR(100),
  veterinarian_id UUID,
  next_checkup_date DATE,
  cost DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Vaccinations
CREATE TABLE vaccinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_id UUID NOT NULL REFERENCES animals(id) ON DELETE CASCADE,
  vaccine_name VARCHAR(100) NOT NULL,
  vaccination_date DATE NOT NULL,
  batch_number VARCHAR(50),
  administered_by UUID,
  next_due_date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Breeding Records
CREATE TABLE breeding_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mother_id UUID NOT NULL REFERENCES animals(id),
  father_id UUID REFERENCES animals(id),
  breeding_date DATE NOT NULL,
  breeding_method VARCHAR(50), -- natural, artificial_insemination
  expected_delivery_date DATE,
  actual_delivery_date DATE,
  number_of_offspring INTEGER,
  breeding_status VARCHAR(50), -- planned, confirmed, delivered, failed
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Production Records (Milk, Eggs, etc.)
CREATE TABLE production_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_id UUID REFERENCES animals(id),
  herd_id UUID REFERENCES herds(id),
  production_date DATE NOT NULL,
  production_type VARCHAR(50), -- milk, eggs, wool
  quantity DECIMAL(10,2) NOT NULL,
  unit VARCHAR(20), -- liters, kg, pieces
  quality_grade VARCHAR(20),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Feeding Records
CREATE TABLE feeding_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  herd_id UUID REFERENCES herds(id),
  animal_id UUID REFERENCES animals(id),
  feeding_date DATE NOT NULL,
  feed_type VARCHAR(100) NOT NULL,
  quantity_kg DECIMAL(10,2) NOT NULL,
  cost DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

### 2.3 Processing Service (PostgreSQL)

```sql
-- Processing Plants
CREATE TABLE processing_plants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plant_code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  plant_type VARCHAR(100), -- dairy, meat, fish, produce
  country_code VARCHAR(3) NOT NULL,
  address JSONB NOT NULL,
  capacity_daily_kg DECIMAL(10,2),
  certifications JSONB, -- HACCP, ISO22000, organic, halal, kosher
  status VARCHAR(20) DEFAULT 'operational',
  manager_id UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Recipes / Bill of Materials
CREATE TABLE recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_code VARCHAR(50) UNIQUE NOT NULL,
  finished_product_sku VARCHAR(100) NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  version VARCHAR(20) DEFAULT '1.0',
  yield_quantity DECIMAL(10,2) NOT NULL,
  yield_unit VARCHAR(20),
  processing_time_minutes INTEGER,
  instructions TEXT,
  status VARCHAR(20) DEFAULT 'active', -- active, deprecated
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Recipe Ingredients (BOM)
CREATE TABLE recipe_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
  raw_material_sku VARCHAR(100) NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  unit VARCHAR(20) NOT NULL,
  sequence_order INTEGER,
  is_optional BOOLEAN DEFAULT false
);

-- Production Orders
CREATE TABLE production_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  plant_id UUID NOT NULL REFERENCES processing_plants(id),
  recipe_id UUID NOT NULL REFERENCES recipes(id),
  planned_quantity DECIMAL(10,2) NOT NULL,
  planned_start_date TIMESTAMP NOT NULL,
  planned_end_date TIMESTAMP,
  actual_start_date TIMESTAMP,
  actual_end_date TIMESTAMP,
  actual_quantity DECIMAL(10,2),
  status VARCHAR(20) DEFAULT 'planned', -- planned, in_progress, completed, cancelled
  priority INTEGER DEFAULT 1,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Production Batches
CREATE TABLE production_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_number VARCHAR(50) UNIQUE NOT NULL,
  production_order_id UUID NOT NULL REFERENCES production_orders(id),
  plant_id UUID NOT NULL REFERENCES processing_plants(id),
  recipe_id UUID NOT NULL REFERENCES recipes(id),
  production_date DATE NOT NULL,
  quantity_produced DECIMAL(10,2) NOT NULL,
  unit VARCHAR(20),
  quality_grade VARCHAR(20),
  expiry_date DATE,
  status VARCHAR(20) DEFAULT 'in_production',
  raw_material_batches JSONB, -- Traceability to source batches
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Quality Control Checks
CREATE TABLE quality_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL REFERENCES production_batches(id),
  check_date TIMESTAMP NOT NULL,
  check_type VARCHAR(50), -- visual, microbiological, chemical, physical
  parameter VARCHAR(100),
  expected_value VARCHAR(100),
  actual_value VARCHAR(100),
  result VARCHAR(20), -- pass, fail, within_tolerance
  inspector_id UUID,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

### 2.4 Logistics & Warehouse Service (PostgreSQL)

```sql
-- Warehouses
CREATE TABLE warehouses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  warehouse_code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  warehouse_type VARCHAR(50), -- farm_storage, distribution_center, cold_storage
  country_code VARCHAR(3) NOT NULL,
  address JSONB NOT NULL,
  total_capacity_cbm DECIMAL(10,2), -- cubic meters
  temperature_controlled BOOLEAN DEFAULT false,
  min_temperature_celsius DECIMAL(5,2),
  max_temperature_celsius DECIMAL(5,2),
  manager_id UUID,
  status VARCHAR(20) DEFAULT 'operational',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Warehouse Zones
CREATE TABLE warehouse_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
  zone_code VARCHAR(50) NOT NULL,
  zone_type VARCHAR(50), -- frozen, refrigerated, dry, ambient
  capacity_cbm DECIMAL(10,2),
  UNIQUE(warehouse_id, zone_code)
);

-- Inventory Items
CREATE TABLE inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  warehouse_id UUID NOT NULL REFERENCES warehouses(id),
  zone_id UUID REFERENCES warehouse_zones(id),
  sku VARCHAR(100) NOT NULL,
  product_name VARCHAR(255),
  batch_number VARCHAR(50),
  quantity DECIMAL(10,2) NOT NULL,
  unit VARCHAR(20),
  received_date DATE NOT NULL,
  expiry_date DATE,
  source_type VARCHAR(50), -- harvest, production, purchase
  source_id UUID, -- ID of harvest/batch/purchase
  status VARCHAR(20) DEFAULT 'available', -- available, reserved, quarantine, expired
  location_code VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(warehouse_id, sku, batch_number)
);

-- Inventory Transactions (movement log)
CREATE TABLE inventory_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_id UUID NOT NULL REFERENCES inventory(id),
  transaction_type VARCHAR(50) NOT NULL, -- receive, pick, transfer, adjust, expire
  quantity DECIMAL(10,2) NOT NULL, -- positive for addition, negative for deduction
  from_warehouse_id UUID REFERENCES warehouses(id),
  to_warehouse_id UUID REFERENCES warehouses(id),
  reference_type VARCHAR(50), -- shipment, order, adjustment
  reference_id UUID,
  performed_by UUID,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Vehicles
CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_code VARCHAR(50) UNIQUE NOT NULL,
  license_plate VARCHAR(50) UNIQUE NOT NULL,
  vehicle_type VARCHAR(50), -- truck, van, refrigerated_truck
  make VARCHAR(100),
  model VARCHAR(100),
  year INTEGER,
  capacity_kg DECIMAL(10,2),
  temperature_controlled BOOLEAN DEFAULT false,
  status VARCHAR(20) DEFAULT 'available', -- available, in_transit, maintenance, retired
  current_location POINT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Shipments
CREATE TABLE shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_number VARCHAR(50) UNIQUE NOT NULL,
  from_warehouse_id UUID REFERENCES warehouses(id),
  from_farm_id UUID, -- If shipping from farm
  to_warehouse_id UUID REFERENCES warehouses(id),
  to_restaurant_id UUID, -- If destination is restaurant
  to_partner_id UUID, -- If B2B shipment
  vehicle_id UUID REFERENCES vehicles(id),
  driver_id UUID,
  shipment_type VARCHAR(50), -- farm_to_warehouse, warehouse_to_warehouse, warehouse_to_customer
  scheduled_pickup_date TIMESTAMP,
  actual_pickup_date TIMESTAMP,
  scheduled_delivery_date TIMESTAMP,
  actual_delivery_date TIMESTAMP,
  status VARCHAR(20) DEFAULT 'planned', -- planned, picked_up, in_transit, delivered, cancelled
  tracking_number VARCHAR(100),
  total_weight_kg DECIMAL(10,2),
  temperature_required_celsius DECIMAL(5,2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Shipment Items
CREATE TABLE shipment_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  sku VARCHAR(100) NOT NULL,
  batch_number VARCHAR(50),
  quantity DECIMAL(10,2) NOT NULL,
  unit VARCHAR(20),
  source_inventory_id UUID REFERENCES inventory(id)
);

-- Temperature Logs (Cold Chain Monitoring)
CREATE TABLE temperature_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id UUID REFERENCES shipments(id),
  warehouse_id UUID REFERENCES warehouses(id),
  zone_id UUID REFERENCES warehouse_zones(id),
  recorded_at TIMESTAMP NOT NULL,
  temperature_celsius DECIMAL(5,2) NOT NULL,
  humidity_percent DECIMAL(5,2),
  sensor_id VARCHAR(100),
  is_violation BOOLEAN DEFAULT false, -- Temperature out of range
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

### 2.5 Restaurant Service (PostgreSQL + Redis)

```sql
-- Restaurants
CREATE TABLE restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  restaurant_type VARCHAR(50), -- classical, cafeteria
  country_code VARCHAR(3) NOT NULL,
  address JSONB NOT NULL,
  coordinates POINT,
  phone VARCHAR(50),
  email VARCHAR(100),
  seating_capacity INTEGER,
  manager_id UUID,
  status VARCHAR(20) DEFAULT 'open', -- open, closed, temporarily_closed
  opening_hours JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Menu Categories
CREATE TABLE menu_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  display_order INTEGER,
  is_active BOOLEAN DEFAULT true
);

-- Menu Items
CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category_id UUID REFERENCES menu_categories(id),
  price DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  preparation_time_minutes INTEGER,
  is_available BOOLEAN DEFAULT true,
  allergens JSONB, -- Array of allergens
  dietary_tags JSONB, -- vegan, vegetarian, gluten-free, etc.
  image_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Restaurant Menu (Many-to-Many)
CREATE TABLE restaurant_menus (
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  is_available BOOLEAN DEFAULT true,
  special_price DECIMAL(10,2), -- Location-specific pricing
  PRIMARY KEY (restaurant_id, menu_item_id)
);

-- Menu Item Ingredients (for inventory depletion)
CREATE TABLE menu_item_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  sku VARCHAR(100) NOT NULL, -- Inventory SKU
  quantity DECIMAL(10,2) NOT NULL,
  unit VARCHAR(20) NOT NULL
);

-- Reservations (Classical Restaurants)
CREATE TABLE reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_number VARCHAR(50) UNIQUE NOT NULL,
  restaurant_id UUID NOT NULL REFERENCES restaurants(id),
  customer_id UUID,
  guest_name VARCHAR(255) NOT NULL,
  guest_phone VARCHAR(50) NOT NULL,
  guest_email VARCHAR(100),
  party_size INTEGER NOT NULL,
  reservation_date DATE NOT NULL,
  reservation_time TIME NOT NULL,
  table_number VARCHAR(20),
  special_requests TEXT,
  status VARCHAR(20) DEFAULT 'confirmed', -- confirmed, seated, completed, cancelled, no_show
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Restaurant Orders (Dine-in, Takeout)
CREATE TABLE restaurant_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  restaurant_id UUID NOT NULL REFERENCES restaurants(id),
  order_type VARCHAR(20) NOT NULL, -- dine_in, takeout, delivery
  table_number VARCHAR(20),
  customer_id UUID,
  guest_name VARCHAR(255),
  order_date TIMESTAMP DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'pending', -- pending, preparing, ready, served, completed, cancelled
  subtotal DECIMAL(10,2) NOT NULL,
  tax DECIMAL(10,2),
  tip DECIMAL(10,2),
  total DECIMAL(10,2) NOT NULL,
  payment_status VARCHAR(20) DEFAULT 'pending',
  payment_method VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Restaurant Order Items
CREATE TABLE restaurant_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES restaurant_orders(id) ON DELETE CASCADE,
  menu_item_id UUID NOT NULL REFERENCES menu_items(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  special_instructions TEXT,
  status VARCHAR(20) DEFAULT 'pending' -- pending, preparing, ready, served
);

-- Restaurant Inventory
CREATE TABLE restaurant_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id),
  sku VARCHAR(100) NOT NULL,
  product_name VARCHAR(255),
  quantity DECIMAL(10,2) NOT NULL,
  unit VARCHAR(20),
  reorder_level DECIMAL(10,2),
  expiry_date DATE,
  last_restocked_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(restaurant_id, sku)
);
```

---

### 2.6 Order Service (D2C Orders - PostgreSQL)

```sql
-- Customers
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_number VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  date_of_birth DATE,
  customer_type VARCHAR(20) DEFAULT 'individual', -- individual, business
  status VARCHAR(20) DEFAULT 'active',
  email_verified BOOLEAN DEFAULT false,
  phone_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Customer Addresses
CREATE TABLE customer_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  address_type VARCHAR(20), -- shipping, billing, both
  is_default BOOLEAN DEFAULT false,
  recipient_name VARCHAR(255),
  phone VARCHAR(50),
  address_line1 VARCHAR(255) NOT NULL,
  address_line2 VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  state_province VARCHAR(100),
  postal_code VARCHAR(20),
  country_code VARCHAR(3) NOT NULL,
  coordinates POINT,
  delivery_instructions TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Shopping Carts
CREATE TABLE shopping_carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id),
  session_id VARCHAR(255), -- For guest users
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP
);

-- Cart Items
CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID NOT NULL REFERENCES shopping_carts(id) ON DELETE CASCADE,
  sku VARCHAR(100) NOT NULL,
  product_name VARCHAR(255),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id UUID NOT NULL REFERENCES customers(id),
  order_date TIMESTAMP DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'pending', -- pending, confirmed, processing, shipped, delivered, cancelled
  payment_status VARCHAR(20) DEFAULT 'pending',
  shipping_address_id UUID REFERENCES customer_addresses(id),
  billing_address_id UUID REFERENCES customer_addresses(id),
  subtotal DECIMAL(10,2) NOT NULL,
  tax DECIMAL(10,2),
  shipping_cost DECIMAL(10,2),
  discount DECIMAL(10,2),
  total DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  payment_method VARCHAR(50),
  delivery_date DATE,
  delivery_time_slot VARCHAR(50),
  tracking_number VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Order Items
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  sku VARCHAR(100) NOT NULL,
  product_name VARCHAR(255),
  batch_number VARCHAR(50),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Order Status History
CREATE TABLE order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL,
  notes TEXT,
  changed_by UUID,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 3. Platform Services Schemas

### 3.1 IAM Service (PostgreSQL + Redis)

```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  user_type VARCHAR(50), -- internal_staff, customer, partner
  status VARCHAR(20) DEFAULT 'active', -- active, inactive, suspended, deleted
  email_verified BOOLEAN DEFAULT false,
  phone_verified BOOLEAN DEFAULT false,
  mfa_enabled BOOLEAN DEFAULT false,
  mfa_secret VARCHAR(255),
  last_login_at TIMESTAMP,
  password_changed_at TIMESTAMP,
  failed_login_attempts INTEGER DEFAULT 0,
  locked_until TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Roles
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  is_system_role BOOLEAN DEFAULT false, -- Cannot be deleted
  created_at TIMESTAMP DEFAULT NOW()
);

-- Permissions
CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL, -- farm:read, orders:create
  resource VARCHAR(100) NOT NULL,
  action VARCHAR(50) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Role Permissions (Many-to-Many)
CREATE TABLE role_permissions (
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

-- User Roles (Many-to-Many)
CREATE TABLE user_roles (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP DEFAULT NOW(),
  assigned_by UUID REFERENCES users(id),
  PRIMARY KEY (user_id, role_id)
);

-- Refresh Tokens
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Audit Logs (Login, Permission Changes)
CREATE TABLE auth_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  event_type VARCHAR(50) NOT NULL, -- login_success, login_failed, password_changed, mfa_enabled
  ip_address INET,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

### 3.2 Payment Service (PostgreSQL)

```sql
-- Payments
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_number VARCHAR(50) UNIQUE NOT NULL,
  order_id UUID, -- Reference to order
  customer_id UUID NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) NOT NULL,
  payment_method VARCHAR(50) NOT NULL, -- credit_card, debit_card, bank_transfer, cash, mobile_money
  payment_gateway VARCHAR(50), -- stripe, paypal, flutterwave
  gateway_transaction_id VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pending', -- pending, processing, completed, failed, refunded
  paid_at TIMESTAMP,
  refunded_at TIMESTAMP,
  refund_amount DECIMAL(10,2),
  failure_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Payment Methods (Saved cards, etc.)
CREATE TABLE saved_payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL,
  payment_type VARCHAR(50), -- credit_card, bank_account
  gateway VARCHAR(50),
  gateway_customer_id VARCHAR(255),
  gateway_payment_method_id VARCHAR(255),
  card_last_four VARCHAR(4),
  card_brand VARCHAR(50),
  card_expiry_month INTEGER,
  card_expiry_year INTEGER,
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Invoices (B2B)
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  partner_id UUID NOT NULL,
  invoice_date DATE NOT NULL,
  due_date DATE NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  tax DECIMAL(10,2),
  total DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(20) DEFAULT 'pending', -- pending, paid, overdue, cancelled
  paid_at TIMESTAMP,
  payment_terms VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Invoice Items
CREATE TABLE invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description VARCHAR(255) NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL
);
```

---

### 3.3 Notification Service (MongoDB)

**Notifications Collection:**
```javascript
{
  _id: ObjectId,
  userId: UUID,
  notificationType: String, // order_confirmation, shipment_update, quality_alert, etc.
  channel: String, // email, sms, push, in_app
  recipient: String, // email address, phone number, device token
  subject: String,
  body: String,
  status: String, // pending, sent, failed, read
  sentAt: Date,
  readAt: Date,
  retryCount: Number,
  errorMessage: String,
  metadata: Object,
  createdAt: Date
}
```

**Notification Templates Collection:**
```javascript
{
  _id: ObjectId,
  templateCode: String,
  channel: String,
  language: String,
  subject: String,
  bodyTemplate: String, // Handlebars template
  variables: Array, // List of variables used
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

---

### 3.4 Audit Service (MongoDB)

**Audit Logs Collection:**
```javascript
{
  _id: ObjectId,
  eventId: UUID,
  eventType: String,
  timestamp: Date,
  userId: UUID,
  service: String,
  resource: String,
  action: String,
  entityId: UUID,
  changes: {
    before: Object,
    after: Object
  },
  ipAddress: String,
  userAgent: String,
  metadata: Object
}
```

---

## 4. Data Relationships

### 4.1 Cross-Service References

Since each service has its own database, cross-service references are stored as UUIDs without foreign key constraints.

**Example:**
- `orders.customer_id` → References `customers.id` in Customer Service
- Communication via API calls or events

### 4.2 Traceability Flow

**Farm to Consumer:**
```
Plot → Planting → Harvest → Inventory → Processing Batch → Finished Product → Shipment → Order
```

**Traceability Query:**
Given a product SKU in an order, trace back to:
1. Order Item → Batch Number
2. Batch Number → Production Batch
3. Production Batch → Raw Material Batches (from `raw_material_batches` JSONB)
4. Raw Material Batch → Harvest
5. Harvest → Planting → Plot → Farm

---

## 5. Indexing Strategy

### 5.1 Standard Indexes (All Tables)

```sql
CREATE INDEX idx_{table}_created_at ON {table}(created_at);
CREATE INDEX idx_{table}_updated_at ON {table}(updated_at);
CREATE INDEX idx_{table}_deleted_at ON {table}(deleted_at) WHERE deleted_at IS NOT NULL;
```

### 5.2 Service-Specific Indexes

**Farm Service:**
```sql
CREATE INDEX idx_plantings_plot_id ON plantings(plot_id);
CREATE INDEX idx_plantings_crop_type_id ON plantings(crop_type_id);
CREATE INDEX idx_plantings_status ON plantings(status);
CREATE INDEX idx_harvests_planting_id ON harvests(planting_id);
CREATE INDEX idx_harvests_harvest_date ON harvests(harvest_date);
```

**Livestock Service:**
```sql
CREATE INDEX idx_animals_herd_id ON animals(herd_id);
CREATE INDEX idx_animals_tag_number ON animals(tag_number);
CREATE INDEX idx_animals_status ON animals(status);
CREATE INDEX idx_health_records_animal_id ON animal_health_records(animal_id);
```

**Order Service:**
```sql
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_order_date ON orders(order_date);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
```

**Inventory:**
```sql
CREATE INDEX idx_inventory_warehouse_sku ON inventory(warehouse_id, sku);
CREATE INDEX idx_inventory_batch ON inventory(batch_number);
CREATE INDEX idx_inventory_expiry ON inventory(expiry_date) WHERE expiry_date IS NOT NULL;
CREATE INDEX idx_inventory_status ON inventory(status);
```

**Composite Indexes:**
```sql
CREATE INDEX idx_orders_customer_status ON orders(customer_id, status);
CREATE INDEX idx_shipments_status_date ON shipments(status, scheduled_delivery_date);
```

---

## 6. Data Migration Strategy

### 6.1 Schema Versioning

**Tool:** Flyway or Liquibase

**Migration Files:**
```
migrations/
├── V1__initial_schema.sql
├── V2__add_organic_flag_to_plantings.sql
├── V3__create_quality_checks_table.sql
```

### 6.2 Zero-Downtime Migrations

**Backward-Compatible Changes:**
1. Add new nullable column
2. Deploy application code that writes to both old and new
3. Backfill data
4. Make column non-nullable if needed
5. Remove old column in next release

---

## Conclusion

This database schema design provides:

✅ **Scalability**: Database per service pattern
✅ **Traceability**: Complete farm-to-consumer tracking
✅ **Flexibility**: JSONB for variable attributes
✅ **Performance**: Strategic indexing
✅ **Data Integrity**: Proper constraints and referential integrity within service boundaries
✅ **Auditability**: Timestamps, soft deletes, audit logs

---

END OF DOCUMENT
