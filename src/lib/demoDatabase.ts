import { athleteGoals, athletes, attendance, communications, demoProfiles, events, teams, trialRequests } from './mockData'
import type {
  AthleteRow, AttendanceRow, CertificateRow, CommunicationRow, EventRow, GoalRow,
  MembershipRow, PaymentRow, ProfileRow, SubstitutionRow, TeacherAttendanceRow, TeamRow,
  TrainingProgramRow, TrialRow,
} from './database'

const KEY = 'gv-demo-management-v1'
const id = () => crypto.randomUUID()

type DemoData = {
  profiles: ProfileRow[]
  teams: TeamRow[]
  athletes: AthleteRow[]
  events: EventRow[]
  attendance: AttendanceRow[]
  communications: CommunicationRow[]
  certificates: CertificateRow[]
  trials: TrialRow[]
  goals: GoalRow[]
  goalCatalog: Array<{ id: string; title: string; apparatus: string }>
  teacherAttendance: TeacherAttendanceRow[]
  trainingPrograms: TrainingProgramRow[]
  payments: PaymentRow[]
  memberships: MembershipRow[]
  substitutions: SubstitutionRow[]
}

function seed(): DemoData {
  const teamRows: TeamRow[] = teams.map((team) => ({
    id: team.id,
    name: team.name,
    description: team.description,
    color: team.color,
    season: team.season ?? '2026/2027',
    age_range: team.age_range ?? null,
    level: team.level ?? null,
    gym: team.gym ?? null,
    days: team.days ?? null,
    times: team.times ?? null,
    team_members: team.coachIds.map((coach_id) => ({ coach_id })),
  }))
  const athleteRows: AthleteRow[] = athletes.map((athlete) => ({
    id: athlete.id,
    first_name: athlete.first_name,
    last_name: athlete.last_name,
    birth_date: athlete.birth_date,
    guardian_id: `guardian-${athlete.id}`,
    user_id: athlete.id === 'athlete-1' ? demoProfiles.atleta.id : null,
    medical_certificate_expires_at: athlete.medical_certificate_expires_at,
    medical_notes: athlete.medical_notes ?? null,
    profile_photo_url: athlete.profile_photo_url ?? null,
    guardians: {
      full_name: athlete.guardian_name,
      phone: athlete.guardian_phone,
      email: athlete.guardian_email,
      user_id: athlete.id === 'athlete-1' ? demoProfiles.genitore.id : null,
    },
    team_members: athlete.teamIds.map((team_id) => ({
      team_id,
      teams: { name: teams.find((team) => team.id === team_id)?.name ?? '' },
    })),
  }))
  const eventRows: EventRow[] = events.map((event) => ({
    id: event.id,
    type: event.type,
    title: event.title,
    event_date: event.date,
    starts_at: event.starts_at,
    ends_at: event.ends_at,
    location: event.location,
    description: event.description,
    event_teams: event.teamIds.map((team_id) => ({
      team_id,
      teams: { name: teams.find((team) => team.id === team_id)?.name ?? '' },
    })),
  }))
  const catalog = athleteGoals.map((goal) => ({ id: `catalog-${goal.id}`, title: goal.title, apparatus: goal.apparatus }))
  return {
    profiles: Object.values(demoProfiles),
    teams: teamRows,
    athletes: athleteRows,
    events: eventRows,
    attendance: attendance.map((row) => {
      const athlete = athleteRows.find((item) => item.id === row.athleteId)
      const event = eventRows.find((item) => item.id === row.eventId)
      return {
        id: row.id, athlete_id: row.athleteId, event_id: row.eventId, status: row.status,
        notes: row.notes ?? null,
        athletes: athlete ? { first_name: athlete.first_name, last_name: athlete.last_name } : null,
        events: event ? { title: event.title, event_date: event.event_date } : null,
      }
    }),
    communications: communications.map((row) => ({
      id: row.id, title: row.title, body: row.body, category: row.category,
      is_urgent: row.category === 'urgente', published_at: row.published_at,
      requires_read_confirmation: row.requires_read_confirmation,
    })),
    certificates: athleteRows.map((athlete) => ({
      id: `cert-${athlete.id}`, athlete_id: athlete.id, file_url: '#',
      expires_at: athlete.medical_certificate_expires_at ?? '2026-12-31',
      status: 'valido', athletes: { first_name: athlete.first_name, last_name: athlete.last_name },
    })),
    trials: trialRequests.map((row) => ({ ...row, notes: row.notes ?? null })),
    goals: athleteGoals.map((goal, index) => ({
      id: goal.id, athlete_id: goal.athleteId, status: goal.status,
      coach_note: goal.coach_note, custom_title: goal.title,
      goals: { title: goal.title, apparatus: goal.apparatus },
      goal_id: catalog[index].id,
    })) as GoalRow[],
    goalCatalog: catalog,
    teacherAttendance: [
      {
        id: 'teacher-att-1',
        teacher_id: 'profile-coach',
        event_id: 'event-1',
        started_at: '2026-07-07T17:00:00',
        ended_at: '2026-07-07T19:02:00',
        duration_minutes: 122,
        users_profiles: { full_name: 'Sara Tecnica' },
        events: { title: 'Allenamento Silver + Agonistica', event_date: '2026-07-07' },
      },
    ],
    trainingPrograms: [
      {
        id: 'program-1',
        event_id: 'event-1',
        team_id: 'agonistica',
        objectives: 'Pulizia rondate e lavoro sugli arrivi bloccati.',
        exercises: 'Riscaldamento dinamico, diagonali corpo libero, trave bassa.',
        athletic_preparation: 'Circuito core, mobilita spalle, salti pliometrici.',
        technical_elements: 'Rondata, verticale, entrata trave.',
        final_notes: 'Gruppo concentrato. Riprendere arrivi in buca nella prossima lezione.',
        created_by: 'profile-coach',
        events: { title: 'Allenamento Silver + Agonistica', event_date: '2026-07-07' },
        teams: { name: 'Agonistica' },
      },
    ],
    payments: [
      {
        id: 'payment-1',
        athlete_id: 'athlete-1',
        description: 'Quota associativa 2026/2027',
        amount: 80,
        due_date: '2026-09-15',
        paid_at: null,
        status: 'non pagato',
        receipt_url: null,
        athletes: { first_name: 'Emma', last_name: 'Bianchi' },
      },
      {
        id: 'payment-2',
        athlete_id: 'athlete-3',
        description: 'Gara Trofeo Estate',
        amount: 25,
        due_date: '2026-07-18',
        paid_at: '2026-07-10',
        status: 'pagato',
        receipt_url: null,
        athletes: { first_name: 'Nora', last_name: 'Ferrari' },
      },
    ],
    memberships: [
      {
        id: 'membership-1',
        athlete_id: 'athlete-1',
        season: '2025/2026',
        federation: 'UISP',
        card_number: 'UISP-2025-001',
        status: 'scaduta',
        source: 'import UISP',
        athletes: { first_name: 'Emma', last_name: 'Bianchi' },
      },
      {
        id: 'membership-2',
        athlete_id: 'athlete-1',
        season: '2026/2027',
        federation: 'UISP',
        card_number: 'UISP-2026-118',
        status: 'attiva',
        source: 'import UISP',
        athletes: { first_name: 'Emma', last_name: 'Bianchi' },
      },
    ],
    substitutions: [
      {
        id: 'sub-1',
        event_id: 'event-2',
        absent_teacher_id: 'profile-coach',
        substitute_teacher_id: 'profile-teacher',
        reason: 'Impegno gara regionale',
        status: 'assegnata',
        events: { title: 'Trofeo Estate Genova', event_date: '2026-07-19' },
        absent_teacher: { full_name: 'Sara Tecnica' },
        substitute_teacher: { full_name: 'Martina Insegnante' },
      },
    ],
  }
}

