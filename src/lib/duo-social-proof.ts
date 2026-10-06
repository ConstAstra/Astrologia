import { prisma } from "@/lib/db";

// En dessous de ce seuil, on préfère ne rien afficher plutôt qu'un chiffre
// dérisoire ("3 cartes cette semaine") qui ferait plus de mal que de bien —
// une preuve sociale faible est pire qu'aucune preuve sociale. Le compteur
// s'active de lui-même une fois l'usage réel au rendez-vous, sans qu'il y
// ait quoi que ce soit à changer dans le code.
const MIN_DISPLAY_THRESHOLD = 20;

/** Nombre réel de cartes /duo générées sur les 7 derniers jours, ou null si trop bas pour valoir la peine d'être montré. */
export async function getDuoSocialProofCount(): Promise<number | null> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const count = await prisma.duoGeneration.count({ where: { createdAt: { gte: sevenDaysAgo } } });
  return count >= MIN_DISPLAY_THRESHOLD ? count : null;
}
