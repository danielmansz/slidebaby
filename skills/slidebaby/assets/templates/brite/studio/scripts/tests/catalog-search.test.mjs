import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
const context=vm.createContext({window:{},structuredClone});
for(const name of ['samples/brite.js','catalog.js'])vm.runInContext(await fs.readFile(new URL('../../'+name,import.meta.url),'utf8'),context,{filename:name});
const catalog=context.window.BriteCatalog;
const ids=query=>Array.from(catalog.search(query),entry=>entry.id);
const families=query=>[...new Set(Array.from(catalog.search(query),entry=>entry.family))];

test('names, old aliases and unaccented Polish identify the available layouts',()=>{
 assert(ids('Classic cover').includes('cover-default'));
 assert.deepEqual(ids('OKŁADKA'),ids('okladka'));
 assert.deepEqual(ids('plan wdrożenia'),ids('PLAN WDROZENIA'));
 assert.deepEqual(families('okladka'),['cover']);
 assert(ids('cover-separated').includes('cover-separated'));
 assert.deepEqual(ids('table-criteria-matrix'),['table-criteria-matrix']);
});
test('use cases find relevant families beyond their literal display names',()=>{
 assert.deepEqual(families('wyniki'),['metrics']);
 assert.deepEqual(families('opinia klienta'),['quote']);
 assert.deepEqual(families('plan wdrozenia'),['process','roadmap']);
 assert(families('porównanie opcji').includes('comparison'));
 assert(families('porównanie opcji').includes('table'));
 assert(families('screenshot').includes('figure'));
});
test('all words constrain a result; count and media phrases stay meaningful',()=>{
 const two=catalog.search('2 cards');assert(two.length>0);assert(two.every(e=>e.family==='cards'&&e.contract.itemCounts.cards.min===2));
 const noPhoto=catalog.search('cover without photo');assert(noPhoto.length>0);assert(noPhoto.every(e=>e.family==='cover'&&!e.contract.image.required));
 assert.deepEqual(ids('cover without photo'),ids('okładka bez zdjęcia'));
 assert(catalog.search('okładka ze zdjęciem').every(e=>e.contract.image.required));
 assert.equal(catalog.search('with photo without photo').length,0);
 assert.equal(catalog.search('metrics customer quotation').length,0);
});
test('empty and unmatched queries preserve the catalogue and do not mutate content',()=>{
 const before=JSON.stringify({entries:catalog.entries,families:catalog.families,preview:catalog.materialize('cover-default')});
 assert.deepEqual(ids('  '),Array.from(catalog.entries,e=>e.id));
 assert.deepEqual(ids('unknown-template-zqx123'),[]);
 assert.deepEqual(ids('<script>alert(1)</script>'),[]);
 assert(!ids('text-default').includes('text-default'));
 for(const query of ['wyniki','with photo','bez zdjęcia',''])catalog.search(query);
 assert.equal(JSON.stringify({entries:catalog.entries,families:catalog.families,preview:catalog.materialize('cover-default')}),before);
 const found=ids('bez zdjęcia');assert.deepEqual(found,Array.from(catalog.entries,e=>e.id).filter(id=>found.includes(id)));
});
