"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ButtonLink, Button } from "@/components/ui/Button";
import { Card, Eyebrow } from "@/components/ui/Card";

interface InviteInfo {
  inviterName: string | null;
  locale: "fr" | "en";
  sunSign: string | null;
  sunSymbol: string | null;
  isOwnInvite: boolean;
  alreadyFriends: boolean;
  isAuthenticated: boolean;
}

const TEXT = {
  fr: {
    loading: "Un instant…",
    invalid: "Ce lien d'invitation est invalide ou a expiré.",
    ownInvite: "C'est ton propre lien d'invitation — partage-le plutôt à un ami pour qu'il/elle l'accepte.",
    alreadyFriends: "Vous êtes déjà amis sur Astrologium.",
    seeFriend: "Voir mes amis",
    someone: "Quelqu'un",
    invites: (name: string) => `${name} t'invite en ami sur Astrologium`,
    sunOf: (sign: string) => `Soleil en ${sign}`,
    body: "Acceptez pour voir sa carte d'identité astrale et votre compatibilité, sans avoir à ressaisir sa date de naissance.",
    needAuth: "Connecte-toi ou crée un compte pour accepter cette invitation.",
    login: "Se connecter",
    signup: "Créer un compte",
    accept: "✓ Accepter l'invitation",
    accepting: "…",
    accepted: "Invitation acceptée !",
    error: "Une erreur est survenue, réessayez.",
  },
  en: {
    loading: "One moment…",
    invalid: "This invitation link is invalid or has expired.",
    ownInvite: "This is your own invitation link — share it with a friend so they can accept it.",
    alreadyFriends: "You're already friends on Astrologium.",
    seeFriend: "See my friends",
    someone: "Someone",
    invites: (name: string) => `${name} invites you as a friend on Astrologium`,
    sunOf: (sign: string) => `Sun in ${sign}`,
    body: "Accept to see their astral ID card and your compatibility, without re-entering their birth date.",
    needAuth: "Log in or create an account to accept this invitation.",
    login: "Log in",
    signup: "Create an account",
    accept: "✓ Accept invitation",
    accepting: "…",
    accepted: "Invitation accepted!",
    error: "Something went wrong, please try again.",
  },
};

export function FriendInviteAccept({ token }: { token: string }) {
  const [info, setInfo] = useState<InviteInfo | null | "invalid">(null);
  const [accepted, setAccepted] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/friends/invite/${token}`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then(setInfo)
      .catch(() => setInfo("invalid"));
  }, [token]);

  if (info === null) {
    return <p className="text-center text-muted">{TEXT.fr.loading}</p>;
  }
  if (info === "invalid") {
    return <p className="text-center text-terracotta">{TEXT.fr.invalid}</p>;
  }

  const t = TEXT[info.locale];
  const next = `/amis/${token}`;

  async function handleAccept() {
    setAccepting(true);
    setError(null);
    try {
      const res = await fetch(`/api/friends/invite/${token}/accept`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || t.error);
      }
      setAccepted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.error);
    } finally {
      setAccepting(false);
    }
  }

  if (info.isOwnInvite) {
    return (
      <Card className="mx-auto max-w-md p-8 text-center">
        <p className="text-muted">{t.ownInvite}</p>
        <div className="mt-6">
          <ButtonLink href="/dashboard/amis">{t.seeFriend}</ButtonLink>
        </div>
      </Card>
    );
  }

  if (info.alreadyFriends || accepted) {
    return (
      <Card className="mx-auto max-w-md p-8 text-center">
        <p className="font-display text-2xl text-gold-strong">{accepted ? t.accepted : t.alreadyFriends}</p>
        <div className="mt-6">
          <ButtonLink href="/dashboard/amis">{t.seeFriend}</ButtonLink>
        </div>
      </Card>
    );
  }

  const inviterName = info.inviterName?.trim() || t.someone;

  return (
    <Card className="mx-auto max-w-md p-8 text-center">
      <Eyebrow>Astrologium</Eyebrow>
      <h1 className="font-display mt-3 text-2xl">{t.invites(inviterName)}</h1>
      {info.sunSign && (
        <p className="mt-2 text-sm text-gold-strong">
          {info.sunSymbol} {t.sunOf(info.sunSign)}
        </p>
      )}
      <p className="mt-4 text-sm text-muted">{t.body}</p>

      {info.isAuthenticated ? (
        <div className="mt-7">
          <Button onClick={handleAccept} disabled={accepting} className="w-full">
            {accepting ? t.accepting : t.accept}
          </Button>
          {error && <p className="mt-3 text-xs text-terracotta">{error}</p>}
        </div>
      ) : (
        <div className="mt-7 space-y-3">
          <p className="text-xs text-muted">{t.needAuth}</p>
          <div className="flex flex-wrap justify-center gap-3">
            <ButtonLink href={`/inscription?next=${encodeURIComponent(next)}`}>{t.signup}</ButtonLink>
            <ButtonLink href={`/connexion?next=${encodeURIComponent(next)}`} variant="secondary">
              {t.login}
            </ButtonLink>
          </div>
        </div>
      )}
      <p className="mt-6 text-xs text-muted/60">
        <Link href="/" className="hover:text-foreground">
          Astrologium
        </Link>
      </p>
    </Card>
  );
}
