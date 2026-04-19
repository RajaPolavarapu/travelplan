import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot, collection } from 'firebase/firestore';

// --- VERIFIED ASSETS ---
const IMAGES = {
  hero: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1200&auto=format&fit=crop",
  rishikesh: "https://images.unsplash.com/photo-1598375607441-8240a8246572?q=80&w=1000&auto=format&fit=crop",
  sersi: "https://images.unsplash.com/photo-1591123120675-6f7f1aae0e5b?q=80&w=1000&auto=format&fit=crop",
  kedarnath: "https://images.unsplash.com/photo-1624365738600-093a64939228?q=80&w=1000&auto=format&fit=crop",
  badrinath: "https://images.unsplash.com/photo-1621508651038-f9479ca4658a?q=80&w=1000&auto=format&fit=crop",
  yamunotri: "https://images.unsplash.com/photo-1617833075249-1660f7858c70?q=80&w=1000&auto=format&fit=crop",
  gangotri: "https://images.unsplash.com/photo-1617653202545-931490e8d7e7?q=80&w=1000&auto=format&fit=crop",
  dehradun: "https://images.unsplash.com/photo-1586227740560-8cf2732c1531?q=80&w=1000&auto=format&fit=crop",
  qrPlaceholder: "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=652173010478"
};

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
    theme: { bg: "bg-indigo-50/70", border: "border-indigo-600/10", text: "text-indigo-900", accent: "text-indigo-600", header: "bg-indigo-600" },
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
    theme: { bg: "bg-red-50/70", border: "border-red-600/10", text: "text-red-900", accent: "text-red-600", header: "bg-red-600" },
    lounges: [
      { name: "BIRD LOUNGE", loc: "DED MAIN (DEP)", rating: "3.8", facilities: ["WiFi", "Comfort Seats", "Gourmet Snacks"] },
      { name: "ENCALM T3", loc: "DEL T3 (ARR/TRANSIT)", rating: "4.3", facilities: ["Showers", "Sleep Pods", "Full Buffet", "Bar"] },
      { name: "ENCALM T2", loc: "DEL T2 (DEP)", rating: "4.0", facilities: ["WiFi", "Hot Meals", "AC"] }
    ],
    legs: [
      { flight: "AI 2908", from: "DED", to: "DEL", dep: "13:30", arr: "14:30", fromTerminal: "JOLLY GRANT AIRPORT", toTerminal: "DEL TERMINAL 3" },
      { flight: "AI 1702", from: "DEL", to: "VTZ", dep: "18:30", arr: "20:50", fromTerminal: "DEL TERMINAL 2", toTerminal: "VTZ INTERNATIONAL" }
    ]
  }
];

