# Caretaker: Product and Technical Spec

Version 1.0, locked 2026-09-16. Target: Congressional App Challenge 2026.

## 0. Contents

1. Competition constraints
2. Product definition
3. Scope (in, out, 2.0)
4. Users and views
5. Screens
6. Live speaker ID pipeline
7. ML: training and evaluation
8. Extraction, linking and approval
9. Family tree
10. News
11. Data model
12. Architecture, services and cost
13. Privacy and consent
14. Demo mode
15. Ownership split (AI vs Ken)
16. Milestones
17. Submission package (video, written answers, interview)
18. Risks and fallbacks
19. Open items

---

## 1. Competition constraints

Source: 2026 CAC Rules (congressionalappchallenge.us). Re-check the rules page before submitting.

| Item | Requirement | Our plan |
|---|---|---|
| Deadline | Monday Oct 26, 2026, 12:00 pm EDT | Submit Oct 22 |
| Team | Up to 4 students | Solo |
| Video | 1 to 3 min, public on YouTube or Vimeo. Must include: names, app title, one-sentence purpose, target audience, tools and languages, functionality demo | Section 17.1 |
| Written | Title, purpose, inspiration, technical challenges, what you learned, 2.0 improvements | Section 17.2, Ken drafts |
| Judging | Idea quality (creativity, originality), implementation, coding skill | Differentiate on live speaker ID; show real training numbers |
| AI use | Allowed with full disclosure; significant individual contribution required | Section 15 plus `AI_LOG.md` |
| Code | Judges may request app and source | Clean repo, human-owned modules clearly marked |

