export type Role = 'admin' | 'tecnico' | 'genitore' | 'atleta'

export type UserProfile = {
  id: string
  full_name: string
  email: string
  role: Role
  phone?: string
  avatar_url?: string
}

export type Team = {
  id: string
  name: string
  description: string
  color: string
  coachIds: string[]
}

export type Athlete = {
  id: string
  first_name: string
  last_name: string
  birth_date: string
  guardian_name: string
  guardian_phone: string
  guardian_email: string
  medical_certificate_expires_at: string
  medical_notes?: string
  profile_photo_url?: string
  teamIds: string[]
}

export type EventItem = {
  id: string
  type: 'allenamento' | 'gara' | 'saggio' | 'stage' | 'riunione' | 'chiusura'
  title: string
  date: string
  starts_at: string
  ends_at: string
  location: string
  description: string
  teamIds: string[]
}

export type AttendanceStatus = 'presente' | 'assente' | 'ritardo' | 'uscita anticipata'

export type Attendance = {
  id: string
  athleteId: string
  eventId: string
  status: AttendanceStatus
  notes?: string
}

export type Communication = {
  id: string
  title: string
  body: string
  category: 'allenamenti' | 'gare' | 'documenti' | 'quote' | 'eventi' | 'urgente'
  audience: string
  published_at: string
  requires_read_confirmation: boolean
}

export type GoalStatus = 'da iniziare' | 'in corso' | 'raggiunto' | 'consolidato'

export type AthleteGoal = {
  id: string
  athleteId: string
  title: string
  apparatus: string
  status: GoalStatus
  coach_note: string
}

export type TrialRequest = {
  id: string
  child_name: string
  age: number
  guardian_name: string
  phone: string
  email: string
  discipline: string
  notes?: string
  status: 'nuova' | 'contattata' | 'prova fissata' | 'iscritta' | 'non interessata'
}
