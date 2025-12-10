import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, Gamepad2, Sparkles, Zap, Trophy, Flame, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [focusedField, setFocusedField] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);

        // Simulate login - Replace with actual signIn logic
        setTimeout(() => {
            console.log('Login with:', { email, password });
            setLoading(false);
            // In real app: await signIn(email, password); navigate('/');
        }, 2000);
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center bg-black p-4 overflow-hidden">
            {/* Animated Background Effects */}
            <div className="absolute inset-0 overflow-hidden">
                {/* Dynamic Gradient Orbs */}
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gradient-to-r from-cyan-500/30 to-blue-500/30 rounded-full blur-[150px] animate-float" />
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full blur-[150px] animate-float-delayed" />
                <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-full blur-[150px] animate-float-slow" />

                {/* Animated Grid Pattern */}
                <div
                    className="absolute inset-0 opacity-[0.05]"
                    style={{
                        backgroundImage: 'linear-gradient(rgba(6, 182, 212, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.5) 1px, transparent 1px)',
                        backgroundSize: '60px 60px',
                        animation: 'gridMove 20s linear infinite'
                    }}
                />

                {/* Floating Gaming Elements */}
                {[...Array(15)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute animate-float-particle"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 5}s`,
                            animationDuration: `${5 + Math.random() * 5}s`
                        }}
                    >
                        {i % 3 === 0 ? (
                            <Star className="w-4 h-4 text-cyan-400/30" fill="currentColor" />
                        ) : i % 3 === 1 ? (
                            <Trophy className="w-4 h-4 text-purple-400/30" />
                        ) : (
                            <Flame className="w-4 h-4 text-orange-400/30" fill="currentColor" />
                        )}
                    </div>
                ))}

                {/* Laser Scan Lines */}
                <div className="absolute inset-0">
                    <div className="absolute w-full h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent animate-scan" />
                    <div className="absolute w-full h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent animate-scan-delayed" />
                </div>
            </div>

            {/* Login Card Container */}
            <div className="relative w-full max-w-lg z-10">
                {/* Outer Glow Rings */}
                <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-[2.5rem] blur-3xl opacity-40 animate-pulse-glow" />
                <div className="absolute -inset-2 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 rounded-[2.5rem] blur-2xl opacity-30 animate-pulse-glow-delayed" />

                {/* Main Card */}
                <div className="relative bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 backdrop-blur-2xl border-2 border-gray-800 rounded-[2rem] p-10 shadow-[0_0_80px_rgba(6,182,212,0.3)]">
                    {/* Animated Border Gradient */}
                    <div className="absolute inset-0 rounded-[2rem] overflow-hidden pointer-events-none">
                        <div className="absolute inset-[-2px] bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 opacity-30 animate-spin-border" style={{ animationDuration: '8s' }} />
                        <div className="absolute inset-[2px] bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 rounded-[2rem]" />
                    </div>

                    {/* Corner Accents */}
                    <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-cyan-500/50 rounded-tl-[2rem]" />
                    <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-purple-500/50 rounded-br-[2rem]" />

                    {/* Header Section */}
                    <div className="relative text-center mb-10">
                        {/* Logo Container */}
                        <div className="inline-flex items-center justify-center mb-6 relative">
                            {/* Rotating Ring */}
                            <div className="absolute inset-[-20px] rounded-full border-2 border-transparent border-t-cyan-500 border-r-purple-500 animate-spin-slow" style={{ animationDuration: '4s' }} />
                            <div className="absolute inset-[-15px] rounded-full border border-transparent border-b-pink-500 border-l-orange-500 animate-spin-slow" style={{ animationDuration: '6s', animationDirection: 'reverse' }} />

                            {/* Logo Background */}
                            <div className="relative w-24 h-24">
                                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 via-purple-500 to-pink-500 rounded-2xl animate-pulse-slow" />
                                <div className="absolute inset-[2px] bg-gradient-to-br from-gray-950 to-gray-900 rounded-2xl" />
                                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent rounded-2xl" />

                                {/* Logo Icon */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    {/* <Gamepad2 className="w-12 h-12 text-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]" strokeWidth={2.5} /> */}
                                    <img className="w-13 h-13 rounded-full" src="https://png.pngtree.com/png-vector/20191203/ourmid/pngtree-gaming-logo-design-png-image_2064891.jpg" alt="" />

                                    <Sparkles className="absolute top-0 right-0 w-5 h-5 text-cyan-400 animate-orbit" style={{ animationDelay: '0s' }} />
                                </div>
                            </div>

                            {/* Orbiting Sparkles */}
                            <Sparkles className="absolute top-0 right-0 w-5 h-5 text-cyan-400 animate-orbit" style={{ animationDelay: '0s' }} />
                            <Sparkles className="absolute bottom-0 left-0 w-5 h-5 text-purple-400 animate-orbit" style={{ animationDelay: '2s' }} />
                            <Zap className="absolute top-1/2 right-[-10px] w-4 h-4 text-pink-400 animate-pulse" fill="currentColor" />
                        </div>

                        {/* Title */}
                        <h1 className="text-5xl font-black mb-3 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient tracking-tight">
                            LEVEL UP
                        </h1>
                        <div className="h-1 w-32 mx-auto bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-full mb-3 animate-pulse-slow" />
                        <p className="text-gray-400 text-sm font-medium">
                            Sign in to dominate <span className="text-cyan-400 font-bold">JEET 2.0</span>
                        </p>
                    </div>

                    {/* Login Form */}
                    <div className="space-y-6 relative">
                        {/* Email Field */}
                        <div className="relative group">
                            <label className="block text-sm font-bold text-gray-300 mb-2 tracking-wide">
                                EMAIL ADDRESS
                            </label>
                            <div className="relative">
                                {/* Glow on Focus */}
                                <div className={`absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl opacity-0 blur-md transition-all duration-300 ${focusedField === 'email' ? 'opacity-75' : 'group-hover:opacity-30'}`} />

                                <div className="relative flex items-center">
                                    <div className="absolute left-0 inset-y-0 flex items-center pl-4 pointer-events-none">
                                        <div className={`p-2 rounded-lg transition-all duration-300 ${focusedField === 'email' ? 'bg-cyan-500/20' : 'bg-gray-800'}`}>
                                            <Mail className={`w-5 h-5 transition-colors duration-300 ${focusedField === 'email' ? 'text-cyan-400' : 'text-gray-500'}`} />
                                        </div>
                                    </div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        onFocus={() => setFocusedField('email')}
                                        onBlur={() => setFocusedField(null)}
                                        className="w-full bg-gray-950/80 border-2 border-gray-800 rounded-xl pl-16 pr-4 py-4 text-white font-medium focus:outline-none focus:border-cyan-500 focus:bg-gray-950 transition-all duration-300 placeholder:text-gray-600"
                                        placeholder="player@jeet.gg"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="relative group">
                            <label className="block text-sm font-bold text-gray-300 mb-2 tracking-wide">
                                PASSWORD
                            </label>
                            <div className="relative">
                                {/* Glow on Focus */}
                                <div className={`absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl opacity-0 blur-md transition-all duration-300 ${focusedField === 'password' ? 'opacity-75' : 'group-hover:opacity-30'}`} />

                                <div className="relative flex items-center">
                                    <div className="absolute left-0 inset-y-0 flex items-center pl-4 pointer-events-none">
                                        <div className={`p-2 rounded-lg transition-all duration-300 ${focusedField === 'password' ? 'bg-purple-500/20' : 'bg-gray-800'}`}>
                                            <Lock className={`w-5 h-5 transition-colors duration-300 ${focusedField === 'password' ? 'text-purple-400' : 'text-gray-500'}`} />
                                        </div>
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onFocus={() => setFocusedField('password')}
                                        onBlur={() => setFocusedField(null)}
                                        className="w-full bg-gray-950/80 border-2 border-gray-800 rounded-xl pl-16 pr-14 py-4 text-white font-medium focus:outline-none focus:border-purple-500 focus:bg-gray-950 transition-all duration-300 placeholder:text-gray-600"
                                        placeholder="••••••••••"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 p-2 rounded-lg hover:bg-gray-800 text-gray-500 hover:text-gray-300 transition-all duration-300"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="relative w-full group overflow-hidden mt-8"
                        >
                            {/* Button Outer Glow */}
                            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-xl blur-lg opacity-70 group-hover:opacity-100 transition-opacity duration-300 animate-pulse-slow" />

                            {/* Button Background */}
                            <div className="relative flex items-center justify-center gap-3 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 text-black font-black text-lg py-5 rounded-xl transition-all duration-300 group-hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_30px_rgba(6,182,212,0.5)]">
                                {loading ? (
                                    <>
                                        <div className="w-6 h-6 border-3 border-black/30 border-t-black rounded-full animate-spin" />
                                        <span className="tracking-wider">LOADING...</span>
                                    </>
                                ) : (
                                    <>
                                        <Zap className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" fill="currentColor" />
                                        <span className="tracking-wider">ENTER ARENA</span>
                                        <Zap className="w-6 h-6 group-hover:-rotate-12 transition-transform duration-300" fill="currentColor" />
                                    </>
                                )}
                            </div>

                            {/* Shimmer Effect */}
                            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-xl" />
                        </button>
                    </div>

                    {/* Footer Links */}
                    <div className="mt-8 text-center relative">
                        <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-700 to-transparent mb-6" />
                        <p className="text-gray-400 font-medium">
                            New player?{' '}
                            <Link
                                to="/register"
                                className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 hover:from-cyan-300 hover:to-purple-300 font-bold transition-all duration-300 hover:tracking-wide inline-flex items-center gap-1"
                            >
                                CREATE ACCOUNT
                                <Sparkles className="w-4 h-4 text-cyan-400" />
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px) translateX(0px); }
                    33% { transform: translateY(-20px) translateX(10px); }
                    66% { transform: translateY(-10px) translateX(-10px); }
                }
                @keyframes float-delayed {
                    0%, 100% { transform: translateY(0px) translateX(0px); }
                    33% { transform: translateY(-15px) translateX(-15px); }
                    66% { transform: translateY(-25px) translateX(15px); }
                }
                @keyframes float-slow {
                    0%, 100% { transform: translateY(0px) scale(1); }
                    50% { transform: translateY(-30px) scale(1.1); }
                }
                @keyframes float-particle {
                    0% { transform: translateY(0) translateX(0) scale(0); opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { transform: translateY(-100vh) translateX(30px) scale(1); opacity: 0; }
                }
                @keyframes pulse-glow {
                    0%, 100% { opacity: 0.3; transform: scale(1); }
                    50% { opacity: 0.6; transform: scale(1.05); }
                }
                @keyframes pulse-glow-delayed {
                    0%, 100% { opacity: 0.2; transform: scale(1); }
                    50% { opacity: 0.5; transform: scale(1.08); }
                }
                @keyframes pulse-slow {
                    0%, 100% { opacity: 0.8; }
                    50% { opacity: 1; }
                }
                @keyframes gradient {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                @keyframes spin-slow {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes spin-border {
                    from { transform: rotate(0deg) scale(1.5); }
                    to { transform: rotate(360deg) scale(1.5); }
                }
                @keyframes scan {
                    0% { top: 0%; opacity: 0; }
                    50% { opacity: 1; }
                    100% { top: 100%; opacity: 0; }
                }
                @keyframes scan-delayed {
                    0% { top: 0%; opacity: 0; }
                    50% { opacity: 1; }
                    100% { top: 100%; opacity: 0; }
                }
                @keyframes gridMove {
                    0% { transform: translateY(0); }
                    100% { transform: translateY(60px); }
                }
                @keyframes orbit {
                    0% { transform: rotate(0deg) translateX(40px) rotate(0deg); }
                    100% { transform: rotate(360deg) translateX(40px) rotate(-360deg); }
                }
                .animate-float {
                    animation: float 8s ease-in-out infinite;
                }
                .animate-float-delayed {
                    animation: float-delayed 10s ease-in-out infinite;
                }
                .animate-float-slow {
                    animation: float-slow 12s ease-in-out infinite;
                }
                .animate-float-particle {
                    animation: float-particle linear infinite;
                }
                .animate-pulse-glow {
                    animation: pulse-glow 4s ease-in-out infinite;
                }
                .animate-pulse-glow-delayed {
                    animation: pulse-glow-delayed 4s ease-in-out infinite 1s;
                }
                .animate-pulse-slow {
                    animation: pulse-slow 3s ease-in-out infinite;
                }
                .animate-gradient {
                    background-size: 200% 200%;
                    animation: gradient 4s ease infinite;
                }
                .animate-spin-slow {
                    animation: spin-slow linear infinite;
                }
                .animate-spin-border {
                    animation: spin-border linear infinite;
                }
                .animate-scan {
                    animation: scan 8s ease-in-out infinite;
                }
                .animate-scan-delayed {
                    animation: scan-delayed 8s ease-in-out infinite 4s;
                }
                .animate-orbit {
                    animation: orbit 4s linear infinite;
                }
            `}</style>
        </div>
    );
};

export default Login;