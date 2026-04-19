import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot, collection } from 'firebase/firestore';


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
  { day: 1, route: "DED → RISHIKESH", dist: "25 KM", time: "1.5H", detail: "Arrival and Ganga Aarti.", start: "Jolly Grant", end: "Triveni Ghat" },
  { day: 2, route: "RISHI → SERSI", dist: "200 KM", time: "8H", detail: "Scenic mountain drive.", start: "Rishikesh", end: "Sersi" },
  { day: 3, route: "SERSI ↔ KEDAR", dist: "HELI", time: "5H", detail: "Shiva Temple mission.", start: "Sersi", end: "Kedarnath" },
  { day: 4, route: "SERSI → BADRI", dist: "190 KM", time: "8H", detail: "Vishnu Temple darshan.", start: "Sersi", end: "Badrinath" },
  { day: 5, route: "BADRI → BARKOT", dist: "260 KM", time: "11H", detail: "Yamuna valley transit.", start: "Badrinath", end: "Barkot" },
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
  return (
    <div className={`${className} bg-slate-900 relative overflow-hidden flex items-center justify-center`}>
      {!error ? <img src={src} alt={alt} className="w-full h-full object-cover" onError={() => setError(true)} /> :
        <div className="text-[10px] text-white/20 uppercase font-black px-4 text-center">{alt}</div>}
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
    const res = await callGeminiAPI(`Tactical briefing for: ${activeDay.title}. Plan: ${activeDay.plan}. 2 sentences: 1 spiritual, 1 survival.`, "Tactical Guide.");
    if (res) setAiIntel(p => ({ ...p, [selectedDay]: res }));
    setLoadingIntel(false);
  };

  const searchExplore = async () => {
    if (!explore.query) return;
    setExplore(p => ({ ...p, loading: true }));
    const res = await callGeminiAPI(`Spots in ${explore.query}. JSON: {"spots": [{"name": "", "rating": "", "desc": ""}]}`, "Concierge", true);
    setExplore(p => ({ ...p, results: res?.spots || [], loading: false }));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans uppercase font-black selection:bg-orange-600/30 pb-40 transition-colors duration-500 overflow-x-hidden">

      {/* HEADER */}
      <nav className="fixed top-0 w-full bg-slate-900/90 backdrop-blur-xl z-[150] border-b border-white/5 px-4 py-3 flex justify-between items-center h-16">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setPage('home')}>
          <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center text-white shadow-lg">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 22V4M6 8C6 14 18 14 18 8M6 8V6M18 8V6M12 4V2" /></svg>
          </div>
          <span className="text-lg tracking-tighter text-white">VAULT</span>
        </div>
        <div className="flex flex-col items-end text-[8px] text-slate-500 font-black">
          <span className="text-orange-500">MISSION: {REG_DATA.no}</span>
          <span className="opacity-50">{user?.uid?.slice(0, 6) || 'SECURE'}</span>
        </div>
      </nav>

      <main className="pt-20 px-4 max-w-4xl mx-auto space-y-8">

        {/* HOME VIEW */}
        {page === 'home' && (
          <div className="space-y-10 animate-in fade-in duration-500">
            <div className="space-y-2 text-center md:text-left">
              <h1 className="text-4xl sm:text-7xl font-black leading-[0.85] tracking-tighter text-white uppercase">CHARDHAM<br /><span className="text-orange-600">MISSION 2026</span></h1>
              <p className="text-[10px] text-slate-500 normal-case font-medium uppercase font-black tracking-widest">TACTICAL PILGRIMAGE CONTROL • RAJA & SANDHYA RANI</p>
            </div>

            {/* SECTOR CARD */}
            <div className="relative rounded-[2rem] overflow-hidden aspect-[16/10] sm:aspect-video shadow-2xl border border-white/5 group" onClick={() => setPage('plan')}>
              <SafeImage src={activeDay.image} alt={activeDay.title} className="w-full h-full brightness-[0.35] group-hover:brightness-50 transition-all duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex flex-col justify-end p-6 sm:p-10 text-white">
                <div className="absolute top-6 left-6 flex flex-col gap-1">
                  <p className="text-[10px] opacity-50 text-white tracking-[0.3em] font-black uppercase">ACTIVE SECTOR</p>
                  <div className="flex gap-2 items-center">
                    <span className="bg-orange-600 text-white px-3 py-1 rounded-lg text-[9px] font-black uppercase shadow-lg shadow-orange-600/20">DAY {activeDay.day}</span>
                    <span className="bg-white/10 backdrop-blur text-white px-3 py-1 rounded-lg text-[9px] border border-white/20 font-black tracking-widest uppercase">{activeDay.date}</span>
                  </div>
                </div>

                <div className="absolute top-6 right-6">
                  <div className={`px-4 py-2 rounded-2xl border text-[9px] font-black tracking-widest shadow-xl backdrop-blur-xl ${activeDay.risk === 'EXTREME' || activeDay.risk === 'CRITICAL' ? 'bg-red-600/80 border-red-500/50 text-white' : 'bg-slate-800/80 border-white/10 text-slate-100'}`}>
                    RISK: {activeDay.risk}
                  </div>
                </div>

                <div className="space-y-1">
                  <h2 className="text-3xl sm:text-6xl tracking-tighter uppercase leading-none font-black">{activeDay.title}</h2>
                  <div className="flex gap-4 items-center opacity-60 text-[10px] tracking-widest font-black uppercase">
                    <span>DUR: {activeDay.dur}</span>
                    <span className="w-1.5 h-1.5 bg-orange-600 rounded-full shadow-[0_0_8px_rgba(234,88,12,0.8)]"></span>
                    <span>DHAM: {activeDay.dham}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 border-t border-white/10 pt-4 mt-4">
                  {(activeDay.timeline || []).slice(0, 3).map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <span className="text-[9px] text-orange-500 font-black min-w-[40px] uppercase">{item.time}</span>
                      <span className="text-[10px] tracking-tight truncate font-black uppercase text-white">{item.task}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* DAY SELECTOR QUICK ACTIONS */}
            <div className="space-y-4">
              <p className="text-[10px] tracking-widest text-slate-500 font-black uppercase">SWITCH MISSION DAY</p>
              <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar -mx-2 px-2 snap-x">
                {EXPERT_ITINERARY.map((day, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedDay(idx)}
                    className={`flex-shrink-0 w-14 h-14 rounded-2xl border-2 transition-all font-black text-[12px] snap-center flex items-center justify-center ${selectedDay === idx
                        ? 'bg-orange-600 border-orange-600 text-white shadow-xl shadow-orange-600/20 ring-4 ring-orange-600/10'
                        : 'bg-slate-900 border-white/5 text-slate-500 hover:border-white/10 hover:text-slate-300'
                      }`}
                  >
                    D{day.day}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs tracking-widest text-slate-500 font-black uppercase">LOGISTICS SUMMARY</h3>
              {TICKETS.map((t, i) => {
                const fromCity = (t.fromTerminal || t.legs?.[0]?.from || "").split('(')[0].trim();
                const toCity = (t.toTerminal || t.legs?.[t.legs.length - 1]?.to || "").split('(')[0].trim();
                return (
                  <div key={i} onClick={() => setPage('flights')} className="p-6 rounded-[2rem] border border-white/5 bg-slate-900/50 flex justify-between items-center cursor-pointer hover:bg-slate-900 transition-all shadow-sm">
                    <div className="min-w-0 flex-1">
                      <p className="text-[8px] text-orange-500 font-black tracking-widest uppercase truncate">{t.airline} • {t.pnr}</p>
                      <h4 className="text-xl sm:text-2xl tracking-tighter font-black text-white uppercase truncate">{t.route}</h4>
                    </div>
                    <div className="text-right shrink-0 pl-4">
                      <p className="text-xs font-black text-white uppercase">{t.date}</p>
                      <p className="text-[8px] opacity-50 font-black uppercase text-slate-400 mt-1">
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
            <div className="flex justify-between items-end gap-4">
              <h2 className="text-4xl tracking-tighter font-black uppercase text-white leading-none">PLANNER</h2>
              <select value={selectedDay} onChange={(e) => setSelectedDay(Number(e.target.value))} className="bg-slate-900 text-white px-5 py-3 rounded-2xl text-[11px] outline-none font-black shadow-xl border border-white/10 appearance-none uppercase">
                {EXPERT_ITINERARY.map((d, i) => <option key={i} value={i}>DAY {d.day}</option>)}
              </select>
            </div>

            {/* Focused Sector Details */}
            <div className="bg-slate-900/50 rounded-[3rem] border border-white/5 p-8 space-y-8">
              <div className="flex gap-3">
                <div className="flex-1 bg-slate-950 p-5 rounded-2xl flex justify-between items-center border border-white/5 text-center">
                  <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest">RISK</span>
                  <span className={`text-[11px] font-black uppercase ${activeDay.risk === 'EXTREME' ? 'text-red-500' : 'text-white'}`}>{activeDay.risk}</span>
                </div>
                <div className="flex-1 bg-slate-950 p-5 rounded-2xl flex justify-between items-center border border-white/5 text-center">
                  <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest">DUR</span>
                  <span className="text-[11px] font-black text-white uppercase">{activeDay.dur}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs text-orange-500 font-black uppercase">OBJECTIVE</h3>
                  <button onClick={getDayIntel} disabled={loadingIntel} className="text-[9px] bg-white text-slate-950 px-4 py-1.5 rounded-full font-black uppercase tracking-tighter hover:bg-orange-500 hover:text-white transition-all">
                    {loadingIntel ? '...' : '✨ GET AI INTEL'}
                  </button>
                </div>
                <p className="text-base normal-case font-medium text-slate-200 italic leading-relaxed border-l-4 border-orange-600 pl-6 py-2 uppercase">"{activeDay.plan}"</p>
                {aiIntel[selectedDay] && (
                  <div className="p-6 bg-orange-600/10 rounded-[2rem] text-[11px] font-bold border border-orange-600/20 animate-in fade-in text-orange-100 uppercase">
                    {aiIntel[selectedDay]}
                  </div>
                )}
              </div>

              <div className="space-y-3 pt-6 border-t border-white/5">
                <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.3em] mb-4">MISSION TIMELINE</p>
                {(activeDay.timeline || []).map((step, i) => {
                  const key = `d${selectedDay}-s${i}`;
                  return (
                    <div key={i} onClick={() => toggleTask(key)} className={`flex items-center gap-6 p-6 rounded-3xl border transition-all cursor-pointer ${completedTasks[key] ? 'opacity-30 bg-slate-950/50 border-transparent' : 'bg-slate-900 border-white/5 hover:border-orange-600/50 group shadow-lg shadow-black/20'}`}>
                      <span className="text-sm min-w-[60px] opacity-50 font-black text-slate-300 uppercase">{step.time}</span>
                      <div className="flex-1 min-w-0">
                        <h4 className={`text-lg font-black uppercase text-white truncate ${completedTasks[key] ? 'line-through decoration-orange-600' : ''}`}>{step.task}</h4>
                        <p className="text-[10px] text-slate-500 font-black uppercase mt-0.5 truncate">{step.details}</p>
                      </div>
                      <div className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-all ${completedTasks[key] ? 'bg-orange-600 border-orange-600 shadow-[0_0_15px_rgba(234,88,12,0.4)]' : 'border-white/10'}`}>
                        {completedTasks[key] && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4"><polyline points="20 6 9 17 4 12" /></svg>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CUMULATIVE CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {EXPERT_ITINERARY.map((item, idx) => (
                <div key={idx} onClick={() => { setSelectedDay(idx); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className={`p-5 rounded-[2.5rem] border transition-all cursor-pointer flex gap-4 items-center group overflow-hidden ${selectedDay === idx ? 'border-orange-600 bg-orange-600/5 shadow-2xl' : 'border-white/5 bg-slate-900 hover:border-white/20'}`}>
                  <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0">
                    <SafeImage src={item.image} alt="Sector" className={`w-full h-full transition-all duration-700 ${selectedDay === idx ? '' : 'grayscale group-hover:grayscale-0'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-[8px] font-black uppercase tracking-widest ${selectedDay === idx ? 'text-orange-500' : 'text-slate-500'}`}>DAY {item.day} • {item.date}</p>
                    <h4 className="text-sm font-black text-white truncate uppercase">{item.title}</h4>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FLIGHTS VIEW */}
        {page === 'flights' && (
          <div className="space-y-10 animate-in fade-in duration-500">
            <h2 className="text-4xl tracking-tighter font-black uppercase text-white">FLIGHTS</h2>
            <div className="space-y-12">
              {TICKETS.map((ticket, tIdx) => (
                <div key={tIdx} className="rounded-[3.5rem] overflow-hidden border border-white/5 bg-slate-900/30 shadow-2xl">
                  <div className={`p-10 text-white flex justify-between items-center ${ticket.theme.header}`}>
                    <div>
                      <p className="text-[10px] opacity-70 tracking-widest font-black uppercase">{tIdx === 0 ? 'ONWARD' : 'RETURN'}</p>
                      <h3 className="text-4xl tracking-tighter font-black uppercase text-white">{ticket.airline}</h3>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] opacity-70 font-black uppercase">PNR</p>
                      <h3 className="text-4xl tracking-tighter font-black text-white uppercase">{ticket.pnr}</h3>
                    </div>
                  </div>
                  <div className="p-6 sm:p-10 space-y-10">
                    <div className="space-y-4">
                      <p className="text-[10px] tracking-widest text-slate-500 font-black uppercase">PASSENGER MANIFEST</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {REG_DATA.pax.map((p, pIdx) => (
                          <div key={pIdx} className="bg-slate-950 p-6 rounded-[2rem] border border-white/5 flex justify-between items-center">
                            <div>
                              <p className="text-sm font-black uppercase text-white">{p.name}</p>
                              <p className="text-[10px] text-slate-500 font-black uppercase mt-1">E-TKT: {tIdx === 0 ? p.etickets.indigo : p.etickets.airindia}</p>
                            </div>
                            <p className="text-[10px] text-orange-500 font-black uppercase">{p.meal}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <p className="text-[10px] tracking-widest text-slate-500 font-black uppercase">FLIGHT SEGMENTS</p>
                      {(ticket.legs || [ticket]).map((leg, lIdx) => (
                        <div key={lIdx} className="bg-slate-900 p-8 rounded-3xl border border-white/5 flex justify-between items-center">
                          <div className="min-w-0 flex-1 pr-4">
                            <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest">FLIGHT {leg.flight}</p>
                            <h4 className="text-2xl tracking-tighter font-black uppercase text-white mt-1 truncate">{leg.from} → {leg.to}</h4>
                            <p className="text-[10px] opacity-40 mt-1 uppercase font-black text-slate-400 truncate">{leg.fromTerminal} TO {leg.toTerminal}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-xl font-black uppercase text-white">{leg.dep} - {leg.arr}</p>
                            <p className="text-[10px] text-orange-500 font-black uppercase tracking-widest mt-1">SCHEDULED</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-950 p-6 rounded-3xl border border-white/5">
                        <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">CABIN</p>
                        <p className="text-lg font-black text-white uppercase mt-1">{ticket.baggage?.cabin}</p>
                      </div>
                      <div className="bg-slate-950 p-6 rounded-3xl border border-white/5">
                        <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest">CHECK-IN</p>
                        <p className="text-lg font-black text-white uppercase mt-1">{ticket.baggage?.checkin}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <p className="text-[10px] tracking-widest text-slate-500 font-black uppercase">LOUNGE CLEARANCE</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(ticket.lounges || []).map((lounge, lIdx) => (
                          <div key={lIdx} className="bg-slate-900/50 p-6 rounded-3xl border border-white/5 shadow-lg">
                            <div className="flex justify-between items-start mb-3">
                              <h5 className="text-sm font-black uppercase text-white tracking-tight">{lounge.name}</h5>
                              <span className="text-[9px] bg-orange-600 text-white px-2 py-0.5 rounded-lg font-black">{lounge.rating} ★</span>
                            </div>
                            <p className="text-[11px] text-slate-400 mb-4 font-black uppercase">{lounge.loc}</p>
                            <div className="flex flex-wrap gap-1.5">
                              {lounge.facilities?.map((f, fIdx) => (
                                <span key={fIdx} className="text-[8px] border border-white/10 bg-white/5 px-2 py-0.5 rounded uppercase font-black text-slate-500">{f}</span>
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
          <div className="space-y-10 animate-in fade-in">
            <h2 className="text-4xl tracking-tighter font-black uppercase text-white">MASTER ROADMAP</h2>
            <div className="space-y-6">
              {MASTER_ROADMAP.map((leg, i) => (
                <div key={i} className="bg-slate-900/50 p-8 rounded-[3rem] border border-white/5 flex gap-8 items-start shadow-xl">
                  <div className="w-14 h-14 bg-orange-600 rounded-2xl flex items-center justify-center text-white flex-shrink-0 font-black text-xl shadow-lg shadow-orange-600/20">{leg.day}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="text-2xl tracking-tighter font-black uppercase text-white truncate">{leg.route}</h4>
                      <p className="text-sm text-orange-500 font-black uppercase tracking-widest whitespace-nowrap">{leg.dist}</p>
                    </div>
                    <p className="text-[11px] text-slate-500 mb-4 font-black uppercase tracking-widest">{leg.time}</p>
                    <button onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(leg.start)}&destination=${encodeURIComponent(leg.end)}`)} className="bg-white text-slate-950 px-6 py-3 rounded-xl text-[10px] tracking-widest font-black uppercase hover:bg-orange-600 hover:text-white transition-all w-full sm:w-auto">OPEN NAV SYSTEM</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* EXPLORE VIEW */}
        {page === 'explore' && (
          <div className="space-y-10 animate-in fade-in">
            <h2 className="text-4xl tracking-tighter font-black uppercase text-white">LOCAL RECON</h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <input value={explore.query} onChange={e => setExplore({ ...explore, query: e.target.value })} className="flex-1 bg-slate-900 border border-white/5 rounded-2xl px-8 py-5 outline-none font-black uppercase text-white shadow-xl focus:border-orange-600/50 transition-all" placeholder="SEARCH AREA (E.G. BARKOT)..." />
              <button onClick={searchExplore} className="bg-orange-600 text-white px-10 py-5 rounded-2xl font-black uppercase shadow-xl shadow-orange-600/20 active:scale-95 transition-transform">GO</button>
            </div>
            {explore.results && (
              <div className="grid gap-4">
                {explore.results.map((spot, i) => (
                  <div key={i} className="bg-slate-900 p-8 rounded-[3rem] border border-white/5 flex justify-between items-center shadow-xl">
                    <div className="pr-4 min-w-0">
                      <p className="text-[10px] text-orange-500 font-black uppercase tracking-widest">RATING: {spot.rating} ★</p>
                      <h4 className="text-2xl tracking-tighter font-black uppercase text-white mt-1 leading-tight">{spot.name}</h4>
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

        {/* PASS VIEW */}
        {page === 'pass' && (
          <div className="max-w-md mx-auto animate-in zoom-in duration-500 space-y-6 pb-20">
            <div className="bg-slate-900 rounded-[4rem] shadow-2xl overflow-hidden border border-white/5">
              <div className="bg-slate-950 p-10 text-center text-white border-b border-white/5">
                <p className="text-[10px] opacity-30 tracking-[0.5em] mb-2 font-black uppercase">VERIFIED MISSION ID</p>
                <h2 className="text-3xl tracking-tighter font-black uppercase">PILGRIM MANIFEST</h2>
              </div>
              <div className="p-8 space-y-12">
                <div className="flex justify-between items-end border-b border-white/5 pb-8">
                  <div>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">REGISTRATION NO</p>
                    <p className="text-3xl text-orange-500 font-black uppercase mt-1">{REG_DATA.no}</p>
                  </div>
                  <p className="text-[11px] bg-emerald-500/10 text-emerald-500 px-4 py-1.5 rounded-full font-black uppercase tracking-widest border border-emerald-500/20 shrink-0">ACTIVE</p>
                </div>

                <div className="space-y-6 bg-slate-950 p-8 rounded-[2.5rem] border border-white/5 shadow-inner">
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">DETAILS</p>
                  <div className="grid grid-cols-2 gap-6">
                    <div><p className="text-[8px] text-slate-600 font-black uppercase">GROUP ID</p><p className="text-sm font-black uppercase text-white mt-1">{REG_DATA.groupId}</p></div>
                    <div><p className="text-[8px] text-slate-600 font-black uppercase">MODE</p><p className="text-sm font-black text-orange-500 uppercase mt-1">HELI</p></div>
                    <div className="col-span-2 border-t border-white/5 pt-4"><p className="text-[8px] text-slate-600 font-black uppercase">EMERGENCY</p><p className="text-sm font-black uppercase text-white mt-1">{REG_DATA.emergency.name} • {REG_DATA.emergency.phone}</p></div>
                  </div>
                </div>

                <div className="space-y-10">
                  {REG_DATA.pax.map((p, i) => (
                    <div key={i} className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white text-slate-950 rounded-2xl flex items-center justify-center text-xs font-black uppercase shadow-lg">{i + 1}</div>
                        <h4 className="text-2xl tracking-tighter font-black uppercase text-white">{p.name}</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-6 pl-14">
                        <div><p className="text-[9px] text-slate-600 font-black uppercase tracking-widest">ID</p><p className="text-xs tracking-widest font-black uppercase text-slate-300 mt-1">{p.idNo}</p></div>
                        <div><p className="text-[9px] text-slate-600 font-black uppercase tracking-widest">GENDER</p><p className="text-xs tracking-widest font-black uppercase text-slate-300 mt-1">{p.gender}</p></div>
                        <div className="bg-slate-950 p-4 rounded-2xl border border-white/5"><p className="text-[8px] text-slate-600 font-black uppercase">INDIGO</p><p className="text-xs font-black uppercase text-white mt-1">{p.etickets.indigo}</p></div>
                        <div className="bg-slate-950 p-4 rounded-2xl border border-white/5"><p className="text-[8px] text-slate-600 font-black uppercase">AIR INDIA</p><p className="text-xs font-black uppercase text-white mt-1">{p.etickets.airindia}</p></div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col items-center border-t border-white/5 pt-10 space-y-6">
                  <div className="w-48 h-48 bg-white rounded-[2rem] overflow-hidden p-2 border-8 border-slate-950 shadow-2xl">
                    <img src={IMAGES.qrPlaceholder} className="w-full h-full mix-blend-multiply" alt="QR" />
                  </div>
                  <p className="text-[9px] text-slate-600 tracking-[0.4em] uppercase font-black">SCAN AT CHECKPOINTS</p>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* FOOTER NAV - FIXED & MOBILE OPTIMIZED */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-3xl z-[200] border-t border-white/5 h-20 sm:h-24 pb-safe-area-inset-bottom">
        <div className="grid grid-cols-6 h-full max-w-lg mx-auto px-2">
          {['home', 'plan', 'flights', 'route', 'explore', 'pass'].map(p => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`flex flex-col items-center justify-center gap-1.5 transition-all duration-300 relative ${page === p ? 'text-orange-500' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <div className={`transition-transform duration-300 ${page === p ? 'scale-110' : 'scale-100'}`}>
                {p === 'home' && <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg>}
                {p === 'plan' && <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /></svg>}
                {p === 'flights' && <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3" /></svg>}
                {p === 'route' && <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2" /></svg>}
                {p === 'explore' && <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>}
                {p === 'pass' && <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>}
              </div>
              <span className="text-[7px] font-black uppercase tracking-tighter text-center">
                {p === 'pass' ? 'ID' : p.toUpperCase()}
              </span>
              {page === p && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-1 bg-orange-600 rounded-full shadow-[0_0_8px_rgba(234,88,12,0.8)]"></div>
              )}
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}