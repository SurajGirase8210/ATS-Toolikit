export type ResumeTemplate={
  id:string;name:string;style:string;ats:string;description:string;accent:string;
  layout:'single'|'sidebar'; header:'classic'|'center'|'split'|'bold'|'minimal';
  section:'line'|'caps'|'filled'|'accent'|'numbered'|'reference'; density:'compact'|'normal'|'airy';
};

export const RESUME_TEMPLATES:ResumeTemplate[]=[
{id:'surajsingh-exact',name:'Signature ATS Reference',style:'Signature reference',ats:'Very High',description:'Your uploaded one-page reference recreated as an editable ATS-friendly template.',accent:'blue',layout:'single',header:'center',section:'reference',density:'compact'},
{id:'ats-classic',name:'ATS Classic',style:'Classic single-column',ats:'Very High',description:'Clean single-column layout closely matching your uploaded reference resume.',accent:'blue',layout:'single',header:'classic',section:'line',density:'compact'},
{id:'ats-modern',name:'ATS Modern',style:'Modern single-column',ats:'Very High',description:'Modern hierarchy with a bold role line and compact sections.',accent:'indigo',layout:'single',header:'split',section:'accent',density:'normal'},
{id:'data-analyst',name:'Data Analyst',style:'Analytics-focused',ats:'Very High',description:'Skills, dashboards, metrics and analytical projects get stronger visual hierarchy.',accent:'cyan',layout:'single',header:'bold',section:'caps',density:'compact'},
{id:'tech-professional',name:'Tech Professional',style:'Technical',ats:'Very High',description:'Developer-style header with clear technology grouping and project emphasis.',accent:'violet',layout:'single',header:'split',section:'line',density:'normal'},
{id:'fresh-graduate',name:'Fresh Graduate',style:'Graduate',ats:'Very High',description:'Projects, education and certifications are prioritized for entry-level candidates.',accent:'emerald',layout:'single',header:'center',section:'accent',density:'normal'},
{id:'minimal-pro',name:'Minimal Pro',style:'Minimal',ats:'Very High',description:'Very restrained typography and whitespace for clean parser-friendly output.',accent:'slate',layout:'single',header:'minimal',section:'line',density:'airy'},
{id:'corporate',name:'Corporate',style:'Corporate',ats:'High',description:'Traditional business resume with formal headings and conservative spacing.',accent:'sky',layout:'single',header:'classic',section:'filled',density:'compact'},
{id:'consulting',name:'Consulting',style:'Achievement-first',ats:'High',description:'Dense, impact-first layout for consulting and strategy applications.',accent:'blue',layout:'single',header:'bold',section:'numbered',density:'compact'},
{id:'product',name:'Product & Business',style:'Business impact',ats:'High',description:'Highlights business outcomes, ownership and measurable impact.',accent:'teal',layout:'single',header:'split',section:'filled',density:'normal'},
{id:'finance',name:'Finance',style:'Finance',ats:'High',description:'Conservative, compact structure suited to banking and finance roles.',accent:'slate',layout:'single',header:'center',section:'line',density:'compact'},
{id:'operations',name:'Operations',style:'Operations',ats:'High',description:'Process improvement, execution and operational achievements are emphasized.',accent:'orange',layout:'single',header:'classic',section:'accent',density:'normal'},
{id:'project-manager',name:'Project Manager',style:'Leadership',ats:'High',description:'Strong ownership, delivery, stakeholder and project-impact hierarchy.',accent:'amber',layout:'single',header:'bold',section:'filled',density:'normal'},
{id:'marketing-analytics',name:'Marketing Analytics',style:'Marketing analytics',ats:'High',description:'Campaign analytics, growth metrics and reporting are visually emphasized.',accent:'pink',layout:'single',header:'center',section:'accent',density:'airy'},
{id:'machine-learning',name:'Machine Learning',style:'ML / Research',ats:'High',description:'Technical stack, ML projects, experimentation and research take priority.',accent:'purple',layout:'single',header:'split',section:'numbered',density:'compact'},
{id:'software-engineer',name:'Software Engineer',style:'Engineering',ats:'Very High',description:'Engineering stack, systems, projects and measurable technical outcomes.',accent:'green',layout:'single',header:'bold',section:'caps',density:'compact'},
{id:'sql-bi',name:'SQL & BI Specialist',style:'SQL / BI',ats:'Very High',description:'SQL, Power BI, dashboards, DAX and data modeling are prominent.',accent:'cyan',layout:'single',header:'classic',section:'accent',density:'compact'},
{id:'academic',name:'Academic / Research',style:'Research',ats:'High',description:'Publications, research, education and technical projects receive priority.',accent:'indigo',layout:'single',header:'center',section:'line',density:'airy'},
{id:'executive',name:'Executive',style:'Executive',ats:'High',description:'Leadership profile with a prominent summary and quantified achievements.',accent:'slate',layout:'single',header:'bold',section:'filled',density:'airy'},
{id:'two-column-light',name:'Two Column Light',style:'Two-column visual',ats:'Medium',description:'Human-first networking layout with a light sidebar. Not recommended for strict ATS portals.',accent:'blue',layout:'sidebar',header:'classic',section:'line',density:'normal'},
{id:'two-column-tech',name:'Two Column Tech',style:'Two-column technical',ats:'Medium',description:'Technical sidebar layout for portfolio PDFs and networking applications.',accent:'violet',layout:'sidebar',header:'bold',section:'accent',density:'normal'},
];
