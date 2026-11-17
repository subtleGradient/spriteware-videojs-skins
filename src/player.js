import {mountSpriteware,spritewareThemes as themes} from './mount.js';
import './style.css';
const theme=themes[new URLSearchParams(location.search).get('skin')]||themes.nebula;
const asset=path=>import.meta.env.BASE_URL+path;
document.title=theme.name+' · Spriteware';
document.querySelector('h1').textContent=theme.name;
document.querySelector('header p:last-child').textContent=theme.subtitle;
const themeNav=document.createElement('nav');themeNav.setAttribute('aria-label','Player skins');
for(const entry of Object.values(themes)){const link=document.createElement('a');link.href='?skin='+entry.id;link.textContent=entry.name;if(entry.id===theme.id)link.setAttribute('aria-current','page');themeNav.append(link,document.createTextNode(' · '))}
document.querySelector('.notes').append(themeNav);
const skin=mountSpriteware(document.querySelector('#mount'),{theme:theme.id,src:asset('media/aqua-motion.mp4'),poster:asset('media/poster.jpg'),captions:[{src:asset('media/captions.vtt'),language:'en',label:'Visual descriptions'}],chapters:'auto'});
window.spriteware=skin;
