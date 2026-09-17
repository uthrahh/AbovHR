/**
 * Development seed data for Abov.
 *
 * This is clearly-labeled demo content for local development and review —
 * fictional candidates, fictional employers, fictional jobs. None of it is
 * presented anywhere in the UI as real platform statistics, testimonials,
 * or user counts. See docs/architecture/database.md for the seeding policy.
 *
 * Run with: npm run db:seed
 */
import "dotenv/config";
import { PrismaClient } from "../../src/generated/prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEMO_PASSWORD = "DemoPass123!";

async function hash(password: string) {
  return bcrypt.hash(password, 12);
}

const SKILLS: { name: string; category: string }[] = [
  { name: "JavaScript", category: "Engineering" },
  { name: "TypeScript", category: "Engineering" },
  { name: "Python", category: "Engineering" },
  { name: "SQL", category: "Data" },
  { name: "React", category: "Engineering" },
  { name: "Node.js", category: "Engineering" },
  { name: "Java", category: "Engineering" },
  { name: "AWS", category: "Engineering" },
  { name: "Excel", category: "Data" },
  { name: "Power BI", category: "Data" },
  { name: "Tableau", category: "Data" },
  { name: "Statistics", category: "Data" },
  { name: "Data Modeling", category: "Data" },
  { name: "Machine Learning", category: "Data" },
  { name: "Communication", category: "General" },
  { name: "Project Management", category: "General" },
  { name: "Figma", category: "Design" },
  { name: "HTML", category: "Engineering" },
  { name: "CSS", category: "Engineering" },
  { name: "Git", category: "Engineering" },
  { name: "Docker", category: "Engineering" },
  { name: "REST APIs", category: "Engineering" },
  { name: "Digital Marketing", category: "Marketing" },
  { name: "SEO", category: "Marketing" },
  { name: "Content Writing", category: "Marketing" },
  { name: "Financial Analysis", category: "Finance" },
  { name: "Accounting", category: "Finance" },
  { name: "Customer Support", category: "Operations" },
  { name: "Sales", category: "Sales" },
  { name: "Negotiation", category: "Sales" },
  { name: "Recruitment", category: "HR" },
  { name: "HR Operations", category: "HR" },
  { name: "Payroll", category: "HR" },
  { name: "User Research", category: "Design" },
  { name: "Wireframing", category: "Design" },
  { name: "CI/CD", category: "Engineering" },
  { name: "Kubernetes", category: "Engineering" },
  { name: "Linux", category: "Engineering" },
];

const CAREER_PATHS: {
  title: string;
  slug: string;
  description: string;
  category: string;
  skills: { name: string; importance: "CORE" | "RECOMMENDED" | "NICE_TO_HAVE" }[];
}[] = [
  {
    title: "Data Analyst",
    slug: "data-analyst",
    description:
      "Turns raw business data into reports and recommendations, working closely with SQL, spreadsheets, and dashboarding tools.",
    category: "Data",
    skills: [
      { name: "SQL", importance: "CORE" },
      { name: "Excel", importance: "CORE" },
      { name: "Statistics", importance: "CORE" },
      { name: "Power BI", importance: "RECOMMENDED" },
      { name: "Python", importance: "RECOMMENDED" },
      { name: "Data Modeling", importance: "NICE_TO_HAVE" },
    ],
  },
  {
    title: "Frontend Engineer",
    slug: "frontend-engineer",
    description:
      "Builds the interfaces users interact with directly, focused on HTML/CSS fundamentals plus a modern JavaScript framework.",
    category: "Engineering",
    skills: [
      { name: "HTML", importance: "CORE" },
      { name: "CSS", importance: "CORE" },
      { name: "JavaScript", importance: "CORE" },
      { name: "React", importance: "CORE" },
      { name: "TypeScript", importance: "RECOMMENDED" },
      { name: "Git", importance: "RECOMMENDED" },
    ],
  },
  {
    title: "Backend Engineer",
    slug: "backend-engineer",
    description:
      "Designs and maintains the services and data layer behind an application, with an emphasis on APIs, databases, and reliability.",
    category: "Engineering",
    skills: [
      { name: "Node.js", importance: "CORE" },
      { name: "SQL", importance: "CORE" },
      { name: "REST APIs", importance: "CORE" },
      { name: "Java", importance: "RECOMMENDED" },
      { name: "Docker", importance: "RECOMMENDED" },
      { name: "AWS", importance: "NICE_TO_HAVE" },
    ],
  },
  {
    title: "Digital Marketing Specialist",
    slug: "digital-marketing-specialist",
    description:
      "Plans and runs marketing campaigns across search, content, and social channels, and reports on what's working.",
    category: "Marketing",
    skills: [
      { name: "Digital Marketing", importance: "CORE" },
      { name: "SEO", importance: "CORE" },
      { name: "Content Writing", importance: "RECOMMENDED" },
      { name: "Excel", importance: "RECOMMENDED" },
      { name: "Communication", importance: "CORE" },
    ],
  },
  {
    title: "HR Generalist",
    slug: "hr-generalist",
    description:
      "Handles day-to-day people operations — recruitment coordination, onboarding, payroll support, and policy administration.",
    category: "HR",
    skills: [
      { name: "Recruitment", importance: "CORE" },
      { name: "HR Operations", importance: "CORE" },
      { name: "Payroll", importance: "RECOMMENDED" },
      { name: "Communication", importance: "CORE" },
      { name: "Excel", importance: "RECOMMENDED" },
    ],
  },
  {
    title: "DevOps Engineer",
    slug: "devops-engineer",
    description:
      "Builds and maintains the infrastructure and delivery pipelines that let engineering teams ship reliably.",
    category: "Engineering",
    skills: [
      { name: "Linux", importance: "CORE" },
      { name: "Docker", importance: "CORE" },
      { name: "Kubernetes", importance: "CORE" },
      { name: "AWS", importance: "CORE" },
      { name: "CI/CD", importance: "RECOMMENDED" },
    ],
  },
  {
    title: "Product Designer",
    slug: "product-designer",
    description:
      "Researches user needs and designs the interfaces and flows that address them, working closely with product and engineering.",
    category: "Design",
    skills: [
      { name: "Figma", importance: "CORE" },
      { name: "Wireframing", importance: "CORE" },
      { name: "User Research", importance: "CORE" },
      { name: "Communication", importance: "RECOMMENDED" },
    ],
  },
];

