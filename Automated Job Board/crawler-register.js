const CC = {
  SHEET_NAME:        'Positions',
  LOG_NAME:          'Register',
  MAX_AGE_DAYS:      30,
  STALE_QUEUE_DAYS:  30,
  MAX_JOBS:          500,
  UA: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
};

const CC_HEADERS = [
  'Org', 'Title', 'Location', 'Work Type',
  'Department', 'Dept Tier', 'Date Posted', 'First Seen', 'Days Open',
  'Salary', 'URL', 'Platform', 'Notes', 'App. Status',
];

const COL = {
  ORG: 0, TITLE: 1, LOCATION: 2, WORK_TYPE: 3,
  DEPT: 4, DEPT_TIER: 5, DATE_POSTED: 6, FIRST_SEEN: 7, DAYS_OPEN: 8,
  SALARY: 9, URL: 10, PLATFORM: 11, NOTES: 12, STATUS: 13,
};

const CC_STATUS_COL            = 'App. Status';
const CC_STATUS_QUEUE          = 'In-Queue';
const CC_STATUS_PROGRESS       = 'In-Progress';
const CC_STATUS_SUBMITTED      = 'Submitted';
const CC_STATUS_INTERVIEW      = 'Interview';
const CC_STATUS_OFFER          = 'Offer';
const CC_STATUS_REJECTED       = 'Rejected';
const CC_STATUS_NOT_INTERESTED = 'Not Interested';

const CC_ALL_STATUSES = [
  CC_STATUS_QUEUE, CC_STATUS_PROGRESS, CC_STATUS_SUBMITTED,
  CC_STATUS_INTERVIEW, CC_STATUS_OFFER, CC_STATUS_REJECTED,
  CC_STATUS_NOT_INTERESTED,
];

const CC_LOCKED_STATUSES = new Set([
  CC_STATUS_PROGRESS, CC_STATUS_SUBMITTED, CC_STATUS_INTERVIEW,
  CC_STATUS_OFFER, CC_STATUS_REJECTED, CC_STATUS_NOT_INTERESTED,
]);

const CC_STATUS_COLORS = {
  [CC_STATUS_QUEUE]:          { bg: '#ffffff', fontColor: '#000000', italic: false },
  [CC_STATUS_PROGRESS]:       { bg: '#fff2cc', fontColor: '#000000', italic: false },
  [CC_STATUS_SUBMITTED]:      { bg: '#c6efce', fontColor: '#000000', italic: false },
  [CC_STATUS_INTERVIEW]:      { bg: '#bdd7ee', fontColor: '#000000', italic: false },
  [CC_STATUS_OFFER]:          { bg: '#9fc5e8', fontColor: '#000000', italic: false },
  [CC_STATUS_REJECTED]:       { bg: '#f4cccc', fontColor: '#000000', italic: false },
  [CC_STATUS_NOT_INTERESTED]: { bg: '#d9d9d9', fontColor: '#666666', italic: true  },
};

const DEPT_TIER_1 = [
  'product', 'engineering', 'engineer', 'design', 'designer',
  'ux', 'ui', 'user experience', 'user interface',
  'research', 'researcher', 'data', 'analytics',
  'strategy', 'strategist', 'technology', 'technical',
  'information architecture', 'information science',
  'knowledge', 'taxonomy', 'ontology',
  'content strategy', 'content design',
  'platform', 'software', 'developer',
  'ai', 'artificial intelligence', 'machine learning', 'ml',
];

const DEPT_TIER_2 = [
  'marketing', 'partnerships', 'partnership',
  'program management', 'program manager', 'program',
  'operations', 'business development', 'biz dev',
  'editorial', 'publishing', 'publisher',
  'learning science', 'learning design', 'instructional',
  'community', 'communications',
];

const DEPT_TIER_3 = [
  'sales', 'account executive', 'business dev rep', 'bdr', 'sdr',
  'human resources', 'hr ', 'people ops', 'people operations',
  'recruiter', 'recruiting', 'talent acquisition', 'talent development',
  'organization development', 'organizational development',
  'finance', 'financial', 'accounting', 'accountant', 'controller', 'bookkeeper',
  'ap specialist', 'accounts payable', 'accounts receivable',
  'legal', 'paralegal', 'compliance officer',
  'attorney', 'general counsel', 'counsel',
  'facilities', 'facility', 'janitor', 'custodian', 'maintenance',
  'customer support', 'customer service', 'cx ', 'help desk',
  'technical support specialist',
  'admin', 'administrative assistant', 'executive assistant', ' ea ',
  'warehouse', 'shipping', 'receiving', 'inventory',
  'retail', 'cashier', 'sales associate', 'store',
  'security guard', 'parking',
  'per diem',
  'student worker',
  'campus ambassador',
  'animal keeper', 'curator', 'museum specialist',
  'visitor experience', 'transportation supervisor',
  'program engagement', 'operations coordinator',
  'test center manager',
];

