'use client';

import {useState} from 'react';
import {useRouter} from 'next/navigation';
import Link from 'next/link';
import {supabase} from '@/lib/supabase';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function ResetPassword(){
  const [password,setPassword]=useState('');
  const [confirm,setConfirm]=useState('');
  const [show,setShow]=useState(false);
  const [error,setError]=useState('');
  const [message,setMessage]=useState('');
  const [loading,setLoading]=useState(false);
  const router=useRouter();

  const submit=async(e:React.FormEvent)=>{
    e.preventDefault(); setError(''); setMessage('');
    if(password.length<8){setError('Password must be at least 8 characters.');return;}
    if(password!==confirm){setError('Passwords do not match.');return;}
    setLoading(true);
    const {error}=await supabase().auth.updateUser({password});
    if(error)setError(error.message);
    else {
      setMessage('Password updated successfully. You can now log in with your new password.');
      setTimeout(()=>router.replace('/auth/login'),1200);
    }
    setLoading(false);
  };

  return <div className="container flex min-h-[70vh] items-center justify-center py-12">
    <form onSubmit={submit} className="w-full max-w-md space-y-5 rounded-2xl border bg-white p-8 shadow-sm">
      <div><span className="text-xs font-black uppercase tracking-widest text-blue-600">Account recovery</span><h1 className="mt-2 text-3xl font-black">Set a new password</h1><p className="mt-2 text-sm text-slate-500">Choose a new password for your account.</p></div>
      <Input label="New password" type={show?'text':'password'} autoComplete="new-password" value={password} onChange={e=>setPassword(e.target.value)} minLength={8} required />
      <Input label="Confirm new password" type={show?'text':'password'} autoComplete="new-password" value={confirm} onChange={e=>setConfirm(e.target.value)} minLength={8} required />
      <button type="button" onClick={()=>setShow(v=>!v)} className="text-xs font-semibold text-blue-600">{show?'Hide password':'Show password'}</button>
      {error&&<p className="text-sm text-red-600">{error}</p>}
      {message&&<p className="rounded-xl bg-green-50 p-3 text-sm text-green-700">{message}</p>}
      <Button type="submit" fullWidth loading={loading}>Update password</Button>
      <p className="text-center text-sm text-slate-500"><Link className="font-semibold text-blue-600" href="/auth/login">Back to login</Link></p>
    </form>
  </div>
}
