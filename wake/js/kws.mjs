/**
 * JavaScript bindings for the kws engine compiled to WebAssembly.
 *
 * The shape deliberately mirrors src/kws_runtime (Model / Frontend / Session)
 * so a parity failure points at the C++ or the build flags rather than at a
 * divergence invented here. Semantics that matter are inherited, not
 * reimplemented: 256-sample frontend hops, 512-sample model frames, PCM tails
 * retained across pushes, finish() dropping the tail without padding EOF.
 */

import { bind } from './bindings.mjs';

export const SENSITIVITIES = [0.0, 0.25, 0.5, 0.75, 1.0];
const MODES = { independent: 0, production_arbitrated: 1 };

function fail(rt) {
  return new Error(rt.fn.error() || 'kws: unknown error');
}

/** Null and negative both mean failure across this ABI. */
function checked(rt, value) {
  if (!value || value < 0) throw fail(rt);
  return value;
}

/** A malloc arena freed as a unit, so no early return can leak. */
class Scratch {
  constructor(rt) {
    this.rt = rt;
    this.pointers = new Set();
  }

  alloc(bytes) {
    if (bytes <= 0) return 0;
    const pointer = this.rt.module._malloc(bytes);
    if (!pointer) throw new Error(`out of wasm memory (${bytes} bytes)`);
    this.pointers.add(pointer);
    return pointer;
  }

  string(value) {
    if (value === null || value === undefined) return 0;
    const bytes = this.rt.module.lengthBytesUTF8(value) + 1;
    const pointer = this.alloc(bytes);
    this.rt.module.stringToUTF8(value, pointer, bytes);
    return pointer;
  }

  /** Copies a typed array into the heap. Heap views are invalidated by memory
   *  growth, so the view is taken after the allocation, never cached. */
  typed(array) {
    const pointer = this.alloc(array.byteLength);
    new Uint8Array(this.rt.module.HEAPU8.buffer, pointer, array.byteLength)
      .set(new Uint8Array(array.buffer, array.byteOffset, array.byteLength));
    return pointer;
  }

  free() {
    for (const pointer of this.pointers) this.rt.module._free(pointer);
    this.pointers.clear();
  }
}

class Handle {
  constructor(rt, pointer, destroy) {
    this.rt = rt;
    this.pointer = pointer;
    this.destroyer = destroy;
  }

  check() {
    if (!this.pointer) throw new Error(`${this.constructor.name} is closed`);
  }

  close() {
    if (this.pointer) {
      this.rt.fn[this.destroyer](this.pointer);
      this.pointer = 0;
    }
  }
}

export class Model extends Handle {
  constructor(rt, pointer, { language, nClasses, identity }) {
    super(rt, pointer, 'model_destroy');
    this.language = language;
    this.nClasses = nClasses;
    this.identity = identity;
  }
}

export class Frontend extends Handle {
  constructor(rt) {
    super(rt, checked(rt, rt.fn.frontend_create()), 'frontend_destroy');
    this.pending = 0;
  }

  reset() {
    this.check();
    if (this.rt.fn.frontend_reset(this.pointer) < 0) throw fail(this.rt);
    this.pending = 0;
  }

  /** @param {Int16Array} pcm @returns {Int16Array} hops * 40 mel values */
  push(pcm) {
    this.check();
    const hops = Math.floor((this.pending + pcm.length) / 256);
    const scratch = new Scratch(this.rt);
    try {
      const input = scratch.typed(pcm);
      const output = scratch.alloc(hops * 40 * 2);
      const written = this.rt.fn.frontend_push(this.pointer, input, pcm.length, output, hops);
      if (written < 0) throw fail(this.rt);
      this.pending = (this.pending + pcm.length) % 256;
      return this.rt.module.HEAP16.slice(output / 2, output / 2 + written * 40);
    } finally {
      scratch.free();
    }
  }

  /** finalize: 'complete_hops' discards the tail, 'training_nearest_hop' pads
   *  a tail of at least 128 samples. */
  finish(finalize = 'complete_hops') {
    this.check();
    if (finalize !== 'complete_hops' && finalize !== 'training_nearest_hop') {
      throw new Error('unknown frontend finalization policy');
    }
    const scratch = new Scratch(this.rt);
    try {
      const output = scratch.alloc(40 * 2);
      const hops = this.rt.fn.frontend_finish(
        this.pointer, finalize === 'training_nearest_hop' ? 1 : 0, output,
      );
      if (hops < 0) throw fail(this.rt);
      this.pending = 0;
      return this.rt.module.HEAP16.slice(output / 2, output / 2 + hops * 40);
    } finally {
      scratch.free();
    }
  }
}

