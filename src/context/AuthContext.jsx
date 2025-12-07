import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id);
            } else {
                setLoading(false);
            }
        });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id);
            } else {
                setProfile(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    // Real-time subscription for profile updates
    useEffect(() => {
        if (!user) return;

        const channel = supabase
            .channel(`public:users:${user.id}`)
            .on('postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'users',
                    filter: `id=eq.${user.id}`
                },
                (payload) => {
                    setProfile(payload.new);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    const fetchProfile = async (userId) => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) throw error;
            setProfile(data);
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const signUp = async (email, password, fullName) => {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                    },
                },
            });
            if (error) throw error;
            return data;
        } catch (error) {
            toast.error(error.message);
            throw error;
        }
    };

    const signIn = async (email, password) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) throw error;
            return data;
        } catch (error) {
            toast.error(error.message);
            throw error;
        }
    };

    const signOut = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            toast.success('Logged out successfully');
        } catch (error) {
            toast.error(error.message);
        }
    };

    const value = {
        user,
        profile,
        loading,
        signUp,
        signIn,
        signOut,
        refreshProfile: () => user && fetchProfile(user.id),
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
