ALTER TABLE "Problem" ADD COLUMN "problemType" TEXT NOT NULL DEFAULT 'programming';
ALTER TABLE "Problem" ADD COLUMN "objectiveItems" TEXT;
ALTER TABLE "Exam" ADD COLUMN "examType" TEXT NOT NULL DEFAULT 'programming';

CREATE INDEX "Problem_problemType_category_idx" ON "Problem"("problemType", "category");
CREATE INDEX "Exam_examType_status_idx" ON "Exam"("examType", "status");
