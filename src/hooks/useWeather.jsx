import { useState } from 'react'
import axios from 'axios'

const BACKEND_API_URL = 'http://localhost:8081/weather/'

// 목업 날씨 데이터 반환
function mockWeather(lat, lon){
  return Promise.resolve({
    lat,
    lon,
    city: 'Seoul',
    main: 'Clear',
    desc: '맑음(목업)',
    temp: 23,
    humidity: 55,
    wind: 2,
    clouds: 12,
    daily: [ // ⬅️ [신규] 주간 예보 목업 (7일치)
      { day: '오늘', icon: '01d', temp_max: 25, temp_min: 15 },
      { day: '내일', icon: '02d', temp_max: 26, temp_min: 16 },
      { day: '모레', icon: '03d', temp_max: 24, temp_min: 17 },
      { day: '목', icon: '10d', temp_max: 22, temp_min: 15 },
      { day: '금', icon: '04d', temp_max: 23, temp_min: 14 },
      { day: '토', icon: '01d', temp_max: 26, temp_min: 16 },
      { day: '일', icon: '01d', temp_max: 27, temp_min: 17 },
    ]
  })
}

export const useWeather = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  //  [수정 1] getWeather가 city, lat, lon을 모두 받도록 변경
  const getWeather = async (city, lat, lon) => {
    
    setLoading(true)
    setError(null)
    try{
      const res = await axios.get(BACKEND_API_URL, {
        params: { city: city } 
      })
      const w = res.data // w는 onecall API의 전체 응답
      
      // onecall API는 w.current 안에 현재 날씨가 들어있음
      const current = w.current 

      // 'hourly' 파싱 대신 'daily' (주간 예보) 파싱
      // 'w.daily'는 8일치 예보를 포함 (오늘 + 7일)
      const daily = w.daily.slice(0, 7).map(d => { // 7일치만 사용 (오늘 포함)
        const date = new Date(d.dt * 1000);
        const dayName = date.toLocaleDateString('ko-KR', { weekday: 'short' }); // '월', '화'
        return {
          day: dayName,
          icon: d.weather[0].icon, // 날씨 아이콘 코드
          temp_max: d.temp.max,   // 최고 기온
          temp_min: d.temp.min    // 최저 기온
        };
      });
      
      // onecall API 구조에 맞게 반환 객체를 수정
      return {
        city: city, //  onecall API는 도시 이름을 반환하지 않으므로, prop으로 받은 city를 그대로 반환
        main: current.weather?.[0]?.main || 'Clear',
        desc: current.weather?.[0]?.description || '',
        temp: current?.temp || 20,
        humidity: current?.humidity || 60,
        wind: current?.wind_speed || 1,      
        clouds: current?.clouds || 10,        
        daily: daily, // 주간 예보 데이터
      }
    }catch(err){
      console.warn('Weather API fail, using mock', err.message) //  이제 err.message에 정확한 오류가 뜸
      setError('날씨 정보 조회 실패')
      //  mockWeather에도 city를 전달
      return mockWeather(city, lat, lon)
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    getWeather,
  }
}
