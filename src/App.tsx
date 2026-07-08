import {
  Bell,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  FileHeart,
  GalleryVerticalEnd,
  HeartPulse,
  Home,
  LogOut,
  Medal,
  MessageSquare,
  PlusCircle,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { useMemo, useState } from 'react'
import { Login } from './components/Login'
import { PublicHome } from './components/PublicHome'
import {
  athletes,
  athleteGoals,
  attendance,
  communications,
  demoProfiles,
  events,
  teams,
  trialRequests,
} from './lib/mockData'
import type { Athlete, EventItem, Role, UserProfile } from './lib/types'

type Section =
  | 'dashboard'
  | 'atlete'
  | 'squadre'
  | 'calendario'
  | 'presenze'
  | 'comunicazioni'
  | 'certificati'
  | 'prove'
  | 'diario'

const navItems: Array<{ id: Section; label: string; icon: typeof Home; roles: Role[] }> = [
  { id: 'dashboard', label: 'Dashboard', icon: Home, roles: ['admin', 'tecnico', 'genitore', 'atleta'] },
  { id: 'atlete', label: 'Atlete', icon: Users, roles: ['admin', 'tecnico', 'genitore'] },
  { id: 'squadre', label: 'Squadre', icon: ShieldCheck, roles: ['admin', 'tecnico'] },
  { id: 'calendario', label: 'Calendario', icon: CalendarDays, roles: ['admin', 'tecnico', 'genitore', 'atleta'] },
  { id: 'presenze', label: 'Presenze', icon: ClipboardCheck, roles: ['admin', 'tecnico', 'genitore'] },
  { id: 'comunicazioni', label: 'Avvisi', icon: MessageSquare, roles: ['admin', 'tecnico', 'genitore', 'atleta'] },
  { id: 'certificati', label: 'Certificati', icon: FileHeart, roles: ['admin', 'tecnico', 'genitore'] },
  { id: 'prove', label: 'Prove', icon: PlusCircle, roles: ['admin'] },
  { id: 'diario', label: 'Diario', icon: Sparkles, roles: ['admin', 'tecnico', 'genitore', 'atleta'] },
]

const roleLabel: Record<Role, string> = {
  admin: 'Amministratore',
  tecnico: 'Tecnico',
  genitore: 'Genitore',
  atleta: 'Atleta',
}

function daysUntil(date: string) {
  const today = new Date('2026-07-06T00:00:00')
  const target = new Date(`${date}T00:00:00`)
  return Math.ceil((target.getTime() - today.getTime()) / 86_400_000)
}

function certificateStatus(athlete: Athlete) {
  const days = daysUntil(athlete.medical_certificate_expires_at)
  if (days < 0) return { label: 'Scaduto', className: 'bg-red-100 text-red-700' }
  if (days <= 30) return { label: 'In scadenza', className: 'bg-amber-100 text-amber-700' }
  return { label: 'Valido', className: 'bg-emerald-100 text-emerald-700' }
}

function eventTeamNames(event: EventItem) {
  return event.teamIds.map((id) => teams.find((team) => team.id === id)?.name).filter(Boolean).join(', ')
}

export default function App() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [section, setSection] = useState<Section>('dashboard')
  const [showPublic, setShowPublic] = useState(true)

  const visibleAthletes = useMemo(() => {
    if (!profile) return []
    if (profile.role === 'genitore' || profile.role === 'atleta') return athletes.filter((athlete) => athlete.id === 'athlete-1')
    if (profile.role === 'tecnico') return athletes.filter((athlete) => athlete.teamIds.some((id) => ['base', 'avanzato', 'teamgym'].includes(id)))
    return athletes
  }, [profile])

  const allowedNav = navItems.filter((item) => profile && item.roles.includes(profile.role))

  if (!profile && showPublic) {
    return <PublicHome onLoginClick={() => setShowPublic(false)} />
  }

  if (!profile) {
    return <Login onLogin={(role) => setProfile(demoProfiles[role])} onBackHome={() => setShowPublic(true)} />
  }

  const current = navItems.find((item) => item.id === section) ?? navItems[0]

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#dff6f4_0,transparent_34%),#f3fbfa] text-slate-900">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 bg-brand-900 px-5 py-6 text-white shadow-soft lg:block">
        <Brand />
        <nav className="mt-8 space-y-2">
          {allowedNav.map((item) => (
            <button
              key={item.id}
              onClick={() => setSection(item.id)}
              className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-semibold transition ${
                section === item.id ? 'bg-white text-brand-900 shadow-glow' : 'text-brand-50 hover:bg-white/10 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              {item.label}
            </button>
          ))}
        </nav>
        <UserCard profile={profile} onLogout={() => setProfile(null)} />
      </aside>

      <main className="pb-24 lg:ml-72 lg:pb-10">
        <header className="sticky top-0 z-10 border-b border-brand-100 bg-white/90 px-4 py-4 backdrop-blur lg:px-8">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src="/logo-valbisagno.jpg" alt="Logo Ginnastiche Valbisagno" className="h-11 w-11 rounded-full object-cover ring-2 ring-brand-100 lg:hidden" />
              <div>
                <p className="text-sm font-semibold text-brand-700">{roleLabel[profile.role]}</p>
                <h1 className="text-2xl font-bold tracking-tight text-brand-900">{current.label}</h1>
              </div>
            </div>
            <button className="inline-flex items-center gap-2 rounded-lg bg-brand-900 px-4 py-3 text-sm font-bold text-white shadow-soft">
              <Bell size={18} />
              3 avvisi
            </button>
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
          {section === 'dashboard' && <Dashboard profile={profile} visibleAthletes={visibleAthletes} />}
          {section === 'atlete' && <AthletesList visibleAthletes={visibleAthletes} />}
          {section === 'squadre' && <Teams />}
          {section === 'calendario' && <Calendar />}
          {section === 'presenze' && <Attendance visibleAthletes={visibleAthletes} />}
          {section === 'comunicazioni' && <Communications />}
          {section === 'certificati' && <Certificates visibleAthletes={visibleAthletes} />}
          {section === 'prove' && <Trials />}
          {section === 'diario' && <Diary visibleAthletes={visibleAthletes} />}
        </div>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-30 flex gap-1 overflow-x-auto border-t border-brand-100 bg-white px-2 py-2 shadow-soft lg:hidden">
        {allowedNav.map((item) => (
          <button
            key={item.id}
            onClick={() => setSection(item.id)}
            className={`flex min-w-[76px] flex-col items-center gap-1 rounded-lg px-2 py-2 text-[11px] font-semibold ${
              section === item.id ? 'bg-brand-900 text-white' : 'text-slate-500'
            }`}
          >
            <item.icon size={19} />
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  )
}

function Brand() {
  return (
    <div className="flex items-center gap-3">
      <img src="/logo-valbisagno.jpg" alt="Logo Ginnastiche Valbisagno" className="h-14 w-14 rounded-full object-cover ring-4 ring-white/15" />
      <div>
        <p className="text-lg font-black leading-tight text-white">Ginnastiche</p>
        <p className="text-lg font-black leading-tight text-brand-100">Valbisagno</p>
      </div>
    </div>
  )
}

function UserCard({ profile, onLogout }: { profile: UserProfile; onLogout: () => void }) {
  return (
    <div className="absolute bottom-6 left-5 right-5 rounded-lg border border-white/15 bg-white/10 p-4">
      <p className="font-bold text-white">{profile.full_name}</p>
      <p className="text-sm text-brand-100">{profile.email}</p>
      <button onClick={onLogout} className="mt-4 flex items-center gap-2 text-sm font-bold text-white">
        <LogOut size={16} />
        Esci
      </button>
    </div>
  )
}

function Dashboard({ profile, visibleAthletes }: { profile: UserProfile; visibleAthletes: Athlete[] }) {
  const nextTraining = events.find((event) => event.type === 'allenamento')
  const nextCompetition = events.find((event) => event.type === 'gara')
  const firstAthlete = visibleAthletes[0]
  const status = firstAthlete ? certificateStatus(firstAthlete) : null

  return (
    <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
      <section className="relative overflow-hidden rounded-lg bg-white p-6 shadow-soft">
        <div className="absolute right-0 top-0 h-32 w-32 rounded-bl-full bg-brand-100/60" />
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase text-brand-600">Benvenuta/o</p>
            <h2 className="mt-1 text-3xl font-black text-brand-900">{profile.full_name}</h2>
            <p className="mt-2 max-w-2xl text-slate-600">Le informazioni essenziali della settimana, pronte da leggere senza cercare tra mille messaggi.</p>
          </div>
          <button className="relative inline-flex items-center justify-center gap-2 rounded-lg bg-brand-900 px-5 py-4 font-bold text-white shadow-glow">
            <PlusCircle size={20} />
            Segnala assenza
          </button>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Metric icon={CalendarDays} label="Prossimo allenamento" value={nextTraining ? `${nextTraining.date} ${nextTraining.starts_at}` : 'Nessuno'} />
          <Metric icon={Medal} label="Prossima gara" value={nextCompetition ? nextCompetition.title : 'Da definire'} />
          <Metric icon={HeartPulse} label="Certificato medico" value={status?.label ?? 'Non presente'} badgeClass={status?.className} />
        </div>
      </section>
      <section className="sport-lines rounded-lg p-6 text-white shadow-soft">
        <h3 className="text-xl font-black">Comunicazioni importanti</h3>
        <div className="mt-5 space-y-4">
          {communications.slice(0, 3).map((item) => (
            <article key={item.id} className="rounded-lg bg-white/10 p-4">
              <p className="text-sm font-bold uppercase text-brand-100">{item.category}</p>
              <h4 className="mt-1 font-bold">{item.title}</h4>
              <p className="mt-2 text-sm text-brand-50">{item.body}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

function Metric({ icon: Icon, label, value, badgeClass }: { icon: typeof Home; label: string; value: string; badgeClass?: string }) {
  return (
    <div className="rounded-lg border border-brand-100 bg-skyglass p-4">
      <Icon className="text-brand-700" size={24} />
      <p className="mt-4 text-sm font-semibold text-slate-500">{label}</p>
      <p className={`mt-2 inline-flex rounded-md px-2 py-1 text-lg font-black text-brand-900 ${badgeClass ?? ''}`}>{value}</p>
    </div>
  )
}

function AthletesList({ visibleAthletes }: { visibleAthletes: Athlete[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {visibleAthletes.map((athlete) => (
        <article key={athlete.id} className="overflow-hidden rounded-lg bg-white shadow-soft">
          <img src={athlete.profile_photo_url} alt={`${athlete.first_name} ${athlete.last_name}`} className="h-48 w-full object-cover" />
          <div className="p-5">
            <h3 className="text-xl font-black text-brand-900">{athlete.first_name} {athlete.last_name}</h3>
            <p className="mt-1 text-sm text-slate-500">Nata il {athlete.birth_date}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {athlete.teamIds.map((id) => <Badge key={id}>{teams.find((team) => team.id === id)?.name}</Badge>)}
            </div>
            <div className="mt-4 rounded-lg bg-brand-50 p-3 text-sm">
              <p className="font-bold text-brand-900">{athlete.guardian_name}</p>
              <p>{athlete.guardian_phone}</p>
              <p>{athlete.guardian_email}</p>
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}

function Teams() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {teams.map((team) => (
        <article key={team.id} className="rounded-lg bg-white p-5 shadow-soft">
          <div className="flex items-center gap-3">
            <span className="h-4 w-4 rounded-full" style={{ background: team.color }} />
            <h3 className="text-xl font-black text-brand-900">{team.name}</h3>
          </div>
          <p className="mt-3 text-slate-600">{team.description}</p>
          <p className="mt-5 text-sm font-bold text-brand-700">{athletes.filter((athlete) => athlete.teamIds.includes(team.id)).length} atlete</p>
        </article>
      ))}
    </div>
  )
}

function Calendar() {
  return (
    <div className="space-y-4">
      {events.map((event) => (
        <article key={event.id} className="rounded-lg bg-white p-5 shadow-soft">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <Badge>{event.type}</Badge>
              <h3 className="mt-3 text-2xl font-black text-brand-900">{event.title}</h3>
              <p className="mt-2 text-slate-600">{event.description}</p>
            </div>
            <div className="rounded-lg bg-brand-50 p-4 text-brand-900">
              <p className="font-black">{event.date}</p>
              <p className="text-sm font-semibold">{event.starts_at} - {event.ends_at}</p>
            </div>
          </div>
          <p className="mt-4 text-sm font-semibold text-slate-500">{event.location} · {eventTeamNames(event)}</p>
        </article>
      ))}
    </div>
  )
}

function Attendance({ visibleAthletes }: { visibleAthletes: Athlete[] }) {
  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-soft">
      <div className="border-b border-brand-100 p-5">
        <h2 className="text-xl font-black text-brand-900">Registro presenze</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-brand-50 text-brand-900">
            <tr>
              <th className="px-5 py-4">Atleta</th>
              <th className="px-5 py-4">Evento</th>
              <th className="px-5 py-4">Stato</th>
              <th className="px-5 py-4">Note</th>
            </tr>
          </thead>
          <tbody>
            {attendance.filter((row) => visibleAthletes.some((athlete) => athlete.id === row.athleteId)).map((row) => {
              const athlete = athletes.find((item) => item.id === row.athleteId)
              const event = events.find((item) => item.id === row.eventId)
              return (
                <tr key={row.id} className="border-t border-brand-50">
                  <td className="px-5 py-4 font-bold">{athlete?.first_name} {athlete?.last_name}</td>
                  <td className="px-5 py-4">{event?.title}</td>
                  <td className="px-5 py-4"><Badge>{row.status}</Badge></td>
                  <td className="px-5 py-4 text-slate-500">{row.notes ?? '-'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Communications() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {communications.map((communication) => (
        <article key={communication.id} className="rounded-lg bg-white p-5 shadow-soft">
          <div className="flex items-center justify-between gap-3">
            <Badge>{communication.category}</Badge>
            {communication.requires_read_confirmation && <span className="text-xs font-bold text-brand-700">Conferma lettura</span>}
          </div>
          <h3 className="mt-4 text-xl font-black text-brand-900">{communication.title}</h3>
          <p className="mt-2 text-slate-600">{communication.body}</p>
          <p className="mt-4 text-sm font-semibold text-slate-500">{communication.audience} · {communication.published_at}</p>
        </article>
      ))}
    </div>
  )
}

function Certificates({ visibleAthletes }: { visibleAthletes: Athlete[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {visibleAthletes.map((athlete) => {
        const status = certificateStatus(athlete)
        return (
          <article key={athlete.id} className="rounded-lg bg-white p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-brand-900">{athlete.first_name} {athlete.last_name}</h3>
              <span className={`rounded-md px-2 py-1 text-sm font-bold ${status.className}`}>{status.label}</span>
            </div>
            <p className="mt-4 text-slate-600">Scadenza: <strong>{athlete.medical_certificate_expires_at}</strong></p>
            <p className="mt-2 text-sm text-slate-500">{athlete.medical_notes ?? 'Nessuna nota sanitaria registrata.'}</p>
          </article>
        )
      })}
    </div>
  )
}

function Trials() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {trialRequests.map((trial) => (
        <article key={trial.id} className="rounded-lg bg-white p-5 shadow-soft">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-xl font-black text-brand-900">{trial.child_name}, {trial.age} anni</h3>
            <Badge>{trial.status}</Badge>
          </div>
          <p className="mt-3 font-semibold text-slate-700">{trial.discipline}</p>
          <p className="mt-2 text-sm text-slate-500">{trial.guardian_name} · {trial.phone} · {trial.email}</p>
          <p className="mt-4 rounded-lg bg-brand-50 p-3 text-sm">{trial.notes}</p>
        </article>
      ))}
    </div>
  )
}

function Diary({ visibleAthletes }: { visibleAthletes: Athlete[] }) {
  const athlete = visibleAthletes[0] ?? athletes[0]
  const goals = athleteGoals.filter((goal) => goal.athleteId === athlete.id)

  return (
    <div className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
      <section className="sport-lines overflow-hidden rounded-lg text-white shadow-soft">
        <img src={athlete.profile_photo_url} alt={`${athlete.first_name} ${athlete.last_name}`} className="h-72 w-full object-cover" />
        <div className="p-6">
          <p className="text-sm font-bold uppercase text-brand-100">Diario della ginnasta</p>
          <h2 className="mt-2 text-4xl font-black">{athlete.first_name} {athlete.last_name}</h2>
          <p className="mt-4 text-brand-50">Progressi, obiettivi, gare e ricordi in una pagina personale pensata per motivare e raccontare il percorso sportivo.</p>
        </div>
      </section>
      <section className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <Metric icon={Medal} label="Gare disputate" value="6" />
          <Metric icon={CheckCircle2} label="Obiettivi raggiunti" value="8" />
          <Metric icon={GalleryVerticalEnd} label="Media" value="24" />
        </div>
        <div className="rounded-lg bg-white p-5 shadow-soft">
          <h3 className="text-xl font-black text-brand-900">Obiettivi tecnici</h3>
          <div className="mt-4 space-y-3">
            {goals.map((goal) => (
              <article key={goal.id} className="rounded-lg border border-brand-100 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="font-black text-brand-900">{goal.title}</h4>
                  <Badge>{goal.status}</Badge>
                </div>
                <p className="mt-2 text-sm font-semibold text-brand-700">{goal.apparatus}</p>
                <p className="mt-2 text-slate-600">{goal.coach_note}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

function Badge({ children }: { children: ReactNode }) {
  return <span className="inline-flex rounded-md bg-brand-100 px-2 py-1 text-xs font-black uppercase text-brand-700">{children}</span>
}
