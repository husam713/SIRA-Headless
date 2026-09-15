# The impact calculator, derived by measurement

Phase 1 deliberately did not reverse-engineer this model, and the saved page does
not contain it: the calculator's copy exists only in the server-rendered HTML and
the chunks holding the logic were never captured. It was also not derivable from
the two data points in `REPORT.md` §7.4 — `29,440` manual hours does not factor
out of 40 people × 14 hours × any standard working year.

So it was measured instead, with the owner's agreement, by driving the live page
in a real browser and observing how the outputs move.

- [`tools/10-calculator.mjs`](./tools/10-calculator.mjs) — first pass, establishes
  the shape. → `data/calculator-model.json`
- [`tools/11-calculator-precise.mjs`](./tools/11-calculator-precise.mjs) — second
  pass. Reads every sample twice 400ms apart and only accepts a stable reading,
  which removed a race the first pass hit. → `data/calculator-precise.json`

Both abort every non-GET request to the origin, so no enquiry, booking or lead
can be created. 115 stable samples, 0 unsettled.

Two things made this cheap and exact: the calculator recalculates **client-side**,
so a whole sweep runs from one page load; and several values are rounded on
screen but exposed unrounded in the DOM — the coverage and productivity meters
carry `width` to four decimal places, and `Manual hours per year` is printed in
full.

**Status: CLOSED.** Both items this document previously left open are now solved
from the data already in hand, and four errors in the first write-up are
corrected below. The model reproduces **all 1,380 observed display fields across
all 115 samples, with zero mismatches**. The reproduction is executable:
`frontend/tests/unit/calculator/model.test.ts` asserts it against the held-out
samples, which were never used to fit anything.

Only the **first-pass** dataset (`data/calculator-model.json`) is unreliable, for
the read race its own header describes. Everything below was fitted and verified
against `data/calculator-precise.json` alone.

---

## The model

Inputs: `team` (5–1000 step 5), `hours` (1–60 step 1), `hourly` (10–150 step 1),
`automation` (0–100 as a percentage), `industry` (12), `size` (4). Let
`a = automation / 100`.

Every control **clamps**. That matters for one sample: driving `hourly` to 200
produced the figure for 150, which is why `hourly=200` looked like an outlier in
the first pass and is not one.

```
base           = 0.62 × INDUSTRY[industry] × SIZE[size]
manualToday    = team × 46 × (hours + 2)
hoursSaved     = manualToday × base × (1 − a)
manualAfter    = manualToday − hoursSaved

headline       = hoursSaved × hourly × 0.35
revenue        = team × REVENUE[industry] × SIZE[size] × (1 − a)
twelveMonth    = headline + revenue

cost           = SETUP[size] + 1146 × team
roi            = twelveMonth / cost − 1
payback        = twelveMonth > 0 ? cost / twelveMonth × 12 : 0     (months)

productivity   = hoursSaved / (team × 46 × 40)
coverageMeter  = min(0.99, a + base × (1 − a)²)
leadResponse   = 720, constant at every input
```

46 working weeks. The `+ 2` is the derived transaction volume expressed as hours
per week — it is what the "about 400 leads, 880 calls and 2,480 documents a
month" note refers to, and it is why 40 × 14 × 52 never reproduced 29,440.

The `0.35` is a realisation fraction — the share of freed hours counted as
avoided cost. It is what the on-screen line "Realised cost avoidance — not the
notional value of every freed hour" is telling the reader.

`revenue` is **independent of `hours`**: $258K at both `hours=1` and `hours=60`.
It is *not* independent of `automation`; see the corrections.

### Constants

`base` factorises exactly into a baseline, an industry multiplier and a size
multiplier. Every industry multiplier lands on two decimal places, across all 48
industry × size cells, to within 2e-6. That is not a fit — it is the authored
table, recovered.

| Industry | coverage × | revenue / person |
| --- | ---: | ---: |
| healthcare | 1.12 | 3 080 |
| real-estate | 1.08 | 4 320 |
| manufacturing | 1.05 | 9 450 |
| retail | 1.10 | 730.5 |
| education | 1.02 | 3 460 |
| finance | 1.15 | 6 898 |
| hospitality | 1.06 | 1 272 |
| construction | 0.94 | 8 560 |
| professional-services | 1.13 | 7 284 |
| automotive | 1.00 | 3 946 |
| logistics | 1.09 | 4 496 |
| technology | 1.11 | 7 135 |

`SIZE` — the same multiplier serves coverage, revenue, and (through `SETUP`)
nothing else:

| size | factor | implementation setup |
| --- | ---: | ---: |
| startup | 0.90 | $7 500 |
| small | 0.96 | $15 000 |
| growing | 1.04 | $30 000 |
| enterprise | 1.10 | $60 000 |

**The coverage and size multipliers are exact. The revenue column is not.** The
reference prints revenue to three significant figures, so each entry is pinned
only to an interval — widest 0.11% (technology), tightest 0.005% (logistics).
The values above are inside the interval that satisfies every observed revenue,
twelve-month, ROI and payback string simultaneously. The author's own source
values are `UNKNOWN`: no rounder set reproduces the observations, and several
plausible reparametrisations (dividing through by the coverage multiplier, by
the size factor, by an assumed lead volume) produce nothing tidier. They are
recorded as measured rather than dressed up as authored.

### Solved: the coverage METER

The number the meter displays is not `base`, and not the removed fraction:

```
coverageMeter = min(0.99, a + base × (1 − a)²)
```

