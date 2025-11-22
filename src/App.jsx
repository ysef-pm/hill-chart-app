import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MessageSquare, X, Plus, MapPin, Trash2, Info, Sparkles, FileText, Loader2, Camera, Download, Filter, LogOut } from 'lucide-react';
import html2canvas from 'html2canvas';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  query,
  serverTimestamp
} from 'firebase/firestore';
import Login from './components/Login';

// --- Configuration ---
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const appId = 'hill-chart-app';

// --- AI Helper Functions ---

const callGemini = async (prompt) => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`;
  const payload = {
    contents: [{ parts: [{ text: prompt }] }]
  };

  const makeRequest = async (retryCount = 0) => {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        if (retryCount < 5) {
          const delay = Math.pow(2, retryCount) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
          return makeRequest(retryCount + 1);
        }
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";
    } catch (error) {
      if (retryCount < 5) {
        const delay = Math.pow(2, retryCount) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        return makeRequest(retryCount + 1);
      }
      console.error("Gemini API failed:", error);
      return "Sorry, I couldn't generate a response at this time.";
    }
  };

  return makeRequest();
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

  const handleMouseLeave = () => {
    setHoverX(null);
  };

  const handleClick = () => {
    if (hoverX !== null) {
      onAddPin(hoverX);
    }
  };

  const getPinCoords = (xPerc) => {
    const yPerc = 100 - (getHillY(xPerc) * 80);
    return { x: xPerc, y: yPerc };
  };

  const ghostPin = hoverX !== null ? getPinCoords(hoverX) : null;

  return (
    <div className="relative w-full aspect-[2/1] max-h-[500px] select-none group">
      <div className="absolute inset-0 bg-slate-50 rounded-xl border border-slate-200/60 shadow-inner overflow-hidden">
        <div className="absolute inset-0 opacity-30"
          style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
        </div>
      </div>

      <div className="absolute bottom-4 left-4 text-slate-400 text-xs font-bold uppercase tracking-wider">Figuring it out</div>
      <div className="absolute bottom-4 right-4 text-slate-400 text-xs font-bold uppercase tracking-wider">Getting it done</div>
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-slate-300 text-xs font-bold uppercase tracking-wider">Peak Uncertainty</div>

      <svg
        ref={svgRef}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full cursor-crosshair z-10"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      >
        <path
          d={pathData}
          fill="transparent"
          stroke="#94a3b8"
          strokeWidth="0.5"
          strokeDasharray="1 1"
          className="opacity-50"
        />
        <path
          d={pathData}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="0.8"
          className="drop-shadow-lg"
        />
        <line x1="50" y1="100" x2="50" y2="20" stroke="#cbd5e1" strokeWidth="0.2" strokeDasharray="2 2" />
      </svg>

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
              className={`w-4 h-4 rounded-full border-2 border-white shadow-md cursor-pointer transition-transform hover:scale-125 ${isUphill ? 'bg-amber-500' : 'bg-emerald-500'}`}
            ></div>

            <div className="absolute bottom-6 opacity-0 scale-90 group-hover/pin:opacity-100 group-hover/pin:scale-100 transition-all duration-200 w-56 pointer-events-none z-30">
              <div className="bg-white rounded-lg shadow-xl p-3 border border-slate-100 text-center">
                <div className="text-2xl mb-1">{pin.emoji}</div>
                {pin.projectName && (
                  <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md mb-2 inline-block border border-indigo-100">
                    {pin.projectName}
                  </div>
                )}
                <p className="text-sm font-medium text-slate-700 leading-tight mb-1">{pin.text}</p>
                {pin.name && <p className="text-xs font-semibold text-blue-600 mb-1">👤 {pin.name}</p>}
                {pin.createdAt && (
                  <p className="text-[10px] text-slate-400 mb-1">
                    📅 {new Date(pin.createdAt.seconds * 1000).toLocaleDateString()} {new Date(pin.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                )}
                <p className="text-[10px] text-slate-400">{isUphill ? '🧗 Uphill' : '⛷️ Downhill'}</p>
              </div>
              <div className="w-3 h-3 bg-white transform rotate-45 border-r border-b border-slate-100 absolute -bottom-1.5 left-1/2 -translate-x-1/2 shadow-sm"></div>
            </div>

            <button
              onClick={(e) => { e.stopPropagation(); onDeletePin(pin.id); }}
              className="absolute -top-8 opacity-0 group-hover/pin:opacity-100 bg-red-100 hover:bg-red-200 p-1 rounded-full text-red-600 transition-colors pointer-events-auto"
              title="Delete Update"
            >
              <Trash2 size={12} />
            </button>
          </div>
        );
      })}

      {ghostPin && (
        <div
          className="absolute z-10 pointer-events-none w-3 h-3 rounded-full bg-blue-400/50 border border-blue-400 shadow-sm animate-pulse"
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
  const [isSuggesting, setIsSuggesting] = useState(false);

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

  const handleSuggest = async () => {
    if (!text.trim()) return;
    setIsSuggesting(true);

    const prompt = `
      I am working on a project. I am using a "Hill Chart".
      I am currently on the ${isUphill ? '"Uphill" (Figuring things out, high uncertainty)' : '"Downhill" (Execution, getting it done)'} side of the hill.
      My current status update is: "${text}".

      Please suggest 3 short, concrete, actionable bullet points (started with - ) for what I should likely do next to move this forward.
      Keep it very brief and direct.
    `;

    const suggestion = await callGemini(prompt);
    setText(prev => `${prev}\n\nSuggested Next Steps:\n${suggestion}`);
    setIsSuggesting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100 p-6 m-4">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-800">
            {isUphill ? '🧗 Uphill Struggle' : '⛷️ Downhill Execution'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Project Name</label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="e.g. Website Redesign"
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-slate-700 placeholder-slate-400 text-sm font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Your Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-slate-700 placeholder-slate-400 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">How are you feeling?</label>
            <div className="flex flex-wrap gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
              {FEELING_EMOJIS.map((e) => (
                <button
                  key={e}
                  onClick={() => setEmoji(e)}
                  className={`w-10 h-10 flex items-center justify-center text-xl rounded-lg transition-all ${emoji === e ? 'bg-white shadow-md scale-110 ring-2 ring-blue-100' : 'hover:bg-white/50 grayscale hover:grayscale-0'
                    }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-end mb-2">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">What's the latest?</label>
              <button
                onClick={handleSuggest}
                disabled={isSuggesting || !text.trim()}
                className="text-xs flex items-center gap-1 text-indigo-600 hover:text-indigo-700 disabled:opacity-50 font-medium transition-colors"
              >
                {isSuggesting ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                {isSuggesting ? 'Thinking...' : 'Suggest Next Steps'}
              </button>
            </div>
            <textarea
              autoFocus
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={isUphill ? "What are the unknowns? What are you figuring out?" : "What tasks are remaining? What's the shipping plan?"}
              className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none text-slate-700 placeholder-slate-400 text-sm"
            />
          </div>

          <button
            onClick={() => {
              if (!text.trim() || !name.trim() || !projectName.trim()) return;
              onSubmit({ text, emoji, name, projectName });
            }}
            disabled={!text.trim() || !name.trim() || !projectName.trim()}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg shadow-blue-600/30 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <MapPin size={18} />
            Pin Update
          </button>
        </div>
      </div>
    </div>
  );
};

