-- AlterTable
ALTER TABLE "CandidateSkill" DROP COLUMN "proficiency";

-- AlterTable
ALTER TABLE "Education" ADD COLUMN     "board" TEXT;

-- DropEnum
DROP TYPE "ProficiencyLevel";

-- CreateIndex
CREATE INDEX "Education_candidateProfileId_level_idx" ON "Education"("candidateProfileId", "level");

