import { useEffect, useState } from 'react';
import { Users, Gamepad2, Activity, Zap, TrendingUp, Shield, Radio, Trophy, DollarSign, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const StatCard = ({ title, value, icon: Icon, gradient, glowColor, trend }) => (
    <div className="group relative">
        {/* Glow effect */}
        <div className={`absolute -inset-0.5 ${gradient} rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-500 animate-pulse`}></div>

        {/* Card content */}
        <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-white/10 rounded-2xl p-6 backdrop-blur-xl overflow-hidden">
            {/* Animated background grid */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{
                    backgroundImage: `linear-gradient(${glowColor} 1px, transparent 1px), linear-gradient(90deg, ${glowColor} 1px, transparent 1px)`,
                    backgroundSize: '20px 20px'
                }}></div>
            </div>

            {/* Top gradient accent */}
            <div className={`absolute top-0 left-0 right-0 h-1 ${gradient}`}></div>

            {/* Icon with glow */}
            <div className="relative flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${gradient} bg-opacity-20 backdrop-blur-sm relative`}>
                    <div className={`absolute inset-0 ${gradient} blur-xl opacity-50`}></div>
                    <Icon className="relative z-10 text-white" size={24} />
                </div>
                {trend && (
                    <div className="flex items-center gap-1 text-green-400 text-sm font-semibold">
                        <TrendingUp size={16} />
                        <span>{trend}</span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="relative z-10">
                <h3 className="text-gray-400 text-sm font-medium mb-2 tracking-wide uppercase">{title}</h3>
                <p className="text-4xl font-bold text-white mb-1 tracking-tight">{value}</p>
            </div>

            {/* Bottom accent line */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        </div>
    </div>
);

const RecentMatch = ({ match }) => (
    <div className="group relative">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
        <div className="relative flex items-center justify-between p-4 rounded-xl bg-gray-800/30 border border-white/5 hover:border-white/10 transition-all backdrop-blur-sm">
            <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                    <Trophy size={20} className="text-purple-400" />
                </div>
                <div>
                    <p className="text-white font-semibold text-sm">{match.game_mode || 'Match'}</p>
                    <p className="text-gray-400 text-xs">{new Date(match.created_at).toLocaleDateString()}</p>
                </div>
            </div>
            <div className="text-right">
                <p className={`font-bold text-sm ${match.status === 'COMPLETED' ? 'text-green-400' :
                        match.status === 'WAITING' ? 'text-yellow-400' :
                            'text-gray-400'
                    }`}>
                    {match.status}
                </p>
            </div>
        </div>
    </div>
);

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeRooms: 0,
        completedMatches: 0,
        onlineUsers: 0
    });
    const [recentMatches, setRecentMatches] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
        fetchRecentMatches();
    }, []);

    const fetchStats = async () => {
        try {
            const { count: usersCount } = await supabase
                .from('users')
                .select('*', { count: 'exact', head: true });

            const { count: roomsCount } = await supabase
                .from('matches')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'WAITING');

            const { count: matchesCount } = await supabase
                .from('matches')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'COMPLETED');

            setStats({
                totalUsers: usersCount || 0,
                activeRooms: roomsCount || 0,
                completedMatches: matchesCount || 0,
                onlineUsers: Math.floor(Math.random() * 20) + 5 // Mock as before
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRecentMatches = async () => {
        try {
            const { data, error } = await supabase
                .from('matches')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(5);

            if (error) throw error;
            setRecentMatches(data || []);
        } catch (error) {
            console.error('Error fetching recent matches:', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white relative overflow-hidden">
            {/* Animated background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header */}
                <div className="mb-12">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="relative">
                            <Shield className="text-cyan-400" size={32} />
                            <div className="absolute inset-0 bg-cyan-400 blur-xl opacity-50"></div>
                        </div>
                        <div>
                            <h1 className="text-4xl font-black text-white mb-1 tracking-tight">
                                Command Center
                            </h1>
                            <p className="text-gray-400 text-sm">Real-time gaming platform analytics and control</p>
                        </div>
                    </div>

                    {/* Status indicator */}
                    <div className="flex items-center gap-2 mt-4">
                        <div className="relative flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20">
                            <Radio className="text-green-400 animate-pulse" size={16} />
                            <span className="text-green-400 text-sm font-semibold">All Systems Operational</span>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <StatCard
                        title="Total Players"
                        value={stats.totalUsers.toLocaleString()}
                        icon={Users}
                        gradient="bg-gradient-to-r from-cyan-500 to-blue-500"
                        glowColor="#06b6d4"
                    />
                    <StatCard
                        title="Active Rooms"
                        value={stats.activeRooms}
                        icon={Gamepad2}
                        gradient="bg-gradient-to-r from-purple-500 to-pink-500"
                        glowColor="#a855f7"
                    />
                    <StatCard
                        title="Live Players"
                        value={stats.onlineUsers}
                        icon={Activity}
                        gradient="bg-gradient-to-r from-green-500 to-emerald-500"
                        glowColor="#10b981"
                    />
                    <StatCard
                        title="Total Matches"
                        value={stats.completedMatches.toLocaleString()}
                        icon={Zap}
                        gradient="bg-gradient-to-r from-orange-500 to-red-500"
                        glowColor="#f97316"
                    />
                </div>

                {/* Bottom Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Recent Matches */}
                    <div className="lg:col-span-2 group relative">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-500"></div>
                        <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-white/10 rounded-2xl p-8 backdrop-blur-xl">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                                        <Clock className="text-purple-400" size={24} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white">Recent Activity</h3>
                                </div>
                                <button className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-sm text-gray-300 hover:text-white transition-all">
                                    View All
                                </button>
                            </div>

                            {/* Recent matches list */}
                            <div className="space-y-3">
                                {recentMatches.length > 0 ? (
                                    recentMatches.map((match, index) => (
                                        <RecentMatch key={match.id || index} match={match} />
                                    ))
                                ) : (
                                    <div className="text-center py-12">
                                        <Gamepad2 className="mx-auto text-gray-600 mb-3" size={48} />
                                        <p className="text-gray-500">No recent matches found</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="group relative">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-500"></div>
                        <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-white/10 rounded-2xl p-8 backdrop-blur-xl">
                            <h3 className="text-2xl font-bold text-white mb-6">Quick Actions</h3>
                            <div className="space-y-3">
                                {[
                                    { label: 'Manage Rooms', color: 'purple', icon: Gamepad2 },
                                    { label: 'View Transactions', color: 'blue', icon: DollarSign },
                                    { label: 'Player Reports', color: 'yellow', icon: TrendingUp },
                                    { label: 'System Settings', color: 'red', icon: Shield }
                                ].map((action) => {
                                    const colorClasses = {
                                        red: 'from-red-500 to-orange-500',
                                        yellow: 'from-yellow-500 to-orange-500',
                                        blue: 'from-cyan-500 to-blue-500',
                                        purple: 'from-purple-500 to-pink-500'
                                    };

                                    return (
                                        <button
                                            key={action.label}
                                            className="group/btn w-full relative"
                                        >
                                            <div className={`absolute -inset-0.5 bg-gradient-to-r ${colorClasses[action.color]} rounded-xl blur opacity-20 group-hover/btn:opacity-40 transition duration-300`}></div>
                                            <div className="relative flex items-center gap-3 p-4 rounded-xl bg-gray-800/50 border border-white/10 hover:border-white/20 transition-all backdrop-blur-sm">
                                                <action.icon size={20} className="text-gray-400 group-hover/btn:text-white transition-colors" />
                                                <span className="text-gray-300 group-hover/btn:text-white transition-colors font-medium">
                                                    {action.label}
                                                </span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;