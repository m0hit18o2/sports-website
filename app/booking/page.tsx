"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Session } from "inspector/promises";

type Slot = {
  id: number;
  court_id: number;
  date: string;
  start_time: string;
  end_time: string;
  is_booked: boolean;
  booked_by: string | null;
  phone: string | null;
  roll_no: string | null;
  user_id: string | null;
};

type Court = {
  id: number;
  name: string;
};

function formatTime(time: string) {
  const [h, m] = time.split(":");
  const hour = parseInt(h);
  const ampm = hour >= 12 ? "PM" : "AM";
  const display = hour == 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${display}:${m} ${ampm}`;
}

function todayDate() {
  return new Date().toISOString().split("T")[0];
}

export default function BookingPage() {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [courts, setCourts] = useState<Court[]>([]);
  const [selected, setSelected] = useState<Slot | null>(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [date, setDate] = useState(todayDate());
  const [user, setUser] = useState<{email?: string | undefined} | null>(null);
  const [phone, setPhone] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [viewSlot, setViewSlot] = useState<Slot | null>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  useEffect(() => {
    fetchCourts();
  }, []);

  useEffect(() => {
    fetchSlots();
  }, [date]);

  useEffect(() => {
  supabase.auth.getSession().then(({ data }) => {
    setUser(data.session?.user ?? null);
  });
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    setUser(session?.user ?? null);
  });
  return () => subscription.unsubscribe();
}, []);

  async function fetchCourts() {
    const { data } = await supabase.from("courts").select("*").order("id");
    if (data) setCourts(data);
  }

  async function fetchSlots() {
    setLoading(true);
    const { data } = await supabase
      .from("slots")
      .select("*")
      .eq("date", date)
      .order("start_time");
    if (data) setSlots(data);
    setLoading(false);
  }

  useEffect(() => {
  fetchSlots();
  const interval = setInterval(fetchSlots, 15000);
  return () => clearInterval(interval);
  }, [date]);


  async function handleBook() {
  if (!selected || !name.trim() || !phone.trim()) return;
  setBooking(true);
  const session = (await supabase.auth.getSession()).data.session;
  const { error } = await supabase
    .from("slots")
    .update({ 
      is_booked: true, 
      booked_by: name.trim(),
      phone: phone.trim(),
      roll_no: rollNo.trim(),
      user_id: session?.user.id, 
    })
    .eq("id", selected.id)
    .eq("is_booked", false);

  if (error) {
    alert("Slot just got booked by someone else, please pick another!");
  } else {
    await fetchSlots();
  }

  setSelected(null);
  setName("");
  setPhone("");
  setRollNo("");
  setBooking(false);
}

function courtName(courts: Court[], courtId: number) {
  return courts.find((c) => c.id === courtId)?.name ?? `Court ${courtId}`;
}

function isPast(date: string, startTime: string) {
  const slotDate = new Date(`${date}T${startTime}`);
  return slotDate < new Date();
}

async function cancelOwnBooking(slot: Slot) {
  await supabase
    .from("slots")
    .update({ is_booked: false, booked_by: null, phone: null, roll_no: null, user_id: null })
    .eq("id", slot.id);
  setViewSlot(null);
  fetchSlots();
}

function getSlotStyle(slot: Slot): string {
  if (isPast(date, slot.start_time)) {
    return "bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600 cursor-not-allowed";
  }
  if (slot.is_booked) {
    return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 cursor-pointer";
  }
  if (selected?.id === slot.id) {
    return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 ring-2 ring-blue-400";
  }
  return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200";
}

function handleSlotClick(slot: Slot) {
  if (slot.is_booked) {
    setViewSlot(slot);
    return;
  }
  if (!user) {
    setShowLoginPrompt(true);
    return;
  }
  setSelected(slot);
}
  const timeSlots = [...new Set(slots.map((s) => s.start_time))].sort();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6">
      <div className="max-w-3xl mx-auto">

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-zinc-800 dark:text-zinc-100">
            Court Booking
          </h1>
        </div>

        {/* Date picker */}
        <div className="flex items-center gap-3 mb-6">
          <input
            type="date"
            value={date}
            min={todayDate()}
            onChange={(e) => setDate(e.target.value)}
            onClick={(e) => (e.target as HTMLInputElement).showPicker()}
            className="text-sm font-medium text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 rounded-lg px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors bg-transparent cursor-pointer text-base"
          />
        </div>

        {loading ? (
          <p className="text-sm text-zinc-400 text-center py-12">Loading slots...</p>
        ) : slots.length === 0 ? (
          <p className="text-sm text-zinc-400 text-center py-12">
            No slots available for this date yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="w-28 p-3 text-left text-zinc-500 font-medium">Time</th>
                  {courts.map((court) => (
                    <th key={court.id} className="p-3 text-center text-zinc-700 dark:text-zinc-300 font-medium">
                      {court.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map((time) => (
                  <tr key={time} className="border-t border-zinc-200 dark:border-zinc-800">
                    <td className="p-3 text-zinc-500 text-xs">{formatTime(time)}</td>
                    {courts.map((court) => {
                      const slot = slots.find(
                        (s) => s.court_id === court.id && s.start_time === time
                      );
                      if (!slot) return <td key={court.id} className="p-2" />;

                      return (
                        <td key={court.id} className="p-2 text-center">
                          <button
                            onClick={() => handleSlotClick(slot)}
                              className={`w-full rounded-lg py-2 px-3 text-xs font-medium transition-colors ${getSlotStyle(slot)}`}
                          >
                            {slot.is_booked ? slot.booked_by ?? "Booked" : "Available"}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Legend */}
        <div className="flex gap-4 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-400" />
            <span className="text-xs text-zinc-500">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <span className="text-xs text-zinc-500">Booked</span>
          </div>
        </div>

      </div>

     {/* Login prompt modal */}
      {showLoginPrompt && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 w-80 shadow-xl">
            <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100 mb-2">
              Sign in to book
            </h2>
            <p className="text-sm text-zinc-500 mb-6">
              You need to be signed in to book a court. Use the menu to sign in with Google.
            </p>
            <button
              onClick={() => setShowLoginPrompt(false)}
              className="w-full py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-sm text-zinc-700 dark:text-zinc-300"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Booking modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 w-80 shadow-xl">
            <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100 mb-1">
              Book slot
            </h2>
            <p className="text-sm text-zinc-500 mb-4">
              {formatTime(selected.start_time)} – {formatTime(selected.end_time)} · {courtName(courts, selected.court_id)}
            </p>
            <div className="flex flex-col gap-3 mb-4">
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent text-sm text-zinc-800 dark:text-zinc-100 outline-none focus:border-blue-600 transition-colors"
              />
              <input
                type="text"
                placeholder="Roll number"
                value={rollNo}
                onChange={(e) => setRollNo(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent text-sm text-zinc-800 dark:text-zinc-100 outline-none focus:border-blue-600 transition-colors"
              />
              <input
                type="tel"
                placeholder="Phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-transparent text-sm text-zinc-800 dark:text-zinc-100 outline-none focus:border-blue-600 transition-colors"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { setSelected(null); setName(""); setPhone(""); }}
                className="flex-1 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                onClick={handleBook}
                disabled={booking || !name.trim() || !phone.trim() || !rollNo.trim()}
                className="flex-1 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {booking ? "Booking..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {viewSlot && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 w-80 shadow-xl">
            <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100 mb-1">
              Slot details
            </h2>
            <p className="text-sm text-zinc-500 mb-4">
              {formatTime(viewSlot.start_time)} – {formatTime(viewSlot.end_time)} · {courtName(courts, viewSlot.court_id)}
            </p>
            <div className="flex flex-col gap-2 mb-5">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Name</span>
                <span className="text-zinc-800 dark:text-zinc-100 font-medium">{viewSlot.booked_by}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Phone</span>
                <span className="text-zinc-800 dark:text-zinc-100 font-medium">{viewSlot.phone ?? "—"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Roll no.</span>
                <span className="text-zinc-800 dark:text-zinc-100 font-medium">{viewSlot.roll_no ?? "—"}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setViewSlot(null)}
                className="flex-1 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-sm text-zinc-700 dark:text-zinc-300"
              >
                Close
              </button>
              {user && viewSlot.user_id === (user as any).id && (
                <button
                  onClick={() => cancelOwnBooking(viewSlot)}
                  className="flex-1 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600"
                >
                  Cancel booking
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}