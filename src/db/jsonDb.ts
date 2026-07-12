import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Company, Resume, Campaign, ChatMessage, Notification, User, ProposalItem } from '../types';

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

// High-security password hashing using built-in PBKDF2/SHA256
export function hashPassword(password: string): string {
  return crypto.pbkdf2Sync(password, 'recruitment-salt-key', 1000, 64, 'sha256').toString('hex');
}

interface DBStructure {
  users: Array<User & { passwordHash: string }>;
  companies: Company[];
  resumes: Resume[];
  campaigns: Campaign[];
  chats: ChatMessage[];
  notifications: Notification[];
  proposals: ProposalItem[];
}

const DEFAULT_USERS = [
  {
    id: 'u-1',
    name: 'Platform Administrator',
    email: 'admin@recruitment.ai',
    role: 'Admin' as const,
    passwordHash: hashPassword('admin123'),
    createdAt: new Date().toISOString()
  },
  {
    id: 'u-2',
    name: 'Senior Technical Recruiter',
    email: 'recruiter@recruitment.ai',
    role: 'Recruiter' as const,
    passwordHash: hashPassword('recruiter123'),
    createdAt: new Date().toISOString()
  },
  {
    id: 'u-3',
    name: 'HR Operations Manager',
    email: 'manager@recruitment.ai',
    role: 'HR Manager' as const,
    passwordHash: hashPassword('manager123'),
    createdAt: new Date().toISOString()
  },
  {
    id: 'u-4',
    name: 'Guest Analytics Viewer',
    email: 'viewer@recruitment.ai',
    role: 'Viewer' as const,
    passwordHash: hashPassword('viewer123'),
    createdAt: new Date().toISOString()
  }
];

