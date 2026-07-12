import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CalendarRange, 
  Plus, 
  Search, 
  SlidersHorizontal, 
  Trash2, 
  Edit, 
  Sparkles, 
  Mail, 
  Linkedin, 
  Clock, 
  AlertCircle, 
  CheckCircle, 
  Copy, 
  X,
  Target,
  ArrowRight,
  TrendingUp,
  FileCheck2,
  ListFilter,
  Loader2
} from 'lucide-react';
import { Campaign, Company, User } from '../types';

interface CampaignPlannerProps {
  campaigns: Campaign[];
  companies: Company[];
  loading: boolean;
  user: User | null;
  onAddCampaign: (campaign: any) => Promise<any>;
  onUpdateCampaign: (id: string, updates: any) => Promise<any>;
  onDeleteCampaign: (id: string) => Promise<boolean>;
  addToast: (title: string, content: string, type: 'success' | 'warning' | 'error' | 'info') => void;
}

export default function CampaignPlanner({
  campaigns,
  companies,
  loading,
  user,
  onAddCampaign,
  onUpdateCampaign,
  onDeleteCampaign,
  addToast
}: CampaignPlannerProps) {
  // Modal & Edit state
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('');
  
  // Campaign Form State
  const [name, setName] = useState('');
  const [targetIndustry, setTargetIndustry] = useState('Software & Cloud Services');
  const [campaignObjective, setCampaignObjective] = useState('Acquiring Senior Software & DevOps recruitment partnerships across South India.');
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [schedule, setSchedule] = useState(new Date().toISOString().split('T')[0]);
  const [planningInProgress, setPlanningInProgress] = useState(false);

  const canModify = user?.role === 'Admin' || user?.role === 'Recruiter';
  const selectedCampaign = campaigns.find(c => c.id === selectedCampaignId) || campaigns[0];

  // Set initial selected campaign
  if (campaigns.length > 0 && !selectedCampaignId) {
    setSelectedCampaignId(campaigns[0].id);
  }

  // Handle Form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !campaignObjective) {
      addToast('Validation Error', 'Campaign name and objective are required', 'error');
      return;
    }

    setPlanningInProgress(true);
    addToast('Generating Campaign', 'Enabling Gemini AI Multi-Channel outreach planner...', 'info');

    try {
      await onAddCampaign({
        name,
        targetIndustry,
        targetCompanies: selectedCompanies,
        priority,
        campaignObjective,
        schedule: new Date(schedule).toISOString(),
        status: 'Planned'
      });
      
      addToast('Campaign Planned', `'${name}' multi-channel strategies generated`, 'success');
      setShowAddModal(false);
      clearForm();
    } catch (err: any) {
      addToast('Planning Failed', err.message, 'error');
    } finally {
      setPlanningInProgress(false);
    }
  };

  const clearForm = () => {
    setName('');
    setTargetIndustry('Software & Cloud Services');
    setCampaignObjective('Acquiring Senior Software & DevOps recruitment partnerships across South India.');
    setPriority('Medium');
    setSelectedCompanies([]);
    setSchedule(new Date().toISOString().split('T')[0]);
  };

  // Toggle company selection for target lists
  const toggleCompanySelection = (compName: string) => {
    setSelectedCompanies(prev => 
      prev.includes(compName) ? prev.filter(c => c !== compName) : [...prev, compName]
    );
  };

  // Delete Campaign
  const handleDelete = async (id: string, campName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Cancel campaign and wipe out AI Prospecting timelines for ${campName}?`)) {
      try {
        await onDeleteCampaign(id);
        addToast('Campaign Revoked', `${campName} has been purged`, 'success');
        if (selectedCampaignId === id) {
          setSelectedCampaignId(campaigns[0]?.id || '');
        }
      } catch (err: any) {
        addToast('Deletion Failed', err.message, 'error');
      }
    }
  };

  return (
    <div className="p-6 space-y-6">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 font-sans">
            AI Outreach Campaigns Planner
          </h1>
          <p className="text-xs text-slate-500">
            Design targeted corporate acquisition campaigns, generate dynamic cold prospecting templates, and map execution timelines.
          </p>
        </div>
        {canModify && (
          <button 
            onClick={() => { clearForm(); setShowAddModal(true); }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/10 transition-all cursor-pointer"
          >
            <Plus size={14} />
            <span>Launch Outreach Campaign</span>
          </button>
        )}
      </div>

      {/* Grid of Planned Campaigns and AI multi-channel Output */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Column: List of existing campaigns */}
        <div className="space-y-4">
          <div className="p-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">Outreach Pipeline</h3>
            <div className="space-y-3 max-h-[450px] overflow-y-auto custom-scrollbar">
              {campaigns.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">No active campaigns. Click launch to register.</div>
              ) : (
                campaigns.map(camp => {
                  const isSelected = selectedCampaignId === camp.id;
                  return (
                    <div
                      key={camp.id}
                      onClick={() => setSelectedCampaignId(camp.id)}
                      className={`p-4 rounded-xl border cursor-pointer flex flex-col justify-between transition-all ${
                        isSelected 
                          ? 'bg-indigo-50/20 dark:bg-indigo-950/20 border-indigo-500 dark:border-indigo-900 shadow-sm' 
                          : 'bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-850 hover:bg-slate-100/50'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-bold text-xs text-slate-800 dark:text-slate-100 line-clamp-1">{camp.name}</h4>
                          <span className={`px-1.5 py-0.5 text-[8px] font-bold rounded-full ${
                            camp.priority === 'High' ? 'bg-red-500/10 text-red-500' :
                            camp.priority === 'Medium' ? 'bg-amber-500/10 text-amber-500' :
                            'bg-slate-500/10 text-slate-400'
                          }`}>
                            {camp.priority}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">Sector: {camp.targetIndustry}</p>
                        <p className="text-[10px] text-slate-500 font-medium font-sans mt-2 line-clamp-2">"{camp.campaignObjective}"</p>
                      </div>

                      <div className="mt-4 pt-2 border-t border-slate-200/50 dark:border-slate-850 flex items-center justify-between">
                        <span className="text-[9px] font-semibold text-indigo-500 font-mono">Targets: {camp.targetCompanies.length} firms</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-mono text-slate-400">
                            {new Date(camp.schedule).toLocaleDateString([], { month: 'short', day: '2-digit' })}
                          </span>
                          {canModify && (
                            <button
                              onClick={(e) => handleDelete(camp.id, camp.name, e)}
                              className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors"
                              title="purged campaign"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: AI Multi-channel Strategy panel */}
        <div className="xl:col-span-2 space-y-6">
          {selectedCampaign ? (
            <div className="p-6 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl shadow-sm space-y-6">
              
              {/* Strategy Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-850">
                <div>
                  <h3 className="font-extrabold font-sans text-base text-slate-900 dark:text-white tracking-tight">AI Multi-Channel Outreach Plan</h3>
                  <p className="text-xs text-slate-400">Target Industry: {selectedCampaign.targetIndustry}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 text-[9px] font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded">
                    Planned Date: {new Date(selectedCampaign.schedule).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Prospecting Timeline Sequence */}
              {selectedCampaign.aiStrategy?.pipelineTimeline && (
                <div className="space-y-4">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Execution Milestones Pipeline</span>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[
                      { title: 'Prospecting Mapping', desc: selectedCampaign.aiStrategy.pipelineTimeline.mappingPhase, step: '1' },
                      { title: 'Outbound Ingress', desc: selectedCampaign.aiStrategy.pipelineTimeline.outreachPhase, step: '2' },
                      { title: 'Dossier Evaluator', desc: selectedCampaign.aiStrategy.pipelineTimeline.sourcingPhase, step: '3' },
                      { title: 'Agreement Lock', desc: selectedCampaign.aiStrategy.pipelineTimeline.contractPhase, step: '4' }
                    ].map(st => (
                      <div key={st.step} className="p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-xl relative overflow-hidden">
                        <span className="absolute -right-2 -bottom-2 text-3xl font-black text-slate-100 dark:text-slate-850 font-mono select-none">{st.step}</span>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">{st.title}</h4>
                        <p className="text-[10px] leading-relaxed text-slate-400 font-sans mt-1.5">{st.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cold outreach templates tabs side-by-side */}
              {selectedCampaign.aiStrategy && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  
                  {/* Cold Prospecting Email template card */}
                  <div className="p-4 bg-slate-950 text-slate-200 border border-slate-850 rounded-xl space-y-3 relative overflow-hidden group">
                    <div className="absolute top-4 right-4 flex gap-1">
                      <button
                        onClick={() => {
                          const emailText = `SUBJECT: ${selectedCampaign.aiStrategy?.coldEmailTemplate?.subject || ''}\n\nBODY:\n${selectedCampaign.aiStrategy?.coldEmailTemplate?.body || ''}`;
                          navigator.clipboard.writeText(emailText);
                          addToast('Copied Prospecting Email', 'Saved Cold Outreach Email draft to clipboard', 'success');
                        }}
                        className="p-1 hover:bg-slate-800 rounded cursor-pointer text-slate-400"
                        title="Copy Email"
                      >
                        <Copy size={12} />
                      </button>
                    </div>
                    <span className="block text-[10px] font-bold text-indigo-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
                      <Mail size={12} /> Personalized Sourcing Pitch Email
                    </span>
                    <div className="space-y-2 pt-1 font-mono text-[11px] leading-relaxed">
                      <p className="border-b border-slate-800 pb-1.5 text-slate-400">Subject: <span className="text-white font-semibold">{selectedCampaign.aiStrategy.coldEmailTemplate?.subject || 'N/A'}</span></p>
                      <pre className="whitespace-pre-wrap font-sans text-slate-300 max-h-[180px] overflow-y-auto custom-scrollbar">{selectedCampaign.aiStrategy.coldEmailTemplate?.body || 'No template generated'}</pre>
                    </div>
                  </div>

                  {/* LinkedIn InMail template card */}
                  <div className="p-4 bg-slate-950 text-slate-200 border border-slate-850 rounded-xl space-y-3 relative overflow-hidden group">
                    <div className="absolute top-4 right-4 flex gap-1">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(selectedCampaign.aiStrategy?.linkedInMessageTemplate || '');
                          addToast('Copied InMail Pitch', 'Saved LinkedIn Pitch to clipboard', 'success');
                        }}
                        className="p-1 hover:bg-slate-800 rounded cursor-pointer text-slate-400"
                        title="Copy InMail"
                      >
                        <Copy size={12} />
                      </button>
                    </div>
                    <span className="block text-[10px] font-bold text-blue-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
                      <Linkedin size={12} /> LinkedIn Prospecting Direct InMail
                    </span>
                    <div className="pt-2 font-mono text-[11px] leading-relaxed">
                      <pre className="whitespace-pre-wrap font-sans text-slate-300 max-h-[180px] overflow-y-auto custom-scrollbar">"{selectedCampaign.aiStrategy.linkedInMessageTemplate}"</pre>
                    </div>
                  </div>

                </div>
              )}

              {/* Target Companies highlights list */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-850">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Target Sourcing Corporations ({selectedCampaign.targetCompanies.length})</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCampaign.targetCompanies.map(tc => (
                    <span key={tc} className="px-2 py-0.5 text-[10px] font-sans font-semibold bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 rounded-md border border-slate-200/40">
                      {tc}
                    </span>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div className="py-24 text-center bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl text-slate-400 flex flex-col items-center justify-center space-y-2">
              <CalendarRange className="h-10 w-10 text-slate-300 dark:text-slate-700 animate-pulse" />
              <h3 className="font-bold text-sm text-slate-950 dark:text-slate-100">Dynamic Strategy Console</h3>
              <p className="text-xs max-w-sm">Select a planned prospecting campaign from the timeline list to review cold email models, LinkedIn pitches and execution timelines.</p>
            </div>
          )}
        </div>

      </div>

      {/* ==========================================
          MODAL: CONFIGURE NEW OUTREACH CAMPAIGN
          ========================================== */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-slate-950/60 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl p-6 w-full max-w-2xl shadow-2xl"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-lg font-bold text-slate-950 dark:text-slate-50 font-sans flex items-center gap-2">
                  <CalendarRange className="text-indigo-600" size={20} />
                  <span>Launch Outreach Campaign</span>
                </h3>
                <button onClick={() => setShowAddModal(false)} className="p-1 text-slate-400 hover:text-white"><X size={18} /></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase">Campaign Identifiers *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Q3 Chennai Cloud Sourcing Drive"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full p-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase">Target Corporate Sector</label>
                    <select
                      value={targetIndustry}
                      onChange={(e) => setTargetIndustry(e.target.value)}
                      className="w-full p-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100"
                    >
                      <option value="Software & Cloud Services">Software & Cloud Services</option>
                      <option value="Information Security">Information Security</option>
                      <option value="Biotechnology & Genetics">Biotechnology & Genetics</option>
                      <option value="Fintech">Fintech</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase">Outreach Schedule date</label>
                    <input
                      type="date"
                      value={schedule}
                      onChange={(e) => setSchedule(e.target.value)}
                      className="w-full p-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-400 uppercase">Campaign Priority</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as any)}
                      className="w-full p-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100"
                    >
                      <option value="High">High Sourcing</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-400 uppercase">Campaign Sourcing Objectives *</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Describe specific sourcing goals, candidate qualifications, and corporate alignments to feed Gemini outreach pitch models..."
                    value={campaignObjective}
                    onChange={(e) => setCampaignObjective(e.target.value)}
                    className="w-full p-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 leading-relaxed"
                  />
                </div>

                {/* Target Companies multi-selector checkboxes */}
                <div className="space-y-2">
                  <span className="block text-xs font-bold text-slate-400 uppercase">Target Corporations from Directory ({selectedCompanies.length})</span>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-[140px] overflow-y-auto custom-scrollbar p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                    {companies.map(comp => {
                      const isChecked = selectedCompanies.includes(comp.name);
                      return (
                        <label key={comp.id} className="flex items-center gap-2 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs rounded text-slate-600 dark:text-slate-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleCompanySelection(comp.name)}
                            className="accent-indigo-600"
                          />
                          <span className="truncate">{comp.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                  <button 
                    type="button" 
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-slate-500"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={planningInProgress}
                    className="px-5 py-2 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/15 flex items-center gap-1.5"
                  >
                    {planningInProgress ? (
                      <>
                        <Loader2 size={12} className="animate-spin" />
                        <span>AI Generating...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={12} />
                        <span>Draft Outreach Timelines</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
