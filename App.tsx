import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Calendar, MapPin, Image as ImageIcon, Share2, Wand2, Volume2, Code, Terminal, Github, ExternalLink } from 'lucide-react';
import { generateGreeting, generateFestiveImage, speakGreeting, findLocalEvents } from './services/geminiService.ts';
import Countdown from './components/Countdown.tsx';
import Particles from './components/Particles.tsx';

const App: React.FC = () => {
  const [recipient, setRecipient] = useState('JAPS');
  const [tone, setTone] = useState('inspiring');
  const [greeting, setGreeting] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [posterUrl, setPosterUrl] = useState<string | null>(null);
  const [isPosterLoading, setIsPosterLoading] = useState(false);
  const [localEvents, setLocalEvents] = useState<{ text: string, links: any[] } | null>(null);
  const [isEventsLoading, setIsEventsLoading] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  const handleGenerateGreeting = async () => {
    setIsGenerating(true);
    try {
      const msg = await generateGreeting(recipient, tone);
      setGreeting(msg);
    } catch (err) {
      console.error("Greeting generation failed:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGeneratePoster = async () => {
    setIsPosterLoading(true);
    try {
      const url = await generateFestiveImage(`A stunning New Year 2026 celebration poster for ${recipient}, tone: ${tone}`);
      setPosterUrl(url);
    } catch (err) {
      console.error("Poster generation failed:", err);
    } finally {
      setIsPosterLoading(false);
    }
  };

  const handlePlayAudio = async () => {
    if (!greeting) return;
    try {
      const bytes = await speakGreeting(greeting);
      if (!bytes) return;

      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }
      
      const dataInt16 = new Int16Array(bytes.buffer);
      const numChannels = 1;
      const frameCount = dataInt16.length / numChannels;
      const buffer = ctx.createBuffer(numChannels, frameCount, 24000);
      const channelData = buffer.getChannelData(0);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i] / 32768.0;
      }

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start();
    } catch (err) {
      console.error("Audio playback error:", err);
    }
  };

  const handleFindEvents = () => {
    setIsEventsLoading(true);
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      setIsEventsLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const data = await findLocalEvents(pos.coords.latitude, pos.coords.longitude);
          setLocalEvents(data);
        } catch (err) {
          console.error("Event discovery failed:", err);
        } finally {
          setIsEventsLoading(false);
        }
      },
      (err) => {
        console.error("Geolocation error:", err);
        setIsEventsLoading(false);
        alert("Location access is required for finding local events.");
      }
    );
  };

  useEffect(() => {
    handleGenerateGreeting();
  }, []);

  return (
    <div className="min-h-screen relative bg-[#020617] overflow-x-hidden pb-20">
      <Particles />
      
      {/* Premium Navigation / Attribution */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-[#020617]/40 backdrop-blur-xl border-b border-white/5 py-4 px-6 flex justify-between items-center">
        <div className="flex items-center gap-2 group cursor-default">
          <div className="bg-teal-500/20 p-2 rounded-lg border border-teal-500/30 group-hover:scale-110 transition-transform">
            <Sparkles className="w-5 h-5 text-teal-400" />
          </div>
          <span className="font-bold text-lg bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">JAPS 2026</span>
        </div>
        <div className="hidden md:flex items-center gap-4 text-sm font-medium text-slate-400">
          <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
            <Code className="w-4 h-4 text-teal-400" />
            <span>Developer: <span className="text-white font-bold">Fayaz Ali</span></span>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-12 flex flex-col items-center px-4">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[500px] bg-emerald-500/5 blur-[140px] rounded-full pointer-events-none" />
        
        <div className="mb-6 inline-flex items-center gap-2 bg-gradient-to-r from-teal-500/10 to-blue-500/10 backdrop-blur-md px-6 py-2 rounded-full border border-white/10 text-teal-300 font-bold text-sm tracking-widest uppercase animate-pulse shadow-teal-500/20 shadow-lg">
          <Terminal className="w-4 h-4" /> Welcome to 2026
        </div>

        <h1 className="text-6xl md:text-9xl font-black mb-6 text-center tracking-tighter animate-float">
          <span className="bg-gradient-to-b from-white via-slate-200 to-slate-500 bg-clip-text text-transparent opacity-90 block">Happy</span>
          <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-300 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(250,204,21,0.4)]">New Year 2026</span>
        </h1>
        
        <div className="font-pacifico text-4xl md:text-7xl text-teal-400/90 mb-10 drop-shadow-lg text-center">
          {recipient}
        </div>

        <Countdown />
      </section>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 px-6 relative z-10">
        {/* Personalized Greeting Card */}
        <div className="group bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-10 shadow-2xl transition-all hover:border-teal-500/30">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-400/10 rounded-2xl">
                <Sparkles className="w-7 h-7 text-yellow-400" />
              </div>
              <h2 className="text-3xl font-black tracking-tight">2026 AI Wishes</h2>
            </div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Powered by Gemini 3</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">For Whom?</label>
              <input 
                type="text" 
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="Name of recipient..."
                className="bg-black/20 border border-white/5 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-teal-500/50 transition-all text-white placeholder:text-slate-600 font-medium"
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">The Mood</label>
              <div className="flex flex-wrap gap-2">
                {['inspiring', 'funny', 'poetic', 'bold'].map(t => (
                  <button
                    key={t}
                    onClick={() => setTone(t)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border uppercase tracking-wider ${tone === t ? 'bg-teal-500 border-teal-400 text-white shadow-lg shadow-teal-500/20' : 'bg-white/5 border-white/10 hover:border-white/20 text-slate-400'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="relative min-h-[240px] bg-black/40 rounded-3xl p-8 border border-white/5 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 blur-3xl pointer-events-none" />
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center h-full gap-5 text-slate-400">
                <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
                <p className="font-bold tracking-widest text-xs uppercase animate-pulse">Dreaming up 2026...</p>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <p className="text-2xl md:text-3xl font-medium leading-relaxed text-slate-100 italic">"{greeting}"</p>
                <div className="mt-10 flex gap-4">
                  <button 
                    onClick={handlePlayAudio}
                    className="flex-1 flex items-center justify-center gap-2 p-4 bg-teal-500/10 hover:bg-teal-500/20 rounded-2xl text-teal-400 transition-all font-bold border border-teal-500/20"
                  >
                    <Volume2 className="w-5 h-5" />
                    <span>Listen</span>
                  </button>
                  <button 
                    onClick={() => navigator.clipboard.writeText(greeting)}
                    className="flex-1 flex items-center justify-center gap-2 p-4 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-300 transition-all font-bold border border-white/10"
                  >
                    <Share2 className="w-5 h-5" />
                    <span>Copy</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <button 
            onClick={handleGenerateGreeting}
            disabled={isGenerating}
            className="mt-8 w-full bg-gradient-to-r from-teal-600 to-emerald-600 py-5 rounded-3xl font-black text-lg flex items-center justify-center gap-3 hover:scale-[1.02] transition-all active:scale-[0.98] disabled:opacity-50 shadow-xl shadow-teal-900/20"
          >
            <Wand2 className="w-6 h-6" />
            Generate 2026 Wishes
          </button>
        </div>

        {/* AI Poster Card */}
        <div className="group bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-10 shadow-2xl flex flex-col transition-all hover:border-yellow-500/30">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-teal-400/10 rounded-2xl">
              <ImageIcon className="w-7 h-7 text-teal-400" />
            </div>
            <h2 className="text-3xl font-black tracking-tight">2026 Poster</h2>
          </div>

          <div className="flex-1 rounded-3xl overflow-hidden bg-black/60 border border-white/5 flex items-center justify-center relative min-h-[350px] group">
            {isPosterLoading ? (
              <div className="flex flex-col items-center gap-6 text-slate-400 p-10 text-center">
                <div className="relative">
                   <div className="w-16 h-16 border-4 border-teal-500/20 rounded-full" />
                   <div className="absolute top-0 w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
                </div>
                <div className="space-y-2">
                   <p className="font-black text-sm uppercase tracking-[0.2em] text-teal-400">Rendering Art</p>
                   <p className="text-xs text-slate-500 max-w-[200px]">Imagining a cinematic 2026 celebration poster...</p>
                </div>
              </div>
            ) : posterUrl ? (
              <img src={posterUrl} alt="Festive AI Poster" className="w-full h-full object-cover animate-in fade-in zoom-in duration-1000 group-hover:scale-105 transition-transform" />
            ) : (
              <div className="text-center p-12 text-slate-600 flex flex-col items-center gap-6">
                <div className="w-24 h-24 border-2 border-dashed border-white/10 rounded-[2rem] flex items-center justify-center">
                  <ImageIcon className="w-10 h-10 opacity-20" />
                </div>
                <p className="font-medium text-slate-500">Ready to visualize your 2026 celebration?</p>
              </div>
            )}
          </div>

          <button 
            onClick={handleGeneratePoster}
            disabled={isPosterLoading}
            className="mt-8 w-full bg-gradient-to-r from-yellow-500 to-orange-500 py-5 rounded-3xl font-black text-lg flex items-center justify-center gap-3 hover:scale-[1.02] transition-all active:scale-[0.98] disabled:opacity-50 shadow-xl shadow-yellow-900/20 text-slate-900"
          >
            <ImageIcon className="w-6 h-6" />
            Create 2026 Festive Art
          </button>
        </div>

        {/* Local Events Section */}
        <div className="lg:col-span-2 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 blur-[100px] pointer-events-none" />
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-500/10 rounded-2xl">
                <MapPin className="w-7 h-7 text-rose-500" />
              </div>
              <div>
                <h2 className="text-3xl font-black tracking-tight">NYE Events Nearby</h2>
                <p className="text-sm text-slate-500 font-medium">Real-time celebration tracker</p>
              </div>
            </div>
            <button 
              onClick={handleFindEvents}
              disabled={isEventsLoading}
              className="w-full md:w-auto px-10 py-4 bg-rose-500 hover:bg-rose-600 rounded-2xl font-black text-white transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-lg shadow-rose-900/20 active:scale-95"
            >
              {isEventsLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : <MapPin className="w-5 h-5" />}
              Discover Now
            </button>
          </div>

          {localEvents ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-8 duration-700">
              <div className="lg:col-span-2">
                <div className="bg-black/30 p-8 rounded-[2rem] border border-white/5 text-slate-200 text-lg leading-relaxed whitespace-pre-wrap relative h-full">
                   <div className="prose prose-invert max-w-none">
                     {localEvents.text}
                   </div>
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2 mb-4">
                  <ExternalLink className="w-4 h-4" /> Recommended Hubs
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {localEvents.links.length > 0 ? localEvents.links.map((chunk: any, i: number) => {
                    const link = chunk.maps || chunk.web;
                    if (!link) return null;
                    return (
                      <a 
                        key={i} 
                        href={link.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="group bg-white/5 hover:bg-white/10 p-5 rounded-2xl border border-white/10 transition-all hover:-translate-y-1"
                      >
                        <div className="text-rose-400 font-black group-hover:text-rose-300 transition-colors flex items-center justify-between">
                          {link.title || 'Event Page'}
                          <Share2 className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="text-xs text-slate-500 truncate mt-2 font-medium">{link.uri}</div>
                      </a>
                    );
                  }) : (
                    <div className="text-slate-600 italic text-center py-10 border-2 border-dashed border-white/5 rounded-2xl">
                      No direct links found in current radius.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 bg-black/20 rounded-[2rem] border border-dashed border-white/5 text-slate-500 flex flex-col items-center gap-4">
              <div className="p-6 bg-white/5 rounded-full animate-pulse">
                <MapPin className="w-10 h-10 opacity-30" />
              </div>
              <p className="font-bold tracking-widest text-sm uppercase opacity-50">Awaiting Location Authorization</p>
            </div>
          )}
        </div>
      </main>

      {/* Creator Profile Section - PROMINENT */}
      <footer className="mt-24 pb-12 px-6 flex flex-col items-center">
        <div className="relative group max-w-lg w-full">
          <div className="absolute -inset-1 bg-gradient-to-r from-teal-500 via-yellow-400 to-rose-500 rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition-opacity" />
          <div className="relative bg-[#020617] rounded-[2.5rem] p-10 border border-white/10 shadow-2xl flex flex-col items-center">
            <div className="relative mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-teal-400 to-emerald-600 rounded-3xl flex items-center justify-center shadow-2xl rotate-3 group-hover:rotate-0 transition-transform">
                <Code className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-slate-900 text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-widest border-2 border-[#020617]">
                2026
              </div>
            </div>
            
            <p className="text-slate-500 text-xs font-black uppercase tracking-[0.3em] mb-2">Designed & Engineered By</p>
            <h3 className="text-4xl font-black bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent mb-1">
              Fayaz Ali
            </h3>
            <p className="text-teal-400 font-bold tracking-widest uppercase text-sm mb-6 italic">
              Web Developer & Visual Architect
            </p>
            
            <div className="flex gap-4">
               <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10 text-xs font-bold text-slate-400">
                  <Github className="w-4 h-4" /> Repository
               </div>
               <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/10 text-xs font-bold text-slate-400">
                  <ExternalLink className="w-4 h-4" /> Portfolio
               </div>
            </div>
          </div>
        </div>
        
        <div className="mt-12 text-slate-600 flex flex-col items-center gap-2">
          <p className="text-xs font-bold uppercase tracking-[0.5em] opacity-30">Happy New Year 2026 &bull; JAPS Limited Edition</p>
        </div>
      </footer>

      {/* Mobile Sticky Action */}
      <div className="fixed bottom-6 right-6 md:hidden z-50">
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="w-14 h-14 bg-teal-500 text-white rounded-full flex items-center justify-center shadow-2xl shadow-teal-500/50 active:scale-90 transition-transform border-4 border-[#020617]"
        >
          <Calendar className="w-6 h-6" />
        </button>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        .animate-float {
          animation: float 6s infinite ease-in-out;
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.9); opacity: 0; }
          50% { opacity: 0.3; }
          100% { transform: scale(1.1); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default App;