const COMPANIES: {
  name: string;
  slug: string;
  about: string;
  industry: string;
  sizeRange: string;
  city: string;
  verificationStatus: "VERIFIED" | "UNVERIFIED";
}[] = [
  {
    name: "Northbridge Analytics",
    slug: "northbridge-analytics",
    about:
      "Northbridge builds data and reporting infrastructure for mid-market retail and logistics companies across South Asia.",
    industry: "Data & Analytics",
    sizeRange: "201-500",
    city: "Bengaluru",
    verificationStatus: "VERIFIED",
  },
  {
    name: "Verdant Systems",
    slug: "verdant-systems",
    about: "Verdant Systems develops cloud infrastructure tooling for engineering teams.",
    industry: "Software",
    sizeRange: "51-200",
    city: "Pune",
    verificationStatus: "VERIFIED",
  },
  {
    name: "Solace Digital",
    slug: "solace-digital",
    about: "A digital marketing and growth agency working with D2C brands across India.",
    industry: "Marketing & Advertising",
    sizeRange: "11-50",
    city: "Mumbai",
    verificationStatus: "VERIFIED",
  },
  {
    name: "Ashgrove Financial Services",
    slug: "ashgrove-financial",
    about: "Ashgrove provides accounting and financial-analysis services to small and mid-sized businesses.",
    industry: "Financial Services",
    sizeRange: "501-1000",
    city: "Chennai",
    verificationStatus: "VERIFIED",
  },
  {
    name: "Petalworks Health",
    slug: "petalworks-health",
    about: "Petalworks builds scheduling and records software for outpatient clinics.",
    industry: "Healthcare Technology",
    sizeRange: "51-200",
    city: "Hyderabad",
    verificationStatus: "UNVERIFIED",
  },
  {
    name: "Ironvale Logistics",
    slug: "ironvale-logistics",
    about: "Ironvale operates a freight and warehousing network across western India.",
    industry: "Logistics",
    sizeRange: "1000+",
    city: "Ahmedabad",
    verificationStatus: "VERIFIED",
  },
];

type JobSeed = {
  companySlug: string;
  title: string;
  slug: string;
  description: string;
  responsibilities: string;
  requirements: string;
  department: string;
  employmentType: "FULL_TIME" | "PART_TIME" | "INTERNSHIP" | "APPRENTICESHIP" | "CONTRACT";
  workMode: "REMOTE" | "HYBRID" | "OFFICE" | "FIELD";
  experienceMinYears: number;
  experienceMaxYears: number;
  educationRequirement: string;
  salaryMin: number | null;
  salaryMax: number | null;
  isSalaryDisclosed: boolean;
  locationCity: string;
  isFresherFriendly: boolean;
  skills: string[];
  daysAgo: number;
};

