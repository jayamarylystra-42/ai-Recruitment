import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Building2, 
  FileText, 
  Users, 
  CalendarRange, 
  MessageSquareCode, 
  LineChart, 
  Sliders, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  Search,
  UserCheck2,
  BellRing,
  Mail
} from 'lucide-react';
import { User } from '../types';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  user: User | null;
  onLogout: () => void;
  notificationsCount: number;
}

export default function Sidebar({ currentTab, setCurrentTab, user, onLogout, notificationsCount }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['Admin', 'Recruiter', 'HR Manager', 'Viewer'] },
    { id: 'companies', label: 'Companies', icon: Building2, roles: ['Admin', 'Recruiter', 'HR Manager', 'Viewer'] },
    { id: 'outreach', label: 'AI Outreach', icon: Mail, roles: ['Admin', 'Recruiter', 'HR Manager', 'Viewer'] },
    { id: 'resumes', label: 'Resume Intelligence', icon: FileText, roles: ['Admin', 'Recruiter', 'HR Manager', 'Viewer'] },
    { id: 'candidates', label: 'Candidate Ranker', icon: Users, roles: ['Admin', 'Recruiter', 'HR Manager', 'Viewer'] },
    { id: 'campaigns', label: 'Campaign Planner', icon: CalendarRange, roles: ['Admin', 'Recruiter', 'HR Manager'] },
    { id: 'chat', label: 'Recruitment Assistant', icon: MessageSquareCode, roles: ['Admin', 'Recruiter', 'HR Manager', 'Viewer'] },
    { id: 'reports', label: 'Reports', icon: LineChart, roles: ['Admin', 'Recruiter', 'HR Manager', 'Viewer'] },
    { id: 'settings', label: 'Settings', icon: Sliders, roles: ['Admin', 'Recruiter', 'HR Manager', 'Viewer'] },
  ];

  const filteredNavItems = navItems.filter(item => {
    const roleAllowed = item.roles.includes(user?.role || 'Viewer');
    const matchesSearch = item.label.toLowerCase().includes(searchQuery.toLowerCase());
    return roleAllowed && matchesSearch;
  });

  return (
    <motion.div 
      className="flex flex-col h-screen bg-edit-card text-edit-text border-r border-edit-border shrink-0 z-30 font-sans"
      animate={{ width: isCollapsed ? '70px' : '260px' }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
    >
      {/* Platform Title */}
      <div className="flex items-center justify-between p-5 border-b border-edit-border">
        <AnimatePresence mode="wait">
          {!isCollapsed ? (
            <motion.div 
              key="expanded-logo"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex flex-col"
            >
              <div className="text-xl font-serif italic tracking-tighter border-b border-edit-text pb-1">
                Recruit.ai
              </div>
              <p className="text-[8px] uppercase tracking-[0.25em] mt-1 text-edit-muted font-bold">
                Enterprise Intelligence
              </p>
            </motion.div>
          ) : (
            <motion.div 
              key="collapsed-logo"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-8 h-8 rounded-none border border-edit-text flex items-center justify-center font-serif italic text-lg text-edit-text shadow-sm mx-auto"
            >
              R
            </motion.div>
          )}
        </AnimatePresence>

        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 hover:bg-edit-bg rounded-none text-edit-muted hover:text-edit-text transition-colors duration-200"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* User Session Profile Mini Card */}
      {!isCollapsed && user && (
        <div className="p-3 mx-3 my-4 rounded-none bg-edit-bg/40 border border-edit-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-edit-accent text-white flex items-center justify-center font-serif italic text-sm shadow-sm shrink-0">
              {user.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <h2 className="font-bold text-xs truncate text-edit-text leading-tight">{user.name}</h2>
              <p className="text-[10px] text-edit-muted truncate leading-tight mt-0.5">{user.email}</p>
              <span className="inline-block mt-1 px-1.5 py-0.5 text-[8px] font-bold bg-edit-text text-edit-card uppercase tracking-widest">
                {user.role}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      {!isCollapsed && (
        <div className="px-4 mb-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-edit-muted" />
            <input
              type="text"
              placeholder="Search features..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-edit-bg text-edit-text rounded-none border border-edit-border focus:outline-none focus:border-edit-accent placeholder-edit-muted/60 transition-all duration-150 font-sans"
            />
          </div>
        </div>
      )}

      {/* Navigation List */}
      <div className="flex-1 px-2 space-y-1 overflow-y-auto custom-scrollbar">
        {filteredNavItems.map((item) => {
          const isActive = currentTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all duration-150 rounded-none ${
                isActive 
                  ? 'bg-edit-dark text-edit-card font-black border-l-2 border-edit-accent' 
                  : 'text-edit-sec hover:text-edit-text hover:bg-edit-bg/80'
              }`}
            >
              <Icon size={14} className={isActive ? 'text-edit-accent' : 'text-edit-muted'} />
              {!isCollapsed && (
                <div className="flex-1 flex items-center justify-between">
                  <span className="truncate">{item.label}</span>
                  {item.id === 'resumes' && notificationsCount > 0 && (
                    <span className="px-1.5 py-0.5 text-[8px] bg-edit-accent/10 text-edit-accent border border-edit-accent/25 rounded-none font-bold">
                      {notificationsCount}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Logout Row */}
      <div className="p-3 border-t border-edit-border mt-auto">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2 text-[10px] uppercase tracking-widest rounded-none text-red-600 hover:bg-red-500/10 font-bold transition-colors duration-250"
        >
          <LogOut size={14} />
          {!isCollapsed && <span>Logout Session</span>}
        </button>
      </div>
    </motion.div>
  );
}