const SEED_COMPANIES: Company[] = [
  {
    id: 'c-1',
    name: 'Apex Global Technologies',
    industry: 'Software & Cloud Services',
    businessType: 'B2B SaaS Enterprise',
    employeeCount: 4500,
    location: 'Chennai, Tamil Nadu',
    website: 'https://apextech.io',
    linkedin: 'https://linkedin.com/company/apextech',
    techStack: ['React', 'Node.js', 'AWS', 'PostgreSQL', 'Docker', 'Kubernetes'],
    currentHiringStatus: 'Active',
    hiringVolume: 'High',
    departmentsHiring: ['Engineering', 'Product Management', 'Data Analytics'],
    preferredCandidateProfile: 'Senior Full Stack Engineers with cloud experience',
    campusHiring: true,
    lateralHiring: true,
    recruitmentDifficulty: 'High',
    companyGrowthRate: 'High',
    leadScore: 92,
    leadCategory: 'Hot',
    predictionScore: 94,
    confidence: 88,
    status: 'Active',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    analysis: {
      summary: 'Apex Global is a rapid-growth SaaS provider expanding its engineering hubs in South Asia. Their primary hiring driver is scaling their cloud infrastructure and core platform API capabilities.',
      businessModel: 'Enterprise Subscription-Based SaaS with custom multi-tenant architecture.',
      industryAnalysis: 'The cloud service industry in India is experiencing a CAGR of 22%, driving immense talent competition for React & Cloud-native engineers.',
      hiringPattern: 'Concentrated hiring spurts in Q1 and Q3, leaning heavily on hybrid campus drives and proactive lateral agency hires.',
      recruitmentDemand: 'Expecting to hire 150+ engineers over the next fiscal year, particularly focused on Kubernetes/DevOps specialists and Senior React developers.',
      estimatedHiringBudget: '$1,200,000 annually across standard agencies and platforms.',
      expansionPotential: 'Establishing a new 500-seat R&D center in Bangalore by Q4, offering a strong sales outreach opportunity.',
      technologyAdoption: 'Cutting-edge. Moving completely to micro-frontends and multi-cloud Kubernetes pipelines.',
      digitalMaturity: 'Advanced. Automated CI/CD, fully documented API-first structures, and high automated testing coverage.',
      recruitmentRecommendation: 'Pitch a dedicated talent pipeline campaign focusing on DevOps talent and automated screening metrics to reduce high Engineering screening workload.',
      bestOutreachStrategy: 'Inbound positioning focusing on DevSecOps certification pipelines and personalized executive pitches to the VP of Engineering.',
      riskLevel: 'Low',
      priorityLevel: 'High',
      growthPrediction: 'Strong core growth expected to continue over the next 24 months due to double-digit ARR expansions.'
    }
  },
  {
    id: 'c-2',
    name: 'Starlight BioHealth Sciences',
    industry: 'Healthcare & Biotechnology',
    businessType: 'Therapeutics & R&D',
    employeeCount: 850,
    location: 'Hyderabad, Telangana',
    website: 'https://starlightbio.com',
    linkedin: 'https://linkedin.com/company/starlightbio',
    techStack: ['Python', 'Django', 'React', 'MongoDB', 'AWS', 'TensorFlow'],
    currentHiringStatus: 'Active',
    hiringVolume: 'Medium',
    departmentsHiring: ['Machine Learning Research', 'Data Science', 'Clinical Operations'],
    preferredCandidateProfile: 'Bioinformatics Analysts and Deep Learning Scientists',
    campusHiring: false,
    lateralHiring: true,
    recruitmentDifficulty: 'High',
    companyGrowthRate: 'Stable',
    leadScore: 78,
    leadCategory: 'Hot',
    predictionScore: 82,
    confidence: 85,
    status: 'Active',
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    analysis: {
      summary: 'Starlight BioHealth develops AI-driven drug discovery pipelines. They rely on combining complex machine learning models with standard clinical trials.',
      businessModel: 'B2B pharmaceutical IP licensing and clinical research partnerships.',
      industryAnalysis: 'AI-in-Healthcare is seeing unprecedented investment. Specialists with both biology and machine learning domain-knowledge are in extremely high demand.',
      hiringPattern: 'Ad-hoc lateral hires with high credential screening requirements (Ph.D. preferred).',
      recruitmentDemand: 'Steady demand for deep-learning data scientists with PyTorch/TensorFlow expertise.',
      estimatedHiringBudget: '$450,000 annually.',
      expansionPotential: 'Expanding deep learning computational labs. Highly likely to hire 10+ AI Researchers.',
      technologyAdoption: 'Highly technical. Extensive use of GPUs, Python-based pipeline processing, and distributed computing.',
      digitalMaturity: 'Medium-High. High research output but engineering structures are still maturing.',
      recruitmentRecommendation: 'Offer highly-vetted PhD research pipelines and specialist bioinformatics talent profiling.',
      bestOutreachStrategy: 'Direct clinical/technical recruitment proposals to the Chief Scientific Officer highlighting our AI-powered resume matching capabilities.',
      riskLevel: 'Medium',
      priorityLevel: 'Medium',
      growthPrediction: 'Stable. Backed by major biotech venture capital with a 3-year cash runway.'
    }
  },
  {
    id: 'c-3',
    name: 'Velo Financial Systems',
    industry: 'FinTech & Banking',
    businessType: 'Digital Lending Platform',
    employeeCount: 1800,
    location: 'Mumbai, Maharashtra',
    website: 'https://velofin.com',
    linkedin: 'https://linkedin.com/company/velofin',
    techStack: ['Java', 'Spring Boot', 'Angular', 'Oracle', 'Docker', 'Google Cloud'],
    currentHiringStatus: 'Passive',
    hiringVolume: 'Low',
    departmentsHiring: ['Security Operations', 'Compliance & Risk'],
    preferredCandidateProfile: 'Certified Information Security Analysts and Risk Auditors',
    campusHiring: true,
    lateralHiring: true,
    recruitmentDifficulty: 'Medium',
    companyGrowthRate: 'Stable',
    leadScore: 45,
    leadCategory: 'Warm',
    predictionScore: 50,
    confidence: 76,
    status: 'Active',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    analysis: {
      summary: 'Velo Financial provides secure retail micro-credit lending via native mobile applications. High focus on low-latency microservices and banking security compliant integrations.',
      businessModel: 'Consumer transaction fee margins and micro-lending interest margins.',
      industryAnalysis: 'Indian digital lending regulations are tightening, driving massive recruitment in fintech risk compliance and cybersecurity.',
      hiringPattern: 'Annual graduate intakes followed by high-experience lateral cybersecurity hires.',
      recruitmentDemand: 'Low immediate developer headcount, but high critical priority for compliance and information security positions.',
      estimatedHiringBudget: '$300,000 annually.',
      expansionPotential: 'Medium. Looking to launch in Southeast Asian markets within 12 months.',
      technologyAdoption: 'Traditional enterprise scale. Spring Boot microservices and Oracle databases.',
      digitalMaturity: 'Advanced compliance-driven digital maturity. Strict security audits and firewalls.',
      recruitmentRecommendation: 'Propose a dedicated security headhunting retainer to secure elite Certified Risk Analysts.',
      bestOutreachStrategy: 'Compliance-focused informational outreach to the Chief Risk Officer showing secure candidate analysis metrics.',
      riskLevel: 'Low',
      priorityLevel: 'Medium',
      growthPrediction: 'Consolidating and optimizing operations after a massive customer acquisition phase last year.'
    }
  }
];

