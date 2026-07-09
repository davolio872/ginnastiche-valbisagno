import { supabase } from './supabase'
import type { Role, UserProfile } from './types'

export type TeamRow = { id: string; name: string; description: string | null; color: string; team_members: Array<{ coach_id: string | null }> }
export type AthleteRow = {
  id: string
  first_name: string
  last_name: string
  birth_date: string
  guardian_id: string | null
  medical_certificate_expires_at: string | null
  medical_notes: string | null
  profile_photo_url: string | null
  user_id: string | null
  guardians: { full_name: string; phone: string | null; email: string; user_id: string | null } | null
  team_members: Array<{ team_id: string; teams: { name: string } | null }>
}
export type EventRow = {
  id: string
  type: string
  title: string
  event_date: string
  starts_at: string | null
  ends_at: string | null
  location: string | null
  description: string | null
  event_teams: Array<{ team_id: string; teams: { name: string } | null }>
}
export type AttendanceRow = {
  id: string
  athlete_id: string
  event_id: string
  status: string
  notes: string | null
  athletes: { first_name: string; last_name: string } | null
  events: { title: string; event_date: string } | null
}
export type CommunicationRow = {
  id: string
  title: string
  body: string
  category: string
  is_urgent: boolean
  published_at: string
  requires_read_confirmation: boolean
}
export type CertificateRow = {
  id: string
  athlete_id: string
  file_url: string
  storage_path?: string
  expires_at: string
  status: string
  athletes: { first_name: string; last_name: string } | null
}
export type TrialRow = {
  id: string
  child_name: string
  age: number
  guardian_name: string
  phone: string
  email: string
  discipline: string
  notes: string | null
  status: string
}
export type GoalRow = {
  id: string
  athlete_id: string
  status: string
  coach_note: string | null
  custom_title: string | null
  goals: { title: string; apparatus: string } | null
}
export type ProfileRow = UserProfile

function client() {
  if (!supabase) throw new Error('Supabase non configurato')
  return supabase
}

export async function getProfile(userId: string): Promise<UserProfile> {
  const { data, error } = await client().from('users_profiles').select('*').eq('id', userId).single()
  if (error) throw error
  return { ...data, role: data.role as Role }
}

export async function loadManagementData() {
  const db = client()
  const [profiles, teams, athletes, events, attendance, communications, certificates, trials, goals, goalCatalog] =
    await Promise.all([
      db.from('users_profiles').select('*').order('full_name'),
      db.from('teams').select('*, team_members(coach_id)').order('name'),
      db
        .from('athletes')
        .select('*, guardians(full_name,phone,email,user_id), team_members(team_id,teams(name))')
        .order('last_name'),
      db.from('events').select('*, event_teams(team_id,teams(name))').order('event_date'),
      db
        .from('attendance')
        .select('*, athletes(first_name,last_name), events(title,event_date)')
        .order('created_at', { ascending: false }),
      db.from('communications').select('*').order('published_at', { ascending: false }),
      db
        .from('medical_certificates')
        .select('*, athletes(first_name,last_name)')
        .order('expires_at'),
      db.from('trial_requests').select('*').order('created_at', { ascending: false }),
      db.from('athlete_goals').select('*, goals(title,apparatus)').order('created_at', { ascending: false }),
      db.from('goals').select('*').order('title'),
    ])
  const failed = [profiles, teams, athletes, events, attendance, communications, certificates, trials, goals, goalCatalog].find(
    (result) => result.error,
  )
  if (failed?.error) throw failed.error
  const athleteRows = (athletes.data ?? []) as AthleteRow[]
  await Promise.all(athleteRows.map(async (athlete) => {
    if (!athlete.profile_photo_url || athlete.profile_photo_url.startsWith('http')) return
    const rawPath = athlete.profile_photo_url
    const { data: signed } = await db.storage.from('athlete-media').createSignedUrl(rawPath, 3600)
    if (signed?.signedUrl) {
      athlete.profile_photo_url = signed.signedUrl
      ;(athlete as AthleteRow & { profile_photo_path?: string }).profile_photo_path = rawPath
    }
  }))
  const certificateRows = (certificates.data ?? []) as CertificateRow[]
  await Promise.all(certificateRows.map(async (certificate) => {
    if (certificate.file_url.startsWith('http')) return
    certificate.storage_path = certificate.file_url
    const { data: signed } = await db.storage.from('certificates').createSignedUrl(certificate.file_url, 3600)
    if (signed?.signedUrl) certificate.file_url = signed.signedUrl
  }))
  return {
    profiles: (profiles.data ?? []) as ProfileRow[],
    teams: (teams.data ?? []) as TeamRow[],
    athletes: athleteRows,
    events: (events.data ?? []) as EventRow[],
    attendance: (attendance.data ?? []) as AttendanceRow[],
    communications: (communications.data ?? []) as CommunicationRow[],
    certificates: certificateRows,
    trials: (trials.data ?? []) as TrialRow[],
    goals: (goals.data ?? []) as GoalRow[],
    goalCatalog: goalCatalog.data ?? [],
  }
}

