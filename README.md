# Ginnastiche Valbisagno

Web app gestionale MVP per una associazione sportiva di ginnastica artistica.

## Funzioni incluse

- Homepage pubblica con corsi, contatti e modulo prova gratuita.
- Login con ruoli `admin`, `tecnico`, `genitore`, `atleta`.
- Dashboard con prossimo allenamento, prossima gara, comunicazioni, certificato e segnalazione assenza.
- Anagrafica atlete con gruppi, genitore, contatti, note sanitarie e foto.
- Squadre/gruppi: Baby, Base, Avanzato, Agonistica, TeamGym, Acrobatica, Fitness.
- Calendario eventi.
- Registro presenze.
- Comunicazioni con categorie e conferma lettura.
- Certificati medici con stato valido/in scadenza/scaduto.
- Gestione richieste prova gratuita per admin.
- Diario atleta con progressi e obiettivi tecnici.
- PWA installabile con manifest, icona e service worker.
- Schema SQL Supabase con tabelle e Row Level Security.

## Stack

- React
- Vite
- Tailwind CSS
- Supabase Auth/Database/Storage
- Vercel

## Installazione locale

```bash
npm install
npm run dev
```

Apri l'URL mostrato da Vite, di solito `http://localhost:5173`.

## Variabili ambiente

Copia `.env.example` in `.env` e compila:

```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-publishable-or-anon-key
```

Senza queste variabili l'app usa dati demo locali, utili per valutare il flusso dei ruoli.

## Supabase

1. Crea un progetto Supabase.
2. Apri SQL Editor.
3. Esegui il contenuto di `supabase/schema.sql`.
4. Crea utenti in Supabase Auth.
5. Inserisci per ogni utente una riga in `users_profiles` con lo stesso `id` dell'utente Auth.
6. Collega genitori, atlete e tecnici tramite `guardians`, `athletes` e `team_members`.

Le policy RLS previste sono:

- Admin vede e gestisce tutto.
- Tecnici vedono i gruppi assegnati e le relative atlete.
- Genitori vedono solo i dati delle figlie collegate.
- Atlete vedono calendario, comunicazioni, diario e dati collegati al proprio profilo.
- Richieste prova gratuita inseribili anche da utenti anonimi, visibili e gestibili solo da admin.

## Deploy su Vercel

1. Importa il repository su Vercel.
2. Imposta le variabili `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
3. Deploy.

Il file `vercel.json` è già configurato per Vite.

## Note MVP

Questa prima versione è pronta come base funzionante e include fallback demo. Il passo successivo naturale è sostituire i dati mock con query Supabase per ogni sezione e aggiungere form CRUD completi per admin e tecnici.
