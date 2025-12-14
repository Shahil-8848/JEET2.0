import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { Loader2, Copy, CheckCircle, Upload, ShieldCheck, ArrowLeft, Users, Trophy, Radio, Sparkles } from 'lucide-react';
import MatchRules from '../components/MatchRules';

const MatchRoom = () => {
    const { id } = useParams();
    const { user, profile, refreshProfile } = useAuth();
    const navigate = useNavigate();

    const [match, setMatch] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [joinCode, setJoinCode] = useState('');
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchMatchData();

        const channel = supabase
            .channel(`match_room:${id}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'matches', filter: `id=eq.${id}` }, (payload) => {
                setMatch(current => ({ ...current, ...payload.new }));
            })
            .on('postgres_changes', { event: '*', schema: 'public', table: 'match_participants', filter: `match_id=eq.${id}` }, () => {
                fetchParticipants(); // Refresh list on any change
            })
            .subscribe();

        return () => {
            channel.unsubscribe();
        };
    }, [id]);

    const fetchMatchData = async () => {
        try {
            const { data, error } = await supabase
                .from('matches')
                .select('*, host:users!host_id(full_name)')
                .eq('id', id)
                .single();

            if (error) throw error;
            setMatch(data);
            fetchParticipants();
        } catch (error) {
            console.error('Error fetching match:', error);
            toast.error('Match not found');
            navigate('/');
        } finally {
            setLoading(false);
        }
    };

    const fetchParticipants = async () => {
        const { data, error } = await supabase
            .from('match_participants')
            .select('*, user:users(full_name, id)')
            .eq('match_id', id);

        if (!error && data) {
            setParticipants(data);
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
            const { data, error } = await supabase.rpc('join_match', { p_match_id: match.id });

            if (error) throw error;
            if (!data.success) throw new Error(data.error);

            toast.success('Joined match successfully!');
            fetchMatchData();
            refreshProfile();

        } catch (error) {
            console.error('Error joining match:', error);
            toast.error(error.message || 'Failed to join match');
        } finally {
            setLoading(false);
        }
    };

    const handleReady = async () => {
        if (!user) return;

        // Optimistic Update
        setParticipants(prev => prev.map(p =>
            p.user_id === user.id ? { ...p, is_ready: true } : p
        ));

        try {
            const { data, error } = await supabase.rpc('set_participant_ready', { p_match_id: match.id });

            if (error) throw error;

            // Check if live via fetch not needed if subscription works, but let's be safe
            // RPC handles setting status to LIVE if all ready

        } catch (error) {
            console.error('Error setting ready:', error);
            toast.error('Failed to update status');
            fetchParticipants(); // Revert
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
            fetchMatchData();

        } catch (error) {
            console.error('Error uploading result:', error);
            toast.error(error.message || 'Failed to upload result');
        } finally {
            setUploading(false);
        }
    };

    if (loading) return <div className="flex justify-center items-center h-screen bg-background"><Loader2 className="animate-spin text-primary" size={48} /></div>;
    if (!match) return null;

    const isParticipant = participants.some(p => p.user_id === user?.id);
    const myParticipantData = participants.find(p => p.user_id === user?.id);
    const slots = Array.from({ length: match.max_players || 2 });

    // NON-PARTICIPANT VIEW (JOIN SCREEN)
    if (!isParticipant && match.status === 'PENDING') {
        return (
            <div className="min-h-screen bg-background p-4 md:p-8 flex items-center justify-center relative overflow-hidden">
                {/* Background Blobs */}
                <div className="absolute top-0 left-0 w-96 h-96 bg-primary/20 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

                <div className="max-w-md w-full relative z-10">
                    <button onClick={() => navigate('/')} className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                        <ArrowLeft size={18} /> Back to Dashboard
                    </button>

                    <div className="bg-surface/80 backdrop-blur-xl p-8 rounded-2xl border border-gray-800 shadow-2xl">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400 mb-2">Join Match</h1>
                            <p className="text-gray-400">Enter the room code to join this <span className="text-white font-bold">{match.game_type}</span> lobby.</p>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-background/50 p-4 rounded-xl border border-gray-700/50 flex justify-between items-center">
                                <span className="text-gray-400 text-sm">Entry Fee</span>
                                <div className="flex items-center gap-1 text-2xl font-bold text-warning font-mono">
                                    <Sparkles className="w-6 h-6 fill-current" />
                                    {match.entry_fee}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Room Code</label>
                                <input
                                    type="text"
                                    value={joinCode}
                                    onChange={(e) => setJoinCode(e.target.value)}
                                    placeholder="••••"
                                    className="w-full bg-background border border-gray-700 rounded-xl px-4 py-4 text-center text-3xl font-mono tracking-[1em] focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                    maxLength={4}
                                />
                            </div>

                            <div className="space-y-3">
                                <button
                                    onClick={handleJoin}
                                    className="w-full bg-gradient-to-r from-primary to-cyan-600 text-black font-bold py-4 rounded-xl hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all active:scale-[0.98]"
                                >
                                    Pay & Join
                                </button>
                                <div className="text-center">
                                    <span className="text-xs text-gray-500">Balance will be deducted automatically.</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // MATCH ROOM VIEW
    return (
        <div className="min-h-screen bg-background p-4 md:p-8 pb-24 overflow-y-auto relative">

            {/* Header / Nav */}
            <div className="max-w-6xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group">
                    <div className="p-2 bg-surface rounded-lg border border-gray-800 group-hover:border-primary/50 transition-colors">
                        <ArrowLeft size={18} />
                    </div>
                </button>

                <div className="flex-1 text-center md:text-left">
                    <h1 className="text-2xl font-bold flex items-center gap-3 justify-center md:justify-start">
                        {match.game_type}
                        {match.status === 'LIVE' && (
                            <span className="flex items-center gap-1.5 bg-red-500/20 text-red-500 text-xs px-2.5 py-1 rounded-full border border-red-500/20 animate-pulse">
                                <Radio size={12} /> LIVE
                            </span>
                        )}
                        {match.status === 'COMPLETED' && (
                            <span className="bg-primary/20 text-primary text-xs px-2.5 py-1 rounded-full border border-primary/20">
                                COMPLETED
                            </span>
                        )}
                    </h1>
                    <p className="text-gray-400 text-sm">Match ID: <span className="font-mono text-gray-500">#{match.id.slice(0, 8)}</span></p>
                </div>

                <div className="flex gap-4">
                    <div className="bg-surface px-5 py-3 rounded-xl border border-gray-800 flex flex-col items-end">
                        <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Prize Pool</span>
                        <span className="text-2xl font-bold text-primary flex items-center gap-1">
                            <Trophy size={18} className="text-warning" />
                            <Sparkles className="w-4 h-4 fill-current mr-1" />
                            {match.prize_amount}
                        </span>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Participants & Actions */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Room Code Card (Visible to Participants) */}
                    <div className="relative overflow-hidden bg-gradient-to-br from-surface to-surface/50 p-6 rounded-2xl border border-gray-800">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl"></div>

                        <div className="flex justify-between items-end relative z-10">
                            <div>
                                <h3 className="text-gray-400 text-sm font-medium mb-1">Room Code</h3>
                                <div className="flex items-center gap-3">
                                    <span className="text-4xl font-mono font-bold tracking-[0.2em] text-white">
                                        {match.room_code}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => { navigator.clipboard.writeText(match.room_code); toast.success('Copied!'); }}
                                className="p-3 bg-gray-800/50 hover:bg-primary/20 hover:text-primary rounded-xl border border-gray-700 hover:border-primary/50 transition-all active:scale-95"
                            >
                                <Copy size={20} />
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-4 flex items-center gap-2">
                            <Users size={12} /> Share this code with your teammates/opponents.
                        </p>
                    </div>

                    {/* Live Status Message */}
                    {match.status === 'LIVE' && (
                        <div className="bg-gradient-to-r from-red-500/20 to-orange-600/20 p-6 rounded-2xl border border-red-500/30 text-center animate-pulse-slow">
                            <h2 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-2">
                                <Radio className="text-red-500" /> Match is LIVE!
                            </h2>
                            <p className="text-gray-300 text-sm">
                                Good luck! Play fair and may the best player win.
                            </p>
                        </div>
                    )}

                    {/* Participants Grid */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg flex items-center gap-2">
                                <Users size={18} className="text-primary" />
                                Players ({participants.length}/{match.max_players})
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {slots.map((_, index) => {
                                const participant = participants[index];
                                const isMe = participant?.user_id === user?.id;

                                return (
                                    <div key={index} className={`relative p-5 rounded-2xl border transition-all ${participant
                                        ? (participant.is_ready
                                            ? 'bg-success/5 border-success/30'
                                            : 'bg-surface border-gray-800')
                                        : 'bg-transparent border border-gray-800 border-dashed opacity-50'
                                        }`}>
                                        {participant ? (
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-black ${isMe ? 'bg-primary' : 'bg-gray-700 text-white'}`}>
                                                        {participant.user?.full_name?.charAt(0) || 'P'}
                                                    </div>
                                                    <div>
                                                        <p className={`font-bold ${isMe ? 'text-primary' : 'text-white'}`}>
                                                            {isMe ? 'You' : participant.user?.full_name}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {participant.is_ready ? 'Ready to play' : 'Not ready'}
                                                        </p>
                                                    </div>
                                                </div>
                                                {participant.is_ready ? (
                                                    <CheckCircle className="text-success drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]" size={24} />
                                                ) : (
                                                    <div className="w-6 h-6 rounded-full border-2 border-gray-700"></div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="h-full flex items-center justify-center text-gray-600 gap-2">
                                                <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"></div>
                                                <span className="text-sm font-medium">Waiting...</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Ready Action */}
                    {match.status === 'PENDING' && myParticipantData && !myParticipantData.is_ready && (
                        <button
                            onClick={handleReady}
                            className="w-full py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-success to-emerald-600 text-black shadow-lg shadow-success/20 hover:scale-[1.01] active:scale-[0.99] transition-all"
                        >
                            I AM READY
                        </button>
                    )}
                    {match.status === 'PENDING' && myParticipantData && myParticipantData.is_ready && (
                        <div className="w-full py-4 rounded-xl font-bold text-center bg-gray-800/50 text-gray-400 border border-gray-700">
                            Waiting for other players...
                        </div>
                    )}


// ... (imports remain)

                    {/* Result Upload */}
                    {match.status === 'LIVE' && !myParticipantData?.screenshot_url && (
                        <div className="relative overflow-hidden bg-surface p-8 rounded-2xl border border-gray-800 text-center group hover:border-primary/30 transition-all">
                            <h3 className="text-xl font-bold mb-4">Submit Result</h3>
                            <p className="text-gray-400 mb-6 text-sm">Upload a clear screenshot of the final scoreboard.</p>

                            <div className="max-w-xs mx-auto">
                                <label className={`block w-full p-8 border-2 border-dashed border-gray-700 rounded-2xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-all group-hover:shadow-[0_0_30px_rgba(34,211,238,0.1)] ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                                    <input type="file" accept="image/*" onChange={handleUploadResult} className="hidden" />
                                    <div className="bg-gray-800/80 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Upload className="text-primary" size={24} />
                                    </div>
                                    <span className="text-sm font-bold text-gray-300">{uploading ? 'Uploading...' : 'Click to Upload'}</span>
                                </label>
                            </div>
                        </div>
                    )}

                    {/* Show My Uploaded Proof */}
                    {(match.status === 'LIVE' || match.status === 'COMPLETED') && myParticipantData?.screenshot_url && (
                        <div className="bg-surface/50 backdrop-blur-sm p-8 rounded-2xl border border-success/30 text-center shadow-[0_0_50px_rgba(34,197,94,0.1)]">
                            <div className="flex items-center justify-center gap-2 mb-4 text-success">
                                <CheckCircle size={24} />
                                <h3 className="text-xl font-bold">Proof Uploaded</h3>
                            </div>
                            <div className="relative group cursor-pointer inline-block">
                                <img src={myParticipantData.screenshot_url} alt="My Result" className="rounded-xl max-h-64 mx-auto border-2 border-gray-700 group-hover:border-primary transition-colors" />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-xl">
                                    <span className="text-white text-sm font-bold">View Full Size</span>
                                </div>
                            </div>
                            <p className="text-gray-400 mt-4 text-xs">Waiting for admin verification. You can leave this page.</p>
                        </div>
                    )}
                </div>

                {/* Right Column: Rules & Info */}
                <div className="space-y-6">
                    <MatchRules gameType={match.game_type} />

                    {/* Support / Help Tiny Card */}
                    <div className="bg-surface/30 p-4 rounded-xl border border-gray-800 text-center">
                        <p className="text-xs text-gray-500 mb-2">Facing issues?</p>
                        <button className="text-xs text-primary hover:underline">Contact Support</button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default MatchRoom;
