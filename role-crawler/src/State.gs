let CC_CRAWL_DATE = new Date();
let _ccLockedUrls = null;


// Reads the saved crawler state object from Apps Script Properties storage.
// Input: none.
// Output: object { status, index } representing current crawl progress, or default idle state if no save exists.
function getCrawlState_cc() {
  const raw = PropertiesService.getScriptProperties().getProperty(CC_STATE_KEY);
  if (!raw) return { status: 'idle', index: 0 };
  try { return JSON.parse(raw); } catch (e) { return { status: 'idle', index: 0 }; }
}

// Persists the current crawler status and entity index to Apps Script Properties.
// Input: status (string, optional), index (number, optional).
// Output: none (side effect: writes to script properties).
function setCrawlState_cc(status, index) {
  const state = getCrawlState_cc();
  if (status !== undefined) state.status = status;
  if (index  !== undefined) state.index  = index;
  PropertiesService.getScriptProperties().setProperty(CC_STATE_KEY, JSON.stringify(state));
}

// Resets the saved crawler state to idle with index 0.
// Input: none.
// Output: none (side effect: writes default state to script properties).
function resetCrawlState_cc() {
  PropertiesService.getScriptProperties().setProperty(
    CC_STATE_KEY, JSON.stringify({ status: 'idle', index: 0 })
  );
}
