-- Ajoute les préférences de notification. `unsubscribeToken` est
-- backfillé avec une valeur aléatoire unique pour les lignes existantes
-- (le défaut `cuid()` est côté Prisma, pas SQLite, donc inapplicable en ALTER).
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "subscriptionStatus" TEXT NOT NULL DEFAULT 'free',
    "subscriptionPlan" TEXT,
    "entitlementSource" TEXT,
    "currentPeriodEnd" DATETIME,
    "credits" INTEGER NOT NULL DEFAULT 0,
    "dailyHoroscopeOptIn" BOOLEAN NOT NULL DEFAULT true,
    "unsubscribeToken" TEXT NOT NULL,
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "appleOriginalTransactionId" TEXT
);
INSERT INTO "new_User" ("appleOriginalTransactionId", "createdAt", "credits", "currentPeriodEnd", "email", "entitlementSource", "id", "name", "passwordHash", "stripeCustomerId", "stripeSubscriptionId", "subscriptionPlan", "subscriptionStatus", "unsubscribeToken", "updatedAt") SELECT "appleOriginalTransactionId", "createdAt", "credits", "currentPeriodEnd", "email", "entitlementSource", "id", "name", "passwordHash", "stripeCustomerId", "stripeSubscriptionId", "subscriptionPlan", "subscriptionStatus", lower(hex(randomblob(16))), "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_unsubscribeToken_key" ON "User"("unsubscribeToken");
CREATE UNIQUE INDEX "User_stripeCustomerId_key" ON "User"("stripeCustomerId");
CREATE UNIQUE INDEX "User_stripeSubscriptionId_key" ON "User"("stripeSubscriptionId");
CREATE UNIQUE INDEX "User_appleOriginalTransactionId_key" ON "User"("appleOriginalTransactionId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
