# AusflugFinder

Eine Codebasis für iOS, Android und Web (Expo / React Native, Expo Router, Supabase).

## Einrichten

```bash
pnpm install
cp .env.example .env.local   # Werte eintragen, die Datei wird nicht eingecheckt
```

`.env.local` braucht `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY` und
`EXPO_PUBLIC_GOOGLE_MAPS_API_KEY`. Die Werte werden beim Build fest in die App eingebaut.
Nach einer Änderung an diesen Werten immer mit `--clear` neu bauen, sonst bleiben alte Werte im Metro-Cache.

## Entwickeln

| Ziel | Befehl |
| --- | --- |
| Web im Browser | `npx expo start --web` |
| iOS lokal | `pnpm ios` |
| Android lokal | `pnpm android` |
| Typprüfung | `pnpm check` |

## Releases

- **iOS und Android:** `eas build --platform ios|android --profile production`, danach `eas submit`.
  Version und iOS-Buildnummer stehen in `app.config.ts`. Das ist die einzige Expo-Konfiguration,
  eine `app.json` gibt es bewusst nicht mehr.
- **Web:** `npx expo export --clear --platform web` erzeugt statische Dateien in `dist/`.
  Mit `Dockerfile` und `nginx.conf` entsteht daraus ein Container (Build-Argumente siehe Dockerfile).
  Die nginx-Konfiguration ist nötig, weil dynamische Seiten wie `/trip/123` auf ihre Vorlage
  (`/trip/[id].html`) umgeleitet werden müssen.

## Plattformspezifischer Code

Unterschiede zwischen den Plattformen stehen in Dateien mit Endung `.android.tsx`, `.ios.tsx`,
`.native.tsx` oder `.web.tsx`. Expo wählt automatisch die passende Datei. Beispiele:

- `app/(tabs)/planner.android.tsx` und `components/planning/SwipeablePlanCard.android.tsx`
- `components/ui/trip-map-view.web.tsx` und `.native.tsx`

Eine Änderung in einer Datei ohne Plattform-Endung gilt für alle drei Plattformen.

## Hinweise

- Die New Architecture bleibt aktiv, weil Reanimated 4 sie voraussetzt.
- Rechtstexte (Impressum, Datenschutz, AGB) stehen in `lib/legal-content.ts` und sind unter
  `/legal/impressum`, `/legal/privacy` und `/legal/terms` erreichbar.
- Die Supabase Edge Functions liegen in `supabase/functions` und werden getrennt deployt.
