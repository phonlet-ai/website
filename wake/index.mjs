import {WakeError, options, selectPhrases, digest, pcm, freeze} from './shared.mjs';
export {WakeError, readWav} from './shared.mjs';

// Bytes from a URL (relative to the page), or a copy of bytes the caller passed.
async function bytes(value, label) {
  if (value instanceof Uint8Array) return new Uint8Array(value);
  if (value instanceof ArrayBuffer) return new Uint8Array(value.slice(0));
  if (typeof value !== 'string' && !(value instanceof URL)) throw new WakeError('INVALID_ARGUMENT', `${label} must be a URL or bytes`);
  const response = await fetch(value);
  if (!response.ok) throw new WakeError('CORRUPT_ARTIFACT', `cannot load ${label}: HTTP ${response.status}`);
  return new Uint8Array(await response.arrayBuffer());
}
// A keyword file from a URL; a parsed file or a list of phrases passes through.
async function keywordFile(value) {
  if (typeof value !== 'string' && !(value instanceof URL)) return value;
  try { return JSON.parse(new TextDecoder().decode(await bytes(value, 'keyword file'))); }
  catch (error) { if (error instanceof WakeError) throw error; throw new WakeError('CORRUPT_ARTIFACT', `keyword file is not valid JSON: ${error.message}`); }
}

export class Wake {
  #worker; #requests=new Map(); #sequence=0; #queued=0; #state='starting';
  #selected; #info; #final; #finishTask; #closeTask;
  constructor(token,worker,selected) {
    if(token!==Wake) throw new WakeError('INVALID_ARGUMENT','use Wake.create');
    this.#worker=worker;this.#selected=selected;
    worker.onmessage=({data})=>{
      const pending=this.#requests.get(data.id);if(!pending)return;
      this.#requests.delete(data.id);clearTimeout(pending.timer);
      if(data.error)pending.reject(new WakeError(data.error.code??'ENGINE_FAILURE',data.error.message));
      else pending.resolve(data.result);
    };
    worker.onerror=e=>{e.preventDefault();this.#fail(new WakeError('ENGINE_FAILURE',e.message||'Wake worker failed'));};
    worker.onmessageerror=()=>this.#fail(new WakeError('ENGINE_FAILURE','invalid worker message'));
  }
  #fail(error){
    this.#state='closed';this.#worker.terminate();
    for(const p of this.#requests.values()){clearTimeout(p.timer);p.reject(error);}this.#requests.clear();
  }
  #rpc(operation,args,transfer=[]){
    const id=++this.#sequence;
    return new Promise((resolve,reject)=>{
      const timer=setTimeout(()=>this.#fail(new WakeError('ENGINE_FAILURE',`worker ${operation} timed out`)),30000);
      this.#requests.set(id,{resolve,reject,timer});
      try{this.#worker.postMessage({id,operation,args},transfer);}
      catch(error){clearTimeout(timer);this.#requests.delete(id);reject(error);}
    });
  }
  // A model (URL or bytes) and its phrases: a keyword file URL, the parsed keyword file, or a list
  // of phrases written in code. A keyword file that names its model must name this one.
  static async create(input){
    const {mode,defaultValue}=options(input,['simd']);
    if(Object.hasOwn(input,'simd')&&typeof input.simd!=='boolean')throw new WakeError('INVALID_ARGUMENT','simd must be boolean');
    const model=await bytes(input.model,'model');
    const selected=selectPhrases(await keywordFile(input.keywords),await digest(model),defaultValue);
    const worker=new Worker(new URL('./worker.mjs',import.meta.url),{type:'module',name:'phonlet-wake'});
    const wake=new Wake(Wake,worker,selected);
    try{
      wake.#info=freeze(await wake.#rpc('create',{model,keywords:selected,mode,simd:input.simd??false},[model.buffer]));
      wake.#state='ready';return wake;
    }catch(error){wake.#fail(error);throw error;}
  }
  get sampleRate(){return 16000;} get frameLength(){return 512;} get state(){return this.#state;}
  get keywords(){return this.#selected;} get info(){return this.#info;}
  async process(input){
    if(this.#state!=='ready')throw new WakeError('INVALID_STATE',`Wake is ${this.#state}`);
    pcm(input);
    if(input.length+this.#queued>4096)throw new WakeError('OVERLOADED','Maximum unacknowledged audio is 4096 samples; split and await file chunks.');
    const count=input.length,copy=new Int16Array(input);this.#queued+=count;
    try{return (await this.#rpc('process',copy,[copy.buffer])).map(freeze);}
    catch(error){this.#fail(error);throw error;}
    finally{this.#queued-=count;}
  }
  async finish(){
    if(this.#state==='closed'||this.#state==='closing')throw new WakeError('INVALID_STATE',`Wake is ${this.#state}`);
    if(this.#final)return this.#final;
    if(!this.#finishTask){
      this.#state='finishing';
      this.#finishTask=this.#rpc('finish').then(result=>{
        this.#final=freeze(result);if(this.#state==='finishing')this.#state='finished';return this.#final;
      }).catch(error=>{this.#fail(error);throw error;});
    }
    return this.#finishTask;
  }
  async close(){
    if(this.#closeTask)return this.#closeTask;
    if(this.#state==='closed')return;
    this.#state='closing';
    this.#closeTask=this.#rpc('close').finally(()=>{this.#state='closed';this.#worker.terminate();});
    return this.#closeTask;
  }
}
