import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Layers } from 'lucide-react';
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
            className={`fixed top-0 w-full z-50 transition-all duration-300 ${
                isScrolled
                    ? 'bg-[var(--color-bg-primary)]/80 backdrop-blur-xl border-b border-[var(--color-border-subtle)]'
                    : 'bg-transparent'
            }`}
        >
            <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2.5 group">
                    <div className="relative">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-teal-500/20 group-hover:shadow-teal-500/40 transition-shadow">
                            <Layers size={16} className="text-white" strokeWidth={2.5} />
                        </div>
                        <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-teal-400 to-cyan-500 blur-lg opacity-40 group-hover:opacity-60 transition-opacity" />
                    </div>
                    <span className="font-semibold text-[var(--color-text-primary)] tracking-tight">
                        DevCom
                    </span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-1">
                    <a
                        href="#features"
                        className="px-3.5 py-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] rounded-lg transition-all"
                    >
                        Features
                    </a>
                    <a
                        href="#tools"
                        className="px-3.5 py-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] rounded-lg transition-all"
                    >
                        Tools
                    </a>
                    <div className="w-px h-5 bg-[var(--color-border-default)] mx-2" />
                    <Link
                        to="/login"
                        className="px-3.5 py-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] rounded-lg transition-all"
                    >
                        Sign in
                    </Link>
                    <Link
                        to="/login"
                        className="ml-1 px-4 py-2 text-sm font-medium bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white rounded-lg transition-all hover:shadow-lg hover:shadow-teal-500/20"
                    >
                        Get Started
                    </Link>
                </nav>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] rounded-lg transition-colors"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            {/* Mobile Nav */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-[var(--color-bg-secondary)] border-b border-[var(--color-border-subtle)] overflow-hidden"
                    >
                        <div className="px-6 py-4 flex flex-col gap-1">
                            <a
                                href="#features"
                                className="px-3 py-2.5 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] rounded-lg transition-all"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Features
                            </a>
                            <a
                                href="#tools"
                                className="px-3 py-2.5 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] rounded-lg transition-all"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Tools
                            </a>
                            <div className="h-px bg-[var(--color-border-subtle)] my-2" />
                            <Link
                                to="/login"
                                className="px-3 py-2.5 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] rounded-lg transition-all"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Sign in
                            </Link>
                            <Link
                                to="/login"
                                className="mt-2 px-4 py-3 text-sm font-medium bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white rounded-lg text-center transition-all"
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
