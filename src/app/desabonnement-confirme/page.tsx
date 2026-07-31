import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = { title: "Désabonnement confirmé — Astrologia" };

export default function UnsubscribeConfirmedPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <Card className="w-full max-w-md p-8 text-center">
          <h1 className="font-display text-3xl">Désabonnement confirmé</h1>
          <p className="mt-3 text-sm text-muted">
            Vous ne recevrez plus l&apos;horoscope quotidien par e-mail. Vous pouvez réactiver cette option à tout
            moment depuis votre compte.
          </p>
          <Link href="/dashboard/abonnement" className="mt-6 inline-block text-sm text-gold-strong hover:underline">
            Retour à mon compte
          </Link>
        </Card>
      </main>
      <SiteFooter />
    </>
  );
}