Competitive context: 2025 district winners in this space include MemoryLane (CA-36: photo quizzes to recognize loved ones, med tracker, voice commands, fall detection) and Remember When (NC-07: conversational companion that archives seniors' stories). Caretaker must not look like either. Our differentiator is naming who is speaking on a live call and turning conversations into a family tree.

---

## 2. Product definition

**One sentence:** Caretaker helps nursing home residents recognize and stay connected to the people they love.

**Target audience:** Nursing home residents with memory loss, and the families who can't visit every day.

**Core loop:**
1. Family members enroll their voice (about 30 seconds).
2. The family calls the resident through Caretaker, often several people on one device.
3. As each person speaks, the resident's screen shows who it is: photo, name, relationship.
4. The conversation becomes a named, chat-style transcript.
5. Memories, events, family news and med notes are extracted and linked to people in the family tree.
6. The resident browses her family and their memories between calls.

**Why diarization matters (the pitch):** In one-person-per-device calls, each audio track already identifies the speaker. Speaker ID is needed when several people share one microphone: a family on speakerphone, three relatives crowded around one laptop on a video call, a group visit. Off-the-shelf diarization gives "Speaker 1 / Speaker 2". Caretaker gives names, trained for laptop and phone audio, with an honest "Someone new" for unknown voices.

**Primary resident constraint:** The resident may not be able to speak or read well and communicates mainly by pointing. The resident view is built for recognition and tapping, not for talking or reading.

---

## 3. Scope

### In scope (submission)
- Live video calls (LiveKit) with live speaker labels and chat-style transcript
- Voice enrollment with consent
- Trained speaker scoring layer (B) and fine-tuned ECAPA embeddings (A), with evaluation
- Extraction of memories, events, family news, med notes, new people, tree edits
- Mention-to-person linking, dedupe and semantic search (pgvector)
- Family tree (people plus relationship links) with person pages and memories
- Family News (from conversations) and public RSS headlines with positive filter
- Family med notes (family-side only, approval required)
- Resident view and Family view, demo switcher
- Public demo mode with a fictional family

### Out of scope (submission)
- Games
- Voice commands
- Staff view
- Resident-facing med reminders
- Non-English transcription
- Face-to-voice labeling on video
- Phone network (PSTN) calling

### 2.0 roadmap (for the written answer and video)
- Staff view: who called or visited, when, and family updates for caregivers
- Cantonese and Mandarin support
- Labels placed on the speaking face in video (active speaker detection)
- Live captions for residents with hearing loss
- Pilot with a nursing home facility
- Overlap-aware segmentation model (option C)

---

## 4. Users and views

| | Resident view | Family view |
|---|---|---|
| Who | Nursing home resident (demo: "Grandma Mei") | Adult children, grandchildren |
| Device | iPad on a stand, landscape | Laptop or phone |
| Text | Body 28px min, headings 40 to 56px | Body 16px |
| Targets | 72px min, 24px gaps | 44px min |
| Contrast | 7:1 for all text | 4.5:1 min, 7:1 preferred |
| Actions per screen | Max 4 primary | No limit |
| Navigation | One level, big Home button always visible | Sidebar or tab bar |
| Input | Tap only. No swipe-only, no hover, no long-press, no timeouts | Standard |
| Transcript | Collapsed by default; newest bubble visible | Expanded |
| Tone | Warm, adult, respectful. Never childish | Clear, efficient |

Resident view rules (explain to any designer or agent):
- **Icons always have text labels.** Icon-only buttons fail for people with memory loss.
- **Photos over names.** Recognition of faces is often retained longer than names.
- **No destructive actions.** The resident cannot delete, edit or approve anything.
- **Nothing moves unless it means something.** Only the speaking indicator animates.
- **Relationship is always shown from her point of view** ("Your grandson"), computed from the tree.

---

## 5. Screens

### 5.0 Public
- **P1 Landing:** product sentence, a short story line, the two-view demo switcher ("See what Grandma sees" / "What the family sees"), "Try the demo" CTA, privacy line.

### 5.1 Resident view (R)
- **R1 Home:** greeting with date and time in large type; 4 tiles: Call family, My family, Family news, Today. Incoming-call banner overrides everything.
- **R2 Incoming call:** full screen, caller photo(s), "Your daughter Lisa is calling", huge Answer button. Decline is smaller and secondary.
- **R3 In call:** live video (top, about 60%), speaker strip below with a large card per enrolled participant; active speaker card enlarges, glows, shows name and relationship. Newest transcript bubble visible with avatar; "Show conversation" expands the chat. Unknown voice shows a neutral "Someone new" card. Big End call button.
- **R4 My family:** faces grouped by generation (not a complex tree graph). Tap a face opens R5.
- **R5 Person page:** big photo, name, "Your grandson", memories as large cards with photos, "Call" button if they have an account.
- **R6 Family news:** large cards, one item per screen area, "Read to me" button (browser speech synthesis), next and previous buttons.
- **R7 Today:** date, upcoming events from the family ("Lisa visits Saturday").

### 5.2 Family view (F)
- **F1 Dashboard:** Grandma's week (calls, who spoke), approval queue count, recent memories, quick Start call.
- **F2 Start call:** pick resident, share link, device check (mic test that also shows your recognized name).
- **F3 In call (family side):** video, full chat-style named transcript, live "items extracted" side panel.
- **F4 Calls list and call detail:** past calls, full transcript, speaker timeline bar, extracted items per call, "wrong speaker? fix it" correction (corrections feed profile updates only after family confirms).
- **F5 Approval queue:** cards for pending items (med notes, new people, tree edits, low-confidence items), source quote with timestamp, Approve, Edit, Reject.
- **F6 Family tree editor:** zoomable tree, add person, add relationship, upload photo, mark resident.
- **F7 Person detail (edit):** profile, relationship, memories list, voice profile status, mentions.
- **F8 Voice enrollment:** consent screen, 3 read-aloud prompts with level meter, quality check (duration, SNR, clipping), result, "test me" match check.
- **F9 Memories and search:** semantic search across transcripts and memories ("Emily's graduation").
- **F10 Med notes:** list of approved family med notes, source call, date; banner stating these are family notes and not medical instructions.
- **F11 News settings:** RSS feed picker (local, world, finance, positive filter toggle), Family News visibility.
- **F12 Privacy and data:** consents, delete my voiceprint, audio retention setting, export or delete family data.
- **F13 Settings:** family members, invite link, resident device pairing.

### 5.3 Shared components
Speaker card, transcript bubble (states: speaking with "...", text filled, low-confidence, unknown), approval card, person avatar with relationship chip, memory card, news card, consent block, empty states, error and reconnect banner.

---

## 6. Live speaker ID pipeline

### 6.1 Flow

```
Family device(s) ──WebRTC──> LiveKit room <──WebRTC── Resident iPad
                                 │
                   Python LiveKit Agent (services/inference)
                                 │ per remote audio track
                          ┌──────┴───────┐
                    Silero VAD      Rolling window buffer
                          │              │
                   utterance start   every 1.0 s: ECAPA embedding over last 2.0 s
                          │              │
                          │        Scoring layer (B): calibrated prob per profile
                          │              │
                          │        publish {speaker} on data channel (label + conf)
                   utterance end
                          │
               full-utterance embedding -> final label -> publish {speaker_final}
                          │
               Groq Whisper queue (rate-limited) -> publish {text}
                          │
                    Postgres: utterances
                          │
       every ~60 s and at call end: extraction job (Groq LLM) -> items -> linking (pgvector)
```

### 6.2 Details
- **Audio:** 16 kHz mono per track. Resident track is transcribed but usually silent.
- **VAD:** Silero VAD. Min speech 300 ms, min silence to end utterance 500 ms, max utterance 15 s (force split).
- **Speaker change inside one utterance (shared mic):** compare consecutive window embeddings; cosine distance jump above a tuned threshold splits the utterance. Known limitation: heavy overlap. Document in "technical challenges".
- **Candidate set:** only enrolled profiles in this family, plus "unknown". Small closed-set-plus-reject problem, which is why accuracy can be high.
- **Stickiness:** hysteresis so labels don't flicker; switch only after 2 consecutive windows agree or at utterance end.
- **Groq Whisper:** model `whisper-large-v3-turbo`, one request per utterance, language `en`, `verbose_json` with word timestamps. Merge utterances under 1.5 s with the next one from the same speaker. Token bucket at 18 RPM with retry and backoff on 429; never drop audio, queue it.
- **Data channel messages (JSON):**
  - `{type:"speaker", utt_id, track_sid, person_id|null, label, relation_to_resident, conf, t}`
  - `{type:"speaker_final", utt_id, person_id|null, conf, start_ms, end_ms}`
  - `{type:"text", utt_id, text}`
  - `{type:"item", item_id, kind, status}`
- **Latency targets:** speaker label under 1.5 s after speech onset; text under 2.5 s after utterance end.
- **Profile updates:** after a call, utterances with final conf above 0.9 and at least 3 s long may be added to the profile (running mean of embeddings, capped count). Never from utterances the family corrected.
- **Voice messages (fallback path):** same pipeline offline on uploaded audio.

---

## 7. ML: training and evaluation

### 7.1 Datasets
| Set | Contents | Use |
|---|---|---|
| LibriSpeech train-clean-100 / 360 (OpenSLR 12) | Read English, many speakers, open download | Fine-tuning A |
| MUSAN (OpenSLR 17) | Noise, music, babble | Augmentation |
| RIRs (OpenSLR 28) | Room impulse responses | Reverb augmentation |
| VoxCeleb1 (optional) | Celebrity speech | Only if access is quick; not required |
| **Caretaker Family Set (CFS)** | 6 to 10 consenting people; enrollment clips plus ~5 min group conversation per session, 3 to 4 sessions, laptop mic and phone, at least 2 sessions with overlap | Train B (train split), evaluate everything (test split) |

CFS protocol:
- Written consent from each person (and parent for minors) for recording and research use.
- Speaker-disjoint split for A. For B, split by session: enrollment and train sessions vs held-out test sessions.
- Label about 30 min of test audio with who-spoke-when in RTTM format (Audacity labels or pyannote annotation export).
- Store under `ml/data/cfs/` (gitignored). Never commit audio.

### 7.2 Option A: fine-tune ECAPA-TDNN
- **Start:** SpeechBrain `speechbrain/spkrec-ecapa-voxceleb` (192-dim embeddings).
- **Objective:** AAM-softmax (additive angular margin), low learning rate, freeze early layers first epoch.
- **Degradation augmentation (the point of A):** random chain of: Opus 12 to 24 kbps, G.711 mu-law 8 kHz resample, band-pass 300 to 3400 Hz, laptop mic EQ, MUSAN noise at 5 to 20 dB SNR, RIR reverb, packet loss simulation.
- **Compute:** Kaggle or Colab GPU, roughly 5 to 15 GPU hours. Checkpoint every epoch so sessions can resume.
- **Eval:** EER and minDCF on (1) degraded LibriSpeech test-clean trials, (2) CFS test. Compare pretrained vs fine-tuned.
- **Honest result rule:** report whatever you get. A null result with a clear explanation is still a strong technical-challenges answer.

### 7.3 Option B: scoring layer (open-set identification)
- **Input:** cosine scores between a test embedding and each enrolled profile, plus enrollment duration and utterance duration.
- **Model:** logistic regression calibration (Platt scaling) on target and non-target trials, with duration features. Output calibrated probability.
- **Decision:** accept top-1 if prob above tau and (top1 minus top2) above margin m; else "unknown". Tune tau and m on train split for a target false-accept rate (for example 2%).
- **Why it matters:** a wrong name on screen is worse for a dementia patient than "Someone new". The threshold choice is a product decision backed by data.

### 7.4 Metrics and charts (for the video and written answer)
| Metric | Definition | Tool |
|---|---|---|
| Speaker ID accuracy | Share of test utterances labeled with the correct person (closed set) | own script |
| Open-set: false accept / false reject | Wrong name shown vs known person shown as unknown | own script |
| EER, minDCF | Verification trials | own script or SpeechBrain utils |
| DER (collar 0.25 s) | Diarization error on CFS test RTTM | `pyannote.metrics` |
| Latency | Onset to label, end to text | agent logs |

Charts to produce:
1. Accuracy vs enrollment seconds (5, 10, 20, 30 s), pretrained vs fine-tuned.
2. EER on degraded audio: pretrained vs fine-tuned.
3. False-accept vs false-reject curve with the chosen operating point marked.
4. Baseline comparison table.

### 7.5 Baseline
- `pyannote/speaker-diarization-3.1` (free, gated on Hugging Face: accept terms) produces anonymous clusters.
- Identity baseline: map each cluster to the nearest enrolled profile with pretrained ECAPA and a fixed cosine threshold.
- Caretaker system: fine-tuned ECAPA plus scoring layer plus streaming decisions.
- Report both on CFS test: DER, ID accuracy, false-accept rate.

---

## 8. Extraction, linking and approval

### 8.1 Extraction
- **Trigger:** every ~60 s of new transcript during a call, and once at call end.
- **Model:** Groq LLM with JSON output. Pick a current free-tier model with JSON mode; keep the model name in config.
- **Input:** new utterances (with speaker names and relationships), list of people in the tree (id, name, aliases, relationship), today's date.
- **Output schema:**
```json
{
  "items": [
    {
      "kind": "memory | event | family_news | med_note | new_person | tree_edit",
      "summary": "string, written for the resident, plain and warm",
      "details": {},
      "people_mentions": [{"text": "my daughter", "utterance_id": "uuid"}],
      "source_utterance_ids": ["uuid"],
      "confidence": 0.0
    }
  ]
}
```
- **Rate limits:** one request per batch, trimmed context, retry on 429. Groq free LLM limits are per model; check console before the demo.

### 8.2 Linking (pgvector)
1. Rule pass: resolve relative mentions from the speaker's position in the tree ("my daughter" said by Lisa means Lisa's daughter). Tree logic in `services/inference/app/tree/relations.py`.
2. Embedding pass: embed mention context with `BAAI/bge-small-en-v1.5` (384-dim), nearest person alias and bio vectors.
3. Combine rule and vector scores; if below threshold, create a `new_person` pending item.

