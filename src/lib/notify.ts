import { prisma } from "@/lib/db";
import { sendPushNotification, isGoneSubscriptionError, type SendPushInput } from "@/lib/push";

/**
 * Notifie un utilisateur d'une activité sociale (ami accepté, quelqu'un a
 * testé sa compatibilité via son lien) s'il est opt-in et a au moins un
 * appareil abonné. Toujours best-effort : n'importe quelle erreur d'envoi
 * est avalée, jamais propagée à l'appelant — cette notification est un
 * bonus, jamais une condition de succès de l'action qui la déclenche
 * (acceptation d'ami, génération de carte publique...).
 */
export async function notifyFriendActivity(userId: string, input: SendPushInput): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { friendActivityPushOptIn: true, pushSubscriptions: true },
  });
  if (!user?.friendActivityPushOptIn || user.pushSubscriptions.length === 0) return;

  for (const sub of user.pushSubscriptions) {
    try {
      await sendPushNotification(sub, input);
    } catch (err) {
      if (isGoneSubscriptionError(err)) {
        await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {});
      }
    }
  }
}
