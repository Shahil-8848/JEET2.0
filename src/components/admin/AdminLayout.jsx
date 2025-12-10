import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { LayoutDashboard, Users, Gamepad2, ShieldCheck, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

const AdminLayout = () => {
    const { isAdminAuthenticated, loading, logout } = useAdminAuth();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    if (loading) return <div className="h-screen flex items-center justify-center bg-background text-white">Loading...</div>;
    if (!isAdminAuthenticated) return <Navigate to="/admin/login" />;

    const navItems = [
        { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/admin/users', icon: Users, label: 'User Management' },
        { path: '/admin/rooms', icon: Gamepad2, label: 'Rooms' },
        { path: '/admin/matches', icon: ShieldCheck, label: 'Match Verification' },
    ];

    return (
        <div className="min-h-screen bg-background text-white flex">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
        fixed md:static inset-y-0 left-0 z-50 w-64 bg-surface border-r border-white/5 transform transition-transform duration-200 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
                <div className="p-6 border-b border-white/5 flex justify-between items-center">
                    <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                        JEET 2.0
                    </h2>
                    <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-400">
                        <X size={24} />
                    </button>
                </div>

                <nav className="p-4 space-y-2">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setIsSidebarOpen(false)}
                            className={`
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                ${location.pathname === item.path
                                    ? 'bg-primary/20 text-primary font-semibold'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'}
              `}
                        >
                            <item.icon size={20} />
                            {item.label}
                        </Link>
                    ))}

                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all mt-8"
                    >
                        <LogOut size={20} />
                        Logout
                    </button>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Mobile Header */}
                <header className="md:hidden p-4 border-b border-white/5 bg-surface flex items-center justify-between">
                    <button onClick={() => setIsSidebarOpen(true)} className="text-white">
                        <Menu size={24} />
                    </button>
                    <span className="font-bold">Admin Panel</span>
                    <div className="w-6" /> {/* Spacer */}
                </header>

                <div className="flex-1 overflow-auto p-4 md:p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
