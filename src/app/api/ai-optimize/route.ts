import { NextResponse } from 'next/server';
import { analyzeResume } from '@/lib/ats-analyzer';

export const runtime = 'nodejs';

const SYSTEM = `You are an evidence-first AI resume editor. You edit resume CONTENT and controlled VISUAL/LAYOUT properties. Never invent employers, dates, degrees, certifications, tools, metrics, awards, responsibilities, achievements, or experience. You may rewrite wording only when supported by the supplied resume, reorder sections, remove repetition, add a missing section only as an explicit placeholder, and change controlled design properties such as boldness, font sizes, spacing, margins, alignment, section order, and template choice.

Project structure matters. Identify project headers separately from project bullets. A project header is usually a non-bullet line followed by one or more bullet lines, and should be visually bold. Do not turn project headers into bullets. Preserve technology stacks on the project header when they are supplied.

For unsupported JD requirements, mark them unsupported instead of adding them. Every change must be small, reviewable and actionable. Use type=content for text edits and type=layout for visual/structural edits. Allowed layout targets: projects.title, projects.title.size, experience.title, section.heading, section.summary.size, header.name, header.headline, header.contact, document.margins, document.spacing, document.lineHeight, document.bodySize, section.order, template.id. Allowed layout actions: set, increase, decrease, move, hide, remove, switch. Never return arbitrary CSS, HTML, code, or file paths. If the user asks for a visual change, return a layout change even if no JD is supplied. Return only the requested JSON schema.`;

const schema = {
  type: 'object',
  properties: {
    changes: { type: 'array', items: {
      type: 'object',
      properties: {
        id: { type: 'string' }, type: { type: 'string', enum: ['content','layout'] },
        field: { type: 'string' }, target: { type: 'string' }, action: { type: 'string', enum: ['set','increase','decrease','move','hide','remove','switch'] },
        value: { type: 'string' }, title: { type: 'string' }, before: { type: 'string' }, after: { type: 'string' }, reason: { type: 'string' }, evidence: { type: 'string' }, risk: { type: 'string', enum: ['safe','review','unsupported'] }, apply: { type: 'boolean' }
      }, required: ['id','type','field','target','action','value','title','before','after','reason','evidence','risk','apply']
    }},
    notes: { type: 'array', items: { type: 'string' } }
  }, required: ['changes','notes']
};

function cleanResult(result:any) {
  const changes = Array.isArray(result?.changes) ? result.changes : [];
  const allowedTargets = new Set(['projects.title','projects.title.size','experience.title','section.heading','section.summary.size','header.name','header.headline','header.contact','document.margins','document.spacing','document.lineHeight','document.bodySize','section.order','template.id']);
  const allowedActions = new Set(['set','increase','decrease','move','hide','remove','switch']);
  return { changes: changes.map((c:any,i:number)=>({
    id:String(c.id||`change-${i}`),
    type:c.type==='layout'?'layout':'content',
    field:String(c.field||''),
    target:String(c.target||''),
    action:allowedActions.has(c.action)?c.action:'set',
    value:String(c.value??''),
    title:String(c.title||'Resume improvement'),
    before:String(c.before||''),
    after:String(c.after||''),
    reason:String(c.reason||''),
    evidence:String(c.evidence||''),
    risk:['safe','review','unsupported'].includes(c.risk)?c.risk:'review',
    apply:c.apply!==false && (c.type!=='layout' || allowedTargets.has(String(c.target||'')))
  })), notes:Array.isArray(result?.notes)?result.notes.map(String):[] };
}

function fallback(jd:string,resume:string,instruction:string){
  const r=analyzeResume(jd||'resume improvement',resume); const changes:any[]=[];
  r.suggestions.forEach((s:any,i:number)=>changes.push({id:`rule-${i}`,type:'content',field:s.type?.toLowerCase().includes('summary')?'summary':s.type?.toLowerCase().includes('skill')?'skills':'experience',target:'',action:'set',value:'',title:s.title,before:'',after:'',reason:s.action,evidence:s.description,risk:'review',apply:false}));
  r.keywordsMissing.slice(0,12).forEach((k:any,i:number)=>changes.push({id:`keyword-${i}`,type:'content',field:'skills',target:'',action:'set',value:k.keyword,title:`Review missing requirement: ${k.keyword}`,before:'',after:'',reason:`The job description uses “${k.keyword}”. Add it only if you genuinely have this skill or evidence.`,evidence:`JD frequency: ${k.jdCount}. No clear resume evidence was found.`,risk:'unsupported',apply:false}));
  const lower=instruction.toLowerCase();
  if(/bold|stronger font|font weight/.test(lower)) changes.push({id:'layout-bold-projects',type:'layout',field:'design',target:'projects.title',action:'set',value:'700',title:'Make project titles bold',before:'Current project title weight',after:'700',reason:'Matches the requested visual hierarchy.',evidence:'User instruction',risk:'safe',apply:true});
  if(/larger|increase.*project.*title|project.*size/.test(lower)) changes.push({id:'layout-size-projects',type:'layout',field:'design',target:'projects.title.size',action:'set',value:'12',title:'Increase project title size',before:'Current project title size',after:'12',reason:'Improves project hierarchy without changing content.',evidence:'User instruction',risk:'safe',apply:true});
  return {changes,notes:['Rules mode was used because Gemini was unavailable. Visual edits that can be safely handled locally are still available.']};
}

