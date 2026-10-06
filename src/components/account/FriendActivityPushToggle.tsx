"use client";

import { useEffect, useState } from "react";
import { playMagicChime } from "@/lib/sound";

const TEXT = {
  fr: {
    title: "Activité de mes amis",
    subtitle: "Une notification quand un ami accepte ton invitation, ou que quelqu'un teste sa compatibilité via ton lien.",
    unsupported: "Non disponible sur ce navigateur.",
    denied: "Notifications bloquées — autorisez-les dans les réglages de votre navigateur pour cet appareil.",
    error: "Une erreur est survenue, réessayez.",
  },
  en: {
    title: "My friends' activity",
    subtitle: "A notification when a friend accepts your invitation, or someone tests their compatibility via your link.",
    unsupported: "Not available in this browser.",
    denied: "Notifications blocked — allow them in your browser settings for this device.",
    error: "Something went wrong, please try again.",
  },
};

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const base64Safe = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64Safe);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

export function FriendActivityPushToggle({
  initialOptIn,
  locale = "fr",
}: {
  initialOptIn: boolean;
  locale?: "fr" | "en";
}) {
  const t = TEXT[locale];
  const [optIn, setOptIn] = useState(initialOptIn);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSupported(typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window);
  }, []);

  async function enable() {
    setLoading(true);
    setError(null);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setError(t.denied);
        setLoading(false);
        return;
      }

      const registration = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidPublicKey ? (urlBase64ToUint8Array(vapidPublicKey) as BufferSource) : undefined,
      });

      const json = subscription.toJSON();
      const res = await fetch("/api/notifications/push-subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: json.endpoint, keys: json.keys, feature: "friendActivity" }),
      });
      if (!res.ok) throw new Error("subscribe failed");

      setOptIn(true);
      playMagicChime();
    } catch {
      setError(t.error);
    } finally {
      setLoading(false);
    }
  }

  async function disable() {
    setLoading(true);
    setError(null);
    try {
      const registration = await navigator.serviceWorker.getRegistration("/sw.js");
      const subscription = await registration?.pushManager.getSubscription();
      if (subscription) {
        const res = await fetch("/api/notifications/push-subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: subscription.endpoint, feature: "friendActivity" }),
        });
        // Un seul abonnement Push par appareil, partagé avec les deux autres
        // préférences : ne le désabonner au niveau navigateur que si le
        // serveur confirme qu'aucune autre n'en a plus besoin.
        const { subscriptionRemoved } = await res.json().catch(() => ({ subscriptionRemoved: false }));
        if (subscriptionRemoved) await subscription.unsubscribe();
      }
      setOptIn(false);
    } catch {
      setError(t.error);
    } finally {
      setLoading(false);
    }
  }

  function toggle() {
    if (optIn) disable();
    else enable();
  }

  return (
    <label className="flex items-center justify-between gap-4">
      <span className="text-sm">
        {t.title}
        <span className="block text-xs text-muted">{supported ? t.subtitle : t.unsupported}</span>
        {error && <span className="mt-1 block text-xs text-terracotta">{error}</span>}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={optIn}
        onClick={toggle}
        disabled={loading || !supported}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          optIn ? "bg-gold" : "bg-border-soft"
        } ${loading || !supported ? "opacity-60" : ""}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-background transition-transform ${
            optIn ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </label>
  );
}
