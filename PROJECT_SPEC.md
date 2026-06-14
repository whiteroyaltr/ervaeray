# Anniversary Surprise Website — Project Specification

## 1. Project Overview

A romantic, interactive surprise website built for an anniversary gift. The overall theme is **"Sweet" (Tatlı)** — soft pastel colors, rounded shapes, gentle animations, candy/dessert-like visual motifs (hearts, stars, ribbons, sparkles, soft gradients).

The site is a single-page application (SPA) style experience with multiple "pages"/routes. The landing page acts as a hub showing animated preview cards for each sub-page, each hidden behind a gift-box that the user must "open" before navigating.

### 1.1 Tech Stack

- **Framework**: Next.js 14+ (App Router), React, TypeScript
- **Styling**: Tailwind CSS + Framer Motion for animations
- **Hosting/Deploy**: Vercel
- **Media storage (photos/videos/audio)**: Cloudflare R2 (S3-compatible bucket), accessed via public URLs or signed URLs
- **Database (optional, if needed)**: Supabase (Postgres) — used only if dynamic/persisted data is required (e.g., quiz scores, bucket list checkbox state persistence across devices). If not strictly necessary, prefer local JSON/config files and `localStorage` for simplicity.
- **Audio playback**: HTML5 `<audio>` element or a lightweight library (e.g., `howler.js`)
- **Star map rendering**: Use a library such as `react-simple-maps`, `d3-celestial`, or generate an SVG star field positioned using astronomical data (see Page 2 details)

### 1.2 Configuration Philosophy

All personal/content data (dates, messages, song lists, quiz questions, bucket list items, statistics) must live in **separate, clearly commented config files** (TypeScript or JSON) under a `/config` directory, so the site owner can edit content without touching component logic.

---

## 2. Global Design System ("Sweet" Theme)

### 2.1 Color Palette
- Primary background: soft cream / blush gradient (`#FFF5F7` → `#FFE4EC`)
- Accent colors: candy pink (`#FF8FAB`), lavender (`#C8A2C8`), soft gold (`#FFD580`), mint (`#B5EAD7`)
- Text: warm dark brown/charcoal (`#4A3F35`) for readability on light backgrounds
- Highlight/CTA: rose red (`#FF6B81`)

### 2.2 Typography
- Headings: a rounded, friendly display font (e.g., "Poppins", "Quicksand", or "Fredoka")
- Body: a soft sans-serif (e.g., "Nunito", "Quicksand")
- Optional handwritten/script accent font for love-letter style text (e.g., "Caveat", "Dancing Script") — load via Google Fonts

### 2.3 Visual Motifs
- Floating hearts, sparkles, stars, ribbons as ambient background animation (subtle, low-opacity, slow movement — using Framer Motion or CSS keyframes)
- Rounded corners (`rounded-2xl`/`rounded-3xl`) on all cards
- Soft drop shadows, glassmorphism-lite cards (semi-transparent white with blur)
- Smooth page transitions (fade + slight scale) using Framer Motion's `AnimatePresence`

### 2.4 Responsiveness
- Mobile-first design; all pages must work well on phones (this will likely be opened on a phone as a surprise)
- Test breakpoints: 375px (mobile), 768px (tablet), 1280px+ (desktop)

---

## 3. Site Structure / Routes

```
/                  → Landing / Hub page (gift-box cards + bucket list teaser below the fold)
/counter           → "Sayaç" — Time-together counters & stats
/starmap           → "Yıldız Haritası" — Star map of the day you met
/music             → "Müzik Çalar" — Shared songs player
/love-reasons      → "Neden Seni Seviyorum" — Reasons I love you cards
/quiz              → "Quiz" — Relationship trivia quiz
```

The Bucket List ("Gelecek Planları") is **not** a separate route — it is a section on the landing page (`/`), placed below the fold (visible after scrolling down past the gift-box cards grid).

---

## 4. Landing Page (`/`)

### 4.1 Hero Section
- Big sweet welcome message (e.g., "[Partner's Name] için... 💕") with the couple's photo or an animated illustration
- Optional ambient floating hearts/sparkles background animation across the whole page

### 4.2 Gift-Box Preview Cards Grid

A responsive grid (2 columns on mobile, 3 on desktop) containing one card per sub-page:
1. Sayaç (Counter)
2. Yıldız Haritası (Star Map)
3. Müzik Çalar (Music Player)
4. Neden Seni Seviyorum (Love Reasons)
5. Quiz

