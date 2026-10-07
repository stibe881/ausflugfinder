# AusflugFinder

Eine Codebasis für iOS, Android und Web (Expo / React Native, Expo Router).
Als Datenbank, Anmeldung und Dateispeicher dient ausschliesslich Supabase. Einen eigenen Server gibt es nicht.

## Einrichten

```bash
pnpm install
cp .env.example .env.local   # Werte eintragen, die Datei wird nicht eingecheckt
```

Die Werte in `.env.local` werden beim Build fest in die App eingebaut. Nach einer Änderung immer mit
`--clear` neu bauen, sonst bleiben alte Werte im Metro-Cache.

## Entwickeln

| Ziel | Befehl |
| --- | --- |
| Web im Browser | `pnpm web` |
| iOS lokal | `pnpm ios` |
| Android lokal | `pnpm android` |
| Typprüfung | `pnpm check` |

## Supabase

Alle Daten liegen in einem Supabase-Projekt (Region London). Die Serverfunktionen unter
`supabase/functions` werden getrennt deployt:

```bash
supabase functions deploy delete-account trigger-release link-voucher unlink-voucher notify-new-trip send-friend-invitation-email
```

- `delete-account` löscht das Konto des angemeldeten Nutzers (Profil, Login, Inhalte).
- `trigger-release` startet die Updates aus dem Admin-Bereich, siehe unten.
- Alle Tabellen mit Nutzerdaten sollten auf `users(id)` bzw. `auth.users(id)` mit `ON DELETE CASCADE` verweisen,
  sonst bleiben beim Löschen eines Kontos Reste zurück. `delete-account` meldet solche Fälle im Log.

### Konten der alten Web-App übernehmen

Einmalig, damit sich frühere Web-Nutzer mit ihrem bisherigen Passwort anmelden können:

```bash
OLD_DATABASE_URL=... EXPO_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... pnpm import:web-users          # Probelauf
OLD_DATABASE_URL=... EXPO_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... pnpm import:web-users --apply  # ausführen
```

Es werden nur die Konten übernommen, nicht die Inhalte, die diese Nutzer in der alten Web-App angelegt haben.

## Updates per Knopfdruck

Admins finden unter **Profil > Admin-Modus > Updates veröffentlichen** vier Knöpfe: Web, iOS, Android und Alles.
Ein Klick startet den GitHub-Workflow `Release` (`.github/workflows/release.yml`).

- **Web:** baut die statische Webseite (`npx expo export`), legt sie als Download `web-dist` am Lauf ab und kopiert sie
  per SSH auf das Webhosting, wenn die Secrets `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_SSH_KEY` und `DEPLOY_PATH` gesetzt sind.
  `DEPLOY_PATH` ist der Ordner der Domain, zum Beispiel `public_html/ausflugfinder.ch`. Die Datei `public/.htaccess`
  gehört zur Webseite und sorgt dafür, dass dynamische Seiten wie `/trip/123` funktionieren.
- **iOS und Android:** erhöht die Build-Nummer (`scripts/bump-build-number.mjs`, wird nach `main` committet),
  startet den Build bei Expo und sendet ihn auf Wunsch an TestFlight bzw. Google Play.

Der Knopf spricht nie direkt mit GitHub. Die App ruft die Funktion `trigger-release` auf. Sie prüft auf dem Server,
dass der Nutzer Admin ist (`users.is_admin`), und verwendet den GitHub-Schlüssel, der nur in Supabase liegt.

### Einmalige Einrichtung

1. **GitHub-Schlüssel erstellen:** GitHub > Settings > Developer settings > Fine-grained tokens. Nur Repository
   `ausflugfinder`, Berechtigung *Actions: Read and write*. Dann in Supabase hinterlegen:
   `supabase secrets set GITHUB_DISPATCH_TOKEN=...`
2. **GitHub-Secrets** (Repository > Settings > Secrets and variables > Actions):
   `EXPO_TOKEN` (expo.dev > Access tokens), `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`,
   `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY`, `EXPO_PUBLIC_OPENWEATHER_API_KEY`. Für das Webhosting zusätzlich die
   vier `DEPLOY_*`-Secrets (Host, Benutzer, privater SSH-Schlüssel, Zielordner der Domain).
3. **Expo-Umgebungsvariablen:** Die App-Builds laufen bei Expo und lesen die Werte von dort. Einmal pro Wert:
   `eas env:create --environment production --name EXPO_PUBLIC_SUPABASE_URL --value ... --visibility plaintext`
   (ebenso für `EXPO_PUBLIC_SUPABASE_ANON_KEY`, `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY`, `EXPO_PUBLIC_OPENWEATHER_API_KEY`).
4. **Google Play:** Für das automatische Senden braucht Expo einen Service-Account-Schlüssel
   (`eas credentials`, Android, Google Service Account). Ohne ihn den Schalter *An die Stores senden* ausschalten.
5. **Branch-Schutz:** Der Workflow committet die neue Build-Nummer direkt nach `main`. Ist `main` so geschützt, dass
   nur Pull Requests erlaubt sind, muss `github-actions[bot]` davon ausgenommen werden.
6. **Funktionen deployen:** `supabase functions deploy trigger-release delete-account`

## Releases von Hand

- **iOS und Android:** `eas build --platform ios|android --profile production`, danach `eas submit`.
  Vorher `node scripts/bump-build-number.mjs`. Version und Build-Nummer stehen in `app.config.ts`, in
  `ios/AusflugFinder/Info.plist`, im Xcode-Projekt und in `android/app/build.gradle`. Das Skript ändert alle Stellen gemeinsam.
- **Web:** `npx expo export --clear --platform web` erzeugt den Ordner `dist`. Dessen gesamter Inhalt, auch die versteckte
  Datei `.htaccess`, gehört in den Ordner der Domain auf dem Webhosting.
  Für einen eigenen Server mit Docker gibt es alternativ `Dockerfile` und `nginx.conf`.

## Plattformspezifischer Code

Unterschiede stehen in Dateien mit Endung `.android.tsx`, `.ios.tsx`, `.native.tsx` oder `.web.tsx`.
Expo wählt automatisch die passende Datei. Beispiele: `app/(tabs)/planner.android.tsx`,
`components/ui/trip-map-view.web.tsx`. Eine Änderung in einer Datei ohne Plattform-Endung gilt für alle drei Plattformen.

## Hinweise

- Die New Architecture bleibt aktiv, weil Reanimated 4 sie voraussetzt.
- Rechtstexte stehen in `lib/legal-content.ts` und sind unter `/legal/impressum`, `/legal/privacy` und `/legal/terms` erreichbar.
