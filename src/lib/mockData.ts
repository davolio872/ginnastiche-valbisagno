import type {
  Athlete,
  AthleteGoal,
  Attendance,
  Communication,
  EventItem,
  Role,
  Team,
  TrialRequest,
  UserProfile,
} from './types'

export const demoProfiles: Record<Role, UserProfile> = {
  admin: {
    id: 'profile-admin',
    full_name: 'Presidenza Valbisagno',
    email: 'admin@ginnastichevalbisagno.it',
    role: 'admin',
  },
  presidente: {
    id: 'profile-president',
    full_name: 'Presidente Valbisagno',
    email: 'presidente@ginnastichevalbisagno.it',
    role: 'presidente',
  },
  segreteria: {
    id: 'profile-office',
    full_name: 'Segreteria Valbisagno',
    email: 'segreteria@ginnastichevalbisagno.it',
    role: 'segreteria',
  },
  direttore_tecnico: {
    id: 'profile-director',
    full_name: 'Direzione Tecnica',
    email: 'dt@ginnastichevalbisagno.it',
    role: 'direttore_tecnico',
  },
  tecnico: {
    id: 'profile-coach',
    full_name: 'Sara Tecnica',
    email: 'tecnico@ginnastichevalbisagno.it',
    role: 'tecnico',
  },
  insegnante: {
    id: 'profile-teacher',
    full_name: 'Martina Insegnante',
    email: 'insegnante@ginnastichevalbisagno.it',
    role: 'insegnante',
  },
  genitore: {
    id: 'profile-parent',
    full_name: 'Laura Bianchi',
    email: 'genitore@example.com',
    role: 'genitore',
  },
  famiglia: {
    id: 'profile-family',
    full_name: 'Famiglia Bianchi',
    email: 'famiglia@example.com',
    role: 'famiglia',
  },
  atleta: {
    id: 'profile-athlete',
    full_name: 'Emma Bianchi',
    email: 'atleta@example.com',
    role: 'atleta',
  },
}

export const teams: Team[] = [
  { id: 'pulcini', name: 'Pulcini', description: 'Avviamento motorio e gioco ginnico.', color: '#18aaa5', coachIds: ['profile-coach', 'profile-teacher'], season: '2026/2027', age_range: '4-6 anni', level: 'Avviamento', gym: 'Palestra Valbisagno', days: 'Lunedi, Mercoledi', times: '16:30-17:30' },
  { id: 'pre-agonistica', name: 'Pre-Agonistica', description: 'Preparazione al percorso competitivo.', color: '#0a6d78', coachIds: ['profile-coach'], season: '2026/2027', age_range: '7-10 anni', level: 'Intermedio', gym: 'Palestra Valbisagno', days: 'Martedi, Giovedi', times: '17:00-18:30' },
  { id: 'rassegna', name: 'Rassegna', description: 'Percorso promozionale e saggi societari.', color: '#38bdf8', coachIds: ['profile-teacher'], season: '2026/2027', age_range: '8-13 anni', level: 'Base', gym: 'Palestra Valbisagno', days: 'Venerdi', times: '17:00-18:30' },
  { id: 'silver', name: 'Silver', description: 'Programma gare Silver.', color: '#0ea5e9', coachIds: ['profile-coach'], season: '2026/2027', age_range: '8-16 anni', level: 'Silver', gym: 'Palestra Valbisagno', days: 'Lunedi, Mercoledi, Venerdi', times: '18:00-20:00' },
  { id: 'agonistica', name: 'Agonistica', description: 'Programma competitivo federale.', color: '#063f4d', coachIds: ['profile-coach'], season: '2026/2027', age_range: '9+ anni', level: 'Agonistica', gym: 'Palestra Valbisagno', days: 'Lunedi, Martedi, Giovedi', times: '18:00-20:30' },
  { id: 'acrobatica', name: 'Acrobatica', description: 'Acrobatica a coppie e collettiva.', color: '#0891b2', coachIds: ['profile-teacher'], season: '2026/2027', age_range: '10+ anni', level: 'Acrobatica', gym: 'Palestra Valbisagno', days: 'Mercoledi', times: '19:00-20:30' },
  { id: 'corso-adulti', name: 'Corso Adulti', description: 'Fitness ginnico e mobilita per adulti.', color: '#0284c7', coachIds: ['profile-teacher'], season: '2026/2027', age_range: '18+ anni', level: 'Adulti', gym: 'Palestra Valbisagno', days: 'Martedi', times: '20:00-21:00' },
]

