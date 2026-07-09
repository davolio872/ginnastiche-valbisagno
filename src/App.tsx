import {
  CalendarDays, CheckCircle2, ClipboardCheck, FileHeart, Home, LoaderCircle, LogOut,
  Medal, MessageSquare, Pencil, Plus, ShieldCheck, Sparkles, Trash2, Users, X,
} from 'lucide-react'
import type { FormEvent, ReactNode } from 'react'
import { useCallback, useEffect, useState } from 'react'
import { Login } from './components/Login'
import { PublicHome } from './components/PublicHome'
import {
  createUser, getProfile, loadManagementData, removeRow, saveAthlete, saveEvent, saveSimple, saveTeam, uploadFile,
  type AthleteRow, type AttendanceRow, type CertificateRow, type CommunicationRow, type EventRow,
  type GoalRow, type ProfileRow, type TeamRow, type TrialRow,
} from './lib/database'
import {
  createDemoUser, demoFile, loadDemoData, removeDemoRow, saveDemoAthlete, saveDemoEvent,
  saveDemoSimple, saveDemoTeam,
} from './lib/demoDatabase'
import { demoProfiles } from './lib/mockData'
import { supabase } from './lib/supabase'
import type { Role, UserProfile } from './lib/types'

type Section = 'dashboard' | 'utenti' | 'atlete' | 'squadre' | 'calendario' | 'presenze' | 'comunicazioni' | 'certificati' | 'prove' | 'diario'
type DataState = Awaited<ReturnType<typeof loadManagementData>>
type Editor = { kind: Section; item?: Record<string, unknown> } | null

const emptyData: DataState = { profiles: [], teams: [], athletes: [], events: [], attendance: [], communications: [], certificates: [], trials: [], goals: [], goalCatalog: [] }
const navItems: Array<{ id: Section; label: string; icon: typeof Home; roles: Role[] }> = [
  { id: 'dashboard', label: 'Dashboard', icon: Home, roles: ['admin', 'tecnico', 'genitore', 'atleta'] },
  { id: 'utenti', label: 'Utenti', icon: Users, roles: ['admin'] },
  { id: 'atlete', label: 'Atlete', icon: Users, roles: ['admin', 'tecnico', 'genitore'] },
  { id: 'squadre', label: 'Squadre', icon: ShieldCheck, roles: ['admin', 'tecnico'] },
  { id: 'calendario', label: 'Calendario', icon: CalendarDays, roles: ['admin', 'tecnico', 'genitore', 'atleta'] },
  { id: 'presenze', label: 'Presenze', icon: ClipboardCheck, roles: ['admin', 'tecnico', 'genitore'] },
  { id: 'comunicazioni', label: 'Avvisi', icon: MessageSquare, roles: ['admin', 'tecnico', 'genitore', 'atleta'] },
  { id: 'certificati', label: 'Certificati', icon: FileHeart, roles: ['admin', 'tecnico', 'genitore'] },
  { id: 'prove', label: 'Prove', icon: Plus, roles: ['admin'] },
  { id: 'diario', label: 'Diario', icon: Sparkles, roles: ['admin', 'tecnico', 'genitore', 'atleta'] },
]
const roleLabel: Record<Role, string> = { admin: 'Amministratore', tecnico: 'Tecnico', genitore: 'Genitore', atleta: 'Atleta' }
const canManage = (profile: UserProfile, section: Section) =>
  profile.role === 'admin' || (profile.role === 'tecnico' && ['calendario', 'presenze', 'comunicazioni', 'diario'].includes(section))
const dateLabel = (value?: string | null) => value ? new Intl.DateTimeFormat('it-IT').format(new Date(`${value}T00:00:00`)) : '-'
const certificateState = (expires?: string | null) => {
  if (!expires) return { label: 'Mancante', className: 'bg-slate-100 text-slate-700' }
  const days = Math.ceil((new Date(`${expires}T00:00:00`).getTime() - Date.now()) / 86_400_000)
  if (days < 0) return { label: 'Scaduto', className: 'bg-red-100 text-red-700' }
  if (days <= 30) return { label: 'In scadenza', className: 'bg-amber-100 text-amber-700' }
  return { label: 'Valido', className: 'bg-emerald-100 text-emerald-700' }
}

