-- Convert Branch from a fixed enum to a plain string column across all tables.
-- Branch names are configurable per business (e.g. ZAG SIGNS: HO, TVM, KTYM, EKM, CLT)
-- so a new SaaS customer's branch list never requires a schema migration.
--
-- Uses ALTER COLUMN ... TYPE ... USING to safely cast existing enum values to
-- text in place, preserving all existing data (no drop/recreate).

ALTER TABLE "users"           ALTER COLUMN "branch" TYPE TEXT USING "branch"::TEXT;
ALTER TABLE "leads"           ALTER COLUMN "branch" TYPE TEXT USING "branch"::TEXT;
ALTER TABLE "customers"       ALTER COLUMN "branch" TYPE TEXT USING "branch"::TEXT;
ALTER TABLE "opportunities"   ALTER COLUMN "branch" TYPE TEXT USING "branch"::TEXT;
ALTER TABLE "dars"            ALTER COLUMN "branch" TYPE TEXT USING "branch"::TEXT;
ALTER TABLE "wwrs"            ALTER COLUMN "branch" TYPE TEXT USING "branch"::TEXT;
ALTER TABLE "mwrs"            ALTER COLUMN "branch" TYPE TEXT USING "branch"::TEXT;
ALTER TABLE "documents"       ALTER COLUMN "branch" TYPE TEXT USING "branch"::TEXT;
ALTER TABLE "employees"       ALTER COLUMN "branch" TYPE TEXT USING "branch"::TEXT;
ALTER TABLE "tenders"         ALTER COLUMN "branch" TYPE TEXT USING "branch"::TEXT;
ALTER TABLE "vendors"         ALTER COLUMN "branch" TYPE TEXT USING "branch"::TEXT;
ALTER TABLE "purchase_orders" ALTER COLUMN "branch" TYPE TEXT USING "branch"::TEXT;
ALTER TABLE "vehicles"        ALTER COLUMN "branch" TYPE TEXT USING "branch"::TEXT;
ALTER TABLE "projects"        ALTER COLUMN "branch" TYPE TEXT USING "branch"::TEXT;

-- Drop the enum type now that nothing references it.
DROP TYPE "Branch";
