import { Trophy } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const ResultCard = ({ result }) => {
    return (
        <div className="bg-surface p-3 rounded-lg border border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-warning/20 text-warning rounded-full flex items-center justify-center">
                    <Trophy size={16} />
                </div>
                <div>
                    <h4 className="font-bold text-sm">{result.game_type}</h4>
                    <p className="text-[10px] text-gray-400">Winner: {result.winner_name}</p>
                </div>
            </div>
            <div className="text-right">
                <p className="text-success font-bold text-sm">+Rs.{result.prize_amount}</p>
                <p className="text-[10px] text-gray-500">
                    {result.completed_at ? formatDistanceToNow(new Date(result.completed_at), { addSuffix: true }) : 'Recently'}
                </p>
            </div>
        </div>
    );
};

export default ResultCard;