**Card states & interaction flow (CRITICAL — implement exactly):**

1. **Initial state**: Each card shows a closed gift box illustration/animation (wrapped present with a bow) covering/overlaying the card. The card's actual preview content (a small thumbnail/teaser of that page — e.g., a mini animated counter ticking, a snippet of the star map, a music note animation, a sample love-reason card, a quiz icon) sits underneath, hidden or blurred.

2. **First tap/click on a gift box**:
   - Trigger a "gift unwrap" animation: the bow unties, the box lid flips open, wrapping paper pieces fall away/fade out (use Framer Motion variants — e.g., scale + rotate + opacity transitions, or a small confetti/sparkle burst using `canvas-confetti` or similar lightweight lib)
   - After the animation completes (~0.8–1.2s), the gift box disappears and the **preview content** of that page becomes fully visible and interactive-looking (e.g., shows a short looping preview: animated number ticking for counter, a star twinkle for star map, a vinyl record spinning for music, a flipping card for love reasons, a question mark bouncing for quiz)
   - Store this "opened" state in component state (and optionally `localStorage` so it persists if the user revisits — but each card resets to closed gift box on a fresh visit if simplicity is preferred; document the choice as configurable)

3. **Second tap/click (on the now-revealed preview card)**:
   - Navigate to the corresponding route (`/counter`, `/starmap`, `/music`, `/love-reasons`, `/quiz`) using Next.js routing, with a smooth page transition (fade/scale via `AnimatePresence`)

**Implementation notes:**
- Each card component should accept props: `title`, `previewComponent` (a small React component unique to that page), `route`, `giftBoxColor` (varying pastel colors per card for visual variety)
- Gift box illustrations can be SVG (hand-drawn style or simple geometric boxes with ribbon) — create as reusable `<GiftBox />` component with color prop
- Add a subtle "tap me!" hint animation (gentle pulse/bounce + small text like "Aç beni! 🎁") on first load to guide the user

### 4.3 Bucket List Section (Below the Fold)

- Positioned after the gift-box grid, requires scrolling down to reveal
- Section heading: "Birlikte Yapmak İstediklerimiz" (Things We Want To Do Together)
- Add a visual scroll-down indicator/arrow at the bottom of the hero/grid area to hint more content exists below
- See Section 9 for full bucket list functionality details (it lives here, not on a separate route)

---

## 5. Page: `/counter` — "Sayaç" (Time-Together Counter)

### 5.1 Main Big Counter
- Large, prominent live-updating counter showing total time since the relationship's start date, broken down as: **Years, Months, Days, Hours, Minutes, Seconds** (update every second using `setInterval` or `requestAnimationFrame`)
- Display format example: "2 Yıl 3 Ay 14 Gün 06:23:47"
- Animate digit changes (e.g., flip/slot-machine style number transitions using a library like `react-odometerjs` or custom Framer Motion digit animation)
- Sweet decorative framing (hearts, flowers) around the counter

### 5.2 Smaller Counters (Revealed on Scroll)

Below the main counter, on scroll, reveal a grid/list of smaller counters, each tracking time since a different milestone date, labeled "İlk ... 'den itibaren" (Since our first ...). Each smaller counter:
- Shows its own label (e.g., "İlk Buluşmamızdan İtibaren", "İlk 'Seni Seviyorum' Dediğimizden İtibaren", "İlk Tatilimizden İtibaren")
- Shows elapsed time (can be simpler format than the main counter, e.g., just days, or days+hours)
- Animate into view with stagger (Framer Motion `whileInView` + stagger children)

### 5.3 Statistics Section