const CC_ENTITIES = [
  { org: 'ITHAKA',                   platform: 'greenhouse', board: 'ithaka' },
  { org: 'Wikimedia Foundation',     platform: 'greenhouse', board: 'wikimedia' },
  { org: 'Khan Academy',             platform: 'greenhouse', board: 'khanacademy' },
  { org: 'BrainPOP',                 platform: 'greenhouse', board: 'brainpop' },
  { org: 'NoRedInk',                 platform: 'greenhouse', board: 'noredink' },
  { org: 'Mozilla Foundation',       platform: 'greenhouse', board: 'mozilla' },
  { org: 'Newsela',                  platform: 'greenhouse', board: 'newsela' },
  { org: 'Coursera',                 platform: 'greenhouse', board: 'coursera' },
  { org: '2U / edX',                 platform: 'greenhouse', board: '2u' },

  { org: 'CommonLit',                platform: 'lever', slug: 'commonlit' },
  { org: 'Age of Learning',          platform: 'lever', slug: 'aofl' },

  { org: 'Curriculum Associates',    platform: 'workday',
    host: 'curriculumassociates.wd5.myworkdayjobs.com',
    tenant: 'curriculumassociates', board: 'External' },
  { org: 'PBS',                      platform: 'workday',
    host: 'vhr-pbs.wd115.myworkdayjobs.com',
    tenant: 'vhr_pbs', board: 'PBSCareers' },
  { org: 'OCLC',                     platform: 'workday',
    host: 'oclc.wd1.myworkdayjobs.com',
    tenant: 'oclc', board: 'OCLC_Careers' },
  { org: 'arXiv (Cornell)',          platform: 'workday',
    host: 'cornell.wd1.myworkdayjobs.com',
    tenant: 'cornell', board: 'CornellCareerPage',
    keywordFilter: 'arxiv' },
  { org: 'Amplify Education',        platform: 'workday',
    host: 'amplify.wd1.myworkdayjobs.com',
    tenant: 'amplify', board: 'Amplify_Careers' },

  { org: 'Education Development Center', platform: 'smartrecruiters',
    company: 'educationdevelopmentcenter' },

  { org: 'Smithsonian Institution',  platform: 'rss',
    url: 'https://trustcareers.si.edu/jobs.rss' },

  { org: 'Internet Archive',         platform: 'adp',
    cid: '12261ced-819c-4d6d-af85-ffea690b6521',
    ccid: '9201102651278_3' },
  { org: 'CAST',                     platform: 'adp',
    cid: '8d062d6e-b354-4c8f-96ab-5157321963e8',
    ccid: '19000101_000001' },

  { org: 'Zearn',                    platform: 'workable', slug: 'zearn' },
  { org: 'Encyclopaedia Britannica', platform: 'workable', slug: 'encyclopaedia-britannica' },
  { org: 'Branching Minds',          platform: 'workable', slug: 'branchingminds' },

  { org: 'WestEd',                   platform: 'ultipro',
    subdomain: 'recruiting2', companyCode: 'WES1032WSTE',
    boardId: 'e5cebb97-720c-4bb5-8a63-deffd14ff13a' },
  { org: 'Oxford University Press',  platform: 'ultipro',
    subdomain: 'recruiting',  companyCode: 'OXF1001OXFUP',
    boardId: '605c06e0-940b-4a7b-a1e7-650907d3cbd0' },
  { org: 'Macmillan Learning',       platform: 'ultipro',
    subdomain: 'recruiting', companyCode: 'HOL1002HPHM',
    boardId: 'be27b89b-3cb9-491f-a1b0-42f8b077a9dd' },

  { org: 'American Museum of Natural History', platform: 'amnh',
    url: 'https://careers.amnh.org/postings/all_jobs' },

  { org: 'DPLA',                     platform: 'breezy',
    slug: 'digital-public-library-of-america' },
  { org: 'Creative Commons',         platform: 'breezy', slug: 'creative-commons' },

  { org: 'Library of Congress',      platform: 'usajobs',
    organizationCode: 'LC00', keyword: '' },
  { org: 'National Archives (NARA)', platform: 'usajobs',
    organizationCode: 'NQ00', keyword: '' },

  { org: 'Digital Promise',          platform: 'rippling',
    boardId: 'digital-promise' },

  { org: 'McGraw Hill',              platform: 'jibe',
    tenant: 'mheducation' },

  { org: 'HMH (Houghton Mifflin Harcourt)', platform: 'successfactors',
    host: 'careers.hmhco.com' },

  { org: 'Pearson',                  platform: 'oracle_orc',
    host: 'hccz.fa.em3.oraclecloud.com' },

  { org: 'Carnegie Learning',        platform: 'paycom',
    clientkey: 'CDD5880F7074A7DA04A1A00A3B0CD380' },
  { org: 'ISTE+ASCD',                platform: 'paycom',
    clientkey: '3285FE2D79C3558D801688A7322BB2BC' },

  { org: 'TERC',                     platform: 'paylocity',
    companyId: 'e4be93d2-8a30-4704-a7f7-0d2b9ead617f',
    careerUrl: 'https://www.terc.edu/careers/' },

  { org: 'Illustrative Mathematics', platform: 'jazzhr',
    slug: 'illustrativemathematics' },

  { org: 'McREL International',      platform: 'manual',
    url: 'https://www.mcrel.org/careers/',
    reason: 'Merged with ESC Region 13; AppliTrack tenant is the school district, not McREL' },
  { org: 'Wiki Education',           platform: 'manual',
    url: 'https://wikiedu.org/careers/',
    reason: 'No ATS — hand-coded careers page, submissions to jobs@wikiedu.org' },
  { org: 'HathiTrust (UMich)',       platform: 'manual',
    url: 'https://careers.umich.edu/',
    reason: 'Taleo / Oracle — no public API; filter by HathiTrust on portal' },
  { org: 'National Writing Project', platform: 'manual',
    url: 'https://www.nwp.org/about/jobs/',
    reason: 'Static page on communityinitiatives.org — manual review' },
  { org: 'Project Gutenberg',        platform: 'manual',
    url: 'https://www.gutenberg.org/about/contact_information.html',
    reason: 'Volunteer-only organization — no paid roles' },
];

const USAJOBS_EMAIL = 'cforte7171@gmail.com';
const USAJOBS_KEY   = 'JSs0daycA4t1u5X9j4FkhnoRDJQuh4nDlIDIvihE8Pg=';

const CC_STATE_KEY = 'crawler_state';

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


// Converts Workday's relative "Posted N Days Ago" strings to absolute ISO yyyy-MM-dd dates anchored to the crawl date.
// Input: str (string) — Workday relative date label.
// Output: ISO date string (yyyy-MM-dd) or empty string if unparseable.
function parseWorkdayPostedOn_(str) {
  if (!str) return '';
  if (typeof str !== 'string') return '';
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) return str.substring(0, 10);
  const s = str.toLowerCase().trim();
  let daysAgo = null;
  if (/posted\s+today/.test(s))         daysAgo = 0;
  else if (/posted\s+yesterday/.test(s)) daysAgo = 1;
  else {
    const m = s.match(/posted\s+(\d+)\+?\s+days?\s+ago/);
    if (m) daysAgo = Math.min(parseInt(m[1], 10), 30);
  }
  if (daysAgo === null) return '';
  const d = new Date(CC_CRAWL_DATE.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  return Utilities.formatDate(d, Session.getScriptTimeZone(), 'yyyy-MM-dd');
}

// Fetches all published jobs from a Greenhouse-hosted job board via the public boards-api endpoint.
// Input: entity (object with `board` slug).
// Output: array of normalized job objects.
function ccFetchGreenhouse(entity) {
  const url  = `https://boards-api.greenhouse.io/v1/boards/${entity.board}/jobs?content=true`;
  const resp = UrlFetchApp.fetch(url, {
    muteHttpExceptions: true,
    headers: { 'User-Agent': CC.UA },
  });
  if (resp.getResponseCode() !== 200) {
    ccLog(`  Greenhouse HTTP ${resp.getResponseCode()}`);
    return [];
  }
  const data = JSON.parse(resp.getContentText());
  const jobs = (data.jobs || []).slice(0, CC.MAX_JOBS);
  ccLog(`  Greenhouse: ${jobs.length} jobs`);
  return jobs.map(j => ({
    title:    j.title || '',
    location: (j.location && j.location.name) || '',
    workType: '',
    dept:     (j.departments && j.departments[0] && j.departments[0].name) || '',
    date:     j.updated_at ? j.updated_at.substring(0, 10) : '',
    salary:   '',
    url:      j.absolute_url || '',
    notes:    '',
  }));
}

