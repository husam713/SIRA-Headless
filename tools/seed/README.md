# Placeholder editorial seed

**This directory contains invented content. None of it is a SIRA GROUP
announcement.**

`newsroom-seed.json` is the payload written into WordPress by
`tools/seed-newsroom-content.mjs` under ADR-030, so the Newsroom can be
reviewed against realistic editorial before SIRA's own content is authored.

Every record it creates carries post meta `_sira_seed=1`. That marker is the
only supported way to find and remove them:

```bash
# list
ssh sira 'cd ~/domains/siratrgroup.com/public_html && for u in $(wp site list --field=url); do wp post list --post_type=sira_news,sira_insight,sira_article,sira_press_release --meta_key=_sira_seed --meta_value=1 --fields=ID,post_title --url=$u; done'

# remove
node tools/seed-newsroom-content.mjs --remove
```

`node tools/verify-no-seed-content.mjs` is the launch gate. It fails while any
seeded record still exists, and it also fails while `blog_public` is `0`, so the
real site cannot be launched un-indexed.

## Rewrite, do not polish

These entries invent specifics about relationships that appear in SIRA's own
design references. They are fabrications about **named third parties**, not just
about SIRA, and an editor must replace the claims rather than improve the prose:

| Entry | Invented claim |
| --- | --- |
| SIRA GROUP Signs Strategic Partnership with OVAN Group | that a joint venture exists, and that it covers "three districts" |
| SIRA GROUP Completes Its Investment in Rosina Diagnostic Center | that the transaction closed, took "nine months", and produced a majority position |
| Rosina Diagnostic Center Adds a PET-CT Molecular Imaging Wing | that the wing exists and is a regional first for published turnaround times |
| SIRA Prime Tops Out Four Weeks Ahead of Schedule | that structural completion happened, and the schedule variance |
| SIRA Consulting Appointed to Advise on a Cross-Border Healthcare Platform | that the mandate exists and its scope |
| Consulting Practice Expands Its Market-Entry Team | the four senior appointments |
| Appointment of a Group Chief Investment Officer | that the appointment happened |

Everything else invents general market commentary attributed to SIRA, which is
opinion rather than a claim about a third party. It still needs an editor, but
it carries less risk.
