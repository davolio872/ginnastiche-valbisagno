# Ginnastiche Valbisagno

Gestionale responsive per l'associazione sportiva Ginnastiche Valbisagno.

## Funzioni

- Homepage pubblica e richiesta prova gratuita salvata nel database.
- Login Supabase con sessione persistente.
- Ruoli: admin, tecnico, genitore e atleta.
- Gestione utenti e assegnazione ruoli.
- CRUD per atlete, squadre, calendario, presenze, comunicazioni e certificati.
- Gestione delle richieste di prova.
- Diario atleta e obiettivi tecnici.
- Foto e certificati in storage privato.
- PWA installabile su smartphone.
- Row Level Security per limitare i dati in base a ruolo e assegnazioni.

## Avvio locale

```bash
npm install
npm run dev
```

Configurare `.env` usando `.env.example`:

```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-publishable-key
```

## Supabase

1. Eseguire `supabase/schema.sql` in un nuovo progetto.
2. Creare il primo amministratore in Supabase Auth.
3. Inserire il relativo record `users_profiles` con ruolo `admin`.
4. Distribuire la funzione `supabase/functions/manage-user`.
5. Creare gli altri account dal menu Utenti del gestionale.
6. Collegare genitori e atlete dall'anagrafica e assegnare i tecnici alle squadre.

Foto e certificati sono conservati in bucket privati. L'app genera URL firmati temporanei per gli utenti autenticati.

## Deploy

Il progetto è pronto per Vercel. Configurare `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` negli ambienti Production, Preview e Development.
