export type CareerItem={id:string;type:'skill'|'achievement'|'bullet'|'project'|'certification'|'experience';title:string;content:string;tags:string[];enabled:boolean};
export type CareerProfile={name:string;headline:string;contact:string;items:CareerItem[]};
export const emptyCareerProfile:CareerProfile={name:'',headline:'',contact:'',items:[]};
export const PROFILE_KEY='ats-career-profile-v1';
export function loadCareerProfile():CareerProfile{try{return JSON.parse(localStorage.getItem(PROFILE_KEY)||'null')||emptyCareerProfile}catch{return emptyCareerProfile}}
export function saveCareerProfile(p:CareerProfile){localStorage.setItem(PROFILE_KEY,JSON.stringify(p))}
export function rankProfileItems(profile:CareerProfile, query:string){const q=query.toLowerCase();return profile.items.filter(x=>x.enabled).map(x=>{const hay=(x.title+' '+x.content+' '+x.tags.join(' ')).toLowerCase();let score=0;q.split(/\W+/).filter(Boolean).forEach(w=>{if(hay.includes(w))score+=1});return {...x,score}}).sort((a,b)=>b.score-a.score)}
