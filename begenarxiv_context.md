# Begenarxiv: AI Agent Context Doc

Hand this to any AI helping with the project. It covers what the app is, how it's built, current state, and what's left. Design specifics are deliberately omitted.

---

## 1. What it is

Begenarxiv is a free web app for **Begena players and learners**. The Begena is an Ethiopian lyre played with a numbers notation, where each digit is a string position. It's meant to become the home for Begena learners, with a content catalogue and tuning tools. It's open source, and the owner may later expose the dataset as a free public API.

**Problems it solves:** (1) finding accurate mezmur (liturgical song) material, and (2) numbers notation alone doesn't teach rhythm or technique.

**Centerpiece feature, tap-to-hear:** on a mezmur page the learner sees the song's numbers grouped by lyric line, can tap any number to hear that string, and can play the whole sequence with synced highlighting.

**Primary persona:** a self-taught or semi-taught player who has numbers but can't tell how the song actually sounds or moves.

## 2. Stack and layout

PERN, all TypeScript, strict mode. Two independent apps in one repo:

```
begenarxiv/
  server/   Express + pg + dotenv + cors; dev runner is tsx (not ts-node-dev)
    src/db/         index.ts (Pool + query wrapper), schema.sql, seed.sql,
                    importMezmurs.ts, reset.ts
    src/controllers/ mezmur, artist, tune, tuning
    src/routes/     one file per controller
    src/types/      index.ts
    data/mezmurs.json   hand-prepared dataset (import input)
  client/   Vite + React + TS + Tailwind v4 + react-router-dom + framer-motion + lucide-react
    src/pages/      LandingPage, CataloguePage, MezmurPage, TunerPage (paused)
    src/components/ TapToHearPlayer, SectionCard, MezmurCard, MezmurCardCompact,
                    HorizontalMezmurScroll, SearchFilterBar, CatalogueHero,
                    DifficultyBar, SkeletonCard, Button, Layout, etc.
    src/hooks/      useTonePlayer
    src/api/client.ts   single API client; components never call fetch directly
    src/types/index.ts  frontend types (intentionally duplicated from backend)
```

Dev environment is Windows. Backend runs on port 4000, Vite on 5173.

## 3. Database schema (PostgreSQL)

- `artists(id, name, created_at)`
- `tunes(id, name UNIQUE)`: musical mode/category used for browsing
- `strings(id, note_name, string_position UNIQUE, audio_file_url)`: reusable per-string sound library. Seeded with 5 strings: C=1, D=2, E=3, G=4, A=5. **The real instrument may have more strings, so verify.** The importer skips unknown positions with a warning.
- `tuning_profiles(id, name UNIQUE, description)`
- `tuning_profile_notes(id, tuning_profile_id FK CASCADE, string_id FK, frequency_hz NUMERIC(6,2), UNIQUE(profile, string))`
- `mezmurs(id, title, lyrics, youtube_url, difficulty CHECK in ('beginner','intermediate','advanced'), artist_id, tune_id, tuning_profile_id, created_at)`
- `mezmur_sequences(id, mezmur_id FK CASCADE, string_id FK, step_order, line_number, duration_ms, group_id, UNIQUE(mezmur_id, step_order))`

**Key modeling decision:** audio is not recorded per song. Each string's sound exists once in `strings`, and each song is just a *sequence* referencing those strings. Numbers notation equals `string_position`.

**Ornaments:** most mezmurs have grouped digits like `"12"`, played as a very fast roll (string 1 then string 2, about 35 ms apart). It is neither simultaneous nor ordinary spacing. In `mezmur_sequences`, consecutive rows sharing the same non-null `group_id` form one ornament. `NULL` means a solo note.

## 4. API (read-only, all GET)

- `/health`
- `/api/mezmurs` (list with artist/tune names)
- `/api/mezmurs/:id` (mezmur plus `sequence[]` ordered by `line_number, step_order`)
- `/api/artists`, `/api/tunes`
- `/api/artists/:id/mezmurs?exclude=ID`, `/api/tunes/:id/mezmurs?exclude=ID` (discovery)
- `/api/tuning-profiles`, `/api/tuning-profiles/:id` (per-string target frequencies)

There are no writes, no auth and no accounts. All queries are parameterized (`$1`), and a `query()` wrapper in `db/index.ts` is the only DB access path.

## 5. Data pipeline

The dataset is hand-transcribed into `server/data/mezmurs.json`:

