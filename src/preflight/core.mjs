export const LIMITS={bytes:25*1024*1024,pixels:20000000,pages:10};
const ascii=(b,s,n)=>String.fromCharCode(...b.subarray(s,s+n));
export function sniff(b){if(b[0]===255&&b[1]===216)return 'JPEG';if([137,80,78,71,13,10,26,10].every((v,i)=>b[i]===v))return 'PNG';if(ascii(b,0,5)==='%PDF-')return 'PDF';throw new Error('Choose a PDF, JPG or PNG file. AI, EPS, SVG, TIFF and other formats need a print PDF export first.');}
export function parseRaster(b){
 const type=sniff(b),v=new DataView(b.buffer,b.byteOffset,b.byteLength);let width,height,color='Unknown',alpha=false,orientation=1,icc=false;
 if(type==='PNG'){
  if(b.length<33||ascii(b,12,4)!=='IHDR')throw Error('This PNG header is incomplete. Export a fresh file.');
  width=v.getUint32(16);height=v.getUint32(20);const ct=b[25];
  if(![0,2,3,4,6].includes(ct))throw Error('Unsupported PNG color type.');color=[0,4].includes(ct)?'Grayscale':'RGB';alpha=[4,6].includes(ct);
  let pos=8,ended=false;while(pos+12<=b.length){const n=v.getUint32(pos),tag=ascii(b,pos+4,4);if(n>b.length-pos-12)throw Error('This PNG is truncated. Export a fresh file.');if(tag==='tRNS')alpha=true;if(tag==='iCCP')icc=true;pos+=n+12;if(tag==='IEND'){ended=true;break;}}
  if(!ended)throw Error('This PNG is incomplete.');
 }else if(type==='JPEG'){
  let p=2,components=0,adobe=null,iccSpace='',scan=false;const parts=new Map();let total=0;
  while(p<b.length){if(b[p++]!==255)throw Error('This JPEG has an invalid marker.');while(b[p]===255)p++;const m=b[p++];if(m===217)break;if(m===0||m===216||(m>=208&&m<=215))continue;if(p+2>b.length)throw Error('This JPEG is incomplete.');const n=v.getUint16(p);if(n<2||p+n>b.length)throw Error('This JPEG is truncated.');const s=p+2;
   if([192,193,194,195,197,198,199,201,202,203,205,206,207].includes(m)){if(n<8)throw Error('Invalid JPEG dimensions.');height=v.getUint16(s+1);width=v.getUint16(s+3);components=b[s+5];}
   if(m===238&&n>=14&&ascii(b,s,5)==='Adobe')adobe=b[s+11];
   if(m===226&&n>=16&&ascii(b,s,12)==='ICC_PROFILE\0'){parts.set(b[s+12],b.slice(s+14,p+n));total=b[s+13];}
   if(m===225&&n>=16&&ascii(b,s,6)==='Exif\0\0'){
    try{const t=s+6,le=ascii(b,t,2)==='II',dv=new DataView(b.buffer,b.byteOffset+t,p+n-t);if(dv.getUint16(2,le)===42){const off=dv.getUint32(4,le),count=dv.getUint16(off,le);for(let i=0;i<Math.min(count,1000);i++){const a=off+2+i*12;if(dv.getUint16(a,le)===274){orientation=dv.getUint16(a+8,le);break;}}}}catch(e){throw Error('The JPEG orientation metadata is damaged. Export a fresh file.');}
   }
   p+=n;if(m===218){scan=true;break;}
  }
  if(!scan||!width||!height)throw Error('This JPEG has no readable image data.');
  if(total&&parts.size===total){const all=[];for(let i=1;i<=total;i++){if(!parts.has(i))throw Error('Incomplete JPEG color profile.');for(const byte of parts.get(i))all.push(byte);}const profile=new Uint8Array(all);icc=profile.length>=128&&ascii(profile,36,4)==='acsp';if(icc)iccSpace=ascii(profile,16,4).trim();}
  if(components===4&&(adobe===0||adobe===2||iccSpace==='CMYK'))color='CMYK';else if(components===3)color='RGB';else if(components===1)color='Grayscale';
  if(iccSpace&&((color==='CMYK'&&iccSpace!=='CMYK')||(color==='RGB'&&iccSpace!=='RGB')))color='Unknown';
  if([5,6,7,8].includes(orientation))[width,height]=[height,width];
 }else throw Error('Use the PDF inspector for PDF artwork.');
 if(!width||!height||width*height>LIMITS.pixels)throw Error('This image exceeds the 20-megapixel inspection limit or has invalid dimensions. Export a smaller print PDF or image.');
 return {type,width,height,color,alpha,icc,orientation};
}
export function targetFrom(c){if(![c.w,c.h,c.bleed].every(Number.isFinite)||c.w<=0||c.h<=0||c.bleed<0)throw Error('Set valid label dimensions first.');return {name:c.name,shape:c.shape,width:c.w,height:c.h,bleed:c.bleed,canvasWidth:c.w+2*c.bleed,canvasHeight:c.h+2*c.bleed,ppi:300};}
export function check(label,status,detail,action=''){return {label,status,detail,action};}
export function outcome(checks){return checks.some(x=>x.status==='fail')?'Needs changes':checks.some(x=>x.status==='review')?'Needs print review':'Passes these checks';}
export function rasterChecks(meta,t){
 const x=meta.width/t.canvasWidth,y=meta.height/t.canvasHeight,ppi=Math.min(x,y),ratio=(meta.width/meta.height)/(t.canvasWidth/t.canvasHeight),fit=Math.abs(ratio-1)<=0.005;
 const out=[check('Size & proportions',fit?'pass':'fail',`${meta.width} × ${meta.height} pixels for a ${t.canvasWidth.toFixed(3)} × ${t.canvasHeight.toFixed(3)} inch canvas including bleed.`,fit?'The whole image is fitted to this canvas.':'Export with these proportions. Do not stretch the artwork to force a fit.'),check('Resolution at this size',ppi+0.0001>=300?'pass':'fail',`${Math.floor(ppi+0.0001)} PPI at the requested canvas size. Target: at least 300 PPI.`,ppi<300?`Use the original artwork or re-export at least ${Math.ceil(t.canvasWidth*300)} × ${Math.ceil(t.canvasHeight*300)} pixels. Changing a DPI tag or enlarging pixels does not restore detail.`:'Calculated from pixels and print size, not the DPI metadata tag.'),check('Color mode',meta.color==='CMYK'?'pass':meta.color==='RGB'?'fail':'review',`${meta.color} ${meta.type}${meta.icc?' with an embedded profile':''}.`,meta.color==='RGB'?'Convert from the original artwork to the printer’s CMYK profile and inspect the result. PNG cannot store CMYK.':meta.color==='CMYK'?'CMYK encoding detected. The printer must still confirm the intended output profile.':'Ask prepress to confirm the color space and output profile.')];
 if(meta.alpha)out.push(check('Transparency','review','This PNG supports transparent pixels.','Confirm the intended substrate, white ink, and flattening with prepress.'));
 out.push(check('Bleed artwork','review','Canvas size is checked; artwork coverage at the cut edge is not.','Visually confirm background extends through bleed and important content stays inside the safe area.'));
 return {checks:out,effectivePPI:ppi};
}
export const mul=(a,b)=>[a[0]*b[0]+a[2]*b[1],a[1]*b[0]+a[3]*b[1],a[0]*b[2]+a[2]*b[3],a[1]*b[2]+a[3]*b[3],a[0]*b[4]+a[2]*b[5]+a[4],a[1]*b[4]+a[3]*b[5]+a[5]];
export function placementPPI(w,h,m,unit=1){if(!(w>0&&h>0&&unit>0))return null;const a=m[0]*unit/w,b=m[1]*unit/w,c=m[2]*unit/h,d=m[3]*unit/h;const sum=a*a+b*b+c*c+d*d,det=(a*d-b*c)**2,s=Math.sqrt((sum+Math.sqrt(Math.max(0,sum*sum-4*det)))/2);return s>0?72/s:null;}
export function inspectOperators(list,OPS,unit=1){let m=[1,0,0,1,0,0],stack=[],images=[],unmeasured=0;for(let i=0;i<list.fnArray.length;i++){const op=list.fnArray[i],a=list.argsArray[i]||[];
 if(op===OPS.save)stack.push([...m]);else if(op===OPS.restore)m=stack.pop()||[1,0,0,1,0,0];else if(op===OPS.transform)m=mul(m,a);else if(op===OPS.paintFormXObjectBegin){stack.push([...m]);if(a[0])m=mul(m,a[0]);}else if(op===OPS.paintFormXObjectEnd)m=stack.pop()||[1,0,0,1,0,0];
 else if(op===OPS.paintImageXObject){const p=placementPPI(a[1],a[2],m,unit);if(p)images.push({width:a[1],height:a[2],ppi:p});else unmeasured++;}
 else if(op===OPS.paintInlineImageXObject||op===OPS.paintImageMaskXObject){const p=placementPPI(a[0]?.width,a[0]?.height,m,unit);if(p)images.push({width:a[0].width,height:a[0].height,ppi:p});else unmeasured++;}
 else if([OPS.paintImageXObjectRepeat,OPS.paintInlineImageXObjectGroup,OPS.paintImageMaskXObjectRepeat,OPS.paintImageMaskXObjectGroup,OPS.beginGroup,OPS.beginAnnotation].includes(op))unmeasured++;
 }
 return {images,unmeasured};
}
