import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Card } from "@/components/ui/Card";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const metadata: Metadata = { title: "Reset password — Astrologia" };

export default async function ResetPasswordEnPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <>
      <SiteHeader locale="en" />
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <Card className="w-full max-w-md p-8">
          <h1 className="font-display text-3xl">New password</h1>
          {token ? (
            <>
              <p className="mt-2 text-sm text-muted">Choose a new password for your account.</p>
              <div className="mt-6">
                <ResetPasswordForm token={token} locale="en" />
              </div>
            </>
          ) : (
            <p className="mt-2 text-sm text-terracotta">
              Invalid link. Request a new link from the{" "}
              <Link href="/en/forgot-password" className="text-gold-strong hover:underline">
                forgot password
              </Link>{" "}
              page.
            </p>
          )}
        </Card>
      </main>
      <SiteFooter locale="en" />
    </>
  );
}
