// Render eksplorasi imagery: node docs/wireframes/explorations/imagery/render.js
const path=require('path');const {chromium}=require('playwright');
(async()=>{const dir=__dirname;const b=await chromium.launch({executablePath:process.env.PW_CHROMIUM_PATH||'/opt/pw-browsers/chromium'});const p=await b.newPage({viewport:{width:1840,height:1000},deviceScaleFactor:2});
await p.goto('file://'+path.join(dir,'index.html'));await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(800);
const ids={'s-splash':'0-splash','s-welcome':'1-1-selamat-datang','s-login':'1-9-masuk','s-today':'2-1-hari-ini','s-finish':'2-4-selesai','s-empty':'3-3-progres-kosong','s-premium':'4-4-premium','s-sheet':'library'};
for(const[id,n] of Object.entries(ids)){const el=await p.$('#'+id+' > .ph, #'+id+' > .sheet');await el.screenshot({path:path.join(dir,'png',n+'.png')});}
await p.screenshot({path:path.join(dir,'overview.png'),fullPage:true});await b.close();})();
