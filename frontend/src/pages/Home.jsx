import Card from '../components/Card'
import WeatherWidget from '../components/WeatherWidget'
import CalMini from '../components/CalMini'
import dayjs from 'dayjs'
import { useState } from 'react'
import { addEvent, listByMonth, listEvents, removeEvent, updateEvent } from '../services/eventService'
import { saveTrip } from '../services/storageService'
import Button from '../components/ui/Button'
import Empty from '../components/ui/Empty'
import Badge from '../components/ui/Badge'

// Home : 캘린더/메모/빠른 여행 생성/날씨 위젯
export default function Home(){
  const today = dayjs()
  const [month, setMonth] = useState(today)
  const [sel, setSel] = useState(today)
  const [range, setRange] = useState({start: null, end: null})
  const [events, setEvents] = useState(listByMonth(month.format('YYYY-MM')))

  const onChangeMonth = (m)=>{ setMonth(m); setEvents(listByMonth(m.format('YYYY-MM'))) }
  const onPick = (d)=>{
    if(!range.start || (range.start && range.end)){
      setRange({start: d, end: null})
    } else if(range.start && !range.end){
      if(d.isBefore(range.start)) setRange({start: d, end: range.start})
      else setRange({start: range.start, end: d})
    }
    setSel(d)
  }

  const addMemo = ()=>{
    const key = sel.format('YYYY-MM-DD')
    const txt = prompt(`${key} 메모를 입력하세요:`)
    if(!txt) return
    addEvent(key, txt)
    setEvents(listByMonth(month.format('YYYY-MM')))
  }

  const editMemo = (id)=>{
    const key = sel.format('YYYY-MM-DD')
    const cur = listEvents(key).find(e=>e.id===id)
    const txt = prompt('메모 수정', cur?.text || '')
    if(txt==null) return
    updateEvent(key, id, txt)
    setEvents(listByMonth(month.format('YYYY-MM')))
  }

  const delMemo = (id)=>{
    const key = sel.format('YYYY-MM-DD')
    removeEvent(key, id)
    setEvents(listByMonth(month.format('YYYY-MM')))
  }

  const createTripFromRange = ()=>{
    if(!(range.start && range.end)) return alert('기간을 먼저 선택하세요.')
    const trip = {
      id: crypto.randomUUID(),
      name: `${range.start.format('MM.DD')}~${range.end.format('MM.DD')} 여행`,
      city: '미정',
      start: range.start.format('YYYY-MM-DD'),
      end: range.end.format('YYYY-MM-DD'),
      todo: []
    }
    saveTrip(trip)
    alert('여행 일정이 생성되었습니다. 여행 메뉴에서 확인하세요.')
  }
  return (
    <div className="grid gap-6 relative z-[1] mt-6" style={{gridTemplateColumns: '1fr 420px'}}>
      <div className="flex flex-col gap-6">
        <Card title="인기 여행지" subtitle="추천 여행지" className="bg-bg-widget border-primary-dark/20 shadow-md">
          <div className="mt-2">
            <div className="grid gap-6 items-stretch" style={{gridTemplateColumns: 'repeat(3, minmax(0, 1fr))'}}>
              { [
                { name: '발리', days: 'Starting at', price: '', rating: '4.7', bg: 'bg-[linear-gradient(135deg,_#ff6b6b,_#ffa726)]' },
                { name: '두바이', days: 'Starting at', price: '', rating: '4.6', bg: 'bg-[linear-gradient(135deg,_#4fc3f7,_#29b6f6)]' },
                { name: '몰디브', days: 'Starting at', price: '', rating: '4.8', bg: 'bg-[linear-gradient(135deg,_#26c6da,_#00acc1)]' },
              ].map((place, i) => (
                <div key={i} className="w-auto bg-surface rounded-xl shadow-[0_10px_26px_rgba(0,0,0,0.07)] overflow-hidden border border-primary-dark/10 transition relative hover:-translate-y-1 hover:shadow-[0_20px_46px_rgba(0,0,0,0.16)]">
                  <div className={`relative h-[172px] ${place.bg} bg-cover bg-center`}>
                    <div className="absolute top-3 right-3 bg-black/65 text-white px-2.5 py-1.5 rounded-2xl text-xs font-semibold backdrop-blur">{place.rating}★</div>
                  </div>
                  <div className="p-6 pt-6 flex flex-col gap-3.5">
                    <div className="font-bold text-lg text-text mb-1 leading-snug">{place.name}</div>
                    <div className="w-full min-h-[46px] mt-2 bg-gradient-primary text-white rounded-lg px-4 py-2.5 flex justify-between items-center text-sm">
                      <span>{place.days}</span>
                      {place.price && <span className="bg-lime px-2.5 py-1.5 rounded-xl font-extrabold text-xs text-black shadow-[0_5px_14px_rgba(193,255,47,0.28)]">{place.price}</span>}
                    </div>
                  </div>
                </div>
              )) }
            </div>
          </div>
        </Card>
      </div>
      <div className="flex flex-col gap-6">
        <Card title="2025년 9월" subtitle="" className="bg-bg-widget border-primary-dark/20 shadow-md">
          <CalMini value={month} selected={sel} range={range} onPick={onPick} onChangeMonth={onChangeMonth} events={events} />
          <div className="text-text-soft text-xs mt-3">
            기간 선택: {range.start?range.start.format('MM.DD'):''} {range.end?`~ ${range.end.format('MM.DD')}`:''}</div>
          <div className="text-text-soft text-xs flex items-center mt-2">
            해당일 메모
            <Button
              variant="ghost"
              size="sm"
              className="ml-2 !px-2 !py-1 !text-xs"
              onClick={addMemo}
            >
              + 추가
            </Button>
          </div>
          <MemoList dateKey={sel.format('YYYY-MM-DD')} onEdit={editMemo} onDelete={delMemo} />
          {(range.start && range.end) && (
            <Button
              variant="primary"
              size="sm"
              className="mt-3"
              onClick={createTripFromRange}
            >
              여행 일정 만들기
            </Button>
          )}
        </Card>
        <Card title="날씨" subtitle="오늘 · 서울" className="bg-bg-widget border-primary-dark/20">
          <WeatherWidget city="Seoul" />
        </Card>
      </div>
    </div>
  )
}

// 메모 리스트 컴포넌트
function MemoList({dateKey, onEdit, onDelete}){
  const items = listEvents(dateKey)
  if(items.length===0) return (
    <Empty message="메모가 없습니다." className="!py-3 !text-xs" />
  )
  return (
    <div className="flex flex-col gap-2 p-2 rounded-lg bg-white/55 backdrop-blur border border-primary-dark/10 mt-1">
      {items.map(m=> (
        <div key={m.id} className="p-3 rounded-xl bg-surface border border-primary-dark/12 flex flex-col gap-2">
          <div className="text-sm font-medium text-text">{m.text}</div>
          <div className="flex gap-2 mt-1">
            <Button variant="ghost" size="sm" className="!bg-gradient-primary !text-white !border-0" onClick={()=>onEdit(m.id)}>수정</Button>
            <Button variant="danger" size="sm" onClick={()=>onDelete(m.id)}>삭제</Button>
          </div>
        </div>
      ))}
    </div>
  )
}
