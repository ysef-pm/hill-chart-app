// src/components/MccFinder/MccFinderApp.jsx

import React, { useEffect, useState } from 'react';
import {
  AlertTriangle, ArrowLeft, Check, Copy, CreditCard, ExternalLink, Globe,
  Loader2, RefreshCw, Search, Sparkles, X,
} from 'lucide-react';
import { classifyMcc, researchCompany } from './api';

const HISTORY_KEY = 'mccFinder.history';
const HISTORY_LIMIT = 8;
const LOW_CONFIDENCE = 0.5;

function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
  } catch {
    return [];
  }
}

function saveHistory(items) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(items));
  } catch {
    // Storage unavailable (private mode); history just won't persist.
  }
}

const pct = (x) => `${Math.round(x * 100)}%`;

function ProbabilityBar({ value, strong }) {
  return (
    <div className="h-1.5 w-full rounded-full bg-[var(--color-surface-3)] overflow-hidden">
      <div
        className={`h-full rounded-full ${strong ? 'bg-gradient-to-r from-sky-400 to-indigo-500' : 'bg-[var(--color-text-muted)]'}`}
        style={{ width: `${Math.max(2, Math.round(value * 100))}%` }}
      />
    </div>
  );
}

function Step({ label, sublabel, state, elapsed }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-7 h-7 rounded-full flex items-center justify-center bg-[var(--color-surface-2)] border border-[var(--color-border-subtle)]">
        {state === 'active' && <Loader2 size={14} className="text-sky-400 animate-spin" />}
        {state === 'done' && <Check size={14} className="text-[var(--color-success)]" />}
        {state === 'pending' && <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-text-muted)]" />}
      </div>
      <div className="flex-1">
        <p className={`text-sm font-medium ${state === 'pending' ? 'text-[var(--color-text-tertiary)]' : 'text-[var(--color-text-primary)]'}`}>
          {label}
        </p>
        <p className="text-xs text-[var(--color-text-tertiary)]">{sublabel}</p>
      </div>
      {state === 'active' && elapsed > 0 && (
        <span className="text-xs font-mono text-[var(--color-text-tertiary)]">{elapsed}s</span>
      )}
    </div>
  );
}