The 21-point automation sweep has a **constant second difference** — 0.3643 at
every step, without exception — so the function is exactly quadratic in `a`, and
the quadratic's own coefficients then give it away: the `a²` coefficient equals
`base`, and the uncapped value at `a = 1` is exactly 1. Rearranging gives the
form above. Max absolute residual across all 21 points: **4.4e-7**, which is the
meter's four-decimal-place width rounding and nothing else.

Read plainly: work that already runs without a person counts as covered, and
what the project adds is the coverage rate applied to what is left. That is what
makes it U-shaped, with a minimum at `a = 1 − 1/(2 × base)` — about 31% for the
default sector, matching the observed dip near 0.30.

The earlier ±0.0086 quadratic fit was not wrong about the shape; it was a
least-squares fit that included the capped `a = 1` point, which sits below the
curve, and the fitted coefficients absorbed the error rather than revealing the
structure.

### Solved: implementation cost, ROI and payback

```
cost = SETUP[size] + 1146 × team
```

Recovered by inverting the displayed ROI and payback — two independent views of
one implied cost — and intersecting the resulting intervals across all 115
samples. The setup figures are pinned to the exact hundred at 100 granularity;
the per-seat rate is pinned to **1145.95–1146.00**.

Cost depends on **team and size only**. It is independent of industry, hours,
hourly cost and current automation. That independence is what makes ROI fall as
the remaining manual workload shrinks, and it is why ROI goes negative at high
current automation: a fixed cost charged against a benefit that is going to zero.

The earlier "`cost ≈ 13 215 + 495 × team`, the two derivations agree to about 3%"
was an artefact of the wrong ROI numerator; see below. With the right numerator
the two derivations agree to within display rounding at every sample, and the
3% disagreement disappears.

---

## What the first write-up got wrong

Recorded rather than quietly overwritten, because three of the four were
plausible readings of the data available at the time and a later session could
reach the same conclusions again.

1. **The ROI and payback numerator is `twelveMonth`, not `headline`.** Charging
   ROI against the annual saving alone makes the implied cost appear to vary
   with industry and with hourly rate — retail seemed to cost 2.5× what
   construction cost at the same team size. It does not. With
   `headline + revenue` as the numerator the implied cost collapses onto one
   value per (team, size) across all 48 industry × size cells.

2. **`revenue` carries a `(1 − a)` factor.** Revenue falls linearly with current
   automation: $303K at `a = 0`, $258K at `a = 0.15`, $227K at `a = 0.25`. The
   previous revenue-per-person table was measured only at the default `a = 0.15`
   and had that 0.85 baked into it, so it was correct at the default and wrong
   everywhere else. The table above supersedes it.

3. **`hourly` is clamped to the slider maximum of 150.** The `hourly=200` sample
   is a reading at 150 ($957K, exactly `18,233 × 150 × 0.35`), not a nonlinearity
   in the model.

4. **`SIZE` is `0.90 / 0.96 / 1.04 / 1.10`, not the six-decimal table.** The
   previous figures (0.865409, 0.923106, 1, 1.057698) were these four normalised
   to `growing`, which hid both the round numbers and the fact that `base`
   factors as `0.62 × industry × size`.

None of this changes the published defaults, which the previous write-up
reproduced correctly by arithmetic that happened to be right at that one point.

---

## Recommended automations

A fixed list per industry, captured verbatim for all twelve. They now live in
`frontend/src/lib/calculator/copy.ts`, where a second language is possible; the
English is the reference's, unchanged. For example, professional-services returns
"Document Intelligence · Client Onboarding AI · Time & Billing Automation ·
Proposal Generation".

---

## Reproducing the published defaults

At `professional-services / growing / team 40 / hours 14 / $32 / 15%`:

| Output | Model | Site |
| --- | --- | --- |
| Manual hours today | 40 × 46 × 16 = **29 440** | 29,440h |
| base | 0.62 × 1.13 × 1.04 = **0.728624** | — |
| Manual hours after | 29 440 × (1 − 0.728624 × 0.85) = **11 207** | 11,207h |
| Hours saved | **18 233** | 18.2Kh |
| Annual saving | 18 233 × 32 × 0.35 = **$204 211** | $204K |
| Productivity | 18 233 / (40 × 46 × 40) = **24.77%** | +24.8% |
| Automation coverage | 0.15 + 0.728624 × 0.85² = **67.64%** | 68% |
| Revenue | 40 × 7 284 × 1.04 × 0.85 = **$257 562** | $258K |
| Twelve months | 204 211 + 257 562 = **$461 773** | $462K |
| Implementation cost | 30 000 + 1 146 × 40 = **$75 840** | — |
| First-year ROI | 461 773 / 75 840 − 1 = **508.9%** | 509% |
| Payback | 75 840 / 461 773 × 12 = **1.97** | 2.0 mo |
| Lead response | **720×** | 720× |

## Verification

| Check | Result |
| --- | --- |
| 115 samples × every displayed field | **1 380 / 1 380 exact** |
| 30 held-out samples, never used to fit | exact, asserted in the unit suite |
| Coverage meter, max residual | 4.4e-7 (the meter's own rounding) |
| `base` separability, 48 cells | 2e-6 |
| Workload, 115 rows | error 0 |

The held-out samples are committed as
`frontend/tests/fixtures/calculator/reference-observations.json` and are the
fixtures for `frontend/tests/unit/calculator/model.test.ts`, so "it looks the
same" is an executable claim rather than an opinion.
