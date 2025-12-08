import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, ArrowRight, Lock, Mail, User, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const Signup = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSignup = (e) => {
        e.preventDefault();
        setLoading(true);
        // Mock signup delay
        setTimeout(() => {
            localStorage.setItem('isAuthenticated', 'true');
            navigate('/');
            setLoading(false);
        }, 1500);
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { 
                duration: 0.5,
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -20 },
        visible: { opacity: 1, x: 0 }
    };

    return (
        <div className="flex h-screen w-full bg-slate-50 items-center justify-center p-4">
            <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-100 overflow-hidden"
            >
                <div className="p-8 pb-6 text-center border-b border-slate-50">
                    <motion.div 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                        className="w-12 h-12 bg-orange-500 rounded-xl mx-auto flex items-center justify-center text-white mb-4 shadow-lg shadow-orange-500/20"
                    >
                        <UserPlus size={24} strokeWidth={2.5} />
                    </motion.div>
                    <motion.h1 variants={itemVariants} className="text-2xl font-bold text-slate-800">Create Account</motion.h1>
                    <motion.p variants={itemVariants} className="text-slate-500 mt-2">Join AutoWhat to automate your business</motion.p>
                </div>

                <div className="p-8 pt-6">
                    <form onSubmit={handleSignup} className="space-y-4">
                        <motion.div variants={itemVariants}>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Full Name</label>
                            <div className="relative group">
                                <User className="absolute left-3.5 top-3.5 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={18} />
                                <input 
                                    type="text" 
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="John Doe"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium text-slate-800 placeholder-slate-400"
                                    required
                                />
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-3.5 top-3.5 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={18} />
                                <input 
                                    type="email" 
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="admin@autowhat.com"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium text-slate-800 placeholder-slate-400"
                                    required
                                />
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants}>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-3.5 top-3.5 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={18} />
                                <input 
                                    type="password" 
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium text-slate-800 placeholder-slate-400"
                                    required
                                />
                            </div>
                        </motion.div>

                        <motion.button 
                            variants={itemVariants}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit" 
                            disabled={loading}
                            className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold shadow-lg shadow-orange-500/30 hover:shadow-orange-500/40 transition-all disabled:opacity-70 flex justify-center items-center gap-2 mt-4"
                        >
                            {loading ? 'Creating Account...' : <>Get Started <ArrowRight size={18} /></>}
                        </motion.button>
                    </form>
                </div>
                
                <div className="p-4 bg-slate-50 text-center text-sm text-slate-500 border-t border-slate-100">
                    Already have an account? <Link to="/login" className="text-orange-600 font-semibold cursor-pointer hover:underline">Sign In</Link>
                </div>
            </motion.div>
        </div>
    );
};

export default Signup;
