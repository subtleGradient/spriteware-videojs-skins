/** Reveal a registered skin atomically after its canonical frame is decoded.
 * Controls are already baked into the frame, so waiting for all state PNGs is unnecessary.
 * Call without awaiting: media setup must not depend on decorative image readiness.
 */
export function prepareArtwork({frame,scene,video,signal,onError=()=>{}}){
 scene.dataset.artwork='loading';
 return new Promise(resolve=>{
  let finished=false,decoding=false;
  const cleanup=()=>{frame.removeEventListener('load',loaded);frame.removeEventListener('error',failed);signal?.removeEventListener('abort',aborted)};
  function finish(ok){
   if(finished)return;finished=true;cleanup();
   scene.dataset.artwork=ok?'ready':'error';
   if(!ok){video.controls=true;video.tabIndex=0;onError('The illustrated frame could not load. Native video controls are available; reload to try the skin again.')}
   resolve(ok);
  }
  function aborted(){if(finished)return;finished=true;cleanup();resolve(false)}
  if(signal?.aborted){aborted();return}
  signal?.addEventListener('abort',aborted,{once:true});
  function failed(){finish(false)}
  function loaded(){
   if(finished||decoding)return;
   if(!(frame.naturalWidth>0)){failed();return}
   decoding=true;
   if(typeof frame.decode!=='function'){finish(true);return}
   try{Promise.resolve(frame.decode()).then(()=>finish(true),failed)}catch{failed()}
  }
  // Attach first, then inspect complete: cached images and load events racing setup are covered.
  frame.addEventListener('load',loaded);
  frame.addEventListener('error',failed);
  if(frame.complete){if(frame.naturalWidth>0)loaded();else failed()}
 });
}
