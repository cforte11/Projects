# Changelog

## v4.1 (June 2026)

### Filter fixes

- `ccIsNonUS()` reordered so non-US keyword check runs BEFORE the US/remote check. Previously, locations like "India (Remote)" or "Remote Canada" matched the `/remote/` regex first and slipped through; now the country match wins.
- Expanded non-US keyword list:
  - LATAM: Argentina, Chile, Colombia, Costa Rica, São Paulo, Sao Paulo
  - Middle East: Pakistan, UAE, Dubai, Israel, Tel Aviv, Egypt, Cairo, Türkiye, Turkey, Istanbul
  - Asia: Hong Kong, Sri Lanka, Thailand
  - Indian states/cities: Karnataka, Maharashtra, Telangana, Uttar Pradesh, Bhubaneswar, Odisha, Jagtial, Khammam, Nizamabad, Siddipet, Vikarabad, Warangal, Yadadri, Nabarangpur, Keonjhar
- Expanded `DEPT_TIER_3` exclusion list:
  - Legal: attorney, general counsel, counsel
  - Admin: AP specialist, accounts payable, accounts receivable
  - Education-specific operational: campus ambassador, animal keeper, curator, museum specialist, visitor experience, transportation supervisor, program engagement, operations coordinator, test center manager
  - HR-adjacent: talent development, organization development, organizational development, recruiting
  - Other: technical support specialist, student worker

### New functionality

- `cleanupNoiseRows()` — one-off maintenance pass that re-applies current filters to In-Queue rows already in the sheet and normalizes legacy `FULL_TIME` work-type strings to `Full-Time`. Preserves all rows in non-Queue statuses. Bound to menu: Crawler → Maintenance → Cleanup Noise Rows.

### Refactoring

- Single 1,700-line file split into ten module files organized by concern.
- All functions documented with one-sentence description plus Input/Output annotations.
- Function ordering reorganized to flow top-to-bottom: data → state → entry points → pipeline → ops → menu wrappers → setup → logging → menu.

## v4.0 (initial broad-coverage release)

- 18 ATS platforms integrated across ~43 organizations.
- New platforms added in this version: Paylocity (TERC), JazzHR (Illustrative Mathematics), Rippling (Digital Promise), Jibe Apply (McGraw Hill), SAP SuccessFactors (HMH), Oracle Recruiting Cloud (Pearson), Paycom Mantle (Carnegie Learning, ISTE+ASCD).
- USAJOBS REST API integration with public-data credentials.
- Three-tier department classifier (Core / Peripheral / Excluded).
- App. Status column with seven states, dropdown validation, conditional formatting.
- URL-locking: once a row moves beyond In-Queue, its URL is locked from re-add on subsequent crawls.
- Composite dedup: URL primary key, Org|Title|Date secondary key.
- Resumable execution with state persistence in PropertiesService.
- Stale In-Queue auto-deletion after 30 days.

## v3.0 (schema and lifecycle release)

- Sheet schema standardized to 14 columns.
- Status column with lifecycle states added.
- Days Open computed at finalization.
- First Seen tracked separately from Date Posted.

## v2.0 (multi-platform baseline)

- Greenhouse, Lever, Workday, SmartRecruiters, RSS, ADP, Workable fetchers.
- Manual review placeholder rows for orgs without programmatic APIs.

## v1.0 (proof of concept)

- Greenhouse only, single org.