const ReportModal = ({ isOpen, onClose, pins }) => {
  const [report, setReport] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      generateReport();
    }
  }, [isOpen]);

  const generateReport = async () => {
    setIsLoading(true);
    const uphillPins = pins.filter(p => p.x < 50).map(p => `- ${p.emoji} (At ${Math.round(p.x)}%): ${p.text}`).join('\n');
    const downhillPins = pins.filter(p => p.x >= 50).map(p => `- ${p.emoji} (At ${Math.round(p.x)}%): ${p.text}`).join('\n');

    const prompt = `
      You are a project manager assistant. Here is the current status of the project based on a Hill Chart.

      UPHILL WORK (Figuring it out, Risks, Unknowns):
      ${uphillPins || "No active items."}

      DOWNHILL WORK (Execution, Getting it done):
      ${downhillPins || "No active items."}

      Please write a concise Project Status Report.
      1. Start with a 1-sentence "Health Check" summary.
      2. List "Key Blockers/Risks" derived from the Uphill items.
      3. List "Shipping Progress" derived from the Downhill items.
      4. End with an encouraging closing.

      Format nicely with Markdown.
    `;

    const result = await callGemini(prompt);
    setReport(result);
    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all scale-100 flex flex-col max-h-[90vh] m-4">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Sparkles className="text-indigo-500" size={20} />
            AI Status Report
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 size={48} className="text-indigo-500 animate-spin" />
              <p className="text-slate-500 text-sm animate-pulse">Analyzing project trajectory...</p>
            </div>
          ) : (
            <div className="prose prose-slate prose-sm max-w-none">
              <div className="whitespace-pre-wrap font-medium text-slate-700 leading-relaxed">
                {report}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium rounded-lg transition-colors"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Main App Component ---

export default function App() {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [pins, setPins] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [pendingPinX, setPendingPinX] = useState(null);
  const [dateFilter, setDateFilter] = useState('all'); // 'all', 'today', 'week', 'sprint'
  const [isExporting, setIsExporting] = useState(false);

  // Storybook Mode State
  const [isStoryMode, setIsStoryMode] = useState(false);
  const [storyDateIndex, setStoryDateIndex] = useState(0);

  const chartRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'pins'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newPins = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPins(newPins);
    }, (error) => {
      console.error("Error fetching pins:", error);
    });

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
    if (confirm('Are you sure you want to remove this update?')) {
      try {
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'pins', pinId));
      } catch (e) {
        console.error("Error deleting pin:", e);
      }
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Filter pins by date range
  const filterPinsByDate = (pins) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return pins.filter(pin => {
      if (!pin.createdAt) return true; // Show pins without date
      const pinDate = new Date(pin.createdAt.seconds * 1000);

      switch (dateFilter) {
        case 'today':
          return pinDate >= today;
        case 'week':
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return pinDate >= weekAgo;
        case 'sprint':
          // Assuming 2-week sprint
          const sprintStart = new Date(today);
          sprintStart.setDate(sprintStart.getDate() - 14);
          return pinDate >= sprintStart;
        default:
          return true;
      }
    });
  };

  // Get unique dates for Storybook Mode
  const uniqueDates = useMemo(() => {
    const dates = new Set();
    pins.forEach(pin => {
      if (pin.createdAt) {
        const dateStr = new Date(pin.createdAt.seconds * 1000).toLocaleDateString();
        dates.add(dateStr);
      }
    });
    // Sort dates descending (newest first)
    return Array.from(dates).sort((a, b) => new Date(b) - new Date(a));
  }, [pins]);

  // Derived state for displayed pins
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

  const filteredPins = displayedPins; // Alias for compatibility

  // Export screenshot
  const handleExportScreenshot = async () => {
    if (!chartRef.current) return;
    setIsExporting(true);

    try {
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: '#f1f5f9',
        scale: 2,
        logging: false,
        useCORS: true
      });

      const link = document.createElement('a');
      const timestamp = new Date().toISOString().split('T')[0];
      link.download = `hill-chart-${timestamp}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error exporting screenshot:', error);
      alert('Failed to export screenshot. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  if (loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <Loader2 size={48} className="text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">

        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <div className="bg-blue-600 text-white p-2 rounded-lg shadow-lg">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M2 20 L12 4 L22 20" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              Project Hill Chart
            </h1>
            <p className="text-slate-500 mt-1">Track progress from uncertainty to execution.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleExportScreenshot}
              disabled={isExporting}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white text-sm font-bold rounded-full shadow-md hover:shadow-lg transition-all"
            >
              {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
              {isExporting ? 'Exporting...' : 'Export Screenshot'}
            </button>
            <button
              onClick={() => setIsReportOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-full shadow-md hover:shadow-lg transition-all"
            >
              <Sparkles size={16} />
              Generate Report
            </button>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-600 text-sm font-bold rounded-full shadow-sm border border-slate-200 transition-all"
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </header>

        {/* Controls: Date Filter OR Storybook Mode */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 space-y-4 md:space-y-0 md:flex md:items-center md:justify-between">

          <div className="flex items-center gap-4">
            {/* Storybook Toggle */}
            <button
              onClick={() => {
                setIsStoryMode(!isStoryMode);
                setStoryDateIndex(0); // Reset to newest date
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${isStoryMode
                  ? 'bg-amber-100 text-amber-700 ring-2 ring-amber-400'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
            >
              <span className="text-xl">📖</span>
              {isStoryMode ? 'Exit Storybook' : 'Storybook Mode'}
            </button>

            {isStoryMode && uniqueDates.length > 0 && (
              <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-lg border border-slate-200">
                <button
                  onClick={() => setStoryDateIndex(Math.min(uniqueDates.length - 1, storyDateIndex + 1))}
                  disabled={storyDateIndex >= uniqueDates.length - 1}
                  className="p-2 hover:bg-white rounded-md disabled:opacity-30 transition-colors"
                  title="Previous Day"
                >
                  ←
                </button>
                <div className="px-2 text-center min-w-[120px]">
                  <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Viewing</div>
                  <div className="font-bold text-slate-700">{uniqueDates[storyDateIndex]}</div>
                </div>
                <button
                  onClick={() => setStoryDateIndex(Math.max(0, storyDateIndex - 1))}
                  disabled={storyDateIndex <= 0}
                  className="p-2 hover:bg-white rounded-md disabled:opacity-30 transition-colors"
                  title="Next Day"
                >
                  →
                </button>
              </div>
            )}
          </div>

          {!isStoryMode && (
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-slate-600 font-semibold">
                <Filter size={18} />
                <span className="text-sm">Filter:</span>
              </div>
              <div className="flex gap-2">
                {[
                  { value: 'all', label: 'All Time' },
                  { value: 'today', label: 'Today' },
                  { value: 'week', label: 'Last Week' },
                  { value: 'sprint', label: 'Sprint' }
                ].map(filter => (
                  <button
                    key={filter.value}
                    onClick={() => setDateFilter(filter.value)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${dateFilter === filter.value
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="text-sm text-slate-500 font-medium">
            {isStoryMode
              ? `Page ${uniqueDates.length - storyDateIndex} of ${uniqueDates.length}`
              : `${filteredPins.length} updates`
            }
          </div>
        </div>

        {/* Chart Container with Ref for Screenshot */}
        <div ref={chartRef}>
          <main className="bg-white rounded-3xl shadow-xl border border-slate-200 p-6 md:p-10 overflow-visible">
            <HillChart
              pins={filteredPins}
              onAddPin={handleChartClick}
              onDeletePin={handleDeletePin}
            />
          </main>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                Uphill (Figuring it out)
              </h2>
              <div className="space-y-3">
                {filteredPins.filter(p => p.x < 50).length === 0 && (
                  <div className="text-slate-400 italic text-sm bg-white p-4 rounded-xl border border-slate-200 border-dashed text-center">No updates in this phase</div>
                )}
                {filteredPins.filter(p => p.x < 50).map(pin => (
                  <div key={pin.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-start gap-3 transition-hover hover:shadow-md relative group">
                    <div className="text-2xl bg-slate-50 p-2 rounded-lg">{pin.emoji}</div>
                    <div className="flex-1">
                      <p className="text-slate-700 text-sm leading-relaxed mb-2">{pin.text}</p>
                      {pin.projectName && (
                        <div className="inline-block bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-indigo-100 mb-2">
                          {pin.projectName}
                        </div>
                      )}
                      {pin.name && (
                        <p className="text-xs font-semibold text-blue-600 mb-1">👤 {pin.name}</p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span>Position: {Math.round(pin.x)}%</span>
                        {pin.createdAt && (
                          <span>📅 {new Date(pin.createdAt.seconds * 1000).toLocaleDateString()} {new Date(pin.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeletePin(pin.id)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-red-100 hover:bg-red-200 p-1.5 rounded-full text-red-600 transition-all"
                      title="Delete Update"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                Downhill (Executing)
              </h2>
              <div className="space-y-3">
                {filteredPins.filter(p => p.x >= 50).length === 0 && (
                  <div className="text-slate-400 italic text-sm bg-white p-4 rounded-xl border border-slate-200 border-dashed text-center">No updates in this phase</div>
                )}
                {filteredPins.filter(p => p.x >= 50).map(pin => (
                  <div key={pin.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-start gap-3 transition-hover hover:shadow-md relative group">
                    <div className="text-2xl bg-slate-50 p-2 rounded-lg">{pin.emoji}</div>
                    <div className="flex-1">
                      <p className="text-slate-700 text-sm leading-relaxed mb-2">{pin.text}</p>
                      {pin.projectName && (
                        <div className="inline-block bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-indigo-100 mb-2">
                          {pin.projectName}
                        </div>
                      )}
                      {pin.name && (
                        <p className="text-xs font-semibold text-blue-600 mb-1">👤 {pin.name}</p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span>Position: {Math.round(pin.x)}%</span>
                        {pin.createdAt && (
                          <span>📅 {new Date(pin.createdAt.seconds * 1000).toLocaleDateString()} {new Date(pin.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeletePin(pin.id)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-red-100 hover:bg-red-200 p-1.5 rounded-full text-red-600 transition-all"
                      title="Delete Update"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        <PinModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSavePin}
          initialX={pendingPinX}
        />

        <ReportModal
          isOpen={isReportOpen}
          onClose={() => setIsReportOpen(false)}
          pins={pins}
        />

      </div>
    </div>
  );
}
