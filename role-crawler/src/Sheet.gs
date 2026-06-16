// Returns the Positions sheet, creating it if missing.
// Input: none.
// Output: Sheet object.
function ccGetOrCreateSheet() {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  let   sheet = ss.getSheetByName(CC.SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(CC.SHEET_NAME);
    ccLog('Created Positions sheet.');
  }
  return sheet;
}

// Writes and styles the header row if missing or malformed.
// Input: sheet (Sheet object).
// Output: none (side effect: sets header row with styling and freezes top row).
function ccEnsureHeaders(sheet) {
  const firstCellOk = sheet.getLastRow() >= 1 && sheet.getRange(1, 1).getValue() === CC_HEADERS[0];
  const widthOk     = sheet.getLastColumn() >= CC_HEADERS.length;
  if (!firstCellOk || !widthOk) {
    sheet.clearContents();
    const r = sheet.getRange(1, 1, 1, CC_HEADERS.length);
    r.setValues([CC_HEADERS]).setFontWeight('bold').setBackground('#2d2d6b').setFontColor('#ffffff');
    sheet.setFrozenRows(1);
  }
}

// Applies visual formatting (URL styling, alternating row backgrounds, status conditional formatting, auto-resize) to the entire data range.
// Input: sheet (Sheet object).
// Output: none (side effect: visual updates).
function ccApplyFormatting(sheet) {
  if (sheet.getLastRow() < 2) return;
  const lastRow = sheet.getLastRow();
  const lastCol = Math.max(sheet.getLastColumn(), CC_HEADERS.length);
  sheet.setFrozenRows(1);
  sheet.getRange(2, COL.URL + 1, lastRow - 1, 1).setFontColor('#1155cc').setFontLine('underline');
  for (let r = 2; r <= lastRow; r++) {
    sheet.getRange(r, 1, 1, lastCol).setBackground(r % 2 === 0 ? '#f8f8f8' : '#ffffff');
  }
  _ccApplyStatusFormatting(sheet, COL.STATUS + 1);
  [COL.ORG + 1, COL.TITLE + 1, COL.LOCATION + 1, COL.DEPT + 1,
   COL.DEPT_TIER + 1, COL.PLATFORM + 1, COL.STATUS + 1].forEach(c => {
    try { sheet.autoResizeColumn(c); } catch (e) {}
  });
}


// Installs data validation dropdown on the App. Status column and backfills In-Queue for empty cells.
// Input: sheet (Sheet object).
// Output: none (side effect: sets validation rules, fills empties, applies colors).
function ccEnsureStatusColumn(sheet) {
  const lastRow = sheet.getLastRow();
  const colNum  = COL.STATUS + 1;
  if (lastRow > 1) {
    const validRange = sheet.getRange(2, colNum, lastRow - 1, 1);
    const rule = SpreadsheetApp.newDataValidation()
      .requireValueInList(CC_ALL_STATUSES, true)
      .setAllowInvalid(false).build();
    validRange.setDataValidation(rule);
    const vals   = validRange.getValues();
    const filled = vals.map(r => [r[0] === '' ? CC_STATUS_QUEUE : r[0]]);
    validRange.setValues(filled);
  }
  _ccApplyStatusFormatting(sheet, colNum);
}

// Builds and applies the conditional formatting rules that color rows based on App. Status value.
// Input: sheet (Sheet object), colNum (1-based column index of status).
// Output: none (side effect: updates conditional format rules on sheet).
function _ccApplyStatusFormatting(sheet, colNum) {
  const lastRow = Math.max(sheet.getLastRow(), 2);
  const range   = sheet.getRange(2, colNum, lastRow - 1, 1);
  const kept    = sheet.getConditionalFormatRules().filter(r =>
    !r.getRanges().some(rng => rng.getColumn() === colNum));
  Object.keys(CC_STATUS_COLORS).forEach(status => {
    const cfg = CC_STATUS_COLORS[status];
    let builder = SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo(status)
      .setBackground(cfg.bg)
      .setFontColor(cfg.fontColor);
    if (cfg.italic) builder = builder.setItalic(true);
    kept.push(builder.setRanges([range]).build());
  });
  sheet.setConditionalFormatRules(kept);
}


// Menu-bound wrapper that ensures the Status column validation and formatting are in place.
// Input: none.
// Output: none (calls ccEnsureStatusColumn, shows confirmation alert).
function setupStatusColumn() {
  const s = ccGetOrCreateSheet();
  ccEnsureStatusColumn(s);
  try { SpreadsheetApp.getUi().alert('Status column ready.'); } catch (e) {}
}

// Menu-bound wrapper for re-applying status validation and colors without other changes.
// Input: none.
// Output: none (calls ccEnsureStatusColumn).
function _ccRefreshStatus() {
  const s = ccGetOrCreateSheet();
  ccEnsureStatusColumn(s);
}
