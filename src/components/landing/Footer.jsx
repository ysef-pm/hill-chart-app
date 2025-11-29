import React from 'react';
import { Layers } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="relative bg-[var(--color-bg-primary)] border-t border-[var(--color-border-subtle)]">
            <div className="max-w-6xl mx-auto px-6 py-16">
                <div className="grid md:grid-cols-5 gap-12 mb-12">
                    {/* Brand */}
                    <div className="md:col-span-2">
                        <div className="flex items-center gap-2.5 mb-5">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center">
                                <Layers size={16} className="text-white" strokeWidth={2.5} />
                            </div>
                            <span className="font-semibold text-[var(--color-text-primary)]">DevCom</span>
                        </div>
                        <p className="text-sm text-[var(--color-text-tertiary)] leading-relaxed max-w-xs">
                            Helping product managers and development teams communicate better, one tool at a time.
                        </p>
                    </div>

                    {/* Tools */}
                    <div>
                        <h4 className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-4">
                            Tools
                        </h4>
                        <ul className="space-y-3">
                            <li>
                                <a href="#" className="text-sm text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors">
                                    Hill Chart
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-sm text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors">
                                    Feelings Wheel
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-sm text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors">
                                    Retro Board
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-sm text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors">
                                    Habit Tracker
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-sm text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors">
                                    Focus Timer
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-sm text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors">
                                    Kudos Board
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Resources */}
                    <div>
                        <h4 className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-4">
                            Resources
                        </h4>
                        <ul className="space-y-3">
                            <li>
                                <a href="#" className="text-sm text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors">
                                    Documentation
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-sm text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors">
                                    Best Practices
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-sm text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors">
                                    Help Center
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-4">
                            Legal
                        </h4>
                        <ul className="space-y-3">
                            <li>
                                <a href="#" className="text-sm text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors">
                                    Privacy Policy
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-sm text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] transition-colors">
                                    Terms of Service
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-[var(--color-border-subtle)] flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-[var(--color-text-muted)]">
                        © 2024 DevCom. All rights reserved.
                    </p>
                    <p className="text-sm text-[var(--color-text-muted)]">
                        Built for product teams everywhere
                    </p>
                </div>
            </div>
        </footer>
    );
}
