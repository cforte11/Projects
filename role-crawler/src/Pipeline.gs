// Applies all filters (junk, age, non-US, Tier 3, locked URLs, duplicate keys), classifies dept tier, and writes surviving jobs to the Positions sheet.
// Input: sheet (Sheet object), org (string), platform (string), jobs (array of raw job objects).
// Output: none (side effect: appends filtered rows to sheet, logs counts).
function ccWriteJobs(sheet, org, platform, jobs) {
  if (!jobs || jobs.length === 0) return;
  jobs = jobs.map(j => Object.assign({}, j, { date: ccNormalizeDate(j.date || '') }));
  const beforeJunk = jobs.length;
  jobs = jobs.filter(j => !ccIsJunk(j.title));
  if (beforeJunk !== jobs.length) ccLog(`  Filtered ${beforeJunk - jobs.length} junk titles`);
  jobs = jobs.filter(j => !ccIsTooOld(j.date));
  jobs = jobs.filter(j => !ccIsNonUS(j.location));
  const classified = [];
  let tier3Count = 0;
  jobs.forEach(j => {
    const c = classifyDept_(j.dept, j.title);
    if (c.tier === 3) { tier3Count++; return; }
    classified.push(Object.assign({}, j, { _tierLabel: c.label }));
  });
  if (tier3Count > 0) ccLog(`  Filtered ${tier3Count} Tier-3 (excluded depts)`);
  jobs = classified;
  if (jobs.length === 0) return;
  if (_ccLockedUrls === null) {
    _ccLockedUrls = ccLoadLockedUrls(sheet);
    ccLog(`  Loaded ${_ccLockedUrls.size} locked URL(s)`);
  }
  jobs = jobs.filter(j => {
    const url = (j.url || '').trim();
    return !url || !_ccLockedUrls.has(url);
  });
  if (jobs.length === 0) return;
  const existing = ccLoadExistingKeys(sheet);
  jobs = jobs.filter(j => {
    const url = (j.url || '').trim();
    if (url && existing.urls.has(url)) return false;
    const composite = `${org}|${j.title}|${j.date}`.toLowerCase();
    if (existing.composites.has(composite)) return false;
    return true;
  });
  if (jobs.length === 0) return;
  const today = Utilities.formatDate(CC_CRAWL_DATE, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  const rows = jobs.map(j => {
    const daysOpen = j.date ? ccDaysBetween(j.date, today) : 0;
    const row = new Array(CC_HEADERS.length).fill('');
    row[COL.ORG]         = org;
    row[COL.TITLE]       = j.title;
    row[COL.LOCATION]    = j.location || '';
    row[COL.WORK_TYPE]   = j.workType || '';
    row[COL.DEPT]        = j.dept || '';
    row[COL.DEPT_TIER]   = j._tierLabel || 'Peripheral';
    row[COL.DATE_POSTED] = j.date || '';
    row[COL.FIRST_SEEN]  = today;
    row[COL.DAYS_OPEN]   = daysOpen;
    row[COL.SALARY]      = j.salary || '';
    row[COL.URL]         = j.url || '';
    row[COL.PLATFORM]    = platform;
    row[COL.NOTES]       = j.notes || '';
    row[COL.STATUS]      = CC_STATUS_QUEUE;
    return row;
  });
  const startRow = sheet.getLastRow() + 1;
  sheet.getRange(startRow, 1, rows.length, CC_HEADERS.length).setValues(rows);
  ccLog(`  Wrote ${rows.length} jobs for ${org}`);
}


// Writes a single placeholder "Manual Review Required" row for orgs whose careers pages have no programmatic API.
// Input: sheet (Sheet object), entity (object with `org`, `url`, `platform`, optional `reason`).
// Output: none (side effect: appends one row to sheet if not already present).
function ccWriteManualReview(sheet, entity) {
  const now = Utilities.formatDate(CC_CRAWL_DATE, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  if (_ccManualRowExists(sheet, entity.org)) {
    ccLog(`  Manual row already present for ${entity.org}`);
    return;
  }
  const row = new Array(CC_HEADERS.length).fill('');
  row[COL.ORG]         = entity.org;
  row[COL.TITLE]       = '⚠ Manual Review Required';
  row[COL.DEPT_TIER]   = 'Peripheral';
  row[COL.DATE_POSTED] = now;
  row[COL.FIRST_SEEN]  = now;
  row[COL.DAYS_OPEN]   = 0;
  row[COL.URL]         = entity.url;
  row[COL.PLATFORM]    = entity.platform;
  row[COL.NOTES]       = entity.reason || 'Manual review needed.';
  row[COL.STATUS]      = CC_STATUS_QUEUE;
  const nextRow = sheet.getLastRow() + 1;
  sheet.getRange(nextRow, 1, 1, row.length).setValues([row]);
  ccLog(`  Manual row written for ${entity.org}`);
}

// Checks whether a manual-review row for the given org already exists in the sheet.
// Input: sheet (Sheet object), orgName (string).
// Output: boolean.
function _ccManualRowExists(sheet, orgName) {
  if (sheet.getLastRow() < 2) return false;
  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, CC_HEADERS.length).getValues();
  for (let i = 0; i < data.length; i++) {
    if (data[i][COL.ORG] === orgName &&
        String(data[i][COL.TITLE]).indexOf('Manual Review Required') >= 0) {
      return true;
    }
  }
  return false;
}


// Builds a Set of URLs whose status is anything other than In-Queue, used to prevent re-adding already-progressed listings.
// Input: sheet (Sheet object).
// Output: Set of locked URL strings.
function ccLoadLockedUrls(sheet) {
  const locked = new Set();
  if (sheet.getLastRow() < 2) return locked;
  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, CC_HEADERS.length).getValues();
  data.forEach(row => {
    const url = String(row[COL.URL] || '').trim();
    const s   = String(row[COL.STATUS] || '').trim();
    if (url && CC_LOCKED_STATUSES.has(s)) locked.add(url);
  });
  return locked;
}

