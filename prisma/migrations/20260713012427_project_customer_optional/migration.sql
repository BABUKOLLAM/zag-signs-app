-- DropForeignKey
ALTER TABLE "projects" DROP CONSTRAINT "projects_customerId_fkey";

-- AlterTable
ALTER TABLE "projects" ALTER COLUMN "customerId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
