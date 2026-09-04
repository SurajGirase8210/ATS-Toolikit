'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Check, ChevronDown, ChevronUp, Copy, Download, FileText, History, Sparkles, Upload } from 'lucide-react';
import { analyzeResume, analyzeJobDescription } from '@/lib/ats-analyzer';
import { SAMPLE_JD, SAMPLE_RESUME } from '@/lib/sample-data';
import { supabase } from '@/lib/supabase';
import type { ATSResult, KeywordMatch } from '@/types/ats';


function ScoreCard({ label, value }: { label: string; value: number }) {
  const tone = value >= 70 ? 'text-emerald-600' : value >= 40 ? 'text-amber-600' : 'text-red-600';
  return <div className="rounded-2xl border bg-white p-5"><div className="text-sm text-slate-500">{label}</div><div className={`mt-2 text-3xl font-black ${tone}`}>{value}<span className="text-base text-slate-400">/100</span></div></div>;
}

function KeywordRow({ k }: { k: KeywordMatch }) {
  const color = k.status === 'found' ? 'bg-emerald-100 text-emerald-700' : k.status === 'low' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700';
  return <tr className="border-b last:border-0"><td className="px-4 py-3 font-medium">{k.keyword}</td><td className="px-4 py-3 text-center">{k.jdCount}</td><td className="px-4 py-3 text-center">{k.resumeCount}</td><td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-xs font-bold ${color}`}>{k.status}</span></td><td className="px-4 py-3 text-xs text-slate-500">{k.category}</td></tr>;
}

export default function OptimizerPage() {
  const [jd, setJd] = useState('');
  const [resume, setResume] = useState('');
  const [result, setResult] = useState<ATSResult | null>(null);
  const [filter, setFilter] = useState<'all' | 'missing' | 'low' | 'found'>('all');
  const [expanded, setExpanded] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [resumeFile, setResumeFile] = useState('');
  const router = useRouter();

  const keywords = useMemo(() => {
    if (!result) return [];
    const all = [...result.keywordsMissing, ...result.keywordsLow, ...result.keywordsFound];
    return filter === 'all' ? all : all.filter(k => k.status === filter);
  }, [result, filter]);

  const analyze = () => {
    if (!jd.trim() || !resume.trim()) return toast.error('Add both a job description and resume first.');
    setResult(analyzeResume(jd, resume));
    toast.success('Resume analyzed.');
  };

  const loadSample = () => { setJd(SAMPLE_JD); setResume(SAMPLE_RESUME); setResult(null); toast.success('Sample data loaded.'); };

  const copyOptimizedChecklist = async () => {
    if (!result) return;
    const text = result.suggestions.slice(0, 12).map((s, i) => `${i + 1}. ${s.title}\n${s.action}`).join('\n\n');
    await navigator.clipboard.writeText(text);
    toast.success('Improvement checklist copied.');
  };

  const saveAnalysis = async () => {
    if (!result) return;
    setSaving(true);
    const client = supabase();
    const { data: auth } = await client.auth.getUser();
    if (!auth.user) { toast.error('Please log in to save analysis history.'); setSaving(false); return; }
    const { error } = await client.from('ats_analyses').insert({
      user_id: auth.user.id,
      job_description: jd,
      job_title: result.jobTitle || null,
      company_name: result.companyName || null,
      overall_score: result.overallScore,
      keyword_score: result.keywordScore,
      format_score: result.formatScore,
      keywords_found: result.keywordsFound,
      keywords_missing: result.keywordsMissing,
      keywords_low: result.keywordsLow,
      format_checks: result.formatChecks,
      suggestions: result.suggestions,
      original_content: resume,
    });
    setSaving(false);
    if (error) toast.error(error.message); else toast.success('Analysis saved to your history.');
  };

  const handleFile = async (file: File) => {
    setResumeFile(file.name);
    const form = new FormData();
    form.append('file', file);
    try {
      const res = await fetch('/api/parse-resume', { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not parse file.');
      setResume(data.text);
      toast.success(`${file.name} imported successfully.`);
    } catch (e:any) {
      toast.error(e.message || 'Could not parse the resume.');
    }
  };

  const editAccordingToChanges = () => {
    if (!result) return;
    const changes:any[] = [];
    const fieldMap:any = {
      'Professional Summary':'summary',
      'Work Experience':'experience',
      'Education':'education',
      'Contact Information':'contact',
      'Skills':'skills',
      'Projects':'projects',
      'Certifications':'certifications'
    };
    result.sections.filter(x => !x.found && fieldMap[x.name]).forEach(x => changes.push({
      type:'section', field:fieldMap[x.name], title:`Add ${x.name} section`,
      placeholder: x.name==='Professional Summary' ? 'Add a truthful 2–4 line summary for the target role.' :
        x.name==='Work Experience' ? 'Add employer, role, dates and truthful achievement bullets.' :
        x.name==='Education' ? 'Add degree, institution, dates and relevant details.' :
        x.name==='Contact Information' ? 'Add phone, email and relevant professional links.' : ''
    }));
    [...result.keywordsMissing, ...result.keywordsLow].filter(k => ['technical','tool','domain','role','certification','soft_skill'].includes(k.category)).slice(0,15).forEach(k => changes.push({
      type:'keyword', keyword:k.keyword, category:k.category, approved:false,
      title:`Review keyword: ${k.keyword}`, description:`JD uses this ${k.category.replace('_',' ')} term. Add it only if it is truthful for you.`
    }));
    localStorage.setItem('ats-resume-changes', JSON.stringify(changes));
    localStorage.setItem('ats-resume-source', resume);
    localStorage.setItem('ats-resume-jd', jd);
    localStorage.setItem('ats-resume-draft', JSON.stringify({name:'',headline:'',contact:'',summary:'',skills:'',experience:'',projects:'',education:'',certifications:'',achievements:'',template:'ats-classic'}));
    toast.success(`${changes.length} reviewable changes prepared. The Smart Editor can also generate full before/after rewrites.`);
    router.push('/resume-builder?from=optimizer');
  };

  const printReport = () => window.print();

  return <div className="container py-10 print:py-0">
    <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
      <div><div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700"><Sparkles size={14}/> Advanced ATS analysis</div><h1 className="mt-4 text-4xl font-black tracking-tight">ATS Resume Optimizer</h1><p className="mt-2 max-w-3xl text-slate-600">A deterministic analyzer that focuses on meaningful skills and phrases instead of blindly counting every word in the job description.</p></div>
      <button onClick={loadSample} className="rounded-xl border bg-white px-4 py-2 text-sm font-bold hover:bg-slate-50 print:hidden">Load sample</button>
    </div>

    <div className="mt-8 grid gap-6 lg:grid-cols-2">
      <section className="rounded-2xl border bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><label className="font-bold">Job Description</label><span className="text-xs text-slate-400">{jd.length} chars</span></div><textarea value={jd} onChange={e => setJd(e.target.value)} rows={18} className="mt-3 w-full rounded-xl border p-4 outline-none focus:border-blue-500" placeholder="Paste the full job description..." /></section>
      <section className="rounded-2xl border bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><label className="font-bold">Resume</label><span className="text-xs text-slate-400">{resume.trim().split(/\s+/).filter(Boolean).length} words</span></div><textarea value={resume} onChange={e => setResume(e.target.value)} rows={18} className="mt-3 w-full rounded-xl border p-4 outline-none focus:border-blue-500" placeholder="Paste your resume text..." /><div className="mt-3 flex items-center gap-3"><label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold hover:bg-slate-50"><Upload size={16}/> Upload PDF / DOCX / TXT<input type="file" accept=".txt,.pdf,.docx,text/plain,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}/></label>{resumeFile && <span className="text-xs text-slate-500">{resumeFile}</span>}</div></section>
    </div>

    {jd.trim() && <div className="mt-5 rounded-2xl border bg-slate-50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><p className="text-xs font-black uppercase tracking-wide text-slate-400">Job understanding</p><p className="mt-1 text-sm text-slate-600">The analyzer classifies requirements instead of treating every word as equally important.</p></div>
        <span className="text-xs text-slate-500">{analyzeJobDescription(jd).requirements.length} meaningful requirements detected</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">{analyzeJobDescription(jd).requirements.slice(0,12).map(r=><span key={r.term} className="rounded-full border bg-white px-3 py-1 text-xs font-semibold">{r.term} · {r.category.replace('_',' ')}</span>)}</div>
    </div>}

    <div className="mt-6 flex flex-wrap gap-3 print:hidden"><button onClick={analyze} disabled={!jd.trim() || !resume.trim()} className="rounded-xl bg-blue-600 px-6 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">Analyze Resume</button>{result && <><button onClick={saveAnalysis} disabled={saving} className="inline-flex items-center gap-2 rounded-xl border bg-white px-5 py-3 font-bold"><History size={17}/>{saving ? 'Saving...' : 'Save Analysis'}</button><button onClick={copyOptimizedChecklist} className="inline-flex items-center gap-2 rounded-xl border bg-white px-5 py-3 font-bold"><Copy size={17}/> Copy Checklist</button><Link href="/interview-prep" className="inline-flex items-center gap-2 rounded-xl border bg-white px-5 py-3 font-bold">Interview Prep</Link><button onClick={printReport} className="inline-flex items-center gap-2 rounded-xl border bg-white px-5 py-3 font-bold"><Download size={17}/> Print / PDF</button><button onClick={editAccordingToChanges} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 font-bold text-white"><Sparkles size={17}/> Edit Resume According to Changes</button></>}</div>

    {result && <div className="mt-10 space-y-6" id="analysis-report">
      <section className="rounded-3xl border bg-white p-6 shadow-sm"><div className="flex flex-col justify-between gap-6 md:flex-row"><div><p className="text-sm font-semibold text-slate-500">Overall ATS score</p><div className={`mt-1 text-7xl font-black ${result.overallScore >= 70 ? 'text-emerald-600' : result.overallScore >= 40 ? 'text-amber-600' : 'text-red-600'}`}>{result.overallScore}<span className="text-2xl text-slate-400">/100</span></div><p className="mt-3 max-w-2xl text-slate-600">{result.summary}</p></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-4"><ScoreCard label="Keywords" value={result.keywordScore}/><ScoreCard label="Format" value={result.formatScore}/><ScoreCard label="Sections" value={result.sectionScore}/><ScoreCard label="Content" value={result.contentScore}/><ScoreCard label="Job Fit" value={result.jobFitScore ?? result.overallScore}/><ScoreCard label="Resume Quality" value={result.resumeQualityScore ?? result.overallScore}/></div></div></section>

      {result.matchDimensions && <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between"><div><h2 className="text-xl font-black">Job-fit breakdown</h2><p className="text-sm text-slate-500">A directional match model, not an employer's actual ATS score.</p></div><span className="rounded-xl bg-blue-50 px-3 py-2 text-sm font-black text-blue-700">Fit {result.jobFitScore}/100</span></div>
        <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{result.matchDimensions.map(d=><div key={d.label} className="rounded-xl border p-4"><div className="flex justify-between text-sm font-bold"><span>{d.label}</span><span>{d.score}</span></div><div className="mt-2 h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-blue-600" style={{width:`${d.score}%`}}/></div><p className="mt-2 text-xs text-slate-500">{d.detail}</p></div>)}</div>
      </section>}

      <section className="rounded-2xl border bg-white p-5 shadow-sm"><div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div><h2 className="text-xl font-black">Resume ↔ JD match map</h2><p className="mt-1 text-sm text-slate-500">Exact keywords are only one signal. Concept matching catches related evidence without forcing keyword stuffing.</p></div><div className="rounded-xl bg-slate-50 px-4 py-3"><div className="text-xs font-bold uppercase text-slate-400">Semantic alignment</div><div className="text-2xl font-black">{result.semanticScore}/100</div></div></div><div className="mt-5 grid gap-3 md:grid-cols-2">{result.semanticMatches.filter(x=>x.jdTerms.length).map(x=><div key={x.concept} className="rounded-xl border p-4"><div className="flex items-center justify-between gap-2"><span className="font-bold">{x.concept}</span><span className={`rounded-full px-2 py-1 text-xs font-bold ${x.matched?'bg-emerald-100 text-emerald-700':'bg-red-100 text-red-700'}`}>{x.matched?'Matched':'Gap'}</span></div><div className="mt-2 text-xs text-slate-500">JD: {x.jdTerms.join(', ')}</div><div className="mt-1 text-xs text-slate-500">Resume: {x.resumeTerms.length?x.resumeTerms.join(', '):'No clear evidence'}</div></div>)}</div>{result.toneChecks.some(x=>!x.passed)&&<div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm"><b>Tone review:</b> {result.toneChecks.filter(x=>!x.passed).map(x=>x.name).join(', ')}. Review the wording manually.</div>}</section>

      {result.evidenceWarnings?.length ? <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <h2 className="font-black text-amber-900">Truthfulness guard</h2><p className="mt-1 text-sm text-amber-800">These are gaps to review, not keywords you should blindly add.</p>
        <ul className="mt-3 space-y-2 text-sm text-amber-900">{result.evidenceWarnings.map(w=><li key={w}>• {w}</li>)}</ul>
      </section> : null}

      <div className="grid gap-6 lg:grid-cols-3"><section className="rounded-2xl border bg-white p-5"><h2 className="font-black">Resume health</h2><div className="mt-4 grid grid-cols-2 gap-3">{Object.entries(result.resumeStats).map(([k,v]) => <div key={k} className="rounded-xl bg-slate-50 p-3"><div className="text-xl font-black">{v}</div><div className="text-xs capitalize text-slate-500">{k.replace(/([A-Z])/g, ' $1')}</div></div>)}</div></section><section className="rounded-2xl border bg-white p-5"><h2 className="font-black">Strengths</h2><ul className="mt-4 space-y-2 text-sm">{result.strengths.length ? result.strengths.map(x => <li key={x}><Check className="mr-2 inline text-emerald-600" size={16}/>{x}</li>) : <li className="text-slate-500">No major strengths detected yet.</li>}</ul></section><section className="rounded-2xl border bg-white p-5"><h2 className="font-black">Risks</h2><ul className="mt-4 space-y-2 text-sm">{result.risks.length ? result.risks.map(x => <li key={x} className="text-slate-700">• {x}</li>) : <li className="text-slate-500">No major risks detected.</li>}</ul></section></div>

      <section className="rounded-2xl border bg-white p-5 shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-xl font-black">Keyword intelligence</h2><p className="text-sm text-slate-500">Technical skills and meaningful phrases are weighted more heavily than generic words.</p></div><div className="flex gap-2 print:hidden">{(['all','missing','low','found'] as const).map(x => <button key={x} onClick={() => setFilter(x)} className={`rounded-lg px-3 py-2 text-xs font-bold ${filter === x ? 'bg-slate-900 text-white' : 'bg-slate-100'}`}>{x}</button>)}</div></div><div className="mt-4 overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b text-left text-xs uppercase text-slate-500"><th className="px-4 py-3">Keyword</th><th className="px-4 py-3 text-center">JD</th><th className="px-4 py-3 text-center">Resume</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Category</th></tr></thead><tbody>{keywords.slice(0, 40).map(k => <KeywordRow key={`${k.keyword}-${k.status}`} k={k}/>)}</tbody></table></div></section>

      <div className="grid gap-6 lg:grid-cols-2"><section className="rounded-2xl border bg-white p-5"><h2 className="text-xl font-black">ATS format checks</h2><div className="mt-4 space-y-3">{result.formatChecks.map((x,i)=><div key={x.name} className="rounded-xl border p-4"><button className="flex w-full items-center justify-between text-left" onClick={() => setExpanded(expanded === i ? null : i)}><span><span className={`mr-2 inline-block h-2.5 w-2.5 rounded-full ${x.passed ? 'bg-emerald-500' : x.severity === 'high' ? 'bg-red-500' : 'bg-amber-500'}`}/>{x.name}</span>{expanded === i ? <ChevronUp size={17}/> : <ChevronDown size={17}/>}</button>{expanded === i && <div className="mt-3 text-sm text-slate-600"><p>{x.description}</p><p className="mt-2 font-semibold text-blue-700">Fix: {x.fix}</p></div>}</div>)}</div></section><section className="rounded-2xl border bg-white p-5"><h2 className="text-xl font-black">Section completeness</h2><div className="mt-4 space-y-2">{result.sections.map(x => <div key={x.name} className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-sm"><span>{x.name}{x.required && <span className="ml-2 text-xs text-slate-400">required</span>}</span><span className={x.found ? 'font-bold text-emerald-600' : 'font-bold text-red-600'}>{x.found ? 'Found' : 'Missing'}</span></div>)}</div></section></div>

      <section className="rounded-2xl border bg-white p-5 shadow-sm"><h2 className="text-xl font-black">Prioritized improvement plan</h2><div className="mt-4 grid gap-3 md:grid-cols-2">{result.suggestions.map((s,i)=><div key={`${s.title}-${i}`} className="rounded-xl border p-4"><div className="flex items-start gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-black text-blue-700">{i+1}</span><div><h3 className="font-bold">{s.title}</h3><p className="mt-1 text-sm text-slate-600">{s.description}</p><p className="mt-2 text-sm font-semibold text-blue-700">Action: {s.action}</p></div></div></div>)}</div></section>
    </div>}
  </div>;
}
