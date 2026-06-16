// Writes a timestamped log message to both the console and the Register sheet.
// Input: msg (string).
// Output: none (side effect: appends to Register sheet, prints to console).
function ccLog(msg) {
  console.log(msg);
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  let   sheet = ss.getSheetByName(CC.LOG_NAME);
  if (!sheet) sheet = ss.insertSheet(CC.LOG_NAME);
  const ts = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
  sheet.appendRow([ts, msg]);
}

// Menu-bound helper that activates the Register sheet so the user can view crawler logs.
// Input: none.
// Output: none (side effect: switches active sheet).
function viewLog() {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CC.LOG_NAME);
  if (sheet) ss.setActiveSheet(sheet);
}
