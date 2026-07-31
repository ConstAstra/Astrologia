import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { createPasswordResetToken } from "@/lib/auth/passwordReset";
import { sendEmail } from "@/lib/email";

const schema = z.object({
  email: z.string().trim().toLowerCase().email(),
  locale: z.enum(["fr", "en"]).optional().default("fr"),
});

const TEXT = {
  fr: {
    successMessage: "Si un compte existe pour cette adresse, un e-mail de réinitialisation vient d'être envoyé.",
    resetPath: "/reinitialiser-mot-de-passe",
    subject: "Réinitialisation de votre mot de passe Astrologia",
    body: (name: string, resetUrl: string) => `
      <p>Bonjour${name},</p>
      <p>Vous avez demandé à réinitialiser votre mot de passe Astrologia. Ce lien est valable une heure :</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>Si vous n'êtes pas à l'origine de cette demande, ignorez simplement cet e-mail.</p>
    `,
  },
  en: {
    successMessage: "If an account exists for this address, a reset email has just been sent.",
    resetPath: "/en/reset-password",
    subject: "Reset your Astrologia password",
    body: (name: string, resetUrl: string) => `
      <p>Hello${name},</p>
      <p>You requested to reset your Astrologia password. This link is valid for one hour:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>If you didn't request this, simply ignore this email.</p>
    `,
  },
};

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "E-mail invalide." }, { status: 400 });
  }

  const t = TEXT[parsed.data.locale];

  // Réponse identique que le compte existe ou non : on ne révèle jamais
  // si une adresse e-mail est inscrite.
  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user) {
    return NextResponse.json({ message: t.successMessage });
  }

  const token = await createPasswordResetToken(user.id);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const resetUrl = `${siteUrl}${t.resetPath}?token=${token}`;

  await sendEmail({
    to: user.email,
    subject: t.subject,
    html: t.body(user.name ? ` ${user.name}` : "", resetUrl),
  });

  return NextResponse.json({ message: t.successMessage });
}
