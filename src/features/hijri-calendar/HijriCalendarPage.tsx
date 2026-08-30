import { useEffect, useState, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import umalqura from '@umalqura/core'
import { GlassCard } from '../../shared/ui/GlassCard'
import { PrayerDayChecklist } from '../prayer-tracker/PrayerDayChecklist'
import { prayerLogRepo } from '../../shared/db/repositories'
import { localDateKey } from '../../shared/lib/dateKey'
import type { PrayerName } from '../prayer-times/lib/calculatePrayerTimes'
import './HijriCalendarPage.css'

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const gregorianFormatter = new Intl.DateTimeFormat('en', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

export function HijriCalendarPage() {
  const [cursor, setCursor] = useState(() => new Date())
  const [selectedDate, setSelectedDate] = useState(() => new Date())
  const [monthCompletion, setMonthCompletion] = useState<Map<string, Set<PrayerName>>>(new Map())
  const today = new Date()
  const todayKey = localDateKey(today)

  // Whole dataset is small and fully local, so one bulk fetch grouped
  // client-side is simpler and cheaper than a per-visible-day indexed query
  // for each of up to 42 grid cells.
  const loadCompletion = useCallback(() => {
    void prayerLogRepo.list().then((records) => {
      const map = new Map<string, Set<PrayerName>>()
      for (const record of records) {
        const set = map.get(record.dateKey) ?? new Set<PrayerName>()
        set.add(record.prayerName)
        map.set(record.dateKey, set)
      }
      setMonthCompletion(map)
    })
  }, [])

  useEffect(() => {
    loadCompletion()
  }, [loadCompletion])

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
          const dateKey = localDateKey(date)
          const isToday = dateKey === todayKey
          const isSelected = dateKey === localDateKey(selectedDate)
          const prayedCount = monthCompletion.get(dateKey)?.size ?? 0
          const classification =
            dateKey > todayKey
              ? 'future'
              : prayedCount === 5
                ? 'complete'
                : prayedCount > 0
                  ? 'partial'
                  : dateKey === todayKey
                    ? 'in-progress'
                    : 'missed'
          return (
            <button
              key={i}
              type="button"
              onClick={() => setSelectedDate(date)}
              aria-pressed={isSelected}
              aria-label={`${gregorianFormatter.format(date)}, ${prayedCount} of 5 prayers logged`}
              className={[
                'hijri-calendar-page__cell',
                isToday && 'hijri-calendar-page__cell--today',
                isSelected && 'hijri-calendar-page__cell--selected',
                `hijri-calendar-page__cell--${classification}`,
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {hijri.hd}
              {classification !== 'future' && <span className="hijri-calendar-page__cell-dot" />}
            </button>
          )
        })}
      </div>

      <p className="hijri-calendar-page__disclaimer">
        Dates are calculated (Umm al-Qura), and may differ by a day from local moon-sighting announcements.
      </p>

      <PrayerDayChecklist date={selectedDate} onChange={loadCompletion} />
    </section>
  )
}
