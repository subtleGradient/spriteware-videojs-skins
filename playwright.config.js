import {defineConfig} from '@playwright/test';
export default defineConfig({testDir:'tests/browser',workers:1,use:{baseURL:'http://127.0.0.1:4178',headless:true,launchOptions:{executablePath:process.env.CHROMIUM_PATH||undefined,args:['--no-sandbox']}},webServer:{command:'npm run dev -- --port 4178',url:'http://127.0.0.1:4178',reuseExistingServer:!process.env.CI}});
