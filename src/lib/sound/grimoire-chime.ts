/**
 * Petit carillon synthétisé (Web Audio, aucun fichier audio à charger) joué
 * une fois à l'ouverture du grimoire : un souffle de pages filtrées suivi de
 * deux notes en quinte. Volontairement discret et jamais en autoplay — cette
 * fonction n'est appelée que depuis un vrai geste utilisateur (le clic sur
 * le grimoire), condition requise par les navigateurs pour produire du son.
 * Échoue silencieusement si Web Audio est indisponible ou bloqué.
 */
export function playGrimoireChime(): void {
  try {
    const AudioContextCtor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextCtor) return;
    const ctx = new AudioContextCtor();
    const now = ctx.currentTime;

    const noiseBuffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.35), ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    }
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = "bandpass";
    noiseFilter.frequency.value = 2200;
    noiseFilter.Q.value = 0.6;
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.05, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    noise.connect(noiseFilter).connect(noiseGain).connect(ctx.destination);
    noise.start(now);
    noise.stop(now + 0.36);

    const notes = [660, 990];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;
      const gain = ctx.createGain();
      const start = now + 0.08 + i * 0.14;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.09, start + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.9);
      osc.connect(gain).connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.95);
    });

    window.setTimeout(() => ctx.close(), 1300);
  } catch {
    // Web Audio indisponible ou bloqué par le navigateur : tant pis, silence.
  }
}
