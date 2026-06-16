// Resets state and begins a fresh crawl from the first entity.
// Input: none.
// Output: none (kicks off _executeBatch_cc).
function startCrawl() {
  resetCrawlState_cc();
  setCrawlState_cc('running', 0);
  _executeBatch_cc();
}

// Marks the crawler as paused so the next batch will halt.
// Input: none.
// Output: none (side effect: state set to 'paused').
function pauseCrawl() { setCrawlState_cc('paused'); }

// Stops the crawler and shows a toast confirmation.
// Input: none.
// Output: none (side effect: state set to 'stopped', user notified via toast).
function stopCrawl() {
  setCrawlState_cc('stopped');
  SpreadsheetApp.getActiveSpreadsheet().toast('Crawler stopped.');
}

// Continues a paused crawl from the last completed entity index.
// Input: none.
// Output: none (calls _executeBatch_cc if state was paused; alerts otherwise).
function resumeCrawl() {
  const state = getCrawlState_cc();
  if (state.status !== 'paused') {
    SpreadsheetApp.getUi().alert('Nothing to resume.');
    return;
  }
  _executeBatch_cc();
}

// Manually resets crawler state without starting a new crawl.
// Input: none.
// Output: none (side effect: state reset, toast shown).
function resetCrawl() {
  resetCrawlState_cc();
  SpreadsheetApp.getActiveSpreadsheet().toast('Crawler state reset.');
}


// Iterates over all configured entities, fetches jobs from each platform, and writes results to the Positions sheet within a 5-minute execution window.
// Input: none (reads CC_ENTITIES, current state, and sheet).
// Output: none (writes job rows to sheet, updates state, runs finalization passes).
function _executeBatch_cc() {
  CC_CRAWL_DATE = new Date();
  _ccLockedUrls = null;
  const sheet = ccGetOrCreateSheet();
  ccEnsureHeaders(sheet);
  const state    = getCrawlState_cc();
  let   idx      = state.index || 0;
  const total    = CC_ENTITIES.length;
  const DEADLINE = Date.now() + 5 * 60 * 1000;
  while (idx < total) {
    if (Date.now() > DEADLINE) {
      setCrawlState_cc('paused', idx);
      ccLog(`Paused at ${idx}/${total} — run Resume to continue.`);
      try { SpreadsheetApp.getUi().alert(`Paused at ${idx}/${total}. Use Crawler → Resume.`); } catch(e) {}
      return;
    }
    const entity = CC_ENTITIES[idx];
    ccLog(`[${idx + 1}/${total}] ${entity.org} (${entity.platform})`);
    try {
      let jobs = [];
      switch (entity.platform) {
        case 'greenhouse':      jobs = ccFetchGreenhouse(entity);      break;
        case 'lever':           jobs = ccFetchLever(entity);           break;
        case 'workday':         jobs = ccFetchWorkday(entity);         break;
        case 'smartrecruiters': jobs = ccFetchSmartRecruiters(entity); break;
        case 'rss':             jobs = ccFetchRSS(entity);             break;
        case 'adp':             jobs = ccFetchADP(entity);             break;
        case 'workable':        jobs = ccFetchWorkable(entity);        break;
        case 'ultipro':         jobs = ccFetchUltiPro(entity);         break;
        case 'amnh':            jobs = ccFetchAMNH(entity);            break;
        case 'breezy':          jobs = ccFetchBreezy(entity);          break;
        case 'usajobs':         jobs = ccFetchUSAJobs(entity);         break;
        case 'paylocity':       jobs = ccFetchPaylocity(entity);       break;
        case 'jazzhr':          jobs = ccFetchJazzHR(entity);          break;
        case 'rippling':        jobs = ccFetchRippling(entity);        break;
        case 'jibe':            jobs = ccFetchJibe(entity);            break;
        case 'successfactors':  jobs = ccFetchSuccessFactors(entity);  break;
        case 'oracle_orc':      jobs = ccFetchOracleORC(entity);       break;
        case 'paycom':          jobs = ccFetchPaycom(entity);          break;
        case 'manual':
          ccWriteManualReview(sheet, entity);
          idx++;
          setCrawlState_cc('running', idx);
          continue;
      }
      ccWriteJobs(sheet, entity.org, entity.platform, jobs);
    } catch (e) {
      ccLog(`  Error: ${e.message}`);
    }
    idx++;
    setCrawlState_cc('running', idx);
  }
  ccLog('=== Finalizing ===');
  ccRemoveBlankRows(sheet);
  ccDeduplicateRows(sheet);
  ccUpdateDaysOpen(sheet);
  ccDeleteStaleQueueRows(sheet);
  ccApplyFormatting(sheet);
  ccEnsureStatusColumn(sheet);
  ccAutoSortByDatePosted(sheet);
  setCrawlState_cc('done', total);
  ccLog(`=== Complete — ${sheet.getLastRow() - 1} jobs ===`);
  try {
    SpreadsheetApp.getUi().alert(`Crawler complete.\n${sheet.getLastRow() - 1} listings in "${CC.SHEET_NAME}".`);
  } catch (e) {}
}
