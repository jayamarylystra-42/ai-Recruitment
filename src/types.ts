export type UserRole = 'Admin' | 'Recruiter' | 'HR Manager' | 'Viewer';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

export interface Company {
  id: string;
  name: string;
  industry: string;
  businessType: string;
  employeeCount: number;
  location: string;
  website: string;
  linkedin: string;
  techStack: string[];
  currentHiringStatus: 'Active' | 'Passive' | 'Closed' | 'Draft';
  hiringVolume: 'High' | 'Medium' | 'Low';
  departmentsHiring: string[];
  preferredCandidateProfile: string;
  campusHiring: boolean;
  lateralHiring: boolean;
  recruitmentDifficulty: 'High' | 'Medium' | 'Low';
  companyGrowthRate: 'High' | 'Stable' | 'Declining';
  description?: string;
  leadScore?: number; // 0-100
  leadCategory?: 'Hot' | 'Warm' | 'Cold' | 'Lost';
  predictionScore?: number;
  confidence?: number;
  analysis?: CompanyAnalysis;
  createdAt: string;
  status: 'Active' | 'Archived';
}

export interface CompanyAnalysis {
  summary: string;
  businessModel: string;
  industryAnalysis: string;
  hiringPattern: string;
  recruitmentDemand: string;
  estimatedHiringBudget: string;
  expansionPotential: string;
  technologyAdoption: string;
  digitalMaturity: string;
  recruitmentRecommendation: string;
  bestOutreachStrategy: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  priorityLevel: 'High' | 'Medium' | 'Low';
  growthPrediction: string;
}

export interface ExtractedResumeData {
  candidateName: string;
  email: string;
  phone: string;
  address: string;
  linkedin: string;
  github: string;
  portfolio: string;
  education: Array<{
    college: string;
    degree: string;
    cgpa: string;
    graduationYear: string;
  }>;
  experience: Array<{
    company: string;
    role: string;
    duration: string;
    description: string;
  }>;
  projects: Array<{
    name: string;
    description: string;
    technologies: string[];
  }>;
  technicalSkills: string[];
  softSkills: string[];
  programmingLanguages: string[];
  frameworks: string[];
  databases: string[];
  cloudPlatforms: string[];
  certifications: string[];
  languages: string[];
  achievements: string[];
  internships: string[];
  researchPapers: string[];
}

export interface ResumeScoreBreakdown {
  completeness: number; // 0-100
  formatting: number;
  professionalSummary: number;
  technicalSkills: number;
  softSkills: number;
  projects: number;
  experience: number;
  education: number;
  achievements: number;
  certifications: number;
  communication: number;
  grammar: number;
  keywordDensity: number;
  readability: number;
}

export interface Resume {
  id: string;
  candidateName: string;
  email: string;
  phone: string;
  location: string;
  fileName: string;
  fileType: string;
  uploadDate: string;
  status: 'Pending' | 'Parsed' | 'Failed';
  extractedData?: ExtractedResumeData;
  overallScore?: number; // 0-100
  scoreBreakdown?: ResumeScoreBreakdown;
  strengths?: string[];
  weaknesses?: string[];
  atsScore?: number; // 0-100
  atsPass?: boolean;
  atsIssues?: string[];
  atsKeywordsMissing?: string[];
  atsSuggestions?: string[];
  improvements?: {
    professionalSummary: string;
    experience: string;
    projects: string;
    skills: string;
    achievements: string;
    grammarAndStructure: string;
  };
  jobDescriptionMatches?: Array<{
    id: string;
    jobTitle: string;
    matchScore: number;
    skillMatchPercent: number;
    experienceMatchPercent: number;
    educationMatchPercent: number;
    keywordMatchPercent: number;
    missingSkills: string[];
    missingCertifications: string[];
    missingTools: string[];
    suggestedLearning: string[];
    recommendedProjects: string[];
    recommendationSummary: string;
  }>;
  skillGap?: {
    missingTechnicalSkills: string[];
    missingSoftSkills: string[];
    missingCertifications: string[];
    missingProjects: string[];
    missingExperience: string[];
    recommendedCourses: string[];
    recommendedBooks: string[];
    recommendedProjects: string[];
    recommendedCertifications: string[];
    learningRoadmap: string; // Markdown or structure
    gapPercentage: number;
    priorityLevel: 'High' | 'Medium' | 'Low';
    estimatedLearningTime: string;
  };
  careerMatches?: Array<{
    roleName: string;
    confidenceScore: number; // 0-100
    requiredSkills: string[];
    currentReadiness: number; // 0-100
    missingSkills: string[];
    salaryRange: string;
    industryDemand: 'High' | 'Medium' | 'Low';
  }>;
  learningRoadmap?: {
    weeklyPlan: Array<{ week: number; focus: string; topics: string[]; tasks: string[] }>;
    monthlyPlan: Array<{ month: number; focus: string; targetMilestones: string[] }>;
    recommendedCertifications: string[];
    recommendedCourses: string[];
    recommendedProjects: string[];
    targetCompanies: string[];
    expectedTimeline: string;
    learningDifficulty: 'Beginner' | 'Intermediate' | 'Advanced';
    progress: number; // 0-100
  };
}

export interface Campaign {
  id: string;
  name: string;
  targetIndustry: string;
  targetCompanies: string[];
  priority: 'High' | 'Medium' | 'Low';
  campaignObjective: string;
  status: 'Draft' | 'Planned' | 'Running' | 'Paused' | 'Completed' | 'Cancelled';
  schedule: string; // date
  aiStrategy?: {
    description: string;
    goals: string[];
    expectedResults: string;
    recruitmentStrategy: string;
    successProbability: number; // 0-100
    pipelineTimeline?: {
      mappingPhase: string;
      outreachPhase: string;
      sourcingPhase: string;
      contractPhase: string;
    };
    coldEmailTemplate?: {
      subject: string;
      body: string;
    };
    linkedInMessageTemplate?: string;
  };
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

export interface Notification {
  id: string;
  title: string;
  content: string;
  type: 'success' | 'warning' | 'error' | 'info';
  date: string;
  read: boolean;
}

export interface DashboardMetrics {
  totalCompanies: number;
  totalCandidates: number;
  aiAnalyses: number;
  leadPredictions: number;
  resumeAnalyses: number;
  averageAtsScore: number;
  averageResumeScore: number;
  topSkills: Array<{ name: string; value: number }>;
  campaignPlans: number;
  marketGrowth: number; // percentage
  industryDemand: Array<{ name: string; value: number }>;
  recentActivity: Array<{ id: string; user: string; action: string; time: string; type: string }>;
  aiInsights: string[];
  recommendations: string[];
}

export interface ProposalItem {
  id: string;
  companyId: string;
  companyName: string;
  type: 'email' | 'proposal';
  title: string;
  content: string;
  subjectLines?: string[];
  selectedSubject?: string;
  writingStyle: string;
  length: string;
  qualityScore?: {
    overall: number;
    spamRisk: number;
    readability: number;
    professionalism: number;
    personalization: number;
    persuasiveness: number;
    ctaStrength: number;
    feedback: string[];
  };
  smartRecommendations?: string[];
  researchSummary?: string;
  targetRole?: string;
  targetPerson?: string;
  starred: boolean;
  createdAt: string;
}