Below the smaller counters, show a grid of fun statistics phrased as "Bu süre içinde..." (During this time...), e.g.:
- "X kere 'iyi geceler' dedik" (We said goodnight X times)
- "X film izledik" (We watched X movies together)
- "X şehir gezdik" (We visited X cities)
- "X kahve içtik" ((We drank X coffees)
- Each stat displayed as an icon + animated counting-up number (count from 0 to target value when scrolled into view, using a library like `react-countup`) + label text

### 5.4 Config File: `/config/counters.ts`

Must export a strongly-typed config object allowing the site owner to edit:

```typescript
export interface MilestoneCounter {
  id: string;
  label: string;        // e.g., "İlk Buluşmamızdan İtibaren"
  date: string;         // ISO date string, e.g., "2023-05-12T18:00:00"
  displayFormat: "full" | "days-only" | "days-hours"; // controls granularity shown
}

export interface Statistic {
  id: string;
  icon: string;          // icon name or emoji
  prefix?: string;       // text before the number, e.g., ""
  value: number;         // the target number to count up to
  suffix: string;        // text after number, e.g., " kere 'iyi geceler' dedik"
}

export interface CountersConfig {
  relationshipStartDate: string; // ISO date string — drives the MAIN big counter
  mainCounterLabel: string;      // e.g., "Birlikte Olduğumuzdan Beri"
  milestones: MilestoneCounter[];
  statistics: Statistic[];
}

export const countersConfig: CountersConfig = {
  relationshipStartDate: "2023-05-12T18:00:00",
  mainCounterLabel: "Birlikte Olduğumuzdan Beri",
  milestones: [
    // example entries — owner fills in real dates/labels
    { id: "first-date", label: "İlk Buluşmamızdan İtibaren", date: "2023-05-12T18:00:00", displayFormat: "full" },
    { id: "first-i-love-you", label: "İlk 'Seni Seviyorum' Dediğimizden İtibaren", date: "2023-06-01T00:00:00", displayFormat: "days-only" },
  ],
  statistics: [
    { id: "goodnights", icon: "🌙", value: 500, suffix: " kere 'iyi geceler' dedik" },
    { id: "movies", icon: "🎬", value: 42, suffix: " film izledik" },
  ],
};
```

### 5.5 Notes
- All date calculations should account for timezones consistently (store dates with explicit timezone or use UTC and display in local time — document the chosen approach in code comments)
- The component logic must be fully generic — adding a new milestone or statistic to the config array automatically renders a new counter/stat card with no code changes needed

---

## 6. Page: `/starmap` — "Yıldız Haritası" (Star Map)

### 6.1 Purpose
Show an interactive star map representing the night sky as it appeared on the date (and ideally location) the couple met, plus astrology-themed messages relevant to that date.

### 6.2 Star Map Implementation
- **Data source options** (agent should pick the most feasible given no paid API budget constraints aren't specified, but prefer free/open solutions):
  - Use a static star catalog dataset (e.g., a trimmed version of the Yale Bright Star Catalog, available as open JSON/CSV) bundled into the project, and compute star positions for the given date/location using an astronomy calculation library such as `astronomy-engine` or `suncalc` + custom sidereal time calculations
  - Alternatively, embed an `<iframe>` or generate a static image via a service, but **interactive** is preferred per requirements — so a custom SVG/Canvas rendering driven by `astronomy-engine` is the recommended approach
- Render the sky as a circular planisphere (dome view) or rectangular star field, with:
  - Stars sized/colored by magnitude/brightness
  - Constellation lines connecting major stars (optional but adds charm — use a constellation line dataset)
  - Labels for zodiac constellations, especially the one corresponding to the date
- **Interactivity**: allow pan/zoom (e.g., via `react-zoom-pan-pinch`), and tap/click on a star or constellation to show a tooltip/popup with a name and a short romantic note (configurable)

### 6.3 Astrological Messages Section
Below or alongside the star map, display:
- The zodiac sign(s) relevant to the meeting date
- A short astrology-flavored message about that date/sign combination, written in a warm, romantic tone (NOT generic horoscope — personalized: "O gün yıldızlar tam da sizin hikayenizin başlamasına izin vermek için dizilmişti...")
- These messages should be editable via config (see below) since astrology content is creative/subjective and the owner may want to write their own

### 6.4 Config File: `/config/starmap.ts`

```typescript
export interface StarmapConfig {
  meetingDate: string;     // ISO date, e.g., "2023-05-12"
  meetingTime?: string;    // optional time for more precise sky position, e.g., "20:30"
  location: {
    name: string;          // e.g., "İstanbul, Türkiye"
    latitude: number;
    longitude: number;
  };
  zodiacHighlight: {
    sign: string;           // e.g., "Boğa"
    message: string;        // romantic astrology message, editable freeform text
  };
  starNotes: Array<{
    starId: string;         // identifier matching a star/constellation in the data
    note: string;           // short romantic note shown on tap
  }>;
  introMessage: string;     // big intro text shown above the map, e.g., "O gece gökyüzü böyle görünüyordu..."
}

export const starmapConfig: StarmapConfig = {
  meetingDate: "2023-05-12",
  meetingTime: "20:30",
  location: { name: "İstanbul, Türkiye", latitude: 41.0082, longitude: 28.9784 },
  zodiacHighlight: { sign: "Boğa", message: "..." },
  starNotes: [],
  introMessage: "...",
};
```

### 6.5 Fallback / Simplicity Option
If full astronomical computation proves too complex for the project timeline, the agent may implement a simplified version: a beautifully designed static SVG star field (randomly but aesthetically distributed stars) with the zodiac constellation for the meeting date highlighted and labeled, plus the astrology message section — still interactive via tap-to-reveal notes on a few "special" stars. Document which approach was taken in the README.

---

## 7. Page: `/music` — "Müzik Çalar" (Music Player & Shared Songs)

### 7.1 Player UI
- A sweet, custom-styled audio player (not the default browser controls) — show album art/cover, song title, artist, play/pause button, progress bar (seekable), volume control, next/previous track buttons
- Visual flourish: a spinning vinyl record or animated equalizer bars while playing
- Playlist list view below or beside the player showing all songs; tapping a song loads it into the player

### 7.2 "What this song reminds us of" Notes
- For each song in the playlist, display an accompanying note/story (e.g., "Bu şarkı, ilk yolculuğumuzda arabada birlikte söylediğimiz şarkıydı 🚗🎶")
- Notes shown either: (a) always visible next to each playlist item, or (b) revealed when that song is currently playing/selected (recommended for cleaner UI — show as an expandable text block under the player when a song is active)

### 7.3 Audio File Hosting
- Audio files (and album art images) are hosted on **Cloudflare R2**. Each song entry in config references a public R2 URL (or a signed URL if the bucket is private — document how to generate signed URLs server-side via a Next.js API route if private access is desired)
- Recommended R2 bucket structure: `r2://your-bucket/music/{song-id}.mp3` and `r2://your-bucket/music/covers/{song-id}.jpg`

### 7.4 Config File: `/config/music.ts`

```typescript
export interface Song {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;     // R2 public URL to album art
  audioUrl: string;     // R2 public URL to audio file
  memoryNote: string;   // "bu şarkı bize neyi hatırlatıyor" text
}

export interface MusicConfig {
  pageTitle: string;          // e.g., "Bizim Şarkılarımız"
  songs: Song[];
}

export const musicConfig: MusicConfig = {
  pageTitle: "Bizim Şarkılarımız",
  songs: [
    {
      id: "song-1",
      title: "...",
      artist: "...",
      coverUrl: "https://<r2-public-domain>/music/covers/song-1.jpg",
      audioUrl: "https://<r2-public-domain>/music/song-1.mp3",
      memoryNote: "...",
    },
  ],
};
```

### 7.5 Technical Notes
- Use the native `<audio>` element wrapped in a custom component for full control over play/pause/seek/volume, or `howler.js` for more advanced control
- Ensure only one song plays at a time; switching tracks stops the previous one
- Autoplay should be avoided (browsers block it and it can be jarring) — wait for user interaction
- Add `crossOrigin` and proper CORS configuration on the R2 bucket so audio can be fetched/played from the Vercel domain

---

## 8. Page: `/love-reasons` — "Neden Seni Seviyorum" (Reasons I Love You)

### 8.1 Interaction Pattern
- A card-deck style UI: a stack of cards (visually layered with slight rotation/offset, like a real card deck) sits in the center of the screen
- A prominent button/CTA below or the top card itself is tappable: "Bir sebep göster 💗" (Show me a reason)
- On tap:
  - A random reason from the config list is selected (avoid immediate repeats — track recently shown reasons and exclude them until the pool is exhausted, then reset)
  - Animate the top card flying off (swipe away, e.g., to the side with rotation, Framer Motion `drag` + exit animation) revealing the next card underneath with the new reason text, OR animate a flip transition on the same card (3D flip via `rotateY`)
  - Optionally play a small sparkle/heart-burst particle effect on each reveal
- Each card has a consistent sweet design: pastel background (can cycle through a palette), large heart icon, and centered reason text in a friendly/script font
- Show a counter or subtle indicator of "X / Y sebep görüldü" (optional, nice touch) if desired

### 8.2 Config File: `/config/love-reasons.ts`

```typescript
export interface LoveReasonsConfig {
  pageTitle: string;          // e.g., "Seni Sevmemin Bin Bir Sebebi"
  buttonText: string;         // e.g., "Bir sebep göster 💗"
  reasons: string[];          // freeform list, each item one reason
}

export const loveReasonsConfig: LoveReasonsConfig = {
  pageTitle: "Seni Sevmemin Bin Bir Sebebi",
  buttonText: "Bir sebep göster 💗",
  reasons: [
    "Çünkü her sabah bana gülümsemeyi unutmuyorsun.",
    "Çünkü en kötü günümde bile beni güldürebiliyorsun.",
    // ... owner adds as many as desired
  ],
};
```

### 8.3 Notes
- The list can be arbitrarily long (50, 100+ items) — design the random-selection logic to scale (e.g., shuffle a copy of the array and pop items, reshuffle when empty)
- Card design should support variable text length gracefully (auto-resizing font or scrollable card content for very long reasons)

---

## 9. Bucket List Section — "Gelecek Planları" / "Birlikte Yapmak İstediklerimiz"

(Located on the landing page `/`, below the fold — see Section 4.3)

### 9.1 UI
- Grid or list of "goal cards", each showing: an icon/emoji representing the activity, a short title (e.g., "Birlikte bir konsere gitmek"), and a checkbox/toggle area
- Unchecked items appear in normal/muted styling; clicking/tapping toggles to "completed" state
- **Completion animation**: when marked complete, trigger a celebratory animation — e.g., a checkmark draws itself in (SVG path animation), confetti burst (`canvas-confetti`), card briefly glows/scales up, and the card visually transforms (e.g., strikethrough text fades in, card background shifts to a "completed" pastel color like mint green, small "✓ Tamamlandı!" badge appears)
- Allow toggling back to incomplete (in case of accidental clicks) — same animation in reverse or simply instant revert

### 9.2 State Persistence
- Since this is a personal gift site (likely just the two of them using it), persist checked/unchecked state in `localStorage` by default (simple, no backend needed)
- **Optional enhancement**: If the couple wants shared state across devices (both partners can check off items and see each other's updates), use **Supabase**:
  - A simple `bucket_list_items` table: `id`, `item_key` (matches config id), `completed` (boolean), `completed_at` (timestamp)
  - Use Supabase client (anon key, public read/write with appropriate RLS policy scoped to this single-purpose app — document that RLS should still restrict writes sensibly, e.g., only allow updates to the `completed`/`completed_at` columns)
  - Real-time updates optional via Supabase Realtime subscriptions so both partners see live changes
- Document both options in the README; implement localStorage version by default, with Supabase as a documented optional upgrade path (feature-flagged via an environment variable, e.g., `NEXT_PUBLIC_USE_SUPABASE_BUCKET_LIST=true/false`)

### 9.3 Config File: `/config/bucket-list.ts`

```typescript
export interface BucketListItem {
  id: string;          // stable unique key, used for persistence
  icon: string;        // emoji or icon name
  title: string;       // e.g., "Birlikte bir konsere gitmek"
  description?: string; // optional longer text
}

export interface BucketListConfig {
  sectionTitle: string;       // e.g., "Birlikte Yapmak İstediklerimiz"
  sectionSubtitle?: string;   // optional intro text
  items: BucketListItem[];
}

export const bucketListConfig: BucketListConfig = {
  sectionTitle: "Birlikte Yapmak İstediklerimiz",
  items: [
    { id: "concert", icon: "🎤", title: "Birlikte bir konsere gitmek" },
    { id: "roadtrip", icon: "🚗", title: "Uzun bir karayolu gezisine çıkmak" },
  ],
};
```

---

## 10. Page: `/quiz` — "İlişkimiz Hakkında Ne Kadar Bilgilisin?" Quiz

### 10.1 Quiz Flow
- Sequential multiple-choice questions (one shown at a time), each with 2–4 answer options displayed as tappable buttons/cards
- On answer selection:
  - Immediate visual feedback: correct answer highlights green with a checkmark and a small celebration (confetti, bouncing emoji, or a short reward shown — see below); incorrect answer highlights red/shake animation, and optionally reveals the correct answer
  - **Reward on correct answer**: display a small reward inline or in a modal/popup — this can be a sweet message (from config) and/or a GIF (hosted via R2 or an external embeddable GIF URL, e.g., Giphy embed or self-hosted)
- "Next Question" button (or auto-advance after a short delay) progresses through the quiz
- After the final question, show a results/summary screen: total score (e.g., "8 / 10 doğru!"), a final overall sweet message/GIF, and optionally a "Tekrar Oyna" (Play Again) button that resets and reshuffles questions

### 10.2 Progress Indicator
- Show a progress bar or "Soru X / Y" indicator at the top during the quiz

### 10.3 Config File: `/config/quiz.ts`

```typescript
export interface QuizQuestion {
  id: string;
  question: string;             // e.g., "İlk buluşmamızda hangi restorana gittik?"
  options: string[];             // 2-4 answer options
  correctIndex: number;          // index into options array
  rewardMessage?: string;        // shown on correct answer, e.g., "Aferin canım! 😘"
  rewardGifUrl?: string;         // optional GIF URL shown on correct answer
  incorrectMessage?: string;     // optional custom message on wrong answer
}

export interface QuizConfig {
  pageTitle: string;             // e.g., "İlişkimiz Hakkında Ne Kadar Bilgilisin?"
  introText?: string;            // optional intro/instructions text
  questions: QuizQuestion[];
  finalMessages: {
    perfectScore: string;        // shown if 100% correct
    goodScore: string;           // shown if >=50% correct
    needsPractice: string;       // shown if <50% correct
  };
  finalGifUrl?: string;          // optional GIF for the results screen
}

export const quizConfig: QuizConfig = {
  pageTitle: "İlişkimiz Hakkında Ne Kadar Bilgilisin?",
  questions: [
    {
      id: "q1",
      question: "İlk buluşmamızda nereye gittik?",
      options: ["Sinema", "Sahil", "Kafe", "Park"],
      correctIndex: 2,
      rewardMessage: "Doğru bildin, harikasın! 😍",
      rewardGifUrl: "",
    },
  ],
  finalMessages: {
    perfectScore: "Mükemmel! Her şeyi hatırlıyorsun! 🥰",
    goodScore: "Çok iyiydin! Birlikte daha çok anı biriktirelim 💕",
    needsPractice: "Birlikte daha çok zaman geçirip bu anıları tazeleyelim 😉",
  },
};
```

### 10.4 Notes
- Questions order can optionally be shuffled each playthrough (configurable boolean, default `true`)
- All score-tracking is client-side/in-memory only (no persistence needed unless owner wants leaderboard — not required per spec)

---

## 11. Cloudflare R2 Integration Details

### 11.1 Setup Requirements
- Create an R2 bucket (e.g., `anniversary-site-media`)
- Enable public access for the bucket OR configure a custom domain / R2.dev subdomain for serving public assets directly (recommended for simplicity: public bucket + custom domain, e.g., `media.yoursite.com`)
- Folder structure suggestion:
  ```
  /photos/{page-name}/{filename}
  /videos/{page-name}/{filename}
  /music/{song-id}.mp3
  /music/covers/{song-id}.jpg
  /gifs/quiz/{question-id}.gif
  ```
- All media URLs referenced in config files should point to the R2 public URL (e.g., `https://media.yoursite.com/photos/landing/hero.jpg`)
- For any private/signed-URL use cases (not strictly required given this is a private gift site, but documented as an option): implement a Next.js API route (`/app/api/r2-signed-url/route.ts`) using `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner` configured with R2's S3-compatible endpoint, access key, and secret (stored as Vercel environment variables: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`)

### 11.2 Image/Video Optimization
- Since Next.js Image Optimization (`next/image`) doesn't work out-of-the-box with external R2 URLs without configuration, add R2's domain to `next.config.js` under `images.remotePatterns`
- Consider using R2 + Cloudflare's image resizing (if on a Cloudflare-proxied custom domain) for responsive images, or pre-optimize images before upload

---

## 12. Supabase Integration (Optional, Conditional)

Only required if:
- Bucket list state needs to sync across both partners' devices (Section 9.2), AND/OR
- The site owner later wants to add a "guestbook"/messages feature or quiz score history (not currently in scope but architecture should not preclude it)

### 12.1 Setup
- Create a Supabase project
- Environment variables in Vercel: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Use `@supabase/supabase-js` client
- Suggested table schema for bucket list sync:
```sql
create table bucket_list_items (
  id text primary key,
  completed boolean default false,
  completed_at timestamptz
);
```
- Row Level Security: enable RLS, allow `select` and `update` (on `completed`/`completed_at` only) for anonymous role given this is a private two-person site — document the security tradeoff clearly (this is acceptable only because the site URL is not publicly shared/indexed)

---

## 13. Project Structure (Suggested)

```
/app
  /page.tsx                  → Landing page
  /counter/page.tsx
  /starmap/page.tsx
  /music/page.tsx
  /love-reasons/page.tsx
  /quiz/page.tsx
  /api/r2-signed-url/route.ts (optional)
  /layout.tsx                 → Global layout, fonts, ambient background animation
  /globals.css

/components
  /landing/GiftBoxCard.tsx
  /landing/GiftBox.tsx
  /landing/BucketListSection.tsx
  /counter/MainCounter.tsx
  /counter/MilestoneCounter.tsx
  /counter/StatCard.tsx
  /starmap/StarMap.tsx
  /starmap/AstrologyMessage.tsx
  /music/MusicPlayer.tsx
  /music/PlaylistItem.tsx
  /love-reasons/ReasonCardDeck.tsx
  /quiz/QuizQuestionCard.tsx
  /quiz/QuizResults.tsx
  /shared/AmbientBackground.tsx (floating hearts/sparkles)
  /shared/PageTransition.tsx

/config
  /counters.ts
  /starmap.ts
  /music.ts
  /love-reasons.ts
  /quiz.ts
  /bucket-list.ts
  /site.ts (global site settings: partner names, hero text, theme tweaks)

/lib
  /supabase.ts (if used)
  /r2.ts (helper for constructing/fetching R2 URLs, signed URL gen if needed)
  /astronomy.ts (star position calculations, if implementing full star map)

/public
  (static assets that don't need to be in R2, e.g., icons, favicon)
```

### 13.1 Global Site Config: `/config/site.ts`
```typescript
export interface SiteConfig {
  partnerName: string;        // the recipient's name, used in hero greeting
  yourName: string;
  anniversaryDate: string;    // the date this gift is "for"
  heroTitle: string;          // e.g., "Aşkım, Sana Bir Sürprizim Var 💌"
  heroSubtitle?: string;
}

export const siteConfig: SiteConfig = {
  partnerName: "...",
  yourName: "...",
  anniversaryDate: "...",
  heroTitle: "Aşkım, Sana Bir Sürprizim Var 💌",
};
```

---

## 14. Animations & Libraries Summary

| Purpose | Library |
|---|---|
| General animation/transitions | `framer-motion` |
| Confetti/celebration effects | `canvas-confetti` |
| Animated counting numbers | `react-countup` |
| Audio playback | native `<audio>` or `howler.js` |
| Pan/zoom for star map | `react-zoom-pan-pinch` |
| Astronomy calculations | `astronomy-engine` (if full star map implemented) |
| Icons | `lucide-react` |

---

## 15. Deployment Checklist

1. Initialize Next.js project with TypeScript + Tailwind
2. Set up `/config` files with placeholder content clearly marked `// TODO: fill in real content`
3. Implement landing page with gift-box interaction first (core showpiece)
4. Implement each sub-page in order: counter → love-reasons → bucket list → music → quiz → star map (star map last as it's most technically complex; fallback design acceptable per Section 6.5)
5. Set up Cloudflare R2 bucket, upload placeholder/sample media, configure public access + custom domain
6. Add R2 domain to `next.config.js` `images.remotePatterns`
7. (Optional) Set up Supabase project + table if shared bucket list sync is desired; add env vars
8. Test fully on mobile viewport sizes
9. Deploy to Vercel, set environment variables (`R2_*`, `NEXT_PUBLIC_SUPABASE_*` if used) in Vercel project settings
10. Final content pass: replace all placeholder config content with real photos, messages, songs, dates, quiz questions

---

## 16. Content Placeholders Required From Owner

Before final deployment, the following must be filled in by the site owner across config files:
- Relationship start date + all milestone dates (`counters.ts`)
- All statistics and their target numbers (`counters.ts`)
- Meeting date, time, and location for star map (`starmap.ts`)
- Astrology message text (`starmap.ts`)
- List of shared songs with R2-hosted audio/cover URLs and memory notes (`music.ts`)
- Full list of "reasons I love you" (`love-reasons.ts`)
- Bucket list items (`bucket-list.ts`)
- Quiz questions, answers, and reward messages/GIFs (`quiz.ts`)
- Partner's name, hero greeting text (`site.ts`)
- All photos/videos uploaded to R2 bucket in the structure described in Section 11.1