// Fetches all postings from a Lever-hosted job board via the public v0 postings endpoint.
// Input: entity (object with `slug`).
// Output: array of normalized job objects.
function ccFetchLever(entity) {
  const url  = `https://api.lever.co/v0/postings/${entity.slug}?mode=json`;
  const resp = UrlFetchApp.fetch(url, {
    muteHttpExceptions: true,
    headers: { 'User-Agent': CC.UA },
  });
  if (resp.getResponseCode() !== 200) {
    ccLog(`  Lever HTTP ${resp.getResponseCode()}`);
    return [];
  }
  const jobs = JSON.parse(resp.getContentText());
  ccLog(`  Lever: ${jobs.length} jobs`);
  return jobs.map(j => ({
    title:    j.text || '',
    location: (j.categories && j.categories.location) || '',
    workType: (j.categories && j.categories.commitment) || '',
    dept:     (j.categories && j.categories.team) || '',
    date:     j.createdAt ? new Date(j.createdAt).toISOString().substring(0, 10) : '',
    salary:   '',
    url:      j.hostedUrl || '',
    notes:    '',
  }));
}

// Paginates through a Workday tenant's CXS job-search endpoint and collects all postings, with optional title keyword filter.
// Input: entity (object with `host`, `tenant`, `board`, optional `keywordFilter`).
// Output: array of normalized job objects.
function ccFetchWorkday(entity) {
  const base = `https://${entity.host}/wday/cxs/${entity.tenant}/${entity.board}`;
  const keywordFilter = (entity.keywordFilter || '').toLowerCase();
  let offset = 0, total = 9999;
  const results = [];
  while (offset < total && results.length < CC.MAX_JOBS) {
    const resp = UrlFetchApp.fetch(`${base}/jobs`, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify({
        appliedFacets: {}, limit: 20, offset,
        searchText: keywordFilter ? entity.keywordFilter : '',
      }),
      muteHttpExceptions: true,
      headers: { 'User-Agent': CC.UA, 'Accept': 'application/json' },
    });
    if (resp.getResponseCode() !== 200) break;
    const data     = JSON.parse(resp.getContentText());
    total          = data.total || 0;
    const postings = data.jobPostings || [];
    if (postings.length === 0) break;
    postings.forEach(j => {
      const job = {
        title:    j.title || '',
        location: j.locationsText || '',
        workType: j.jobPostingLocationType || '',
        dept:     '',
        date:     parseWorkdayPostedOn_(j.postedOn),
        salary:   '',
        url:      `https://${entity.host}${j.externalPath || ''}`,
        notes:    '',
      };
      if (keywordFilter && !job.title.toLowerCase().includes(keywordFilter)) {
        return;
      }
      results.push(job);
    });
    offset += postings.length;
  }
  ccLog(`  Workday: ${results.length} jobs`);
  return results;
}

// Fetches all published postings from a SmartRecruiters company via the public v1 postings endpoint.
// Input: entity (object with `company`).
// Output: array of normalized job objects.
function ccFetchSmartRecruiters(entity) {
  const url  = `https://api.smartrecruiters.com/v1/companies/${entity.company}/postings?status=PUBLISHED&limit=100`;
  const resp = UrlFetchApp.fetch(url, {
    muteHttpExceptions: true,
    headers: { 'User-Agent': CC.UA, 'Accept': 'application/json' },
  });
  if (resp.getResponseCode() !== 200) {
    ccLog(`  SmartRecruiters HTTP ${resp.getResponseCode()}`);
    return [];
  }
  const data = JSON.parse(resp.getContentText());
  const jobs = data.content || [];
  ccLog(`  SmartRecruiters: ${jobs.length} jobs`);
  return jobs.map(j => ({
    title:    j.name || '',
    location: [j.location && j.location.city, j.location && j.location.region,
               j.location && j.location.country].filter(Boolean).join(', '),
    workType: (j.typeOfEmployment && j.typeOfEmployment.label) || '',
    dept:     (j.department && j.department.label) || '',
    date:     j.releasedDate ? j.releasedDate.substring(0, 10) : '',
    salary:   '',
    url:      `https://jobs.smartrecruiters.com/${entity.company}/${j.id}`,
    notes:    '',
  }));
}

// Parses a Pinpoint RSS feed (Smithsonian) and extracts job items.
// Input: entity (object with `url`).
// Output: array of normalized job objects.
function ccFetchRSS(entity) {
  const resp = UrlFetchApp.fetch(entity.url, {
    muteHttpExceptions: true,
    headers: { 'User-Agent': CC.UA },
  });
  if (resp.getResponseCode() !== 200) {
    ccLog(`  RSS HTTP ${resp.getResponseCode()}`);
    return [];
  }
  const doc   = XmlService.parse(resp.getContentText());
  const items = doc.getRootElement().getChild('channel').getChildren('item');
  ccLog(`  RSS: ${items.length} jobs`);
  return items.map(item => ({
    title:    item.getChildText('title') || '',
    location: item.getChildText('location') || 'Washington, DC',
    workType: '',
    dept:     item.getChildText('category') || '',
    date:     item.getChildText('pubDate') ? ccNormalizeDate(item.getChildText('pubDate')) : '',
    salary:   '',
    url:      item.getChildText('link') || '',
    notes:    '',
  }));
}

