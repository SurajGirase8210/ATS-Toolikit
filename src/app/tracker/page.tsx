'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Job, JobStatus, Priority } from '@/types/job';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import TextArea from '@/components/ui/TextArea';
import { Download, ExternalLink, Pencil, Plus, Search, Trash2, X, Bell, BriefcaseBusiness, Clock3, CheckCircle2, XCircle } from 'lucide-react';import {SAMPLE_APPLICATIONS} from '@/lib/sample-data';

const statuses: JobStatus[] = ['wishlist','applied','under_review','screening','interview','technical','final_round','offer','rejected','withdrawn'];
const priorities: Priority[] = ['low','medium','high'];
const statusLabel = (s: JobStatus) => s.replace('_',' ').replace(/\b\w/g, c => c.toUpperCase());
const priorityVariant = (p: Priority) => p === 'high' ? 'danger' : p === 'medium' ? 'warning' : 'default';

const emptyForm = {
  company_name: '', job_title: '', job_url: '', location: '', salary_range: '', job_type: 'Full-time',
  status: 'applied' as JobStatus, priority: 'medium' as Priority, date_applied: new Date().toISOString().slice(0,10),
  follow_up_date: '', recruiter_name: '', recruiter_email: '', recruiter_phone: '', notes: '', job_description: ''
};

type FormState = typeof emptyForm;

