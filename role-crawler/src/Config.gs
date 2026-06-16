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
