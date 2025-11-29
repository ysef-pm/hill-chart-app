import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Smile, MessageSquare, CheckSquare, Timer, Heart } from 'lucide-react';

const tools = [
    {
        id: 'hill-chart',
        name: 'Hill Chart',
        description: 'Visualize project progress from uncertainty to execution. Know exactly where every initiative stands.',
        icon: TrendingUp,
        gradient: 'from-cyan-500 to-teal-500',
        glowColor: 'rgba(20, 184, 166, 0.3)',
        delay: 0
    },
    {
        id: 'feelings-wheel',
        name: 'Feelings Wheel',
        description: 'Create psychological safety by sharing emotions during standups and retros.',
        icon: Smile,
        gradient: 'from-pink-500 to-rose-500',
        glowColor: 'rgba(236, 72, 153, 0.3)',
        delay: 0.1
    },
    {
        id: 'retro-board',
        name: 'Retro Board',
        description: 'Run engaging retrospectives with structured columns for wins, challenges, and actions.',
        icon: MessageSquare,
        gradient: 'from-emerald-500 to-green-500',
        glowColor: 'rgba(34, 197, 94, 0.3)',
        delay: 0.2
    },
    {
        id: 'habit-tracker',
        name: 'Habit Tracker',
        description: 'Build good team habits together. Track daily practices and celebrate streaks.',
        icon: CheckSquare,
        gradient: 'from-violet-500 to-purple-500',
        glowColor: 'rgba(139, 92, 246, 0.3)',
        delay: 0.3
    },
    {
        id: 'pomodoro',
        name: 'Focus Timer',
        description: 'Collaborative pomodoro sessions with team presence and task garden visualization.',
        icon: Timer,
        gradient: 'from-orange-500 to-amber-500',
        glowColor: 'rgba(249, 115, 22, 0.3)',
        delay: 0.4
    },
    {
        id: 'kudos',
        name: 'Kudos Board',
        description: 'Celebrate wins and give recognition. Build a culture of appreciation.',
        icon: Heart,
        gradient: 'from-red-500 to-rose-500',
        glowColor: 'rgba(239, 68, 68, 0.3)',
        delay: 0.5
    }
];

export default function ToolsShowcase() {
    return (
        <section id="tools" className="py-32 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-[var(--color-bg-secondary)]" />
            <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-bg-primary)] via-transparent to-[var(--color-bg-primary)] opacity-50" />

            <div className="relative z-10 max-w-6xl mx-auto px-6">
                {/* Section Header */}
                <div className="text-center mb-20">
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-sm font-medium text-[var(--color-accent)] uppercase tracking-wider mb-4"
                    >
                        Everything you need
                    </motion.p>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-semibold text-[var(--color-text-primary)] tracking-tight mb-6"
                    >
                        Tools built for
                        <br />
                        modern teams
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-lg text-[var(--color-text-secondary)] max-w-xl mx-auto"
                    >
                        Six focused tools designed to improve how product and engineering teams communicate.
                    </motion.p>
                </div>

                {/* Tools Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tools.map((tool) => (
                        <motion.div
                            key={tool.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: tool.delay }}
                            className="group relative"
                        >
                            <div className="relative p-6 rounded-2xl bg-[var(--color-surface-1)] border border-[var(--color-border-subtle)] hover:border-[var(--color-border-default)] transition-all duration-300 hover:bg-[var(--color-surface-2)]">
                                {/* Icon */}
                                <div className="relative mb-5">
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                        <tool.icon size={22} className="text-white" strokeWidth={2} />
                                    </div>
                                    {/* Glow effect on hover */}
                                    <div
                                        className="absolute inset-0 rounded-xl blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-300"
                                        style={{ background: tool.glowColor }}
                                    />
                                </div>

                                {/* Content */}
                                <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2 group-hover:text-white transition-colors">
                                    {tool.name}
                                </h3>
                                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                                    {tool.description}
                                </p>

                                {/* Hover indicator */}
                                <div className="mt-4 flex items-center gap-1.5 text-sm font-medium text-[var(--color-accent)] opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span>Learn more</span>
                                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Bottom CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.6 }}
                    className="mt-16 text-center"
                >
                    <p className="text-[var(--color-text-tertiary)] mb-4">
                        More tools coming soon
                    </p>
                    <div className="flex justify-center gap-3">
                        <span className="px-3 py-1.5 rounded-full bg-[var(--color-surface-2)] border border-[var(--color-border-subtle)] text-xs text-[var(--color-text-tertiary)]">
                            Decision Log
                        </span>
                        <span className="px-3 py-1.5 rounded-full bg-[var(--color-surface-2)] border border-[var(--color-border-subtle)] text-xs text-[var(--color-text-tertiary)]">
                            Team Wiki
                        </span>
                        <span className="px-3 py-1.5 rounded-full bg-[var(--color-surface-2)] border border-[var(--color-border-subtle)] text-xs text-[var(--color-text-tertiary)]">
                            Async Standups
                        </span>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
