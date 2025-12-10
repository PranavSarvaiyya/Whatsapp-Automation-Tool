import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, User, KeyRound, ChevronRight } from 'lucide-react';
import { API_URL } from '../config';

const Signup = () => {
    const [formData, setFormData] = useState({ username: '', password: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }

        try {
            const res = await axios.post(`${API_URL}/api/signup`, {
                username: formData.username,
                password: formData.password
            });
            if (res.data.success) {
                navigate('/login');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Signup failed. Username might be taken.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="p-8 bg-white">
                    <div className="mb-8 text-center">
                        <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4 text-orange-600">
                            <UserPlus size={24} />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-800">Create Account</h1>
                        <p className="text-slate-500 mt-2">Join to start automating your messages</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700">Username</label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 text-slate-400" size={18} />
                                <input 
                                    type="text" 
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-sm"
                                    placeholder="Choose a username"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700">Password</label>
                            <div className="relative">
                                <KeyRound className="absolute left-3 top-3 text-slate-400" size={18} />
                                <input 
                                    type="password" 
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-sm"
                                    placeholder="Create password"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700">Confirm Password</label>
                            <div className="relative">
                                <KeyRound className="absolute left-3 top-3 text-slate-400" size={18} />
                                <input 
                                    type="password" 
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-sm"
                                    placeholder="Confirm password"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm text-center font-medium">
                                {error}
                            </div>
                        )}

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-orange-600/20 active:scale-[0.98] flex justify-center items-center gap-2"
                        >
                            {loading ? 'Creating Account...' : <>Sign Up <ChevronRight size={18} /></>}
                        </button>
                    </form>
                    
                    <div className="mt-6 text-center text-sm text-slate-500">
                        Already have an account?{' '}
                        <Link to="/login" className="text-orange-600 font-bold hover:underline">
                            Log In
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
