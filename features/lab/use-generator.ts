'use client';
import { useCallback, useEffect, useRef, useState } from 'react';

type Reply = { result?: unknown; error?: string };

/** The threshold generator (WebAssembly, in a worker), started on the first request. */
export function useGenerator() {
  const worker = useRef<Worker | null>(null);
  const pending = useRef(new Map<number, (reply: Reply) => void>());
  const sequence = useRef(0);
  const [progress, setProgress] = useState<[number, number] | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const requests = pending.current;
    return () => {
      worker.current?.terminate();
      worker.current = null;
      requests.clear();
    };
  }, []);

  const request = useCallback(async <T>(body: object): Promise<T> => {
    if (!worker.current) {
      worker.current = new Worker('/generator/worker.js');
      worker.current.onmessage = ({ data }) => {
        if (data.progress) return setProgress(data.progress);
        pending.current.get(data.id)?.(data);
        pending.current.delete(data.id);
      };
    }
    const id = ++sequence.current;
    const reply = await new Promise<Reply>((resolve) => {
      pending.current.set(id, resolve);
      worker.current!.postMessage({ id, request: body });
    });
    if (reply.error) throw new Error(reply.error);
    const result = reply.result as { error?: string };
    if (result && typeof result === 'object' && 'error' in result && result.error)
      throw new Error(result.error);
    setReady(true);
    return reply.result as T;
  }, []);

  return { request, progress, ready };
}
