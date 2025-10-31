import { useEffect, useState } from 'react'
import { useWeather } from '../hooks/useWeather'
import { useCity } from '../hooks/useCity'
import Button from './ui/Button'

// 현재 날씨를 조회/표시, API 키 없으면 '목업' 데이터로 대체
export default function WeatherWidget({ city = 'Seoul', lat=37.566, lon=126.978 }) {
  const { getWeather } = useWeather()
  const { getAllCities } = useCity()
  const [data,setData] = useState(null)
  const [theme,setTheme] = useState('clear')

  // 국가/도시 선택 관련 state
  const [countries, setCountries] = useState([])
  const [allCities, setAllCities] = useState([])
  const [filteredCities, setFilteredCities] = useState([])
  const [selectedCountry, setSelectedCountry] = useState('대한민국')
  const [selectedCity, setSelectedCity] = useState('서울')
  const [selectedCityData, setSelectedCityData] = useState({ city_name: 'Seoul', lat: 37.566, lon: 126.978 })

  // 초기 도시 데이터 로드
  useEffect(() => {
    const fetchCitiesData = async () => {
      const cities = await getAllCities()
      setAllCities(cities)

      // 국가 목록 생성 (ko_country 기준 중복 제거)
      const countryList = [...new Set(cities.map(city => city.ko_country).filter(Boolean))].sort()
      setCountries(countryList)

      // 초기 선택된 국가의 도시 필터링 (대한민국)
      const koreaCity = cities.filter(city => city.ko_country === '대한민국')
      setFilteredCities(koreaCity)
    }
    fetchCitiesData()
  }, [])

  // 국가 변경 시 도시 필터링
  useEffect(() => {
    if (selectedCountry) {
      const filtered = allCities.filter(city => city.ko_country === selectedCountry)
      setFilteredCities(filtered)
      // 국가 변경 시 첫 번째 도시로 자동 선택
      if (filtered.length > 0) {
        setSelectedCity(filtered[0].ko_name)
      }
    }
  }, [selectedCountry, allCities])

  // 날씨 조회
  useEffect(()=>{
    let on = true
    getWeather(selectedCityData.city_name, selectedCityData.lat, selectedCityData.lon).then(w=>{
      if(!on) return
      setData(w)
      const code = (w.main||'').toLowerCase()
      if(code.includes('clear')) setTheme('clear')
      else if(code.includes('night')|| code.includes('cloud')) setTheme('night')
      else setTheme('sand')
    })
    return ()=>{ on=false }
  },[selectedCityData])

  // 도시 변경 버튼 핸들러
  const handleCityChange = () => {
    const cityData = filteredCities.find(city => city.ko_name === selectedCity)
    if (cityData) {
      setSelectedCityData({
        city_name: cityData.city_name,
        lat: cityData.lat,
        lon: cityData.lon
      })
    }
  }

  if(!data){
    return <div className="rounded-xl text-text-soft p-7 min-h-[120px] bg-bg-widget backdrop-blur">날씨 불러오는 중...</div>
  }

  const themeBg = {
    clear: 'bg-gradient-weather-clear',
    night: 'bg-gradient-weather-night',
    sand: 'bg-gradient-weather-sand',
  }[theme] || 'bg-gradient-weather'

  return (
    <div className={`rounded-xl text-text p-5 min-h-[252px] grid grid-cols-2 relative z-10 gap-2 mr-6 w-30 ${themeBg} overflow-hidden`}>
      <div>
        <div className="relative z-10">
          <div className="flex flex-col gap-2 mb-3 mr-1">
            <select
              value={selectedCountry}
              onChange={e => setSelectedCountry(e.target.value)}
              className="w-full px-2 py-1.5 rounded-lg bg-bg text-text text-xs font-semibold border border-white/40 focus:outline-none focus:border-primary backdrop-blur"
            >
              {countries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
            <select
              value={selectedCity}
              onChange={e => setSelectedCity(e.target.value)}
              className="w-full px-2 py-1.5 rounded-lg bg-bg text-text text-xs font-semibold border border-white/40 focus:outline-none focus:border-primary backdrop-blur"
            >
              {filteredCities.map(city => (
                <option key={city.id} value={city.ko_name}>{city.ko_name}</option>
              ))}
            </select>
            <Button
              variant="primary"
              size="sm"
              onClick={handleCityChange}
              className="w-full !text-xs !py-1.5"
            >
              도시 변경
            </Button>
          </div>
          <div className='text-white'>
            <div className="text-lg font-bold leading-tight">{selectedCity}</div>
            <div className="text-[44px] font-extrabold leading-tight">{data.temp}°</div>
            <p className="mt-0.5 text-sm pb-1 leading-relaxed">{data.main} · {data.desc}</p>
          </div>
        </div>
        <div className="grid grid-rows-3 relative z-10 gap-2 mt-1 mr-1">
          <div className="bg-bg/75 p-2.5 rounded-xl text-xs font-semibold backdrop-blur">💧 {data.humidity}%</div>
          <div className="bg-bg/75 p-2.5 rounded-xl text-xs font-semibold backdrop-blur">🌬️ {data.wind} m/s</div>
          <div className="bg-bg/75 p-2.5 rounded-xl text-xs font-semibold backdrop-blur">☁️ {data.clouds}%</div>
        </div>
      </div>
      {/* 주간 예보 섹션 */}
      <div className="grid grid-rows-6 gap-2.5 relative z-10"> 
        {/* 6일치 (내일 + 5일) */}
        {data.daily.slice(1, 7).map((d, i) => ( 
          <div key={i} className="bg-bg/60 px-2 pt-1 grid grid-cols-2 rounded-xl backdrop-blur">
            {/* 아이콘 */}
            <img 
              src={`http://openweathermap.org/img/wn/${d.icon}.png`} 
            />     
            <div>       
              {/* 요일 */}
              <div className="text-xs">{d.day}</div>
              {/* 최고/최저 기온 */}
              <div className="font-bold text-xs">
                {Math.round(d.temp_max)}° / {Math.round(d.temp_min)}°
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}