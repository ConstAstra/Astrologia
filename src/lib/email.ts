// Abstraction d'envoi d'e-mail. En développement (ou si aucun fournisseur
// n'est configuré), on se contente de logguer le contenu dans la console :
// pratique pour tester le flux mot-de-passe-oublié sans compte tiers.
// En production, définissez RESEND_API_KEY pour envoyer réellement les
// e-mails via Resend (https://resend.com) — aucune autre config requise.

export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailInput): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    if (process.env.NODE_ENV === "production") {
      // Ne jamais déverser un e-mail en clair (il peut contenir un jeton de
      // réinitialisation de mot de passe ou de désabonnement) dans les logs
      // de production si la clé manque par erreur — un avertissement suffit
      // à diagnostiquer le problème de configuration.
      console.warn(`[email] RESEND_API_KEY manquant en production — e-mail "${subject}" à ${to} non envoyé.`);
      return;
    }
    console.log(`[email:dev] À: ${to}\nSujet: ${subject}\n${html}`);
    return;
  }

  const from = process.env.EMAIL_FROM || "Astrologium <no-reply@astrologium.app>";
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, html }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Échec de l'envoi de l'e-mail (${res.status}) : ${body}`);
  }
}
