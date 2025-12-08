import React, { useState, useEffect } from 'react';
import AppShell from './Layout/AppShell';
import { Users, Plus, X, Trash2, Search, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const Contacts = () => {
    const [contacts, setContacts] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ name: '', phoneNumber: '', tags: '' });

    useEffect(() => {
        fetchContacts();
    }, []);

    const fetchContacts = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/contacts');
            setContacts(res.data);
        } catch (error) {
            console.error("Error fetching contacts:", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(t => t);
            await axios.post('http://localhost:5000/api/contacts', { ...formData, tags: tagsArray });
            
            fetchContacts();
            setIsModalOpen(false);
            setFormData({ name: '', phoneNumber: '', tags: '' });
        } catch (error) {
            console.error(error);
            alert('Failed to add contact');
        }
        setLoading(false);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this contact?')) return;
        try {
            await axios.delete(`http://localhost:5000/api/contacts/${id}`);
            fetchContacts();
        } catch (error) {
            console.error(error);
            alert('Failed to delete contact');
        }
    };

    return (
        <AppShell>
             <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Contacts</h1>
                        <p className="text-slate-500">Manage your audience</p>
                    </div>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-md shadow-orange-500/20 flex items-center gap-2"
                    >
                        <Plus size={18} />
                        Add Contact
                    </button>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                            <tr>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Phone Number</th>
                                <th className="px-6 py-4">Tags</th>
                                <th className="px-6 py-4">Added On</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {contacts.map((contact) => (
                                <tr key={contact.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-900">{contact.name}</td>
                                    <td className="px-6 py-4 text-slate-600 font-mono text-sm">{contact.phoneNumber}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2 flex-wrap">
                                            {contact.tags.map((tag, idx) => (
                                                <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500 text-sm">
                                        {new Date(contact.created).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button 
                                            onClick={() => handleDelete(contact.id)}
                                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {contacts.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                                        No contacts found. Add one to get started!
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Contact Modal */}
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
                                <h3 className="font-bold text-lg text-slate-800">Add New Contact</h3>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
                                    <X size={20} />
                                </button>
                            </div>
                            
                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
                                    <input 
                                        type="text" 
                                        required
                                        placeholder="John Doe"
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-3 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                                    />
                                </div>
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
                                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tags (comma separated)</label>
                                    <input 
                                        type="text" 
                                        placeholder="VIP, Lead, Qualified"
                                        value={formData.tags}
                                        onChange={(e) => setFormData({...formData, tags: e.target.value})}
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
                                        {loading ? 'Adding...' : 'Add Contact'}
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

export default Contacts;
