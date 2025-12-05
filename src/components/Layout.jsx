import { Link, useLocation, Outlet } from 'react-router-dom';
import { Home, PlusCircle, Wallet, ArrowRightLeft, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
    const { profile, signOut } = useAuth();
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    return (
        <div className="min-h-screen bg-background text-white flex flex-col">
            {/* Top Header */}
            <header className="bg-surface border-b border-gray-800 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center font-bold text-black text-xl">
                        <img
                            src="https://img.freepik.com/premium-vector/dragon-esport-logo_91719-96.jpg"
                            alt="Logo"
                            className="w-full h-full rounded-full object-contain"
                        />
                    </div>
                    <h1 className="text-2xl font-bold tracking-wider">JEET 2.0</h1>
                </div>

                {/* User Profile - Desktop */}
                <div className="hidden md:flex items-center gap-4">
                    <div className="flex items-center gap-3 bg-gray-800/50 rounded-full px-4 py-2">
                        <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-sm">
                            {profile?.full_name?.[0] || 'U'}
                        </div>
                        <div>
                            <p className="font-medium text-sm">{profile?.full_name || 'User'}</p>
                            <p className="text-xs text-primary">Rs.{profile?.balance || 0}</p>
                        </div>
                    </div>
                    <button
                        onClick={signOut}
                        className="p-2 hover:bg-gray-800 rounded-lg transition-colors text-error"
                        title="Logout"
                    >
                        <LogOut size={20} />
                    </button>
                </div>

                {/* User Profile - Mobile */}
                <div className="md:hidden flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-sm">
                        {profile?.full_name?.[0] || 'U'}
                    </div>
                    <p className="text-sm text-primary">Rs.{profile?.balance || 0}</p>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto pb-24">
                <Outlet />
            </main>

            {/* Bottom Navigation Bar - Figma Style */}
            <nav className="fixed ml-5 p-5 bottom-6 left-1/2 -translate-x-1/2 z-50">
                <div className="bg-surface/95 backdrop-blur-lg border border-gray-800 rounded-full shadow-2xl shadow-black/40 px-3 py-3">
                    <div className="flex p-2 items-center gap-2">
                        {/* Left Section */}
                        <Link
                            to="/"
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-full transition-all ${isActive('/')
                                ? 'bg-primary/20 text-primary'
                                : 'hover:bg-gray-800 text-gray-400'
                                }`}
                            title="Dashboard"
                        >
                            <Home size={20} />
                            <span className="hidden sm:inline text-sm font-medium">Home</span>
                        </Link>

                        <Link
                            to="/profile"
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-full transition-all ${isActive('/profile')
                                ? 'bg-primary/20 text-primary'
                                : 'hover:bg-gray-800 text-gray-400'
                                }`}
                            title="Profile"
                        >
                            <User size={20} />
                            <span className="hidden sm:inline text-sm font-medium">Profile</span>
                        </Link>

                        {/* Separator */}
                        <div className="w-px h-8 bg-gray-700 mx-1"></div>

                        {/* Center - Create Room (Primary Action) */}
                        <Link
                            to="/create-room"
                            className={`flex items-center gap-2 bg-primary hover:bg-primary/90 text-black px-5 py-2.5 rounded-full transition-all font-semibold shadow-lg shadow-primary/30 ${isActive('/create-room')
                                ? 'bg-primary/20 text-white'
                                : 'hover:bg-gray-800 text-white-400'
                                }`}
                        >
                            <PlusCircle size={22} strokeWidth={2.5} />
                            <span className="text-sm">Create Room</span>
                        </Link>

                        {/* Separator */}
                        <div className="w-px h-8 bg-gray-700 mx-1"></div>

                        {/* Right Section */}
                        <button
                            className="flex items-center gap-2 px-4 py-2.5 rounded-full hover:bg-gray-800 text-gray-400 transition-all"
                            title="Top Up Wallet"
                        >
                            <Wallet size={20} />
                            <span className="hidden sm:inline text-sm font-medium">Wallet</span>
                        </button>

                        <button
                            className="flex items-center gap-2 px-4 py-2.5 rounded-full hover:bg-gray-800 text-gray-400 transition-all"
                            title="Transfer Funds"
                        >
                            <ArrowRightLeft size={20} />
                            <span className="hidden sm:inline text-sm font-medium">Transfer</span>
                        </button>
                    </div>
                </div>
            </nav>
        </div>
    );
};

export default Layout;