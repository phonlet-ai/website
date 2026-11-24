class WakeCapture extends AudioWorkletProcessor {
  constructor(){super();this.buffer=new Int16Array(512);this.offset=0;this.active=true;
    this.port.onmessage=({data})=>{if(data==='stop'){
      this.active=false;
      if(this.offset)this.port.postMessage({pcm:this.buffer.slice(0,this.offset)});
      this.port.postMessage({stopped:true});
    }};
  }
  process(inputs){
    if(!this.active)return false;
    const channel=inputs[0]?.[0];
    if(channel)for(const sample of channel){
      this.buffer[this.offset++]=Math.round(Math.max(-1,Math.min(1,sample))* (sample<0?32768:32767));
      if(this.offset===512){const pcm=this.buffer;this.port.postMessage({pcm},[pcm.buffer]);this.buffer=new Int16Array(512);this.offset=0;}
    }
    return true;
  }
}
registerProcessor('phonlet-wake-capture',WakeCapture);
