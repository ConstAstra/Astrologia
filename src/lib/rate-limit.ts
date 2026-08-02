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
      requestTimestampsByKey.set(key, timestamps);
      return timestamps.length > max;
    },
  };
}

export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "unknown";
}