// Builds dedup keys (URL set and Org|Title|Date composite set) from existing sheet rows.
// Input: sheet (Sheet object).
// Output: object { urls: Set, composites: Set }.
function ccLoadExistingKeys(sheet) {
  const out = { urls: new Set(), composites: new Set() };
  if (sheet.getLastRow() < 2) return out;
  const data = sheet.getRange(2, 1, sheet.getLastRow() - 1, CC_HEADERS.length).getValues();
  data.forEach(row => {
    const url = String(row[COL.URL] || '').trim();
    if (url) out.urls.add(url);
    const composite = `${row[COL.ORG]}|${row[COL.TITLE]}|${row[COL.DATE_POSTED]}`.toLowerCase();
    if (composite.replace(/\|/g, '').length > 0) out.composites.add(composite);
  });
  return out;
}

// Removes duplicate rows from the sheet using URL as primary key and Org|Title|Date as secondary.
// Input: sheet (Sheet object).
// Output: none (side effect: deletes duplicate rows, logs count).
function ccDeduplicateRows(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return;
  const data = sheet.getRange(2, 1, lastRow - 1, CC_HEADERS.length).getValues();
  const seenUrl = new Set(), seenComposite = new Set();
  const dupes = [];
  data.forEach((row, i) => {
    const url = String(row[COL.URL] || '').trim();
    const composite = `${row[COL.ORG]}|${row[COL.TITLE]}|${row[COL.DATE_POSTED]}`.toLowerCase();
    let isDupe = false;
    if (url && seenUrl.has(url)) isDupe = true;
    else if (composite.replace(/\|/g, '').length > 0 && seenComposite.has(composite)) isDupe = true;
    if (isDupe) dupes.push(i + 2);
    else { if (url) seenUrl.add(url); seenComposite.add(composite); }
  });
  for (let i = dupes.length - 1; i >= 0; i--) sheet.deleteRow(dupes[i]);
  if (dupes.length) ccLog(`Removed ${dupes.length} duplicate rows.`);
}
