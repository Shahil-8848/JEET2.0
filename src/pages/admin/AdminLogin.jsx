import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { Lock } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminLogin = () => {
    const [password, setPassword] = useState('');
    const { login } = useAdminAuth();
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        if (login(password)) {
            toast.success('Welcome back, Admin');
            navigate('/admin/dashboard');
        } else {
            toast.error('Invalid Credentials');
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-surface border border-white/10 p-8 rounded-2xl shadow-2xl backdrop-blur-md">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4 text-primary">
                        <Lock size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-white">Admin Access</h1>
                    <p className="text-gray-400">Enter your secure password to continue</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-background/50 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                            placeholder="Password"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-primary hover:bg-primary/90 text-background font-bold py-3 rounded-lg transition-colors"
                    >
                        Authenticate
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
