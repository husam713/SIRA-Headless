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

---

## The model

Inputs: `team` (5–1000 step 5), `hours` (1–60 step 1), `hourly`, `automation`
(0–100 as a percentage), `industry` (12), `size` (4).

### Confirmed exactly

**Workload.** Max absolute error **0** across all 115 rows:

```
manualHoursToday = team × 46 × (hours + 2)
```

46 working weeks. The `+ 2` is the derived transaction volume expressed as hours
per week — it is what the "about 400 leads, 880 calls and 2,480 documents a
month" note refers to, and it is why 40 × 14 × 52 never reproduced 29,440.

**Coverage and the remaining workload.** The automation sweep is perfectly linear
in `a`, which pins this exactly:

```
base        = INDUSTRY_COVERAGE[industry] × SIZE_FACTOR[size]
manualAfter = manualHoursToday × (1 − base × (1 − automation))
hoursSaved  = manualHoursToday − manualAfter
```

`base` is separable into an industry term and a size term to within **0.0068%**
across all 48 industry × size cells — that is measurement noise, not structure.

**Money and productivity.**

```
headline     = hoursSaved × hourly × 0.35
productivity = hoursSaved / (team × 46 × 40)        max abs error 0.000015
revenue      = team × INDUSTRY_REVENUE[industry] × SIZE_FACTOR[size]
twelveMonth  = headline + revenue                   agrees within display rounding
leadResponse = 720, constant at every input
```

The `0.35` is a realisation fraction — the share of freed hours counted as
avoided cost. It is what the on-screen line "Realised cost avoidance — not the
notional value of every freed hour" is telling the reader.

`revenue` is **independent of `hours`**: $258K at both `hours=1` and `hours=60`.

### Constants

| Industry | coverage | revenue / person |
| --- | ---: | ---: |
| healthcare | 0.722187 | 2 725 |
| real-estate | 0.696371 | 3 825 |
| manufacturing | 0.677030 | 8 350 |
| retail | 0.709279 | 645 |
| education | 0.657689 | 3 050 |
| finance | 0.741528 | 6 100 |
| hospitality | 0.683504 | 1 125 |
| construction | 0.606098 | 7 575 |
| professional-services | 0.728621 | 6 450 |
| automotive | 0.644781 | 3 500 |
| logistics | 0.702845 | 3 975 |
| technology | 0.715713 | 6 300 |

`SIZE_FACTOR` — the same multiplier serves both coverage and revenue:

| size | factor |
| --- | ---: |
| startup | 0.865409 |
| small | 0.923106 |
| growing | 1.000000 |
| enterprise | 1.057698 |

### Implementation cost, ROI and payback

ROI and payback are two views of one implied cost, and both reconcile:

```
roi     = headline / cost − 1
payback = cost / headline × 12          (months)
```

Solving for `cost` across the team sweep gives a straight line,
`cost ≈ 13 215 + 495 × team`. The two derivations agree to about 3% — consistent
with both `roi` and `payback` being displayed to three significant figures — so
the intercept and slope want one more sweep at fixed team size across industries
before being treated as final. **This is the one constant still worth refining.**

### Still open: the coverage METER

The number the meter displays is not `base`, and not the removed fraction. It is
U-shaped in `automation`: 0.7286 at 0, falling to a minimum of 0.6570 around
a = 0.30, then rising to a capped 0.99 at a = 1.

A quadratic reproduces it to ±0.0086, which is close but not exact:

```
coverage(a) ≈ 0.728624 − 0.447248·a + 0.708624·a²
```

At `a = 0` it is exactly `base`, and it is capped at 0.99. All 21 sweep points
are recorded in `data/calculator-precise.json` under labels `automation=0` …
`automation=100`, so fitting this properly is a short job with the data already
in hand — it does not need another capture.

It affects one meter's width and one rounded percentage. Everything the money
figures depend on is exact.

### Recommended automations

A fixed list per industry, captured verbatim for all twelve in
`data/calculator-model.json` (see the `industry=*` samples). For example,
professional-services returns "Document Intelligence · Client Onboarding AI ·
Time & Billing Automation · Proposal Generation".

---

## Reproducing the published defaults

At `professional-services / growing / team 40 / hours 14 / $32 / 15%`:

| Output | Model | Site |
| --- | --- | --- |
| Manual hours today | 40 × 46 × 16 = **29 440** | 29,440h |
| base | 0.728621 × 1 = **0.728621** | — |
| Manual hours after | 29 440 × (1 − 0.728621 × 0.85) = **11 207** | 11,207h |
| Hours saved | **18 233** | 18.2Kh |
| Annual saving | 18 233 × 32 × 0.35 = **$204 210** | $204K |
| Productivity | 18 233 / (40 × 46 × 40) = **24.77%** | +24.8% |
| Revenue | 40 × 6 450 = **$258 000** | $258K |
| Twelve months | 204 210 + 258 000 = **$462 210** | $462K |
| Lead response | **720×** | 720× |