export async function saveTeam(values: Record<string, unknown>, coachIds: string[], id?: string) {
  const db = client()
  let teamId = id
  if (id) {
    const { error } = await db.from('teams').update(values).eq('id', id)
    if (error) throw error
    await db.from('team_members').delete().eq('team_id', id).not('coach_id', 'is', null)
  } else {
    const { data, error } = await db.from('teams').insert(values).select('id').single()
    if (error) throw error
    teamId = data.id
  }
  if (coachIds.length) {
    const { error } = await db.from('team_members').insert(coachIds.map((coachId) => ({ team_id: teamId, coach_id: coachId })))
    if (error) throw error
  }
}

export async function saveAthlete(values: Record<string, unknown>, teamIds: string[], id?: string) {
  const db = client()
  const guardian = {
    full_name: values.guardian_name,
    phone: values.guardian_phone || null,
    email: values.guardian_email,
    user_id: values.guardian_user_id || null,
  }
  let guardianId = (values.guardian_id as string) || null
  if (guardianId) {
    const { error } = await db.from('guardians').update(guardian).eq('id', guardianId)
    if (error) throw error
  } else {
    const { data, error } = await db.from('guardians').insert(guardian).select('id').single()
    if (error) throw error
    guardianId = data.id
  }
  const athleteValues = {
    first_name: values.first_name,
    last_name: values.last_name,
    birth_date: values.birth_date,
    guardian_id: guardianId,
    user_id: values.athlete_user_id || null,
    medical_certificate_expires_at: values.medical_certificate_expires_at || null,
    medical_notes: values.medical_notes || null,
    profile_photo_url: values.profile_photo_url || null,
  }
  let athleteId = id
  if (id) {
    const { error } = await db.from('athletes').update(athleteValues).eq('id', id)
    if (error) throw error
    await db.from('team_members').delete().eq('athlete_id', id)
  } else {
    const { data, error } = await db.from('athletes').insert(athleteValues).select('id').single()
    if (error) throw error
    athleteId = data.id
  }
  if (teamIds.length) {
    const { error } = await db
      .from('team_members')
      .insert(teamIds.map((teamId) => ({ team_id: teamId, athlete_id: athleteId })))
    if (error) throw error
  }
}

export async function saveEvent(values: Record<string, unknown>, teamIds: string[], id?: string) {
  const db = client()
  const eventValues = {
    type: values.type,
    title: values.title,
    event_date: values.event_date,
    starts_at: values.starts_at || null,
    ends_at: values.ends_at || null,
    location: values.location || null,
    description: values.description || null,
  }
  let eventId = id
  if (id) {
    const { error } = await db.from('events').update(eventValues).eq('id', id)
    if (error) throw error
    await db.from('event_teams').delete().eq('event_id', id)
  } else {
    const { data, error } = await db.from('events').insert(eventValues).select('id').single()
    if (error) throw error
    eventId = data.id
  }
  if (teamIds.length) {
    const { error } = await db.from('event_teams').insert(teamIds.map((teamId) => ({ event_id: eventId, team_id: teamId })))
    if (error) throw error
  }
}

export async function saveSimple(table: string, values: Record<string, unknown>, id?: string) {
  const query = id ? client().from(table).update(values).eq('id', id) : client().from(table).insert(values)
  const { error } = await query
  if (error) throw error
}

export async function removeRow(table: string, id: string) {
  const { error } = await client().from(table).delete().eq('id', id)
  if (error) throw error
}

export async function uploadFile(bucket: string, file: File) {
  const extension = file.name.split('.').pop()?.toLowerCase() || 'bin'
  const path = `${crypto.randomUUID()}.${extension}`
  const { data: uploaded, error } = await client().storage.from(bucket).upload(path, file, { contentType: file.type })
  if (error) throw error
  return uploaded.path
}

export async function createUser(values: Record<string, unknown>) {
  const { data, error } = await client().functions.invoke('manage-user', { body: values })
  if (error) throw error
  if (data?.error) throw new Error(data.error)
}
