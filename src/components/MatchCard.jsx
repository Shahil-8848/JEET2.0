import { Users, Clock, Trophy, Sparkles } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const MatchCard = ({ match, onJoin }) => {
    const isLive = match.status === 'LIVE';
    const timeAgo = match.created_at ? formatDistanceToNow(new Date(match.created_at), { addSuffix: true }) : '';
    const playerCount = `${match.current_players || 1}/${match.max_players || 2}`;

    return (
        <div className={`relative overflow-hidden rounded-2xl p-5 border transition-all duration-300 group ${isLive
            ? 'bg-black/40 border-success/30 hover:border-success/60 shadow-[0_0_15px_rgba(74,222,128,0.05)] hover:shadow-[0_0_20px_rgba(74,222,128,0.2)]'
            : 'bg-black/40 border-white/5 hover:border-primary/50 shadow-[0_0_15px_rgba(34,211,238,0.05)] hover:shadow-[0_0_20px_rgba(34,211,238,0.2)]'
            } backdrop-blur-md`}>

            {/* Background Gradient Blob */}
            <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] opacity-20 pointer-events-none transition-colors ${isLive ? 'bg-success' : 'bg-primary'}`}></div>

            {isLive && (
                <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-xl border border-success/30 text-success text-[10px] font-bold px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(74,222,128,0.2)] animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-success shadow-[0_0_5px_rgba(74,222,128,1)]"></span>
                    LIVE
                </div>
            )}

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="font-bold text-lg text-white mb-0.5 tracking-tight">{match.game_type}</h3>
                        <p className="text-xs text-gray-400 font-medium flex items-center gap-1">
                            Host: <span className={isLive ? 'text-success' : 'text-gray-300'}>{match.host?.full_name}</span>
                        </p>
                    </div>
                    {!isLive && (
                        <div className="text-right">
                            <p className="text-primary font-bold text-lg drop-shadow-[0_0_8px_rgba(34,211,238,0.5)] flex items-center gap-1 justify-end">
                                <Sparkles className="w-4 h-4 fill-current" />
                                {match.prize_amount}
                            </p>
                            <p className="text-[10px] text-gray-500 font-medium">{timeAgo}</p>
                        </div>
                    )}
                    {isLive && (
                        <div className="text-right mt-6">
                            <p className="text-success font-bold text-lg drop-shadow-[0_0_8px_rgba(74,222,128,0.5)] flex items-center gap-1 justify-end">
                                <Sparkles className="w-4 h-4 fill-current" />
                                {match.prize_amount}
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex justify-between items-center mb-5">
                    <div className="flex items-center gap-2 text-xs font-medium text-gray-300 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                        <Users size={14} className="text-gray-400" />
                        <span>{playerCount} Players</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-warning bg-warning/5 px-2.5 py-1 rounded-lg border border-warning/10">
                        <Trophy size={14} />
                        <span>Entry: </span>
                        <div className="flex items-center gap-0.5">
                            <Sparkles className="w-3 h-3 fill-current" />
                            {match.entry_fee}
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => onJoin(match.id)}
                    className={`w-full py-3 rounded-xl font-bold text-sm tracking-wide transition-all active:scale-[0.98] ${isLive
                        ? 'bg-gradient-to-r from-success to-emerald-500 text-black shadow-[0_0_20px_rgba(74,222,128,0.3)] hover:shadow-[0_0_30px_rgba(74,222,128,0.5)] border border-transparent'
                        : 'bg-gradient-to-r from-primary to-cyan-600 text-black shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] border border-transparent'
                        }`}
                >
                    {isLive ? 'Spectate Match' : 'Join Match'}
                </button>
            </div>
        </div>
    );
};

export default MatchCard;