const EXPERT_ITINERARY = [
  { day: 1, date: "22 MAY", title: "ARRIVAL & RISHIKESH", image: IMAGES.rishikesh, risk: "LOW", dur: "1.5–2H DRIVE", dham: "NONE", plan: "Arrival at 12:50 PM. Direct transfer to Rishikesh. Attend the evening Ganga Aarti at Triveni Ghat.", timeline: [{ time: "12:50", task: "LAND AT DEHRADUN", details: "COLLECT BAGS" }, { time: "14:30", task: "TAXI TO RISHIKESH", details: "PREPAID COUNTER" }, { time: "18:00", task: "GANGA AARTI", details: "TRIVENI GHAT" }] },
  { day: 2, date: "23 MAY", title: "TRANSIT TO SERSI", image: IMAGES.sersi, risk: "MODERATE", dur: "7–9H DRIVE", dham: "NONE", plan: "Mountain drive via Devprayag and Rudraprayag. Reach Sersi base station.", timeline: [{ time: "06:00", task: "DEPART RISHIKESH", details: "MOUNTAIN DRIVE" }, { time: "10:00", task: "DEVPRAYAG STOP", details: "SANGAM VIEW" }, { time: "18:00", task: "REACH SERSI BASE", details: "HELI BRIEFING" }] },
  { day: 3, date: "24 MAY", title: "KEDARNATH DHAM", image: IMAGES.kedarnath, risk: "EXTREME", dur: "4–6H TRANSIT", dham: "KEDARNATH", plan: "Early morning helicopter from Sersi to Kedarnath. Complete Darshan and Pooja at the main shrine.", timeline: [{ time: "06:00", task: "HELI BOARDING", details: "SERSI SECTOR" }, { time: "09:00", task: "MAIN DARSHAN", details: "LORD SHIVA POOJA" }, { time: "14:30", task: "RETURN TO SERSI", details: "REST & RECOVERY" }] },
  { day: 4, date: "25 MAY", title: "BADRINATH DHAM", image: IMAGES.badrinath, risk: "MODERATE", dur: "7–9H DRIVE", dham: "BADRINATH", plan: "Drive via Joshimath. Evening Darshan at Badrinath Temple. Visit Tapt Kund and Mana Village.", timeline: [{ time: "07:00", task: "DEPART SERSI", details: "JOSHIMATH ROUTE" }, { time: "15:00", task: "BADRINATH DARSHAN", details: "EVENING PRAYERS" }, { time: "17:30", task: "MANA VILLAGE", details: "LAST VILLAGE" }] },
  { day: 5, date: "26 MAY", title: "YAMUNOTRI MISSION", image: IMAGES.yamunotri, risk: "CRITICAL", dur: "10–12H DRIVE", dham: "YAMUNOTRI", plan: "Longest day. Very early departure (3 AM) to cross to the Yamunotri side. Trek from Janki Chatti.", timeline: [{ time: "03:00", task: "CRITICAL START", details: "CROSS-VALLEY TRANSIT" }, { time: "15:00", task: "YAMUNOTRI TREK", details: "FROM JANKICHATTI" }, { time: "19:00", task: "REACH BARKOT", details: "STAY AT BASE" }] },
  { day: 6, date: "27 MAY", title: "GANGOTRI RETURN", image: IMAGES.gangotri, risk: "HIGH", dur: "12–14H TOTAL", dham: "GANGOTRI", plan: "Final Dham. Perform Darshan at Bhagirathi bank. Immediate long-distance return drive to Dehradun.", timeline: [{ time: "04:30", task: "DEPART FOR GANGOTRI", details: "SHRINE DARSHAN" }, { time: "14:00", task: "GRAND RETURN DRIVE", details: "DEHRADUN BOUND" }, { time: "22:30", task: "REACH DEHRADUN CITY", details: "NEAR AIRPORT SECURE" }] },
  { day: 7, date: "28 MAY", title: "HOME DEPARTURE", image: IMAGES.dehradun, risk: "LOW", dur: "FLIGHT", dham: "NONE", plan: "Leisure breakfast. Final check of documents. Reach airport by 10:30 AM for VTZ flight.", timeline: [{ time: "10:30", task: "REACH AIRPORT", details: "DED TERMINAL" }, { time: "13:30", task: "FLIGHT AI 2908", details: "VTZ BOUND" }] }
];

const MASTER_ROADMAP = [
  { day: 1, route: "DED AIRPORT → RISHIKESH", dist: "20-25 KM", time: "1.5 HOURS", detail: "Arrival at DED. Direct transfer to Rishikesh for evening Ganga Aarti.", stayLoc: "Rishikesh", start: "Jolly Grant Airport", end: "Triveni Ghat, Rishikesh" },
  { day: 2, route: "RISHIKESH → SERSI", dist: "190-200 KM", time: "7–9 HOURS", detail: "Scenic mountain drive via Devprayag and Rudraprayag.", stayLoc: "Sersi", start: "Rishikesh", end: "Sersi, Uttarakhand" },
  { day: 3, route: "SERSI → KEDARNATH → SERSI", dist: "7 MIN HELI", time: "HALF DAY", detail: "Helicopter to Kedarnath. Complete Darshan and return to Sersi.", stayLoc: "Sersi", start: "Sersi Heliport", end: "Kedarnath Temple" },
  { day: 4, route: "SERSI → BADRINATH", dist: "180-190 KM", time: "7–9 HOURS", detail: "Drive via Ukhimath and Joshimath. Evening Darshan at Badrinath Temple.", stayLoc: "Badrinath", start: "Sersi, Uttarakhand", end: "Badrinath Temple" },
  { day: 5, route: "BADRINATH → YAMUNOTRI → BARKOT", dist: "240-260 KM", time: "10–12 HOURS", detail: "Drive to Janki Chatti, trek to Yamunotri, descend to Barkot.", stayLoc: "Barkot", start: "Badrinath Temple", end: "Barkot, Uttarakhand" },
  { day: 6, route: "BARKOT → GANGOTRI → DEHRADUN", dist: "350+ KM", time: "12–14 HOURS", detail: "Drive to Gangotri for Darshan, then return to Dehradun.", stayLoc: "Dehradun", start: "Barkot, Uttarakhand", end: "Dehradun, Uttarakhand" },
  { day: 7, route: "DEHRADUN → DED AIRPORT", dist: "25-30 KM", time: "1 HOUR", detail: "Reach Jolly Grant Airport by 10:30 AM for VTZ flight.", stayLoc: "Dehradun", start: "Dehradun, Uttarakhand", end: "Jolly Grant Airport" }
];

