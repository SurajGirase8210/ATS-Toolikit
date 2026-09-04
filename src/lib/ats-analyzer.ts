import type { ATSResult, FormatCheck, Keyword, KeywordMatch, SectionCheck, Suggestion, JobRequirement } from '@/types/ats';

const STOP_WORDS = new Set(`a an and are as at be been being but by can could did do does for from had has have he her hers him his how i if in into is it its just me more most my no nor not of on or our ours she should so some such than that the their theirs them then there these they this those through to too under until up us very was we were what when where which who why will with would you your yours about after again against all also am any because before between both during each few further here how into itself once only other over own same same some than too very`.split(' '));

const SKILL_ALIASES: Record<string, string[]> = {
  'machine learning': ['machine learning', 'ml'],
  'artificial intelligence': ['artificial intelligence', 'ai'],
  'power bi': ['power bi', 'powerbi'],
  'data analysis': ['data analysis', 'data analytics', 'analytics'],
  'data visualization': ['data visualization', 'data visualisation'],
  'business intelligence': ['business intelligence', 'bi'],
  'sql': ['sql', 'structured query language'],
  'python': ['python'],
  'excel': ['excel', 'microsoft excel'],
  'tableau': ['tableau'],
  'aws': ['aws', 'amazon web services'],
  'azure': ['azure', 'microsoft azure'],
  'gcp': ['gcp', 'google cloud'],
  'javascript': ['javascript', 'js'],
  'typescript': ['typescript', 'ts'],
  'react': ['react', 'react.js', 'reactjs'],
  'node.js': ['node.js', 'nodejs', 'node'],
  'next.js': ['next.js', 'nextjs'],
  'postgresql': ['postgresql', 'postgres'],
  'mysql': ['mysql'],
  'git': ['git'],
  'github': ['github'],
  'docker': ['docker'],
  'kubernetes': ['kubernetes', 'k8s'],
  'agile': ['agile'],
  'scrum': ['scrum'],
  'jira': ['jira'],
  'testing': ['testing', 'test automation', 'quality assurance', 'qa'],
  'reporting': ['reporting', 'reports', 'report'],
  'data cleaning': ['data cleaning', 'data cleansing'],
  'data engineering': ['data engineering'],
  'data science': ['data science'],
  'deep learning': ['deep learning'],
  'nlp': ['nlp', 'natural language processing'],
  'pandas': ['pandas'],
  'numpy': ['numpy'],
  'matplotlib': ['matplotlib'],
  'seaborn': ['seaborn'],
  'scikit-learn': ['scikit-learn', 'sklearn'],
  'tensorflow': ['tensorflow'],
  'pytorch': ['pytorch'],
  'java': ['java'],
  'spring boot': ['spring boot'],
  'html': ['html', 'html5'],
  'css': ['css', 'css3'],
};

const TECHNICAL = new Set(Object.keys(SKILL_ALIASES));
const SOFT_SKILLS = new Set('communication leadership collaboration teamwork analytical problem-solving problem solving presentation adaptability flexibility creativity innovation negotiation mentoring stakeholder management time management attention to detail'.split(' '));
const ACTION_VERBS = new Set('achieved analyzed automated built collaborated created designed developed improved implemented led managed optimized reduced increased generated delivered deployed transformed migrated validated tested maintained resolved streamlined engineered presented researched'.split(' '));
const CERTIFICATIONS = new Set('aws certified scrum master pmp comptia cisco azure certification'.split(' '));

const SECTION_DEFS: Array<{ name: string; aliases: string[]; required: boolean }> = [
  { name: 'Contact Information', aliases: ['contact', 'contact information', 'contact details'], required: true },
  { name: 'Professional Summary', aliases: ['professional summary', 'summary', 'profile', 'objective', 'career objective'], required: true },
  { name: 'Work Experience', aliases: ['work experience', 'professional experience', 'experience', 'employment history'], required: true },
  { name: 'Skills', aliases: ['skills', 'technical skills', 'core skills', 'key skills', 'competencies'], required: true },
  { name: 'Education', aliases: ['education', 'academic background', 'qualifications'], required: true },
  { name: 'Projects', aliases: ['projects', 'academic projects', 'personal projects', 'project experience'], required: false },
  { name: 'Certifications', aliases: ['certifications', 'certificates', 'licenses'], required: false },
];