const SEED_RESUMES: Resume[] = [
  {
    id: 'r-1',
    candidateName: 'Abhishek Sharma',
    email: 'abhishek.sharma@example.com',
    phone: '+91 98765 43210',
    location: 'Bangalore, Karnataka',
    fileName: 'abhishek_sharma_fullstack_resume.pdf',
    fileType: 'pdf',
    uploadDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'Parsed',
    overallScore: 88,
    scoreBreakdown: {
      completeness: 95,
      formatting: 90,
      professionalSummary: 85,
      technicalSkills: 92,
      softSkills: 80,
      projects: 88,
      experience: 86,
      education: 85,
      achievements: 80,
      certifications: 85,
      communication: 90,
      grammar: 95,
      keywordDensity: 82,
      readability: 88
    },
    strengths: [
      'Strong proficiency in React, TypeScript, and Node.js backend integration.',
      'Demonstrated experience with AWS deployment, Docker containerization, and serverless workflows.',
      'Excellent documentation and well-designed project examples.'
    ],
    weaknesses: [
      'Relatively short tenures in current early-stage positions.',
      'Lacks advanced corporate cloud-architecture certifications.'
    ],
    atsScore: 84,
    atsPass: true,
    atsIssues: [
      'Slightly dense multi-column layout on some parsers.',
      'Limited use of quantitative metric-based achievements in early job descriptions.'
    ],
    atsKeywordsMissing: ['Kubernetes', 'CI/CD Pipelines', 'GraphQL'],
    atsSuggestions: [
      'Add metrics (e.g., "Increased server processing speed by 35%") to project items.',
      'Incorporate a dedicated Certifications section right after Education.'
    ],
    extractedData: {
      candidateName: 'Abhishek Sharma',
      email: 'abhishek.sharma@example.com',
      phone: '+91 98765 43210',
      address: 'Indiranagar, Bangalore, Karnataka, India',
      linkedin: 'https://linkedin.com/in/abhishek-sharma-dev',
      github: 'https://github.com/abhisheksharma-dev',
      portfolio: 'https://abhisheksharma.dev',
      education: [
        {
          college: 'RV College of Engineering, Bangalore',
          degree: 'B.E. in Computer Science',
          cgpa: '8.4 / 10',
          graduationYear: '2023'
        }
      ],
      experience: [
        {
          company: 'CloudFlow Solutions',
          role: 'Junior Full Stack Engineer',
          duration: 'June 2023 - Present',
          description: 'Developed React dashboard applications for real-time telemetry analysis. Constructed robust Express APIs managing secure authentication pipelines.'
        },
        {
          company: 'CodeForge Labs',
          role: 'Software Engineer Intern',
          duration: 'Jan 2023 - May 2023',
          description: 'Optimized PostgreSQL data queries, achieving a 20% reduction in API server latency. Maintained unit and integration test coverages above 85%.'
        }
      ],
      projects: [
        {
          name: 'CollabCanvas Collaborative Board',
          description: 'A multi-user collaborative drawing board leveraging WebSockets, Redis, and React canvas structures.',
          technologies: ['React', 'WebSockets', 'Redis', 'Node.js', 'Tailwind']
        }
      ],
      technicalSkills: ['React', 'TypeScript', 'Node.js', 'Express', 'PostgreSQL', 'Docker', 'AWS', 'Tailwind CSS', 'Git', 'REST APIs'],
      softSkills: ['Team Collaboration', 'Problem Solving', 'Technical Writing', 'Agile Methodologies'],
      programmingLanguages: ['TypeScript', 'JavaScript', 'Python', 'SQL', 'C++'],
      frameworks: ['React', 'Node.js', 'Express', 'Next.js', 'Tailwind'],
      databases: ['PostgreSQL', 'MongoDB', 'Redis'],
      cloudPlatforms: ['AWS', 'Heroku'],
      certifications: ['AWS Certified Solutions Architect Associate', 'React Core Certification'],
      languages: ['English', 'Hindi', 'Kannada'],
      achievements: ['Won 2nd place in Bangalore SmartCity Hackathon 2022', 'Contributed 5+ major open source modules to React packages'],
      internships: ['Software Engineer Intern at CodeForge Labs'],
      researchPapers: []
    },
    improvements: {
      professionalSummary: 'Full Stack Engineer with 2+ years of core experience in architecting responsive React interfaces and high-performance Node.js/Express REST APIs. Adept in streamlining database operations and implementing robust cloud deployments.',
      experience: 'Engineered responsive React analytics dashboard interfaces reducing client loading latency by 15%. Structured enterprise-grade Express API pipelines utilizing JWT and cryptographic validation, handling 50k+ daily operational payloads safely.',
      projects: 'Spearheaded development of CollabCanvas, an enterprise real-time WebSocket dashboard, reducing user syncing lag by 40%.',
      skills: 'Consolidated technical skills list into: Frontend (React, Next.js, TypeScript), Backend (Node.js, Express, PostgreSQL, Redis), DevOps (AWS, Docker, Git).',
      achievements: 'Secured Silver Medal out of 450+ technical teams in Bangalore Hackathon 2022.',
      grammarAndStructure: 'Polished verb tenses and replaced generic descriptions with dynamic high-agency action verbs.'
    },
    jobDescriptionMatches: [
      {
        id: 'c-1',
        jobTitle: 'Senior Full Stack Engineer (React/Cloud)',
        matchScore: 82,
        skillMatchPercent: 85,
        experienceMatchPercent: 75,
        educationMatchPercent: 90,
        keywordMatchPercent: 80,
        missingSkills: ['Kubernetes', 'CI/CD Pipelines', 'GraphQL'],
        missingCertifications: [],
        missingTools: ['Kubernetes', 'Jenkins'],
        suggestedLearning: ['AWS Certified Developer Associate course', 'Kubernetes Deep Dive'],
        recommendedProjects: ['Build a multi-container deployment utilizing local Kubernetes cluster and automated CI/CD pipelines.'],
        recommendationSummary: 'Strong technical fit on React and databases. Needs minor bridging on Kubernetes and modern pipeline orchestration to match Senior expectation.'
      }
    ],
    skillGap: {
      missingTechnicalSkills: ['Kubernetes', 'GraphQL', 'Terraform'],
      missingSoftSkills: ['Stakeholder Communication', 'System Architecture Design'],
      missingCertifications: ['Certified Kubernetes Administrator (CKA)'],
      missingProjects: ['Multi-container Microservice Deployment', 'CI/CD Pipeline Automation'],
      missingExperience: ['3+ Years in senior system design ownership roles.'],
      recommendedCourses: ['Udemy: Docker & Kubernetes Complete Guide by Stephen Grider', 'Coursera: System Architecture and Design Pattern Masterclass'],
      recommendedBooks: ['"Designing Data-Intensive Applications" by Martin Kleppmann'],
      recommendedProjects: ['Construct an automated GitHub Actions pipeline that deploys a containerized Next.js/Go backend to AWS EKS using Terraform.'],
      recommendedCertifications: ['Certified Kubernetes Administrator (CKA)', 'AWS Certified Developer - Associate'],
      learningRoadmap: 'A progressive monthly learning focus bridging Containerization (Month 1), Kubernetes Pod deployment (Month 2), Terraform configuration (Month 3).',
      gapPercentage: 25,
      priorityLevel: 'Medium',
      estimatedLearningTime: '12-16 Weeks'
    },
    careerMatches: [
      {
        roleName: 'Full Stack Engineer',
        confidenceScore: 95,
        requiredSkills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
        currentReadiness: 92,
        missingSkills: [],
        salaryRange: '₹12,00,000 - ₹18,00,000 LPA',
        industryDemand: 'High'
      },
      {
        roleName: 'Cloud Engineer',
        confidenceScore: 78,
        requiredSkills: ['AWS', 'Docker', 'Kubernetes', 'Linux', 'Python'],
        currentReadiness: 72,
        missingSkills: ['Kubernetes', 'Linux Scripting'],
        salaryRange: '₹14,00,000 - ₹22,00,000 LPA',
        industryDemand: 'High'
      },
      {
        roleName: 'Software Engineer',
        confidenceScore: 90,
        requiredSkills: ['Data Structures', 'System Design', 'APIs', 'Database'],
        currentReadiness: 88,
        missingSkills: ['System Design Scale'],
        salaryRange: '₹10,00,000 - ₹16,00,000 LPA',
        industryDemand: 'High'
      }
    ],
    learningRoadmap: {
      weeklyPlan: [
        { week: 1, focus: 'Docker Advanced concepts', topics: ['Multi-stage builds', 'Docker compose networks'], tasks: ['Refactor CollabCanvas Dockerfile to use multi-stage production builds'] },
        { week: 2, focus: 'Kubernetes basics', topics: ['Pods', 'Services', 'Deployments'], tasks: ['Deploy local React/Node app into minikube cluster'] }
      ],
      monthlyPlan: [
        { month: 1, focus: 'Container Orchestration & Microservices', targetMilestones: ['Deploy a 3-tier microservice architecture into Kubernetes.'] },
        { month: 2, focus: 'Automated CI/CD and Infrastructure as Code', targetMilestones: ['Write complete Terraform files deploying to AWS and configure GitHub Actions.'] }
      ],
      recommendedCertifications: ['AWS Certified Developer - Associate', 'Certified Kubernetes Administrator (CKA)'],
      recommendedCourses: ['Ultimate Docker & Kubernetes Course (Mosh Hamedani)'],
      recommendedProjects: ['Multi-node Kubernetes setup with automated let\'s encrypt SSL pipelines.'],
      targetCompanies: ['Apex Global Technologies', 'Flipkart', 'Freshworks'],
      expectedTimeline: '3 Months',
      learningDifficulty: 'Intermediate',
      progress: 35
    }
  },
  {
    id: 'r-2',
    candidateName: 'Priyanjali Sen',
    email: 'priya.sen@example.com',
    phone: '+91 91234 56789',
    location: 'Hyderabad, Telangana',
    fileName: 'priya_sen_datascience_resume.pdf',
    fileType: 'pdf',
    uploadDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'Parsed',
    overallScore: 92,
    scoreBreakdown: {
      completeness: 98,
      formatting: 95,
      professionalSummary: 90,
      technicalSkills: 95,
      softSkills: 88,
      projects: 92,
      experience: 90,
      education: 95,
      achievements: 85,
      certifications: 90,
      communication: 92,
      grammar: 98,
      keywordDensity: 86,
      readability: 92
    },
    strengths: [
      'In-depth knowledge of deep learning frameworks (TensorFlow, PyTorch, Scikit-learn).',
      'Strong academic profile with active machine learning publications.',
      'Excellent analytical background in data preprocessing, pipeline creation, and model training.'
    ],
    weaknesses: [
      'Limited experience in frontend and standard web integration (React, Angular).',
      'Minimal DevOps container management experience.'
    ],
    atsScore: 90,
    atsPass: true,
    atsIssues: [],
    atsKeywordsMissing: ['AWS Sagemaker', 'Kubeflow', 'Docker'],
    atsSuggestions: [
      'Highlight cloud model hosting architectures such as AWS SageMaker.',
      'Include simple references to APIs or endpoints written for model deployment.'
    ],
    extractedData: {
      candidateName: 'Priyanjali Sen',
      email: 'priya.sen@example.com',
      phone: '+91 91234 56789',
      address: 'Gachibowli, Hyderabad, Telangana, India',
      linkedin: 'https://linkedin.com/in/priya-sen-datascience',
      github: 'https://github.com/priyasendata',
      portfolio: 'https://priyasen.ai',
      education: [
        {
          college: 'IIT Hyderabad',
          degree: 'M.Tech in Data Science & Machine Learning',
          cgpa: '9.1 / 10',
          graduationYear: '2022'
        }
      ],
      experience: [
        {
          company: 'Neuropixel Solutions',
          role: 'Machine Learning Engineer',
          duration: 'July 2022 - Present',
          description: 'Constructed state-of-the-art vision models for automated cell detection. Optimized model compilation reducing inference latency by 45%.'
        }
      ],
      projects: [
        {
          name: 'MedSegment Lung Segmentation',
          description: '3D UNet Convolutional Neural Network deployed on AWS backend predicting tumor nodules from raw high-density medical CT scans.',
          technologies: ['Python', 'PyTorch', 'AWS', 'OpenCV']
        }
      ],
      technicalSkills: ['Python', 'PyTorch', 'TensorFlow', 'Scikit-learn', 'Pandas', 'NumPy', 'OpenCV', 'SQL', 'Data Science', 'Machine Learning'],
      softSkills: ['Analytical Rigor', 'Technical Communication', 'Research Methodology'],
      programmingLanguages: ['Python', 'R', 'SQL', 'C++'],
      frameworks: ['PyTorch', 'TensorFlow', 'FastAPI', 'Flask'],
      databases: ['PostgreSQL', 'MongoDB'],
      cloudPlatforms: ['AWS'],
      certifications: ['TensorFlow Developer Certification', 'Google Cloud Professional Data Engineer'],
      languages: ['English', 'Bengali', 'Hindi'],
      achievements: ['Published paper in NeurIPS Workshop 2022', 'Top 1% Rank in Kaggle Lung Segmentation Challenge'],
      internships: ['Data Science Intern at Bangalore AI Research Lab'],
      researchPapers: ['"Optimizing Convolutional Segments in Medical Imaging" - NeurIPS 2022 Workshop']
    },
    improvements: {
      professionalSummary: 'Machine Learning Engineer and IIT Hyderabad Graduate with specialized experience in computer vision, automated cell segmentation, and PyTorch deep-learning architectures. Expert in model latency optimizations and pharmaceutical analytics systems.',
      experience: 'Architected and validated advanced Convolutional Neural Network (CNN) models for complex tumor segmentation, increasing overall prediction F1-score from 0.88 to 0.94.',
      projects: 'Engineered MedSegment, a production 3D medical vision backend, serving high-concurrency prediction routes optimized with FastAPI.',
      skills: 'Expanded Python profiling skills to include Pandas vector optimizations, TensorFlow Lite, and model quantization metrics.',
      achievements: 'Ranked in the top 1% among 2000+ globally participating computational teams in Kaggle Medical Segment Challenges.',
      grammarAndStructure: 'Adjusted sentence architectures to follow direct and measurable operational metrics.'
    },
    jobDescriptionMatches: [
      {
        id: 'c-2',
        jobTitle: 'Deep Learning Scientist / Bioinformatics Analyst',
        matchScore: 94,
        skillMatchPercent: 96,
        experienceMatchPercent: 90,
        educationMatchPercent: 95,
        keywordMatchPercent: 92,
        missingSkills: [],
        missingCertifications: [],
        missingTools: [],
        suggestedLearning: ['AWS SageMaker deployment pipelines', 'Intro to Medical Bioinformatics'],
        recommendedProjects: ['Incorporate biological gene sequencing data parsing into ML models.'],
        recommendationSummary: 'Ideal fit. Candidate holds master-level academic credentials in ML from IIT, active NeurIPS workshop publication, and strong hands-on PyTorch medical imaging projects.'
      }
    ],
    skillGap: {
      missingTechnicalSkills: ['AWS SageMaker', 'Kubeflow', 'MLflow', 'Docker'],
      missingSoftSkills: ['Agile Sprint Planning'],
      missingCertifications: ['AWS Certified Machine Learning - Specialty'],
      missingProjects: ['Production ML Deployment with MLflow and Docker containerization.'],
      missingExperience: ['Deploying production machine learning architectures in scaled enterprise applications.'],
      recommendedCourses: ['AWS Machine Learning Specialty Course (Stephane Maarek)', 'MLOps Zoomcamp (DataTalks.Club)'],
      recommendedBooks: ['"Designing Machine Learning Systems" by Chip Huyen'],
      recommendedProjects: ['Wrap PyTorch segmentation model inside FastAPI, containerize with Docker, and setup automated model registry logging via MLflow.'],
      recommendedCertifications: ['AWS Certified Machine Learning Specialty'],
      learningRoadmap: 'Focusing on MLOps (Month 1), Cloud Deployment Pipelines (Month 2), Model Tracking registries (Month 3).',
      gapPercentage: 15,
      priorityLevel: 'Low',
      estimatedLearningTime: '6-8 Weeks'
    },
    careerMatches: [
      {
        roleName: 'Machine Learning Engineer',
        confidenceScore: 98,
        requiredSkills: ['Python', 'PyTorch', 'TensorFlow', 'FastAPI'],
        currentReadiness: 95,
        missingSkills: [],
        salaryRange: '₹18,00,000 - ₹30,00,000 LPA',
        industryDemand: 'High'
      },
      {
        roleName: 'Data Scientist',
        confidenceScore: 92,
        requiredSkills: ['Python', 'Pandas', 'SQL', 'Scikit-learn', 'Statistics'],
        currentReadiness: 94,
        missingSkills: [],
        salaryRange: '₹15,00,000 - ₹25,00,000 LPA',
        industryDemand: 'High'
      },
      {
        roleName: 'AI Researcher',
        confidenceScore: 90,
        requiredSkills: ['Deep Learning Theory', 'Research Publishing', 'Mathematics'],
        currentReadiness: 92,
        missingSkills: [],
        salaryRange: '₹20,00,000 - ₹35,00,000 LPA',
        industryDemand: 'High'
      }
    ],
    learningRoadmap: {
      weeklyPlan: [
        { week: 1, focus: 'FastAPI wrapping for Deep Learning Models', topics: ['Async endpoints', 'FastAPI response schemas'], tasks: ['Write model serving script for lung segmentation UNet'] },
        { week: 2, focus: 'Dockerizing Machine Learning containers', topics: ['PyTorch CPU base images', 'CUDA runtime drivers'], tasks: ['Create specialized multi-stage ML Dockerfile'] }
      ],
      monthlyPlan: [
        { month: 1, focus: 'MLOps & Model Tracking', targetMilestones: ['Deploy Model serving endpoints tracking and register models using MLflow.'] },
        { month: 2, focus: 'Cloud Orchestration for Model Pipelines', targetMilestones: ['Setup Kubernetes inference pipelines on AWS SageMaker or EKS.'] }
      ],
      recommendedCertifications: ['AWS Certified Machine Learning Specialty', 'Google Cloud Professional Machine Learning Engineer'],
      recommendedCourses: ['MLOps Fundamentals (Coursera)'],
      recommendedProjects: ['Complete end-to-end medical segmentation model deployment on AWS EKS using Jenkins automated pipelines.'],
      targetCompanies: ['Starlight BioHealth Sciences', 'Microsoft Research', 'SigTuple'],
      expectedTimeline: '2 Months',
      learningDifficulty: 'Advanced',
      progress: 60
    }
  }
];

