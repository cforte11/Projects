// Recalculates the Days Open column for every row based on Date Posted relative to the crawl date.
// Input: sheet (Sheet object).
// Output: none (side effect: rewrites the Days Open column).
function ccUpdateDaysOpen(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return;
  const today = Utilities.formatDate(CC_CRAWL_DATE, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  const data  = sheet.getRange(2, 1, lastRow - 1, CC_HEADERS.length).getValues();
  data.forEach(row => {
    const datePosted = String(row[COL.DATE_POSTED] || '').trim();
    row[COL.DAYS_OPEN] = datePosted ? ccDaysBetween(datePosted, today) : '';
  });
  sheet.getRange(2, 1, data.length, CC_HEADERS.length).setValues(data);
}

// Removes In-Queue rows whose First Seen date is older than CC.STALE_QUEUE_DAYS; preserves rows in any other status.
// Input: sheet (Sheet object).
// Output: none (side effect: deletes stale queue rows, logs count).
function ccDeleteStaleQueueRows(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return;
  const today = CC_CRAWL_DATE;
  const data  = sheet.getRange(2, 1, lastRow - 1, CC_HEADERS.length).getValues();
  const stale = [];
  data.forEach((row, i) => {
    const status = String(row[COL.STATUS] || '').trim();
    if (status !== CC_STATUS_QUEUE) return;
    const firstSeen = String(row[COL.FIRST_SEEN] || row[COL.DATE_POSTED] || '').trim();
    if (!firstSeen) return;
    const seenDate = new Date(firstSeen);
    if (isNaN(seenDate.getTime())) return;
    const ageDays = (today - seenDate) / (24 * 60 * 60 * 1000);
    if (ageDays > CC.STALE_QUEUE_DAYS) stale.push(i + 2);
  });
  for (let i = stale.length - 1; i >= 0; i--) sheet.deleteRow(stale[i]);
  if (stale.length) ccLog(`Deleted ${stale.length} stale In-Queue rows (>${CC.STALE_QUEUE_DAYS} days).`);
}

// Sorts the Positions sheet by Date Posted descending.
// Input: sheet (Sheet object).
// Output: none (side effect: reorders data rows in-place).
function ccAutoSortByDatePosted(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 3) return;
  const range = sheet.getRange(2, 1, lastRow - 1, CC_HEADERS.length);
  range.sort([{ column: COL.DATE_POSTED + 1, ascending: false }]);
  ccLog('Sorted by Date Posted (descending).');
}

// Removes rows where the Org column is blank.
// Input: sheet (Sheet object).
// Output: none (side effect: deletes blank rows, logs count).
function ccRemoveBlankRows(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return;
  const data    = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  let   removed = 0;
  for (let i = data.length - 1; i >= 0; i--) {
    if (!data[i][0]) { sheet.deleteRow(i + 2); removed++; }
  }
  if (removed) ccLog(`Removed ${removed} blank rows.`);
}


// Menu-bound wrapper that clears all data from the Positions sheet after a confirmation prompt.
// Input: none.
// Output: none (side effect: clears sheet content, re-writes headers).
function clearPositions() {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CC.SHEET_NAME);
  if (!sheet) return;
  const ui = SpreadsheetApp.getUi();
  if (ui.alert('Clear all positions?', ui.ButtonSet.YES_NO) !== ui.Button.YES) return;
  sheet.clearContents();
  ccEnsureHeaders(sheet);
  ccLog('Positions sheet cleared.');
}

// Menu-bound wrapper that runs the dedup pass on the Positions sheet.
// Input: none.
// Output: none (calls ccDeduplicateRows).
function deduplicatePositions() { ccDeduplicateRows(ccGetOrCreateSheet()); }

// Menu-bound wrapper that removes blank rows from the Positions sheet.
// Input: none.
// Output: none (calls ccRemoveBlankRows).
function removeBlankRows() { ccRemoveBlankRows(ccGetOrCreateSheet()); }

// Menu-bound wrapper that sorts the Positions sheet by Date Posted descending.
// Input: none.
// Output: none (calls ccAutoSortByDatePosted).
function sortPositionsByDate() { ccAutoSortByDatePosted(ccGetOrCreateSheet()); }

