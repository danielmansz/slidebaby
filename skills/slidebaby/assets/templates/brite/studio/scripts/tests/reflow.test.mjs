import test from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';import fs from 'node:fs/promises';
import {migrateSlide,splitSlide,bodyUnits,partitionBody} from '../reflow-core.mjs';
import {applySlideEdit} from '../edit-core.mjs';import {applyDeckEdit} from '../deck-edit-core.mjs';
const context=vm.createContext({window:{},structuredClone});for(const name of ['samples/brite.js','catalog.js'])vm.runInContext(await fs.readFile(new URL('../../'+name,import.meta.url),'utf8'),context);
const catalog=context.window.BriteCatalog;
const content={id:'details',layout:'split',template:{id:'split-no-image',version:1},title:'A useful weekly rhythm',paragraphs:['Agree on priorities.','Keep the plan visible.'],points:['Plan the week.','Keep work visible.','Review progress.'],palette:'dark',chrome:{brand:{kind:'text',text:'Atlas'},footerRight:'Draft'}};
test('Content→Cards→Content retains every original word, paragraph, title, brand and palette',()=>{
 const before=structuredClone(content),card=migrateSlide(before,'cards-outline-3-no-image',catalog).slide;
 assert.deepEqual(card.cards.map(c=>c.description),before.points);assert(card.cards.every(c=>!c.title));assert.equal(card.description,before.paragraphs.join('\n\n'));assert.equal(card.id,before.id);assert.equal(card.palette,'dark');assert.deepEqual(card.chrome,before.chrome);
 const restored=migrateSlide(card,'split-no-image',catalog).slide;assert.deepEqual(restored.paragraphs,before.paragraphs);assert.deepEqual(restored.points,before.points);assert.deepEqual(content,before);
});
test('Card roles, IDs and explicit row typography survive Content and Process round trips',()=>{
 const cards={id:'features',layout:'cards',template:{id:'cards-outline-3-no-image',version:1},title:'Working together',description:'One shared plan.',cards:[{id:'first',title:'Plan',description:'Choose priorities.'},{id:'second',title:'Share',description:'Make work visible.'},{id:'third',title:'Review',description:'Learn every week.'}],cardNumbers:false,cardTypography:{baseSize:30,allowSmallerText:true,profile:'normal'}};
 for(const template of ['split-no-image','process-outline']){
  const projected=migrateSlide(cards,template,catalog).slide,back=migrateSlide(projected,'cards-outline-3-no-image',catalog).slide;
  assert.deepEqual(back.cards,cards.cards);assert.deepEqual(back.cardTypography,cards.cardTypography);assert.equal(back.cardNumbers,false);
 }
});
test('Edited flat text remains literal when former card title/body boundaries no longer match',()=>{
 const first=migrateSlide(content,'cards-no-image',catalog).slide,flat=migrateSlide(first,'split-no-image',catalog).slide;flat.points[0]='The user supplied a completely new sentence.';
 const back=migrateSlide(flat,'cards-no-image',catalog).slide;assert.equal(back.cards[0].description,flat.points[0]);assert.equal(back.cards[0].id,first.cards[0].id);
});
test('Cover↔Section opener retains supplied imagery, background and explicit original casing',()=>{
 const cover={id:'intro',layout:'cover',template:{id:'cover-default',version:1},title:['A clear','direction'],description:'A supplied statement.',image:'assets/user/photo.webp',imageAlt:'Actual photo',background:{src:'assets/user/background.webp',alt:'Backdrop'},palette:'dark',overrides:{title:{textTransform:'none',width:900}}};
 const section=migrateSlide(cover,'divider-image',catalog).slide;assert.equal(section.image,cover.image);assert.deepEqual(section.background,cover.background);assert(!('textTransform' in section.overrides.title));
 const back=migrateSlide(section,'cover-default',catalog).slide;assert.deepEqual(back.overrides,cover.overrides);assert.deepEqual(back.title,cover.title);
 assert.throws(()=>migrateSlide({...section,sectionNumber:'03'},'cover-default',catalog),/section number/);
});
test('Unsupported mappings, absent step headings and incompatible photo/count choices reject',()=>{
 assert.throws(()=>migrateSlide(content,'metrics-3',catalog),/Supported cross-family/);
 assert.throws(()=>migrateSlide({...content,points:content.points.slice(0,2)},'cards-outline-3-no-image',catalog),/item count/);
 assert.throws(()=>migrateSlide({...content,image:'photo.webp',imageAlt:'Photo',template:{id:'split-default',version:1}},'cards-no-image',catalog),/omits/);
 const cards=migrateSlide(content,'cards-no-image',catalog).slide;assert.throws(()=>migrateSlide(cards,'process-outline',catalog),/step titles/);
});
test('An ordinary tracked template edit uses the safe projection and keeps other slides identical',()=>{
 const other={id:'end',layout:'divider',template:{id:'divider-default',version:1},title:'Next steps'},deck={title:'Test',slides:[content,other]};
 const result=applySlideEdit(deck,content.id,{template:'cards-outline-3-no-image'},catalog);assert(result.report.migration);assert.deepEqual(result.deck.slides[1],other);assert.deepEqual(deck.slides[0],content);
});
test('Range-based continuations preserve all body characters in order and retain first identity',()=>{
 const groups=partitionBody(content,2,0,true),request={id:content.id,parts:groups.map((fragments,i)=>({id:i?content.id+'-continued':content.id,fragments}))};
 const result=splitSlide(content,request,catalog);assert.equal(result.slides.length,2);assert.equal(result.slides[0].id,content.id);assert(result.slides.every(s=>s.title===content.title&&s.palette==='dark'));assert.equal(result.slides.flatMap(s=>bodyUnits(s)).map(u=>u.text).join('\n\n'),bodyUnits(content).map(u=>u.text).join('\n\n'));
 const deck={slides:[content,{id:'end',layout:'divider',template:{id:'divider-default',version:1},title:'End'}]};const applied=applyDeckEdit(deck,{splitSlides:[request]},catalog);assert.equal(applied.deck.slides.length,3);assert.deepEqual(applied.deck.slides[2],deck.slides[1]);
});
test('Omitted, duplicated, reordered or invented continuation text cannot pass coverage',()=>{
 const groups=partitionBody(content,2,0,true),base={id:content.id,parts:groups.map((fragments,i)=>({id:i?'continued':content.id,fragments}))};
 const incomplete=structuredClone(base);incomplete.parts[1].fragments.pop();assert.throws(()=>splitSlide(content,incomplete,catalog),/coverage|empty/);
 const duplicated=structuredClone(base);duplicated.parts[1].fragments.unshift(duplicated.parts[0].fragments[0]);assert.throws(()=>splitSlide(content,duplicated,catalog),/cover every/);
 const invented=structuredClone(base);invented.parts[0].fragments[0].text='Invented';assert.throws(()=>splitSlide(content,invented,catalog),/cover every/);
 const badID=structuredClone(base);badID.parts[1].id=content.id;assert.throws(()=>splitSlide(content,badID,catalog),/unique/);
 assert.throws(()=>splitSlide({id:'q',layout:'quote',template:{id:'quote-centered',version:1},quote:'Exact quote'},base,catalog),/Content, Cards and Process|source ID/);
});
test('Layout memory cannot hide body text, and empty cards remain invalid',()=>{
 const bad={...content,layoutState:{version:1,cards:{secret:'Lost source text'}}};assert(catalog.validateContract(bad).some(i=>i.field==='layoutState'));
 const value=catalog.instantiate('cards-no-image',{id:'x',title:'Cards',cards:[{description:'One'},{title:'Two'},{title:'',description:''}]});assert(catalog.validateContract(value).some(i=>i.field==='cards'));
});
test('Explicit font-consent revocation survives returning from Content to Cards',()=>{
 const original={id:'c',layout:'cards',template:{id:'cards-no-image',version:1},title:'A plan',cards:[{id:'a',title:'Plan',description:'Agree on priorities.'},{id:'b',title:'Share',description:'Make work visible.'},{id:'c',title:'Review',description:'Learn from results.'}],cardTypography:{allowSmallerText:true,profile:'compact',baseSize:30}};
 const flat=migrateSlide(original,'split-no-image',catalog).slide;const result=applySlideEdit({slides:[flat]},'c',{template:'cards-no-image',allowSmallerText:false},catalog).deck.slides[0];assert.equal(result.cardTypography.allowSmallerText,false);assert.equal(result.cardTypography.profile,'auto');assert.deepEqual(result.cards,original.cards);
});
test('Continuation cannot break grouped numbers or drop optional text',()=>{
 const slide={id:'data',layout:'split',template:{id:'split-paragraphs-no-image',version:1},title:'A literal value',paragraphs:['The current total is 12 500 customers.']};const cut=slide.paragraphs[0].indexOf('500');
 assert.throws(()=>splitSlide(slide,{id:'data',parts:[{id:'data',fragments:[{unit:'paragraph:0',start:0,end:cut}]},{id:'more',fragments:[{unit:'paragraph:0',start:cut,end:slide.paragraphs[0].length}]}]},catalog),/grouped numeric/);
});
test('Recovery requests exclude arbitrary text, asset and typography edits',async()=>{
 const {assertLosslessRecoveryRequest}=await import('../recovery.mjs');for(const edit of [{setText:[]},{template:'cards-no-image',allowSmallerText:true},{image:null},{template:'cards-no-image',cardNumbers:false}])assert.throws(()=>assertLosslessRecoveryRequest({slides:[content]},{slides:[{id:content.id,edit}]},catalog),/Recovery cannot/);
 const result=assertLosslessRecoveryRequest({slides:[content]},{slides:[{id:content.id,edit:{template:'cards-no-image'}}]},catalog);assert.deepEqual(result.deck.slides[0].cards.map(c=>c.description),content.points);
});
test('An explicit photo addition/removal can accompany a supported projection',()=>{
 const photo=applySlideEdit({slides:[content]},content.id,{template:'cards-outline-3',image:{src:'assets/user/photo.webp',alt:'A supplied workspace.'}},catalog).deck.slides[0];assert.equal(photo.image,'assets/user/photo.webp');assert.deepEqual(photo.cards.map(c=>c.description),content.points);
 const plain=applySlideEdit({slides:[photo]},content.id,{template:'split-no-image',image:null},catalog).deck.slides[0];assert(!plain.image);assert.deepEqual(plain.points,content.points);assert.deepEqual(plain.paragraphs,content.paragraphs);
});
test('Measured partition candidates prefer nearby sentence ends over mid-sentence cuts',()=>{
 const body=Array.from({length:12},(_,i)=>`During review ${i+1}, record a decision and agree on the following step.`).join(' '),slide={id:'s',layout:'split',template:{id:'split-paragraphs-no-image',version:1},title:'Review',paragraphs:[body]};
 const groups=partitionBody(slide,3);for(const fragments of groups.slice(0,-1)){const end=fragments.at(-1).end;assert(body.slice(0,end).trimEnd().endsWith('.'));}assert.equal(groups.flatMap(g=>g.map(f=>body.slice(f.start,f.end))).join(''),body);
});
test('Documented generation verifier CLI completes on an edited project',async()=>{
 const {spawnSync}=await import('node:child_process'),os=await import('node:os'),path=await import('node:path'),{hash}=await import('../source.mjs');const root=await fs.mkdtemp(path.join(os.tmpdir(),'brite-verifier-test-'));
 try{await fs.cp(new URL('../../samples',import.meta.url),path.join(root,'samples'),{recursive:true});await fs.copyFile(new URL('../../catalog.js',import.meta.url),path.join(root,'catalog.js'));await fs.mkdir(path.join(root,'edits'));const deck='window.BRITE_PRESENTATION='+JSON.stringify({title:'Test',slides:[content]})+';';await fs.writeFile(path.join(root,'presentation.js'),deck);await fs.writeFile(path.join(root,'edits/base-presentation.js'),deck);await fs.writeFile(path.join(root,'edits/manifest.json'),JSON.stringify({schemaVersion:1,baseFileHash:hash(deck),revisions:[]}));
 const result=spawnSync(process.execPath,[new URL('../verify-generation.mjs',import.meta.url).pathname,'--project',root],{encoding:'utf8',timeout:10000});assert.equal(result.status,0,result.stderr);assert.equal(JSON.parse(result.stdout).valid,true);
 }finally{await fs.rm(root,{recursive:true});}
});