const JOBS: JobSeed[] = [
  {
    companySlug: "northbridge-analytics",
    title: "Data Analyst",
    slug: "northbridge-analytics-data-analyst",
    description:
      "You'll work with the retail insights team to build recurring reports and answer ad-hoc data questions from category managers.",
    responsibilities:
      "Build and maintain SQL-based reporting pipelines. Create dashboards in Power BI for weekly business reviews. Partner with category managers to scope new analysis requests. Document data definitions for the wider analytics team.",
    requirements:
      "1-3 years working with SQL and a BI tool. Comfortable with descriptive statistics. Bachelor's degree in a quantitative, business, or engineering field.",
    department: "Analytics",
    employmentType: "FULL_TIME",
    workMode: "HYBRID",
    experienceMinYears: 1,
    experienceMaxYears: 3,
    educationRequirement: "Bachelor's degree",
    salaryMin: 600000,
    salaryMax: 900000,
    isSalaryDisclosed: true,
    locationCity: "Bengaluru",
    isFresherFriendly: false,
    skills: ["SQL", "Power BI", "Excel", "Statistics"],
    daysAgo: 2,
  },
  {
    companySlug: "northbridge-analytics",
    title: "Junior Data Analyst (Fresher)",
    slug: "northbridge-analytics-junior-data-analyst",
    description:
      "An entry point into analytics for recent graduates who are comfortable with spreadsheets and eager to learn SQL on the job.",
    responsibilities:
      "Assist senior analysts with data cleaning and report formatting. Learn SQL and Power BI through structured on-the-job training. Take ownership of small recurring reports within the first 90 days.",
    requirements:
      "Bachelor's degree completed within the last 12 months. Strong Excel skills. No prior SQL experience required — training is provided.",
    department: "Analytics",
    employmentType: "FULL_TIME",
    workMode: "OFFICE",
    experienceMinYears: 0,
    experienceMaxYears: 1,
    educationRequirement: "Bachelor's degree",
    salaryMin: 400000,
    salaryMax: 500000,
    isSalaryDisclosed: true,
    locationCity: "Bengaluru",
    isFresherFriendly: true,
    skills: ["Excel", "SQL"],
    daysAgo: 5,
  },
  {
    companySlug: "verdant-systems",
    title: "Frontend Engineer",
    slug: "verdant-systems-frontend-engineer",
    description:
      "Join the platform team building the customer-facing dashboard for our infrastructure monitoring product.",
    responsibilities:
      "Build and maintain React/TypeScript components for the monitoring dashboard. Work with design to implement accessible, responsive UI. Write unit and integration tests for new features.",
    requirements:
      "2+ years building production React applications. Comfortable with TypeScript and REST APIs. Experience with accessibility best practices is a plus.",
    department: "Engineering",
    employmentType: "FULL_TIME",
    workMode: "REMOTE",
    experienceMinYears: 2,
    experienceMaxYears: 5,
    educationRequirement: "Bachelor's degree preferred, not required",
    salaryMin: 1200000,
    salaryMax: 1800000,
    isSalaryDisclosed: true,
    locationCity: "Pune",
    isFresherFriendly: false,
    skills: ["React", "TypeScript", "JavaScript", "CSS", "Git"],
    daysAgo: 1,
  },
  {
    companySlug: "verdant-systems",
    title: "Backend Engineer",
    slug: "verdant-systems-backend-engineer",
    description: "Build the ingestion and query services that power our monitoring platform's core APIs.",
    responsibilities:
      "Design and implement REST APIs in Node.js. Optimize SQL queries against high-volume time-series data. Participate in an on-call rotation for production services.",
    requirements:
      "3+ years of backend development experience. Strong SQL fundamentals. Experience with Docker and containerized deployments.",
    department: "Engineering",
    employmentType: "FULL_TIME",
    workMode: "HYBRID",
    experienceMinYears: 3,
    experienceMaxYears: 6,
    educationRequirement: "Bachelor's degree in Computer Science or related field",
    salaryMin: 1500000,
    salaryMax: 2200000,
    isSalaryDisclosed: true,
    locationCity: "Pune",
    isFresherFriendly: false,
    skills: ["Node.js", "SQL", "REST APIs", "Docker", "AWS"],
    daysAgo: 6,
  },
  {
    companySlug: "verdant-systems",
    title: "DevOps Engineer",
    slug: "verdant-systems-devops-engineer",
    description: "Own the CI/CD pipelines and Kubernetes infrastructure that our engineering org ships through.",
    responsibilities:
      "Maintain Kubernetes clusters across staging and production. Improve CI/CD pipeline reliability and speed. Support engineers debugging deployment issues.",
    requirements: "3+ years in a DevOps or SRE role. Hands-on Kubernetes and AWS experience.",
    department: "Engineering",
    employmentType: "FULL_TIME",
    workMode: "REMOTE",
    experienceMinYears: 3,
    experienceMaxYears: 7,
    educationRequirement: "Not required",
    salaryMin: 1600000,
    salaryMax: 2400000,
    isSalaryDisclosed: false,
    locationCity: "Pune",
    isFresherFriendly: false,
    skills: ["Kubernetes", "Docker", "AWS", "Linux", "CI/CD"],
    daysAgo: 9,
  },
  {
    companySlug: "solace-digital",
    title: "Digital Marketing Associate",
    slug: "solace-digital-marketing-associate",
    description: "Support campaign execution for our D2C client accounts across search and social.",
    responsibilities:
      "Assist in setting up and monitoring paid search and social campaigns. Write and edit ad copy and landing page content. Compile weekly performance reports for client reviews.",
    requirements: "0-2 years in marketing. Familiarity with SEO basics. Strong writing skills.",
    department: "Marketing",
    employmentType: "FULL_TIME",
    workMode: "OFFICE",
    experienceMinYears: 0,
    experienceMaxYears: 2,
    educationRequirement: "Bachelor's degree",
    salaryMin: 350000,
    salaryMax: 550000,
    isSalaryDisclosed: true,
    locationCity: "Mumbai",
    isFresherFriendly: true,
    skills: ["Digital Marketing", "SEO", "Content Writing", "Communication"],
    daysAgo: 3,
  },
  {
    companySlug: "solace-digital",
    title: "Marketing Intern",
    slug: "solace-digital-marketing-intern",
    description: "A 6-month internship supporting the content and social team with hands-on campaign work.",
    responsibilities:
      "Draft social captions and short-form content. Support scheduling and basic analytics reporting. Shadow senior marketers on client calls.",
    requirements: "Currently pursuing or recently completed a bachelor's degree.",
    department: "Marketing",
    employmentType: "INTERNSHIP",
    workMode: "HYBRID",
    experienceMinYears: 0,
    experienceMaxYears: 0,
    educationRequirement: "Pursuing bachelor's degree",
    salaryMin: 15000,
    salaryMax: 20000,
    isSalaryDisclosed: true,
    locationCity: "Mumbai",
    isFresherFriendly: true,
    skills: ["Content Writing", "Communication"],
    daysAgo: 4,
  },
  {
    companySlug: "ashgrove-financial",
    title: "Financial Analyst",
    slug: "ashgrove-financial-analyst",
    description: "Support the client advisory team with financial modeling and reporting for SME clients.",
    responsibilities:
      "Build and maintain financial models in Excel. Prepare monthly variance reports for client accounts. Support senior analysts during quarterly reviews.",
    requirements: "1-3 years in financial analysis or accounting. Strong Excel skills. Commerce or finance degree preferred.",
    department: "Finance",
    employmentType: "FULL_TIME",
    workMode: "OFFICE",
    experienceMinYears: 1,
    experienceMaxYears: 3,
    educationRequirement: "Bachelor's in Commerce/Finance",
    salaryMin: 500000,
    salaryMax: 750000,
    isSalaryDisclosed: true,
    locationCity: "Chennai",
    isFresherFriendly: false,
    skills: ["Financial Analysis", "Excel", "Accounting"],
    daysAgo: 8,
  },
  {
    companySlug: "ashgrove-financial",
    title: "Accounts Executive",
    slug: "ashgrove-financial-accounts-executive",
    description: "Manage day-to-day bookkeeping and reconciliation for a portfolio of client accounts.",
    responsibilities: "Process invoices and reconcile ledgers. Prepare monthly closing reports. Coordinate with clients on documentation.",
    requirements: "Bachelor's in Commerce. 0-2 years of accounting experience.",
    department: "Finance",
    employmentType: "FULL_TIME",
    workMode: "OFFICE",
    experienceMinYears: 0,
    experienceMaxYears: 2,
    educationRequirement: "Bachelor's in Commerce",
    salaryMin: 300000,
    salaryMax: 420000,
    isSalaryDisclosed: true,
    locationCity: "Chennai",
    isFresherFriendly: true,
    skills: ["Accounting", "Excel"],
    daysAgo: 12,
  },
  {
    companySlug: "petalworks-health",
    title: "Product Designer",
    slug: "petalworks-health-product-designer",
    description: "Design scheduling and records workflows used daily by clinic front-desk staff.",
    responsibilities:
      "Conduct user research with clinic staff. Design and prototype workflows in Figma. Collaborate with engineering on implementation feasibility.",
    requirements: "2+ years of product design experience. Strong Figma portfolio. Healthcare or B2B SaaS experience is a plus.",
    department: "Product",
    employmentType: "FULL_TIME",
    workMode: "HYBRID",
    experienceMinYears: 2,
    experienceMaxYears: 5,
    educationRequirement: "Not required",
    salaryMin: 900000,
    salaryMax: 1400000,
    isSalaryDisclosed: false,
    locationCity: "Hyderabad",
    isFresherFriendly: false,
    skills: ["Figma", "Wireframing", "User Research"],
    daysAgo: 7,
  },
  {
    companySlug: "petalworks-health",
    title: "Customer Support Associate",
    slug: "petalworks-health-support-associate",
    description: "Front-line support for clinic staff using our scheduling software.",
    responsibilities: "Respond to support tickets and calls. Escalate product bugs to engineering. Maintain the internal knowledge base.",
    requirements: "Clear written and verbal communication. Comfortable with software troubleshooting.",
    department: "Customer Support",
    employmentType: "FULL_TIME",
    workMode: "REMOTE",
    experienceMinYears: 0,
    experienceMaxYears: 2,
    educationRequirement: "Bachelor's degree preferred",
    salaryMin: 350000,
    salaryMax: 480000,
    isSalaryDisclosed: true,
    locationCity: "Hyderabad",
    isFresherFriendly: true,
    skills: ["Customer Support", "Communication"],
    daysAgo: 15,
  },
  {
    companySlug: "ironvale-logistics",
    title: "HR Generalist",
    slug: "ironvale-logistics-hr-generalist",
    description: "Support recruitment and HR operations for our warehouse network.",
    responsibilities:
      "Coordinate interviews for warehouse and operations roles. Maintain employee records and onboarding documentation. Support payroll processing alongside the finance team.",
    requirements: "2+ years in an HR generalist or coordinator role. Familiarity with payroll processes.",
    department: "Human Resources",
    employmentType: "FULL_TIME",
    workMode: "OFFICE",
    experienceMinYears: 2,
    experienceMaxYears: 5,
    educationRequirement: "Bachelor's degree, HR specialization preferred",
    salaryMin: 500000,
    salaryMax: 700000,
    isSalaryDisclosed: true,
    locationCity: "Ahmedabad",
    isFresherFriendly: false,
    skills: ["Recruitment", "HR Operations", "Payroll", "Communication"],
    daysAgo: 10,
  },
  {
    companySlug: "ironvale-logistics",
    title: "Operations Trainee (Fresher)",
    slug: "ironvale-logistics-operations-trainee",
    description: "A structured 12-month trainee program rotating across warehouse operations, planning, and logistics.",
    responsibilities: "Rotate across three operations teams over 12 months. Support daily shift planning. Complete a capstone process-improvement project.",
    requirements: "Bachelor's degree in any discipline, completed within the last 2 years.",
    department: "Operations",
    employmentType: "APPRENTICESHIP",
    workMode: "FIELD",
    experienceMinYears: 0,
    experienceMaxYears: 0,
    educationRequirement: "Bachelor's degree",
    salaryMin: 300000,
    salaryMax: 360000,
    isSalaryDisclosed: true,
    locationCity: "Ahmedabad",
    isFresherFriendly: true,
    skills: ["Communication", "Project Management"],
    daysAgo: 18,
  },
  {
    companySlug: "northbridge-analytics",
    title: "Machine Learning Intern",
    slug: "northbridge-analytics-ml-intern",
    description: "A 6-month internship on the analytics R&D team, prototyping demand-forecasting models.",
    responsibilities: "Prepare training datasets from client data. Prototype and evaluate forecasting models in Python. Present findings to the analytics team biweekly.",
    requirements: "Pursuing a degree in a quantitative field. Working knowledge of Python and statistics.",
    department: "Analytics",
    employmentType: "INTERNSHIP",
    workMode: "HYBRID",
    experienceMinYears: 0,
    experienceMaxYears: 0,
    educationRequirement: "Pursuing bachelor's or master's degree",
    salaryMin: 25000,
    salaryMax: 30000,
    isSalaryDisclosed: true,
    locationCity: "Bengaluru",
    isFresherFriendly: true,
    skills: ["Python", "Statistics", "Machine Learning"],
    daysAgo: 3,
  },
];

