// The bundled motion study has authored names; other media gets neutral segments.
export function mediaChapters(src,duration){
 if(!Number.isFinite(duration)||duration<=0)return [];
 let demo=false;try{demo=new URL(src,'https://example.invalid/').pathname.split('/').pop()==='aqua-motion.mp4'}catch{}
 const names=demo?['Chromatic drift','Pearl current','Prismatic tide']:['Part 1','Part 2','Part 3'];
 return names.map((label,i)=>({time:duration*i/3,label:`0${i+1} · ${label}`}));
}
export function currentChapter(chapters,time){
 if(!chapters.length)return -1;
 let index=0;for(let i=1;i<chapters.length;i++)if(time>=chapters[i].time)index=i;
 return index;
}
export function chapterDestination(chapters,time,direction){
 const index=currentChapter(chapters,time);if(index<0)return null;
 if(direction>0)return chapters[Math.min(index+1,chapters.length-1)].time;
 return chapters[time-chapters[index].time>2?index:Math.max(0,index-1)].time;
}
export function repeatedToggle(key,repeat){return repeat&&['k','m','f'].includes(key.toLowerCase())}
