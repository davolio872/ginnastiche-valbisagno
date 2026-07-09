import { ArrowRight, CalendarDays, MapPin, Phone } from 'lucide-react'
import type { FormEvent } from 'react'
import { useState } from 'react'
import { supabase } from '../lib/supabase'

export function PublicHome({ onLoginClick }: { onLoginClick: () => void }) {
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function submitTrial(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    const form = new FormData(event.currentTarget)
    if (!supabase) {
      setError('Servizio momentaneamente non disponibile.')
      return
    }
    const { error: submitError } = await supabase.from('trial_requests').insert({
      child_name: form.get('child_name'),
      age: Number(form.get('age')),
      guardian_name: form.get('guardian_name'),
      phone: form.get('phone'),
      email: form.get('email'),
      discipline: form.get('discipline'),
      notes: form.get('notes') || null,
      privacy_consent: true,
    })
    if (submitError) {
      setError('Non è stato possibile inviare la richiesta. Riprova.')
      return
    }
    setSent(true)
    event.currentTarget.reset()
  }

  return (
    <main className="bg-white text-slate-900">
      <header className="sticky top-0 z-20 border-b border-brand-100 bg-white/90 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/logo-valbisagno.jpg" alt="Logo Ginnastiche Valbisagno" className="h-12 w-12 rounded-full object-cover ring-2 ring-brand-100" />
            <div className="font-black leading-tight text-brand-900">
              <p>Ginnastiche</p>
              <p className="text-brand-700">Valbisagno</p>
            </div>
          </div>
          <button onClick={onLoginClick} className="rounded-lg bg-brand-900 px-4 py-3 text-sm font-black text-white shadow-soft">
            Area riservata
          </button>
        </div>
      </header>

      <section className="sport-lines px-4 py-10 text-white md:py-14">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <div className="relative z-10">
            <img src="/logo-valbisagno.jpg" alt="Logo Centro Ginnastiche Valbisagno" className="h-28 w-28 rounded-full object-cover ring-8 ring-white/15 shadow-glow" />
            <p className="mt-7 text-sm font-black uppercase tracking-wide text-brand-100">Ginnastica artistica a Genova</p>
            <h1 className="mt-3 max-w-3xl text-4xl font-black leading-tight text-white md:text-6xl">
              Ginnastiche Valbisagno
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-brand-50">
              Corsi per bambine, ragazze e adulti: Baby, Base, Avanzato, Agonistica, TeamGym, Acrobatica e Fitness.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <a href="#prova" className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-4 font-black text-brand-900 shadow-glow">
                Prenota prova gratuita
                <ArrowRight size={19} />
              </a>
              <button onClick={onLoginClick} className="rounded-lg border border-white/30 px-5 py-4 font-black text-white">
                Accedi al gestionale
              </button>
            </div>
          </div>
          <div className="relative min-h-[420px]">
            <img
              src="https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1100&q=80"
              alt="Allenamento di ginnastica artistica"
              className="absolute inset-0 h-full w-full rounded-lg object-cover shadow-soft"
            />
            <div className="absolute inset-0 rounded-lg bg-gradient-to-t from-brand-900/50 to-transparent" />
            <div className="absolute bottom-5 left-5 right-5 rounded-lg border border-white/20 bg-white/90 p-4 text-brand-900">
              <p className="text-sm font-black uppercase text-brand-700">Centro Ginnastiche Valbisagno</p>
              <p className="mt-1 font-semibold">Sport, disciplina e crescita in un ambiente accogliente.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-12">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-3">
          <Info icon={CalendarDays} title="Corsi" text="Percorsi per eta, livello e obiettivo sportivo." />
          <Info icon={MapPin} title="Sedi" text="Allenamenti in Valbisagno con gruppi organizzati." />
          <Info icon={Phone} title="Contatti" text="Segreteria pronta ad aiutare famiglie e nuove iscritte." />
        </div>
      </section>

      <section id="prova" className="bg-skyglass px-4 py-12">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-black uppercase text-brand-700">Nuovi iscritti</p>
            <h2 className="mt-2 text-3xl font-black text-brand-900">Prenota una prova gratuita</h2>
            <p className="mt-4 text-slate-600">
              Compila il modulo: la segreteria lo vedra nell'area admin e potra segnare la richiesta come nuova, contattata, prova fissata o iscritta.
            </p>
          </div>
          <form
            className="grid gap-3 rounded-lg bg-white p-5 shadow-soft md:grid-cols-2"
            onSubmit={submitTrial}
          >
            <input name="child_name" required placeholder="Nome bambino/a" className="rounded-lg border border-brand-100 px-4 py-3 outline-none focus:border-brand-700" />
            <input name="age" required placeholder="Età" type="number" min="2" className="rounded-lg border border-brand-100 px-4 py-3 outline-none focus:border-brand-700" />
            <input name="guardian_name" required placeholder="Nome genitore" className="rounded-lg border border-brand-100 px-4 py-3 outline-none focus:border-brand-700" />
            <input name="phone" required placeholder="Telefono" className="rounded-lg border border-brand-100 px-4 py-3 outline-none focus:border-brand-700" />
            <input name="email" required placeholder="Email" type="email" className="rounded-lg border border-brand-100 px-4 py-3 outline-none focus:border-brand-700" />
            <select name="discipline" className="rounded-lg border border-brand-100 px-4 py-3 outline-none focus:border-brand-700">
              <option>Ginnastica artistica</option>
              <option>TeamGym</option>
              <option>Acrobatica</option>
              <option>Fitness</option>
            </select>
            <textarea name="notes" placeholder="Note" className="min-h-28 rounded-lg border border-brand-100 px-4 py-3 outline-none focus:border-brand-700 md:col-span-2" />
            <label className="flex gap-3 text-sm font-semibold text-slate-600 md:col-span-2">
              <input required type="checkbox" className="mt-1" />
              Acconsento al trattamento dei dati per essere ricontattato.
            </label>
            <button className="rounded-lg bg-brand-900 px-5 py-4 font-black text-white shadow-soft md:col-span-2">Invia richiesta</button>
            {sent && <p className="rounded-lg bg-emerald-50 p-3 text-sm font-bold text-emerald-700 md:col-span-2">Richiesta registrata. Ti ricontatteremo presto.</p>}
            {error && <p className="rounded-lg bg-red-50 p-3 text-sm font-bold text-red-700 md:col-span-2">{error}</p>}
          </form>
        </div>
      </section>
    </main>
  )
}

function Info({ icon: Icon, title, text }: { icon: typeof CalendarDays; title: string; text: string }) {
  return (
    <article className="rounded-lg border border-brand-100 bg-skyglass p-6 shadow-soft">
      <Icon className="text-brand-700" size={28} />
      <h3 className="mt-4 text-xl font-black text-brand-900">{title}</h3>
      <p className="mt-2 text-slate-600">{text}</p>
    </article>
  )
}
