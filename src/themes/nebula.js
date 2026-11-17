export default {
 id:'nebula',name:'NEBULA POP',subtitle:'Candy orange. Acid lime. Alien hardware.',width:1086,height:1448,
 frame:'themes/nebula/frame.png',assetRoot:'themes/nebula/',
 aperture:{box:[204,398,672,427],polygon:'polygon(5.5% 0,100% 0,94% 100%,0 100%)'},
 title:[265,342,550,47],time:[234,834,575,43],
 controls:[
 {id:'previous',label:'Previous chapter',box:[115,1005,131,123]},
 {id:'play',label:'Play',box:[249,978,231,177]},
 {id:'pause',label:'Pause',box:[481,1007,125,123]},
 {id:'stop',label:'Stop and rewind',box:[608,1007,128,123],hit:[608,1007,126,123]},
 {id:'next',label:'Next chapter',box:[735,1006,132,125]},
 {id:'chapters',label:'Chapters',text:'CHAPTERS',box:[145,1170,231,87],hit:[145,1157,231,126]},
 {id:'captions',label:'Visual description captions',text:'CC CAPTIONS',box:[375,1169,232,89],hit:[376,1157,230,126],toggle:true},
 {id:'fullscreen',asset:'chapter-step',label:'Enter fullscreen',text:'FULLSCREEN',box:[607,1170,266,88],hit:[607,1157,266,126]}
 ],
 mute:[900,715,90,86],seek:{hit:[170,890,660,87],from:[182,945],to:[815,945],thumb:60},volume:{hit:[901,804,88,269],from:[945,1055],to:[945,820],thumb:60},
};