### 8.3 Dedupe and search
- Before inserting a memory, cosine search existing memories for the same people; above 0.9 means merge or skip.
- F9 search: embed query, search memories and utterances, return with source call and timestamp.

### 8.4 Approval tiers
| Kind | Default status | Shown to resident |
|---|---|---|
| memory (linked to known people, conf at least 0.7) | auto_published | Yes, immediately |
| family_news | auto_published | Yes |
| event | auto_published | Yes (Today) |
| med_note | pending | Never to resident; family view after approval |
| new_person | pending | After approval |
| tree_edit | pending | After approval |
| anything with conf under 0.7 | pending | After approval |

Rationale: false memories shown to a dementia patient cause harm, and wrong medical information is a safety issue. The one-tap approval is shown on camera in the video.

---

## 9. Family tree

- **Storage:** `people` plus `relationships` rows. Store only `parent_of` and `spouse_of` (with optional start and end for remarriage). Siblings, grandparents, cousins, in-laws are derived.
- **Derived relations (Ken writes):** `relation(a, b)` returns a label like "grandson", "daughter-in-law", "great-niece". Tested with unit tests on a fixture family.
- **Rendering:** family view uses an open-source tree layout library (for example `family-chart` or d3 with `elkjs`); resident view uses a simple generation grid.
- **Scale:** must render 60+ people smoothly; lazy-load photos.
- **Person page data:** photo, names and aliases, relationship to resident, birth year (optional), short bio, memories, voice profile status.

