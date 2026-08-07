# SIN BIN
### Design & Operations Doc

**Status:** Concept → prototype
**Owner:** Brady
**Last updated:** August 2026

---

## 1. The Pitch

A roguelike deckbuilder where you don't play cards in sequence — you **deploy them to a roster grid**. Four forward lines, three D pairs, a goalie. Value comes from *adjacency*, not order.

Your best line gets tired. Your best players demand top minutes. Stacking S-tiers is a losing strategy. **Depth wins.**

Anime-styled cast, community-designed alt outfits, no gacha.

---

## 2. The Name

**SIN BIN** — penalty box slang. Two syllables, hard consonants, reads as stylish-transgressive to the anime audience and as insider vocabulary to hockey fans. Flirts with the fanservice register without being crass, which is exactly the content ceiling.

*Trademark status:* preliminary search shows no existing game by this name. Note: a 1998 FPS franchise called **SiN** exists (Nightdive Studios) — different mark, different genre, but run a proper CIPO/USPTO search before spending on branding.

*Runner-up if needed:* **BLUE PAINT** (goalie crease — colder, more elegant, ages better).

*Possible subtitle:* SIN BIN: OVERTIME / SIN BIN: SUDDEN DEATH — lets the main title carry the anime hook while the subtitle signals mechanics on a store page.

**Naming conventions this follows:** two unrelated nouns fused (Blue Archive, Snowbreak, Arknights); institutional-word-plus-poetic-word (Limbus *Company*). The mundane half is what makes it land.

---

## 3. Why This Is Novel

| Standard deckbuilder | SIN BIN |
|---|---|
| Sequential — order of play is the puzzle | **Spatial** — placement on a grid is the puzzle |
| Best combo gets jammed every turn | **Fatigue** forces rotation; depth is mandatory |
| All-highest-rarity is the win condition | **Ego** makes stacking S-tiers a *failure state* |
| Opponent is a static encounter | **Counter-cards** target the opposing build |
| Takes ~10 hours to teach | Roster grid is legible in one screen |

Genre precedent: deckbuilders don't get reinvented, they get one weird constraint bolted on. Slay the Spire = + roguelike map. Balatro = + poker hands + multiplicative scoring. Inscryption = + sacrifice economy. **SIN BIN = + spatial deployment + fatigue + ego.**

**Design north star:** if it isn't compulsively fun with colored rectangles and text labels, no amount of art saves it.

---

## 4. Core Mechanics

### 4.1 The Roster Grid
- 4 forward lines (3 slots), 3 D pairs (2 slots), G + backup
- Cards are players. Placement is the per-game decision layer.
- Adjacency = chemistry.

### 4.2 Ego & Role Expectation — **THE SIGNATURE MECHANIC**

Every player card carries a **role expectation**: top-six, middle-six, bottom-six, depth.

- Deploy below expectation → accrues **discontent**
- Discontent degrades his output, then poisons linemates' chemistry
- Deploy at or above expectation → stable

**What this does to the economy:**
- Elite cards are no longer strictly better — they're *expensive in deployment slots*, not just acquisition cost
- Depth cards become genuinely valuable; a happy 4th-liner who knows his role outperforms a disgruntled star
- Roster construction becomes a **fit puzzle** — solving for a distribution, not maximizing a number
- Card removal gets real teeth: trading a star because he doesn't fit is a painful, interesting decision
- Acquiring an amazing card mid-run is a **problem**, not just an upgrade

Reference points: the 2019 Raptors (one star, defined roles, a bench that knew what it was). Carolina. That's a *build*, not a stat total.

*Future layer:* leadership/veteran cards that raise the discontent tolerance of adjacent players. "Room glue" guys. Build the base version first.

### 4.3 Chemistry
- Builds with **reps** — a line that plays together gets stronger
- Directly fights against resting them → **core tension**
- Booster cards grant or amplify chemistry
- Lost when lines are broken up
- Open question: does it decay passively, or only reset on separation?

### 4.4 Fatigue
- Accumulates by ice time
- Overplaying line 1 in round 1 costs you in round 3
- Makes the 4th line matter
- Rest is a spendable resource between games

### 4.5 Goalie — Stamina Modifier, Not a Card
- Goalie is a **percentage reducer on fatigue accrual**, not a deployment slot
- True to the sport: an elite goalie masks a tired, thin roster
- A run-long dial rather than a per-game decision — keeps the deployment puzzle uncluttered

**Tandem depth (cheap, recursive):** the starter has his *own* fatigue budget. Riding your 1G every game degrades him. The resource that manages fatigue is itself fatigue-limited.

### 4.6 Counter / Matchup Cards
- Debuff the *opponent's* build (e.g. "opposing top line loses chemistry this game")
- Makes scouting the upcoming opponent a real decision
- No equivalent in Slay the Spire or Balatro — this is differentiation

