// A tiny channel between the lab and the page's signal art: the art reads the live level and
// reacts to pulses (a key pressed, a phrase calibrated, a wake word detected).
export type PulseKind = 'type' | 'calibrated' | 'listen' | 'detect';
export type Pulse = { kind: PulseKind; strength?: number; label?: string };

const EVENT = 'phonlet:pulse';

/** Microphone level, 0 to 1, written by the listener and read by the art every frame. */
export const live = { level: 0, listening: false };

export function pulse(detail: Pulse) {
  if (typeof window !== 'undefined')
    window.dispatchEvent(new CustomEvent<Pulse>(EVENT, { detail }));
}

export function onPulse(handler: (pulse: Pulse) => void) {
  const listener = (event: Event) => handler((event as CustomEvent<Pulse>).detail);
  window.addEventListener(EVENT, listener);
  return () => window.removeEventListener(EVENT, listener);
}
