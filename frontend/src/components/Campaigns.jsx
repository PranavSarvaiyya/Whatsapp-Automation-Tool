import React, { useState, useEffect } from 'react';
import AppShell from './Layout/AppShell';
import { MessageSquare, Plus, X, Search, Filter, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

import { API_URL } from '../config';

const Campaigns = () => {
    const [campaigns, setCampaigns] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ phoneNumber: '', message: '', scheduledTime: '' });
    const [status, setStatus] = useState(null);

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const fetchCampaigns = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/messages`);
            setCampaigns(res.data);
        } catch (error) {
            console.error("Error fetching campaigns:", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
             // For datetime-local input, we need to replace T with space for backend if needed, 
             // but backend expects YYYY-MM-DD HH:MM. datetime-local gives YYYY-MM-DDTHH:MM
            const formattedTime = formData.scheduledTime.replace('T', ' ');
            await axios.post(`${API_URL}/api/schedule`, { ...formData, scheduledTime: formattedTime });
            
            fetchCampaigns();
            setIsModalOpen(false);
            setFormData({ phoneNumber: '', message: '', scheduledTime: '' });
            alert('Campaign scheduled successfully!');
        } catch (error) {
            console.error(error);
            alert('Failed to schedule campaign');
        }
        setLoading(false);
    };

    return (
        <AppShell>
             <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Campaigns</h1>
                        <p className="text-slate-500">Manage your messaging campaigns</p>
                    </div>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-md shadow-orange-500/20 flex items-center gap-2"
                    >
                        <Plus size={18} />
                        New Campaign
                    </button>
                </div>

                {/* Campaign Stats/Filter Bar could go here */}

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                            <tr>
                                <th className="px-6 py-4">Recipient</th>
                                <th className="px-6 py-4">Message</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Scheduled For</th>
                                <th className="px-6 py-4 text-right">Created At</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {campaigns.map((campaign) => (
                                <tr key={campaign.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-900 font-mono">{campaign.phoneNumber}</td>
                                    <td className="px-6 py-4">
                                        <div className="max-w-xs truncate text-slate-600" title={campaign.message}>
                                            {campaign.message}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            campaign.status === 'sent' ? 'bg-emerald-100 text-emerald-700' :
                                            campaign.status === 'failed' ? 'bg-red-100 text-red-700' :
                                            'bg-amber-100 text-amber-700'
                                        }`}>
                                            {campaign.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500 text-sm font-mono">{campaign.scheduledTime}</td>
                                    <td className="px-6 py-4 text-right text-slate-400 text-xs">
                                        {new Date(campaign.createdAt).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                            {campaigns.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                                        No campaigns found. click 'New Campaign' to start.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* New Campaign Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }} 
                            animate={{ opacity: 1, scale: 1, y: 0 }} 
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-2xl shadow-xl w-full max-w-lg relative z-10 overflow-hidden"
                        >
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <h3 className="font-bold text-lg text-slate-800">Create New Campaign</h3>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                                    <X size={20} />
                                </button>
                            </div>
                            
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone Number</label>
                                    <input 
                                        type="text" 
                                        required
                                        placeholder="+1234567890"
                                        value={formData.phoneNumber}
                                        onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-3 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Message Content</label>
                                    <textarea 
                                        required
                                        rows="4"
                                        placeholder="Type your message here..."
                                        value={formData.message}
                                        onChange={(e) => setFormData({...formData, message: e.target.value})}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-3 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all resize-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Schedule Time</label>
                                    <input 
                                        type="datetime-local" 
                                        required
                                        value={formData.scheduledTime}
                                        onChange={(e) => setFormData({...formData, scheduledTime: e.target.value})}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-3 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                                    />
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button 
                                        type="button" 
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 py-2.5 border border-slate-200 text-slate-600 font-semibold rounded-lg hover:bg-slate-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        disabled={loading}
                                        className="flex-1 py-2.5 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20"
                                    >
                                        {loading ? 'Scheduling...' : 'Schedule Campaign'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </AppShell>
    );
};

export default Campaigns;
