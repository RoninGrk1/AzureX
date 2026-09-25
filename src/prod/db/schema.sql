-- AzureX durable ledger
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  mfa_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  oidc_sub TEXT UNIQUE,
  webauthn_credential_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS positions (
  id TEXT PRIMARY KEY,
  symbol TEXT NOT NULL,
  name TEXT NOT NULL,
  asset_class TEXT NOT NULL,
  quantity NUMERIC(28, 10) NOT NULL,
  avg_cost NUMERIC(28, 10) NOT NULL,
  last_price NUMERIC(28, 10) NOT NULL,
  market_value NUMERIC(28, 10) NOT NULL,
  unrealized_pnl NUMERIC(28, 10) NOT NULL,
  weight NUMERIC(12, 8) NOT NULL,
  venue TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS portfolio_snapshots (
  id BIGSERIAL PRIMARY KEY,
  nav NUMERIC(28, 2) NOT NULL,
  cash NUMERIC(28, 2) NOT NULL,
  gross_exposure NUMERIC(28, 2) NOT NULL,
  net_exposure NUMERIC(28, 2) NOT NULL,
  leverage NUMERIC(12, 6) NOT NULL,
  drawdown NUMERIC(12, 6) NOT NULL,
  pnl_day NUMERIC(28, 2) NOT NULL,
  pnl_week NUMERIC(28, 2) NOT NULL,
  pnl_month NUMERIC(28, 2) NOT NULL,
  as_of TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  client_order_id TEXT UNIQUE NOT NULL,
  asset TEXT NOT NULL,
  asset_class TEXT NOT NULL,
  side TEXT NOT NULL,
  quantity NUMERIC(28, 10) NOT NULL,
  estimated_value NUMERIC(28, 2) NOT NULL,
  entry NUMERIC(28, 10) NOT NULL,
  status TEXT NOT NULL,
  reasoning TEXT NOT NULL,
  approved_by TEXT,
  fill_price NUMERIC(28, 10),
  venue TEXT,
  adapter TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS audit_events (
  id TEXT PRIMARY KEY,
  ts TIMESTAMPTZ NOT NULL,
  actor TEXT NOT NULL,
  actor_type TEXT NOT NULL,
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  details JSONB NOT NULL DEFAULT '{}',
  prev_hash TEXT NOT NULL,
  hash TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS audit_events_ts_idx ON audit_events (ts);
CREATE TABLE IF NOT EXISTS wallet_tx (
  id TEXT PRIMARY KEY,
  wallet_id TEXT NOT NULL,
  type TEXT NOT NULL,
  asset TEXT NOT NULL,
  amount NUMERIC(28, 10) NOT NULL,
  usd NUMERIC(28, 2) NOT NULL,
  counterparty TEXT,
  status TEXT NOT NULL,
  travel_rule_status TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS execution_fills (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id),
  adapter TEXT NOT NULL,
  venue TEXT NOT NULL,
  qty NUMERIC(28, 10) NOT NULL,
  price NUMERIC(28, 10) NOT NULL,
  liquidity TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS best_execution (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  venues_considered JSONB NOT NULL,
  selected_venue TEXT NOT NULL,
  rationale TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
