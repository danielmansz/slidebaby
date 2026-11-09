#!/usr/bin/env node
/* Same guarded publication pipeline, document-scoped request (no --slide). */
if(process.argv.includes('--slide'))throw Error('edit-deck uses document edits; use edit-slide for --slide.');
await import('./edit-slide.mjs');
