import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useTrip } from '../hooks/useTrip'
import { useWeather } from '../hooks/useWeather'
import { useEvent } from '../hooks/useEvent'
import { useState, useEffect } from 'react'
import Popover from './Popover'
import dayjs from 'dayjs'
import Button from './ui/Button'
import Card from './Card'
import CalMini from './CalMini'
import WeatherWidget from './WeatherWidget'

// 앱 크롬(사이드바 + 상단바)과 로그아웃 동작 담당
export default function Layout(){
  const loc = useLocation()
  const nav = useNavigate()
  const { getCurrentUser, logout: logoutHook, getAvatar } = useAuth()
  const [user, setUser] = useState(null)
  const [avatar, setAvatar] = useState('')
  const [openBell, setOpenBell] = useState(false)

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('access_token')
      if (token) {
        try {
          const userData = await getCurrentUser()
          setUser(userData)
          const savedAvatar = getAvatar()
          setAvatar(savedAvatar || '')
        } catch (err) {
          console.error('사용자 정보 조회 실패:', err)
          setUser(null)
        }
      }
    }
    fetchUser()
  }, [loc.pathname])
  return (
    <div className="grid h-screen" style={{gridTemplateColumns: '280px 1fr 420px'}}>
      <aside className="px-5 py-6 ml-6 my-6 rounded-lg bg-gradient-sidebar backdrop-blur border-r border-primary-dark/12 relative overflow-hidden">
        {/*<img className="object-contain place-self-center w-28 mb-7 cursor-pointer transition hover:scale-105" src="http://localhost:8081/reviews/1/photos/3/raw" onClick={()=>nav('/')}/>*/}
        <div className="font-bold text-2xl place-self-center mb-6 text-sidebar-brand cursor-pointer transition hover:scale-105" style={{filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.08))'}} onClick={()=>nav('/')}>Plan‑it</div>


        <div className="flex flex-col items-center gap-4 mb-8 pb-6 border-b border-primary-dark/15">
          <div className="w-16 h-16 rounded-full bg-gradient-primary grid place-items-center font-semibold text-white cursor-pointer transition border-2 border-emerald-500/20 hover:scale-105 overflow-hidden" onClick={()=>nav('/profile')}>
            {avatar ? (
              <img src={avatar} alt="프로필" className="w-full h-full object-cover" />
            ) : (
              user?.username?.[0]?.toUpperCase()||user?.email?.[0]?.toUpperCase()||'U'
            )}
          </div>
          <div className="text-center">
            <div>
              <p className="font-semibold text-text">{user?.username}</p>
              <span className="text-text/70"> {user?.email}</span>
            </div>
          </div>
          {user ? (
            <Button variant="inverse" size="sm" onClick={()=>{ logoutHook(); nav('/login') }} className="w-full">로그아웃</Button>
          ) : (
            <Button size="sm" onClick={()=>nav('/login')} className="w-full">로그인</Button>
          )}
          <button className="bell bg-surface border border-primary-dark/15 rounded-xl w-full py-3 grid place-items-center cursor-pointer text-text transition hover:bg-emerald-50 hover:translate-y-[-2px]" title="알림" onClick={()=>setOpenBell(v=>!v)}>
            🔔 
          </button>
          <Popover open={openBell} onClose={()=>setOpenBell(false)} anchorClass=".bell">
            <BellContent />
          </Popover>
        </div>

        <nav className="flex flex-col gap-2">
          <NavLink to="/" className={({isActive})=> isActive
            ? 'no-underline px-4 py-3 rounded-xl transition-all duration-200 relative overflow-hidden flex gap-3 items-center font-semibold text-white shadow-button bg-gradient-primary'
            : 'no-underline px-4 py-3 rounded-xl transition-all duration-200 relative overflow-hidden flex gap-3 items-center font-medium text-sidebar-link hover:bg-emerald-500/15 hover:translate-x-1'}>
            <span className="w-5 text-center text-lg" aria-hidden>🏠</span>
            <span>대시보드</span>
          </NavLink>
          <NavLink to="/trips" className={({isActive})=> isActive
            ? 'no-underline px-4 py-3 rounded-xl transition-all duration-200 relative overflow-hidden flex gap-3 items-center font-semibold text-white shadow-button bg-gradient-primary'
            : 'no-underline px-4 py-3 rounded-xl transition-all duration-200 relative overflow-hidden flex gap-3 items-center font-medium text-sidebar-link hover:bg-emerald-500/15 hover:translate-x-1'}>
            <span className="w-5 text-center text-lg" aria-hidden>🧳</span>
            <span>여행</span>
          </NavLink>
          <NavLink to="/community" className={({isActive})=> isActive
            ? 'no-underline px-4 py-3 rounded-xl transition-all duration-200 relative overflow-hidden flex gap-3 items-center font-semibold text-white shadow-button bg-gradient-primary'
            : 'no-underline px-4 py-3 rounded-xl transition-all duration-200 relative overflow-hidden flex gap-3 items-center font-medium text-sidebar-link hover:bg-emerald-500/15 hover:translate-x-1'}>
            <span className="w-5 text-center text-lg" aria-hidden>🗣️</span>
            <span>커뮤니티</span>
          </NavLink>
        </nav>
      </aside>
      <div className="flex flex-col h-screen overflow-y-auto [&::-webkit-scrollbar]:hidden">
        <Outlet key={loc.key} />
      </div>
      <RightSidebar />
    </div>
  )
}