export const athletes: Athlete[] = [
  {
    id: 'athlete-1',
    first_name: 'Emma',
    last_name: 'Bianchi',
    birth_date: '2014-04-18',
    guardian_name: 'Laura Bianchi',
    guardian_phone: '+39 333 123 4567',
    guardian_email: 'genitore@example.com',
    medical_certificate_expires_at: '2026-07-29',
    medical_notes: 'Allergia lieve al lattice.',
    profile_photo_url: 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&w=600&q=80',
    teamIds: ['silver', 'agonistica'],
  },
  {
    id: 'athlete-2',
    first_name: 'Giulia',
    last_name: 'Rossi',
    birth_date: '2016-09-02',
    guardian_name: 'Marco Rossi',
    guardian_phone: '+39 340 987 6543',
    guardian_email: 'marco.rossi@example.com',
    medical_certificate_expires_at: '2026-11-15',
    profile_photo_url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=600&q=80',
    teamIds: ['pulcini'],
  },
  {
    id: 'athlete-3',
    first_name: 'Nora',
    last_name: 'Ferrari',
    birth_date: '2012-01-24',
    guardian_name: 'Elena Ferrari',
    guardian_phone: '+39 349 444 1212',
    guardian_email: 'elena.ferrari@example.com',
    medical_certificate_expires_at: '2026-06-20',
    profile_photo_url: 'https://images.unsplash.com/photo-1576678927484-cc907957088c?auto=format&fit=crop&w=600&q=80',
    teamIds: ['agonistica'],
  },
]

export const events: EventItem[] = [
  {
    id: 'event-1',
    type: 'allenamento',
    title: 'Allenamento Silver + Agonistica',
    date: '2026-07-07',
    starts_at: '17:00',
    ends_at: '19:00',
    location: 'Palestra Valbisagno',
    description: 'Riscaldamento, trave, corpo libero e circuito acrobatico.',
    teamIds: ['silver', 'agonistica'],
  },
  {
    id: 'event-2',
    type: 'gara',
    title: 'Trofeo Estate Genova',
    date: '2026-07-19',
    starts_at: '09:30',
    ends_at: '13:00',
    location: 'Palazzetto dello Sport',
    description: 'Convocazione 08:15 con body societario.',
    teamIds: ['agonistica', 'silver'],
  },
  {
    id: 'event-3',
    type: 'riunione',
    title: 'Riunione genitori inizio stagione',
    date: '2026-09-03',
    starts_at: '18:30',
    ends_at: '19:30',
    location: 'Sala corsi',
    description: 'Presentazione calendario, quote e certificati.',
    teamIds: ['pulcini', 'pre-agonistica', 'rassegna', 'silver', 'agonistica'],
  },
]

export const attendance: Attendance[] = [
  { id: 'att-1', athleteId: 'athlete-1', eventId: 'event-1', status: 'presente' },
  { id: 'att-2', athleteId: 'athlete-2', eventId: 'event-1', status: 'assente giustificato', notes: 'Segnalata dal genitore.' },
  { id: 'att-3', athleteId: 'athlete-3', eventId: 'event-2', status: 'presente' },
]

export const communications: Communication[] = [
  {
    id: 'com-1',
    title: 'Portare certificato aggiornato',
    body: 'Controllate la scadenza del certificato medico prima della ripresa degli allenamenti.',
    category: 'documenti',
    audience: 'Tutti i gruppi',
    published_at: '2026-07-01',
    requires_read_confirmation: true,
  },
  {
    id: 'com-2',
    title: 'Convocazioni Trofeo Estate',
    body: 'Pubblicato il programma gara con ritrovo e ordine di lavoro.',
    category: 'gare',
    audience: 'Avanzato, Agonistica',
    published_at: '2026-07-03',
    requires_read_confirmation: true,
  },
  {
    id: 'com-3',
    title: 'Chiusura palestra',
    body: 'La palestra resterà chiusa dal 10 al 18 agosto.',
    category: 'eventi',
    audience: 'Tutti i gruppi',
    published_at: '2026-07-04',
    requires_read_confirmation: false,
  },
]

export const athleteGoals: AthleteGoal[] = [
  { id: 'goal-1', athleteId: 'athlete-1', title: 'Rondata stabile', apparatus: 'corpo libero', status: 'in corso', coach_note: 'Buona spinta, lavorare su arrivo bloccato.' },
  { id: 'goal-2', athleteId: 'athlete-1', title: 'Verticale 10 secondi', apparatus: 'corpo libero', status: 'raggiunto', coach_note: 'Raggiunta con ottimo controllo.' },
  { id: 'goal-3', athleteId: 'athlete-1', title: 'Entrata trave sicura', apparatus: 'trave', status: 'consolidato', coach_note: 'Pronta per inserirla in sequenza gara.' },
]

export const trialRequests: TrialRequest[] = [
  {
    id: 'trial-1',
    child_name: 'Alice',
    age: 7,
    guardian_name: 'Francesca Costa',
    phone: '+39 338 111 2222',
    email: 'francesca@example.com',
    discipline: 'Ginnastica artistica base',
    notes: 'Disponibile il martedì.',
    status: 'nuova',
  },
  {
    id: 'trial-2',
    child_name: 'Mia',
    age: 10,
    guardian_name: 'Paolo Riva',
    phone: '+39 347 555 9090',
    email: 'paolo@example.com',
    discipline: 'Acrobatica',
    notes: 'Ha già fatto danza.',
    status: 'prova fissata',
  },
]
