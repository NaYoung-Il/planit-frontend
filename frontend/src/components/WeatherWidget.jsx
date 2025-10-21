import { useEffect, useState } from 'react'
import { getWeather } from '../services/weatherService'

// 현재 날씨를 조회/표시, API 키 없으면 '목업' 데이터로 대체
export default function WeatherWidget({city='Seoul'}){
  const [data,setData] = useState(null)
  const [theme,setTheme] = useState('clear')

  useEffect(()=>{
    let on = true
    getWeather(city).then(w=>{
      if(!on) return
      setData(w)
      const code = (w.main||'').toLowerCase()
      if(code.includes('clear')) setTheme('clear')
      else if(code.includes('night')|| code.includes('cloud')) setTheme('night')
      else setTheme('sand')
    })
    return ()=>{ on=false }
  },[city])

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
      <div className="grid grid-cols-6 gap-2.5 relative z-10">
        {data.hourly.slice(0,6).map((h,i)=> (
          <div key={i} className="bg-emerald-50/90 px-2.5 py-2 text-center rounded-xl backdrop-blur">
            <div className="text-xs opacity-90">{h.t}</div>
            <div>{h.i}</div>
            <div className="font-bold mt-0.5 text-sm">{Math.round(h.temp)}°</div>
          </div>
        ))}
      </div>
    </div>
  )
}