// Fetches active job requisitions from an ADP Workforce Now public career center endpoint.
// Input: entity (object with `cid`, `ccid`).
// Output: array of normalized job objects with salary parsed from payGradeRange.
function ccFetchADP(entity) {
  const url  = `https://workforcenow.adp.com/mascsr/default/careercenter/public/events/staffing/v1/job-requisitions` +
               `?cid=${entity.cid}&ccid=${entity.ccid}&lang=en_US`;
  const resp = UrlFetchApp.fetch(url, {
    muteHttpExceptions: true,
    headers: {
      'User-Agent': CC.UA,
      'Accept': 'application/json',
    },
  });
  if (resp.getResponseCode() !== 200) {
    ccLog(`  ADP HTTP ${resp.getResponseCode()}`);
    return [];
  }
  const data = JSON.parse(resp.getContentText());
  const jobs = data.jobRequisitions || [];
  ccLog(`  ADP: ${jobs.length} jobs`);
  return jobs.map(j => {
    const pay = j.payGradeRange;
    let salary = '';
    if (pay && pay.minimumRate && pay.maximumRate) {
      salary = `$${Math.round(pay.minimumRate.amountValue / 1000)}k–$${Math.round(pay.maximumRate.amountValue / 1000)}k`;
    }
    return {
      title:    j.requisitionTitle || '',
      location: (j.primaryWorkLocation && j.primaryWorkLocation.nameCode &&
                 j.primaryWorkLocation.nameCode.shortName) || '',
      workType: '',
      dept:     '',
      date:     j.postDate ? j.postDate.substring(0, 10) : '',
      salary:   salary,
      url:      `https://workforcenow.adp.com/mascsr/default/mdf/recruitment/recruitment.html` +
                `?cid=${entity.cid}&ccid=${entity.ccid}&type=MP&lang=en_US&selectedMenuKey=currentOpenings&jobId=${j.itemID}`,
      notes:    '',
    };
  });
}

// Fetches all open jobs from a Workable account via the v3 search endpoint.
// Input: entity (object with `slug`).
// Output: array of normalized job objects.
function ccFetchWorkable(entity) {
  const url  = `https://apply.workable.com/api/v3/accounts/${entity.slug}/jobs`;
  const body = JSON.stringify({ query: '', location: [], department: [], worktype: [], remote: [] });
  const resp = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    payload: body,
    muteHttpExceptions: true,
    headers: { 'User-Agent': CC.UA, 'Accept': 'application/json' },
  });
  if (resp.getResponseCode() !== 200) {
    ccLog(`  Workable ${entity.slug} HTTP ${resp.getResponseCode()}`);
    return [];
  }
  const data = JSON.parse(resp.getContentText());
  const jobs = data.results || [];
  ccLog(`  Workable ${entity.slug}: ${jobs.length} jobs`);
  return jobs.map(j => {
    const loc = j.location || {};
    const city = [loc.city, loc.region, loc.country].filter(Boolean).join(', ');
    return {
      title:    j.title || '',
      location: (j.remote || j.workplace === 'remote') ? 'Remote' : city,
      workType: (j.remote || j.workplace === 'remote') ? 'Remote' : '',
      dept:     (j.department && j.department[0]) || '',
      date:     j.published ? j.published.substring(0, 10) : '',
      salary:   '',
      url:      `https://apply.workable.com/${entity.slug}/j/${j.shortcode}`,
      notes:    '',
    };
  });
}

// Performs the two-step CSRF-token-then-POST handshake required by UltiPro/UKG job boards and paginates through all results.
// Input: entity (object with `subdomain`, `companyCode`, `boardId`).
// Output: array of normalized job objects.
function ccFetchUltiPro(entity) {
  const { subdomain, companyCode, boardId } = entity;
  const boardUrl = `https://${subdomain}.ultipro.com/${companyCode}/JobBoard/${boardId}/`;
  const getResp = UrlFetchApp.fetch(boardUrl, {
    muteHttpExceptions: true,
    followRedirects: true,
    headers: { 'User-Agent': CC.UA },
  });
  if (getResp.getResponseCode() !== 200) {
    ccLog(`  UltiPro GET HTTP ${getResp.getResponseCode()}`);
    return [];
  }
  const html = getResp.getContentText();
  const tokenMatch = html.match(/__RequestVerificationToken[^>]+value="([^"]+)"/);
  if (!tokenMatch) {
    ccLog('  UltiPro: CSRF token not found in page');
    return [];
  }
  const csrfToken = tokenMatch[1];
  const headers     = getResp.getAllHeaders();
  const setCookies  = headers['Set-Cookie'] || headers['set-cookie'] || '';
  const cookieStr   = Array.isArray(setCookies)
    ? setCookies.map(c => c.split(';')[0]).join('; ')
    : setCookies.split(';')[0];
  const postUrl = `https://${subdomain}.ultipro.com/${companyCode}/JobBoard/${boardId}/JobBoardView/LoadSearchResults`;
  let allJobs = [], skip = 0, totalCount = 9999;
  while (allJobs.length < totalCount && allJobs.length < CC.MAX_JOBS) {
    const paginatedBody = JSON.stringify({
      opportunitySearch: {
        Top: 50, Skip: skip, QueryString: '',
        OrderBy: [{ Value: 'postedDateDesc', PropertyName: 'PostedDate', Direction: 'Descending' }],
        Filters: [],
      },
    });
    const postResp = UrlFetchApp.fetch(postUrl, {
      method: 'post',
      contentType: 'application/json',
      payload: paginatedBody,
      muteHttpExceptions: true,
      headers: {
        'User-Agent': CC.UA,
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'X-RequestVerificationToken': csrfToken,
        'Referer': boardUrl,
        'Cookie': cookieStr,
      },
    });
    if (postResp.getResponseCode() !== 200) {
      ccLog(`  UltiPro POST HTTP ${postResp.getResponseCode()}`);
      break;
    }
    const data = JSON.parse(postResp.getContentText());
    if (totalCount === 9999) totalCount = data.totalCount || 0;
    const opps = data.opportunities || [];
    if (opps.length === 0) break;
    opps.forEach(opp => {
      let workType = '';
      if (opp.JobLocationType === 3)      workType = 'Remote';
      else if (opp.JobLocationType === 2) workType = 'Hybrid';
      else if (opp.JobLocationType === 1) workType = 'On-site';
      const locs = Array.isArray(opp.Locations)
        ? opp.Locations.map(l => (l.LocalizedDescription || l.LocalizedName || '')).filter(Boolean).join('; ')
        : (opp.Locations || '');
      const location = workType === 'Remote' ? 'Remote' : locs;
      allJobs.push({
        title:    opp.Title || '',
        location: location,
        workType: workType,
        dept:     opp.JobCategoryName || '',
        date:     opp.PostedDate ? opp.PostedDate.substring(0, 10) : '',
        salary:   '',
        url:      `https://${subdomain}.ultipro.com/${companyCode}/JobBoard/${boardId}/OpportunityDetail?opportunityId=${opp.Id}`,
        notes:    opp.RequisitionNumber ? `Req: ${opp.RequisitionNumber}` : '',
      });
    });
    skip += 50;
    if (opps.length < 50) break;
  }
  ccLog(`  UltiPro ${companyCode}: ${allJobs.length} jobs`);
  return allJobs;
}