### 4.7 Injuries
Forced deck mutation. Losing your 1C mid-run is a "you must adapt" moment with real weight.

### 4.8 Special Teams — Deferred
PP1/PP2/PK1/PK2 as a separate deployment layer is a strong expansion, but ego + fatigue + chemistry + counters is already a lot of interacting systems for v1.

**Build the deployment data structure so it can slot in without a rewrite.** Natural home for specialist cards that don't justify a roster spot at even strength.

---

## 5. Run Structure — Currency Wars Model

Adopting the Honkai *Currency Wars* shape: assemble a roster, run it through escalating stages, boss at the end. Short mode and long mode off the same architecture.

- **Short run:** ~25 min
- **Long run:** ~60 min

Three escalating rounds solves the length problem and kills the exploit concern with multi-season structures — you're escalating within one arc, so power accumulation is intentional rather than a loophole.

| Round | Fiction | What changes |
|---|---|---|
| 1 | Regular season | Assemble roster, establish chemistry, learn what you have |
| 2 | Playoff push | Fatigue bites, injuries appear, trade deadline as forced-decision node |
| 3 | Playoffs | Best-of series, opponents scout you back, no rest between games |
| **Boss** | The Final | Procedurally generated opposing team |

### Procedural Bosses — Counter-Archetypes, Not Stat Blocks
The boss should be built to **punish whatever you overinvested in**. Stacked forward chemistry? You draw a shutdown D-corps team. That's what makes a run feel like it's responding to you rather than rolling dice at you.

### Between-Game Economy
Where the deckbuilding happens:
- **Scout** — acquire players
- **Train** — upgrade a card
- **Rest** — clear fatigue
- **Trade** — remove a card, gain a better one

Card removal is the most important currency in deckbuilders; hockey gives it perfect fiction.

Ascension-style difficulty tiers framed as "conference strength."

---

## 6. Collection vs. Roguelike — Resolved

These pull in opposite directions. Collection wants permanence; roguelikes want loss.

**Run = roguelike. Meta = collection.**
- Permanently unlock characters into the pool by completing challenges
- Each run you draft from that pool and lose the roster at the end
- Same structure as Slay the Spire / Monster Train
- **Alt outfits are cosmetic-on-a-unit, never power creep** → keeps SIN BIN entirely out of pay-to-win territory

---

## 7. Art & Content Direction

### 7.1 The Content Line
**Posture: build two steps inside the line, not at it.** The line moves — Mastercard has tightened twice in recent years, Steam has retroactively purged compliant games. Built at the edge, a rule change kills you. Built inside it, a rule change is a Tuesday.

**Acceptable:** swimwear, lingerie-as-outfit, high slit, underboob/sideboob, cleavage, suggestive poses, blush, implied situations.

**Hard wall — never:** nipples, genitals, visible-through-fabric detail, sexual acts.

### 7.2 Apparent Age
The operative test everywhere (app stores, processors, criminal statute in CA/US/UK/AU) is **apparent age from the depiction itself**. Lore is not a defense.

Small frames and small chests are fine — pair them with adult signifiers the *art* carries: facial structure and proportion, height relative to other characters, adult context and dress.

**Rule of thumb: if a piece needs the wiki to read as adult, it doesn't read as adult.**

### 7.3 Female Gaze — Doing It Properly
Not a matter of gender percentages. The usual failure is male characters drawn *by and for* the same gaze — muscle as power fantasy, not as object of desire.

What actually works:
- Faces and hands get the rendering attention, not just the body
- Character has interiority; appears to *want* something from the viewer — reciprocity, not availability
- Lean/elegant builds as often as hypertrophied ones
- Clothing that's well-tailored and expensive-looking rather than absent

Female-coded audiences monetize *harder*, but on voice acting, story, and character routes — and are far more sensitive to a character being handled disrespectfully. **One well-realized male character with real writing beats six as a quota fill.**

Target roster mix (flexible): ~60% female, ~25% male, remainder trans and non-gendered characters.

### 7.4 Art Pipeline
| Phase | Art |
|---|---|
| Concept | AI generation — **Brady's eyes only.** Moodboarding. Never public, never shipped. |
| Prototype | Colored rectangles + text labels (Balatro method) |
| Vertical slice | 3–5 commissioned pieces from one artist → first collaborator and credibility signal |
| Public release | **Human art only, always** |

Sourcing: Skeb (Japanese side, exactly this idiom), VGen. ~$400–800/illustration.
Live2D deferred — $500–1,500/character rigging. High impact, but not until audience is proven.

---

## 8. Community Content Engine

### 8.1 The Loop
1. Four characters announced for the quarter, **one quarter in advance**
2. Artists download a base template sized to each character's height/proportions
3. Submission window → moderation → public vote
4. Winner ships as the next alt outfit

