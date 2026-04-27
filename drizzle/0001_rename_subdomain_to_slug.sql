-- Renomeia coluna subdomain → slug (identificação por path da URL)
ALTER TABLE "tenants" RENAME COLUMN "subdomain" TO "slug";
