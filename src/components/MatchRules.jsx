import { Shield, AlertTriangle, Monitor, Clock } from 'lucide-react';

const RULES = {
    'PUBG Mobile': [
        'Emulators are NOT allowed.',
        'Teaming with other squads is strictly prohibited.',
        'Hackers will be banned permanently.',
        'Screenshot of the final result is mandatory.'
    ],
    'Free Fire': [
        'No hacking or scripting tools.',
        'Respect other players.',
        'Upload result screenshot immediately after match.',
        'Team up strictly forbidden.'
    ],
    'default': [
        'Fair play is mandatory.',
        'Winner must upload the result screenshot.',
        'Disputes will be settled by Admin.',
        'Money will be refunded if match is cancelled.'
    ]
};

const MatchRules = ({ gameType }) => {
    const rules = RULES[gameType] || RULES['default'];

    return (
        <div className="bg-surface/50 backdrop-blur-md p-6 rounded-xl border border-gray-800/50 hover:border-primary/30 transition-all group">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Shield className="text-primary group-hover:animate-pulse" size={20} />
                Match Rules
            </h3>

            <ul className="space-y-3">
                {rules.map((rule, index) => (
                    <li key={index} className="flex items-start gap-3 text-gray-300 text-sm">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 shadow-[0_0_8px_rgba(34,211,238,0.8)]"></span>
                        {rule}
                    </li>
                ))}
            </ul>

            <div className="mt-6 pt-4 border-t border-gray-700/50 grid grid-cols-2 gap-4 text-[10px] md:text-xs text-gray-500 uppercase font-bold tracking-widest">
                <div className="flex items-center gap-2">
                    <Monitor size={14} />
                    <span>Device Restricted</span>
                </div>
                <div className="flex items-center gap-2">
                    <Clock size={14} />
                    <span>On-Time Start</span>
                </div>
            </div>
        </div>
    );
};

export default MatchRules;
