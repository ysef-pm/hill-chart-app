import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, LayoutGrid } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header
            className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'
                }`}
        >
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="bg-slate-900 text-white p-1.5 rounded-lg group-hover:bg-blue-600 transition-colors">
                        <LayoutGrid size={20} />
                    </div>
                    <span className="font-bold text-xl text-slate-900 tracking-tight">Dev Com Tools</span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-8">
                    <a href="#features" className="text-slate-600 hover:text-slate-900 font-medium text-sm">Features</a>
                    <a href="#how-it-works" className="text-slate-600 hover:text-slate-900 font-medium text-sm">How it Works</a>
                    <Link to="/login" className="text-slate-900 font-medium text-sm hover:text-blue-600">Log in</Link>
                    <Link
                        to="/login"
                        className="bg-slate-900 hover:bg-blue-600 text-white px-5 py-2 rounded-full font-medium text-sm transition-all hover:shadow-lg hover:-translate-y-0.5"
                    >
                        Get Started
                    </Link>
                </nav>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden text-slate-900"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Nav */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white border-b border-slate-100 overflow-hidden"
                    >
                        <div className="px-6 py-4 flex flex-col gap-4">
                            <a href="#features" className="text-slate-600 font-medium" onClick={() => setMobileMenuOpen(false)}>Features</a>
                            <a href="#how-it-works" className="text-slate-600 font-medium" onClick={() => setMobileMenuOpen(false)}>How it Works</a>
                            <hr className="border-slate-100" />
                            <Link to="/login" className="text-slate-900 font-medium" onClick={() => setMobileMenuOpen(false)}>Log in</Link>
                            <Link
                                to="/login"
                                className="bg-slate-900 text-white px-5 py-3 rounded-xl font-medium text-center"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Get Started
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
