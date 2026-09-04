import type {CareerItem} from './career-profile';
export const SAMPLE_JD = `Job Title: Entry-Level Data Analyst\nCompany: Example Analytics\n\nWe are looking for a Data Analyst who can use SQL, Excel, Power BI and Python to clean data, build reports and dashboards, perform data analysis and data visualization, collaborate with stakeholders and work in an Agile environment. Experience with machine learning is a plus.`;
export const SAMPLE_RESUME = `Sample Candidate\nEmail: candidate@example.com | Phone: +91 00000 00000\n\nProfessional Summary\nComputer Science student focused on data analysis and business intelligence.\n\nSkills\nPython, SQL, Excel, Power BI, Pandas, NumPy, Data Visualization\n\nProjects\nBanking Loan Analytics Dashboard | SQL, Power BI\n• Built an interactive dashboard for loan and customer analysis.\n• Analyzed trends and reporting metrics to support business insights.\n\nHR Analytics Dashboard | Power BI, Excel\n• Created interactive HR visuals for workforce analysis.\n• Explored attrition and employee trends.\n\nEducation\nB.Tech Computer Science`;

export const SAMPLE_APPLICATIONS = [
  {company_name:'Example Analytics',job_title:'Data Analyst',job_url:'https://example.com/jobs/data-analyst',location:'Remote',salary_range:'₹5-8 LPA',job_type:'Full-time',date_applied:new Date().toISOString().slice(0,10),follow_up_date:'',recruiter_name:'Priya Sharma',recruiter_email:'recruiter@example.com',recruiter_phone:'',status:'applied',priority:'high',notes:'Sample application. Replace with a real opportunity.'},
  {company_name:'Fintech Labs',job_title:'Junior Business Analyst',job_url:'https://example.com/jobs/business-analyst',location:'Pune',salary_range:'₹4-7 LPA',job_type:'Full-time',date_applied:new Date().toISOString().slice(0,10),follow_up_date:'',recruiter_name:'',recruiter_email:'',recruiter_phone:'',status:'interview',priority:'medium',notes:'Sample interview-stage application.'}
];

export const SAMPLE_EVIDENCE: CareerItem[] = [
  {id:'sample-sql',type:'skill',title:'SQL',content:'Used SQL for data querying, cleaning and analytics dashboards.',tags:['SQL','Data Analysis'],enabled:true},
  {id:'sample-powerbi',type:'skill',title:'Power BI',content:'Built interactive dashboards for banking loan and HR analytics projects.',tags:['Power BI','BI'],enabled:true},
  {id:'sample-banking',type:'project',title:'Banking Loan Analytics Dashboard',content:'Built a dashboard using SQL and Power BI to analyze loan and customer trends.',tags:['SQL','Power BI','Analytics'],enabled:true},
  {id:'sample-hr',type:'project',title:'HR Analytics Dashboard',content:'Created interactive HR visuals to explore workforce and attrition trends.',tags:['Power BI','Excel','Analytics'],enabled:true}
];
