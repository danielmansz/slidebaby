#!/usr/bin/env node
/* Bounded, loopback-only preview of the last checked standalone HTML/PDF. Node20+. */
import fs from 'node:fs/promises';
import {constants} from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';

const kind='brite-live-preview',recordName='.brite/live-preview.json';
const sourceNames=['presentation.js','catalog.js','engine.js','slides.css','app.css','app.js'];
const publishedNames=['presentation.html','exports/presentation.pdf','exports/source-revision.json','exports.js',...sourceNames];
const digest=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
async function statLocal(root,name){
 let current=root;
 for(const part of name.split('/')){current=path.join(current,part);const stat=await fs.lstat(current);if(stat.isSymbolicLink())throw Error('Live preview does not follow project symlinks.');}
 const stat=await fs.lstat(current,{bigint:true});
 if(!stat.isFile())throw Error('Live preview requires regular project files.');
 return [stat.ino,stat.size,stat.mtimeNs,stat.ctimeNs].join(':');
}
async function readLocal(root,name){await statLocal(root,name);const handle=await fs.open(path.join(root,name),constants.O_RDONLY|constants.O_NOFOLLOW);try{return await handle.readFile();}finally{await handle.close();}}
async function existsLocal(root,name){try{await statLocal(root,name);return true;}catch(e){if(e.code==='ENOENT')return false;throw e;}}
async function safeDirectory(root,name){
 let current=root;
 for(const part of name.split('/')){current=path.join(current,part);try{await fs.mkdir(current);}catch(e){if(e.code!=='EEXIST')throw e;}const stat=await fs.lstat(current);if(!stat.isDirectory()||stat.isSymbolicLink())throw Error('Invalid local preview state directory.');}
}
async function settled(root){
 if(await existsLocal(root,'.brite/lock.json'))return false;
 if(await existsLocal(root,'.brite/transaction.json')){const record=JSON.parse(await readLocal(root,'.brite/transaction.json'));if(!['committed','rolled-back'].includes(record.status))return false;}
 return true;
}
async function signature(root){return(await Promise.all(publishedNames.map(name=>statLocal(root,name)))).join('|');}
export async function checkedSnapshot(root,previous){
 if(!await settled(root))return previous;
 const key=await signature(root);if(previous?.key===key)return previous;
 const bytes=Object.fromEntries(await Promise.all(publishedNames.map(async name=>[name,await readLocal(root,name)])));
 const text=bytes['exports.js'].toString(),match=text.match(/window\.BRITE_EXPORT\s*=\s*(\{[\s\S]*\})\s*;\s*$/);
 if(!match)throw Error('Export a checked presentation before starting live preview.');
 const entry=JSON.parse(match[1]),record=JSON.parse(bytes['exports/source-revision.json']);
 if(entry.stable!==true||entry.path!=='exports/presentation.pdf'||entry.preview!=='presentation.html'||typeof entry.revision!=='string'||record.revision!==entry.revision||!Array.isArray(record.files)||record.files.length!==sourceNames.length||new Set(record.files.map(f=>f.name)).size!==sourceNames.length)throw Error('The current HTML/PDF export records do not match.');
 for(const file of record.files)if(!sourceNames.includes(file.name)||digest(bytes[file.name])!==file.sha256)throw Error('The current source needs a checked export before previewing its changes.');
 const html=bytes['presentation.html'].toString(),pdf=bytes['exports/presentation.pdf'];
 if(!html.startsWith('<!-- Brite generated current viewer -->')||!html.includes('window.BRITE_EXPORT='+JSON.stringify(entry)+';')||!html.includes('data:application/pdf;base64,'+pdf.toString('base64')))throw Error('The standalone viewer and current PDF do not match.');
 if(!await settled(root)||await signature(root)!==key)return previous;
 return {key,html,pdf,version:digest(bytes['presentation.html']),revision:entry.revision};
}
function validateRecord(record,root){
 if(record?.kind!==kind||record.schemaVersion!==1||record.project!==root||!/^[a-f\d]{64}$/.test(record.token)||!Number.isInteger(record.pid)||record.pid<1)throw Error('Unknown local preview state. Preserve it and resolve the collision.');
 if(record.status!=='starting'&&(!Number.isInteger(record.port)||record.port<1||record.port>65535||record.url!==`http://127.0.0.1:${record.port}/preview/${record.token}/presentation.html`))throw Error('Invalid local preview address.');
 return record;
}
async function readSession(root){try{return validateRecord(JSON.parse(await readLocal(root,recordName)),root);}catch(e){if(e.code==='ENOENT')return null;throw e;}}
async function contact(record,action='status'){
 if(record.status==='starting')throw Error('Live preview is starting. Retry shortly.');
 const response=await fetch(record.url.replace(/presentation\.html$/,action),{method:action==='stop'?'POST':'GET',headers:{'X-Brite-Session':record.token},signal:AbortSignal.timeout(1500)});
 if(!response.ok)throw Error('Local preview did not accept the request.');
 const result=await response.json();if(result.kind!==kind||result.token!==record.token||result.project!==record.project)throw Error('Local preview identity does not match.');
 return result;
}
export async function previewStatus(project){const root=await fs.realpath(project),record=await readSession(root);if(!record)return{running:false,project:root};try{return await contact(record);}catch(error){return{running:false,project:root,pid:record.pid,error:error.message};}}
export async function stopPreview(project){const root=await fs.realpath(project),record=await readSession(root);if(!record)return{running:false,stopped:true,project:root};return contact(record,'stop');}

