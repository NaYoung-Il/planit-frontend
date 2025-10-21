import axios from 'axios'

const key = import.meta.env.VITE_OPEN_WEATHER_KEY

// 도시명으로 실시간 날씨 정보 조회 (API 키 없으면 목업 데이터 반환)
export async function getWeather(city){
  if(!key){
    return mockWeather(city)
  }
  try{
    const res = await axios.get('https://api.openweathermap.org/data/2.5/weather',{
      params: { q: city, appid: key, units:'metric', lang:'kr' }
    })
    const w = res.data
    const hourly = Array.from({length: 6},(_,i)=> ({ t: `${(i*2).toString().padStart(2,'0')}:00`, i: '☀️', temp: w.main.temp + i }))
    return {
      city: w.name,
      main: w.weather?.[0]?.main || 'Clear',
      desc: w.weather?.[0]?.description || '',
      temp: w.main?.temp || 20,
      humidity: w.main?.humidity || 60,
      wind: w.wind?.speed || 1,
      clouds: w.clouds?.all || 10,
      hourly,
    }
  }catch(err){
    console.warn('Weather API fail, using mock', err.message)
    return mockWeather(city)
  }
}

// 목업 날씨 데이터 반환
function mockWeather(city){
  return Promise.resolve({
    city,
    main: 'Clear',
    desc: '맑음(목업)',
    temp: 23,
    humidity: 55,
    wind: 2,
    clouds: 12,
    hourly: [
      {t:'12:00', i:'☀️', temp:24},
      {t:'14:00', i:'⛅', temp:25},
      {t:'16:00', i:'☀️', temp:26},
      {t:'18:00', i:'🌤️', temp:24},
      {t:'20:00', i:'🌙', temp:22},
      {t:'22:00', i:'🌙', temp:21}
    ]
  })
}
