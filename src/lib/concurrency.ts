/**
 * Traite `items` avec au plus `limit` exécutions de `fn` en parallèle à la
 * fois. Utilisé par les crons d'envoi (horoscope quotidien, rappels push) :
 * un `for` séquentiel qui attend un envoi réseau (Resend, Web Push) par
 * utilisateur avant de passer au suivant peut, sur plusieurs milliers de
 * comptes, dépasser la durée maximale d'une fonction serverless et couper
 * l'envoi en plein milieu sans que personne ne le sache ; un `Promise.all`
 * sans limite risquerait à l'inverse de saturer d'un coup le débit de l'API
 * d'envoi ou le pool de connexions à la base.
 */
export async function processWithConcurrency<T>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<void>
): Promise<void> {
  let index = 0;
  async function worker(): Promise<void> {
    while (index < items.length) {
      const current = items[index++];
      await fn(current);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
}
