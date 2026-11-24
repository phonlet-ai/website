import {load} from './js/kws.mjs';
import {WakeError, validatePhrases, keywordsSha256, events, digest, freeze, INVENTORY, FRONTEND, SDK_VERSION} from './shared.mjs';
let engine,model,session,selected;
let work=Promise.resolve();
self.onmessage=({data})=>{
  work=work.then(async()=>{
    const {id,operation,args}=data;
    try{
      let result;
      if(operation==='create'){
        if(session)throw new WakeError('INVALID_STATE','already created');
        selected=freeze(validatePhrases(args.keywords));
        const wasmUrl=new URL(args.simd?'./dist/kws_engine.simd.wasm':'./dist/kws_engine.wasm',import.meta.url);
        const response=await fetch(wasmUrl);if(!response.ok)throw new WakeError('CORRUPT_ARTIFACT','cannot load WASM engine');
        const wasmBinary=new Uint8Array(await response.arrayBuffer());
        const engineSha256=await digest(wasmBinary);
        engine=await load({simd:args.simd,wasmBinary});
        if(engine.abiVersion!==1||engine.frontendId!==FRONTEND||engine.language().inventory_id!==INVENTORY)throw new WakeError('INCOMPATIBLE_ARTIFACT','WASM engine identity mismatch');
        const modelSha256=await digest(args.model);
        model=engine.loadModel(args.model);
        try{session=engine.session(model,{keywords:selected,keywordSensitivities:selected.map(k=>k.sensitivity),mode:args.mode,outputs:{events:true}});}
        catch(error){model.close();throw error;}
        result={sdkVersion:SDK_VERSION,engineAbi:1,engineSha256,keywordsSha256:await keywordsSha256(selected),keywordMode:args.mode,scorer:'production',scorerOptions:'',backend:args.simd?'wasm-simd':'wasm-scalar',frontendId:FRONTEND,inventoryId:INVENTORY,modelSha256};
      }else if(operation==='process'){
        if(!session)throw new WakeError('INVALID_STATE','worker not initialized');
        const output=session.pushPcm(args);result=events(output.fires,output.frameOffset,selected);
      }else if(operation==='finish'){
        result=session.finish();
      }else if(operation==='close'){
        session?.close();model?.close();session=model=engine=null;result=null;
      }else throw new WakeError('INVALID_ARGUMENT','unknown worker operation');
      self.postMessage({id,result});
    }catch(error){self.postMessage({id,error:{code:error.code??'ENGINE_FAILURE',message:error.message??String(error)}});}
  });
};