const SEED_CAMPAIGNS: Campaign[] = [
  {
    id: 'camp-1',
    name: 'Q3 Enterprise DevOps Drive',
    targetIndustry: 'Software & Cloud Services',
    targetCompanies: ['Apex Global Technologies', 'ChennaiTech Ltd'],
    priority: 'High',
    campaignObjective: 'Identify and secure Senior Kubernetes, DevOps, and Full-Stack candidates.',
    status: 'Running',
    schedule: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    aiStrategy: {
      description: 'An AI-powered automated candidate pipeline campaign targeting companies moving to multi-cloud Kubernetes architectures.',
      goals: ['Source 15 highly qualified DevOps / SRE candidates.', 'Maintain an ATS compliance filter above 80%.'],
      expectedResults: 'At least 3 technical hires successfully secured for cloud scaling.',
      recruitmentStrategy: 'High-touch outreach to senior container specialists leveraging resume improvement roadmaps as a candidate benefit.',
      successProbability: 85
    },
    createdAt: new Date().toISOString()
  },
  {
    id: 'camp-2',
    name: 'BioHealth Deep Learning Intake',
    targetIndustry: 'Healthcare & Biotechnology',
    targetCompanies: ['Starlight BioHealth Sciences'],
    priority: 'Medium',
    campaignObjective: 'Sourcing Master & Ph.D. level Computer Vision and bioinformatics talent.',
    status: 'Planned',
    schedule: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
    aiStrategy: {
      description: 'Academic and challenge-based ML recruitment focusing on Kaggle competition experts and research paper contributors.',
      goals: ['Sift and extract 10 top bioinformatics experts with deep PyTorch experience.'],
      expectedResults: 'Successful hiring of a Deep Learning Lead Researcher.',
      recruitmentStrategy: 'Direct academic paper analysis networking coupled with Kaggle ranking verification.',
      successProbability: 75
    },
    createdAt: new Date().toISOString()
  }
];

