import React, { useState } from 'react';
import { LayoutDashboard, MessageSquare, Settings, Users, Bell, Search, Menu, X, ChevronDown, LogOut, HelpCircle, FileText } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const AppShell = ({ children }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [isHelpOpen, setIsHelpOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <div className="flex h-screen w-full bg-slate-50 font-sans text-slate-900 overflow-hidden">
            {/* Sidebar Desktop */}
            <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200 h-full z-30 flex-shrink-0">
                <div className="p-6 border-b border-slate-100 flex items-center gap-3 h-16">
                    <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-md shadow-orange-500/20">
                        A
                    </div>
                    <span className="text-xl font-bold text-slate-900 tracking-tight">AutoWhat</span>
                </div>

                <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1 custom-scrollbar">
                    <NavItem to="/" icon={<LayoutDashboard />} label="Dashboard" />
                    <NavItem to="/campaigns" icon={<MessageSquare />} label="Campaigns" />
                    <NavItem to="/contacts" icon={<Users />} label="Contacts" />
                    <NavItem to="/settings" icon={<Settings />} label="Settings" />
                </nav>

                <div className="p-4 border-t border-slate-100">
                    <div 
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors relative"
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                    >
                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold border-2 border-white shadow-sm">
                            AD
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">User</p>
                            <p className="text-xs text-slate-500 truncate">{localStorage.getItem('userEmail') || 'user@example.com'}</p>
                        </div>
                        <ChevronDown size={16} className={`text-slate-400 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />

                        <AnimatePresence>
                            {showProfileMenu && (
                                <motion.div 
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="absolute bottom-full left-0 w-full mb-2 bg-white rounded-xl shadow-xl border border-slate-100 py-1 overflow-hidden"
                                >
                                    <button 
                                        onClick={handleLogout}
                                        className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                    >
                                        <LogOut size={16} /> Sign Out
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </aside>

            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
            )}
            
            {/* Sidebar Mobile */}
            <div className={`fixed inset-y-0 left-0 w-64 bg-white transform transition-transform duration-200 ease-in-out z-50 lg:hidden shadow-2xl ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                 <div className="p-6 border-b border-slate-100 flex justify-between items-center h-16">
                    <span className="text-xl font-bold">AutoWhat</span>
                    <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 hover:bg-slate-100 rounded-lg"><X size={24}/></button>
                </div>
                <nav className="p-4 space-y-2">
                    <NavItem to="/" icon={<LayoutDashboard />} label="Dashboard" onClick={() => setIsMobileMenuOpen(false)} />
                    <NavItem to="/campaigns" icon={<MessageSquare />} label="Campaigns" onClick={() => setIsMobileMenuOpen(false)} />
                    <NavItem to="/settings" icon={<Settings />} label="Settings" onClick={() => setIsMobileMenuOpen(false)} />
                </nav>
            </div>

            {/* Main Content Area */}
            <main className="flex-1 lg:ml-0 flex flex-col min-w-0 overflow-hidden h-full relative bg-slate-50">
                {/* Topbar */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 z-20 flex-shrink-0 sticky top-0">
                    <div className="flex items-center gap-4">
                        <button className="lg:hidden p-2 text-slate-600 hover:bg-slate-50 rounded-lg" onClick={() => setIsMobileMenuOpen(true)}>
                            <Menu size={24} />
                        </button>
                    </div>

                    <div className="flex-1 max-w-2xl mx-auto px-4 hidden lg:block">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={20} />
                            <input 
                                type="text" 
                                placeholder="Search campaigns, contacts..." 
                                className="w-full pl-12 pr-4 py-2.5 rounded-full border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-sm font-medium"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Notifications */}
                        <div className="relative">
                            <button 
                                onClick={() => setShowNotifications(!showNotifications)}
                                className={`p-2.5 rounded-xl transition-colors relative ${showNotifications ? 'bg-orange-50 text-orange-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
                            >
                                <Bell size={20} />
                                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                            </button>
                            <AnimatePresence>
                                {showNotifications && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute top-full right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 origin-top-right"
                                    >
                                        <div className="p-4 border-b border-slate-50 flex justify-between items-center">
                                            <h3 className="font-bold text-sm">Notifications</h3>
                                            <button className="text-xs text-orange-600 font-medium hover:underline">Mark all read</button>
                                        </div>
                                        <div className="max-h-[300px] overflow-y-auto">
                                            <div className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer">
                                                <div className="flex gap-3">
                                                    <div className="w-2 h-2 mt-2 rounded-full bg-blue-500 flex-shrink-0" />
                                                    <div>
                                                        <p className="text-sm font-medium text-slate-800">Campaign Sent</p>
                                                        <p className="text-xs text-slate-500 mt-0.5">"Summer Sale" successfully sent to 500 contacts.</p>
                                                        <p className="text-[10px] text-slate-400 mt-1">2 mins ago</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-4 hover:bg-slate-50 transition-colors cursor-pointer">
                                                <div className="flex gap-3">
                                                    <div className="w-2 h-2 mt-2 rounded-full bg-orange-500 flex-shrink-0" />
                                                    <div>
                                                        <p className="text-sm font-medium text-slate-800">Quota Warning</p>
                                                        <p className="text-xs text-slate-500 mt-0.5">You have used 80% of your daily message quota.</p>
                                                        <p className="text-[10px] text-slate-400 mt-1">1 hour ago</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="h-6 w-px bg-slate-200 hidden lg:block"></div>
                        
                        {/* Help Button */}
                        <button 
                            onClick={() => setIsHelpOpen(true)}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-orange-600 transition-colors"
                        >
                            <HelpCircle size={18} />
                            <span className="hidden lg:inline">Help & Docs</span>
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 overflow-auto p-4 lg:p-8 bg-slate-50 relative">
                    <div className="max-w-7xl mx-auto h-full">
                        {children}
                    </div>
                </div>
            </main>

            {/* Help Modal */}
            <AnimatePresence>
                {isHelpOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }}
                            onClick={() => setIsHelpOpen(false)}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }} 
                            animate={{ opacity: 1, scale: 1, y: 0 }} 
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-2xl shadow-xl w-full max-w-2xl relative z-10 overflow-hidden"
                        >
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <h3 className="font-bold text-xl text-slate-800 flex items-center gap-2">
                                    <HelpCircle className="text-orange-500" /> Help & Documentation
                                </h3>
                                <button onClick={() => setIsHelpOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                                    <X size={20} />
                                </button>
                            </div>
                            
                            <div className="p-6 h-[400px] overflow-y-auto">
                                <div className="prose prose-slate max-w-none">
                                    <h4 className="flex items-center gap-2"><LayoutDashboard size={18} /> Getting Started</h4>
                                    <p>Welcome to AutoWhat! Use the sidebar to navigate between your Dashboard, Campaigns, Contacts, and Settings.</p>
                                    
                                    <h4 className="flex items-center gap-2"><MessageSquare size={18} /> Creating Campaigns</h4>
                                    <p>Go to the <strong>Campaigns</strong> tab and click "New Campaign". Enter the recipient's phone number, your message, and schedule a time. The system will automatically check for scheduled messages every minute.</p>
                                    
                                    <h4 className="flex items-center gap-2"><Users size={18} /> Managing Contacts</h4>
                                    <p>Use the <strong>Contacts</strong> tab to store your frequent contacts. You can add names, numbers, and tags to organize them.</p>

                                    <h4 className="flex items-center gap-2"><Settings size={18} /> Configuration</h4>
                                    <p>Make sure to configure your <strong>Twilio API Credentials</strong> in the Settings page for the messaging service to work securely.</p>
                                </div>
                                
                                <div className="mt-8 p-4 bg-orange-50 rounded-xl border border-orange-100">
                                    <p className="text-sm text-orange-800 font-medium">Need more help? Contact support at support@autowhat.com</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

const NavItem = ({ to, icon, label, onClick }) => (
    <NavLink 
        to={to} 
        onClick={onClick}
        className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${isActive ? 'bg-orange-50 text-orange-700 shadow-sm' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
    >
        {({ isActive }) => (
            <>
                {React.cloneElement(icon, { size: 18, className: isActive ? 'text-orange-600' : 'text-slate-400 group-hover:text-slate-600 transition-colors' })}
                <span>{label}</span>
                {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-500" />}
            </>
        )}
    </NavLink>
);

export default AppShell;
