-- AddFarmCostFields Migration
ALTER TABLE "farm_products" ADD COLUMN IF NOT EXISTS "farmCostRetail" DECIMAL(10,2);
ALTER TABLE "farm_products" ADD COLUMN IF NOT EXISTS "farmCostBulk" DECIMAL(10,2);
