// Limiteur de débit en mémoire (process unique) : suffisant pour une seule
// instance serveur, mais ne protège pas un déploiement multi-instance — dans
// ce cas, remplacer par un store partagé (Redis, Upstash...). Chaque route
// sensible instancie son propre limiteur (fenêtre glissante par IP) via
// `createRateLimiter`, pour garder des seuils indépendants par endpoint.

export function createRateLimiter({ max, windowMs }: { max: number; windowMs: number }) {
  const requestTimestampsByKey = new Map<string, number[]>();

  return {
    isLimited(key: string): boolean {
      const now = Date.now();
      const timestamps = (requestTimestampsByKey.get(key) ?? []).filter((t) => now - t < windowMs);
      timestamps.push(now);
      // Une clé qui ne revient jamais (IP usurpée, coup unique...) ne doit
      // pas rester en mémoire indéfiniment : sans purge, chaque nouvelle
      // clé jamais revue grossit la Map pour toute la durée de vie du
      // process — une fuite mémoire facile à déclencher volontairement en
      // variant la clé à chaque requête (voir clientIp ci-dessous).
      if (timestamps.length > max) {
        requestTimestampsByKey.set(key, timestamps);
        return true;
      }
      requestTimestampsByKey.set(key, timestamps);
      if (requestTimestampsByKey.size > 50_000) {
        for (const [k, v] of requestTimestampsByKey) {
          if (v.every((t) => now - t >= windowMs)) requestTimestampsByKey.delete(k);
        }
      }
      return false;
    },
  };
}

// Le dernier maillon de la chaîne x-forwarded-for est celui posé par le
// proxy directement adjacent à ce serveur (Vercel, ou tout reverse proxy en
// façade) : c'est le seul qu'un client distant ne peut pas falsifier. Le
// premier maillon, lui, peut être un en-tête que le client a fourni
// lui-même avant d'atteindre ce proxy — s'y fier permettrait de contourner
// toute limitation de débit basée sur l'IP en changeant cette valeur à
// chaque requête.
export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (!forwarded) return "unknown";
  const hops = forwarded.split(",").map((h) => h.trim()).filter(Boolean);
  return hops[hops.length - 1] || "unknown";
}
