"use client";

import { useState } from "react";
import { Card, Badge } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { safeJson } from "@/lib/safe-json";

export interface GiftCodeRow {
  id: string;
  code: string;
  label: string | null;
  grantType: string;
  subscriptionPlan: string | null;
  durationDays: number | null;
  creditsAmount: number | null;
  maxRedemptions: number;
  redemptionCount: number;
  active: boolean;
  expiresAt: string | null;
}

function describeGrant(g: GiftCodeRow): string {
  if (g.grantType === "credits") return `${g.creditsAmount} crédit${(g.creditsAmount ?? 0) > 1 ? "s" : ""}`;
  const plan = g.subscriptionPlan === "annual" ? "annuel" : "mensuel";
  const duration = g.durationDays ? `${g.durationDays} j` : "à vie";
  return `Premium ${plan} — ${duration}`;
}

export function GiftCodeManager({ initialCodes }: { initialCodes: GiftCodeRow[] }) {
  const [codes, setCodes] = useState(initialCodes);
  const [grantType, setGrantType] = useState<"subscription" | "credits">("subscription");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const form = new FormData(e.currentTarget);
    const payload = {
      code: String(form.get("code") || ""),
      label: String(form.get("label") || ""),
      grantType,
      subscriptionPlan: form.get("subscriptionPlan") || undefined,
      durationDays: form.get("durationDays") || undefined,
      creditsAmount: form.get("creditsAmount") || undefined,
      maxRedemptions: form.get("maxRedemptions") || 1,
      expiresAt: form.get("expiresAt") || undefined,
    };
    try {
      const res = await fetch("/api/admin/gift-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await safeJson(res);
      if (!res.ok) {
        setError(data?.error ?? "Une erreur est survenue.");
        return;
      }
      setCodes((prev) => [data.giftCode, ...prev]);
      e.currentTarget.reset();
    } catch {
      setError("Une erreur est survenue.");
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleActive(id: string, active: boolean) {
    const res = await fetch(`/api/admin/gift-codes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active }),
    });
    if (res.ok) {
      setCodes((prev) => prev.map((c) => (c.id === id ? { ...c, active } : c)));
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,320px)_1fr]">
      <Card className="p-5">
        <p className="font-medium">Créer un code cadeau</p>
        <form onSubmit={handleSubmit} className="mt-4 space-y-3 text-sm">
          <div>
            <label htmlFor="code" className="text-xs text-muted">Code</label>
            <input
              id="code"
              name="code"
              required
              placeholder="ex: MAMAN2026"
              className="mt-1 w-full rounded-lg border border-border-soft bg-background-elevated px-3 py-2 outline-none focus:border-gold/60"
            />
          </div>
          <div>
            <label htmlFor="label" className="text-xs text-muted">Note interne (optionnel)</label>
            <input
              id="label"
              name="label"
              placeholder="ex: cadeau anniversaire"
              className="mt-1 w-full rounded-lg border border-border-soft bg-background-elevated px-3 py-2 outline-none focus:border-gold/60"
            />
          </div>
          <div>
            <span className="text-xs text-muted">Type de cadeau</span>
            <div className="mt-1 flex gap-2">
              <button
                type="button"
                onClick={() => setGrantType("subscription")}
                className={`flex-1 rounded-lg border px-3 py-2 text-xs ${grantType === "subscription" ? "border-gold/60 text-gold-strong" : "border-border-soft text-muted"}`}
              >
                Abonnement Premium
              </button>
              <button
                type="button"
                onClick={() => setGrantType("credits")}
                className={`flex-1 rounded-lg border px-3 py-2 text-xs ${grantType === "credits" ? "border-gold/60 text-gold-strong" : "border-border-soft text-muted"}`}
              >
                Crédits
              </button>
            </div>
          </div>
          {grantType === "subscription" ? (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="subscriptionPlan" className="text-xs text-muted">Formule</label>
                <select
                  id="subscriptionPlan"
                  name="subscriptionPlan"
                  className="mt-1 w-full rounded-lg border border-border-soft bg-background-elevated px-2 py-2 text-xs outline-none focus:border-gold/60"
                >
                  <option value="monthly">Mensuelle</option>
                  <option value="annual">Annuelle</option>
                </select>
              </div>
              <div>
                <label htmlFor="durationDays" className="text-xs text-muted">Durée (jours, vide = à vie)</label>
                <input
                  id="durationDays"
                  name="durationDays"
                  type="number"
                  min={1}
                  placeholder="à vie"
                  className="mt-1 w-full rounded-lg border border-border-soft bg-background-elevated px-2 py-2 text-xs outline-none focus:border-gold/60"
                />
              </div>
            </div>
          ) : (
            <div>
              <label htmlFor="creditsAmount" className="text-xs text-muted">Nombre de crédits</label>
              <input
                id="creditsAmount"
                name="creditsAmount"
                type="number"
                min={1}
                required
                className="mt-1 w-full rounded-lg border border-border-soft bg-background-elevated px-3 py-2 text-xs outline-none focus:border-gold/60"
              />
            </div>
          )}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor="maxRedemptions" className="text-xs text-muted">Nb d&apos;utilisations max</label>
              <input
                id="maxRedemptions"
                name="maxRedemptions"
                type="number"
                min={1}
                defaultValue={1}
                className="mt-1 w-full rounded-lg border border-border-soft bg-background-elevated px-2 py-2 text-xs outline-none focus:border-gold/60"
              />
            </div>
            <div>
              <label htmlFor="expiresAt" className="text-xs text-muted">Expire le (optionnel)</label>
              <input
                id="expiresAt"
                name="expiresAt"
                type="date"
                className="mt-1 w-full rounded-lg border border-border-soft bg-background-elevated px-2 py-2 text-xs outline-none focus:border-gold/60"
              />
            </div>
          </div>
          {error && <p className="text-xs text-terracotta">{error}</p>}
          <Button type="submit" size="sm" className="w-full" loading={submitting}>
            Créer le code
          </Button>
        </form>
      </Card>

      <Card className="p-5">
        <p className="font-medium">Codes existants ({codes.length})</p>
        {codes.length === 0 ? (
          <p className="mt-3 text-sm text-muted">Aucun code cadeau créé pour l&apos;instant.</p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-muted">
                <tr>
                  <th className="pb-2 pr-3">Code</th>
                  <th className="pb-2 pr-3">Gain</th>
                  <th className="pb-2 pr-3">Utilisations</th>
                  <th className="pb-2 pr-3">Statut</th>
                  <th className="pb-2"></th>
                </tr>
              </thead>
              <tbody>
                {codes.map((g) => (
                  <tr key={g.id} className="border-t border-border-soft">
                    <td className="py-2 pr-3">
                      <p className="font-mono text-gold-strong">{g.code}</p>
                      {g.label && <p className="text-muted/70">{g.label}</p>}
                    </td>
                    <td className="py-2 pr-3 text-muted">{describeGrant(g)}</td>
                    <td className="py-2 pr-3 text-muted">{g.redemptionCount}/{g.maxRedemptions}</td>
                    <td className="py-2 pr-3">
                      {g.active ? <Badge tone="sage">Actif</Badge> : <Badge>Désactivé</Badge>}
                    </td>
                    <td className="py-2">
                      <button
                        onClick={() => toggleActive(g.id, !g.active)}
                        className="text-muted underline hover:text-foreground"
                      >
                        {g.active ? "Désactiver" : "Réactiver"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
