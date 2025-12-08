import React, { useState, useEffect } from 'react';
import AppShell from './Layout/AppShell';
import { Settings as SettingsIcon, User, Bell, Key, Save, Shield, Loader, CheckCircle } from 'lucide-react';
import axios from 'axios';

const Settings = () => {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        user_name: 'Admin User',
        user_email: '',
        twilio_sid: '',
        twilio_token: '',
        whatsapp_number: '',
        email_notifications: 'true'
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                // Load local storage defaults
                const email = localStorage.getItem('userEmail') || 'admin@autowhat.com';
                
                // Fetch server settings
                const res = await axios.get('http://localhost:5000/api/settings');
                const serverSettings = res.data;
                
                setFormData(prev => ({
                    ...prev,
                    user_email: email,
                    ...serverSettings
                }));
            } catch (error) {
                console.error("Error fetching settings:", error);
            }
        };
        fetchSettings();
    }, []);

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked.toString() : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handleSave = async () => {
        setLoading(true);
        setSuccess(false);
        try {
            await axios.post('http://localhost:5000/api/settings', formData);
            // Also update local storage for sidebar
            localStorage.setItem('userEmail', formData.user_email);
            
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            console.error(error);
            alert('Failed to save settings');
        }
        setLoading(false);
    };

    return (
        <AppShell>
            <div className="max-w-4xl mx-auto space-y-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
                    <p className="text-slate-500">Manage your account and application preferences</p>
                </div>

                {/* Profile Section */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <User size={20} />
                        </div>
                        <h2 className="font-bold text-slate-800">Profile Information</h2>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
                                <input 
                                    name="user_name"
                                    value={formData.user_name}
                                    onChange={handleChange}
                                    type="text" 
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-3 outline-none focus:border-orange-500 transition-colors" 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
                                <input 
                                    name="user_email"
                                    value={formData.user_email}
                                    onChange={handleChange}
                                    type="email" 
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-3 outline-none focus:border-orange-500 transition-colors" 
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* API Configuration */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                        <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                            <Key size={20} />
                        </div>
                        <h2 className="font-bold text-slate-800">API Configuration</h2>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Twilio Account SID</label>
                            <input 
                                name="twilio_sid"
                                value={formData.twilio_sid}
                                onChange={handleChange}
                                type="password" 
                                placeholder="AC................................" 
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-3 outline-none focus:border-orange-500 transition-colors" 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Auth Token</label>
                            <input 
                                name="twilio_token"
                                value={formData.twilio_token}
                                onChange={handleChange}
                                type="password" 
                                placeholder="................................" 
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-3 outline-none focus:border-orange-500 transition-colors" 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">WhatsApp Phone Number</label>
                            <input 
                                name="whatsapp_number"
                                value={formData.whatsapp_number}
                                onChange={handleChange}
                                type="text" 
                                placeholder="+1234567890" 
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-3 outline-none focus:border-orange-500 transition-colors" 
                            />
                        </div>
                    </div>
                </div>

                 {/* Notifications */}
                 <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                        <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                            <Bell size={20} />
                        </div>
                        <h2 className="font-bold text-slate-800">Notifications</h2>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-medium text-slate-900">Email Notifications</h3>
                                <p className="text-sm text-slate-500">Receive emails about campaign status.</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    name="email_notifications"
                                    type="checkbox" 
                                    className="sr-only peer" 
                                    checked={formData.email_notifications === 'true'}
                                    onChange={handleChange}
                                />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                            </label>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4 gap-4">
                    {success && <span className="text-emerald-600 flex items-center gap-2 font-medium"><CheckCircle size={18} /> Settings saved!</span>}
                    <button 
                        onClick={handleSave}
                        disabled={loading}
                        className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-lg font-bold transition-colors flex items-center gap-2 shadow-lg shadow-slate-900/10 disabled:opacity-70"
                    >
                        {loading ? <Loader size={18} className="animate-spin" /> : <Save size={18} />}
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </AppShell>
    );
};

export default Settings;
