/* Shared slide rendering and measured validation; no application state. */
(() => {
  'use strict';
  const LAYOUT_VERSION = 'brite-studio-24';
  const VISUAL_TEMPLATE = Object.freeze({id:'brite',version:'1.0.0'});
  const validDesign = deck => deck?.visualTemplate===undefined||(deck.visualTemplate&&typeof deck.visualTemplate==='object'&&!Array.isArray(deck.visualTemplate)&&Object.keys(deck.visualTemplate).every(k=>['id','version'].includes(k))&&deck.visualTemplate.id===VISUAL_TEMPLATE.id&&deck.visualTemplate.version===VISUAL_TEMPLATE.version);
  const LIMITS = Object.freeze({fieldCharacters:4000, deckCharacters:100000, slides:60, listItems:24, paragraphs:12, explicitTitleLines:8});
  const element = (tag, className, text) => {const node=document.createElement(tag); if(className) node.className=className; if(text!==undefined) node.textContent=text; return node;};
  const resolveAsset = source => window.BRITE_INLINE_ASSETS?.[source] || source;
  const monochromeBrands = new Set(["assets/figma/cover-brand.svg","assets/images/brite-logo-cards.svg", "assets/images/brite-logo-problem.svg", "assets/images/brite-logo.svg", "assets/figma/brite-shared.svg", "assets/figma/roadmap-brand.svg", "assets/figma/figure-brand.svg", "assets/figma/cards-brand.svg", "assets/figma/process-brand.svg", "assets/figma/table-brand.svg", "assets/figma/comparison-brand.svg"]);
  const monochromeRules = new Set(["assets/figma/agenda-row-rule.svg", "assets/figma/roadmap-filled-rule.svg", "assets/figma/process-outline-rule.svg", "assets/figma/roadmap-outline-rule.svg", "assets/figma/comparison-plain-rule.svg", "assets/figma/roadmap-outline-first-rule.svg", "assets/figma/process-plain-rule.svg", "assets/figma/roadmap-plain-rule.svg", "assets/figma/roadmap-filled-first-rule.svg", "assets/figma/agenda-center-rule.svg", "assets/figma/process-filled-rule.svg", "assets/figma/comparison-outline-rule.svg", "assets/figma/comparison-filled-rule.svg"]);
  function applyPalette(slide,palette='light'){
    if(!['light','dark'].includes(palette))throw new Error('Slide palette must be light or dark.');
    slide.dataset.palette=palette;
    for(const img of slide.querySelectorAll('img[data-palette-source]')){const source=img.dataset.paletteSource;img.src=resolveAsset(palette==='dark'&&monochromeRules.has(source)?source.replace(/\.svg$/,'-dark.svg'):source);}
    for(const img of slide.querySelectorAll('.slide-logo img[data-brand-source]')){
      const source=img.dataset.brandSource;
      img.src=resolveAsset(palette==='dark'&&monochromeBrands.has(source)?source.replace(/\.svg$/,'-dark.svg'):source);
    }
  }
  const hasText = value => typeof value === 'string' && value.trim().length > 0;
  const issue = (slideId, componentId, message) => ({slideId,componentId,message});
  const component = (node,id) => {node.dataset.componentId=id; return node;};
  const badge = number => element('span','number-badge',String(number));
  function validateData(deck) {
    const issues = [];
    if (!deck || !Array.isArray(deck.slides) || !deck.slides.length) return [issue('deck', 'content', 'Provide at least one slide.')];
    if (deck.slides.length > LIMITS.slides) return [issue('deck', 'content', `This preview supports up to ${LIMITS.slides} slides. Split the deck into smaller files; your source content is retained.`)];
    let total = 0;
    function visit(value, path, slideId) {
      if (typeof value === 'string') {
        total += value.length;
        if (value.length > LIMITS.fieldCharacters) issues.push(issue(slideId, path, `This field exceeds the ${LIMITS.fieldCharacters}-character preview limit. Split the source material before rendering.`));
      } else if (Array.isArray(value)) value.forEach((v, i) => visit(v, `${path}[${i}]`, slideId));
      else if (value && typeof value === 'object') Object.entries(value).forEach(([key, v]) => visit(v, `${path}.${key}`, slideId));
    }
    visit(deck, 'deck', 'deck');
    if (total > LIMITS.deckCharacters) issues.push(issue('deck', 'content', `This preview supports ${LIMITS.deckCharacters} source characters. Split the input into smaller decks.`));
    issues.push(...window.BriteCatalog.validateChrome(deck.chrome).map(entry=>issue('deck',entry.field,entry.message)));
    const ids = new Set();
    deck.slides.forEach((data, index) => {
      const id = data?.id || `slide-${index + 1}`;
      if (!data || typeof data !== 'object') { issues.push(issue(id, 'content', 'Slide data must be an object.')); return; }
      if (!hasText(data.id) || ids.has(data.id)) issues.push(issue(id, 'id', 'Use a nonempty, unique slide ID.'));
      ids.add(data.id);
      issues.push(...window.BriteCatalog.validateContract(data).map(entry=>issue(id,entry.field,entry.message)));
      if(Array.isArray(data.items))for(const item of data.items)if(item?.target&&!deck.slides.some(slide=>slide.id===item.target))issues.push(issue(id,'items','An agenda reference points to a missing slide.'));
      const validTitle = hasText(data.title) || (Array.isArray(data.title) && data.title.length && data.title.every(hasText));
      if (!['gallery','quote'].includes(data.layout)&&!validTitle) issues.push(issue(id, 'title', 'Provide a title as text or nonempty text lines.'));
      if (Array.isArray(data.title) && data.title.length > LIMITS.explicitTitleLines) issues.push(issue(id, 'title', 'Too many explicit title lines. Split the heading or supporting content.'));
      if (data.description != null && typeof data.description !== 'string') issues.push(issue(id, 'description', 'The optional description must be text or null.'));
      for (const field of ['paragraphs', 'points']) {
        if (data[field] != null && (!Array.isArray(data[field]) || !data[field].every(hasText))) issues.push(issue(id, field, 'Provide an array of nonempty text items.'));
        if (Array.isArray(data[field]) && data[field].length > (field === 'points' ? LIMITS.listItems : LIMITS.paragraphs)) issues.push(issue(id, field, 'Too many content items for this composition. Split them across slides.'));
      }
      const overrides = data.overrides || {};
      if (typeof overrides !== 'object' || Array.isArray(overrides)) { issues.push(issue(id, 'overrides', 'Overrides must be an object.')); return; }
      for (const key of Object.keys(overrides)) if (!['title', 'group'].includes(key)) issues.push(issue(id, key, 'Only title and group overrides are supported in this version.'));
      const title = overrides.title || {};
      if (typeof title !== 'object' || Array.isArray(title)) { issues.push(issue(id, 'title', 'Title overrides must be an object.')); return; }
      const rules = {fontSize: [32, 220], width: [160, window.BriteCatalog.contractFor(data)?.regions.titleWidth||1389], lineHeight: [.8, 1.6], targetLines: [1, 8]};
      for (const [key, value] of Object.entries(title)) {
        if (key === 'align') { if (!['left', 'center', 'right'].includes(value)) issues.push(issue(id, 'title', 'Title alignment must be left, center, or right.')); continue; }
        if (key === 'textTransform') { if (data.layout !== 'cover' || !['none','uppercase'].includes(value)) issues.push(issue(id, 'title', 'Cover textTransform must be uppercase or none.')); continue; }
        const range = rules[key];
        if (!range || typeof value !== 'number' || !Number.isFinite(value) || value < range[0] || value > range[1] || (key === 'targetLines' && !Number.isInteger(value))) issues.push(issue(id, 'title', `Invalid ${key} override${range ? `; supported range: ${range.join('–')}` : ''}.`));
      }
      const group = overrides.group || {};
      if(data.layout==='figure'&&Object.keys(group).length)issues.push(issue(id,'group','Figure placement is automatic between the introduction and footer. Use title alignment to align the complete composition horizontally.'));
      if (typeof group !== 'object' || Array.isArray(group)) { issues.push(issue(id, 'group', 'Group overrides must be an object.')); return; }
      for (const key of Object.keys(group)) if (!['verticalAlign', 'offsetY'].includes(key)) issues.push(issue(id, 'group', `Unsupported group override: ${key}.`));
      if (group.verticalAlign != null && !['top', 'center', 'bottom'].includes(group.verticalAlign)) issues.push(issue(id, 'group', 'Group alignment must be top, center, or bottom.'));
      if (group.offsetY != null && (typeof group.offsetY !== 'number' || !Number.isFinite(group.offsetY) || Math.abs(group.offsetY) > 300)) issues.push(issue(id, 'group', 'Vertical offset must be between -300 and 300 design pixels.'));
    });
    return issues;
  }

  function image(source, alt, className) {
    const wrapper = element('div', `slide-image ${className}`);
    wrapper.dataset.imageSource=source;
    if(/^assets\/user\//.test(source))wrapper.classList.add('source-image');
    const img = element('img');
    img.src = resolveAsset(source);
    img.alt = alt || '';
    img.draggable = false;
    wrapper.append(img);
    return wrapper;
  }
  function heading(data, className) {
    const node = component(element('h2', className), `${data.id}.title`);
    if (Array.isArray(data.title)) data.title.forEach(line => node.append(element('span', 'title-line', line)));
    else node.textContent = data.title;
    const settings = data.overrides?.title || {};
    if (settings.fontSize) node.style.fontSize = `${settings.fontSize}px`;
    if (settings.width) node.style.width = `${settings.width}px`;
    if (settings.lineHeight) node.style.lineHeight = String(settings.lineHeight);
    if (settings.align) node.style.textAlign = settings.align;
    if (settings.textTransform) node.style.textTransform = settings.textTransform;
    return node;
  }
  function addCommon(slide, data, deck, index) {
    const settings=window.BriteCatalog.resolveChrome(data,deck);
    const header=element('header','slide-header');
    if(settings.brand){
      const brand=component(element('div',settings.brand.kind==='image'?'slide-logo':'brand-text'),`${data.id}.brand`);
      if(settings.brand.kind==='image'){const img=element('img');img.dataset.brandSource=settings.brand.src;img.src=resolveAsset(settings.brand.src);img.alt=settings.brand.alt||'Brand logo';brand.append(img);}else brand.textContent=settings.brand.text;
      header.append(brand);
    }
    if(hasText(settings.section))header.append(component(element('p','section-label',settings.section),`${data.id}.section`));
    if(header.children.length)slide.append(header);
    const footer=component(element('footer','slide-footer'),`${data.id}.footer`);
    if(hasText(settings.footerLeft))footer.append(element('span','deck-name',settings.footerLeft));
    if(settings.pageNumbers)footer.append(element('span','page-number',`${index+1}/${deck.slides.length}`));
    if(hasText(settings.footerRight))footer.append(element('span','date',settings.footerRight));
    if(footer.children.length)slide.append(footer);
  }
  function buildSlide(data, deck, index) {
    const slide = element('article', `slide ${data.layout}${hasText(data.image)?' has-image':' no-image'}`);
    slide.dataset.slideId = data.id;
    if(data.layoutState)slide.classList.add('projected-content');
    if(data.template?.id)slide.dataset.templateId=data.template.id;
    slide.lang = deck.language || 'en';
    if(data.background)slide.append(component(image(data.background.src,data.background.alt,'slide-background'),`${data.id}.background`));
    slide.setAttribute('aria-label', `${index + 1}: ${Array.isArray(data.title) ? data.title.join(' ') : (data.title||data.quote||data.section||'Gallery')}`);
    if(data.layout==='table'){
      const matrix=window.BriteCatalog.contractFor(data).tableStyle==='matrix';if(matrix)slide.classList.add('table-matrix');
      const content=component(element('div','table-content'),`${data.id}.group`),intro=component(element('div','table-intro'),`${data.id}.intro`);intro.append(heading(data,'slide-title'));
      if(hasText(data.description))intro.append(component(element('p','table-description',data.description),`${data.id}.description`));content.append(intro);
      const section=component(element('div','table-section'),`${data.id}.table-section`),table=component(element('table','data-table'),`${data.id}.table`),cols=element('colgroup'),count=data.table.headers.length,widths=matrix?[580,...Array(count-1).fill(1260/(count-1))]:count===4?[740,360,360,380]:[740,...Array(count-1).fill(1100/(count-1))];
      table.setAttribute('aria-label',Array.isArray(data.title)?data.title.join(' '):data.title);
      for(const width of widths){const col=element('col');col.style.width=`${width}px`;cols.append(col);}table.append(cols);
      const cell=(text,col,head,row)=>{const node=component(element(head?'th':'td','table-cell'),`${data.id}.table.${row===0?'headers['+col+']':'rows['+(row-1)+']['+col+']'}`);if(head)node.scope=row===0?'col':'row';node.style.textAlign=data.table.alignments?.[col]||(col===0?'left':'center');node.append(element('p','table-cell-text',text));return node;};
      const thead=element('thead'),tr=element('tr');data.table.headers.forEach((text,i)=>tr.append(cell(text,i,true,0)));thead.append(tr);table.append(thead);
      const tbody=element('tbody');data.table.rows.forEach((values,row)=>{const tr=element('tr');values.forEach((text,col)=>tr.append(cell(text,col,col===0,row+1)));tbody.append(tr);});table.append(tbody);section.append(table);
      if(hasText(data.caption))section.append(component(element('p','table-caption',data.caption),`${data.id}.caption`));content.append(section);slide.append(content);
    } else if(data.layout==='gallery'){
      const grid=component(element('div','gallery-grid'),`${data.id}.group`);grid.style.setProperty('--gallery-count',data.images.length);
      for(const [i,item] of data.images.entries()){const frame=component(element('div','gallery-image'),`${data.id}.image-${i+1}`),img=element('img');img.src=resolveAsset(item.src);img.alt=item.alt;img.draggable=false;img.style.objectFit=item.fit||'cover';frame.append(img);grid.append(frame);}slide.append(grid);
    } else if(data.layout==='metrics'){
      const contract=window.BriteCatalog.contractFor(data);slide.classList.add(`metrics-count-${data.metrics.length}`);if(contract.metricEmphasis)slide.classList.add('metrics-emphasis');
      const content=component(element('div','metrics-content'),`${data.id}.group`),intro=component(element('div','metrics-intro'),`${data.id}.intro`);intro.append(heading(data,'slide-title'));
      if(hasText(data.description))intro.append(component(element('p','metrics-description',data.description),`${data.id}.description`));content.append(intro);
      const grid=component(element('div','metrics-grid'),`${data.id}.metrics`);grid.style.setProperty('--metric-count',data.metrics.length);
      data.metrics.forEach((m,i)=>{const item=component(element('section','metric-item'),`${data.id}.metric-${i+1}`),head=element('div','metric-head');head.append(element('p','metric-value',m.value),element('h3','metric-label',m.label));item.append(head);if(hasText(m.description))item.append(element('p','metric-description',m.description));grid.append(item);});content.append(grid);slide.append(content);
    } else if(data.layout==='quote'){
      const style=window.BriteCatalog.contractFor(data).quoteStyle||'centered';slide.classList.add(`quote-${style}`);
      if(hasText(data.image)&&style==='portrait')slide.append(image(data.image,data.imageAlt,'quote-portrait-image'));
      const content=component(element('div','quote-content'),`${data.id}.group`),quotation=component(element('blockquote','quote-text'),`${data.id}.quote`);quotation.append(element('p','',data.quote));content.append(quotation);
      if(hasText(data.author)||hasText(data.image)&&style==='avatar'){
        const attribution=component(element('div','quote-attribution'),`${data.id}.attribution`);
        if(hasText(data.image)&&style==='avatar'){const frame=element('div','quote-avatar-image'),img=element('img');img.src=resolveAsset(data.image);img.alt=data.imageAlt;frame.append(img);attribution.append(frame);}
        if(hasText(data.author)){const author=element('div','quote-author');author.append(element('p','quote-author-name',data.author));if(hasText(data.authorRole))author.append(element('p','quote-author-role',data.authorRole));attribution.append(author);}content.append(attribution);
      }slide.append(content);
    } else if (data.layout === 'cover') {
      if(hasText(data.image))slide.append(image(data.image, data.imageAlt, 'cover-image'));
      const copy = component(element('div', 'cover-copy'), `${data.id}.group`);
      copy.append(heading(data, 'cover-title'));
      if (hasText(data.description)) copy.append(component(element('p', 'cover-description', data.description), `${data.id}.description`));
      slide.append(copy);
    } else if (data.layout === 'split') {
      if(hasText(data.image))slide.append(image(data.image, data.imageAlt, 'split-image'));
      const copy = component(element('div', 'split-copy'), `${data.id}.group`);
      copy.append(heading(data, 'slide-title'));
      if (data.paragraphs?.length) {
        const paragraphs = component(element('div', 'paragraphs'), `${data.id}.paragraphs`);
        data.paragraphs.forEach(text => paragraphs.append(element('p', '', text)));
        copy.append(paragraphs);
      }
      if (data.points?.length) {
        const points = component(element('ol', 'number-list'), `${data.id}.points`);
        data.points.forEach((text, index) => { const li = element('li'); li.append(badge(index + 1), element('span', 'point-text', text)); points.append(li); });
        copy.append(points);
      }
      slide.append(copy);
    } else if(data.layout==='cards') {
      setCardTypography(slide,data,data.cardTypography?.profile==='compact');
      const style=window.BriteCatalog.contractFor(data).cardStyle||'filled';slide.classList.add(`cards-${style}`,`cards-count-${data.cards.length}`);if(data.cardNumbers===false)slide.classList.add('cards-without-numbers');
      if(hasText(data.image))slide.append(image(data.image, data.imageAlt, style==='outline'?'cards-side-image':'cards-background'));
      const content = component(element('div', 'cards-content'), `${data.id}.group`);
      const intro = component(element('div', 'cards-intro'), `${data.id}.intro`);
      intro.append(heading(data, 'slide-title'));
      if (hasText(data.description)) intro.append(component(element('p', 'cards-description', data.description), `${data.id}.description`));
      const grid = component(element('div', 'cards-grid'), `${data.id}.cards`);
      data.cards.forEach((cardData, index) => {
        const card = component(element('section', 'feature-card'), `${data.id}.card-${cardData.id||index+1}`);
        card.dataset.cardId=cardData.id||`${data.id}-card-${index+1}`;
        const header = element('header');
        if(data.cardNumbers!==false)header.append(badge(index+1));if(hasText(cardData.title))header.append(element('h3','',cardData.title));
        if(header.childElementCount)card.append(header);if(hasText(cardData.description))card.append(element('p','',cardData.description));
        grid.append(card);
      });
      content.append(intro, grid);
      slide.append(content);
    } else if(data.layout==='summary'){
      if(hasText(data.image))slide.append(image(data.image,data.imageAlt,'structured-side-image'));
      const style=window.BriteCatalog.contractFor(data).summaryStyle||'outline';slide.classList.add(`summary-${style}`);
      const content=component(element('div','summary-content'),`${data.id}.group`),intro=component(element('div','summary-intro'),`${data.id}.intro`);intro.append(heading(data,'slide-title'));
      if(hasText(data.description))intro.append(component(element('p','summary-description',data.description),`${data.id}.description`));
      const takeaway=component(element('div','summary-takeaway'),`${data.id}.takeaway-group`);
      if(hasText(data.takeawayLabel))takeaway.append(component(element('p','summary-takeaway-label',data.takeawayLabel),`${data.id}.takeawayLabel`));
      takeaway.append(component(element('h3','summary-takeaway-text',data.takeaway),`${data.id}.takeaway`));
      if(hasText(data.takeawayDescription))takeaway.append(component(element('p','summary-takeaway-description',data.takeawayDescription),`${data.id}.takeawayDescription`));content.append(intro,takeaway);slide.append(content);
      const actions=component(element('ol','summary-actions'),`${data.id}.actions`);
      data.actions.forEach((action,i)=>{const panel=component(element('li','summary-action'),`${data.id}.action-${i+1}`),number=element('div','summary-badge');number.setAttribute('aria-hidden','true');number.append(element('span','',String(i+1)));
        const copy=component(element('div','summary-action-copy'),`${data.id}.action-${i+1}.copy`);copy.append(component(element('h3','summary-action-title',action.title),`${data.id}.action-${i+1}.title`));if(hasText(action.description))copy.append(component(element('p','summary-action-description',action.description),`${data.id}.action-${i+1}.description`));panel.append(number,copy);actions.append(panel);
      });slide.append(actions);
    } else if(data.layout==='roadmap'){
      if(hasText(data.image))slide.append(image(data.image,data.imageAlt,'structured-side-image'));
      const style=window.BriteCatalog.contractFor(data).roadmapStyle||'outline';slide.classList.add(`roadmap-${style}`);
      const content=component(element('div','roadmap-content'),`${data.id}.group`),intro=component(element('div','roadmap-intro'),`${data.id}.intro`);intro.append(heading(data,'slide-title'));
      if(hasText(data.description))intro.append(component(element('p','roadmap-description',data.description),`${data.id}.description`));
      const grid=component(element('ol','roadmap-grid'),`${data.id}.milestones`);grid.style.setProperty('--milestone-count',data.milestones.length);
      data.milestones.forEach((milestone,i)=>{const panel=component(element('li','roadmap-milestone'),`${data.id}.milestone-${i+1}`),timed=hasText(milestone.period)||hasText(milestone.year);
        if(timed){const time=component(element('div','roadmap-time'),`${data.id}.milestone-${i+1}.time`);if(hasText(milestone.period))time.append(component(element('p','roadmap-period',milestone.period),`${data.id}.milestone-${i+1}.period`));if(hasText(milestone.year))time.append(component(element('p','roadmap-year',milestone.year),`${data.id}.milestone-${i+1}.year`));panel.append(time);}
        const detail=element('div','roadmap-detail');if(timed){const divider=element('div','roadmap-divider'),rule=element('img');rule.dataset.paletteSource=`assets/figma/roadmap-${style}${style!=='plain'&&i===0?'-first':''}-rule.svg`;rule.src=resolveAsset(rule.dataset.paletteSource);rule.alt='';divider.append(rule);detail.append(divider);}
        const copy=element('div','roadmap-copy');copy.append(component(element('h3','roadmap-milestone-title',milestone.title),`${data.id}.milestone-${i+1}.title`));
        if(milestone.points?.length){const list=component(element('ul','roadmap-points'),`${data.id}.milestone-${i+1}.points`);milestone.points.forEach(point=>list.append(element('li','roadmap-point',point)));copy.append(list);}
        detail.append(copy);panel.append(detail);grid.append(panel);
      });content.append(intro,grid);slide.append(content);
    } else if(data.layout==='process'){
      if(hasText(data.image))slide.append(image(data.image,data.imageAlt,'structured-side-image'));
      const style=window.BriteCatalog.contractFor(data).processStyle||'outline';slide.classList.add(`process-${style}`);
      const content=component(element('div','process-content'),`${data.id}.group`),intro=component(element('div','process-intro'),`${data.id}.intro`);intro.append(heading(data,'slide-title'));
      if(hasText(data.description))intro.append(component(element('p','process-description',data.description),`${data.id}.description`));
      const grid=component(element('ol','process-grid'),`${data.id}.steps`);grid.style.setProperty('--step-count',data.steps.length);
      data.steps.forEach((step,i)=>{const panel=component(element('li','process-step'),`${data.id}.step-${i+1}`),number=element('p','process-number',String(i+1).padStart(2,'0'));number.setAttribute('aria-hidden','true');
        const detail=element('div','process-detail'),divider=element('div','process-divider'),rule=element('img');rule.dataset.paletteSource=`assets/figma/process-${style}-rule.svg`;rule.src=resolveAsset(rule.dataset.paletteSource);rule.alt='';divider.append(rule);
        const copy=element('div','process-step-copy');copy.append(component(element('h3','process-step-title',step.title),`${data.id}.step-${i+1}.title`));if(hasText(step.description))copy.append(component(element('p','process-step-description',step.description),`${data.id}.step-${i+1}.description`));
        detail.append(divider,copy);panel.append(number,detail);grid.append(panel);
      });content.append(intro,grid);slide.append(content);
    } else if(data.layout==='comparison'){
      if(hasText(data.image))slide.append(image(data.image,data.imageAlt,'structured-side-image'));
      const style=window.BriteCatalog.contractFor(data).comparisonStyle||'outline';slide.classList.add(`comparison-${style}`);
      const content=component(element('div','comparison-content'),`${data.id}.group`),intro=component(element('div','comparison-intro'),`${data.id}.intro`);
      intro.append(heading(data,'slide-title'));
      if(hasText(data.description))intro.append(component(element('p','comparison-description',data.description),`${data.id}.description`));
      const grid=component(element('div','comparison-grid'),`${data.id}.columns`);
      data.columns.forEach((column,index)=>{
        const panel=component(element('section','comparison-column'),`${data.id}.column-${index+1}`);panel.append(component(element('h3','comparison-column-title',column.title),`${data.id}.column-${index+1}.title`));
        const list=element('ul','comparison-list');
        column.items.forEach((item,i)=>{const li=component(element('li','comparison-item'),`${data.id}.column-${index+1}.item-${i+1}`);li.append(element('h4','comparison-item-title',item.title));if(hasText(item.description))li.append(element('p','comparison-item-description',item.description));list.append(li);});
        panel.append(list);grid.append(panel);
      });content.append(intro,grid);slide.append(content);
    } else if(data.layout==='text'){
      const content=component(element('div','text-content'),`${data.id}.group`);content.append(heading(data,'slide-title'));
      if(data.paragraphs?.length){const paragraphs=component(element('div','paragraphs'),`${data.id}.paragraphs`);data.paragraphs.forEach(text=>paragraphs.append(element('p','',text)));content.append(paragraphs);}
      if(data.points?.length){const list=component(element('ul','text-list'),`${data.id}.points`);data.points.forEach(text=>{const item=element('li');item.append(element('span','point-text',text));list.append(item);});content.append(list);}
      slide.append(content);
    } else if(data.layout==='divider'){
      if(hasText(data.image))slide.append(image(data.image,data.imageAlt,'divider-image'));
      const content=component(element('div','divider-content'),`${data.id}.group`);
      if(hasText(data.sectionNumber))content.append(component(element('p','divider-number',data.sectionNumber),`${data.id}.sectionNumber`));
      content.append(heading(data,'divider-title'));
      if(hasText(data.description))content.append(component(element('p','divider-description',data.description),`${data.id}.description`));
      slide.append(content);
    } else if(data.layout==='figure'){
      slide.dataset.figureAlign=data.overrides?.title?.align||'center';
      const content=component(element('div','figure-content'),`${data.id}.group`),intro=component(element('div','figure-intro'),`${data.id}.intro`);
      intro.append(heading(data,'slide-title'));
      if(hasText(data.description))intro.append(component(element('p','figure-description',data.description),`${data.id}.description`));
      const region=component(element('div','figure-media-region'),`${data.id}.media-region`);content.append(intro,region);
      if(hasText(data.image)){
        const figure=component(element('figure','content-figure'),`${data.id}.figure`),frame=element('div','figure-frame'),img=element('img');frame.dataset.imageSource=data.image;img.src=resolveAsset(data.image);img.alt=data.imageAlt||'';img.draggable=false;frame.append(img);figure.append(frame);
        if(hasText(data.caption))figure.append(component(element('figcaption','figure-caption',data.caption),`${data.id}.caption`));
        region.append(figure);
      }else if(hasText(data.caption))region.append(component(element('p','figure-caption figure-text',data.caption),`${data.id}.caption`));
      slide.append(content);
    } else if(data.layout==='agenda'){
      if(hasText(data.image))slide.append(image(data.image,data.imageAlt,'agenda-image'));
      const content=component(element('div','agenda-content'),`${data.id}.group`);content.append(heading(data,'agenda-title'));
      const grid=component(element('div','agenda-grid'),`${data.id}.items`),rows=Math.ceil(data.items.length/2),rule=element('img','agenda-center-rule');rule.dataset.paletteSource='assets/figma/agenda-center-rule.svg';rule.src=resolveAsset(rule.dataset.paletteSource);rule.alt='';grid.append(rule);
      for(let i=0;i<rows-1;i++){const line=element('img','agenda-row-rule');line.dataset.paletteSource='assets/figma/agenda-row-rule.svg';line.src=resolveAsset(line.dataset.paletteSource);line.alt='';line.style.top=`${rows===4?[157,299,446][i]:((598-(rows*78+(rows-1)*68))/2+4)+i*146+112}px`;grid.append(line);}
      for(let column=0;column<2;column++){
        const list=element('div',`agenda-column agenda-column-${column+1}`);list.style.top=`${(598-(rows*78+(rows-1)*68))/2+4}px`;
        for(const [i,item]of data.items.slice(column*rows,(column+1)*rows).entries()){
          const row=component(element('div','agenda-row'),`${data.id}.item-${column*rows+i+1}`),copy=element('div','agenda-copy');copy.append(element('h3','',item.title));if(hasText(item.description))copy.append(element('p','',item.description));row.append(copy);
          const number=item.target?deck.slides.findIndex(slide=>slide.id===item.target)+1:item.page;
          if(number)row.append(element('span','agenda-page',String(number)));list.append(row);
        }grid.append(list);
      }content.append(grid);slide.append(content);
    }
    addCommon(slide, data, deck, index);
    applyPalette(slide,data.palette||'light');
    return slide;
  }

  function setCardTypography(slide,data,compact=false){
    const base=data.cardTypography?.baseSize||(data.cards.length===4?28:30),size=base-(compact?2:0);
    slide.dataset.cardTypography=compact?'compact':'normal';slide.style.setProperty('--card-body-size',`${size}px`);slide.style.setProperty('--card-body-leading',`${size===30?38:size===28?35:33}px`);slide.style.setProperty('--card-body-tracking',`${-.02*size}px`);
  }
  function placeGroup(slide, data) {
    if(data.layout==='gallery')return;
    if(data.layout==='summary'){const panels=[...slide.querySelectorAll('.summary-action')],height=Math.max(190,...panels.map(p=>p.offsetHeight));panels.forEach(p=>p.style.minHeight=`${height}px`);}
    if(data.layout==='figure'){
      const frame=slide.querySelector('.figure-frame'),img=frame?.querySelector('img');
      if(img){
        const region=slide.querySelector('.figure-media-region'),caption=slide.querySelector('.figure-caption');
        const available=Math.max(0,region.clientHeight-(caption?.offsetHeight||0)-(caption?19:0));
        const scale=Math.max(0,Math.min(1534/img.naturalWidth,560/img.naturalHeight,available/img.naturalHeight));
        frame.style.width=`${img.naturalWidth*scale}px`;frame.style.height=`${img.naturalHeight*scale}px`;
      }
      return;
    }
    const group = slide.querySelector('[data-component-id$=".group"]');
    const settings = data.overrides?.group || {};
    const contract=window.BriteCatalog.contractFor(data);
    const align = settings.verticalAlign || contract.defaultAlignment;
    const naturalTop=contract.regions.defaultTop||143;
    const fittingTop=['comparison','process','roadmap','table','summary'].includes(data.layout)&&!settings.verticalAlign&&!settings.offsetY?Math.min(naturalTop,Math.max(100,978-group.offsetHeight)):naturalTop;
    const top = align === 'center' ? (1080 - group.offsetHeight) / 2 + (data.layout==='divider'?1:data.layout==='quote'?(contract.quoteStyle==='portrait'?1:.5):0) : align === 'bottom' ? 978 - group.offsetHeight : fittingTop;
    group.style.setProperty('--copy-top', `${top + (settings.offsetY || 0)}px`);
    // Respect the first authored overlapping Cover; other Covers give text its own space.
    if(data.layout==='cover'){
      const frame=slide.querySelector('.cover-image');
      if(frame){if(contract.image.overlap===true){frame.style.left='614px';frame.style.width='1306px';}else{const right=Math.max(...[...group.children].map(node=>group.offsetLeft+node.offsetLeft+node.offsetWidth)),left=Math.ceil(right+26);frame.style.left=`${left}px`;frame.style.width=`${Math.max(0,1920-left)}px`;}}
    }
    if(data.layout==='summary'){const stack=slide.querySelector('.summary-actions'),alignment=settings.verticalAlign||'center',y=alignment==='center'?(1080-stack.offsetHeight)/2:alignment==='bottom'?978-stack.offsetHeight:100;stack.style.top=`${y+(settings.offsetY||0)}px`;}
  }
  function lineCount(node) {
    const tops = [];
    const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
    let text;
    while ((text = walker.nextNode())) {
      if (!text.textContent.trim()) continue;
      const range = document.createRange();
      range.selectNodeContents(text);
      for (const rect of range.getClientRects()) if (rect.width > 0 && !tops.some(top => Math.abs(top - rect.top) < 2)) tops.push(rect.top);
    }
    return tops.length;
  }
  function inspectSlide(slide, data) {
    const issues = [];
    const base = slide.getBoundingClientRect();
    const box = node => { const r = node.getBoundingClientRect(); return {x: r.x - base.x, y: r.y - base.y, width: r.width, height: r.height, right: r.right - base.x, bottom: r.bottom - base.y}; };
    const report = (node, message) => issues.push(issue(data.id, node.dataset.componentId || node.closest('[data-component-id]')?.dataset.componentId || data.id, message));
    const group = slide.querySelector('[data-component-id$=".group"]');
    const groupBox = box(group);
    if (groupBox.y < 100 - 1 || groupBox.bottom > 978 + 1) report(group, 'Content exceeds the safe vertical region. Split the detail into a continuation slide or choose a compatible layout.');
    if(data.layout==='cover'&&hasText(data.image)&&window.BriteCatalog.contractFor(data).image.overlap!==true){
      const frame=slide.querySelector('.cover-image'),photo=box(frame);
      if(photo.width<320)report(group,'The Cover photo needs at least 320 px after the text. Keep the wording and choose a compatible layout or explicitly adjust the text width.');
      for(const text of group.children)if(box(text).right>photo.x-26+.5)report(text,'Cover text must remain outside the photo with a 26 px gap.');
    }
    const title = slide.querySelector('h2');
    const titleLines = title?lineCount(title):0;
    const targetLines = data.overrides?.title?.targetLines;
    if (targetLines && titleLines !== targetLines) report(title, `Expected ${targetLines} title lines; the rendered title has ${titleLines}. Adjust the width or explicit line breaks.`);
    const budgets=window.BriteCatalog.contractFor(data).budgets;
    if (!targetLines && titleLines > budgets.titleLines) report(title, `The heading uses ${titleLines} lines; this composition supports up to ${budgets.titleLines}. Shorten it or use another composition.`);
    const description=slide.querySelector('.cover-description,.divider-description,.figure-description,.comparison-description,.process-description,.roadmap-description,.table-description,.summary-description');
    if(description&&budgets.descriptionLines&&lineCount(description)>budgets.descriptionLines)report(description,`The description exceeds ${budgets.descriptionLines} lines. Split the supporting content.`);
    const caption=slide.querySelector('.figure-caption,.table-caption');
    if(caption&&lineCount(caption)>budgets.captionLines)report(caption,`The caption exceeds ${budgets.captionLines} lines. Use a shorter caption or a separate text slide.`);
    if(data.layout==='text'){
      const blocks=[...slide.querySelectorAll('.paragraphs p,.point-text')];
      if(blocks.reduce((sum,node)=>sum+lineCount(node),0)>budgets.totalBodyLines)report(group,`Body content exceeds ${budgets.totalBodyLines} lines. Split it into continuation slides.`);
      for(const point of slide.querySelectorAll('.point-text'))if(lineCount(point)>budgets.pointLines)report(point,`A list item exceeds ${budgets.pointLines} lines. Split the detail into a continuation slide.`);
    }
    for (const text of slide.querySelectorAll('h2, h3, h4, p, figcaption, .point-text, .roadmap-point, .slide-footer span, .brand-text, .agenda-page')) {
      const r = box(text);
      // These text blocks grow vertically. Tight heading line-height can produce
      // harmless glyph ink beyond the line box; check the enclosing region's
      // height instead of mistaking that ink for clipped content.
      if (text.scrollWidth > text.clientWidth + 2) report(text, 'Text exceeds its own content box.');
      if (r.x < 39 || r.right > 1881 || r.y < 0 || r.bottom > 1081) report(text, 'Text extends beyond the slide safe margins.');
    }
    for (const card of slide.querySelectorAll('.feature-card')) {
      if (card.querySelector('h3') && lineCount(card.querySelector('h3')) > 2) report(card, 'Card heading exceeds two lines. Use a shorter heading or another composition.');
      const r = box(card), body = card.querySelector('p'), p = body ? box(body) : null;
      if (p && p.bottom > r.bottom - 46) report(card, 'Card content extends beyond its inner padding.');
    }
    function checkNeighbors(nodes) {
      for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
        const a = box(nodes[i]), b = box(nodes[j]);
        if (Math.min(a.right, b.right) - Math.max(a.x, b.x) > 2 && Math.min(a.bottom, b.bottom) - Math.max(a.y, b.y) > 2) report(nodes[j], 'Neighboring content overlaps. Adjust the layout before exporting.');
      }
    }
    if(data.layout==='figure'){
      const intro=slide.querySelector('.figure-intro'),region=slide.querySelector('.figure-media-region'),figure=region.firstElementChild,frame=slide.querySelector('.figure-frame');
      checkNeighbors([...intro.children]);if(figure?.tagName==='FIGURE')checkNeighbors([...figure.children]);
      const a=box(figure),b=box(region),start=box(intro).bottom,end=1022;
      if(a.y<b.y-1||a.bottom>b.bottom+1||Math.abs((a.y+a.bottom)/2-(start+end)/2)>1)report(figure,'Figure and caption must fit and stay vertically centered between the introduction and footer.');
      if(frame&&b.height-(slide.querySelector('.figure-caption')?.offsetHeight||0)-(slide.querySelector('.figure-caption')?19:0)<120)report(frame,'Too little space remains for a readable figure. Use a shorter introduction, another layout or a permitted continuation.');
    }
    checkNeighbors([...group.children]);
    if(['comparison','process','roadmap'].includes(data.layout)&&hasText(data.image)){
      const intro=slide.querySelector('.'+data.layout+'-intro');for(const node of intro.children)if(box(node).right>1092+1)report(node,'The title or introduction crosses into the photo region. Keep the supplied text in a compatible fitting variant.');
    }
    if(data.layout==='summary'){
      const intro=slide.querySelector('.summary-intro'),takeaway=slide.querySelector('.summary-takeaway'),actions=slide.querySelector('.summary-actions');
      checkNeighbors([...intro.children]);checkNeighbors([...takeaway.children]);checkNeighbors([group,actions]);checkNeighbors([...actions.children]);
      if(box(actions).y<99||box(actions).bottom>979)report(actions,'Next steps exceed the safe vertical region. Preserve every action and choose a fitting composition.');
      if(box(group).x<39||box(group).right>846)report(group,'The Summary title/takeaway column exceeds its designed width.');
      for(const [selector,max]of [['.summary-takeaway-text',budgets.takeawayLines],['.summary-takeaway-label',budgets.takeawayLabelLines]]){const n=slide.querySelector(selector);if(n&&lineCount(n)>max)report(n,'The takeaway or its label exceeds this composition’s line budget. Keep the supplied text and choose a fitting layout.');}
      for(const panel of actions.children){const copy=panel.querySelector('.summary-action-copy'),badge=panel.querySelector('.summary-badge'),p=box(panel),c=box(copy),style=getComputedStyle(panel),left=Number.parseFloat(style.paddingLeft)+Number.parseFloat(style.borderLeftWidth),right=Number.parseFloat(style.paddingRight)+Number.parseFloat(style.borderRightWidth),top=Number.parseFloat(style.paddingTop)+Number.parseFloat(style.borderTopWidth),bottom=Number.parseFloat(style.paddingBottom)+Number.parseFloat(style.borderBottomWidth);
        checkNeighbors([badge,copy]);checkNeighbors([...copy.children]);if(lineCount(copy.querySelector('h3'))>budgets.actionTitleLines)report(copy,'A next-step heading exceeds two lines. Preserve its wording and choose a fitting composition.');
        if(c.x<p.x+left-1||c.right>p.right-right+1||c.y<p.y+top-1||c.bottom>p.bottom-bottom+1)report(panel,'Next-step text exceeds its card padding. Do not clip or shrink it.');
      }
    }
    if(data.layout==='table'){
      checkNeighbors([...slide.querySelector('.table-intro').children]);checkNeighbors([...slide.querySelector('.table-section').children]);
      const table=slide.querySelector('.data-table'),t=box(table);for(const row of table.rows){checkNeighbors([...row.cells]);for(const cell of row.cells){const text=cell.querySelector('p'),r=box(text),c=box(cell);if(r.x<c.x+15||r.right>c.right-15||r.y<c.y+10||r.bottom>c.bottom-10)report(cell,'Table text exceeds its cell padding. Preserve the data and choose a fitting composition.');if(text.scrollWidth>text.clientWidth+2)report(cell,'An unbreakable table value exceeds its column. Do not alter or round the value to fit.');if(cell.scope==='col'&&lineCount(text)>budgets.headerLines)report(cell,'A table header exceeds two lines. Preserve its wording and choose a fitting composition.');if(c.right>t.right+1||c.bottom>t.bottom+1)report(cell,'A table cell exceeds the table region.');}}
    }
    if(data.layout==='roadmap'){
      checkNeighbors([...slide.querySelector('.roadmap-intro').children]);checkNeighbors([...slide.querySelector('.roadmap-grid').children]);
      for(const panel of slide.querySelectorAll('.roadmap-milestone')){
        checkNeighbors([...panel.children]);const time=panel.querySelector('.roadmap-time');if(time)checkNeighbors([...time.children]);checkNeighbors([...panel.querySelector('.roadmap-detail').children]);checkNeighbors([...panel.querySelector('.roadmap-copy').children]);
        const points=panel.querySelector('.roadmap-points');if(points)checkNeighbors([...points.children]);
        for(const [selector,max]of [['.roadmap-period',budgets.periodLines],['.roadmap-year',budgets.yearLines],['.roadmap-milestone-title',budgets.milestoneTitleLines]]){const node=panel.querySelector(selector);if(node&&lineCount(node)>max)report(node,'Roadmap date or heading exceeds its line budget. Preserve the supplied text and choose a fitting composition.');}
        const copy=box(panel.querySelector('.roadmap-copy')),p=box(panel),padding=Number.parseFloat(getComputedStyle(panel).paddingBottom)+Number.parseFloat(getComputedStyle(panel).borderBottomWidth);if(copy.bottom>p.bottom-padding+1)report(panel,'Roadmap content exceeds the milestone padding.');
      }
    }
    if(data.layout==='process'){
      checkNeighbors([...slide.querySelector('.process-intro').children]);checkNeighbors([...slide.querySelector('.process-grid').children]);
      for(const panel of slide.querySelectorAll('.process-step')){
        checkNeighbors([...panel.children]);checkNeighbors([...panel.querySelector('.process-detail').children]);checkNeighbors([...panel.querySelector('.process-step-copy').children]);
        const title=panel.querySelector('.process-step-title');if(lineCount(title)>budgets.stepTitleLines)report(title,'Process step heading exceeds two lines.');
        const copy=box(panel.querySelector('.process-step-copy')),p=box(panel),padding=Number.parseFloat(getComputedStyle(panel).paddingBottom)+Number.parseFloat(getComputedStyle(panel).borderBottomWidth);if(copy.bottom>p.bottom-padding+1)report(panel,'Process text exceeds the step padding.');
      }
    }
    if(data.layout==='comparison'){
      checkNeighbors([...slide.querySelector('.comparison-intro').children]);checkNeighbors([...slide.querySelector('.comparison-grid').children]);
      for(const panel of slide.querySelectorAll('.comparison-column')){
        checkNeighbors([...panel.children]);checkNeighbors([...panel.querySelector('.comparison-list').children]);
        const title=panel.querySelector('.comparison-column-title');if(lineCount(title)>budgets.columnTitleLines)report(title,'Comparison column heading exceeds two lines.');
        for(const item of panel.querySelectorAll('.comparison-item')){const texts=[...item.querySelectorAll('h4,p')];checkNeighbors(texts);if(lineCount(item.querySelector('h4'))>budgets.itemTitleLines)report(item,'Comparison item heading exceeds two lines.');const r=box(item),p=box(panel),padding=Number.parseFloat(getComputedStyle(panel).paddingBottom)+Number.parseFloat(getComputedStyle(panel).borderBottomWidth);if(r.bottom>p.bottom-padding+1)report(item,'Comparison content exceeds the column padding.');}
      }
    }
    checkNeighbors([...(slide.querySelector('.slide-header')?.children||[])]);
    checkNeighbors([...(slide.querySelector('.slide-footer')?.children||[])]);
    for(const text of slide.querySelectorAll('.brand-text,.section-label,.slide-footer span'))if(lineCount(text)>1)report(text,'Keep each header or footer field on one line.');
    if(data.layout==='agenda'){for(const row of slide.querySelectorAll('.agenda-row')){for(const text of row.querySelectorAll('h3,p'))if(lineCount(text)>1)report(text,'Keep each agenda title and description on one line.');checkNeighbors([...row.children]);}for(const column of slide.querySelectorAll('.agenda-column'))checkNeighbors([...column.children]);}
    if(data.layout==='metrics'){
      for(const item of slide.querySelectorAll('.metric-item')){checkNeighbors([...item.children]);checkNeighbors([...item.querySelector('.metric-head').children]);const value=item.querySelector('.metric-value'),label=item.querySelector('.metric-label');if(lineCount(value)>budgets.valueLines)report(value,'Keep each metric value on one line.');if(lineCount(label)>budgets.labelLines)report(label,'Metric label exceeds two lines.');}
      const description=slide.querySelector('.metrics-description');if(description&&lineCount(description)>budgets.descriptionLines)report(description,'Metric introduction exceeds four lines.');checkNeighbors([...slide.querySelector('.metrics-grid').children]);
    }
    if(data.layout==='quote'){
      for(const [selector,max]of [['.quote-author-name',budgets.authorLines],['.quote-author-role',budgets.authorRoleLines]]){const node=slide.querySelector(selector);if(node&&lineCount(node)>max)report(node,'Quote attribution exceeds its line budget.');}
      for(const selector of ['.quote-author','.quote-attribution']){const node=slide.querySelector(selector);if(node)checkNeighbors([...node.children]);}
      if(hasText(data.image)&&window.BriteCatalog.contractFor(data).quoteStyle==='portrait'&&groupBox.right>1259-40)report(group,'The quote region crosses into the portrait region.');
    }
    if (data.layout === 'split' && hasText(data.image)) {
      for (const node of group.children) if (box(node).right > 1172) report(node, 'The text region crosses into the image region.');
    }
    const unique = [...new Map(issues.map(entry => [`${entry.componentId}:${entry.message}`, entry])).values()];
    return {issues: unique, metrics: {id: data.id, titleLines, titleSize: title?Number.parseFloat(getComputedStyle(title).fontSize):null, titleWidth: title?title.offsetWidth:null, group: groupBox, description: Boolean(slide.querySelector('.cover-description, .cards-description, .divider-description, .summary-description')), cardsTop: slide.querySelector('.cards-grid') ? box(slide.querySelector('.cards-grid')).y : null, variant: slide.dataset.fitVariant || 'default',cardTypography:slide.dataset.cardTypography||null,cardBodySize:slide.querySelector('.feature-card>p')?Number.parseFloat(getComputedStyle(slide.querySelector('.feature-card>p')).fontSize):null,cardBodyLines:[...slide.querySelectorAll('.feature-card>p')].map(lineCount),cardIds:[...slide.querySelectorAll('.feature-card')].map(n=>n.dataset.cardId)}};
  }

  async function waitForAssets(root) {
    await Promise.all([...document.fonts].map(async font => {
      try { await font.load(); } catch (_) { throw new Error(`Font could not be loaded: ${font.family} ${font.weight}`); }
    }));
    await document.fonts.ready;
    await Promise.all([...root.querySelectorAll('img')].map(async img => {
      try { await img.decode(); } catch (_) { throw new Error(`Asset could not be loaded: ${img.getAttribute('src')}`); }
      if (!img.naturalWidth) throw new Error(`Asset is empty: ${img.getAttribute('src')}`);
    }));
  }

  async function prepare(input) {
    const deck=structuredClone(input);
    if (!validDesign(deck)) return {valid:false,empty:false,issues:[issue('deck','visualTemplate','This project requires its selected visual-template runtime; do not substitute Brite.')],measurements:[],slides:[]};
    if (deck && Array.isArray(deck.slides) && deck.slides.length===0) return {valid:true,empty:true,issues:[],measurements:[],slides:[]};
    let issues=validateData(deck);
    if(issues.length) return {valid:false,empty:false,issues,measurements:[],slides:[]};
    const root=element('div','measurement-root'); root.setAttribute('aria-hidden','true');
    const slides=deck.slides.map((data,index)=>{const stage=element('div','measurement-stage');const slide=buildSlide(data,deck,index);stage.append(slide);root.append(stage);return slide;});
    document.body.append(root);
    let reports=[];
    try {
      await waitForAssets(root);
      slides.forEach((slide,index)=>placeGroup(slide,deck.slides[index]));
      reports=slides.map((slide,index)=>inspectSlide(slide,deck.slides[index]));
      reports.forEach((report,index)=>{if(report.issues.length){slides[index].dataset.fitVariant='compact';placeGroup(slides[index],deck.slides[index]);}});
      reports=slides.map((slide,index)=>inspectSlide(slide,deck.slides[index]));
      reports.forEach((report,index)=>{const data=deck.slides[index];if(report.issues.length&&data.layout==='cards'&&data.cardTypography?.allowSmallerText===true&&data.cardTypography.profile!=='normal'&&slides[index].dataset.cardTypography!=='compact'){setCardTypography(slides[index],data,true);placeGroup(slides[index],data);}});
      reports=slides.map((slide,index)=>inspectSlide(slide,deck.slides[index]));
      issues=reports.flatMap(report=>report.issues);
    } catch(error) {issues=[issue('deck','assets',error.message)];}
    finally {root.remove();}
    return {valid:!issues.length,empty:false,issues,measurements:reports.map(report=>report.metrics),slides};
  }
  function canonical(value) {
    if(Array.isArray(value)) return value.map(canonical);
    if(value && typeof value==='object') return Object.fromEntries(Object.keys(value).sort().map(key=>[key,canonical(value[key])]));
    return value;
  }
  async function fingerprint(deck) {
    const bytes=new TextEncoder().encode(JSON.stringify(canonical({layout:LAYOUT_VERSION,namespace:'presentation',deck})));
    return [...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(n=>n.toString(16).padStart(2,'0')).join('');
  }
  // Static renderer artwork, including dynamically selected Dark derivatives.
  const assetSources=Object.freeze([...new Set([...monochromeBrands,...monochromeRules].flatMap(source=>[source,source.replace(/\.svg$/,'-dark.svg')]))]);
  window.BriteEngine=Object.freeze({layoutVersion:LAYOUT_VERSION,visualTemplate:VISUAL_TEMPLATE,limits:LIMITS,prepare,fingerprint,applyPalette,assetSources});
})();