---

## 10. News

- **Family News:** auto-published `family_news` items, written for the resident ("Emily passed her driving test").
- **Public news:** RSS headlines plus the outlet's own description and link. No AI rewriting of articles (copyright). Default feeds chosen by family in F11.
- **Positive filter:** Groq LLM classifies headline plus description only as uplifting, neutral or distressing; resident view hides distressing by default.
- **Refresh:** cron every 2 hours (Vercel cron), cached in `news_items`.

---

## 11. Data model (Postgres on Neon, Drizzle ORM, pgvector)

```sql
create extension if not exists vector;

create table families (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);

create table people (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  display_name text not null,
  aliases text[] not null default '{}',
  is_resident boolean not null default false,
  birth_year int,
  is_deceased boolean not null default false,
  photo_url text,
  bio text,
  bio_embedding vector(384),
  created_at timestamptz not null default now()
);

create table relationships (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  kind text not null check (kind in ('parent_of','spouse_of')),
  from_person uuid not null references people(id) on delete cascade,
  to_person uuid not null references people(id) on delete cascade,
  started_year int,
  ended_year int
);

create table users (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  person_id uuid references people(id),
  role text not null check (role in ('family_admin','family','resident_device')),
  email text unique,
  created_at timestamptz not null default now()
);

create table consents (
  id uuid primary key default gen_random_uuid(),
  person_id uuid not null references people(id) on delete cascade,
  kind text not null check (kind in ('voice_enrollment','call_recording','research_dataset')),
  text_version text not null,
  signed_by_user uuid references users(id),
  signed_at timestamptz not null default now(),
  revoked_at timestamptz
);

create table voice_profiles (
  id uuid primary key default gen_random_uuid(),
  person_id uuid not null unique references people(id) on delete cascade,
  embedding vector(192) not null,
  n_segments int not null,
  enrollment_seconds real not null,
  model_version text not null,
  consent_id uuid not null references consents(id),
  updated_at timestamptz not null default now()
);

create table calls (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  livekit_room text not null,
  kind text not null check (kind in ('video_call','voice_message')),
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  audio_retained boolean not null default false,
  audio_url text
);

create table utterances (
  id uuid primary key default gen_random_uuid(),
  call_id uuid not null references calls(id) on delete cascade,
  track_sid text,
  speaker_person_id uuid references people(id),
  speaker_conf real,
  speaker_status text not null check (speaker_status in ('known','unknown','corrected')),
  start_ms int not null,
  end_ms int not null,
  text text,
  text_embedding vector(384),
  created_at timestamptz not null default now()
);

create table items (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  call_id uuid references calls(id) on delete set null,
  kind text not null check (kind in ('memory','event','family_news','med_note','new_person','tree_edit')),
  summary text not null,
  details jsonb not null default '{}',
  confidence real not null,
  status text not null check (status in ('auto_published','pending','approved','rejected')),
  source_utterance_ids uuid[] not null default '{}',
  event_at timestamptz,
  embedding vector(384),
  decided_by uuid references users(id),
  decided_at timestamptz,
  created_at timestamptz not null default now()
);

create table item_people (
  item_id uuid references items(id) on delete cascade,
  person_id uuid references people(id) on delete cascade,
  primary key (item_id, person_id)
);

create table mentions (
  id uuid primary key default gen_random_uuid(),
  utterance_id uuid not null references utterances(id) on delete cascade,
  mention_text text not null,
  resolved_person_id uuid references people(id),
  rule_score real,
  vector_score real,
  final_score real
);

create table news_feeds (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  name text not null,
  url text not null,
  category text
);

create table news_items (
  id uuid primary key default gen_random_uuid(),
  feed_id uuid not null references news_feeds(id) on delete cascade,
  title text not null,
  description text,
  link text not null unique,
  published_at timestamptz,
  tone text check (tone in ('uplifting','neutral','distressing'))
);

create index on utterances (call_id, start_ms);
create index on items (family_id, status, kind);
create index on items using hnsw (embedding vector_cosine_ops);
create index on utterances using hnsw (text_embedding vector_cosine_ops);
create index on people using hnsw (bio_embedding vector_cosine_ops);
```