```json
{ "title": "", "artist": "", "tune": "", "difficulty": "beginner", "lyrics": "",
  "youtube_url": "", "sequence": [ { "line": 1, "notes": ["1","23","4"] } ] }
```

Single-character tokens are solo notes, and multi-character tokens are ornaments. Run `npx tsx src/db/reset.ts && npx tsx src/db/importMezmurs.ts` (from `server/`). The importer uses `findOrCreate` for artists and tunes. **It has no upsert**, so re-importing without `reset.ts` creates duplicate mezmurs. The reset script clears `mezmurs` and `mezmur_sequences` only.

## 6. Playback logic (tap-to-hear)

- The sequence is grouped by `line_number`, then clustered by `group_id`.
- Play-all steps through "playback units" (a solo note or a whole ornament). Ornament notes are scheduled on the **Web Audio clock** (`ctx.currentTime`) with `ROLL_OFFSET_SEC = 0.035`, not with `setTimeout`. Tune this by ear.
- Sound is **currently synthesized oscillator tones** (C/D/E/G/A frequencies), a stand-in until real recordings exist. Swapping in real audio should only touch the tone-playing function.
- Known tech debt: `TapToHearPlayer` has inline oscillator code duplicating the `useTonePlayer` hook.

## 7. Current status

**Done:** schema, API, import pipeline, landing page, catalogue (search, grouping, random pick, skeleton loading), mezmur page (video, lyrics, player, horizontal "more from artist / more in tune" strips), tap-to-hear with ornaments.

**Paused deliberately:** the entire tuner. A reference-tone version exists (`TunerPage`, route `/tuner/:profileId?`). Live microphone pitch detection (autocorrelation) is not implemented; the owner wants to learn and write it themselves. The "Tune for this mezmur" pill on mezmur pages is a disabled "coming soon" placeholder.

**Not built:** playback speed control, loop toggle, recently viewed, real string audio, deployment.

**Blocker to beta:** the database only has test mezmurs. Real content has to be entered.

## 8. Plan and deadline

The target is a **closed beta by Saturday** (the owner works about 10 to 15 hrs/week solo). Planned: enter 10 to 15 real songs, harden the backend, deploy, and test on a real phone. Speed and loop controls are explicitly post-beta.

**Backend hardening checklist:**
1. Restrict CORS to the frontend origin.
2. Add `helmet`.
3. Add `express-rate-limit`.
4. Validate `:id` params as positive integers.
5. Return generic errors and trim `/health`.
6. Use a read-only DB user for the deployed app.
7. Keep secrets in host env vars, and verify `.env` was never committed.
8. Use SSL for the DB connection.

**Deploy blockers:**
- `client/src/api/client.ts` hardcodes `http://localhost:4000`. Use `VITE_API_URL`.
- `BrowserRouter` needs a rewrite rule on the static host.
- Compress the large hero image.
- Remove the `/tuner` route for beta.
- Check hosting free-tier limits at deploy time.

Hosting plan: static frontend host (Vercel or Netlify), Express on Render or Railway, managed Postgres (Neon or Railway).

## 9. Legal and content caveat

The owner sources lyrics and numbers by manually copying from an existing Begena app that has no published terms. Lyrics of traditional liturgical pieces are likely public domain, but **modern compositions and the notation transcriptions may be copyrighted**, and "no T&Cs" does not mean "no copyright." The agreed stance: fine for private development and a closed beta, but **verify per song, or contact the source app's team, before publishing the dataset as a public API.**

## 10. Working agreements and gotchas for AI agents

- **The owner is learning.** TypeScript is rusty and SQL is new. Explain *why*, not just *what*. Build page by page, and don't dump the whole project's code at once.
- **Give full-file replacements or exact find/replace locations.** Partial snippets caused several bugs here: a dropped comma in a SQL SELECT, a lost `<a` tag, and an edit made to the wrong block.
- **Use plain ASCII in code.** Curly quotes and em dashes pasted from chat once broke JSX parsing.
- **Tailwind is v4.** Theme tokens live in an `@theme` block in `client/src/index.css`, not in `tailwind.config.js`.
- **TypeScript 7 broke `ts-node-dev`**, which is why the server uses `tsx`.
- **Always parameterize SQL.** Never interpolate user input.
- **Ask for evidence before guessing.** Request the actual file contents, error text or DevTools output. Repeated blind guesses wasted a lot of time earlier.
- Verify state directly (for example `SELECT * FROM ...`) instead of assuming a step ran.
- Keep scope tight. Ship fewer things completely, and flag scope creep.
