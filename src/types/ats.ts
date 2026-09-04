export type KeywordCategory = 'technical' | 'tool' | 'soft_skill' | 'domain' | 'certification' | 'role' | 'other';
export type KeywordStatus = 'found' | 'missing' | 'low';

export interface Keyword {
  word: string;
  count: number;
  category: KeywordCategory;
  weight: number;
  importance: number;
  phrases?: string[];
}

export interface KeywordMatch {
  keyword: string;
  jdCount: number;
  resumeCount: number;
  category: KeywordCategory;
  status: KeywordStatus;
  weight: number;
  importance: number;
  jdEvidence?: string;
}

export interface FormatCheck {
  name: string;
  passed: boolean;
  severity: 'high' | 'medium' | 'low';
  description: string;
  fix: string;
}

export interface SectionCheck {
  name: string;
  found: boolean;
  required: boolean;
  aliases: string[];
}

export interface Suggestion {
  type: string;
  priority: number;
  title: string;
  description: string;
  action: string;
}

export interface SemanticMatch { concept:string; jdTerms:string[]; resumeTerms:string[]; matched:boolean; }

export interface JobRequirement {
  term: string;
  category: 'must_have'|'important'|'nice_to_have'|'experience'|'education'|'domain'|'responsibility'|'soft_skill'|'tool'|'other';
  importance: number;
  evidence: string;
  jdCount: number;
}
export interface MatchDimension { label: string; score: number; detail: string; }
export interface ATSResult {
  overallScore: number;
  jobFitScore?: number;
  resumeQualityScore?: number;
  matchDimensions?: MatchDimension[];
  jobRequirements?: JobRequirement[];
  keywordCoverageBySection?: Record<string, number>;
  evidenceWarnings?: string[];
  keywordScore: number;
  formatScore: number;
  sectionScore: number;
  contentScore: number;
  readabilityScore: number;
  semanticScore: number;
  semanticMatches: SemanticMatch[];
  toneChecks: {name:string; passed:boolean; detail:string}[];
  jobTitle?: string;
  companyName?: string;
  keywordsFound: KeywordMatch[];
  keywordsMissing: KeywordMatch[];
  keywordsLow: KeywordMatch[];
  formatChecks: FormatCheck[];
  sections: SectionCheck[];
  suggestions: Suggestion[];
  summary: string;
  strengths: string[];
  risks: string[];
  resumeStats: {
    words: number;
    characters: number;
    bullets: number;
    metrics: number;
    actionVerbs: number;
  };
}