const LEARNING_PATHS: {
  careerSlug: string;
  title: string;
  slug: string;
  description: string;
  estimatedHours: number;
  modules: { title: string; skill?: string; type: "ARTICLE" | "VIDEO" | "PRACTICE" | "PROJECT" | "QUIZ"; hours: number }[];
}[] = [
  {
    careerSlug: "data-analyst",
    title: "Become a Data Analyst",
    slug: "become-a-data-analyst",
    description: "A structured path from spreadsheet basics to building dashboards and running your own analyses.",
    estimatedHours: 90,
    modules: [
      { title: "Excel for analysis: formulas, pivot tables, and lookups", skill: "Excel", type: "ARTICLE", hours: 8 },
      { title: "SQL fundamentals: SELECT, JOIN, GROUP BY", skill: "SQL", type: "VIDEO", hours: 10 },
      { title: "SQL practice set: 25 query exercises", skill: "SQL", type: "PRACTICE", hours: 6 },
      { title: "Statistics for analysts: distributions and hypothesis testing", skill: "Statistics", type: "ARTICLE", hours: 10 },
      { title: "Intro to Python for data work", skill: "Python", type: "VIDEO", hours: 12 },
      { title: "Build a sales dashboard in Power BI", skill: "Power BI", type: "PROJECT", hours: 14 },
      { title: "Data analyst skill check", type: "QUIZ", hours: 2 },
      { title: "Capstone: end-to-end analysis project", type: "PROJECT", hours: 20 },
    ],
  },
  {
    careerSlug: "frontend-engineer",
    title: "Become a Frontend Engineer",
    slug: "become-a-frontend-engineer",
    description: "Go from HTML/CSS fundamentals to building and shipping a React application.",
    estimatedHours: 110,
    modules: [
      { title: "HTML & CSS fundamentals", skill: "HTML", type: "ARTICLE", hours: 10 },
      { title: "Responsive layout practice set", skill: "CSS", type: "PRACTICE", hours: 8 },
      { title: "JavaScript fundamentals", skill: "JavaScript", type: "VIDEO", hours: 16 },
      { title: "Git and collaborative workflows", skill: "Git", type: "ARTICLE", hours: 4 },
      { title: "React fundamentals: components and state", skill: "React", type: "VIDEO", hours: 18 },
      { title: "TypeScript for React developers", skill: "TypeScript", type: "ARTICLE", hours: 10 },
      { title: "Build a job board UI (practice project)", type: "PROJECT", hours: 24 },
      { title: "Frontend skill check", type: "QUIZ", hours: 2 },
    ],
  },
  {
    careerSlug: "digital-marketing-specialist",
    title: "Become a Digital Marketing Specialist",
    slug: "become-a-digital-marketing-specialist",
    description: "Core skills for running and measuring marketing campaigns across channels.",
    estimatedHours: 60,
    modules: [
      { title: "Digital marketing fundamentals", skill: "Digital Marketing", type: "ARTICLE", hours: 8 },
      { title: "SEO basics: on-page and technical", skill: "SEO", type: "VIDEO", hours: 10 },
      { title: "Writing for conversion", skill: "Content Writing", type: "ARTICLE", hours: 8 },
      { title: "Campaign reporting in spreadsheets", skill: "Excel", type: "PRACTICE", hours: 6 },
      { title: "Plan a campaign brief (project)", type: "PROJECT", hours: 12 },
      { title: "Marketing skill check", type: "QUIZ", hours: 2 },
    ],
  },
];