---

## 12. Architecture, services and cost

### 12.1 Repo layout
```
caretaker/
  CLAUDE.md
  SPEC.md
  AI_LOG.md
  apps/web/                     Next.js (App Router, TS, Tailwind), Vercel
    app/(public)/               landing, demo switcher
    app/resident/               R screens
    app/family/                 F screens
    app/api/                    livekit token, approvals, news cron, search proxy
    components/                 shared UI
    lib/db/                     Drizzle schema + queries
    lib/mocks/                  mock data + fake data-channel events for UI-first dev
    styles/tokens.css           design tokens from palette
  services/inference/           Python 3.11, FastAPI + LiveKit Agents, Railway or Modal
    app/agent/                  livekit worker, per-track pipeline        [KEN]
    app/speaker/                embeddings, scoring, change detection      [KEN]
    app/asr/                    groq whisper client + rate limiter         [KEN]
    app/extract/                extraction prompts + parsing               [KEN]
    app/link/                   mention linking, dedupe, search            [KEN]
    app/tree/                   relation derivation                        [KEN]
    app/api/                    FastAPI routes (enroll, search, health)    [KEN]
    tests/
  ml/                                                                      [KEN]
    data/                       gitignored
    augment/                    degradation chain
    train_ecapa.py              option A
    train_scoring.py            option B
    eval/                       eer, id_accuracy, der, charts
    notebooks/                  kaggle/colab entry points
  db/migrations/
  docs/                         charts, interview notes, video script
```

