# Ginnastiche Valbisagno

Gestionale responsive per l'associazione sportiva Ginnastiche Valbisagno.

## Funzioni

- Homepage pubblica e richiesta prova gratuita salvata nel database.
- Login Supabase con sessione persistente.
- Ruoli Beta: Presidente/Admin, Segreteria, Direttore Tecnico, Insegnanti, Famiglie.
- Gestione utenti e assegnazione ruoli.
- CRUD per atlete, gruppi, calendario, presenze, comunicazioni, certificati, pagamenti e tesseramenti.
- Programmi allenamento con obiettivi, esercizi, preparazione atletica, elementi tecnici e note finali.
- Presenze insegnanti con inizio/fine allenamento e conteggio ore.
- Sostituzioni insegnanti con richiesta, assegnazione e stato.
- Bacheca gruppo con eventi, avvisi e dati filtrabili per gruppo.
- Report riepilogativi per atlete, presenze, ore insegnanti, certificati e pagamenti.
- Importazione Excel/UISP preparata come modulo Beta con anteprima intelligente e storico tesseramenti.
- Gestione delle richieste di prova.
- Timeline atleta/diario e obiettivi tecnici.
- Foto e certificati in storage privato.
- PWA installabile su smartphone.
- Row Level Security per limitare i dati in base a ruolo e assegnazioni.
- Modalità demo completa e isolata con dati persistenti nel browser.

## Accesso demo

- Utente: `admin`
- Password: `1234`

La modalità demo consente inserimento, modifica ed eliminazione in tutte le sezioni. I dati restano nel browser e non vengono inviati al database reale.

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

1. Eseguire `supabase/schema.sql` in un nuovo progetto oppure applicare le nuove tabelle Beta al progetto esistente.
2. Creare il primo amministratore in Supabase Auth.
3. Inserire il relativo record `users_profiles` con ruolo `admin`.
4. Distribuire la funzione `supabase/functions/manage-user`.
5. Creare gli altri account dal menu Utenti del gestionale.
6. Collegare genitori e atlete dall'anagrafica e assegnare i tecnici alle squadre.

Foto e certificati sono conservati in bucket privati. L'app genera URL firmati temporanei per gli utenti autenticati.

### Moduli Beta aggiunti

Lo schema include anche:

- `teacher_attendance`
- `training_programs`
- `athlete_memberships`
- `substitution_requests`

Nel database esistente vanno aggiunti anche i nuovi valori enum per ruoli, presenze e pagamenti e i nuovi campi dei gruppi: `season`, `age_range`, `level`, `gym`, `days`, `times`.

## Deploy

Il progetto è pronto per Vercel. Configurare `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` negli ambienti Production, Preview e Development.
