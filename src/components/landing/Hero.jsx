import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import heroImg from '../../assets/landing/hero_illustration.png';

export default function Hero() {
    return (
        <section className="pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium mb-6">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                            </span>
                            New: Habit Tracker available
                        </div>

                        <h1 className="text-5xl md:text-7xl font-bold text-slate-900 leading-[1.1] tracking-tight mb-6">
                            Communicate well with your devs.
                        </h1>

                        <p className="text-xl text-slate-500 mb-8 max-w-lg leading-relaxed">
                            Simple tools for product managers to track progress, build good habits, and keep your dev team connected.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link
                                to="/login"
                                className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-blue-600 text-white px-8 py-4 rounded-full text-lg font-medium transition-all hover:shadow-xl hover:-translate-y-1"
                            >
                                Get Started Free <ArrowRight size={20} />
                            </Link>
                            <a
                                href="#features"
                                className="inline-flex items-center justify-center gap-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 px-8 py-4 rounded-full text-lg font-medium transition-all hover:bg-slate-50"
                            >
                                View Tools
                            </a>
                        </div>

                        <div className="mt-8 flex items-center gap-4 text-sm text-slate-400">
                            <div className="flex -space-x-2">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-xs font-bold text-slate-500">
                                        {String.fromCharCode(64 + i)}
                                    </div>
                                ))}
                            </div>
                            <p>Trusted by 100+ Product Managers</p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="relative"
                    >
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-100/50 to-purple-100/50 rounded-full blur-3xl -z-10 transform scale-90"></div>
                        <img
                            src={heroImg}
                            alt="Team collaboration illustration"
                            className="w-full h-auto max-w-lg mx-auto drop-shadow-sm mix-blend-multiply"
                        />
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