// 오른쪽 사이드바: 캘린더와 날씨
function RightSidebar(){
  const nav = useNavigate()
  const { listByMonth } = useEvent()
  const today = dayjs()
  const [month, setMonth] = useState(today)
  const [sel, setSel] = useState(today)
  const [range, setRange] = useState({start: null, end: null})
  const [events, setEvents] = useState([])

  useEffect(() => {
    setEvents(listByMonth(month.format('YYYY-MM')))
  }, [month])

  const onChangeMonth = (m) => {
    setMonth(m)
  }

  const onPick = (d) => {
    if(!range.start || (range.start && range.end)){
      setRange({start: d, end: null})
    } else if(range.start && !range.end){
      if(d.isBefore(range.start)) setRange({start: d, end: range.start})
      else setRange({start: range.start, end: d})
    }
    setSel(d)
  }

  const createTripFromRange = () => {
    if(!(range.start && range.end)) return alert('기간을 먼저 선택하세요.')
    nav('/trips/new', {
      state: {
        start_date: range.start.format('YYYY-MM-DD'),
        end_date: range.end.format('YYYY-MM-DD')
      }
    })
  }

  return (
    <div className="flex flex-col overflow-y-auto">
      <Card title="Calander" subtitle="" className="bg-bg-widget border-primary-dark/20 shadow-md my-6 mr-6">
        <CalMini value={month} selected={sel} range={range} onPick={onPick} onChangeMonth={onChangeMonth} events={events} />
        <div className="text-text-soft text-xs mt-3">
          기간 선택: {range.start?range.start.format('MM.DD'):''} {range.end?`~ ${range.end.format('MM.DD')}`:''}</div>
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
      <WeatherWidget city="Seoul"/>
    </div>
  )
}

// 여행 일정과 날씨 정보를 합쳐 알림 목록 생성
function BellContent(){
  const [items, setItems] = useState([])
  const { getTripsByUser } = useTrip()
  const { getWeather } = useWeather()
  const { getCurrentUser } = useAuth()

  useEffect(()=>{
    const fetchNotifications = async () => {
      try {
        const user = await getCurrentUser()
        const trips = await getTripsByUser(user.id)
        const now = dayjs()
        const tripNotis = trips.map(t=>{
          const d = dayjs(t.start_date || t.start)
          const diff = d.diff(now,'day')
          return { text: `여행 "${t.title || t.name}" D${diff>=0?'-'+diff:'+'+Math.abs(diff)}` }
        })
        const w = await getWeather('Seoul')
        const rain = (w.main||'').toLowerCase().includes('rain')
        const wx = rain ? [{ text: '오늘 비 소식 — 우산을 챙기세요.' }] : []
        setItems([{ text:'알림' , head:true }, ...tripNotis, ...wx])
      } catch (err) {
        console.error('알림 조회 실패:', err)
        setItems([{ text:'알림' , head:true }])
      }
    }
    fetchNotifications()
  }, [])
  return (
    <div>
      {items.map((n,i)=> n.head?
        <div key={i} className="text-sm font-medium text-text-soft mb-2 flex items-center gap-2">{n.text}</div> :
        <div key={i} className="p-3 rounded-xl bg-surface mb-2 last:mb-0 border border-primary-dark/10">{n.text}</div>
      )}
    </div>
  )
}