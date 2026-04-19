import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot, collection } from 'firebase/firestore';
import heroImage from './assets/hero.png'; // Assuming hero.jpg exists in src/assets
import rishikeshImage from './assets/rishikesh.jpg'; // Assuming rishikesh.jpg exists in src/assets
import sersiImage from './assets/sersi.jpg'; // Assuming sersi.jpg exists in src/assets
import kedarnathImage from './assets/kedarnath.webp'; // Assuming kedarnath.jpg exists in src/assets
import badrinathImage from './assets/badrinath.webp'; // Assuming badrinath.jpg exists in src/assets
import yamunotriImage from './assets/yamunotri.jpg'; // Assuming yamunotri.jpg exists in src/assets
import gangotri from './assets/gangotri.webp';
import dehradunImage from './assets/dehradun.webp'; // Assuming dehradun.jpg exists in src/assets
import qrPlaceholderImage from './assets/qr.png'; // Assuming qr-placeholder.png exists in src/assets

const apiKey = "AIzaSyDWODs0ZBtHeSDFgRWDsz1JI-OyCngoYfw";
const firebaseConfig = typeof __firebase_config !== 'undefined'
  ? JSON.parse(__firebase_config)
  : {
    apiKey: "AIzaSyCJh7oCKC8OAVIONKvQPm7X7BHblLW2gQk",
    authDomain: "travelplan-7a013.firebaseapp.com",
    projectId: "travelplan-7a013",
    storageBucket: "travelplan-7a013.firebasestorage.app",
    messagingSenderId: "827698727841",
    appId: "1:827698727841:web:4f8773104dd92913ed59e0",
    measurementId: "G-T14NW8C272"
  };


// --- VERIFIED ASSETS ---
const IMAGES = {
  hero: heroImage,
  rishikesh: rishikeshImage,
  sersi: sersiImage,
  kedarnath: kedarnathImage,
  badrinath: badrinathImage,
  yamunotri: yamunotriImage,
  gangotri,
  dehradun: dehradunImage,
  qrPlaceholder: qrPlaceholderImage
};

const REG_DATA = {
  no: "652173010478",
  groupId: "6040255562",
  emergency: { name: "SANDHYA", phone: "9440987798", relation: "SPOUSE" },
  travelMode: "CHARTERED HELICOPTER",
  pax: [
    {
      name: "POLAVARAPU RAJA",
      age: 35,
      id: "PAX-01",
      idType: "AADHAR",
      idNo: "XXXXXXXX4141",
      gender: "MALE",
      seats: { onward: "TBA", return: "TBA" },
      etickets: { indigo: "SY6YYJ", airindia: "5896003140" },
      meal: "NON-VEGETARIAN"
    },
    {
      name: "SANDHYA RANI SATYAVARAPU",
      id: "PAX-02",
      age: 32,
      idType: "AADHAR",
      idNo: "XXXX-XXXX-4412",
      gender: "FEMALE",
      seats: { onward: "TBA", return: "TBA" },
      etickets: { indigo: "SY6YYJ", airindia: "5896003141" },
      meal: "VEGETARIAN"
    }
  ],
  dates: {
    kedarnath: "24/05/2026",
    badrinath: "25/05/2026",
    yamunotri: "26/05/2026",
    gangotri: "27/05/2026"
  }
};

const TICKETS = [
  {
    airline: "INDIGO",
    pnr: "SY6YYJ",
    route: "HYD - DED",
    flight: "6E 422",
    date: "22 MAY 2026",
    dep: "10:25",
    arr: "12:50",
    fromTerminal: "HYD (RAJIV GANDHI INTL)",
    toTerminal: "DED (JOLLY GRANT)",
    bookingId: "NF7AKPSX64440584043",
    baggage: { cabin: "7 KGS", checkin: "15 KGS" },
    theme: { bg: "bg-indigo-950/40", border: "border-indigo-500/30", text: "text-indigo-100", accent: "text-indigo-400", header: "bg-indigo-600" },
    lounges: [
      { name: "ENCALM LOUNGE", loc: "HYD T1 (DEPARTURE)", rating: "4.5", facilities: ["WiFi", "Buffet", "AC", "Charging", "Flight Radar"] }
    ]
  },
  {
    airline: "AIR INDIA",
    pnr: "7RMF3R",
    route: "DED - VTZ",
    date: "28 MAY 2026",
    baggage: { cabin: "7 KGS", checkin: "15 KGS" },
    theme: { bg: "bg-red-950/40", border: "border-red-500/30", text: "text-red-100", accent: "text-red-400", header: "bg-red-600" },
    lounges: [
      { name: "BIRD LOUNGE", loc: "DED MAIN (DEP)", rating: "3.8", facilities: ["WiFi", "Comfort Seats", "Gourmet Snacks"] },
      { name: "ENCALM T3", loc: "DEL T3 (ARR/TRANSIT)", rating: "4.3", facilities: ["Showers", "Sleep Pods", "Full Buffet", "Bar"] },
      { name: "ENCALM T2", loc: "DEL T2 (DEP)", rating: "4.0", facilities: ["WiFi", "Hot Meals", "AC"] }
    ],
    legs: [
      { flight: "AI 2908", from: "DED", to: "DEL", dep: "13:30", arr: "14:30", fromTerminal: "DED MAIN", toTerminal: "DEL T3" },
      { flight: "AI 1702", from: "DEL", to: "VTZ", dep: "18:30", arr: "20:50", fromTerminal: "DEL T2", toTerminal: "VTZ MAIN" }
    ]
  }
];

