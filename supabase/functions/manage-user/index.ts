/* global Deno */
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type',
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: cors })
  try {
    const authorization = request.headers.get('Authorization')
    if (!authorization) throw new Error('Accesso non autorizzato')
    const url = Deno.env.get('SUPABASE_URL')!
    const anon = Deno.env.get('SUPABASE_ANON_KEY')!
    const serviceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const caller = createClient(url, anon, { global: { headers: { Authorization: authorization } } })
    const { data: authData, error: authError } = await caller.auth.getUser()
    if (authError || !authData.user) throw new Error('Sessione non valida')
    const { data: profile } = await caller.from('users_profiles').select('role').eq('id', authData.user.id).single()
    if (profile?.role !== 'admin') throw new Error('Solo un amministratore può creare utenti')

    const body = await request.json()
    if (!body.email || !body.password || !body.full_name || !body.role) throw new Error('Compila tutti i campi')
    if (String(body.password).length < 8) throw new Error('La password deve avere almeno 8 caratteri')

    const admin = createClient(url, serviceRole)
    const { data, error } = await admin.auth.admin.createUser({
      email: body.email,
      password: body.password,
      email_confirm: true,
    })
    if (error) throw error
    const { error: profileError } = await admin.from('users_profiles').insert({
      id: data.user.id,
      email: body.email,
      full_name: body.full_name,
      role: body.role,
      phone: body.phone || null,
    })
    if (profileError) {
      await admin.auth.admin.deleteUser(data.user.id)
      throw profileError
    }
    return Response.json({ ok: true }, { headers: cors })
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'Errore' }, { status: 400, headers: cors })
  }
})
