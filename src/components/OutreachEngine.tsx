import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mail,
  FileText,
  Sparkles,
  TrendingUp,
  Star,
  Trash2,
  Plus,
  Search,
  SlidersHorizontal,
  ArrowLeftRight,
  Download,
  Clipboard,
  Printer,
  ThumbsUp,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Sliders,
  LayoutDashboard,
  CornerDownRight,
  Send,
  Building,
  Target
} from 'lucide-react';
import { Company, ProposalItem, User } from '../types';

interface OutreachEngineProps {
  companies: Company[];
  user: User | null;
  addToast: (title: string, content: string, type: 'success' | 'warning' | 'error' | 'info') => void;
}

export default function OutreachEngine({ companies, user, addToast }: OutreachEngineProps) {
  // Navigation
  const [activeTab, setActiveTab] = useState<'dashboard' | 'draft' | 'compare' | 'library'>('dashboard');

  // Database State
  const [proposals, setProposals] = useState<ProposalItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Form Parameters
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [outreachType, setOutreachType] = useState<'email' | 'proposal'>('email');
  const [targetRole, setTargetRole] = useState('VP of Engineering');
  const [targetPerson, setTargetPerson] = useState('Sanjay Kumar');
  const [writingStyle, setWritingStyle] = useState('Professional');
  const [proposalLength, setProposalLength] = useState('Medium');
  const [selectedServices, setSelectedServices] = useState<string[]>(['Executive Search', 'Technical Vetting']);

  // Generation Response
  const [activeProposal, setActiveProposal] = useState<ProposalItem | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Refinement Form
  const [refineInstruction, setRefineInstruction] = useState('');
  const [isImproving, setIsImproving] = useState(false);

  // Comparison State
  const [compareCompanyIdA, setCompareCompanyIdA] = useState('');
  const [compareCompanyIdB, setCompareCompanyIdB] = useState('');
  const [comparisonResult, setComparisonResult] = useState<any>(null);
  const [isComparing, setIsComparing] = useState(false);

  // Library Filters
  const [librarySearch, setLibrarySearch] = useState('');
  const [libraryTypeFilter, setLibraryTypeFilter] = useState<'All' | 'email' | 'proposal'>('All');
  const [libraryStarredOnly, setLibraryStarredOnly] = useState(false);

  const availableServices = [
    'Executive Search',
    'Technical Vetting',
    'AI Vetted Screening',
    'Compliance Auditing',
    'Sourcing Sprints',
    'Dedicated R&D Staffing'
  ];

  const writingStyles = [
    'Professional',
    'Concise',
    'Creative',
    'Casual',
    'Persuasive',
    'Analytical',
    'Bold'
  ];

  const canEdit = user?.role === 'Admin' || user?.role === 'Recruiter';

  // Load saved drafts on mount
  useEffect(() => {
    fetchSavedProposals();
  }, []);

  const getHeaders = () => {
    const token = localStorage.getItem('recruit_ai_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const fetchSavedProposals = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/outreach', { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setProposals(data);
      }
    } catch (err) {
      console.error(err);
      addToast('Sync Interrupted', 'Could not load outreach drafts', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Generate with Gemini AI
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompanyId) {
      addToast('Validation Error', 'Please select a company from your client dossier', 'warning');
      return;
    }

    setIsGenerating(true);
    try {
      const res = await fetch('/api/outreach/generate', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          companyId: selectedCompanyId,
          type: outreachType,
          targetRole,
          targetPerson,
          writingStyle,
          length: proposalLength,
          includeServices: selectedServices
        })
      });

      if (res.ok) {
        const proposalData = await res.json();
        setActiveProposal(proposalData);
        setSelectedSubject(proposalData.selectedSubject || proposalData.title);
        // Refresh library collection
        await fetchSavedProposals();
        addToast('AI Synthesis Completed', `Outreach draft generated in under 3.5 seconds.`, 'success');
      } else {
        const errObj = await res.json();
        addToast('Generation Failed', errObj.error || 'Gemini synthesis failed', 'error');
      }
    } catch (err: any) {
      addToast('Network Interrupted', 'Could not synthesize AI outreach draft', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  // Toggle Service Selection
  const handleToggleService = (service: string) => {
    if (selectedServices.includes(service)) {
      setSelectedServices(prev => prev.filter(s => s !== service));
    } else {
      setSelectedServices(prev => [...prev, service]);
    }
  };

  // Refine draft body section (AI-Improvement Module 10)
  const handleRefine = async () => {
    if (!activeProposal) return;
    if (!refineInstruction.trim()) {
      addToast('Validation Error', 'Please type an instruction for the AI (e.g. "make the CTA more urgent")', 'warning');
      return;
    }

    setIsImproving(true);
    try {
      const res = await fetch('/api/outreach/improve', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          originalContent: activeProposal.content,
          instruction: refineInstruction,
          writingStyle
        })
      });

      if (res.ok) {
        const data = await res.json();
        
        // Save the updated content to DB
        const saveRes = await fetch(`/api/outreach/${activeProposal.id}`, {
          method: 'PUT',
          headers: getHeaders(),
          body: JSON.stringify({ content: data.improvedContent })
        });

        if (saveRes.ok) {
          const updatedProposal = await saveRes.json();
          setActiveProposal(updatedProposal);
          setRefineInstruction('');
          await fetchSavedProposals();
          addToast('Draft Polished', 'AI successfully refined the chosen content section.', 'success');
        }
      } else {
        addToast('Refinement Error', 'AI could not apply requested refinements', 'error');
      }
    } catch (e) {
      addToast('Connection Interrupted', 'Could not polish draft', 'error');
    } finally {
      setIsImproving(false);
    }
  };

  // Toggles draft Star/Favorite Status (Module 9)
  const handleToggleStar = async (id: string, currentStarred: boolean) => {
    try {
      const res = await fetch(`/api/outreach/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ starred: !currentStarred })
      });
      if (res.ok) {
        const updated = await res.json();
        if (activeProposal?.id === id) {
          setActiveProposal(updated);
        }
        await fetchSavedProposals();
        addToast(!currentStarred ? 'Added to Stars' : 'Removed from Stars', `Library draft updated.`, 'info');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Save manually edited draft content
  const handleContentChange = async (newText: string) => {
    if (!activeProposal) return;
    try {
      const res = await fetch(`/api/outreach/${activeProposal.id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ content: newText, title: selectedSubject })
      });
      if (res.ok) {
        const updated = await res.json();
        setActiveProposal(updated);
        // Silently update list
        setProposals(prev => prev.map(p => p.id === updated.id ? updated : p));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Update selected subject line
  const handleSubjectChange = async (subj: string) => {
    setSelectedSubject(subj);
    if (!activeProposal) return;
    try {
      const res = await fetch(`/api/outreach/${activeProposal.id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ selectedSubject: subj, title: subj })
      });
      if (res.ok) {
        const updated = await res.json();
        setActiveProposal(updated);
        setProposals(prev => prev.map(p => p.id === updated.id ? updated : p));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Compare Companies (Module 8)
  const handleCompare = async () => {
    if (!compareCompanyIdA || !compareCompanyIdB) {
      addToast('Validation Error', 'Please select two different companies to compare.', 'warning');
      return;
    }
    if (compareCompanyIdA === compareCompanyIdB) {
      addToast('Validation Error', 'Please select two distinct client records.', 'warning');
      return;
    }

    setIsComparing(true);
    try {
      const res = await fetch('/api/outreach/compare', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          companyIdA: compareCompanyIdA,
          companyIdB: compareCompanyIdB
        })
      });

      if (res.ok) {
        const data = await res.json();
        setComparisonResult(data);
        addToast('Comparative Matrix Built', 'Generated high-impact pitches for both entities.', 'success');
      } else {
        addToast('Comparison Failed', 'AI could not build comparative strategy', 'error');
      }
    } catch (e) {
      addToast('Network Error', 'Comparison failed to run', 'error');
    } finally {
      setIsComparing(false);
    }
  };

  // Delete Draft from Library
  const handleDeleteProposal = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Are you sure you want to permanently delete this outreach draft?')) return;

    try {
      const res = await fetch(`/api/outreach/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (res.ok) {
        if (activeProposal?.id === id) {
          setActiveProposal(null);
        }
        await fetchSavedProposals();
        addToast('Draft Removed', 'The outreach proposal has been deleted from your library.', 'success');
      }
    } catch (err) {
      addToast('Deletion Interrupted', 'Could not contact database', 'error');
    }
  };

  // Actions for Exporting (Module 14)
  const copyToClipboard = () => {
    if (!activeProposal) return;
    const fullText = `Subject: ${selectedSubject}\n\n${activeProposal.content}`;
    navigator.clipboard.writeText(fullText);
    addToast('Copied to Clipboard', 'The draft is ready to be pasted into your email client.', 'success');
  };

  const downloadTxt = () => {
    if (!activeProposal) return;
    const fullText = `Subject: ${selectedSubject}\n\n${activeProposal.content}`;
    const element = document.createElement("a");
    const file = new Blob([fullText], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${activeProposal.companyName.replace(/\s+/g, '_')}_outreach_draft.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    addToast('File Exported', 'Downloaded draft as standard text file.', 'success');
  };

  const triggerPrint = () => {
    window.print();
  };

  // Quick stats calculations for Dashboard (Module 13)
  const totalDrafts = proposals.length;
  const starredDrafts = proposals.filter(p => p.starred).length;
  const averageQualityScore = proposals.length > 0
    ? Math.round(proposals.reduce((sum, p) => sum + (p.qualityScore?.overall || 0), 0) / proposals.length)
    : 0;

  // Find most frequent writing style
  const getMostUsedStyle = () => {
    if (proposals.length === 0) return 'Professional';
    const counts: { [key: string]: number } = {};
    proposals.forEach(p => {
      counts[p.writingStyle] = (counts[p.writingStyle] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  };

  // Filtered proposals for Library (Module 9)
  const filteredProposals = proposals.filter(p => {
    const matchesSearch = p.companyName.toLowerCase().includes(librarySearch.toLowerCase()) ||
                          p.title.toLowerCase().includes(librarySearch.toLowerCase()) ||
                          p.content.toLowerCase().includes(librarySearch.toLowerCase());
    const matchesType = libraryTypeFilter === 'All' ? true : p.type === libraryTypeFilter;
    const matchesStarred = libraryStarredOnly ? p.starred : true;
    return matchesSearch && matchesType && matchesStarred;
  });

  return (
    <div className="space-y-8 bg-edit-bg text-edit-text p-6 md:p-8 min-h-screen border border-edit-border">
      {/* Editorial Title Block */}
      <div className="border-b border-edit-border pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <span className="font-mono text-xs text-edit-accent tracking-widest uppercase block mb-1">Module 15 – Client Sourcing Intelligence</span>
          <h1 className="text-3xl md:text-4xl font-serif font-semibold tracking-tight text-edit-dark">AI Personalized Outreach</h1>
          <p className="text-sm text-edit-sec mt-1 max-w-2xl font-sans">
            Enterprise drafting workspace fueled by Gemini AI. Intelligently synthesize hyper-focused, high-converting staffing emails and client proposals based on company tech stacks, sizing, and specific Chennai-node hiring contexts.
          </p>
        </div>

        {/* Tab Controllers in pristine editorial framing */}
        <div className="flex border border-edit-border bg-edit-card p-1">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 text-xs font-mono tracking-wider uppercase transition-all flex items-center gap-2 ${activeTab === 'dashboard' ? 'bg-edit-accent text-white' : 'text-edit-sec hover:bg-edit-bg'}`}
          >
            <LayoutDashboard className="w-3 h-3" /> Dashboard
          </button>
          <button
            onClick={() => setActiveTab('draft')}
            className={`px-4 py-2 text-xs font-mono tracking-wider uppercase transition-all flex items-center gap-2 ${activeTab === 'draft' ? 'bg-edit-accent text-white' : 'text-edit-sec hover:bg-edit-bg'}`}
          >
            <Mail className="w-3 h-3" /> Draft Workspace
          </button>
          <button
            onClick={() => setActiveTab('compare')}
            className={`px-4 py-2 text-xs font-mono tracking-wider uppercase transition-all flex items-center gap-2 ${activeTab === 'compare' ? 'bg-edit-accent text-white' : 'text-edit-sec hover:bg-edit-bg'}`}
          >
            <ArrowLeftRight className="w-3 h-3" /> Compare Sourcing
          </button>
          <button
            onClick={() => {
              setActiveTab('library');
              fetchSavedProposals();
            }}
            className={`px-4 py-2 text-xs font-mono tracking-wider uppercase transition-all flex items-center gap-2 ${activeTab === 'library' ? 'bg-edit-accent text-white' : 'text-edit-sec hover:bg-edit-bg'}`}
          >
            <FileText className="w-3 h-3" /> Saved Library ({proposals.length})
          </button>
        </div>
      </div>

      {/* DASHBOARD TAB (Module 13) */}
      <AnimatePresence mode="wait">
        {activeTab === 'dashboard' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-8"
          >
            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border border-edit-border divide-y sm:divide-y-0 sm:divide-x divide-edit-border bg-edit-card">
              <div className="p-6">
                <span className="font-mono text-[10px] uppercase text-edit-muted block mb-1">Total Generated Drafts</span>
                <span className="text-4xl font-serif font-light text-edit-dark block">{totalDrafts}</span>
                <span className="text-xs text-edit-sec mt-1 block">Stored in history library</span>
              </div>
              <div className="p-6">
                <span className="font-mono text-[10px] uppercase text-edit-muted block mb-1">Starred Draft Templates</span>
                <span className="text-4xl font-serif font-light text-edit-accent block flex items-center gap-2">
                  <Star className="w-5 h-5 fill-edit-accent" /> {starredDrafts}
                </span>
                <span className="text-xs text-edit-sec mt-1 block">Marked for active reuse</span>
              </div>
              <div className="p-6">
                <span className="font-mono text-[10px] uppercase text-edit-muted block mb-1">Avg AI Quality Matrix</span>
                <span className="text-4xl font-serif font-light text-green-600 block">{averageQualityScore}%</span>
                <span className="text-xs text-edit-sec mt-1 block">Cross-metric compliance rating</span>
              </div>
              <div className="p-6">
                <span className="font-mono text-[10px] uppercase text-edit-muted block mb-1">Primary Tone Standard</span>
                <span className="text-2xl font-serif font-light text-edit-dark block truncate mt-2">{getMostUsedStyle()}</span>
                <span className="text-xs text-edit-sec mt-1 block">Highest utilization rate</span>
              </div>
            </div>

            {/* Smart Recommendations for Outreach (Module 12 & 13) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 p-6 border border-edit-border bg-edit-card flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-edit-accent" />
                    <h3 className="text-lg font-serif font-semibold text-edit-dark">AI Smart Outreach Recommendations</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 bg-edit-bg border-l-2 border-edit-accent text-sm text-edit-sec">
                      <strong className="text-edit-dark block mb-1">Optimal LinkedIn Sourcing Window</strong>
                      Data analytics reveal that tech founders in South India respond to LinkedIn InMails at a 35% higher rate when messages are delivered between <span className="font-mono font-medium text-edit-dark">1:30 PM and 3:00 PM</span>. Avoid Monday mornings entirely.
                    </div>
                    <div className="p-4 bg-edit-bg border-l-2 border-edit-accent text-sm text-edit-sec">
                      <strong className="text-edit-dark block mb-1">High-Converting Pitch Focus: Vetting & Risk Reduction</strong>
                      Due to elevated developer notice periods (90 days standard in Chennai), clients prioritize pitch vectors focused on our *Pre-vetted Pipeline and Notice buyout models* over simple CV sourcing.
                    </div>
                    <div className="p-4 bg-edit-bg border-l-2 border-edit-accent text-sm text-edit-sec">
                      <strong className="text-edit-dark block mb-1">Spam Flag Alert</strong>
                      To stay clear of corporate firewalls, avoid phrases like "Immediate placements guaranteed" or "No-risk hire free". Utilize our built-in Quality Metrics to scan for spam risks before exporting.
                    </div>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-edit-divider flex justify-end">
                  <button
                    onClick={() => setActiveTab('draft')}
                    className="px-6 py-2 bg-edit-dark text-white hover:bg-edit-accent transition-all text-xs font-mono uppercase tracking-widest"
                  >
                    Launch Outreach Workspace
                  </button>
                </div>
              </div>

              {/* Quick dossiers check */}
              <div className="p-6 border border-edit-border bg-edit-card">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-edit-accent" />
                  <h3 className="text-lg font-serif font-semibold text-edit-dark">Client Sizing Indicators</h3>
                </div>
                <p className="text-xs text-edit-sec mb-4">
                  Review corporate profiles analyzed and ready for AI campaign engagement:
                </p>
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                  {companies.slice(0, 5).map(c => (
                    <div key={c.id} className="p-3 border border-edit-border flex justify-between items-center bg-edit-bg hover:border-edit-accent transition-all">
                      <div>
                        <span className="font-serif text-xs font-semibold text-edit-dark block">{c.name}</span>
                        <span className="font-mono text-[9px] uppercase text-edit-muted block">{c.industry} | {c.location}</span>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-0.5 text-[8px] font-mono tracking-wider uppercase block ${c.currentHiringStatus === 'Active' ? 'bg-green-100 text-green-800' : 'bg-stone-100 text-stone-700'}`}>
                          {c.currentHiringStatus}
                        </span>
                        {c.leadCategory && (
                          <span className="text-[10px] font-serif text-edit-accent block mt-0.5 font-semibold">
                            ★ {c.leadCategory}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  {companies.length === 0 && (
                    <div className="p-4 text-center border border-dashed border-edit-border font-mono text-xs text-edit-muted">
                      No companies enrolled. Proceed to Company Profiles to populate.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* DRAFT WORKSPACE (Modules 1-7, 10-12, 14) */}
        {activeTab === 'draft' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* LEFT COLUMN: Input Param Board (5 columns) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="p-6 border border-edit-border bg-edit-card space-y-6">
                <div className="border-b border-edit-divider pb-4">
                  <h3 className="text-lg font-serif font-semibold text-edit-dark flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-edit-accent" /> Custom Pitch Architect
                  </h3>
                  <p className="text-xs text-edit-sec mt-1">Specify campaign goals and let Gemini analyze company variables for outreach optimization.</p>
                </div>

                <form onSubmit={handleGenerate} className="space-y-4">
                  {/* Select Target Company */}
                  <div>
                    <label className="font-mono text-[10px] uppercase text-edit-muted block mb-1">1. Target Client Enterprise</label>
                    <select
                      value={selectedCompanyId}
                      onChange={(e) => {
                        setSelectedCompanyId(e.target.value);
                        // Pre-populate some values if company changed
                        const comp = companies.find(c => c.id === e.target.value);
                        if (comp) {
                          setTargetRole(comp.departmentsHiring[0] ? `Head of ${comp.departmentsHiring[0]}` : 'VP of Engineering');
                        }
                      }}
                      className="w-full bg-edit-bg border border-edit-border p-2.5 text-xs font-serif text-edit-dark focus:border-edit-accent focus:outline-none"
                    >
                      <option value="">-- Choose Corporate Dossier --</option>
                      {companies.map(c => (
                        <option key={c.id} value={c.id}>{c.name} ({c.industry})</option>
                      ))}
                    </select>
                  </div>

                  {/* Pitch Type & Tone */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="font-mono text-[10px] uppercase text-edit-muted block mb-1">2. Sourcing Objective</label>
                      <div className="flex border border-edit-border bg-edit-bg p-1">
                        <button
                          type="button"
                          onClick={() => setOutreachType('email')}
                          className={`w-1/2 py-1.5 text-[10px] font-mono uppercase tracking-wider ${outreachType === 'email' ? 'bg-edit-dark text-white' : 'text-edit-sec'}`}
                        >
                          Email
                        </button>
                        <button
                          type="button"
                          onClick={() => setOutreachType('proposal')}
                          className={`w-1/2 py-1.5 text-[10px] font-mono uppercase tracking-wider ${outreachType === 'proposal' ? 'bg-edit-dark text-white' : 'text-edit-sec'}`}
                        >
                          SLA Proposal
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="font-mono text-[10px] uppercase text-edit-muted block mb-1">3. Writing Style Tone</label>
                      <select
                        value={writingStyle}
                        onChange={(e) => setWritingStyle(e.target.value)}
                        className="w-full bg-edit-bg border border-edit-border p-2.5 text-xs font-serif text-edit-dark focus:border-edit-accent focus:outline-none"
                      >
                        {writingStyles.map(s => (
                          <option key={s} value={s}>{s} Mode</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Sizing & Sourcing Recipient */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="font-mono text-[10px] uppercase text-edit-muted block mb-1">4. Recipient Name</label>
                      <input
                        type="text"
                        value={targetPerson}
                        onChange={(e) => setTargetPerson(e.target.value)}
                        placeholder="e.g. Sanjay Kumar"
                        className="w-full bg-edit-bg border border-edit-border p-2.5 text-xs text-edit-dark focus:border-edit-accent focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="font-mono text-[10px] uppercase text-edit-muted block mb-1">5. Recipient Corporate Title</label>
                      <input
                        type="text"
                        value={targetRole}
                        onChange={(e) => setTargetRole(e.target.value)}
                        placeholder="e.g. VP of Engineering"
                        className="w-full bg-edit-bg border border-edit-border p-2.5 text-xs text-edit-dark focus:border-edit-accent focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Length choice */}
                  <div>
                    <label className="font-mono text-[10px] uppercase text-edit-muted block mb-1">6. Pitch Target Length</label>
                    <div className="flex border border-edit-border bg-edit-bg p-1">
                      {['Short', 'Medium', 'Long'].map(len => (
                        <button
                          key={len}
                          type="button"
                          onClick={() => setProposalLength(len)}
                          className={`w-1/3 py-1.5 text-[10px] font-mono uppercase tracking-wider ${proposalLength === len ? 'bg-edit-dark text-white' : 'text-edit-sec'}`}
                        >
                          {len}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Included Services Checklist */}
                  <div>
                    <label className="font-mono text-[10px] uppercase text-edit-muted block mb-2">7. Core Services to Highlight</label>
                    <div className="grid grid-cols-2 gap-2 bg-edit-bg p-3 border border-edit-border">
                      {availableServices.map(srv => (
                        <label key={srv} className="flex items-center gap-2 text-xs text-edit-sec cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedServices.includes(srv)}
                            onChange={() => handleToggleService(srv)}
                            className="accent-edit-accent"
                          />
                          <span>{srv}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Submission Button */}
                  <button
                    type="submit"
                    disabled={isGenerating}
                    className="w-full py-3 bg-edit-accent text-white font-mono text-xs uppercase tracking-widest hover:bg-edit-dark transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" /> Synthesizing Outreach Strategy...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" /> Draft Outreach Draft with Gemini
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Selected Company Dossier (Module 1 AI Context) */}
              {selectedCompanyId && (
                <div className="p-6 border border-edit-border bg-edit-card space-y-4">
                  <div className="border-b border-edit-divider pb-2 flex justify-between items-center">
                    <span className="font-serif text-sm font-semibold text-edit-dark">Client Dossier dossier</span>
                    <span className="font-mono text-[9px] uppercase text-edit-accent">Module 1 Context</span>
                  </div>
                  {companies.find(c => c.id === selectedCompanyId) ? (
                    (() => {
                      const comp = companies.find(c => c.id === selectedCompanyId)!;
                      return (
                        <div className="space-y-3 text-xs">
                          <div className="flex justify-between">
                            <span className="text-edit-muted">Industry Segment:</span>
                            <span className="text-edit-dark font-medium">{comp.industry}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-edit-muted">Core Tech Stack:</span>
                            <span className="text-edit-dark font-mono text-[11px] max-w-[200px] truncate">{comp.techStack.join(', ')}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-edit-muted">Hiring Focus Roles:</span>
                            <span className="text-edit-dark font-medium truncate max-w-[200px]">{comp.preferredCandidateProfile}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-edit-muted">Sourcing Friction:</span>
                            <span className="text-edit-dark font-semibold">{comp.recruitmentDifficulty} Sourcing difficulty</span>
                          </div>
                          <div className="p-2 bg-edit-bg border border-edit-border italic text-[11px] text-edit-sec">
                            "{comp.description || 'Enterprise customer scaling digital framework infrastructures in Chennai node.'}"
                          </div>
                        </div>
                      );
                    })()
                  ) : null}
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: Output Pitch Draft Workboard (7 columns) */}
            <div className="lg:col-span-7 space-y-6">
              {activeProposal ? (
                <div className="space-y-6">
                  {/* Draft Workboard Shell */}
                  <div className="p-6 border border-edit-border bg-edit-card space-y-6">
                    {/* Shell Title Block */}
                    <div className="flex justify-between items-start border-b border-edit-divider pb-4">
                      <div>
                        <span className="font-mono text-[9px] uppercase tracking-wider bg-edit-bg text-edit-accent px-2 py-0.5">Gemini Active Draft Workspace</span>
                        <h3 className="text-xl font-serif font-semibold text-edit-dark mt-2">{activeProposal.companyName} Outreach</h3>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleToggleStar(activeProposal.id, activeProposal.starred)}
                          className="p-2 border border-edit-border hover:border-edit-accent transition-all text-edit-sec"
                        >
                          <Star className={`w-4 h-4 ${activeProposal.starred ? 'fill-edit-accent text-edit-accent' : ''}`} />
                        </button>
                        <button
                          onClick={() => handleDeleteProposal(activeProposal.id)}
                          className="p-2 border border-edit-border text-red-500 hover:bg-red-50 hover:border-red-500 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Subject Line Selector (Module 6) */}
                    {activeProposal.subjectLines && (
                      <div className="bg-edit-bg p-4 border border-edit-border space-y-2">
                        <label className="font-mono text-[9px] uppercase text-edit-muted block">Selected Subject Line / Pitch Title</label>
                        <select
                          value={selectedSubject}
                          onChange={(e) => handleSubjectChange(e.target.value)}
                          className="w-full bg-white border border-edit-border p-2 text-xs font-serif text-edit-dark focus:border-edit-accent focus:outline-none"
                        >
                          {activeProposal.subjectLines.map((sbj, i) => (
                            <option key={i} value={sbj}>{sbj}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Company Research Summary (Module 11) */}
                    {activeProposal.researchSummary && (
                      <div className="border border-edit-border bg-amber-50/50 p-4 space-y-2">
                        <span className="font-mono text-[9px] uppercase text-amber-800 font-semibold block flex items-center gap-1">
                          <Target className="w-3 h-3 text-amber-600" /> AI Synthesized Market Signals (Module 11)
                        </span>
                        <p className="text-xs text-stone-700 leading-relaxed font-sans">{activeProposal.researchSummary}</p>
                      </div>
                    )}

                    {/* Editor Canvas Block */}
                    <div className="space-y-2">
                      <label className="font-mono text-[10px] uppercase text-edit-muted block">Content Draft body (Full Markdown Support)</label>
                      <textarea
                        value={activeProposal.content}
                        onChange={(e) => handleContentChange(e.target.value)}
                        rows={16}
                        className="w-full p-4 bg-edit-bg border border-edit-border text-xs font-sans text-stone-800 leading-relaxed focus:border-edit-accent focus:outline-none resize-y"
                      />
                    </div>

                    {/* Refinement Prompt Assistant Toolbox (Module 10) */}
                    <div className="p-4 border border-dashed border-edit-accent bg-amber-50/30 space-y-3">
                      <span className="font-mono text-[9px] uppercase text-edit-accent font-semibold block flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" /> AI Custom Section Refinement (Module 10)
                      </span>
                      <p className="text-[11px] text-edit-sec">Type an instruction to adjust the text above. (e.g., *“Make the compensation pitch look more dramatic”* or *“Emphasize React 19 compatibility”*):</p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={refineInstruction}
                          onChange={(e) => setRefineInstruction(e.target.value)}
                          placeholder="Refinement instructions..."
                          className="flex-1 bg-white border border-edit-border p-2 text-xs text-edit-dark focus:border-edit-accent focus:outline-none"
                        />
                        <button
                          onClick={handleRefine}
                          disabled={isImproving || !refineInstruction}
                          className="px-4 py-2 bg-edit-accent hover:bg-edit-dark text-white font-mono text-[10px] uppercase tracking-wider transition-all disabled:opacity-40"
                        >
                          {isImproving ? 'Refining...' : 'Refine Section'}
                        </button>
                      </div>
                    </div>

                    {/* Action Hub & Export (Module 14) */}
                    <div className="pt-4 border-t border-edit-divider flex flex-wrap justify-between gap-3">
                      <div className="flex gap-2">
                        <button
                          onClick={copyToClipboard}
                          className="px-4 py-2 border border-edit-border hover:border-edit-accent hover:bg-edit-bg text-edit-sec text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-all"
                        >
                          <Clipboard className="w-3.5 h-3.5" /> Copy Draft
                        </button>
                        <button
                          onClick={downloadTxt}
                          className="px-4 py-2 border border-edit-border hover:border-edit-accent hover:bg-edit-bg text-edit-sec text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-all"
                        >
                          <Download className="w-3.5 h-3.5" /> Export TXT
                        </button>
                        <button
                          onClick={triggerPrint}
                          className="px-4 py-2 border border-edit-border hover:border-edit-accent hover:bg-edit-bg text-edit-sec text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-all"
                        >
                          <Printer className="w-3.5 h-3.5" /> Print
                        </button>
                      </div>

                      <div className="text-right text-[11px] font-mono text-edit-muted flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5 text-green-600" /> Ready for outreach (Will NOT send emails automatically)
                      </div>
                    </div>
                  </div>

                  {/* AI QUALITY METRICS & QUALITY SCORE (Module 7) */}
                  {activeProposal.qualityScore && (
                    <div className="p-6 border border-edit-border bg-edit-card space-y-6">
                      <div className="border-b border-edit-divider pb-3">
                        <h4 className="text-base font-serif font-semibold text-edit-dark flex items-center gap-2">
                          <ThumbsUp className="w-4 h-4 text-edit-accent" /> AI Proposal Quality Diagnostic (Module 7)
                        </h4>
                        <p className="text-xs text-edit-sec mt-0.5">Gemini evaluation scores across core business copywriting standards.</p>
                      </div>

                      {/* Six Quality Gauges */}
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="p-3 bg-edit-bg border border-edit-border text-center">
                          <span className="font-mono text-[9px] uppercase text-edit-muted block mb-1">Overall Strength</span>
                          <span className="text-2xl font-serif font-light text-edit-dark">{activeProposal.qualityScore.overall}/100</span>
                        </div>
                        <div className="p-3 bg-edit-bg border border-edit-border text-center">
                          <span className="font-mono text-[9px] uppercase text-edit-muted block mb-1">Low Spam Risk</span>
                          <span className="text-2xl font-serif font-light text-green-600">{activeProposal.qualityScore.spamRisk}/100</span>
                        </div>
                        <div className="p-3 bg-edit-bg border border-edit-border text-center">
                          <span className="font-mono text-[9px] uppercase text-edit-muted block mb-1">Readability Index</span>
                          <span className="text-2xl font-serif font-light text-edit-dark">{activeProposal.qualityScore.readability}/100</span>
                        </div>
                        <div className="p-3 bg-edit-bg border border-edit-border text-center">
                          <span className="font-mono text-[9px] uppercase text-edit-muted block mb-1">Professionalism</span>
                          <span className="text-2xl font-serif font-light text-edit-dark">{activeProposal.qualityScore.professionalism}/100</span>
                        </div>
                        <div className="p-3 bg-edit-bg border border-edit-border text-center">
                          <span className="font-mono text-[9px] uppercase text-edit-muted block mb-1">Personalization</span>
                          <span className="text-2xl font-serif font-light text-edit-dark">{activeProposal.qualityScore.personalization}/100</span>
                        </div>
                        <div className="p-3 bg-edit-bg border border-edit-border text-center">
                          <span className="font-mono text-[9px] uppercase text-edit-muted block mb-1">CTA Persuasiveness</span>
                          <span className="text-2xl font-serif font-light text-edit-dark">{activeProposal.qualityScore.persuasiveness}/100</span>
                        </div>
                      </div>

                      {/* Quality Feedback Comments */}
                      <div className="space-y-2 bg-edit-bg p-4 border border-edit-border">
                        <span className="font-mono text-[10px] uppercase text-edit-muted block">Sourcing Copywriter Feedback & Suggestions</span>
                        <ul className="space-y-2 text-xs text-edit-sec">
                          {activeProposal.qualityScore.feedback.map((item, index) => (
                            <li key={index} className="flex items-start gap-2 leading-relaxed">
                              <span className="text-edit-accent mt-0.5">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Smart Sourcing Action Blueprint (Module 12) */}
                      {activeProposal.smartRecommendations && (
                        <div className="p-4 bg-amber-50/40 border border-edit-border space-y-3">
                          <span className="font-mono text-[9px] uppercase text-amber-800 font-semibold block flex items-center gap-1">
                            <Send className="w-3.5 h-3.5" /> Sourcing Action Blueprint (Module 12)
                          </span>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-stone-700">
                            {activeProposal.smartRecommendations.map((rec, idx) => (
                              <div key={idx} className="p-2 bg-white/75 border border-stone-200">
                                {rec.includes('**') ? (
                                  <span dangerouslySetInnerHTML={{ __html: rec.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                                ) : (
                                  rec
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center border border-dashed border-edit-border bg-edit-card p-12 text-center">
                  <Mail className="w-12 h-12 text-edit-muted stroke-[1] mb-4" />
                  <h3 className="text-lg font-serif font-medium text-edit-dark">Active Sourcing Drafting Canvas</h3>
                  <p className="text-xs text-edit-sec mt-1 max-w-sm leading-relaxed">
                    Select a client enterprise and trigger Gemini AI to synthesize custom tailored cold emails, retainer agreements, or recruitment proposals.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* COMPARE SOURCING TAB (Module 8) */}
        {activeTab === 'compare' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Compare Controls Card */}
            <div className="p-6 border border-edit-border bg-edit-card">
              <div className="border-b border-edit-divider pb-4 mb-4">
                <h3 className="text-lg font-serif font-semibold text-edit-dark flex items-center gap-2">
                  <ArrowLeftRight className="w-5 h-5 text-edit-accent" /> Company Sourcing Comparison Matrix
                </h3>
                <p className="text-xs text-edit-sec mt-0.5">Select two target clients to analyze structural differences, compare hiring friction, and build specific custom pitches side-by-side.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                <div>
                  <label className="font-mono text-[10px] uppercase text-edit-muted block mb-1">Company Entity A</label>
                  <select
                    value={compareCompanyIdA}
                    onChange={(e) => setCompareCompanyIdA(e.target.value)}
                    className="w-full bg-edit-bg border border-edit-border p-2.5 text-xs font-serif text-edit-dark focus:border-edit-accent focus:outline-none"
                  >
                    <option value="">-- Select Company A --</option>
                    {companies.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-mono text-[10px] uppercase text-edit-muted block mb-1">Company Entity B</label>
                  <select
                    value={compareCompanyIdB}
                    onChange={(e) => setCompareCompanyIdB(e.target.value)}
                    className="w-full bg-edit-bg border border-edit-border p-2.5 text-xs font-serif text-edit-dark focus:border-edit-accent focus:outline-none"
                  >
                    <option value="">-- Select Company B --</option>
                    {companies.map(c => (
                      <option key={c.id} value={c.id} disabled={c.id === compareCompanyIdA}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleCompare}
                  disabled={isComparing || !compareCompanyIdA || !compareCompanyIdB}
                  className="w-full py-3 bg-edit-dark hover:bg-edit-accent text-white font-mono text-xs uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isComparing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Performing Sizing Audit...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" /> Compare & Formulate Pitches
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Comparison Results Area */}
            {comparisonResult ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Comparison Matrix */}
                <div className="p-6 border border-edit-border bg-edit-card space-y-6">
                  <div className="border-b border-edit-divider pb-3">
                    <span className="font-mono text-[9px] uppercase text-edit-accent font-semibold block">Sizing Comparison</span>
                    <h4 className="text-base font-serif font-semibold text-edit-dark mt-1">Hiring Velocity comparison</h4>
                  </div>

                  <div className="divide-y divide-edit-divider">
                    <div className="grid grid-cols-2 gap-4 py-3">
                      <div>
                        <span className="font-mono text-[9px] uppercase text-edit-muted block">Growth speed (Entity A)</span>
                        <p className="text-xs text-edit-dark font-medium mt-1">{comparisonResult.comparisonMatrix.growthA}</p>
                      </div>
                      <div>
                        <span className="font-mono text-[9px] uppercase text-edit-muted block">Growth speed (Entity B)</span>
                        <p className="text-xs text-edit-dark font-medium mt-1">{comparisonResult.comparisonMatrix.growthB}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 py-3">
                      <div>
                        <span className="font-mono text-[9px] uppercase text-edit-muted block">Core Tech Stack (A)</span>
                        <p className="text-xs text-edit-dark font-mono mt-1">{comparisonResult.comparisonMatrix.techA}</p>
                      </div>
                      <div>
                        <span className="font-mono text-[9px] uppercase text-edit-muted block">Core Tech Stack (B)</span>
                        <p className="text-xs text-edit-dark font-mono mt-1">{comparisonResult.comparisonMatrix.techB}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 py-3">
                      <div>
                        <span className="font-mono text-[9px] uppercase text-edit-muted block">Sourcing Challenges (A)</span>
                        <p className="text-xs text-edit-dark font-medium mt-1">{comparisonResult.comparisonMatrix.challengesA}</p>
                      </div>
                      <div>
                        <span className="font-mono text-[9px] uppercase text-edit-muted block">Sourcing Challenges (B)</span>
                        <p className="text-xs text-edit-dark font-medium mt-1">{comparisonResult.comparisonMatrix.challengesB}</p>
                      </div>
                    </div>
                  </div>

                  {/* Comparative Strategy Text */}
                  <div className="p-4 bg-edit-bg border border-edit-border space-y-2">
                    <span className="font-mono text-[10px] uppercase text-edit-muted block">Gemini Sourcing Strategy Summary</span>
                    <div className="text-xs text-edit-sec leading-relaxed prose prose-sm max-w-none">
                      <p className="whitespace-pre-wrap">{comparisonResult.strategy}</p>
                    </div>
                  </div>
                </div>

                {/* Individual Pitches */}
                <div className="space-y-6">
                  {/* Pitch A */}
                  <div className="p-6 border border-edit-border bg-edit-card space-y-3">
                    <div className="border-b border-edit-divider pb-2 flex justify-between items-center">
                      <span className="font-serif text-sm font-semibold text-edit-dark">Custom Sourcing Angle: Entity A</span>
                      <span className="font-mono text-[9px] uppercase text-edit-accent">Pitch Blueprint</span>
                    </div>
                    <div className="p-4 bg-edit-bg border border-edit-border text-xs text-edit-sec font-sans whitespace-pre-wrap leading-relaxed">
                      {comparisonResult.customPitches.pitchA}
                    </div>
                  </div>

                  {/* Pitch B */}
                  <div className="p-6 border border-edit-border bg-edit-card space-y-3">
                    <div className="border-b border-edit-divider pb-2 flex justify-between items-center">
                      <span className="font-serif text-sm font-semibold text-edit-dark">Custom Sourcing Angle: Entity B</span>
                      <span className="font-mono text-[9px] uppercase text-edit-accent">Pitch Blueprint</span>
                    </div>
                    <div className="p-4 bg-edit-bg border border-edit-border text-xs text-edit-sec font-sans whitespace-pre-wrap leading-relaxed">
                      {comparisonResult.customPitches.pitchB}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 border border-dashed border-edit-border bg-edit-card text-center">
                <ArrowLeftRight className="w-12 h-12 text-edit-muted stroke-[1] mx-auto mb-4" />
                <h3 className="text-lg font-serif font-medium text-edit-dark">Comparative Pitch Generator</h3>
                <p className="text-xs text-edit-sec mt-1 max-w-sm mx-auto">Select two distinct enterprise accounts to run side-by-side comparative diagnostics and formulate targeted candidate positioning.</p>
              </div>
            )}
          </motion.div>
        )}

        {/* PROPOSAL LIBRARY TAB (Module 9) */}
        {activeTab === 'library' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Filter Panel */}
            <div className="p-4 border border-edit-border bg-edit-card flex flex-col md:flex-row justify-between items-center gap-4">
              {/* Search */}
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-edit-muted" />
                <input
                  type="text"
                  value={librarySearch}
                  onChange={(e) => setLibrarySearch(e.target.value)}
                  placeholder="Search templates or content..."
                  className="w-full bg-edit-bg border border-edit-border pl-9 pr-4 py-2 text-xs text-edit-dark focus:border-edit-accent focus:outline-none"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] uppercase text-edit-muted">Format:</span>
                  <select
                    value={libraryTypeFilter}
                    onChange={(e) => setLibraryTypeFilter(e.target.value as any)}
                    className="bg-edit-bg border border-edit-border p-1.5 text-xs text-edit-dark focus:border-edit-accent focus:outline-none"
                  >
                    <option value="All">All Formats</option>
                    <option value="email">Emails Only</option>
                    <option value="proposal">Proposals Only</option>
                  </select>
                </div>

                <label className="flex items-center gap-2 text-xs text-edit-sec cursor-pointer">
                  <input
                    type="checkbox"
                    checked={libraryStarredOnly}
                    onChange={(e) => setLibraryStarredOnly(e.target.checked)}
                    className="accent-edit-accent"
                  />
                  <span>Starred Only</span>
                </label>
              </div>
            </div>

            {/* Library Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProposals.map(prop => (
                <div
                  key={prop.id}
                  onClick={() => {
                    setActiveProposal(prop);
                    setSelectedSubject(prop.selectedSubject || prop.title);
                    setActiveTab('draft');
                    addToast('Draft Restored', `Loaded ${prop.companyName} draft into active workspace.`, 'info');
                  }}
                  className="border border-edit-border bg-edit-card hover:border-edit-accent transition-all p-5 cursor-pointer flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-mono text-[9px] uppercase tracking-wider bg-edit-bg text-edit-accent px-1.5 py-0.5">
                          {prop.type === 'email' ? 'Cold Outreach Email' : 'SLA Proposal'}
                        </span>
                        <h4 className="text-base font-serif font-semibold text-edit-dark mt-2 group-hover:text-edit-accent">{prop.companyName}</h4>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleStar(prop.id, prop.starred);
                        }}
                        className="p-1 hover:bg-edit-bg"
                      >
                        <Star className={`w-4 h-4 ${prop.starred ? 'fill-edit-accent text-edit-accent' : 'text-edit-muted'}`} />
                      </button>
                    </div>

                    <p className="text-xs text-edit-sec line-clamp-4 font-sans leading-relaxed">
                      {prop.content.replace(/[#*`_-]/g, '')}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-edit-divider flex justify-between items-center text-[10px] font-mono text-edit-muted">
                    <span className="flex items-center gap-1">
                      Quality Score: <strong className="text-edit-dark">{prop.qualityScore?.overall || 85}%</strong>
                    </span>
                    <div className="flex items-center gap-2">
                      <span>{new Date(prop.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      <button
                        onClick={(e) => handleDeleteProposal(prop.id, e)}
                        className="p-1 hover:text-red-500 hover:bg-red-50 text-edit-muted transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {filteredProposals.length === 0 && (
                <div className="col-span-full py-12 text-center border border-dashed border-edit-border bg-edit-card font-mono text-xs text-edit-muted">
                  No outreach proposals matched your filters.
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
