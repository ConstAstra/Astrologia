"use client";

import { useState } from "react";
import type { ZodiacSign } from "@/lib/astro/types";
import type { AvatarOverrides } from "@/components/avatar/avatarTraits";
import { renderAvatarDataUri } from "@/components/avatar/renderAvatarDataUri";
import { renderQrDataUri } from "@/lib/qr";
import { playSoftChime } from "@/lib/sound";

const WIDTH = 720;
const HEIGHT = 1280;
const DURATION_MS = 3800;

const TEXT = {
  fr: { button: "🎬 Vidéo", recording: "…", label: "Notre compatibilité", shareText: "Notre compatibilité astrale, en vidéo — généré sur Astrologium.", unsupported: "Vidéo non disponible sur ce navigateur" },
  en: { button: "🎬 Video", recording: "…", label: "Our compatibility", shareText: "Our astro compatibility, on video — generated on Astrologium.", unsupported: "Video not available on this browser" },
};

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("image load failed"));
    img.src = src;
  });
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function roundedRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawRoundedImage(ctx: CanvasRenderingContext2D, img: HTMLImageElement, x: number, y: number, w: number, h: number, r: number, alpha: number) {
  ctx.save();
  ctx.globalAlpha = alpha;
  roundedRectPath(ctx, x, y, w, h, r);
  ctx.clip();
  ctx.drawImage(img, x, y, w, h);
  ctx.restore();
}

interface DrawState {
  imgA: HTMLImageElement;
  imgB: HTMLImageElement;
  imgQr: HTMLImageElement;
  nameA: string;
  nameB: string;
  displayValue: (progress: number) => string;
  punchline: string;
  punchlineColor: string;
  cardTitle: string;
  legalLine: string;
  shareUrl: string;
  scanLine: string;
}

function draw(ctx: CanvasRenderingContext2D, t: number, state: DrawState) {
  const { imgA, imgB, imgQr, nameA, nameB, displayValue, punchline, punchlineColor, cardTitle, legalLine, shareUrl, scanLine } = state;

  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  const bg = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
  bg.addColorStop(0, "#7a5024");
  bg.addColorStop(0.45, "#55324e");
  bg.addColorStop(1, "#1f1420");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Header bar
  ctx.fillStyle = "#1f1420cc";
  ctx.fillRect(0, 0, WIDTH, 90);
  ctx.fillStyle = "#f7ece2";
  ctx.font = "700 22px system-ui, sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText("◆ Astrologium", 32, 45);
  ctx.fillStyle = "#c9a8ad";
  ctx.font = "600 13px system-ui, sans-serif";
  ctx.textAlign = "right";
  ctx.fillText(cardTitle, WIDTH - 32, 45);

  // Avatars: fade + slide in over the first 400ms
  const avatarProgress = Math.min(1, t / 0.11);
  const avatarAlpha = easeOutCubic(avatarProgress);
  const avatarSize = 200;
  const avatarY = 260 - (1 - avatarAlpha) * 30;
  drawRoundedImage(ctx, imgA, WIDTH / 2 - avatarSize - 16, avatarY, avatarSize, avatarSize, 36, avatarAlpha);
  drawRoundedImage(ctx, imgB, WIDTH / 2 + 16, avatarY, avatarSize, avatarSize, 36, avatarAlpha);

  // Big value: counts up between 8% and 45% of the timeline, eased
  const countStart = 0.08;
  const countEnd = 0.45;
  const countProgress = Math.max(0, Math.min(1, (t - countStart) / (countEnd - countStart)));
  const eased = easeOutCubic(countProgress);
  ctx.textAlign = "center";
  ctx.font = "700 110px system-ui, sans-serif";
  ctx.fillStyle = punchlineColor;
  ctx.fillText(displayValue(eased), WIDTH / 2, 560);

  // Punchline + names fade in after the count settles
  const textAlpha = Math.max(0, Math.min(1, (t - countEnd) / 0.12));
  ctx.globalAlpha = textAlpha;
  ctx.font = "500 34px system-ui, sans-serif";
  ctx.fillStyle = punchlineColor;
  ctx.fillText(punchline, WIDTH / 2, 660);

  ctx.font = "600 38px system-ui, sans-serif";
  ctx.fillStyle = "#f7ece2";
  ctx.fillText(`${nameA} & ${nameB}`, WIDTH / 2, 730);
  ctx.globalAlpha = 1;

  // QR code : seul moyen qu'un lien affiché sur une vidéo statique soit
  // vraiment cliquable une fois republiée — apparaît avec le reste du footer.
  const footerAlpha = Math.max(0, Math.min(1, (t - countEnd - 0.05) / 0.1));
  ctx.globalAlpha = footerAlpha;
  const qrSize = 150;
  const qrX = WIDTH / 2 - qrSize / 2;
  const qrY = 850;
  ctx.fillStyle = "#f7ece2";
  ctx.fillRect(qrX - 8, qrY - 8, qrSize + 16, qrSize + 16);
  ctx.drawImage(imgQr, qrX, qrY, qrSize, qrSize);
  ctx.textAlign = "center";
  ctx.font = "500 20px system-ui, sans-serif";
  ctx.fillStyle = "#c9a8ad";
  ctx.fillText(scanLine, WIDTH / 2, qrY + qrSize + 44);

  // Footer : juste la mention légale + le lien en texte (repli pour qui ne
  // peut pas scanner) — le QR au-dessus porte déjà l'appel à l'action, pas
  // besoin de le répéter en toutes lettres sur cette largeur de canvas
  // (720px, bien plus étroit que les cartes images à 1080px).
  ctx.strokeStyle = "#ffffff1a";
  ctx.beginPath();
  ctx.moveTo(32, HEIGHT - 70);
  ctx.lineTo(WIDTH - 32, HEIGHT - 70);
  ctx.stroke();
  ctx.textAlign = "center";
  ctx.font = "400 15px system-ui, sans-serif";
  ctx.fillStyle = "#71768e";
  ctx.fillText(legalLine, WIDTH / 2, HEIGHT - 48);
  ctx.font = "500 16px system-ui, sans-serif";
  ctx.fillStyle = "#f2b799";
  ctx.fillText(shareUrl, WIDTH / 2, HEIGHT - 24);
  ctx.globalAlpha = 1;
}