const normalize = (value: string) => value.toLowerCase().replace(/[“”‘’]/g, "'").replace(/[^a-z0-9+#./& -]/gi, ' ').replace(/\s+/g, ' ').trim();
const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const countOccurrences = (text: string, phrase: string) => {
  const n = normalize(text);
  const p = normalize(phrase);
  if (!p) return 0;
  const regex = new RegExp(`(^|[^a-z0-9+#])${escapeRegExp(p).replace(/ /g, '\\s+')}(?=$|[^a-z0-9+#])`, 'gi');
  return (n.match(regex) || []).length;
};

function extractNgrams(text: string): string[] {
  const tokens = normalize(text).split(/\s+/).filter(Boolean);
  const phrases: string[] = [];
  for (let n = 2; n <= 3; n++) {
    for (let i = 0; i <= tokens.length - n; i++) {
      const gram = tokens.slice(i, i + n);
      if (gram.some(t => STOP_WORDS.has(t)) || gram.some(t => t.length < 2)) continue;
      phrases.push(gram.join(' '));
    }
  }
  return phrases;
}

function classify(term: string): Keyword['category'] {
  if (TECHNICAL.has(term)) return term in SKILL_ALIASES ? 'technical' : 'tool';
  if (SOFT_SKILLS.has(term)) return 'soft_skill';
  if (CERTIFICATIONS.has(term)) return 'certification';
  if (/\b(data|analytics|analysis|software|developer|engineering|marketing|finance|sales|product|operations|technology|reporting)\b/i.test(term)) return 'domain';
  return 'other';
}

function extractKeywords(text: string): Keyword[] {
  const normalized = normalize(text);
  const scores = new Map<string, { count: number; weight: number; category: Keyword['category'] }>();

  Object.entries(SKILL_ALIASES).forEach(([canonical, aliases]) => {
    const count = aliases.reduce((sum, alias) => sum + countOccurrences(normalized, alias), 0);
    if (count > 0) scores.set(canonical, { count, weight: 3, category: 'technical' });
  });

  const tokens = normalized.split(/\s+/).filter(Boolean);
  for (const token of tokens) {
    if (token.length < 3 || STOP_WORDS.has(token) || /^\d+$/.test(token)) continue;
    const category = classify(token);
    if (category === 'other') continue;
    const existing = scores.get(token);
    scores.set(token, { count: (existing?.count || 0) + 1, weight: Math.max(existing?.weight || 0, category === 'soft_skill' ? 1.25 : 1.5), category });
  }

  for (const phrase of extractNgrams(normalized)) {
    const category = classify(phrase);
    if (category === 'other') continue;
    const count = countOccurrences(normalized, phrase);
    if (count < 1) continue;
    const existing = scores.get(phrase);
    scores.set(phrase, { count: Math.max(existing?.count || 0, count), weight: Math.max(existing?.weight || 0, 1.75), category });
  }

  return Array.from(scores.entries())
    .map(([word, data]) => ({ word, ...data, importance: Math.min(100, Math.round(data.weight * 20 + Math.min(data.count, 5) * 8)) }))
    .sort((a, b) => b.importance - a.importance || b.count - a.count)
    .slice(0, 40);
}

function extractJobMeta(jd: string) {
  const lines = jd.split(/\r?\n/).map(x => x.trim()).filter(Boolean);
  const jobLine = lines.find(line => /^(job title|position|role)\s*:/i.test(line));
  const companyLine = lines.find(line => /^(company|organization)\s*:/i.test(line));
  return {
    jobTitle: jobLine?.split(':').slice(1).join(':').trim(),
    companyName: companyLine?.split(':').slice(1).join(':').trim(),
  };
}

function detectSections(resume: string): SectionCheck[] {
  const normalized = normalize(resume);
  return SECTION_DEFS.map(section => ({
    ...section,
    found: section.aliases.some(alias => new RegExp(`(^|\\n)\\s*${escapeRegExp(alias).replace(/ /g, '\\s+')}\\s*($|[:\\-])`, 'im').test(resume) || normalized.includes(alias)),
  }));
}

export function analyzeFormatting(resume: string): FormatCheck[] {
  const lines = resume.split(/\r?\n/).filter(line => line.trim());
  const words = resume.trim().split(/\s+/).filter(Boolean).length;
  const bullets = (resume.match(/(^|\n)\s*(?:[-•●▪◦*]|\d+[.)])\s+/g) || []).length;
  const columns = lines.length > 12 ? lines.filter(l => /\s{5,}/.test(l)).length / lines.length > 0.25 : false;
  return [
    { name: 'No Tables', passed: !(/\|[^\n|]+\|/.test(resume) || /\b(table|column 1|column 2)\b/i.test(resume)), severity: 'high', description: 'Tables can cause reading-order problems in ATS parsers.', fix: 'Use a simple single-column text layout.' },
    { name: 'Single Column Layout', passed: !columns, severity: 'high', description: 'Large whitespace-separated blocks can indicate multiple columns.', fix: 'Use one continuous column with standard headings.' },
    { name: 'No Image References', passed: !(/\.(png|jpg|jpeg|gif|svg|bmp)\b/i.test(resume)), severity: 'medium', description: 'ATS systems may ignore text embedded inside images.', fix: 'Keep contact details, skills and achievements as selectable text.' },
    { name: 'Standard Characters', passed: !/[─│┌┐└┘├┤┬┴┼█▓░▒◆■□▲▼★☆]/.test(resume), severity: 'medium', description: 'Decorative symbols can create parsing issues.', fix: 'Use standard hyphen bullets and plain text.' },
    { name: 'Appropriate Length', passed: words >= 250 && words <= 900, severity: 'low', description: words < 250 ? 'Resume may be too short to demonstrate impact.' : words > 900 ? 'Resume may be too long for an early-career application.' : 'Resume length is in a reasonable range.', fix: words < 250 ? 'Add relevant experience, projects and measurable results.' : words > 900 ? 'Remove repetitive or low-value content.' : 'Keep the current level of detail.' },
    { name: 'Uses Bullet Points', passed: bullets >= 4, severity: 'low', description: 'Bullets make achievements easier to scan.', fix: 'Use concise bullets beginning with action verbs.' },
    { name: 'Includes Metrics', passed: (resume.match(/\b\d+(?:\.\d+)?\s*(?:%|x|k|m|million|thousand)?\b|\$\s?\d[\d,]*/gi) || []).length >= 3, severity: 'low', description: 'Quantified outcomes make claims more credible.', fix: 'Add percentages, counts, time saved, revenue, accuracy or other truthful measures.' },
  ];
}


const SEMANTIC_CONCEPTS: Record<string,string[]> = {
  'Stakeholder Management':['stakeholder','cross-functional','collaboration','partners','business users'],
  'Data Quality':['data quality','validation','quality checks','audit','accuracy'],
  'Reporting & Insights':['reporting','reports','insights','dashboards','business intelligence'],
  'Optimization':['optimize','optimization','performance','improved','improvement','efficiency'],
  'Machine Learning':['machine learning','ml','models','model testing','prediction'],
  'Agile Delivery':['agile','scrum','sprint','iterative','backlog'],
  'Data Visualization':['data visualization','visualization','Power BI','Tableau','charts','dashboards'],
  'Automation':['automated','automation','ETL','pipeline','scheduled'],
};
function semanticAnalysis(jd:string,resume:string){const j=normalize(jd),r=normalize(resume);const matches=Object.entries(SEMANTIC_CONCEPTS).map(([concept,terms])=>{const jt=terms.filter(t=>j.includes(t.toLowerCase()));const rt=terms.filter(t=>r.includes(t.toLowerCase()));return {concept,jdTerms:jt,resumeTerms:rt,matched:jt.length>0&&rt.length>0};});const relevant=matches.filter(x=>x.jdTerms.length);const score=relevant.length?Math.round(relevant.filter(x=>x.matched).length/relevant.length*100):100;return {matches,score};}
function toneAnalysis(resume:string){const checks=[
{name:'Passive / hedging language',passed:!(/\b(maybe|perhaps|helped with|was responsible for|assisted with|tried to|worked on)\b/i.test(resume)),detail:'Prefer direct ownership such as built, analyzed, automated or delivered where truthful.'},
{name:'Tense consistency',passed:!(/\b(is|are|am)\b[^.\n]{0,80}\b(built|developed|created|analyzed)\b/i.test(resume)),detail:'Keep current roles consistently present tense and completed work consistently past tense.'},
{name:'Vague claims',passed:!(/\b(hard-working|detail-oriented|team player|responsible for|various|many|some)\b/i.test(resume)),detail:'Replace generic claims with evidence, scope and measurable outcomes.'}];return checks;}
function compareKeywords(jdKeywords: Keyword[], jd: string, resume: string) {
  const found: KeywordMatch[] = [], missing: KeywordMatch[] = [], low: KeywordMatch[] = [];
  for (const keyword of jdKeywords) {
    const aliases = SKILL_ALIASES[keyword.word] || [keyword.word];
    const resumeCount = Math.max(...aliases.map(alias => countOccurrences(resume, alias)), 0);
    const jdCount = Math.max(keyword.count, Math.max(...aliases.map(alias => countOccurrences(jd, alias)), 0));
    const status: KeywordMatch['status'] = resumeCount === 0 ? 'missing' : resumeCount < Math.max(1, Math.ceil(jdCount * 0.5)) ? 'low' : 'found';
    const match: KeywordMatch = { keyword: keyword.word, jdCount, resumeCount, category: keyword.category, status, weight: keyword.weight, importance: keyword.importance };
    if (status === 'found') found.push(match); else if (status === 'low') low.push(match); else missing.push(match);
  }
  return { found, missing, low };
}

function contentScore(resume: string, sections: SectionCheck[]) {
  const actionVerbs = (normalize(resume).split(/\s+/).filter(w => ACTION_VERBS.has(w))).length;
  const metrics = (resume.match(/\b\d+(?:\.\d+)?\s*(?:%|x|k|m|million|thousand)?\b|\$\s?\d[\d,]*/gi) || []).length;
  const bullets = (resume.match(/(^|\n)\s*(?:[-•●▪◦*]|\d+[.)])\s+/g) || []).length;
  let score = 30;
  if (sections.some(s => s.name === 'Projects' && s.found)) score += 15;
  if (bullets >= 4) score += 20;
  if (actionVerbs >= 5) score += 15;
  if (metrics >= 3) score += 20;
  return Math.min(100, score);
}