### 12.2 Services
| Need | Service | Cost basis (verify current terms) |
|---|---|---|
| Web hosting, cron | Vercel | Hobby free |
| Database, vectors | Neon Postgres + pgvector | Free tier |
| Calls | LiveKit Cloud | Free tier |
| Agent + inference (CPU) | Railway or Modal | Low monthly cost or free credits |
| Speech-to-text | Groq `whisper-large-v3-turbo` | Free tier: 20 RPM, 2K RPD, 7.2K audio sec/hour (checked 2026-09-16) |
| LLM extraction and tone | Groq LLM | Free tier, per-model limits |
| Text embeddings | `bge-small-en-v1.5` on inference service | Free |
| Training GPU | Kaggle or Colab; Modal as backup | Free quotas |
| Photos and optional audio | Vercel Blob or Cloudflare R2 | Free tier |
| Auth | Auth.js (email magic link) or Clerk free | Free |

Rule: only free tiers or well-known providers. No marketplace GPU rentals from unknown sellers.

Before relying on Groq with real family audio, read Groq's data retention terms. Demo audio is from consenting volunteers either way.

### 12.3 Environment variables
```
DATABASE_URL=
LIVEKIT_URL=
LIVEKIT_API_KEY=
LIVEKIT_API_SECRET=
GROQ_API_KEY=
GROQ_ASR_MODEL=whisper-large-v3-turbo
GROQ_LLM_MODEL=
INFERENCE_BASE_URL=
INFERENCE_SHARED_SECRET=
BLOB_READ_WRITE_TOKEN=
AUTH_SECRET=
SPEAKER_MODEL_VERSION=
```

