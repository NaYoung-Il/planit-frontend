import { useState, useEffect } from 'react'
import Button from '../components/ui/Button'
import Separator from '../components/ui/Separator'
import dayjs from 'dayjs'
import { useCity } from '../hooks/useCity'

// TripCreate2: Step 2 - 도시 선택
export default function TripCreate2({
  country,
  startDate,
  endDate,
  citySchedules,
  setCitySchedules,
  onNext,
  onPrevious
}) {
  const [cities, setCities] = useState([])
  const { getAllCities } = useCity()

  // 선택된 나라에 해당하는 도시 목록 조회
  useEffect(() => {
    const fetchCities = async () => {
      const allCities = await getAllCities()
      // 선택된 나라(ko_country)와 일치하는 도시만 필터링
      const filteredCities = allCities.filter(city => city.ko_country === country)
      setCities(filteredCities)
    }
    if (country) {
      fetchCities()
    }
  }, [country])
  const addCitySchedule = () => {
    setCitySchedules([...citySchedules, {
      id: crypto.randomUUID(),
      city: '',
      ko_name: '',
      startDate: '',
      endDate: ''
    }])
  }

  const removeCitySchedule = (id) => {
    setCitySchedules(citySchedules.filter(s => s.id !== id))
  }

  const updateCitySchedule = (id, field, value) => {
    setCitySchedules(citySchedules.map(s =>
      s.id === id ? { ...s, [field]: value } : s
    ))
  }

  const isValid = () => {
    if (!startDate || !endDate) return false

    const totalDays = dayjs(endDate).diff(dayjs(startDate), 'day') + 1
    let allocatedDays = 0

    for (let schedule of citySchedules) {
      if (!schedule.city || !schedule.startDate || !schedule.endDate) return false
      const days = dayjs(schedule.endDate).diff(dayjs(schedule.startDate), 'day') + 1
      allocatedDays += days
    }

    return allocatedDays === totalDays
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="text-sm text-text-soft mb-2">
        총 여행 기간: {dayjs(endDate).diff(dayjs(startDate), 'day') + 1}일
      </div>

      {citySchedules.map((schedule, index) => (
        <div key={schedule.id} className="p-4 border border-primary-dark/20 rounded-lg bg-white/50">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-semibold text-text">도시 {index + 1}</span>
            {index > 0 && (
              <button
                type="button"
                onClick={() => removeCitySchedule(schedule.id)}
                className="ml-auto text-lg hover:scale-110 transition-transform"
                title="삭제"
              >
                🗑️
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-text mb-1">도시</label>
              <select
                value={schedule.city}
                onChange={e => {
                  const selectedCity = cities.find(c => c.city_name === e.target.value)
                  // city(city_name 영문명)와 ko_name(한글명) 모두 저장
                  setCitySchedules(citySchedules.map(s =>
                    s.id === schedule.id
                      ? { ...s, city: e.target.value, ko_name: selectedCity?.ko_name }
                      : s
                  ))
                }}
                required
                className="w-full px-3 py-2 rounded-lg border border-primary-dark/20 bg-white text-text text-sm focus:outline-none focus:border-primary"
                disabled={!country}
              >
                <option value="">도시 선택</option>
                {/* value는 city_name(영문), 화면 표시는 ko_name(한글) */}
                {cities.map(city => (
                  <option key={city.id} value={city.city_name}>{city.ko_name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text mb-1">시작일</label>
              <input
                type="date"
                value={schedule.startDate}
                onChange={e => updateCitySchedule(schedule.id, 'startDate', e.target.value)}
                min={startDate}
                max={endDate}
                required
                className="w-full px-3 py-2 rounded-lg border border-primary-dark/20 bg-white text-text text-sm focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text mb-1">종료일</label>
              <input
                type="date"
                value={schedule.endDate}
                onChange={e => updateCitySchedule(schedule.id, 'endDate', e.target.value)}
                min={schedule.startDate || startDate}
                max={endDate}
                required
                className="w-full px-3 py-2 rounded-lg border border-primary-dark/20 bg-white text-text text-sm focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {schedule.startDate && schedule.endDate && (
            <div className="text-xs text-text-soft mt-2">
              {dayjs(schedule.endDate).diff(dayjs(schedule.startDate), 'day') + 1}일
            </div>
          )}
        </div>
      ))}

      <Button
        type="button"
        variant="ghost"
        onClick={addCitySchedule}
        className="self-start"
      >
        + 도시 추가하기
      </Button>

      <Separator />

      <div className="flex gap-2">
        <Button
          variant="primary"
          onClick={onNext}
          disabled={!isValid()}
        >
          일별 스케줄 짜기
        </Button>
        <Button
          variant="ghost"
          onClick={onPrevious}
        >
          이전
        </Button>
      </div>
    </div>
  )
}
