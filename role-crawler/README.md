# Role Crawler

An Apps Script crawler that aggregates open positions from ~43 EdTech-aligned organizations across 18 distinct ATS platforms into a single Google Sheet, with three-tier department classification, location filtering, lifecycle status tracking, and persistent state for resumable execution.

## What It Does

The crawler reads from the public job-board APIs of platforms like Greenhouse, Lever, Workday, SmartRecruiters, USAJOBS, UltiPro, Paycom, Oracle Recruiting Cloud, and others. It normalizes the heterogeneous response shapes into a consistent 14-column schema, applies filters (junk titles, age cutoff, non-US locations, excluded department tiers), classifies each surviving role as Core, Peripheral, or Excluded, deduplicates against existing rows, locks rows once they have moved beyond the In-Queue state, and writes everything to a single Google Sheet with conditional formatting on the status column.

## ATS Coverage

| Platform | Method | Organizations |
| --- | --- | --- |
| Greenhouse | REST | ITHAKA, Wikimedia, Khan Academy, BrainPOP, NoRedInk, Mozilla, Newsela, Coursera, 2U/edX |
| Lever | REST | CommonLit, Age of Learning |
| Workday | CXS POST | Curriculum Associates, PBS, OCLC, arXiv (Cornell), Amplify |
| SmartRecruiters | REST | Education Development Center |
| RSS / Pinpoint | XML | Smithsonian Institution |
| ADP Workforce Now | REST | Internet Archive, CAST |
| Workable | REST v3 | Zearn, Encyclopaedia Britannica, Branching Minds |
| UltiPro / UKG | CSRF + POST | WestEd, Oxford University Press, Macmillan Learning |
| AMNH Atom | XML | American Museum of Natural History |
| Breezy.hr | JSON | DPLA, Creative Commons |
| USAJOBS | REST (auth) | Library of Congress, NARA |
| Paylocity | HTML scrape | TERC |
| JazzHR | HTML scrape | Illustrative Mathematics |
| Rippling | __NEXT_DATA__ | Digital Promise |
| Jibe Apply | REST | McGraw Hill |
| SuccessFactors | HTML scrape | HMH |
| Oracle Recruiting Cloud | REST | Pearson |
| Paycom (Mantle) | JWT + POST | Carnegie Learning, ISTE+ASCD |
| Manual review | Placeholder rows | McREL, Wiki Education, HathiTrust, NWP, Project Gutenberg |

## Repository Layout

```
.
├── README.md
├── appsscript.json        Apps Script project manifest (clasp-compatible)
├── docs/
│   ├── ARCHITECTURE.md    Pipeline, module responsibilities, extension guide
│   ├── DEPLOYMENT.md      Step-by-step setup
│   └── CHANGELOG.md       Version history
└── src/
    ├── Config.gs          Module-level constants (schema, status, tiers, entities)
    ├── State.gs           Mutable globals + state persistence functions
    ├── EntryPoints.gs     Public crawl-control functions + batch executor
    ├── Fetchers.gs        18 platform-specific fetchers + 2 date helpers
    ├── Filters.gs         Junk / age / non-US filters + dept classifier + date utilities
    ├── Pipeline.gs        Write orchestrator, manual-review writer, dedup helpers
    ├── Maintenance.gs     Worker functions, menu-bound wrappers, cleanup, setup
    ├── Sheet.gs           Sheet helpers + status column installation
    ├── Logging.gs         Log function + log viewer
    └── Menu.gs            Custom menu builder (onOpen trigger)
```

## Quick Start

See `docs/DEPLOYMENT.md` for full instructions. The short version:

1. Create a new Google Sheet.
2. Extensions → Apps Script.
3. Create 10 script files matching the names in `src/`, paste contents.
4. Reload the sheet.
5. Crawler → Initialize Sheet.
6. Crawler → Crawl Control → Start.

A first crawl takes about 3-5 minutes. If it exceeds the 5-minute Apps Script execution limit, it pauses automatically; Crawler → Crawl Control → Resume continues from the last completed organization.

## Configuration

Most edits will happen in `src/Config.gs`:

- **`CC.MAX_AGE_DAYS`** (default 30): postings older than this are dropped during crawls.
- **`CC.STALE_QUEUE_DAYS`** (default 30): In-Queue rows older than this are deleted at end of each crawl.
- **`CC_ENTITIES`**: the list of organizations and their ATS configuration.
- **`DEPT_TIER_1` / `DEPT_TIER_2` / `DEPT_TIER_3`**: keyword lists for the Core / Peripheral / Excluded classifier.
- **`ccIsNonUS` keyword list** (in `src/Filters.gs`): countries, regions, and cities to exclude.
- **`USAJOBS_EMAIL` / `USAJOBS_KEY`**: read-only public-data credentials for the federal jobs API (free from data.usajobs.gov).

## License

This is personal tooling. Adapt freely. No warranty.
