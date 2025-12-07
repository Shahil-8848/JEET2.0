import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { ArrowLeft, Gamepad2, Trophy, Users } from 'lucide-react';

const GAMES = ['PUBG Mobile', 'Free Fire', 'Call of Duty', 'eFootball', 'Valorant', 'BGMI'];
const ENTRY_FEES = [50, 100, 200, 500, 1000];
const TEAM_SIZES = ['1v1', '2v2', 'Squad'];

const CreateRoom = () => {
    const { user, profile, refreshProfile } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [gameType, setGameType] = useState(location.state?.gameType || GAMES[0]);
    const [entryFee, setEntryFee] = useState(ENTRY_FEES[1]); // Default 100
    const [teamSize, setTeamSize] = useState(TEAM_SIZES[0]);
    const [loading, setLoading] = useState(false);

    // Calculate prize (e.g., 90% of total entry fees)
    // Total Entry = Entry Fee * 2 (for 1v1)
    // Prize = Total Entry * 0.9
    // Platform Fee = 10%
    const prizePool = (entryFee * 2) * 0.9;

    const handleCreate = async () => {
        if (!user || !profile) return;

        setLoading(true);
        try {
            // 1. Generate Room Code
            const roomCode = Math.floor(1000 + Math.random() * 9000).toString();

            // 2. Call RPC to Create Match & Deduct Balance
            const { data, error } = await supabase.rpc('create_match', {
                p_game_type: gameType,
                p_entry_fee: entryFee,
                p_team_size: teamSize,
                p_room_code: roomCode,
                p_prize_amount: prizePool
            });

            if (error) throw error;
            if (!data.success) throw new Error(data.error);

            // Refresh profile to show new balance
            refreshProfile();

            toast.success('Room created successfully!');
            navigate(`/match/${data.match_id}`);

        } catch (error) {
            console.error('Error creating room:', error);
            toast.error(error.message || 'Failed to create room. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-2xl mx-auto">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6">
                <ArrowLeft size={20} />
                <span>Back</span>
            </button>

            <h1 className="text-3xl font-bold mb-8">Create Match Room</h1>

            <div className="bg-surface p-6 rounded-xl border border-gray-800 space-y-8">

                {/* Game Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                        <Gamepad2 size={16} /> Select Game
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {GAMES.map(game => (
                            <button
                                key={game}
                                onClick={() => setGameType(game)}
                                className={`p-3 rounded-lg border text-sm font-medium transition-all ${gameType === game
                                    ? 'bg-primary text-black border-primary'
                                    : 'bg-background border-gray-700 hover:border-gray-500'
                                    }`}
                            >
                                {game}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Team Size */}
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                        <Users size={16} /> Team Size
                    </label>
                    <div className="flex gap-3">
                        {TEAM_SIZES.map(size => (
                            <button
                                key={size}
                                onClick={() => setTeamSize(size)}
                                className={`flex-1 p-3 rounded-lg border text-sm font-medium transition-all ${teamSize === size
                                    ? 'bg-primary text-black border-primary'
                                    : 'bg-background border-gray-700 hover:border-gray-500'
                                    }`}
                            >
                                {size}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Entry Fee */}
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                        <Trophy size={16} /> Entry Fee (Rs.)
                    </label>
                    <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                        {ENTRY_FEES.map(fee => (
                            <button
                                key={fee}
                                onClick={() => setEntryFee(fee)}
                                className={`p-3 rounded-lg border text-sm font-medium transition-all ${entryFee === fee
                                    ? 'bg-warning text-black border-warning'
                                    : 'bg-background border-gray-700 hover:border-gray-500'
                                    }`}
                            >
                                Rs.{fee}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Summary */}
                <div className="bg-background p-4 rounded-lg border border-gray-800">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-400">Entry Fee</span>
                        <span className="font-bold">Rs.{entryFee}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-400">Platform Fee (10%)</span>
                        <span className="text-error">-Rs.{(entryFee * 2) * 0.1}</span>
                    </div>
                    <div className="border-t border-gray-700 my-2 pt-2 flex justify-between items-center">
                        <span className="text-primary font-bold">Winning Prize</span>
                        <span className="text-primary font-bold text-xl">Rs.{prizePool}</span>
                    </div>
                </div>

                <button
                    onClick={handleCreate}
                    disabled={loading}
                    className="w-full bg-success hover:bg-green-400 text-black font-bold py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-success/20"
                >
                    {loading ? 'Creating Room...' : 'Create Room & Pay Entry'}
                </button>

            </div>
        </div>
    );
};

export default CreateRoom;