// Menu-bound wrapper that recalculates the Days Open column relative to today.
// Input: none.
// Output: none (resets CC_CRAWL_DATE to now and calls ccUpdateDaysOpen).
function refreshDaysOpen() {
  const s = ccGetOrCreateSheet();
  CC_CRAWL_DATE = new Date();
  ccUpdateDaysOpen(s);
  try { SpreadsheetApp.getUi().alert('Days Open recalculated.'); } catch (e) {}
}

// One-off maintenance pass that re-applies v4.1 filters to In-Queue rows currently in the sheet and normalizes legacy FULL_TIME work-type strings; preserves all non-Queue rows.
// Input: none (acts on the Positions sheet).
// Output: none (side effect: deletes failing rows, normalizes Work Type cells, shows summary alert).
function cleanupNoiseRows() {
  const ui = SpreadsheetApp.getUi();
  if (ui.alert(
    'Clean noise rows?',
    'This applies the v4.1 filters to In-Queue rows in the Positions sheet:\n' +
    ' • Removes non-US locations (incl. "India (Remote)", "Remote Canada", etc.)\n' +
    ' • Removes newly excluded Tier-3 roles (attorney, AP specialist, ' +
    'campus ambassador, museum/animal keeper/visitor experience, etc.)\n' +
    ' • Normalizes "FULL_TIME" → "Full-Time"\n\n' +
    'Rows in any non-Queue status are preserved.\n\nProceed?',
    ui.ButtonSet.YES_NO
  ) !== ui.Button.YES) return;
  const sheet = ccGetOrCreateSheet();
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    ui.alert('Sheet is empty — nothing to clean.');
    return;
  }
  const range = sheet.getRange(2, 1, lastRow - 1, CC_HEADERS.length);
  const data  = range.getValues();
  const toDelete = [];
  let nonUSCount = 0, tier3Count = 0, junkCount = 0, workTypeFixes = 0;
  data.forEach((row, i) => {
    const status   = String(row[COL.STATUS] || '').trim();
    const title    = String(row[COL.TITLE]    || '');
    const dept     = String(row[COL.DEPT]     || '');
    const location = String(row[COL.LOCATION] || '');
    const workType = String(row[COL.WORK_TYPE] || '');
    if (workType === 'FULL_TIME') {
      row[COL.WORK_TYPE] = 'Full-Time';
      workTypeFixes++;
    }
    if (status !== CC_STATUS_QUEUE) return;
    if (title.indexOf('Manual Review Required') >= 0) return;
    if (ccIsNonUS(location))             { toDelete.push(i + 2); nonUSCount++; return; }
    const c = classifyDept_(dept, title);
    if (c.tier === 3)                    { toDelete.push(i + 2); tier3Count++; return; }
    if (ccIsJunk(title))                 { toDelete.push(i + 2); junkCount++;  return; }
  });
  if (workTypeFixes > 0) {
    range.setValues(data);
  }
  for (let i = toDelete.length - 1; i >= 0; i--) {
    sheet.deleteRow(toDelete[i]);
  }
  const total = toDelete.length;
  ccLog(`Cleanup v4.1: removed ${total} rows (non-US: ${nonUSCount}, Tier-3: ${tier3Count}, junk: ${junkCount}); fixed ${workTypeFixes} Work Type cells.`);
  ui.alert(
    'Cleanup complete.',
    `Removed ${total} noise rows from In-Queue:\n` +
    `  • Non-US locations: ${nonUSCount}\n` +
    `  • Newly excluded Tier-3: ${tier3Count}\n` +
    `  • Junk titles: ${junkCount}\n\n` +
    `Normalized ${workTypeFixes} "FULL_TIME" → "Full-Time" cells.`,
    ui.ButtonSet.OK
  );
}


// First-time setup that clears the sheet, writes headers, and installs the Status column.
// Input: none.
// Output: none (side effect: resets sheet for a fresh deployment).
function initializeSheet() {
  const sheet = ccGetOrCreateSheet();
  sheet.clearContents();
  sheet.clearConditionalFormatRules();
  ccEnsureHeaders(sheet);
  ccEnsureStatusColumn(sheet);
  ccLog('Sheet initialized with v3.0 schema.');
  try {
    SpreadsheetApp.getUi().alert(
      'Initialized "' + CC.SHEET_NAME + '" with v3.0 schema.\n\n' +
      'Next step: Crawler → Crawl Control → Start'
    );
  } catch (e) {}
}
