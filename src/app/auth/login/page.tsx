'use client';

import {useState} from 'react';
import {useRouter} from 'next/navigation';
import Link from 'next/link';
import {supabase} from '@/lib/supabase';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function Login(){
  const [email,setEmail]=useState('');
  const [password,setPassword]=useState('');
  const [showPassword,setShowPassword]=useState(false);
  const [error,setError]=useState('');
  const [loading,setLoading]=useState(false);
  const router=useRouter();

  const submit=async(e:React.FormEvent)=>{
    e.preventDefault();
    setLoading(true);
    setError('');
    const {error}=await supabase().auth.signInWithPassword({
      email:email.trim(),
      password
    });
    if(error){
      setError(error.message.includes('Invalid login credentials')
        ? 'Incorrect email or password.'
        : error.message);
      setLoading(false);
      return;
    }
    router.replace('/dashboard');
    router.refresh();
  };

  return <div className="container flex min-h-[70vh] items-center justify-center py-12">
    <form onSubmit={submit} className="w-full max-w-md space-y-5 rounded-2xl border bg-white p-8 shadow-sm">
      <div>
        <span className="text-xs font-black uppercase tracking-widest text-blue-600">Secure sign in</span>
        <h1 className="mt-2 text-3xl font-black">Welcome back</h1>
        <p className="mt-2 text-sm text-slate-500">Sign in with your email and password.</p>
      </div>
      <Input label="Email" type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" required />
      <div>
        <Input label="Password" type={showPassword?'text':'password'} autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} required />
        <button type="button" onClick={()=>setShowPassword(v=>!v)} className="mt-1 text-xs font-semibold text-blue-600">
          {showPassword?'Hide password':'Show password'}
        </button>
      </div>
      {error&&<p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" fullWidth loading={loading}>Log in</Button>
      <div className="flex items-center justify-between text-sm">
        <Link className="font-semibold text-blue-600" href="/auth/forgot-password">Forgot password?</Link>
        <Link className="font-semibold text-slate-500" href="/auth/signup">Create account</Link>
      </div>
      <p className="text-center text-xs text-slate-400">No verification code is required for normal sign-in.</p>
    </form>
  </div>
}
