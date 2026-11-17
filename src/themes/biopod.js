// Artwork-only theme for the shared Spriteware Video.js engine.
export default {
 id:'biopod',name:'BIOPOD',subtitle:'Ultraviolet glass. Silver ribs. Alien hardware.',width:1086,height:1448,
 frame:'themes/biopod/frame.png',assetRoot:'themes/biopod/',
 aperture:{box:[209,345,755,465],polygon:'polygon(9% 0,100% 0,90% 100%,0 100%)'},
 title:[287,291,650,46],time:[240,820,610,42],
 controls:[
 {id:'previous',label:'Previous chapter',box:[170,996,124,111],hit:[165,985,137,137]},
 {id:'play',label:'Play',box:[318,976,184,150],hit:[308,966,205,170]},
 {id:'pause',label:'Pause',box:[526,998,109,109],hit:[518,985,126,137]},
 {id:'stop',label:'Stop and rewind',box:[660,998,110,109],hit:[651,985,128,137]},
 {id:'next',label:'Next chapter',box:[795,997,114,111],hit:[785,985,135,137]},
 {id:'chapters',label:'Chapters',text:'CHAPTERS',box:[127,1157,244,69],hit:[125,1143,249,113]},
 {id:'captions',label:'Visual description captions',text:'CC CAPTIONS',box:[396,1157,254,69],hit:[390,1143,264,113],toggle:true},
 {id:'fullscreen',label:'Enter fullscreen',text:'FULLSCREEN',box:[673,1157,248,69],hit:[669,1143,257,113]}
 ],
 mute:[959,725,85,85],
 seek:{hit:[193,881,697,85],from:[214,928],to:[875,928],thumb:60},
 volume:{hit:[953,814,91,268],from:[999,1050],to:[999,841],thumb:60}
};
