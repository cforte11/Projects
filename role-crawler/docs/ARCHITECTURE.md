# Architecture

## Pipeline

A single crawl executes the following flow:

```
startCrawl()
    │
    ▼
_executeBatch_cc()
    │
    ├── For each entity in CC_ENTITIES (~43 orgs):
    │     │
    │     ├── Dispatch to the appropriate fetcher by platform
    │     │     (greenhouse | lever | workday | smartrecruiters | rss |
    │     │      adp | workable | ultipro | amnh | breezy | usajobs |
    │     │      paylocity | jazzhr | rippling | jibe | successfactors |
    │     │      oracle_orc | paycom | manual)
    │     │
    │     ├── Fetcher returns array of normalized job objects:
    │     │     { title, location, workType, dept, date, salary, url, notes }
    │     │
    │     └── ccWriteJobs(sheet, org, platform, jobs)
    │             │
    │             ├── ccNormalizeDate on every job.date
    │             ├── ccIsJunk filter         (interns, volunteers, contractors)
    │             ├── ccIsTooOld filter       (>30 days old)
    │             ├── ccIsNonUS filter        (international locations)
    │             ├── classifyDept_           (Tier 3 dropped, Tier 1/2 labeled)
    │             ├── ccLoadLockedUrls        (URLs in non-Queue status)
    │             ├── ccLoadExistingKeys      (URL + Org|Title|Date dedup)
    │             └── Append surviving rows with App. Status = In-Queue
    │
    ├── If execution exceeds 5 minutes, pause + persist state for Resume.
    │
    └── Finalization passes (run once after all entities complete):
          ├── ccRemoveBlankRows
          ├── ccDeduplicateRows
          ├── ccUpdateDaysOpen
          ├── ccDeleteStaleQueueRows
          ├── ccApplyFormatting
          ├── ccEnsureStatusColumn
          └── ccAutoSortByDatePosted
```

## Module responsibilities

| File | Owns | Depends on |
| --- | --- | --- |
| `Config.gs` | Schema, status enum, tier keyword lists, entity registry, credentials | (nothing) |
| `State.gs` | Mutable globals, state persistence | `Config.gs` |
| `EntryPoints.gs` | Public crawl-control functions, batch executor | `State.gs`, `Fetchers.gs`, `Pipeline.gs`, `Sheet.gs`, `Maintenance.gs`, `Logging.gs` |
| `Fetchers.gs` | 18 ATS-specific fetcher functions, 2 inline date helpers | `Config.gs`, `State.gs`, `Filters.gs` (`ccNormalizeDate`), `Logging.gs` |
| `Filters.gs` | Junk filter, age filter, non-US filter, dept classifier, date utilities | `Config.gs`, `State.gs` |
| `Pipeline.gs` | Write orchestrator, manual-review writer, dedup helpers | `Config.gs`, `State.gs`, `Filters.gs`, `Logging.gs` |
| `Maintenance.gs` | Worker functions, menu-bound wrappers, v4.1 cleanup, initial setup | `Config.gs`, `State.gs`, `Sheet.gs`, `Filters.gs`, `Logging.gs` |
| `Sheet.gs` | Sheet helpers, status column installation, conditional formatting | `Config.gs`, `Logging.gs` |
| `Logging.gs` | Log function, log viewer | `Config.gs` |
| `Menu.gs` | Custom menu builder (onOpen trigger) | (everything by string-reference at runtime) |

Apps Script files share a global namespace at runtime, so these "dependencies" are conceptual rather than language-enforced. The file split is for navigation and readability, not module boundaries.

## Schema

Each row in the Positions sheet has 14 columns:

| Index | Column | Populated by | Notes |
| --- | --- | --- | --- |
| 0 | Org | Crawler | From `CC_ENTITIES[].org` |
| 1 | Title | Fetcher | Platform-specific |
| 2 | Location | Fetcher | Platform-specific |
| 3 | Work Type | Fetcher (some) | Empty for Greenhouse, some Workday tenants |
| 4 | Department | Fetcher (some) | Empty for Pearson, USAJOBS, Smithsonian, most Workday |
| 5 | Dept Tier | Classifier | Core / Peripheral / Excluded (Tier 3 never written) |
| 6 | Date Posted | Fetcher | Normalized to ISO yyyy-MM-dd |
| 7 | First Seen | Crawler | Date the row was first added (preserved across re-crawls) |
| 8 | Days Open | Calculator | `today - Date Posted`, recomputed at finalization |
| 9 | Salary | Fetcher (rare) | ADP and USAJOBS populate; others empty |
| 10 | URL | Fetcher | Used as primary dedup key |
| 11 | Platform | Crawler | From `CC_ENTITIES[].platform` |
| 12 | Notes | Fetcher (sometimes) | Req number, hot job flag, manual-review reason |
| 13 | App. Status | User-set | Dropdown: In-Queue, In-Progress, Submitted, Interview, Offer, Rejected, Not Interested |

## State machine

App. Status drives row lifecycle:

```
[In-Queue] ──set──→ [In-Progress] ──set──→ [Submitted] ──set──→ [Interview] ──set──→ [Offer]
    │                                                                 │
    │                                                                 ▼
    │                                                            [Rejected]
    │
    └── auto-deleted after STALE_QUEUE_DAYS (default 30) if untouched
```

Once a row moves out of In-Queue, its URL is added to the locked set on subsequent crawls. The same URL cannot be re-added as a new In-Queue row even if the listing is still active on the source platform. This prevents the crawler from clobbering manual progress.

## Resumability

State persists in Apps Script PropertiesService:

```javascript
{
  status: 'idle' | 'running' | 'paused' | 'stopped' | 'done',
  index:  <next entity index to process>
}
```

If a crawl pauses (5-minute execution limit) or is manually paused, `Resume` reads `index` and continues from that entity. `Reset` zeroes the state.

## Adding a new ATS platform

1. Add an entity to `CC_ENTITIES` in `Config.gs` with the new platform string.
2. Add a `case` to the switch statement in `_executeBatch_cc` in `EntryPoints.gs`.
3. Add a `ccFetchPlatformName` function to `Fetchers.gs` that returns an array of objects shaped `{ title, location, workType, dept, date, salary, url, notes }`.
4. Test by running `Crawler → Crawl Control → Start` and inspecting the Register tab for the new platform's log lines.

## Adding a new organization on an existing platform

Just append a new entity to `CC_ENTITIES` with the existing platform's required fields. No code changes needed.
