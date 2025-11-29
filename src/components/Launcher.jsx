import React, { useState } from 'react';
import { LogOut, TrendingUp, Smile, MessageSquare, CheckSquare, Heart, BookOpen, Timer, Layers, ChevronRight } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { PomodoroApp } from './PomodoroTimer';

const tools = [
    {
        id: 'hill-chart',
        name: 'Hill Chart',
        description: 'Track project progress from uncertainty to execution.',
        icon: TrendingUp,
        gradient: 'from-cyan-500 to-teal-500',
        glowColor: 'rgba(20, 184, 166, 0.4)',
    },
    {
        id: 'feelings-wheel',
        name: 'Feelings Wheel',
        description: 'Share how you\'re feeling during standups and retros.',
        icon: Smile,
        gradient: 'from-pink-500 to-rose-500',
        glowColor: 'rgba(236, 72, 153, 0.4)',
    },
    {
        id: 'retro-board',
        name: 'Retro Board',
        description: 'Run team retrospectives with structured feedback.',
        icon: MessageSquare,
        gradient: 'from-emerald-500 to-green-500',
        glowColor: 'rgba(34, 197, 94, 0.4)',
    },
    {
        id: 'habit-tracker',
        name: 'Habit Tracker',
        description: 'Build good team habits and track progress together.',
        icon: CheckSquare,
        gradient: 'from-violet-500 to-purple-500',
        glowColor: 'rgba(139, 92, 246, 0.4)',
    },
    {
        id: 'pomodoro',
        name: 'Focus Timer',
        description: 'Collaborative focus sessions with team presence.',
        icon: Timer,
        gradient: 'from-orange-500 to-amber-500',
        glowColor: 'rgba(249, 115, 22, 0.4)',
    },
    {
        id: 'kudos-board',
        name: 'Kudos Board',
        description: 'Celebrate wins and recognize great work.',
        icon: Heart,
        gradient: 'from-red-500 to-rose-500',
        glowColor: 'rgba(239, 68, 68, 0.4)',
    },
];

const comingSoon = [
    {
        id: 'decision-log',
        name: 'Decision Log',
        description: 'Record team decisions with context.',
        icon: BookOpen,
    },
];

const Launcher = ({ onSelectApp, user }) => {
    const [activeTool, setActiveTool] = useState(null);

    const handleSignOut = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    const handleToolClick = (toolId) => {
        if (toolId === 'pomodoro') {
            setActiveTool('pomodoro');
        } else {
            onSelectApp(toolId);
        }
    };

    // If a tool is active, render it
    if (activeTool === 'pomodoro') {
        return <PomodoroApp user={user} onBack={() => setActiveTool(null)} />;
    }

    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute inset-0">
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-teal-500/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 max-w-5xl mx-auto px-6 py-8">
                {/* Header */}
                <header className="flex justify-between items-center mb-12">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-teal-500/20">
                                <Layers size={20} className="text-white" strokeWidth={2} />
                            </div>
                        </div>
                        <div>
                            <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">
                                DevCom
                            </h1>
                            <p className="text-sm text-[var(--color-text-tertiary)]">
                                Welcome, {user?.displayName?.split(' ')[0] || 'there'}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-surface-1)] border border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] text-sm font-medium hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-default)] transition-all"
                    >
                        <LogOut size={16} />
                        Sign out
                    </button>
                </header>

                {/* Page Title */}
                <div className="mb-10">
                    <h2 className="text-3xl font-semibold text-[var(--color-text-primary)] tracking-tight mb-2">
                        Your tools
                    </h2>
                    <p className="text-[var(--color-text-secondary)]">
                        Select a tool to get started with your team.
                    </p>
                </div>

                {/* Tools Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
                    {tools.map((tool, index) => (
                        <button
                            key={tool.id}
                            onClick={() => handleToolClick(tool.id)}
                            className="group relative text-left"
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <div className="relative p-5 rounded-2xl bg-[var(--color-surface-1)] border border-[var(--color-border-subtle)] hover:border-[var(--color-border-default)] transition-all duration-300 hover:bg-[var(--color-surface-2)] overflow-hidden">
                                {/* Glow effect on hover */}
                                <div
                                    className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 -translate-y-1/2 translate-x-1/2"
                                    style={{ background: tool.glowColor }}
                                />

                                {/* Icon */}
                                <div className="relative mb-4">
                                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                        <tool.icon size={20} className="text-white" strokeWidth={2} />
                                    </div>
                                </div>

                                {/* Content */}
                                <h3 className="text-base font-semibold text-[var(--color-text-primary)] mb-1.5 flex items-center justify-between">
                                    {tool.name}
                                    <ChevronRight size={16} className="text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                                </h3>
                                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                                    {tool.description}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Coming Soon Section */}
                <div>
                    <h3 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-4">
                        Coming Soon
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {comingSoon.map((tool) => (
                            <div
                                key={tool.id}
                                className="relative p-5 rounded-2xl bg-[var(--color-surface-1)]/50 border border-dashed border-[var(--color-border-subtle)] opacity-60"
                            >
                                <div className="absolute top-3 right-3">
                                    <span className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-[var(--color-surface-2)] text-[var(--color-text-muted)] border border-[var(--color-border-subtle)]">
                                        Soon
                                    </span>
                                </div>

                                <div className="mb-4">
                                    <div className="w-11 h-11 rounded-xl bg-[var(--color-surface-2)] flex items-center justify-center">
                                        <tool.icon size={20} className="text-[var(--color-text-muted)]" strokeWidth={2} />
                                    </div>
                                </div>

                                <h3 className="text-base font-semibold text-[var(--color-text-tertiary)] mb-1.5">
                                    {tool.name}
                                </h3>
                                <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                                    {tool.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-16 pt-8 border-t border-[var(--color-border-subtle)]">
                    <p className="text-sm text-[var(--color-text-muted)] text-center">
                        Need help? Check our{' '}
                        <a href="#" className="text-[var(--color-accent)] hover:underline">documentation</a>
                        {' '}or{' '}
                        <a href="#" className="text-[var(--color-accent)] hover:underline">contact support</a>.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Launcher;
