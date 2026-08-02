"use client";

// Petit son "magique" synthétisé à la volée (Web Audio API) — pas de
// fichier audio à charger/héberger. Un contexte audio ne peut être créé
// qu'après un geste utilisateur (politique des navigateurs), donc il est
// instancié à la demande plutôt qu'au chargement du module.
let ctx: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!ctx) ctx = new Ctor();
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

function tone(audio: AudioContext, freq: number, start: number, duration: number, peakGain: number) {
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = "sine";
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, audio.currentTime + start);
  gain.gain.linearRampToValueAtTime(peakGain, audio.currentTime + start + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + start + duration);
  osc.connect(gain);
  gain.connect(audio.destination);
  osc.start(audio.currentTime + start);
  osc.stop(audio.currentTime + start + duration + 0.02);
}

/** Petit arpège scintillant façon "sparkle" — pour les moments qui le méritent. */
export function playMagicChime(): void {
  try {
    const audio = getContext();
    if (!audio) return;
    // Arpège pentatonique ascendant, chaque note très courte et douce.
    const notes = [1046.5, 1318.5, 1568, 2093]; // C6, E6, G6, C7
    notes.forEach((freq, i) => tone(audio, freq, i * 0.06, 0.35, 0.05));
  } catch {
    // Best-effort : un son raté ne doit jamais casser l'interaction.
  }
}

/** Variante plus grave/douce, pour un changement d'état discret (ex: bascule de thème). */
export function playSoftChime(): void {
  try {
    const audio = getContext();
    if (!audio) return;
    const notes = [784, 1046.5]; // G5, C6
    notes.forEach((freq, i) => tone(audio, freq, i * 0.05, 0.3, 0.045));
  } catch {
    // Best-effort.
  }
}
