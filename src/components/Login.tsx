import { ArrowLeft, LockKeyhole } from 'lucide-react'
import type { FormEvent } from 'react'
import { useState } from 'react'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

export function Login({ onBackHome, onDemoLogin }: { onBackHome: () => void; onDemoLogin: () => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')
    if (email.trim().toLowerCase() === 'admin' && password === '1234') {
      onDemoLogin()
      return
    }
    if (!isSupabaseConfigured || !supabase) {
      setMessage('Supabase non è configurato.')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) setMessage('Email o password non corrette.')
  }

  return (
    <main className="grid min-h-screen bg-skyglass lg:grid-cols-[0.85fr_1.15fr]">
      <section className="sport-lines flex flex-col justify-between p-8 text-white lg:p-12">
        <button onClick={onBackHome} className="inline-flex w-fit items-center gap-2 rounded-lg bg-white/10 px-4 py-3 text-sm font-bold">
          <ArrowLeft size={18} /> Homepage
        </button>
        <div className="my-12">
          <img src="/logo-valbisagno.jpg" alt="Logo Ginnastiche Valbisagno" className="h-28 w-28 rounded-full object-cover ring-8 ring-white/15 shadow-glow" />
          <h1 className="mt-8 text-4xl font-black leading-tight md:text-5xl">Ginnastiche Valbisagno</h1>
          <p className="mt-5 max-w-xl text-lg text-brand-50">Gestionale per famiglie, atlete, tecnici e segreteria.</p>
        </div>
        <p className="text-sm text-brand-100">Accesso protetto e dati sincronizzati.</p>
      </section>

      <section className="flex items-center justify-center px-4 py-10">
        <form onSubmit={handleSubmit} className="w-full max-w-xl rounded-lg bg-white p-6 shadow-soft md:p-8">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-lg bg-brand-50 text-brand-700"><LockKeyhole size={24} /></div>
            <div>
              <p className="text-sm font-bold uppercase text-brand-600">Area riservata</p>
              <h2 className="text-2xl font-black text-brand-900">Accedi al gestionale</h2>
            </div>
          </div>
          <label className="mt-7 block text-sm font-bold text-slate-700" htmlFor="email">Email o utente</label>
          <input required id="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full rounded-lg border border-brand-100 px-4 py-3 outline-none focus:border-brand-700" type="text" autoComplete="username" />
          <label className="mt-4 block text-sm font-bold text-slate-700" htmlFor="password">Password</label>
          <input required id="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 w-full rounded-lg border border-brand-100 px-4 py-3 outline-none focus:border-brand-700" type="password" autoComplete="current-password" />
          {message && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-700">{message}</p>}
          <button disabled={loading} className="mt-6 w-full rounded-lg bg-brand-900 px-5 py-4 font-black text-white shadow-soft disabled:opacity-60">
            {loading ? 'Accesso...' : 'Accedi'}
          </button>
          <div className="mt-4 rounded-lg bg-brand-50 p-3 text-sm text-brand-900">
            <strong>Versione demo:</strong> utente <strong>admin</strong>, password <strong>1234</strong>.
          </div>
        </form>
      </section>
    </main>
  )
}
