'use client';

import {useState} from 'react';
import Link from 'next/link';
import {supabase} from '@/lib/supabase';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function ForgotPassword(){
  const [email,setEmail]=useState('');
  const [message,setMessage]=useState('');
  const [error,setError]=useState('');
  const [loading,setLoading]=useState(false);

  const submit=async(e:React.FormEvent)=>{
    e.preventDefault(); setLoading(true); setError(''); setMessage('');
    const {error}=await supabase().auth.resetPasswordForEmail(email.trim(),{
      redirectTo:`${window.location.origin}/auth/reset-password`
    });
    if(error)setError(error.message);
    else setMessage('If an account exists for this email, a password reset email has been sent.');
    setLoading(false);
  };

  return <div className="container flex min-h-[70vh] items-center justify-center py-12">
    <form onSubmit={submit} className="w-full max-w-md space-y-5 rounded-2xl border bg-white p-8 shadow-sm">
      <div><span className="text-xs font-black uppercase tracking-widest text-blue-600">Account recovery</span><h1 className="mt-2 text-3xl font-black">Reset your password</h1><p className="mt-2 text-sm text-slate-500">Enter your email and we’ll send a password reset link.</p></div>
      <Input label="Email" type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" required />
      {error&&<p className="text-sm text-red-600">{error}</p>}
      {message&&<p className="rounded-xl bg-blue-50 p-3 text-sm text-blue-800">{message}</p>}
      <Button type="submit" fullWidth loading={loading}>Send reset link</Button>
      <p className="text-center text-sm text-slate-500"><Link className="font-semibold text-blue-600" href="/auth/login">Back to login</Link></p>
    </form>
  </div>
}
