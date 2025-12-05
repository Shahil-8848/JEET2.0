import { Users, Zap, TrendingUp, Sparkles } from 'lucide-react';
import { useState } from 'react';

// Enhanced gradient themes with more sophisticated color combinations
const GAME_THEMES = {
    'pubg': {
        gradient: 'from-orange-500 via-red-500 to-pink-600',
        glowColor: 'rgba(251, 146, 60, 0.6)',
        border: 'border-orange-500/40',
        iconBg: 'from-orange-500/30 via-red-500/20 to-pink-500/10',
        particleColor: '#fb923c',
        badgeGlow: 'shadow-[0_0_25px_rgba(251,146,60,0.7)]'
    },
    'freefire': {
        gradient: 'from-amber-400 via-orange-500 to-red-600',
        glowColor: 'rgba(251, 191, 36, 0.6)',
        border: 'border-amber-500/40',
        iconBg: 'from-amber-500/30 via-orange-500/20 to-red-500/10',
        particleColor: '#fbbf24',
        badgeGlow: 'shadow-[0_0_25px_rgba(251,191,36,0.7)]'
    },
    'cod': {
        gradient: 'from-emerald-400 via-green-500 to-teal-600',
        glowColor: 'rgba(34, 197, 94, 0.6)',
        border: 'border-emerald-500/40',
        iconBg: 'from-emerald-500/30 via-green-500/20 to-teal-500/10',
        particleColor: '#22c55e',
        badgeGlow: 'shadow-[0_0_25px_rgba(34,197,94,0.7)]'
    },
    'efootball': {
        gradient: 'from-blue-400 via-cyan-500 to-indigo-600',
        glowColor: 'rgba(59, 130, 246, 0.6)',
        border: 'border-blue-500/40',
        iconBg: 'from-blue-500/30 via-cyan-500/20 to-indigo-500/10',
        particleColor: '#3b82f6',
        badgeGlow: 'shadow-[0_0_25px_rgba(59,130,246,0.7)]'
    },
    'valorant': {
        gradient: 'from-violet-400 via-purple-500 to-fuchsia-600',
        glowColor: 'rgba(139, 92, 246, 0.6)',
        border: 'border-violet-500/40',
        iconBg: 'from-violet-500/30 via-purple-500/20 to-fuchsia-500/10',
        particleColor: '#8b5cf6',
        badgeGlow: 'shadow-[0_0_25px_rgba(139,92,246,0.7)]'
    },
    'Ludo': {
        gradient: 'from-rose-400 via-pink-500 to-purple-600',
        glowColor: 'rgba(244, 63, 94, 0.6)',
        border: 'border-rose-500/40',
        iconBg: 'from-rose-500/30 via-pink-500/20 to-purple-500/10',
        particleColor: '#f43f5e',
        badgeGlow: 'shadow-[0_0_25px_rgba(244,63,94,0.7)]'
    }
};

