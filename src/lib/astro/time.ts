import { DateTime } from "luxon";
import type { BirthInput } from "./types";

/**
 * Convertit une date/heure de naissance locale (avec fuseau IANA) en instant
 * UTC. Luxon applique automatiquement le décalage historique correct
 * (y compris les changements d'heure d'été/hiver en vigueur à l'époque),
 * ce qui est indispensable pour la précision d'un thème natal.
 *
 * Si l'heure est inconnue, on utilise midi local par convention (pratique
 * standard en astrologie quand seule la date est connue) — les angles
 * (Ascendant, Maison) ne seront alors pas fiables, ce qui est signalé
 * ailleurs via `timeUnknown`.
 */
export function birthInputToUtc(input: BirthInput): DateTime {
  const time = input.timeUnknown || !input.time ? "12:00" : input.time;
  const iso = `${input.date}T${time}:00`;
  const local = DateTime.fromISO(iso, { zone: input.tzName });
  if (!local.isValid) {
    throw new Error(
      `Date/heure de naissance invalide: ${iso} (${input.tzName}) — ${local.invalidReason}`
    );
  }
  return local.toUTC();
}

export function birthInputToJsDate(input: BirthInput): Date {
  return birthInputToUtc(input).toJSDate();
}
