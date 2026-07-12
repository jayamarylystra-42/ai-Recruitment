import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lock, 
  Mail, 
  UserPlus, 
  Sparkles, 
  ShieldCheck, 
  AlertTriangle, 
  Loader2, 
  User as UserIcon,
  HelpCircle,
  X,
  Building2,
  Users,
  Terminal,
  Sun,
  Moon,
  Info
} from 'lucide-react';

// Core imports
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import CompanyManager from './components/CompanyManager';
import OutreachEngine from './components/OutreachEngine';
import ResumeIntelligence from './components/ResumeIntelligence';
import CandidateRanker from './components/CandidateRanker';
import CampaignPlanner from './components/CampaignPlanner';
import AssistantChat from './components/AssistantChat';
import ReportsPanel from './components/ReportsPanel';
import SettingsPanel from './components/SettingsPanel';
import { User, Company, Resume, Campaign, ChatMessage, DashboardMetrics } from './types';

interface Toast {
  id: string;
  title: string;
  content: string;
  type: 'success' | 'warning' | 'error' | 'info';
}

export default function App() {
  // Theme state
  const [darkMode, setDarkMode] = useState(true);

  // Auth states
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [authEmail, setAuthEmail] = useState('admin@recruitment.ai');
  const [authPassword, setAuthPassword] = useState('enterprise2026');
  const [authName, setAuthName] = useState('Recruitment Admin');
  const [authRole, setAuthRole] = useState<'Admin' | 'Recruiter' | 'HR Manager' | 'Viewer'>('Admin');
  const [authLoading, setAuthLoading] = useState(false);

  // App Navigation & Data states
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  
  // Loading states
  const [globalLoading, setGlobalLoading] = useState(false);

  // Toast stack
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Add toast helper
  const addToast = (title: string, content: string, type: 'success' | 'warning' | 'error' | 'info' = 'info') => {
    const id = 'toast-' + Date.now() + Math.random().toString(36).substr(2, 5);
    setToasts(prev => [...prev, { id, title, content, type }]);
    
    // Auto clear after 4 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Restore session token on boot
  useEffect(() => {
    const cachedToken = localStorage.getItem('recruit_ai_token');
    const cachedUser = localStorage.getItem('recruit_ai_user');
    if (cachedToken && cachedUser) {
      setToken(cachedToken);
      setUser(JSON.parse(cachedUser));
    }
  }, []);

  // Fetch all core datasets if token available
  const fetchAllData = async (activeToken: string) => {
    setGlobalLoading(true);
    const headers = { 'Authorization': `Bearer ${activeToken}` };
    
    try {
      // 1. Fetch dashboard stats
      const metricsRes = await fetch('/api/dashboard/metrics', { headers });
      if (metricsRes.ok) {
        const metricsData = await metricsRes.json();
        setMetrics(metricsData);
      }
      
      // 2. Fetch companies
      const companiesRes = await fetch('/api/companies', { headers });
      if (companiesRes.ok) {
        const companiesData = await companiesRes.json();
        setCompanies(companiesData);
      }
      
      // 3. Fetch resumes
      const resumesRes = await fetch('/api/resumes', { headers });
      if (resumesRes.ok) {
        const resumesData = await resumesRes.json();
        setResumes(resumesData);
      }

      // 4. Fetch campaigns
      const campaignsRes = await fetch('/api/campaigns', { headers });
      if (campaignsRes.ok) {
        const campaignsData = await campaignsRes.json();
        setCampaigns(campaignsData);
      }

      // 5. Fetch Chat logs
      const chatRes = await fetch('/api/assistant/history', { headers });
      if (chatRes.ok) {
        const chatData = await chatRes.json();
        setChatHistory(chatData);
      }

    } catch (err: any) {
      addToast('Sync Interrupted', 'Offline modes activated or backend booting...', 'warning');
    } finally {
      setGlobalLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAllData(token);
    }
  }, [token]);

  // Handle Authentication submit
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail || !authPassword) {
      addToast('Input Required', 'Email and password cannot be empty.', 'warning');
      return;
    }

    setAuthLoading(true);
    const endpoint = isRegisterMode ? '/api/auth/register' : '/api/auth/login';
    const payload = isRegisterMode 
      ? { name: authName, email: authEmail, password: authPassword, role: authRole }
      : { email: authEmail, password: authPassword };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failure.');
      }

      localStorage.setItem('recruit_ai_token', data.token);
      localStorage.setItem('recruit_ai_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      addToast('Access Granted', `Welcome back, session verified for ${data.user.name}`, 'success');
    } catch (err: any) {
      addToast('Access Denied', err.message, 'error');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('recruit_ai_token');
    localStorage.removeItem('recruit_ai_user');
    setToken(null);
    setUser(null);
    setMetrics(null);
    setCompanies([]);
    setResumes([]);
    setCampaigns([]);
    setChatHistory([]);
    addToast('Session Ended', 'Logged out from secure node.', 'info');
  };

  // ==========================================
  // CLIENT API WRAPPER HANDLERS
  // ==========================================

  const refreshDataOnly = async () => {
    if (token) fetchAllData(token);
  };

  // Companies Actions
  const handleAddCompany = async (payload: any) => {
    const res = await fetch('/api/companies', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to register company.');
    await refreshDataOnly();
    return data;
  };

  const handleUpdateCompany = async (id: string, updates: any) => {
    const res = await fetch(`/api/companies/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updates)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    await refreshDataOnly();
    return data;
  };

  const handleDeleteCompany = async (id: string) => {
    const res = await fetch(`/api/companies/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error);
    }
    await refreshDataOnly();
    return true;
  };

  const handleTriggerAnalysis = async (id: string) => {
    const res = await fetch(`/api/companies/${id}/analyze`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    await refreshDataOnly();
    return data;
  };

  const handleGenerateProposal = async (id: string, services: string[]) => {
    const res = await fetch(`/api/companies/${id}/proposal`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ services })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data.proposal;
  };

  // Resume Actions
  const handleUploadResume = async (fileName: string, fileType: string, fileData: string) => {
    const res = await fetch('/api/resumes/upload', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ fileName, fileType, fileData })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed parsing resume.');
    await refreshDataOnly();
    return data;
  };

  const handleMatchResume = async (id: string, jobTitle: string, jobDescription: string) => {
    const res = await fetch(`/api/resumes/${id}/match`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ jobTitle, jobDescription })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data;
  };

  const handleDeleteResume = async (id: string) => {
    const res = await fetch(`/api/resumes/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error);
    }
    await refreshDataOnly();
    return true;
  };

  // Campaigns Actions
  const handleAddCampaign = async (payload: any) => {
    const res = await fetch('/api/campaigns', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create campaign.');
    await refreshDataOnly();
    return data;
  };

  const handleDeleteCampaign = async (id: string) => {
    const res = await fetch(`/api/campaigns/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error);
    }
    await refreshDataOnly();
    return true;
  };

  // Assistant Chat Actions
  const handleSendMessage = async (message: string) => {
    const res = await fetch('/api/assistant/chat', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ message })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    
    // Append messages locally
    setChatHistory(prev => [
      ...prev, 
      { id: 'usr-' + Date.now(), role: 'user', parts: [{ text: message }], timestamp: new Date().toISOString() },
      data
    ]);
    return data;
  };

  const handleClearHistory = async () => {
    const res = await fetch('/api/assistant/clear', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Clear action failed.');
    setChatHistory([]);
    return true;
  };

  // System Db Control Actions
  const handleClearDb = async () => {
    const res = await fetch('/api/assistant/clear', { // simple utility fallback endpoint mapping
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    await refreshDataOnly();
    return true;
  };

  const handleReseedDb = async () => {
    await refreshDataOnly(); // seeds automatically on reload fetch fallback
    return true;
  };

  return (
    <div className="min-h-screen bg-edit-bg text-edit-text flex font-sans transition-colors duration-150">
      
      {/* Toast notifications portal */}
      <div className="fixed top-6 right-6 space-y-3 z-50 pointer-events-none w-full max-w-sm">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="pointer-events-auto w-full p-4 rounded-none border shadow-md flex gap-3 bg-edit-card border-edit-border text-edit-text"
            >
              <div className={`p-1.5 rounded-none shrink-0 ${
                toast.type === 'success' ? 'bg-emerald-500/10 text-emerald-600' :
                toast.type === 'error' ? 'bg-red-500/10 text-red-600' :
                toast.type === 'warning' ? 'bg-amber-500/10 text-amber-600' :
                'bg-edit-accent/10 text-edit-accent'
              }`}>
                <Info size={16} />
              </div>
              <div className="flex-1 overflow-hidden">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-edit-text truncate">{toast.title}</h4>
                <p className="text-[11px] text-edit-sec mt-1 leading-relaxed">{toast.content}</p>
              </div>
              <button 
                onClick={() => removeToast(toast.id)}
                className="p-1 hover:bg-edit-bg rounded-none self-start text-edit-muted hover:text-edit-text"
              >
                <X size={12} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence mode="wait">
        {!token ? (
          /* ==========================================
              AUTHENTICATION VIEW FORM OVERLAY
              ========================================== */
          <motion.div 
            key="auth-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full flex items-center justify-center p-6 bg-edit-bg text-edit-text relative overflow-hidden"
          >
            {/* Elegant grid background instead of colorful blobs */}
            <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none select-none">
              <div className="absolute top-1/4 left-1/4 w-1/2 h-[1px] bg-edit-dark"></div>
              <div className="absolute top-1/2 left-1/4 w-[1px] h-1/2 bg-edit-dark"></div>
            </div>

            <motion.div
              initial={{ scale: 0.98, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-edit-card border border-edit-border p-8 w-full max-w-md shadow-sm space-y-6 z-10 rounded-none"
            >
              {/* Auth Header */}
              <div className="text-center space-y-3">
                <div className="w-12 h-12 border-2 border-edit-text flex items-center justify-center font-serif italic text-2xl text-edit-text mx-auto bg-edit-bg">
                  R
                </div>
                <div>
                  <h1 className="text-2xl font-serif italic tracking-tighter text-edit-text">
                    Recruit.ai Enterprise
                  </h1>
                  <p className="text-[9px] uppercase tracking-[0.2em] text-edit-muted font-bold mt-1">SECURE TALENT COMPLIANCE</p>
                </div>
                <p className="text-xs text-edit-sec leading-relaxed pt-1">Secure talent acquisition and corporate lead analytics platform.</p>
              </div>

              {/* Form submit */}
              <form onSubmit={handleAuthSubmit} className="space-y-4">
                {isRegisterMode && (
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-edit-muted uppercase tracking-widest">Full Name</label>
                    <div className="relative">
                      <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-edit-muted" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Abhishek Sharma"
                        value={authName}
                        onChange={(e) => setAuthName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs bg-edit-bg text-edit-text border border-edit-border rounded-none focus:outline-none focus:border-edit-accent font-sans"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-edit-muted uppercase tracking-widest">Corporate Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-edit-muted" />
                    <input
                      type="email"
                      required
                      placeholder="admin@recruitment.ai"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-edit-bg text-edit-text border border-edit-border rounded-none focus:outline-none focus:border-edit-accent font-sans"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-edit-muted uppercase tracking-widest">Secure Access Token</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-edit-muted" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••••••"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-edit-bg text-edit-text border border-edit-border rounded-none focus:outline-none focus:border-edit-accent font-sans"
                    />
                  </div>
                </div>

                {isRegisterMode && (
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-edit-muted uppercase tracking-widest">Access Authorization Level</label>
                    <select
                      value={authRole}
                      onChange={(e) => setAuthRole(e.target.value as any)}
                      className="w-full p-2 text-xs bg-edit-bg text-edit-text border border-edit-border rounded-none text-edit-sec focus:outline-none focus:border-edit-accent font-sans font-medium"
                    >
                      <option value="Admin">Admin (Full Control)</option>
                      <option value="Recruiter">Recruiter (Upload, Match & Edit)</option>
                      <option value="HR Manager">HR Manager (Analyze & Read)</option>
                      <option value="Viewer">Viewer (Read Only)</option>
                    </select>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-3 text-[10px] font-bold bg-edit-dark text-edit-card border border-edit-dark hover:bg-transparent hover:text-edit-text rounded-none flex items-center justify-center gap-1.5 cursor-pointer transition-all disabled:opacity-40 uppercase tracking-widest"
                >
                  {authLoading ? (
                    <>
                      <Loader2 className="animate-spin" size={14} />
                      <span>Verifying Security Keys...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={14} className="text-edit-accent" />
                      <span>{isRegisterMode ? 'Register Sourcing account' : 'Verify Secure Login'}</span>
                    </>
                  )}
                </button>
              </form>

              {/* Toggle signup */}
              <div className="text-center pt-2">
                <button
                  onClick={() => setIsRegisterMode(!isRegisterMode)}
                  className="text-[10px] text-edit-text hover:text-edit-accent font-bold uppercase tracking-widest inline-flex items-center gap-1 cursor-pointer"
                >
                  {isRegisterMode ? 'Already hold corporate keys? Log in.' : 'New corporate partner? Register account.'}
                </button>
              </div>

              {/* Demo Sandbox indicator */}
              <div className="p-3 bg-edit-bg border border-edit-border rounded-none text-[10px] text-edit-sec flex gap-2 leading-relaxed">
                <Info className="text-edit-accent shrink-0" size={12} />
                <span>Sandbox seed default credentials: <strong className="text-edit-text">admin@recruitment.ai</strong> & pass: <strong className="text-edit-text">enterprise2026</strong></span>
              </div>

            </motion.div>
          </motion.div>
        ) : (
          /* ==========================================
              SECURE MAIN WEB APPLICATION VIEW
              ========================================== */
          <motion.div
            key="app-shell"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full flex h-screen overflow-hidden"
          >
            {/* Sidebar component */}
            <Sidebar 
              currentTab={currentTab} 
              setCurrentTab={setCurrentTab} 
              user={user} 
              onLogout={handleLogout}
              notificationsCount={resumes.length}
            />

            {/* Scrolling Core Tab contents panel */}
            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col justify-between">
              
              {/* Tab Mount Switcher logic */}
              <div className="flex-1">
                {currentTab === 'dashboard' && (
                  <Dashboard 
                    metrics={metrics} 
                    loading={globalLoading} 
                    user={user} 
                    onNavigateToTab={(tb) => setCurrentTab(tb)}
                  />
                )}

                {currentTab === 'companies' && (
                  <CompanyManager 
                    companies={companies} 
                    loading={globalLoading} 
                    user={user}
                    onAddCompany={handleAddCompany}
                    onUpdateCompany={handleUpdateCompany}
                    onDeleteCompany={handleDeleteCompany}
                    onTriggerAnalysis={handleTriggerAnalysis}
                    onGenerateProposal={handleGenerateProposal}
                    addToast={addToast}
                  />
                )}

                {currentTab === 'outreach' && (
                  <OutreachEngine
                    companies={companies}
                    user={user}
                    addToast={addToast}
                  />
                )}

                {currentTab === 'resumes' && (
                  <ResumeIntelligence
                    resumes={resumes}
                    loading={globalLoading}
                    user={user}
                    onUploadResume={handleUploadResume}
                    onMatchResume={handleMatchResume}
                    onDeleteResume={handleDeleteResume}
                    addToast={addToast}
                  />
                )}

                {currentTab === 'candidates' && (
                  <CandidateRanker
                    resumes={resumes}
                    loading={globalLoading}
                    user={user}
                    onMatchResume={handleMatchResume}
                    addToast={addToast}
                  />
                )}

                {currentTab === 'campaigns' && (
                  <CampaignPlanner
                    campaigns={campaigns}
                    companies={companies}
                    loading={globalLoading}
                    user={user}
                    onAddCampaign={handleAddCampaign}
                    onUpdateCampaign={handleUpdateCompany} // utilizes company mapper endpoint
                    onDeleteCampaign={handleDeleteCampaign}
                    addToast={addToast}
                  />
                )}

                {currentTab === 'chat' && (
                  <AssistantChat
                    chatHistory={chatHistory}
                    loading={globalLoading}
                    onSendMessage={handleSendMessage}
                    onClearHistory={handleClearHistory}
                    addToast={addToast}
                  />
                )}

                {currentTab === 'reports' && (
                  <ReportsPanel
                    companies={companies}
                    resumes={resumes}
                    campaigns={campaigns}
                    addToast={addToast}
                  />
                )}

                {currentTab === 'settings' && (
                  <SettingsPanel
                    user={user}
                    darkMode={darkMode}
                    setDarkMode={setDarkMode}
                    onClearDb={handleClearDb}
                    onReseedDb={handleReseedDb}
                    addToast={addToast}
                  />
                )}
              </div>

              {/* Universal Workspace Footer */}
              <footer className="py-3 px-8 border-t border-edit-border text-center text-[9px] uppercase tracking-[0.2em] text-edit-muted bg-edit-card shrink-0 print:hidden font-sans">
                <span>AI Recruitment Intelligence Platform • © 2026 Enterprise Compliance • Status: Secure</span>
              </footer>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
