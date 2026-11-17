// Display metadata as text only; never expose signed query strings or opaque URLs.
export function mediaTitle({title,currentSrc,src,baseURI}={}){
 const clean=value=>typeof value==='string'?value.replace(/[\u0000-\u001f\u007f]/g,' ').trim():'';
 const explicit=clean(title);if(explicit)return explicit;
 const source=clean(currentSrc)||clean(src);if(!source)return 'Video';
 try{
  const url=new URL(source,baseURI||'https://media.invalid/');
  if(!['https:','http:','file:'].includes(url.protocol))return 'Video';
  const segment=url.pathname.split('/').at(-1);if(!segment)return 'Video';
  let filename=segment;try{filename=decodeURIComponent(segment)}catch{}
  return clean(filename)||'Video';
 }catch{return 'Video'}
}
