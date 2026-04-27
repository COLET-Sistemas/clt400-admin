import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  pgEnum,
  inet,
} from "drizzle-orm/pg-core";

export const apiProtocolEnum = pgEnum("api_protocol", ["http", "https"]);

export const tenants = pgTable("tenants", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  apiProtocol: apiProtocolEnum("api_protocol").notNull(),
  apiHost: text("api_host").notNull(),
  apiPort: integer("api_port").notNull(),
  apiToken: text("api_token").notNull(),
  setupCode: text("setup_code").notNull(),
  setupIp: inet("setup_ip"),
  setupCompletedAt: timestamp("setup_completed_at", { withTimezone: true }),
  sessionVersion: integer("session_version").notNull().default(1),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  setupCodeRotatedAt: timestamp("setup_code_rotated_at", {
    withTimezone: true,
  }),
  lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
});

export type Tenant = typeof tenants.$inferSelect;
export type NewTenant = typeof tenants.$inferInsert;
