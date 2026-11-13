-- Hearth & Harvest schema. Safe to run repeatedly: it never drops user data.

CREATE TABLE IF NOT EXISTS plants (
  id                   SERIAL PRIMARY KEY,
  common_name          TEXT NOT NULL UNIQUE,
  botanical_name       TEXT NOT NULL,
  category             TEXT NOT NULL CHECK (category IN ('vegetable', 'herb', 'fruit')),
  description          TEXT,
  sunlight             TEXT,
  soil_type            TEXT,
  water_requirements   TEXT,
  days_to_maturity     TEXT,          -- human-readable, e.g. "60–85 days from transplant"
  dtm_min              INTEGER,       -- used for harvest-window math (null for perennials)
  dtm_max              INTEGER,
  spacing              TEXT,
  planting_information TEXT,
  harvest_information  TEXT,
  zone_min             INTEGER,
  zone_max             INTEGER,
  seasons              TEXT[] NOT NULL DEFAULT '{}',  -- spring | summer | fall
  lifecycle            TEXT,          -- annual | biennial | perennial
  frost_tolerance      TEXT,          -- hardy | half-hardy | tender
  sow_method           TEXT,          -- direct | transplant | either
  -- Planting timing, in weeks, relative to the zone's average frost dates.
  indoor_weeks_min     INTEGER,       -- start seeds indoors this many weeks BEFORE last spring frost
  indoor_weeks_max     INTEGER,
  spring_start_week    INTEGER,       -- outdoor planting window, weeks relative to last spring frost (negative = before)
  spring_end_week      INTEGER,
  fall_start_week      INTEGER,       -- fall planting window, weeks BEFORE first fall frost (negative = after)
  fall_end_week        INTEGER,
  beginner_friendly    BOOLEAN NOT NULL DEFAULT false,
  image_url            TEXT,
  sources              JSONB NOT NULL DEFAULT '[]'
);

CREATE TABLE IF NOT EXISTS livestock_breeds (
  id                   SERIAL PRIMARY KEY,
  breed_name           TEXT NOT NULL,
  category             TEXT NOT NULL CHECK (category IN ('sheep', 'goats', 'chickens', 'ducks', 'cattle', 'pigs', 'rabbits')),
  origin               TEXT,
  primary_purpose      TEXT,          -- human-readable
  purposes             TEXT[] NOT NULL DEFAULT '{}',  -- meat | dairy | eggs | fiber | draft
  size                 TEXT,
  climate_adaptability TEXT,
  climate_tags         TEXT[] NOT NULL DEFAULT '{}',  -- cold-hardy | heat-tolerant | humidity-tolerant
  temperament          TEXT,
  space_management     TEXT,
  characteristics      TEXT,
  description          TEXT,
  space_needs          TEXT CHECK (space_needs IN ('small', 'moderate', 'large')),
  experience_level     TEXT CHECK (experience_level IN ('beginner', 'intermediate', 'experienced')),
  image_url            TEXT,
  sources              JSONB NOT NULL DEFAULT '[]',
  registries           JSONB NOT NULL DEFAULT '[]',   -- breed registries / associations
  UNIQUE (breed_name, category)
);

-- Added after v0.1; these keep existing databases in step.
ALTER TABLE livestock_breeds ADD COLUMN IF NOT EXISTS registries JSONB NOT NULL DEFAULT '[]';
-- The Livestock Conservancy's Conservation Priority List (null = not on the list).
ALTER TABLE livestock_breeds ADD COLUMN IF NOT EXISTS conservation_status TEXT
  CHECK (conservation_status IN ('Critical', 'Threatened', 'Watch', 'Recovering', 'Study'));
ALTER TABLE livestock_breeds ADD COLUMN IF NOT EXISTS conservation_url TEXT;
ALTER TABLE livestock_breeds ADD COLUMN IF NOT EXISTS conservation_note TEXT;
ALTER TABLE livestock_breeds ADD COLUMN IF NOT EXISTS conservation_checked DATE;
-- Crop-specific extension growing guides: [{ name, url, org, region }].
ALTER TABLE plants ADD COLUMN IF NOT EXISTS guides JSONB NOT NULL DEFAULT '[]';
-- Photo credit for image_url: { author, license, license_url, source_url, provider }.
ALTER TABLE plants ADD COLUMN IF NOT EXISTS image_credit JSONB;
ALTER TABLE livestock_breeds ADD COLUMN IF NOT EXISTS image_credit JSONB;
-- Two-letter state code, used to link the farm's land-grant extension service.
ALTER TABLE farms ADD COLUMN IF NOT EXISTS state TEXT;

CREATE TABLE IF NOT EXISTS farms (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_name         TEXT NOT NULL,
  location          TEXT,
  growing_zone      TEXT,
  acreage           NUMERIC(10, 2),
  farming_interests TEXT[] NOT NULL DEFAULT '{}',
  farming_goals     TEXT[] NOT NULL DEFAULT '{}',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS farm_plants (
  id            SERIAL PRIMARY KEY,
  farm_id       UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  plant_id      INTEGER NOT NULL REFERENCES plants(id) ON DELETE CASCADE,
  planting_date DATE,
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (farm_id, plant_id)
);

CREATE TABLE IF NOT EXISTS farm_breeds (
  id         SERIAL PRIMARY KEY,
  farm_id    UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  breed_id   INTEGER NOT NULL REFERENCES livestock_breeds(id) ON DELETE CASCADE,
  notes      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (farm_id, breed_id)
);

CREATE INDEX IF NOT EXISTS idx_farm_plants_farm ON farm_plants(farm_id);
CREATE INDEX IF NOT EXISTS idx_farm_breeds_farm ON farm_breeds(farm_id);
CREATE INDEX IF NOT EXISTS idx_breeds_category ON livestock_breeds(category);
