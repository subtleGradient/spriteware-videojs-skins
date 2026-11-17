// Return an explicit exit only at the popup's Tab boundaries. Interior Tab stays native.
export function chapterTabExit(key,shiftKey,index,count){
 if(key!=='Tab'||index<0||count<1)return null;
 if(shiftKey&&index===0)return 'opener';
 if(!shiftKey&&index===count-1)return 'after-opener';
 return null;
}
// Close is a separate action reached with Tab, not part of the chapter collection.
export function chapterArrowIndex(key,index,count){
 if(count<1)return null;
 if(key==='Home')return 0;
 if(key==='End')return count-1;
 if(key==='ArrowDown')return index<0?0:(index+1)%count;
 if(key==='ArrowUp')return index<0?count-1:(index-1+count)%count;
 return null;
}