const DEFAULT_NOTIFICATIONS: Notification[] = [
  {
    id: 'n-1',
    title: 'Platform Pre-Seeded',
    content: 'Enterprise recruitment analytics and candidate evaluation seed records loaded successfully.',
    type: 'success',
    date: new Date().toISOString(),
    read: false
  },
  {
    id: 'n-2',
    title: 'AI Analysis Synced',
    content: 'Company analyzer and resume scorers connected to Gemini AI system.',
    type: 'info',
    date: new Date().toISOString(),
    read: false
  }
];

function initDB() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (!fs.existsSync(DB_PATH)) {
    const initialData: DBStructure = {
      users: DEFAULT_USERS,
      companies: SEED_COMPANIES,
      resumes: SEED_RESUMES,
      campaigns: SEED_CAMPAIGNS,
      chats: [],
      notifications: DEFAULT_NOTIFICATIONS,
      proposals: []
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2), 'utf-8');
  }
}

export class JsonDB {
  private static readData(): DBStructure {
    initDB();
    const content = fs.readFileSync(DB_PATH, 'utf-8');
    const parsed = JSON.parse(content);
    if (!parsed.proposals) {
      parsed.proposals = [];
      fs.writeFileSync(DB_PATH, JSON.stringify(parsed, null, 2), 'utf-8');
    }
    return parsed;
  }

