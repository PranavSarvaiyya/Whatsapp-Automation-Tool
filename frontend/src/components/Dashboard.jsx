import React, { useState, useEffect } from 'react';
import { Send, Clock, AlertCircle, CheckCircle2, ChevronRight, MoreHorizontal, Filter, Plus } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import AppShell from './Layout/AppShell';
import { StatCard } from './ui/StatCard';

const Dashboard = () => {
    const [messages, setMessages] = useState([]);
    const [formData, setFormData] = useState({ phoneNumber: '', message: '', scheduledTime: '' });
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(false);
    const [filterType, setFilterType] = useState('all');
    const [activeMenuId, setActiveMenuId] = useState(null);

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/messages/${id}`);
            fetchMessages();
            setStatus({ type: 'success', text: 'Message deleted' });
        } catch (error) {
            console.error("Error deleting message:", error);
            setStatus({ type: 'error', text: 'Failed to delete' });
        }
        setActiveMenuId(null);
    };

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 10000);
        return () => clearInterval(interval);
    }, []);

    const fetchMessages = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/messages');
            setMessages(res.data);
        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    };

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus(null);
        try {
            if (!formData.phoneNumber || !formData.message || !formData.scheduledTime) {
                setStatus({ type: 'error', text: 'All fields required' });
                setLoading(false);
                return;
            }
            const formattedTime = formData.scheduledTime.replace('T', ' ');
            await axios.post('http://localhost:5000/api/schedule', { ...formData, scheduledTime: formattedTime });
            setStatus({ type: 'success', text: 'Scheduled successfully' });
            setFormData({ phoneNumber: '', message: '', scheduledTime: '' });
            fetchMessages();
        } catch (error) {
            setStatus({ type: 'error', text: 'Failed to schedule' });
        }
        setLoading(false);
    };

    const stats = {
        total: messages.length,
        pending: messages.filter(m => m.status === 'pending').length,
        sent: messages.filter(m => m.status === 'sent').length,
        failed: messages.filter(m => m.status === 'failed').length,
    };

    const successRate = stats.total > 0 ? Math.round((stats.sent / stats.total) * 100) : 0;

    return (
        <AppShell>
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header Section */}
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
                    <p className="text-slate-500">Welcome back! Here's what's happening today.</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard label="Total Messages" value={stats.total} icon={<Send />} color="blue" trend="up" trendValue="+12%" />
                    <StatCard label="Pending Delivery" value={stats.pending} icon={<Clock />} color="orange" />
                    <StatCard label="Success Rate" value={`${successRate}%`} icon={<CheckCircle2 />} color="green" trend="up" trendValue="+2%" />
                    <StatCard label="Failed Attempts" value={stats.failed} icon={<AlertCircle />} color="red" trend="down" trendValue="-0.5%" />
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
                    {/* Left Column: Activity Table (Takes up 2 cols) */}
                    <div className="lg:col-span-2 flex flex-col gap-6">
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[600px]">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
                                <h3 className="font-bold text-slate-800 text-lg">Recent Campaigns</h3>
                                <button 
                                    onClick={() => {
                                        const types = ['all', 'pending', 'sent', 'failed'];
                                        const nextIdx = (types.indexOf(filterType) + 1) % types.length;
                                        setFilterType(types[nextIdx]);
                                    }}
                                    className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 flex items-center gap-2 text-sm"
                                    title={`Filter: ${filterType}`}
                                >
                                    <span className="uppercase font-semibold text-xs">{filterType !== 'all' && filterType}</span>
                                    <Filter size={20} className={filterType !== 'all' ? 'text-orange-500' : ''} />
                                </button>
                            </div>
                            
                            <div className="overflow-y-auto flex-1 p-0">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold sticky top-0">
                                        <tr>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4">Recipient</th>
                                            <th className="px-6 py-4">Message</th>
                                            <th className="px-6 py-4">Scheduled For</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        <AnimatePresence>
                                            {messages.filter(msg => filterType === 'all' || msg.status === filterType).map((msg) => (
                                                <motion.tr 
                                                    key={msg.id}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    layout
                                                    className="hover:bg-slate-50/50 transition-colors group relative"
                                                >
                                                    <td className="px-6 py-4">
                                                        <StatusBadge status={msg.status} />
                                                    </td>
                                                    <td className="px-6 py-4 font-medium text-slate-900">
                                                        {msg.phoneNumber}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="max-w-[200px] truncate text-slate-500 text-sm" title={msg.message}>
                                                            {msg.message}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-500 text-sm font-mono">
                                                        {msg.scheduledTime}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="relative inline-block">
                                                            <button 
                                                                onClick={() => setActiveMenuId(activeMenuId === msg.id ? null : msg.id)}
                                                                className="p-1 text-slate-400 hover:text-slate-600 rounded focus:outline-none"
                                                            >
                                                                <MoreHorizontal size={16} />
                                                            </button>
                                                            
                                                            {/* Action Dropdown */}
                                                            {activeMenuId === msg.id && (
                                                                <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-xl border border-slate-100 z-50 overflow-hidden">
                                                                    <button 
                                                                        onClick={() => handleDelete(msg.id)}
                                                                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                                                                    >
                                                                        Delete
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                        {/* Click outside listener could go here, but simple toggle works for now */}
                                                    </td>
                                                </motion.tr>
                                            ))}
                                            {messages.length === 0 && (
                                                <tr>
                                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                                                        No campaigns found. Start a new one!
                                                    </td>
                                                </tr>
                                            )}
                                        </AnimatePresence>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Quick Actions (Takes up 1 col) */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 sticky top-8">
                            <h3 className="font-bold text-slate-800 text-lg mb-6 flex items-center gap-2">
                                <Plus className="text-orange-500" size={20} />
                                Quick Schedule
                            </h3>
                            
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5 tracking-wider">Recipient</label>
                                    <input 
                                        type="text" 
                                        name="phoneNumber"
                                        placeholder="+1234567890"
                                        value={formData.phoneNumber}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-3 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-sm font-medium"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5 tracking-wider">Message Content</label>
                                    <textarea 
                                        name="message"
                                        rows="4"
                                        placeholder="Hello, here is your update..."
                                        value={formData.message}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-3 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-sm resize-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5 tracking-wider">Schedule Time</label>
                                    <input 
                                        type="datetime-local" 
                                        name="scheduledTime"
                                        value={formData.scheduledTime}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-3 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-sm font-medium [color-scheme:light]"
                                    />
                                </div>

                                <AnimatePresence>
                                    {status && (
                                        <motion.div 
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className={`text-xs p-3 rounded-lg flex items-center gap-2 ${status.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}
                                        >
                                            {status.type === 'error' ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />}
                                            {status.text}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <button 
                                    type="submit" 
                                    disabled={loading}
                                    className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-bold shadow-md shadow-orange-500/20 hover:shadow-orange-500/30 transition-all active:scale-[0.98] disabled:opacity-70 flex justify-center items-center gap-2 text-sm"
                                >
                                    {loading ? 'Scheduling...' : <>Schedule Campaign <ChevronRight size={16} /></>}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AppShell>
    );
};

const StatusBadge = ({ status }) => {
    const config = {
        pending: { color: 'bg-amber-100 text-amber-700', label: 'Queued' },
        sent: { color: 'bg-emerald-100 text-emerald-700', label: 'Delivered' },
        failed: { color: 'bg-red-100 text-red-700', label: 'Failed' },
    };
    const style = config[status] || config.pending;

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style.color}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5"></span>
            {style.label}
        </span>
    );
};

export default Dashboard;
