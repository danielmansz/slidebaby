(() => {
  'use strict';
  const $=id=>document.getElementById(id);
  const node=(tag,className,text)=>{const n=document.createElement(tag);if(className)n.className=className;if(text!==undefined)n.textContent=text;return n;};
  const engine=window.BriteEngine,catalog=window.BriteCatalog;
  let language='en';
  try {language=new URL(location.href).searchParams.get('lang')||localStorage.getItem('brite.studio.ui-language')||'en';}catch(_){/* Local storage is optional. */}
  if(!['en','pl'].includes(language))language='en';
  let catalogPalette='light';
  try {catalogPalette=new URL(location.href).searchParams.get('templatePalette')||localStorage.getItem('brite.studio.template-palette')||'light';}catch(_){/* Catalogue preference is optional. */}
  if(!['light','dark'].includes(catalogPalette))catalogPalette='light';
  let deck=structuredClone(window.BRITE_PRESENTATION),generation=0,position=0,transition=false,toastTimer;
  let activeView=location.hash==='#templates'?'templates':'presentation',previewId=null;
  let templatePromptId=null,promptTrigger=null;
  let searchQuery='';
  const scrollPositions={presentation:0,templates:0},cards=new Map(),families=new Map();
  const state={ready:false,catalogReady:false,valid:false,empty:true,issues:[],measurements:[],pdfStatus:'pdfMissing',matchingExport:null};
  const t=(key,values)=>window.BriteI18n.t(key,language,values);
  const translatedIssue=entry=>window.BriteI18n.error(entry.message,language);
  const familyName=id=>catalog.families.find(family=>family.id===id)?.name[language]||t('invalidTitle');
  const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;

  function notify(key){clearTimeout(toastTimer);$('toast').textContent=t(key);$('toast').dataset.message=key;$('toast').hidden=false;toastTimer=setTimeout(()=>{$('toast').hidden=true;},6500);}
  function selectField(field){field.focus();field.select();}
  async function copy(text,{field,container,success='copied',onFallback}={}){
    try {if(!navigator.clipboard?.writeText)throw new Error('Clipboard unavailable');await navigator.clipboard.writeText(text);notify(success);return true;}
    catch(_){
      onFallback?.();
      const parent=container||field?.parentElement||$('pdf-notice');
      if(!field){
        let box=parent.querySelector('.manual-copy');
        if(!box){box=node('div','manual-copy');parent.append(box);}
        box.replaceChildren();
        field=node('textarea','prompt-field');field.readOnly=true;field.value=text;field.setAttribute('aria-label',t('promptLabel'));box.append(field);
      }
      let note=parent.querySelector('.copy-fallback');
      if(!note){note=node('p','copy-fallback');note.setAttribute('role','status');parent.append(note);}
      note.textContent=t('manualCopy');
      selectField(field);notify('manualCopy');return false;
    }
  }
  function resizeSlide(container){const slide=container.firstElementChild;if(slide?.classList.contains('slide')&&container.clientWidth>0){slide.style.transform=`scale(${container.clientWidth/1920})`;slide.style.transformOrigin='0 0';}}
  function resize(){
    const pageWidth=document.documentElement.clientWidth;
    document.documentElement.style.setProperty('--page-width',`${pageWidth}px`);
    const presenting=document.body.classList.contains('presenting');
    const width=presenting?Math.min(innerWidth,innerHeight*16/9):$('deck').clientWidth;
    for(const viewport of document.querySelectorAll('#deck .slide-viewport')){
      viewport.style.width=`${width}px`;viewport.style.height=`${width*9/16}px`;resizeSlide(viewport);
    }
    for(const card of cards.values())resizeSlide(card.stage);
    resizeSlide($('preview-slide'));
    for(const family of families.values()){
      if(family.track.clientWidth&&family.width!==pageWidth){family.width=pageWidth;goToTemplate(family,family.index,'instant');}
      updateFamily(family);
    }
  }
  function switchView(view,{focus=false,replace=true}={}){
    if(!['presentation','templates'].includes(view))return;
    if(activeView==='templates'&&view!=='templates')for(const family of families.values()){family.savedIndex=family.index;family.track.scrollTo({left:family.track.scrollLeft,behavior:'instant'});}
    scrollPositions[activeView]=scrollY;activeView=view;
    for(const name of ['presentation','templates']){
      $(`panel-${name}`).hidden=name!==view;
      $(`tab-${name}`).setAttribute('aria-selected',String(name===view));
      $(`tab-${name}`).tabIndex=name===view?0:-1;
    }
    if(replace){const url=new URL(location.href);url.hash=view;history.replaceState(null,'',url);}
    if(focus)$(`tab-${view}`).focus({preventScroll:true});
    requestAnimationFrame(()=>{resize();if(view==='templates')for(const family of families.values())goToTemplate(family,family.savedIndex||0,'instant');scrollTo(0,scrollPositions[view]);});
  }
  const templateItems=family=>[...family.track.children].filter(card=>!card.hidden);
  const templateDots=family=>[...family.dots.children].filter(button=>!button.hidden);
  function templateOffset(family,index){const card=templateItems(family)[index];return card?card.offsetLeft-parseFloat(getComputedStyle(family.track).paddingLeft):0;}
  function updateFamily(family){
    if(!family.track.clientWidth)return;
    const items=templateItems(family);
    if(!items.length)return;
    const index=items.reduce((nearest,_,i)=>Math.abs(family.track.scrollLeft-templateOffset(family,i))<Math.abs(family.track.scrollLeft-templateOffset(family,nearest))?i:nearest,0);
    family.index=index;
    const position=t('templatePosition',{current:index+1,total:items.length});
    if(family.position.textContent!==position)family.position.textContent=position;
    family.previous.disabled=index===0;
    family.next.disabled=index===items.length-1;
    family.previous.setAttribute('aria-label',`${t('previousTemplate')} · ${familyName(family.id)}`);
    family.next.setAttribute('aria-label',`${t('nextTemplate')} · ${familyName(family.id)}`);
    family.dots.setAttribute('aria-label',t('chooseTemplate',{family:familyName(family.id)}));
    templateDots(family).forEach((button,i)=>{
      const entry=catalog.entries.find(entry=>entry.id===items[i].dataset.templateId);
      button.setAttribute('aria-label',t('showTemplate',{number:i+1,total:items.length,name:entry.name[language]}));
      button.setAttribute('aria-current',String(i===index));
      items[i].classList.toggle('is-current',i===index);
    });
  }
  function goToTemplate(family,index,behavior=reduced()?'instant':'smooth'){
    if(!family.track.clientWidth)return;
    const target=Math.max(0,Math.min(index,templateItems(family).length-1));
    family.track.scrollTo({left:templateOffset(family,target),behavior});
    if(behavior==='instant')updateFamily(family);
  }
  function scrollFamily(family,direction){goToTemplate(family,family.index+direction);}
  function filterCatalog(){
    const wasSearching=!!searchQuery.trim(),next=$('template-search').value,searching=!!next.trim();
    const selected=new Map([...families.values()].map(family=>[family.id,templateItems(family)[family.index]?.dataset.templateId]));
    if(!wasSearching&&searching)for(const family of families.values())family.browseId=selected.get(family.id);
    searchQuery=next;
    const matching=new Set(catalog.search(searchQuery).map(entry=>entry.id));
    for(const refs of cards.values())refs.card.hidden=!matching.has(refs.entry.id);
    for(const family of families.values()){
      for(const button of family.dots.children)button.hidden=!matching.has(button.dataset.templateId);
      const items=templateItems(family);family.section.hidden=!items.length;family.controls.hidden=items.length<2;family.dots.hidden=items.length<2;
      const target=!searching&&wasSearching?family.browseId:selected.get(family.id);
      family.index=Math.max(0,items.findIndex(card=>card.dataset.templateId===target));family.savedIndex=family.index;
      goToTemplate(family,family.index,'instant');
    }
    $('clear-template-search').hidden=!next.length;
    $('catalog-empty').hidden=matching.size>0;
    $('template-search-status').textContent=t(searching?'searchResults':'searchAll',{count:matching.size,total:catalog.entries.length});
    requestAnimationFrame(resize);
  }
  function clearCatalogSearch(){$('template-search').value='';filterCatalog();$('template-search').focus({preventScroll:true});}
  function updatePaletteControl(){
    for(const button of document.querySelectorAll('[data-catalog-palette]'))button.setAttribute('aria-pressed',String(button.dataset.catalogPalette===catalogPalette));
  }
  function applyCatalogPalette(refs,palette,slide=refs.prepared?.slides[0]){
    if(!slide)return;
    engine.applyPalette(slide,palette);
    if(refs.entry.family==='cover'||slide.querySelector('.slide-background')){
      const sample=catalog.materialize(refs.entry.id,{palette}),frame=slide.querySelector('.cover-image'),img=frame?.querySelector('img');
      if(img&&sample.image){frame.dataset.imageSource=sample.image;img.src=window.BRITE_INLINE_ASSETS?.[sample.image]||sample.image;img.alt=sample.imageAlt||'';}
      const background=slide.querySelector('.slide-background'),backgroundImg=background?.querySelector('img');if(backgroundImg&&sample.background){background.dataset.imageSource=sample.background.src;backgroundImg.src=window.BRITE_INLINE_ASSETS?.[sample.background.src]||sample.background.src;backgroundImg.alt=sample.background.alt;}
    }
  }
  function setCatalogPalette(palette){
    if(!['light','dark'].includes(palette))return;
    catalogPalette=palette;
    try{localStorage.setItem('brite.studio.template-palette',palette);}catch(_){/* URL retains this choice. */}
    const url=new URL(location.href);url.searchParams.set('templatePalette',palette);history.replaceState(null,'',url);
    for(const refs of cards.values())if(refs.prepared?.valid)applyCatalogPalette(refs,palette);
    if(previewId&&cards.has(previewId))for(const slide of $('preview-slide').querySelectorAll('.slide'))applyCatalogPalette(cards.get(previewId),palette,slide);
    // Remove any clipboard fallback containing the preceding palette's prompt.
    $('preview-dialog').querySelectorAll('.manual-copy,.copy-fallback').forEach(node=>node.remove());
    updatePaletteControl();updatePromptModal();
  }
  function updatePromptModal(){
    if(!templatePromptId)return;
    const entry=cards.get(templatePromptId).entry;
    $('template-prompt-title').textContent=entry.name[language];
    $('template-prompt-description').textContent=entry.description[language];
    $('template-prompt-text').value=catalog.prompt(templatePromptId,language,catalogPalette);
  }
  function openTemplatePrompt(id,trigger){
    if(!cards.has(id))return;
    templatePromptId=id;promptTrigger=trigger||document.activeElement;updatePromptModal();
    $('template-prompt-area').querySelector('.copy-fallback')?.remove();
    if(!$('template-prompt-dialog').open)$('template-prompt-dialog').showModal();
  }
  async function copyTemplatePrompt(id){
    if(!cards.has(id))return;
    const ok=await copy(catalog.prompt(id,language,catalogPalette),{field:$('template-prompt-text'),container:$('template-prompt-area'),onFallback:()=>{if(!$('template-prompt-dialog').open||templatePromptId!==id)openTemplatePrompt(id,cards.get(id).button);}});
    if(ok)$('template-prompt-area').querySelector('.copy-fallback')?.remove();
  }
  function makeCatalog(){
    for(const definition of catalog.families){
      const {id}=definition;
      const section=node('section','family');section.dataset.family=id;section.setAttribute('aria-labelledby',`family-${id}`);
      const header=node('div','family-heading'),text=node('div'),title=node('h2');title.id=`family-${id}`;title.textContent=definition.name[language];
      const description=node('p');description.textContent=definition.description[language];text.append(title,description);
      const controls=node('div','family-controls'),previous=node('button','action','←'),next=node('button','action','→'),position=node('span','family-position');
      previous.type=next.type='button';position.setAttribute('aria-live','polite');
      const track=node('div','template-track');track.id=`track-${id}`;track.setAttribute('aria-labelledby',title.id);
      const dots=node('div','family-dots');dots.setAttribute('role','group');
      const entries=catalog.entries.filter(entry=>entry.family===id);
      entries.forEach(entry=>{const button=node('button','family-dot');button.type='button';button.dataset.templateId=entry.id;button.setAttribute('aria-controls',track.id);button.append(node('span','dot-mark'));button.addEventListener('click',()=>goToTemplate(family,templateDots(family).indexOf(button)));dots.append(button);});
      previous.setAttribute('aria-controls',track.id);next.setAttribute('aria-controls',track.id);controls.append(previous,position,next);controls.hidden=entries.length<2;header.append(text,controls);section.append(header,track,dots);$('catalog').append(section);
      const family={id,definition,section,controls,title,description,track,previous,next,position,dots,index:0,savedIndex:0,width:0,browseId:null};families.set(id,family);
      previous.addEventListener('click',()=>scrollFamily(family,-1));next.addEventListener('click',()=>scrollFamily(family,1));track.addEventListener('scroll',()=>updateFamily(family),{passive:true});
      track.addEventListener('focusin',event=>{const card=event.target.closest('.template-card');if(card&&event.target.matches(':focus-visible'))goToTemplate(family,templateItems(family).indexOf(card),'instant');});
      dots.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();const buttons=templateDots(family),current=buttons.indexOf(event.target);if(current<0)return;const index=Math.max(0,Math.min(event.key==='Home'?0:event.key==='End'?buttons.length-1:current+(event.key==='ArrowRight'?1:-1),buttons.length-1));buttons[index].focus({preventScroll:true});goToTemplate(family,index);});
    }
    for(const entry of catalog.entries){
      const card=node('article','template-card');card.dataset.templateId=entry.id;
      const stage=node('div','template-stage'),loading=node('p','preview-unavailable');loading.dataset.i18n='loading';stage.append(loading);
      const body=node('div','template-body'),row=node('div','template-name-row'),title=node('h3'),preview=node('button','text-action');preview.type='button';preview.dataset.i18n='preview';preview.disabled=true;
      row.append(title,preview);
      const description=node('p','template-description'),heading=node('div','prompt-heading'),actions=node('div','prompt-actions'),promptLink=node('button','text-action prompt-link'),button=node('button','action');button.type=promptLink.type='button';button.dataset.i18n='copyPrompt';button.disabled=true;
      promptLink.dataset.i18n='showPrompt';promptLink.setAttribute('aria-haspopup','dialog');promptLink.setAttribute('aria-controls','template-prompt-dialog');
      actions.append(promptLink,button);heading.append(actions);body.append(row,description,heading);card.append(stage,body);families.get(entry.family).track.append(card);
      const refs={entry,card,stage,body,title,description,preview,button,promptLink,prepared:null};cards.set(entry.id,refs);
      promptLink.addEventListener('click',()=>openTemplatePrompt(entry.id,promptLink));
      button.addEventListener('click',()=>copyTemplatePrompt(entry.id));preview.addEventListener('click',()=>openPreview(entry.id));
    }
  }
  async function prepareCatalog(){
    for(const refs of cards.values()){
      const slide=catalog.materialize(refs.entry.id,{palette:catalogPalette});slide.id=`preview-${refs.entry.id}`;
      const result=await engine.prepare({...catalog.metadata,...refs.entry.previewMetadata,title:'Brite sample',slides:[slide]});
      refs.prepared=result;
      if(result.valid){applyCatalogPalette(refs,catalogPalette,result.slides[0]);refs.stage.replaceChildren(result.slides[0]);refs.preview.disabled=false;refs.button.disabled=false;}
      else{refs.stage.replaceChildren(node('p','preview-unavailable',t('templateInvalid')));refs.stage.firstChild.dataset.i18n='templateInvalid';}
      resizeSlide(refs.stage);
    }
    state.catalogReady=true;resize();
  }
  function openPreview(id){
    const refs=cards.get(id);if(!refs?.prepared?.valid)return;
    previewId=id;$('preview-title').textContent=refs.entry.name[language];
    $('preview-slide').replaceChildren(refs.prepared.slides[0].cloneNode(true));
    $('preview-dialog').querySelectorAll('.manual-copy,.copy-fallback').forEach(node=>node.remove());
    $('preview-dialog').showModal();requestAnimationFrame(resize);
  }
  function show(index){
    const count=Array.isArray(deck?.slides)?deck.slides.length:0;
    position=Math.max(0,Math.min(index,count-1));
    document.querySelectorAll('#deck .slide-item').forEach((item,i)=>item.classList.toggle('active',i===position));
    $('position').textContent=`${count?position+1:0} / ${count}`;
    $('previous').disabled=position===0;$('next').disabled=position>=count-1;resize();
  }
  function updateDocumentText(){
    const slides=Array.isArray(deck?.slides)?deck.slides:[],count=slides.length;
    $('slide-count').textContent=String(count);$('presentation-title').textContent=deck?.title||t('untitled');
    const key=count===1?'slidesOne':language==='pl'&&count%10>=2&&count%10<=4&&!(count%100>=12&&count%100<=14)?'slidesFew':'slidesMany';
    $('document-summary').textContent=t(key,{count});
    document.querySelectorAll('#deck .slide-caption').forEach((caption,index)=>{caption.textContent=`${t('slideNumber',{number:index+1})} · ${familyName(slides[index].layout)}`;});
    $('export-status').textContent=t(state.pdfStatus);
    $('copy-export').hidden=state.empty||state.pdfStatus==='pdfReady';$('copy-export').textContent=t(state.valid?'copyPDFPrompt':'copyFix');
    $('status').replaceChildren();
    if(state.issues.length){
      $('status').append(node('p','',t('invalidNotice')));const list=node('ul');
      for(const entry of state.issues.slice(0,12)){
        const index=slides.findIndex(slide=>slide?.id===entry.slideId);
        const prefix=index>=0?t('slideNumber',{number:index+1}):t('myPresentation');
        list.append(node('li','',`${prefix}: ${translatedIssue(entry)}`));
      }
      $('status').append(list);
    }
    document.querySelectorAll('#deck .invalid-placeholder').forEach(placeholder=>{const issue=state.issues.find(item=>item.slideId===placeholder.dataset.slideId)||state.issues[0];placeholder.replaceChildren(node('h2','',t('invalidTitle')),node('p','',issue?translatedIssue(issue):t('invalidNotice')));});
    if(previewId)$('preview-title').textContent=cards.get(previewId).entry.name[language];
  }
  function renderChangelog(){
    const releaseNotes=window.SlidebabyChangelog;
    $('changelog-version').textContent=releaseNotes?.version?'v'+releaseNotes.version:'';
    const entries=$('changelog-entries');entries.replaceChildren();
    for(const release of releaseNotes?.entries||[]){
      const article=node('article','changelog-release'),heading=node('div','changelog-release-heading'),title=node('h3','',`v${release.version}`),date=node('time');
      date.dateTime=release.date;
      date.textContent=new Intl.DateTimeFormat(language==='pl'?'pl-PL':'en-GB',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(release.date+'T12:00:00Z'));
      heading.append(title,date);const changes=node('ul');
      for(const text of release.changes[language]||release.changes.en)changes.append(node('li','',text));
      article.append(heading,changes);entries.append(article);
    }
  }
  function localize(){
    document.documentElement.lang=language;$('language').value=language;document.title=t('appTitle');
    $('starter-prompt').value=t('starterPrompt');
    for(const element of document.querySelectorAll('[data-i18n]'))element.textContent=t(element.dataset.i18n);
    for(const element of document.querySelectorAll('[data-i18n-aria]'))element.setAttribute('aria-label',t(element.dataset.i18nAria));
    for(const element of document.querySelectorAll('[data-i18n-placeholder]'))element.setAttribute('placeholder',t(element.dataset.i18nPlaceholder));
    for(const refs of cards.values()){
      refs.title.textContent=refs.entry.name[language];refs.description.textContent=refs.entry.description[language];
      refs.preview.setAttribute('aria-label',`${t('preview')} · ${refs.entry.name[language]}`);refs.button.setAttribute('aria-label',`${t('copyPrompt')} · ${refs.entry.name[language]}`);
    }
    document.querySelectorAll('.copy-fallback').forEach(element=>element.textContent=t('manualCopy'));
    updatePaletteControl();updatePromptModal();renderChangelog();
    for(const family of families.values()){family.title.textContent=family.definition.name[language];family.description.textContent=family.definition.description[language];updateFamily(family);}
    if(!$('toast').hidden)$('toast').textContent=t($('toast').dataset.message);
    filterCatalog();updateDocumentText();renderSlideSuggestions();requestAnimationFrame(resize);
  }
  async function updateDownload(ticket){
    state.matchingExport=null;$('download').disabled=true;
    if(!state.valid){state.pdfStatus='pdfInvalid';return;}
    if(state.empty){state.pdfStatus='pdfMissing';return;}
    const entry=window.BRITE_EXPORT;
    if(!entry||!/^exports\/[\w./-]+\.pdf$/.test(entry.path)||entry.path.includes('..')){state.pdfStatus='pdfMissing';return;}
    const fingerprint=await engine.fingerprint(deck);if(ticket!==generation)return;
    if(entry.fingerprint!==fingerprint||entry.layoutVersion!==engine.layoutVersion){state.pdfStatus='pdfStale';return;}
    state.matchingExport=entry;state.pdfStatus='pdfReady';$('download').disabled=false;
  }
  function renderSlideSuggestions(){
    [...$('deck').children].forEach((item,index)=>{
      item.querySelector('.slide-suggestions')?.remove();
      const slide=deck.slides[index];if(!slide)return;
      const entry=catalog.entries.find(e=>e.id===slide.template?.id);
      const partner=entry?.pairedTemplate&&catalog.entries.find(e=>e.id===entry.pairedTemplate);
      const ideas=[];
      if(!slide.image&&!slide.images?.length&&partner?.contract?.image?.required&&!partner.contract.image.collection)ideas.push({type:'Photo',template:partner.id});
      else if(slide.image||slide.images?.length)ideas.push({type:'Image'});
      if(slide.layout==='cards'&&slide.cards?.length<4)ideas.push({type:'Card'});
      if(ideas.length<2&&!catalog.resolveChrome(slide,deck).brand)ideas.push({type:'Brand'});
      if(!ideas.length)return;
      const box=node('aside','slide-suggestions');box.setAttribute('aria-label',t('slideIdeas'));
      box.append(node('p','suggestions-label',t('slideIdeas')));const row=node('div','suggestion-grid');
      ideas.slice(0,2).forEach(idea=>{
        const card=node('div','suggestion-card');card.append(node('h3','',t('idea'+idea.type+'Title')),node('p','',t('idea'+idea.type+'Text')));
        const button=node('button','text-action',t('copyEditPrompt'));button.type='button';
        button.addEventListener('click',()=>{
          const prompt=[t('editPromptStart',{number:index+1,id:slide.id}),t('idea'+idea.type+'Title')+'.',t('idea'+idea.type+'Text'),idea.template?t('editPhotoRecipe',{id:idea.template}):'',t('editPromptRules')].filter(Boolean).join(' ');
          copy(prompt,{container:card});
        });card.append(button);
        // Stock is a decorative option, never a substitute for a required figure or speaker portrait.
        const photoRecipe=idea.template&&catalog.entries.find(e=>e.id===idea.template);
        if(idea.type==='Photo'&&photoRecipe?.contract?.image?.purpose?.includes('decorative')){
          const note=node('p','stock-photo-note',t('stockPhotoNote')),stock=node('button','text-action',t('copyStockPhotoPrompt'));stock.type='button';stock.dataset.copyStockPhoto='';stock.setAttribute('aria-label',t('copyStockPhotoAria',{number:index+1}));
          stock.addEventListener('click',()=>{const topic=(Array.isArray(slide.title)?slide.title.join(' '):slide.title)||t('stockPhotoTopic');const prompt=[t('editPromptStart',{number:index+1,id:slide.id}),t('stockPhotoPrompt',{topic}),t('editPhotoRecipe',{id:idea.template}),t('stockPhotoRules')].join(' ');copy(prompt,{container:card,success:'stockRequestCopied'});});
          card.append(note,stock);
        }
        row.append(card);
      });box.append(row);item.append(box);
    });
  }
  async function renderPresentation(){
    const ticket=++generation;state.ready=false;$('present').disabled=true;$('download').disabled=true;state.matchingExport=null;
    const result=await engine.prepare(deck);if(ticket!==generation)return;
    Object.assign(state,{valid:result.valid,empty:result.empty,issues:result.issues,measurements:result.measurements});
    $('empty-state').hidden=!state.empty;$('presentation-content').hidden=state.empty;$('deck').replaceChildren();
    const slides=Array.isArray(deck?.slides)?deck.slides:[];
    if(slides.length<=engine.limits.slides)slides.forEach((data,index)=>{
      const item=node('section','slide-item'),caption=node('p','slide-caption'),viewport=node('div','slide-viewport');
      const failed=state.issues.some(issue=>issue.slideId==='deck'||issue.slideId===data?.id);
      if(!failed&&result.slides[index])viewport.append(result.slides[index]);
      else{const placeholder=node('div','invalid-placeholder');placeholder.dataset.slideId=data?.id||'';viewport.append(placeholder);}
      item.append(caption,viewport);$('deck').append(item);
    });
    renderSlideSuggestions();
    await updateDownload(ticket);if(ticket!==generation)return;
    $('present').disabled=!state.valid||state.empty;state.ready=true;updateDocumentText();show(position);
    window.dispatchEvent(new CustomEvent('deck-ready',{detail:{valid:state.valid,empty:state.empty}}));
    return window.Brite.report();
  }
  async function enterPresentation(){
    if(!state.ready||!state.valid||state.empty||transition)return;
    transition=true;switchView('presentation');document.body.classList.add('presenting');document.querySelector('.presentation-controls').hidden=false;resize();
    try {await document.documentElement.requestFullscreen?.();}catch(_){/* Windowed presentation remains available. */}
    show(position);$('deck').focus({preventScroll:true});transition=false;
  }
  async function leavePresentation(){
    if(transition)return;transition=true;document.body.classList.remove('presenting');document.querySelector('.presentation-controls').hidden=true;
    if(document.fullscreenElement)await document.exitFullscreen();resize();$('present').focus({preventScroll:true});transition=false;
  }

  for(const name of ['presentation','templates'])$(`tab-${name}`).addEventListener('click',()=>switchView(name));
  document.querySelector('.main-tabs').addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();const view=event.key==='Home'?'presentation':event.key==='End'?'templates':activeView==='presentation'?'templates':'presentation';switchView(view,{focus:true});});
  document.querySelectorAll('[data-open-templates]').forEach(button=>button.addEventListener('click',()=>switchView('templates',{focus:true})));
  document.querySelector('.app-brand').addEventListener('click',event=>{event.preventDefault();switchView('presentation',{focus:true});});
  window.addEventListener('hashchange',()=>switchView(location.hash==='#templates'?'templates':'presentation',{replace:false}));
  for(const button of document.querySelectorAll('[data-catalog-palette]'))button.addEventListener('click',()=>setCatalogPalette(button.dataset.catalogPalette));
  $('template-search').addEventListener('input',filterCatalog);
  $('template-search').addEventListener('keydown',event=>{if(event.key==='Escape'&&$('template-search').value){event.preventDefault();event.stopPropagation();clearCatalogSearch();}});
  $('clear-template-search').addEventListener('click',clearCatalogSearch);
  $('reset-template-search').addEventListener('click',clearCatalogSearch);
  $('language').addEventListener('change',()=>{
    language=$('language').value;
    try{localStorage.setItem('brite.studio.ui-language',language);}catch(_){/* URL still preserves the choice. */}
    const url=new URL(location.href);url.searchParams.set('lang',language);history.replaceState(null,'',url);localize();
  });
  $('present').addEventListener('click',enterPresentation);$('leave').addEventListener('click',leavePresentation);
  $('previous').addEventListener('click',()=>show(position-1));$('next').addEventListener('click',()=>show(position+1));
  $('download').addEventListener('click',()=>{if(!state.valid||!state.matchingExport)return;const link=node('a');link.href=window.BRITE_INLINE_ASSETS?.[state.matchingExport.path]||state.matchingExport.path;link.download=state.matchingExport.filename;document.body.append(link);link.click();link.remove();});
  $('copy-export').addEventListener('click',()=>{const details=state.valid?'':`\n\n${state.issues.map(issue=>`${issue.componentId}: ${translatedIssue(issue)}`).join('\n')}`;copy(t(state.valid?'pdfInstructions':'fixInstructions')+details,{container:$('pdf-notice'),success:'pdfCopied'});});
  $('open-palette-help').addEventListener('click',()=>$('palette-help-dialog').showModal());
  $('close-palette-help').addEventListener('click',()=>$('palette-help-dialog').close());
  $('palette-help-dialog').addEventListener('close',()=>$('open-palette-help').focus({preventScroll:true}));
  $('open-changelog').addEventListener('click',()=>$('changelog-dialog').showModal());
  $('close-changelog').addEventListener('click',()=>$('changelog-dialog').close());
  $('changelog-dialog').addEventListener('close',()=>$('open-changelog').focus({preventScroll:true}));
  $('close-preview').addEventListener('click',()=>$('preview-dialog').close());
  $('close-template-prompt').addEventListener('click',()=>$('template-prompt-dialog').close());
  $('copy-template-prompt').addEventListener('click',()=>{if(templatePromptId)copyTemplatePrompt(templatePromptId);});
  $('template-prompt-dialog').addEventListener('close',()=>{templatePromptId=null;clearTimeout(toastTimer);$('toast').hidden=true;promptTrigger?.focus({preventScroll:true});promptTrigger=null;});
  $('create-from-content').addEventListener('click',()=>{$('starter-prompt-area').querySelector('.copy-fallback')?.remove();$('content-dialog').showModal();});
  $('close-content').addEventListener('click',()=>$('content-dialog').close());
  $('content-dialog').addEventListener('close',()=>{clearTimeout(toastTimer);$('toast').hidden=true;});
  $('copy-viewing-prompt').addEventListener('click',()=>copy(t('viewingLivePrompt'),{container:$('viewing-prompt-area'),success:'viewingRequestCopied'}));
  $('copy-starter').addEventListener('click',async()=>{if(await copy(t('starterPrompt'),{field:$('starter-prompt'),container:$('starter-prompt-area')}))$('starter-prompt-area').querySelector('.copy-fallback')?.remove();});
  $('preview-dialog').addEventListener('close',()=>{const refs=cards.get(previewId);previewId=null;refs?.preview.focus({preventScroll:true});});
  $('preview-copy').addEventListener('click',()=>{if(previewId)copy(catalog.prompt(previewId,language,catalogPalette),{container:$('preview-dialog').querySelector('.dialog-footer')});});
  document.addEventListener('keydown',event=>{
    if(!document.body.classList.contains('presenting')||event.target.matches('select,input,textarea'))return;
    if(event.key==='Escape'){leavePresentation();return;}
    if(event.key===' '&&event.target.closest('button'))return;
    if(['ArrowRight','PageDown',' '].includes(event.key)){event.preventDefault();show(position+1);}
    if(['ArrowLeft','PageUp'].includes(event.key)){event.preventDefault();show(position-1);}
    if(event.key==='Home')show(0);if(event.key==='End')show(deck.slides.length-1);
  });
  document.addEventListener('fullscreenchange',()=>{if(!document.fullscreenElement&&!transition&&document.body.classList.contains('presenting')){document.body.classList.remove('presenting');document.querySelector('.presentation-controls').hidden=true;resize();}});
  window.addEventListener('resize',resize);
  window.Brite={
    layoutVersion:engine.layoutVersion,
    get ready(){return state.ready;},get catalogReady(){return state.catalogReady;},get valid(){return state.valid;},
    getDeck:()=>structuredClone(deck),fingerprint:()=>engine.fingerprint(deck),
    report:()=>({ready:state.ready,catalogReady:state.catalogReady,valid:state.valid,empty:state.empty,issues:structuredClone(state.issues),measurements:structuredClone(state.measurements),pdfStatus:state.pdfStatus}),
    catalogReport:()=>[...cards.values()].map(refs=>({id:refs.entry.id,valid:refs.prepared?.valid,issues:structuredClone(refs.prepared?.issues||[]),measurements:structuredClone(refs.prepared?.measurements||[])})),
    async replaceDeck(value){deck=structuredClone(value);position=0;return renderPresentation();},
    async updateSlide(id,patch){const slide=deck.slides.find(slide=>slide.id===id);if(!slide)throw new Error(`Unknown slide: ${id}`);catalog.merge(slide,patch);return renderPresentation();},
    async appendTemplate(id,patch={}){const slide=catalog.instantiate(id,patch);slide.id=`${id}-${crypto.randomUUID()}`;const issues=catalog.validateContract(slide);if(issues.length)throw new Error(issues.map(issue=>issue.message).join(' '));deck.slides.push(slide);return renderPresentation();},
    async resetOverrides(id,group='title',keys){const slide=deck.slides.find(slide=>slide.id===id);if(!slide)throw new Error(`Unknown slide: ${id}`);if(slide.overrides?.[group]){if(keys)keys.forEach(key=>delete slide.overrides[group][key]);else delete slide.overrides[group];}return renderPresentation();},
    render:renderPresentation,show,switchView
  };
  makeCatalog();localize();switchView(activeView,{replace:false});
  renderPresentation().then(prepareCatalog).catch(error=>{console.error(error);});
})();
