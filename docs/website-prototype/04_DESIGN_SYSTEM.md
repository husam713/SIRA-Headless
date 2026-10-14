# 04 — Design system: "Qayd" (القيد)

**Task:** SIRA Digital premium website prototype · **Branch:** `feat/digital-enterprise-prototype` · **Source of truth:** `frontend/src/styles/digital-site.css` (tokens at the top) and `frontend/src/styles/digital-fonts.ts`. If this document and the stylesheet disagree, the stylesheet wins and this file is corrected.

---

## 1. The idea

*Qayd* is the Arabic accounting word for a ledger entry. The identity rests on one sentence: **a company's work is documents moving along routes into one ledger.**

- **The route** is the SIRA line — one continuous stroke turning at right angles, inherited from the SIRA mark and from Masar (ADR-039). Here it draws the path a document takes: request → approval → order → receipt → invoice → ledger.
- **The document** — a record with a reference number, a state and an amount — is the unit every demonstration is built from (the hero's stations, the simulator's request, the dashboard's sources).
- **The ledger** is where routes end. Visually: deep-navy "night" chapters where the system is shown running.

**Evolved from Masar, not replaced.** Kept: lapis as the action and route colour, the right-angle line, a repository-owned typed narrative, CSS-first motion. Removed: the canvas routing field, the footer clock, the reading-edge spine, monospace labels, uppercase eyebrows, arrows on buttons, Archivo and Noto Kufi. Reason: the research brief asked for an enterprise-calm site whose credibility comes from demonstrations; Masar's instrument-panel layer competed with them.

## 2. Colour

### 2.1 Base palette

| Token | Value | Role |
|---|---|---|
| `--dg-paper` | `#f5f6f8` | page ground — cool ledger paper |
| `--dg-sheet` | `#ffffff` | raised surfaces, documents |
| `--dg-mist` | `#eaedf3` | alternate section ground |
| `--dg-ink` | `#121a3a` | text — blue-black, the colour of a signature |
| `--dg-ink-2` | `#3f4766` | secondary text |
| `--dg-ink-3` | `#5a6281` | tertiary text, captions |
| `--dg-lapis` | `#1c34d8` | routes, links, primary buttons |
| `--dg-lapis-deep` | `#1426a3` | pressed / hover on lapis |
| `--dg-lapis-soft` | `#e6e9fb` | lapis tint (draft chips, selection fills) |
| `--dg-night` / `-2` / `-deep` | `#0c1233` / `#111a45` / `#080c26` | the "system running" chapters, the discovery brief |
| `--dg-on-night` / `-2` / `-3` | `#eef0fa` / `#b6bddc` / `#959dc4` | text on night |
| `--dg-route-night` | `#8492ff` | lapis lifted for night grounds |

### 2.2 Document states — used only on documents

| State | Marker | Chip text / fill (light) | Chip text / fill (night) |
|---|---|---|---|
| Pending | `--dg-pending #bf7a12` | `#8a5300` / `#fbefd9` | `#f5c77e` / amber 16 % |
| Approved | `--dg-approved #12855b` | `#0d6b49` / `#dcf1e8` | `#86dcb8` / green 16 % |
| Rejected | `--dg-rejected #c2402a` | `#a5321f` / `#fbe3de` | `#f5a291` / red 16 % |
| Draft | — | `#1c34d8` / `#e6e9fb` | `#bcc4ff` / lapis 18 % |

Rule: state colours fill markers and chips; **text** in a state uses the `*-fg` tokens. A test forbids `color: var(--dg-pending|approved|rejected)`. State colours never decorate.

### 2.3 Contrast (computed, WCAG 2.x)

| Pair | Ratio | | Pair | Ratio |
|---|---|---|---|---|
| ink / paper | 15.73 | | on-night / night | 16.07 |
| ink-2 / paper | 8.43 | | on-night-2 / night | 9.83 |
| ink-3 / paper | 5.55 | | on-night-3 / night | 6.87 |
| ink-3 / mist | 5.12 | | route-night / night | 6.55 |
| lapis / paper | 7.67 | | state chips (all) | 5.53–6.88 |
| white / lapis (button) | 8.29 | | pending marker / sheet · paper · fill | 3.50 · 3.23 · 3.07 |

## 3. Tones

A section chooses one of four tones; a tone **re-points the role tokens** (`--dg-surface`, `--dg-text*`, `--dg-rule*`, `--dg-accent`, `--dg-route`, the state chips) and components only read roles. This is why a component works unchanged on paper and on night.

| Class | Ground | Use |
|---|---|---|
| `.dg-tone-paper` | paper | default reading sections |
| `.dg-tone-sheet` | white | sections holding documents, FAQ |
| `.dg-tone-mist` | mist | alternating sections, method roles, group |
| `.dg-tone-night` | night | the system running (simulator, dashboard), the discovery brief |

`.dg-record` (a document) resets to paper colours wherever it lies: *a document is always paper, whatever desk it lies on.*

## 4. Type

**IBM Plex Sans** (Latin, variable) + **IBM Plex Sans Arabic** (Arabic subset, 400/500/600), loaded through `next/font` in `digital-fonts.ts` so the other five tenants never load them. Chosen from six specimen pairings as the only pairing with equal voice and scale in both scripts, and drawn for enterprise software.

| Token | Size | Use |
|---|---|---|
| `--dg-size-display` | clamp 44 → 100 px | home hero |
| `--dg-size-l` | clamp 40 → 76 px | page intros |
| `--dg-size-m` | clamp 28 → 42 px | section titles |
| `--dg-size-s` | 20 px | card and item titles |
| `--dg-size-lede` | clamp 18 → 22 px | intros, ledes |
| `--dg-size-body` | 17 px (Arabic 18) | body |
| `--dg-size-small` | 15 px (Arabic 16) | secondary |
| `--dg-size-label` | 13 px (Arabic 14) | labels — sentence case, never tracked capitals |

- **Two-tone headlines:** a title array's first line in ink, the qualification in muted ink ("From request to ledger, / one system.").
- **Figures:** `lining-nums tabular-nums` wherever numbers align (dashboard, simulator).
- **Arabic:** body leading 1.8, display titles weight 600 at leading 1.3, and *no letter-spacing anywhere* (`letter-spacing: 0 !important` on Arabic text, ADR-034). Latin runs inside Arabic fall through to Plex Sans. Digits are Latin in both editions (test-enforced).

## 5. Layout

| Token | Value |
|---|---|
| `--dg-container` | 86 rem (1376 px) max line of the grid |
| `--dg-gutter` | clamp 20 → 48 px |
| `--dg-section` | clamp 72 → 128 px vertical rhythm |
| `--dg-header` | 72 px |
| `--dg-radius` | 3 px — documents are paper, not cards |

All layout uses **logical properties** (`inline-size`, `margin-inline`, `inset-inline-start`, `padding-block`), so the Arabic edition mirrors without a second stylesheet. Section heads are a two-column grid on wide screens (title + intro / aside link), one column on phones.

## 6. Components

| Component | Where | Notes |
|---|---|---|
| Header + popover menu | `header.tsx` | native `popover` gives open/close, Escape, light-dismiss and focus without script; the menu is a full-screen panel that drops in from the top |
| Language switch | `header.tsx` | links to the same page in the other edition |
| Buttons `.dg-btn` | everywhere | lapis primary, quiet secondary; no arrows |
| Links `.dg-link` | everywhere | lapis, 1 px underline at 0.22 em offset; 44 px targets where they stand alone |
| Section head | `primitives.tsx` | semantic `<header>`, `h2` with id for `aria-labelledby` |
| Route map | `route-map.tsx`, `lib/route-map.ts` | server-rendered SVG; horizontal on wide screens, vertical on phones; geometry computed and tested; mirrored in Arabic |
| Diagrams (problem islands, module map, requirements, flow strip, integration hub) | `diagrams.tsx` | SVG/HTML; pictorial ones carry a text alternative from the narrative (`diagramLabel`, `map.label`), list-like ones are real lists |
| Tabs / explorers | `tabs.tsx` | WAI-ARIA tabs; arrow keys follow reading direction; used for solutions, modules, sectors |
| Approval simulator | `workflow-simulator.tsx` | amount slider + input + presets, category, urgent switch → route from `routeRequest()`; "Send the request" animates steps to a purchase order |
| Dashboard | `dashboard.tsx` | illustrative tiles, sparkline, ageing bars, e-invoice responses; each figure has "Where this comes from" |
| Document `.dg-record` | several | reference number, state chip, amount |
| FAQ | `primitives.tsx` | exclusive `<details name>` accordions |
| Discovery composer | `discovery-composer.tsx` | radio/checkbox chips compose a live brief; form with inline validation, error summary, focus to first error |
| Footer | `footer.tsx` | solutions, pages, SIRA GROUP, legal, provisional note |

## 7. Motion

One orchestrated moment and motion that answers the visitor. Everything else is still.

- **The hero route:** document tokens travel the route map by CSS keyframes. A visually discreet checkbox-based **pause control** stops them without JavaScript (`:has(.dg-motion__input:checked)`, WCAG 2.2.2).
- **Responses:** tab panels, simulator steps (650 ms apart), the switch, accordions and hover states.
- **Scale:** one curve `cubic-bezier(0.2, 0.7, 0.1, 1)`; durations 140 / 240 / 420 ms.
- **Scroll-driven effects** only behind `@supports (animation-timeline: view())` *and* `prefers-reduced-motion: no-preference`. Hover effects only inside `@media (hover: hover)`.
- **Reduced motion:** every animation and transition is off; the route map shows the documents already at their stations. All three rules are asserted by `document-gates.test.ts`.

## 8. Imagery and iconography

No photography, no stock people, no video, no WebGL. Pictures are diagrams of the work itself (routes, modules, systems around a hub) drawn in the same stroke as the SIRA line; three glyphs in `glyphs.tsx` (the interim wordmark glyph, menu, close). Share images still show Masar and must be regenerated (08 §7).

## 9. Voice

Plain, specific, in sentences a manager can act on. Sentence-case labels. No superlatives, no figures about SIRA, no "leading", "trusted by", "world-class". Talk about the buyer's documents and decisions, not about the vendor. Arabic is written as business Arabic, not translated English.

## 10. Do and don't

| Do | Don't |
|---|---|
| Show the system working, labelled "Illustrative" | Invent clients, numbers or screenshots with people |
| Use lapis for routes and actions only | Use lapis as a decorative fill |
| Keep state colours on documents | Use amber/green/red for emphasis |
| Write layout in logical properties | Use `left`/`right`, `margin-left`, `text-align: left` |
| Scope every selector to `html[data-site="digital"]` or `.dg-` | Add a global selector (the test fails) |
| Give standalone links and controls a 44 px target on phones | Rely on inline-text height for a CTA |
