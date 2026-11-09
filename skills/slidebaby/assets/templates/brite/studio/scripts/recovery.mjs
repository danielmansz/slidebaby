/* Concrete, measured reflow proposals. Writes only separate proposal/measurement files. */
import fs from 'node:fs/promises';import path from 'node:path';import crypto from 'node:crypto';import {fileURLToPath,pathToFileURL} from 'node:url';
import {digest,hash} from './source.mjs';import {readDeck,verifyDocument,exists} from './verify-document.mjs';import {captureProject} from './publish.mjs';import {loadCatalog} from './check-plan.mjs';import {applyDeckEdit} from './deck-edit-core.mjs';import {migrationSupported,partitionBody,bodyUnits} from './reflow-core.mjs';
const helperStudio=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export async function recoveryToolchainHash(){return digest(await Promise.all(['catalog.js','engine.js','slides.css','scripts/reflow-core.mjs','scripts/edit-core.mjs','scripts/deck-edit-core.mjs'].map(async name=>[name,hash(await fs.readFile(path.join(helperStudio,name)))])));}
const strings={
 en:{title:'A checked proposal for your overflowing content',intro:'The current saved presentation has not been replaced. Review a choice and explicitly accept it before the agent applies it.',layout:'Use another compatible layout',split:'Split the content into continuation slides',count:'Slide count',current:'Currently saved',draft:'With your requested changes',result:'After this choice',warning:'This adds slides and changes any earlier fixed slide count. It needs your explicit acceptance.',type:'The chosen layout uses its authored type roles. No automatic font-reduction permission is added.',none:'No fully fitting lossless choice was found in the bounded search. Keep the source and offer a specific authorized wording or structure decision.',part:'Slide',accept:'To accept, tell your agent the choice ID below. The helper checks that the saved project and proposal draft have not changed.',constraints:'Additional slides are prohibited for this request; no split choice was generated.'},
 pl:{title:'Sprawdzona propozycja dla treści, która się nie mieści',intro:'Obecna zapisana prezentacja nie została zastąpiona. Przejrzyj propozycję i zaakceptuj wybraną opcję, zanim agent ją zastosuje.',layout:'Użyj innego zgodnego układu',split:'Podziel treść na slajdy kontynuacji',count:'Liczba slajdów',current:'Obecnie zapisane',draft:'Z Twoimi zgłoszonymi zmianami',result:'Po wybraniu tej opcji',warning:'Ta opcja dodaje slajdy i zmienia wcześniejszą stałą liczbę slajdów, jeśli ją określono. Wymaga Twojej wyraźnej akceptacji.',type:'Wybrany układ używa swojej zaprojektowanej typografii. Nie włączamy automatycznego zmniejszania fontu.',none:'W ograniczonej liczbie prób nie znaleziono w pełni mieszczącej się opcji bez utraty treści. Zachowaj źródło i zaproponuj konkretną decyzję o dopuszczonym skrócie lub strukturze.',part:'Slajd',accept:'Aby zaakceptować, podaj agentowi ID wybranej opcji. Narzędzie sprawdzi, czy zapisany projekt i robocza treść propozycji pozostają aktualne.',constraints:'W tej prośbie zabroniono dodawania slajdów, więc nie utworzono opcji podziału.'}
};
function compatibleEntries(slide,catalog){
 const photo=!!slide.image;
 return catalog.entries.filter(e=>e.id!==slide.template?.id&&(e.family===slide.layout||migrationSupported(slide.layout,e.family))&&!!e.contract.image.required===photo&&(!e.contract.image.collection)).sort((a,b)=>Number(a.family===slide.layout)-Number(b.family===slide.layout)).slice(0,12);
}
function continuationId(slide,index,occupied){let id=`continued-${digest({id:slide.id,index}).slice(0,24)}`,n=1;while(occupied.has(id))id=`continued-${digest({id:slide.id,index,n:n++}).slice(0,24)}`;occupied.add(id);return id;}
export function assertLosslessRecoveryRequest(deck,request,catalog){
 if(!request||Object.keys(request).some(k=>!['slides','splitSlides'].includes(k))||(!request.slides?.length&&!request.splitSlides?.length))throw Error('A recovery choice may only project layouts or split exact source ranges.');
 for(const item of request.slides||[])if(!item||Object.keys(item).some(k=>!['id','edit'].includes(k))||!item.edit||Object.keys(item.edit).length!==1||typeof item.edit.template!=='string')throw Error('Recovery cannot rewrite text, change fonts, remove images or edit chrome.');
 const result=applyDeckEdit(deck,request,catalog);return result;
}
export async function proposeRecovery({draft,target,expectedTarget=null,runtime,lang,allowAdditionalSlides=true}={}){
 draft=await fs.realpath(draft);target=path.resolve(target);await verifyDocument(draft);const original=await readDeck(path.join(draft,'presentation.js')),catalog=await loadCatalog(helperStudio);
 lang=lang==='pl'?'pl':lang==='en'?'en':original.language==='pl'?'pl':'en';const t=strings[lang];
 const folder=await fs.mkdtemp(path.join(path.dirname(draft),'recovery-')),measure=path.join(folder,'measure');await fs.mkdir(measure);
 await fs.cp(path.join(draft,'assets'),path.join(measure,'assets'),{recursive:true});await fs.cp(path.join(helperStudio,'samples'),path.join(measure,'samples'),{recursive:true});
 for(const name of ['catalog.js','engine.js','slides.css'])await fs.copyFile(path.join(helperStudio,name),path.join(measure,name));
 await fs.writeFile(path.join(measure,'measure.html'),'<!doctype html><link rel="stylesheet" href="assets/fonts.css"><link rel="stylesheet" href="slides.css"><script src="samples/brite.js"></script><script src="catalog.js"></script><script src="engine.js"></script><body></body>',{flag:'wx'});
 const mod=await import(pathToFileURL(path.resolve(runtime['playwright-module'])).href),chromium=mod.chromium||mod.default?.chromium,browser=await chromium.launch({headless:true,executablePath:path.resolve(runtime['browser-executable'])});
 let measurements=0,fullReport,choices=[],failing=[];const budget=48;
 try{
  const context=await browser.newContext({viewport:{width:1920,height:1080}});await context.route(/^https?:/,r=>r.abort());const page=await context.newPage();await page.goto(pathToFileURL(path.join(measure,'measure.html')).href);await page.waitForFunction(()=>window.BriteEngine);
  async function fit(deck){if(measurements>=budget)return{valid:false,issues:[{message:'The bounded proposal measurement budget was reached.'}]};measurements++;return page.evaluate(async deck=>{const r=await BriteEngine.prepare(deck);return{valid:r.valid,issues:r.issues,measurements:r.measurements};},deck);}
  fullReport=await fit(original);
  if(!fullReport.valid){
   const suspects=new Set(fullReport.issues.map(i=>i.slideId).filter(id=>original.slides.some(s=>s.id===id)));
   for(const slide of original.slides){if(suspects.size&&!suspects.has(slide.id))continue;const one=structuredClone(slide);for(const item of one.items||[])if(item.target){item.page=original.slides.findIndex(s=>s.id===item.target)+1;delete item.target;}const result=await fit({...original,slides:[one]});if(!result.valid)failing.push(slide.id);}
   // Only offer a whole-deck-valid choice. Unrelated slides remain identical.
   if(failing.length){
    let candidate=structuredClone(original),edits=[],complete=true;
    for(const id of failing){let accepted=false,tried=0;const before=candidate.slides.find(s=>s.id===id);
     for(const entry of compatibleEntries(before,catalog)){
      let result;try{result=applyDeckEdit(candidate,{slides:[{id,edit:{template:entry.id}}]},catalog);}catch{continue;}
      if(tried++>=3)break;const slide=result.deck.slides.find(s=>s.id===id);if((await fit({...candidate,slides:[slide]})).valid){candidate=result.deck;edits.push({id,edit:{template:entry.id}});accepted=true;break;}
     }if(!accepted){complete=false;break;}
    }
    if(complete&&(await fit(candidate)).valid)choices.push({id:'layout',label:t.layout,request:{slides:edits},deck:candidate});
    if(allowAdditionalSlides){
     candidate=structuredClone(original);const splits=[],occupied=new Set(original.slides.map(s=>s.id));complete=true;
     for(const id of failing){let accepted=false;const before=candidate.slides.find(s=>s.id===id);
      if(!['split','cards','process'].includes(before.layout)){complete=false;break;}
      outer:for(const count of [2,3,4])for(const strategy of [{whole:true,bias:0},{whole:false,bias:0},{whole:false,bias:0.06}]){
       const groups=partitionBody(before,count,strategy.bias,strategy.whole);if(!groups)continue;
       const localOccupied=new Set(occupied),parts=groups.map((fragments,i)=>({id:i?continuationId(before,i,localOccupied):before.id,fragments})),request={id,parts};let result;
       try{result=applyDeckEdit(candidate,{splitSlides:[request]},catalog);}catch{continue;}
       let fits=true;for(const part of parts)if(!(await fit({...candidate,slides:[result.deck.slides.find(s=>s.id===part.id)]})).valid){fits=false;break;}
       if(fits){candidate=result.deck;splits.push(request);for(const p of parts)occupied.add(p.id);accepted=true;break outer;}
      }if(!accepted){complete=false;break;}
     }
     if(complete&&(await fit(candidate)).valid)choices.push({id:'split',label:t.split,request:{splitSlides:splits},deck:candidate});
    }
   }
  }
 }finally{await browser.close();}
 const currentCount=await exists(target)?(await readDeck(path.join(target,'presentation.js'))).slides.length:0;
 choices=choices.map(({deck,...choice})=>{
  assertLosslessRecoveryRequest(original,choice.request,catalog);
  return{...choice,requestHash:digest(choice.request),resultHash:digest(deck),fromCount:original.slides.length,toCount:deck.slides.length,preview:deck.slides.filter(s=>failing.includes(s.id)||!original.slides.some(old=>old.id===s.id)).map(s=>({page:deck.slides.findIndex(item=>item.id===s.id)+1,id:s.id,template:s.template.id,title:structuredClone(s.title),body:bodyUnits(s).map(u=>u.text)}))};
 });
 const constraintsFile=path.join(draft,'generation/source.json');let initialConstraints=null;if(await exists(constraintsFile))initialConstraints=JSON.parse(await fs.readFile(constraintsFile)).constraints;
 const proposal={schemaVersion:1,kind:'slidebaby-fit-recovery',createdAt:new Date().toISOString(),lang,draft,target,expectedTarget,draftSnapshot:await captureProject(draft),toolchainHash:await recoveryToolchainHash(),currentCount,draftCount:original.slides.length,initialConstraints,allowAdditionalSlides,requiresAcceptance:true,measurements,budget,failing,diagnostics:fullReport,choices};
 const filename=path.join(folder,'proposal.json'),document=path.join(folder,'proposal.md');await fs.writeFile(filename,JSON.stringify(proposal,null,2),{flag:'wx'});
 const lines=[`# ${t.title}`,'',t.intro,'',`${t.current}: ${currentCount}. ${t.draft}: ${original.slides.length}.`,''];
 for(const choice of choices){lines.push(`## ${choice.label} — ID: ${choice.id}`,'',`${t.count}: ${choice.fromCount} → ${choice.toCount}.`,t.type,'');if(choice.toCount>original.slides.length)lines.push(t.warning,'');for(const [i,part]of choice.preview.entries()){lines.push(`### ${t.part} ${part.page} — ${part.template}`,'',JSON.stringify(part.title),'',...part.body.flatMap(s=>[s,'']));}}
 if(!allowAdditionalSlides)lines.push(t.constraints,'');if(!choices.length)lines.push(t.none,'');else lines.push(t.accept,'');await fs.writeFile(document,lines.join('\n'),{flag:'wx'});
 return{saved:false,status:choices.length?'fit-conflict':'needs-source-decision',requiresAcceptance:true,proposal:filename,review:document,draft,target,choices:choices.map(({request,resultHash,preview,...value})=>({...value,preview})),message:choices.length?t.intro:t.none};
}