---

## 13. Privacy and consent

- Voiceprints are biometric data (treated as sensitive personal information under CCPA; Illinois BIPA is strict). Design as if strict rules apply.
- **Per-person consent** before enrollment, versioned text, revocable (F12).
- **Raw call audio deleted by default** after processing; retention is an explicit family opt-in.
- **Stored:** embeddings, transcripts, items.
- **Delete my voiceprint:** removes `voice_profiles` row immediately; transcripts keep text but speaker becomes "unknown".
- **Resident dignity:** filming the resident for the video only with family and facility permission; default is hands and screen only.
- **Minors:** enrollment of anyone under 18 requires parent consent.
- One privacy sentence in the video.

---

## 14. Demo mode

- **Fictional family "The Chen family"**, three generations, about 12 people. Resident: "Grandma Mei". Four enrolled voices recorded by consenting friends.
- **Seeded content:** 3 processed calls (group video call with shared laptop, one-to-one call, voice message), ~15 memories, 4 family news items, 2 events, 1 pending med note, 1 pending new person.
- **Replay mode:** a pre-recorded call plays back through the real UI with the real data-channel event timeline, so judges see live labels without a GPU service or a second person.
- **Live mode:** real LiveKit call for recording the video.
- Real family data sits behind login and is never in the demo family.

---

## 15. Ownership split (AI vs Ken)

| Area | Who writes the logic | AI allowed |
|---|---|---|
| Next.js UI, components, styling, pages | AI assisted | Yes |
| LiveKit client, token route, data-channel UI handling | AI assisted | Yes |
| Drizzle schema, migrations, CRUD routes | AI assisted, Ken reviews | Yes |
| Mocks and fixtures for UI | AI | Yes |
| Scaffolding, configs, CI, debugging help | AI | Yes |
| `services/inference/app/**` logic | **Ken** | Scaffold only: files, imports, signatures, docstrings, TODO stubs |
| `ml/**` training and evaluation | **Ken** | Scaffold only |
| Extraction prompts, linking, dedupe, relation derivation | **Ken** | Scaffold only |

Every AI session appends to `AI_LOG.md`: date, tool, files touched, what it did. This is the disclosure evidence.

---

## 16. Milestones

