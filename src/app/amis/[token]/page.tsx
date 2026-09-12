import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { FriendInviteAccept } from "@/components/FriendInviteAccept";

export const metadata: Metadata = { title: "Invitation — Astrologium" };

export default async function FriendInvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-6 py-20">
          <FriendInviteAccept token={token} />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
