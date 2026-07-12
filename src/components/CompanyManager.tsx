import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  SlidersHorizontal, 
  Trash2, 
  Edit, 
  Archive, 
  RotateCcw,
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Upload, 
  X,
  FileText,
  BadgeAlert,
  Building2,
  LineChart,
  BrainCircuit,
  CornerDownRight,
  ClipboardCheck,
  CheckCircle,
  AlertTriangle,
  Loader2,
  ListFilter
} from 'lucide-react';
import { Company, CompanyAnalysis, User } from '../types';

interface CompanyManagerProps {
  companies: Company[];
  loading: boolean;
  user: User | null;
  onAddCompany: (company: any) => Promise<any>;
  onUpdateCompany: (id: string, updates: any) => Promise<any>;
  onDeleteCompany: (id: string) => Promise<boolean>;
  onTriggerAnalysis: (id: string) => Promise<Company>;
  onGenerateProposal: (id: string, services: string[]) => Promise<string>;
  addToast: (title: string, content: string, type: 'success' | 'warning' | 'error' | 'info') => void;
}

export default function CompanyManager({ 
  companies, 
  loading, 
  user, 
  onAddCompany, 
  onUpdateCompany, 
  onDeleteCompany, 
  onTriggerAnalysis,
  onGenerateProposal,
  addToast 
}: CompanyManagerProps) {
  // Navigation & States
  const [activeTab, setActiveTab] = useState<'Active' | 'Archived'>('Active');
  const [search, setSearch] = useState('');
  const [industryFilter, setIndustryFilter] = useState('All');
  const [sizeFilter, setSizeFilter] = useState('All');
  const [growthFilter, setGrowthFilter] = useState('All');
  const [hiringFilter, setHiringFilter] = useState('All');
  const [leadFilter, setLeadFilter] = useState('All');

  // Modal / Drawer States
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  
  // Proposal States
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [proposalCompany, setProposalCompany] = useState<Company | null>(null);
  const [proposalServices, setProposalServices] = useState<string[]>(['Executive Search', 'Technical Screen Vetting']);
  const [proposalText, setProposalText] = useState('');
  const [generatingProposal, setGeneratingProposal] = useState(false);
  
  // CSV Import States
  const [showImportModal, setShowImportModal] = useState(false);
  const [csvPasteData, setCsvPasteData] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const limit = 6;

  // New Company Form State
  const [formName, setFormName] = useState('');
  const [formIndustry, setFormIndustry] = useState('Software & Cloud Services');
  const [formBusinessType, setFormBusinessType] = useState('B2B SaaS');
  const [formEmployeeCount, setFormEmployeeCount] = useState(150);
  const [formLocation, setFormLocation] = useState('Chennai, Tamil Nadu');
  const [formWebsite, setFormWebsite] = useState('');
  const [formLinkedin, setFormLinkedin] = useState('');
  const [formTechStack, setFormTechStack] = useState('React, Node.js, PostgreSQL');
  const [formHiringStatus, setFormHiringStatus] = useState<'Active' | 'Passive' | 'Closed' | 'Draft'>('Active');
  const [formHiringVolume, setFormHiringVolume] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [formDepartments, setFormDepartments] = useState('Engineering, Product');
  const [formPreferredProfile, setFormPreferredProfile] = useState('Senior Full Stack Developer');
  const [formRecruitmentDiff, setFormRecruitmentDiff] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [formGrowthRate, setFormGrowthRate] = useState<'High' | 'Stable' | 'Declining'>('Stable');

  const industriesList = Array.from(new Set(companies.map(c => c.industry)));
  const canModify = user?.role === 'Admin' || user?.role === 'Recruiter';

  // Open Edit Form
  const openEdit = (company: Company, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCompany(company);
    setFormName(company.name);
    setFormIndustry(company.industry);
    setFormBusinessType(company.businessType);
    setFormEmployeeCount(company.employeeCount);
    setFormLocation(company.location);
    setFormWebsite(company.website);
    setFormLinkedin(company.linkedin);
    setFormTechStack(company.techStack.join(', '));
    setFormHiringStatus(company.currentHiringStatus);
    setFormHiringVolume(company.hiringVolume);
    setFormDepartments(company.departmentsHiring.join(', '));
    setFormPreferredProfile(company.preferredCandidateProfile);
    setFormRecruitmentDiff(company.recruitmentDifficulty);
    setFormGrowthRate(company.companyGrowthRate);
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingCompany(null);
    clearForm();
  };

  const clearForm = () => {
    setFormName('');
    setFormIndustry('Software & Cloud Services');
    setFormBusinessType('B2B SaaS');
    setFormEmployeeCount(150);
    setFormLocation('Chennai, Tamil Nadu');
    setFormWebsite('');
    setFormLinkedin('');
    setFormTechStack('React, Node.js, PostgreSQL');
    setFormHiringStatus('Active');
    setFormHiringVolume('Medium');
    setFormDepartments('Engineering, Product');
    setFormPreferredProfile('Senior Full Stack Developer');
    setFormRecruitmentDiff('Medium');
    setFormGrowthRate('Stable');
  };

  // Submit Add / Edit Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName) {
      addToast('Validation Error', 'Company name is required', 'error');
      return;
    }

    const payload = {
      name: formName,
      industry: formIndustry,
      businessType: formBusinessType,
      employeeCount: Number(formEmployeeCount),
      location: formLocation,
      website: formWebsite,
      linkedin: formLinkedin,
      techStack: formTechStack.split(',').map(s => s.trim()).filter(Boolean),
      currentHiringStatus: formHiringStatus,
      hiringVolume: formHiringVolume,
      departmentsHiring: formDepartments.split(',').map(s => s.trim()).filter(Boolean),
      preferredCandidateProfile: formPreferredProfile,
      campusHiring: true,
      lateralHiring: true,
      recruitmentDifficulty: formRecruitmentDiff,
      companyGrowthRate: formGrowthRate
    };

    try {
      if (editingCompany) {
        await onUpdateCompany(editingCompany.id, payload);
        addToast('Company Updated', `'${formName}' details saved successfully`, 'success');
      } else {
        await onAddCompany(payload);
        addToast('Company Registered', `'${formName}' has been added to our active registry`, 'success');
      }
      handleCloseModal();
    } catch (err: any) {
      addToast('Operation Failed', err.message, 'error');
    }
  };

  // Archive / Restore Company
  const handleArchiveToggle = async (company: Company, e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus = company.status === 'Active' ? 'Archived' : 'Active';
    try {
      await onUpdateCompany(company.id, { status: newStatus });
      addToast(
        newStatus === 'Archived' ? 'Company Archived' : 'Company Restored',
        `'${company.name}' moved successfully`,
        'success'
      );
      if (selectedCompany?.id === company.id) {
        setSelectedCompany(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (err: any) {
      addToast('Action Failed', err.message, 'error');
    }
  };

  // Delete Company
  const handleDelete = async (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Are you absolutely sure you want to permanently delete company '${name}'?`)) {
      try {
        await onDeleteCompany(id);
        addToast('Record Erased', `'${name}' has been deleted from our database`, 'success');
        if (selectedCompany?.id === id) setSelectedCompany(null);
      } catch (err: any) {
        addToast('Deletion Failed', err.message, 'error');
      }
    }
  };

  // Trigger Gemini AI Deep Vetting Analysis & Lead Scoring
  const handleTriggerAnalysis = async (id: string, name: string) => {
    setAnalyzingId(id);
    addToast('Analyzing Profile', `Sourcing Gemini AI intelligence for ${name}...`, 'info');
    try {
      const updated = await onTriggerAnalysis(id);
      addToast('Vetting Completed', `Lead scoring & hiring patterns mapped for ${name}`, 'success');
      setSelectedCompany(updated);
    } catch (err: any) {
      addToast('Vetting Failed', err.message, 'error');
    } finally {
      setAnalyzingId(null);
    }
  };

  // Launch Proposal Builder
  const handleOpenProposalBuilder = (company: Company, e: React.MouseEvent) => {
    e.stopPropagation();
    setProposalCompany(company);
    setProposalText('');
    setProposalServices(['Executive Search', 'Technical Screen Vetting']);
    setShowProposalModal(true);
  };

  const handleGenerateProposal = async () => {
    if (!proposalCompany) return;
    setGeneratingProposal(true);
    addToast('Generating Proposal', `Drafting enterprise solicitation contract...`, 'info');
    try {
      const markdown = await onGenerateProposal(proposalCompany.id, proposalServices);
      setProposalText(markdown);
      addToast('Draft Delivered', 'Dynamic client proposal generated successfully', 'success');
    } catch (err: any) {
      addToast('Draft Failed', err.message, 'error');
    } finally {
      setGeneratingProposal(false);
    }
  };

  // Export Companies to CSV
  const handleExportCSV = () => {
    const list = companies.filter(c => c.status === activeTab);
    if (list.length === 0) return;
    
    const headers = ['Name', 'Industry', 'BusinessType', 'EmployeeCount', 'Location', 'Website', 'HiringStatus', 'HiringVolume', 'LeadScore', 'LeadCategory'];
    const rows = list.map(c => [
      `"${c.name.replace(/"/g, '""')}"`,
      `"${c.industry}"`,
      `"${c.businessType}"`,
      c.employeeCount,
      `"${c.location}"`,
      `"${c.website}"`,
      `"${c.currentHiringStatus}"`,
      `"${c.hiringVolume}"`,
      c.leadScore || '',
      c.leadCategory || ''
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `recruitment_companies_${activeTab.toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('CSV Exported', 'Downloaded complete client registry snapshot', 'success');
  };

  // Handle CSV Bulk Paste Import
  const handleImportCSV = async () => {
    if (!csvPasteData.trim()) {
      addToast('Input Required', 'Please paste CSV rows', 'warning');
      return;
    }

    try {
      const lines = csvPasteData.split('\n').map(l => l.trim()).filter(Boolean);
      let count = 0;
      
      for (const line of lines) {
        // Simple CSV cell splitted (skipping headers check)
        if (line.toLowerCase().includes('industry') && line.toLowerCase().includes('name')) continue;
        const parts = line.split(',').map(p => p.trim().replace(/^"|"$/g, ''));
        if (parts.length >= 2) {
          await onAddCompany({
            name: parts[0],
            industry: parts[1] || 'Software & Cloud Services',
            businessType: parts[2] || 'Corporate',
            employeeCount: Number(parts[3]) || 200,
            location: parts[4] || 'Chennai, Tamil Nadu',
            website: parts[5] || '',
            linkedin: '',
            techStack: ['React', 'Node.js'],
            currentHiringStatus: 'Active',
            hiringVolume: 'Medium',
            departmentsHiring: ['Engineering'],
            preferredCandidateProfile: 'Technical Specialist',
            campusHiring: true,
            lateralHiring: true,
            recruitmentDifficulty: 'Medium',
            companyGrowthRate: 'Stable'
          });
          count++;
        }
      }
      
      addToast('Import Completed', `Successfully parsed and created ${count} corporate accounts`, 'success');
      setCsvPasteData('');
      setShowImportModal(false);
    } catch (err: any) {
      addToast('Parsing Error', 'Make sure CSV rows follow: Name, Industry, BusinessType, EmployeeCount, Location, Website', 'error');
    }
  };

  // Filter, Search, Pagination computation
  const filtered = companies
    .filter(c => c.status === activeTab)
    .filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.location.toLowerCase().includes(search.toLowerCase());
      const matchesIndustry = industryFilter === 'All' || c.industry === industryFilter;
      const matchesSize = sizeFilter === 'All' 
        || (sizeFilter === 'Small' && c.employeeCount < 200)
        || (sizeFilter === 'Medium' && c.employeeCount >= 200 && c.employeeCount <= 1000)
        || (sizeFilter === 'Large' && c.employeeCount > 1000);
      const matchesGrowth = growthFilter === 'All' || c.companyGrowthRate === growthFilter;
      const matchesHiring = hiringFilter === 'All' || c.currentHiringStatus === hiringFilter;
      const matchesLead = leadFilter === 'All' || c.leadCategory === leadFilter;

      return matchesSearch && matchesIndustry && matchesSize && matchesGrowth && matchesHiring && matchesLead;
    });

  const paginated = filtered.slice((page - 1) * limit, page * limit);
  const totalPages = Math.ceil(filtered.length / limit) || 1;

  useEffect(() => {
    setPage(1);
  }, [search, industryFilter, sizeFilter, growthFilter, hiringFilter, leadFilter, activeTab]);

  return (
    <div className="p-6 space-y-6">
      {/* Title & Top Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 font-sans">
            Corporate Client Directory
          </h1>
          <p className="text-xs text-slate-500">
            Audit and score client companies, configure targeted talent acquisitions, and launch executive proposals.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-all duration-150"
          >
            <Upload size={14} />
            <span>Import</span>
          </button>
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-all duration-150"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
          {canModify && (
            <button 
              onClick={() => { clearForm(); setShowAddModal(true); }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/10 transition-colors"
            >
              <Plus size={14} />
              <span>Add Company</span>
            </button>
          )}
        </div>
      </div>

      {/* Directory Tab Filters */}
      <div className="flex border-b border-slate-100 dark:border-slate-800">
        <button 
          onClick={() => setActiveTab('Active')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'Active' 
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Active Accounts ({companies.filter(c => c.status === 'Active').length})
        </button>
        <button 
          onClick={() => setActiveTab('Archived')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'Archived' 
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' 
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Archived Holdings ({companies.filter(c => c.status === 'Archived').length})
        </button>
      </div>

      {/* Grid of Search, Filters, List, Details Sidebar */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Side: Search, Filter Form and Cards list */}
        <div className="xl:col-span-2 space-y-4">
          
          {/* Advanced Filtering Bento Box */}
          <div className="p-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl space-y-3 shadow-sm">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search client name or location..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder-slate-400"
                />
              </div>
              <div className="flex items-center gap-2">
                <ListFilter size={16} className="text-slate-400" />
                <span className="text-xs font-semibold text-slate-400">Filters:</span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-2 border-t border-slate-50 dark:border-slate-900">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Sector</label>
                <select 
                  value={industryFilter} 
                  onChange={(e) => setIndustryFilter(e.target.value)}
                  className="mt-1 w-full p-1.5 text-[11px] bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded text-slate-600 dark:text-slate-300"
                >
                  <option value="All">All Sectors</option>
                  {industriesList.map(ind => <option key={ind} value={ind}>{ind}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Size</label>
                <select 
                  value={sizeFilter} 
                  onChange={(e) => setSizeFilter(e.target.value)}
                  className="mt-1 w-full p-1.5 text-[11px] bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded text-slate-600 dark:text-slate-300"
                >
                  <option value="All">All Sizes</option>
                  <option value="Small">Small (&lt; 200)</option>
                  <option value="Medium">Medium (200 - 1k)</option>
                  <option value="Large">Large (&gt; 1k)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Hiring</label>
                <select 
                  value={hiringFilter} 
                  onChange={(e) => setHiringFilter(e.target.value)}
                  className="mt-1 w-full p-1.5 text-[11px] bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded text-slate-600 dark:text-slate-300"
                >
                  <option value="All">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Passive">Passive</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Lead Potential</label>
                <select 
                  value={leadFilter} 
                  onChange={(e) => setLeadFilter(e.target.value)}
                  className="mt-1 w-full p-1.5 text-[11px] bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded text-slate-600 dark:text-slate-300"
                >
                  <option value="All">All Potentials</option>
                  <option value="Hot">Hot</option>
                  <option value="Warm">Warm</option>
                  <option value="Cold">Cold</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Growth</label>
                <select 
                  value={growthFilter} 
                  onChange={(e) => setGrowthFilter(e.target.value)}
                  className="mt-1 w-full p-1.5 text-[11px] bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded text-slate-600 dark:text-slate-300"
                >
                  <option value="All">All Rates</option>
                  <option value="High">High Growth</option>
                  <option value="Stable">Stable</option>
                  <option value="Declining">Declining</option>
                </select>
              </div>
            </div>
          </div>

          {/* Cards Grid List */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(n => (
                <div key={n} className="h-44 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl animate-pulse"></div>
              ))}
            </div>
          ) : paginated.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl">
              <Building2 className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-700" />
              <h3 className="mt-2 text-sm font-bold text-slate-900 dark:text-slate-100">No corporate accounts found</h3>
              <p className="mt-1 text-xs text-slate-400">Try adjusting your filters, searching differently or register a new company profile.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paginated.map((company) => {
                const isSelected = selectedCompany?.id === company.id;
                return (
                  <motion.div
                    key={company.id}
                    layoutId={`company-card-${company.id}`}
                    onClick={() => setSelectedCompany(company)}
                    className={`p-5 rounded-2xl border cursor-pointer flex flex-col justify-between transition-all duration-200 ${
                      isSelected 
                        ? 'bg-indigo-50/20 dark:bg-indigo-950/20 border-indigo-500 dark:border-indigo-800 shadow-md ring-1 ring-indigo-500' 
                        : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-850 hover:shadow-md'
                    }`}
                  >
                    <div>
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="overflow-hidden">
                          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 font-sans tracking-tight truncate">
                            {company.name}
                          </h3>
                          <p className="text-[10px] text-slate-400 truncate">{company.location}</p>
                        </div>
                        {company.leadCategory && (
                          <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full border ${
                            company.leadCategory === 'Hot' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                            company.leadCategory === 'Warm' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                            'bg-slate-500/10 text-slate-400 border-slate-500/20'
                          }`}>
                            {company.leadCategory} ({company.leadScore}%)
                          </span>
                        )}
                      </div>

                      {/* Card Tags */}
                      <div className="mt-3 flex flex-wrap gap-1">
                        <span className="px-1.5 py-0.5 text-[9px] font-medium bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 rounded">
                          {company.industry}
                        </span>
                        <span className="px-1.5 py-0.5 text-[9px] font-medium bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 rounded">
                          {company.employeeCount} Staff
                        </span>
                      </div>

                      {/* Tech Stack bullet */}
                      <div className="mt-3 text-[10px] font-mono text-slate-400 dark:text-slate-500 truncate">
                        Stack: {company.techStack.slice(0, 3).join(', ')} {company.techStack.length > 3 && '...'}
                      </div>
                    </div>

                    {/* Card Actions Footer */}
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-850 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          company.currentHiringStatus === 'Active' ? 'bg-emerald-500' :
                          company.currentHiringStatus === 'Passive' ? 'bg-amber-500' : 'bg-slate-400'
                        }`}></span>
                        <span className="text-[10px] font-semibold text-slate-500">{company.currentHiringStatus} Hiring</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => handleOpenProposalBuilder(company, e)}
                          className="p-1 text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/10 rounded transition-colors"
                          title="Generate Recruitment Proposal"
                        >
                          <FileText size={14} />
                        </button>
                        {canModify && (
                          <>
                            <button
                              onClick={(e) => openEdit(company, e)}
                              className="p-1 text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/10 rounded transition-colors"
                              title="Edit Profile"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={(e) => handleArchiveToggle(company, e)}
                              className="p-1 text-slate-400 hover:text-amber-500 hover:bg-amber-500/10 rounded transition-colors"
                              title={company.status === 'Active' ? 'Archive Company' : 'Restore Company'}
                            >
                              {company.status === 'Active' ? <Archive size={14} /> : <RotateCcw size={14} />}
                            </button>
                          </>
                        )}
                        {user?.role === 'Admin' && (
                          <button
                            onClick={(e) => handleDelete(company.id, company.name, e)}
                            className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
                            title="Delete Company"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Pagination Toolbar */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-400">Showing page {page} of {totalPages} ({filtered.length} entries)</span>
              <div className="flex items-center gap-1">
                <button 
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(p - 1, 1))}
                  className="p-1.5 rounded bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-slate-500 disabled:opacity-40"
                >
                  <ChevronLeft size={14} />
                </button>
                <button 
                  disabled={page === totalPages}
                  onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                  className="p-1.5 rounded bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-slate-500 disabled:opacity-40"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Right Side: Gemini AI Corporate Intelligence Sidebar drawer */}
        <div className="p-5 bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl shadow-sm space-y-4 h-fit sticky top-6">
          {selectedCompany ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">{selectedCompany.name}</h3>
                  <p className="text-[11px] text-slate-400">{selectedCompany.industry} • {selectedCompany.location}</p>
                </div>
                <button 
                  onClick={() => setSelectedCompany(null)}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-slate-100"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Lead Scoring Prediction Vitals */}
              {selectedCompany.leadScore !== undefined ? (
                <div className="p-4 rounded-xl bg-slate-950 text-slate-100 space-y-3 shadow-inner">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest font-mono">Conversion Score</span>
                    <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full ${
                      selectedCompany.leadCategory === 'Hot' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {selectedCompany.leadCategory} Category
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold font-sans text-white tracking-tight">{selectedCompany.leadScore}%</span>
                    <span className="text-xs text-slate-400">Match Probability</span>
                  </div>
                  {/* Progress Meter bar */}
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-indigo-500 to-violet-500 h-full rounded-full" style={{ width: `${selectedCompany.leadScore}%` }}></div>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                    Predicted with <span className="font-bold text-slate-200">{selectedCompany.confidence}% AI confidence</span> based on sizing profiles, active Chennai technical hiring, and digital integrations.
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/20 text-center space-y-3">
                  <BadgeAlert className="mx-auto text-indigo-500" size={24} />
                  <div>
                    <h4 className="text-xs font-bold text-slate-950 dark:text-slate-100">AI Vetting Needed</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Generate corporate hiring budget estimates, digital maturity analyses and outbound lead forecasting.</p>
                  </div>
                  {canModify && (
                    <button
                      onClick={() => handleTriggerAnalysis(selectedCompany.id, selectedCompany.name)}
                      disabled={analyzingId !== null}
                      className="w-full py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-md flex items-center justify-center gap-1.5 transition-colors"
                    >
                      {analyzingId ? (
                        <>
                          <Loader2 size={12} className="animate-spin" />
                          <span>AI Mapping...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={12} />
                          <span>AI Vetting & Predict Lead</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}

              {/* Mapped Deep Analysis */}
              {selectedCompany.analysis ? (
                <div className="space-y-4 max-h-[380px] overflow-y-auto custom-scrollbar pr-1">
                  
                  <div className="space-y-1.5">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Estimated Hiring Budget</h4>
                    <p className="text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 font-semibold font-sans">
                      {selectedCompany.analysis.estimatedHiringBudget}
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Company Executive Summary</h4>
                    <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                      {selectedCompany.analysis.summary}
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Outreach & Engagement Pitch</h4>
                    <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400 bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-lg text-emerald-700 dark:text-emerald-400 font-sans">
                      {selectedCompany.analysis.bestOutreachStrategy}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <div className="p-2.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg">
                      <span className="block text-[9px] font-bold text-slate-400 uppercase">Growth Potential</span>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{selectedCompany.companyGrowthRate}</span>
                    </div>
                    <div className="p-2.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg">
                      <span className="block text-[9px] font-bold text-slate-400 uppercase">Risk Evaluation</span>
                      <span className={`text-xs font-semibold ${selectedCompany.analysis.riskLevel === 'High' ? 'text-red-500' : 'text-emerald-500'}`}>
                        {selectedCompany.analysis.riskLevel} Risk
                      </span>
                    </div>
                  </div>

                </div>
              ) : selectedCompany.leadScore !== undefined ? (
                <div className="p-4 text-center text-slate-400 text-xs">Vetting completed with no full analysis. Click analyze again if required.</div>
              ) : null}

              {/* Tech Stack bullet tags */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <span className="block text-[10px] font-bold text-slate-400 uppercase">Registered Tech Stack</span>
                <div className="flex flex-wrap gap-1">
                  {selectedCompany.techStack.map(tech => (
                    <span key={tech} className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 rounded">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div className="py-20 text-center text-slate-400 space-y-2">
              <BrainCircuit className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-700 animate-pulse" />
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 font-sans">Client Analysis Board</h4>
              <p className="text-[11px] px-4">Select a company card from the directory to review their AI scoring intelligence, targeted outreach plans, and generate client recruitment proposals.</p>
            </div>
          )}
        </div>

      </div>

      {/* ==========================================
          MODAL: ADD & EDIT COMPANY FORM
          ========================================== */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-slate-950/60 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl p-6 w-full max-w-2xl shadow-xl flex flex-col justify-between"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-lg font-bold text-slate-950 dark:text-slate-50 font-sans flex items-center gap-2">
                  <Building2 className="text-indigo-600" size={20} />
                  <span>{editingCompany ? 'Edit Corporate Profile' : 'Register Corporate Client'}</span>
                </h3>
                <button 
                  onClick={handleCloseModal}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase">Company Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Acme Industries Ltd"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full p-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase">Industry Sector</label>
                    <input
                      type="text"
                      placeholder="e.g. Healthcare & Biotechnology"
                      value={formIndustry}
                      onChange={(e) => setFormIndustry(e.target.value)}
                      className="w-full p-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase">Business Category</label>
                    <input
                      type="text"
                      placeholder="e.g. B2B Enterprise SaaS"
                      value={formBusinessType}
                      onChange={(e) => setFormBusinessType(e.target.value)}
                      className="w-full p-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase">Employee Scale count</label>
                    <input
                      type="number"
                      placeholder="e.g. 250"
                      value={formEmployeeCount}
                      onChange={(e) => setFormEmployeeCount(Number(e.target.value))}
                      className="w-full p-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase">Corporate Headquarter Location</label>
                    <input
                      type="text"
                      placeholder="e.g. Bangalore, Karnataka"
                      value={formLocation}
                      onChange={(e) => setFormLocation(e.target.value)}
                      className="w-full p-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase">Website URL</label>
                    <input
                      type="url"
                      placeholder="e.g. https://acme.io"
                      value={formWebsite}
                      onChange={(e) => setFormWebsite(e.target.value)}
                      className="w-full p-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Technology Stack (Comma separated)</label>
                  <input
                    type="text"
                    placeholder="React, Node.js, AWS, PostgreSQL"
                    value={formTechStack}
                    onChange={(e) => setFormTechStack(e.target.value)}
                    className="w-full p-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase">Hiring Volume</label>
                    <select
                      value={formHiringVolume}
                      onChange={(e) => setFormHiringVolume(e.target.value as any)}
                      className="w-full p-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100"
                    >
                      <option value="High">High Influx</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase">Recruitment Difficulty</label>
                    <select
                      value={formRecruitmentDiff}
                      onChange={(e) => setFormRecruitmentDiff(e.target.value as any)}
                      className="w-full p-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100"
                    >
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase">Market Growth Rate</label>
                    <select
                      value={formGrowthRate}
                      onChange={(e) => setFormGrowthRate(e.target.value as any)}
                      className="w-full p-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100"
                    >
                      <option value="High">High Growth</option>
                      <option value="Stable">Stable</option>
                      <option value="Declining">Declining</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Target Candidate Sourcing Profile</label>
                  <input
                    type="text"
                    placeholder="e.g. Senior Backend Engineer with Kubernetes expertise Sourcing focus"
                    value={formPreferredProfile}
                    onChange={(e) => setFormPreferredProfile(e.target.value)}
                    className="w-full p-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                  <button 
                    type="button" 
                    onClick={handleCloseModal}
                    className="px-4 py-2 text-xs font-bold rounded-lg border border-slate-250 dark:border-slate-800 hover:bg-slate-50 text-slate-500"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-5 py-2 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/10"
                  >
                    Save Client Details
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==========================================
          MODAL: CSV BASTE BULK IMPORTER
          ========================================== */}
      <AnimatePresence>
        {showImportModal && (
          <div className="fixed inset-0 bg-slate-950/60 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl p-6 w-full max-w-lg shadow-xl"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 font-sans">
                  <Upload size={16} />
                  <span>Bulk Company Account Import</span>
                </h3>
                <button onClick={() => setShowImportModal(false)} className="p-1 text-slate-400 hover:text-white"><X size={16} /></button>
              </div>
              <div className="space-y-3 pt-4">
                <p className="text-xs text-slate-400">Paste CSV formatted values below. Include headers or paste rows matching: <br /><strong>Name, Industry, BusinessType, EmployeeCount, Location, Website</strong></p>
                <textarea
                  placeholder={`ChennaiTech, Software, SaaS, 350, Chennai, https://chennaitech.io\nHyderabad Systems, Fintech, Cloud, 1500, Hyderabad, https://hydsystems.com`}
                  rows={6}
                  value={csvPasteData}
                  onChange={(e) => setCsvPasteData(e.target.value)}
                  className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                ></textarea>
                <div className="flex justify-end gap-2 pt-2">
                  <button onClick={() => setShowImportModal(false)} className="px-3.5 py-1.5 text-xs bg-slate-100 dark:bg-slate-900 rounded-lg text-slate-400">Cancel</button>
                  <button onClick={handleImportCSV} className="px-4 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg">Parse & Import Accounts</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==========================================
          MODAL: AI PROPOSAL BUILDER ARCHITECT
          ========================================== */}
      <AnimatePresence>
        {showProposalModal && (
          <div className="fixed inset-0 bg-slate-950/60 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl p-6 w-full max-w-3xl shadow-2xl flex flex-col max-h-[85vh]"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <BrainCircuit className="text-indigo-600" size={20} />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-sans">
                      Executive Proposal Architect
                    </h3>
                    <p className="text-[10px] text-slate-400">SaaS Dynamic solicitation draft generator for {proposalCompany?.name}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowProposalModal(false)}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 overflow-y-auto custom-scrollbar flex-1">
                {/* Services Configurations Column */}
                <div className="space-y-4">
                  <div>
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Proposal Services</span>
                    <div className="space-y-2">
                      {['Executive Search', 'Technical Screen Vetting', 'ATS Compatibility Proofing', 'Active Sourcing Drives'].map(serv => {
                        const hasService = proposalServices.includes(serv);
                        return (
                          <label key={serv} className="flex items-center gap-2 p-2 rounded bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-100">
                            <input
                              type="checkbox"
                              checked={hasService}
                              onChange={() => {
                                if (hasService) {
                                  setProposalServices(prev => prev.filter(p => p !== serv));
                                } else {
                                  setProposalServices(prev => [...prev, serv]);
                                }
                              }}
                              className="accent-indigo-600"
                            />
                            <span>{serv}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    onClick={handleGenerateProposal}
                    disabled={generatingProposal || proposalServices.length === 0}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs shadow-md shadow-indigo-600/10 flex items-center justify-center gap-1.5 transition-colors disabled:opacity-45"
                  >
                    {generatingProposal ? (
                      <>
                        <Loader2 size={12} className="animate-spin" />
                        <span>AI Drafting...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={12} />
                        <span>Draft Executive Proposal</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Draft Output Proposal Text Column */}
                <div className="md:col-span-2 p-4 bg-slate-950 text-slate-200 border border-slate-800 rounded-xl font-mono text-xs overflow-y-auto max-h-[400px] custom-scrollbar relative flex flex-col justify-between">
                  {proposalText ? (
                    <div className="space-y-4">
                      <div className="absolute right-3 top-3 flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(proposalText);
                            addToast('Copied to Clipboard', 'Sourcing contract draft copy successfully', 'success');
                          }}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded transition-colors"
                          title="Copy Contract"
                        >
                          <ClipboardCheck size={14} />
                        </button>
                      </div>
                      <pre className="whitespace-pre-wrap leading-relaxed font-sans pr-4">{proposalText}</pre>
                    </div>
                  ) : (
                    <div className="py-24 text-center text-slate-500 flex flex-col items-center justify-center space-y-3">
                      <FileText size={32} className="animate-bounce text-slate-700" />
                      <p className="px-12 font-sans text-[11px] leading-relaxed">Select specialized services on the left and click **Draft Executive Proposal** to generate premium, fully personalized executive solicitation terms.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2 shrink-0">
                <button onClick={() => setShowProposalModal(false)} className="px-4 py-1.5 text-xs bg-slate-100 dark:bg-slate-900 rounded-lg text-slate-400">Close</button>
                {proposalText && (
                  <button 
                    onClick={() => {
                      const printWindow = window.open('', '_blank');
                      if (printWindow) {
                        printWindow.document.write(`<html><head><title>Recruitment Proposal</title></head><body style="font-family:sans-serif;padding:40px;line-height:1.6;"><pre style="white-space:pre-wrap;font-family:sans-serif;">${proposalText}</pre></body></html>`);
                        printWindow.document.close();
                        printWindow.print();
                      }
                    }} 
                    className="px-4 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-md"
                  >
                    Print Contract
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
