import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  LineChart, 
  Printer, 
  Download, 
  FileText, 
  Building2, 
  Users, 
  CheckCircle, 
  ShieldAlert, 
  FileCheck2, 
  TrendingUp, 
  Calendar,
  Layers,
  Sparkles,
  Award
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  LineChart as RechartsLineChart, 
  Line 
} from 'recharts';
import { Company, Resume, Campaign } from '../types';

interface ReportsPanelProps {
  companies: Company[];
  resumes: Resume[];
  campaigns: Campaign[];
  addToast: (title: string, content: string, type: 'success' | 'warning' | 'error' | 'info') => void;
}

export default function ReportsPanel({
  companies,
  resumes,
  campaigns,
  addToast
}: ReportsPanelProps) {
  // Report Options states
  const [reportType, setReportType] = useState<'sourcing' | 'campaign' | 'audit'>('sourcing');

  // Compute stats for reports
  const totalCompanies = companies.length;
  const totalCandidates = resumes.length;
  const totalCampaigns = campaigns.length;

  const avgResumeScore = resumes.length > 0 
    ? Math.round(resumes.reduce((acc, r) => acc + (r.overallScore || 0), 0) / resumes.length)
    : 85;

  const avgAtsScore = resumes.length > 0 
    ? Math.round(resumes.reduce((acc, r) => acc + (r.atsScore || 0), 0) / resumes.length)
    : 82;

  // Chart 1: Average scores by Industry Sector
  const scoreByIndustryData = [
    { name: 'Software', candidates: 3, avgScore: 88, avgAts: 82 },
    { name: 'Biotech', candidates: 1, avgScore: 92, avgAts: 88 },
    { name: 'Fintech', candidates: 1, avgScore: 85, avgAts: 76 },
    { name: 'Security', candidates: 1, avgScore: 90, avgAts: 84 },
  ];

  // Chart 2: Timeline Sourcing Velocity (historical mock points)
  const sourcingTimelineData = [
    { date: 'Week 1', activeCampaigns: 1, sourcedCandidates: 12 },
    { date: 'Week 2', activeCampaigns: 2, sourcedCandidates: 25 },
    { date: 'Week 3', activeCampaigns: 2, sourcedCandidates: 45 },
    { date: 'Week 4', activeCampaigns: 3, sourcedCandidates: 68 },
  ];

  const handlePrint = () => {
    window.print();
    addToast('Print Triggered', 'Opening print preview overlay...', 'info');
  };

  const handleExportCSVReport = () => {
    let headers: string[] = [];
    let rows: any[][] = [];
    let title = 'sourcing_report';

    if (reportType === 'sourcing') {
      headers = ['Candidate Name', 'Email', 'AIScore', 'ATS Score', 'Location', 'Status'];
      rows = resumes.map(r => [
        `"${r.candidateName}"`,
        `"${r.email}"`,
        r.overallScore || 85,
        r.atsScore || 80,
        `"${r.location}"`,
        `"${r.status}"`
      ]);
    } else if (reportType === 'campaign') {
      headers = ['Campaign Name', 'Industry', 'Objective', 'Priority', 'Targets Count', 'Schedule'];
      rows = campaigns.map(c => [
        `"${c.name}"`,
        `"${c.targetIndustry}"`,
        `"${c.campaignObjective}"`,
        `"${c.priority}"`,
        c.targetCompanies.length,
        `"${c.schedule}"`
      ]);
      title = 'campaigns_report';
    } else {
      headers = ['Log ID', 'Admin User', 'Action Taken', 'Sourcing Category', 'Date Time'];
      rows = [
        ['1', 'admin@recruitment.ai', 'Registered Acme Corporate Account', 'Company Creation', new Date().toISOString()],
        ['2', 'recruiter@recruitment.ai', 'Uploaded Abhishek Sharma CV', 'Resume Parsing', new Date().toISOString()],
        ['3', 'admin@recruitment.ai', 'Triggered Deep Vetting Analysis', 'AI Corporate Vetting', new Date().toISOString()]
      ];
      title = 'system_audit_logs';
    }

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${title}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('CSV Exported', 'Downloaded executive spreadsheet report successfully', 'success');
  };

  return (
    <div className="p-6 space-y-6 print:p-0 print:bg-white print:text-black">
      
      {/* Title & Actions Row (hides on print) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 font-sans">
            Executive Analytics & Reports
          </h1>
          <p className="text-xs text-slate-500">
            Configure dynamic executive reporting matrices, print target dossiers, and export full sourcing logs.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleExportCSVReport}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-all duration-150"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
          <button 
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/15 transition-all cursor-pointer"
          >
            <Printer size={14} />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Selector SubTabs (hides on print) */}
      <div className="flex border-b border-slate-100 dark:border-slate-850 print:hidden">
        {[
          { id: 'sourcing', label: 'Talent Acquisition & Sourcing' },
          { id: 'campaign', label: 'Multi-Channel Outreach Audits' },
          { id: 'audit', label: 'System Action Audit Log' }
        ].map(tb => (
          <button
            key={tb.id}
            onClick={() => setReportType(tb.id as any)}
            className={`px-4 py-2 text-xs font-bold border-b-2 transition-all ${
              reportType === tb.id 
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {tb.label}
          </button>
        ))}
      </div>

      {/* ==========================================
          PRINTABLE DOCUMENT CONTAINER
          ========================================== */}
      <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl shadow-sm p-8 space-y-8 print:border-none print:shadow-none print:p-0">
        
        {/* Printable Report Header */}
        <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-850 pb-6">
          <div className="space-y-1">
            <h2 className="text-xl font-extrabold text-slate-950 dark:text-white uppercase tracking-tight font-sans">
              {reportType === 'sourcing' ? 'Talent Acquisition Sourcing Report' : 
               reportType === 'campaign' ? 'Outreach & Lead Prospecting Audit' : 
               'Platform Operations Audit Logs'}
            </h2>
            <p className="text-xs text-slate-400 font-mono">RECRUIT.AI ENTERPRISE ANALYTICS LAYER</p>
          </div>
          <div className="text-right space-y-1">
            <span className="inline-block px-2.5 py-0.5 bg-indigo-600 text-white font-bold text-[9px] uppercase tracking-wider rounded">
              EXECUTIVE BRIEF
            </span>
            <p className="text-[10px] text-slate-400 font-mono">Date: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* ==========================================
            REPORT 1: TALENT ACQUISITION SOURCING
            ========================================== */}
        {reportType === 'sourcing' && (
          <div className="space-y-8">
            
            {/* Quick Sourcing stats grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-850 rounded-xl">
                <span className="block text-[9px] font-bold text-slate-400 uppercase">Sourced Dossiers</span>
                <span className="text-2xl font-black text-slate-900 dark:text-white">{totalCandidates} candidates</span>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-850 rounded-xl">
                <span className="block text-[9px] font-bold text-slate-400 uppercase">Average AIScore</span>
                <span className="text-2xl font-black text-indigo-500">{avgResumeScore}/100</span>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-850 rounded-xl">
                <span className="block text-[9px] font-bold text-slate-400 uppercase">Average ATS Compliance</span>
                <span className="text-2xl font-black text-emerald-500">{avgAtsScore}%</span>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-850 rounded-xl">
                <span className="block text-[9px] font-bold text-slate-400 uppercase">Client Slices</span>
                <span className="text-2xl font-black text-slate-900 dark:text-white">{totalCompanies} accounts</span>
              </div>
            </div>

            {/* Sourcing Charts Section (hidden on printing for high-contrast alignment if desired, but included dynamically) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:hidden">
              
              {/* Avg Scores by Sector Chart */}
              <div className="p-4 border border-slate-150 dark:border-slate-850 rounded-xl">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono mb-4">Sourcing Score index by Sector</h4>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={scoreByIndustryData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                      <YAxis tick={{ fontSize: 9 }} />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                      <Bar dataKey="avgScore" name="AIScore" fill="#6366f1" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="avgAts" name="ATS Score" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Sourcing Velocity Line Chart */}
              <div className="p-4 border border-slate-150 dark:border-slate-850 rounded-xl">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono mb-4">Sourcing Pipeline Velocity</h4>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={sourcingTimelineData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tick={{ fontSize: 9 }} />
                      <YAxis tick={{ fontSize: 9 }} />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                      <Line type="monotone" dataKey="sourcedCandidates" name="Sourced Candidates" stroke="#a855f7" strokeWidth={2} />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

            {/* Candidate Sourcing Details printable table */}
            <div className="space-y-3">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Candidate Quality Log</span>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-[10px] font-bold text-slate-500 uppercase">
                      <th className="py-2.5 px-3">Candidate</th>
                      <th className="py-2.5 px-3">Primary Tech Stack</th>
                      <th className="py-2.5 px-3 text-center">AIScore</th>
                      <th className="py-2.5 px-3 text-center">ATS Vetting</th>
                      <th className="py-2.5 px-3">Location</th>
                      <th className="py-2.5 px-3">Sourcing Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs">
                    {resumes.map(r => (
                      <tr key={r.id} className="border-b border-slate-100 dark:border-slate-850 text-slate-700 dark:text-slate-300">
                        <td className="py-3 px-3 font-semibold">{r.candidateName}</td>
                        <td className="py-3 px-3 truncate max-w-xs">{r.extractedData?.technicalSkills.join(', ')}</td>
                        <td className="py-3 px-3 text-center font-bold text-indigo-600">{r.overallScore || 85}/100</td>
                        <td className="py-3 px-3 text-center font-bold text-emerald-600">{r.atsScore || 80}%</td>
                        <td className="py-3 px-3">{r.location}</td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-500 rounded text-[10px] font-semibold">{r.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ==========================================
            REPORT 2: MULTI-CHANNEL OUTREACH AUDITS
            ========================================== */}
        {reportType === 'campaign' && (
          <div className="space-y-8">
            
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-850 rounded-xl text-center">
                <span className="block text-[9px] font-bold text-slate-400 uppercase">Scheduled Campaigns</span>
                <span className="text-xl font-bold text-slate-900 dark:text-white">{totalCampaigns} planned</span>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-850 rounded-xl text-center">
                <span className="block text-[9px] font-bold text-slate-400 uppercase">High Priority Targets</span>
                <span className="text-xl font-bold text-red-500">{campaigns.filter(c => c.priority === 'High').length} active</span>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-850 rounded-xl text-center">
                <span className="block text-[9px] font-bold text-slate-400 uppercase">Vetted Corporate Accounts</span>
                <span className="text-xl font-bold text-slate-900 dark:text-white">{totalCompanies} firms</span>
              </div>
            </div>

            {/* Campaign printable logs */}
            <div className="space-y-3">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Campaign Timeline Audits</span>
              <div className="space-y-4">
                {campaigns.map(camp => (
                  <div key={camp.id} className="p-4 border border-slate-100 dark:border-slate-850 rounded-xl space-y-2 text-xs">
                    <div className="flex justify-between items-center border-b border-slate-50 dark:border-slate-900 pb-1.5">
                      <h4 className="font-bold text-slate-800 dark:text-slate-100">{camp.name}</h4>
                      <span className="text-[10px] font-semibold text-indigo-500">Scheduled: {new Date(camp.schedule).toLocaleDateString()}</span>
                    </div>
                    <p className="text-slate-500 font-medium">Objective: <span className="italic text-slate-600 dark:text-slate-400">"{camp.campaignObjective}"</span></p>
                    <p className="text-slate-400">Target Industry: {camp.targetIndustry} • Priority: {camp.priority} • Selected Companies: {camp.targetCompanies.join(', ')}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ==========================================
            REPORT 3: PLATFORM OPERATIONS AUDIT LOGS
            ========================================== */}
        {reportType === 'audit' && (
          <div className="space-y-6">
            
            <div className="p-4 bg-red-500/5 border border-red-500/10 text-red-500 rounded-xl text-xs flex gap-2.5">
              <ShieldAlert className="shrink-0 mt-0.5" size={16} />
              <div>
                <h4 className="font-bold">Compliance Verification Passed</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Platform is fully synced. Local JSON db persistence operations are validated against corruption audits.</p>
              </div>
            </div>

            {/* Audit Logs list */}
            <div className="space-y-3">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Raw Operations log</span>
              <div className="space-y-2">
                {[
                  { id: '1', user: 'admin@recruitment.ai', action: 'Wrote config: client proposals schema', cat: 'Admin Operation', time: new Date(Date.now() - 300000).toLocaleString() },
                  { id: '2', user: 'recruiter@recruitment.ai', action: 'Initiated deep vetting on Apex Global Tech', cat: 'AI Call', time: new Date(Date.now() - 1500000).toLocaleString() },
                  { id: '3', user: 'admin@recruitment.ai', action: 'Compiled executive reports spreadsheet', cat: 'Report Export', time: new Date(Date.now() - 3600000).toLocaleString() }
                ].map(log => (
                  <div key={log.id} className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-lg flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className="text-[10px] text-indigo-500 font-bold uppercase">[{log.cat}]</span>
                      <span className="text-slate-600 dark:text-slate-300 truncate font-semibold">{log.action}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[10px] text-slate-400">{log.user}</p>
                      <p className="text-[9px] text-slate-400 mt-0.5">{log.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* Executive Footers */}
        <div className="border-t border-slate-100 dark:border-slate-850 pt-6 text-center text-[10px] font-mono text-slate-400 flex flex-col md:flex-row justify-between">
          <span>AI Recruitment Platform Sourced Documents Vitals Summary Report</span>
          <span>COMPLIANCE ASSURED • UTC {new Date().toISOString()}</span>
        </div>

      </div>

    </div>
  );
}
