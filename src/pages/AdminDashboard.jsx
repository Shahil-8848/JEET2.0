import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const navigate = useNavigate();

    // Simple admin check (In production, use RLS or custom claims)
    // For MVP, we assume the user with specific email is admin or we just check if they can access this page.
    // The user provided credentials for admin.

    useEffect(() => {
        fetchMatches();
    }, []);

    const fetchMatches = async () => {
        try {
            const { data, error } = await supabase
                .from('matches')
                .select('*, host:users!host_id(full_name), opponent:users!opponent_id(full_name)')
                .eq('status', 'COMPLETED')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setMatches(data);
        } catch (error) {
            console.error('Error fetching matches:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (match, winnerId) => {
        if (!confirm('Are you sure you want to verify this winner?')) return;

        try {
            const { data, error } = await supabase.rpc('verify_match_result', {
                p_match_id: match.id,
                p_winner_id: winnerId
            });

            if (error) throw error;
            if (!data.success) throw new Error(data.error);

            toast.success('Match verified and prize credited!');
            fetchMatches();

        } catch (error) {
            console.error('Error verifying match:', error);
            toast.error(error.message || 'Failed to verify match');
        }
    };

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto bg-background min-h-screen text-white">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <button onClick={() => navigate('/')} className="text-gray-400 hover:text-white">Back to App</button>
            </div>

            <div className="bg-surface rounded-xl border border-gray-800 overflow-hidden">
                <div className="p-6 border-b border-gray-800">
                    <h2 className="text-xl font-bold">Pending Verifications</h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-900/50 text-gray-400 text-sm">
                            <tr>
                                <th className="p-4">Match ID</th>
                                <th className="p-4">Game</th>
                                <th className="p-4">Host</th>
                                <th className="p-4">Opponent</th>
                                <th className="p-4">Prize</th>
                                <th className="p-4">Screenshot</th>
                                <th className="p-4">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {matches.length > 0 ? (
                                matches.map(match => (
                                    <tr key={match.id} className="hover:bg-gray-800/50 transition-colors">
                                        <td className="p-4 font-mono text-xs">{match.id.slice(0, 8)}</td>
                                        <td className="p-4">{match.game_type}</td>
                                        <td className="p-4">{match.host?.full_name}</td>
                                        <td className="p-4">{match.opponent?.full_name || 'N/A'}</td>
                                        <td className="p-4 text-primary font-bold">Rs.{match.prize_amount}</td>
                                        <td className="p-4">
                                            {match.screenshot_url ? (
                                                <a href={match.screenshot_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline text-xs">
                                                    View Image
                                                </a>
                                            ) : (
                                                <span className="text-gray-500 text-xs">No Image</span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleVerify(match, match.host_id)}
                                                    className="bg-success/20 text-success hover:bg-success/30 px-3 py-1 rounded text-xs font-bold"
                                                    title="Verify Host as Winner"
                                                >
                                                    Host Won
                                                </button>
                                                <button
                                                    onClick={() => handleVerify(match, match.opponent_id)}
                                                    className="bg-primary/20 text-primary hover:bg-primary/30 px-3 py-1 rounded text-xs font-bold"
                                                    title="Verify Opponent as Winner"
                                                >
                                                    Opponent Won
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="p-8 text-center text-gray-500">
                                        No completed matches to verify.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
