import { useState, useRef, useEffect, useMemo, useId } from 'react';
import { formatDate, toDateInputValue } from '../../utils/formatDate.js';
import Button from './Button.jsx';
import './DatePicker.css';

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const YEAR_START = 1950;

function parseValue(value) {
  if (!value) return null;
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function daysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function clampDay(year, month, day) {
  return Math.min(Math.max(1, day), daysInMonth(year, month));
}

function getCalendarDays(year, month) {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startPad = first.getDay();
  const days = [];

  for (let i = 0; i < startPad; i++) days.push(null);
  for (let d = 1; d <= last.getDate(); d++) {
    days.push(new Date(year, month, d));
  }
  return days;
}

function isSameDay(a, b) {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function DatePicker({
  value,
  onChange,
  label = 'Select date',
  placeholder = 'Pick a date',
}) {
  const [open, setOpen] = useState(false);
  const today = new Date();
  const selected = parseValue(value);
  const initial = selected || today;

  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());
  const [viewDay, setViewDay] = useState(initial.getDate());
  const rootRef = useRef(null);
  const uid = useId();

  const yearOptions = useMemo(() => {
    const end = today.getFullYear() + 1;
    const years = [];
    for (let y = end; y >= YEAR_START; y--) years.push(y);
    return years;
  }, [today.getFullYear()]);

  const dayOptions = useMemo(
    () => Array.from({ length: daysInMonth(viewYear, viewMonth) }, (_, i) => i + 1),
    [viewYear, viewMonth]
  );

  useEffect(() => {
    if (selected) {
      setViewYear(selected.getFullYear());
      setViewMonth(selected.getMonth());
      setViewDay(selected.getDate());
    }
  }, [value]);

  useEffect(() => {
    setViewDay((d) => clampDay(viewYear, viewMonth, d));
  }, [viewYear, viewMonth]);

  useEffect(() => {
    if (!open) return;

    const handleClick = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const handleKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  const applyViewDate = (year, month, day, close = false) => {
    const d = clampDay(year, month, day);
    setViewYear(year);
    setViewMonth(month);
    setViewDay(d);
    onChange(toDateInputValue(new Date(year, month, d)));
    if (close) setOpen(false);
  };

  const selectDate = (date) => {
    applyViewDate(date.getFullYear(), date.getMonth(), date.getDate(), true);
  };

  const selectToday = () => {
    applyViewDate(today.getFullYear(), today.getMonth(), today.getDate(), true);
  };

  const handleDayChange = (e) => {
    applyViewDate(viewYear, viewMonth, Number(e.target.value));
  };

  const handleMonthChange = (e) => {
    applyViewDate(viewYear, Number(e.target.value), viewDay);
  };

  const handleYearChange = (e) => {
    applyViewDate(Number(e.target.value), viewMonth, viewDay);
  };

  const viewDate = new Date(viewYear, viewMonth, viewDay);
  const days = getCalendarDays(viewYear, viewMonth);

  return (
    <div className="date-picker" ref={rootRef}>
      <button
        type="button"
        className="date-picker-trigger"
        onClick={() => setOpen(!open)}
        aria-label={label}
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <span>{value ? formatDate(value) : placeholder}</span>
      </button>

      {open && (
        <div className="date-picker-popover" role="dialog" aria-label={label}>
          <div className="date-picker-today-row">
            <Button type="button" size="sm" onClick={selectToday}>
              Today
            </Button>
          </div>

          <div className="date-picker-selects">
            <div className="date-picker-select-field">
              <label htmlFor={`${uid}-day`}>Day</label>
              <select
                id={`${uid}-day`}
                value={viewDay}
                onChange={handleDayChange}
              >
                {dayOptions.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div className="date-picker-select-field">
              <label htmlFor={`${uid}-month`}>Month</label>
              <select
                id={`${uid}-month`}
                value={viewMonth}
                onChange={handleMonthChange}
              >
                {MONTHS.map((name, i) => (
                  <option key={name} value={i}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div className="date-picker-select-field">
              <label htmlFor={`${uid}-year`}>Year</label>
              <select
                id={`${uid}-year`}
                value={viewYear}
                onChange={handleYearChange}
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="date-picker-weekdays">
            {WEEKDAYS.map((d) => (
              <span key={d} className="date-picker-weekday">
                {d}
              </span>
            ))}
          </div>

          <div className="date-picker-grid">
            {days.map((date, i) =>
              date ? (
                <button
                  key={date.toISOString()}
                  type="button"
                  className={[
                    'date-picker-day',
                    isSameDay(date, viewDate) && 'date-picker-day--selected',
                    isSameDay(date, today) && 'date-picker-day--today',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => selectDate(date)}
                >
                  {date.getDate()}
                </button>
              ) : (
                <span key={`empty-${i}`} className="date-picker-day date-picker-day--empty" />
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