function readabilityScore(resume: string) {
  const words = resume.trim().split(/\s+/).filter(Boolean);
  const sentences = Math.max(1, resume.split(/[.!?]+/).filter(Boolean).length);
  const avg = words.length / sentences;
  const longLines = resume.split(/\r?\n/).filter(x => x.length > 140).length;
  let score = 100;
  if (avg > 35) score -= 20;
  if (avg > 45) score -= 20;
  if (longLines > 4) score -= 20;
  return Math.max(0, score);
}

function generateSuggestions(result: Omit<ATSResult, 'suggestions' | 'summary'>): Suggestion[] {
  const suggestions: Suggestion[] = [];
  result.keywordsMissing.sort((a, b) => b.importance - a.importance).slice(0, 8).forEach(k => suggestions.push({ type: 'missing_keyword', priority: 1, title: `Consider adding “${k.keyword}”`, description: `This appears ${k.jdCount} time(s) in the job description and is not clearly represented in the resume.`, action: 'Add it only if you genuinely have the skill or experience. Prefer a relevant bullet or skills entry over keyword stuffing.' }));
  result.keywordsLow.sort((a, b) => b.importance - a.importance).slice(0, 6).forEach(k => suggestions.push({ type: 'low_keyword', priority: 2, title: `Strengthen “${k.keyword}”`, description: `The job description emphasizes it more than your resume does (${k.jdCount} vs ${k.resumeCount}).`, action: 'If truthful, mention the skill in a relevant project, experience bullet or skills section.' }));
  result.formatChecks.filter(x => !x.passed).forEach(x => suggestions.push({ type: 'format_issue', priority: x.severity === 'high' ? 2 : 3, title: x.name, description: x.description, action: x.fix }));
  result.sections.filter(x => x.required && !x.found).forEach(x => suggestions.push({ type: 'missing_section', priority: 3, title: `Add ${x.name}`, description: 'This standard resume section was not detected.', action: `Add a clear “${x.name}” heading and keep the content directly below it.` }));
  if (result.resumeStats.metrics < 3) suggestions.push({ type: 'content', priority: 4, title: 'Add measurable achievements', description: 'The analyzer found fewer than three quantified results.', action: 'Where truthful, add percentages, counts, time saved, accuracy, revenue, users or other measurable outcomes.' });
  if (result.resumeStats.actionVerbs < 5) suggestions.push({ type: 'content', priority: 4, title: 'Use stronger action verbs', description: 'The resume has limited use of achievement-oriented verbs.', action: 'Start bullets with verbs such as analyzed, automated, built, improved, reduced, developed or delivered.' });
  if (result.semanticScore < 70) suggestions.push({ type: 'semantic', priority: 2, title: 'Strengthen conceptual alignment', description: 'Some job themes are present in the JD but not clearly evidenced in the resume.', action: 'Add truthful evidence that demonstrates the same capability, even if the exact wording differs.' });
  if (result.readabilityScore < 80) suggestions.push({ type: 'readability', priority: 4, title: 'Shorten dense sentences', description: 'Some resume lines appear too long.', action: 'Split long bullets into concise, result-focused statements.' });
  return suggestions.sort((a, b) => a.priority - b.priority);
}

