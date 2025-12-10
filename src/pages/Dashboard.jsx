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
    { id: 'freefire', name: 'Free Fire', icon: 'https://play-lh.googleusercontent.com/1wE91ae_1YIJtIjQ1YJz5RhAajxEpF1TfrXGg7tcrKl90MOnF7XdFj71pw_MSQbyhM5PYz-eRdeBFQBzSGrV=w240-h480-rw', activeMatches: 8 },
    { id: 'chess', name: 'Chess', icon: 'https://img.lovepik.com/bg/20240415/iconic-chess-queen-a-stunning-golden-symbol-on-a-matte_5831117_wh860.jpg!/fw/860', activeMatches: 10 },
    { id: 'pes', name: 'E-Football', icon: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS7tng_68f95cmx5h0cMlR3jyjAJWBza17LtQ&s', activeMatches: 10 },
    { id: 'ml', name: 'Mobile Legends', icon: 'https://cdn.dribbble.com/userupload/45005925/file/000a0d6f10b27b5f25b53dcff0e2a0d0.png?resize=400x0', activeMatches: 5 },
    { id: 'ludo', name: 'Ludo', icon: 'https://as2.ftcdn.net/jpg/02/04/63/61/1000_F_204636161_W40AlnXasAyPTt2qCocOAdbqZpP5DvXZ.jpg', activeMatches: 15 },
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
        <div className="p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6">

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
                <h2 className="text-xl font-bold mb-4">Available Games</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {GAMES.map(game => (
                        <GameCard key={game.id} game={game} onSelect={handleGameSelect} />
                    ))}
                </div>
            </div>

            {/* Right Column: Recent Results & Profile */}
            <div className="lg:col-span-3 space-y-8">

                {/* Profile Card */}
                {/* Profile Card */}
                <div className="bg-surface p-6 rounded-xl border border-gray-800">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-black text-2xl font-bold">
                            {profile?.full_name?.[0] || 'P'}
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">{profile?.full_name || 'Player'}</h3>
                            <span className="bg-success/20 text-success text-xs px-2 py-1 rounded-full">Level 12 Player</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center mb-6">
                        <div className="bg-background p-2 rounded-lg">
                            <p className="text-primary font-bold">{stats.matches}</p>
                            <p className="text-[10px] text-gray-500">Matches</p>
                        </div>
                        <div className="bg-background p-2 rounded-lg">
                            <p className="text-success font-bold">{stats.wins}</p>
                            <p className="text-[10px] text-gray-500">Wins</p>
                        </div>
                        <div className="bg-background p-2 rounded-lg">
                            <p className="text-error font-bold">{stats.losses}</p>
                            <p className="text-[10px] text-gray-500">Losses</p>
                        </div>
                    </div>

                    {/* Game IDs */}
                    <div>
                        <h4 className="text-sm font-bold mb-3 text-gray-400">Game IDs</h4>
                        <div className="space-y-2">
                            <div className="bg-background p-2 rounded-lg flex items-center gap-3">
                                <div className="w-6 h-6 bg-purple-500/20 text-purple-500 rounded flex items-center justify-center text-xs">P</div>
                                <div>
                                    <p className="text-xs font-bold">PUBG Mobile</p>
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
    );
};

export default Dashboard;