**Cadence: quarterly.** Monthly is live-ops and will break a solo dev with a full-time job. You can always increase cadence; decreasing it reads as abandonment.

### 8.2 Scope Control
- **Outfits only, never characters.** Community-designed characters create tangled ownership and royalty claims on every future appearance.
- Cap submissions per quarter (30–50) or moderation drowns you.

### 8.3 Legal — All Non-Negotiable
- **Cash bounty from contest one (~$100 min).** "A free copy of the character" is not valid consideration if the winner already has the game — an unenforceable assignment means commercially exploiting art you don't own.
- **IP assignment**, or perpetual/irrevocable/commercial/sublicensable license
- **Explicit moral rights waiver.** Under Canada's Copyright Act moral rights cannot be assigned, only waived. They include the right to object to modification — without this, a contributor can object when you recolor or crop their outfit into a card frame.
- **18+ minimum to submit**, enforced not just checkboxed
- **Template-derivative clause** — state explicitly that submissions are derivative works of Brady-owned base art. Significantly strengthens the ownership position.
- **Human moderation of every submission** before public voting. Expect: characters depicted as minors, non-consensual scenarios, traced/stolen art. Reverse-image check for theft.

### 8.4 Reddit's Role
- **Yes:** community hub, discussion, hype, mod team. It's where this audience lives.
- **No:** submission intake. Subreddits in this space get banned with no warning and no appeal — never make it the pipeline the content model depends on.
- Template downloads and submissions run through the SIN BIN site, with the signed agreement **gated in front of the download**.

### 8.5 Ethos
> "The game is live as long as the fans are alive."

- Bounty pot grows as revenue grows
- Contributors get first refusal on paid contracts later — **make the pipeline a ladder, not a bait-and-switch**
- Failure mode to avoid: free contributors feeling replaced by paid professionals

---

## 9. Technical

- Next.js 14 + TypeScript + Tailwind on Vercel
- Card/effect system as composable functions over data, **not** hardcoded switch statements — decides whether card #200 takes 5 minutes or 5 hours
- Zustand or reducer for run state
- **Seeded RNG** — reproducible runs, actionable bug reports
- Framer Motion for card animation juice
- Postgres (Supabase/Neon) for accounts, unlock persistence, contest voting integrity
- localStorage-only for the earliest prototype = zero backend

### Auth
**Free accounts, single content tier.** A paid tier unlocking spicier art *is* an adult product — it triggers age verification law (UK Online Safety Act, several US states), Stripe declines, and app store rejection of the whole app, plus the paywall reputation hit. Worst of both worlds.

Auth exists for: progression sync, contest voting integrity, 18+ attestation before any money moves.

---

## 10. Business & Legal

- **Incorporate** before meaningful revenue — liability shield is not theoretical in this content category
- GST/HST registration at $30k
- Contest prizes: T4A reporting for Canadians; withholding implications for US winners. **Accountant before contest one, not after.**
- Trademark search on SIN BIN and character names — cheap now, rebrand at 10k users is not
- Stripe's AUP excludes sexually explicit material — staying inside the SFW line keeps you at 2.9% instead of 8–12% specialist processors
- Patreon/Ko-fi are the natural funding path; their rules also permit suggestive and restrict explicit, reinforcing the same ceiling

### Distribution
- **itch.io** — permissive, free release, audience building
- **Steam** — paid release with more content, primary revenue
- **Web** — demo/marketing funnel
- **App stores** — only if it passes Apple review, the strictest bar

---

## 11. Coverage & Discoverability

Game8 and Prydwen cover games with **build complexity** — tier lists exist because optimization is non-obvious. Line chemistry, ego management, and matchup counters generate exactly that content naturally.

→ **Lean into mechanical depth over roster breadth. Depth is the marketing.**

Releases with anticipation and a drumbeat.

---

## 12. Reality Checks

- **This is not passive income.** Quarterly contests, moderation, community management, balance patches, support. A second job with lumpy revenue, stacked on a full-time role and the hockey app.
- **Contests need a community to already exist.** Sequencing: mechanics prototype → art style locked (3–5 characters) → free itch release → community forms → *then* contests.
- Fun must be proven with rectangles in front of ~20 strangers before a single illustration is commissioned.

---

## 13. Open Questions

- Does chemistry decay passively, or only reset on separation?
- Do counter-cards get played pre-game (scouting phase) or mid-game?
- Is discontent recoverable, or permanent for the run?
- How many characters in the launch pool? (15–25 was the earlier estimate)
- Does the goalie tandem get its own mini-deployment decision, or is it automatic?

---

## 14. Next Action

**Build the rectangle prototype.** Roster grid, chemistry adjacency, fatigue accrual, ego/role system, three rounds + boss. No art. Find out in one evening whether the loop has teeth.

The ego mechanic is the one that most needs to be *felt* rather than reasoned about.
