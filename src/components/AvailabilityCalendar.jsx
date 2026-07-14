import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const expandRanges = (ranges, startKey, endKey) => {
  const set = new Set();
  ranges.forEach(r => {
    const cur = new Date(r[startKey] + 'T00:00:00');
    const end = new Date(r[endKey] + 'T00:00:00');
    while (cur < end) {
      set.add(cur.toISOString().split('T')[0]);
      cur.setDate(cur.getDate() + 1);
    }
  });
  return set;
};

const isoDate = (d) => d.toISOString().split('T')[0];

const AvailabilityCalendar = ({ bookedRanges = [], blockedRanges = [], checkin, checkout, onSelectDate }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [viewDate, setViewDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });

  const bookedDates = useMemo(() => expandRanges(bookedRanges, 'checkin_date', 'checkout_date'), [bookedRanges]);
  const blockedDates = useMemo(() => expandRanges(blockedRanges, 'start_date', 'end_date'), [blockedRanges]);

  const checkinD = checkin ? new Date(checkin + 'T00:00:00') : null;
  const checkoutD = checkout ? new Date(checkout + 'T00:00:00') : null;

  const prevMonth = () => setViewDate(d => { const n = new Date(d); n.setMonth(n.getMonth() - 1); return n; });
  const nextMonth = () => setViewDate(d => { const n = new Date(d); n.setMonth(n.getMonth() + 1); return n; });

  const renderMonth = (baseDate) => {
    const year = baseDate.getFullYear();
    const month = baseDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const label = baseDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

    return (
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-charcoal text-center mb-3">{label}</p>
        <div className="grid grid-cols-7 gap-px">
          {DAY_LABELS.map(l => (
            <div key={l} className="text-center text-xs text-gray-400 font-bold pb-1">{l}</div>
          ))}
          {cells.map((date, i) => {
            if (!date) return <div key={`e-${i}`} />;
            const iso = isoDate(date);
            const isPast = date < today;
            const isBooked = bookedDates.has(iso);
            const isBlocked = blockedDates.has(iso);
            const isUnavailable = isPast || isBooked || isBlocked;
            const isCheckin = checkinD && isoDate(checkinD) === iso;
            const isCheckout = checkoutD && isoDate(checkoutD) === iso;
            const inRange = checkinD && checkoutD && date > checkinD && date < checkoutD;

            let cls = 'h-8 w-full text-xs flex items-center justify-center rounded-lg transition-all ';
            if (isCheckin || isCheckout) {
              cls += 'bg-golden text-white font-bold';
            } else if (inRange) {
              cls += 'bg-golden/20 text-golden font-medium';
            } else if (isBooked) {
              cls += 'bg-red-100 text-red-400 line-through cursor-not-allowed';
            } else if (isBlocked) {
              cls += 'bg-gray-100 text-gray-300 line-through cursor-not-allowed';
            } else if (isPast) {
              cls += 'text-gray-200 cursor-not-allowed';
            } else {
              cls += 'text-charcoal hover:bg-golden/10 hover:text-golden cursor-pointer font-medium';
            }

            return (
              <button
                key={iso}
                disabled={isUnavailable}
                onClick={() => !isUnavailable && onSelectDate && onSelectDate(iso)}
                className={cls}
                title={isBooked ? 'Already booked' : isBlocked ? 'Blocked by owner' : undefined}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const nextMonthDate = new Date(viewDate);
  nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);

  const canGoPrev = new Date(viewDate) > today;

  return (
    <div className="border border-gray-100 rounded-2xl p-4 bg-white shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} disabled={!canGoPrev}
          className="p-1.5 rounded-lg text-gray-400 hover:text-golden hover:bg-golden/10 transition disabled:opacity-30 disabled:cursor-not-allowed">
          <ChevronLeft size={16} />
        </button>
        <div className="flex gap-2 text-xs flex-wrap justify-center">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-golden inline-block" /> Selected</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-100 inline-block" /> Booked</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-gray-100 inline-block" /> Blocked</span>
        </div>
        <button onClick={nextMonth}
          className="p-1.5 rounded-lg text-gray-400 hover:text-golden hover:bg-golden/10 transition">
          <ChevronRight size={16} />
        </button>
      </div>
      <div className="flex gap-6">
        {renderMonth(viewDate)}
        <div className="w-px bg-gray-100 hidden sm:block" />
        <div className="hidden sm:block flex-1 min-w-0">
          {renderMonth(nextMonthDate)}
        </div>
      </div>
    </div>
  );
};

export default AvailabilityCalendar;
