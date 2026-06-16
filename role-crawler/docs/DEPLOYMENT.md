# Deployment

Two paths: manual (via the Apps Script editor) or scripted (via clasp). Manual is faster for a single sheet; clasp is better if you plan to maintain the code over time.

## Option A: Manual deployment

1. Create a new Google Sheet.
2. Extensions → Apps Script.
3. The editor opens with a default `Code.gs` file. Delete it.
4. For each of the ten `.gs` files in `src/`, click the `+` next to "Files" → Script. Name it exactly as in `src/` (Config, State, EntryPoints, Fetchers, Filters, Pipeline, Maintenance, Sheet, Logging, Menu). Paste contents.
5. Save (Ctrl/Cmd-S).
6. Close the Apps Script tab and reload your spreadsheet.
7. A `Crawler` menu appears in the menu bar.
8. Crawler → Initialize Sheet.
9. Crawler → Crawl Control → Start.

First run will request authorization. Approve the scopes (Spreadsheets, External Requests, Script Properties).

If a crawl exceeds 5 minutes it pauses automatically. Click `Crawler → Crawl Control → Resume` to continue.

## Option B: clasp deployment

[clasp](https://github.com/google/clasp) is Google's CLI for syncing local files with Apps Script projects.

```bash
npm install -g @google/clasp
clasp login
```

In an empty directory:

```bash
clasp create --type sheets --title "Job Crawler" --rootDir ./src
```

Copy the ten `.gs` files from this repo's `src/` into the new `./src` directory. Copy `appsscript.json` into the same directory.

```bash
clasp push
```

Open the new sheet via `clasp open --webapp` or by clicking the URL clasp prints. Then continue from step 7 of Option A.

For ongoing development, edit files locally, then `clasp push` to deploy.

## USAJOBS credentials

The current code includes a working `USAJOBS_EMAIL` and `USAJOBS_KEY` in `Config.gs`. The USAJOBS API key is a public-data read-only credential, harmless to commit. If you want your own credentials:

1. Sign up at https://developer.usajobs.gov/
2. Replace `USAJOBS_EMAIL` and `USAJOBS_KEY` in `Config.gs` with your values.

## First-time sheet setup checklist

After the first successful crawl, verify:

- The "Positions" tab exists with 14 columns matching the header schema.
- The "Register" tab exists with timestamped log entries.
- The App. Status column has a dropdown with seven options.
- Status cells with values other than In-Queue are colored according to `CC_STATUS_COLORS`.
- The URL column shows blue underlined hyperlinks.
- Row 1 is frozen.

If any of these fail, run `Crawler → Status Column → Setup / Repair` and `Crawler → Maintenance → Refresh Days Open`.

## Permissions

The script requires:

- **`https://www.googleapis.com/auth/spreadsheets.currentonly`** — to read/write the active sheet.
- **`https://www.googleapis.com/auth/script.external_request`** — to fetch from job-board APIs.
- **`https://www.googleapis.com/auth/script.scriptapp`** — for `PropertiesService` state persistence.

Apps Script requests these on first run. The scopes are minimal — the script cannot access other sheets, files, or external services beyond the configured fetch targets.

## Time zone

`appsscript.json` sets the project to America/Chicago. Edit if you are in a different time zone, since `Date Posted` and `First Seen` are formatted relative to script time zone.

## Operational notes

- Crawls are manual-only. There are no time-based triggers.
- A typical full crawl runs 3-5 minutes; if it pauses, Resume continues from the last entity.
- The Register tab grows unbounded over time. To clean it, delete its contents (the script will recreate it on next crawl).
- The Positions sheet auto-deletes In-Queue rows older than `STALE_QUEUE_DAYS` (default 30) at the end of each crawl. Rows in other statuses are never auto-deleted.
- The `cleanupNoiseRows` menu item is a one-off pass to re-apply current filters to existing rows without re-crawling.

## Troubleshooting

**"Authorization required" loop on every menu click**: Authorize once via Run → run any function in the Apps Script editor (with `startCrawl` selected), then retry from the menu.

**Menu doesn't appear**: Close and reopen the spreadsheet. If still missing, open the Apps Script editor, select `onOpen` from the function dropdown, and click Run.

**Crawl hangs on one entity**: Check the Register tab for HTTP error codes. Most fetchers fail-soft (log and return empty array), so a broken ATS for one org should not stop the crawl. If it does, manually advance: `Crawler → Crawl Control → Pause`, then edit `setCrawlState_cc` to advance `index` past the broken entity, then Resume.

**Cleanup function reports zero rows removed but you can see noise**: The script in the editor may not be the deployed version. Re-save in the editor, close all sheet tabs, reopen the sheet in a fresh browser tab.