// Parses American Museum of Natural History's Atom XML jobs feed via regex.
// Input: entity (object with `url`).
// Output: array of normalized job objects (location defaulted to New York, NY).
function ccFetchAMNH(entity) {
  const resp = UrlFetchApp.fetch(entity.url, {
    muteHttpExceptions: true,
    headers: { 'User-Agent': CC.UA },
  });
  if (resp.getResponseCode() !== 200) {
    ccLog(`  AMNH HTTP ${resp.getResponseCode()}`);
    return [];
  }
  const html    = resp.getContentText();
  const entries = (html.match(/<entry>([\s\S]*?)<\/entry>/g) || []);
  ccLog(`  AMNH Atom: ${entries.length} entries`);
  return entries.map(e => {
    const title = (e.match(/<title[^>]*>([^<]+)<\/title>/)   || [])[1] || '';
    const link  = (e.match(/<link[^>]+href="([^"]+)"/)       || [])[1] || '';
    const date  = (e.match(/<published>([^<]+)<\/published>/) || [])[1] || '';
    return {
      title:    title,
      location: 'New York, NY',
      workType: '',
      dept:     '',
      date:     date ? date.split('T')[0] : '',
      salary:   '',
      url:      link,
      notes:    '',
    };
  });
}

// Fetches public job postings from a Breezy.hr tenant via the JSON endpoint.
// Input: entity (object with `slug`).
// Output: array of normalized job objects.
function ccFetchBreezy(entity) {
  const url  = `https://${entity.slug}.breezy.hr/json`;
  const resp = UrlFetchApp.fetch(url, {
    muteHttpExceptions: true,
    headers: { 'User-Agent': CC.UA, 'Accept': 'application/json' },
  });
  if (resp.getResponseCode() !== 200) {
    ccLog(`  Breezy ${entity.slug} HTTP ${resp.getResponseCode()}`);
    return [];
  }
  const jobs = JSON.parse(resp.getContentText()) || [];
  ccLog(`  Breezy ${entity.slug}: ${jobs.length} jobs`);
  return jobs.map(j => {
    const loc = j.location || {};
    const city = [loc.name, loc.city && loc.city.name, loc.country && loc.country.name]
      .filter(Boolean).join(', ');
    const isRemote = !!(loc.is_remote || j.is_remote);
    return {
      title:    j.name || '',
      location: isRemote ? 'Remote' : city,
      workType: isRemote ? 'Remote' : (j.type && j.type.name) || '',
      dept:     (j.department && j.department.name) || (j.category && j.category.name) || '',
      date:     j.published_date ? j.published_date.substring(0, 10) :
                (j.creation_date ? j.creation_date.substring(0, 10) : ''),
      salary:   '',
      url:      j.url || `https://${entity.slug}.breezy.hr/p/${j.id || j._id}`,
      notes:    '',
    };
  });
}

// Queries the official USAJOBS REST API for postings filtered by federal agency organization code.
// Input: entity (object with `organizationCode`, optional `keyword`).
// Output: array of normalized job objects with GS-pay-range salary.
function ccFetchUSAJobs(entity) {
  const email = USAJOBS_EMAIL;
  const key   = USAJOBS_KEY;
  const params = [
    'ResultsPerPage=100',
    'Page=1',
    `Organization=${encodeURIComponent(entity.organizationCode || '')}`,
  ];
  if (entity.keyword) params.push(`Keyword=${encodeURIComponent(entity.keyword)}`);
  const url = `https://data.usajobs.gov/api/search?${params.join('&')}`;
  const resp = UrlFetchApp.fetch(url, {
    muteHttpExceptions: true,
    headers: {
      'User-Agent':            email,
      'Authorization-Key':     key,
      'Host':                  'data.usajobs.gov',
      'Accept':                'application/json',
    },
  });
  if (resp.getResponseCode() !== 200) {
    ccLog(`  USAJOBS HTTP ${resp.getResponseCode()}`);
    return [];
  }
  const data  = JSON.parse(resp.getContentText());
  const items = (data.SearchResult && data.SearchResult.SearchResultItems) || [];
  ccLog(`  USAJOBS ${entity.organizationCode}: ${items.length} items`);
  return items.map(item => {
    const d = item.MatchedObjectDescriptor || {};
    const locs = (d.PositionLocation || []).map(l => l.LocationName).filter(Boolean).join('; ');
    const remuneration = (d.PositionRemuneration && d.PositionRemuneration[0]) || {};
    let salary = '';
    if (remuneration.MinimumRange && remuneration.MaximumRange) {
      salary = `$${Math.round(parseFloat(remuneration.MinimumRange) / 1000)}k–$${Math.round(parseFloat(remuneration.MaximumRange) / 1000)}k`;
    }
    const dept = (d.JobCategory && d.JobCategory[0] && d.JobCategory[0].Name) || '';
    return {
      title:    d.PositionTitle || '',
      location: locs,
      workType: (d.PositionScheduleType && d.PositionScheduleType[0] && d.PositionScheduleType[0].Name) || '',
      dept:     dept,
      date:     d.PublicationStartDate ? d.PublicationStartDate.substring(0, 10) : '',
      salary:   salary,
      url:      d.PositionURI || '',
      notes:    d.PositionID ? `Req: ${d.PositionID}` : '',
    };
  });
}

// Fetches Paylocity job listings by scraping the inline `window.pageData` JS variable from the public listing page.
// Input: entity (object with `companyId`).
// Output: array of normalized job objects.
function ccFetchPaylocity(entity) {
  const url  = `https://recruiting.paylocity.com/Recruiting/Jobs/All/${entity.companyId}`;
  const resp = UrlFetchApp.fetch(url, {
    muteHttpExceptions: true,
    followRedirects: true,
    headers: { 'User-Agent': CC.UA, 'Accept': 'text/html' },
  });
  if (resp.getResponseCode() !== 200) {
    ccLog(`  Paylocity HTTP ${resp.getResponseCode()}`);
    return [];
  }
  const html  = resp.getContentText();
  const match = html.match(/window\.pageData\s*=\s*(\{[\s\S]*?\});/);
  if (!match) {
    ccLog('  Paylocity: window.pageData not found');
    return [];
  }
  let data;
  try { data = JSON.parse(match[1]); }
  catch (e) { ccLog(`  Paylocity JSON parse error: ${e.message}`); return []; }
  const jobs = data.Jobs || [];
  ccLog(`  Paylocity ${entity.companyId}: ${jobs.length} jobs`);
  return jobs.map(j => {
    const loc = [j.LocationCity, j.LocationState, j.LocationCountry].filter(Boolean).join(', ');
    return {
      title:    j.JobTitle || j.Title || '',
      location: loc || j.Location || '',
      workType: j.JobType || j.EmploymentType || '',
      dept:     j.DepartmentName || j.Department || '',
      date:     j.DatePosted ? String(j.DatePosted).substring(0, 10) : '',
      salary:   '',
      url:      j.Url || j.ApplyUrl ||
                `https://recruiting.paylocity.com/Recruiting/Jobs/Details/${j.JobId || j.RequisitionId || ''}`,
      notes:    j.RequisitionId ? `Req: ${j.RequisitionId}` : '',
    };
  });
}