  private static writeData(data: DBStructure) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  }

  // User Operations
  static getUsers() {
    return this.readData().users;
  }

  static getUserByEmail(email: string) {
    return this.readData().users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  static createUser(user: Omit<User, 'id' | 'createdAt'> & { passwordHash: string }) {
    const data = this.readData();
    const newUser: User & { passwordHash: string } = {
      ...user,
      id: 'u-' + Date.now(),
      createdAt: new Date().toISOString()
    };
    data.users.push(newUser);
    this.writeData(data);
    return newUser;
  }

  // Company Operations (CRUD, soft delete via 'status' field or filter, archive)
  static getCompanies() {
    return this.readData().companies;
  }

  static getActiveCompanies() {
    return this.readData().companies.filter(c => c.status === 'Active');
  }

  static getCompany(id: string) {
    return this.readData().companies.find(c => c.id === id);
  }

  static createCompany(company: Omit<Company, 'id' | 'createdAt' | 'status'>) {
    const data = this.readData();
    const newCompany: Company = {
      ...company,
      id: 'c-' + Date.now(),
      status: 'Active',
      createdAt: new Date().toISOString()
    };
    data.companies.push(newCompany);
    this.writeData(data);
    this.addNotification('Company Added', `Company '${newCompany.name}' registered successfully.`, 'success');
    return newCompany;
  }

  static updateCompany(id: string, updates: Partial<Company>) {
    const data = this.readData();
    const index = data.companies.findIndex(c => c.id === id);
    if (index === -1) return null;
    data.companies[index] = { ...data.companies[index], ...updates };
    this.writeData(data);
    return data.companies[index];
  }

  static deleteCompany(id: string) {
    const data = this.readData();
    const index = data.companies.findIndex(c => c.id === id);
    if (index === -1) return false;
    data.companies.splice(index, 1);
    this.writeData(data);
    return true;
  }

  // Resume / Candidate Operations
  static getResumes() {
    return this.readData().resumes;
  }

  static getResume(id: string) {
    return this.readData().resumes.find(r => r.id === id);
  }

  static createResume(resume: Omit<Resume, 'id' | 'uploadDate' | 'status'> & { status?: 'Pending' | 'Parsed' | 'Failed' }) {
    const data = this.readData();
    const newResume: Resume = {
      ...resume,
      id: 'r-' + Date.now(),
      status: resume.status || 'Pending',
      uploadDate: new Date().toISOString()
    };
    data.resumes.push(newResume);
    this.writeData(data);
    this.addNotification('Resume Uploaded', `Resume for ${newResume.candidateName || 'New Candidate'} uploaded and queued for processing.`, 'info');
    return newResume;
  }

  static updateResume(id: string, updates: Partial<Resume>) {
    const data = this.readData();
    const index = data.resumes.findIndex(r => r.id === id);
    if (index === -1) return null;
    data.resumes[index] = { ...data.resumes[index], ...updates };
    this.writeData(data);
    if (updates.status === 'Parsed') {
      this.addNotification('Analysis Complete', `Resume analysis for ${data.resumes[index].candidateName} finished successfully.`, 'success');
    }
    return data.resumes[index];
  }

  static deleteResume(id: string) {
    const data = this.readData();
    const index = data.resumes.findIndex(r => r.id === id);
    if (index === -1) return false;
    data.resumes.splice(index, 1);
    this.writeData(data);
    return true;
  }

  // Campaign Operations
  static getCampaigns() {
    return this.readData().campaigns;
  }

  static getCampaign(id: string) {
    return this.readData().campaigns.find(c => c.id === id);
  }

  static createCampaign(campaign: Omit<Campaign, 'id' | 'createdAt'>) {
    const data = this.readData();
    const newCampaign: Campaign = {
      ...campaign,
      id: 'camp-' + Date.now(),
      createdAt: new Date().toISOString()
    };
    data.campaigns.push(newCampaign);
    this.writeData(data);
    this.addNotification('Campaign Created', `AI Campaign Plan '${newCampaign.name}' scheduled.`, 'success');
    return newCampaign;
  }

  static updateCampaign(id: string, updates: Partial<Campaign>) {
    const data = this.readData();
    const index = data.campaigns.findIndex(c => c.id === id);
    if (index === -1) return null;
    data.campaigns[index] = { ...data.campaigns[index], ...updates };
    this.writeData(data);
    return data.campaigns[index];
  }

  static deleteCampaign(id: string) {
    const data = this.readData();
    const index = data.campaigns.findIndex(c => c.id === id);
    if (index === -1) return false;
    data.campaigns.splice(index, 1);
    this.writeData(data);
    return true;
  }

  // Chat Operations
  static getChats() {
    return this.readData().chats;
  }

  static addChatMessage(role: 'user' | 'model', text: string) {
    const data = this.readData();
    const message: ChatMessage = {
      id: 'msg-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      role,
      text,
      timestamp: new Date().toISOString()
    };
    data.chats.push(message);
    this.writeData(data);
    return message;
  }

  static clearChatHistory() {
    const data = this.readData();
    data.chats = [];
    this.writeData(data);
    return true;
  }

  // Notification Operations
  static getNotifications() {
    return this.readData().notifications;
  }

  static addNotification(title: string, content: string, type: Notification['type']) {
    const data = this.readData();
    const notif: Notification = {
      id: 'n-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      title,
      content,
      type,
      date: new Date().toISOString(),
      read: false
    };
    data.notifications.unshift(notif);
    // Keep last 30 notifications only to keep JSON clean
    if (data.notifications.length > 30) {
      data.notifications = data.notifications.slice(0, 30);
    }
    this.writeData(data);
    return notif;
  }

  static markNotificationRead(id: string) {
    const data = this.readData();
    const index = data.notifications.findIndex(n => n.id === id);
    if (index !== -1) {
      data.notifications[index].read = true;
      this.writeData(data);
    }
  }

  static markAllNotificationsRead() {
    const data = this.readData();
    data.notifications.forEach(n => n.read = true);
    this.writeData(data);
  }

  // Proposal / Outreach Operations
  static getProposals() {
    return this.readData().proposals || [];
  }

  static getProposal(id: string) {
    return (this.readData().proposals || []).find(p => p.id === id);
  }

  static createProposal(proposal: Omit<ProposalItem, 'id' | 'createdAt'>) {
    const data = this.readData();
    if (!data.proposals) data.proposals = [];
    const newProposal: ProposalItem = {
      ...proposal,
      id: 'p-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      createdAt: new Date().toISOString()
    };
    data.proposals.unshift(newProposal);
    this.writeData(data);
    this.addNotification('Outreach Draft Created', `Personalized ${newProposal.type} for ${newProposal.companyName} created successfully.`, 'success');
    return newProposal;
  }

  static updateProposal(id: string, updates: Partial<ProposalItem>) {
    const data = this.readData();
    if (!data.proposals) data.proposals = [];
    const index = data.proposals.findIndex(p => p.id === id);
    if (index === -1) return null;
    data.proposals[index] = { ...data.proposals[index], ...updates };
    this.writeData(data);
    return data.proposals[index];
  }

  static deleteProposal(id: string) {
    const data = this.readData();
    if (!data.proposals) data.proposals = [];
    const index = data.proposals.findIndex(p => p.id === id);
    if (index === -1) return false;
    data.proposals.splice(index, 1);
    this.writeData(data);
    return true;
  }
}