export default function Tracker() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editing, setEditing] = useState<Job | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [query, setQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | JobStatus>('all');
  const [filterPriority, setFilterPriority] = useState<'all' | Priority>('all');
  const [view, setView] = useState<'cards' | 'pipeline'>('cards');
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const { data, error } = await supabase().from('job_applications').select('*').order('created_at', { ascending: false });
    if (error) return alert(error.message);
    setJobs((data || []) as Job[]);
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => jobs.filter(j => {
    const haystack = [j.company_name, j.job_title, j.location, j.recruiter_name, j.notes].filter(Boolean).join(' ').toLowerCase();
    return (!query || haystack.includes(query.toLowerCase())) &&
      (filterStatus === 'all' || j.status === filterStatus) &&
      (filterPriority === 'all' || j.priority === filterPriority);
  }), [jobs, query, filterStatus, filterPriority]);

  const stats = useMemo(() => {
    const interviews = jobs.filter(j => ['interview','technical','final_round'].includes(j.status)).length;
    const offers = jobs.filter(j => j.status === 'offer').length;
    const rejected = jobs.filter(j => j.status === 'rejected').length;
    const today = new Date().toISOString().slice(0,10);
    const overdue = jobs.filter(j => j.follow_up_date && j.follow_up_date < today && !['rejected','withdrawn','offer'].includes(j.status)).length;
    return { total: jobs.length, interviews, offers, rejected, overdue };
  }, [jobs]);

  const loadSample = async () => { const {data:auth}=await supabase().auth.getUser(); if(!auth.user){alert('Please log in first');return;} setLoading(true); const rows=SAMPLE_APPLICATIONS.map(x=>({...x,user_id:auth.user!.id})); const {error}=await supabase().from('job_applications').insert(rows); if(error) alert(error.message); else {await load(); alert('Sample applications added.');} setLoading(false); };

  const reset = () => { setForm(emptyForm); setEditing(null); setShowForm(false); };
  const editJob = (job: Job) => {
    setEditing(job);
    setForm({ ...emptyForm, ...job, job_url: job.job_url || '', location: job.location || '', salary_range: job.salary_range || '', job_type: job.job_type || 'Full-time', date_applied: job.date_applied || '', follow_up_date: job.follow_up_date || '', recruiter_name: job.recruiter_name || '', recruiter_email: job.recruiter_email || '', recruiter_phone: (job as any).recruiter_phone || '', notes: job.notes || '', job_description: (job as any).job_description || '' });
    setShowForm(true);
  };

  const save = async () => {
    if (!form.company_name.trim() || !form.job_title.trim()) return;
    setLoading(true);
    const { data: auth } = await supabase().auth.getUser();
    if (!auth.user) { alert('Please log in first'); setLoading(false); return; }
    const payload = { ...form, user_id: auth.user.id, updated_at: new Date().toISOString(), date_last_update: new Date().toISOString() };
    const result = editing
      ? await supabase().from('job_applications').update(payload).eq('id', editing.id)
      : await supabase().from('job_applications').insert(payload);
    if (result.error) alert(result.error.message); else { await load(); reset(); }
    setLoading(false);
  };

  const remove = async (job: Job) => {
    if (!confirm(`Delete ${job.job_title} at ${job.company_name}?`)) return;
    const { error } = await supabase().from('job_applications').delete().eq('id', job.id);
    if (error) alert(error.message); else setJobs(prev => prev.filter(x => x.id !== job.id));
  };

  const exportCsv = () => {
    const rows = filtered.map(j => [j.company_name,j.job_title,j.status,j.priority,j.location||'',j.date_applied||'',j.follow_up_date||'',j.recruiter_name||'',j.recruiter_email||'',j.salary_range||'',j.job_url||'']);
    const csv = [['Company','Job Title','Status','Priority','Location','Date Applied','Follow Up','Recruiter','Recruiter Email','Salary','Job URL'], ...rows]
      .map(row => row.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'ats-applications.csv'; a.click(); URL.revokeObjectURL(url);
  };

  const field = (key: keyof FormState, value: string) => setForm(prev => ({ ...prev, [key]: value }));
  const today = new Date().toISOString().slice(0,10);

  return <div className="container py-10">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><h1 className="text-4xl font-black">Application Command Center</h1><p className="mt-2 text-slate-600">Track every application, follow-up, interview and offer from one place.</p></div>
      <div className="flex flex-wrap gap-2"><Button variant="outline" onClick={loadSample}>Load sample</Button><Button variant="outline" onClick={exportCsv} icon={<Download size={16}/>}>Export CSV</Button><Button onClick={() => { setEditing(null); setForm(emptyForm); setShowForm(true); }} icon={<Plus size={17}/>}>Add application</Button></div>
    </div>

    <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {[
        ['Applications', stats.total, <BriefcaseBusiness size={18}/>], ['Interviews', stats.interviews, <Clock3 size={18}/>], ['Offers', stats.offers, <CheckCircle2 size={18}/>], ['Rejected', stats.rejected, <XCircle size={18}/>], ['Overdue follow-ups', stats.overdue, <Bell size={18}/>]
      ].map(([label,value,icon]) => <Card key={String(label)}><div className="flex items-center justify-between"><span className="text-sm text-slate-500">{label}</span>{icon}</div><div className="mt-2 text-3xl font-black">{value as number}</div></Card>)}
    </div>

    <Card className="mt-7">
      <div className="grid gap-3 md:grid-cols-[1fr_180px_160px_auto_auto]">
        <div className="relative"><Search size={17} className="absolute left-3 top-3 text-slate-400"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search company, role, recruiter..." className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3"/></div>
        <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value as any)} className="rounded-lg border border-slate-300 px-3"><option value="all">All statuses</option>{statuses.map(s=><option key={s}>{s}</option>)}</select>
        <select value={filterPriority} onChange={e=>setFilterPriority(e.target.value as any)} className="rounded-lg border border-slate-300 px-3"><option value="all">All priorities</option>{priorities.map(p=><option key={p}>{p}</option>)}</select>
        <Button variant={view==='cards'?'secondary':'outline'} onClick={()=>setView('cards')}>Cards</Button>
        <Button variant={view==='pipeline'?'secondary':'outline'} onClick={()=>setView('pipeline')}>Pipeline</Button>
      </div>
    </Card>

    {showForm && <Card className="mt-7 border-blue-200">
      <div className="flex items-center justify-between"><h2 className="text-xl font-bold">{editing ? 'Edit application' : 'New application'}</h2><button onClick={reset}><X/></button></div>
      <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Input label="Company *" value={form.company_name} onChange={e=>field('company_name',e.target.value)} placeholder="Acme Corp"/>
        <Input label="Job title *" value={form.job_title} onChange={e=>field('job_title',e.target.value)} placeholder="Data Analyst"/>
        <Input label="Job URL" value={form.job_url} onChange={e=>field('job_url',e.target.value)} placeholder="https://..."/>
        <Input label="Location" value={form.location} onChange={e=>field('location',e.target.value)} placeholder="Mumbai / Remote"/>
        <Input label="Salary range" value={form.salary_range} onChange={e=>field('salary_range',e.target.value)} placeholder="₹5-8 LPA"/>
        <Input label="Job type" value={form.job_type} onChange={e=>field('job_type',e.target.value)} placeholder="Full-time"/>
        <Input label="Date applied" type="date" value={form.date_applied} onChange={e=>field('date_applied',e.target.value)}/>
        <Input label="Follow-up date" type="date" value={form.follow_up_date} onChange={e=>field('follow_up_date',e.target.value)}/>
        <Input label="Recruiter name" value={form.recruiter_name} onChange={e=>field('recruiter_name',e.target.value)} placeholder="Recruiter"/>
        <Input label="Recruiter email" type="email" value={form.recruiter_email} onChange={e=>field('recruiter_email',e.target.value)} placeholder="name@company.com"/>
        <Input label="Recruiter phone" value={form.recruiter_phone} onChange={e=>field('recruiter_phone',e.target.value)} placeholder="Optional"/>
        <label className="block space-y-1.5"><span className="text-sm font-medium">Status</span><select value={form.status} onChange={e=>field('status',e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5">{statuses.map(s=><option key={s} value={s}>{statusLabel(s)}</option>)}</select></label>
        <label className="block space-y-1.5"><span className="text-sm font-medium">Priority</span><select value={form.priority} onChange={e=>field('priority',e.target.value)} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5">{priorities.map(p=><option key={p}>{p}</option>)}</select></label>
        <div className="lg:col-span-3"><TextArea label="Notes" value={form.notes} onChange={e=>field('notes',e.target.value)} placeholder="Interview details, recruiter notes, next steps..." rows={4}/></div>
      </div>
      <div className="mt-4 flex justify-end gap-2"><Button variant="outline" onClick={reset}>Cancel</Button><Button onClick={save} loading={loading} disabled={!form.company_name || !form.job_title}>{editing ? 'Save changes' : 'Create application'}</Button></div>
    </Card>}

    {view === 'cards' ? <div className="mt-7 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{filtered.map(j => <JobCard key={j.id} job={j} today={today} onEdit={()=>editJob(j)} onDelete={()=>remove(j)}/>)}</div> : <Pipeline jobs={filtered} onEdit={editJob}/>} 
    {filtered.length===0 && <Card className="mt-7 py-16 text-center text-slate-500">No applications match your filters.</Card>}
  </div>;
}

function followUpDraft(job:Job){
  const recruiter=job.recruiter_name ? ` ${job.recruiter_name}` : '';
  return `Subject: Follow-up on ${job.job_title} application at ${job.company_name}\n\nHello${recruiter},\n\nI’m following up on my application for the ${job.job_title} position at ${job.company_name}. I remain very interested in the opportunity and would be happy to provide any additional information needed.\n\nThank you for your time.\nBest regards`;
}
function JobCard({job,today,onEdit,onDelete}:{job:Job;today:string;onEdit:()=>void;onDelete:()=>void}) {
  const overdue = !!job.follow_up_date && job.follow_up_date < today && !['rejected','withdrawn','offer'].includes(job.status);
  return <Card hover>
    <div className="flex items-start justify-between gap-3"><div><h2 className="font-bold text-lg">{job.job_title}</h2><p className="text-slate-600">{job.company_name}</p></div><Badge variant={job.status==='rejected'?'danger':job.status==='offer'?'success':job.status==='interview'||job.status==='technical'||job.status==='final_round'?'info':'default'}>{statusLabel(job.status)}</Badge></div>
    <div className="mt-3 flex flex-wrap gap-2"><Badge variant={priorityVariant(job.priority) as any}>{job.priority} priority</Badge>{job.location&&<span className="text-sm text-slate-500">{job.location}</span>}</div>
    <div className="mt-4 space-y-1 text-sm text-slate-600"><p>Applied: {job.date_applied || 'Not set'}</p>{job.follow_up_date&&<p className={overdue?'font-bold text-red-600':''}>{overdue?'Overdue follow-up: ':'Follow-up: '}{job.follow_up_date}</p>}{job.recruiter_name&&<p>Recruiter: {job.recruiter_name}</p>}{job.salary_range&&<p>Salary: {job.salary_range}</p>}</div>
    {job.notes&&<p className="mt-3 line-clamp-2 text-sm text-slate-500">{job.notes}</p>}
    <div className="mt-5 flex gap-2"><Button size="sm" variant="outline" onClick={onEdit} icon={<Pencil size={14}/>}>Edit</Button>{job.job_url&&<a href={job.job_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold"><ExternalLink size={14}/> Job</a>}<Button size="sm" variant="ghost" onClick={onDelete} icon={<Trash2 size={14}/>}>Delete</Button><Button size="sm" variant="ghost" onClick={()=>{navigator.clipboard.writeText(followUpDraft(job));alert("Follow-up draft copied.");}}>Follow-up draft</Button></div>
  </Card>
}

function Pipeline({jobs,onEdit}:{jobs:Job[];onEdit:(j:Job)=>void}) {
  return <div className="mt-7 overflow-x-auto pb-4"><div className="flex min-w-[1500px] gap-4">{statuses.map(status => <div key={status} className="w-72 rounded-2xl bg-slate-100 p-3"><div className="mb-3 flex items-center justify-between"><h3 className="font-bold">{statusLabel(status)}</h3><span className="rounded-full bg-white px-2 py-1 text-xs font-bold">{jobs.filter(j=>j.status===status).length}</span></div><div className="space-y-3">{jobs.filter(j=>j.status===status).map(j=><button key={j.id} onClick={()=>onEdit(j)} className="w-full rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm hover:shadow"><p className="font-bold">{j.job_title}</p><p className="text-sm text-slate-600">{j.company_name}</p><p className="mt-2 text-xs text-slate-500">{j.follow_up_date ? `Follow-up ${j.follow_up_date}` : 'No follow-up set'}</p></button>)}</div></div>)}</div></div>
}
