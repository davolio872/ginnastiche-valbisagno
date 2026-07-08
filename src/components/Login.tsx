import { ArrowLeft, LockKeyhole } from 'lucide-react'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import type { Role } from '../lib/types'
import type { FormEvent } from 'react'
import { useState } from 'react'

const roles: Role[] = ['admin', 'tecnico', 'genitore', 'atleta']

export function Login({ onLogin, onBackHome }: { onLogin: (role: Role) => void; onBackHome: () => void }) {
  const [role, setRole] = useState<Role>('admin')
  const [email, setEmail] = useState('admin@ginnastichevalbisagno.it')
  const [password, setPassword] = useState('demo-password')
  const [message, setMessage] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('')

    if (password === 'demo-password') {
      onLogin(role)
      return
    }

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setMessage('Email o password non corrette. Per provare l’app usa la password demo-password.')
        return
      }
    } else {
      setMessage('Supabase non è configurato. Usa la password demo-password.')
      return
    }

    onLogin(role)
  }

  return (
    <main className="grid min-h-screen bg-skyglass lg:grid-cols-[0.85fr_1.15fr]">
      <section className="sport-lines flex flex-col justify-between p-8 text-white lg:p-12">
        <button onClick={onBackHome} className="inline-flex w-fit items-center gap-2 rounded-lg bg-white/10 px-4 py-3 text-sm font-bold">
          <ArrowLeft size={18} />
          Homepage
        </button>
        <div className="my-12">
          <img src="/logo-valbisagno.jpg" alt="Logo Ginnastiche Valbisagno" className="h-28 w-28 rounded-full object-cover ring-8 ring-white/15 shadow-glow" />
          <h1 className="mt-8 text-4xl font-black leading-tight md:text-5xl">Ginnastiche Valbisagno</h1>
          <p className="mt-5 max-w-xl text-lg text-brand-50">
            Gestionale semplice per famiglie, atlete, tecnici e segreteria.
          </p>
        </div>
        <p className="text-sm text-brand-100">MVP pronto per collegamento Supabase e deploy Vercel.</p>
      </section>

      <section className="flex items-center justify-center px-4 py-10">
        <form onSubmit={handleSubmit} className="w-full max-w-xl rounded-lg bg-white p-6 shadow-soft md:p-8">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-lg bg-brand-50 text-brand-700">
              <LockKeyhole size={24} />
            </div>
            <div>
              <p className="text-sm font-bold uppercase text-brand-600">Accesso area riservata</p>
              <h2 className="text-2xl font-black text-brand-900">Entra con il tuo ruolo</h2>
            </div>
          </div>

          <label className="mt-7 block text-sm font-bold text-slate-700" htmlFor="email">Email</label>
          <input id="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full rounded-lg border border-brand-100 px-4 py-3 outline-none focus:border-brand-700" type="email" />

          <label className="mt-4 block text-sm font-bold text-slate-700" htmlFor="password">Password</label>
          <input id="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 w-full rounded-lg border border-brand-100 px-4 py-3 outline-none focus:border-brand-700" type="password" />

          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {roles.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setRole(item)}
                className={`rounded-lg px-3 py-3 text-sm font-black capitalize ${
                  role === item ? 'bg-brand-900 text-white shadow-soft' : 'bg-brand-50 text-brand-700'
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          {message && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-700">{message}</p>}

          <button className="mt-6 w-full rounded-lg bg-brand-900 px-5 py-4 font-black text-white shadow-soft">
            Accedi
          </button>
          <p className="mt-4 text-sm text-slate-500">
            Per la demo scegli un ruolo e usa la password <strong>demo-password</strong>. Gli account reali usano Supabase Auth.
          </p>
        </form>
      </section>
    </main>
  )
}
