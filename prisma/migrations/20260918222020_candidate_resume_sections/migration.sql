-- CreateEnum
CREATE TYPE "EducationLevel" AS ENUM ('SECONDARY', 'HIGHER_SECONDARY', 'DIPLOMA', 'UNDERGRADUATE', 'POSTGRADUATE', 'DOCTORATE', 'CERTIFICATE_PROGRAM', 'OTHER');

-- CreateEnum
CREATE TYPE "PublicationType" AS ENUM ('RESEARCH_PAPER', 'ARTICLE', 'BOOK_CHAPTER', 'PATENT', 'CONFERENCE_PAPER', 'OTHER');

-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "atsBreakdown" JSONB,
ADD COLUMN     "atsScore" INTEGER,
ADD COLUMN     "sharedSections" TEXT[];

-- AlterTable
ALTER TABLE "CandidateProfile" ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "githubUrl" TEXT,
ADD COLUMN     "lastName" TEXT,
ADD COLUMN     "linkedinUrl" TEXT,
ADD COLUMN     "portfolioUrl" TEXT;

-- AlterTable
ALTER TABLE "Education" ADD COLUMN     "level" "EducationLevel" NOT NULL DEFAULT 'UNDERGRADUATE';

-- AlterTable
ALTER TABLE "Experience" ADD COLUMN     "employmentType" "EmploymentType" NOT NULL DEFAULT 'FULL_TIME';

-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "requestedSections" TEXT[];

-- CreateTable
CREATE TABLE "CandidateLink" (
    "id" TEXT NOT NULL,
    "candidateProfileId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CandidateLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VolunteeringExperience" (
    "id" TEXT NOT NULL,
    "candidateProfileId" TEXT NOT NULL,
    "organization" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "cause" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VolunteeringExperience_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Publication" (
    "id" TEXT NOT NULL,
    "candidateProfileId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "publicationType" "PublicationType" NOT NULL DEFAULT 'RESEARCH_PAPER',
    "venue" TEXT,
    "authors" TEXT,
    "publishedDate" TIMESTAMP(3),
    "url" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Publication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Award" (
    "id" TEXT NOT NULL,
    "candidateProfileId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "issuer" TEXT,
    "awardDate" TIMESTAMP(3),
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Award_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CandidateLink_candidateProfileId_idx" ON "CandidateLink"("candidateProfileId");

-- CreateIndex
CREATE INDEX "VolunteeringExperience_candidateProfileId_idx" ON "VolunteeringExperience"("candidateProfileId");

-- CreateIndex
CREATE INDEX "Publication_candidateProfileId_idx" ON "Publication"("candidateProfileId");

-- CreateIndex
CREATE INDEX "Award_candidateProfileId_idx" ON "Award"("candidateProfileId");

-- AddForeignKey
ALTER TABLE "CandidateLink" ADD CONSTRAINT "CandidateLink_candidateProfileId_fkey" FOREIGN KEY ("candidateProfileId") REFERENCES "CandidateProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolunteeringExperience" ADD CONSTRAINT "VolunteeringExperience_candidateProfileId_fkey" FOREIGN KEY ("candidateProfileId") REFERENCES "CandidateProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Publication" ADD CONSTRAINT "Publication_candidateProfileId_fkey" FOREIGN KEY ("candidateProfileId") REFERENCES "CandidateProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Award" ADD CONSTRAINT "Award_candidateProfileId_fkey" FOREIGN KEY ("candidateProfileId") REFERENCES "CandidateProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
