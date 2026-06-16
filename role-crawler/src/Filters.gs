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