export async function startPreview({project,port=0,idleMinutes=60,pollMs=750}={}){
 if(!project)throw Error('Use --project with a generated Brite presentation.');
 if(!Number.isInteger(port)||port<0||port>65535||!Number.isFinite(idleMinutes)||idleMinutes<=0||idleMinutes>240||!Number.isInteger(pollMs)||pollMs<50)throw Error('Invalid local preview options.');
 const root=await fs.realpath(project);
 let snapshot=await checkedSnapshot(root,null);if(!snapshot)throw Error('The presentation is being saved. Retry after its checked export completes.');
 await safeDirectory(root,'.brite');
 const prior=await readSession(root);
 if(prior){
  try{const status=await contact(prior);return{...status,reused:true};}catch(error){
   let alive=true;try{process.kill(prior.pid,0);}catch(e){if(e.code==='ESRCH')alive=false;else if(e.code!=='EPERM')throw e;}
   if(alive)throw Error('An existing preview session is not responding. Stop its foreground task before restarting; no process was killed.');
   await safeDirectory(root,'.brite/history');await fs.rename(path.join(root,recordName),path.join(root,'.brite/history','live-preview-stale-'+crypto.randomUUID()+'.json'));
  }
 }
 const client=await fs.readFile(new URL('./live-preview-client.js',import.meta.url));
 const token=crypto.randomBytes(32).toString('hex'),startedAt=new Date().toISOString(),record={kind,schemaVersion:1,project:root,pid:process.pid,token,startedAt,status:'starting'};
 await fs.writeFile(path.join(root,recordName),JSON.stringify(record),{flag:'wx',mode:0o600});
 const peers=new Set();let closing=false,polling=false,lastActivity=Date.now(),pollTimer,idleTimer,heartbeat;
 let basePath,origin,info;
 const identity=()=>({kind,token,project:root,pid:process.pid,running:!closing,url:info?.url,revision:snapshot.revision,idleMinutes});
 const send=(peer,event,data)=>peer.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
 const reply=(response,code,type,body,head=false)=>{response.writeHead(code,{'Content-Type':type,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','X-Frame-Options':'DENY'});response.end(head?undefined:body);};
 const server=http.createServer(async(request,response)=>{
  try{
   if(request.headers.host!==new URL(origin).host||(request.headers.origin&&request.headers.origin!==origin)){reply(response,403,'text/plain','Local preview access denied.');return;}
   const url=new URL(request.url,origin),name=url.pathname;
   if(!['GET','HEAD','POST'].includes(request.method)){reply(response,405,'text/plain','Method not allowed.');return;}
   if(!name.startsWith(basePath+'/')){reply(response,404,'text/plain','Not found.');return;}
   const route=name.slice(basePath.length+1);
   if(request.method==='POST'){
    if(!['stop','activity'].includes(route)||request.headers['x-brite-session']!==token){reply(response,403,'text/plain','Local preview access denied.');return;}
    request.resume();lastActivity=Date.now();
    if(route==='stop'){response.once('finish',()=>void close('stopped'));reply(response,200,'application/json',JSON.stringify({...identity(),running:false,stopped:true}));}
    else reply(response,200,'application/json','{"ok":true}');
    return;
   }
   if(route==='presentation.html'){
    lastActivity=Date.now();const injection=`<script src="${basePath}/client.js" data-revision="${snapshot.version}" defer></script>`;
    reply(response,200,'text/html; charset=utf-8',snapshot.html.replace('</body>',injection+'\n</body>'),request.method==='HEAD');
   }else if(route==='client.js')reply(response,200,'text/javascript; charset=utf-8',client,request.method==='HEAD');
   else if(route==='presentation.pdf')reply(response,200,'application/pdf',snapshot.pdf,request.method==='HEAD');
   else if(route==='status'){lastActivity=Date.now();reply(response,200,'application/json',JSON.stringify(identity()),request.method==='HEAD');}
   else if(route==='events'&&request.method==='GET'){
    if(peers.size>=8){reply(response,429,'text/plain','Too many live preview tabs.');return;}
    response.writeHead(200,{'Content-Type':'text/event-stream','Cache-Control':'no-store','Connection':'keep-alive','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'});
    response.write('retry: 2000\n\n');peers.add(response);send(response,'revision',{version:snapshot.version});request.on('close',()=>peers.delete(response));
   }else reply(response,404,'text/plain','Not found.');
  }catch{if(!response.headersSent)reply(response,500,'text/plain','Local preview is unavailable.');else response.end();}
 });
 server.requestTimeout=5000;server.headersTimeout=5000;
 async function releaseRecord(){try{const actual=await readSession(root);if(actual?.token===token)await fs.unlink(path.join(root,recordName));}catch{/* Never remove a different or externally changed record. */}}
 async function close(reason='stopped'){
  if(closing)return;closing=true;clearInterval(pollTimer);clearInterval(idleTimer);clearInterval(heartbeat);
  process.off('SIGINT',onSignal);process.off('SIGTERM',onSignal);
  for(const peer of peers){send(peer,'stopped',{reason});peer.end();}peers.clear();
  await new Promise(resolve=>{server.close(resolve);server.closeIdleConnections();const force=setTimeout(()=>server.closeAllConnections(),500);force.unref();});
  await releaseRecord();
 }
 const onSignal=()=>void close('stopped');
 try{
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(port,'127.0.0.1',()=>{server.off('error',reject);resolve();});});
  origin=`http://127.0.0.1:${server.address().port}`;basePath=`/preview/${token}`;
  info={...record,status:'running',port:server.address().port,url:origin+basePath+'/presentation.html',idleMinutes};
  await safeDirectory(root,'.brite/tmp');const temporary=path.join(root,'.brite/tmp/live-preview-'+crypto.randomUUID()+'.json');await fs.writeFile(temporary,JSON.stringify(info,null,2),{flag:'wx',mode:0o600});await fs.rename(temporary,path.join(root,recordName));
  pollTimer=setInterval(async()=>{
   if(polling||closing)return;polling=true;
   try{const next=await checkedSnapshot(root,snapshot);if(next&&next.version!==snapshot.version){snapshot=next;for(const peer of peers)send(peer,'revision',{version:snapshot.version});}else if(next)snapshot=next;}catch{/* Keep the last checked pair during invalid, partial or interrupted edits. */}finally{polling=false;}
  },pollMs);
  heartbeat=setInterval(()=>{for(const peer of peers)peer.write(': heartbeat\n\n');},15000);
  idleTimer=setInterval(()=>{if(Date.now()-lastActivity>=idleMinutes*60000)void close('idle');},Math.min(1000,idleMinutes*60000));
  process.on('SIGINT',onSignal);process.on('SIGTERM',onSignal);
  return{...identity(),reused:false,close};
 }catch(error){server.close();await releaseRecord();throw error;}
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{
  if(process.argv.includes('--help'))console.log('Brite live preview: node scripts/live-preview.mjs --project /absolute/deck [--action start|status|stop] [--port 0] [--idle-minutes 60]. Foreground, loopback only; no installation or system startup. Ctrl+C or --action stop ends it.');
  else{
   const options={};for(let i=2;i<process.argv.length;i+=2){const key=process.argv[i],value=process.argv[i+1];if(!['--project','--action','--port','--idle-minutes'].includes(key)||!value||Object.hasOwn(options,key))throw Error('Read --help for live preview options.');options[key]=value;}
   if(!options['--project'])throw Error('Use --project with a generated Brite presentation.');if(options['--idle-minutes']!==undefined&&(!Number.isFinite(Number(options['--idle-minutes']))||Number(options['--idle-minutes'])<1||Number(options['--idle-minutes'])>240))throw Error('Use --idle-minutes between 1 and 240.');const action=options['--action']||'start';
   let result;if(action==='status')result=await previewStatus(options['--project']);else if(action==='stop')result=await stopPreview(options['--project']);else if(action==='start')result=await startPreview({project:options['--project'],port:options['--port']===undefined?0:Number(options['--port']),idleMinutes:options['--idle-minutes']===undefined?60:Number(options['--idle-minutes'])});else throw Error('Action must be start, status or stop.');
   const {close,...json}=result;console.log(JSON.stringify(json,null,2));
  }
 }catch(error){console.error(JSON.stringify({running:false,error:error.message}));process.exitCode=2;}
}
