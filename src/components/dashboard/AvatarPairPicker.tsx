"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PixelAvatar } from "@/components/avatar/PixelAvatar";
import { Button } from "@/components/ui/Button";
import { playClickTick } from "@/lib/sound";
import type { ZodiacSign } from "@/lib/astro/types";

export interface PickableProfile {
  id: string;
  label: string;
  sunSign: ZodiacSign;
}

const TEXT = {
  fr: {
    instructions: (
      <>
        Cliquez sur deux avatars : <span className="text-gold-strong">1</span> = première personne,{" "}
        <span className="text-gold-strong">2</span> = seconde.
      </>
    ),
    view: "Voir",
  },
  en: {
    instructions: (
      <>
        Click two avatars: <span className="text-gold-strong">1</span> = first person,{" "}
        <span className="text-gold-strong">2</span> = second.
      </>
    ),
    view: "View",
  },
};

export function AvatarPairPicker({
  profiles,
  basePath,
  locale = "fr",
}: {
  profiles: PickableProfile[];
  basePath: string;
  locale?: "fr" | "en";
}) {
  const router = useRouter();
  const [a, setA] = useState<string | null>(null);
  const [b, setB] = useState<string | null>(null);
  const t = TEXT[locale];

  function handlePick(id: string) {
    playClickTick();
    if (id === a) {
      setA(null);
      return;
    }
    if (id === b) {
      setB(null);
      return;
    }
    if (!a) {
      setA(id);
    } else if (!b) {
      setB(id);
    } else {
      // Les deux emplacements sont pris : on remplace le premier choisi.
      setA(b);
      setB(id);
    }
  }

  return (
    <div>
      <p className="text-sm text-muted">{t.instructions}</p>
      <div className="mt-4 flex flex-wrap gap-4">
        {profiles.map((p) => {
          const rank = p.id === a ? 1 : p.id === b ? 2 : null;
          return (
            <button
              key={p.id}
              onClick={() => handlePick(p.id)}
              className={`relative flex flex-col items-center gap-2 rounded-xl border p-3 transition-all duration-150 active:scale-95 ${
                rank ? "border-gold/60 bg-gold/10" : "border-border-soft hover:border-gold/30"
              }`}
            >
              {rank && (
                <span className="badge-pop-in absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-gold text-xs font-bold text-[#1a1508]">
                  {rank}
                </span>
              )}
              <PixelAvatar seed={p.id} sunSign={p.sunSign} size={56} />
              <span className="max-w-[6rem] truncate text-xs text-muted">{p.label}</span>
            </button>
          );
        })}
      </div>
      <div className="mt-5">
        <Button disabled={!a || !b} onClick={() => router.push(`${basePath}?a=${a}&b=${b}`)}>
          {t.view}
        </Button>
      </div>
    </div>
  );
}