const ARTICLES: {
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  category:
    | "CAREER_GUIDE"
    | "INTERVIEW_GUIDE"
    | "RESUME_GUIDE"
    | "INDUSTRY_INSIGHT"
    | "SKILL_GUIDE"
    | "EMPLOYER_INSIGHT";
  authorName: string;
  readingMinutes: number;
  daysAgo: number;
}[] = [
  {
    slug: "how-to-read-a-job-description",
    title: "How to read a job description without getting overwhelmed",
    excerpt: "Most listings mix must-haves with nice-to-haves. Here's how to tell them apart before you decide whether to apply.",
    body: "Job descriptions are written by hiring managers under time pressure, which means requirement lists are rarely a precise checklist. A useful way to read one: separate the 'requirements' section into what appears in the first two bullets (usually closer to must-have) versus the rest (often aspirational). Cross-check against the experience range stated at the top — if you're within it, a partial skills match is normal, not disqualifying.",
    category: "CAREER_GUIDE",
    authorName: "Abov Editorial",
    readingMinutes: 4,
    daysAgo: 10,
  },
  {
    slug: "entry-level-interview-preparation",
    title: "Preparing for your first professional interview",
    excerpt: "A practical structure for answering 'tell me about yourself' and behavioral questions when you don't have years of experience to draw on.",
    body: "When you don't have a long work history, interviewers are usually evaluating how you think and communicate, not just what you've done. Structure answers to behavioral questions using situation, task, action, result — drawing on coursework, projects, or part-time work if you don't have full-time experience yet. Prepare two or three stories you can adapt to different questions rather than memorizing answers to specific prompts.",
    category: "INTERVIEW_GUIDE",
    authorName: "Abov Editorial",
    readingMinutes: 6,
    daysAgo: 14,
  },
  {
    slug: "resume-keywords-that-matter",
    title: "Which resume keywords actually matter to a recruiter",
    excerpt: "Not every skill on a job posting needs to appear verbatim on your resume. Here's what recruiters are actually scanning for.",
    body: "Recruiters scanning dozens of resumes are usually looking for role title, years of experience, and two or three core tools mentioned in the first few lines of your experience section — not a keyword-stuffed skills list at the bottom. If a tool or skill from the job posting is genuinely part of your background, mention it in context (what you used it for), not just as a standalone word.",
    category: "RESUME_GUIDE",
    authorName: "Abov Editorial",
    readingMinutes: 5,
    daysAgo: 20,
  },
  {
    slug: "sql-vs-excel-when-to-learn-what",
    title: "SQL vs. Excel: what to learn first for a data role",
    excerpt: "Both show up constantly in data analyst postings. Here's a practical order for learning them if you're starting from zero.",
    body: "Excel is usually faster to get productive in and is still widely used for lightweight analysis and reporting. SQL becomes necessary once you're working with data that doesn't fit in a spreadsheet, or when a team stores its data in a shared database. If you're targeting data analyst roles, a reasonable order is: Excel fundamentals first (a week or two), then SQL basics (SELECT, JOIN, GROUP BY), then return to Excel for pivot tables and lookups once you understand relational data from SQL.",
    category: "SKILL_GUIDE",
    authorName: "Abov Editorial",
    readingMinutes: 5,
    daysAgo: 6,
  },
  {
    slug: "what-fresher-friendly-actually-means",
    title: "What \"fresher-friendly\" actually means on a job posting",
    excerpt: "The label varies a lot between companies. Here's what to check before assuming a listing is truly open to new graduates.",
    body: "A 'fresher-friendly' tag can mean anything from 'no experience required, full training provided' to 'we'll consider strong candidates with zero to one year.' Check the stated experience range and education requirement fields specifically — those are usually more reliable signals than the tag alone.",
    category: "CAREER_GUIDE",
    authorName: "Abov Editorial",
    readingMinutes: 3,
    daysAgo: 25,
  },
  {
    slug: "writing-job-postings-that-attract-the-right-candidates",
    title: "Writing job postings that attract the right candidates",
    excerpt: "A short guide for hiring managers on separating true requirements from nice-to-haves, and why that distinction affects who applies.",
    body: "Long, undifferentiated requirement lists tend to suppress applications from qualified candidates who don't check every box — particularly candidates from underrepresented backgrounds, who research shows apply more conservatively against listed requirements. Marking two or three items as 'must-have' and the rest as 'helpful but not required' produces a more accurate applicant pool.",
    category: "EMPLOYER_INSIGHT",
    authorName: "Abov Editorial",
    readingMinutes: 5,
    daysAgo: 12,
  },
];