function localLayoutChanges(instruction:string){
  const lower=instruction.toLowerCase();
  const changes:any[]=[];
  const hasProject=lower.includes('project');
  const hasSummary=/(summary|profile|professional summary)/.test(lower);
  if(hasSummary && /(larger|bigger|increase|enlarge|make.*size|font.*size)/.test(lower) && !/(smaller|reduce|decrease|shrink)/.test(lower)){
    changes.push({id:'local-summary-size',type:'layout',field:'design',target:'section.summary.size',action:'set',value:'13',title:'Make the summary text larger',before:'Current summary text size',after:'13',reason:'Improves the summary hierarchy while keeping the resume structure unchanged.',evidence:'User instruction',risk:'safe',apply:true});
  }
  if(hasSummary && /(smaller|reduce|decrease|shrink)/.test(lower) && /(size|font|summary)/.test(lower)){
    changes.push({id:'local-summary-size-down',type:'layout',field:'design',target:'section.summary.size',action:'set',value:'10',title:'Reduce summary text size',before:'Current summary text size',after:'10',reason:'Creates a more compact summary without changing its content.',evidence:'User instruction',risk:'safe',apply:true});
  }
  if(hasProject && /(bold|bolden|stronger font|font weight|heavier)/.test(lower)){
    changes.push({id:'local-project-title-bold',type:'layout',field:'design',target:'projects.title',action:'set',value:'700',title:'Make project titles bold',before:'Current project title weight',after:'700',reason:'Creates a clear project hierarchy and matches the requested formatting.',evidence:'User instruction',risk:'safe',apply:true});
  }
  if(hasProject && /(larger|bigger|increase.*(project|title).*size|(project|title).*size)/.test(lower)){
    changes.push({id:'local-project-title-size',type:'layout',field:'design',target:'projects.title.size',action:'set',value:'12',title:'Increase project title size',before:'Current project title size',after:'12',reason:'Improves project-title hierarchy without changing content.',evidence:'User instruction',risk:'safe',apply:true});
  }
  if(/(section|skills|projects|education|experience).*(above|before)|move.*(skills|projects|education|experience)/.test(lower)){
    const orderMatch=lower.match(/(skills|projects|education|experience).*(?:above|before|after).*(skills|projects|education|experience)/);
    if(orderMatch){
      const wanted=orderMatch[1], before=orderMatch[2];
      if(wanted!==before){
        changes.push({id:`local-order-${wanted}-${before}`,type:'layout',field:'design',target:'section.order',action:'move',value:wanted,title:`Move ${wanted} section`,before,after:wanted,reason:`Reorders the section as requested.`,evidence:'User instruction',risk:'safe',apply:true});
      }
    }
  }
  if(/reduce.*spacing|less.*spacing|tighten.*spacing|compact.*spacing/.test(lower)){
    changes.push({id:'local-spacing-decrease',type:'layout',field:'design',target:'document.spacing',action:'decrease',value:'2',title:'Reduce section spacing',before:'Current section spacing',after:'2',reason:'Creates a more compact layout while keeping readable typography.',evidence:'User instruction',risk:'safe',apply:true});
  }
  if(/increase.*spacing|more.*spacing|loosen.*spacing/.test(lower)){
    changes.push({id:'local-spacing-increase',type:'layout',field:'design',target:'document.spacing',action:'increase',value:'5',title:'Increase section spacing',before:'Current section spacing',after:'5',reason:'Adds visual separation between sections.',evidence:'User instruction',risk:'safe',apply:true});
  }
  if(/(smaller|reduce).*margin|narrow.*margin/.test(lower)){
    changes.push({id:'local-margins',type:'layout',field:'design',target:'document.margins',action:'decrease',value:'32',title:'Reduce document margins',before:'Current margins',after:'32',reason:'Creates additional usable page space without changing content.',evidence:'User instruction',risk:'safe',apply:true});
  }
  if(/(ats.?friendly|ats compatibility|ats format)/.test(lower)){
    changes.push({id:'local-ats-template',type:'layout',field:'design',target:'template.id',action:'switch',value:'ats-classic',title:'Use an ATS-friendly single-column template',before:'Current template',after:'ATS Classic',reason:'Single-column structure is safer for automated parsing than decorative layouts.',evidence:'User instruction',risk:'safe',apply:true});
  }
  return changes;
}

