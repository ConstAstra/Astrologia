import { getCurrentUser } from "@/lib/auth/session";

// Accès admin basé sur une liste d'e-mails en variable d'environnement
// (ADMIN_EMAILS, séparés par des virgules) plutôt qu'un champ isAdmin en
// base : aucune requête ne peut jamais accidentellement rendre un compte
// admin, seul un changement de config Vercel (comme AUTH_SECRET) le peut.
function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string): boolean {
  return adminEmails().includes(email.toLowerCase());
}

/** Utilisateur courant s'il est admin, sinon null — à vérifier explicitement à chaque route/page admin. */
export async function getAdminUser() {
  const user = await getCurrentUser();
  if (!user || !isAdminEmail(user.email)) return null;
  return user;
}