| Date | Milestone | Done when |
|---|---|---|
| Sep 16 to 19 | UI design in Claude Design | All R and F screens and components designed in chosen palette |
| Sep 16 to 20 | Facility interview booked and done | Notes in `docs/interview.md`, quote permission |
| Sep 19 to 22 | Web scaffold + mocks | UI clickable end to end with mock data and replayed events |
| **Sep 28** | Baseline pipeline + CFS dataset | Live call shows names with pretrained ECAPA + fixed threshold; Groq text fills in; CFS recorded and 30 min labeled |
| **Oct 5** | Training results | A and B trained; charts 1 to 4 generated |
| Oct 5 to 11 | Extraction, linking, approvals, tree, news | Items flow into tree and resident view |
| **Oct 12** | Feature freeze | Only bug fixes after this |
| Oct 12 to 16 | Demo family seed + replay mode | Public demo works without login |
| **Oct 19** | Video recorded and edited | Under 3:00, all required items present |
| Oct 20 to 21 | Written answers final | Ken's drafts reviewed |
| **Oct 22** | Submit | Confirmation received; buffer to Oct 26 noon EDT |

---

## 17. Submission package

### 17.1 Video (3:00 max)
| Time | Content |
|---|---|
| 0:00 to 0:20 | Hook: Grandma's story in two sentences, interview quote; hands and screen only |
| 0:20 to 0:35 | Required: name, app title, one-sentence purpose, target audience |
| 0:35 to 1:35 | Demo: family of four on one laptop, speaker cards light up with names, a memory appears on Grandma's screen, a med note waits and gets one-tap approval, tree updates |
| 1:35 to 2:15 | Technical: pipeline diagram, before/after training chart, baseline comparison |
| 2:15 to 2:40 | Required: tools and languages; AI disclosure; one privacy sentence |
| 2:40 to 3:00 | 2.0: staff view, Cantonese, face labels, facility pilot |

Tools and languages line (update at the end): TypeScript, Next.js, Tailwind, Python, FastAPI, PyTorch, SpeechBrain, pyannote, LiveKit, Groq (Whisper and LLM), Postgres with pgvector, Vercel, Neon.

Rule: demo section is recorded from the real app. Editing between takes is fine; faking screen output is not.

### 17.2 Written answers
Ken drafts all six, then gets critique. Material to draw from:
- **Inspiration:** Grandma, the loneliness, forgetting people, facilities not addressing it, interview findings.
- **Technical challenges:** shared-mic speaker ID, Groq being batch-only (VAD utterance design), rate limits, laptop and phone audio degradation, open-set rejection tradeoff, mention linking across relationships.
- **Learned:** training and evaluating speaker models honestly, streaming systems, designing for cognitive impairment.
- **2.0:** section 3.

### 17.3 Facility interview guide
- **Who:** activity director or social worker at Grandma's facility; backup: 2 to 3 nearby facilities.
- **Ask:** "I'm a student building an app for residents' families. Could I have 15 minutes to learn what problems you see?" No pitch.
- **Questions:**
  1. How often do most residents get calls or visits?
  2. What happens when a resident doesn't recognize a visitor?
  3. How do families stay updated today?
  4. What tech do residents actually use, and what fails?
  5. Who manages meds, and would family-side med notes help or cause problems?
  6. May I quote you by role in a student competition entry?
- Question 5 can change the med notes feature. Update this spec if it does.

---

## 18. Risks and fallbacks

| Risk | Fallback |
|---|---|
| Groq rate limit during recording | Replay mode for the demo shot; queue never drops audio |
| Fine-tuning A shows no gain | Report it honestly; B still gives charts |
| LiveKit agent deployment issues | Voice message path (upload, offline pipeline) |
| Heavy overlap breaks labels | Show "Someone new" or last confident speaker; document limitation |
| CPU host too slow for ECAPA every 1 s | Increase hop to 1.5 s; run on Modal |
| Speaker model mislabels on camera | Higher tau for demo; retake |
| Scope slip | Cut order: news tone filter, F9 search, F13 settings polish, voice messages |
| Interview says med notes harmful | Remove med notes; replace with "questions for the care team" notes |

---

## 19. Open items
- Branding: 家 tile or calm adult brown bear. Explain 家 ("jiā, home and family") in the video if used. Test at 32px.
- Final palette choice (see `palettes.html`).
- Groq LLM model name for extraction (pick current free-tier model with JSON mode).
- Hosting choice for inference: Railway vs Modal after baseline latency test.
