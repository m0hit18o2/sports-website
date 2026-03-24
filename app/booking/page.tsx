"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Slot = {
  id: number;
  court_id: number;
  date: string;
  start_time: string;
  end_time: string;
  is_booked: boolean;
  booked_by: string | null;
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

  useEffect(() => {
    fetchCourts();
  }, []);

  useEffect(() => {
    fetchSlots();
  }, [date]);

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

  async function handleBook() {
    if (!selected || !name.trim()) return;
    setBooking(true);

    const { error } = await supabase
      .from("slots")
      .update({ is_booked: true, booked_by: name.trim() })
      .eq("id", selected.id)
      .eq("is_booked", false);

    if (error) {
      alert("Slot just got booked by someone else, please pick another!");
    } else {
      await fetchSlots();
    }

    setSelected(null);
    setName("");
    setBooking(false);
  }

  const timeSlots = [...new Set(slots.map((s) => s.start_time))].sort();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6">
      <div className="max-w-3xl mx-auto">

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-zinc-800 dark:text-zinc-100">
            Court Booking
          </h1>
          <div className="flex items-center gap-4">
            <Link href="/scores" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
              Scores
            </Link>
            <Link href="/" className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
              <span>🏠</span> Home
            </Link>
          </div>
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
                            onClick={() => !slot.is_booked && setSelected(slot)}
                            className={`w-full rounded-lg py-2 px-3 text-xs font-medium transition-colors
                              ${slot.is_booked
                                ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 cursor-not-allowed"
                                : selected?.id === slot.id
                                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 ring-2 ring-blue-400"
                                : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200"
                              }`}
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

      {/* Booking modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 w-80 shadow-xl">
            <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100 mb-1">
              Book slot
            </h2>
            <p className="text-sm text-zinc-500 mb-4">
              {formatTime(selected.start_time)} – {formatTime(selected.end_time)} · Court {selected.court_id}
            </p>
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleBook()}
              className="input mb-4"
            />
            <div className="flex gap-2">
              <button
                onClick={() => { setSelected(null); setName(""); }}
                className="flex-1 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                onClick={handleBook}
                disabled={booking || !name.trim()}
                className="flex-1 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {booking ? "Booking..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}