const EXPERT_ITINERARY = [
  { day: 1, date: "22 MAY", title: "ARRIVAL & RISHIKESH", image: IMAGES.rishikesh, risk: "LOW", dur: "2H DRIVE", dham: "NONE", plan: "Arrival at 12:50 PM. Direct transfer to Rishikesh for evening Ganga Aarti.", timeline: [{ time: "12:50", task: "LAND AT DEHRADUN", details: "COLLECT BAGS" }, { time: "14:30", task: "TAXI TO RISHIKESH", details: "PREPAID COUNTER" }, { time: "18:00", task: "GANGA AARTI", details: "TRIVENI GHAT" }] },
  { day: 2, date: "23 MAY", title: "TRANSIT TO SERSI", image: IMAGES.sersi, risk: "MODERATE", dur: "8H DRIVE", dham: "NONE", plan: "Mountain drive via Devprayag and Rudraprayag. Reach Sersi base station.", timeline: [{ time: "06:00", task: "DEPART RISHIKESH", details: "MOUNTAIN DRIVE" }, { time: "10:00", task: "DEVPRAYAG STOP", details: "SANGAM VIEW" }, { time: "18:00", task: "REACH SERSI BASE", details: "HELI BRIEFING" }] },
  { day: 3, date: "24 MAY", title: "KEDARNATH DHAM", image: IMAGES.kedarnath, risk: "EXTREME", dur: "5H TRANSIT", dham: "KEDARNATH", plan: "Early morning helicopter from Sersi to Kedarnath. Complete Darshan and Pooja at the main shrine.", timeline: [{ time: "06:00", task: "HELI BOARDING", details: "SERSI SECTOR" }, { time: "09:00", task: "MAIN DARSHAN", details: "LORD SHIVA POOJA" }, { time: "14:30", task: "RETURN TO SERSI", details: "REST & RECOVERY" }] },
  { day: 4, date: "25 MAY", title: "BADRINATH DHAM", image: IMAGES.badrinath, risk: "MODERATE", dur: "8H DRIVE", dham: "BADRINATH", plan: "Drive via Joshimath. Evening Darshan at Badrinath Temple. Visit Tapt Kund and Mana Village.", timeline: [{ time: "07:00", task: "DEPART SERSI", details: "JOSHIMATH ROUTE" }, { time: "15:00", task: "BADRINATH DARSHAN", details: "EVENING PRAYERS" }, { time: "17:30", task: "MANA VILLAGE", details: "LAST VILLAGE" }] },
  { day: 5, date: "26 MAY", title: "YAMUNOTRI MISSION", image: IMAGES.yamunotri, risk: "CRITICAL", dur: "11H DRIVE", dham: "YAMUNOTRI", plan: "Longest day. Very early departure (3 AM) to cross to the Yamunotri side. Trek from Janki Chatti.", timeline: [{ time: "03:00", task: "CRITICAL START", details: "CROSS-VALLEY TRANSIT" }, { time: "15:00", task: "YAMUNOTRI TREK", details: "FROM JANKICHATTI" }, { time: "19:00", task: "REACH BARKOT", details: "STAY AT BASE" }] },
  { day: 6, date: "27 MAY", title: "GANGOTRI RETURN", image: IMAGES.gangotri, risk: "HIGH", dur: "13H TOTAL", dham: "GANGOTRI", plan: "Final Dham. Perform Darshan at Bhagirathi bank. Immediate long-distance return drive to Dehradun.", timeline: [{ time: "04:30", task: "DEPART FOR GANGOTRI", details: "SHRINE DARSHAN" }, { time: "14:00", task: "GRAND RETURN DRIVE", details: "DEHRADUN BOUND" }, { time: "22:30", task: "REACH DEHRADUN CITY", details: "NEAR AIRPORT SECURE" }] },
  { day: 7, date: "28 MAY", title: "HOME DEPARTURE", image: IMAGES.dehradun, risk: "LOW", dur: "FLIGHT", dham: "NONE", plan: "Leisure breakfast. Final check of documents. Reach airport by 10:30 AM for VTZ flight.", timeline: [{ time: "10:30", task: "REACH AIRPORT", details: "DED TERMINAL" }, { time: "13:30", task: "FLIGHT AI 2908", details: "VTZ BOUND" }] }
];

