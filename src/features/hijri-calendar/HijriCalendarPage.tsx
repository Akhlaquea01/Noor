import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import umalqura from '@umalqura/core'
import { GlassCard } from '../../shared/ui/GlassCard'
import './HijriCalendarPage.css'

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const gregorianFormatter = new Intl.DateTimeFormat('en', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

export function HijriCalendarPage() {
  const [cursor, setCursor] = useState(() => new Date())
  const today = new Date()

  const todayHijri = umalqura(today)
  const monthLabel = umalqura.$.format(cursor, 'MMMM yyyy')
  const monthArray = umalqura.$.getMonthArray(cursor)

  const goToMonth = (delta: number) => {
    setCursor((prev) => umalqura.$.addMonths(prev, delta))
  }

  return (
    <section className="hijri-calendar-page">
      <h1>Islamic Calendar</h1>

      <GlassCard glow="gold" className="hijri-calendar-page__today">
        <span className="hijri-calendar-page__today-hijri">
          {todayHijri.hd} {umalqura.$.format(today, 'MMMM')} {todayHijri.hy} AH
        </span>
        <span className="hijri-calendar-page__today-gregorian">{gregorianFormatter.format(today)}</span>
      </GlassCard>

      <div className="hijri-calendar-page__nav">
        <button type="button" onClick={() => goToMonth(-1)} aria-label="Previous month">
          <ChevronLeft size={18} aria-hidden="true" />
        </button>
        <span>{monthLabel}</span>
        <button type="button" onClick={() => goToMonth(1)} aria-label="Next month">
          <ChevronRight size={18} aria-hidden="true" />
        </button>
      </div>

      <div className="hijri-calendar-page__grid">
        {DAY_LABELS.map((d, i) => (
          <span key={i} className="hijri-calendar-page__day-label">
            {d}
          </span>
        ))}
        {monthArray.flat().map((date, i) => {
          if (!date) return <span key={i} className="hijri-calendar-page__cell hijri-calendar-page__cell--empty" />
          const hijri = umalqura(date)
          const isToday = date.toDateString() === today.toDateString()
          return (
            <span
              key={i}
              className={`hijri-calendar-page__cell${isToday ? ' hijri-calendar-page__cell--today' : ''}`}
            >
              {hijri.hd}
            </span>
          )
        })}
      </div>

      <p className="hijri-calendar-page__disclaimer">
        Dates are calculated (Umm al-Qura), and may differ by a day from local moon-sighting announcements.
      </p>
    </section>
  )
}
