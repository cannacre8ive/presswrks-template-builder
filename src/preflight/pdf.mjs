import { PDFDocument, PDFName } from 'pdf-lib';
import { check, inspectOperators, LIMITS } from './core.mjs';

const close=(a,b)=>Math.abs(a-b)<=0.01;
export async function inspectPDF(bytes,target,canvas){
  const pdfjs=await import('pdfjs-dist/build/pdf.mjs');
  pdfjs.GlobalWorkerOptions.workerSrc='/vendor/pdf.worker.min.mjs';
  const source=await PDFDocument.load(bytes,{updateMetadata:false});
  if(source.getPageCount()>LIMITS.pages)throw Error('Use a PDF with 10 pages or fewer. Export each label separately.');
  const loading=pdfjs.getDocument({data:bytes.slice(),isEvalSupported:false,stopAtErrors:true,useWasm:false,
    cMapUrl:'/vendor/cmaps/',cMapPacked:true,standardFontDataUrl:'/vendor/standard_fonts/',maxImageSize:20000000});
  const pdf=await loading.promise,checks=[],pages=[];
  try{
    for(let i=0;i<pdf.numPages;i++){
      const page=source.getPage(i),display=await pdf.getPage(i+1),unit=display.userUnit||1;
      const trim=page.getTrimBox(),bleed=page.getBleedBox(),media=page.getMediaBox();
      const explicit=page.node.get(PDFName.of('TrimBox'));
      const rotation=((display.rotate%360)+360)%360;
      let w=trim.width*unit/72,h=trim.height*unit/72;
      if(rotation===90||rotation===270)[w,h]=[h,w];
      const fit=close(w,target.width)&&close(h,target.height),prefix=pdf.numPages>1?`Page ${i+1} · `:'';
      checks.push(check(prefix+'Finished size',fit?(explicit?'pass':'review'):'fail',`${w.toFixed(3)} × ${h.toFixed(3)} in. ${explicit?'TrimBox':'Crop/page box; no explicit TrimBox'}.`,fit&&!explicit?'Export a print PDF with a defined trim size.':!fit?'Export at the selected finished size; include trim and bleed boxes.':''));
      const needed=target.bleed*72/unit;
      const contains=(outer,inner,margin)=>outer.x<=inner.x-margin+0.1&&outer.y<=inner.y-margin+0.1&&outer.x+outer.width>=inner.x+inner.width+margin-0.1&&outer.y+outer.height>=inner.y+inner.height+margin-0.1;
      const bleedOK=contains(bleed,trim,needed)&&contains(media,bleed,0);
      checks.push(check(prefix+'Bleed area',explicit&&bleedOK?'pass':'review',explicit&&bleedOK?`The page provides at least ${target.bleed} in. beyond each trim edge.`:'The required bleed area is not established by the page boxes.','Prepress must also confirm the artwork extends into that area.'));
      const operators=inspectOperators(await display.getOperatorList(),pdfjs.OPS,unit);
      // Account for the scale needed to fit the selected trim, even when size already fails.
      const scale=Math.max(target.width/w,target.height/h);
      const ppis=operators.images.map(x=>x.ppi/scale),min=ppis.length?Math.min(...ppis):null;
      checks.push(check(prefix+'Placed image resolution',min!==null&&min<299.999?'fail':operators.unmeasured||min===null?'review':'pass',min!==null?`${operators.images.length} measured image placement(s); lowest ${Math.floor(min+0.001)} PPI at the requested size.`:'No raster placements were measured. Vector shapes and text have no fixed PPI; prepress should confirm no image content was skipped.',operators.unmeasured?'Complex groups or image placements also need manual resolution review.':min!==null&&min<299.999?'Replace low-resolution source images; changing the PDF resolution setting will not restore their detail.':''));
      pages.push({number:i+1,width:w,height:h,explicitTrim:!!explicit,bleedOK,images:operators.images.length,unmeasured:operators.unmeasured,lowestPPI:min});
      if(i===0&&canvas){const viewport=display.getViewport({scale:1});const preview=display.getViewport({scale:Math.min(1.5,640/viewport.width,500/viewport.height)});canvas.width=Math.ceil(preview.width);canvas.height=Math.ceil(preview.height);await display.render({canvasContext:canvas.getContext('2d'),viewport:preview}).promise;}
      display.cleanup();
    }
    checks.push(check('PDF color & production review','review','PDFs can mix RGB, CMYK, spot colors and color profiles. This browser check does not certify PDF color.','Prepress must check CMYK/output profile, fonts, overprint, transparency, bleed artwork and any cut/white-ink layers before printing.'));
    if(pdf.numPages>1)checks.push(check('Multiple pages','review',`${pdf.numPages} pages were inspected. Preview shows page 1.`,'Confirm which pages and quantities belong to this label order.'));
    return {checks,pages,type:'PDF'};
  }finally{await loading.destroy();}
}