const MASTER_ROADMAP = [
  { day: 1, route: "DED → RISHIKESH", dist: "25 KM", time: "1.5H", detail: "Arrival at DED and Aarti.", start: "Jolly Grant", end: "Triveni Ghat" },
  { day: 2, route: "RISHI → SERSI", dist: "200 KM", time: "8H", detail: "Scenic mountain drive.", start: "Rishikesh", end: "Sersi" },
  { day: 3, route: "SERSI ↔ KEDARNATH", dist: "HELI", time: "5H", detail: "Helicopter mission.", start: "Sersi", end: "Kedarnath" },
  { day: 4, route: "SERSI → BADRINATH", dist: "190 KM", time: "8H", detail: "Joshimath route.", start: "Sersi", end: "Badrinath" },
  { day: 5, route: "BADRI → BARKOT", dist: "260 KM", time: "11H", detail: "Cross-valley transit.", start: "Badrinath", end: "Barkot" },
  { day: 6, route: "BARKOT → DED", dist: "350 KM", time: "13H", detail: "Gangotri and return.", start: "Barkot", end: "Dehradun" }
];

// --- GEMINI API ---
const callGeminiAPI = async (prompt, systemInstruction = "", isJson = false) => {
  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    systemInstruction: { parts: [{ text: systemInstruction }] }
  };
  if (isJson) payload.generationConfig = { responseMimeType: "application/json" };
  const delays = [1000, 2000, 4000];
  for (let i = 0; i < 3; i++) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error();
      const result = await response.json();
      return isJson ? JSON.parse(result.candidates?.[0]?.content?.parts?.[0]?.text) : result.candidates?.[0]?.content?.parts?.[0]?.text;
    } catch (e) {
      await new Promise(r => setTimeout(r, delays[i]));
    }
  }
};