function read(): DemoData {
  const stored = localStorage.getItem(KEY)
  if (!stored) {
    const initial = seed()
    write(initial)
    return initial
  }
  const parsed = JSON.parse(stored) as Partial<DemoData>
  return { ...seed(), ...parsed } as DemoData
}

function write(data: DemoData) {
  localStorage.setItem(KEY, JSON.stringify(data))
}

export async function loadDemoData() {
  return read()
}

export async function saveDemoTeam(values: Record<string, unknown>, coachIds: string[], teamId?: string) {
  const data = read()
  const row: TeamRow = {
    id: teamId ?? id(), name: String(values.name), description: String(values.description || ''),
    color: String(values.color || '#0f766e'),
    season: String(values.season || '') || null,
    age_range: String(values.age_range || '') || null,
    level: String(values.level || '') || null,
    gym: String(values.gym || '') || null,
    days: String(values.days || '') || null,
    times: String(values.times || '') || null,
    team_members: coachIds.map((coach_id) => ({ coach_id })),
  }
  data.teams = teamId ? data.teams.map((item) => item.id === teamId ? row : item) : [...data.teams, row]
  write(data)
}

export async function saveDemoAthlete(values: Record<string, unknown>, teamIds: string[], athleteId?: string) {
  const data = read()
  const row: AthleteRow = {
    id: athleteId ?? id(), first_name: String(values.first_name), last_name: String(values.last_name),
    birth_date: String(values.birth_date), guardian_id: String(values.guardian_id || id()),
    user_id: String(values.athlete_user_id || '') || null,
    medical_certificate_expires_at: String(values.medical_certificate_expires_at || '') || null,
    medical_notes: String(values.medical_notes || '') || null,
    profile_photo_url: String(values.profile_photo_url || '') || null,
    guardians: {
      full_name: String(values.guardian_name), phone: String(values.guardian_phone || '') || null,
      email: String(values.guardian_email), user_id: String(values.guardian_user_id || '') || null,
    },
    team_members: teamIds.map((team_id) => ({ team_id, teams: { name: data.teams.find((team) => team.id === team_id)?.name ?? '' } })),
  }
  data.athletes = athleteId ? data.athletes.map((item) => item.id === athleteId ? row : item) : [...data.athletes, row]
  write(data)
}

