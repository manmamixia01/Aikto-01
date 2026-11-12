import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
await build({absWorkingDir:fileURLToPath(new URL('..',import.meta.url)),entryPoints:['src/animation/main.js'],bundle:true,format:'esm',target:'es2022',outfile:'public/animation/scene.js',minify:true,legalComments:'eof'});
await build({absWorkingDir:fileURLToPath(new URL('..',import.meta.url)),entryPoints:['src/animation/ar-scene.js'],bundle:true,external:['three','three/*'],format:'esm',target:'es2022',outfile:'public/ar/scene.js',minify:true,legalComments:'eof'});