const GameCard = ({ game, onSelect }) => {
    const [isHovered, setIsHovered] = useState(false);
    const theme = GAME_THEMES[game.id] || GAME_THEMES['pubg'];

    return (
        <button
            onClick={() => onSelect(game)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="group relative w-full aspect-[3/3.7] overflow-hidden rounded-2xl transition-all duration-500 hover:scale-[1.03] hover:z-10"
        >
            {/* Outer Glow Effect */}
            <div
                className="absolute -inset-1 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 rounded-2xl"
                style={{ background: `linear-gradient(135deg, ${theme.glowColor}, transparent)` }}
            />

            {/* Animated Border Gradient with Shine */}
            <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} opacity-80 group-hover:opacity-100 transition-all duration-500`}>
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-shimmer" />
            </div>

            {/* Card Container */}
            <div className="absolute inset-[2px] bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 rounded-2xl overflow-hidden">

                {/* Premium Background Effects */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gray-800/50 via-transparent to-transparent" />
                <div
                    className="absolute -top-20 -right-20 w-50 h-50 rounded-full opacity-20 group-hover:opacity-40 blur-3xl transition-all duration-700"
                    style={{ background: `radial-gradient(circle, ${theme.glowColor}, transparent 70%)` }}
                />
                <div
                    className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full opacity-20 group-hover:opacity-40 blur-3xl transition-all duration-700"
                    style={{ background: `radial-gradient(circle, ${theme.glowColor}, transparent 70%)` }}
                />

                {/* Grid Pattern Overlay */}
                <div className="absolute inset-0 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-500"
                    style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '20px 20px' }}
                />

                {/* Floating Sparkles */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                    {[...Array(6)].map((_, i) => (
                        <Sparkles
                            key={i}
                            className="absolute animate-float"
                            size={8}
                            style={{
                                top: `${15 + (i * 15)}%`,
                                left: `${10 + (i * 12)}%`,
                                color: theme.particleColor,
                                animationDelay: `${i * 0.3}s`,
                                animationDuration: '3s'
                            }}
                        />
                    ))}
                </div>

                {/* Content */}
                <div className="relative h-full flex flex-col items-center justify-between p-6">

                    {/* Top Stats Badge */}
                    <div className="self-stretch flex justify-end">
                        <div className={`relative px-2 py-1 mb-2 rounded-full bg-gradient-to-r ${theme.gradient} ${theme.badgeGlow} transition-all duration-300 group-hover:scale-110`}>
                            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-white/20 to-transparent opacity-50" />
                            <div className="relative flex items-center gap-2 text-white">
                                <Zap className="w-4 h-4" fill="currentColor" />
                                <span className="text-sm font-bold">{game.activeMatches}</span>
                                <span className="text-xs font-medium opacity-90">Active</span>
                            </div>
                        </div>
                    </div>

                    {/* Game Icon Container */}
                    <div className="flex-1 flex items-center justify-center">
                        <div className="relative">
                            {/* Rotating Rings */}
                            <div className="absolute -inset-4 rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-500">
                                <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${theme.gradient} animate-spin-slow`} style={{ animationDuration: '4s' }} />
                                <div className="absolute inset-[2px] rounded-full bg-gray-950" />
                            </div>
                            <div className="absolute -inset-6 rounded-full opacity-40 group-hover:opacity-70 transition-opacity duration-500">
                                <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${theme.gradient} animate-spin-slow`} style={{ animationDuration: '6s', animationDirection: 'reverse' }} />
                                <div className="absolute inset-[1px] rounded-full bg-transparent" />
                            </div>

                            {/* Icon Background with Glassmorphism */}
                            <div className={`relative w-26 h-26 rounded-full bg-gradient-to-br ${theme.iconBg} backdrop-blur-xl border ${theme.border} flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-2xl`}>
                                {/* Inner Glow */}
                                <div
                                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-60 blur-xl transition-opacity duration-500"
                                    style={{ background: theme.glowColor }}
                                />
                                {/* Shine Effect */}
                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-white/0 via-white/30 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <img
                                    src={game.icon}
                                    alt={game.name}
                                    className="relative w-20 h-20 rounded-full object-cover z-10 shadow-xl"
                                />
                            </div>

                            {/* Pulse Ring */}
                            <div className={`absolute -inset-8 rounded-full bg-gradient-to-r ${theme.gradient} opacity-0 group-hover:opacity-30 animate-ping`} style={{ animationDuration: '2s' }} />
                        </div>
                    </div>

                    {/* Game Info */}
                    <div className="text-center space-y-3 w-full">
                        <h3 className="font-bold text-lg text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:via-gray-100 group-hover:to-gray-300 transition-all duration-300 drop-shadow-lg">
                            {game.name}
                        </h3>

                        {/* Stats Bar */}
                        <div className="flex items-center justify-center gap-4 px-4 py-2.5 bg-gray-900/60 backdrop-blur-md rounded-xl border border-gray-800 group-hover:border-gray-700 transition-all duration-300">
                            <div className="flex items-center gap-1.5 text-gray-400 group-hover:text-gray-200 transition-colors">
                                <Users className="w-4 h-4" />
                                <span className="text-xs font-semibold">Players</span>
                            </div>
                            <div className="w-px h-4 bg-gray-700" />
                            <div className="flex items-center gap-1.5">
                                <TrendingUp className="w-4 h-4 text-green-400" />
                                <span className="text-xs font-bold text-white">Live</span>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Accent Line */}
                    <div className="absolute bottom-0 left-0 right-0 h-[2px] overflow-hidden">
                        <div className={`h-full bg-gradient-to-r ${theme.gradient} opacity-70 group-hover:opacity-100 transition-opacity duration-500`} />
                        <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-60 animate-shimmer-fast`} />
                    </div>
                </div>

                {/* Traveling Border Lights - Enhanced */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none overflow-hidden">
                    {/* Top Light */}
                    <div
                        className="absolute top-0 left-0 w-32 h-[2px] animate-travel-right"
                        style={{ background: `linear-gradient(90deg, transparent, ${theme.particleColor}, transparent)` }}
                    />
                    {/* Right Light */}
                    <div
                        className="absolute top-0 right-0 w-[2px] h-32 animate-travel-down"
                        style={{ background: `linear-gradient(180deg, transparent, ${theme.particleColor}, transparent)` }}
                    />
                    {/* Bottom Light */}
                    <div
                        className="absolute bottom-0 right-0 w-32 h-[2px] animate-travel-left"
                        style={{ background: `linear-gradient(90deg, transparent, ${theme.particleColor}, transparent)` }}
                    />
                    {/* Left Light */}
                    <div
                        className="absolute bottom-0 left-0 w-[2px] h-32 animate-travel-up"
                        style={{ background: `linear-gradient(180deg, transparent, ${theme.particleColor}, transparent)` }}
                    />
                </div>
            </div>

            <style jsx>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                @keyframes shimmer-fast {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                @keyframes travel-right {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(400%); }
                }
                @keyframes travel-down {
                    0% { transform: translateY(-100%); }
                    100% { transform: translateY(400%); }
                }
                @keyframes travel-left {
                    0% { transform: translateX(100%); }
                    100% { transform: translateX(-400%); }
                }
                @keyframes travel-up {
                    0% { transform: translateY(100%); }
                    100% { transform: translateY(-400%); }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0px) scale(1); opacity: 0.6; }
                    50% { transform: translateY(-10px) scale(1.2); opacity: 1; }
                }
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-shimmer {
                    animation: shimmer 3s ease-in-out infinite;
                }
                .animate-shimmer-fast {
                    animation: shimmer-fast 1.5s ease-in-out infinite;
                }
                .animate-travel-right {
                    animation: travel-right 2s ease-in-out infinite;
                }
                .animate-travel-down {
                    animation: travel-down 2s ease-in-out infinite 0.5s;
                }
                .animate-travel-left {
                    animation: travel-left 2s ease-in-out infinite 1s;
                }
                .animate-travel-up {
                    animation: travel-up 2s ease-in-out infinite 1.5s;
                }
                .animate-float {
                    animation: float 3s ease-in-out infinite;
                }
                .animate-spin-slow {
                    animation: spin-slow linear infinite;
                }
            `}</style>
        </button>
    );
};

export default GameCard;