export default function App() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [demoMode, setDemoMode] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)
  const [showPublic, setShowPublic] = useState(true)
  const [section, setSection] = useState<Section>('dashboard')
  const [data, setData] = useState<DataState>(emptyData)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [editor, setEditor] = useState<Editor>(null)

  const refresh = useCallback(async () => {
    setLoading(true); setError('')
    try { setData(demoMode ? await loadDemoData() : await loadManagementData()) } catch (cause) { setError(cause instanceof Error ? cause.message : 'Errore nel caricamento') }
    finally { setLoading(false) }
  }, [demoMode])

  useEffect(() => {
    if (!supabase) { setAuthLoading(false); return }
    const db = supabase
    const applySession = async (userId?: string) => {
      if (!userId) { setProfile(null); setAuthLoading(false); return }
      try { setProfile(await getProfile(userId)); setShowPublic(false) }
      catch { await db.auth.signOut(); setError('Profilo non configurato. Contatta la segreteria.') }
      finally { setAuthLoading(false) }
    }
    db.auth.getSession().then(({ data: { session } }) => applySession(session?.user.id))
    const { data: listener } = db.auth.onAuthStateChange((_event, session) => { void applySession(session?.user.id) })
    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => { if (profile) void refresh() }, [profile, refresh])

  const allowedNav = navItems.filter((item) => profile && item.roles.includes(profile.role))
  const current = navItems.find((item) => item.id === section) ?? navItems[0]
  const actions = profile ? canManage(profile, section) : false

  if (authLoading) return <LoadingScreen />
  if (!profile && showPublic) return <PublicHome onLoginClick={() => setShowPublic(false)} />
  if (!profile) return <Login onBackHome={() => setShowPublic(true)} onDemoLogin={() => { setDemoMode(true); setProfile(demoProfiles.admin) }} />

  async function remove(table: string, id: string) {
    if (!window.confirm('Eliminare definitivamente questo elemento?')) return
    try { if (demoMode) await removeDemoRow(table, id); else await removeRow(table, id); await refresh() } catch (cause) { setError(cause instanceof Error ? cause.message : 'Eliminazione non riuscita') }
  }

  return (
    <div className="min-h-screen bg-skyglass text-slate-900">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 bg-brand-900 px-5 py-6 text-white shadow-soft lg:block">
        <Brand />
        <nav className="mt-8 space-y-2">{allowedNav.map((item) => <NavButton key={item.id} item={item} active={section === item.id} onClick={() => setSection(item.id)} />)}</nav>
        <div className="absolute bottom-6 left-5 right-5 rounded-lg border border-white/15 bg-white/10 p-4">
          <p className="font-bold">{profile.full_name}</p><p className="truncate text-sm text-brand-100">{profile.email}</p>
          <button onClick={() => { if (demoMode) { setProfile(null); setDemoMode(false) } else void supabase?.auth.signOut() }} className="mt-4 flex items-center gap-2 text-sm font-bold"><LogOut size={16} />Esci</button>
        </div>
      </aside>
      <main className="pb-24 lg:ml-72 lg:pb-10">
        <header className="sticky top-0 z-10 border-b border-brand-100 bg-white/95 px-4 py-4 backdrop-blur lg:px-8">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <img src="/logo-valbisagno.jpg" alt="" className="h-11 w-11 rounded-full object-cover ring-2 ring-brand-100 lg:hidden" />
              <div className="min-w-0"><p className="text-sm font-semibold text-brand-700">{roleLabel[profile.role]}</p><h1 className="truncate text-2xl font-bold text-brand-900">{current.label}</h1></div>
            </div>
            {actions && section !== 'dashboard' && <button onClick={() => setEditor({ kind: section })} className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-brand-900 px-4 py-3 text-sm font-bold text-white"><Plus size={18} /><span className="hidden sm:inline">Aggiungi</span></button>}
          </div>
        </header>
        <div className="mx-auto max-w-7xl px-4 py-6 lg:px-8">
          {demoMode && <div className="mb-5 rounded-lg border border-cyan-200 bg-cyan-50 p-3 text-sm font-bold text-cyan-900">Modalità demo: tutte le funzioni sono attive, i dati restano soltanto in questo browser.</div>}
          {error && <div className="mb-5 flex justify-between rounded-lg bg-red-50 p-4 font-semibold text-red-700">{error}<button onClick={() => setError('')}><X size={18} /></button></div>}
          {loading ? <div className="grid min-h-64 place-items-center"><LoaderCircle className="animate-spin text-brand-700" size={32} /></div> : (
            <>
              {section === 'dashboard' && <Dashboard profile={profile} data={data} setSection={setSection} />}
              {section === 'utenti' && <Profiles data={data} edit={(item) => setEditor({ kind: 'utenti', item: item as unknown as Record<string, unknown> })} />}
              {section === 'atlete' && <Athletes data={data} editable={actions} edit={(item) => setEditor({ kind: 'atlete', item: item as unknown as Record<string, unknown> })} remove={(id) => remove('athletes', id)} />}
              {section === 'squadre' && <Teams data={data} editable={actions} edit={(item) => setEditor({ kind: 'squadre', item: item as unknown as Record<string, unknown> })} remove={(id) => remove('teams', id)} />}
              {section === 'calendario' && <Calendar data={data} editable={actions} edit={(item) => setEditor({ kind: 'calendario', item: item as unknown as Record<string, unknown> })} remove={(id) => remove('events', id)} />}
              {section === 'presenze' && <Attendance data={data} editable={actions} edit={(item) => setEditor({ kind: 'presenze', item: item as unknown as Record<string, unknown> })} remove={(id) => remove('attendance', id)} />}
              {section === 'comunicazioni' && <Communications data={data} editable={actions} edit={(item) => setEditor({ kind: 'comunicazioni', item: item as unknown as Record<string, unknown> })} remove={(id) => remove('communications', id)} />}
              {section === 'certificati' && <Certificates data={data} editable={profile.role === 'admin' || profile.role === 'genitore'} edit={(item) => setEditor({ kind: 'certificati', item: item as unknown as Record<string, unknown> })} remove={(id) => remove('medical_certificates', id)} />}
              {section === 'prove' && <Trials data={data} edit={(item) => setEditor({ kind: 'prove', item: item as unknown as Record<string, unknown> })} remove={(id) => remove('trial_requests', id)} />}
              {section === 'diario' && <Diary data={data} editable={actions} edit={(item) => setEditor({ kind: 'diario', item: item as unknown as Record<string, unknown> })} remove={(id) => remove('athlete_goals', id)} />}
            </>
          )}
        </div>
      </main>
      <nav className="fixed inset-x-0 bottom-0 z-30 flex gap-1 overflow-x-auto border-t border-brand-100 bg-white px-2 py-2 shadow-soft lg:hidden">
        {allowedNav.map((item) => <NavButton key={item.id} item={item} mobile active={section === item.id} onClick={() => setSection(item.id)} />)}
      </nav>
      {editor && <EditorModal demoMode={demoMode} editor={editor} data={data} profile={profile} close={() => setEditor(null)} saved={async () => { setEditor(null); await refresh() }} fail={setError} />}
    </div>
  )
}

function LoadingScreen() { return <div className="grid min-h-screen place-items-center bg-skyglass"><LoaderCircle className="animate-spin text-brand-700" size={36} /></div> }
function Brand() { return <div className="flex items-center gap-3"><img src="/logo-valbisagno.jpg" alt="" className="h-14 w-14 rounded-full object-cover ring-4 ring-white/15" /><div className="text-lg font-black leading-tight"><p>Ginnastiche</p><p className="text-brand-100">Valbisagno</p></div></div> }
function NavButton({ item, active, onClick, mobile = false }: { item: typeof navItems[number]; active: boolean; onClick: () => void; mobile?: boolean }) {
  return <button onClick={onClick} className={mobile ? `flex min-w-[76px] flex-col items-center gap-1 rounded-lg px-2 py-2 text-[11px] font-semibold ${active ? 'bg-brand-900 text-white' : 'text-slate-500'}` : `flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-semibold ${active ? 'bg-white text-brand-900' : 'text-brand-50 hover:bg-white/10'}`}><item.icon size={mobile ? 19 : 20} />{item.label}</button>
}
function Badge({ children, className = '' }: { children: ReactNode; className?: string }) { return <span className={`inline-flex rounded-md bg-brand-100 px-2 py-1 text-xs font-black uppercase text-brand-700 ${className}`}>{children}</span> }
function Empty({ text }: { text: string }) { return <div className="rounded-lg border border-dashed border-brand-200 bg-white p-10 text-center text-slate-500">{text}</div> }
function Actions({ edit, remove }: { edit: () => void; remove: () => void }) { return <div className="flex gap-1"><button title="Modifica" onClick={edit} className="rounded-md p-2 text-brand-700 hover:bg-brand-50"><Pencil size={17} /></button><button title="Elimina" onClick={remove} className="rounded-md p-2 text-red-600 hover:bg-red-50"><Trash2 size={17} /></button></div> }

function Dashboard({ profile, data, setSection }: { profile: UserProfile; data: DataState; setSection: (s: Section) => void }) {
  const next = data.events.find((event) => new Date(`${event.event_date}T23:59:59`) >= new Date())
  const competition = data.events.find((event) => event.type === 'gara' && new Date(`${event.event_date}T23:59:59`) >= new Date())
  const cert = certificateState(data.athletes[0]?.medical_certificate_expires_at)
  return <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
    <section className="rounded-lg bg-white p-6 shadow-soft">
      <p className="text-sm font-bold uppercase text-brand-600">Benvenuta/o</p><h2 className="mt-1 text-3xl font-black text-brand-900">{profile.full_name}</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Metric icon={CalendarDays} label="Prossimo evento" value={next ? `${dateLabel(next.event_date)} ${next.starts_at?.slice(0, 5) ?? ''}` : 'Nessuno'} />
        <Metric icon={Medal} label="Prossima gara" value={competition?.title ?? 'Da definire'} />
        <Metric icon={FileHeart} label="Certificato" value={cert.label} />
      </div>
      <button onClick={() => setSection('presenze')} className="mt-5 inline-flex items-center gap-2 rounded-lg bg-brand-900 px-5 py-3 font-bold text-white"><ClipboardCheck size={19} />Segnala o registra assenza</button>
    </section>
    <section className="sport-lines rounded-lg p-6 text-white shadow-soft"><h3 className="text-xl font-black">Comunicazioni</h3><div className="mt-4 space-y-3">{data.communications.slice(0, 3).map((item) => <article key={item.id} className="rounded-lg bg-white/10 p-4"><p className="text-xs font-bold uppercase text-brand-100">{item.category}</p><h4 className="mt-1 font-bold">{item.title}</h4><p className="mt-1 text-sm text-brand-50">{item.body}</p></article>)}{!data.communications.length && <p className="text-brand-50">Nessuna comunicazione.</p>}</div></section>
  </div>
}
function Metric({ icon: Icon, label, value }: { icon: typeof Home; label: string; value: string }) { return <div className="rounded-lg border border-brand-100 bg-skyglass p-4"><Icon className="text-brand-700" size={24} /><p className="mt-3 text-sm font-semibold text-slate-500">{label}</p><p className="mt-1 font-black text-brand-900">{value}</p></div> }

function Athletes({ data, editable, edit, remove }: { data: DataState; editable: boolean; edit: (i: AthleteRow) => void; remove: (id: string) => void }) {
  if (!data.athletes.length) return <Empty text="Nessuna atleta registrata. Usa Aggiungi per inserire la prima." />
  return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{data.athletes.map((a) => <article key={a.id} className="overflow-hidden rounded-lg bg-white shadow-soft">
    <div className="h-44 bg-brand-50">{a.profile_photo_url ? <img src={a.profile_photo_url} alt="" className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-brand-300"><Users size={48} /></div>}</div>
    <div className="p-5"><div className="flex items-start justify-between"><div><h3 className="text-xl font-black text-brand-900">{a.first_name} {a.last_name}</h3><p className="text-sm text-slate-500">Nata il {dateLabel(a.birth_date)}</p></div>{editable && <Actions edit={() => edit(a)} remove={() => remove(a.id)} />}</div>
      <div className="mt-3 flex flex-wrap gap-2">{a.team_members.map((m) => <Badge key={m.team_id}>{m.teams?.name}</Badge>)}</div>
      {a.guardians && <div className="mt-4 rounded-lg bg-brand-50 p-3 text-sm"><p className="font-bold">{a.guardians.full_name}</p><p>{a.guardians.phone}</p><p className="break-all">{a.guardians.email}</p></div>}
    </div></article>)}</div>
}
function Profiles({ data, edit }: { data: DataState; edit: (i: ProfileRow) => void }) {
  return <div className="overflow-x-auto rounded-lg bg-white shadow-soft"><table className="w-full min-w-[680px] text-left text-sm"><thead className="bg-brand-50"><tr><th className="p-4">Nome</th><th className="p-4">Email</th><th className="p-4">Ruolo</th><th className="p-4">Telefono</th><th /></tr></thead><tbody>{data.profiles.map((row) => <tr key={row.id} className="border-t border-brand-50"><td className="p-4 font-bold">{row.full_name}</td><td className="p-4">{row.email}</td><td className="p-4"><Badge>{row.role}</Badge></td><td className="p-4">{row.phone || '-'}</td><td className="p-2"><button title="Modifica profilo" onClick={() => edit(row)} className="rounded-md p-2 text-brand-700 hover:bg-brand-50"><Pencil size={17} /></button></td></tr>)}</tbody></table></div>
}
function Teams({ data, editable, edit, remove }: { data: DataState; editable: boolean; edit: (i: TeamRow) => void; remove: (id: string) => void }) {
  return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{data.teams.map((team) => <article key={team.id} className="rounded-lg bg-white p-5 shadow-soft"><div className="flex items-start justify-between"><div className="flex items-center gap-3"><span className="h-4 w-4 rounded-full" style={{ backgroundColor: team.color }} /><h3 className="text-xl font-black text-brand-900">{team.name}</h3></div>{editable && <Actions edit={() => edit(team)} remove={() => remove(team.id)} />}</div><p className="mt-3 text-slate-600">{team.description}</p><p className="mt-4 text-sm font-bold text-brand-700">{data.athletes.filter((a) => a.team_members.some((m) => m.team_id === team.id)).length} atlete</p></article>)}</div>
}
function Calendar({ data, editable, edit, remove }: { data: DataState; editable: boolean; edit: (i: EventRow) => void; remove: (id: string) => void }) {
  if (!data.events.length) return <Empty text="Nessun evento in calendario." />
  return <div className="space-y-4">{data.events.map((event) => <article key={event.id} className="rounded-lg bg-white p-5 shadow-soft"><div className="flex justify-between gap-3"><div><Badge>{event.type}</Badge><h3 className="mt-2 text-xl font-black text-brand-900">{event.title}</h3><p className="mt-2 text-slate-600">{event.description}</p></div>{editable && <Actions edit={() => edit(event)} remove={() => remove(event.id)} />}</div><div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold text-slate-500"><span>{dateLabel(event.event_date)} · {event.starts_at?.slice(0, 5)}-{event.ends_at?.slice(0, 5)}</span><span>{event.location}</span><span>{event.event_teams.map((t) => t.teams?.name).join(', ')}</span></div></article>)}</div>
}
function Attendance({ data, editable, edit, remove }: { data: DataState; editable: boolean; edit: (i: AttendanceRow) => void; remove: (id: string) => void }) {
  if (!data.attendance.length) return <Empty text="Nessuna presenza registrata." />
  return <div className="overflow-x-auto rounded-lg bg-white shadow-soft"><table className="w-full min-w-[720px] text-left text-sm"><thead className="bg-brand-50"><tr><th className="p-4">Atleta</th><th className="p-4">Evento</th><th className="p-4">Stato</th><th className="p-4">Note</th><th /></tr></thead><tbody>{data.attendance.map((row) => <tr key={row.id} className="border-t border-brand-50"><td className="p-4 font-bold">{row.athletes?.first_name} {row.athletes?.last_name}</td><td className="p-4">{row.events?.title}<small className="block text-slate-500">{dateLabel(row.events?.event_date)}</small></td><td className="p-4"><Badge>{row.status}</Badge></td><td className="p-4">{row.notes || '-'}</td><td className="p-2">{editable && <Actions edit={() => edit(row)} remove={() => remove(row.id)} />}</td></tr>)}</tbody></table></div>
}
function Communications({ data, editable, edit, remove }: { data: DataState; editable: boolean; edit: (i: CommunicationRow) => void; remove: (id: string) => void }) {
  if (!data.communications.length) return <Empty text="Nessuna comunicazione pubblicata." />
  return <div className="grid gap-4 md:grid-cols-2">{data.communications.map((item) => <article key={item.id} className="rounded-lg bg-white p-5 shadow-soft"><div className="flex justify-between"><Badge className={item.is_urgent ? 'bg-red-100 text-red-700' : ''}>{item.category}</Badge>{editable && <Actions edit={() => edit(item)} remove={() => remove(item.id)} />}</div><h3 className="mt-3 text-xl font-black text-brand-900">{item.title}</h3><p className="mt-2 whitespace-pre-line text-slate-600">{item.body}</p><p className="mt-4 text-xs font-semibold text-slate-500">{new Date(item.published_at).toLocaleString('it-IT')}{item.requires_read_confirmation ? ' · Conferma lettura richiesta' : ''}</p></article>)}</div>
}
function Certificates({ data, editable, edit, remove }: { data: DataState; editable: boolean; edit: (i: CertificateRow) => void; remove: (id: string) => void }) {
  if (!data.certificates.length) return <Empty text="Nessun certificato caricato." />
  return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{data.certificates.map((item) => { const state = certificateState(item.expires_at); return <article key={item.id} className="rounded-lg bg-white p-5 shadow-soft"><div className="flex items-start justify-between"><div><h3 className="text-lg font-black text-brand-900">{item.athletes?.first_name} {item.athletes?.last_name}</h3><span className={`mt-2 inline-flex rounded-md px-2 py-1 text-xs font-bold ${state.className}`}>{state.label}</span></div>{editable && <Actions edit={() => edit(item)} remove={() => remove(item.id)} />}</div><p className="mt-4">Scadenza: <strong>{dateLabel(item.expires_at)}</strong></p><a className="mt-3 inline-block font-bold text-brand-700" href={item.file_url} target="_blank" rel="noreferrer">Apri documento</a></article> })}</div>
}
function Trials({ data, edit, remove }: { data: DataState; edit: (i: TrialRow) => void; remove: (id: string) => void }) {
  if (!data.trials.length) return <Empty text="Nessuna richiesta di prova." />
  return <div className="grid gap-4 md:grid-cols-2">{data.trials.map((item) => <article key={item.id} className="rounded-lg bg-white p-5 shadow-soft"><div className="flex justify-between gap-2"><div><h3 className="text-xl font-black text-brand-900">{item.child_name}, {item.age} anni</h3><Badge>{item.status}</Badge></div><Actions edit={() => edit(item)} remove={() => remove(item.id)} /></div><p className="mt-3 font-semibold">{item.discipline}</p><p className="mt-2 text-sm text-slate-500">{item.guardian_name} · {item.phone} · {item.email}</p>{item.notes && <p className="mt-3 rounded-lg bg-brand-50 p-3 text-sm">{item.notes}</p>}</article>)}</div>
}
function Diary({ data, editable, edit, remove }: { data: DataState; editable: boolean; edit: (i: GoalRow) => void; remove: (id: string) => void }) {
  const athlete = data.athletes[0]
  if (!athlete) return <Empty text="Inserisci almeno un'atleta per creare il diario." />
  return <div className="grid gap-5 xl:grid-cols-[0.75fr_1.25fr]"><section className="sport-lines overflow-hidden rounded-lg text-white shadow-soft">{athlete.profile_photo_url && <img src={athlete.profile_photo_url} alt="" className="h-72 w-full object-cover" />}<div className="p-6"><p className="text-sm font-bold uppercase text-brand-100">Diario della ginnasta</p><h2 className="mt-2 text-4xl font-black">{athlete.first_name} {athlete.last_name}</h2><div className="mt-5 flex gap-4"><MetricSmall icon={CheckCircle2} label="Obiettivi" value={String(data.goals.filter((g) => g.athlete_id === athlete.id).length)} /><MetricSmall icon={Medal} label="Raggiunti" value={String(data.goals.filter((g) => g.athlete_id === athlete.id && ['raggiunto', 'consolidato'].includes(g.status)).length)} /></div></div></section><section className="rounded-lg bg-white p-5 shadow-soft"><h3 className="text-xl font-black text-brand-900">Obiettivi tecnici</h3><div className="mt-4 space-y-3">{data.goals.map((goal) => <article key={goal.id} className="rounded-lg border border-brand-100 p-4"><div className="flex justify-between"><div><h4 className="font-black">{goal.goals?.title ?? goal.custom_title}</h4><p className="text-sm text-brand-700">{goal.goals?.apparatus}</p></div><div className="flex items-start gap-2"><Badge>{goal.status}</Badge>{editable && <Actions edit={() => edit(goal)} remove={() => remove(goal.id)} />}</div></div><p className="mt-2 text-sm text-slate-600">{goal.coach_note}</p></article>)}{!data.goals.length && <p className="text-slate-500">Nessun obiettivo assegnato.</p>}</div></section></div>
}
function MetricSmall({ icon: Icon, label, value }: { icon: typeof Home; label: string; value: string }) { return <div><Icon size={22} /><p className="mt-1 text-2xl font-black">{value}</p><p className="text-xs text-brand-100">{label}</p></div> }

function EditorModal({ editor, data, profile, demoMode, close, saved, fail }: { editor: NonNullable<Editor>; data: DataState; profile: UserProfile; demoMode: boolean; close: () => void; saved: () => Promise<void>; fail: (m: string) => void }) {
  const [saving, setSaving] = useState(false)
  const item = editor.item ?? {}
  const id = item.id as string | undefined
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true)
    const form = event.currentTarget
    const values: Record<string, unknown> = Object.fromEntries(new FormData(form).entries())
    const checked = (name: string) => Array.from(form.querySelectorAll<HTMLInputElement>(`input[name="${name}"]:checked`)).map((el) => el.value)
    try {
      if (editor.kind === 'utenti') {
        if (id) await (demoMode ? saveDemoSimple : saveSimple)('users_profiles', { full_name: values.full_name, phone: values.phone || null, role: values.role }, id)
        else await (demoMode ? createDemoUser : createUser)(values)
      }
      if (editor.kind === 'squadre') await (demoMode ? saveDemoTeam : saveTeam)(values, checked('coach_ids'), id)
      if (editor.kind === 'atlete') {
        if ((values.photo as File)?.size) values.profile_photo_url = demoMode ? await demoFile(values.photo as File) : await uploadFile('athlete-media', values.photo as File)
        else values.profile_photo_url = item.profile_photo_path ?? item.profile_photo_url
        await (demoMode ? saveDemoAthlete : saveAthlete)({ ...values, guardian_id: item.guardian_id }, checked('team_ids'), id)
      }
      if (editor.kind === 'calendario') await (demoMode ? saveDemoEvent : saveEvent)(values, checked('team_ids'), id)
      if (editor.kind === 'presenze') await (demoMode ? saveDemoSimple : saveSimple)('attendance', { athlete_id: values.athlete_id, event_id: values.event_id, status: values.status, notes: values.notes || null, reported_by: profile.id }, id)
      if (editor.kind === 'comunicazioni') await (demoMode ? saveDemoSimple : saveSimple)('communications', { title: values.title, body: values.body, category: values.category, is_urgent: values.is_urgent === 'on', requires_read_confirmation: values.requires_read_confirmation === 'on', created_by: profile.id, published_at: item.published_at ?? new Date().toISOString() }, id)
      if (editor.kind === 'certificati') {
        let fileUrl = (item.storage_path ?? item.file_url) as string | undefined
        if ((values.file as File)?.size) fileUrl = demoMode ? await demoFile(values.file as File) : await uploadFile('certificates', values.file as File)
        if (!fileUrl) throw new Error('Seleziona il certificato da caricare.')
        const status = certificateState(values.expires_at as string).label.toLowerCase()
        await (demoMode ? saveDemoSimple : saveSimple)('medical_certificates', { athlete_id: values.athlete_id, file_url: fileUrl, expires_at: values.expires_at, status, uploaded_by: profile.id }, id)
      }
      if (editor.kind === 'prove') await (demoMode ? saveDemoSimple : saveSimple)('trial_requests', { status: values.status }, id)
      if (editor.kind === 'diario') await (demoMode ? saveDemoSimple : saveSimple)('athlete_goals', { athlete_id: values.athlete_id, goal_id: values.goal_id, status: values.status, coach_note: values.coach_note || null, assigned_by: profile.id }, id)
      await saved()
    } catch (cause) { fail(cause instanceof Error ? cause.message : 'Salvataggio non riuscito') } finally { setSaving(false) }
  }
  return <div className="fixed inset-0 z-50 grid place-items-end bg-brand-950/50 p-0 sm:place-items-center sm:p-4" onMouseDown={(e) => { if (e.target === e.currentTarget) close() }}>
    <form onSubmit={submit} className="max-h-[92vh] w-full overflow-y-auto rounded-t-lg bg-white p-5 shadow-soft sm:max-w-2xl sm:rounded-lg sm:p-6">
      <div className="flex items-center justify-between"><h2 className="text-2xl font-black text-brand-900">{id ? 'Modifica' : 'Nuovo elemento'}</h2><button type="button" onClick={close} className="rounded-md p-2 hover:bg-brand-50"><X /></button></div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2"><EditorFields kind={editor.kind} item={item} data={data} /></div>
      <button disabled={saving} className="mt-6 w-full rounded-lg bg-brand-900 px-5 py-4 font-black text-white disabled:opacity-60">{saving ? 'Salvataggio...' : 'Salva'}</button>
    </form>
  </div>
}

function EditorFields({ kind, item, data }: { kind: Section; item: Record<string, unknown>; data: DataState }) {
  const input = (name: string, label: string, type = 'text', required = true, value?: unknown) => <Field label={label}><input name={name} type={type} required={required} defaultValue={String(value ?? item[name] ?? '')} className="input" /></Field>
  const option = (value: string, label = value) => <option key={value} value={value}>{label}</option>
  if (kind === 'utenti') return <>{input('full_name','Nome e cognome')}{input('email','Email','email',!item.id)}{input('phone','Telefono','tel',false)}<Field label="Ruolo"><select name="role" defaultValue={String(item.role ?? 'genitore')} className="input">{['admin','tecnico','genitore','atleta'].map((v) => option(v))}</select></Field>{!item.id && input('password','Password iniziale','password')}</>
  if (kind === 'squadre') {
    const team = item as unknown as TeamRow
    return <>{input('name', 'Nome')}{input('color', 'Colore', 'color', true, item.color ?? '#0f766e')}<Field label="Descrizione" wide><textarea name="description" defaultValue={String(item.description ?? '')} className="input min-h-24" /></Field><Checks label="Tecnici assegnati" name="coach_ids" data={data.profiles.filter((p) => p.role === 'tecnico').map((p) => ({ id:p.id,label:p.full_name }))} selected={team.team_members?.map((m) => m.coach_id).filter((id): id is string => Boolean(id)) ?? []} /></>
  }
  if (kind === 'atlete') {
    const athlete = item as unknown as AthleteRow
    return <>{input('first_name', 'Nome')}{input('last_name', 'Cognome')}{input('birth_date', 'Data di nascita', 'date')}{input('medical_certificate_expires_at', 'Scadenza certificato', 'date', false)}
      {input('guardian_name', 'Nome genitore', 'text', true, athlete.guardians?.full_name)}{input('guardian_phone', 'Telefono genitore', 'tel', false, athlete.guardians?.phone)}{input('guardian_email', 'Email genitore', 'email', true, athlete.guardians?.email)}
      <SelectRows optional name="guardian_user_id" label="Account genitore" value={athlete.guardians?.user_id} rows={data.profiles.filter((p) => p.role === 'genitore').map((p) => ({ id:p.id,label:p.full_name }))} />
      <SelectRows optional name="athlete_user_id" label="Account atleta" value={athlete.user_id} rows={data.profiles.filter((p) => p.role === 'atleta').map((p) => ({ id:p.id,label:p.full_name }))} />
      <Field label="Foto profilo"><input name="photo" type="file" accept="image/*" className="input" /></Field><Field label="Note sanitarie" wide><textarea name="medical_notes" defaultValue={String(item.medical_notes ?? '')} className="input min-h-20" /></Field>
      <Checks label="Squadre" name="team_ids" data={data.teams.map((t) => ({ id: t.id, label: t.name }))} selected={athlete.team_members?.map((m) => m.team_id) ?? []} /></>
  }
  if (kind === 'calendario') {
    const event = item as unknown as EventRow
    return <><Field label="Tipo"><select name="type" defaultValue={String(item.type ?? 'allenamento')} className="input">{['allenamento','gara','saggio','stage','riunione','chiusura'].map((v) => option(v))}</select></Field>{input('title','Titolo')}{input('event_date','Data','date')}{input('starts_at','Ora inizio','time',false)}{input('ends_at','Ora fine','time',false)}{input('location','Luogo','text',false)}<Field label="Descrizione" wide><textarea name="description" defaultValue={String(item.description ?? '')} className="input min-h-20" /></Field><Checks label="Gruppi coinvolti" name="team_ids" data={data.teams.map((t) => ({ id:t.id,label:t.name }))} selected={event.event_teams?.map((t) => t.team_id) ?? []} /></>
  }
  if (kind === 'presenze') return <><SelectRows name="athlete_id" label="Atleta" value={item.athlete_id} rows={data.athletes.map((a) => ({ id:a.id,label:`${a.first_name} ${a.last_name}` }))} /><SelectRows name="event_id" label="Evento" value={item.event_id} rows={data.events.map((e) => ({ id:e.id,label:`${dateLabel(e.event_date)} · ${e.title}` }))} /><Field label="Stato"><select name="status" defaultValue={String(item.status ?? 'presente')} className="input">{['presente','assente','ritardo','uscita anticipata'].map((v) => option(v))}</select></Field>{input('notes','Note','text',false)}</>
  if (kind === 'comunicazioni') return <>{input('title','Titolo')}<Field label="Categoria"><select name="category" defaultValue={String(item.category ?? 'allenamenti')} className="input">{['allenamenti','gare','documenti','quote','eventi','urgente'].map((v) => option(v))}</select></Field><Field label="Testo" wide><textarea required name="body" defaultValue={String(item.body ?? '')} className="input min-h-32" /></Field><Check name="is_urgent" label="Comunicazione urgente" checked={Boolean(item.is_urgent)} /><Check name="requires_read_confirmation" label="Richiedi conferma lettura" checked={Boolean(item.requires_read_confirmation)} /></>
  if (kind === 'certificati') return <><SelectRows name="athlete_id" label="Atleta" value={item.athlete_id} rows={data.athletes.map((a) => ({ id:a.id,label:`${a.first_name} ${a.last_name}` }))} />{input('expires_at','Data di scadenza','date')}<Field label="Documento PDF o immagine" wide><input name="file" type="file" accept="application/pdf,image/*" className="input" /></Field></>
  if (kind === 'prove') return <><div className="sm:col-span-2 rounded-lg bg-brand-50 p-4"><strong>{String(item.child_name)}</strong><p className="text-sm">{String(item.guardian_name)} · {String(item.phone)}</p></div><Field label="Stato" wide><select name="status" defaultValue={String(item.status ?? 'nuova')} className="input">{['nuova','contattata','prova fissata','iscritta','non interessata'].map((v) => option(v))}</select></Field></>
  if (kind === 'diario') return <><SelectRows name="athlete_id" label="Atleta" value={item.athlete_id} rows={data.athletes.map((a) => ({ id:a.id,label:`${a.first_name} ${a.last_name}` }))} /><SelectRows name="goal_id" label="Obiettivo" value={(item.goals as { id?: string } | undefined)?.id ?? item.goal_id} rows={data.goalCatalog.map((g) => ({ id:g.id,label:`${g.title} · ${g.apparatus}` }))} /><Field label="Stato"><select name="status" defaultValue={String(item.status ?? 'da iniziare')} className="input">{['da iniziare','in corso','raggiunto','consolidato'].map((v) => option(v))}</select></Field>{input('coach_note','Nota tecnica','text',false)}</>
  return null
}
function Field({ label, wide, children }: { label: string; wide?: boolean; children: ReactNode }) { return <label className={`block text-sm font-bold text-slate-700 ${wide ? 'sm:col-span-2' : ''}`}>{label}{children}</label> }
function Check({ name, label, checked }: { name: string; label: string; checked: boolean }) { return <label className="flex items-center gap-3 rounded-lg bg-brand-50 p-3 text-sm font-bold"><input name={name} type="checkbox" defaultChecked={checked} />{label}</label> }
function Checks({ label, name, data, selected }: { label: string; name: string; data: Array<{id:string;label:string}>; selected: string[] }) { return <Field label={label} wide><div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">{data.map((row) => <label key={row.id} className="flex items-center gap-2 rounded-lg bg-brand-50 p-3 text-sm"><input type="checkbox" name={name} value={row.id} defaultChecked={selected.includes(row.id)} />{row.label}</label>)}</div></Field> }
function SelectRows({ name, label, value, rows, optional = false }: { name:string;label:string;value:unknown;rows:Array<{id:string;label:string}>;optional?:boolean }) { return <Field label={label}><select required={!optional} name={name} defaultValue={String(value ?? '')} className="input"><option value="">Seleziona...</option>{rows.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}</select></Field> }
