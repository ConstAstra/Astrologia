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
