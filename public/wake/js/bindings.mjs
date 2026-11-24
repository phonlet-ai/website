/**
 * Typed call layer over the raw wasm exports.
 *
 * Emscripten maps C `int64_t` to BigInt, so every int64 argument has to be
 * converted on the way in and every int64 return on the way out. Doing that at
 * each call site invites a silently wrong cast, so the signatures live in one
 * table - the same declarations as src/kws_runtime/_ffi.py, in the same order.
 *
 * Codes: p pointer, i int32, u uint32, q int64 (BigInt at the boundary),
 *        s NUL-terminated string return, v void.
 */

export const SIGNATURES = {
  abi_version: ['u', []],
  frontend_id: ['u', []],
  error: ['s', []],
  cpu_kernel: ['s', []],
  language: ['s', ['p']],
  model_load: ['p', ['p', 'p']],
  model_tensors: ['p', ['u', 'p', 'p', 'q', 'p']],
  model_load_bytes: ['p', ['p', 'q', 'p']],
  session_create_per_keyword: ['p', ['p', 'p', 'p', 'q', 'i']],
  detector_create_per_keyword: ['p', ['p', 'p', 'q', 'i', 'i', 'p']],
  model_destroy: ['v', ['p']],
  frontend_create: ['p', []],
  frontend_destroy: ['v', ['p']],
  frontend_reset: ['i', ['p']],
  frontend_push: ['q', ['p', 'p', 'q', 'p', 'q']],
  frontend_finish: ['q', ['p', 'i', 'p']],
  detector_create: ['p', ['p', 'p', 'q', 'i', 'i', 'p']],
  detector_destroy: ['v', ['p']],
  detector_replay_scores: ['i', ['p', 'p', 'q', 'p']],
  detector_push: ['i', ['p', 'p', 'q', 'p', 'p', 'p', 'p', 'p']],
  session_create: ['p', ['p', 'p', 'p', 'q', 'i']],
  session_destroy: ['v', ['p']],
  session_finish: ['q', ['p']],
  session_push: ['q', ['p', 'p', 'q', 'i', 'q', 'p', 'p', 'p', 'p', 'p', 'p']],
  replay_scores: ['i', ['p', 'q', 'q', 'p', 'q', 'i', 'p']],
};

export function bind(module) {
  const api = {};
  for (const [name, [returns, takes]] of Object.entries(SIGNATURES)) {
    const raw = module[`_kws_${name}`];
    if (typeof raw !== 'function') throw new Error(`wasm export missing: kws_${name}`);
    api[name] = (...args) => {
      if (args.length !== takes.length) {
        throw new Error(`kws_${name} expects ${takes.length} arguments, got ${args.length}`);
      }
      const marshalled = args.map((value, i) => (takes[i] === 'q' ? BigInt(value) : value));
      const result = raw(...marshalled);
      if (returns === 'q') return Number(result);
      if (returns === 's') return result ? module.UTF8ToString(result) : null;
      return result;
    };
  }
  return api;
}
