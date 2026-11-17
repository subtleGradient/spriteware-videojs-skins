export default {
 id:'liquid',name:'LIQUID ORBIT',subtitle:'Electric aqua. Liquid chrome. A small spacecraft for your next escape.',filename:'cosmic_drift.avi',width:1086,height:1448,
 frame:'themes/liquid/frame.png',assetRoot:'themes/liquid/',
 aperture:{box:[258,366,665,444],polygon:'inset(0 round 17px)'},
 title:[281,314,550,35],time:[281,824,610,34],
 controls:[
  {id:'previous',label:'Previous chapter',box:[242,1007,125,116],hit:[240,1001,128,126]},
  {id:'play',label:'Play',box:[386,982,177,163]},
  {id:'pause',label:'Pause',box:[577,1008,112,115],hit:[570,1001,126,126]},
  {id:'stop',label:'Stop and rewind',box:[697,1009,113,114],hit:[696,1001,126,126]},
  {id:'next',label:'Next chapter',box:[822,1008,115,115],hit:[822,1001,126,126]},
  {id:'chapters',label:'Chapters',box:[74,941,119,86],hit:[68,923,132,124]},
  {id:'captions',label:'Visual description captions',box:[74,1052,120,85],hit:[68,1048,132,124],toggle:true},
  {id:'fullscreen',label:'Enter fullscreen',box:[854,307,62,50],hit:[827,270,126,126]}
 ],
 mute:[945,637,126,100],
 seek:{hit:[232,886,668,91],from:[239,930],to:[895,930],thumb:60},
 volume:{hit:[945,737,126,251],from:[1003,970],to:[1003,748],thumb:50},
};
