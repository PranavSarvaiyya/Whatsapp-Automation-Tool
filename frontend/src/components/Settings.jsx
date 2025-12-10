import React, { useState, useEffect } from 'react';
import AppShell from './Layout/AppShell';
import { User, Moon, Sun, Globe, Lock, Save, Loader, CheckCircle, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../config';

const Settings = () => {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [showPasswords, setShowPasswords] = useState(false);
    const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');
    const [username, setUsername] = useState('');
    const [timezone, setTimezone] = useState(localStorage.getItem('timezone') || 'Asia/Kolkata');
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [passwordError, setPasswordError] = useState('');

    useEffect(() => {
        // Get username from token or localStorage
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setUsername(payload.user || 'User');
            } catch (e) {
                setUsername('User');
            }
        }

        // Apply dark mode
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    const handleDarkModeToggle = () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        localStorage.setItem('darkMode', newMode.toString());
        if (newMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    const handleTimezoneChange = (e) => {
        const newTimezone = e.target.value;
        setTimezone(newTimezone);
        localStorage.setItem('timezone', newTimezone);
    };

    const handlePasswordChange = async () => {
        setPasswordError('');
        
        if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
            setPasswordError('All fields are required');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            setPasswordError('New password must be at least 6 characters');
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordError('New passwords do not match');
            return;
        }

        setLoading(true);
        try {
            await axios.post(`${API_URL}/api/change-password`, {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            }, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            setSuccess(true);
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            setPasswordError(error.response?.data?.error || 'Failed to change password');
        }
        setLoading(false);
    };

    const timezones = [
        { value: 'Asia/Kolkata', label: 'India (IST - UTC+5:30)' },
        { value: 'America/New_York', label: 'New York (EST - UTC-5)' },
        { value: 'America/Los_Angeles', label: 'Los Angeles (PST - UTC-8)' },
        { value: 'Europe/London', label: 'London (GMT - UTC+0)' },
        { value: 'Europe/Paris', label: 'Paris (CET - UTC+1)' },
        { value: 'Asia/Dubai', label: 'Dubai (GST - UTC+4)' },
        { value: 'Asia/Singapore', label: 'Singapore (SGT - UTC+8)' },
        { value: 'Asia/Tokyo', label: 'Tokyo (JST - UTC+9)' },
        { value: 'Australia/Sydney', label: 'Sydney (AEDT - UTC+11)' },
        { value: 'UTC', label: 'UTC (Universal Time)' }
    ];

    return (
        <AppShell>
            <div className="max-w-4xl mx-auto space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage your account and preferences</p>
                </div>

                {/* Account Section */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center gap-3">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                            <User size={20} />
                        </div>
                        <h2 className="font-bold text-slate-800 dark:text-white">Account</h2>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Username</label>
                            <input 
                                type="text" 
                                value={username}
                                disabled
                                className="w-full bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg py-2.5 px-3 text-slate-900 dark:text-white cursor-not-allowed" 
                            />
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Username cannot be changed</p>
                        </div>
                    </div>
                </div>

                {/* Password Change */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center gap-3">
                        <div className="p-2 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
                            <Lock size={20} />
                        </div>
                        <h2 className="font-bold text-slate-800 dark:text-white">Change Password</h2>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Current Password</label>
                            <div className="relative">
                                <input 
                                    type={showPasswords ? "text" : "password"}
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                                    className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg py-2.5 px-3 pr-10 outline-none focus:border-orange-500 dark:focus:border-orange-400 transition-colors text-slate-900 dark:text-white" 
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswords(!showPasswords)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                >
                                    {showPasswords ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">New Password</label>
                            <input 
                                type={showPasswords ? "text" : "password"}
                                value={passwordData.newPassword}
                                onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                                className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg py-2.5 px-3 outline-none focus:border-orange-500 dark:focus:border-orange-400 transition-colors text-slate-900 dark:text-white" 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Confirm New Password</label>
                            <input 
                                type={showPasswords ? "text" : "password"}
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                                className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg py-2.5 px-3 outline-none focus:border-orange-500 dark:focus:border-orange-400 transition-colors text-slate-900 dark:text-white" 
                            />
                        </div>
                        {passwordError && (
                            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
                                {passwordError}
                            </div>
                        )}
                        <button 
                            onClick={handlePasswordChange}
                            disabled={loading}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-70"
                        >
                            {loading ? 'Updating...' : 'Update Password'}
                        </button>
                    </div>
                </div>

                {/* Appearance */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center gap-3">
                        <div className="p-2 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg">
                            {darkMode ? <Moon size={20} /> : <Sun size={20} />}
                        </div>
                        <h2 className="font-bold text-slate-800 dark:text-white">Appearance</h2>
                    </div>
                    <div className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-medium text-slate-900 dark:text-white">Dark Mode</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Switch between light and dark themes</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    className="sr-only peer" 
                                    checked={darkMode}
                                    onChange={handleDarkModeToggle}
                                />
                                <div className="w-11 h-6 bg-slate-200 dark:bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Preferences */}
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center gap-3">
                        <div className="p-2 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg">
                            <Globe size={20} />
                        </div>
                        <h2 className="font-bold text-slate-800 dark:text-white">Preferences</h2>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Timezone</label>
                            <select 
                                value={timezone}
                                onChange={handleTimezoneChange}
                                className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg py-2.5 px-3 outline-none focus:border-orange-500 dark:focus:border-orange-400 transition-colors text-slate-900 dark:text-white"
                            >
                                {timezones.map(tz => (
                                    <option key={tz.value} value={tz.value}>{tz.label}</option>
                                ))}
                            </select>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Scheduled messages will use this timezone</p>
                        </div>
                    </div>
                </div>

                {success && (
                    <div className="flex items-center justify-center gap-2 p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg font-medium">
                        <CheckCircle size={18} />
                        Settings saved successfully!
                    </div>
                )}
            </div>
        </AppShell>
    );
};

export default Settings;
