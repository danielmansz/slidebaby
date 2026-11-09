/* Injected only by the temporary loopback viewer; never added to exported/offline HTML. */
(() => {
 'use strict';
 const script=document.currentScript,base=new URL(script.src).pathname.replace(/\/client\.js$/,''),token=base.split('/').pop(),version=script.dataset.revision,key='brite.live-view:'+base;
 let connection='connecting',pending=null,reloading=false,reconnectTimer,lastActivity=0;
 const labels={en:{live:'Live preview',connecting:'Connecting',connected:'Connected',reconnecting:'Reconnecting',stopped:'Stopped',unavailable:'Disconnected',stop:'Stop',hint:'Saved changes appear automatically. Ask the agent to restart a stopped preview.'},pl:{live:'Podgląd na żywo',connecting:'Łączenie',connected:'Połączono',reconnecting:'Ponowne łączenie',stopped:'Zatrzymano',unavailable:'Rozłączono',stop:'Zatrzymaj',hint:'Zapisane zmiany pojawiają się automatycznie. Poproś agenta o ponowne uruchomienie zatrzymanego podglądu.'}};
 const style=document.createElement('style');style.textContent='#brite-live-preview{position:fixed;left:16px;bottom:16px;z-index:30;display:flex;gap:10px;align-items:center;padding:9px 12px;background:#f9f9f2;color:#20221a;border:1px solid #c8cbbd;border-radius:10px;box-shadow:0 4px 18px #20221a18;font:13px/1.3 system-ui,sans-serif}#brite-live-preview button{font:inherit;color:inherit;background:transparent;border:0;text-decoration:underline;text-underline-offset:3px;cursor:pointer;padding:2px}#brite-live-preview button[hidden]{display:none}body.presenting #brite-live-preview{display:none}@media print{#brite-live-preview{display:none!important}}';document.head.append(style);
 const badge=document.createElement('aside');badge.id='brite-live-preview';const status=document.createElement('span'),stop=document.createElement('button');status.setAttribute('role','status');stop.type='button';badge.append(status,stop);document.body.append(badge);
 function localize(){const language=document.getElementById('language')?.value||new URL(location.href).searchParams.get('lang')||'en',t=labels[language]||labels.en;status.textContent=t.live+' · '+t[connection];badge.title=t.hint;stop.textContent=t.stop;stop.hidden=['stopped','unavailable'].includes(connection);}
 const setConnection=value=>{connection=value;localize();};localize();document.getElementById('language')?.addEventListener('change',localize);
 const frames=()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
 function capture(){
  const slides=window.Brite?.getDeck()?.slides||[],items=[...document.querySelectorAll('#deck .slide-item')],presenting=document.body.classList.contains('presenting');
  const active=Math.max(0,items.findIndex(item=>item.classList.contains('active')));
  const anchor=items.length?items.reduce((best,item,index)=>Math.abs(item.getBoundingClientRect().top-innerHeight/3)<Math.abs(items[best].getBoundingClientRect().top-innerHeight/3)?index:best,0):0;
  return{view:location.hash==='#templates'?'templates':'presentation',presenting,activeId:slides[active]?.id,index:active,x:scrollX,y:scrollY,anchorId:slides[anchor]?.id,anchorOffset:items[anchor]?.getBoundingClientRect().top,tracks:[...document.querySelectorAll('.template-track')].map(track=>({id:track.id,index:Math.max(0,[...track.children].findIndex(card=>card.classList.contains('is-current')))}))};
 }
 function save(value){try{sessionStorage.setItem(key,JSON.stringify(value));return true;}catch{try{history.replaceState({...history.state,briteLiveRestore:{key,value}},'');return true;}catch{return false;}}}
 function take(){let value;try{const raw=sessionStorage.getItem(key);sessionStorage.removeItem(key);if(raw)value=JSON.parse(raw);}catch{}if(!value&&history.state?.briteLiveRestore?.key===key)value=history.state.briteLiveRestore.value;if(history.state?.briteLiveRestore?.key===key){const next={...history.state};delete next.briteLiveRestore;history.replaceState(next,'');}return value;}
 async function restore(){
  const saved=take();if(!saved)return;
  if(!window.Brite?.ready)await new Promise(resolve=>{const done=()=>{clearTimeout(timer);window.removeEventListener('deck-ready',done);resolve();},timer=setTimeout(done,20000);window.addEventListener('deck-ready',done);});
  if(!window.Brite?.ready)return;await document.fonts.ready;
  const slides=window.Brite.getDeck().slides||[];let index=slides.findIndex(slide=>slide.id===saved.activeId);if(index<0)index=Math.max(0,Math.min(saved.index||0,slides.length-1));
  window.Brite.switchView(saved.view==='templates'?'templates':'presentation',{replace:false});await frames();
  if(saved.presenting&&window.Brite.valid){document.body.classList.add('presenting');const controls=document.querySelector('.presentation-controls');if(controls)controls.hidden=false;}
  window.Brite.show(index);await frames();
  if(saved.view==='templates')for(const track of saved.tracks||[]){const element=document.getElementById(track.id);element?.closest('.family')?.querySelectorAll('.family-dot')[track.index]?.click();const card=element?.children[track.index];if(card)element.scrollTo({left:card.offsetLeft-parseFloat(getComputedStyle(element).paddingLeft),behavior:'instant'});}
  await frames();
  if(!saved.presenting){const anchorIndex=slides.findIndex(slide=>slide.id===saved.anchorId),anchor=document.querySelectorAll('#deck .slide-item')[anchorIndex];const y=saved.view!=='templates'&&anchor&&Number.isFinite(saved.anchorOffset)?scrollY+anchor.getBoundingClientRect().top-saved.anchorOffset:saved.y;scrollTo({left:Number.isFinite(saved.x)?saved.x:0,top:Number.isFinite(y)?y:0,behavior:'instant'});}
 }
 const restoring=restore();
 async function reload(){
  if(reloading||!pending||document.querySelector('dialog[open]'))return;
  reloading=true;await restoring;save(capture());location.reload();
 }
 document.addEventListener('close',()=>void reload(),true);
 const events=new EventSource(base+'/events');
 events.onopen=()=>{clearTimeout(reconnectTimer);reconnectTimer=null;setConnection('connected');};
 events.addEventListener('revision',event=>{try{const next=JSON.parse(event.data).version;if(next!==version){pending=next;void reload();}}catch{/* Wait for a valid event. */}});
 events.addEventListener('stopped',()=>{clearTimeout(reconnectTimer);events.close();setConnection('stopped');});
 events.onerror=()=>{setConnection('reconnecting');if(!reconnectTimer)reconnectTimer=setTimeout(()=>{events.close();setConnection('unavailable');},30000);};
 stop.addEventListener('click',async()=>{stop.disabled=true;try{const response=await fetch(base+'/stop',{method:'POST',headers:{'X-Brite-Session':token}});if(!response.ok)throw Error('Stop failed');events.close();setConnection('stopped');}catch{stop.disabled=false;setConnection('unavailable');}});
 function activity(){if(Date.now()-lastActivity<30000)return;lastActivity=Date.now();void fetch(base+'/activity',{method:'POST',headers:{'X-Brite-Session':token}}).catch(()=>{});}
 for(const name of ['pointerdown','keydown','scroll','focus'])window.addEventListener(name,activity,{passive:true});
 window.addEventListener('pagehide',()=>events.close());
})();
