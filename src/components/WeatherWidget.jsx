import { useEffect, useState } from 'react'
import { useWeather } from '../hooks/useWeather'

// 현재 날씨를 조회/표시, API 키 없으면 '목업' 데이터로 대체
export default function WeatherWidget({ city = 'Seoul', lat=37.566, lon=126.978 }) {
  const { getWeather } = useWeather()
  const [data,setData] = useState(null)
  const [theme,setTheme] = useState('clear')

  useEffect(()=>{
    let on = true
    getWeather(city, lat, lon).then(w=>{
      if(!on) return
      setData(w)
      const code = (w.main||'').toLowerCase()
      if(code.includes('clear')) setTheme('clear')
      else if(code.includes('night')|| code.includes('cloud')) setTheme('night')
      else setTheme('sand')
    })
    return ()=>{ on=false }
  },[city, lat, lon])

  if(!data){
    return <div className="rounded-xl text-text-soft p-7 min-h-[120px] bg-bg-widget backdrop-blur">날씨 불러오는 중...</div>
  }

  const themeBg = {
    clear: 'bg-gradient-weather-clear',
    night: 'bg-gradient-weather-night',
    sand: 'bg-gradient-weather-sand',
  }[theme] || 'bg-gradient-weather'

  return (
    <div className={`rounded-xl text-text p-7 min-h-[252px] flex flex-col gap-4.5 ${themeBg} relative overflow-hidden`}>
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.12),rgba(255,255,255,0.04))] pointer-events-none"></div>
      <div className="relative z-10">
        <div>
          <h3 className="m-0 mb-2.5 font-bold text-lg leading-snug">{data.city}</h3>
          <div className="text-[44px] font-extrabold leading-tight">{Math.round(data.temp)}°</div>
          <p className="mt-0.5 text-sm leading-relaxed">{data.main} · {data.desc}</p>
        </div>
      </div>
      <div className="flex gap-3 relative z-10 flex-wrap">
        <div className="bg-white/25 px-2.5 py-1.5 rounded-xl text-xs font-semibold backdrop-blur">💧 {data.humidity}%</div>
        <div className="bg-white/25 px-2.5 py-1.5 rounded-xl text-xs font-semibold backdrop-blur">🌬️ {data.wind} m/s</div>
        <div className="bg-white/25 px-2.5 py-1.5 rounded-xl text-xs font-semibold backdrop-blur">☁️ {data.clouds}%</div>
      </div>
      {/* ⬇️ [수정] 주간 예보 섹션 */}
      <div className="grid grid-cols-6 gap-2.5 relative z-10"> 
        {/* 6일치 (내일 + 5일) */}
        {data.daily.slice(1, 7).map((d, i) => ( 
          <div key={i} className="bg-emerald-50/90 px-2 py-2 text-center rounded-xl backdrop-blur">
            {/* 요일 */}
            <div className="text-xs opacity-90">{d.day}</div>
            {/* 아이콘 */}
            <img 
              src={`http://openweathermap.org/img/wn/${d.icon}.png`} 
              alt="icon"
              className="w-8 h-8 mx-auto" 
            />
            {/* 최고/최저 기온 */}
            <div className="font-bold mt-0.5 text-xs">
              {Math.round(d.temp_max)}°
            </div>
            <div className="text-xs opacity-70">
              {Math.round(d.temp_min)}°
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}