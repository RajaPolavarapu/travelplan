import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';
import heroImage from './assets/hero.png';
import rishikeshImage from './assets/rishikesh.jpg';
import sersiImage from './assets/sersi.jpg';
import kedarnathImage from './assets/kedarnath.webp';
import badrinathImage from './assets/badrinath.webp';
import yamunotriImage from './assets/yamunotri.jpg';
import gangotri from './assets/gangotri.webp';
import dehradunImage from './assets/dehradun.webp';
import qrPlaceholderImage from './assets/qr.png';

const apiKey = "AIzaSyDWODs0ZBtHeSDFgRWDsz1JI-OyCngoYfw";
const firebaseConfig = {
  apiKey: "AIzaSyCJh7oCKC8OAVIONKvQPm7X7BHblLW2gQk",
  authDomain: "travelplan-7a013.firebaseapp.com",
  projectId: "travelplan-7a013",
  storageBucket: "travelplan-7a013.firebasestorage.app",
  messagingSenderId: "827698727841",
  appId: "1:827698727841:web:4f8773104dd92913ed59e0",
  measurementId: "G-T14NW8C272"
};

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
    lounges: [
      { name: "ENCALM LOUNGE", loc: "HYD T1 (DEPARTURE)", rating: "4.5", facilities: ["WiFi", "Buffet", "AC", "Charging"] }
    ]
  },
  {
    airline: "AIR INDIA",
    pnr: "7RMF3R",
    route: "DED - VTZ",
    date: "28 MAY 2026",
    baggage: { cabin: "7 KGS", checkin: "15 KGS" },
    lounges: [
      { name: "BIRD LOUNGE", loc: "DED MAIN (DEP)", rating: "3.8", facilities: ["WiFi", "Comfort Seats"] },
      { name: "ENCALM T3", loc: "DEL T3 (ARR/TRANSIT)", rating: "4.3", facilities: ["Showers", "Sleep Pods"] }
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
  { day: 1, route: "DED → RISHIKESH", dist: "25 KM", time: "1.5H", detail: "Arrival and Aarti." },
  { day: 2, route: "RISHI → SERSI", dist: "200 KM", time: "8H", detail: "Mountain drive." },
  { day: 3, route: "SERSI ↔ KEDARNATH", dist: "HELI", time: "5H", detail: "Helicopter mission." },
  { day: 4, route: "SERSI → BADRINATH", dist: "190 KM", time: "8H", detail: "Joshimath route." },
  { day: 5, route: "BADRI → BARKOT", dist: "260 KM", time: "11H", detail: "Cross-valley transit." },
  { day: 6, route: "BARKOT → DED", dist: "350 KM", time: "13H", detail: "Gangotri and return." }
];

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

const SafeImage = ({ src, alt, className }) => {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  return (
    <div className={`${className} bg-gray-100 relative overflow-hidden flex items-center justify-center`}>
      {loading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="w-6 h-6 border-2 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
        </div>
      )}
      {!error ? (
        <img
          src={src}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-500 ${loading ? 'opacity-0' : 'opacity-100'}`}
          onLoad={() => setLoading(false)}
          onError={() => { setError(true); setLoading(false); }}
        />
      ) : (
        <div className="text-xs text-gray-400 uppercase font-semibold px-4 text-center">{alt}</div>
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

  const activeDay = EXPERT_ITINERARY[selectedDay] || EXPERT_ITINERARY[0];
  const appId = 'chardham-vault-2026';

  useEffect(() => {
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const initAuth = async () => {
      await signInAnonymously(auth);
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

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans pb-32">

      {/* HEADER */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur z-[200] border-b border-gray-200 px-6 py-4 flex justify-between items-center h-16">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setPage('home')}>
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 22V4M6 8C6 14 18 14 18 8M6 8V6M18 8V6M12 4V2" /></svg>
          </div>
          <span className="text-lg font-semibold text-gray-900">VAULT</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <span className="font-semibold text-orange-600">{REG_DATA.no}</span>
        </div>
      </nav>

      <main className="pt-20 px-6 max-w-3xl mx-auto space-y-6">

        {/* HOME VIEW */}
        {page === 'home' && (
          <div className="space-y-8">
            <div className="space-y-2">
              <h1 className="text-5xl font-bold text-gray-900">Sandhya & Raja</h1>
              <h2 className="text-3xl font-bold text-orange-600">Char Dham 2026</h2>
              <p className="text-sm text-gray-500">May 22 – 28, 2026</p>
            </div>

            {/* FEATURED DAY */}
            <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => setPage('plan')}>
              <div className="h-48 overflow-hidden">
                <SafeImage src={activeDay.image} alt={activeDay.title} className="w-full h-full" />
              </div>
              <div className="p-6 space-y-4">
                <div className="flex gap-3">
                  <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-lg text-sm font-semibold">Day {activeDay.day}</span>
                  <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-sm">{activeDay.date}</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{activeDay.title}</h3>
                <div className="flex gap-4 text-sm text-gray-600">
                  <span>Duration: {activeDay.dur}</span>
                  <span>Risk: <span className="font-semibold text-gray-900">{activeDay.risk}</span></span>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">{activeDay.plan}</p>
              </div>
            </div>

            {/* DAY SELECTOR */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Select Day</p>
              <div className="grid grid-cols-7 gap-2">
                {EXPERT_ITINERARY.map((day, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedDay(idx)}
                    className={`py-2 rounded-lg font-semibold text-sm transition-all ${
                      selectedDay === idx
                        ? 'bg-orange-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    {day.day}
                  </button>
                ))}
              </div>
            </div>

            {/* FLIGHTS SUMMARY */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Flights</p>
              <div className="space-y-3">
                {TICKETS.map((t, i) => (
                  <button
                    key={i}
                    onClick={() => setPage('flights')}
                    className="w-full p-4 rounded-xl border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-all text-left"
                  >
                    <p className="text-xs text-orange-600 font-semibold">{t.airline}</p>
                    <p className="text-lg font-bold text-gray-900">{t.route}</p>
                    <p className="text-sm text-gray-600 mt-1">{t.date}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PLAN VIEW */}
        {page === 'plan' && (
          <div className="space-y-8">
            <div className="flex justify-between items-end gap-4">
              <h2 className="text-3xl font-bold text-gray-900">Day Planner</h2>
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(Number(e.target.value))}
                className="px-4 py-2 rounded-lg border border-gray-300 font-semibold text-sm"
              >
                {EXPERT_ITINERARY.map((d, i) => <option key={i} value={i}>Day {d.day}</option>)}
              </select>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 space-y-6 border border-gray-200">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-500 font-semibold uppercase">Risk Level</p>
                  <p className={`text-lg font-bold mt-2 ${activeDay.risk === 'EXTREME' || activeDay.risk === 'CRITICAL' ? 'text-red-600' : 'text-gray-900'}`}>
                    {activeDay.risk}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-500 font-semibold uppercase">Duration</p>
                  <p className="text-lg font-bold mt-2 text-gray-900">{activeDay.dur}</p>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-3">
                <div className="flex justify-between items-center">
                  <p className="text-xs font-semibold text-orange-600 uppercase">Objective</p>
                  <button
                    onClick={getDayIntel}
                    disabled={loadingIntel}
                    className="text-xs bg-orange-100 text-orange-700 px-3 py-1 rounded-full font-semibold hover:bg-orange-200 transition-all"
                  >
                    {loadingIntel ? 'Loading...' : '✨ Get Intel'}
                  </button>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed italic border-l-4 border-orange-500 pl-4">"{activeDay.plan}"</p>
                {aiIntel[selectedDay] && (
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg text-sm text-gray-700 italic">
                    {aiIntel[selectedDay]}
                  </div>
                )}
              </div>

              <div className="space-y-3 border-t border-gray-200 pt-6">
                <p className="text-xs font-semibold text-gray-500 uppercase">Timeline</p>
                <div className="space-y-2">
                  {(activeDay.timeline || []).map((step, i) => {
                    const key = `d${selectedDay}-s${i}`;
                    return (
                      <div
                        key={i}
                        onClick={() => toggleTask(key)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          completedTasks[key]
                            ? 'bg-gray-100 border-gray-200 opacity-50'
                            : 'bg-white border-gray-200 hover:border-orange-300'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className={`font-semibold text-gray-900 ${completedTasks[key] ? 'line-through' : ''}`}>
                              {step.task}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">{step.time} • {step.details}</p>
                          </div>
                          <div className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 ml-3 ${
                            completedTasks[key] ? 'bg-orange-500 border-orange-500' : 'border-gray-300'
                          }`}>
                            {completedTasks[key] && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

              {/* FLIGHTS VIEW */}
        {page === 'flights' && (
          <div className="space-y-8 pb-20">
            <h2 className="text-3xl font-bold text-gray-900">Flight Details</h2>
            <div className="space-y-8">
              {TICKETS.map((ticket, tIdx) => (
                <div key={tIdx} className="rounded-2xl overflow-hidden border border-gray-200 bg-gray-50">
                  <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 flex justify-between items-center">
                    <div>
                      <p className="text-xs opacity-90">Flight</p>
                      <h3 className="text-2xl font-bold">{ticket.airline}</h3>
                    </div>
                    <div className="text-right">
                      <p className="text-xs opacity-90">PNR</p>
                      <h3 className="text-2xl font-bold">{ticket.pnr}</h3>
                    </div>
                  </div>

                  <div className="p-6 space-y-6">
                    <div className="bg-white rounded-lg p-4 border border-gray-200 space-y-3">
                      <p className="text-xs font-semibold text-gray-500 uppercase">Passengers</p>
                      {REG_DATA.pax.map((p, pIdx) => (
                        <div key={pIdx} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                          <div>
                            <p className="font-semibold text-gray-900">{p.name}</p>
                            <p className="text-xs text-gray-600">E-Ticket: {tIdx === 0 ? p.etickets.indigo : p.etickets.airindia}</p>
                          </div>
                          <p className="text-xs font-semibold text-orange-600">{p.meal}</p>
                        </div>
                      ))}
                    </div>

                    <div className="bg-white rounded-lg p-4 border border-gray-200 space-y-3">
                      <p className="text-xs font-semibold text-gray-500 uppercase">Flight Segments</p>
                      {(ticket.legs || [ticket]).map((leg, lIdx) => (
                        <div key={lIdx} className="py-3 border-b border-gray-100 last:border-0">
                          <p className="text-sm font-bold text-gray-900">{leg.flight || ticket.airline}</p>
                          <p className="text-lg font-bold text-gray-900 mt-1">{leg.from || ticket.route.split(' - ')[0]} → {leg.to || ticket.route.split(' - ')[1]}</p>
                          <p className="text-xs text-gray-600 mt-2">{leg.dep || ticket.dep} - {leg.arr || ticket.arr}</p>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <p className="text-xs text-gray-500 font-semibold uppercase">Cabin</p>
                        <p className="text-base font-bold text-gray-900 mt-2">{ticket.baggage?.cabin}</p>
                      </div>
                      <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <p className="text-xs text-gray-500 font-semibold uppercase">Check-in</p>
                        <p className="text-base font-bold text-gray-900 mt-2">{ticket.baggage?.checkin}</p>
                      </div>
                    </div>

                    {ticket.lounges && ticket.lounges.length > 0 && (
                      <div className="bg-white rounded-lg p-4 border border-gray-200 space-y-3">
                        <p className="text-xs font-semibold text-gray-500 uppercase">Lounges</p>
                        {ticket.lounges.map((lounge, lIdx) => (
                          <div key={lIdx} className="py-3 border-b border-gray-100 last:border-0">
                            <div className="flex justify-between items-start">
                              <p className="font-semibold text-gray-900">{lounge.name}</p>
                              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">{lounge.rating} ★</span>
                            </div>
                            <p className="text-xs text-gray-600 mt-1">{lounge.loc}</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {lounge.facilities?.map((f, fIdx) => (
                                <span key={fIdx} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">{f}</span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ROUTE VIEW */}
        {page === 'route' && (
          <div className="space-y-8 pb-20">
            <h2 className="text-3xl font-bold text-gray-900">Route Map</h2>
            <div className="space-y-3">
              {MASTER_ROADMAP.map((leg, i) => (
                <div key={i} className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-orange-500 text-white rounded-lg flex items-center justify-center font-bold flex-shrink-0">
                      {leg.day}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900">{leg.route}</p>
                      <div className="flex gap-4 text-xs text-gray-600 mt-1">
                        <span>{leg.dist}</span>
                        <span>•</span>
                        <span>{leg.time}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(leg.route)}`)}
                    className="w-full py-2 text-sm font-semibold rounded-lg bg-orange-100 text-orange-700 hover:bg-orange-200 transition-all"
                  >
                    View on Maps
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PASS VIEW */}
        {page === 'pass' && (
          <div className="max-w-md mx-auto pb-20">
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm space-y-6">
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6">
                <p className="text-xs opacity-90">Registration ID</p>
                <h2 className="text-2xl font-bold mt-1">Travel Pass</h2>
              </div>

              <div className="p-6 space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                  <div>
                    <p className="text-xs text-gray-600 font-semibold uppercase">Reg No.</p>
                    <p className="text-xl font-bold text-gray-900 mt-1">{REG_DATA.no}</p>
                  </div>
                  <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold">Active</span>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg space-y-3 border border-gray-200">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-600 font-semibold uppercase">Group ID</p>
                      <p className="text-base font-bold text-gray-900 mt-1">{REG_DATA.groupId}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-semibold uppercase">Mode</p>
                      <p className="text-base font-bold text-orange-600 mt-1">HELICOPTER</p>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-600 font-semibold uppercase">Emergency</p>
                    <p className="text-sm font-semibold text-gray-900 mt-1">{REG_DATA.emergency.name} • {REG_DATA.emergency.phone}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-xs font-semibold text-gray-600 uppercase">Passengers</p>
                  {REG_DATA.pax.map((p, i) => (
                    <div key={i} className="border border-gray-200 rounded-lg p-4 space-y-3">
                      <p className="font-bold text-gray-900">{p.name}</p>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-xs text-gray-600">Gender</p>
                          <p className="font-semibold text-gray-900 mt-1">{p.gender}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Status</p>
                          <p className="font-semibold text-green-600 mt-1">Cleared</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">IndiGo</p>
                          <p className="font-semibold text-gray-900 text-xs mt-1">{p.etickets.indigo}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Air India</p>
                          <p className="font-semibold text-gray-900 text-xs mt-1">{p.etickets.airindia}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col items-center pt-4 border-t border-gray-200 space-y-3">
                  <div className="w-40 h-40 bg-white rounded-lg overflow-hidden border border-gray-200 p-2">
                    <img src={IMAGES.qrPlaceholder} className="w-full h-full" alt="QR" />
                  </div>
                  <p className="text-xs text-gray-600 text-center">Scan at checkpoints</p>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* FOOTER NAV */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-[300]">
        <div className="grid grid-cols-5 h-20 max-w-2xl mx-auto">
          {[
            { id: 'home', label: 'Home', icon: 'home' },
            { id: 'plan', label: 'Plan', icon: 'plan' },
            { id: 'flights', label: 'Flights', icon: 'flights' },
            { id: 'route', label: 'Route', icon: 'route' },
            { id: 'pass', label: 'Pass', icon: 'pass' }
          ].map(btn => (
            <button
              key={btn.id}
              onClick={() => setPage(btn.id)}
              className={`flex flex-col items-center justify-center gap-1 transition-all ${
                page === btn.id ? 'text-orange-600' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {btn.id === 'home' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg>}
              {btn.id === 'plan' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /></svg>}
              {btn.id === 'flights' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2" /></svg>}
              {btn.id === 'route' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2m0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8m3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5z" /></svg>}
              {btn.id === 'pass' && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" /></svg>}
              <span className="text-xs font-semibold">{btn.label}</span>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}