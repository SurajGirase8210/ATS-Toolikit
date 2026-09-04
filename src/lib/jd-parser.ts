export type ParsedJD = {
  role: string;
  company: string;
  mustHave: string[];
  preferred: string[];
  responsibilities: string[];
  skills: string[];
  experience: string[];
  education: string[];
};

const VOCAB = ['Python','Java','JavaScript','TypeScript','React','Next.js','Node.js','SQL','Excel','Power BI','Tableau','AWS','Azure','GCP','Docker','Kubernetes','Git','Figma','Selenium','Cypress','REST API','GraphQL','FastAPI','Django','Spring Boot','Pandas','NumPy','scikit-learn','TensorFlow','PyTorch','Machine Learning','Statistics','Salesforce','SAP','Jira','Agile','Scrum','SEO','Google Ads','Meta Ads','CRM','Financial Modeling','Accounting','Recruiting','Communication','Stakeholder Management','Project Management','Data Analysis','Data Visualization','Business Analysis'];

function lines(text: string) { return text.split(/\n+/).map(x => x.replace(/^[-•*\s]+/, '').trim()).filter(x => x.length > 2); }
function role(text: string) {
  const explicit = text.match(/(?:job\s*title|position|role|title)\s*[:\-]\s*([^\n|]+)/i)?.[1]?.trim();
  if (explicit) return explicit.replace(/[.]+$/, '').slice(0, 100);
  const hit = lines(text).slice(0, 15).find(x => /\b(engineer|developer|analyst|scientist|designer|manager|consultant|intern|specialist|coordinator|accountant|recruiter|architect|administrator|marketing|sales|product|finance|qa|tester)\b/i.test(x));
  return hit || 'Target role';
}
function section(text: string, labels: RegExp) {
  const all = lines(text); const out: string[] = []; let active = false;
  for (const l of all) { if (labels.test(l)) { active = true; continue; } if (active && /^(requirements?|qualifications?|preferred|nice to have|responsibilities|what you.?ll do|education|experience|skills?)\s*:?$/i.test(l)) break; if (active) out.push(l); }
  return out.slice(0, 12);
}
export function parseJobDescription(text: string): ParsedJD {
  const clean = text.replace(/\r/g, '');
  const skills = VOCAB.filter(v => new RegExp(`(^|[^a-z0-9])${v.replace(/[.+]/g, '\\$&').replace(/ /g, '\\s+')}([^a-z0-9]|$)`, 'i').test(clean));
  const must = skills.filter(s => new RegExp(`(required|must|essential|need|proficien|strong).*${s.replace(/[.+]/g, '\\$&').replace(/ /g, '\\s+')}`, 'is').test(clean) || new RegExp(`${s.replace(/[.+]/g, '\\$&').replace(/ /g, '\\s+')}.*(required|must|essential)`, 'is').test(clean));
  const preferred = skills.filter(s => new RegExp(`(preferred|plus|nice to have|bonus|desired).*${s.replace(/[.+]/g, '\\$&').replace(/ /g, '\\s+')}`, 'is').test(clean));
  const responsibilities = section(clean, /^(responsibilities|what you.?ll do|duties|role responsibilities)\s*:?$/i);
  const experience = section(clean, /^(experience|requirements|qualifications)\s*:?$/i).filter(x => /year|experience|work|intern/i.test(x));
  const education = section(clean, /^(education|academic)\s*:?$/i);
  const company = clean.match(/(?:company|organization|employer)\s*[:\-]\s*([^\n]+)/i)?.[1]?.trim() || '';
  return { role: role(clean), company, mustHave: must.length ? must : skills.slice(0, Math.min(5, skills.length)), preferred, responsibilities, skills, experience, education };
}
