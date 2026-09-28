const PW_ENGINE = __ENGINE_JSON__;
const $=id=>document.getElementById(id);let selected=0;const fields=['name','w','h','bleed','safe','overlap','circumference','radius','stock'];
PW.products.forEach((p,i)=>{const o=document.createElement('option');o.value=i;o.textContent=p;$('product').append(o)});
[...PW.presets.map(p=>p.name),'Custom template'].forEach((name,i)=>{const b=document.createElement('button');b.className='preset';b.dataset.index=i;b.innerHTML='<span>0'+(i+1)+'</span><span><b>'+name+'</b><small>'+(['2.41 × 1.50 in','1.00 in diameter','3.56 × 0.55 in','2.75 in · placeholder','7.22 × 1.50 in','Choose product & dimensions'][i])+'</small></span>';b.onclick=()=>choose(i);$('presets').append(b)});
function load(i){const c=PW.config(Math.min(i,4));fields.forEach(k=>$(k).value=c[k]);$('shape').value=c.shape;$('pdp').checked=c.pdp;$('measured').checked=false;if(i===5){$('name').value='Custom flat label';$('shape').value='rectangle';$('pdp').checked=false;}render();}
function choose(i){selected=i;document.querySelectorAll('.preset').forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.index===i)));$('customProduct').hidden=i!==5;$('product').value=i===5?1:i;load(i===5?1:i);}
function read(){const c={};fields.forEach(k=>c[k]=['name','stock'].includes(k)?$(k).value:($(k).value.trim()===''?NaN:Number($(k).value)));c.shape=$('shape').value;c.pdp=$('pdp').checked;c.measured=$('measured').checked;c.product=+$('product').value;if(c.shape==='circle'){c.h=c.w;c.radius=0;}if(c.shape!=='wrap'){c.overlap=0;c.circumference=0;}return c;}
function render(){const circle=$('shape').value==='circle',wrap=$('shape').value==='wrap';$('h').disabled=circle;$('radius').disabled=circle;if(circle)$('h').value=$('w').value;$('wrapFields').hidden=!wrap;$('widthLabel').textContent=circle?'DIAMETER (IN)':'WIDTH (IN)';const c=read(),err=PW.validate(c);$('error').textContent=err;$('download').disabled=!!err;$('status').textContent=c.measured?'USER-MEASURED':'PROVISIONAL';$('feedback').textContent='';$('context').textContent=c.product===3?'Deli lid: 2.75″ is an unmeasured source placeholder. Confirm the flat lid area. Use a separate dieline for tapered sidewalls.':c.product===2?'The default sidewall has only 0.30″ of safe height. Check that your approved copy fits before committing to this package.':'Extend background artwork to bleed. Keep critical content inside the safe area and clear of the wrap seam. White and gloss layers start empty.';const f=v=>Number.isFinite(v)?String(+v.toFixed(4)):'—';$('trimStat').textContent=circle?f(c.w)+'″ diameter':f(c.w)+' × '+f(c.h)+'″';$('bleedStat').textContent=circle?f(c.w+2*c.bleed)+'″ diameter':f(c.w+2*c.bleed)+' × '+f(c.h+2*c.bleed)+'″';if(err){$('preview').innerHTML='<p class="note">Enter valid dimensions to preview.</p>';return;}
const W=600,H=320,scale=Math.min(470/(c.w+2*c.bleed),235/(c.h+2*c.bleed)),w=c.w*scale,h=c.h*scale,b=c.bleed*scale,s=c.safe*scale,x=(W-w)/2,y=(H-h)/2;
function shape(inset,stroke,dash,fill){return circle?`<circle cx="300" cy="160" r="${w/2-inset}" fill="${fill}" stroke="${stroke}" stroke-width="1.5" stroke-dasharray="${dash}"/>`:`<rect x="${x+inset}" y="${y+inset}" width="${w-2*inset}" height="${h-2*inset}" rx="${Math.max(0,c.radius*scale-inset)}" fill="${fill}" stroke="${stroke}" stroke-width="1.5" stroke-dasharray="${dash}"/>`;}
let svg=shape(-b,'#999','6 5','rgba(255,255,255,.6)')+shape(0,'#cf2c39','',c.stock==='Black'?'#262628':c.stock==='Clear'?'#dce5e577':'white')+shape(s,'#39776b','4 4','none');if(wrap){const sx=x+w-c.overlap*scale;svg+=`<rect x="${sx}" y="${y}" width="${c.overlap*scale}" height="${h}" fill="#cf2c3922"/><path d="M${sx},${y}v${h}" stroke="#cf2c39" stroke-dasharray="3 3"/><path d="M${sx-s},${y+s}v${h-2*s}" stroke="#39776b" stroke-dasharray="4 4"/>`;}
if(c.pdp){const gx=circle?(W-0.48*scale)/2:x+s,gy=circle?(H-0.35*scale)/2:y+s;svg+=`<rect x="${gx}" y="${gy}" width="${0.48*scale}" height="${0.35*scale}" fill="#cf2c3910" stroke="#be7190"/>`;}
svg+=`<text x="300" y="${y+h+b+23}" text-anchor="middle" fill="#696866" font-family="monospace" font-size="12">${f(c.w)} in${circle?' diameter':''}</text>`;$('preview').innerHTML=`<svg viewBox="0 0 600 320" role="img" aria-label="${f(c.w)} by ${f(c.h)} inch ${c.shape} label with bleed and safe guides">${svg}</svg>`;}
function download(configs,name){const engine=PW_ENGINE;const runner='\n(function(){var configs='+JSON.stringify(configs)+';var folder=Folder.selectDialog("Choose where to save your PRESSWRK templates");if(!folder)return;var done=0;try{for(var i=0;i<configs.length;i++){var d=PW.build(configs[i]);PW.save(d,configs[i],folder);if(configs.length>1)d.close(SaveOptions.DONOTSAVECHANGES);done++;}alert("Saved "+done+" template(s) to "+folder.fsName);}catch(e){alert("Saved "+done+" template(s). Error: "+e.message);}}());';const blob=new Blob(['#target illustrator\n'+engine+runner],{type:'text/plain'});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);$('feedback').textContent='Downloaded. Run the .jsx in Illustrator via File → Scripts → Other Script…';}
$('download').onclick=()=>{const c=read();if(!PW.validate(c))download([c],PW.filename(c).replace('.ait','.jsx'));};$('all').onclick=()=>download([0,1,2,3,4].map(PW.config),'PW_All_Five_Presets.jsx');$('product').onchange=()=>{const i=+$('product').value;load(i);if(i===5){$('product').value='5';}render();};$('derive').onclick=()=>{const c=read();if(!(c.circumference>0)||!(c.overlap>0)){$('error').textContent='Enter a positive measured circumference and overlap first.';return;}$('w').value=Math.ceil((c.circumference+c.overlap-1e-10)*100)/100;render();};document.querySelectorAll('.form input,.form select').forEach(e=>{if(e.id!=='product')e.addEventListener('input',render)});choose(0);

