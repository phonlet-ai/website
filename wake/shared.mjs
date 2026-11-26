// One source for Node and Web validation. Generated package copies are self-contained.
export const SDK_VERSION = '0.1.0';
export const INVENTORY = '2017adc0505b3f530eef5b66a5b36019a434f04a4bd93a32b72f5070ee46baad';
export const FRONTEND = '3f047efa';
export class WakeError extends Error {
  constructor(code, message) { super(message); this.name = 'WakeError'; this.code = code; }
}
export function fail(message, code = 'INVALID_ARGUMENT') { throw new WakeError(code, message); }
export function fields(value, required, optional = [], label = 'object') {
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail(`${label} must be an object`);
  for (const key of required) if (!Object.hasOwn(value, key)) fail(`${label}: missing ${key}`);
  for (const key of Object.keys(value)) if (![...required, ...optional].includes(key)) fail(`${label}: unknown ${key}`);
}
export function sensitivity(value) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > 1) fail('sensitivity must be a finite number in [0,1]');
  return value;
}
export function freeze(value) {
  if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
}
export async function digest(bytes) {
  return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)), b => b.toString(16).padStart(2, '0')).join('');
}
function sha(value, label) { if (typeof value !== 'string' || !/^[0-9a-f]{64}$/.test(value)) fail(`invalid ${label} SHA-256`); }
const isObject = value => value && typeof value === 'object' && !Array.isArray(value);
const PHRASE = ['name','pronunciations','threshold_loose','threshold_strict','endpoint'];
// A keyword file as the threshold generator writes it: {"model": {"id", "sha256"} (optional),
// "keywords": [phrase, ...], "metadata": {...} (optional, never read by the engine)}.
// A bare list of phrases is the same file without "model" and "metadata".
export function readKeywordFile(value) {
  if (Array.isArray(value)) value = {keywords: value};
  fields(value, ['keywords'], ['model','metadata'], 'keyword file');
  if (!Array.isArray(value.keywords) || !value.keywords.length) fail('keywords must be a nonempty list of phrases');
  if (Object.hasOwn(value, 'model')) {
    fields(value.model, ['id','sha256'], [], 'keyword file model');
    if (typeof value.model.id !== 'string' || !value.model.id.trim()) fail('keyword file model id must be a nonempty string');
    sha(value.model.sha256, 'model');
  }
  if (Object.hasOwn(value, 'metadata') && !isObject(value.metadata)) fail('keyword file metadata must be an object');
  return value;
}
// The phrase layout shared by keyword files and phrases written in code.
export function validatePhrases(phrases) {
  if (!Array.isArray(phrases) || !phrases.length) fail('keywords must be a nonempty list of phrases');
  const seen = new Set();
  for (const kw of phrases) {
    fields(kw, PHRASE, ['id','metadata','sensitivity'], 'phrase');
    const id = Object.hasOwn(kw, 'id') ? kw.id : kw.name;
    for (const [key, value] of [['name', kw.name], ['id', id]]) if (typeof value !== 'string' || !value.trim()) fail(`phrase ${key} must be a nonempty string`);
    if (seen.has(id)) fail(`duplicate phrase: ${id}`); seen.add(id);
    if (typeof kw.endpoint !== 'boolean') fail('phrase endpoint must be true or false');
    if (Object.hasOwn(kw, 'metadata') && !isObject(kw.metadata)) fail('phrase metadata must be an object');
    for (const key of ['threshold_loose','threshold_strict']) if (typeof kw[key] !== 'number' || !Number.isFinite(kw[key])) fail(`${key} must be finite`);
    if (kw.threshold_loose > kw.threshold_strict) fail('threshold_loose must be <= threshold_strict');
    if (!Array.isArray(kw.pronunciations) || !kw.pronunciations.length) fail('phrase needs at least one pronunciation');
    for (const v of kw.pronunciations) if (!Array.isArray(v) || !v.length || v.length > 256 || v.some(p => !Number.isInteger(p) || p < 1 || p >= 40)) fail('invalid pronunciation phone IDs');
  }
  return phrases;
}
// Validated private copies of the phrases, each with its resolved sensitivity. A keyword file
// that names its model must name this one.
export function selectPhrases(value, modelSha256, defaultValue = 0.5) {
  sensitivity(defaultValue);
  const file = readKeywordFile(value);
  if (file.model && file.model.sha256 !== modelSha256) fail(`these keywords were made for model ${file.model.id} (${file.model.sha256.slice(0,12)}), not this model (${modelSha256.slice(0,12)})`, 'INCOMPATIBLE_ARTIFACT');
  const phrases = validatePhrases(JSON.parse(JSON.stringify(file.keywords)));
  return freeze(phrases.map(kw => ({
    id: Object.hasOwn(kw, 'id') ? kw.id : kw.name, ...Object.fromEntries(PHRASE.map(k => [k, kw[k]])),
    metadata: kw.metadata ?? {}, sensitivity: Object.hasOwn(kw, 'sensitivity') ? sensitivity(kw.sensitivity) : defaultValue,
  })));
}
export async function keywordsSha256(selected) {
  return digest(new TextEncoder().encode(JSON.stringify(selected.map(({sensitivity: _, ...kw}) => kw))));
}
export function options(value, extra = []) {
  fields(value, ['model','keywords'], ['sensitivity','keywordMode',...extra], 'Wake options');
  const mode = Object.hasOwn(value, 'keywordMode') ? value.keywordMode : 'production_arbitrated';
  if (!['independent','production_arbitrated'].includes(mode)) fail('invalid keywordMode');
  const defaultValue = Object.hasOwn(value, 'sensitivity') ? sensitivity(value.sensitivity) : 0.5;
  return {mode, defaultValue};
}
export function events(fires, offset, selected) {
  const found = [], k = selected.length;
  for (let i=0; i<fires.length; i++) if (fires[i]) {
    const index = i % k, frame = offset + Math.floor(i/k), kw = selected[index];
    found.push(Object.freeze({keywordId:kw.id,keyword:kw.name,keywordIndex:index,frameIndex:frame,
      sampleIndex:(frame+1)*512,timeSeconds:(frame+1)*512/16000,sensitivity:kw.sensitivity}));
  }
  return found;
}
export function pcm(value) {
  if (!(value instanceof Int16Array) || (typeof SharedArrayBuffer !== 'undefined' && value.buffer instanceof SharedArrayBuffer)) fail('expected an owned Int16Array of mono 16 kHz PCM');
  return value;
}
export function readWav(bytes) {
  if (!(bytes instanceof Uint8Array)) fail('WAV input must be bytes');
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const tag = p => String.fromCharCode(...bytes.subarray(p,p+4));
  if (bytes.length < 12 || tag(0) !== 'RIFF' || tag(8) !== 'WAVE' || view.getUint32(4,true)+8 !== bytes.length) fail('invalid or truncated RIFF WAV');
  let format = false, data = null;
  for (let p=12; p+8<=bytes.length;) {
    const size = view.getUint32(p+4,true), start=p+8, end=start+size;
    if (end>bytes.length) fail('truncated WAV chunk');
    if (tag(p)==='fmt ') {
      if (size<16 || view.getUint16(start,true)!==1 || view.getUint16(start+2,true)!==1 || view.getUint32(start+4,true)!==16000 || view.getUint16(start+12,true)!==2 || view.getUint16(start+14,true)!==16) fail('audio must be mono 16 kHz signed PCM16 WAV');
      format=true;
    } else if (tag(p)==='data') { if (data) fail('multiple WAV data chunks'); data=[start,size]; }
    p=end+(size%2);
  }
  if (!format || !data || data[1]%2) fail('missing or invalid WAV format/data');
  const output = new Int16Array(data[1]/2);
  for (let i=0;i<output.length;i++) output[i]=view.getInt16(data[0]+i*2,true);
  return output;
}
