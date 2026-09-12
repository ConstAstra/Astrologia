/**
 * Valide qu'une valeur de redirection prise dans l'URL (paramètre `next`)
 * reste bien interne au site avant de la passer à `router.push`.
 *
 * Un simple `next.startsWith("/")` ne suffit pas : `//evil.com` et
 * `/\evil.com` passent ce test tout en étant interprétés par le navigateur
 * comme des URLs protocole-relatif vers un autre domaine — un attaquant
 * n'a alors qu'à faire cliquer la victime sur un lien vers le vrai site
 * (`https://astrologium.app/connexion?next=//phishing.example`) pour la
 * renvoyer, une fois connectée, vers une page qu'il contrôle.
 */
export function safeNextPath(next: string | null | undefined, fallback: string): string {
  if (!next) return fallback;
  if (!next.startsWith("/")) return fallback;
  if (next.startsWith("//") || next.startsWith("/\\")) return fallback;
  return next;
}