const MccFinderApp = ({ user, onBack }) => {
  const [name, setName] = useState('');
  const [websiteHint, setWebsiteHint] = useState('');
  const [showHint, setShowHint] = useState(false);

  const [phase, setPhase] = useState('idle'); // idle | research | classify | done
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState(null);
  const [draft, setDraft] = useState('');
  const [result, setResult] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState(loadHistory);

  const busy = phase === 'research' || phase === 'classify';

  useEffect(() => {
    if (!busy) return undefined;
    const started = Date.now();
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - started) / 1000)), 1000);
    return () => {
      clearInterval(id);
      setElapsed(0);
    };
  }, [busy, phase]);

  const remember = (entry) => {
    const next = [entry, ...history.filter((h) => h.profile.companyName !== entry.profile.companyName)]
      .slice(0, HISTORY_LIMIT);
    setHistory(next);
    saveHistory(next);
  };

  const classify = async (p, description) => {
    setPhase('classify');
    const r = await classifyMcc(user, { description, companyName: p.companyName, website: p.website });
    setResult(r);
    setPhase('done');
    remember({ profile: { ...p, description }, result: r });
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!name.trim() || busy) return;
    setError(null);
    setProfile(null);
    setResult(null);
    let p = null;
    try {
      setPhase('research');
      p = await researchCompany(user, { name: name.trim(), website: websiteHint.trim() || undefined });
      setProfile(p);
      setDraft(p.description);
      await classify(p, p.description);
    } catch (err) {
      setError(err.message);
      setPhase(p ? 'done' : 'idle');
    }
  };

  const handleReclassify = async () => {
    if (!draft.trim() || busy) return;
    setError(null);
    try {
      const p = { ...profile, description: draft.trim() };
      setProfile(p);
      await classify(p, p.description);
    } catch (err) {
      setError(err.message);
      setPhase('done');
    }
  };

  const showFromHistory = (entry) => {
    setError(null);
    setProfile(entry.profile);
    setDraft(entry.profile.description);
    setResult(entry.result);
    setName(entry.profile.companyName);
    setPhase('done');
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(result.mcc);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard blocked; the code is visible anyway.
    }
  };

  const descriptionChanged = profile && draft.trim() !== profile.description;

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)]">
      {/* Header */}
      <header className="glass-card border-b border-[var(--color-border-subtle)] px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-[var(--color-surface-2)] rounded-lg transition-colors"
            aria-label="Back to tools"
          >
            <ArrowLeft size={20} className="text-[var(--color-text-tertiary)]" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-500 flex items-center justify-center">
              <CreditCard size={20} className="text-white" />
            </div>
            <div>
              <span className="font-semibold text-[var(--color-text-primary)]">MCC Finder</span>
              <p className="text-xs text-[var(--color-text-tertiary)]">Company → business model → merchant category code</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 space-y-4">
        {/* Search */}
        <form onSubmit={handleSearch} className="glass-card-elevated p-5">
          <label htmlFor="mcc-company" className="label">Company</label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
              <input
                id="mcc-company"
                className="input-field"
                style={{ paddingLeft: '2.25rem' }}
                placeholder="e.g. Stripe, Gymshark, Blue Bottle Coffee"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={busy}
                autoFocus
              />
            </div>
            <button type="submit" className="btn-primary disabled:opacity-50 disabled:pointer-events-none" disabled={busy || !name.trim()}>
              {busy ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              Find MCC
            </button>
          </div>

          {showHint ? (
            <div className="mt-3 flex items-center gap-2">
              <Globe size={14} className="text-[var(--color-text-tertiary)] shrink-0" />
              <input
                className="input-field"
                style={{ paddingTop: '0.5rem', paddingBottom: '0.5rem' }}
                placeholder="Website, if the name is ambiguous (e.g. mercury.com)"
                value={websiteHint}
                onChange={(e) => setWebsiteHint(e.target.value)}
                disabled={busy}
              />
              <button
                type="button"
                className="btn-ghost"
                onClick={() => { setShowHint(false); setWebsiteHint(''); }}
                aria-label="Remove website hint"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <button type="button" className="btn-ghost mt-2 -ml-3 text-xs" onClick={() => setShowHint(true)}>
              <Globe size={12} /> Add a website hint
            </button>
          )}

          {history.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-xs text-[var(--color-text-muted)]">Recent:</span>
              {history.map((h) => (
                <button
                  key={h.profile.companyName}
                  type="button"
                  onClick={() => showFromHistory(h)}
                  disabled={busy}
                  className="px-2.5 py-1 rounded-full text-xs bg-[var(--color-surface-2)] border border-[var(--color-border-subtle)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)] transition-colors"
                >
                  {h.profile.companyName} · <span className="font-mono">{h.result.mcc}</span>
                </button>
              ))}
            </div>
          )}
        </form>

        {error && (
          <div className="glass-card p-4 flex items-start gap-3 border-[var(--color-error)]/30">
            <AlertTriangle size={18} className="text-[var(--color-error)] shrink-0 mt-0.5" />
            <p className="text-sm text-[var(--color-text-secondary)]">{error}</p>
          </div>
        )}

        {/* Progress */}
        {busy && (
          <div className="glass-card p-5 space-y-4">
            <Step
              label="Researching the company"
              sublabel="Claude searches the web, finds the official site and summarises the business model"
              state={phase === 'research' ? 'active' : 'done'}
              elapsed={phase === 'research' ? elapsed : 0}
            />
            <Step
              label="Classifying the MCC"
              sublabel="TypeSafe Jev scores ~300 merchant category codes"
              state={phase === 'classify' ? 'active' : 'pending'}
              elapsed={phase === 'classify' ? elapsed : 0}
            />
          </div>
        )}

        {/* Results */}
        {profile && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {/* Company */}
            <section className="glass-card p-5 lg:col-span-3 space-y-4">
              <div>
                <p className="label">Company</p>
                <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">{profile.companyName}</h2>
                {profile.website && (
                  <a
                    href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-[var(--color-accent)] hover:underline mt-1"
                  >
                    {profile.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>

              <div>
                <label htmlFor="mcc-description" className="label">Business model</label>
                <textarea
                  id="mcc-description"
                  className="input-field min-h-[110px] leading-relaxed resize-y"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  disabled={busy}
                />
                <div className="flex items-center justify-between mt-2 gap-3">
                  <p className="text-xs text-[var(--color-text-tertiary)]">
                    Edit the description and re-classify if it's off.
                  </p>
                  <button
                    type="button"
                    className="btn-secondary text-xs whitespace-nowrap shrink-0 disabled:opacity-40 disabled:pointer-events-none"
                    style={{ padding: '0.375rem 0.75rem' }}
                    onClick={handleReclassify}
                    disabled={busy || !descriptionChanged}
                  >
                    <RefreshCw size={12} /> Re-classify
                  </button>
                </div>
              </div>

              {profile.notes && (
                <div className="flex items-start gap-2 text-sm text-[var(--color-text-secondary)] bg-[var(--color-surface-2)] rounded-lg p-3">
                  <AlertTriangle size={14} className="text-[var(--color-warning)] shrink-0 mt-0.5" />
                  {profile.notes}
                </div>
              )}
            </section>

            {/* MCC */}
            <section className="glass-card-elevated p-5 lg:col-span-2">
              {result ? (
                <div className="space-y-5">
                  <div>
                    <p className="label">Suggested MCC</p>
                    <div className="flex items-center gap-3">
                      <span className="text-4xl font-semibold font-mono tracking-tight text-[var(--color-text-primary)]">
                        {result.mcc}
                      </span>
                      <button
                        type="button"
                        onClick={copyCode}
                        className="btn-ghost p-2"
                        aria-label="Copy MCC"
                      >
                        {copied ? <Check size={16} className="text-[var(--color-success)]" /> : <Copy size={16} />}
                      </button>
                    </div>
                    <p className="text-sm text-[var(--color-text-secondary)] mt-1">{result.description}</p>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-[var(--color-text-tertiary)]">Confidence</span>
                      <span className="font-mono text-[var(--color-text-secondary)]">{pct(result.confidence)}</span>
                    </div>
                    <ProbabilityBar value={result.confidence} strong />
                    {result.confidence < LOW_CONFIDENCE && (
                      <p className="flex items-center gap-1.5 text-xs text-[var(--color-warning)] mt-2">
                        <AlertTriangle size={12} /> Low confidence. Review the alternatives.
                      </p>
                    )}
                  </div>

                  {result.alternatives.length > 0 && (
                    <div>
                      <p className="label">Alternatives</p>
                      <ul className="space-y-3">
                        {result.alternatives.map((alt) => (
                          <li key={alt.mcc}>
                            <div className="flex items-baseline gap-2 text-sm mb-1">
                              <span className="font-mono text-[var(--color-text-primary)]">{alt.mcc}</span>
                              <span className="flex-1 text-[var(--color-text-secondary)] truncate" title={alt.description}>
                                {alt.description}
                              </span>
                              <span className="font-mono text-xs text-[var(--color-text-tertiary)]">{pct(alt.probability)}</span>
                            </div>
                            <ProbabilityBar value={alt.probability} />
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <p className="text-xs text-[var(--color-text-muted)] pt-3 border-t border-[var(--color-border-subtle)]">
                    Category group matched {pct(result.groupConfidence)}. Classified by {result.model}.
                    Your acquirer makes the final MCC call.
                  </p>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-sm text-[var(--color-text-tertiary)]">
                  {busy ? 'Classifying…' : 'No classification yet.'}
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
};

export default MccFinderApp;
