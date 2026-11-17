import {test,expect} from '@playwright/test';
test('host presentation, multiple instances, custom configuration and teardown',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/examples/embed.html');
 await expect(page.locator('#log')).toContainText('Both players ready');
 await expect(page).toHaveTitle('Independent host integration');
 await expect(page.locator('h1')).toHaveText('My unrelated website');
 await expect(page.locator('body')).toHaveCSS('background-color','rgb(246, 241, 233)');
 await expect(page.locator('.preserved')).toHaveText('Existing host content stays.');
 const first=page.locator('#one .spriteware'),second=page.locator('#two .spriteware');
 await expect(first.locator('.scene')).toHaveAttribute('data-theme','liquid');await expect(second.locator('.scene')).toHaveAttribute('data-theme','biopod');
 await expect(first.locator('.title-readout')).toHaveText('My own film');
 await expect(second.locator('[data-sw=captions]')).toBeDisabled();await expect(second.locator('[data-sw=chapters]')).toBeDisabled();
 await expect(first.locator('track')).toHaveAttribute('label','Host captions');
 expect(await page.evaluate(()=>[...document.querySelectorAll('.spriteware [id]')].length)).toBe(0);
 await first.locator('[data-sw=chapters]').click();await expect(first.locator('.chapter-menu')).toBeVisible();await expect(first.locator('[data-time]')).toHaveCount(2);
 await page.keyboard.press('Escape');await expect(first.locator('.chapter-menu')).toBeHidden();
 await expect(first.locator('[data-sw=chapters]')).toBeFocused();
 await first.locator('[data-sw=play]').click();await expect.poll(()=>page.evaluate(()=>embedTest.one.video.paused)).toBe(false);
 expect(await page.evaluate(()=>embedTest.two.video.paused)).toBe(true);
 await first.locator('[data-sw=pause]').click();
 await first.locator('[data-sw=mute]').click();expect(await page.evaluate(()=>embedTest.one.video.muted)).toBe(true);expect(await page.evaluate(()=>embedTest.two.video.muted)).toBe(false);
 await page.locator('#dispose').click();await expect(second).toHaveCount(0);await expect(first).toHaveCount(1);
 await page.locator('#remount').click();await expect(second).toHaveCount(1);
 await page.locator('#host-control').click();await expect(page.locator('#log')).toHaveText('Unrelated host button works.');
 await page.locator('#host-control').focus();await page.keyboard.press('m');expect(await page.evaluate(()=>embedTest.two.video.muted)).toBe(false);
 expect(errors).toEqual([]);
});
test('dispose before artwork readiness is idempotent and preserves host content',async({page})=>{
 await page.goto('/examples/embed.html');await expect(page.locator('#log')).toContainText('Both players ready');
 const result=await page.evaluate(async()=>{
  const host=document.createElement('div');host.innerHTML='<b>Keep me</b>';document.body.append(host);
  const p=embedTest.mountSpriteware(host,{theme:'nebula',src:embedTest.options.src,assetBase:'/missing-assets/'});
  p.dispose();p.dispose();return {ready:await p.ready,text:host.textContent,roots:host.querySelectorAll('.spriteware').length};
 });expect(result).toEqual({ready:false,text:'Keep me',roots:0});
});
test('expanded fullscreen belongs to one instance and closes cleanly on dispose',async({page})=>{
 await page.goto('/examples/embed.html');await expect(page.locator('#log')).toContainText('Both players ready');
 await page.evaluate(()=>{embedTest.one.video.requestFullscreen=()=>Promise.reject(Error('test denied'));embedTest.one.video.webkitEnterFullscreen=undefined});
 await page.locator('#one [data-sw=fullscreen]').click();await expect(page.locator('#one .spriteware')).toHaveClass(/video-expanded/);
 expect(await page.locator('body').getAttribute('class')).toBeNull();expect(await page.locator('header').evaluate(el=>el.inert)).toBe(false);
 await page.keyboard.press('Escape');await expect(page.locator('#one .spriteware')).not.toHaveClass(/video-expanded/);
 await page.locator('#one [data-sw=fullscreen]').click();await page.evaluate(()=>embedTest.one.dispose());await expect(page.locator('#one .spriteware')).toHaveCount(0);await expect(page.locator('#two .spriteware')).toHaveCount(1);
});
test('all original demo themes use the same mounted player',async({page})=>{
 for(const skin of ['nebula','biopod','liquid']){await page.goto('/?skin='+skin);await expect(page.locator('.scene')).toHaveAttribute('data-artwork','ready');await expect(page.locator('.scene')).toHaveAttribute('data-theme',skin);await expect(page.locator('.spriteware')).toHaveCount(1);await expect(page.locator('.frame')).toBeVisible()}
});
