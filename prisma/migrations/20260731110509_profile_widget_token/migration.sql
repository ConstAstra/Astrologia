-- Ajoute le jeton du widget iOS. Backfillé avec une valeur aléatoire unique
-- par ligne pour les profils existants (randomblob est réévalué à chaque
-- ligne de la requête, donc chaque profil obtient une valeur distincte).
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Profile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "isSelf" BOOLEAN NOT NULL DEFAULT false,
    "birthDate" TEXT NOT NULL,
    "birthTime" TEXT,
    "timeUnknown" BOOLEAN NOT NULL DEFAULT false,
    "locationName" TEXT NOT NULL,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "tzName" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "widgetToken" TEXT NOT NULL,
    CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Profile" ("birthDate", "birthTime", "createdAt", "id", "isSelf", "label", "latitude", "locationName", "longitude", "timeUnknown", "tzName", "updatedAt", "userId", "widgetToken") SELECT "birthDate", "birthTime", "createdAt", "id", "isSelf", "label", "latitude", "locationName", "longitude", "timeUnknown", "tzName", "updatedAt", "userId", lower(hex(randomblob(12))) FROM "Profile";
DROP TABLE "Profile";
ALTER TABLE "new_Profile" RENAME TO "Profile";
CREATE UNIQUE INDEX "Profile_widgetToken_key" ON "Profile"("widgetToken");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
