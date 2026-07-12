import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  ChevronRight, 
  Trash2, 
  Sliders, 
  Sparkles, 
  Cpu, 
  Copy, 
  Download, 
  BadgeCheck, 
  FileCheck2, 
  RefreshCw,
  Search,
  Radar,
  ArrowRight,
  Printer,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis 
} from 'recharts';
import { Resume, User } from '../types';

interface ResumeIntelligenceProps {
  resumes: Resume[];
  loading: boolean;
  user: User | null;
  onUploadResume: (fileName: string, fileType: string, fileData: string) => Promise<any>;
  onMatchResume: (id: string, jobTitle: string, jobDescription: string) => Promise<any>;
  onDeleteResume: (id: string) => Promise<boolean>;
  addToast: (title: string, content: string, type: 'success' | 'warning' | 'error' | 'info') => void;
}

export default function ResumeIntelligence({
  resumes,
  loading,
  user,
  onUploadResume,
  onMatchResume,
  onDeleteResume,
  addToast
}: ResumeIntelligenceProps) {
  // Navigation tabs
  const [subTab, setSubTab] = useState<'upload' | 'profile' | 'ats' | 'match'>('upload');
  
  // States
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadFileName, setUploadFileName] = useState('');
  
  // Job Match Form State
  const [matchJobTitle, setMatchJobTitle] = useState('Senior DevOps Engineer');
  const [matchJobDescription, setMatchJobDescription] = useState('We are looking for a Senior DevOps Specialist experienced in AWS cloud platforms, Kubernetes multi-cluster setups, Jenkins or GitHub Actions automated pipelines, and IaC Terraform. Knowledge of Python scripts is desired.');
  const [matchingInProgress, setMatchingInProgress] = useState(false);
  const [currentMatchResult, setCurrentMatchResult] = useState<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canModify = user?.role === 'Admin' || user?.role === 'Recruiter';

  // Automatically select first resume if none selected
  useEffect(() => {
    if (resumes.length > 0 && !selectedResumeId) {
      setSelectedResumeId(resumes[0].id);
    }
  }, [resumes, selectedResumeId]);

  const selectedResume = resumes.find(r => r.id === selectedResumeId);

  // File drag & drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleManualSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await handleFileProcess(e.target.files[0]);
    }
  };

  // Convert uploaded file to base64 and send to server api
  const handleFileProcess = async (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['pdf', 'docx', 'doc', 'txt'].includes(ext || '')) {
      addToast('Format Unrecognized', 'Supported formats: PDF, DOCX, DOC, TXT', 'error');
      return;
    }

    setUploadFileName(file.name);
    setUploadProgress(10);
    
    // Simulate upload progress bar
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev === null) return null;
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 20;
      });
    }, 150);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        
        try {
          clearInterval(progressInterval);
          setUploadProgress(95);
          const parsedResume = await onUploadResume(file.name, ext || 'pdf', base64Data);
          setUploadProgress(100);
          addToast('Parsing Finished', `Extracted candidates records for ${parsedResume.candidateName}`, 'success');
          setSelectedResumeId(parsedResume.id);
          setSubTab('profile');
        } catch (err: any) {
          addToast('Analysis Failed', err.message, 'error');
        } finally {
          setUploadProgress(null);
        }
      };
    } catch (err: any) {
      clearInterval(progressInterval);
      setUploadProgress(null);
      addToast('Reading Failed', err.message, 'error');
    }
  };

  // Permanently delete resume
  const handleDeleteResume = async (id: string, name: string) => {
    if (confirm(`Remove Candidate ${name} completely?`)) {
      try {
        await onDeleteResume(id);
        addToast('Candidate Erased', `${name} profile removed from directory`, 'success');
        if (selectedResumeId === id) {
          setSelectedResumeId(resumes[0]?.id || '');
        }
      } catch (err: any) {
        addToast('Removal Failed', err.message, 'error');
      }
    }
  };

  // Run Sourcing JD Alignment Matcher
  const handleJobMatch = async () => {
    if (!selectedResume) return;
    setMatchingInProgress(true);
    addToast('Matching Alignments', `Synthesizing match indices against ${matchJobTitle}...`, 'info');
    try {
      const result = await onMatchResume(selectedResume.id, matchJobTitle, matchJobDescription);
      setCurrentMatchResult(result);
      addToast('Scores Computed', `Alingment check: ${result.matchScore}% match score`, 'success');
    } catch (err: any) {
      addToast('Alignments Failed', err.message, 'error');
    } finally {
      setMatchingInProgress(false);
    }
  };

  // Compile matching radar data
  const radarData = selectedResume && currentMatchResult ? [
    { subject: 'Skills', A: currentMatchResult.skillMatchPercent, fullMark: 100 },
    { subject: 'Experience', A: currentMatchResult.experienceMatchPercent, fullMark: 100 },
    { subject: 'Education', A: currentMatchResult.educationMatchPercent, fullMark: 100 },
    { subject: 'Keyword Matching', A: currentMatchResult.keywordMatchPercent, fullMark: 100 },
    { subject: 'Sourcing Rating', A: currentMatchResult.matchScore, fullMark: 100 },
  ] : [];

  return (
    <div className="p-6 space-y-6">
      
      {/* Top Title Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 font-sans">
            ATS Resume Intelligence Vitals
          </h1>
          <p className="text-xs text-slate-500">
            Upload candidate dossiers, review parsed structural grids, inspect ATS keyword matching and generate optimized resume formats.
          </p>
        </div>

        {/* Candidate Selector top row */}
        {resumes.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Selected Candidate:</span>
            <select
              value={selectedResumeId}
              onChange={(e) => {
                setSelectedResumeId(e.target.value);
                setCurrentMatchResult(null); // reset jd matching states on swap
              }}
              className="p-1.5 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 font-medium"
            >
              {resumes.map(r => (
                <option key={r.id} value={r.id}>{r.candidateName} ({r.overallScore}/100)</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Module Internal sub-tabs */}
      <div className="flex border-b border-slate-100 dark:border-slate-800">
        {[
          { id: 'upload', label: 'Dossier Upload & Registry' },
          { id: 'profile', label: 'AI Extracted Profile' },
          { id: 'ats', label: 'ATS Score & Optimizer' },
          { id: 'match', label: 'JD Matching Matrix' }
        ].map(tb => (
          <button
            key={tb.id}
            onClick={() => setSubTab(tb.id as any)}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-all ${
              subTab === tb.id 
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {tb.label}
          </button>
        ))}
      </div>

      {/* Main Tab Switcher Display */}
      <div className="space-y-6">
        
        {/* ==========================================
            TAB: UPLOAD & CANDIDATE REGISTRY LIST
            ========================================== */}
        {subTab === 'upload' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Drag Drop Uploader Area */}
            <div className="lg:col-span-2 space-y-4">
              <div 
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`p-10 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
                  dragActive 
                    ? 'border-indigo-500 bg-indigo-500/5' 
                    : 'border-slate-250 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 bg-white dark:bg-slate-950 shadow-sm'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleManualSelect}
                  className="hidden"
                  accept=".pdf,.docx,.doc,.txt"
                />
                
                {uploadProgress !== null ? (
                  <div className="space-y-3 w-full max-w-xs flex flex-col items-center">
                    <RefreshCw className="animate-spin text-indigo-600" size={32} />
                    <div className="w-full">
                      <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase mb-1">
                        <span>Uploading & Parsing...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-900 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-indigo-600 h-full rounded-full transition-all duration-150" style={{ width: `${uploadProgress}%` }}></div>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 truncate w-full">{uploadFileName}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-full bg-indigo-500/10 text-indigo-600 flex items-center justify-center mx-auto shadow-md">
                      <Upload size={22} />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">Drag & Drop Resume</h3>
                      <p className="text-xs text-slate-400 mt-1">Acceptable formats: PDF, DOCX, DOC, TXT (Maximum scale: 10MB)</p>
                    </div>
                    <span className="inline-block px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold rounded-lg transition-colors shadow">
                      Browse Files
                    </span>
                  </div>
                )}
              </div>

              {/* Upload checklist / tips */}
              <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl flex gap-3">
                <FileCheck2 className="text-indigo-600 mt-0.5 shrink-0" size={16} />
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">AI Deep extraction metrics ready</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">Our parser automatically maps educational qualifications, multi-stage clinical/engineering roles, and compiles career matching indicators using standard Google GenAI models.</p>
                </div>
              </div>
            </div>

            {/* List of Loaded Candidate Records */}
            <div className="p-5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl shadow-sm space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-sans">Parsed Candidate Registry</h3>
                <p className="text-xs text-slate-400">Vetted profiles saved in database</p>
              </div>

              {resumes.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs font-sans">No candidates registered. Drag files above to initiate.</div>
              ) : (
                <div className="space-y-3 max-h-[350px] overflow-y-auto custom-scrollbar">
                  {resumes.map(r => {
                    const isSelected = selectedResumeId === r.id;
                    return (
                      <div
                        key={r.id}
                        onClick={() => setSelectedResumeId(r.id)}
                        className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                          isSelected 
                            ? 'bg-indigo-50/20 dark:bg-indigo-950/20 border-indigo-500 dark:border-indigo-900 shadow-sm' 
                            : 'bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-850 hover:bg-slate-100/50'
                        }`}
                      >
                        <div className="overflow-hidden">
                          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{r.candidateName}</h4>
                          <p className="text-[10px] text-slate-400 truncate">{r.fileName}</p>
                          <span className="inline-block mt-1 px-1.5 py-0.5 bg-indigo-500/10 text-indigo-400 text-[9px] font-bold rounded">
                            AIScore: {r.overallScore}/100
                          </span>
                        </div>
                        {user?.role === 'Admin' && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteResume(r.id, r.candidateName); }}
                            className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
                            title="Delete Record"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        )}

        {/* ==========================================
            TAB: AI EXTRACTED PROFILE VIEWER
            ========================================== */}
        {subTab === 'profile' && (
          selectedResume ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Score Gauges Column */}
              <div className="space-y-6">
                
                {/* Circular AI Score Gauge Card */}
                <div className="p-6 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl shadow-sm flex flex-col items-center justify-center text-center">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono mb-4">Overall Candidate Score</h3>
                  
                  {/* SVG Circular Gauge */}
                  <div className="relative w-36 h-36 flex items-center justify-center mb-4">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="72" cy="72" r="58" strokeWidth="10" stroke="#f1f5f9" fill="transparent" className="dark:stroke-slate-850" />
                      <circle cx="72" cy="72" r="58" strokeWidth="10" stroke="url(#indigoGrad)" fill="transparent" 
                        strokeDasharray={364.4}
                        strokeDashoffset={364.4 - (364.4 * (selectedResume.overallScore || 85)) / 100}
                        strokeLinecap="round"
                        className="transition-all duration-300"
                      />
                      <defs>
                        <linearGradient id="indigoGrad" x1="1" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#6366f1" />
                          <stop offset="100%" stopColor="#a855f7" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-3xl font-extrabold font-sans text-slate-900 dark:text-white leading-none">{selectedResume.overallScore || 85}</span>
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mt-1">PERCENT</span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-400 leading-relaxed font-sans px-2">
                    Evaluated candidate profile completeness, qualifications matching, soft skills metrics and academic benchmarks.
                  </div>
                </div>

                {/* Categories Breakdown progress grids */}
                {selectedResume.scoreBreakdown && (
                  <div className="p-5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl shadow-sm space-y-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">Category Vetting</h3>
                    <div className="space-y-3">
                      {[
                        { label: 'Technical Skills Matrix', value: selectedResume.scoreBreakdown.technicalSkills },
                        { label: 'Project Portfolio', value: selectedResume.scoreBreakdown.projects },
                        { label: 'Corporate Experience', value: selectedResume.scoreBreakdown.experience },
                        { label: 'Academic Credentials', value: selectedResume.scoreBreakdown.education },
                        { label: 'Formatting & Legibility', value: selectedResume.scoreBreakdown.formatting }
                      ].map(cat => (
                        <div key={cat.label} className="space-y-1">
                          <div className="flex justify-between text-[11px] font-semibold text-slate-500">
                            <span>{cat.label}</span>
                            <span>{cat.value}%</span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-900 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${cat.value}%` }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {/* Middle & Right Column: Extracted data cards */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Candidates Header card */}
                <div className="p-6 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-extrabold font-sans text-slate-900 dark:text-white tracking-tight">{selectedResume.candidateName}</h2>
                    <p className="text-xs text-slate-400 font-medium mt-1">{selectedResume.location} • {selectedResume.email} • {selectedResume.phone}</p>
                    {selectedResume.extractedData?.linkedin && (
                      <div className="mt-2 flex gap-3 text-[10px] font-mono text-indigo-500">
                        <a href={selectedResume.extractedData.linkedin} target="_blank" rel="noreferrer" className="hover:underline">LinkedIn Profile</a>
                        {selectedResume.extractedData.github && <a href={selectedResume.extractedData.github} target="_blank" rel="noreferrer" className="hover:underline">GitHub</a>}
                        {selectedResume.extractedData.portfolio && <a href={selectedResume.extractedData.portfolio} target="_blank" rel="noreferrer" className="hover:underline">Portfolio Website</a>}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-bold h-fit shrink-0">
                    <BadgeCheck size={14} />
                    <span>Gemini AI Parsed</span>
                  </div>
                </div>

                {/* Experience & Education Timelines */}
                {selectedResume.extractedData && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Experience Grid */}
                    <div className="p-5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl shadow-sm space-y-4">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono border-b border-slate-100 dark:border-slate-850 pb-2">Employment History</h3>
                      <div className="space-y-4">
                        {selectedResume.extractedData.experience.map((exp, idx) => (
                          <div key={idx} className="space-y-1 relative pl-4 border-l border-slate-200">
                            <span className="absolute -left-[4.5px] top-1.5 w-2 h-2 rounded-full bg-indigo-600"></span>
                            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">{exp.role}</h4>
                            <p className="text-[11px] font-semibold text-slate-500">{exp.company} • {exp.duration}</p>
                            <p className="text-[10px] leading-relaxed text-slate-400 font-sans mt-1">{exp.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Education and certifications Grid */}
                    <div className="space-y-6">
                      
                      <div className="p-5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl shadow-sm space-y-4">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono border-b border-slate-100 dark:border-slate-850 pb-2">Academics Vitals</h3>
                        <div className="space-y-3">
                          {selectedResume.extractedData.education.map((edu, idx) => (
                            <div key={idx} className="space-y-1">
                              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">{edu.degree}</h4>
                              <p className="text-[11px] font-semibold text-slate-500">{edu.college} • Class of {edu.graduationYear}</p>
                              {edu.cgpa && <p className="text-[10px] font-mono text-indigo-400">CGPA/Percentage: {edu.cgpa}</p>}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Certifications and credentials list */}
                      {selectedResume.extractedData.certifications.length > 0 && (
                        <div className="p-5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl shadow-sm space-y-3">
                          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">Professional Certifications</h3>
                          <div className="flex flex-wrap gap-1.5">
                            {selectedResume.extractedData.certifications.map(cert => (
                              <span key={cert} className="px-2 py-1 text-[10px] font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-md">
                                {cert}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                    </div>

                  </div>
                )}

                {/* Technical Skills and achievements list */}
                {selectedResume.extractedData && (
                  <div className="p-5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl shadow-sm space-y-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono border-b border-slate-100 dark:border-slate-850 pb-2">Extracted Technical Stack</h3>
                    <div className="space-y-3">
                      <div>
                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Core Skill Badges</span>
                        <div className="flex flex-wrap gap-1">
                          {selectedResume.extractedData.technicalSkills.map(sk => (
                            <span key={sk} className="px-2 py-0.5 text-xs font-medium bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 rounded">
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>

                      {selectedResume.extractedData.programmingLanguages.length > 0 && (
                        <div>
                          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Languages</span>
                          <div className="flex flex-wrap gap-1">
                            {selectedResume.extractedData.programmingLanguages.map(pl => (
                              <span key={pl} className="px-2 py-0.5 text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/10 rounded">
                                {pl}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </div>

            </div>
          ) : (
            <div className="py-20 text-center text-slate-400">Please register or select a candidate first.</div>
          )
        )}

        {/* ==========================================
            TAB: ATS COMPATIBILITY & OPTIMIZER IMPROVER
            ========================================== */}
        {subTab === 'ats' && (
          selectedResume ? (
            <div className="space-y-6">
              
              {/* ATS Metric Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Circular Gauge 1: ATS Pass Gauge */}
                <div className="p-6 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl shadow-sm flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono mb-4">ATS Compliance Rating</span>
                  <div className="relative w-32 h-32 flex items-center justify-center mb-4">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="64" cy="64" r="50" strokeWidth="8" stroke="#f1f5f9" fill="transparent" className="dark:stroke-slate-850" />
                      <circle cx="64" cy="64" r="50" strokeWidth="8" stroke="#10b981" fill="transparent" 
                        strokeDasharray={314}
                        strokeDashoffset={314 - (314 * (selectedResume.atsScore || 80)) / 100}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-2xl font-black text-slate-900 dark:text-white">{selectedResume.atsScore || 80}%</span>
                      <span className={`text-[9px] font-bold uppercase mt-0.5 ${selectedResume.atsPass ? 'text-emerald-500' : 'text-red-500'}`}>
                        {selectedResume.atsPass ? 'PASS' : 'FAIL'}
                      </span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 px-3 leading-relaxed">Formatting matching check: standard heading identifiers, bullet layouts, contact grids matching.</p>
                </div>

                {/* Missing Keywords check and suggestions list */}
                <div className="md:col-span-2 p-5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-2">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">ATS Diagnostics Vetting</h3>
                    <button 
                      onClick={() => window.print()}
                      className="flex items-center gap-1 text-[11px] font-bold text-indigo-500 hover:underline"
                    >
                      <Printer size={12} />
                      <span>Print ATS Report</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Missing Keywords list */}
                    <div className="space-y-2">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Identified Missing Keywords</span>
                      {selectedResume.atsKeywordsMissing && selectedResume.atsKeywordsMissing.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {selectedResume.atsKeywordsMissing.map(key => (
                            <span key={key} className="px-2 py-0.5 text-[10px] font-mono bg-red-500/10 text-red-500 border border-red-500/20 rounded">
                              - {key}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-emerald-500 font-semibold flex items-center gap-1">
                          <CheckCircle size={12} /> No missing critical keywords.
                        </span>
                      )}
                    </div>

                    {/* Suggestions list */}
                    <div className="space-y-2">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Formatting/Content Improvements</span>
                      <div className="space-y-1.5 max-h-[140px] overflow-y-auto custom-scrollbar">
                        {selectedResume.atsSuggestions && selectedResume.atsSuggestions.map((sug, idx) => (
                          <div key={idx} className="text-xs leading-relaxed text-slate-600 dark:text-slate-400 flex items-start gap-1.5">
                            <span className="text-indigo-500 shrink-0">•</span>
                            <span>{sug}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Side-by-Side Resume Optimizer Editorial Tool */}
              {selectedResume.improvements && (
                <div className="p-5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-sans">AI Content Optimizer & Copywriter</h3>
                      <p className="text-xs text-slate-400">Optimize key resume blocks with high-impact action verbs</p>
                    </div>
                    <button
                      onClick={() => {
                        const fullBetter = `SUMMARY:\n${selectedResume.improvements?.professionalSummary}\n\nEXPERIENCE HIGHLIGHTS:\n${selectedResume.improvements?.experience}\n\nPROJECTS:\n${selectedResume.improvements?.projects}`;
                        navigator.clipboard.writeText(fullBetter);
                        addToast('Copied Optimized Copy', 'Saved improved resume elements to clipboard', 'success');
                      }}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/10 transition-colors"
                    >
                      <Copy size={12} />
                      <span>Copy Full Optimized Text</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-slate-100 dark:border-slate-850">
                    
                    {/* Original Summary Block */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-850 rounded-xl space-y-3">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Original Profile Summary</span>
                      <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-500 italic">
                        {selectedResume.extractedData?.experience[0]?.description || 'No summary registered.'}
                      </p>
                    </div>

                    {/* AI Optimized Summary Block */}
                    <div className="p-4 bg-indigo-500/5 border border-indigo-500/15 rounded-xl space-y-3 relative overflow-hidden group">
                      <div className="absolute top-2 right-2 p-1 hover:bg-indigo-500/20 rounded cursor-pointer text-indigo-400 transition-colors"
                        onClick={() => {
                          navigator.clipboard.writeText(selectedResume.improvements?.professionalSummary || '');
                          addToast('Copied Block', 'Summary block copied', 'success');
                        }}
                      >
                        <Copy size={12} />
                      </div>
                      <span className="block text-[10px] font-bold text-indigo-400 uppercase tracking-widest font-mono flex items-center gap-1">
                        <Sparkles size={10} /> Optimized Profile Summary
                      </span>
                      <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300 font-medium">
                        {selectedResume.improvements.professionalSummary}
                      </p>
                    </div>

                    {/* Original Experience Block */}
                    <div className="p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-850 rounded-xl space-y-3">
                      <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Original Experience highlights</span>
                      <div className="text-xs leading-relaxed text-slate-500 dark:text-slate-500 italic space-y-2">
                        {selectedResume.extractedData?.experience.map((e, idx) => (
                          <p key={idx}>{e.description}</p>
                        ))}
                      </div>
                    </div>

                    {/* AI Optimized Experience Block */}
                    <div className="p-4 bg-indigo-500/5 border border-indigo-500/15 rounded-xl space-y-3 relative overflow-hidden group">
                      <div className="absolute top-2 right-2 p-1 hover:bg-indigo-500/20 rounded cursor-pointer text-indigo-400 transition-colors"
                        onClick={() => {
                          navigator.clipboard.writeText(selectedResume.improvements?.experience || '');
                          addToast('Copied Block', 'Experience highlights copied', 'success');
                        }}
                      >
                        <Copy size={12} />
                      </div>
                      <span className="block text-[10px] font-bold text-indigo-400 uppercase tracking-widest font-mono flex items-center gap-1">
                        <Sparkles size={10} /> Optimized Experience statements
                      </span>
                      <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300 font-medium whitespace-pre-wrap">
                        {selectedResume.improvements.experience}
                      </p>
                    </div>

                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="py-20 text-center text-slate-400">Please register or select a candidate first.</div>
          )
        )}

        {/* ==========================================
            TAB: JOB DESCRIPTION MATCHING MATRIX
            ========================================== */}
        {subTab === 'match' && (
          selectedResume ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Sourcing Parameters form Input Column */}
              <div className="p-5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl shadow-sm space-y-4 h-fit">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-sans">JD Sourcing Match Checker</h3>
                  <p className="text-xs text-slate-400">Test candidate against target job roles</p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Target Job Title</label>
                    <input
                      type="text"
                      value={matchJobTitle}
                      onChange={(e) => setMatchJobTitle(e.target.value)}
                      className="mt-1 w-full p-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-indigo-500 font-sans"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Job Description (JD)</label>
                    <textarea
                      rows={6}
                      value={matchJobDescription}
                      onChange={(e) => setMatchJobDescription(e.target.value)}
                      className="mt-1 w-full p-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-indigo-500 leading-relaxed font-sans"
                    ></textarea>
                  </div>

                  <button
                    onClick={handleJobMatch}
                    disabled={matchingInProgress}
                    className="w-full py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-md flex items-center justify-center gap-1.5 transition-all disabled:opacity-45"
                  >
                    {matchingInProgress ? (
                      <>
                        <RefreshCw className="animate-spin" size={12} />
                        <span>AI Aligning...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={12} />
                        <span>Run Match Analysis</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Match Output Results Column */}
              <div className="lg:col-span-2 space-y-6">
                
                {currentMatchResult ? (
                  <div className="space-y-6 animate-fadeIn">
                    
                    {/* Top Match Gauge & Radar */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Overall Percentage Card */}
                      <div className="p-5 bg-slate-950 text-slate-100 border border-slate-850 rounded-2xl flex flex-col justify-between shadow-inner">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest font-mono">Matching Compatibility Index</span>
                          <h4 className="text-sm font-bold text-white font-sans">{matchJobTitle} Matching</h4>
                        </div>
                        <div className="my-4">
                          <span className="text-5xl font-black font-sans bg-gradient-to-r from-indigo-200 via-indigo-400 to-violet-400 bg-clip-text text-transparent">{currentMatchResult.matchScore}%</span>
                          <p className="text-xs text-slate-400 mt-1 font-sans">Compatibility rating determined by Gemini.</p>
                        </div>
                        {/* Progress slider bar */}
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-indigo-500 h-full" style={{ width: `${currentMatchResult.matchScore}%` }}></div>
                        </div>
                      </div>

                      {/* Recharts Radar Representation */}
                      <div className="p-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl shadow-sm flex items-center justify-center h-52">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart cx="50%" cy="50%" outerRadius="65%" data={radarData}>
                            <PolarGrid stroke="#e2e8f0" />
                            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fill: '#64748b' }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 8 }} />
                            <Radar name="Candidate" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>

                    </div>

                    {/* Skill comparisons grids, missing keywords & recommended learning */}
                    <div className="p-5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl shadow-sm space-y-4">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono border-b border-slate-100 dark:border-slate-850 pb-2">Matching Breakdown Vitals</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        {/* Missing Skills list */}
                        <div className="space-y-2">
                          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Identified Missing Skill Sets</span>
                          {currentMatchResult.missingSkills && currentMatchResult.missingSkills.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {currentMatchResult.missingSkills.map((sk: string) => (
                                <span key={sk} className="px-2 py-0.5 text-[10px] font-mono bg-red-500/10 text-red-500 rounded">
                                  {sk}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-emerald-500 font-semibold flex items-center gap-1">
                              <CheckCircle size={12} /> Candidate holds 100% of required skills
                            </span>
                          )}
                        </div>

                        {/* Learning Roadmap Project recommendation */}
                        <div className="space-y-2">
                          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Recommended Bridging Projects</span>
                          <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400 font-sans">
                            {currentMatchResult.recommendedProjects && currentMatchResult.recommendedProjects.map((p: string, idx: number) => (
                              <p key={idx} className="leading-relaxed">• {p}</p>
                            ))}
                          </div>
                        </div>

                      </div>

                      {/* Brief recommendation summary block */}
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-850">
                        <span className="block text-[9px] font-bold text-slate-400 uppercase mb-1">AI Recommendation Summary</span>
                        <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300 italic font-sans font-medium bg-indigo-500/5 p-3 rounded-lg border border-indigo-500/10">
                          "{currentMatchResult.recommendationSummary}"
                        </p>
                      </div>

                    </div>

                  </div>
                ) : (
                  <div className="py-24 text-center bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl text-slate-400 flex flex-col items-center justify-center space-y-2">
                    <Sliders className="h-10 w-10 text-slate-300 dark:text-slate-700 animate-pulse" />
                    <h3 className="font-bold text-sm text-slate-950 dark:text-slate-100">Dossier Alignment Analysis Pending</h3>
                    <p className="text-xs max-w-sm">Define target parameters in the sidebar and trigger **Run Match Analysis** to overlay candidate specs on corporate requirement profiles.</p>
                  </div>
                )}

              </div>

            </div>
          ) : (
            <div className="py-20 text-center text-slate-400">Please register or select a candidate first.</div>
          )
        )}

      </div>
    </div>
  );
}
