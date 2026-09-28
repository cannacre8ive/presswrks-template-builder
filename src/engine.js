/* PRESSWRK Template Builder v1. ES3-compatible Illustrator engine. */
var PW = (function () {
  var names = ['CUT','PERF','GUIDES','GAUGES','VARIABLE','COMPLIANCE','GLOSS','ART','WHITE','SUBSTRATE-SIM'];
  var products = ['Pre-roll tube wrap','Concentrate jar lid','Concentrate jar sidewall','Deli-style flower lid','Eighth pre-pack jar wrap','Other flat label'];
  var presets = [
    {name:products[0],product:0,shape:'wrap',w:2.41,h:1.5,overlap:0.1,circumference:2.301,radius:0,pdp:true},
    {name:products[1],product:1,shape:'circle',w:1,h:1,overlap:0,circumference:0,radius:0,pdp:true},
    {name:products[2],product:2,shape:'wrap',w:3.56,h:0.55,overlap:0.1,circumference:3.456,radius:0,pdp:false},
    {name:products[3],product:3,shape:'circle',w:2.75,h:2.75,overlap:0,circumference:0,radius:0,pdp:false},
    {name:products[4],product:4,shape:'wrap',w:7.22,h:1.5,overlap:0.125,circumference:7.094,radius:0,pdp:true}
  ];
  function config(i) {var c={},k;for(k in presets[i])c[k]=presets[i][k];c.bleed=0.125;c.safe=0.125;c.stock='White';c.measured=false;return c;}
  function validate(c) {
    var fields=['w','h','bleed','safe','overlap','circumference','radius'],i,k;
    for(i=0;i<fields.length;i++){k=fields[i];if(typeof c[k]!='number'||!isFinite(c[k])||c[k]<0)return 'Enter a valid non-negative number for '+k+'.';}
    if(c.w<0.1||c.h<0.1||c.w>100||c.h>100)return 'Trim must be between 0.1 and 100 inches.';
    if(c.shape!='circle'&&c.shape!='wrap'&&c.shape!='rectangle')return 'Select a supported shape.';
    if(c.shape=='circle'&&Math.abs(c.w-c.h)>0.00001)return 'A circle must have equal width and height.';
    if(c.bleed<0.0625||c.bleed>1)return 'Bleed must be between 0.0625 and 1 inch.';
    if(c.safe<=0||c.w<=2*c.safe||c.h<=2*c.safe)return 'Safe inset must leave a positive live area.';
    if(c.radius>Math.min(c.w,c.h)/2)return 'Corner radius cannot exceed half the smaller trim dimension.';
    if(c.shape=='wrap') {
      if(c.overlap<=0||c.overlap>=c.w-2*c.safe)return 'Overlap must leave usable space inside the safe area.';
      if(c.circumference>0&&c.w+0.000001<c.circumference+c.overlap)return 'Wrap width must cover circumference plus overlap.';
    }
    if(c.pdp){var lw=c.w-2*c.safe-(c.shape=='wrap'?c.overlap:0),lh=c.h-2*c.safe;
      if(c.shape=='circle'?Math.sqrt(0.48*0.48+0.35*0.35)>lw:(lw<0.48||lh<0.35))return 'The 0.48 x 0.35 inch reference symbol box does not fit inside the safe area.';
    }
    if(!c.name||!String(c.name).replace(/\s/g,''))return 'Enter a template name.';
    return '';
  }
  function color(c,m,y,k){var v=new CMYKColor();v.cyan=c;v.magenta=m;v.yellow=y;v.black=k;return v;}
  function build(c){
    var err=validate(c);if(err)throw new Error(err);
    var w=c.w*72,h=c.h*72,b=c.bleed*72,s=c.safe*72,doc;
    try {
      var pre=new DocumentPreset();pre.title=c.name;pre.width=w;pre.height=h;pre.units=RulerUnits.Inches;pre.colorMode=DocumentColorSpace.CMYK;pre.rasterResolution=DocumentRasterResolution.HighResolution;
      pre.documentBleedLink=true;pre.documentBleedOffsetRect=[b,b,b,b];
      doc=app.documents.addDocument('Print',pre,false);
      doc.artboards[0].artboardRect=[0,h,w,0];doc.artboards[0].name=c.name;
      var ro=doc.rasterEffectSettings;ro.resolution=300;doc.rasterEffectSettings=ro;
      var original=doc.layers[0],layers={},i;
      for(i=names.length-1;i>=0;i--){var l=doc.layers.add();l.name=names[i];layers[names[i]]=l;}
      original.remove();
      var sn=['CutContour','PerfCutContour','RDG_WHITE','RDG_GLOSS','RDG_PRIMER'],sv=[[0,100,0,0],[0,0,100,0],[40,0,0,0],[0,40,0,0],[0,0,40,0]],spots={};
      for(i=0;i<sn.length;i++){var sp=doc.spots.add();sp.name=sn[i];sp.colorType=ColorModel.SPOT;sp.color=color(sv[i][0],sv[i][1],sv[i][2],sv[i][3]);if(sp.name!==sn[i])throw new Error('Spot name mismatch: '+sn[i]);var sc=new SpotColor();sc.spot=sp;sc.tint=100;spots[sn[i]]=sc;}
      function outline(layer,inset){var ww=w-2*inset,hh=h-2*inset,rr=Math.max(0,c.radius*72-inset),p;
        if(c.shape=='circle')p=layer.pathItems.ellipse(h-inset,inset,ww,hh);
        else if(rr>0)p=layer.pathItems.roundedRectangle(h-inset,inset,ww,hh,rr,rr);
        else p=layer.pathItems.rectangle(h-inset,inset,ww,hh);
        p.filled=false;p.stroked=true;p.strokeWidth=0.5;p.strokeColor=color(0,0,0,40);return p;
      }
      function line(layer,pts,label){var p=layer.pathItems.add();p.setEntirePath(pts);p.filled=false;p.stroked=true;p.strokeWidth=0.5;p.strokeColor=color(0,0,0,40);p.name=label;return p;}
      function text(layer,content,x,y,size){var t=layer.textFrames.add();t.contents=content;t.position=[x,y];t.textRange.characterAttributes.size=size;t.textRange.characterAttributes.fillColor=color(0,0,0,80);try{t.textRange.characterAttributes.textFont=app.textFonts.getByName('Helvetica');}catch(e){}return t;}
      var cut=outline(layers.CUT,0);cut.name='TRIM - '+c.w+' x '+c.h+' in';cut.strokeWidth=0.25;cut.strokeColor=spots.CutContour;cut.strokeOverprint=true;
      var bleed=outline(layers.GUIDES,-b);bleed.name='BLEED '+c.bleed+' in';bleed.guides=true;
      var safe=outline(layers.GUIDES,s);safe.name='SAFE '+c.safe+' in';safe.guides=true;
      var end=w-s-(c.shape=='wrap'?c.overlap*72:0);
      if(c.shape=='wrap'){var seamX=w-c.overlap*72;line(layers.GUIDES,[[seamX,h],[seamX,0]],'OVERLAP - background only').guides=true;line(layers.GUIDES,[[end,h-s],[end,s]],'SAFE before seam').guides=true;}
      if(c.shape=='circle')line(layers.GUIDES,[[w/2,h+b],[w/2,h-s]],'12 oclock registration').guides=true;
      else {var usable=end-s;for(i=1;i<=2;i++)line(layers.GUIDES,[[s+usable*i/3,h-s],[s+usable*i/3,s]],['','PDP / information','Information / variable'][i]).guides=true;}
      var g=layers.GAUGES;
      text(g,(c.measured?'USER-MEASURED - fit test pending':'PROVISIONAL - UNMEASURED')+' | '+c.name,0,h+b+30,9);
      text(g,'Trim '+c.w+' x '+c.h+' in | bleed '+c.bleed+' in | safe '+c.safe+' in',0,-b-12,8);
      text(g,'8 pt reference - replace with approved copy',0,-b-28,8);
      text(g,'7 pt reference',0,-b-43,7);text(g,'5 pt reference',100,-b-43,5);
      text(g,'WHITE / GLOSS artwork needs Overprint Fill. No automatic underbase.',0,-b-59,8);
      if(c.pdp){var gx=c.shape=='circle'?(w-0.48*72)/2:s,gy=c.shape=='circle'?(h+0.35*72)/2:h-s;
        var sym=g.pathItems.rectangle(gy,gx,0.48*72,0.35*72);sym.name='SYMBOL PLACEHOLDER - 0.480 x 0.350 in - replace with official art';sym.filled=false;sym.stroked=true;sym.strokeWidth=0.5;sym.strokeColor=color(0,60,0,0);
        text(g,'Reference symbol box only; not a compliance approval.',0,-b-75,8);
      }
      var bar=g.pathItems.rectangle(-b-92,0,1.2*72,0.35*72);bar.filled=false;bar.stroked=true;bar.strokeWidth=0.5;bar.name='Barcode zone EXAMPLE ONLY - size for actual symbology';
      text(g,'Barcode + quiet zone example; verify actual code size',0,-b-123,8);
      var sub=outline(layers['SUBSTRATE-SIM'],-b);sub.stroked=false;sub.filled=true;sub.fillColor=c.stock=='Black'?color(0,0,0,100):color(0,0,0,c.stock=='Clear'?8:0);sub.name=c.stock=='Clear'?'Clear film viewing tint ONLY - not a white ink plate':'Substrate preview ONLY';
      for(i=0;i<names.length;i++){var layer=layers[names[i]];if(names[i]=='GUIDES'||names[i]=='GAUGES'||names[i]=='SUBSTRATE-SIM'){layer.printable=false;layer.locked=true;}}
      layers.PERF.visible=false;layers.PERF.locked=true;doc.activeLayer=layers.ART;doc.selection=null;
      return doc;
    }catch(e){if(doc){try{doc.close(SaveOptions.DONOTSAVECHANGES);}catch(ignore){}}throw e;}
  }
  function filename(c){return 'PW_TPL_'+String(c.name).replace(/[^a-zA-Z0-9_-]+/g,'_')+'_'+(c.shape=='circle'?'D'+c.w:c.w+'x'+c.h)+'_v1.ait';}
  function save(doc,c,folder){var f=new File(folder.fsName+'/'+filename(c)),n=2;while(f.exists){f=new File(folder.fsName+'/'+filename(c).replace(/\.ait$/,'_'+n+'.ait'));n++;}var options=new IllustratorSaveOptions();options.pdfCompatible=true;doc.saveAs(f,options);return f;}
  return {products:products,presets:presets,config:config,validate:validate,build:build,save:save,filename:filename};
}());
