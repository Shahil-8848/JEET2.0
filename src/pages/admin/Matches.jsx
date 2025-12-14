import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { CheckCircle, ExternalLink, Loader2, Trophy, X, Eye, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminMatches = () => {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        fetchMatches();
    }, []);

    // ... (imports remain)
    const getSignedUrl = async (path) => {
        if (!path) return null;

        // Extract just the filename if path is a full URL
        let filePath = path;
        if (path.includes('/screenshots/')) {
            filePath = path.split('/screenshots/')[1];
        }

        const { data, error } = await supabase.storage
            .from('screenshots')
            .createSignedUrl(filePath, 60 * 10); // 10 minutes

        if (error) {
            console.error('Error creating signed URL:', error);
            return null;
        }

        return data.signedUrl;
    };

    const fetchMatches = async () => {
        try {
            // Need to fetch matches AND their participants to get screenshots
            // Supabase allows nested select
            const { data, error } = await supabase
                .from('matches')
                .select(`
                    *, 
                    host:users!host_id(full_name), 
                    opponent:users!opponent_id(full_name),
                    participants:match_participants(
                        id, user_id, screenshot_url, is_ready,
                        user:users(full_name)
                    )
                `)
                .in('status', ['COMPLETED', 'VERIFIED'])
                .order('created_at', { ascending: false });

            if (error) throw error;
            const matchesWithImages = await Promise.all(
                data.map(async (match) => ({
                    ...match,
                    participants: await Promise.all(
                        match.participants.map(async (p) => ({
                            ...p,
                            signedImage: p.screenshot_url
                                ? await getSignedUrl(p.screenshot_url)
                                : null
                        }))
                    )
                }))
            );

            setMatches(matchesWithImages);
        } catch (error) {
            console.error('Error fetching matches:', error);
            toast.error('Failed to load matches');
        } finally {
            setLoading(false);
        }
    };

    // ... (handleVerify remains same)

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">Match Verification</h1>

            <div className="grid grid-cols-1 gap-6">
                {loading ? (
                    <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>
                ) : matches.length > 0 ? (
                    matches.map(match => (
                        <div key={match.id} className="bg-surface border border-white/5 rounded-2xl p-6">

                            {/* Match Header */}
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                        {match.game_type}
                                        <span className={`text-xs px-2 py-0.5 rounded-full border ${match.status === 'VERIFIED' ? 'border-green-500 text-green-500' : 'border-blue-500 text-blue-500'}`}>
                                            {match.status}
                                        </span>
                                    </h3>
                                    <p className="text-sm text-gray-400 font-mono">ID: {match.id}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-primary font-bold text-lg flex items-center gap-1 justify-end">
                                        <Sparkles size={16} className="fill-current" />
                                        {match.prize_amount}
                                    </p>
                                    <p className="text-xs text-gray-500">Prize Pool</p>
                                </div>
                            </div>

                            {/* Screenshots Grid (One for each participant) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                {match.participants?.map((p) => (
                                    <div key={p.id} className="relative aspect-video bg-black/40 rounded-xl overflow-hidden border border-gray-800">
                                        {p.screenshot_url ? (
                                            <div className="group relative w-full h-full cursor-pointer" onClick={() => setSelectedImage(p.signedImage)}>
                                                <img
                                                    src={p.signedImage}
                                                    alt={`Proof by ${p.user?.full_name}`}
                                                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = 'https://placehold.co/600x400/1e293b/ef4444?text=Image+Not+Found';
                                                    }}
                                                />
                                                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity p-2 text-center">
                                                    <p className="text-xs text-white font-bold mb-2">{p.user?.full_name}</p>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setSelectedImage(p.signedImage); }}
                                                        className="flex items-center gap-1 text-xs bg-primary/20 hover:bg-primary/30 text-primary border border-primary/50 px-3 py-1.5 rounded-full backdrop-blur-md transition-all scale-90 group-hover:scale-100"
                                                    >
                                                        <Eye size={14} /> View Proof
                                                    </button>
                                                </div>
                                                {/* Label always visible */}
                                                <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-1 text-[10px] text-center text-gray-300 backdrop-blur-sm">
                                                    Proof: {p.user?.full_name}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-600 gap-2">
                                                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                                                    <span className="font-bold text-xs">{p.user?.full_name?.charAt(0)}</span>
                                                </div>
                                                <span className="text-xs text-gray-500">No Proof</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Actions */}
                            {match.status !== 'VERIFIED' && (
                                <div className="flex items-center justify-between bg-white/5 p-4 rounded-xl">
                                    <p className="text-sm text-gray-400">Select Winner:</p>
                                    <div className="flex gap-2">
                                        {/* Verify Host */}
                                        <button
                                            onClick={() => handleVerify(match, match.host_id)}
                                            className="bg-green-500/10 hover:bg-green-500/20 text-green-500 border border-green-500/30 px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2"
                                        >
                                            <Trophy size={14} /> Host ({match.host?.full_name})
                                        </button>

                                        {/* Verify Opponent (Should probably verify by User ID in future for N players) */}
                                        {/* For Squads/Multi, we might need a dropdown of all players. For now, assuming 1v1 legacy logic mainly, but let's upgrade to dynamic buttons */}

                                        {match.participants?.filter(p => p.user_id !== match.host_id).map(p => (
                                            <button
                                                key={p.user_id}
                                                onClick={() => handleVerify(match, p.user_id)}
                                                className="bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2"
                                            >
                                                <Trophy size={14} /> {p.user?.full_name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Verified Status */}
                            {match.status === 'VERIFIED' && (
                                <div className="bg-green-500/10 border border-green-500/20 p-3 rounded-xl text-center">
                                    <p className="text-green-400 text-sm font-bold flex items-center justify-center gap-2">
                                        <CheckCircle size={16} />
                                        Winner Verified: {match.participants?.find(p => p.user_id === match.winner_id)?.user?.full_name || 'Unknown'}
                                    </p>
                                </div>
                            )}

                        </div>
                    ))
                ) : (
                    <div className="text-center p-12 text-gray-500">No matches to verify.</div>
                )}
            </div>
            {/* Image Preview Modal */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={() => setSelectedImage(null)}
                >
                    <div className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center" onClick={e => e.stopPropagation()}>

                        <div className="absolute top-0 right-0 -mt-12 -mr-4 md:mr-0 z-50">
                            <button
                                onClick={() => setSelectedImage(null)}
                                className="bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-colors border border-white/10"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <img
                            src={selectedImage}
                            alt="Full Proof"
                            className="rounded-lg shadow-2xl border border-white/10 max-w-full max-h-[85vh] object-contain bg-black"
                            onError={(e) => {
                                e.target.src = 'https://placehold.co/600x400/1e293b/ef4444?text=Image+Load+Error';
                            }}
                        />

                        <div className="mt-4 flex gap-4">
                            <a
                                href={selectedImage}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-4 py-2 bg-primary text-black font-bold rounded-lg hover:bg-primary/90 transition-colors"
                            >
                                <ExternalLink size={16} /> Open Original
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminMatches;
