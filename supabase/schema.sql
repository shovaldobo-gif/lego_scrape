-- ============================================
-- LEGO Price Comparison - Database Schema
-- Supabase PostgreSQL
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PRODUCTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sku VARCHAR(10) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  name_he VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  description TEXT,
  piece_count INTEGER,
  min_age INTEGER,
  image_url TEXT NOT NULL,
  images TEXT[],
  release_year INTEGER,
  is_retired BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast SKU lookups
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

-- ============================================
-- PRICES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS prices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  store_id VARCHAR(50) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  original_price DECIMAL(10, 2),
  currency VARCHAR(3) DEFAULT 'ILS',
  in_stock BOOLEAN DEFAULT TRUE,
  url TEXT NOT NULL,
  is_on_sale BOOLEAN DEFAULT FALSE,
  discount_percentage INTEGER,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Unique constraint: one price per product per store
  UNIQUE(product_id, store_id)
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_prices_product_id ON prices(product_id);
CREATE INDEX IF NOT EXISTS idx_prices_store_id ON prices(store_id);
CREATE INDEX IF NOT EXISTS idx_prices_price ON prices(price);
CREATE INDEX IF NOT EXISTS idx_prices_is_on_sale ON prices(is_on_sale) WHERE is_on_sale = TRUE;

-- ============================================
-- PRICE HISTORY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS price_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  store_id VARCHAR(50) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for historical queries
CREATE INDEX IF NOT EXISTS idx_price_history_product_store ON price_history(product_id, store_id);
CREATE INDEX IF NOT EXISTS idx_price_history_recorded_at ON price_history(recorded_at);

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  password_hash VARCHAR(255), -- NULL for social logins
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ============================================
-- ALERTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  category VARCHAR(50),
  target_price DECIMAL(10, 2),
  notify_on_any_discount BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_triggered TIMESTAMP WITH TIME ZONE,

  -- Either product_id or category must be set
  CONSTRAINT alert_target_check CHECK (
    product_id IS NOT NULL OR category IS NOT NULL
  )
);

CREATE INDEX IF NOT EXISTS idx_alerts_user_id ON alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_product_id ON alerts(product_id);
CREATE INDEX IF NOT EXISTS idx_alerts_category ON alerts(category);
CREATE INDEX IF NOT EXISTS idx_alerts_is_active ON alerts(is_active) WHERE is_active = TRUE;

-- ============================================
-- SCRAPE LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS scrape_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id VARCHAR(50) NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  products_scraped INTEGER DEFAULT 0,
  products_updated INTEGER DEFAULT 0,
  errors INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'running', -- running, success, partial, failed
  error_message TEXT
);

CREATE INDEX IF NOT EXISTS idx_scrape_logs_store_id ON scrape_logs(store_id);
CREATE INDEX IF NOT EXISTS idx_scrape_logs_started_at ON scrape_logs(started_at);

-- ============================================
-- VIEWS
-- ============================================

-- View: Products with lowest price
CREATE OR REPLACE VIEW products_with_prices AS
SELECT
  p.*,
  MIN(pr.price) FILTER (WHERE pr.in_stock = TRUE) as lowest_price,
  MIN(pr.store_id) FILTER (WHERE pr.price = (
    SELECT MIN(price) FROM prices WHERE product_id = p.id AND in_stock = TRUE
  )) as lowest_price_store,
  MAX(pr.price) FILTER (WHERE pr.store_id = 'lego-official') as official_price,
  COUNT(DISTINCT pr.store_id) FILTER (WHERE pr.in_stock = TRUE) as stores_in_stock,
  BOOL_OR(pr.is_on_sale) as has_deals
FROM products p
LEFT JOIN prices pr ON p.id = pr.product_id
GROUP BY p.id;

-- View: Hot deals (products with significant discounts)
CREATE OR REPLACE VIEW hot_deals AS
SELECT
  p.*,
  pr.price,
  pr.original_price,
  pr.discount_percentage,
  pr.store_id,
  pr.url,
  official.price as official_price,
  (official.price - pr.price) as savings
FROM products p
JOIN prices pr ON p.id = pr.product_id
LEFT JOIN prices official ON p.id = official.product_id AND official.store_id = 'lego-official'
WHERE pr.is_on_sale = TRUE
  AND pr.in_stock = TRUE
  AND (pr.discount_percentage >= 10 OR (official.price - pr.price) > 50)
ORDER BY pr.discount_percentage DESC;

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function: Update product timestamp on price change
CREATE OR REPLACE FUNCTION update_product_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products
  SET updated_at = NOW()
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-update product when price changes
DROP TRIGGER IF EXISTS trigger_update_product_on_price_change ON prices;
CREATE TRIGGER trigger_update_product_on_price_change
AFTER INSERT OR UPDATE ON prices
FOR EACH ROW
EXECUTE FUNCTION update_product_timestamp();

