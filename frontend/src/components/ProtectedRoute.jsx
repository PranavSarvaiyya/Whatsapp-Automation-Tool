import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';

const ProtectedRoute = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const token = localStorage.getItem('token');

    useEffect(() => {
        const verifyToken = async () => {
            if (!token) {
                setIsAuthenticated(false);
                return;
            }
            try {
                // Optional: Verify token with backend
                // await axios.get(`${API_URL}/api/verify-token`, { 
                //     headers: { Authorization: `Bearer ${token}` } 
                // });
                setIsAuthenticated(true);
            } catch (error) {
                localStorage.removeItem('token');
                setIsAuthenticated(false);
            }
        };
        verifyToken();
    }, [token]);

    if (isAuthenticated === null) {
        return <div className="h-screen flex items-center justify-center text-slate-400">Loading...</div>;
    }

    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
