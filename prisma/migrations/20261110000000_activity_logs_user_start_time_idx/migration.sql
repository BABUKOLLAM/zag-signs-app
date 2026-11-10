-- Speeds up date-range filters on activities (Activities list, DAR, Team performance).
-- NOT applied automatically: the Vercel build does not run migrations.
-- CreateIndex
CREATE INDEX "activity_logs_userId_startTime_idx" ON "activity_logs"("userId", "startTime");
