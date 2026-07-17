# Data Folder

**Status: partially populated.** The OpenAlex-derived CSVs are pending a fresh API budget (the free tier resets daily; the full pull is scripted and re-runnable, see `lit-scan-audit/` in the planning repo).

## Planned files

- `journal-metrics.csv` (pending): per-journal, per-year metrics for AMJ, AMR, Annals, AMP, AMD, AMLE plus comparators (a top medical journal, a top CS venue, QJE): article counts, citation totals, open-access share, and company-affiliated (practitioner) co-authorship share.
- `field-trends.csv` (pending): publication volume and topic trends for management research, 1995-2025.

## One computed fact already in hand (OpenAlex, retrieved 2026-07-17)

Practitioner co-authorship in AMJ, measured as articles with at least one company-affiliated author:

| Year | AMJ articles | With company co-author |
|------|-------------|------------------------|
| 2000 | 151 | 2 |
| 2005 | 82  | 2 |
| 2010 | 77  | 0 |
| 2015 | 93  | 2 |
| 2020 | 85  | 0 |
| 2024 | 46  | 1 |

Roughly 0-2 percent, flat for a quarter century. For contrast, practitioner co-authorship is routine in medicine (clinicians) and computer science (industry labs). This is the kind of baseline evidence the diagnosis task should extend.
