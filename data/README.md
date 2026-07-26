# Data Folder

Real figures from [OpenAlex](https://openalex.org), the open index of ~250M scholarly works. Retrieved 2026-07-25. Scripted and re-runnable: `data-pull/build-dataroom-csvs.py` in the planning repo.

**Read the "How much to trust this" section before you build on any number here.** It is not boilerplate. One of the columns has a documented error rate.

## Files

### `journal-metrics.csv`

Per journal, per year, 1995-2025. Eleven journals: the six AOM journals, two management comparators (SMJ, ASQ), and three out-of-field comparators (NEJM for medicine, CACM for computer science, QJE for economics).

| Column | Meaning |
|---|---|
| `field`, `journal`, `source_id` | journal identity |
| `year`, `works`, `cited_by_count` | volume and citations received |
| `works_no_affiliation` / `works_with_affiliation` | how many articles OpenAlex could and could not resolve to any institution |
| `works_with_<type>_author` | articles with at least one author affiliated to an institution of that type: `company`, `healthcare`, `government`, `nonprofit`, `education` |
| `<type>_share_of_affiliated` | the above divided by `works_with_affiliation`, **not** by `works` |
| `open_access_works`, `open_access_share` | open-access volume and share |

Shares use the affiliated-works denominator because coverage varies enormously by journal: ASQ has no resolvable affiliation on **52%** of its articles, SMJ 23%, CACM 22%, AMJ only 2%. Dividing by raw `works` would have made ASQ look uniquely disconnected when the truth is that its records are poorly parsed.

### `field-trends.csv`

Publication volume and open-access share by research field, 1995-2025, six fields including Business/Management.

### `membership-figures.md`

Public AOM membership figures.

## The comparison to start with

Where the authors of a field's flagship literature work, 2015-2025, as a share of articles with any resolvable affiliation. Articles can count in more than one column.

| Journal | Articles | No affiliation | Company | Healthcare | Education |
|---|---:|---:|---:|---:|---:|
| Communications of the ACM | 3,231 | 21.6% | **20.8%** | 1.8% | 79.8% |
| New England Journal of Medicine | 12,165 | 6.4% | 13.0% | **62.7%** | 66.3% |
| Quarterly Journal of Economics | 545 | 12.3% | 4.6% | 1.0% | 91.2% |
| Academy of Management Discoveries | 381 | 2.6% | 4.0% | 2.2% | 99.5% |
| Strategic Management Journal | 1,472 | 23.4% | 3.8% | 2.8% | 99.6% |
| Administrative Science Quarterly | 548 | **52.4%** | 1.9% | 1.5% | 98.1% |
| Academy of Management Annals | 295 | 4.1% | 1.4% | 1.8% | 99.3% |
| Academy of Management Journal | 814 | 2.3% | 1.3% | 1.1% | 99.4% |
| Academy of Management Learning and Education | 524 | 3.6% | 1.2% | 0.4% | 99.4% |
| Academy of Management Review | 577 | 4.0% | 0.9% | 1.1% | 98.2% |
| Academy of Management Perspectives | 392 | 8.2% | **0.3%** | 0.6% | 98.3% |

Three things worth noticing before you form a hypothesis:

1. **The AOM journals are 98 to 99.6 percent academically affiliated.** That is the most robust number on this page, because it rests on large counts and on the institution type least prone to matching errors. The comparators run 66 to 91 percent.
2. **Each comparator is high for a different reason,** and they are not interchangeable. CACM's 20.8% is industrial research labs (Google, Microsoft, Amazon). NEJM's 62.7% healthcare is practicing clinical institutions. NEJM's 13.0% company is largely industry-sponsored trials. Only the healthcare column plausibly measures *practitioners* in the sense of people who do the work rather than study it. Decide which comparison you actually want before you cite one.
3. **Inside AOM the ordering does not match the journals' missions.** *Discoveries*, the phenomenon-driven journal, leads the AOM set on every non-academic measure. *Perspectives*, the journal positioned toward a broader practice-oriented audience, is last at 0.3%, one article in 392.

In AMJ the series is flat for a quarter century (3 of 157 articles in 2000, 0 of 86 in 2020, 1 of 46 in 2024), so this is structural, not a recent drift.

## How much to trust this

**The `company` column has a measured error rate of roughly 10 percent, and its institution *names* are much worse than that.** OpenAlex maps each author's raw affiliation text to an institution record, and the matcher makes mistakes that are invisible in aggregate. AMJ had only 10 company-flagged articles since 2015, so all 10 were audited by hand against their raw affiliation strings:

| Raw affiliation on the paper | OpenAlex mapped it to |
|---|---|
| `Rutgers University & Warwick Business School` | Rütgers (Germany), a chemicals company |
| `Marsh, Berry, & Co., Inc` | Berry Oncology (China) |
| `Juramy B.V` | Accuray (United States) |
| `Quantic Foundry` | Foundry (United Kingdom) |
| `Boston Consulting Group` | Boston Consulting Group ✓ |

Nine of the ten do have a genuinely non-academic co-author, so the *count* is roughly sound. But four are attached to the wrong company, and one (Rutgers) is a university misread as a firm. **Never group or cite this data by company name.** Treat the counts as approximate and audit any figure small enough to audit.

Other limits:

- **Affiliation is not occupation.** A Google researcher publishing in CACM is a researcher with a corporate employer, not a practicing engineer. A pharmaceutical biostatistician is not a clinician. The honest label for these columns is "non-academic institutional affiliation."
- **It counts affiliation only.** Funding, consulting relationships, site access, and practitioner input to the research are all invisible here. This undercounts collaboration and says nothing about influence in either direction.
- **Employment structure confounds the comparison.** Pharma and industry AI labs employ large research staffs; management consultancies mostly do not publish. Some of the gap is about where researchers are employed rather than how a field relates to practice. Work out how much before you build on it.
- **Small denominators.** AMD, Annals, and AMP publish few articles a year, so single-year shares are noisy. Use multi-year aggregates.
- **Coverage improves over time**, so early years are less complete everywhere.

## A note for the workshop

The error above is real, it is in your data room right now, and Claude will compute a clean confident table from the contaminated column without hesitating. Catching it required knowing what Rutgers is. That is the exercise.
