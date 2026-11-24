import {Wake,WakeError} from './index.mjs';
import {fields} from './shared.mjs';

// Serial lifecycle, bounded audio and callback delivery. Borrowed resources stay owned by the caller.
export class WakeManager {
  #config; #wake; #context; #stream; #source; #node; #gain;
  #ownedContext=false; #ownedStream=false; #serial=Promise.resolve(); #audio=Promise.resolve();
  #queued=0; #state='idle'; #stopAck; #lastError=null; #closing=false; #closeTask; #listeners=[];
  constructor(config){
    fields(config,['wake','onDetection','onError'],['audioContext','stream'],'manager options');
    if(typeof config.onDetection!=='function'||typeof config.onError!=='function')throw new WakeError('INVALID_ARGUMENT','onDetection and onError are required functions');
    this.#config={...config,wake:{...config.wake,keywords:structuredClone(config.wake.keywords)}};
  }
  get state(){return this.#state;} get lastError(){return this.#lastError;}
  #operation(fn){const result=this.#serial.then(fn);this.#serial=result.catch(()=>{});return result;}
  #error(error){
    if(this.#state==='error'||this.#state==='closed')return;
    this.#lastError=error;this.#state='error';
    try{this.#config.onError(error);}catch(callbackError){this.#lastError=callbackError;}
    void this.stop().catch(()=>{});
  }
  start(){return this.#operation(async()=>{
    if(this.#state==='closed'||this.#closing)throw new WakeError('INVALID_STATE','manager closed');
    if(this.#state==='listening')return;
    this.#state='starting';this.#lastError=null;this.#audio=Promise.resolve();this.#queued=0;
    try{
      this.#wake=await Wake.create(this.#config.wake);
      this.#ownedContext=!this.#config.audioContext;
      this.#context=this.#config.audioContext??new AudioContext({sampleRate:16000});
      if(this.#context.sampleRate!==16000)throw new WakeError('AUDIO_FAILURE','Wake capture requires a 16 kHz AudioContext');
      await this.#context.resume();
      this.#ownedStream=!this.#config.stream;
      this.#stream=this.#config.stream??await navigator.mediaDevices.getUserMedia({audio:{channelCount:1,sampleRate:16000,echoCancellation:false,noiseSuppression:false,autoGainControl:false}});
      await this.#context.audioWorklet.addModule(new URL('./capture-worklet.mjs',import.meta.url));
      this.#source=this.#context.createMediaStreamSource(this.#stream);
      this.#node=new AudioWorkletNode(this.#context,'phonlet-wake-capture',{numberOfInputs:1,numberOfOutputs:1,outputChannelCount:[1],channelCount:1,channelCountMode:'explicit'});
      this.#gain=this.#context.createGain();this.#gain.gain.value=0;
      this.#node.onprocessorerror=()=>this.#error(new WakeError('AUDIO_FAILURE','audio worklet failed'));
      this.#node.port.onmessage=({data})=>{
        if(data.stopped){this.#stopAck?.();return;}
        if(!data.pcm||!['listening','stopping'].includes(this.#state))return;
        const pcm=data.pcm;
        if(this.#queued+pcm.length>4096){this.#error(new WakeError('OVERLOADED','capture queue exceeded 4096 samples'));return;}
        this.#queued+=pcm.length;
        this.#audio=this.#audio.then(async()=>{
          const result=await this.#wake.process(pcm);
          for(const event of result){
            // Capture callbacks are synchronous so slow async delivery cannot form a second unbounded queue.
            const returned=this.#config.onDetection(event);
            if(returned?.then){returned.catch(()=>{});throw new WakeError('INVALID_ARGUMENT','onDetection must be synchronous');}
          }
        }).catch(error=>this.#error(error)).finally(()=>{this.#queued-=pcm.length;});
      };
      this.#source.connect(this.#node);this.#node.connect(this.#gain);this.#gain.connect(this.#context.destination);
      this.#state='listening';
      const listen=(target,event,handler)=>{target.addEventListener(event,handler);this.#listeners.push(()=>target.removeEventListener(event,handler));};
      for(const track of this.#stream.getAudioTracks())listen(track,'ended',()=>{if(this.#state==='listening')this.#error(new WakeError('AUDIO_FAILURE','microphone track ended'));});
      listen(this.#context,'statechange',()=>{if(this.#state==='listening'&&this.#context.state!=='running')this.#error(new WakeError('AUDIO_FAILURE','audio context stopped'));});
    }catch(error){
      this.#lastError=error;await this.#cleanup();this.#state='idle';
      try{this.#config.onError(error);}catch(callbackError){this.#lastError=callbackError;}
      throw error;
    }
  });}
  async #cleanup(){
    this.#listeners.forEach(remove=>remove());this.#listeners=[];
    this.#source?.disconnect();this.#node?.disconnect();this.#gain?.disconnect();
    if(this.#node){this.#node.port.onmessage=null;this.#node.onprocessorerror=null;this.#node.port.close();}
    if(this.#ownedStream)this.#stream?.getTracks().forEach(track=>track.stop());
    try{await this.#wake?.close();}finally{
      if(this.#ownedContext&&this.#context&&this.#context.state!=='closed')await this.#context.close();
      this.#wake=this.#context=this.#stream=this.#source=this.#node=this.#gain=null;
    }
  }
  stop(){return this.#operation(async()=>{
    if(this.#state==='idle'||this.#state==='closed')return;
    const wasError=this.#state==='error';this.#state=wasError?'error':'stopping';
    try{
      if(this.#node&&this.#context.state==='running'&&!wasError){
        await new Promise((resolve,reject)=>{
          const timer=setTimeout(()=>reject(new WakeError('AUDIO_FAILURE','capture stop timed out')),2000);
          this.#stopAck=()=>{clearTimeout(timer);resolve();};this.#node.port.postMessage('stop');
        });
      }
      this.#source?.disconnect();
      await this.#audio;
      if(this.#wake?.state==='ready')await this.#wake.finish();
    }finally{await this.#cleanup();this.#state='idle';this.#stopAck=null;}
  });}
  close(){
    if(this.#closeTask)return this.#closeTask;
    this.#closing=true;this.#closeTask=this.stop().finally(()=>{this.#state='closed';});return this.#closeTask;
  }
}
