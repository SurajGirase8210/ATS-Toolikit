'use client';

import {useState} from 'react';
import {useRouter} from 'next/navigation';
import Link from 'next/link';
import {supabase} from '@/lib/supabase';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function Signup(){
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [confirm,setConfirm]=useState('');
  const [showPassword,setShowPassword]=useState(false);
  const [error,setError]=useState('');
  const [message,setMessage]=useState('');
  const [loading,setLoading]=useState(false);
  const router=useRouter();

  const submit=async(e:React.FormEvent)=>{
    e.preventDefault();
    setError('');
    setMessage('');
    if(password.length<8){setError('Password must be at least 8 characters.');return;}
    if(password!==confirm){setError('Passwords do not match.');return;}
    setLoading(true);

    const {data,error}=await supabase().auth.signUp({
      email:email.trim(),
      password
    });

    if(error){
      setError(error.message);
      setLoading(false);
      return;
    }

    if(data.session){
      router.replace('/dashboard');
      router.refresh();
      return;
    }

    setMessage('Account created. If email confirmation is enabled in Supabase, check your inbox once to confirm the account, then log in with your password.');
    setLoading(false);
  };

  return <div className="container flex min-h-[70vh] items-center justify-center py-12">
    <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
      <div>
        <span className="text-xs font-black uppercase tracking-widest text-blue-600">Free account</span>
        <h1 className="mt-2 text-3xl font-black">Create your account</h1>
        <p className="mt-2 text-sm text-slate-500">Create an account with your email and a password.</p>
      </div>
      <Input label="Email" type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" required />
      <div>
        <Input label="Password" type={showPassword?'text':'password'} autoComplete="new-password" value={password} onChange={e=>setPassword(e.target.value)} minLength={8} required />
        <button type="button" onClick={()=>setShowPassword(v=>!v)} className="mt-1 text-xs font-semibold text-blue-600">
          {showPassword?'Hide password':'Show password'}
        </button>
      </div>
      <Input label="Confirm password" type={showPassword?'text':'password'} autoComplete="new-password" value={confirm} onChange={e=>setConfirm(e.target.value)} minLength={8} required />
      {error&&<div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      {message&&<div className="rounded-xl bg-blue-50 p-3 text-sm text-blue-800">{message}</div>}
      <Button type="submit" fullWidth loading={loading}>Create account</Button>
      <p className="text-center text-sm text-slate-500">Already have an account? <Link className="font-semibold text-blue-600" href="/auth/login">Log in</Link></p>
    </form>
  </div>
}
