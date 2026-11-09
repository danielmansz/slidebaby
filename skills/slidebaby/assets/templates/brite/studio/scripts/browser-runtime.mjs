/* Bounded known-location discovery. No downloads, shell lookup or recursive scans. */
import fs from'node:fs/promises';import{constants}from'node:fs';import path from'node:path';import os from'node:os';
export function browserCandidates({platform=process.platform,home=os.homedir(),env=process.env,explicit,cached}={}){
 const p=platform==='win32'?path.win32:path.posix,items=[];
 const add=(name,executable,source='system')=>{if(executable)items.push({name,executable,source});};
 // An explicit choice remains explicit: failure never silently selects another browser.
 if(explicit)return[{name:'Selected browser',executable:p.resolve(explicit),source:'explicit'}];
 if(platform==='darwin')for(const base of['/Applications',p.join(home,'Applications')]){
  add('Google Chrome',p.join(base,'Google Chrome.app/Contents/MacOS/Google Chrome'));
  add('Microsoft Edge',p.join(base,'Microsoft Edge.app/Contents/MacOS/Microsoft Edge'));
  add('Chromium',p.join(base,'Chromium.app/Contents/MacOS/Chromium'));
 }
 else if(platform==='win32')for(const base of[env.PROGRAMFILES,env['PROGRAMFILES(X86)'],env.LOCALAPPDATA].filter(Boolean)){
  add('Google Chrome',p.join(base,'Google/Chrome/Application/chrome.exe'));
  add('Microsoft Edge',p.join(base,'Microsoft/Edge/Application/msedge.exe'));
  add('Chromium',p.join(base,'Chromium/Application/chrome.exe'));
 }
 else if(platform==='linux')for(const[name,file]of[['Google Chrome','/usr/bin/google-chrome-stable'],['Google Chrome','/usr/bin/google-chrome'],['Google Chrome','/opt/google/chrome/chrome'],['Microsoft Edge','/usr/bin/microsoft-edge-stable'],['Microsoft Edge','/usr/bin/microsoft-edge'],['Microsoft Edge','/opt/microsoft/msedge/msedge'],['Chromium','/usr/bin/chromium'],['Chromium','/usr/bin/chromium-browser'],['Chromium','/snap/bin/chromium']])add(name,file);
 // Probe only known browser names on the ordinary executable search path.
 if(['darwin','linux','win32'].includes(platform)){
  const names=platform==='win32'?[['Google Chrome','chrome.exe'],['Microsoft Edge','msedge.exe'],['Chromium','chromium.exe']]:[['Google Chrome','google-chrome-stable'],['Google Chrome','google-chrome'],['Microsoft Edge','microsoft-edge-stable'],['Microsoft Edge','microsoft-edge'],['Chromium','chromium'],['Chromium','chromium-browser']];
  for(const folder of(env.PATH||'').split(platform==='win32'?';':':').filter(x=>p.isAbsolute(x)).slice(0,64))for(const[name,file]of names)add(name,p.join(folder,file),'path');
 }
 add('Playwright Chromium',cached,'playwright-cache');
 const seen=new Set();return items.filter(item=>{const key=platform==='win32'?item.executable.toLowerCase():item.executable;if(seen.has(key))return false;seen.add(key);return true;});
}
export async function isBrowserExecutable(file){try{const stat=await fs.stat(file);if(!stat.isFile())return false;await fs.access(file,process.platform==='win32'?constants.F_OK:constants.X_OK);return true;}catch{return false;}}
export async function findWorkingBrowser(candidates,{exists=isBrowserExecutable,probe}={}){
 const attempts=[];
 for(const candidate of candidates){
  if(!await exists(candidate.executable))continue;
  if(!probe)return{selected:candidate,verified:false,attempts:[{...candidate,status:'found'}]};
  try{await probe(candidate.executable);attempts.push({...candidate,status:'ok'});return{selected:candidate,verified:true,attempts};}
  catch(error){attempts.push({...candidate,status:'failed',detail:String(error.message).slice(0,800)});}
 }
 return{selected:null,verified:false,attempts};
}
