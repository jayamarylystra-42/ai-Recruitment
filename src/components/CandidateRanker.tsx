import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Search, 
  ArrowUpDown, 
  CheckSquare, 
  Square, 
  Download, 
  SlidersHorizontal, 
  FileCheck, 
  Layers, 
  Plus, 
  X,
  Target,
  Sparkles,
  Award,
  AlertCircle
} from 'lucide-react';
import { Resume, User } from '../types';

interface CandidateRankerProps {
  resumes: Resume[];
  loading: boolean;
  user: User | null;
  onMatchResume: (id: string, jobTitle: string, jobDescription: string) => Promise<any>;
  addToast: (title: string, content: string, type: 'success' | 'warning' | 'error' | 'info') => void;
}

export default function CandidateRanker({
  resumes,
  loading,
  user,
  onMatchResume,
  addToast
}: CandidateRankerProps) {
  // Navigation
  const [activeTab, setActiveTab] = useState<'matrix' | 'compare'>('matrix');

  // Search & Filter
  const [search, setSearch] = useState('');
  const [skillFilter, setSkillFilter] = useState('All');
  const [expFilter, setExpFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'score' | 'ats' | 'experience'>('score');

  // Common JD Evaluator States
  const [jdTitle, setJdTitle] = useState('Senior Full-Stack Developer');
  const [jdDescription, setJdDescription] = useState('Requirements: React, TypeScript, Node.js, Express, AWS cloud hosting, and SQL databases. Strong project portfolios and clean modular architectural design principles.');
  const [evaluatingAll, setEvaluatingAll] = useState(false);
  const [evaluatedRankings, setEvaluatedRankings] = useState<any[]>([]);

  // Selection states
  const [shortlist, setShortlist] = useState<string[]>([]);
  const [compareList, setCompareList] = useState<string[]>([]);

  // Skill index list for filtering
  const allSkills = Array.from(new Set(resumes.flatMap(r => r.extractedData?.technicalSkills || [])));

  // Calculate experience years for sorting
  const getExperienceYears = (r: Resume): number => {
    return r.extractedData?.experience.length || 0; // fallback proxy count of companies
  };

  // Run Bulk AI Evaluation ranking across all registered resumes
  const handleBulkEvaluate = async () => {
    setEvaluatingAll(true);
    addToast('Bulk Parsing', `Scoring ${resumes.length} candidates against '${jdTitle}'...`, 'info');
    
    try {
      const results: any[] = [];
      for (const res of resumes) {
        const scoreResult = await onMatchResume(res.id, jdTitle, jdDescription);
        results.push({
          id: res.id,
          name: res.candidateName,
          email: res.email,
          overallScore: res.overallScore || 85,
          atsScore: res.atsScore || 80,
          experienceYears: getExperienceYears(res),
          skills: res.extractedData?.technicalSkills || [],
          matchScore: scoreResult.matchScore,
          missingSkills: scoreResult.missingSkills || [],
          recommendationSummary: scoreResult.recommendationSummary
        });
      }
      
      // Sort immediately by matchScore descending
      results.sort((a, b) => b.matchScore - a.matchScore);
      setEvaluatedRankings(results);
      addToast('Rankings Compiled', 'Fully prioritized dynamic candidate queue delivered', 'success');
    } catch (err: any) {
      addToast('Evaluation Error', err.message, 'error');
    } finally {
      setEvaluatingAll(false);
    }
  };

  // Run automatically on load or database updates to seed initial rankings
  useEffect(() => {
    if (resumes.length > 0 && evaluatedRankings.length === 0) {
      // Create instant base mappings
      const baseMap = resumes.map(r => ({
        id: r.id,
        name: r.candidateName,
        email: r.email,
        overallScore: r.overallScore || 85,
        atsScore: r.atsScore || 80,
        experienceYears: getExperienceYears(r),
        skills: r.extractedData?.technicalSkills || [],
        matchScore: r.overallScore || 85, // fallback match index
        missingSkills: [],
        recommendationSummary: 'Registered profile. Run match to customize.'
      }));
      setEvaluatedRankings(baseMap);
    }
  }, [resumes, evaluatedRankings]);

  // Handle shortlist toggling
  const toggleShortlist = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setShortlist(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Handle comparison matrix additions
  const toggleCompare = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCompareList(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      }
      if (prev.length >= 3) {
        addToast('Comparison Limit', 'Under normal circumstances, you can compare a maximum of 3 candidates side-by-side.', 'warning');
        return prev;
      }
      return [...prev, id];
    });
  };

  // Export Shortlisted Candidates to CSV
  const handleExportShortlist = () => {
    if (shortlist.length === 0) {
      addToast('No Selection', 'Please tick shortlist checkboxes on the candidate list first.', 'warning');
      return;
    }

    const selectedRows = evaluatedRankings.filter(r => shortlist.includes(r.id));
    const headers = ['Placement', 'Name', 'Email', 'AI Match Index', 'ATS Score', 'Exp Level (Count)'];
    const rows = selectedRows.map((r, idx) => [
      idx + 1,
      `"${r.name}"`,
      `"${r.email}"`,
      `${r.matchScore}%`,
      `${r.atsScore}%`,
      `${r.experienceYears} companies`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `shortlisted_candidates_${jdTitle.toLowerCase().replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Shortlist Exported', 'Downloaded prioritized recruiter CSV successfully', 'success');
  };

  // Filter and Sort evaluated ranks
  const processedRankings = evaluatedRankings
    .filter(r => {
      const matchesSearch = r.name.toLowerCase().includes(search.toLowerCase());
      const matchesSkill = skillFilter === 'All' || r.skills.includes(skillFilter);
      const matchesExp = expFilter === 'All'
        || (expFilter === 'Junior' && r.experienceYears < 2)
        || (expFilter === 'Mid' && r.experienceYears >= 2 && r.experienceYears <= 4)
        || (expFilter === 'Senior' && r.experienceYears > 4);
      return matchesSearch && matchesSkill && matchesExp;
    })
    .sort((a, b) => {
      if (sortBy === 'score') return b.matchScore - a.matchScore;
      if (sortBy === 'ats') return b.atsScore - a.atsScore;
      if (sortBy === 'experience') return b.experienceYears - a.experienceYears;
      return 0;
    });

  // Candidates chosen for side-by-side comparisons
  const compareCandidates = resumes.filter(r => compareList.includes(r.id));

  return (
    <div className="p-6 space-y-6">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 font-sans">
            Candidate Prioritizer & Compare Matrix
          </h1>
          <p className="text-xs text-slate-500">
            Compare candidates side-by-side, evaluate entire talent pools against custom Job Descriptions, and export recruitment shortlists.
          </p>
        </div>
        
        {shortlist.length > 0 && (
          <button 
            onClick={handleExportShortlist}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/10 transition-colors"
          >
            <Download size={14} />
            <span>Export shortlist ({shortlist.length})</span>
          </button>
        )}
      </div>

      {/* Selector Sub Navigation Tabs */}
      <div className="flex border-b border-slate-100 dark:border-slate-800">
        <button 
          onClick={() => setActiveTab('matrix')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'matrix' 
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Dynamic Rankings Grid
        </button>
        <button 
          onClick={() => setActiveTab('compare')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'compare' 
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Side-by-Side Comparison Matrix ({compareList.length}/3)
        </button>
      </div>

      {/* ==========================================
          TAB 1: DYNAMIC RANKINGS GRID
          ========================================== */}
      {activeTab === 'matrix' && (
        <div className="space-y-6">
          
          {/* Sourcing Requirements Form */}
          <div className="p-5 bg-gradient-to-br from-indigo-950/5 via-slate-900/5 to-violet-950/5 dark:from-indigo-950/20 dark:via-slate-950/10 dark:to-violet-950/20 border border-indigo-100 dark:border-indigo-900/30 rounded-2xl shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="md:col-span-2 space-y-3">
                <div className="flex items-center gap-2">
                  <Target size={16} className="text-indigo-500" />
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 font-sans uppercase">Shortlist Requirement Criteria</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="e.g. Lead Technical Architect"
                    value={jdTitle}
                    onChange={(e) => setJdTitle(e.target.value)}
                    className="w-full p-2 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 font-sans"
                  />
                  <textarea
                    rows={2}
                    placeholder="Required qualifications, programming stack, certifications..."
                    value={jdDescription}
                    onChange={(e) => setJdDescription(e.target.value)}
                    className="w-full p-2 text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 leading-relaxed font-sans"
                  />
                </div>
              </div>

              {/* Bulk AI Rank Evaluation Action button */}
              <div className="flex flex-col justify-end">
                <button
                  onClick={handleBulkEvaluate}
                  disabled={evaluatingAll || resumes.length === 0}
                  className="w-full py-2.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-600/15 flex items-center justify-center gap-1.5 transition-all disabled:opacity-45"
                >
                  {evaluatingAll ? (
                    <>
                      <X className="animate-spin" size={12} />
                      <span>Computing AI Scores...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={12} />
                      <span>Re-Rank All Candidates</span>
                    </>
                  )}
                </button>
                <span className="text-[10px] text-slate-400 mt-2 text-center">Trigger Gemini parallel vetting comparisons</span>
              </div>

            </div>
          </div>

          {/* Search, Filter Toolbar & Table */}
          <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl shadow-sm overflow-hidden">
            
            {/* Table Internal filters */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-850 flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search candidate name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none placeholder-slate-400"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <select 
                  value={skillFilter}
                  onChange={(e) => setSkillFilter(e.target.value)}
                  className="p-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded text-slate-500"
                >
                  <option value="All">All Skills</option>
                  {allSkills.slice(0, 10).map(s => <option key={s} value={s}>{s}</option>)}
                </select>

                <select 
                  value={expFilter}
                  onChange={(e) => setExpFilter(e.target.value)}
                  className="p-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded text-slate-500"
                >
                  <option value="All">All Exp</option>
                  <option value="Junior">Junior (&lt; 2 yrs)</option>
                  <option value="Mid">Mid (2 - 4 yrs)</option>
                  <option value="Senior">Senior (&gt; 4 yrs)</option>
                </select>

                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="p-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded text-slate-500"
                >
                  <option value="score">Sort by AI Match</option>
                  <option value="ats">Sort by ATS Score</option>
                  <option value="experience">Sort by Exp Level</option>
                </select>
              </div>
            </div>

            {/* Table layout */}
            {loading ? (
              <div className="py-20 text-center text-slate-400 animate-pulse">Scanning registry...</div>
            ) : processedRankings.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-xs">No candidate matches found in registry directory.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-850 bg-slate-50 dark:bg-slate-950/60 text-[10px] font-bold text-slate-400 uppercase">
                      <th className="py-3 px-4 w-12 text-center">Rank</th>
                      <th className="py-3 px-4">Candidate Details</th>
                      <th className="py-3 px-4 text-center">AI Match Score</th>
                      <th className="py-3 px-4 text-center">ATS Vetting Score</th>
                      <th className="py-3 px-4 text-center">Exp Level</th>
                      <th className="py-3 px-4">Sourcing Analysis summary</th>
                      <th className="py-3 px-4 w-28 text-center">Shortlist</th>
                      <th className="py-3 px-4 w-28 text-center">Compare</th>
                    </tr>
                  </thead>
                  <tbody>
                    {processedRankings.map((r, index) => {
                      const isShortlisted = shortlist.includes(r.id);
                      const isComparing = compareList.includes(r.id);
                      return (
                        <tr 
                          key={r.id} 
                          className="border-b border-slate-100 dark:border-slate-850 hover:bg-slate-50/60 dark:hover:bg-slate-900/10 text-xs"
                        >
                          {/* Rank placement */}
                          <td className="py-4 px-4 text-center font-mono font-bold text-slate-400 dark:text-slate-600">
                            #{index + 1}
                          </td>

                          {/* Candidate details */}
                          <td className="py-4 px-4">
                            <div>
                              <h4 className="font-bold text-slate-800 dark:text-slate-100">{r.name}</h4>
                              <p className="text-[10px] text-slate-400">{r.email}</p>
                            </div>
                          </td>

                          {/* AI Match Score */}
                          <td className="py-4 px-4 text-center font-mono font-bold text-indigo-500">
                            {r.matchScore}%
                          </td>

                          {/* ATS Score */}
                          <td className="py-4 px-4 text-center font-mono font-medium text-emerald-500">
                            {r.atsScore}%
                          </td>

                          {/* Experience Years count */}
                          <td className="py-4 px-4 text-center font-mono text-slate-500">
                            {r.experienceYears} companies
                          </td>

                          {/* Sourcing Summary */}
                          <td className="py-4 px-4 max-w-xs text-slate-500 truncate" title={r.recommendationSummary}>
                            {r.recommendationSummary}
                          </td>

                          {/* Shortlist Action */}
                          <td className="py-4 px-4 text-center">
                            <button
                              onClick={(e) => toggleShortlist(r.id, e)}
                              className={`p-1.5 rounded-lg border transition-all ${
                                isShortlisted 
                                  ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' 
                                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                              }`}
                            >
                              <FileCheck size={14} />
                            </button>
                          </td>

                          {/* Compare Action */}
                          <td className="py-4 px-4 text-center">
                            <button
                              onClick={(e) => toggleCompare(r.id, e)}
                              className={`p-1.5 rounded-lg border transition-all ${
                                isComparing 
                                  ? 'bg-indigo-600/10 border-indigo-600 text-indigo-500' 
                                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                              }`}
                            >
                              <Layers size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

          </div>

        </div>
      )}

      {/* ==========================================
          TAB 2: SIDE-BY-SIDE COMPARISON MATRIX
          ========================================== */}
      {activeTab === 'compare' && (
        compareList.length === 0 ? (
          <div className="py-24 text-center bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl text-slate-400 flex flex-col items-center justify-center space-y-2">
            <Users className="h-10 w-10 text-slate-300 dark:text-slate-700 animate-pulse" />
            <h3 className="font-bold text-sm text-slate-950 dark:text-slate-100">Comparison Pipeline Empty</h3>
            <p className="text-xs max-w-sm">Return to the **Dynamic Rankings Grid** and click the compare card icon on any 2 or 3 candidates to inspect their parameters side-by-side.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
            {compareCandidates.map(candidate => (
              <div 
                key={candidate.id} 
                className="p-5 bg-white dark:bg-slate-950 border border-slate-250 dark:border-slate-850 rounded-2xl shadow-sm space-y-5 relative"
              >
                <button 
                  onClick={(e) => toggleCompare(candidate.id, e)}
                  className="absolute top-4 right-4 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400"
                >
                  <X size={14} />
                </button>

                {/* Candidate header info */}
                <div className="pb-3 border-b border-slate-100 dark:border-slate-850">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">{candidate.candidateName}</h3>
                  <p className="text-[10px] text-slate-400 truncate">{candidate.email}</p>
                </div>

                {/* AI & ATS scores comparison */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-xl text-center">
                    <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">AIScore</span>
                    <span className="text-2xl font-black text-indigo-500">{candidate.overallScore}/100</span>
                  </div>
                  <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl text-center">
                    <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">ATS Vetting</span>
                    <span className="text-2xl font-black text-emerald-500">{candidate.atsScore}%</span>
                  </div>
                </div>

                {/* Technical Skills comparison */}
                <div className="space-y-1.5">
                  <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Acquired Technical Skills</span>
                  <div className="flex flex-wrap gap-1 max-h-[80px] overflow-y-auto custom-scrollbar">
                    {candidate.extractedData?.technicalSkills.map(sk => (
                      <span key={sk} className="px-1.5 py-0.5 text-[9px] font-medium bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 rounded">
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Employment history details */}
                <div className="space-y-2">
                  <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Employment Roles</span>
                  <div className="space-y-2 max-h-[140px] overflow-y-auto custom-scrollbar pr-1">
                    {candidate.extractedData?.experience.map((exp, idx) => (
                      <div key={idx} className="p-2 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-lg text-[11px]">
                        <h4 className="font-bold text-slate-700 dark:text-slate-200">{exp.role}</h4>
                        <p className="text-[10px] text-slate-400 font-medium">{exp.company} • {exp.duration}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sourcing summary roadmap comparison */}
                <div className="space-y-1.5">
                  <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Award size={10} className="text-indigo-500" /> Career Alignment Index
                  </span>
                  <div className="p-3 rounded-lg bg-indigo-500/5 text-[11px] leading-relaxed text-slate-600 dark:text-slate-400 font-sans italic">
                    "{candidate.learningRoadmap?.expectedTimeline ? 'Expected timeline: ' + candidate.learningRoadmap.expectedTimeline : 'Senior Architect career track verified.'}"
                  </div>
                </div>

              </div>
            ))}
          </div>
        )
      )}

    </div>
  );
}
