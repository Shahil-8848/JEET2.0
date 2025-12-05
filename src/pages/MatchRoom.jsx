import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { Loader2, Copy, CheckCircle, AlertCircle, Upload, ShieldCheck } from 'lucide-react';

const MatchRoom = () => {
    const { id } = useParams();
    const { user, profile, refreshProfile } = useAuth();
    const navigate = useNavigate();

    const [match, setMatch] = useState(null);
    const [loading, setLoading] = useState(true);
    const [joinCode, setJoinCode] = useState('');
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchMatch();

        const subscription = supabase
            .channel(`match:${id}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'matches', filter: `id=eq.${id}` }, (payload) => {
                setMatch(payload.new);
            })
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, [id]);

    const fetchMatch = async () => {
        try {
            const { data, error } = await supabase
                .from('matches')
                .select('*, host:users!host_id(full_name), opponent:users!opponent_id(full_name)')
                .eq('id', id)
                .single();

            if (error) throw error;
            setMatch(data);
        } catch (error) {
            console.error('Error fetching match:', error);
            toast.error('Match not found');
            navigate('/');
        } finally {
            setLoading(false);
        }
    };

    const handleJoin = async () => {
        if (!user || !profile) return;

        if (joinCode !== match.room_code) {
            toast.error('Invalid Room Code');
            return;
        }

        setLoading(true);
        try {
            const { data, error } = await supabase.rpc('join_match', { match_id: match.id });

            if (error) throw error;
            if (!data.success) throw new Error(data.error);

            toast.success('Joined match successfully!');
            fetchMatch(); // Refresh to see updates
            refreshProfile(); // Refresh balance

        } catch (error) {
            console.error('Error joining match:', error);
            toast.error(error.message || 'Failed to join match');
        } finally {
            setLoading(false);
        }
    };

    const handleReady = async () => {
        if (!user) return;

        const isHost = user.id === match.host_id;

        // Optimistic Update
        setMatch(prev => ({
            ...prev,
            host_ready: isHost ? true : prev.host_ready,
            opponent_ready: !isHost ? true : prev.opponent_ready
        }));

        try {
            const update = isHost ? { host_ready: true } : { opponent_ready: true };
            const { error } = await supabase
                .from('matches')
                .update(update)
                .eq('id', match.id);

            if (error) throw error;

            // Check if both ready to set LIVE
            if (isHost && match.opponent_ready) {
                await supabase.from('matches').update({ status: 'LIVE' }).eq('id', match.id);
            } else if (!isHost && match.host_ready) {
                await supabase.from('matches').update({ status: 'LIVE' }).eq('id', match.id);
            }

        } catch (error) {
            console.error('Error setting ready:', error);
            toast.error('Failed to update status');
            // Revert optimistic update on error
            fetchMatch();
        }
    };

    const handleUploadResult = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${match.id}_${user.id}_${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('screenshots')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('screenshots')
                .getPublicUrl(filePath);

            const { data, error } = await supabase.rpc('submit_match_result', {
                p_match_id: match.id,
                p_screenshot_url: publicUrl
            });

            if (error) throw error;
            if (!data.success) throw new Error(data.error);

            toast.success('Result uploaded! Waiting for admin verification.');
            fetchMatch();

        } catch (error) {
            console.error('Error uploading result:', error);
            toast.error(error.message || 'Failed to upload result');
        } finally {
            setUploading(false);
        }
    };

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
    if (!match) return null;

    const isHost = user?.id === match.host_id;
    const isOpponent = user?.id === match.opponent_id;
    const isParticipant = isHost || isOpponent;

    if (!isParticipant && !match.opponent_id) {
        return (
            <div className="max-w-md mx-auto p-8 mt-10 bg-surface rounded-xl border border-gray-800 text-center">
                <h2 className="text-2xl font-bold mb-4">Join Match</h2>
                <p className="text-gray-400 mb-6">Enter the room code to join this {match.game_type} match.</p>
                <div className="mb-6">
                    <p className="text-sm text-gray-400">Entry Fee</p>
                    <p className="text-2xl font-bold text-warning">Rs.{match.entry_fee}</p>
                </div>
                <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    placeholder="Enter 4-digit Code"
                    className="w-full bg-background border border-gray-700 rounded-lg px-4 py-3 text-center text-xl tracking-widest mb-4 focus:border-primary outline-none"
                    maxLength={4}
                />
                <button
                    onClick={handleJoin}
                    className="w-full bg-primary text-black font-bold py-3 rounded-lg hover:bg-cyan-400 transition-colors"
                >
                    Pay & Join
                </button>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-3">
                        {match.game_type}
                        {match.status === 'LIVE' && <span className="bg-success text-black text-xs px-2 py-1 rounded animate-pulse">LIVE</span>}
                        {match.status === 'COMPLETED' && <span className="bg-primary text-black text-xs px-2 py-1 rounded">COMPLETED</span>}
                    </h1>
                    <p className="text-gray-400 text-sm">Match ID: {match.id.slice(0, 8)}</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-gray-400">Prize Pool</p>
                    <p className="text-2xl font-bold text-primary">Rs.{match.prize_amount}</p>
                </div>
            </div>

            {/* Room Code */}
            {isParticipant && (
                <div className="bg-surface p-6 rounded-xl border border-gray-800 mb-8 text-center">
                    <p className="text-gray-400 mb-2">Room Code</p>
                    <div className="flex items-center justify-center gap-4">
                        <span className="text-4xl font-mono font-bold tracking-widest">{match.room_code}</span>
                        <button
                            onClick={() => { navigator.clipboard.writeText(match.room_code); toast.success('Copied!'); }}
                            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            <Copy size={20} />
                        </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-4">Share this code with your opponent to start the match.</p>
                </div>
            )}

            {/* Match Status Message */}
            {match.status === 'LIVE' && (
                <div className="bg-gradient-to-r from-success/20 to-primary/20 p-6 rounded-xl border border-success/50 mb-8 text-center animate-pulse">
                    <h2 className="text-2xl font-bold text-white mb-2">Match is LIVE!</h2>
                    <p className="text-gray-300">
                        {isParticipant ? "Both players are ready. Good luck!" : "Spectating live match."}
                    </p>
                </div>
            )}

            {/* Players */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Host */}
                <div className={`bg-surface p-6 rounded-xl border ${match.host_ready ? 'border-success' : 'border-gray-800'} relative`}>
                    <div className="absolute top-4 right-4">
                        {match.host_ready ? <CheckCircle className="text-success" /> : <AlertCircle className="text-gray-600" />}
                    </div>
                    <p className="text-sm text-gray-400 mb-1">Host</p>
                    <h3 className="text-xl font-bold mb-4">{isHost ? 'You' : (match.host?.full_name || 'Host')}</h3>
                    {isHost && match.status === 'PENDING' && (
                        <button
                            onClick={handleReady}
                            disabled={match.host_ready}
                            className={`w-full py-2 rounded-lg font-bold ${match.host_ready ? 'bg-gray-700 text-gray-400' : 'bg-success text-black hover:bg-green-400'}`}
                        >
                            {match.host_ready ? 'Ready' : 'I am Ready'}
                        </button>
                    )}
                </div>

                {/* Opponent */}
                <div className={`bg-surface p-6 rounded-xl border ${match.opponent_ready ? 'border-success' : 'border-gray-800'} relative`}>
                    <div className="absolute top-4 right-4">
                        {match.opponent_ready ? <CheckCircle className="text-success" /> : <AlertCircle className="text-gray-600" />}
                    </div>
                    <p className="text-sm text-gray-400 mb-1">Opponent</p>
                    <h3 className="text-xl font-bold mb-4">
                        {match.opponent_id ? (isOpponent ? 'You' : (match.opponent?.full_name || 'Opponent')) : 'Waiting...'}
                    </h3>
                    {isOpponent && match.status === 'PENDING' && (
                        <button
                            onClick={handleReady}
                            disabled={match.opponent_ready}
                            className={`w-full py-2 rounded-lg font-bold ${match.opponent_ready ? 'bg-gray-700 text-gray-400' : 'bg-success text-black hover:bg-green-400'}`}
                        >
                            {match.opponent_ready ? 'Ready' : 'I am Ready'}
                        </button>
                    )}
                </div>
            </div>

            {/* Result Upload */}
            {isParticipant && match.status === 'LIVE' && (
                <div className="bg-surface p-6 rounded-xl border border-gray-800 text-center">
                    <h3 className="text-xl font-bold mb-4">Match in Progress</h3>
                    <p className="text-gray-400 mb-6">Play the match using the Room Code. Once finished, the winner must upload the screenshot.</p>

                    <div className="max-w-xs mx-auto">
                        <label className={`block w-full p-4 border-2 border-dashed border-gray-700 rounded-xl cursor-pointer hover:border-primary transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                            <input type="file" accept="image/*" onChange={handleUploadResult} className="hidden" />
                            <Upload className="mx-auto mb-2 text-gray-400" />
                            <span className="text-sm text-gray-400">{uploading ? 'Uploading...' : 'Upload Screenshot'}</span>
                        </label>
                    </div>
                </div>
            )}

            {match.status === 'COMPLETED' && (
                <div className="bg-surface p-6 rounded-xl border border-success/20 text-center">
                    <ShieldCheck className="mx-auto text-success mb-4" size={48} />
                    <h3 className="text-2xl font-bold mb-2">Match Completed</h3>
                    <p className="text-gray-400">Result uploaded. Waiting for admin verification.</p>
                    {match.screenshot_url && (
                        <img src={match.screenshot_url} alt="Result" className="mt-4 rounded-lg max-h-64 mx-auto border border-gray-700" />
                    )}
                </div>
            )}

        </div>
    );
};

export default MatchRoom;
