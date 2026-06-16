-- AlterTable: Change category from enum to text for flexibility
ALTER TABLE "inventory_items" ALTER COLUMN "category" TYPE TEXT;

-- AlterTable: Add new fields
ALTER TABLE "inventory_items" ADD COLUMN "imageUrl" TEXT, ADD COLUMN "size" TEXT;