async function main() {
  console.log("Seeding skills...");
  const skillRecords = new Map<string, string>();
  for (const skill of SKILLS) {
    const record = await prisma.skill.upsert({
      where: { name: skill.name },
      update: {},
      create: skill,
    });
    skillRecords.set(skill.name, record.id);
  }

  console.log("Seeding career paths...");
  const careerPathRecords = new Map<string, string>();
  for (const path of CAREER_PATHS) {
    const record = await prisma.careerPath.upsert({
      where: { slug: path.slug },
      update: { title: path.title, description: path.description, category: path.category },
      create: { title: path.title, slug: path.slug, description: path.description, category: path.category },
    });
    careerPathRecords.set(path.slug, record.id);
    for (const skill of path.skills) {
      const skillId = skillRecords.get(skill.name);
      if (!skillId) continue;
      await prisma.careerPathSkill.upsert({
        where: { careerPathId_skillId: { careerPathId: record.id, skillId } },
        update: { importance: skill.importance },
        create: { careerPathId: record.id, skillId, importance: skill.importance },
      });
    }
  }

  console.log("Seeding admin user...");
  await prisma.user.upsert({
    where: { email: "admin@abov.demo" },
    update: {},
    create: {
      email: "admin@abov.demo",
      name: "Priya Menon",
      role: "ADMIN",
      passwordHash: await hash(DEMO_PASSWORD),
      emailVerified: new Date(),
    },
  });

  console.log("Seeding companies, employers, and jobs...");
  for (const company of COMPANIES) {
    const companyRecord = await prisma.company.upsert({
      where: { slug: company.slug },
      update: {
        about: company.about,
        industry: company.industry,
        sizeRange: company.sizeRange,
        headquartersCity: company.city,
        verificationStatus: company.verificationStatus,
      },
      create: {
        name: company.name,
        slug: company.slug,
        about: company.about,
        industry: company.industry,
        sizeRange: company.sizeRange,
        headquartersCity: company.city,
        headquartersCountry: "India",
        verificationStatus: company.verificationStatus,
      },
    });

    const employerEmail = `hiring@${company.slug.replace(/-/g, "")}.demo`;
    const employerUser = await prisma.user.upsert({
      where: { email: employerEmail },
      update: {},
      create: {
        email: employerEmail,
        name: `${company.name} Talent Team`,
        role: "EMPLOYER",
        passwordHash: await hash(DEMO_PASSWORD),
        emailVerified: new Date(),
      },
    });

    await prisma.employerMember.upsert({
      where: { userId_companyId: { userId: employerUser.id, companyId: companyRecord.id } },
      update: {},
      create: { userId: employerUser.id, companyId: companyRecord.id, role: "OWNER", title: "Talent Acquisition Lead" },
    });

    await prisma.subscription.upsert({
      where: { companyId: companyRecord.id },
      update: {},
      create: { companyId: companyRecord.id, plan: "GROWTH", status: "TRIALING", seats: 3 },
    });

    const jobsForCompany = JOBS.filter((j) => j.companySlug === company.slug);
    for (const job of jobsForCompany) {
      const publishedAt = new Date(Date.now() - job.daysAgo * 24 * 60 * 60 * 1000);
      const jobRecord = await prisma.job.upsert({
        where: { slug: job.slug },
        update: {},
        create: {
          companyId: companyRecord.id,
          createdByUserId: employerUser.id,
          title: job.title,
          slug: job.slug,
          description: job.description,
          responsibilities: job.responsibilities,
          requirements: job.requirements,
          department: job.department,
          industry: company.industry,
          employmentType: job.employmentType,
          workMode: job.workMode,
          experienceMinYears: job.experienceMinYears,
          experienceMaxYears: job.experienceMaxYears,
          educationRequirement: job.educationRequirement,
          salaryMin: job.salaryMin,
          salaryMax: job.salaryMax,
          isSalaryDisclosed: job.isSalaryDisclosed,
          locationCity: job.locationCity,
          locationCountry: "India",
          isFresherFriendly: job.isFresherFriendly,
          applicationMethod: "EASY_APPLY",
          status: "PUBLISHED",
          publishedAt,
        },
      });

      for (const skillName of job.skills) {
        const skillId = skillRecords.get(skillName);
        if (!skillId) continue;
        await prisma.jobSkill.upsert({
          where: { jobId_skillId: { jobId: jobRecord.id, skillId } },
          update: {},
          create: { jobId: jobRecord.id, skillId, isRequired: true },
        });
      }
    }
  }

  console.log("Seeding candidate users...");
  const CANDIDATES = [
    {
      email: "arjun.rao@abov.demo",
      name: "Arjun Rao",
      headline: "Aspiring Data Analyst",
      city: "Bengaluru",
      experienceYears: 0.5,
      skills: [
        { name: "Excel", proficiency: "INTERMEDIATE" as const },
        { name: "SQL", proficiency: "BEGINNER" as const },
        { name: "Statistics", proficiency: "BEGINNER" as const },
      ],
      education: { institutionName: "University of Mysore", degree: "B.Com", fieldOfStudy: "Commerce", startYear: 2021, endYear: 2024 },
    },
    {
      email: "sneha.iyer@abov.demo",
      name: "Sneha Iyer",
      headline: "Frontend Engineer, 3 yrs experience",
      city: "Pune",
      experienceYears: 3,
      skills: [
        { name: "React", proficiency: "ADVANCED" as const },
        { name: "TypeScript", proficiency: "ADVANCED" as const },
        { name: "JavaScript", proficiency: "EXPERT" as const },
        { name: "CSS", proficiency: "ADVANCED" as const },
        { name: "Git", proficiency: "ADVANCED" as const },
      ],
      education: { institutionName: "Pune Institute of Technology", degree: "B.E.", fieldOfStudy: "Computer Engineering", startYear: 2018, endYear: 2022 },
    },
    {
      email: "vikram.das@abov.demo",
      name: "Vikram Das",
      headline: "Marketing graduate exploring digital marketing roles",
      city: "Mumbai",
      experienceYears: 0,
      skills: [
        { name: "Content Writing", proficiency: "INTERMEDIATE" as const },
        { name: "SEO", proficiency: "BEGINNER" as const },
        { name: "Communication", proficiency: "ADVANCED" as const },
      ],
      education: { institutionName: "Mumbai University", degree: "BMS", fieldOfStudy: "Marketing", startYear: 2021, endYear: 2024 },
    },
    {
      email: "ananya.gupta@abov.demo",
      name: "Ananya Gupta",
      headline: "Backend Engineer, Node.js & SQL",
      city: "Pune",
      experienceYears: 4,
      skills: [
        { name: "Node.js", proficiency: "ADVANCED" as const },
        { name: "SQL", proficiency: "ADVANCED" as const },
        { name: "REST APIs", proficiency: "ADVANCED" as const },
        { name: "Docker", proficiency: "INTERMEDIATE" as const },
        { name: "AWS", proficiency: "INTERMEDIATE" as const },
      ],
      education: { institutionName: "VIT Pune", degree: "B.Tech", fieldOfStudy: "Information Technology", startYear: 2017, endYear: 2021 },
    },
    {
      email: "rahul.singh@abov.demo",
      name: "Rahul Singh",
      headline: "Finance graduate, open to analyst roles",
      city: "Chennai",
      experienceYears: 1,
      skills: [
        { name: "Financial Analysis", proficiency: "INTERMEDIATE" as const },
        { name: "Excel", proficiency: "ADVANCED" as const },
        { name: "Accounting", proficiency: "INTERMEDIATE" as const },
      ],
      education: { institutionName: "Loyola College Chennai", degree: "B.Com", fieldOfStudy: "Finance", startYear: 2020, endYear: 2023 },
    },
  ];

  const candidateProfileIds = new Map<string, string>();

  for (const candidate of CANDIDATES) {
    const user = await prisma.user.upsert({
      where: { email: candidate.email },
      update: {},
      create: {
        email: candidate.email,
        name: candidate.name,
        role: "CANDIDATE",
        passwordHash: await hash(DEMO_PASSWORD),
        emailVerified: new Date(),
      },
    });

    const profile = await prisma.candidateProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        headline: candidate.headline,
        locationCity: candidate.city,
        locationCountry: "India",
        experienceYears: candidate.experienceYears,
        availability: "WITHIN_2_WEEKS",
        preferredWorkModes: ["HYBRID", "REMOTE"],
        preferredEmploymentTypes: ["FULL_TIME"],
        salaryCurrency: "INR",
        profileCompleteness: 65,
      },
    });
    candidateProfileIds.set(candidate.email, profile.id);

    const existingEducation = await prisma.education.findFirst({ where: { candidateProfileId: profile.id } });
    if (!existingEducation) {
      await prisma.education.create({ data: { candidateProfileId: profile.id, ...candidate.education } });
    }

    for (const skill of candidate.skills) {
      const skillId = skillRecords.get(skill.name);
      if (!skillId) continue;
      await prisma.candidateSkill.upsert({
        where: { candidateProfileId_skillId: { candidateProfileId: profile.id, skillId } },
        update: { proficiency: skill.proficiency },
        create: { candidateProfileId: profile.id, skillId, proficiency: skill.proficiency },
      });
    }
  }

  console.log("Seeding sample applications...");
  const dataAnalystJob = await prisma.job.findUnique({ where: { slug: "northbridge-analytics-data-analyst" } });
  const frontendJob = await prisma.job.findUnique({ where: { slug: "verdant-systems-frontend-engineer" } });
  const arjunProfileId = candidateProfileIds.get("arjun.rao@abov.demo");
  const snehaProfileId = candidateProfileIds.get("sneha.iyer@abov.demo");

  if (dataAnalystJob && arjunProfileId) {
    await prisma.application.upsert({
      where: { jobId_candidateProfileId: { jobId: dataAnalystJob.id, candidateProfileId: arjunProfileId } },
      update: {},
      create: {
        jobId: dataAnalystJob.id,
        candidateProfileId: arjunProfileId,
        status: "SCREENING",
        matchScore: 62,
      },
    });
  }

  if (frontendJob && snehaProfileId) {
    await prisma.application.upsert({
      where: { jobId_candidateProfileId: { jobId: frontendJob.id, candidateProfileId: snehaProfileId } },
      update: {},
      create: {
        jobId: frontendJob.id,
        candidateProfileId: snehaProfileId,
        status: "SHORTLISTED",
        matchScore: 88,
      },
    });
  }

  console.log("Seeding learning paths...");
  for (const path of LEARNING_PATHS) {
    const careerPathId = careerPathRecords.get(path.careerSlug);
    const record = await prisma.learningPath.upsert({
      where: { slug: path.slug },
      update: { title: path.title, description: path.description, estimatedHours: path.estimatedHours },
      create: {
        careerPathId,
        title: path.title,
        slug: path.slug,
        description: path.description,
        estimatedHours: path.estimatedHours,
      },
    });

    const existingModules = await prisma.learningModule.findMany({ where: { learningPathId: record.id } });
    if (existingModules.length === 0) {
      let order = 0;
      for (const mod of path.modules) {
        await prisma.learningModule.create({
          data: {
            learningPathId: record.id,
            title: mod.title,
            order: order++,
            skillId: mod.skill ? skillRecords.get(mod.skill) : undefined,
            resourceType: mod.type,
            estimatedHours: mod.hours,
          },
        });
      }
    }
  }

  console.log("Seeding articles...");
  for (const article of ARTICLES) {
    await prisma.article.upsert({
      where: { slug: article.slug },
      update: {},
      create: {
        slug: article.slug,
        title: article.title,
        excerpt: article.excerpt,
        body: article.body,
        category: article.category,
        authorName: article.authorName,
        readingMinutes: article.readingMinutes,
        publishedAt: new Date(Date.now() - article.daysAgo * 24 * 60 * 60 * 1000),
      },
    });
  }

  console.log("Seeding career assessment...");
  const existingAssessment = await prisma.assessment.findFirst({ where: { type: "CAREER" } });
  if (!existingAssessment) {
    const assessment = await prisma.assessment.create({
      data: {
        type: "CAREER",
        title: "Career direction assessment",
        description: "A short set of questions about your interests and work preferences, used to suggest career paths to explore.",
        questions: {
          create: [
            {
              prompt: "Which of these activities sounds most engaging to you?",
              type: "SINGLE_CHOICE",
              order: 0,
              options: {
                create: [
                  { label: "Finding patterns in a spreadsheet full of numbers", value: "data", order: 0 },
                  { label: "Designing how a screen or product should look and work", value: "design", order: 1 },
                  { label: "Writing code that makes something function", value: "engineering", order: 2 },
                  { label: "Persuading people through writing or conversation", value: "marketing", order: 3 },
                  { label: "Helping coordinate people and processes", value: "people", order: 4 },
                ],
              },
            },
            {
              prompt: "How do you prefer to work day-to-day?",
              type: "SINGLE_CHOICE",
              order: 1,
              options: {
                create: [
                  { label: "Mostly independently, with focused blocks of time", value: "independent", order: 0 },
                  { label: "Mostly collaborative, in meetings and pairing", value: "collaborative", order: 1 },
                  { label: "A mix of both", value: "mixed", order: 2 },
                ],
              },
            },
            {
              prompt: "Which best describes your current comfort with technical tools (spreadsheets, code, design software)?",
              type: "SCALE",
              order: 2,
              options: {
                create: [
                  { label: "Not comfortable yet", value: "1", order: 0 },
                  { label: "Basic comfort", value: "2", order: 1 },
                  { label: "Comfortable", value: "3", order: 2 },
                  { label: "Very comfortable", value: "4", order: 3 },
                ],
              },
            },
          ],
        },
      },
    });
    console.log(`Created career assessment ${assessment.id}`);
  }

  console.log("Seeding institution, educator, and a cohort...");
  const institution = await prisma.institution.upsert({
    where: { slug: "bellwood-institute-of-technology" },
    update: {},
    create: {
      name: "Bellwood Institute of Technology",
      slug: "bellwood-institute-of-technology",
      type: "COLLEGE",
      city: "Pune",
      country: "India",
      verificationStatus: "VERIFIED",
    },
  });

  const educatorUser = await prisma.user.upsert({
    where: { email: "educator@bellwood.demo" },
    update: {},
    create: {
      email: "educator@bellwood.demo",
      name: "Kavita Nair",
      role: "INSTITUTION",
      passwordHash: await hash(DEMO_PASSWORD),
      emailVerified: new Date(),
    },
  });

  await prisma.institutionMember.upsert({
    where: { userId_institutionId: { userId: educatorUser.id, institutionId: institution.id } },
    update: {},
    create: { userId: educatorUser.id, institutionId: institution.id, role: "ADMIN" },
  });

  const cohort = await prisma.cohort.findFirst({ where: { institutionId: institution.id, name: "2026 Computer Applications" } });
  const cohortRecord =
    cohort ??
    (await prisma.cohort.create({
      data: {
        institutionId: institution.id,
        name: "2026 Computer Applications",
        startDate: new Date("2026-06-01"),
        endDate: new Date("2027-05-31"),
      },
    }));

  for (const email of ["arjun.rao@abov.demo", "vikram.das@abov.demo"]) {
    const candidateProfileId = candidateProfileIds.get(email);
    if (!candidateProfileId) continue;
    await prisma.cohortStudent.upsert({
      where: { cohortId_candidateProfileId: { cohortId: cohortRecord.id, candidateProfileId } },
      update: {},
      create: { cohortId: cohortRecord.id, candidateProfileId },
    });
  }

  console.log("Seed complete.");
  console.log(`\nDemo accounts (all use password: ${DEMO_PASSWORD}):`);
  console.log("  admin@abov.demo            — Admin");
  console.log("  educator@bellwood.demo     — Institution admin (Bellwood Institute)");
  console.log("  hiring@northbridgeanalytics.demo — Employer (Northbridge Analytics)");
  console.log("  hiring@verdantsystems.demo       — Employer (Verdant Systems)");
  console.log("  arjun.rao@abov.demo         — Candidate");
  console.log("  sneha.iyer@abov.demo        — Candidate");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
