import React from 'react';
import { motion } from 'motion/react';
import { 
  Building2, 
  Users, 
  BrainCircuit, 
  CheckCircle, 
  FileText, 
  Percent, 
  TrendingUp, 
  Lightbulb, 
  Clock, 
  Target, 
  CornerDownRight,
  ShieldCheck
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { DashboardMetrics, User } from '../types';

interface DashboardProps {
  metrics: DashboardMetrics | null;
  loading: boolean;
  user: User | null;
  onNavigateToTab: (tab: string) => void;
}

// Crisp, editorial palette: Charcoal, Rich Gold, Muted Earth/Slate, Warm Cream
const COLORS = ['#1A1A1A', '#D4AF37', '#7C7667', '#A19C91', '#4A4A4A', '#8E8A82'];

export default function Dashboard({ metrics, loading, user, onNavigateToTab }: DashboardProps) {
  if (loading || !metrics) {
    return (
      <div className="p-8 space-y-8 animate-pulse">
        <div className="h-10 bg-edit-border rounded-none w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="h-32 bg-edit-border rounded-none"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-edit-border rounded-none"></div>
          <div className="h-96 bg-edit-border rounded-none"></div>
        </div>
      </div>
    );
  }

  // Historical mock points for hiring trend area chart
  const hiringTrendData = [
    { month: 'Jan 2026', clientGrowth: 12, candidateIngest: 35 },
    { month: 'Feb 2026', clientGrowth: 18, candidateIngest: 48 },
    { month: 'Mar 2026', clientGrowth: 25, candidateIngest: 65 },
    { month: 'Apr 2026', clientGrowth: 32, candidateIngest: 85 },
    { month: 'May 2026', clientGrowth: 45, candidateIngest: 110 },
    { month: 'Jun 2026', clientGrowth: 58, candidateIngest: 145 },
    { month: 'Jul 2026', clientGrowth: 68, candidateIngest: 180 },
  ];

  const statCards = [
    { title: 'Total Companies', value: metrics.totalCompanies, icon: Building2, tab: 'companies' },
    { title: 'Total Candidates', value: metrics.totalCandidates, icon: Users, tab: 'resumes' },
    { title: 'AI Company Analyses', value: metrics.aiAnalyses, icon: BrainCircuit, tab: 'companies' },
    { title: 'Resumes Analysed', value: metrics.resumeAnalyses, icon: FileText, tab: 'resumes' },
    { title: 'Avg Candidate Score', value: `${metrics.averageResumeScore || 85}/100`, icon: CheckCircle, tab: 'candidates' },
    { title: 'Avg ATS Pass Score', value: `${metrics.averageAtsScore || 82}%`, icon: Percent, tab: 'resumes' },
    { title: 'AI Campaigns Scheduled', value: metrics.campaignPlans, icon: Target, tab: 'campaigns' },
  ];

  return (
    <div className="p-8 space-y-8 font-sans">
      {/* Header and Greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b-2 border-edit-text">
        <div>
          <h1 className="text-3xl font-serif italic tracking-tight text-edit-text leading-tight">
            Executive Oversight
          </h1>
          <p className="text-xs text-edit-sec mt-1.5 leading-relaxed">
            Welcome back, <span className="font-bold text-edit-text">{user?.name}</span>. Review real-time enterprise sourcing metrics.
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="text-edit-muted italic font-sans text-[11px]">Last Sync: Just now</span>
          <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.2em] bg-edit-dark text-edit-card px-3 py-1.5 shadow-sm">
            <Clock size={10} className="text-edit-accent" />
            <span>Live Analysis</span>
          </div>
        </div>
      </div>

      {/* Grid of Command Vitals with alternating high-contrast Editorial style */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {statCards.slice(0, 4).map((card, i) => {
          const Icon = card.icon;
          // Alternate the second card to be Dark Contrast exactly as the HTML template suggests
          const isDarkCard = i === 1;
          
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => onNavigateToTab(card.tab)}
              className={`p-6 flex flex-col justify-between cursor-pointer transition-all duration-200 group border relative ${
                isDarkCard 
                  ? 'bg-edit-dark text-edit-card border-edit-dark shadow-sm' 
                  : 'bg-edit-card text-edit-text border-edit-border hover:border-edit-text shadow-none'
              }`}
            >
              <div className="flex justify-between items-start">
                <span className={`text-[9px] font-bold uppercase tracking-widest ${isDarkCard ? 'text-edit-card/60' : 'text-edit-muted'}`}>
                  {card.title}
                </span>
                <Icon size={14} className={isDarkCard ? 'text-edit-accent' : 'text-edit-muted'} />
              </div>
              <div className="mt-4">
                <h3 className="text-4xl font-serif italic leading-none tracking-tight">
                  {card.value}
                </h3>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className={`text-[8px] font-bold uppercase tracking-widest ${isDarkCard ? 'text-edit-accent' : 'text-emerald-600'}`}>
                  +12% VS LAST MONTH
                </span>
                <div className={`flex items-center gap-1 text-[8px] font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity ${isDarkCard ? 'text-edit-card' : 'text-edit-text'}`}>
                  <span>Access</span>
                  <CornerDownRight size={8} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Secondary Metrics Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statCards.slice(4).map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.05 }}
              onClick={() => onNavigateToTab(card.tab)}
              className="p-4 bg-edit-card border border-edit-border rounded-none flex items-center justify-between shadow-none hover:border-edit-text cursor-pointer transition-all duration-150"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 border border-edit-border text-edit-accent">
                  <Icon size={14} />
                </div>
                <div>
                  <p className="text-[9px] font-bold text-edit-muted uppercase tracking-widest leading-none">{card.title}</p>
                  <h4 className="text-lg font-serif italic text-edit-text leading-tight mt-1">{card.value}</h4>
                </div>
              </div>
              <TrendingUp className="text-emerald-600" size={14} />
            </motion.div>
          );
        })}
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recruitment Volume Trends Area Chart */}
        <div className="lg:col-span-2 p-6 bg-edit-card border border-edit-border rounded-none flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4 border-b border-edit-divider">
            <div>
              <h3 className="font-serif text-lg italic text-edit-text">Campaign & Candidate Velocity</h3>
              <p className="text-[10px] text-edit-sec uppercase tracking-widest mt-0.5">Lead conversion vs processed credentials</p>
            </div>
            <span className="px-2.5 py-1 text-[8px] font-bold bg-edit-text text-edit-card uppercase tracking-wider">
              REAL-TIME SYNCD
            </span>
          </div>
          <div className="h-72 w-full mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hiringTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="clientGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1A1A1A" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#1A1A1A" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="candidateGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--editorial-border)" />
                <XAxis dataKey="month" tick={{ fontSize: 9, fill: 'var(--editorial-text-muted)' }} stroke="var(--editorial-border)" />
                <YAxis tick={{ fontSize: 9, fill: 'var(--editorial-text-muted)' }} stroke="var(--editorial-border)" />
                <Tooltip contentStyle={{ fontSize: 11, backgroundColor: 'var(--editorial-card)', borderColor: 'var(--editorial-border)', color: 'var(--editorial-text)' }} />
                <Area type="monotone" dataKey="clientGrowth" name="Outreach Leads" stroke="#1A1A1A" strokeWidth={1.5} fillOpacity={1} fill="url(#clientGrad)" />
                <Area type="monotone" dataKey="candidateIngest" name="Candidate Influx" stroke="#D4AF37" strokeWidth={1.5} fillOpacity={1} fill="url(#candidateGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Industry Sourcing Slices Pie Chart */}
        <div className="p-6 bg-edit-card border border-edit-border rounded-none flex flex-col justify-between">
          <div className="pb-4 border-b border-edit-divider">
            <h3 className="font-serif text-lg italic text-edit-text">Active Target Sectors</h3>
            <p className="text-[10px] text-edit-sec uppercase tracking-widest mt-0.5">Sourcing demands registered inside workspace</p>
          </div>
          <div className="h-60 w-full flex items-center justify-center mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metrics.industryDemand}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {metrics.industryDemand.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 11, backgroundColor: 'var(--editorial-card)', borderColor: 'var(--editorial-border)', color: 'var(--editorial-text)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-edit-divider">
            {metrics.industryDemand.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-1.5 overflow-hidden">
                <span className="w-2.5 h-2.5 shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                <span className="text-[10px] font-bold text-edit-sec uppercase tracking-wider truncate">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* AI Daily Insights, Recommendations & Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* AI Recruitment Insights & Market Intelligence Box */}
        <div className="p-6 bg-edit-dark text-edit-card rounded-none space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-white/10">
            <div className="p-2 border border-white/20 text-edit-accent">
              <BrainCircuit size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-edit-card">AI Daily Sourcing Brief</h3>
              <p className="text-[9px] text-edit-accent uppercase tracking-widest font-bold">Real-Time Synthesis</p>
            </div>
          </div>
          <div className="space-y-4">
            {metrics.aiInsights.map((insight, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <Lightbulb className="text-edit-accent shrink-0 mt-0.5" size={14} />
                <p className="text-xs leading-relaxed text-edit-card/80 font-serif italic">{insight}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Strategic Recommendations drawer */}
        <div className="p-6 bg-edit-card border border-edit-border rounded-none space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-edit-divider">
            <div className="p-2 border border-edit-border text-emerald-600">
              <Target size={16} />
            </div>
            <div>
              <h3 className="font-serif text-sm italic text-edit-text font-bold">Strategic Outreach Roadmap</h3>
              <p className="text-[9px] text-emerald-600 uppercase tracking-widest font-bold">Action Roadmap</p>
            </div>
          </div>
          <div className="space-y-3">
            {metrics.recommendations.map((rec, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-edit-bg border border-edit-border">
                <ShieldCheck className="text-emerald-600 shrink-0 mt-0.5" size={14} />
                <p className="text-xs leading-relaxed text-edit-sec font-sans">{rec}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="p-6 bg-edit-card border border-edit-border rounded-none space-y-4">
          <div className="pb-3 border-b border-edit-divider">
            <h3 className="font-serif text-sm italic text-edit-text font-bold">Workspace Operations Log</h3>
            <p className="text-[9px] text-edit-muted uppercase tracking-widest font-bold mt-0.5">Recruitment Pipeline History</p>
          </div>
          <div className="space-y-3 max-h-[220px] overflow-y-auto custom-scrollbar">
            {metrics.recentActivity.map((act) => (
              <div key={act.id} className="flex items-center justify-between p-2.5 border-b border-edit-divider hover:bg-edit-bg/50 transition-colors duration-150">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className={`w-1.5 h-1.5 shrink-0 ${act.type === 'resume' ? 'bg-edit-dark' : 'bg-edit-accent'}`}></div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-edit-text truncate leading-snug">{act.action}</p>
                    <p className="text-[10px] text-edit-muted truncate mt-0.5">Agent: {act.user}</p>
                  </div>
                </div>
                <span className="text-[9px] font-mono text-edit-muted shrink-0 ml-2">
                  {new Date(act.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