function extractSectionText(resume:string, aliases:string[]) {
  const lines=resume.split(/\r?\n/);
  const out:string[]=[]; let active=false;
  const allAliases=aliases.map(a=>a.toLowerCase());
  for(const raw of lines){
    const clean=raw.trim(); const lower=clean.toLowerCase();
    if(allAliases.some(a=>lower===a || lower.startsWith(a+':') || lower.startsWith(a+' -'))){active=true; continue;}
    if(active && SECTION_DEFS.some(sec=>sec.aliases.some(a=>lower===a || lower.startsWith(a+':') || lower.startsWith(a+' -')))) break;
    if(active && clean) out.push(clean);
  }
  return out.join('\n');
}

function requirementCategory(term:string, jd:string): JobRequirement['category'] {
  const t=term.toLowerCase(), ctx=jd.toLowerCase();
  if(/\b(required|must have|required skills|mandatory)\b/.test(ctx) && ctx.includes(t)) return 'must_have';
  if(/\b(preferred|preferred skills|nice to have|bonus|plus)\b/.test(ctx) && ctx.includes(t)) return 'nice_to_have';
  if(/\b(years?|experience)\b/.test(ctx) && ctx.includes(t)) return 'experience';
  if(/\b(degree|bachelor|master|education|qualification)\b/.test(ctx) && ctx.includes(t)) return 'education';
  if(/\b(responsibilit|responsible|duties|you will|build|develop|create|analy[sz]e|manage|lead|support)\b/.test(ctx) && ctx.includes(t)) return 'responsibility';
  if(SOFT_SKILLS.has(t)) return 'soft_skill';
  if(TECHNICAL.has(t)) return 'tool';
  if(/\b(fintech|healthcare|banking|retail|saas|ecommerce|insurance|marketing|finance|supply chain|hr)\b/.test(t)) return 'domain';
  return 'important';
}