const STORAGE_KEY='presswrks-template-builder-v1';
function applySetup(config){
  const c=PWShare.validate(config);choose(5);
  fields.forEach(k=>$(k).value=c[k]);$('product').value=c.product;$('shape').value=c.shape;
  $('pdp').checked=c.pdp;$('measured').checked=c.measured;render();
}
function persistSetup(){const c=read();if(PW.validate(c))return;try{localStorage.setItem(STORAGE_KEY,JSON.stringify(c));}catch(e){/* Core builder works without storage. */}}
function restoreSetup(){
  try{
    const shared=PWShare.parse(location.hash);
    if(shared){applySetup(shared);$('session-status').textContent='Shared setup loaded. Review the dimensions before you build.';return;}
  }catch(e){$('session-status').textContent='This setup link is incomplete or invalid. A starting preset is shown instead.';return;}
  try{const saved=localStorage.getItem(STORAGE_KEY);if(saved){applySetup(JSON.parse(saved));$('session-status').textContent='Your last valid setup was restored from this browser.';}}catch(e){/* An invalid saved setup never blocks the presets. */}
}
$('share').onclick=async()=>{
  const c=read(),error=PW.validate(c);if(error){$('feedback').textContent='Correct the dimensions before sharing.';return;}
  const base=location.protocol==='file:'?'https://presswrks-template-builder.vercel.app/':location.origin+location.pathname;
  const url=base+PWShare.encode(c);$('share-output').hidden=false;$('share-url').value=url;
  try{await navigator.clipboard.writeText(url);$('feedback').textContent='Setup link copied. Anyone with the link can open these dimensions.';}
  catch(e){$('share-url').focus();$('share-url').select();$('feedback').textContent='Your setup link is ready. Copy it from the field above.';}
};
$('reset').onclick=()=>{const product=+$('product').value;choose(product<5?product:5);if(product===5){$('product').value=5;load(5);}history.replaceState(null,'',location.pathname+location.search);$('share-output').hidden=true;persistSetup();$('session-status').textContent='Reset to the starting dimensions. Saved in this browser when storage is available.';};
document.querySelector('.form').addEventListener('input',()=>{$('share-output').hidden=true;persistSetup();});
document.querySelector('.form').addEventListener('change',persistSetup);
$('presets').addEventListener('click',()=>{$('share-output').hidden=true;persistSetup();});
$('derive').addEventListener('click',persistSetup);
window.addEventListener('hashchange',()=>{if(location.hash.startsWith('#setup='))restoreSetup();});
restoreSetup();
