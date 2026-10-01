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

/**
 * Vrai si l'heure locale saisie n'a jamais existé dans ce fuseau — le cas du
 * passage à l'heure d'été, où l'horloge saute directement de 1h59 à 3h00 (ou
 * l'équivalent local) : personne n'a pu naître à une heure que l'horloge n'a
 * jamais affichée. Luxon ne lève PAS d'erreur pour ce cas (contrairement à
 * une date invalide) : il choisit silencieusement l'un des décalages voisins
 * et ISO/`local.hour`/`local.minute` ne correspondent alors plus à l'heure
 * saisie — c'est justement cette désynchronisation qui sert de détection ici,
 * en comparant l'heure redonnée par Luxon à celle tapée par l'utilisateur.
 * Ne rien signaler dans ce cas reviendrait à recalculer un thème (Ascendant,
 * maisons) sur une heure décalée d'une heure sans jamais le dire.
 *
 * Ne couvre pas le cas symétrique du passage à l'heure d'hiver (une heure
 * locale qui existe deux fois) : Luxon résout cette ambiguïté de façon
 * déterministe (toujours le même décalage), donc sans risque de calcul
 * silencieusement faux à l'insu de l'utilisateur.
 */
export function isNonexistentLocalTime(input: BirthInput): boolean {
  if (input.timeUnknown || !input.time) return false;
  const iso = `${input.date}T${input.time}:00`;
  const local = DateTime.fromISO(iso, { zone: input.tzName });
  if (!local.isValid) return false;
  const [inputHour, inputMinute] = input.time.split(":").map(Number);
  return local.hour !== inputHour || local.minute !== inputMinute;
}
