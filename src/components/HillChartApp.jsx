import React, { useState, useEffect, useRef, useMemo } from 'react';
import { X, MapPin, Trash2, Sparkles, Loader2, Download, Filter, ArrowLeft, Layers } from 'lucide-react';
import html2canvas from 'html2canvas';
import { db } from '../firebase';
import {
    collection,
    addDoc,
    onSnapshot,
    deleteDoc,
    doc,
    query,
    where,
    serverTimestamp,
    updateDoc,
    increment,
    setDoc
} from 'firebase/firestore';

// --- Configuration ---
const appId = 'hill-chart-app';

// --- Analytics Helper ---
const trackFeatureInterest = async (featureName) => {
    const analyticsRef = doc(db, 'artifacts', appId, 'public', 'data', 'analytics', 'feature-interest');
    try {
        await updateDoc(analyticsRef, {
            [featureName]: increment(1),
            lastUpdated: serverTimestamp()
        });
    } catch (error) {
        if (error.code === 'not-found') {
            await setDoc(analyticsRef, {
                [featureName]: 1,
                lastUpdated: serverTimestamp()
            });
        }
    }
};

// --- Components ---
const FEELING_EMOJIS = ['🤔', '😤', '😌', '🤩', '🤠', '🚧', '🔥', '🐛', '🆘', '✅'];

