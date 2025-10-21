import dayjs from 'dayjs'
import { useMemo } from 'react'
import Button from './ui/Button'

// 날짜 선택과 기간 하이라이트를 지원하는 소형 월간 캘린더
export default function CalMini({
  value = dayjs(),
  selected,
  range,
  onPick,
  onChangeMonth,
  events = {}, // {YYYY-MM-DD: count}
}){
  const start = value.startOf('month').startOf('week')
  const days = useMemo(()=> Array.from({length: 42}, (_,i)=> start.add(i,'day')), [start.toString()])

  const inRange = (d)=> range && range.start && range.end && d.isAfter(range.start.subtract(1,'day')) && d.isBefore(range.end.add(1,'day'))

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2 mb-1">
        <Button variant="ghost" size="sm" className="!bg-white !text-emerald-700 !border !border-emerald-500/30 !shadow-sm hover:!bg-emerald-50" onClick={()=>onChangeMonth?.(value.subtract(1,'month'))}>‹</Button>
        <div className="font-bold text-text text-sm">{value.format('YYYY.MM')}</div>
        <Button variant="ghost" size="sm" className="!bg-white !text-emerald-700 !border !border-emerald-500/30 !shadow-sm hover:!bg-emerald-50" onClick={()=>onChangeMonth?.(value.add(1,'month'))}>›</Button>
        <Button variant="ghost" size="sm" className="ml-auto !bg-white !text-emerald-700 !border !border-emerald-500/30 !shadow-sm hover:!bg-emerald-50" onClick={()=>onChangeMonth?.(dayjs())}>오늘</Button>
      </div>
      <div className="grid grid-cols-7 gap-0.5 text-text-soft text-xs mb-1 font-semibold text-center">
        {['일','월','화','수','목','금','토'].map(d=> <span key={d}>{d}</span>)}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {days.map(d=>{
          const isCur = d.month()===value.month()
          const isToday = d.isSame(dayjs(), 'day')
          const isSel = selected && d.isSame(selected, 'day')
          const isIn = inRange(d)
          const key = d.format('YYYY-MM-DD')
          const dot = events[key] || 0
          return (
            <button
              key={d.toString()}
              className={`relative rounded-md px-1 py-1.5 text-xs font-semibold text-center min-h-[28px] flex items-center justify-center transition
                ${isCur ? 'bg-surface text-text border border-primary-dark/20' : 'bg-transparent text-text-soft/50 border border-transparent'}
                ${isToday ? 'outline outline-1 outline-primary !bg-primary/15' : ''}
                ${isSel ? '!bg-gradient-primary !text-white !border-0' : ''}
                ${isIn ? '!bg-[#F8FAF8] !text-text-soft' : ''}
                hover:bg-emerald-50 hover:border-primary-dark/35 hover:scale-105 cursor-pointer`}
              onClick={()=>onPick && onPick(d)}
            >
              <span>{d.date()}</span>
              {dot>0 && <i className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-0.5 h-0.5 bg-primary-dark rounded-full" title={`${dot} event(s)`}></i>}
            </button>
          )
        })}
      </div>
    </div>
  )
}
