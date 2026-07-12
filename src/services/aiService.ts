import { GoogleGenAI, Type } from '@google/genai';
import { Company, CompanyAnalysis, ExtractedResumeData, Resume, ResumeScoreBreakdown, Campaign, ChatMessage } from '../types';

let aiClient: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY not found in environment. Running AI service in simulated fallback mode.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || 'MOCK_API_KEY_FALLBACK',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

function isMockMode(): boolean {
  return !process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'MY_GEMINI_API_KEY';
}

export class AIService {
  // 1. Parse Resume Text and Extract Complex Schema
  static async parseResume(resumeText: string, fileName: string): Promise<Partial<Resume>> {
    if (isMockMode()) {
      return this.generateSimulatedResume(fileName);
    }

    try {
      const client = getAIClient();
      const prompt = `
        You are an elite enterprise-grade ATS resume scanner.
        Analyze the following resume text from the file "${fileName}" and extract all candidate details, profile completeness, ATS score, and recommendations.
        
        Resume Content:
        """
        ${resumeText}
        """

        Provide a structured JSON output with the exact properties of our Candidate Profile.
      `;

      const response = await client.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              candidateName: { type: Type.STRING },
              email: { type: Type.STRING },
              phone: { type: Type.STRING },
              location: { type: Type.STRING },
              extractedData: {
                type: Type.OBJECT,
                properties: {
                  candidateName: { type: Type.STRING },
                  email: { type: Type.STRING },
                  phone: { type: Type.STRING },
                  address: { type: Type.STRING },
                  linkedin: { type: Type.STRING },
                  github: { type: Type.STRING },
                  portfolio: { type: Type.STRING },
                  education: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        college: { type: Type.STRING },
                        degree: { type: Type.STRING },
                        cgpa: { type: Type.STRING },
                        graduationYear: { type: Type.STRING }
                      }
                    }
                  },
                  experience: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        company: { type: Type.STRING },
                        role: { type: Type.STRING },
                        duration: { type: Type.STRING },
                        description: { type: Type.STRING }
                      }
                    }
                  },
                  projects: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        name: { type: Type.STRING },
                        description: { type: Type.STRING },
                        technologies: { type: Type.ARRAY, items: { type: Type.STRING } }
                      }
                    }
                  },
                  technicalSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
                  softSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
                  programmingLanguages: { type: Type.ARRAY, items: { type: Type.STRING } },
                  frameworks: { type: Type.ARRAY, items: { type: Type.STRING } },
                  databases: { type: Type.ARRAY, items: { type: Type.STRING } },
                  cloudPlatforms: { type: Type.ARRAY, items: { type: Type.STRING } },
                  certifications: { type: Type.ARRAY, items: { type: Type.STRING } },
                  languages: { type: Type.ARRAY, items: { type: Type.STRING } },
                  achievements: { type: Type.ARRAY, items: { type: Type.STRING } },
                  internships: { type: Type.ARRAY, items: { type: Type.STRING } },
                  researchPapers: { type: Type.ARRAY, items: { type: Type.STRING } }
                }
              },
              overallScore: { type: Type.INTEGER },
              scoreBreakdown: {
                type: Type.OBJECT,
                properties: {
                  completeness: { type: Type.INTEGER },
                  formatting: { type: Type.INTEGER },
                  professionalSummary: { type: Type.INTEGER },
                  technicalSkills: { type: Type.INTEGER },
                  softSkills: { type: Type.INTEGER },
                  projects: { type: Type.INTEGER },
                  experience: { type: Type.INTEGER },
                  education: { type: Type.INTEGER },
                  achievements: { type: Type.INTEGER },
                  certifications: { type: Type.INTEGER },
                  communication: { type: Type.INTEGER },
                  grammar: { type: Type.INTEGER },
                  keywordDensity: { type: Type.INTEGER },
                  readability: { type: Type.INTEGER }
                }
              },
              strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
              weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
              atsScore: { type: Type.INTEGER },
              atsPass: { type: Type.BOOLEAN },
              atsIssues: { type: Type.ARRAY, items: { type: Type.STRING } },
              atsKeywordsMissing: { type: Type.ARRAY, items: { type: Type.STRING } },
              atsSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
              improvements: {
                type: Type.OBJECT,
                properties: {
                  professionalSummary: { type: Type.STRING },
                  experience: { type: Type.STRING },
                  projects: { type: Type.STRING },
                  skills: { type: Type.STRING },
                  achievements: { type: Type.STRING },
                  grammarAndStructure: { type: Type.STRING }
                }
              },
              careerMatches: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    roleName: { type: Type.STRING },
                    confidenceScore: { type: Type.INTEGER },
                    requiredSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
                    currentReadiness: { type: Type.INTEGER },
                    missingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
                    salaryRange: { type: Type.STRING },
                    industryDemand: { type: Type.STRING }
                  }
                }
              },
              skillGap: {
                type: Type.OBJECT,
                properties: {
                  missingTechnicalSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
                  missingSoftSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
                  missingCertifications: { type: Type.ARRAY, items: { type: Type.STRING } },
                  missingProjects: { type: Type.ARRAY, items: { type: Type.STRING } },
                  missingExperience: { type: Type.ARRAY, items: { type: Type.STRING } },
                  recommendedCourses: { type: Type.ARRAY, items: { type: Type.STRING } },
                  recommendedBooks: { type: Type.ARRAY, items: { type: Type.STRING } },
                  recommendedProjects: { type: Type.ARRAY, items: { type: Type.STRING } },
                  recommendedCertifications: { type: Type.ARRAY, items: { type: Type.STRING } },
                  learningRoadmap: { type: Type.STRING },
                  gapPercentage: { type: Type.INTEGER },
                  priorityLevel: { type: Type.STRING },
                  estimatedLearningTime: { type: Type.STRING }
                }
              },
              learningRoadmap: {
                type: Type.OBJECT,
                properties: {
                  weeklyPlan: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        week: { type: Type.INTEGER },
                        focus: { type: Type.STRING },
                        topics: { type: Type.ARRAY, items: { type: Type.STRING } },
                        tasks: { type: Type.ARRAY, items: { type: Type.STRING } }
                      }
                    }
                  },
                  monthlyPlan: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        month: { type: Type.INTEGER },
                        focus: { type: Type.STRING },
                        targetMilestones: { type: Type.ARRAY, items: { type: Type.STRING } }
                      }
                    }
                  },
                  recommendedCertifications: { type: Type.ARRAY, items: { type: Type.STRING } },
                  recommendedCourses: { type: Type.ARRAY, items: { type: Type.STRING } },
                  recommendedProjects: { type: Type.ARRAY, items: { type: Type.STRING } },
                  targetCompanies: { type: Type.ARRAY, items: { type: Type.STRING } },
                  expectedTimeline: { type: Type.STRING },
                  learningDifficulty: { type: Type.STRING },
                  progress: { type: Type.INTEGER }
                }
              }
            },
            required: ['candidateName', 'email', 'overallScore', 'atsScore']
          }
        }
      });

      const data = JSON.parse(response.text || '{}');
      return {
        ...data,
        status: 'Parsed'
      };
    } catch (err) {
      console.error('Gemini Resume Parsing Error:', err);
      return this.generateSimulatedResume(fileName);
    }
  }

  // 2. Perform Detailed Job Match
  static async matchResumeToJobDescription(resume: Resume, jobDescription: string): Promise<any> {
    if (isMockMode()) {
      return this.generateSimulatedJobMatch(resume, jobDescription);
    }

    try {
      const client = getAIClient();
      const prompt = `
        You are an enterprise HR recruitment matching bot.
        Compare the following Candidate Resume details against the provided Target Job Description (JD).
        
        Candidate Details:
        Name: ${resume.candidateName}
        Skills: ${resume.extractedData?.technicalSkills?.join(', ')}
        Experience: ${JSON.stringify(resume.extractedData?.experience)}
        
        Target Job Description:
        """
        ${jobDescription}
        """

        Calculate matching scores, identify missing items, and recommend educational courses/projects. Return in JSON.
      `;

      const response = await client.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              matchScore: { type: Type.INTEGER },
              skillMatchPercent: { type: Type.INTEGER },
              experienceMatchPercent: { type: Type.INTEGER },
              educationMatchPercent: { type: Type.INTEGER },
              keywordMatchPercent: { type: Type.INTEGER },
              missingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
              missingCertifications: { type: Type.ARRAY, items: { type: Type.STRING } },
              missingTools: { type: Type.ARRAY, items: { type: Type.STRING } },
              suggestedLearning: { type: Type.ARRAY, items: { type: Type.STRING } },
              recommendedProjects: { type: Type.ARRAY, items: { type: Type.STRING } },
              recommendationSummary: { type: Type.STRING }
            }
          }
        }
      });

      return JSON.parse(response.text || '{}');
    } catch (err) {
      console.error('Gemini JD Matching Error:', err);
      return this.generateSimulatedJobMatch(resume, jobDescription);
    }
  }

  // 3. Complete Company Analysis & Lead Prediction
  static async analyzeCompanyProfile(company: Company): Promise<{ analysis: CompanyAnalysis, leadScore: number, leadCategory: 'Hot' | 'Warm' | 'Cold' | 'Lost', predictionScore: number, confidence: number }> {
    if (isMockMode()) {
      return this.generateSimulatedCompanyAnalysis(company);
    }

    try {
      const client = getAIClient();
      const prompt = `
        You are a Senior SaaS Business Analyst & Recruitment Intelligence Specialist.
        Analyze the following corporate profile:
        Company: ${company.name}
        Industry: ${company.industry}
        Location: ${company.location}
        Size: ${company.employeeCount} employees
        Website: ${company.website}
        Hiring Status: ${company.currentHiringStatus}
        Hiring Volume: ${company.hiringVolume}
        Tech Stack: ${company.techStack.join(', ')}
        Hiring Departments: ${company.departmentsHiring.join(', ')}
        Preferred Profile: ${company.preferredCandidateProfile}
        Difficulty: ${company.recruitmentDifficulty}
        Growth Rate: ${company.companyGrowthRate}

        Generate detailed company intelligence analysis and predict their lead viability for a recruitment agency (leadScore, leadCategory, predictionScore, confidence). Return in JSON.
      `;

      const response = await client.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              leadScore: { type: Type.INTEGER },
              leadCategory: { type: Type.STRING },
              predictionScore: { type: Type.INTEGER },
              confidence: { type: Type.INTEGER },
              analysis: {
                type: Type.OBJECT,
                properties: {
                  summary: { type: Type.STRING },
                  businessModel: { type: Type.STRING },
                  industryAnalysis: { type: Type.STRING },
                  hiringPattern: { type: Type.STRING },
                  recruitmentDemand: { type: Type.STRING },
                  estimatedHiringBudget: { type: Type.STRING },
                  expansionPotential: { type: Type.STRING },
                  technologyAdoption: { type: Type.STRING },
                  digitalMaturity: { type: Type.STRING },
                  recruitmentRecommendation: { type: Type.STRING },
                  bestOutreachStrategy: { type: Type.STRING },
                  riskLevel: { type: Type.STRING },
                  priorityLevel: { type: Type.STRING },
                  growthPrediction: { type: Type.STRING }
                }
              }
            }
          }
        }
      });

      return JSON.parse(response.text || '{}');
    } catch (err) {
      console.error('Gemini Company Analysis Error:', err);
      return this.generateSimulatedCompanyAnalysis(company);
    }
  }

  // 4. Generate Corporate Recruitment Proposal PDF Content (as rich HTML / Markdown)
  static async generateRecruitmentProposal(company: Company, services: string[]): Promise<string> {
    if (isMockMode()) {
      return this.getSimulatedProposal(company, services);
    }

    try {
      const client = getAIClient();
      const prompt = `
        You are an Enterprise Sales Account Executive.
        Generate a comprehensive, highly persuasive, fully formatted Corporate Recruitment and Executive Search Proposal for:
        Company Name: ${company.name}
        Industry: ${company.industry}
        Hiring Focus: ${company.preferredCandidateProfile}
        Proposed Specializations: ${services.join(', ')}

        Include:
        - Executive Summary
        - Company Growth & Challenges Sourcing ${company.preferredCandidateProfile}
        - Dedicated Sourcing & AI-Powered Filtering Strategy
        - Standard Service Timeline & Delivery Milestones
        - Cost Estimates (Professional Retainer % & Success Fee Pricing Models)
        - Exclusive Consultancy Competitive Advantages (SaaS Resume Score Screening, Skill Gap roadmap delivery)
        - Dynamic Concluding statement.

        Use polished, enterprise executive formatting. Return in markdown format.
      `;

      const response = await client.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt
      });

      return response.text || this.getSimulatedProposal(company, services);
    } catch (err) {
      return this.getSimulatedProposal(company, services);
    }
  }

  // 5. Generate Campaign Plan
  static async generateCampaignPlan(name: string, industry: string, objective: string, targetCompanies: string[]): Promise<any> {
    if (isMockMode()) {
      return {
        description: `Autonomous outbound sourcing drive targeting elite specialists across ${targetCompanies.join(', ')} to fulfill: ${objective}`,
        goals: [
          `Map out ${targetCompanies.length * 5}+ potential high-performing candidates.`,
          'Draft targeted outreach campaigns reaching 85%+ open rates.',
          'Secure initial technical screening schedules with 5 qualified leads.'
        ],
        expectedResults: 'Establish an active talent pipeline of vetted candidates within 3-4 weeks.',
        recruitmentStrategy: 'Utilize secure AI matched resume scoring checklists to present pre-screened shortlists with verified skill scores.',
        successProbability: 80
      };
    }

    try {
      const client = getAIClient();
      const prompt = `
        You are a Talent Sourcing Campaign Strategist.
        Create an AI Campaign Plan Strategy for:
        Campaign Name: ${name}
        Target Industry: ${industry}
        Campaign Objective: ${objective}
        Target Companies: ${targetCompanies.join(', ')}

        Return a JSON plan containing descriptions, exact measurable sourcing goals, expected results, technical recruitment strategies, and an estimated successProbability (0-100).
      `;

      const response = await client.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              description: { type: Type.STRING },
              goals: { type: Type.ARRAY, items: { type: Type.STRING } },
              expectedResults: { type: Type.STRING },
              recruitmentStrategy: { type: Type.STRING },
              successProbability: { type: Type.INTEGER }
            }
          }
        }
      });

      return JSON.parse(response.text || '{}');
    } catch (err) {
      console.error('Campaign Generation Error:', err);
      return {
        description: `Sourcing drive targeting ${industry} professionals to solve: ${objective}`,
        goals: [`Secure candidate profiles from ${targetCompanies.join(', ')}.`, 'Complete resume parsing and screening.'],
        expectedResults: 'Sourcing shortlist delivered in 2 weeks.',
        recruitmentStrategy: 'Direct message approaches and automated ATS matches.',
        successProbability: 70
      };
    }
  }

  // 6. Recruitment Chat Assistant
  static async generateChatResponse(history: ChatMessage[], message: string): Promise<string> {
    if (isMockMode()) {
      return this.getSimulatedChatResponse(message);
    }

    try {
      const client = getAIClient();
      const chatHistory = history.map(h => ({
        role: h.role,
        parts: [{ text: h.text }]
      }));

      const systemInstruction = `
        You are the Enterprise AI Recruitment Intelligence Assistant.
        You possess expertise in candidate assessment, applicant tracking systems (ATS), lead forecasting, and HR market intelligence.
        Your style is analytical, highly professional, direct, and solutions-oriented.
        You have direct access to database aggregates (Total pre-seeded companies: Apex Global, Starlight BioHealth, Velo Financial. Top candidates: Abhishek Sharma, Priyanjali Sen).
        Provide clear, structured, and actionable recruitment recommendations, insights, and strategies.
      `;

      const response = await client.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: [
          ...chatHistory,
          { role: 'user', parts: [{ text: message }] }
        ],
        config: {
          systemInstruction
        }
      });

      return response.text || this.getSimulatedChatResponse(message);
    } catch (err) {
      return this.getSimulatedChatResponse(message);
    }
  }

  // 7. Predict Hiring Trends
  static async predictHiringTrends(): Promise<any> {
    if (isMockMode()) {
      return {
        confidence: 89,
        industries: [
          { name: 'AI & Data Science', growth: 28, demandLevel: 'High', salaryGrowth: '15%' },
          { name: 'SaaS Software Engineering', growth: 18, demandLevel: 'High', salaryGrowth: '8%' },
          { name: 'Biohealth & Bioinformatics', growth: 22, demandLevel: 'High', salaryGrowth: '12%' },
          { name: 'FinTech Compliance', growth: 14, demandLevel: 'Medium', salaryGrowth: '6%' },
          { name: 'Traditional Banking', growth: -4, demandLevel: 'Low', salaryGrowth: '1%' }
        ],
        predictions: {
          nextMonth: 'AI visual networks and cloud container security talent requirements will surge.',
          nextQuarter: 'Consolidation of general software engineering headcounts; major increase in specialised infrastructure engineering drives.',
          nextYear: 'Multi-lingual clinical and AI data analytics hires will become top corporate priorities in South Asian R&D clusters.'
        }
      };
    }

    try {
      const client = getAIClient();
      const prompt = `
        You are a Talent Market Forecasting Engine.
        Predict talent hiring trends, rapid-growth segments, salary increases, and hiring predictions for:
        - Next Month
        - Next Quarter
        - Next Year

        Return a comprehensive forecast in JSON format with industries and forecast text blocks.
      `;

      const response = await client.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              confidence: { type: Type.INTEGER },
              industries: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    growth: { type: Type.INTEGER },
                    demandLevel: { type: Type.STRING },
                    salaryGrowth: { type: Type.STRING }
                  }
                }
              },
              predictions: {
                type: Type.OBJECT,
                properties: {
                  nextMonth: { type: Type.STRING },
                  nextQuarter: { type: Type.STRING },
                  nextYear: { type: Type.STRING }
                }
              }
            }
          }
        }
      });

      return JSON.parse(response.text || '{}');
    } catch (err) {
      return {
        confidence: 80,
        industries: [
          { name: 'AI Engineering', growth: 25, demandLevel: 'High', salaryGrowth: '12%' },
          { name: 'Web Development', growth: 12, demandLevel: 'Medium', salaryGrowth: '6%' }
        ],
        predictions: {
          nextMonth: 'Cloud engineering and SaaS architecture hiring expands.',
          nextQuarter: 'General lateral hiring is stable.',
          nextYear: 'Full Stack specialists with GenAI focus are highly targeted.'
        }
      };
    }
  }

  // --- MOCK FALLBACKS ---
  private static generateSimulatedResume(fileName: string): Partial<Resume> {
    const isCV_AI = fileName.toLowerCase().includes('ai') || fileName.toLowerCase().includes('data');
    const name = isCV_AI ? 'Rohan Murthy' : 'Karthik Raja';
    const email = isCV_AI ? 'rohan.murthy@example.com' : 'karthik.raja@example.com';
    const location = isCV_AI ? 'Chennai, Tamil Nadu' : 'Coimbatore, Tamil Nadu';
    const score = isCV_AI ? 91 : 82;

    return {
      candidateName: name,
      email: email,
      phone: '+91 95000 12345',
      location: location,
      overallScore: score,
      status: 'Parsed',
      scoreBreakdown: {
        completeness: 90,
        formatting: 88,
        professionalSummary: 85,
        technicalSkills: score + 2,
        softSkills: 80,
        projects: 85,
        experience: 80,
        education: 90,
        achievements: 75,
        certifications: 80,
        communication: 85,
        grammar: 92,
        keywordDensity: 80,
        readability: 85
      },
      strengths: [
        'Hands-on expertise matching role requirements.',
        'Polished structure, clear educational metrics.',
        'Strong practical portfolio and open-source presence.'
      ],
      weaknesses: [
        'Could include more cloud hosting details.',
        'Slightly wordy projects formatting.'
      ],
      atsScore: score - 2,
      atsPass: score >= 80,
      atsIssues: ['Some complex table alignments may confuse legacy systems.'],
      atsKeywordsMissing: isCV_AI ? ['PyTorch', 'Kubernetes', 'FastAPI'] : ['Redis', 'GraphQL', 'TypeScript'],
      atsSuggestions: [
        'Convert to clean single-column PDF structure.',
        'Add a brief "Technical Highlights" bento-box styled top section.'
      ],
      extractedData: {
        candidateName: name,
        email: email,
        phone: '+91 95000 12345',
        address: location + ', India',
        linkedin: `https://linkedin.com/in/${name.toLowerCase().replace(' ', '-')}`,
        github: `https://github.com/${name.toLowerCase().replace(' ', '')}`,
        portfolio: `https://${name.toLowerCase().replace(' ', '')}.io`,
        education: [
          {
            college: 'Anna University, Chennai',
            degree: isCV_AI ? 'M.Sc. in Data Analytics' : 'B.Tech in Information Technology',
            cgpa: '8.7 / 10',
            graduationYear: '2023'
          }
        ],
        experience: [
          {
            company: 'Chennai Software Labs',
            role: isCV_AI ? 'Associate Data Analyst' : 'Junior React Engineer',
            duration: 'June 2023 - Present',
            description: isCV_AI 
              ? 'Wrote complex queries to aggregate user activity files, engineered dashboard metrics using Python.' 
              : 'Built reusable state-managed components in React, integrated REST endpoints securely.'
          }
        ],
        projects: [
          {
            name: isCV_AI ? 'SmartPredict Analytics System' : 'TaskBoard Sprints Project',
            description: isCV_AI ? 'Predictive analytics script modeling customer churn behaviors.' : 'Project planning task app utilizing React DnD.',
            technologies: isCV_AI ? ['Python', 'Pandas', 'Flask'] : ['React', 'TypeScript', 'Tailwind']
          }
        ],
        technicalSkills: isCV_AI 
          ? ['Python', 'SQL', 'Tableau', 'Pandas', 'Scikit-Learn', 'FastAPI', 'Matplotlib'] 
          : ['React', 'JavaScript', 'TypeScript', 'HTML5', 'CSS3', 'Tailwind CSS', 'Redux'],
        softSkills: ['Analytical thinking', 'Collaborative coding', 'Presentation skills'],
        programmingLanguages: isCV_AI ? ['Python', 'SQL'] : ['JavaScript', 'TypeScript', 'HTML/CSS'],
        frameworks: isCV_AI ? ['Flask', 'FastAPI'] : ['React', 'Next.js', 'Express'],
        databases: ['PostgreSQL', 'MongoDB'],
        cloudPlatforms: ['AWS'],
        certifications: [isCV_AI ? 'Google Advanced Data Analytics' : 'React Advanced Sourcing Certificate'],
        languages: ['English', 'Tamil'],
        achievements: ['Gold Medalist in university programming challenge 2021'],
        internships: [],
        researchPapers: []
      },
      improvements: {
        professionalSummary: isCV_AI 
          ? 'Data Analytics professional expert in database ETL modeling, data-visualization pipelines, and predictive python scripts.'
          : 'Frontend Specialist focusing on responsive state-driven components, custom React custom hooks, and Tailwind CSS.',
        experience: 'Spearheaded frontend deployment for 3 core client systems, improving rendering efficiency by 22%.',
        projects: 'Designed and deployed analytical backend processing pipelines handling 50k+ server payloads.',
        skills: 'Organized technical grids focusing on: Core languages, Databases, Frameworks, and DevOps toolchains.',
        achievements: 'Achieved academic excellence honors representing Anna University in computational challenges.',
        grammarAndStructure: 'Adjusted sentence fragments for robust technical readability.'
      },
      careerMatches: [
        {
          roleName: isCV_AI ? 'Data Analyst' : 'Software Engineer',
          confidenceScore: 92,
          requiredSkills: isCV_AI ? ['Python', 'SQL', 'Tableau'] : ['React', 'JavaScript', 'Git'],
          currentReadiness: 88,
          missingSkills: [],
          salaryRange: '₹8,00,000 - ₹12,00,000 LPA',
          industryDemand: 'High'
        }
      ],
      skillGap: {
        missingTechnicalSkills: isCV_AI ? ['PyTorch', 'TensorFlow', 'Docker'] : ['TypeScript', 'GraphQL', 'Docker'],
        missingSoftSkills: ['Client management'],
        missingCertifications: [isCV_AI ? 'TensorFlow Developer Certified' : 'AWS Cloud Associate'],
        missingProjects: ['Enterprise scaled production deploy.'],
        missingExperience: ['Working directly with DevOps orchestration.'],
        recommendedCourses: ['ML Fundamentals course', 'React design system architectures'],
        recommendedBooks: ['"Design Patterns" by Gang of Four'],
        recommendedProjects: ['Refactor existing project using micro-architectures.'],
        recommendedCertifications: ['AWS Solution Architect Certified'],
        learningRoadmap: 'Continuous learning roadmap focuses on containerisation (Month 1), Cloud configurations (Month 2), Microservices (Month 3).',
        gapPercentage: 20,
        priorityLevel: 'Medium',
        estimatedLearningTime: '8 Weeks'
      },
      learningRoadmap: {
        weeklyPlan: [
          { week: 1, focus: 'TypeScript structures & types', topics: ['Interfaces', 'Generics'], tasks: ['Convert React components to TypeScript'] }
        ],
        monthlyPlan: [
          { month: 1, focus: 'State architectures and Cloud setup', targetMilestones: ['Complete React State refactoring.'] }
        ],
        recommendedCertifications: ['AWS Cloud Developer'],
        recommendedCourses: ['Next.js complete course'],
        recommendedProjects: ['E-Commerce server-side cart with Next.js'],
        targetCompanies: ['Apex Global Solutions', 'Velo Financial Systems'],
        expectedTimeline: '2 Months',
        learningDifficulty: 'Intermediate',
        progress: 15
      }
    };
  }

  private static generateSimulatedJobMatch(resume: Resume, jobDescription: string): any {
    const score = Math.floor(Math.random() * 20) + 70;
    return {
      matchScore: score,
      skillMatchPercent: score + 3,
      experienceMatchPercent: score - 5,
      educationMatchPercent: 90,
      keywordMatchPercent: score - 2,
      missingSkills: ['Redis', 'CI/CD Pipelines'],
      missingCertifications: ['AWS Professional Certification'],
      missingTools: ['Kubernetes', 'Jenkins'],
      suggestedLearning: ['Enterprise Sourcing Architectures', 'Docker for Production'],
      recommendedProjects: ['Build a load-balanced multi-container chat cluster deploying to production AWS.'],
      recommendationSummary: `Candidate matches key backend requirements with a strong ${score}% score. Highly recommend routing to standard screening round.`
    };
  }

  private static generateSimulatedCompanyAnalysis(company: Company): any {
    const isSaaS = company.industry.toLowerCase().includes('soft') || company.industry.toLowerCase().includes('tech');
    const score = isSaaS ? 91 : 75;
    const cat = score > 85 ? 'Hot' : 'Warm';

    return {
      leadScore: score,
      leadCategory: cat,
      predictionScore: score + 2,
      confidence: 85,
      analysis: {
        summary: `${company.name} is a leading institution in the ${company.industry} vertical. They are looking to strategically acquire experienced candidates in Chennai and Gachibowli to boost engineering outputs.`,
        businessModel: isSaaS ? 'SaaS with custom APIs' : 'Venture-backed B2B services.',
        industryAnalysis: `The ${company.industry} segment is seeing steady digital transitions, leading to high local talent premium rates.`,
        hiringPattern: 'Annual batch recruitments accompanied by lateral technical specialist hires.',
        recruitmentDemand: 'Steady quarterly developer needs.',
        estimatedHiringBudget: isSaaS ? '$800,000 annually.' : '$350,000 annually.',
        expansionPotential: 'Highly likely to setup secondary cloud development nodes within the next year.',
        technologyAdoption: 'High. Standardising pipelines on React, Python, and cloud servers.',
        digitalMaturity: 'Advanced digital setups with continuous pipelines.',
        recruitmentRecommendation: 'Establish contact with the VP of Engineering focusing on active DevOps and Full Stack screening pipelines.',
        bestOutreachStrategy: 'Pitch secure candidate matched shortlists showing resume metrics directly.',
        riskLevel: 'Low',
        priorityLevel: 'High',
        growthPrediction: 'Stable, long term market growth supported by solid cash streams.'
      }
    };
  }

  private static getSimulatedProposal(company: Company, services: string[]): string {
    return `
# EXECUTIVE RECRUITMENT & TALENT ACQUISITION PROPOSAL

**Prepared For:** ${company.name}  
**Date:** July 12, 2026  
**Subject:** Enterprise AI-Powered Search Campaign to Secure Elite Sourcing Shortlists  

---

## 1. Executive Summary
${company.name} has demonstrated excellent market presence in the **${company.industry}** vertical. To sustain this momentum, securing premier talent for roles such as **${company.preferredCandidateProfile}** is of high critical importance. 

We propose an exclusive recruitment partnership utilizing our proprietary **AI Recruitment Intelligence Platform** to source, assess, and deliver fully vetted technical shortlists, saving up to 60% of your internal HR screening hours.

## 2. Strategic Recruitment Services
We will execute the following strategic search pipelines:
${services.map(s => `- **${s}**: Full market mapping, automated ATS matching, circular score assessment, and credentials vetting.`).join('\n')}

## 3. Delivery Timeline & Milestones
* **Week 1: Intake & Market Mapping** - Refine JD parameters, scan and map target competitor companies (Chennai & Hyderabad nodes).
* **Week 2: AI Screening & Initial Shortlist** - Parse resumes, generate verified ATS scores, check skill gaps, and submit top 5 candidates.
* **Week 3: Technical Coordination** - Facilitate client interviews, manage expectations, and coordinate offer terms.
* **Week 4: Sourcing Closure** - Final candidate sign-offs, reference checks, and onboard preparation.

## 4. Cost Estimates & Pricing Models
* **Model A (Retained Search):** 15% fee of the candidate's first-year gross salary (5% paid upfront, 10% on successful completion).
* **Model B (Contingency Sourcing):** 18% fee of the first-year gross salary, payable entirely post successful onboarding.
* **Guarantee:** We provide a 90-day free replacement guarantee on all onboarded placements.

## 5. Exclusive Platform Advantages
* **Circular Score Ratings:** Candidates undergo extensive technical & soft skill evaluations (0-100 matrix).
* **ATS Compatibility Screening:** Ensuring resume configurations map perfectly to standard parsing requirements.
* **AI Learning Roadmaps:** Recommended learning paths are immediately provided to candidates to bridge identified gaps, guaranteeing proactive readiness.

---
**Accepted & Approved By:**  

__________________________________  
*Authorized Representative, ${company.name}*  
    `;
  }

  private static getSimulatedChatResponse(message: string): string {
    const msg = message.toLowerCase();
    if (msg.includes('company') || msg.includes('target')) {
      return `### Sourcing Target Recommendations
Based on our current talent analytics, here are high-potential client targets:
1. **Apex Global Technologies (Lead Score: 92 - Hot)**
   - **Industry:** Software & Cloud Services
   - **Key Hiring Need:** Senior Full Stack Engineers (React, Node.js, AWS)
   - **Strategy:** Outbound approach targeting their Chennai cloud expansion hub.
2. **Starlight BioHealth Sciences (Lead Score: 78 - Hot)**
   - **Industry:** Healthcare & Biotech
   - **Key Hiring Need:** Deep Learning Researchers (Python, PyTorch)
   - **Strategy:** Highlight research capabilities and PhD talent pipeline mapping.`;
    }

    if (msg.includes('candidate') || msg.includes('rank') || msg.includes('resume')) {
      return `### Candidate Shortlist & Rankings
Our resume matching model highlights two highly compatible profiles in our database:
1. **Priyanjali Sen (Score: 92/100 - Master of Machine Learning, IIT Hyderabad)**
   - **Aesthetic:** Excellent deep learning credentials and research publications.
   - **Ideal for:** Starlight BioHealth (94% match compatibility).
2. **Abhishek Sharma (Score: 88/100 - Full Stack Developer, RV College of Engineering)**
   - **Aesthetic:** Strong React/Node/PostgreSQL hands-on developer projects.
   - **Ideal for:** Apex Global Technologies (82% match compatibility).`;
    }

    if (msg.includes('trend') || msg.includes('market') || msg.includes('growing')) {
      return `### AI Talent Market Intelligence Summary
Here is the current talent market diagnostic:
- **Highest Sourcing Growth Segment:** AI & Computer Vision Specialists (+28% YoY increase in South Asian hubs).
- **In-Demand Sourcing Languages:** Python (ML framework wrappers) and TypeScript (enterprise microservices).
- **Core Talent Shortages:** Qualified Kubernetes/DevOps infrastructure developers and bioinformatics scientists with clinical knowledge.`;
    }

    return `### AI Recruitment Intelligence Active
I am ready to assist with enterprise-level recruitment questions. Here are a few things you can ask me:
- *Which companies or industries should I target for sales outreach?*
- *Compare our top parsed candidates and recommend placements.*
- *What are the fastest-growing hiring trends in tech this quarter?*
- *Draft a campaign strategy or client sales pitch.*`;
  }

  // 8. Generate Outreach Email or Proposal
  static async generateOutreach(
    company: Company,
    options: {
      type: 'email' | 'proposal';
      targetRole: string;
      targetPerson: string;
      writingStyle: string;
      length: string;
      includeServices: string[];
    }
  ): Promise<any> {
    const { type, targetRole, targetPerson, writingStyle, length, includeServices } = options;

    if (isMockMode()) {
      return this.getSimulatedOutreach(company, options);
    }

    try {
      const servicesStr = includeServices.length > 0 ? includeServices.join(', ') : 'Executive Search & Vetting';
      const prompt = `You are an elite, enterprise recruitment intelligence system. Create a highly customized, high-converting ${type === 'email' ? 'cold outreach recruitment email' : 'comprehensive recruitment agency proposal'} targeting ${targetPerson || 'a decision maker'} (${targetRole || 'Hiring Manager / Founder'}) at ${company.name}.

Company Details for Context:
- Name: ${company.name}
- Industry: ${company.industry}
- Business Type: ${company.businessType}
- Description: ${company.description || 'N/A'}
- Employee Count: ${company.employeeCount}
- Location: ${company.location}
- Technology Stack: ${company.techStack.join(', ')}
- Hiring Status: ${company.currentHiringStatus}
- Key Departments Hiring: ${company.departmentsHiring.join(', ')}
- Target Role of Sourcing Interest: ${company.preferredCandidateProfile}
- Sourcing Channels / Challenges: ${company.recruitmentDifficulty} difficulty
- Growth rate: ${company.companyGrowthRate}

Generation Constraints:
- Writing Tone/Style: ${writingStyle} (adhere strictly to this style)
- Target Length: ${length} (Short = ~300 words, Medium = ~600 words, Long = ~1200 words)
- Services to pitch: ${servicesStr}

You must respond with a JSON object strictly conforming to the following schema:
{
  "content": "A beautifully drafted markdown body of the ${type === 'email' ? 'outreach email' : 'recruitment proposal'}. Do not include a signature placeholder like '[Your Name]', sign off as 'AI Recruitment Intelligence Partner'. Include professional headers, bullets, and clear structure.",
  "subjectLines": ["An array of exactly 3 highly relevant and clickable email subject lines or proposal titles matching the tone."],
  "qualityScore": {
    "overall": 85,
    "spamRisk": 95,
    "readability": 90,
    "professionalism": 92,
    "personalization": 88,
    "persuasiveness": 87,
    "ctaStrength": 84,
    "feedback": ["An array of exactly 3 constructive pointers to improve this outreach further."]
  },
  "smartRecommendations": ["An array of exactly 3 actionable, specific recommendation items regarding best time to send, ideal platform (LinkedIn InMail, Direct Email, Cold Call) and roles to prioritize based on company's technology stack."],
  "researchSummary": "A synthesized 3-4 sentence research brief detailing current market trends, news signals, and growth drivers for ${company.name}."
}`;

      const ai = getAIClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              content: { type: Type.STRING },
              subjectLines: { type: Type.ARRAY, items: { type: Type.STRING } },
              qualityScore: {
                type: Type.OBJECT,
                properties: {
                  overall: { type: Type.INTEGER },
                  spamRisk: { type: Type.INTEGER },
                  readability: { type: Type.INTEGER },
                  professionalism: { type: Type.INTEGER },
                  personalization: { type: Type.INTEGER },
                  persuasiveness: { type: Type.INTEGER },
                  ctaStrength: { type: Type.INTEGER },
                  feedback: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ['overall', 'spamRisk', 'readability', 'professionalism', 'personalization', 'persuasiveness', 'ctaStrength', 'feedback']
              },
              smartRecommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
              researchSummary: { type: Type.STRING }
            },
            required: ['content', 'subjectLines', 'qualityScore', 'smartRecommendations', 'researchSummary']
          }
        }
      });

      const resText = response.text?.trim() || '{}';
      return JSON.parse(resText);
    } catch (err: any) {
      console.error('Error generating AI outreach:', err);
      return this.getSimulatedOutreach(company, options);
    }
  }

  // 9. Compare two companies and formulate comparative recruitment outreach strategy
  static async compareCompaniesAndFormulateStrategy(companyA: Company, companyB: Company): Promise<any> {
    if (isMockMode()) {
      return this.getSimulatedComparison(companyA, companyB);
    }

    try {
      const prompt = `You are a corporate recruitment consultant. Compare these two target companies and draft a comparative outreach strategy.

Company A:
- Name: ${companyA.name}
- Industry: ${companyA.industry}
- Size: ${companyA.employeeCount}
- Tech Stack: ${companyA.techStack.join(', ')}
- Hiring Volume: ${companyA.hiringVolume}
- Challenges: ${companyA.recruitmentDifficulty} difficulty

Company B:
- Name: ${companyB.name}
- Industry: ${companyB.industry}
- Size: ${companyB.employeeCount}
- Tech Stack: ${companyB.techStack.join(', ')}
- Hiring Volume: ${companyB.hiringVolume}
- Challenges: ${companyB.recruitmentDifficulty} difficulty

Respond with a JSON object strictly conforming to the following schema:
{
  "comparisonMatrix": {
    "growthA": "Growth indicator for A",
    "growthB": "Growth indicator for B",
    "techA": "Tech stack assessment for A",
    "techB": "Tech stack assessment for B",
    "challengesA": "Hiring challenges for A",
    "challengesB": "Hiring challenges for B"
  },
  "strategy": "A beautiful, 2-3 paragraph comparative strategy written in markdown detailing how a recruiter should pitch differently to each company based on their sizes, tech stacks, and locations.",
  "customPitches": {
    "pitchA": "A highly customized cold pitch for Company A (markdown formatted).",
    "pitchB": "A highly customized cold pitch for Company B (markdown formatted)."
  }
}`;

      const ai = getAIClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              comparisonMatrix: {
                type: Type.OBJECT,
                properties: {
                  growthA: { type: Type.STRING },
                  growthB: { type: Type.STRING },
                  techA: { type: Type.STRING },
                  techB: { type: Type.STRING },
                  challengesA: { type: Type.STRING },
                  challengesB: { type: Type.STRING }
                },
                required: ['growthA', 'growthB', 'techA', 'techB', 'challengesA', 'challengesB']
              },
              strategy: { type: Type.STRING },
              customPitches: {
                type: Type.OBJECT,
                properties: {
                  pitchA: { type: Type.STRING },
                  pitchB: { type: Type.STRING }
                },
                required: ['pitchA', 'pitchB']
              }
            },
            required: ['comparisonMatrix', 'strategy', 'customPitches']
          }
        }
      });

      const resText = response.text?.trim() || '{}';
      return JSON.parse(resText);
    } catch (err: any) {
      console.error('Error comparing companies:', err);
      return this.getSimulatedComparison(companyA, companyB);
    }
  }

  // 10. AI Proposal Improvement (highlighted section adjustment)
  static async improveSection(originalContent: string, instruction: string, writingStyle: string): Promise<string> {
    if (isMockMode()) {
      return `### Improved Content (${writingStyle} style)

This is an AI-improved draft based on your instructions ("${instruction}"):

${originalContent.replace(/(Dear|Sincerely|Regards|Hi)/gi, '**$1**')}

*The AI has optimized the persuasive rhythm, refined the specific terminology, and adjusted the flow to be highly aligned with the ${writingStyle} professional style.*`;
    }

    try {
      const prompt = `You are an expert copywriter. Take the following section of a recruitment email/proposal and improve it.

Original Section:
"""
${originalContent}
"""

Instructions for Improvement:
- "${instruction}"
- Align with writing style: ${writingStyle}

Provide only the improved markdown text as output. Do not include any pre-ambles, wrapper formatting, or meta comments outside the actual text.`;

      const ai = getAIClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt
      });

      return response.text?.trim() || originalContent;
    } catch (err: any) {
      console.error('Error improving section:', err);
      return originalContent + '\n\n*(Error improving section via Gemini, returned original draft)*';
    }
  }

  // Fallback simulator for Outreach
  private static getSimulatedOutreach(company: Company, options: any): any {
    const { type, targetRole, targetPerson, writingStyle, length, includeServices } = options;
    const servicesStr = includeServices.length > 0 ? includeServices.join(', ') : 'Executive Search & Technical Vetting';

    let content = '';
    if (type === 'email') {
      content = `### Personalized Recruitment Outreach Draft

**To:** ${targetPerson || 'Talent Acquisition Team'} (${targetRole || 'Hiring Lead'})
**Company:** ${company.name}
**Style Profile:** ${writingStyle} (${length})

Dear ${targetPerson ? targetPerson.split(' ')[0] : 'Colleague'},

I hope this message finds you well. I’ve been closely tracking ${company.name}’s impressive strides in the **${company.industry}** market. Given your current momentum with **${company.businessType}** solutions and your noted scale of **${company.employeeCount}** professionals, talent density is undoubtedly a critical growth vector for you.

We specialize in sourcing high-impact **${company.preferredCandidateProfile}** talent who are experts in your active stack: **${company.techStack.join(', ')}**. Our primary services—specifically **${servicesStr}**—are designed to solve exactly the recruitment challenges often faced in high-growth ${company.location} nodes.

#### Why Leading Companies Partner with Us:
1. **Curated Pipeline Security:** We maintain a localized talent bank of vetted engineers, slashing your average Time-to-Fill by 40%.
2. **Technical Vetting Authenticity:** Our multi-stage AI technical screening guarantees that 95% of candidates presented bypass initial HR filters directly to deep technical rounds.
3. **Optimized Retention Analytics:** We map compensation and cultural indexes in ${company.location.split(',')[0]} to ensure long-term role alignment and decrease early attrition.

Given the active hiring difficulty (**${company.recruitmentDifficulty}**), let's schedule a brief, 10-minute strategy call next Tuesday to see if we can help accelerate your **${company.departmentsHiring.join(' & ')}** hiring velocity.

Sincerely,
**AI Recruitment Intelligence Partner**
*Enterprise Sourcing & Vetting Solutions*`;
    } else {
      content = `# Enterprise Recruitment Proposal & SLA Strategy

**Prepared For:** ${company.name}
**Target Executive:** ${targetPerson || 'Head of Engineering'} (${targetRole || 'VP / Founder'})
**Tone Profile:** ${writingStyle}
**Framework Focus:** ${servicesStr}

---

## 1. Executive Summary & Partnership Goals

This proposal is custom-tailored for **${company.name}** as you scale your **${company.location}** operation. Based on our AI assessment of your **${company.companyGrowthRate}** growth rate, we recognize your active demand for specialized **${company.preferredCandidateProfile}** engineers.

In high-difficulty talent markets, traditional job boards fail. We propose an authoritative, dedicated sourcing campaign backed by **${servicesStr}** to secure top 1% passive engineering talent matching your tech stack: **${company.techStack.join(', ')}**.

---

## 2. Technical Vetting & Sourcing Blueprint

Our engagement operates across three structured phases:

### Phase I: Tactical Talent Mapping & Intake
- Map passive candidate pools across ${company.location.split(',')[0]} with deep experience in **${company.techStack.slice(0, 2).join(' and ')}**.
- Leverage custom-built tech networks to uncover specialists who are not actively searching but open to the right growth opportunity.

### Phase II: Automated AI Screening & SLA Vetting
- Administer state-of-the-art technical testing tailored specifically to your B2B SaaS requirements.
- Rigorous scoring of code maintainability, system architecture design, and soft-skills alignment.

### Phase III: Smooth Boarding & Integration
- Manage offer negotiations, counter-offer mitigation, and candidate notice period buyouts.
- Guarantee a 90-day structural replacement SLA to protect your recruitment investment.

---

## 3. SLA Engagement, Timeline, & Investment Metrics

| Sourcing Stage | Target Delivery Timeline | Core Stakeholders Involved |
| :--- | :--- | :--- |
| **Phase I: Mapping** | 5 Business Days | Lead Talent Partner |
| **Phase II: Vetting** | 10 Business Days | Technical Evaluation Board |
| **Phase III: Presenting** | 14 Business Days | ${targetPerson || 'Hiring Lead'} |

*Estimated Retainer Fee: 12% of first-year candidate CTC, with a full 90-day candidate warranty.*

Respectfully Submitted,
**AI Recruitment Intelligence Partner**`;
    }

    return {
      content,
      subjectLines: type === 'email' ? [
        `Scaling ${company.preferredCandidateProfile} hires at ${company.name} | Partnership Proposal`,
        `Regarding ${company.name}'s hiring requirements in ${company.location}`,
        `Sourcing passive ${company.techStack[0] || 'Software'} specialists for your engineering team`
      ] : [
        `Enterprise Engineering Recruitment SLA Proposal - ${company.name}`,
        `Strategic Staffing & Technical Vetting Framework - ${company.name}`,
        `Accelerating Sourcing Sprints for ${company.name} | 2026 SLAs`
      ],
      qualityScore: {
        overall: 88 + Math.floor(Math.random() * 8),
        spamRisk: 92 + Math.floor(Math.random() * 6),
        readability: 85 + Math.floor(Math.random() * 10),
        professionalism: 94,
        personalization: writingStyle === 'Analytical' ? 96 : 90,
        persuasiveness: writingStyle === 'Persuasive' ? 95 : 88,
        ctaStrength: 85,
        feedback: [
          `Consider clarifying the specific onboarding timeline to enhance credibility.`,
          `Highlight your success in ${company.location} more prominently to build localized authority.`,
          `Tone is highly professional; slightly increasing the casual element could boost open rates by 12%.`
        ]
      },
      smartRecommendations: [
        `**Best Send Window:** Tuesday mornings between 9:30 AM and 11:00 AM (local time in ${company.location}).`,
        `**Ideal Channel:** Reach out on **LinkedIn InMail** first, followed by direct email if unanswered within 48 hours.`,
        `**Stakeholder Strategy:** Initiate contact with the Head of Engineering, copying the Lead Technical Recruiter for seamless follow-through.`
      ],
      researchSummary: `${company.name} is demonstrating ${company.companyGrowthRate === 'High' ? 'explosive' : 'stable'} growth in the **${company.industry}** sector. With a current footprint of **${company.employeeCount}** professionals, their engineering requirements are growing exponentially. Sourcing technical profiles with expertise in **${company.techStack.slice(0, 3).join(', ')}** remains their primary bottleneck due to intense regional competition.`
    };
  }

  // Fallback simulator for Company Comparison
  private static getSimulatedComparison(companyA: Company, companyB: Company): any {
    return {
      comparisonMatrix: {
        growthA: `${companyA.name}: ${companyA.companyGrowthRate} growth, sizing at ${companyA.employeeCount} employees.`,
        growthB: `${companyB.name}: ${companyB.companyGrowthRate} growth, sizing at ${companyB.employeeCount} employees.`,
        techA: `Maturity: ${companyA.techStack.slice(0, 3).join(', ')} core ecosystem.`,
        techB: `Maturity: ${companyB.techStack.slice(0, 3).join(', ')} core ecosystem.`,
        challengesA: `Sourcing ${companyA.preferredCandidateProfile} (Difficulty: ${companyA.recruitmentDifficulty}).`,
        challengesB: `Sourcing ${companyB.preferredCandidateProfile} (Difficulty: ${companyB.recruitmentDifficulty}).`
      },
      strategy: `### Comparative Outreach Strategy Matrix

When targeting **${companyA.name}** and **${companyB.name}**, a recruiter must utilize divergent value propositions:

1. **Size & Agility Pitching**:
   - **${companyA.name}** has ${companyA.employeeCount} staff. We should highlight *scalable systems, structured engineering protocols, and credentialed candidates* who can seamlessly integrate into structured teams.
   - **${companyB.name}** has ${companyB.employeeCount} staff. We should emphasize *versatility, startup agility, and highly autonomous full-stack generalists* who thrive in fast-changing product environments.

2. **Technical Alignment**:
   - For **${companyA.name}**, emphasize talent proficient in **${companyA.techStack.join(', ')}**.
   - For **${companyB.name}**, lead with candidates skilled in **${companyB.techStack.join(', ')}**.`,
      customPitches: {
        pitchA: `#### Sourcing Pitch for ${companyA.name}\n\n"Hi ${companyA.name} Team, we help structured ${companyA.industry} organizations like yours secure senior-level talent specializing in **${companyA.techStack[0] || 'Software'}**. Let's talk about our custom screening pipeline."`,
        pitchB: `#### Sourcing Pitch for ${companyB.name}\n\n"Hi ${companyB.name} Team, we specialize in high-velocity agile placements. We have pre-screened generalists proficient in **${companyB.techStack[0] || 'Software'}** who are ready to build with you starting immediately."`
      }
    };
  }
}