export function analyzeJobDescription(jd:string) {
  const kws=extractKeywords(jd);
  const lines=jd.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
  const titleLine=lines.find(x=>/^(job title|position|role|opening)\s*:/i.test(x)) || lines[0] || '';
  const companyLine=lines.find(x=>/^(company|organization|employer)\s*:/i.test(x));
  const locationLine=lines.find(x=>/^(location|based in)\s*:/i.test(x));
  const salaryLine=lines.find(x=>/^(salary|compensation|pay)\s*:/i.test(x));
  const experience=[...jd.matchAll(/(\d+\+?\s*(?:-|to)?\s*\d*)\s*(?:years?|yrs?)(?:\s+of)?\s+experience/gi)].map(m=>m[0]).slice(0,3);
  const requirements=kws.map(k=>({term:k.word,category:requirementCategory(k.word,jd),importance:k.importance,evidence:lines.find(l=>l.toLowerCase().includes(k.word.toLowerCase()))||'',jdCount:k.count}));
  return {
    jobTitle:titleLine.replace(/^(job title|position|role|opening)\s*:\s*/i,'').trim() || undefined,
    companyName:companyLine?.split(':').slice(1).join(':').trim(),
    location:locationLine?.split(':').slice(1).join(':').trim(),
    salary:salaryLine?.split(':').slice(1).join(':').trim(),
    experience,
    requirements
  };
}

