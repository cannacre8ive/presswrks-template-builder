import {readFile,writeFile,mkdir,cp} from 'node:fs/promises';
const read=p=>readFile(p,'utf8');
const engine=await read('src/engine.js');
const script=engine+'\n'+await read('src/sharing.js')+'\n'+(await read('src/app.js')).replace('__ENGINE_JSON__',JSON.stringify(engine));
const html=(await read('src/page.html')).replace('__CSS__',await read('src/styles.css')).replace('__SCRIPT__',script);
await mkdir('dist',{recursive:true});await cp('public','dist',{recursive:true});
await writeFile('dist/index.html',html);await writeFile('dist/PRESSWRKS-Template-Builder.html',html);
console.log('Built hosted and offline versions from one engine.');
