import React from 'react';
import { LogOut, TrendingUp, Smile } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

const Launcher = ({ onSelectApp, user }) => {
    const handleSignOut = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 p-8">
            <div className="max-w-5xl mx-auto">
                <header className="flex justify-between items-center mb-12">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Dev Com Tools</h1>
                        <p className="text-slate-500 mt-1">Welcome back, {user?.displayName || 'Developer'}</p>
                    </div>
                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-600 text-sm font-bold rounded-full shadow-sm border border-slate-200 transition-all"
                    >
                        <LogOut size={16} />
                        Sign Out
                    </button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Hill Chart Card */}
                    <button
                        onClick={() => onSelectApp('hill-chart')}
                        className="group bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:border-blue-200 transition-all text-left relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <TrendingUp size={120} className="text-blue-600" />
                        </div>

                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <TrendingUp size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Hill Chart</h3>
                        <p className="text-slate-500 text-sm leading-relaxed">
                            Track project progress from uncertainty to execution using the Hill Chart methodology.
                        </p>
                    </button>

                    {/* Feelings Wheel Card (Coming Soon) */}
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 border-dashed relative opacity-75 cursor-not-allowed">
                        <div className="w-12 h-12 bg-slate-200 text-slate-400 rounded-xl flex items-center justify-center mb-4">
                            <Smile size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-400 mb-2">Feelings Wheel</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            A tool to help developers express how they are feeling during standups and retrospectives.
                        </p>
                        <div className="absolute top-4 right-4 bg-slate-200 text-slate-500 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded">
                            Coming Soon
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Launcher;
