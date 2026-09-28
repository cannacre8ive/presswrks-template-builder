import {createHash,createHmac} from 'node:crypto';
import {normalizeProject,projectPacket,INTAKE_LIMIT} from '../src/preflight/intake.mjs';
import {sniff,targetFrom} from '../src/preflight/core.mjs';
const configured=()=>Boolean(process.env.PRESSWRK_INTAKE_URL&&process.env.PRESSWRK_INTAKE_SECRET&&process.env.PRESSWRK_PUBLIC_ORIGIN);
export function validateSubmission(body){
  if(!body||body.consent!==true)throw Error('Consent is required.');
  const p=body.packet;if(!p||!/^[a-f0-9-]{36}$/i.test(p.submissionId))throw Error('Invalid submission reference.');
  normalizeProject(p.project);
  if(typeof body.file!=='string'||body.file.length>Math.ceil(INTAKE_LIMIT/3)*4||!/^[A-Za-z0-9+/]*={0,2}$/.test(body.file))throw Error('Use artwork up to 3 MB.');
  const bytes=Buffer.from(body.file,'base64');if(!bytes.length||bytes.length>INTAKE_LIMIT)throw Error('Use artwork up to 3 MB.');
  const type=sniff(bytes),hash=createHash('sha256').update(bytes).digest('hex'),r=p.artwork;
  if(!r||r.file?.sha256!==hash||r.file?.size!==bytes.length||r.file?.type!==type)throw Error('The artwork does not match its check report. Check the file again.');
  if(!Array.isArray(r.checks)||r.checks.length>50||r.checks.some(c=>!['pass','review','fail'].includes(c.status)||typeof c.label!=='string'||c.label.length>160||typeof c.detail!=='string'||c.detail.length>1200||typeof c.action!=='string'||c.action.length>1200))throw Error('Invalid check report.');
  const t=r.target;if(!t||!['width','height','bleed'].every(k=>Number.isFinite(t[k]))||t.width<.1||t.width>100||t.height<.1||t.height>100||t.bleed<.0625||t.bleed>1)throw Error('Invalid label dimensions.');
  const normalizedTarget=targetFrom({w:t.width,h:t.height,bleed:t.bleed,name:String(t.name||'Label').slice(0,80),shape:['circle','rectangle','wrap'].includes(t.shape)?t.shape:'rectangle'});
  const safeReport={version:1,checkedAt:typeof r.checkedAt==='string'?r.checkedAt.slice(0,40):'',file:{name:String(r.file.name||'artwork').replace(/[\x00-\x1f/\\]/g,'_').slice(0,160),size:bytes.length,type,sha256:hash},target:normalizedTarget,checks:r.checks.map(c=>({label:c.label,status:c.status,detail:c.detail,action:c.action})),outcome:'Unverified client-side check — prepress review required',scope:'Client-reported automated results, not a production approval.'};
  const clean=projectPacket(p.project,safeReport,p.submissionId);clean.status.intake='Received — awaiting review';return {packet:clean,file:bytes.toString('base64')};
}
export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  if(req.method==='GET')return res.status(200).json({enabled:configured(),maxFileBytes:INTAKE_LIMIT});
  if(req.method!=='POST'){res.setHeader('Allow','GET, POST');return res.status(405).json({error:'Method not allowed.'});}
  if(!configured())return res.status(503).json({error:'Online submissions are not connected yet. Save a project brief instead.'});
  if(req.headers.origin!==process.env.PRESSWRK_PUBLIC_ORIGIN)return res.status(403).json({error:'Submit from the PRESSWRK website.'});
  if(!req.headers['content-type']?.startsWith('application/json'))return res.status(415).json({error:'Use a JSON project submission.'});
  let clean;try{const body=typeof req.body==='string'?JSON.parse(req.body):req.body;if(JSON.stringify(body).length>4400000)throw Error('Submission is too large.');clean=validateSubmission(body);}catch(e){return res.status(400).json({error:e.message||'Invalid submission.'});}
  try{
    const url=new URL(process.env.PRESSWRK_INTAKE_URL);if(url.hostname!=='script.google.com'||!url.pathname.endsWith('/exec'))throw Error('Invalid backend configuration');
    const ip=String(req.headers['x-vercel-forwarded-for']||req.headers['x-forwarded-for']||'unknown').split(',')[0].trim();
    const timestamp=Date.now(),payload=JSON.stringify({...clean,rateKey:createHmac('sha256',process.env.PRESSWRK_INTAKE_SECRET).update(ip).digest('hex')});
    const signature=createHmac('sha256',process.env.PRESSWRK_INTAKE_SECRET).update(timestamp+'\n'+payload).digest('hex');
    const result=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({timestamp,payload,signature}),signal:AbortSignal.timeout(55000)});
    const data=await result.json();if(!result.ok||!data.ok)throw Error('Not confirmed');
    return res.status(200).json({ok:true,reference:clean.packet.submissionId});
  }catch(e){return res.status(502).json({error:'Receipt could not be confirmed. Please retry without changing the form. Your submission reference prevents duplicate projects.'});}
}