const HillChart = ({ pins, onAddPin, onDeletePin }) => {
    const svgRef = useRef(null);
    const [hoverX, setHoverX] = useState(null);

    const getHillY = (x) => {
        if (x < 0 || x > 100) return 0;
        const radians = (x / 100) * Math.PI;
        return Math.sin(radians);
    };

    const pathData = useMemo(() => {
        let d = "M 0,100 ";
        for (let x = 0; x <= 100; x += 1) {
            const y = 100 - (getHillY(x) * 80);
            d += `L ${x},${y} `;
        }
        d += "L 100,100 Z";
        return d;
    }, []);

    const handleMouseMove = (e) => {
        if (!svgRef.current) return;
        const rect = svgRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        setHoverX(Math.max(0, Math.min(100, x)));
    };

    const handleMouseLeave = () => setHoverX(null);

    const handleClick = () => {
        if (hoverX !== null) onAddPin(hoverX);
    };

    const getPinCoords = (xPerc) => ({
        x: xPerc,
        y: 100 - (getHillY(xPerc) * 80)
    });

    const ghostPin = hoverX !== null ? getPinCoords(hoverX) : null;

    return (
        <div className="relative w-full aspect-[2/1] max-h-[500px] select-none group">
            {/* Background */}
            <div className="absolute inset-0 rounded-2xl bg-[var(--color-surface-1)] border border-[var(--color-border-subtle)] overflow-hidden">
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)',
                        backgroundSize: '24px 24px'
                    }}
                />
            </div>

            {/* Labels */}
            <div className="absolute bottom-4 left-4 text-[var(--color-text-muted)] text-[10px] font-semibold uppercase tracking-wider">
                Figuring it out
            </div>
            <div className="absolute bottom-4 right-4 text-[var(--color-text-muted)] text-[10px] font-semibold uppercase tracking-wider">
                Getting it done
            </div>
            <div className="absolute top-4 left-1/2 -translate-x-1/2 text-[var(--color-text-muted)] text-[10px] font-semibold uppercase tracking-wider opacity-60">
                Peak
            </div>

            <svg
                ref={svgRef}
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                className="absolute inset-0 w-full h-full cursor-crosshair z-10"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onClick={handleClick}
            >
                {/* Filled area under curve */}
                <defs>
                    <linearGradient id="hillGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="rgba(20, 184, 166, 0.15)" />
                        <stop offset="100%" stopColor="rgba(20, 184, 166, 0)" />
                    </linearGradient>
                </defs>
                <path d={pathData} fill="url(#hillGradient)" />

                {/* Hill curve line */}
                <path
                    d={pathData}
                    fill="none"
                    stroke="rgba(20, 184, 166, 0.6)"
                    strokeWidth="0.6"
                />

                {/* Center line */}
                <line x1="50" y1="100" x2="50" y2="20" stroke="rgba(255,255,255,0.1)" strokeWidth="0.3" strokeDasharray="2 2" />
            </svg>

            {/* Pins */}
            {pins.map((pin) => {
                const coords = getPinCoords(pin.x);
                const isUphill = pin.x < 50;

                return (
                    <div
                        key={pin.id}
                        className="absolute z-20 flex flex-col items-center group/pin"
                        style={{ left: `${coords.x}%`, top: `${coords.y}%`, transform: 'translate(-50%, -50%)' }}
                    >
                        <div
                            className={`w-4 h-4 rounded-full border-2 border-[var(--color-bg-primary)] shadow-lg cursor-pointer transition-transform hover:scale-125 ${
                                isUphill ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                        />

                        {/* Tooltip */}
                        <div className="absolute bottom-6 opacity-0 scale-90 group-hover/pin:opacity-100 group-hover/pin:scale-100 transition-all duration-200 w-60 pointer-events-none z-30">
                            <div className="glass-card-elevated p-4 text-center">
                                <div className="text-2xl mb-2">{pin.emoji}</div>
                                {pin.projectName && (
                                    <div className="inline-block px-2 py-0.5 rounded-full bg-[var(--color-accent-subtle)] text-[var(--color-accent)] text-[10px] font-semibold uppercase tracking-wider mb-2">
                                        {pin.projectName}
                                    </div>
                                )}
                                <p className="text-sm font-medium text-[var(--color-text-primary)] leading-snug mb-1">{pin.text}</p>
                                {pin.name && <p className="text-xs text-[var(--color-accent)] mb-1">{pin.name}</p>}
                                {pin.createdAt && (
                                    <p className="text-[10px] text-[var(--color-text-muted)]">
                                        {new Date(pin.createdAt.seconds * 1000).toLocaleDateString()}
                                    </p>
                                )}
                                <p className="text-[10px] text-[var(--color-text-muted)] mt-1">
                                    {isUphill ? 'Uphill' : 'Downhill'}
                                </p>
                            </div>
                            <div className="w-3 h-3 bg-[var(--color-surface-3)] transform rotate-45 absolute -bottom-1.5 left-1/2 -translate-x-1/2 border-r border-b border-[var(--color-border-subtle)]" />
                        </div>

                        {/* Delete button */}
                        <button
                            onClick={(e) => { e.stopPropagation(); onDeletePin(pin.id); }}
                            className="absolute -top-8 opacity-0 group-hover/pin:opacity-100 bg-red-500/20 hover:bg-red-500/40 p-1.5 rounded-full text-red-400 transition-all pointer-events-auto"
                            title="Delete"
                        >
                            <Trash2 size={12} />
                        </button>
                    </div>
                );
            })}

            {/* Ghost pin */}
            {ghostPin && (
                <div
                    className="absolute z-10 pointer-events-none w-3 h-3 rounded-full bg-[var(--color-accent)]/40 border border-[var(--color-accent)] shadow-lg animate-pulse"
                    style={{ left: `${ghostPin.x}%`, top: `${ghostPin.y}%`, transform: 'translate(-50%, -50%)' }}
                />
            )}
        </div>
    );
};

const PinModal = ({ isOpen, onClose, onSubmit, initialX }) => {
    const [text, setText] = useState('');
    const [emoji, setEmoji] = useState('🤔');
    const [name, setName] = useState('');
    const [projectName, setProjectName] = useState('');
    const [isComingSoonOpen, setIsComingSoonOpen] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setText('');
            setEmoji('🤔');
            setName('');
            setProjectName('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const isUphill = initialX < 50;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="glass-card-elevated w-full max-w-md p-6 m-4 animate-scale-in">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                        {isUphill ? 'Uphill' : 'Downhill'} Update
                    </h3>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] transition-colors">
                        <X size={18} />
                    </button>
                </div>

                <div className="space-y-5">
                    <div>
                        <label className="label">Project Name</label>
                        <input
                            type="text"
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                            placeholder="e.g. Website Redesign"
                            className="input-field"
                        />
                    </div>

                    <div>
                        <label className="label">Your Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your name"
                            className="input-field"
                        />
                    </div>

                    <div>
                        <label className="label">How are you feeling?</label>
                        <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-[var(--color-surface-1)] border border-[var(--color-border-subtle)]">
                            {FEELING_EMOJIS.map((e) => (
                                <button
                                    key={e}
                                    onClick={() => setEmoji(e)}
                                    className={`w-10 h-10 flex items-center justify-center text-xl rounded-lg transition-all ${
                                        emoji === e
                                            ? 'bg-[var(--color-surface-3)] ring-2 ring-[var(--color-accent)] scale-110'
                                            : 'hover:bg-[var(--color-surface-2)] grayscale hover:grayscale-0'
                                    }`}
                                >
                                    {e}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-end mb-2">
                            <label className="label mb-0">What's the latest?</label>
                            <button
                                onClick={() => setIsComingSoonOpen(true)}
                                disabled={!text.trim()}
                                className="text-xs flex items-center gap-1 text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] disabled:opacity-50 font-medium transition-colors"
                            >
                                <Sparkles size={12} />
                                Suggest
                            </button>
                        </div>
                        <textarea
                            autoFocus
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder={isUphill ? "What unknowns are you exploring?" : "What's the shipping plan?"}
                            className="input-field h-28 resize-none"
                        />
                    </div>

                    <button
                        onClick={() => {
                            if (!text.trim() || !name.trim() || !projectName.trim()) return;
                            onSubmit({ text, emoji, name, projectName });
                        }}
                        disabled={!text.trim() || !name.trim() || !projectName.trim()}
                        className="btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <MapPin size={16} />
                        Pin Update
                    </button>
                </div>

                <ComingSoonModal
                    isOpen={isComingSoonOpen}
                    onClose={() => setIsComingSoonOpen(false)}
                    featureName="suggestNextSteps"
                    featureTitle="AI Suggestions Coming Soon"
                    featureDescription="We're working on AI-powered suggestions to help you figure out next steps."
                />
            </div>
        </div>
    );
};

const ComingSoonModal = ({ isOpen, onClose, featureName, featureTitle, featureDescription }) => {
    useEffect(() => {
        if (isOpen && featureName) {
            trackFeatureInterest(featureName);
        }
    }, [isOpen, featureName]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="glass-card-elevated w-full max-w-sm p-6 m-4 text-center animate-scale-in">
                <div className="text-5xl mb-4">🚧</div>
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">{featureTitle || 'Coming Soon'}</h3>
                <p className="text-sm text-[var(--color-text-secondary)] mb-6 leading-relaxed">{featureDescription}</p>
                <button onClick={onClose} className="btn-primary px-8">
                    Got it
                </button>
            </div>
        </div>
    );
};

const HillChartApp = ({ user, onBack }) => {
    const [pins, setPins] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isReportComingSoonOpen, setIsReportComingSoonOpen] = useState(false);
    const [pendingPinX, setPendingPinX] = useState(null);
    const [dateFilter, setDateFilter] = useState('all');
    const [isExporting, setIsExporting] = useState(false);
    const [isStoryMode, setIsStoryMode] = useState(false);
    const [storyDateIndex, setStoryDateIndex] = useState(0);
    const chartRef = useRef(null);

    useEffect(() => {
        if (!user) return;
        const q = query(
            collection(db, 'artifacts', appId, 'public', 'data', 'pins'),
            where('uid', '==', user.uid)
        );
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const newPins = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setPins(newPins);
        }, (error) => console.error("Error fetching pins:", error));
        return () => unsubscribe();
    }, [user]);

    const handleChartClick = (x) => {
        setPendingPinX(x);
        setIsModalOpen(true);
    };

    const handleSavePin = async ({ text, emoji, name, projectName }) => {
        if (!user) return;
        try {
            await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'pins'), {
                x: pendingPinX,
                text,
                emoji,
                name,
                projectName,
                uid: user.uid,
                createdAt: serverTimestamp()
            });
            setIsModalOpen(false);
            setPendingPinX(null);
        } catch (e) {
            console.error("Error adding pin:", e);
        }
    };

    const handleDeletePin = async (pinId) => {
        if (!user) return;
        if (confirm('Remove this update?')) {
            try {
                await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'pins', pinId));
            } catch (e) {
                console.error("Error deleting pin:", e);
            }
        }
    };

    const filterPinsByDate = (pins) => {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        return pins.filter(pin => {
            if (!pin.createdAt) return true;
            const pinDate = new Date(pin.createdAt.seconds * 1000);
            switch (dateFilter) {
                case 'today': return pinDate >= today;
                case 'week': {
                    const weekAgo = new Date(today);
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return pinDate >= weekAgo;
                }
                case 'sprint': {
                    const sprintStart = new Date(today);
                    sprintStart.setDate(sprintStart.getDate() - 14);
                    return pinDate >= sprintStart;
                }
                default: return true;
            }
        });
    };

    const uniqueDates = useMemo(() => {
        const dates = new Set();
        pins.forEach(pin => {
            if (pin.createdAt) {
                dates.add(new Date(pin.createdAt.seconds * 1000).toLocaleDateString());
            }
        });
        return Array.from(dates).sort((a, b) => new Date(b) - new Date(a));
    }, [pins]);

    const displayedPins = useMemo(() => {
        if (isStoryMode) {
            if (uniqueDates.length === 0) return [];
            const targetDateStr = uniqueDates[storyDateIndex];
            return pins.filter(pin => {
                if (!pin.createdAt) return false;
                return new Date(pin.createdAt.seconds * 1000).toLocaleDateString() === targetDateStr;
            });
        }
        return filterPinsByDate(pins);
    }, [pins, dateFilter, isStoryMode, storyDateIndex, uniqueDates]);

    const filteredPins = displayedPins;

    const handleExportScreenshot = async () => {
        if (!chartRef.current) return;
        setIsExporting(true);
        try {
            const canvas = await html2canvas(chartRef.current, {
                backgroundColor: '#0a0a0b',
                scale: 2,
                logging: false,
                useCORS: true
            });
            const link = document.createElement('a');
            link.download = `hill-chart-${new Date().toISOString().split('T')[0]}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (error) {
            console.error('Export error:', error);
            alert('Failed to export screenshot.');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
            <div className="max-w-5xl mx-auto px-6 py-8">
                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onBack}
                            className="p-2 rounded-lg hover:bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] transition-colors"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center shadow-lg shadow-teal-500/20">
                                <Layers size={20} className="text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">Hill Chart</h1>
                                <p className="text-sm text-[var(--color-text-tertiary)]">Track progress visually</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleExportScreenshot}
                            disabled={isExporting}
                            className="btn-secondary"
                        >
                            {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                            Export
                        </button>
                        <button
                            onClick={() => setIsReportComingSoonOpen(true)}
                            className="btn-primary"
                        >
                            <Sparkles size={16} />
                            Generate Report
                        </button>
                    </div>
                </header>

                {/* Controls */}
                <div className="glass-card p-4 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => {
                                setIsStoryMode(!isStoryMode);
                                setStoryDateIndex(0);
                            }}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                                isStoryMode
                                    ? 'bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/50'
                                    : 'bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]'
                            }`}
                        >
                            <span>📖</span>
                            {isStoryMode ? 'Exit Storybook' : 'Storybook'}
                        </button>

                        {isStoryMode && uniqueDates.length > 0 && (
                            <div className="flex items-center gap-2 bg-[var(--color-surface-1)] px-3 py-2 rounded-lg border border-[var(--color-border-subtle)]">
                                <button
                                    onClick={() => setStoryDateIndex(Math.min(uniqueDates.length - 1, storyDateIndex + 1))}
                                    disabled={storyDateIndex >= uniqueDates.length - 1}
                                    className="p-1 hover:bg-[var(--color-surface-hover)] rounded disabled:opacity-30 transition-colors"
                                >
                                    ←
                                </button>
                                <div className="px-2 text-center min-w-[100px]">
                                    <div className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider">Viewing</div>
                                    <div className="text-sm font-medium text-[var(--color-text-primary)]">{uniqueDates[storyDateIndex]}</div>
                                </div>
                                <button
                                    onClick={() => setStoryDateIndex(Math.max(0, storyDateIndex - 1))}
                                    disabled={storyDateIndex <= 0}
                                    className="p-1 hover:bg-[var(--color-surface-hover)] rounded disabled:opacity-30 transition-colors"
                                >
                                    →
                                </button>
                            </div>
                        )}
                    </div>

                    {!isStoryMode && (
                        <div className="flex items-center gap-3">
                            <Filter size={16} className="text-[var(--color-text-muted)]" />
                            <div className="flex gap-1">
                                {[
                                    { value: 'all', label: 'All' },
                                    { value: 'today', label: 'Today' },
                                    { value: 'week', label: 'Week' },
                                    { value: 'sprint', label: 'Sprint' }
                                ].map(filter => (
                                    <button
                                        key={filter.value}
                                        onClick={() => setDateFilter(filter.value)}
                                        className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                                            dateFilter === filter.value
                                                ? 'bg-[var(--color-accent)] text-white'
                                                : 'bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)]'
                                        }`}
                                    >
                                        {filter.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="text-sm text-[var(--color-text-muted)]">
                        {filteredPins.length} update{filteredPins.length !== 1 ? 's' : ''}
                    </div>
                </div>

                {/* Chart */}
                <div ref={chartRef} className="space-y-6">
                    <div className="glass-card-elevated p-6 md:p-8">
                        <HillChart
                            pins={filteredPins}
                            onAddPin={handleChartClick}
                            onDeletePin={handleDeletePin}
                        />
                    </div>

                    {/* Updates Lists */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Uphill */}
                        <div>
                            <h2 className="text-sm font-semibold text-[var(--color-text-secondary)] mb-4 flex items-center gap-2">
                                <span className="w-2 h-2 bg-amber-500 rounded-full" />
                                Uphill (Figuring it out)
                            </h2>
                            <div className="space-y-3">
                                {filteredPins.filter(p => p.x < 50).length === 0 ? (
                                    <div className="text-sm text-[var(--color-text-muted)] italic bg-[var(--color-surface-1)] p-4 rounded-xl border border-dashed border-[var(--color-border-subtle)] text-center">
                                        No updates
                                    </div>
                                ) : (
                                    filteredPins.filter(p => p.x < 50).map(pin => (
                                        <PinCard key={pin.id} pin={pin} onDelete={handleDeletePin} />
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Downhill */}
                        <div>
                            <h2 className="text-sm font-semibold text-[var(--color-text-secondary)] mb-4 flex items-center gap-2">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                                Downhill (Executing)
                            </h2>
                            <div className="space-y-3">
                                {filteredPins.filter(p => p.x >= 50).length === 0 ? (
                                    <div className="text-sm text-[var(--color-text-muted)] italic bg-[var(--color-surface-1)] p-4 rounded-xl border border-dashed border-[var(--color-border-subtle)] text-center">
                                        No updates
                                    </div>
                                ) : (
                                    filteredPins.filter(p => p.x >= 50).map(pin => (
                                        <PinCard key={pin.id} pin={pin} onDelete={handleDeletePin} />
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <PinModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleSavePin}
                    initialX={pendingPinX}
                />

                <ComingSoonModal
                    isOpen={isReportComingSoonOpen}
                    onClose={() => setIsReportComingSoonOpen(false)}
                    featureName="generateReport"
                    featureTitle="AI Reports Coming Soon"
                    featureDescription="We're building AI-powered status reports that summarize your hill chart progress."
                />
            </div>
        </div>
    );
};

const PinCard = ({ pin, onDelete }) => (
    <div className="group relative glass-card p-4 hover:bg-[var(--color-surface-hover)] transition-colors">
        <div className="flex items-start gap-3">
            <div className="text-2xl bg-[var(--color-surface-2)] p-2 rounded-lg">{pin.emoji}</div>
            <div className="flex-1 min-w-0">
                <p className="text-sm text-[var(--color-text-primary)] leading-relaxed mb-2">{pin.text}</p>
                {pin.projectName && (
                    <span className="inline-block px-2 py-0.5 rounded-full bg-[var(--color-accent-subtle)] text-[var(--color-accent)] text-[10px] font-semibold uppercase tracking-wider mb-2">
                        {pin.projectName}
                    </span>
                )}
                {pin.name && (
                    <p className="text-xs text-[var(--color-accent)] mb-1">{pin.name}</p>
                )}
                <div className="flex items-center gap-3 text-xs text-[var(--color-text-muted)]">
                    <span>{Math.round(pin.x)}%</span>
                    {pin.createdAt && (
                        <span>{new Date(pin.createdAt.seconds * 1000).toLocaleDateString()}</span>
                    )}
                </div>
            </div>
        </div>
        <button
            onClick={() => onDelete(pin.id)}
            className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-400 transition-all"
        >
            <Trash2 size={14} />
        </button>
    </div>
);

export default HillChartApp;
