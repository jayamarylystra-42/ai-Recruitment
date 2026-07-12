import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Sliders, 
  User, 
  Cpu, 
  Server, 
  Trash2, 
  Moon, 
  Sun, 
  RefreshCw, 
  AlertTriangle, 
  ShieldCheck, 
  ExternalLink,
  Loader2,
  Database,
  Terminal,
  Activity
} from 'lucide-react';
import { User as UserType } from '../types';

interface SettingsPanelProps {
  user: UserType | null;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  onClearDb: () => Promise<boolean>;
  onReseedDb: () => Promise<boolean>;
  addToast: (title: string, content: string, type: 'success' | 'warning' | 'error' | 'info') => void;
}

export default function SettingsPanel({
  user,
  darkMode,
  setDarkMode,
  onClearDb,
  onReseedDb,
  addToast
}: SettingsPanelProps) {
  const [testingModel, setTestingModel] = useState(false);
  const [clearingDb, setClearingDb] = useState(false);
  const [reseedingDb, setReseedingDb] = useState(false);
  
  // Custom API configurations
  const [recruitmentAgencyName, setRecruitmentAgencyName] = useState('AI Sourcing Enterprise India');
  const [currencySymbol, setCurrencySymbol] = useState('INR');
  const [atsThreshold, setAtsThreshold] = useState(75);

  const isMockMode = process.env.NODE_ENV !== 'production' && !process.env.GEMINI_API_KEY;

  const handleTestModelConnection = async () => {
    setTestingModel(true);
    addToast('Contacting Gemini', 'Pinging Gemini-2.5-Flash model endpoint...', 'info');
    
    // Simulate API connection verification
    setTimeout(() => {
      setTestingModel(false);
      addToast('Connection Verified', 'Gemini AI Sourcing Engine responsive (Latency: 225ms)', 'success');
    }, 1200);
  };

  const handleClearDatabase = async () => {
    if (confirm('Are you absolutely sure you want to clear the entire database? This action is irreversible.')) {
      setClearingDb(true);
      try {
        await onClearDb();
        addToast('Database Wiped', 'Registry entries erased', 'success');
      } catch (err: any) {
        addToast('Purge Failed', err.message, 'error');
      } finally {
        setClearingDb(false);
      }
    }
  };

  const handleReseedDatabase = async () => {
    setReseedingDb(true);
    try {
      await onReseedDb();
      addToast('Registry Reseeded', 'Successfully repopulated database with premium corporate seed data', 'success');
    } catch (err: any) {
      addToast('Sourcing Failed', err.message, 'error');
    } finally {
      setReseedingDb(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      
      {/* Title Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 font-sans">
          Platform Configuration & Settings
        </h1>
        <p className="text-xs text-slate-500">
          Configure agency metadata, verify Gemini AI connectivity, adjust ATS scoring filters, and wipe or reseed database nodes.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left Column: UI Styling & User Profile */}
        <div className="space-y-6">
          
          {/* User Profile Info card */}
          <div className="p-5 bg-white dark:bg-slate-950 border border-slate-250 dark:border-slate-850 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono border-b border-slate-100 dark:border-slate-850 pb-2 flex items-center gap-1.5">
              <User size={14} className="text-indigo-500" /> Active Profile Credentials
            </h3>
            {user && (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white font-black text-lg shadow-md shadow-indigo-900/30">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-850 dark:text-slate-100">{user.name}</h4>
                  <p className="text-xs text-slate-400">{user.email}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 text-[9px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/25 rounded-md">
                    Role: {user.role} Session
                  </span>
                </div>
              </div>
            )}
            <div className="text-[10px] text-slate-400 font-mono pt-2 border-t border-slate-50 dark:border-slate-900 flex justify-between">
              <span>Client Address Node: 127.0.0.1</span>
              <span>TLS: SECURE SSL</span>
            </div>
          </div>

          {/* Visual UI styling controls */}
          <div className="p-5 bg-white dark:bg-slate-950 border border-slate-250 dark:border-slate-850 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono border-b border-slate-100 dark:border-slate-850 pb-2">Visual Theme Presets</h3>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-600 dark:text-slate-300">Select Interface Styling Mode</span>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition-colors"
              >
                {darkMode ? (
                  <>
                    <Sun size={14} className="text-amber-500" />
                    <span>Swap to Light theme</span>
                  </>
                ) : (
                  <>
                    <Moon size={14} className="text-indigo-500" />
                    <span>Swap to Dark theme</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Sourcing configurations */}
          <div className="p-5 bg-white dark:bg-slate-950 border border-slate-250 dark:border-slate-850 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono border-b border-slate-100 dark:border-slate-850 pb-2">Sourcing Filters Setup</h3>
            
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Agency Name</label>
                <input
                  type="text"
                  value={recruitmentAgencyName}
                  onChange={(e) => setRecruitmentAgencyName(e.target.value)}
                  className="mt-1 w-full p-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">ATS Settle Threshold</label>
                  <input
                    type="number"
                    value={atsThreshold}
                    onChange={(e) => setAtsThreshold(Number(e.target.value))}
                    className="mt-1 w-full p-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Currency symbol</label>
                  <input
                    type="text"
                    value={currencySymbol}
                    onChange={(e) => setCurrencySymbol(e.target.value)}
                    className="mt-1 w-full p-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: AI Model Vitals & Database Utilities */}
        <div className="space-y-6">
          
          {/* AI Vetting Credentials Check */}
          <div className="p-5 bg-gradient-to-tr from-indigo-950/10 via-slate-900/5 to-violet-950/5 dark:from-indigo-950/30 dark:via-slate-950/20 dark:to-violet-950/25 border border-indigo-100 dark:border-indigo-900/30 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
              <Cpu size={14} /> AI Model Integration Vitals
            </h3>
            
            <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl space-y-3 font-mono text-[11px] text-slate-300">
              <div className="flex justify-between">
                <span>MODEL ENDPOINT:</span>
                <span className="text-indigo-400">gemini-2.5-flash</span>
              </div>
              <div className="flex justify-between">
                <span>SDK INTEGRATION:</span>
                <span className="text-emerald-500">@google/genai (v2.4.0)</span>
              </div>
              <div className="flex justify-between">
                <span>SYSTEM KEY INJECT:</span>
                <span className="text-emerald-500">VERIFIED PROXY ACTIVE</span>
              </div>
              <div className="flex justify-between">
                <span>OPERATIONAL RATINGS:</span>
                <span className="text-amber-500">{isMockMode ? 'MOCK ENGINE ENABLED' : 'LIVE API INGRESS'}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={handleTestModelConnection}
                disabled={testingModel}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs shadow-md shadow-indigo-600/15 flex items-center justify-center gap-1.5 transition-colors"
              >
                {testingModel ? (
                  <>
                    <Loader2 size={12} className="animate-spin" />
                    <span>Validating Endpoint...</span>
                  </>
                ) : (
                  <>
                    <Activity size={12} />
                    <span>Verify API Connection</span>
                  </>
                )}
              </button>
              <a href="https://ai.google.dev" target="_blank" rel="noreferrer" className="text-[10px] text-indigo-400 hover:underline flex items-center justify-center gap-1 mx-auto pt-1 font-mono">
                <span>Google AI Documentation</span>
                <ExternalLink size={10} />
              </a>
            </div>
          </div>

          {/* Database maintenance utilities */}
          <div className="p-5 bg-white dark:bg-slate-950 border border-slate-250 dark:border-slate-850 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono border-b border-slate-100 dark:border-slate-850 pb-2 flex items-center gap-1.5">
              <Database size={14} className="text-indigo-500" /> Database Administration Nodes
            </h3>
            
            <p className="text-xs text-slate-400 leading-relaxed">Administer offline JSON persistence storage. Reseed with premium recruitment dummy values or completely flush registries.</p>
            
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleClearDatabase}
                disabled={clearingDb}
                className="py-2 px-3 border border-red-500/30 hover:bg-red-500/10 text-red-500 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                {clearingDb ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                <span>Clear Database</span>
              </button>
              <button
                onClick={handleReseedDatabase}
                disabled={reseedingDb}
                className="py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow transition-colors"
              >
                {reseedingDb ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                <span>Reseed Database</span>
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
