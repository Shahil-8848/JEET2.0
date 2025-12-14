import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { User, Wallet, Trophy, History, Sparkles } from 'lucide-react';
import { format } from 'date-fns';

const Profile = () => {
    const { profile } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (profile) {
            fetchTransactions();
        }
    }, [profile]);

    const fetchTransactions = async () => {
        try {
            const { data, error } = await supabase
                .from('transactions')
                .select('*')
                .eq('user_id', profile.id)
                .order('created_at', { ascending: false })
                .limit(20);

            if (error) throw error;
            setTransactions(data);
        } catch (error) {
            console.error('Error fetching transactions:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!profile) return null;

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">My Profile</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-surface p-6 rounded-xl border border-gray-800 flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/20 text-primary rounded-full flex items-center justify-center">
                        <User size={24} />
                    </div>
                    <div>
                        <p className="text-gray-400 text-sm">Full Name</p>
                        <p className="font-bold text-lg">{profile.full_name}</p>
                    </div>
                </div>

                <div className="bg-surface p-6 rounded-xl border border-gray-800 flex items-center gap-4">
                    <div className="w-12 h-12 bg-success/20 text-success rounded-full flex items-center justify-center">
                        <Wallet size={24} />
                    </div>
                    <div>
                        <p className="text-gray-400 text-sm">Balance</p>
                        <p className="font-bold text-lg flex items-center gap-1">
                            <Sparkles size={16} className="fill-current" />
                            {profile.balance}
                        </p>
                    </div>
                </div>

                <div className="bg-surface p-6 rounded-xl border border-gray-800 flex items-center gap-4">
                    <div className="w-12 h-12 bg-warning/20 text-warning rounded-full flex items-center justify-center">
                        <Trophy size={24} />
                    </div>
                    <div>
                        <p className="text-gray-400 text-sm">Total Earnings</p>
                        <p className="font-bold text-lg flex items-center gap-1">
                            <Sparkles size={16} className="fill-current" />
                            {profile.total_earnings || 0}
                        </p>
                    </div>
                </div>

                {/* New Stats Row */}
                <div className="bg-surface p-6 rounded-xl border border-gray-800 flex flex-col gap-2">
                    <p className="text-gray-400 text-sm">Match Stats</p>
                    <div className="flex justify-between items-end">
                        <div className="text-center">
                            <p className="text-2xl font-bold">{profile.total_matches || 0}</p>
                            <p className="text-xs text-gray-500">Played</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-success">{profile.wins || 0}</p>
                            <p className="text-xs text-gray-500">Won</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-error">{profile.losses || 0}</p>
                            <p className="text-xs text-gray-500">Lost</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Transaction History */}
            <div className="bg-surface rounded-xl border border-gray-800 overflow-hidden">
                <div className="p-6 border-b border-gray-800 flex items-center gap-2">
                    <History size={20} className="text-primary" />
                    <h2 className="text-xl font-bold">Transaction History</h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-900/50 text-gray-400 text-sm">
                            <tr>
                                <th className="p-4">Type</th>
                                <th className="p-4">Description</th>
                                <th className="p-4">Amount</th>
                                <th className="p-4">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {transactions.length > 0 ? (
                                transactions.map(tx => (
                                    <tr key={tx.id} className="hover:bg-gray-800/50 transition-colors">
                                        <td className="p-4">
                                            <span className={`text-xs px-2 py-1 rounded-full font-bold ${tx.amount > 0 ? 'bg-success/20 text-success' : 'bg-error/20 text-error'
                                                }`}>
                                                {tx.type}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm">{tx.description}</td>
                                        <td className={`p-4 font-bold ${tx.amount > 0 ? 'text-success' : 'text-error'}`}>
                                            <span className="flex items-center gap-0.5">
                                                {tx.amount > 0 ? '+' : ''}
                                                <Sparkles size={12} className="fill-current" />
                                                {Math.abs(tx.amount)}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-gray-500">
                                            {format(new Date(tx.created_at), 'MMM d, yyyy HH:mm')}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="p-8 text-center text-gray-500">
                                        No transactions yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Profile;
