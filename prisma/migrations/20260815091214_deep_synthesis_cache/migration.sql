-- CreateTable
CREATE TABLE "DeepSynthesis" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "secondaryProfileId" TEXT,
    "year" INTEGER,
    "relationshipType" TEXT,
    "locale" TEXT NOT NULL,
    "contentJson" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeepSynthesis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DeepSynthesis_type_profileId_secondaryProfileId_year_locale_idx" ON "DeepSynthesis"("type", "profileId", "secondaryProfileId", "year", "locale");

-- AddForeignKey
ALTER TABLE "DeepSynthesis" ADD CONSTRAINT "DeepSynthesis_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeepSynthesis" ADD CONSTRAINT "DeepSynthesis_secondaryProfileId_fkey" FOREIGN KEY ("secondaryProfileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
