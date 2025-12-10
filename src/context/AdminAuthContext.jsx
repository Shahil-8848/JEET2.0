
import { createContext, useContext, useState, useEffect } from 'react';

const AdminAuthContext = createContext();

export const useAdminAuth = () => useContext(AdminAuthContext);

export const AdminAuthProvider = ({ children }) => {
    const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check local storage on mount
        const storedAuth = localStorage.getItem('adminAuth');
        if (storedAuth === 'true') {
            setIsAdminAuthenticated(true);
        }
        setLoading(false);
    }, []);

    const login = (password) => {
        // HARDCODED PASSWORD FOR MVP AS REQUESTED
        // In a real app, this should be server-side validated or use a hash
        if (password === 'admin123') {
            localStorage.setItem('adminAuth', 'true');
            setIsAdminAuthenticated(true);
            return true;
        }
        return false;
    };

    const logout = () => {
        localStorage.removeItem('adminAuth');
        setIsAdminAuthenticated(false);
    };

    return (
        <AdminAuthContext.Provider value={{ isAdminAuthenticated, login, logout, loading }}>
            {children}
        </AdminAuthContext.Provider>
    );
};