function geminiSchemaCompatible(value:any):any {
  if (Array.isArray(value)) return value.map(geminiSchemaCompatible);
  if (!value || typeof value !== 'object') return value;
  const out:any = {};
  for (const [key,val] of Object.entries(value)) {
    if (key === 'additionalProperties') continue;
    out[key] = geminiSchemaCompatible(val);
  }
  return out;
}

async function callGemini(apiKey:string,models:string[],prompt:string){
  const controller = new AbortController();
  const timeoutMs = Math.max(8000, Math.min(30000, Number(process.env.GEMINI_TIMEOUT_MS || 20000)));
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  let lastError = '';
  try{
    for(const model of models){
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,{
        method:'POST',
        headers:{'Content-Type':'application/json','x-goog-api-key':apiKey},
        signal:controller.signal,
        body:JSON.stringify({
          systemInstruction:{parts:[{text:SYSTEM}]},
          contents:[{role:'user',parts:[{text:prompt}]}],
          generationConfig:{
            responseMimeType:'application/json',
            responseSchema:geminiSchemaCompatible(schema),
            maxOutputTokens:Number(process.env.GEMINI_MAX_OUTPUT_TOKENS || 2500),
            thinkingConfig:{thinkingLevel:process.env.GEMINI_THINKING_LEVEL || 'low'}
          }
        })
      });
      const raw=await response.text();
      if(response.ok){
        const data=JSON.parse(raw);
        const text=data?.candidates?.[0]?.content?.parts?.map((x:any)=>x?.text||'').join('') || '';
        if(!text.trim()) throw new Error('Gemini returned an empty response.');
        return cleanResult(JSON.parse(text));
      }
      let detail=raw;
      try{const j=JSON.parse(raw);detail=j?.error?.message||detail;}catch{}
      lastError=`Gemini API error (${response.status}): ${detail}`;
      if(![429,500,502,503,504].includes(response.status)) break;
    }
    throw new Error(lastError || 'Gemini request failed.');
  }catch(error:any){
    if(error?.name==='AbortError') throw new Error(`Gemini request timed out after ${timeoutMs/1000}s. The resume was not changed.`);
    throw error;
  }finally{ clearTimeout(timer); }
}
export async function POST(req:Request){
  try{
    const body=await req.json();
    const jd=String(body?.jd||'').trim(); const resume=String(body?.resume||'').trim(); const instruction=String(body?.instruction||'').trim();
    if(!resume) return NextResponse.json({error:'Resume content is required.'},{status:400});
    if(!jd && !instruction) return NextResponse.json({error:'Add a job description or an AI editing instruction.'},{status:400});
    const prompt=`USER INSTRUCTION:\n${instruction||'Generate comprehensive evidence-safe improvements for this job.'}\n\nJOB DESCRIPTION (may be empty):\n${jd}\n\nCURRENT RESUME:\n${resume}\n\nReturn all high-value changes you can safely support. Inspect content structure, project headers, section hierarchy, chronology, ATS formatting, typography hierarchy, spacing, page-fit, and visual consistency. If project names are present, make project-title formatting a layout change rather than rewriting the project name. Never invent facts.`;
    const localChanges=localLayoutChanges(instruction);
    const layoutOnly=localChanges.length>0 && !jd && !/(rewrite|tailor|improve|optimize|summary|bullet|keyword|experience|skill|job description|jd)/i.test(instruction);
    if(layoutOnly){
      return NextResponse.json({changes:localChanges,notes:['This visual edit was handled locally for immediate response.'],provider:'local'});
    }
    if(process.env.GEMINI_API_KEY){
      try{
        const models=[process.env.GEMINI_MODEL||'gemini-3.7-flash', ...(process.env.GEMINI_FALLBACK_MODELS||'gemini-3.1-flash-lite,gemini-2.5-flash-lite').split(',').map((x:string)=>x.trim()).filter(Boolean)].filter((m:string,i:number,a:string[])=>a.indexOf(m)===i);
        const result=await callGemini(process.env.GEMINI_API_KEY,models,prompt);
        return NextResponse.json({...result,provider:'gemini'});
      }catch(error:any){
        const message=String(error?.message||'Gemini request failed.');
        const local=fallback(jd,resume,instruction);
        const merged = [...localChanges, ...(local.changes||[])].filter((c:any,i:number,arr:any[]) => arr.findIndex((x:any)=>x.id===c.id)===i);
        console.error('Gemini request failed:', message);
        return NextResponse.json({
          ...local, changes: merged,
          provider:'rules-fallback',
          geminiError: message,
          notes:[`Gemini was unavailable, so safe local/rules suggestions were returned. Gemini error: ${message}`,...(local.notes||[])]
        });
      }
    }
    const local = localLayoutChanges(instruction);
    if(local.length && !jd) return NextResponse.json({changes:local,notes:['Visual edit handled locally for immediate response.'],provider:'local'});
    return NextResponse.json({...fallback(jd,resume,instruction),provider:'rules'});
  }catch(error:any){
    console.error('AI optimize error:',error);
    return NextResponse.json({error:error?.message||'Could not generate resume changes.'},{status:500});
  }
}
