import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Search, Wallet, Coins, Loader2, ArrowRightLeft, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [transferAmount, setTransferAmount] = useState('');
    const [transferType, setTransferType] = useState('ADD'); // ADD or DEDUCT
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleBalanceUpdate = async (e) => {
        e.preventDefault();
        if (!selectedUser || !transferAmount) return;

        const amount = parseFloat(transferAmount);
        // If deducting, send negative amount
        const finalAmount = transferType === 'DEDUCT' ? -amount : amount;

        try {
            const { data, error } = await supabase.rpc('admin_update_balance', {
                p_user_id: selectedUser.id,
                p_amount: finalAmount,
                p_description: `Admin ${transferType === 'ADD' ? 'Deposit' : 'Deduction'}`
            });

            if (error) throw error;
            if (!data.success) throw new Error(data.error);

            toast.success(`Balance ${transferType === 'ADD' ? 'added' : 'deducted'} successfully`);
            setIsModalOpen(false);
            setTransferAmount('');
            fetchUsers(); // Refresh list

        } catch (error) {
            console.error('Error updating balance:', error);
            toast.error(error.message || 'Failed to update balance. Run the admin SQL script first!');
        }
    };

    const filteredUsers = users.filter(user =>
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">User Management</h1>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-surface border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary w-64"
                    />
                </div>
            </div>

            <div className="bg-surface border border-white/5 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 text-gray-400 text-sm">
                            <tr>
                                <th className="p-4">User</th>
                                <th className="p-4">Balance</th>
                                <th className="p-4">Matches</th>
                                <th className="p-4">W/L</th>
                                <th className="p-4">Joined</th>
                                <th className="p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-gray-300">
                            {loading ? (
                                <tr><td colSpan="6" className="p-8 text-center"><Loader2 className="animate-spin mx-auto" /></td></tr>
                            ) : filteredUsers.length > 0 ? (
                                filteredUsers.map(user => (
                                    <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                        <td className="p-4">
                                            <div>
                                                <div className="font-bold text-white">{user.full_name}</div>
                                                <div className="text-xs text-gray-500">{user.email}</div>
                                            </div>
                                        </td>
                                        <td className="p-4 font-mono text-primary flex items-center gap-1">
                                            <Sparkles size={14} className="fill-current" />
                                            {user.balance}
                                        </td>
                                        <td className="p-4">{user.total_matches}</td>
                                        <td className="p-4 text-xs">
                                            <span className="text-green-400">{user.wins}W</span> / <span className="text-red-400">{user.losses}L</span>
                                        </td>
                                        <td className="p-4 text-xs text-gray-500">{new Date(user.created_at).toLocaleDateString()}</td>
                                        <td className="p-4">
                                            <button
                                                onClick={() => {
                                                    setSelectedUser(user);
                                                    setTransferType('ADD');
                                                    setIsModalOpen(true);
                                                }}
                                                className="bg-primary/20 hover:bg-primary/30 text-primary p-2 rounded-lg transition-colors"
                                                title="Manage Balance"
                                            >
                                                <Wallet size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="6" className="p-8 text-center text-gray-500">No users found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Transfer Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                    <div className="bg-surface border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl">
                        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <ArrowRightLeft className="text-primary" /> Manage Balance
                        </h2>
                        <div className="mb-6 bg-white/5 p-4 rounded-xl">
                            <p className="text-sm text-gray-400">User</p>
                            <p className="text-lg font-bold text-white">{selectedUser?.full_name}</p>
                            <p className="text-sm text-gray-400 mt-2">Current Balance</p>
                            <p className="text-2xl font-mono text-primary flex items-center gap-1">
                                <Sparkles size={20} className="fill-current" />
                                {selectedUser?.balance}
                            </p>
                        </div>

                        <form onSubmit={handleBalanceUpdate} className="space-y-4">
                            <div className="flex gap-2 bg-black/20 p-1 rounded-lg">
                                <button
                                    type="button"
                                    onClick={() => setTransferType('ADD')}
                                    className={`flex-1 py-2 rounded-md font-medium transition-all ${transferType === 'ADD' ? 'bg-green-500/20 text-green-400 shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                                >
                                    Add Funds
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setTransferType('DEDUCT')}
                                    className={`flex-1 py-2 rounded-md font-medium transition-all ${transferType === 'DEDUCT' ? 'bg-red-500/20 text-red-400 shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                                >
                                    Deduct Funds
                                </button>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-1 flex items-center gap-1">
                                    Amount <Sparkles size={12} className="fill-current" />
                                </label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    value={transferAmount}
                                    onChange={(e) => setTransferAmount(e.target.value)}
                                    className="w-full bg-background border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-primary focus:outline-none"
                                    placeholder="0.00"
                                />
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 bg-white/5 hover:bg-white/10 text-white py-3 rounded-lg font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className={`flex-1 py-3 rounded-lg font-bold text-black transition-colors ${transferType === 'ADD' ? 'bg-green-500 hover:bg-green-400' : 'bg-red-500 hover:bg-red-400'}`}
                                >
                                    {transferType === 'ADD' ? 'Deposit' : 'Deduct'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsers;
