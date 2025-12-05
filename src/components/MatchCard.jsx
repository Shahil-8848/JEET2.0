import { Users, Clock, Trophy } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const MatchCard = ({ match, onJoin }) => {
    const isLive = match.status === 'LIVE';
    const timeAgo = match.created_at ? formatDistanceToNow(new Date(match.created_at), { addSuffix: true }) : '';

    return (
        <div className={`bg-surface rounded-xl p-4 border ${isLive ? 'border-success/50 shadow-lg shadow-success/10' : 'border-gray-800'} relative overflow-hidden group hover:border-primary/50 transition-colors`}>
            {isLive && (
                <div className="absolute top-2 right-2 bg-success text-black text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                    LIVE
                </div>
            )}

            <div className="flex justify-between items-start mb-3">
                <div>
                    <h3 className="font-bold text-white">{match.game_type}</h3>
                    <p className="text-xs text-gray-400">Room: {match.room_code || '****'}</p>
                    <p className="text-[10px] text-gray-500 mt-1">
                        Hosted by: <span className="text-primary">{match.host?.full_name || 'Unknown'}</span>
                    </p>
                    <p className="text-[10px] text-gray-600">{timeAgo}</p>
                </div>
                <div className="text-right">
                    <p className="text-primary font-bold">Rs.{match.prize_amount}</p>
                    <p className="text-[10px] text-gray-500">Prize Pool</p>
                </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                <div className="flex items-center gap-1">
                    <Users size={14} />
                    <span>{match.team_size}</span>
                </div>
                <div className="flex items-center gap-1">
                    <Trophy size={14} className="text-warning" />
                    <span>Entry: Rs.{match.entry_fee}</span>
                </div>
            </div>

            <button
                onClick={() => onJoin(match.id)}
                className={`w-full py-2 rounded-lg font-medium text-sm transition-colors ${isLive
                    ? 'bg-success text-black hover:bg-green-400'
                    : 'bg-primary text-black hover:bg-cyan-400'
                    }`}
            >
                {isLive ? 'View Details' : 'Join Match'}
            </button>
        </div>
    );
};

export default MatchCard;
