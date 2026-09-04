export type GapLevel = 'strong' | 'partial' | 'missing';
export interface CareerGap { skill:string; level:GapLevel; evidence:string; recommendation:string }
export interface RecruiterAssessment { impression:string; strengths:string[]; concerns:string[]; missing:string[]; relevance:number }
export interface ProjectRecommendation { title:string; problem:string; skills:string[]; stack:string[]; milestones:string[]; resumeRule:string }
