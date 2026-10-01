import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Card } from "@/components/ui/Card";
import { AuthForm } from "@/components/auth/AuthForm";

export const metadata: Metadata = { title: "Créer un compte — Astrologium" };

export default function InscriptionPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <Card className="w-full max-w-md p-8">
          <h1 className="font-display text-3xl">Créer mon compte</h1>
          <p className="mt-2 text-sm text-muted">Gratuit. Votre thème natal complet vous attend.</p>
          <div className="mt-6">
            <Suspense>
              <AuthForm mode="register" />
            </Suspense>
          </div>
          <p className="mt-6 text-center text-sm text-muted">
            Déjà un compte ?{" "}
            <Link href="/connexion" className="text-gold-strong hover:underline">
              Se connecter
            </Link>
          </p>
        </Card>
      </main>
      <SiteFooter />
    </>
  );
}
