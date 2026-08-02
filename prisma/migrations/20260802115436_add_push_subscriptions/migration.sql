-- CreateTable
CREATE TABLE "PushSubscription" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PushSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

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
    "locale" TEXT NOT NULL DEFAULT 'fr',
    "dailyHoroscopeOptIn" BOOLEAN NOT NULL DEFAULT true,
    "unsubscribeToken" TEXT NOT NULL,
    "dailyTransitPushOptIn" BOOLEAN NOT NULL DEFAULT false,
    "currentStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "lastActiveDate" TEXT,
    "referralCode" TEXT NOT NULL,
    "referredByUserId" TEXT,
    "referralRewardGranted" BOOLEAN NOT NULL DEFAULT false,
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "appleOriginalTransactionId" TEXT,
    CONSTRAINT "User_referredByUserId_fkey" FOREIGN KEY ("referredByUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_User" ("appleOriginalTransactionId", "createdAt", "credits", "currentPeriodEnd", "currentStreak", "dailyHoroscopeOptIn", "email", "entitlementSource", "id", "lastActiveDate", "locale", "longestStreak", "name", "passwordHash", "referralCode", "referralRewardGranted", "referredByUserId", "stripeCustomerId", "stripeSubscriptionId", "subscriptionPlan", "subscriptionStatus", "unsubscribeToken", "updatedAt") SELECT "appleOriginalTransactionId", "createdAt", "credits", "currentPeriodEnd", "currentStreak", "dailyHoroscopeOptIn", "email", "entitlementSource", "id", "lastActiveDate", "locale", "longestStreak", "name", "passwordHash", "referralCode", "referralRewardGranted", "referredByUserId", "stripeCustomerId", "stripeSubscriptionId", "subscriptionPlan", "subscriptionStatus", "unsubscribeToken", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_unsubscribeToken_key" ON "User"("unsubscribeToken");
CREATE UNIQUE INDEX "User_referralCode_key" ON "User"("referralCode");
CREATE UNIQUE INDEX "User_stripeCustomerId_key" ON "User"("stripeCustomerId");
CREATE UNIQUE INDEX "User_stripeSubscriptionId_key" ON "User"("stripeSubscriptionId");
CREATE UNIQUE INDEX "User_appleOriginalTransactionId_key" ON "User"("appleOriginalTransactionId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "PushSubscription_endpoint_key" ON "PushSubscription"("endpoint");

-- CreateIndex
CREATE INDEX "PushSubscription_userId_idx" ON "PushSubscription"("userId");
