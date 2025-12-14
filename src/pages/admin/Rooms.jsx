import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Trash2, ExternalLink, Loader2, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminRooms = () => {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRooms, setSelectedRooms] = useState(new Set());

    useEffect(() => {
        fetchRooms();
    }, []);

    const fetchRooms = async () => {
        try {
            const { data, error } = await supabase
                .from('matches')
                .select('*, host:users!host_id(full_name)')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setRooms(data);
        } catch (error) {
            console.error('Error fetching rooms:', error);
            toast.error('Failed to load rooms');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteRoom = async (roomId) => {
        if (!confirm('Are you sure you want to delete this room? This cannot be undone.')) return;

        try {
            const { error } = await supabase
                .from('matches')
                .delete()
                .eq('id', roomId);

            if (error) throw error;

            toast.success('Room deleted successfully');
            setRooms(rooms.filter(room => room.id !== roomId));
            setSelectedRooms(prev => {
                const newSet = new Set(prev);
                newSet.delete(roomId);
                return newSet;
            });
        } catch (error) {
            console.error('Error deleting room:', error);
            toast.error('Failed to delete room');
        }
    };

    const handleBulkDelete = async () => {
        if (selectedRooms.size === 0) return;
        if (!confirm(`Are you sure you want to delete ${selectedRooms.size} rooms? This cannot be undone.`)) return;

        const toastId = toast.loading('Deleting rooms...');
        try {
            const { error } = await supabase
                .from('matches')
                .delete()
                .in('id', Array.from(selectedRooms));

            if (error) throw error;

            toast.success(`${selectedRooms.size} rooms deleted successfully`, { id: toastId });
            setRooms(rooms.filter(room => !selectedRooms.has(room.id)));
            setSelectedRooms(new Set());
        } catch (error) {
            console.error('Error deleting rooms:', error);
            toast.error('Failed to delete rooms', { id: toastId });
        }
    };

    const toggleSelectAll = () => {
        if (selectedRooms.size === rooms.length) {
            setSelectedRooms(new Set());
        } else {
            setSelectedRooms(new Set(rooms.map(r => r.id)));
        }
    };

    const toggleSelectRoom = (id) => {
        const newSet = new Set(selectedRooms);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedRooms(newSet);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING': return 'text-yellow-400 bg-yellow-400/10';
            case 'LIVE': return 'text-green-400 bg-green-400/10';
            case 'COMPLETED': return 'text-blue-400 bg-blue-400/10';
            case 'VERIFIED': return 'text-purple-400 bg-purple-400/10';
            default: return 'text-gray-400 bg-gray-400/10';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-white">Room Management</h1>
                {selectedRooms.size > 0 && (
                    <div className="flex items-center gap-4 bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-xl animate-in fade-in slide-in-from-right">
                        <span className="text-red-400 font-bold text-sm">{selectedRooms.size} Selected</span>
                        <button
                            onClick={handleBulkDelete}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold transition-colors flex items-center gap-2"
                        >
                            <Trash2 size={14} /> Delete Selected
                        </button>
                    </div>
                )}
            </div>

            <div className="bg-surface border border-white/5 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 text-gray-400 text-sm">
                            <tr>
                                <th className="p-4 w-12">
                                    <input
                                        type="checkbox"
                                        checked={rooms.length > 0 && selectedRooms.size === rooms.length}
                                        onChange={toggleSelectAll}
                                        className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-primary focus:ring-primary focus:ring-offset-gray-900"
                                    />
                                </th>
                                <th className="p-4">Room ID</th>
                                <th className="p-4">Game</th>
                                <th className="p-4">Host</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Prize</th>
                                <th className="p-4">Created</th>
                                <th className="p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-gray-300">
                            {loading ? (
                                <tr><td colSpan="7" className="p-8 text-center"><Loader2 className="animate-spin mx-auto" /></td></tr>
                            ) : rooms.length > 0 ? (
                                rooms.map(room => (
                                    <tr key={room.id} className={`hover:bg-white/5 transition-colors ${selectedRooms.has(room.id) ? 'bg-white/[0.02]' : ''}`}>
                                        <td className="p-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedRooms.has(room.id)}
                                                onChange={() => toggleSelectRoom(room.id)}
                                                className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-primary focus:ring-primary focus:ring-offset-gray-900"
                                            />
                                        </td>
                                        <td className="p-4 font-mono text-xs text-gray-400">{room.id.slice(0, 8)}...</td>
                                        <td className="p-4 font-medium text-white">{room.game_type}</td>
                                        <td className="p-4">{room.host?.full_name}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(room.status)}`}>
                                                {room.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-primary flex items-center gap-1">
                                            <Sparkles size={14} className="fill-current" />
                                            {room.prize_amount}
                                        </td>
                                        <td className="p-4 text-xs text-gray-500">{new Date(room.created_at).toLocaleDateString()}</td>
                                        <td className="p-4">
                                            <button
                                                onClick={() => handleDeleteRoom(room.id)}
                                                className="bg-red-500/10 hover:bg-red-500/20 text-red-500 p-2 rounded-lg transition-colors"
                                                title="Delete Room"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="8" className="p-8 text-center text-gray-500">No rooms found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminRooms;
