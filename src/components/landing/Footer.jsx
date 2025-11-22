import React from 'react';
import { LayoutGrid } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-slate-900 text-slate-300 py-16">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid md:grid-cols-4 gap-12 mb-12">
                    <div className="col-span-1 md:col-span-1">
                        <div className="flex items-center gap-2 mb-6 text-white">
                            <LayoutGrid size={24} />
                            <span className="font-bold text-xl">Dev Com Tools</span>
                        </div>
                        <p className="text-slate-500 text-sm leading-relaxed">
                            Helping product managers and development teams communicate better, one tool at a time.
                        </p>
                    </div>

                    <div>
                        <h4 className="text-white font-semibold mb-4">Tools</h4>
                        <ul className="space-y-3 text-sm">
                            <li><a href="#" className="hover:text-white transition-colors">Hill Chart</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Feelings Wheel</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Retro Board</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Habit Tracker</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-semibold mb-4">Resources</h4>
                        <ul className="space-y-3 text-sm">
                            <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Best Practices</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-semibold mb-4">Legal</h4>
                        <ul className="space-y-3 text-sm">
                            <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
                    <p>© 2024 Dev Com Tools. All rights reserved.</p>
                    <p>Made with 💙 for PMs everywhere.</p>
                </div>
            </div>
        </footer>
    );
}