-- Function: Record price in history
CREATE OR REPLACE FUNCTION record_price_history()
RETURNS TRIGGER AS $$
BEGIN
  -- Only record if price actually changed
  IF OLD.price IS DISTINCT FROM NEW.price THEN
    INSERT INTO price_history (product_id, store_id, price)
    VALUES (NEW.product_id, NEW.store_id, NEW.price);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-record price history
DROP TRIGGER IF EXISTS trigger_record_price_history ON prices;
CREATE TRIGGER trigger_record_price_history
AFTER UPDATE ON prices
FOR EACH ROW
EXECUTE FUNCTION record_price_history();

-- Function: Check and trigger alerts
CREATE OR REPLACE FUNCTION check_price_alerts()
RETURNS TRIGGER AS $$
BEGIN
  -- Update alerts that match the criteria
  UPDATE alerts
  SET last_triggered = NOW()
  WHERE is_active = TRUE
    AND (
      -- Product-specific alerts
      (product_id = NEW.product_id AND (
        (target_price IS NOT NULL AND NEW.price <= target_price)
        OR (notify_on_any_discount = TRUE AND NEW.is_on_sale = TRUE)
      ))
      -- Category alerts
      OR (category = (SELECT category FROM products WHERE id = NEW.product_id) AND (
        (notify_on_any_discount = TRUE AND NEW.is_on_sale = TRUE)
      ))
    )
    AND (last_triggered IS NULL OR last_triggered < NOW() - INTERVAL '24 hours');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Check alerts on price update
DROP TRIGGER IF EXISTS trigger_check_alerts ON prices;
CREATE TRIGGER trigger_check_alerts
AFTER INSERT OR UPDATE ON prices
FOR EACH ROW
EXECUTE FUNCTION check_price_alerts();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY users_own_data ON users
  FOR ALL USING (auth.uid() = id);

-- Users can only manage their own alerts
CREATE POLICY alerts_own_data ON alerts
  FOR ALL USING (auth.uid() = user_id);

-- Products and prices are public (read-only for non-authenticated)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE prices ENABLE ROW LEVEL SECURITY;

CREATE POLICY products_public_read ON products
  FOR SELECT USING (TRUE);

CREATE POLICY prices_public_read ON prices
  FOR SELECT USING (TRUE);

-- ============================================
-- SAMPLE DATA (for testing)
-- ============================================

-- Insert sample products
INSERT INTO products (sku, name, name_he, category, piece_count, min_age, image_url, release_year)
VALUES
  ('75192', 'Millennium Falcon', 'מילניום פלקון', 'star-wars', 7541, 16, 'https://www.lego.com/cdn/cs/set/assets/blt5b9a78ce4dfd0dca/75192.png', 2017),
  ('42143', 'Ferrari Daytona SP3', 'פרארי דייטונה SP3', 'technic', 3778, 18, 'https://www.lego.com/cdn/cs/set/assets/blt1bdced7ee89be31c/42143.png', 2022),
  ('76419', 'Hogwarts Castle and Grounds', 'טירת הוגוורטס', 'harry-potter', 2660, 18, 'https://www.lego.com/cdn/cs/set/assets/blt5b97e37c8d8f5f57/76419.png', 2023),
  ('10497', 'Galaxy Explorer', 'חוקר הגלקסיה', 'icons', 1254, 18, 'https://www.lego.com/cdn/cs/set/assets/blt6ebda8e5a8c8e73b/10497.png', 2022),
  ('71043', 'Hogwarts Castle', 'טירת הוגוורטס הגדולה', 'harry-potter', 6020, 16, 'https://www.lego.com/cdn/cs/set/assets/blt1e35c0e8e5e4d4d1/71043.png', 2018)
ON CONFLICT (sku) DO NOTHING;

-- Insert sample prices
INSERT INTO prices (product_id, store_id, price, original_price, in_stock, url, is_on_sale, discount_percentage)
SELECT
  p.id,
  'lego-official',
  3499,
  NULL,
  TRUE,
  'https://www.lego.com/he-il/product/millennium-falcon-75192',
  FALSE,
  NULL
FROM products p WHERE p.sku = '75192'
ON CONFLICT (product_id, store_id) DO NOTHING;

INSERT INTO prices (product_id, store_id, price, original_price, in_stock, url, is_on_sale, discount_percentage)
SELECT
  p.id,
  'ksp',
  2799,
  3499,
  TRUE,
  'https://ksp.co.il/web/item/75192',
  TRUE,
  20
FROM products p WHERE p.sku = '75192'
ON CONFLICT (product_id, store_id) DO NOTHING;

INSERT INTO prices (product_id, store_id, price, original_price, in_stock, url, is_on_sale, discount_percentage)
SELECT
  p.id,
  'bug',
  2899,
  3299,
  TRUE,
  'https://www.bug.co.il/75192',
  TRUE,
  12
FROM products p WHERE p.sku = '75192'
ON CONFLICT (product_id, store_id) DO NOTHING;