export class Session extends Handle {
  constructor(rt, model, {
    keywords = [], sensitivities = SENSITIVITIES, keywordSensitivities = null, mode = 'independent', outputs = null,
  } = {}) {
    if (!(mode in MODES)) throw new Error('mode must be independent or production_arbitrated');
    model.check();
    const perKeyword = keywordSensitivities !== null;
    if (perKeyword && sensitivities !== SENSITIVITIES) throw new Error('select one sensitivity layout');
    if (perKeyword && (!Array.isArray(keywordSensitivities) || keywordSensitivities.length !== keywords.length ||
        keywordSensitivities.some(s => typeof s !== 'number' || !Number.isFinite(s)))) throw new Error('invalid per-keyword sensitivities');
    const sens = Float64Array.from(perKeyword ? keywordSensitivities : sensitivities);
    if (!sens.length || sens.some((s) => !(s >= 0 && s <= 1))) {
      throw new Error('sensitivities must be a nonempty vector in [0,1]');
    }
    const scratch = new Scratch(rt);
    let pointer;
    try {
      pointer = checked(rt, (perKeyword ? rt.fn.session_create_per_keyword : rt.fn.session_create)(
        model.pointer,
        keywords.length ? scratch.string(JSON.stringify(keywords)) : 0,
        scratch.typed(sens),
        sens.length,
        MODES[mode],
      ));
    } finally {
      scratch.free();
    }
    super(rt, pointer, 'session_destroy');
    this.model = model;
    this.keywords = keywords;
    this.sensitivities = sens;
    this.perKeyword = perKeyword;
    this.mode = MODES[mode];
    this.outputs = outputs ?? {
      posteriors: !keywords.length,
      events: keywords.length > 0,
      scores: keywords.length > 0,
      rawScores: false,
      gates: false,
    };
    this.offset = 0;
    this.pending = 0;
    this.finished = false;
  }

  pushPcm(pcm) { return this.push(pcm, false); }

  pushMel(mel) { return this.push(mel, true); }

  push(input, cachedMel = false) {
    this.check();
    if (!(input instanceof Int16Array)) throw new TypeError('expected Int16Array');
    if (this.finished) throw new Error('session finished');
    const k = this.keywords.length;
    const s = this.perKeyword ? 1 : this.sensitivities.length;
    const want = k ? this.outputs : { ...this.outputs, events: false };
    const frames = cachedMel
      ? input.length / 80
      : Math.floor((this.pending + input.length) / 512);
    if (cachedMel && !Number.isInteger(frames)) throw new Error('expected [T,80] mel');

    const scratch = new Scratch(this.rt);
    try {
      const pcm = scratch.typed(input);
      const q31 = want.posteriors ? scratch.alloc(frames * this.model.nClasses * 4) : 0;
      const resets = scratch.alloc(Math.max(frames, 1));
      const scores = want.scores && k ? scratch.alloc(frames * k * 2) : 0;
      const raw = want.rawScores && k ? scratch.alloc(frames * k * 2) : 0;
      const fires = want.events && k ? scratch.alloc(frames * s * k) : 0;
      const gates = want.gates && k ? scratch.alloc(Math.max(frames, 1)) : 0;

      const count = this.rt.fn.session_push(
        this.pointer, pcm, input.length, cachedMel ? 1 : 0, frames,
        q31, resets, scores, raw, fires, gates,
      );
      if (count < 0) throw fail(this.rt);

      const { HEAP16, HEAP32, HEAPU8 } = this.rt.module;
      const resetFrames = [];
      for (let i = 0; i < frames; i += 1) {
        if (HEAPU8[resets + i]) resetFrames.push(i + this.offset);
      }
      // Nullability follows what the caller asked for, never how many frames
      // came back: a push too short to complete a frame returns empty arrays,
      // matching kws_runtime, so callers can concatenate without special cases.
      const read = (view, pointer, stride, length) => (
        pointer || length === 0 ? view.slice(pointer / stride, pointer / stride + length) : null);
      const result = {
        frames: count,
        frameOffset: this.offset,
        resetFrames,
        posteriors: want.posteriors
          ? read(HEAP32, q31, 4, frames * this.model.nClasses) : null,
        scores: want.scores && k ? read(HEAP16, scores, 2, frames * k) : null,
        rawScores: want.rawScores && k ? read(HEAP16, raw, 2, frames * k) : null,
        fires: want.events && k ? read(HEAPU8, fires, 1, frames * s * k) : null,
        gates: want.gates && k ? read(HEAPU8, gates, 1, frames) : null,
        metadata: {
          frontendId: this.rt.frontendId,
          model: this.model.identity,
          lang: this.model.language,
          nClasses: this.model.nClasses,
          inputMode: cachedMel ? 'cached_mel' : 'pcm',
          cpuKernel: this.rt.fn.cpu_kernel(),
          finalization: 'complete_model_frames_no_eof_padding',
          sensitivities: Array.from(this.sensitivities),
          sensitivityLayout: this.perKeyword ? "per_keyword" : "grid",
          keywordMode: this.mode === 0 ? 'independent' : 'production_arbitrated',
        },
      };
      if (!cachedMel) this.pending = (this.pending + input.length) % 512;
      this.offset += frames;
      return result;
    } finally {
      scratch.free();
    }
  }

