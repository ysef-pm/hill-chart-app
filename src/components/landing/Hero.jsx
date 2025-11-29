import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function Hero() {
    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[var(--color-bg-primary)]">
                {/* Radial gradient glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-teal-500/10 via-cyan-500/5 to-transparent rounded-full blur-3xl" />

                {/* Grid pattern */}
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                                         linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                        backgroundSize: '60px 60px'
                    }}
                />

                {/* Floating orbs */}
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl animate-pulse-soft" />
                <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '1s' }} />
            </div>

            <div className="relative z-10 max-w-5xl mx-auto px-6 pt-24 pb-16 text-center">
                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center gap-2 px-3 py-1.5 mb-8 rounded-full bg-[var(--color-surface-2)] border border-[var(--color-border-default)] text-sm"
                >
                    <Sparkles size={14} className="text-teal-400" />
                    <span className="text-[var(--color-text-secondary)]">
                        New: Team Kudos Board
                    </span>
                    <span className="text-teal-400">→</span>
                </motion.div>

                {/* Headline */}
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-5xl md:text-7xl lg:text-8xl font-semibold text-[var(--color-text-primary)] tracking-tight leading-[1.05] mb-6"
                >
                    Communicate
                    <br />
                    <span className="text-gradient">better with your</span>
                    <br />
                    dev team
                </motion.h1>

                {/* Subheadline */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-lg md:text-xl text-[var(--color-text-secondary)] max-w-2xl mx-auto mb-10 leading-relaxed"
                >
                    A suite of elegant tools for product managers to track progress,
                    run retrospectives, and keep development teams aligned.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                    <Link
                        to="/login"
                        className="group flex items-center gap-2 px-6 py-3 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-medium rounded-xl transition-all hover:shadow-xl hover:shadow-teal-500/25 hover:-translate-y-0.5"
                    >
                        Start for free
                        <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                    <a
                        href="#tools"
                        className="flex items-center gap-2 px-6 py-3 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] font-medium rounded-xl transition-colors hover:bg-[var(--color-surface-hover)]"
                    >
                        Explore tools
                    </a>
                </motion.div>

                {/* Social Proof */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="mt-16 flex items-center justify-center gap-6"
                >
                    <div className="flex -space-x-2">
                        {['A', 'B', 'C', 'D', 'E'].map((letter, i) => (
                            <div
                                key={letter}
                                className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--color-surface-3)] to-[var(--color-surface-1)] border-2 border-[var(--color-bg-primary)] flex items-center justify-center text-xs font-medium text-[var(--color-text-tertiary)]"
                                style={{ zIndex: 5 - i }}
                            >
                                {letter}
                            </div>
                        ))}
                    </div>
                    <div className="h-8 w-px bg-[var(--color-border-default)]" />
                    <p className="text-sm text-[var(--color-text-tertiary)]">
                        Trusted by <span className="text-[var(--color-text-secondary)] font-medium">100+</span> product teams
                    </p>
                </motion.div>

                {/* Preview Window */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.4 }}
                    className="mt-20 relative"
                >
                    <div className="relative glass-card-elevated p-1 rounded-2xl overflow-hidden">
                        {/* Window Chrome */}
                        <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--color-border-subtle)]">
                            <div className="flex gap-1.5">
                                <div className="w-3 h-3 rounded-full bg-[var(--color-surface-3)]" />
                                <div className="w-3 h-3 rounded-full bg-[var(--color-surface-3)]" />
                                <div className="w-3 h-3 rounded-full bg-[var(--color-surface-3)]" />
                            </div>
                            <div className="flex-1 flex justify-center">
                                <div className="px-4 py-1 rounded-md bg-[var(--color-surface-1)] text-xs text-[var(--color-text-tertiary)]">
                                    devcom.app/dashboard
                                </div>
                            </div>
                        </div>

                        {/* Window Content - Simulated Dashboard */}
                        <div className="p-6 bg-[var(--color-bg-secondary)]">
                            <div className="grid grid-cols-3 gap-4">
                                {/* Tool Cards Preview */}
                                {[
                                    { name: 'Hill Chart', color: 'from-cyan-500 to-teal-500' },
                                    { name: 'Retro Board', color: 'from-emerald-500 to-green-500' },
                                    { name: 'Kudos Wall', color: 'from-rose-500 to-pink-500' }
                                ].map((tool) => (
                                    <div
                                        key={tool.name}
                                        className="aspect-[4/3] rounded-xl bg-[var(--color-surface-1)] border border-[var(--color-border-subtle)] p-4 flex flex-col"
                                    >
                                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${tool.color} opacity-80`} />
                                        <div className="mt-auto">
                                            <div className="h-2 w-16 bg-[var(--color-surface-3)] rounded mb-1.5" />
                                            <div className="h-1.5 w-24 bg-[var(--color-surface-2)] rounded" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Glow effect behind preview */}
                    <div className="absolute -inset-4 bg-gradient-to-b from-teal-500/20 via-transparent to-transparent rounded-3xl blur-2xl -z-10" />
                </motion.div>
            </div>
        </section>
    );
}
