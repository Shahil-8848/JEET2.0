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

    const fetchDashboardData = async () => {
        try {
            // Fetch Pending Matches
            const { data: pending } = await supabase
                .from('matches')
                .select('*, host:users!host_id(full_name)')
                .eq('status', 'PENDING')
                .order('created_at', { ascending: false })
                .limit(5);

            if (pending) setNewMatches(pending);

            // Fetch Live Matches
            const { data: live } = await supabase
                .from('matches')
                .select('*, host:users!host_id(full_name)')
                .eq('status', 'LIVE')
                .order('created_at', { ascending: false })
                .limit(5);

            if (live) setLiveMatches(live);

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
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <span className="w-2 h-2 bg-primary rounded-full"></span>
                            New Matches
                        </h2>
                        <button className="text-xs text-primary hover:underline">View All</button>
                    </div>
                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                        {newMatches.length > 0 ? (
                            newMatches.map(match => (
                                <MatchCard key={match.id} match={match} onJoin={handleJoinMatch} />
                            ))
                        ) : (
                            <div className="text-center p-8 bg-surface rounded-xl border border-gray-800 text-gray-500">
                                No pending matches found.
                            </div>
                        )}
                    </div>
                </section>

                {/* Live Matches */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <span className="w-2 h-2 bg-success rounded-full animate-pulse"></span>
                            Live Matches
                        </h2>
                    </div>
                    <div className="space-y-4">
                        {liveMatches.length > 0 ? (
                            liveMatches.map(match => (
                                <MatchCard key={match.id} match={match} onJoin={handleJoinMatch} />
                            ))
                        ) : (
                            <div className="text-center p-8 bg-surface rounded-xl border border-gray-800 text-gray-500">
                                No live matches at the moment.
                            </div>
                        )}
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
                    <h2 className="text-xl font-bold mb-4">Recent Results</h2>
                    <div className="space-y-3">
                        {recentResults.length > 0 ? (
                            recentResults.map(result => (
                                <ResultCard key={result.id} result={result} />
                            ))
                        ) : (
                            <div className="text-center p-4 text-gray-500 text-sm">
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
