// Apps Script trigger that builds the Crawler custom menu when the spreadsheet opens.
// Input: none (auto-fired by Apps Script on spreadsheet open).
// Output: none (side effect: adds menu items to UI).
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Crawler')
    .addItem('Initialize Sheet', 'initializeSheet')
    .addSeparator()
    .addSubMenu(ui.createMenu('Crawl Control')
      .addItem('Start',  'startCrawl')
      .addItem('Pause',  'pauseCrawl')
      .addItem('Resume', 'resumeCrawl')
      .addItem('Stop',   'stopCrawl')
      .addItem('Reset',  'resetCrawl'))
    .addSeparator()
    .addSubMenu(ui.createMenu('Maintenance')
      .addItem('Clear Positions',           'clearPositions')
      .addItem('De-Duplicate',              'deduplicatePositions')
      .addItem('Remove Blank Rows',         'removeBlankRows')
      .addItem('Sort by Date Posted',       'sortPositionsByDate')
      .addItem('Refresh Days Open',         'refreshDaysOpen')
      .addItem('Cleanup Noise Rows (v4.1)', 'cleanupNoiseRows'))
    .addSeparator()
    .addSubMenu(ui.createMenu('Status Column')
      .addItem('Setup / Repair',            'setupStatusColumn')
      .addItem('Refresh Colors & Dropdown', '_ccRefreshStatus'))
    .addSeparator()
    .addItem('View Log', 'viewLog')
    .addToUi();
}
