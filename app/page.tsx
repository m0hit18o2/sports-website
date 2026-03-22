"use client";
import { useState } from "react";
import Link from "next/link";

const COURTS = ["Court 1", "Court 2"];
const TIME_SLOTS = [
  "06:00", "07:00", "08:00", "09:00", "10:00", "11:00",
  "12:00", "13:00", "14:00", "15:00", "16:00", "17:00",
  "18:00", "19:00", "20:00", "21:00"
];

type Booking = {
  bookedBy: string;
};

type BookingMap = {
  [key: string]: Booking | null;
};

const initialBookings: BookingMap = {
  "Court 1-08:00": { bookedBy: "Arjun" },
  "Court 2-10:00": { bookedBy: "Priya" },
  "Court 1-17:00": { bookedBy: "Rahul" },
};

export default function Home() {
  const [bookings, setBookings] = useState<BookingMap>(initialBookings);
  const [selected, setSelected] = useState<string | null>(null);
  const [name, setName] = useState("");

  const handleSlotClick = (key: string) => {
    if (bookings[key]) return;
    setSelected(key);
    setName("");
  };

  const handleBook = () => {
    if (!selected || !name.trim()) return;
    setBookings((prev) => ({ ...prev, [selected]: { bookedBy: name.trim() } }));
    setSelected(null);
    setName("");
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6">
      <h1 className="text-2xl font-semibold text-zinc-800 dark:text-zinc-100 mb-6">
        Court Booking
      </h1>
<Link href="/scores" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
  View scores
</Link>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="w-20 p-3 text-left text-zinc-500 font-medium">Time</th>
              {COURTS.map((court) => (
                <th key={court} className="p-3 text-center text-zinc-700 dark:text-zinc-300 font-medium">
                  {court}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TIME_SLOTS.map((time) => (
              <tr key={time} className="border-t border-zinc-200 dark:border-zinc-800">
                <td className="p-3 text-zinc-500 text-xs">{time}</td>
                {COURTS.map((court) => {
                  const key = `${court}-${time}`;
                  const booking = bookings[key];
                  const isSelected = selected === key;

                  return (
                    <td key={key} className="p-2 text-center">
                      <button
                        onClick={() => handleSlotClick(key)}
                        className={`w-full rounded-lg py-2 px-3 text-xs font-medium transition-colors
                          ${booking
                            ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 cursor-not-allowed"
                            : isSelected
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 ring-2 ring-blue-400"
                            : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200"
                          }`}
                      >
                        {booking ? booking.bookedBy : "Available"}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 w-80 shadow-xl">
            <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100 mb-1">
              Book slot
            </h2>
            <p className="text-sm text-zinc-500 mb-4">{selected}</p>
            <input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleBook()}
              className="w-full border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm mb-4 bg-transparent text-zinc-800 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-blue-400"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setSelected(null)}
                className="flex-1 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                onClick={handleBook}
                className="flex-1 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}