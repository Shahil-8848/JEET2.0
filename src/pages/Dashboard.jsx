import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import MatchCard from '../components/MatchCard';
import GameCard from '../components/GameCard';
import ResultCard from '../components/ResultCard';
import { Loader2 } from 'lucide-react';

const GAMES = [
    { id: 'pubg', name: 'PUBG Mobile', icon: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSh-7jSA0o27ZSlj0_0_MS_7QMvQ3BZEHTgqOFKiT_74j5AX3VfkbumACiuT379nJr8b7M&usqp=CAU', activeMatches: 12 },
    { id: 'freefire', name: 'Free Fire', icon: 'https://www.fantastick.in/cdn/shop/products/PRGA032.jpg?v=1704274073', activeMatches: 8 },
    { id: 'cod', name: 'Call of Duty', icon: 'https://www.citypng.com/public/uploads/preview/hd-call-of-duty-mobile-codm-game-official-logo-png-7017516947877289uky0ombog.png', activeMatches: 10 },
    { id: 'pes', name: 'E-Football', icon: 'https://www.citypng.com/public/uploads/preview/hd-call-of-duty-mobile-codm-game-official-logo-png-7017516947877289uky0ombog.png', activeMatches: 10 },
    { id: '', name: 'Valorant', icon: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR8D40sFCMjdpEJhjtFbI58RD11RADxkwcPXQ&s', activeMatches: 5 },
    { id: 'Ludo', name: 'Ludo', icon: 'https://as2.ftcdn.net/jpg/02/04/63/61/1000_F_204636161_W40AlnXasAyPTt2qCocOAdbqZpP5DvXZ.jpg', activeMatches: 15 },
];

const Dashboard = () => {
    const { user, profile } = useAuth();
    const [newMatches, setNewMatches] = useState([]);
    const [liveMatches, setLiveMatches] = useState([]);
    const [recentResults, setRecentResults] = useState([]);
    const [stats, setStats] = useState({ matches: 0, wins: 0, losses: 0 });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            fetchDashboardData();
        }

        // Realtime subscription
        const subscription = supabase
            .channel('public:matches')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, () => {
                fetchDashboardData();
            })
            .subscribe();

        return () => {
            subscription.unsubscribe();

        };
    }, [user]);

    // ... (imports remain)

    const fetchDashboardData = async () => {
        try {
            // Fetch Pending Matches (Open Lobbies)
            const { data: pending } = await supabase
                .from('matches')
                .select('*, host:users!host_id(full_name)')
                .eq('status', 'PENDING')
                .order('created_at', { ascending: false })
                .limit(5);

            if (pending) setNewMatches(pending);

            // Fetch Live Matches (Strictly LIVE)
            const { data: active } = await supabase
                .from('matches')
                .select('*, host:users!host_id(full_name)')
                .eq('status', 'LIVE')
                .order('created_at', { ascending: false });

            // Note: We might want to filter COMPLETED matches to only show if *I* am a participant?
            // For now, listing all 'Active' matches is okay as it lets users spectate too.
            // But generally, the user wants "My Matches".
            // Let's refine this: The Dashboard shows "Live Matches" generally.
            // If I am a player in a COMPLETED match, I need to see it.

            if (active) setLiveMatches(active);



            // Fetch Recent Results (Completed)
            const { data: results } = await supabase
                .from('matches')
                .select('*, winner:users!winner_id(full_name)')
                .eq('status', 'COMPLETED')
                .order('created_at', { ascending: false })
                .limit(5);

            if (results) {
                const formattedResults = results.map(match => ({
                    ...match,
                    winner_name: match.winner?.full_name || 'Unknown'
                }));
                setRecentResults(formattedResults);
            }

            // Fetch User Stats
            if (user) {
                const { data: userMatches, error } = await supabase
                    .from('matches')
                    .select('winner_id, host_id, opponent_id')
                    .eq('status', 'COMPLETED')
                    .or(`host_id.eq.${user.id},opponent_id.eq.${user.id}`);

                if (userMatches) {
                    const totalMatches = userMatches.length;
                    const wins = userMatches.filter(m => m.winner_id === user.id).length;
                    const losses = totalMatches - wins;
                    setStats({ matches: totalMatches, wins, losses });
                }
            }

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleJoinMatch = (matchId) => {
        navigate(`/match/${matchId}`);
    };

    const handleGameSelect = (game) => {
        navigate('/create-room', { state: { gameType: game.name } });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full text-primary">
                <Loader2 className="animate-spin" size={48} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-[#0a0a0a] to-black text-white p-4 md:p-8">

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Left Column: Matches */}
                <div className="lg:col-span-4 space-y-8">

                    {/* New Matches */}
                    <section className="relative">
                        <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full opacity-20 pointer-events-none"></div>
                        <div className="relative">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold flex items-center gap-3 text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-200 shadow-primary drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]">
                                    <span className="w-2.5 h-2.5 bg-primary rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)]"></span>
                                    New Matches
                                </h2>
                                <button className="text-xs font-bold text-primary/80 hover:text-primary hover:underline uppercase tracking-wider transition-all">View All</button>
                            </div>
                            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                {newMatches.length > 0 ? (
                                    newMatches.map(match => (
                                        <MatchCard key={match.id} match={match} onJoin={handleJoinMatch} />
                                    ))
                                ) : (
                                    <div className="text-center p-10 bg-white/5 backdrop-blur-md rounded-2xl border border-white/5 text-gray-500">
                                        No pending matches found.
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Live Matches */}
                    <section className="relative">
                        <div className="absolute inset-0 bg-success/5 blur-3xl rounded-full opacity-20 pointer-events-none"></div>
                        <div className="relative">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold flex items-center gap-3 text-transparent bg-clip-text bg-gradient-to-r from-success to-green-200 drop-shadow-[0_0_10px_rgba(74,222,128,0.5)]">
                                    <span className="w-2.5 h-2.5 bg-success rounded-full animate-pulse shadow-[0_0_10px_rgba(74,222,128,0.8)]"></span>
                                    Live Matches
                                </h2>
                            </div>
                            <div className="space-y-4">
                                {liveMatches.length > 0 ? (
                                    liveMatches.map(match => (
                                        <MatchCard key={match.id} match={match} onJoin={handleJoinMatch} />
                                    ))
                                ) : (
                                    <div className="text-center p-10 bg-white/5 backdrop-blur-md rounded-2xl border border-white/5 text-gray-500">
                                        No live matches at the moment.
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                </div>

                {/* Center Column: Game Selection */}
                <div className="lg:col-span-5">
                    <h2 className="text-2xl font-bold mb-6 text-white drop-shadow-md">Available Games</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {GAMES.map(game => (
                            <GameCard key={game.id} game={game} onSelect={handleGameSelect} />
                        ))}
                    </div>
                </div>

                {/* Right Column: Recent Results & Profile */}
                <div className="lg:col-span-3 space-y-8">

                    {/* Profile Card */}
                    <div className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden group hover:border-white/20 transition-all">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                        <div className="flex items-center gap-5 mb-8 relative z-10">
                            <div className="w-16 h-16 bg-gradient-to-br from-primary to-cyan-600 rounded-2xl flex items-center justify-center text-black text-2xl font-bold shadow-[0_0_20px_rgba(34,211,238,0.3)] transform group-hover:rotate-6 transition-transform">
                                {profile?.full_name?.[0] || 'P'}
                            </div>
                            <div>
                                <h3 className="font-bold text-xl text-white">{profile?.full_name || 'Player'}</h3>
                                <span className="inline-block mt-1 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 text-yellow-400 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                    Premium Player
                                </span>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-3 text-center mb-6">
                            <div className="bg-black/40 p-3 rounded-xl border border-white/5 hover:border-primary/30 transition-colors">
                                <p className="text-primary font-bold text-lg">{stats.matches}</p>
                                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Matches</p>
                            </div>
                            <div className="bg-black/40 p-3 rounded-xl border border-white/5 hover:border-success/30 transition-colors">
                                <p className="text-success font-bold text-lg">{stats.wins}</p>
                                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Wins</p>
                            </div>
                            <div className="bg-black/40 p-3 rounded-xl border border-white/5 hover:border-red-500/30 transition-colors">
                                <p className="text-red-500 font-bold text-lg">{stats.losses}</p>
                                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Losses</p>
                            </div>
                        </div>

                        {/* Game IDs */}
                        <div>
                            <h4 className="text-xs font-bold mb-4 text-gray-500 uppercase tracking-widest">Game IDs</h4>
                            <div className="space-y-3">
                                <div className="bg-black/20 p-3 rounded-xl flex items-center gap-3 border border-white/5 hover:bg-white/5 transition-colors cursor-pointer">
                                    <div className="w-8 h-8 bg-purple-500/20 text-purple-400 rounded-lg flex items-center justify-center text-xs font-bold">P</div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-300">PUBG Mobile</p>
                                        <p className="text-[10px] text-gray-500">pubg_player123</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Results */}
                    <section>
                        <h2 className="text-xl font-bold mb-6 text-white">Recent Results</h2>
                        <div className="space-y-3">
                            {recentResults.length > 0 ? (
                                recentResults.map(result => (
                                    <ResultCard key={result.id} result={result} />
                                ))
                            ) : (
                                <div className="text-center p-6 bg-white/5 rounded-2xl border border-white/5 text-gray-600 text-sm">
                                    No recent results.
                                </div>
                            )}
                        </div>
                    </section>

                </div>

            </div>
        </div>
    );
};

export default Dashboard;