  /** Drops the incomplete PCM tail; never appends synthetic EOF silence. */
  finish() {
    this.check();
    const discarded = this.rt.fn.session_finish(this.pointer);
    if (discarded < 0) throw fail(this.rt);
    this.finished = true;
    return { frames: this.offset, discardedSamples: discarded };
  }

  runPcm(pcm) {
    if (this.offset || this.pending || this.finished) {
      throw new Error('runPcm requires a fresh session; use pushPcm to continue');
    }
    const result = this.pushPcm(pcm);
    Object.assign(result.metadata, this.finish());
    return result;
  }
}

export class Kws {
  constructor(module) {
    this.rt = { module, fn: bind(module) };
    if (this.rt.fn.abi_version() !== 1) throw new Error('Unsupported kws native ABI');
    this.rt.frontendId = (this.rt.fn.frontend_id() >>> 0).toString(16).padStart(8, '0');
  }

  get abiVersion() { return this.rt.fn.abi_version(); }

  get frontendId() { return this.rt.frontendId; }

  get cpuKernel() { return this.rt.fn.cpu_kernel(); }

  /** Language preset: symbols, blank, class count, inventory identity. */
  language(code = 'en') {
    const scratch = new Scratch(this.rt);
    try {
      const json = this.rt.fn.language(scratch.string(code));
      if (!json) throw fail(this.rt);
      return JSON.parse(json);
    } finally {
      scratch.free();
    }
  }

  /**
   * Loads a model container from memory. The bytes pass through MEMFS so the
   * container is parsed by exactly the path the native build validates,
   * including its frontend-id mismatch diagnostics.
   * @param {Uint8Array} bytes
   */
  loadModel(bytes, { lang = 'en' } = {}) {
    const preset = this.language(lang);
    const path = `/model-${Math.random().toString(36).slice(2)}.bin`;
    this.rt.module.FS.writeFile(path, bytes);
    const scratch = new Scratch(this.rt);
    try {
      const pointer = checked(this.rt, this.rt.fn.model_load(
        scratch.string(path), scratch.string(lang),
      ));
      return new Model(this.rt, pointer, {
        language: lang, nClasses: preset.n_classes, identity: null,
      });
    } finally {
      scratch.free();
      this.rt.module.FS.unlink(path);
    }
  }

  /** @param {Int16Array} affine80 @param {Int8Array} values */
  modelFromTensors(affine80, values, frontendId, { lang = 'en' } = {}) {
    const preset = this.language(lang);
    const scratch = new Scratch(this.rt);
    try {
      const pointer = checked(this.rt, this.rt.fn.model_tensors(
        frontendId, scratch.typed(affine80), scratch.typed(values),
        values.length, scratch.string(lang),
      ));
      return new Model(this.rt, pointer, {
        language: lang, nClasses: preset.n_classes, identity: null,
      });
    } finally {
      scratch.free();
    }
  }

  frontend() { return new Frontend(this.rt); }

  session(model, options) { return new Session(this.rt, model, options); }
}

/**
 * Instantiates the engine.
 *
 * @param {object} options
 * @param {boolean} [options.simd]   load the -msimd128 build (build.sh --simd)
 * @param {string}  [options.kernel] KWS_CPU_KERNEL: 'portable' (default, as
 *   native), 'auto' or 'simd128'. Set through the emscripten environment so
 *   the C++ selects its kernel exactly as it does from a shell.
 * @returns {Promise<Kws>}
 */
export async function load({ simd = false, kernel = null, ...options } = {}) {
  const { default: createKwsModule } = simd
    ? await import('../dist/kws_engine.simd.mjs')
    : await import('../dist/kws_engine.mjs');
  const configured = kernel ?? (simd ? 'simd128' : null);
  const module = await createKwsModule({
    ...options,
    preRun: [
      (instance) => {
        if (configured) instance.ENV.KWS_CPU_KERNEL = configured;
      },
      ...(options.preRun ?? []),
    ],
  });
  return new Kws(module);
}

export default load;
