import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Card } from "@/components/ui/Card";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = { title: "Forgot password — Astrologia" };

export default function ForgotPasswordEnPage() {
  return (
    <>
      <SiteHeader locale="en" />
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <Card className="w-full max-w-md p-8">
          <h1 className="font-display text-3xl">Forgot password</h1>
          <p className="mt-2 text-sm text-muted">
            Enter your email and we&apos;ll send you a link to choose a new password.
          </p>
          <div className="mt-6">
            <ForgotPasswordForm locale="en" />
          </div>
          <p className="mt-6 text-center text-sm text-muted">
            <Link href="/en/login" className="text-gold-strong hover:underline">
              Back to log in
            </Link>
          </p>
        </Card>
      </main>
      <SiteFooter locale="en" />
    </>
  );
}
