'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { supportsWasmSimd } from '@/features/wake/simd';
import { live, pulse } from '@/lib/pulse';
import type { KeywordFile } from './keywords';

// The browser SDK and the en-1 model, served next to the page (pinned in asset-hashes.json).
export const SDK = '/wake';
export const MODEL = '/wake/model.pwake';

type Manager = { start(): Promise<void>; close(): Promise<void> };
type Session = {
  manager: Manager;
  context: AudioContext;
  stream: MediaStream;
  analyser: AnalyserNode;
  frame: number;
};
export type Heard = { keyword: string; timeSeconds: number; at: number };

/**
 * The microphone and a Phonlet Wake session. The page owns the stream and the audio context
 * (so it can also draw the waveform); the SDK's WakeManager borrows them. Every track, context,
 * worker and frame stops on stop() and on unmount.
 */
export function useListener(onDetection: (heard: Heard) => void) {
  const [state, setState] = useState<'idle' | 'starting' | 'listening'>('idle');
  const [error, setError] = useState('');
  const session = useRef<Session | null>(null);
  const analyser = useRef<AnalyserNode | null>(null);
  const detected = useRef(onDetection);
  detected.current = onDetection;
  const generation = useRef(0);

  const release = useCallback(async () => {
    generation.current++;
    const current = session.current;
    session.current = null;
    analyser.current = null;
    live.listening = false;
    live.level = 0;
    if (!current) return;
    cancelAnimationFrame(current.frame);
    await current.manager.close().catch(() => {});
    current.stream.getTracks().forEach((track) => track.stop());
    await current.context.close().catch(() => {});
  }, []);

  const stop = useCallback(async () => {
    await release();
    setState('idle');
  }, [release]);

  const start = useCallback(
    async (file: KeywordFile, sensitivity: number) => {
      await release();
      const mine = generation.current;
      setState('starting');
      setError('');
      let context: AudioContext | undefined;
      let stream: MediaStream | undefined;
      try {
        const { WakeManager } = await import(/* webpackIgnore: true */ `${SDK}/capture.mjs`);
        context = new AudioContext({ sampleRate: 16000 });
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            channelCount: 1,
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false,
          },
        });
        const node = context.createAnalyser();
        node.fftSize = 1024;
        context.createMediaStreamSource(stream).connect(node);
        const manager: Manager = new WakeManager({
          wake: { model: MODEL, keywords: file, sensitivity, simd: await supportsWasmSimd() },
          audioContext: context,
          stream,
          onDetection: (event: { keyword: string; timeSeconds: number }) => {
            const heard = {
              keyword: event.keyword,
              timeSeconds: event.timeSeconds,
              at: Date.now(),
            };
            pulse({ kind: 'detect', label: event.keyword });
            detected.current(heard);
          },
          onError: (e: Error) => {
            setError(e.message);
            void stop();
          },
        });
        const own: Session = { manager, context, stream, analyser: node, frame: 0 };
        session.current = own;
        await manager.start();
        if (generation.current !== mine) return;
        analyser.current = node;
        const samples = new Float32Array(node.fftSize);
        const tick = () => {
          node.getFloatTimeDomainData(samples);
          let sum = 0;
          for (const s of samples) sum += s * s;
          const rms = Math.sqrt(sum / samples.length);
          // -60 to -12 dBFS onto 0..1, so room noise stays low and speech fills the range.
          const level =
            rms > 0.001 ? Math.min(1, Math.max(0, (20 * Math.log10(rms) + 60) / 48)) : 0;
          live.level += (level - live.level) * 0.3;
          own.frame = requestAnimationFrame(tick);
        };
        own.frame = requestAnimationFrame(tick);
        live.listening = true;
        pulse({ kind: 'listen' });
        setState('listening');
      } catch (e) {
        if (!session.current) {
          stream?.getTracks().forEach((track) => track.stop());
          await context?.close().catch(() => {});
        }
        setError(
          e instanceof DOMException && e.name === 'NotAllowedError'
            ? 'Microphone access was blocked. Allow it in the address bar and try again.'
            : e instanceof Error
              ? e.message
              : String(e),
        );
        await stop();
      }
    },
    [release, stop],
  );

  useEffect(() => () => void release(), [release]);

  return { state, error, start, stop, analyser };
}
