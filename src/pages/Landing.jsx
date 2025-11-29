import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Header from '../components/landing/Header';
import Hero from '../components/landing/Hero';
import ToolsShowcase from '../components/landing/ToolsShowcase';
import Footer from '../components/landing/Footer';

export default function Landing() {
    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] selection:bg-teal-500/20 selection:text-[var(--color-text-primary)]">
            <Header />
            <main>
                <Hero />
                <ToolsShowcase />

                {/* Features Section */}
                <section id="features" className="py-32 relative">
                    <div className="max-w-6xl mx-auto px-6">
                        <div className="grid lg:grid-cols-2 gap-16 items-center">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                            >
                                <p className="text-sm font-medium text-[var(--color-accent)] uppercase tracking-wider mb-4">
                                    Why DevCom
                                </p>
                                <h2 className="text-4xl md:text-5xl font-semibold text-[var(--color-text-primary)] tracking-tight mb-6 leading-tight">
                                    Built for how
                                    <br />
                                    teams actually work
                                </h2>
                                <p className="text-lg text-[var(--color-text-secondary)] mb-8 leading-relaxed">
                                    We've seen too many tools that complicate instead of simplify. DevCom focuses on what matters: clear communication, visual progress, and team alignment.
                                </p>

                                <div className="space-y-5">
                                    {[
                                        { title: 'Real-time collaboration', desc: 'See changes instantly. No refresh needed.' },
                                        { title: 'Zero learning curve', desc: 'Intuitive interfaces that just work.' },
                                        { title: 'Works with your flow', desc: 'Async-friendly tools for distributed teams.' }
                                    ].map((feature, i) => (
                                        <div key={i} className="flex gap-4">
                                            <div className="w-5 h-5 mt-0.5 rounded-full bg-[var(--color-accent)]/20 flex items-center justify-center flex-shrink-0">
                                                <div className="w-2 h-2 rounded-full bg-[var(--color-accent)]" />
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-[var(--color-text-primary)] mb-1">{feature.title}</h4>
                                                <p className="text-sm text-[var(--color-text-tertiary)]">{feature.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="relative"
                            >
                                {/* Feature visual */}
                                <div className="glass-card-elevated p-8 rounded-2xl">
                                    <div className="space-y-4">
                                        {/* Simulated activity feed */}
                                        {[
                                            { user: 'Sarah', action: 'moved "Auth Flow" to Done', time: '2m ago', color: 'bg-emerald-500' },
                                            { user: 'Mike', action: 'added a retrospective item', time: '5m ago', color: 'bg-cyan-500' },
                                            { user: 'Lisa', action: 'gave kudos to the team', time: '12m ago', color: 'bg-rose-500' }
                                        ].map((item, i) => (
                                            <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--color-surface-1)] border border-[var(--color-border-subtle)]">
                                                <div className={`w-8 h-8 rounded-full ${item.color} flex items-center justify-center text-white text-xs font-medium`}>
                                                    {item.user[0]}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm text-[var(--color-text-primary)] truncate">
                                                        <span className="font-medium">{item.user}</span> {item.action}
                                                    </p>
                                                    <p className="text-xs text-[var(--color-text-muted)]">{item.time}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Decorative glow */}
                                <div className="absolute -inset-4 bg-gradient-to-br from-teal-500/10 to-cyan-500/10 rounded-3xl blur-2xl -z-10" />
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Final CTA Section */}
                <section className="py-32 relative overflow-hidden">
                    {/* Background */}
                    <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-bg-primary)] via-[var(--color-bg-secondary)] to-[var(--color-bg-primary)]" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-3xl" />

                    <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-4xl md:text-5xl font-semibold text-[var(--color-text-primary)] tracking-tight mb-6">
                                Ready to improve your
                                <br />
                                team communication?
                            </h2>
                            <p className="text-lg text-[var(--color-text-secondary)] mb-10 max-w-xl mx-auto">
                                Join hundreds of product teams using DevCom to align their development process.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Link
                                    to="/login"
                                    className="group flex items-center gap-2 px-8 py-4 bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-white font-medium rounded-xl transition-all hover:shadow-xl hover:shadow-teal-500/25 hover:-translate-y-0.5"
                                >
                                    Get started for free
                                    <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
                                </Link>
                            </div>

                            <p className="mt-6 text-sm text-[var(--color-text-muted)]">
                                No credit card required · Free for small teams
                            </p>
                        </motion.div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
