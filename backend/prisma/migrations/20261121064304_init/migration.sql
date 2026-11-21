-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('TRAINING_CENTER_ADMIN', 'DISTRICT_OFFICER', 'QUALITY_OFFICER', 'STATE_ADMIN');

-- CreateEnum
CREATE TYPE "BatchStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'RETURNED', 'REJECTED', 'QUALITY_REVIEW', 'STATE_APPROVAL', 'APPROVED', 'CERTIFICATES_ISSUED');

-- CreateEnum
CREATE TYPE "CandidateStatus" AS ENUM ('PENDING', 'ISSUED', 'REVOKED');

-- CreateEnum
CREATE TYPE "ApprovalDecision" AS ENUM ('APPROVED', 'REJECTED', 'SENT_BACK');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Batch" (
    "id" SERIAL NOT NULL,
    "batchName" TEXT NOT NULL,
    "centerId" INTEGER NOT NULL,
    "status" "BatchStatus" NOT NULL DEFAULT 'DRAFT',
    "reviewRound" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "submittedAt" TIMESTAMP(3),

    CONSTRAINT "Batch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Candidate" (
    "id" SERIAL NOT NULL,
    "batchId" INTEGER NOT NULL,
    "candidateName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "courseName" TEXT NOT NULL,
    "completionDate" TIMESTAMP(3),
    "status" "CandidateStatus" NOT NULL DEFAULT 'PENDING',
    "certificateId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Candidate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Approval" (
    "id" SERIAL NOT NULL,
    "batchId" INTEGER NOT NULL,
    "officerId" INTEGER NOT NULL,
    "decision" "ApprovalDecision" NOT NULL,
    "comments" TEXT,
    "reviewRound" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Approval_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Candidate_certificateId_key" ON "Candidate"("certificateId");

-- CreateIndex
CREATE UNIQUE INDEX "Approval_batchId_officerId_reviewRound_key" ON "Approval"("batchId", "officerId", "reviewRound");

-- AddForeignKey
ALTER TABLE "Batch" ADD CONSTRAINT "Batch_centerId_fkey" FOREIGN KEY ("centerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Candidate" ADD CONSTRAINT "Candidate_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Approval" ADD CONSTRAINT "Approval_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Approval" ADD CONSTRAINT "Approval_officerId_fkey" FOREIGN KEY ("officerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
