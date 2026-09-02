import { prisma } from "@/lib/db";

const MILESTONES = [3, 7, 14, 30, 60, 100, 200, 365];

export interface StreakResult {
  currentStreak: number;
  longestStreak: number;
  isNewMilestone: boolean;
  /** Vrai le jour où la série dépasse le record précédent (jamais le tout premier jour, ce n'est pas encore un "record" à fêter). */
  isNewRecord: boolean;
}

function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

function isYesterday(dateStr: string, today: string): boolean {
  const diffDays = Math.round(
    (Date.parse(`${today}T00:00:00Z`) - Date.parse(`${dateStr}T00:00:00Z`)) / 86_400_000
  );
  return diffDays === 1;
}

/**
 * Enregistre une visite du jour et met à jour la série de connexions
 * consécutives. Idempotent sur une même journée UTC (rappeler plusieurs fois
 * le même jour ne change rien) — safe à appeler à chaque requête dashboard.
 * Prend les valeurs déjà chargées par l'appelant (évite une requête de
 * lecture en plus de l'update).
 */
export async function recordDailyActivity(
  userId: string,
  current: { currentStreak: number; longestStreak: number; lastActiveDate: string | null }
): Promise<StreakResult> {
  const today = todayUTC();
  if (current.lastActiveDate === today) {
    return { currentStreak: current.currentStreak, longestStreak: current.longestStreak, isNewMilestone: false, isNewRecord: false };
  }

  const continued = current.lastActiveDate ? isYesterday(current.lastActiveDate, today) : false;
  const currentStreak = continued ? current.currentStreak + 1 : 1;
  const isNewRecord = currentStreak > current.longestStreak && currentStreak >= 2;
  const longestStreak = Math.max(current.longestStreak, currentStreak);

  await prisma.user.update({
    where: { id: userId },
    data: { currentStreak, longestStreak, lastActiveDate: today },
  });

  return { currentStreak, longestStreak, isNewMilestone: MILESTONES.includes(currentStreak), isNewRecord };
}