async function recordVideo(
  state: Omit<DrawState, "imgA" | "imgB" | "imgQr"> & { avatarSrcA: string; avatarSrcB: string; qrSrc: string }
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2d context unavailable");

  const [imgA, imgB, imgQr] = await Promise.all([
    loadImage(state.avatarSrcA),
    loadImage(state.avatarSrcB),
    loadImage(state.qrSrc),
  ]);

  const stream = (canvas as HTMLCanvasElement & { captureStream: (fps?: number) => MediaStream }).captureStream(30);
  const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9") ? "video/webm;codecs=vp9" : "video/webm";
  const recorder = new MediaRecorder(stream, { mimeType });
  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  const finished = new Promise<Blob>((resolve) => {
    recorder.onstop = () => resolve(new Blob(chunks, { type: "video/webm" }));
  });

  recorder.start();
  const start = performance.now();

  await new Promise<void>((resolve) => {
    function tick(now: number) {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / DURATION_MS);
      draw(ctx!, t, { ...state, imgA, imgB, imgQr });
      if (elapsed < DURATION_MS) {
        requestAnimationFrame(tick);
      } else {
        resolve();
      }
    }
    requestAnimationFrame(tick);
  });

  recorder.stop();
  return finished;
}

export function CompatibilityVideoButton({
  seedA,
  sunA,
  moonA,
  ascA,
  overridesA,
  nameA,
  seedB,
  sunB,
  moonB,
  ascB,
  overridesB,
  nameB,
  percentage,
  punchline,
  punchlineColor,
  referralCode,
  locale = "fr",
}: {
  seedA: string;
  sunA: ZodiacSign;
  moonA?: ZodiacSign;
  ascA?: ZodiacSign;
  overridesA?: AvatarOverrides;
  nameA: string;
  seedB: string;
  sunB: ZodiacSign;
  moonB?: ZodiacSign;
  ascB?: ZodiacSign;
  overridesB?: AvatarOverrides;
  nameB: string;
  percentage: number;
  punchline: string;
  punchlineColor: string;
  referralCode: string;
  locale?: "fr" | "en";
}) {
  const t = TEXT[locale];
  const [busy, setBusy] = useState(false);
  const [unsupported, setUnsupported] = useState(false);

  async function handleClick() {
    if (typeof window === "undefined" || typeof MediaRecorder === "undefined" || !("captureStream" in HTMLCanvasElement.prototype)) {
      setUnsupported(true);
      return;
    }
    setBusy(true);
    try {
      const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "astrologium.app").replace(/^https?:\/\//, "");
      const shareUrl = `${siteUrl}/r/${referralCode}`;
      const blob = await recordVideo({
        avatarSrcA: renderAvatarDataUri(seedA, sunA, 300, moonA, ascA, overridesA),
        avatarSrcB: renderAvatarDataUri(seedB, sunB, 300, moonB, ascB, overridesB),
        qrSrc: renderQrDataUri(`https://${shareUrl}`),
        nameA,
        nameB,
        displayValue: (progress) => `${Math.round(progress * percentage)}%`,
        punchline,
        punchlineColor,
        cardTitle: locale === "en" ? "COMPATIBILITY TEST" : "TEST DE COMPATIBILITÉ",
        legalLine: locale === "en" ? "For fun, not a prediction" : "Pour le fun, pas une prédiction",
        scanLine: locale === "en" ? "Scan to try" : "Scanne pour essayer",
        shareUrl,
      });

      const file = new File([blob], "compatibilite-astrale.webm", { type: "video/webm" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: t.label, text: t.shareText });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = file.name;
        a.click();
        URL.revokeObjectURL(url);
      }
      playSoftChime();
    } catch {
      // Annulation du partage natif ou erreur d'enregistrement — silencieux, réessayable.
    } finally {
      setBusy(false);
    }
  }

  if (unsupported) {
    return <span className="text-xs text-muted/60">{t.unsupported}</span>;
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      className="inline-block rounded-full border border-gold/40 px-3 py-1 text-xs text-gold-strong hover:bg-gold/10 disabled:opacity-60"
    >
      {busy ? t.recording : t.button}
    </button>
  );
}
