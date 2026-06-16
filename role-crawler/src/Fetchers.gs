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
