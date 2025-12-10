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
            <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-2xl px-2">
                <div className="bg-gray-900/95 backdrop-blur-lg border border-gray-800 rounded-full shadow-2xl shadow-black/40">
                    <div className="flex items-center justify-between px-2 sm:px-3 py-2.5 sm:py-3 gap-1 sm:gap-2">
                        {/* Home Button */}
                        <Link
                            to="/"
                            className={`flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-full transition-all flex-shrink-0 ${isActive('/')
                                ? 'bg-cyan-500/20 text-cyan-400'
                                : 'hover:bg-gray-800 text-gray-400'
                                }`}
                            title="Home"
                        >
                            <Home size={18} className="sm:w-5 sm:h-5" />
                            <span className="hidden xs:inline text-xs sm:text-sm font-medium whitespace-nowrap">
                                Home
                            </span>
                        </Link>

                        {/* Profile Button */}
                        <Link
                            to="/profile"
                            className={`flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-full transition-all flex-shrink-0 ${isActive('/profile')
                                ? 'bg-cyan-500/20 text-cyan-400'
                                : 'hover:bg-gray-800 text-gray-400'
                                }`}
                            title="Profile"
                        >
                            <User size={18} className="sm:w-5 sm:h-5" />
                            <span className="hidden xs:inline text-xs sm:text-sm font-medium whitespace-nowrap">
                                Profile
                            </span>
                        </Link>

                        {/* Separator - Hidden on Mobile */}
                        <div className="hidden md:block w-px h-6 sm:h-8 bg-gray-700 mx-0.5 sm:mx-1"></div>

                        {/* Create Room Button (Primary Action) */}
                        <Link
                            to="/create-room"
                            className="flex items-center justify-center gap-1.5 sm:gap-2 bg-cyan-500 hover:bg-cyan-400 text-black px-3 sm:px-5 py-2 sm:py-2.5 rounded-full transition-all font-semibold shadow-lg shadow-cyan-500/30 flex-shrink-0 hover:scale-105 active:scale-95"
                        >
                            <PlusCircle size={18} className="sm:w-5 sm:h-5" strokeWidth={2.5} />
                            <span className="text-xs sm:text-sm whitespace-nowrap">Create</span>
                        </Link>

                        {/* Separator - Hidden on Mobile */}
                        <div className="hidden md:block w-px h-6 sm:h-8 bg-gray-700 mx-0.5 sm:mx-1"></div>

                        {/* Wallet Button */}
                        <Link
                            to="/wallet"
                            className={`flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-full transition-all flex-shrink-0 ${isActive('/wallet')
                                ? 'bg-cyan-500/20 text-cyan-400'
                                : 'hover:bg-gray-800 text-gray-400'
                                }`}
                            title="Wallet"
                        >
                            <Wallet size={18} className="sm:w-5 sm:h-5" />
                            <span className="hidden xs:inline text-xs sm:text-sm font-medium whitespace-nowrap">
                                Wallet
                            </span>
                        </Link>

                        {/* Transfer Button */}
                        <button
                            onClick={signOut}
                            className={`flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-full transition-all flex-shrink-0 ${isActive('/transfer')
                                ? 'bg-cyan-500/20 text-cyan-400'
                                : 'hover:bg-gray-800 text-gray-400'
                                }`}
                            title="Transfer"
                        >
                            <ArrowRightLeft size={18} className="sm:w-5 sm:h-5" />
                            <span className="hidden xs:inline text-xs sm:text-sm font-medium whitespace-nowrap">
                                Transfer
                            </span>
                        </button>
                    </div>
                </div>
            </nav>
        </div>
    );
};

export default Layout;