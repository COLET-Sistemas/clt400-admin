-- Manual migration (fallback se drizzle-kit generate não rodar).
-- Rode: psql $DATABASE_URL -f drizzle/0000_init.sql

CREATE TYPE "api_protocol" AS ENUM ('http', 'https');

CREATE TABLE IF NOT EXISTS "tenants" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" text NOT NULL,
  "slug" text NOT NULL UNIQUE,
  "api_protocol" "api_protocol" NOT NULL,
  "api_host" text NOT NULL,
  "api_port" integer NOT NULL,
  "api_token" text NOT NULL,
  "setup_code" text NOT NULL,
  "setup_ip" inet,
  "setup_completed_at" timestamptz,
  "session_version" integer NOT NULL DEFAULT 1,
  "active" boolean NOT NULL DEFAULT true,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "setup_code_rotated_at" timestamptz,
  "last_used_at" timestamptz
);

CREATE INDEX IF NOT EXISTS "tenants_active_idx" ON "tenants" ("active");