export async function saveDemoEvent(values: Record<string, unknown>, teamIds: string[], eventId?: string) {
  const data = read()
  const row: EventRow = {
    id: eventId ?? id(), type: String(values.type), title: String(values.title),
    event_date: String(values.event_date), starts_at: String(values.starts_at || '') || null,
    ends_at: String(values.ends_at || '') || null, location: String(values.location || '') || null,
    description: String(values.description || '') || null,
    event_teams: teamIds.map((team_id) => ({ team_id, teams: { name: data.teams.find((team) => team.id === team_id)?.name ?? '' } })),
  }
  data.events = eventId ? data.events.map((item) => item.id === eventId ? row : item) : [...data.events, row]
  write(data)
}

export async function saveDemoSimple(table: string, values: Record<string, unknown>, rowId?: string) {
  const data = read()
  const key = ({
    users_profiles: 'profiles',
    attendance: 'attendance',
    communications: 'communications',
    medical_certificates: 'certificates',
    trial_requests: 'trials',
    athlete_goals: 'goals',
    teacher_attendance: 'teacherAttendance',
    training_programs: 'trainingPrograms',
    payments: 'payments',
    athlete_memberships: 'memberships',
    substitution_requests: 'substitutions',
  } as Record<string, keyof DemoData>)[table]
  if (!key) return
  const collection = data[key] as Array<Record<string, unknown>>
  const existing = collection.find((row) => row.id === rowId) ?? {}
  const row: Record<string, unknown> = { ...existing, ...values, id: rowId ?? id() }
  if (table === 'attendance') {
    const athlete = data.athletes.find((item) => item.id === values.athlete_id)
    const event = data.events.find((item) => item.id === values.event_id)
    row.athletes = athlete ? { first_name: athlete.first_name, last_name: athlete.last_name } : null
    row.events = event ? { title: event.title, event_date: event.event_date } : null
  }
  if (table === 'medical_certificates') {
    const athlete = data.athletes.find((item) => item.id === values.athlete_id)
    row.athletes = athlete ? { first_name: athlete.first_name, last_name: athlete.last_name } : null
  }
  if (table === 'athlete_goals') {
    const goal = data.goalCatalog.find((item) => item.id === values.goal_id)
    row.goals = goal ? { title: goal.title, apparatus: goal.apparatus } : null
  }
  if (['payments', 'athlete_memberships'].includes(table)) {
    const athlete = data.athletes.find((item) => item.id === values.athlete_id)
    row.athletes = athlete ? { first_name: athlete.first_name, last_name: athlete.last_name } : null
  }
  if (table === 'teacher_attendance') {
    const teacher = data.profiles.find((item) => item.id === values.teacher_id)
    const event = data.events.find((item) => item.id === values.event_id)
    row.users_profiles = teacher ? { full_name: teacher.full_name } : null
    row.events = event ? { title: event.title, event_date: event.event_date } : null
  }
  if (table === 'training_programs') {
    const event = data.events.find((item) => item.id === values.event_id)
    const team = data.teams.find((item) => item.id === values.team_id)
    row.events = event ? { title: event.title, event_date: event.event_date } : null
    row.teams = team ? { name: team.name } : null
  }
  if (table === 'substitution_requests') {
    const event = data.events.find((item) => item.id === values.event_id)
    const absent = data.profiles.find((item) => item.id === values.absent_teacher_id)
    const substitute = data.profiles.find((item) => item.id === values.substitute_teacher_id)
    row.events = event ? { title: event.title, event_date: event.event_date } : null
    row.absent_teacher = absent ? { full_name: absent.full_name } : null
    row.substitute_teacher = substitute ? { full_name: substitute.full_name } : null
  }
  ;(data[key] as Array<Record<string, unknown>>) = rowId
    ? collection.map((item) => item.id === rowId ? row : item)
    : [row, ...collection]
  write(data)
}

export async function removeDemoRow(table: string, rowId: string) {
  const data = read()
  const key = ({
    users_profiles: 'profiles',
    teams: 'teams',
    athletes: 'athletes',
    events: 'events',
    attendance: 'attendance',
    communications: 'communications',
    medical_certificates: 'certificates',
    trial_requests: 'trials',
    athlete_goals: 'goals',
    teacher_attendance: 'teacherAttendance',
    training_programs: 'trainingPrograms',
    payments: 'payments',
    athlete_memberships: 'memberships',
    substitution_requests: 'substitutions',
  } as Record<string, keyof DemoData>)[table]
  if (key) {
    const collection = data[key] as Array<Record<string, unknown>>
    ;(data[key] as Array<Record<string, unknown>>) = collection.filter((row) => row.id !== rowId)
    write(data)
  }
}

export async function demoFile(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('File non leggibile'))
    reader.readAsDataURL(file)
  })
}

export async function createDemoUser(values: Record<string, unknown>) {
  await saveDemoSimple('users_profiles', {
    full_name: values.full_name, email: values.email, phone: values.phone || null, role: values.role,
  })
}
