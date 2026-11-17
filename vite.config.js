import {defineConfig} from 'vite';
export default defineConfig({base:process.env.BASE_PATH||'./',server:{host:'0.0.0.0',allowedHosts:['terminal.local']},build:{rollupOptions:{input:{demo:'index.html',embed:'examples/embed.html'}}}});
