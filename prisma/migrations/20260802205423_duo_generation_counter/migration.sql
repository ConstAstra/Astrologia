-- CreateTable
CREATE TABLE "DuoGeneration" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DuoGeneration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DuoGeneration_createdAt_idx" ON "DuoGeneration"("createdAt");