// --- GEMINI API ---
const callGeminiAPI = async (prompt, systemInstruction = "", isJson = false) => {
  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    systemInstruction: { parts: [{ text: systemInstruction }] }
  };
  if (isJson) payload.generationConfig = { responseMimeType: "application/json" };

  const delays = [1000, 2000, 4000, 8000, 16000];
  for (let i = 0; i < 5; i++) {
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
      if (i === 4) return null;
      await new Promise(r => setTimeout(r, delays[i]));
    }
  }
};

// --- HELPERS ---
const SafeImage = ({ src, alt, className }) => {
  const [error, setError] = useState(false);
  return (
    <div className={`${className} bg-slate-900 relative overflow-hidden flex items-center justify-center`}>
      {!error ? <img src={src} alt={alt} className="w-full h-full object-cover" onError={() => setError(true)} /> :
        <div className="text-[10px] text-white/20 uppercase font-black px-4 text-center">{alt}</div>}
    </div>
  );
};

const LoadingPulse = () => <div className="flex gap-1"><div className="w-1.5 h-1.5 bg-orange-600 rounded-full animate-bounce"></div><div className="w-1.5 h-1.5 bg-orange-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div><div className="w-1.5 h-1.5 bg-orange-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div></div>;

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
  }, [user]);

  const saveProgress = async (payload) => {
    if (!user) return;
    const db = getFirestore();
    await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'vault', 'data'), payload, { merge: true });
  };

  // --- ACTIONS ---
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
    <div className="min-h-screen bg-[#FBF9F7] text-slate-900 font-sans uppercase font-black selection:bg-orange-100 pb-32">

      {/* HEADER */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-xl z-50 border-b border-slate-100 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setPage('home')}>
          <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center text-white">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 22V4M6 8C6 14 18 14 18 8M6 8V6M18 8V6M12 4V2" /></svg>
          </div>
          <span className="text-xl tracking-tighter text-slate-900">VAULT</span>
        </div>
        <div className="flex gap-4 text-[9px] text-slate-400 font-black">
          <span className="text-orange-600">MISSION: {REG_DATA.no}</span>
          <span>{user?.uid?.slice(0, 6) || '---'}</span>
        </div>
      </nav>

      <main className="pt-24 max-w-4xl mx-auto px-4">

        {/* HOME VIEW */}
        {page === 'home' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="space-y-2 text-center md:text-left">
              <h1 className="text-7xl font-black leading-[0.85] tracking-tighter text-slate-900 uppercase">CHARDHAM<br /><span className="text-orange-600">MISSION 2026</span></h1>
              <p className="text-[10px] text-slate-400 normal-case font-medium uppercase font-black">TACTICAL PILGRIMAGE CONTROL FOR RAJA & SANDHYA RANI</p>
            </div>

            {/* ENHANCED ACTIVE SECTOR CARD */}
            <div className="relative rounded-[2.5rem] overflow-hidden aspect-[16/10] sm:aspect-video shadow-2xl cursor-pointer group" onClick={() => setPage('plan')}>
              <SafeImage src={activeDay.image} alt={activeDay.title} className="w-full h-full brightness-50 group-hover:brightness-75 transition-all duration-700 group-hover:scale-105" />

              <div className="absolute top-6 left-6 flex flex-col gap-1">
                <p className="text-[10px] opacity-70 text-white tracking-[0.3em] font-black uppercase">ACTIVE SECTOR SELECTION</p>
                <div className="flex gap-2 items-center">
                  <span className="bg-orange-600 text-white px-3 py-1 rounded-lg text-[9px] font-black uppercase">DAY {activeDay.day}</span>
                  <span className="bg-white/10 backdrop-blur text-white px-3 py-1 rounded-lg text-[9px] border border-white/20 font-black tracking-widest uppercase">{activeDay.date}</span>
                </div>
              </div>

              <div className="absolute top-6 right-6">
                <div className={`px-4 py-2 rounded-2xl border text-[9px] font-black tracking-widest shadow-xl backdrop-blur-xl ${activeDay.risk === 'EXTREME' || activeDay.risk === 'CRITICAL' ? 'bg-red-600/90 border-red-500 text-white' : 'bg-white/90 border-slate-200 text-slate-900'}`}>
                  RISK: {activeDay.risk}
                </div>
              </div>

              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10 bg-gradient-to-t from-black via-black/40 to-transparent flex flex-col justify-end gap-4 text-white">
                <div className="space-y-1">
                  <h2 className="text-4xl sm:text-6xl tracking-tighter uppercase leading-none font-black">{activeDay.title}</h2>
                  <div className="flex gap-4 items-center opacity-60 text-[10px] tracking-widest font-black uppercase">
                    <span>DUR: {activeDay.dur}</span>
                    <span className="w-1.5 h-1.5 bg-orange-600 rounded-full"></span>
                    <span>DHAM: {activeDay.dham}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 border-t border-white/10 pt-4">
                  {(activeDay.timeline || []).slice(0, 3).map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <span className="text-[9px] text-orange-400 font-black min-w-[40px] uppercase">{item.time}</span>
                      <span className="text-[10px] tracking-tight truncate font-black uppercase">{item.task}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* DAY SELECTOR QUICK ACTIONS */}
            <div className="space-y-3">
              <p className="text-[10px] tracking-widest text-slate-400 font-black uppercase">SWITCH MISSION DAY</p>
              <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
                {EXPERT_ITINERARY.map((day, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedDay(idx)}
                    className={`flex-shrink-0 px-6 py-3 rounded-2xl border-2 transition-all font-black text-[10px] uppercase ${selectedDay === idx
                        ? 'bg-orange-600 border-orange-600 text-white shadow-lg shadow-orange-100'
                        : 'bg-white border-slate-100 text-slate-400 hover:border-orange-200'
                      }`}
                  >
                    D{day.day}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs tracking-widest text-slate-400 font-black uppercase">LOGISTICS SUMMARY</h3>
              {TICKETS.map((t, i) => {
                const fromCity = (t.fromTerminal || t.legs?.[0]?.from || "").split('(')[0].trim();
                const toCity = (t.toTerminal || t.legs?.[t.legs.length - 1]?.to || "").split('(')[0].trim();
                return (
                  <div key={i} onClick={() => setPage('flights')} className={`p-6 rounded-[2rem] border ${t.theme.border} ${t.theme.bg} flex justify-between items-center cursor-pointer hover:scale-[1.01] transition-transform shadow-sm`}>
                    <div>
                      <p className={`text-[8px] ${t.theme.accent} font-black uppercase`}>{t.airline} • {t.pnr}</p>
                      <h4 className="text-2xl tracking-tighter font-black text-slate-900 uppercase">{t.route}</h4>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-slate-900 uppercase">{t.date}</p>
                      <p className="text-[8px] opacity-50 font-black uppercase text-slate-500">
                        {fromCity} → {toCity}
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
          <div className="space-y-10 animate-in slide-in-from-bottom-8 duration-500">
            {/* Header & Focus Selection */}
            <div className="flex justify-between items-end">
              <h2 className="text-4xl tracking-tighter font-black uppercase text-slate-900 leading-none uppercase">MISSION<br />PLANNER</h2>
              <select value={selectedDay} onChange={(e) => setSelectedDay(Number(e.target.value))} className="bg-orange-600 text-white px-4 py-2 rounded-full text-[10px] outline-none font-black shadow-lg uppercase">
                {EXPERT_ITINERARY.map((d, i) => <option key={i} value={i}>FOCUS: DAY {d.day}</option>)}
              </select>
            </div>

            {/* Focused Sector Details */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 space-y-6 shadow-sm">
              <div className="flex gap-2">
                <div className="flex-1 bg-slate-50 p-4 rounded-2xl flex justify-between items-center">
                  <span className="text-[8px] text-slate-400 font-black uppercase">SECTOR RISK</span>
                  <span className={`text-[10px] font-black uppercase ${activeDay.risk === 'EXTREME' || activeDay.risk === 'CRITICAL' ? 'text-red-600' : 'text-slate-900'}`}>{activeDay.risk}</span>
                </div>
                <div className="flex-1 bg-slate-50 p-4 rounded-2xl flex justify-between items-center">
                  <span className="text-[8px] text-slate-400 font-black uppercase">DUR</span>
                  <span className="text-[10px] font-black text-slate-900 uppercase">{activeDay.dur}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs text-orange-600 font-black uppercase uppercase">ACTIVE MISSION OBJECTIVE</h3>
                  <button onClick={getDayIntel} disabled={loadingIntel} className="text-[8px] bg-slate-900 text-white px-3 py-1 rounded-full font-black uppercase uppercase">
                    {loadingIntel ? 'SYNCING...' : '✨ GET AI INTEL'}
                  </button>
                </div>
                <div className="relative group">
                  <p className="text-sm normal-case font-medium text-slate-800 italic leading-relaxed uppercase border-l-4 border-orange-600 pl-4 py-1 uppercase">"{activeDay.plan}"</p>
                </div>
                {aiIntel[selectedDay] && (
                  <div className="p-5 bg-orange-50 rounded-3xl text-[10px] normal-case leading-relaxed font-bold border border-orange-100 animate-in fade-in uppercase text-slate-900 uppercase">
                    <p className="text-[8px] text-orange-400 mb-1 tracking-widest uppercase">AI TACTICAL BRIEF</p>
                    {aiIntel[selectedDay]}
                  </div>
                )}
              </div>

              <div className="space-y-2 pt-4 border-t border-slate-50">
                <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest mb-3 uppercase">MISSION TIMELINE</p>
                {(activeDay.timeline || []).map((step, i) => {
                  const key = `d${selectedDay}-s${i}`;
                  return (
                    <div key={i} onClick={() => toggleTask(key)} className={`flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${completedTasks[key] ? 'opacity-40 bg-slate-50' : 'bg-white hover:border-orange-600 group'}`}>
                      <span className="text-xs min-w-[50px] opacity-60 font-black text-slate-900 uppercase uppercase">{step.time}</span>
                      <div className="flex-1">
                        <h4 className={`text-sm font-black uppercase text-slate-900 uppercase ${completedTasks[key] ? 'line-through' : ''}`}>{step.task}</h4>
                        <p className="text-[8px] text-slate-500 font-black uppercase uppercase">{step.details}</p>
                      </div>
                      <div className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-colors ${completedTasks[key] ? 'bg-orange-600 border-orange-600' : 'border-slate-200 group-hover:border-orange-300'}`}>
                        {completedTasks[key] && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4"><polyline points="20 6 9 17 4 12" /></svg>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CUMULATIVE MISSION TIMELINE CARDS */}
            <div className="space-y-6 pt-4">
              <div className="flex items-center gap-4">
                <h3 className="text-xl tracking-tighter font-black uppercase text-slate-900 uppercase">CUMULATIVE ITINERARY</h3>
                <div className="h-px bg-slate-200 flex-1"></div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {EXPERT_ITINERARY.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setSelectedDay(idx);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`relative p-4 rounded-[2.5rem] border transition-all cursor-pointer flex gap-4 items-center group overflow-hidden ${selectedDay === idx ? 'border-orange-600 bg-orange-50/20 ring-1 ring-orange-600 shadow-lg' : 'border-slate-100 bg-white shadow-sm hover:border-orange-200 hover:shadow-md'}`}
                  >
                    {selectedDay === idx && <div className="absolute left-0 top-0 bottom-0 w-2 bg-orange-600"></div>}

                    <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 border border-slate-100">
                      <SafeImage src={item.image} alt={item.title} className="w-full h-full grayscale group-hover:grayscale-0 transition-all duration-500" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-0.5">
                        <p className={`text-[8px] font-black uppercase tracking-widest uppercase ${selectedDay === idx ? 'text-orange-600' : 'text-slate-400'}`}>
                          DAY {item.day} • {item.date}
                        </p>
                        {item.dham !== 'NONE' && (
                          <span className="bg-orange-100 text-orange-700 text-[6px] px-1.5 py-0.5 rounded-full font-black uppercase uppercase">
                            {item.dham}
                          </span>
                        )}
                      </div>
                      <h4 className="text-[13px] font-black text-slate-900 truncate uppercase leading-tight group-hover:text-orange-600 transition-colors uppercase uppercase">{item.title}</h4>
                      <p className="text-[8px] text-slate-500 font-black truncate uppercase mt-1 uppercase">
                        {item.risk} RISK • {item.dur}
                      </p>
                    </div>

                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${selectedDay === idx ? 'bg-orange-600 border-orange-600 text-white' : 'border-slate-100 text-slate-300 group-hover:border-orange-600 group-hover:text-orange-600'}`}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14m-7-7l7 7-7 7" /></svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* FLIGHTS VIEW */}
        {page === 'flights' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <h2 className="text-4xl tracking-tighter font-black uppercase text-slate-900 uppercase">AIR LOGISTICS</h2>

            <div className="space-y-12">
              {TICKETS.map((ticket, tIdx) => (
                <div key={tIdx} className={`rounded-[3rem] overflow-hidden border shadow-xl ${ticket.theme.bg} ${ticket.theme.border}`}>
                  <div className={`p-8 text-white flex justify-between items-center ${ticket.theme.header}`}>
                    <div>
                      <p className="text-[10px] opacity-70 tracking-widest font-black uppercase uppercase">{tIdx === 0 ? 'ONWARD MISSION' : 'RETURN MISSION'}</p>
                      <h3 className="text-3xl tracking-tighter font-black uppercase text-slate-900 uppercase text-white">{ticket.airline}</h3>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] opacity-70 font-black uppercase uppercase">PNR STATUS</p>
                      <h3 className="text-3xl tracking-tighter font-black uppercase text-slate-900 uppercase text-white">{ticket.pnr}</h3>
                    </div>
                  </div>

                  <div className="p-8 space-y-8">
                    {/* Passenger Manifest */}
                    <div className="space-y-3">
                      <p className="text-[10px] tracking-widest text-slate-500 font-black uppercase uppercase">PASSENGER MANIFEST</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {REG_DATA.pax.map((p, pIdx) => (
                          <div key={pIdx} className="bg-white/50 backdrop-blur p-4 rounded-2xl border border-black/5 flex justify-between items-center">
                            <div>
                              <p className="text-[10px] font-black uppercase text-slate-900 uppercase">{p.name}</p>
                              <p className="text-[8px] text-slate-500 font-black uppercase uppercase">
                                E-TKT: {tIdx === 0 ? p.etickets.indigo : p.etickets.airindia}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-[8px] text-orange-600 font-black uppercase uppercase">{p.meal}</p>
                              <p className="text-[7px] text-slate-400 font-black uppercase uppercase">VERIFIED</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Legs */}
                    <div className="space-y-4">
                      <p className="text-[10px] tracking-widest text-slate-500 font-black uppercase uppercase">FLIGHT SEGMENTS</p>
                      {ticket.legs ? (
                        ticket.legs.map((leg, lIdx) => (
                          <div key={lIdx} className="bg-white/30 p-6 rounded-2xl border border-black/5 flex justify-between items-center">
                            <div>
                              <p className="text-[8px] text-slate-500 uppercase font-black uppercase">FLIGHT {leg.flight}</p>
                              <h4 className="text-xl tracking-tighter font-black uppercase text-slate-900 uppercase">{leg.from} → {leg.to}</h4>
                              <p className="text-[8px] opacity-60 mt-1 uppercase font-black text-slate-500 uppercase">{leg.fromTerminal} TO {leg.toTerminal}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] font-black uppercase text-slate-900 uppercase">{leg.dep} - {leg.arr}</p>
                              <p className="text-[8px] text-slate-400 font-black uppercase uppercase">SCHEDULED</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="bg-white/30 p-6 rounded-2xl border border-black/5 flex justify-between items-center">
                          <div>
                            <p className="text-[8px] text-slate-500 uppercase font-black uppercase">FLIGHT {ticket.flight}</p>
                            <h4 className="text-xl tracking-tighter font-black uppercase text-slate-900 uppercase">{ticket.route}</h4>
                            <p className="text-[8px] opacity-60 mt-1 uppercase font-black text-slate-500 uppercase">{(ticket.fromTerminal || '---')} TO {(ticket.toTerminal || '---')}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] font-black uppercase text-slate-900 uppercase">{ticket.dep} - {ticket.arr}</p>
                            <p className="text-[8px] text-slate-400 font-black uppercase uppercase">NON-STOP</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Baggage Info */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/40 p-4 rounded-2xl border border-black/5">
                        <p className="text-[8px] text-slate-500 font-black uppercase uppercase">CABIN BAGGAGE</p>
                        <p className="text-[11px] font-black text-slate-900 uppercase uppercase">{ticket.baggage?.cabin || '7 KGS'} / PAX</p>
                      </div>
                      <div className="bg-white/40 p-4 rounded-2xl border border-black/5">
                        <p className="text-[8px] text-slate-500 font-black uppercase uppercase">CHECK-IN BAGGAGE</p>
                        <p className="text-[11px] font-black text-slate-900 uppercase uppercase">{ticket.baggage?.checkin || '15 KGS'} / PAX</p>
                      </div>
                    </div>

                    {/* Lounges */}
                    <div className="space-y-3">
                      <p className="text-[10px] tracking-widest text-slate-500 font-black uppercase uppercase">LOUNGE CLEARANCE</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {(ticket.lounges || []).map((lounge, lIdx) => (
                          <div key={lIdx} className="bg-white p-5 rounded-2xl border border-black/5 shadow-sm">
                            <div className="flex justify-between items-start mb-2">
                              <h5 className="text-[11px] font-black uppercase text-slate-900 uppercase">{lounge.name}</h5>
                              <span className="text-[8px] bg-orange-100 text-orange-600 px-2 py-0.5 rounded-md font-black uppercase">{lounge.rating} ★</span>
                            </div>
                            <p className="text-[9px] text-slate-500 mb-3 font-black uppercase uppercase">{lounge.loc}</p>
                            <div className="flex flex-wrap gap-1">
                              {lounge.facilities?.map((f, fIdx) => (
                                <span key={fIdx} className="text-[7px] border border-slate-200 px-1.5 py-0.5 rounded uppercase font-black text-slate-500 uppercase">{f}</span>
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

        {/* ROUTE VIEW */}
        {page === 'route' && (
          <div className="space-y-8 animate-in fade-in">
            <h2 className="text-4xl tracking-tighter font-black uppercase text-slate-900 uppercase">MASTER ROADMAP</h2>
            <div className="space-y-4">
              {MASTER_ROADMAP.map((leg, i) => (
                <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 flex gap-6 items-start shadow-sm">
                  <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center text-white flex-shrink-0 font-black uppercase uppercase">{leg.day}</div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="text-xl tracking-tighter font-black uppercase text-slate-900 uppercase uppercase">{leg.route}</h4>
                      <p className="text-[10px] text-orange-600 font-black uppercase uppercase">{leg.dist}</p>
                    </div>
                    <p className="text-[9px] text-slate-500 mb-2 font-black uppercase uppercase">{leg.time}</p>
                    <p className="text-[10px] normal-case text-slate-600 mb-4 font-black uppercase uppercase">"{leg.detail}"</p>
                    <button onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(leg.start)}&destination=${encodeURIComponent(leg.end)}`)} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-[9px] tracking-widest font-black uppercase uppercase">OPEN DIRECTIONS</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* EXPLORE VIEW */}
        {page === 'explore' && (
          <div className="space-y-8 animate-in fade-in">
            <h2 className="text-4xl tracking-tighter font-black uppercase text-slate-900 uppercase">LOCAL RECON</h2>
            <div className="flex gap-2">
              <input value={explore.query} onChange={e => setExplore({ ...explore, query: e.target.value })} className="flex-1 bg-white border border-slate-100 rounded-2xl px-6 py-4 outline-none font-black uppercase text-slate-900 uppercase" placeholder="SEARCH SECTOR (E.G. BARKOT)..." />
              <button onClick={searchExplore} className="bg-orange-600 text-white px-8 rounded-2xl font-black uppercase uppercase">
                {explore.loading ? <LoadingPulse /> : 'GO'}
              </button>
            </div>

            {explore.results && (
              <div className="grid gap-4">
                {explore.results.map((spot, i) => (
                  <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-100 flex justify-between items-center shadow-sm">
                    <div>
                      <p className="text-[9px] text-orange-600 font-black uppercase uppercase">RATING: {spot.rating} ★</p>
                      <h4 className="text-xl tracking-tighter font-black uppercase text-slate-900 uppercase">{spot.name}</h4>
                      <p className="text-[10px] normal-case text-slate-500 mt-1 font-black uppercase uppercase">{spot.desc}</p>
                    </div>
                    <button onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(spot.name + ' ' + explore.query)}`)} className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center text-white">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 2v20m10-10H2" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PASS VIEW */}
        {page === 'pass' && (
          <div className="max-w-md mx-auto animate-in zoom-in duration-500 space-y-6">
            <div className="bg-white rounded-[3.5rem] shadow-2xl overflow-hidden border border-orange-100">
              <div className="bg-slate-950 p-8 text-center text-white">
                <p className="text-[8px] opacity-50 tracking-[0.5em] mb-1 font-black uppercase uppercase">VERIFIED MISSION ID</p>
                <h2 className="text-2xl tracking-tighter font-black uppercase uppercase">PILGRIM MANIFEST</h2>
              </div>

              <div className="p-8 space-y-10">
                <div className="flex justify-between items-end border-b border-slate-100 pb-6">
                  <div>
                    <p className="text-[8px] text-slate-400 font-black uppercase uppercase">REGISTRATION NO</p>
                    <p className="text-2xl text-orange-600 tracking-tighter font-black uppercase uppercase">{REG_DATA.no}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] text-slate-400 uppercase font-black uppercase">STATUS</p>
                    <p className="text-[10px] bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-black uppercase uppercase">ACTIVE</p>
                  </div>
                </div>

                <div className="space-y-4 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                  <p className="text-[8px] text-slate-400 font-black uppercase tracking-widest uppercase">REGISTRATION DETAILS</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[7px] text-slate-400 font-black uppercase uppercase">GROUP ID</p>
                      <p className="text-[10px] font-black uppercase text-slate-900 uppercase">{REG_DATA.groupId}</p>
                    </div>
                    <div>
                      <p className="text-[7px] text-slate-400 font-black uppercase uppercase">TRAVEL MODE</p>
                      <p className="text-[10px] font-black text-orange-600 uppercase uppercase">{REG_DATA.travelMode}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-[7px] text-slate-400 font-black uppercase uppercase">EMERGENCY CONTACT</p>
                      <p className="text-[10px] font-black uppercase text-slate-900 uppercase">{REG_DATA.emergency.name} ({REG_DATA.emergency.relation})</p>
                      <p className="text-[10px] font-black uppercase text-slate-900 uppercase">{REG_DATA.emergency.phone}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  {REG_DATA.pax.map((p, i) => (
                    <div key={i} className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center text-[10px] font-black uppercase uppercase">{i + 1}</div>
                        <h4 className="text-xl tracking-tighter font-black uppercase text-slate-900 uppercase">{p.name}</h4>
                      </div>

                      <div className="grid grid-cols-2 gap-4 pl-11">
                        <div>
                          <p className="text-[8px] text-slate-400 font-black uppercase uppercase">ID: {p.idType}</p>
                          <p className="text-[10px] tracking-widest font-black uppercase text-slate-900 uppercase">{p.idNo}</p>
                        </div>
                        <div>
                          <p className="text-[8px] text-slate-400 font-black uppercase uppercase">GENDER</p>
                          <p className="text-[10px] tracking-widest font-black uppercase text-slate-900 uppercase">{p.gender}</p>
                        </div>
                        <div className="bg-white border border-slate-100 p-2 rounded-xl">
                          <p className="text-[7px] text-slate-400 font-black uppercase uppercase">INDIGO E-TKT</p>
                          <p className="text-[10px] font-black uppercase text-slate-900 uppercase">{p.etickets?.indigo || '---'}</p>
                        </div>
                        <div className="bg-white border border-slate-100 p-2 rounded-xl">
                          <p className="text-[7px] text-slate-400 font-black uppercase uppercase">AIR INDIA E-TKT</p>
                          <p className="text-[10px] font-black uppercase text-slate-900 uppercase">{p.etickets?.airindia || '---'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-orange-50/50 p-6 rounded-[2rem] border border-orange-100">
                  <p className="text-[8px] text-orange-400 tracking-[0.3em] mb-3 uppercase font-black uppercase">DHAM ENTRY WINDOWS</p>
                  <div className="grid grid-cols-1 gap-2">
                    {Object.entries(REG_DATA.dates).map(([d, date]) => (
                      <div key={d} className="flex justify-between items-center border-b border-orange-100/50 py-1.5 last:border-0 font-black text-slate-900 uppercase">
                        <span className="text-[9px] opacity-60 uppercase">{d}</span>
                        <span className="text-[11px] font-black uppercase uppercase">{date}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col items-center border-t border-slate-100 pt-8 space-y-4 font-black">
                  <div className="w-48 h-48 bg-slate-50 rounded-3xl overflow-hidden p-2 border-4 border-white shadow-inner">
                    <img src={IMAGES.qrPlaceholder} className="w-full h-full mix-blend-multiply" alt="QR" />
                  </div>
                  <p className="text-[7px] text-slate-400 tracking-widest uppercase font-black uppercase">SCAN AT CHECKPOINTS</p>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* FOOTER NAV */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-lg bg-slate-950/95 backdrop-blur-2xl p-1.5 rounded-full shadow-2xl flex justify-between items-center z-[100] border border-white/10 font-black">
        {['home', 'plan', 'flights', 'route', 'explore', 'pass'].map(p => (
          <button key={p} onClick={() => setPage(p)} className={`flex-1 py-3.5 rounded-full text-[7px] tracking-widest transition-all uppercase font-black ${page === p ? 'bg-orange-600 text-white' : 'text-slate-500'}`}>
            {p === 'pass' ? 'ID' : p.toUpperCase()}
          </button>
        ))}
      </div>

    </div>
  );
}