function evidenceWarnings(jd:string,resume:string,missing:KeywordMatch[]) {
  const warnings:string[]=[];
  for(const k of missing.slice(0,12)){
    const c=k.category;
    if(['technical','tool','certification'].includes(c)) warnings.push(`No clear evidence for ${k.keyword}. Do not add it unless you genuinely have this skill or experience.`);
  }
  if(/\baws\b/i.test(jd) && !/\baws\b|\bamazon web services\b/i.test(resume)) warnings.push('AWS is mentioned in the job description but there is no clear AWS evidence in the resume.');
  return Array.from(new Set(warnings));
}

function sectionCoverage(resume:string) {
  const sections:{name:string;aliases:string[]}[]=[
    {name:'Summary',aliases:['professional summary','summary','profile','objective']},
    {name:'Skills',aliases:['skills','technical skills','core skills','key skills']},
    {name:'Experience',aliases:['work experience','professional experience','experience','employment history']},
    {name:'Projects',aliases:['projects','academic projects','personal projects']},
    {name:'Education',aliases:['education','academic background','qualifications']},
    {name:'Certifications',aliases:['certifications','certificates','licenses']}
  ];
  const result:Record<string,number>={};
  for(const x of sections){
    const text=extractSectionText(resume,x.aliases);
    result[x.name]=text.trim()?100:0;
  }
  return result;
}

