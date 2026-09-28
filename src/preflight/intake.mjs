export const INTAKE_LIMIT=3*1024*1024;
const text=(v,max,required=false)=>{if(typeof v!=='string'||v.length>max||(required&&!v.trim()))throw Error('Complete the required project details within the field limits.');return v.trim();};
export function normalizeProject(raw){
  const p={};for(const [key,max,required] of [['name',100,true],['business',120,true],['email',160,true],['phone',60,false],['project',140,true],['material',120,true],['finish',120,false],['deadline',10,false],['notes',3000,false]])p[key]=text(raw[key]||'',max,required);
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email))throw Error('Enter a valid email address.');
  p.quantity=Number(raw.quantity);if(!Number.isInteger(p.quantity)||p.quantity<1||p.quantity>1000000)throw Error('Enter a quantity between 1 and 1,000,000.');
  p.versions=Number(raw.versions);if(!Number.isInteger(p.versions)||p.versions<1||p.versions>1000)throw Error('Enter between 1 and 1,000 artwork versions.');
  if(p.deadline&&!/^\d{4}-\d{2}-\d{2}$/.test(p.deadline))throw Error('Enter a valid requested date.');
  p.artworkHelp=raw.artworkHelp===true;return p;
}
export function projectPacket(project,report,id){
  const t=report.target;
  return {schemaVersion:1,submissionId:id,createdAt:new Date().toISOString(),project:normalizeProject(project),artwork:report,
    status:{intake:'Draft — not submitted',artwork:report.outcome,estimate:'Pending internal costing',proof:'Not approved',production:'Hold — human approval required'},
    estimateInputs:{quantity:Number(project.quantity),versions:Number(project.versions),finishedWidthIn:t.width,finishedHeightIn:t.height,bleedIn:t.bleed,
      netCanvasAreaSqFt:Number(((t.canvasWidth*t.canvasHeight*Number(project.quantity))/144).toFixed(4)),
      exclusions:'Net bounding-box area only. Does not include nesting, roll margins, waste, setup, ink coverage, labor, finishing, shipping, tax or margin. No customer price has been calculated.'}};
}
