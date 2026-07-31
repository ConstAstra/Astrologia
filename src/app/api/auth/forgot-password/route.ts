import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { createPasswordResetToken } from "@/lib/auth/passwordReset";
import { sendEmail } from "@/lib/email";

const schema = z.object({
  email: z.string().trim().toLowerCase().email(),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "E-mail invalide." }, { status: 400 });
  }

  // Réponse identique que le compte existe ou non : on ne révèle jamais
  // si une adresse e-mail est inscrite.
  const successMessage = "Si un compte existe pour cette adresse, un e-mail de réinitialisation vient d'être envoyé.";

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user) {
    return NextResponse.json({ message: successMessage });
  }

  const token = await createPasswordResetToken(user.id);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const resetUrl = `${siteUrl}/reinitialiser-mot-de-passe?token=${token}`;

  await sendEmail({
    to: user.email,
    subject: "Réinitialisation de votre mot de passe Astrologia",
    html: `
      <p>Bonjour${user.name ? ` ${user.name}` : ""},</p>
      <p>Vous avez demandé à réinitialiser votre mot de passe Astrologia. Ce lien est valable une heure :</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>Si vous n'êtes pas à l'origine de cette demande, ignorez simplement cet e-mail.</p>
    `,
  });

  return NextResponse.json({ message: successMessage });
}