// Parses the public applytojob.com listings HTML page for a JazzHR tenant via regex on list-group-item blocks.
// Input: entity (object with `slug`).
// Output: array of normalized job objects.
function ccFetchJazzHR(entity) {
  const url  = `https://${entity.slug}.applytojob.com/apply`;
  const resp = UrlFetchApp.fetch(url, {
    muteHttpExceptions: true,
    followRedirects: true,
    headers: { 'User-Agent': CC.UA, 'Accept': 'text/html' },
  });
  if (resp.getResponseCode() !== 200) {
    ccLog(`  JazzHR ${entity.slug} HTTP ${resp.getResponseCode()}`);
    return [];
  }
  const html = resp.getContentText();
  const blockRe = /<li class=['"]list-group-item['"]>([\s\S]*?)<\/li>\s*<\/ul>/g;
  const results = [];
  let m;
  while ((m = blockRe.exec(html)) !== null) {
    const block = m[1];
    const headMatch = block.match(/list-group-item-heading[^>]*>\s*<a href="([^"]+)"[^>]*>\s*([\s\S]*?)\s*<\/a>/);
    if (!headMatch) continue;
    const jobUrl = headMatch[1];
    const title  = headMatch[2].replace(/\s+/g, ' ').trim();
    const locMatch  = block.match(/<li>\s*<i class=['"]fa fa-map-marker['"]><\/i>\s*([^<]+)<\/li>/);
    const deptMatch = block.match(/<li>\s*<i class=['"]fa fa-sitemap['"]><\/i>\s*([^<]+)<\/li>/);
    results.push({
      title:    title,
      location: locMatch ? locMatch[1].trim() : '',
      workType: '',
      dept:     deptMatch ? deptMatch[1].trim() : '',
      date:     '',
      salary:   '',
      url:      jobUrl,
      notes:    '',
    });
  }
  ccLog(`  JazzHR ${entity.slug}: ${results.length} jobs`);
  return results;
}

// Extracts Rippling ATS jobs from the embedded __NEXT_DATA__ JSON hydration payload on the iframe page.
// Input: entity (object with `boardId`).
// Output: array of normalized job objects.
function ccFetchRippling(entity) {
  const url  = `https://ats.rippling.com/embed/${entity.boardId}/jobs`;
  const resp = UrlFetchApp.fetch(url, {
    muteHttpExceptions: true,
    followRedirects: true,
    headers: { 'User-Agent': CC.UA, 'Accept': 'text/html' },
  });
  if (resp.getResponseCode() !== 200) {
    ccLog(`  Rippling ${entity.boardId} HTTP ${resp.getResponseCode()}`);
    return [];
  }
  const html = resp.getContentText();
  const match = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
  if (!match) {
    ccLog('  Rippling: __NEXT_DATA__ not found');
    return [];
  }
  let data;
  try { data = JSON.parse(match[1]); }
  catch (e) { ccLog(`  Rippling JSON parse error: ${e.message}`); return []; }
  const queries = (((data || {}).props || {}).pageProps || {}).dehydratedState || {};
  const qarr = queries.queries || [];
  let items = [];
  for (let i = 0; i < qarr.length; i++) {
    const st = qarr[i] && qarr[i].state && qarr[i].state.data;
    if (st && Array.isArray(st.items)) { items = st.items; break; }
  }
  ccLog(`  Rippling ${entity.boardId}: ${items.length} jobs`);
  return items.map(j => {
    const locs = (j.locations || []).map(l => l && l.name).filter(Boolean).join('; ');
    const wp   = (j.locations || []).map(l => l && l.workplaceType).filter(Boolean).join(', ');
    return {
      title:    j.name || '',
      location: locs,
      workType: wp,
      dept:     (j.department && j.department.name) || '',
      date:     '',
      salary:   '',
      url:      j.url || `https://ats.rippling.com/embed/${entity.boardId}/jobs/${j.id || ''}`,
      notes:    j.id ? `ID: ${j.id}` : '',
    };
  });
}

// Paginates the public Jibe Apply REST endpoint (talent.com platform) for an employer tenant.
// Input: entity (object with `tenant`).
// Output: array of normalized job objects.
function ccFetchJibe(entity) {
  const base = `https://${entity.tenant}.jibeapply.com`;
  let all = [], offset = 0, total = 9999;
  while (all.length < total && all.length < CC.MAX_JOBS) {
    const url  = `${base}/api/jobs?offset=${offset}&limit=100`;
    const resp = UrlFetchApp.fetch(url, {
      muteHttpExceptions: true,
      headers: { 'User-Agent': CC.UA, 'Accept': 'application/json' },
    });
    if (resp.getResponseCode() !== 200) {
      ccLog(`  Jibe ${entity.tenant} HTTP ${resp.getResponseCode()}`);
      break;
    }
    let data;
    try { data = JSON.parse(resp.getContentText()); }
    catch (e) { ccLog(`  Jibe JSON parse error: ${e.message}`); break; }
    if (total === 9999) total = data.totalCount || 0;
    const batch = data.jobs || [];
    if (batch.length === 0) break;
    all = all.concat(batch);
    offset += batch.length;
    if (batch.length < 100) break;
  }
  ccLog(`  Jibe ${entity.tenant}: ${all.length} jobs`);
  return all.map(w => {
    const j   = w && w.data ? w.data : (w || {});
    const loc = j.full_location || j.location_name || [j.city, j.state, j.country].filter(Boolean).join(', ');
    return {
      title:    j.title || '',
      location: loc || '',
      workType: j.job_type || j.employment_type || '',
      dept:     j.department || '',
      date:     j.posted_date ? String(j.posted_date).substring(0, 10) : '',
      salary:   '',
      url:      j.apply_url || (j.slug ? `${base}/jobs/${j.slug}` : ''),
      notes:    j.req_id ? `Req: ${j.req_id}` : '',
    };
  });
}

// Converts long-form English date strings like "May 8, 2026" to ISO yyyy-MM-dd format.
// Input: s (string) — long-form date.
// Output: ISO date string or empty string if unparseable.
function _ccParseLongDate(s) {
  if (!s) return '';
  const months = { jan:'01', feb:'02', mar:'03', apr:'04', may:'05', jun:'06',
                   jul:'07', aug:'08', sep:'09', oct:'10', nov:'11', dec:'12' };
  const m = s.match(/([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})/);
  if (!m) return '';
  const mo = months[m[1].toLowerCase().substring(0, 3)];
  if (!mo) return '';
  return `${m[3]}-${mo}-${String(m[2]).padStart(2, '0')}`;
}

// Paginates HMH's SAP SuccessFactors HTML grid by scraping data-row table elements with 25-row offset stepping.
// Input: entity (object with `host`).
// Output: array of normalized job objects.
function ccFetchSuccessFactors(entity) {
  const base = `https://${entity.host}`;
  let all = [], startrow = 0, safety = 0;
  while (safety++ < 40) {
    const url  = `${base}/search/?q=&startrow=${startrow}`;
    const resp = UrlFetchApp.fetch(url, {
      muteHttpExceptions: true,
      followRedirects: true,
      headers: { 'User-Agent': CC.UA, 'Accept': 'text/html' },
    });
    if (resp.getResponseCode() !== 200) {
      ccLog(`  SuccessFactors ${entity.host} HTTP ${resp.getResponseCode()}`);
      break;
    }
    const html  = resp.getContentText();
    const rowRe = /<tr class="data-row">([\s\S]*?)<\/tr>/g;
    let m, batch = 0;
    while ((m = rowRe.exec(html)) !== null) {
      const row     = m[1];
      const linkM   = row.match(/<a class="jobTitle-link"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/);
      if (!linkM) continue;
      const href    = linkM[1].startsWith('http') ? linkM[1] : base + linkM[1];
      const title   = linkM[2].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
      const locM    = row.match(/<span class="jobLocation">([\s\S]*?)<\/span>/);
      const deptM   = row.match(/<span class="jobDepartment">([\s\S]*?)<\/span>/);
      const shiftM  = row.match(/<span class="jobShifttype">([\s\S]*?)<\/span>/);
      const dateM   = row.match(/<span class="jobDate">([\s\S]*?)<\/span>/);
      const cleanT  = s => (s || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
      all.push({
        title:    title,
        location: cleanT(locM && locM[1]),
        workType: cleanT(shiftM && shiftM[1]),
        dept:     cleanT(deptM && deptM[1]),
        date:     _ccParseLongDate(cleanT(dateM && dateM[1])),
        salary:   '',
        url:      href,
        notes:    '',
      });
      batch++;
      if (all.length >= CC.MAX_JOBS) break;
    }
    if (batch === 0 || all.length >= CC.MAX_JOBS) break;
    startrow += 25;
  }
  ccLog(`  SuccessFactors ${entity.host}: ${all.length} jobs`);
  return all;
}

// Paginates Oracle Recruiting Cloud's public hcmRestApi requisitions endpoint for a tenant.
// Input: entity (object with `host`).
// Output: array of normalized job objects.
function ccFetchOracleORC(entity) {
  const base = `https://${entity.host}`;
  let all = [], offset = 0, total = 9999;
  while (all.length < total && all.length < CC.MAX_JOBS) {
    const url = `${base}/hcmRestApi/resources/latest/recruitingCEJobRequisitions`
              + `?finder=findReqs;limit=200,offset=${offset}&onlyData=true&expand=requisitionList`;
    const resp = UrlFetchApp.fetch(url, {
      muteHttpExceptions: true,
      headers: { 'User-Agent': CC.UA, 'Accept': 'application/json' },
    });
    if (resp.getResponseCode() !== 200) {
      ccLog(`  Oracle ORC ${entity.host} HTTP ${resp.getResponseCode()}`);
      break;
    }
    let data;
    try { data = JSON.parse(resp.getContentText()); }
    catch (e) { ccLog(`  Oracle ORC JSON parse error: ${e.message}`); break; }
    const root  = (data.items && data.items[0]) || {};
    if (total === 9999) total = root.TotalJobsCount || 0;
    const batch = root.requisitionList || [];
    if (batch.length === 0) break;
    all = all.concat(batch);
    offset += batch.length;
    if (batch.length < 200) break;
  }
  ccLog(`  Oracle ORC ${entity.host}: ${all.length} jobs`);
  return all.map(j => {
    const wp = j.WorkplaceType || (j.WorkplaceTypeCode || '').replace(/^ORA_/, '');
    return {
      title:    j.Title || '',
      location: j.PrimaryLocation || j.PrimaryLocationCountry || '',
      workType: wp,
      dept:     j.Organization || j.BusinessUnit || j.Department || '',
      date:     j.PostedDate ? String(j.PostedDate).substring(0, 10) : '',
      salary:   '',
      url:      `${base}/hcmUI/CandidateExperience/en/job/${j.Id}`,
      notes:    j.HotJobFlag ? 'Hot job' : '',
    };
  });
}

// Extracts a short-lived sessionJWT from Paycom's widget page, then posts to the Mantle ATS search endpoint with that token.
// Input: entity (object with `clientkey`).
// Output: array of normalized job objects.
function ccFetchPaycom(entity) {
  const widgetUrl = `https://www.paycomonline.net/v4/ats/web.php/jobs?clientkey=${entity.clientkey}`;
  const wResp = UrlFetchApp.fetch(widgetUrl, {
    muteHttpExceptions: true,
    followRedirects: true,
    headers: { 'User-Agent': CC.UA, 'Accept': 'text/html' },
  });
  if (wResp.getResponseCode() !== 200) {
    ccLog(`  Paycom widget HTTP ${wResp.getResponseCode()}`);
    return [];
  }
  const html = wResp.getContentText();
  const jwtM = html.match(/"sessionJWT":"([^"]+)"/);
  if (!jwtM) {
    ccLog('  Paycom: sessionJWT not found in widget');
    return [];
  }
  const jwt = jwtM[1];
  const apiUrl = 'https://portal-applicant-tracking.us-cent.paycomonline.net/api/ats/job-posting-previews/search';
  let all = [], skip = 0, total = 9999;
  while (all.length < total && all.length < CC.MAX_JOBS) {
    const payload = {
      skip: skip, take: 50,
      filtersForQuery: {
        distanceFrom: 0, workEnvironments: [], positionTypes: [], educationLevels: [],
        categories: [], travelTypes: [], shiftTypes: [], otherFilters: [],
        keywordSearchText: '', location: '', sortOption: '',
      },
    };
    const resp = UrlFetchApp.fetch(apiUrl, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true,
      headers: {
        'User-Agent': CC.UA,
        'Accept': 'application/json',
        'Authorization': jwt,
        'Locale': 'en-US',
      },
    });
    if (resp.getResponseCode() !== 200) {
      ccLog(`  Paycom HTTP ${resp.getResponseCode()} body: ${resp.getContentText().substring(0, 120)}`);
      break;
    }
    let data;
    try { data = JSON.parse(resp.getContentText()); }
    catch (e) { ccLog(`  Paycom JSON parse error: ${e.message}`); break; }
    if (total === 9999) total = data.jobPostingPreviewsCount || 0;
    const batch = data.jobPostingPreviews || [];
    if (batch.length === 0) break;
    all = all.concat(batch);
    skip += batch.length;
    if (batch.length < 50) break;
  }
  ccLog(`  Paycom ${entity.clientkey.substring(0, 8)}: ${all.length} jobs`);
  return all.map(j => ({
    title:    j.jobTitle || '',
    location: j.locations || '',
    workType: j.positionType || j.remoteType || '',
    dept:     '',
    date:     j.postedOn ? String(j.postedOn).substring(0, 10) : '',
    salary:   '',
    url:      `https://www.paycomonline.net/v4/ats/web.php/jobs/ViewJobDetails?job=${j.jobId}&clientkey=${entity.clientkey}`,
    notes:    j.isHotJob ? 'Hot job' : '',
  }));
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


// Identifies non-fit roles (interns, volunteers, fellows, contractors, temps, part-time) by title regex.
// Input: title (string).
// Output: boolean (true = junk, should be filtered out).
function ccIsJunk(title) {
  if (!title) return true;
  return /\b(intern|internship|volunteer|fellow(?:ship)?|contractor|temp(?:orary)?|part.time)\b/i.test(title);
}

// Determines whether a posting's date is older than CC.MAX_AGE_DAYS from the crawl date.
// Input: dateStr (ISO date string or any parseable date).
// Output: boolean (true = too old, should be filtered out).
function ccIsTooOld(dateStr) {
  if (!dateStr) return false;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return false;
    return (CC_CRAWL_DATE - d) > CC.MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
  } catch (e) { return false; }
}

// Filters out international locations by checking against an explicit blocklist of countries, regions, and major cities; non-US match wins over "remote" so "India (Remote)" is correctly excluded.
// Input: loc (string) — raw location text.
// Output: boolean (true = non-US, should be filtered out).
function ccIsNonUS(loc) {
  if (!loc) return false;
  const l = loc.toLowerCase();
  const nonUS = [
    'united kingdom', 'uk', 'england', 'scotland', 'wales',
    'canada', 'australia', 'new zealand', 'ireland',
    'germany', 'france', 'netherlands', 'sweden', 'norway',
    'denmark', 'finland', 'switzerland', 'spain', 'italy',
    'poland', 'ukraine',
    'israel', 'tel aviv', 'uae', 'dubai', 'pakistan',
    'egypt', 'cairo', 'türkiye', 'turkey', 'istanbul',
    'india', 'japan', 'china', 'hong kong', 'singapore', 'philippines', 'manila',
    'sri lanka', 'thailand',
    'hyderabad', 'mumbai', 'delhi', 'bangalore', 'pune', 'lucknow',
    'karnataka', 'maharashtra', 'telangana', 'uttar pradesh',
    'bhubaneswar', 'odisha', 'jagtial', 'khammam', 'nizamabad',
    'siddipet', 'vikarabad', 'warangal', 'yadadri',
    'nabarangpur', 'keonjhar',
    'mexico', 'brazil', 'são paulo', 'sao paulo',
    'argentina', 'chile', 'colombia', 'costa rica',
    'south africa',
    'oxford', 'london', 'toronto', 'sydney', 'berlin', 'paris', 'tokyo',
  ];
  if (nonUS.some(n => l.includes(n))) return true;
  if (/remote|united states|\busa?\b|\bus\b/.test(l)) return false;
  return false;
}

// Three-tier classifier (Core / Peripheral / Excluded) based on substring matches against department and title fields.
// Input: deptRaw (string), titleRaw (string).
// Output: object { tier: 1|2|3, label: 'Core' | 'Peripheral' | 'Excluded' }.
function classifyDept_(deptRaw, titleRaw) {
  const dept  = String(deptRaw  || '').toLowerCase();
  const title = String(titleRaw || '').toLowerCase();
  const haystack = (dept + ' || ' + title);
  for (let i = 0; i < DEPT_TIER_3.length; i++) {
    const kw = DEPT_TIER_3[i];
    if (haystack.indexOf(kw) >= 0) return { tier: 3, label: 'Excluded' };
  }
  for (let i = 0; i < DEPT_TIER_1.length; i++) {
    if (haystack.indexOf(DEPT_TIER_1[i]) >= 0) return { tier: 1, label: 'Core' };
  }
  for (let i = 0; i < DEPT_TIER_2.length; i++) {
    if (haystack.indexOf(DEPT_TIER_2[i]) >= 0) return { tier: 2, label: 'Peripheral' };
  }
  return { tier: 2, label: 'Peripheral' };
}


// Coerces date strings of varied format into ISO yyyy-MM-dd shape, with passthrough for already-ISO input.
// Input: raw (string) — date in any format.
// Output: ISO date string or original raw if unparseable.
function ccNormalizeDate(raw) {
  if (!raw) return '';
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.substring(0, 10);
  try {
    const d = new Date(raw);
    if (!isNaN(d.getTime())) return d.toISOString().substring(0, 10);
  } catch (e) {}
  return raw;
}

// Computes the integer day difference between two date strings (clamped at zero).
// Input: dateStr (start date), todayStr (end date).
// Output: non-negative integer or empty string if either date is invalid.
function ccDaysBetween(dateStr, todayStr) {
  try {
    const d1 = new Date(dateStr);
    const d2 = new Date(todayStr);
    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return '';
    return Math.max(0, Math.round((d2 - d1) / (24 * 60 * 60 * 1000)));
  } catch (e) { return ''; }
}


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
