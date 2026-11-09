/* Bounded, replayable document edits. Added slide text is supplied in the edit input. */
import {applySlideEdit,verifyNormalizedInput,matchesEditedAsset} from './edit-core.mjs';
import {splitSlide} from './reflow-core.mjs';
const own=(o,k)=>Object.hasOwn(o,k),object=v=>v&&typeof v==='object'&&!Array.isArray(v);
const fail=m=>{throw Error(m);};
function chromePatch(current,patch,catalog){
 const issues=catalog.validateChrome(patch);if(issues.length)fail(issues.map(i=>i.message).join(' '));
 return patch===null?null:{...(object(current)?current:{}),...structuredClone(patch)};
}
export function applyDeckEdit(input,request,catalog){
 if(!object(request)||!Object.keys(request).length||Object.keys(request).some(k=>!['slides','addSlides','removeSlides','slideOrder','chrome','splitSlides'].includes(k)))fail('Use slides, addSlides, removeSlides, slideOrder, splitSlides or chrome for a document edit.');
 let deck=structuredClone(input);const reports=[],targets=new Set();
 if(own(request,'slides')){
  if(!Array.isArray(request.slides)||!request.slides.length)fail('slides needs explicit existing slide edits.');
  for(const item of request.slides){
   if(!object(item)||Object.keys(item).some(k=>!['id','edit','chrome','overrides'].includes(k))||targets.has(item.id)||!deck.slides.some(s=>s.id===item.id)||(!own(item,'edit')&&!own(item,'chrome')&&!own(item,'overrides')))fail('Use distinct existing slide IDs with an edit, chrome or overrides.');
   targets.add(item.id);
   if(own(item,'edit')){const result=applySlideEdit(deck,item.id,item.edit,catalog);deck=result.deck;reports.push(result.report);}
   const slide=deck.slides.find(s=>s.id===item.id);
   if(own(item,'chrome'))slide.chrome=chromePatch(slide.chrome,item.chrome,catalog);
   if(own(item,'overrides')){
    if(item.overrides===null)delete slide.overrides;
    else{
     if(!object(item.overrides))fail('Use a local title/group override object or null to reset.');
     const allowed=catalog.contractFor(slide).allowedOverrides;
     for(const [group,settings] of Object.entries(item.overrides)){
      if(!own(allowed,group)||(!object(settings)&&settings!==null))fail('This layout does not support that override group.');
      slide.overrides??={};
      if(settings===null)delete slide.overrides[group];
      else{slide.overrides[group]??={};for(const [key,value]of Object.entries(settings)){
       if(!own(allowed[group],key)&&!(group==='title'&&key==='textTransform'))fail('Unsupported local layout setting.');
       if(value!==null){const rule=allowed[group][key];if(key==='textTransform'){if(slide.layout!=='cover'||!['none','uppercase'].includes(value))fail('Cover textTransform must be uppercase or none.');}else if(Array.isArray(rule)){if(!rule.includes(value))fail('Unsupported local layout value.');}else if(typeof value!=='number'||!Number.isFinite(value)||value<rule.min||value>rule.max||(rule.integer&&!Number.isInteger(value)))fail('Local layout value is outside the supported bounds.');}
       if(value===null)delete slide.overrides[group][key];else slide.overrides[group][key]=structuredClone(value);
      }}
     }
    }
   }
  }
 }
 if(own(request,'splitSlides')){
  if(!Array.isArray(request.splitSlides)||!request.splitSlides.length)fail('splitSlides needs explicit source references and continuation ranges.');
  for(const item of request.splitSlides){
   const at=deck.slides.findIndex(s=>s.id===item?.id);if(at<0||targets.has(item.id))fail('Split distinct existing slides; do not edit and split the same source in one request.');targets.add(item.id);
   const result=splitSlide(deck.slides[at],item,catalog);
   if(result.slides.slice(1).some(s=>deck.slides.some(old=>old.id===s.id)))fail('A continuation slide ID already exists.');
   deck.slides.splice(at,1,...result.slides);reports.push(result.report);
  }
 }
 if(own(request,'removeSlides')){
  if(!Array.isArray(request.removeSlides)||!request.removeSlides.length||new Set(request.removeSlides).size!==request.removeSlides.length||request.removeSlides.some(id=>!deck.slides.some(s=>s.id===id)||targets.has(id)))fail('Remove distinct existing slides; do not edit and remove the same slide.');
  deck.slides=deck.slides.filter(s=>!request.removeSlides.includes(s.id));
 }
 if(own(request,'addSlides')){
  if(!Array.isArray(request.addSlides)||!request.addSlides.length)fail('addSlides needs supplied new content.');
  for(const item of request.addSlides){
   if(!object(item)||Object.keys(item).some(k=>!['id','template','content','afterId'].includes(k))||typeof item.id!=='string'||!item.id.trim()||deck.slides.some(s=>s.id===item.id)||!object(item.content)||!catalog.entries.some(e=>e.id===item.template))fail('Each new slide needs a unique ID, active template and supplied content.');
   const slide=catalog.instantiate(item.template,item.content);slide.id=item.id;
   const issues=catalog.validateContract(slide);if(issues.length)fail(`New slide ${item.id}: ${issues.map(i=>i.message).join(' ')}`);
   let at=deck.slides.length;
   if(own(item,'afterId')){if(item.afterId===null)at=0;else{at=deck.slides.findIndex(s=>s.id===item.afterId)+1;if(!at)fail('New slide insertion target does not exist.');}}
   deck.slides.splice(at,0,slide);
  }
 }
 if(own(request,'slideOrder')){
  const order=request.slideOrder;if(!Array.isArray(order)||order.length!==deck.slides.length||new Set(order).size!==order.length||order.some(id=>!deck.slides.some(s=>s.id===id)))fail('slideOrder must contain every resulting slide ID exactly once.');
  deck.slides=order.map(id=>deck.slides.find(s=>s.id===id));
 }
 if(own(request,'chrome'))deck.chrome=chromePatch(deck.chrome,request.chrome,catalog);
 if(deck.slides.length<1||deck.slides.length>60)fail('Keep 1–60 slides in the presentation.');
 const ids=new Set(deck.slides.map(s=>s.id));
 for(const slide of deck.slides){
  const issues=catalog.validateContract(slide);if(issues.length)fail(`${slide.id}: ${issues.map(i=>i.message).join(' ')}`);
  if(slide.items?.some(item=>item.target&&!ids.has(item.target)))fail('An agenda points to a removed slide. Update its navigation explicitly in a source revision before removing that target.');
 }
 return{deck,report:{scope:'deck',slideEdits:reports,addedSlides:request.addSlides?.map(s=>s.id)||[],removedSlides:request.removeSlides||[],order:deck.slides.map(s=>s.id),chromeChanged:own(request,'chrome')}};
}
export function verifyDeckNormalizedInput(raw,operation,assets,options={}){
 const expected=structuredClone(raw);
 for(const [i,item]of (expected.slides||[]).entries()){
  if(item.edit){verifyNormalizedInput(item.edit,operation.slides[i].edit,assets,options);item.edit=structuredClone(operation.slides[i].edit);}
  normalizeBrand(item.chrome,operation.slides[i].chrome);
 }
 for(const [i,item]of (expected.addSlides||[]).entries()){
  const normalized=operation.addSlides[i].content,c=item.content;
  if(c.image)normalizePath(c,'image',normalized.image);
  if(c.background)normalizePath(c.background,'src',normalized.background?.src);
  for(const [j,image]of (c.images||[]).entries())normalizePath(image,'src',normalized.images[j].src);
  normalizeBrand(c.chrome,normalized.chrome);
 }
 normalizeBrand(expected.chrome,operation.chrome);
 function normalizePath(container,key,value){if(typeof container[key]!=='string'||!assets.some(a=>matchesEditedAsset(a,container[key],value,options)))fail('New asset does not match the supplied document edit/source.');container[key]=value;}
 function normalizeBrand(value,normalized){if(value?.brand?.kind==='image')normalizePath(value.brand,'src',normalized?.brand?.src);}
 // Reuse the canonical comparison used by slide edits, without photo normalization.
 verifyNormalizedInput(expected,operation,assets,options);
}
