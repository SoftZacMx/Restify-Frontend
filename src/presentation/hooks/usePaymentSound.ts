import { useCallback, useRef } from 'react';

/**
 * Hook that plays a success chime using Web Audio API.
 * No external audio files needed.
 */
export function usePaymentSound() {
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playSuccess = useCallback(() => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContext();
      }
      const ctx = audioCtxRef.current;
      const now = ctx.currentTime;

      // Two-tone chime: C5 → E5
      const notes = [
        { freq: 523.25, start: 0, duration: 0.15 },
        { freq: 659.25, start: 0.15, duration: 0.25 },
      ];

      notes.forEach(({ freq, start, duration }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.value = freq;

        gain.gain.setValueAtTime(0, now + start);
        gain.gain.linearRampToValueAtTime(0.3, now + start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + start + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + start);
        osc.stop(now + start + duration);
      });
    } catch {
      // Silently fail if audio is not available
    }
  }, []);

  return { playSuccess };
}