// --- HELPERS ---
const SafeImage = ({ src, alt, className }) => {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  return (
    <div className={`${className} bg-slate-900 relative overflow-hidden flex items-center justify-center`}>
      {loading && !error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-orange-600/30 border-t-orange-600 rounded-full animate-spin"></div>
        </div>
      )}
      {!error ? (
        <img
          src={src}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-1000 ${loading ? 'opacity-0' : 'opacity-100'}`}
          onLoad={() => setLoading(false)}
          onError={() => { setError(true); setLoading(false); }}
        />
      ) : (
        <div className="text-[10px] text-white/20 uppercase font-black px-4 text-center">{alt}</div>
      )}
    </div>
  );
};

export default function App() {
  const [page, setPage] = useState('home');
  const [user, setUser] = useState(null);
  const [selectedDay, setSelectedDay] = useState(0);
  const [completedTasks, setCompletedTasks] = useState({});
  const [aiIntel, setAiIntel] = useState({});
  const [loadingIntel, setLoadingIntel] = useState(false);
  const [explore, setExplore] = useState({ query: "", results: null, loading: false });

  const activeDay = EXPERT_ITINERARY[selectedDay] || EXPERT_ITINERARY[0];
  const appId = typeof __app_id !== 'undefined' ? __app_id : 'chardham-vault-2026';

  // --- FIREBASE SYNC ---
  useEffect(() => {
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);
    const initAuth = async () => {
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        await signInWithCustomToken(auth, __initial_auth_token);
      } else {
        await signInAnonymously(auth);
      }
    };
    initAuth();
    return onAuthStateChanged(auth, setUser);
  }, []);

  useEffect(() => {
    if (!user) return;
    const db = getFirestore();
    const docRef = doc(db, 'artifacts', appId, 'users', user.uid, 'vault', 'data');
    return onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.tasks) setCompletedTasks(data.tasks);
      }
    });
  }, [user, appId]);

  const saveProgress = async (payload) => {
    if (!user) return;
    const db = getFirestore();
    await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'vault', 'data'), payload, { merge: true });
  };

  const toggleTask = (key) => {
    const next = { ...completedTasks, [key]: !completedTasks[key] };
    setCompletedTasks(next);
    saveProgress({ tasks: next });
  };

  const getDayIntel = async () => {
    setLoadingIntel(true);
    const res = await callGeminiAPI(`Tactical briefing for: ${activeDay.title}. Risk: ${activeDay.risk}. Plan: ${activeDay.plan}. 2 sentences: 1 spiritual, 1 survival.`, "Tactical Guide.");
    if (res) setAiIntel(p => ({ ...p, [selectedDay]: res }));
    setLoadingIntel(false);
  };

  const searchExplore = async () => {
    if (!explore.query) return;
    setExplore(p => ({ ...p, loading: true }));
    const res = await callGeminiAPI(`Budget spots in ${explore.query}. JSON: {"spots": [{"name": "", "rating": "", "desc": ""}]}`, "Concierge", true);
    setExplore(p => ({ ...p, results: res?.spots || [], loading: false }));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans uppercase font-black selection:bg-orange-600/30 pb-32 transition-colors duration-500 overflow-x-hidden text-left">

      {/* HEADER */}
      <nav className="fixed top-0 w-full bg-slate-900/95 backdrop-blur-xl z-[200] border-b border-white/5 px-4 py-3 flex justify-between items-center h-16 text-left">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setPage('home')}>
          <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center text-white shadow-lg">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 22V4M6 8C6 14 18 14 18 8M6 8V6M18 8V6M12 4V2" /></svg>
          </div>
          <span className="text-lg tracking-tighter text-white">VAULT</span>
        </div>
        <div className="flex flex-col items-end text-[8px] text-slate-500 font-black leading-tight">
          <span className="text-orange-500">{REG_DATA.no}</span>
          <span className="opacity-50 tracking-tighter">{user?.uid?.slice(0, 6) || 'SECURE'}</span>
        </div>
      </nav>

      <main className="pt-20 px-4 max-w-4xl mx-auto space-y-8 text-left">

        {/* HOME VIEW */}
        {page === 'home' && (
          <div className="space-y-10 animate-in fade-in duration-500 text-left">
            <div className="space-y-2">
              <h1 className="text-4xl sm:text-7xl font-black leading-tight text-white uppercase">Sandhya && Raja <br /><span className="text-orange-600">CHARDHAM 2026</span></h1>
              <p className="text-[10px] text-slate-500 font-black tracking-widest leading-relaxed">TACTICAL PILGRIMAGE CONTROL • TRAVEL VALUT</p>
            </div>

            {/* ENHANCED SECTOR CARD - STABILIZED LEFT ALIGNMENT */}
            <div
              className="relative rounded-[2.5rem] overflow-hidden min-h-[420px] sm:min-h-[500px] shadow-2xl border border-white/5 bg-slate-900 cursor-pointer group"
              onClick={() => setPage('plan')}
            >
              <SafeImage src={activeDay.image} alt={activeDay.title} className="absolute inset-0 w-full h-full brightness-[0.25] group-hover:brightness-40 transition-all duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>

              <div className="relative z-10 h-full w-full p-6 sm:p-12 flex flex-col justify-between gap-y-8 text-left">
                {/* Top Overlay */}
                <div className="flex justify-between items-start w-full">
                  <div className="flex flex-col gap-3">
                    <p className="text-[9px] opacity-50 text-white tracking-[0.3em] font-black uppercase">CURRENT MISSION SECTOR</p>
                    <div className="flex gap-2">
                      <span className="bg-orange-600 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase shadow-lg">DAY {activeDay.day}</span>
                      <span className="bg-white/10 backdrop-blur text-white px-3 py-1 rounded-lg text-[10px] border border-white/20 font-black tracking-widest">{activeDay.date}</span>
                    </div>
                  </div>
                  <div className="px-3 py-1.5 rounded-xl border border-white/10 bg-slate-800/80 backdrop-blur-md text-[9px] font-black tracking-widest text-slate-100 uppercase">
                    {activeDay.risk} RISK
                  </div>
                </div>

                {/* Content Sections */}
                <div className="space-y-8">
                  <div className="space-y-2 text-left">
                    <h2 className="text-3xl sm:text-6xl tracking-tighter uppercase leading-[0.9] font-black text-white">{activeDay.title}</h2>
                    <div className="flex items-center gap-3 opacity-70 text-[10px] tracking-[0.1em] font-black text-orange-500 uppercase">
                      <span>DUR: {activeDay.dur}</span>
                      <span className="w-1.5 h-1.5 bg-white/20 rounded-full"></span>
                      <span>DHAM: {activeDay.dham}</span>
                    </div>
                  </div>

                  <div className="space-y-3 border-t border-white/10 pt-8 text-left">
                    {(activeDay.timeline || []).slice(0, 3).map((item, idx) => (
                      <div key={idx} className="flex items-center gap-5">
                        <span className="text-[10px] text-orange-500 font-black min-w-[50px] uppercase border-r border-white/10 pr-2">{item.time}</span>
                        <span className="text-[11px] tracking-tight truncate font-black text-white uppercase">{item.task}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* DAY SELECTOR */}
            <div className="space-y-4 text-left">
              <p className="text-[11px] tracking-[0.2em] text-slate-500 font-black uppercase">SWITCH MISSION DAY</p>
              <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 snap-x">
                {EXPERT_ITINERARY.map((day, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedDay(idx)}
                    className={`flex-shrink-0 w-16 h-16 rounded-2xl border-2 transition-all font-black text-[14px] snap-center flex items-center justify-center ${selectedDay === idx
                      ? 'bg-orange-600 border-orange-600 text-white shadow-xl shadow-orange-600/30 ring-4 ring-orange-600/10'
                      : 'bg-slate-900 border-white/10 text-slate-500 hover:text-slate-300'
                      }`}
                  >
                    D{day.day}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4 text-left">
              <h3 className="text-xs tracking-widest text-slate-500 font-black uppercase">LOGISTICS SUMMARY</h3>
              {TICKETS.map((t, i) => {
                const fromCity = (t.fromTerminal || t.legs?.[0]?.from || "").split('(')[0].trim();
                const toCity = (t.toTerminal || t.legs?.[t.legs.length - 1]?.to || "").split('(')[0].trim();
                return (
                  <div key={i} onClick={() => setPage('flights')} className="p-6 rounded-[2rem] border border-white/5 bg-slate-900/50 flex justify-between items-center cursor-pointer hover:bg-slate-900 transition-all shadow-sm">
                    <div className="min-w-0 flex-1 text-left">
                      <p className={`text-[9px] ${t.airline === 'INDIGO' ? 'text-indigo-400' : 'text-red-400'} font-black tracking-widest uppercase truncate`}>{t.airline} • {t.pnr}</p>
                      <h4 className="text-xl sm:text-2xl tracking-tighter font-black text-white uppercase truncate">{t.route}</h4>
                    </div>
                    <div className="text-right shrink-0 pl-4 border-l border-white/5 ml-4">
                      <p className="text-[11px] font-black text-white leading-none">{t.date.split(' ')[0]} {t.date.split(' ')[1]}</p>
                      <p className="text-[9px] opacity-40 font-black uppercase mt-1.5 tracking-tighter">
                        {fromCity}→{toCity}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* PLAN VIEW */}
        {page === 'plan' && (
          <div className="space-y-10 animate-in slide-in-from-bottom-8 duration-500 text-left">
            <div className="flex justify-between items-end gap-4">
              <h2 className="text-4xl tracking-tighter font-black uppercase text-white leading-none">PLANNER</h2>
              <select value={selectedDay} onChange={(e) => setSelectedDay(Number(e.target.value))} className="bg-slate-900 text-white px-5 py-3 rounded-2xl text-[11px] outline-none font-black shadow-xl border border-white/10 appearance-none uppercase">
                {EXPERT_ITINERARY.map((d, i) => <option key={i} value={i}>DAY {d.day}</option>)}
              </select>
            </div>

            <div className="bg-slate-900/50 rounded-[3rem] border border-white/5 p-8 space-y-8 text-left">
              <div className="flex gap-3">
                <div className="flex-1 bg-slate-950 p-5 rounded-2xl flex justify-between items-center border border-white/5 text-left">
                  <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest">RISK</span>
                  <span className={`text-[11px] font-black uppercase ${activeDay.risk === 'EXTREME' || activeDay.risk === 'CRITICAL' ? 'text-red-500' : 'text-white'}`}>{activeDay.risk}</span>
                </div>
                <div className="flex-1 bg-slate-950 p-5 rounded-2xl flex justify-between items-center border border-white/5 text-left">
                  <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest">DUR</span>
                  <span className="text-[11px] font-black text-white uppercase">{activeDay.dur}</span>
                </div>
              </div>

              <div className="space-y-4 text-left">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs text-orange-500 font-black uppercase">OBJECTIVE</h3>
                  <button onClick={getDayIntel} disabled={loadingIntel} className="text-[9px] bg-slate-800 text-slate-300 border border-white/10 px-4 py-1.5 rounded-full font-black uppercase tracking-tighter hover:bg-orange-500 hover:text-white transition-all">
                    {loadingIntel ? '...' : '✨ GET AI INTEL'}
                  </button>
                </div>
                <p className="text-base normal-case font-medium text-slate-200 italic leading-relaxed border-l-4 border-orange-600 pl-6 py-2 uppercase">"{activeDay.plan}"</p>
                {aiIntel[selectedDay] && (
                  <div className="p-6 bg-orange-600/10 rounded-[2rem] text-[11px] font-bold border border-orange-600/20 animate-in fade-in text-orange-100 uppercase leading-relaxed text-left">
                    {aiIntel[selectedDay]}
                  </div>
                )}
              </div>

              <div className="space-y-4 pt-6 border-t border-white/10 text-left">
                <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.3em] mb-4">MISSION TIMELINE</p>
                {(activeDay.timeline || []).map((step, i) => {
                  const key = `d${selectedDay}-s${i}`;
                  return (
                    <div key={i} onClick={() => toggleTask(key)} className={`flex items-start gap-6 p-5 sm:p-6 rounded-3xl border transition-all cursor-pointer ${completedTasks[key] ? 'opacity-30 bg-slate-950/50 border-transparent' : 'bg-slate-900 border-white/5 hover:border-orange-600/50 group shadow-lg text-left'}`}>
                      <span className="text-sm min-w-[60px] opacity-50 font-black text-slate-300 uppercase pt-0.5">{step.time}</span>
                      <div className="flex-1 min-w-0 text-left">
                        <h4 className={`text-base font-black uppercase text-white leading-tight ${completedTasks[key] ? 'line-through decoration-orange-600 opacity-60' : ''}`}>{step.task}</h4>
                        <p className="text-[10px] text-slate-500 font-black uppercase mt-1.5 leading-normal">{step.details}</p>
                      </div>
                      <div className={`w-8 h-8 rounded-xl border flex shrink-0 items-center justify-center transition-all ${completedTasks[key] ? 'bg-orange-600 border-orange-600 shadow-[0_0_15px_rgba(234,88,12,0.4)]' : 'border-white/10'}`}>
                        {completedTasks[key] && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4"><polyline points="20 6 9 17 4 12" /></svg>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
              {EXPERT_ITINERARY.map((item, idx) => (
                <div key={idx} onClick={() => { setSelectedDay(idx); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className={`p-6 rounded-[2.5rem] border transition-all cursor-pointer flex gap-5 items-center group overflow-hidden text-left ${selectedDay === idx ? 'border-orange-600 bg-orange-600/5 shadow-2xl' : 'border-white/5 bg-slate-900 hover:border-white/20'}`}>
                  <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 border border-white/5">
                    <SafeImage src={item.image} alt={item.title} className={`w-full h-full transition-all duration-700 ${selectedDay === idx ? '' : 'grayscale group-hover:grayscale-0'}`} />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className={`text-[9px] font-black uppercase tracking-widest ${selectedDay === idx ? 'text-orange-500' : 'text-slate-500'}`}>DAY {item.day} • {item.date}</p>
                    <h4 className={`text-base font-black text-white uppercase tracking-tight leading-tight transition-colors ${selectedDay === idx ? 'text-orange-500' : 'group-hover:text-orange-400'}`}>{item.title}</h4>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FLIGHTS VIEW - STANDARDIZED ALIGNMENT */}
        {page === 'flights' && (
          <div className="space-y-10 animate-in fade-in duration-500 pb-20 text-left">
            <h2 className="text-4xl tracking-tighter font-black uppercase text-white">AIR LOGISTICS</h2>
            <div className="space-y-12">
              {TICKETS.map((ticket, tIdx) => (
                <div key={tIdx} className="rounded-[3rem] overflow-hidden border border-white/5 bg-slate-900/30 shadow-2xl text-left">
                  <div className={`p-10 text-white flex justify-between items-center ${ticket.theme.header}`}>
                    <div className="min-w-0 text-left">
                      <p className="text-[10px] opacity-70 tracking-widest font-black uppercase">{tIdx === 0 ? 'ONWARD' : 'RETURN'}</p>
                      <h3 className="text-3xl sm:text-4xl tracking-tighter font-black uppercase text-white leading-none truncate pr-2">{ticket.airline}</h3>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[10px] opacity-70 font-black uppercase">PNR</p>
                      <h3 className="text-3xl sm:text-4xl tracking-tighter font-black text-white uppercase leading-none">{ticket.pnr}</h3>
                    </div>
                  </div>
                  <div className="p-6 sm:p-10 space-y-10 text-left">
                    <div className="space-y-4">
                      <p className="text-[10px] tracking-widest text-slate-500 font-black uppercase">PASSENGER MANIFEST</p>
                      <div className="grid grid-cols-1 gap-3">
                        {REG_DATA.pax.map((p, pIdx) => (
                          <div key={pIdx} className="bg-slate-950 p-6 rounded-[2rem] border border-white/5 flex justify-between items-center">
                            <div className="min-w-0 flex-1 text-left">
                              <p className="text-sm font-black uppercase text-white truncate pr-2">{p.name}</p>
                              <p className="text-[10px] text-slate-500 font-black uppercase mt-1">E-TKT: {tIdx === 0 ? p.etickets.indigo : p.etickets.airindia}</p>
                            </div>
                            <div className="shrink-0 text-right">
                              <p className="text-[10px] text-orange-500 font-black uppercase">{p.meal}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4 text-left">
                      <p className="text-[10px] tracking-widest text-slate-500 font-black uppercase">FLIGHT SEGMENTS</p>
                      {(ticket.legs || [ticket]).map((leg, lIdx) => (
                        <div key={lIdx} className="bg-slate-900 p-6 sm:p-8 rounded-3xl border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
                          <div className="min-w-0 flex-1 text-left">
                            <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">FLIGHT {leg.flight}</p>
                            <h4 className="text-2xl tracking-tighter font-black uppercase text-white mt-1 leading-none">{leg.from} → {leg.to}</h4>
                            <p className="text-[10px] opacity-40 mt-2 uppercase font-black text-slate-400 truncate">{leg.fromTerminal || ticket.fromTerminal}</p>
                          </div>
                          <div className="flex justify-between sm:block text-right shrink-0 border-t sm:border-t-0 border-white/5 pt-4 sm:pt-0">
                            <p className="text-2xl font-black uppercase text-white leading-none">{leg.dep} - {leg.arr}</p>
                            <p className="text-[11px] text-orange-500 font-black uppercase tracking-widest mt-2 uppercase">SCHEDULED</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-950 p-6 rounded-3xl border border-white/5 text-left">
                        <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest uppercase">CABIN</p>
                        <p className="text-xl font-black text-white uppercase mt-1">{ticket.baggage?.cabin}</p>
                      </div>
                      <div className="bg-slate-950 p-6 rounded-3xl border border-white/5 text-left">
                        <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest uppercase">CHECK-IN</p>
                        <p className="text-xl font-black text-white uppercase mt-1">{ticket.baggage?.checkin}</p>
                      </div>
                    </div>

                    <div className="space-y-4 text-left">
                      <p className="text-[10px] tracking-widest text-slate-500 font-black uppercase uppercase">LOUNGE CLEARANCE</p>
                      <div className="grid grid-cols-1 gap-4">
                        {(ticket.lounges || []).map((lounge, lIdx) => (
                          <div key={lIdx} className="bg-slate-900/50 p-6 rounded-3xl border border-white/5 shadow-lg text-left">
                            <div className="flex justify-between items-start mb-3">
                              <h5 className="text-sm font-black uppercase text-white tracking-tight pr-4">{lounge.name}</h5>
                              <span className="text-[10px] bg-orange-600 text-white px-3 py-0.5 rounded-lg font-black whitespace-nowrap">{lounge.rating} ★</span>
                            </div>
                            <p className="text-[11px] text-slate-400 mb-4 font-black uppercase">{lounge.loc}</p>
                            <div className="flex flex-wrap gap-2">
                              {lounge.facilities?.map((f, fIdx) => (
                                <span key={fIdx} className="text-[9px] border border-white/10 bg-slate-950 px-3 py-1 rounded uppercase font-black text-slate-500">{f}</span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ROUTE VIEW - MUTED NAV BUTTON */}
        {page === 'route' && (
          <div className="space-y-10 animate-in fade-in pb-20 text-left">
            <h2 className="text-4xl tracking-tighter font-black uppercase text-white">MASTER ROADMAP</h2>
            <div className="space-y-6">
              {MASTER_ROADMAP.map((leg, i) => (
                <div key={i} className="bg-slate-900/50 p-8 rounded-[3rem] border border-white/5 flex flex-col sm:flex-row gap-6 sm:gap-8 items-start shadow-xl text-left">
                  <div className="w-14 h-14 bg-orange-600 rounded-2xl flex items-center justify-center text-white flex-shrink-0 font-black text-xl shadow-lg shadow-orange-600/20">{leg.day}</div>
                  <div className="flex-1 w-full text-left">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="text-2xl tracking-tighter font-black uppercase text-white leading-tight">{leg.route}</h4>
                      <p className="text-sm text-orange-500 font-black uppercase tracking-widest whitespace-nowrap">{leg.dist}</p>
                    </div>
                    <p className="text-[11px] text-slate-500 mb-4 font-black uppercase tracking-widest uppercase">{leg.time}</p>
                    <button
                      onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(leg.start)}&destination=${encodeURIComponent(leg.end)}`)}
                      className="bg-slate-800 text-slate-300 border border-white/10 px-6 py-4 rounded-2xl text-[12px] font-black uppercase hover:bg-orange-600 hover:text-white transition-all w-full tracking-widest"
                    >
                      NAVIGATE MISSION
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* EXPLORE VIEW */}
        {page === 'explore' && (
          <div className="space-y-10 animate-in fade-in text-left">
            <h2 className="text-4xl tracking-tighter font-black uppercase text-white">LOCAL RECON</h2>
            <div className="flex flex-col gap-4">
              <input value={explore.query} onChange={e => setExplore({ ...explore, query: e.target.value })} className="bg-slate-900 border border-white/10 rounded-3xl px-8 py-6 outline-none font-black uppercase text-white text-lg focus:border-orange-600/50 transition-all shadow-inner text-left" placeholder="SECTOR (E.G. BARKOT)" />
              <button onClick={searchExplore} className="bg-orange-600 text-white px-10 py-6 rounded-3xl font-black uppercase text-lg shadow-xl active:scale-95 transition-transform tracking-widest">START RECON</button>
            </div>
            {explore.results && (
              <div className="grid gap-4">
                {explore.results.map((spot, i) => (
                  <div key={i} className="bg-slate-900 p-8 rounded-[3rem] border border-white/5 flex justify-between items-center shadow-xl">
                    <div className="pr-4 min-w-0 text-left">
                      <p className="text-[11px] text-orange-500 font-black uppercase tracking-widest">RATING: {spot.rating} ★</p>
                      <h4 className="text-2xl tracking-tighter font-black uppercase text-white mt-1 leading-tight break-words">{spot.name}</h4>
                    </div>
                    <button onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(spot.name + ' ' + explore.query)}`)} className="w-14 h-14 bg-slate-950 rounded-full flex items-center justify-center text-white border border-white/5 hover:border-orange-500/50 transition-all shadow-inner shrink-0">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><path d="M12 2v20m10-10H2" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PASS VIEW - CLEAN LEFT ALIGN */}
        {page === 'pass' && (
          <div className="max-w-md mx-auto animate-in zoom-in duration-500 space-y-6 pb-20 text-left">
            <div className="bg-slate-900 rounded-[4rem] shadow-2xl overflow-hidden border border-white/5">
              <div className="bg-slate-950 p-10 text-left text-white border-b border-white/5">
                <p className="text-[10px] opacity-30 tracking-[0.5em] mb-2 font-black uppercase">VERIFIED MISSION ID</p>
                <h2 className="text-3xl tracking-tighter font-black uppercase leading-none">PILGRIM<br />MANIFEST</h2>
              </div>
              <div className="p-8 space-y-12">
                <div className="flex justify-between items-end border-b border-white/5 pb-8 text-left">
                  <div className="text-left">
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">REGISTRATION NO</p>
                    <p className="text-3xl text-orange-500 font-black uppercase mt-1 leading-none">{REG_DATA.no}</p>
                  </div>
                  <p className="text-[11px] bg-emerald-500/10 text-emerald-500 px-4 py-1.5 rounded-full font-black uppercase tracking-widest border border-emerald-500/20 shrink-0">ACTIVE</p>
                </div>

                <div className="space-y-6 bg-slate-950 p-8 rounded-[2.5rem] border border-white/5 shadow-inner text-left">
                  <p className="text-[11px] text-slate-500 font-black uppercase tracking-widest">MISSION DETAILS</p>
                  <div className="grid grid-cols-2 gap-8">
                    <div className="text-left"><p className="text-[10px] text-slate-600 font-black uppercase">GROUP ID</p><p className="text-base font-black uppercase text-white mt-1 leading-none">{REG_DATA.groupId}</p></div>
                    <div className="text-left"><p className="text-[10px] text-slate-600 font-black uppercase uppercase">MODE</p><p className="text-base font-black text-orange-500 uppercase mt-1 leading-none uppercase">HELI</p></div>
                    <div className="col-span-2 border-t border-white/5 pt-4 text-left">
                      <p className="text-[10px] text-slate-600 font-black uppercase uppercase">EMERGENCY CONTACT</p>
                      <p className="text-base font-black uppercase text-white mt-1 leading-none">{REG_DATA.emergency.name} • {REG_DATA.emergency.phone}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-12">
                  {REG_DATA.pax.map((p, i) => (
                    <div key={i} className="space-y-6 text-left">
                      <div className="flex items-center gap-4 text-left">
                        <div className="w-10 h-10 bg-white text-slate-950 rounded-2xl flex items-center justify-center text-xs font-black uppercase shadow-lg leading-none shrink-0">{i + 1}</div>
                        <h4 className="text-2xl tracking-tighter font-black uppercase text-white leading-tight">{p.name}</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-4 pl-14 text-left">
                        <div className="bg-slate-950 p-4 rounded-2xl border border-white/5"><p className="text-[10px] text-slate-600 font-black uppercase">GENDER</p><p className="text-sm font-black uppercase text-slate-300 mt-1 leading-none">{p.gender}</p></div>
                        <div className="bg-slate-950 p-4 rounded-2xl border border-white/5"><p className="text-[10px] text-slate-600 font-black uppercase">STATUS</p><p className="text-sm font-black uppercase text-emerald-500 mt-1 leading-none">CLEARED</p></div>
                        <div className="bg-slate-950 p-4 rounded-2xl border border-white/5"><p className="text-[9px] text-slate-600 font-black uppercase">INDIGO</p><p className="text-xs font-black uppercase text-white mt-1 tracking-tighter">{p.etickets.indigo}</p></div>
                        <div className="bg-slate-950 p-4 rounded-2xl border border-white/5"><p className="text-[9px] text-slate-600 font-black uppercase">AIR INDIA</p><p className="text-xs font-black uppercase text-white mt-1 tracking-tighter">{p.etickets.airindia}</p></div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col items-center border-t border-white/5 pt-10 space-y-6">
                  <div className="w-56 h-56 bg-white rounded-[3rem] overflow-hidden p-3 border-8 border-slate-950 shadow-2xl">
                    <img src={IMAGES.qrPlaceholder} className="w-full h-full mix-blend-multiply" alt="QR" />
                  </div>
                  <p className="text-[11px] text-slate-600 tracking-[0.4em] uppercase font-black">SCAN AT CHECKPOINTS</p>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* FOOTER NAV - FULLY STABILIZED */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-900/98 backdrop-blur-3xl z-[300] border-t border-white/5 h-20 sm:h-24 pb-safe-area-inset-bottom">
        <div className="grid grid-cols-6 h-full max-w-lg mx-auto px-1">
          {['home', 'plan', 'flights', 'route', 'explore', 'pass'].map(p => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`flex flex-col items-center justify-center gap-1.5 transition-all duration-300 relative ${page === p ? 'text-orange-500' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <div className={`transition-transform duration-300 ${page === p ? 'scale-110 -translate-y-1' : 'scale-100'}`}>
                {p === 'home' && <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg>}
                {p === 'plan' && <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>}
                {p === 'flights' && <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2" /></svg>}
                {p === 'route' && <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" /></svg>}
                {p === 'explore' && <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>}
                {p === 'pass' && <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>}
              </div>
              <span className="text-[7px] font-black uppercase tracking-tighter text-center w-full truncate px-0.5">
                {p === 'pass' ? 'ID' : p.toUpperCase()}
              </span>
              {page === p && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-1 bg-orange-600 rounded-full shadow-[0_0_12px_rgba(234,88,12,1)]"></div>
              )}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}