export function analyzeResume(jd: string, resume: string): ATSResult {
  const jdKeywords = extractKeywords(jd);
  const compared = compareKeywords(jdKeywords, jd, resume);
  const formatChecks = analyzeFormatting(resume);
  const semantic = semanticAnalysis(jd, resume);
  const toneChecks = toneAnalysis(resume);
  const sections = detectSections(resume);
  const keywordWeightTotal = jdKeywords.reduce((sum, k) => sum + k.weight, 0) || 1;
  const keywordScore = Math.round(jdKeywords.reduce((sum, k) => {
    const match = compared.found.find(x => x.keyword === k.word) || compared.low.find(x => x.keyword === k.word);
    if (!match) return sum;
    return sum + k.weight * (match.status === 'found' ? 1 : 0.5);
  }, 0) / keywordWeightTotal * 100);
  const formatScore = Math.round(formatChecks.reduce((sum, check) => sum + (check.passed ? 1 : check.severity === 'low' ? 0.5 : 0), 0) / formatChecks.length * 100);
  const requiredSections = sections.filter(s => s.required);
  const sectionScore = Math.round(requiredSections.filter(s => s.found).length / requiredSections.length * 100);
  const content = contentScore(resume, sections);
  const readability = readabilityScore(resume);
  const overallScore = Math.round(keywordScore * 0.40 + formatScore * 0.18 + sectionScore * 0.17 + content * 0.10 + readability * 0.05 + semantic.score * 0.10);
  const stats = {
    words: resume.trim().split(/\s+/).filter(Boolean).length,
    characters: resume.length,
    bullets: (resume.match(/(^|\n)\s*(?:[-•●▪◦*]|\d+[.)])\s+/g) || []).length,
    metrics: (resume.match(/\b\d+(?:\.\d+)?\s*(?:%|x|k|m|million|thousand)?\b|\$\s?\d[\d,]*/gi) || []).length,
    actionVerbs: normalize(resume).split(/\s+/).filter(w => ACTION_VERBS.has(w)).length,
  };
  const meta = extractJobMeta(jd);
  const job = analyzeJobDescription(jd);
  const required = job.requirements.filter(x=>['must_have','important','tool','responsibility'].includes(x.category));
  const matchedReq = required.filter(x=>countOccurrences(resume,x.term)>0 || (SKILL_ALIASES[x.term]||[]).some(a=>countOccurrences(resume,a)>0));
  const jobFitScore = required.length ? Math.round(matchedReq.length/required.length*100) : Math.round((keywordScore+semantic.score)/2);
  const resumeQualityScore = Math.round(formatScore*.30 + sectionScore*.25 + content*.25 + readability*.20);
  const matchDimensions = [
    {label:'Required skills',score:Math.round(keywordScore*.6+semantic.score*.4),detail:'Weighted skill and concept coverage.'},
    {label:'Responsibilities',score:Math.round(semantic.score*.7+content*.3),detail:'Conceptual evidence for work themes and ownership.'},
    {label:'Experience',score:experienceMatch(jd,resume),detail:'Chronology and explicit experience signals.'},
    {label:'Education',score:educationMatch(jd,resume),detail:'Education requirements versus resume evidence.'},
    {label:'Domain',score:domainMatch(jd,resume),detail:'Industry/domain terminology and relevant projects.'},
    {label:'ATS formatting',score:formatScore,detail:'Parser-safe structure and formatting signals.'},
  ];
  const base:any = { overallScore, jobFitScore, resumeQualityScore, matchDimensions, jobRequirements:job.requirements, keywordCoverageBySection:sectionCoverage(resume), evidenceWarnings:evidenceWarnings(jd,resume,compared.missing), keywordScore, formatScore, sectionScore, contentScore: content, readabilityScore: readability, semanticScore: semantic.score, semanticMatches: semantic.matches, toneChecks, ...meta, keywordsFound: compared.found, keywordsMissing: compared.missing, keywordsLow: compared.low, formatChecks, sections, strengths: [], risks: [], resumeStats: stats };
  const suggestions = generateSuggestions(base);
  const strengths = [keywordScore >= 70 ? 'Good alignment with the job-specific skills detected.' : '', formatScore >= 80 ? 'Mostly ATS-safe formatting signals.' : '', sections.filter(s => s.required && s.found).length >= 4 ? 'Most standard resume sections are present.' : '', stats.metrics >= 3 ? 'Resume includes measurable results.' : '', semantic.score>=70 ? 'Good conceptual alignment beyond exact keyword matches.' : ''].filter(Boolean);
  const risks = [semantic.score < 60 ? 'The resume has weak conceptual overlap with important job themes even where exact keywords may differ.' : '', toneChecks.some(x => !x.passed) ? 'Tone or tense patterns could weaken clarity and ownership.' : '',keywordScore < 60 ? 'Important job-specific skills are missing or weak.' : '', formatScore < 70 ? 'Formatting may reduce parsing reliability.' : '', sectionScore < 80 ? 'Some standard sections are missing.' : '', stats.metrics < 3 ? 'Few measurable achievements were detected.' : ''].filter(Boolean);
  return { ...base, strengths, risks, suggestions, summary: `Directional analysis: Job Fit ${jobFitScore}/100 and Resume Quality ${resumeQualityScore}/100. The ATS score is heuristic, not a guarantee of an employer's hiring outcome.` };
}
function experienceMatch(jd:string,resume:string){const jm=[...jd.matchAll(/(\d+)\+?\s*(?:-|to)?\s*(\d*)\s*(?:years?|yrs?)/gi)]; if(!jm.length)return 75; const req=parseInt(jm[0][1],10); const years=[...resume.matchAll(/(\d+(?:\.\d+)?)\s*(?:years?|yrs?)/gi)].map(m=>parseFloat(m[1])); if(!years.length)return 35; return Math.min(100,Math.round(Math.max(...years)/req*100));}
function educationMatch(jd:string,resume:string){const need=/\b(bachelor|b\.?tech|b\.?e\.?|master|m\.?tech|m\.?e\.?|degree|mba|phd|computer science|engineering)\b/i.test(jd); if(!need)return 100; return /\b(bachelor|b\.?tech|b\.?e\.?|master|m\.?tech|m\.?e\.?|degree|mba|phd|computer science|engineering)\b/i.test(resume)?100:20;}
function domainMatch(jd:string,resume:string){const domains=['fintech','banking','healthcare','retail','saas','ecommerce','insurance','marketing','finance','supply chain','hr'];const j=domains.filter(x=>jd.toLowerCase().includes(x)); if(!j.length)return 75; const r=j.filter(x=>resume.toLowerCase().includes(x)); return Math.round(r.length/j.length*100);}
