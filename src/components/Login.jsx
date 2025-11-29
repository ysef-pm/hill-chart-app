import React, { useState } from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { Loader2, Layers, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        setError(null);
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (err) {
            console.error("Login failed:", err);
            setError("Failed to sign in with Google. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden">
                {/* Radial gradient */}
                <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-30"
                    style={{
                        background: 'radial-gradient(circle, rgba(20, 184, 166, 0.15) 0%, transparent 70%)'
                    }}
                />
                {/* Secondary glow */}
                <div
                    className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-20"
                    style={{
                        background: 'radial-gradient(circle, rgba(6, 182, 212, 0.2) 0%, transparent 60%)'
                    }}
                />
                {/* Grid pattern */}
                <div
                    className="absolute inset-0 opacity-[0.02]"
                    style={{
                        backgroundImage: `
                            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
                        `,
                        backgroundSize: '64px 64px'
                    }}
                />
            </div>

            {/* Login Card */}
            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                className="relative z-10 w-full max-w-md"
            >
                <div className="glass-card-elevated p-8 text-center">
                    {/* Logo */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1, duration: 0.4 }}
                        className="mb-8"
                    >
                        <div className="relative w-16 h-16 mx-auto mb-5">
                            <div className="w-full h-full rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center shadow-lg">
                                <Layers size={28} className="text-white" strokeWidth={2.5} />
                            </div>
                            {/* Glow effect */}
                            <div
                                className="absolute inset-0 rounded-2xl blur-xl opacity-50"
                                style={{ background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.6), rgba(6, 182, 212, 0.6))' }}
                            />
                        </div>
                        <h1 className="text-2xl font-semibold text-[var(--color-text-primary)] tracking-tight">
                            Welcome to DevCom
                        </h1>
                        <p className="text-[var(--color-text-secondary)] mt-2 text-sm">
                            Sign in to access your developer tools
                        </p>
                    </motion.div>

                    {/* Error Message */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-6 p-3 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-sm"
                        >
                            {error}
                        </motion.div>
                    )}

                    {/* Google Sign In Button */}
                    <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.4 }}
                        onClick={handleGoogleLogin}
                        disabled={isLoading}
                        className="w-full py-3.5 px-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-3 group relative overflow-hidden bg-[var(--color-surface-2)] border border-[var(--color-border-default)] hover:border-[var(--color-border-hover)] hover:bg-[var(--color-surface-3)] text-[var(--color-text-primary)] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <Loader2 size={20} className="animate-spin text-[var(--color-accent)]" />
                        ) : (
                            <>
                                <img
                                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                                    alt="Google"
                                    className="w-5 h-5"
                                />
                                <span>Continue with Google</span>
                                <ArrowRight size={16} className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                            </>
                        )}
                    </motion.button>

                    {/* Divider */}
                    <div className="my-6 flex items-center gap-4">
                        <div className="flex-1 h-px bg-[var(--color-border-subtle)]" />
                        <span className="text-xs text-[var(--color-text-muted)]">or</span>
                        <div className="flex-1 h-px bg-[var(--color-border-subtle)]" />
                    </div>

                    {/* Features Preview */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.4 }}
                        className="text-left"
                    >
                        <p className="text-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider mb-3">
                            What you'll get
                        </p>
                        <div className="space-y-2">
                            {[
                                'Hill Charts for project progress',
                                'Feelings Wheel for team check-ins',
                                'Retro Boards for team retrospectives',
                                'Focus Timer for deep work'
                            ].map((feature, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]"
                                >
                                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]" />
                                    {feature}
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Terms */}
                    <p className="mt-8 text-xs text-[var(--color-text-muted)]">
                        By signing in, you agree to our{' '}
                        <a href="#" className="text-[var(--color-text-tertiary)] hover:text-[var(--color-accent)] transition-colors">
                            Terms of Service
                        </a>{' '}
                        and{' '}
                        <a href="#" className="text-[var(--color-text-tertiary)] hover:text-[var(--color-accent)] transition-colors">
                            Privacy Policy
                        </a>
                    </p>
                </div>

                {/* Bottom decoration */}
                <div className="mt-6 text-center">
                    <p className="text-xs text-[var(--color-text-muted)]">
                        Built for product teams everywhere
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
