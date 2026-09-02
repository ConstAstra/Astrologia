-- CreateTable
CREATE TABLE "TransitCheckIn" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "reaction" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TransitCheckIn_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TransitCheckIn_profileId_idx" ON "TransitCheckIn"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "TransitCheckIn_profileId_date_key" ON "TransitCheckIn"("profileId", "date");

-- AddForeignKey
ALTER TABLE "TransitCheckIn" ADD CONSTRAINT "TransitCheckIn_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
