import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Card from '../components/Card'
import { useTrip } from '../hooks/useTrip'
import { useAuth } from '../hooks/useAuth'
import { useCity } from '../hooks/useCity'
import FormField from '../components/ui/FormField'
import Button from '../components/ui/Button'
import Separator from '../components/ui/Separator'
import dayjs from 'dayjs'

// 목업 데이터
const MOCK_COUNTRIES = ['일본', '미국', '중국']
const MOCK_CITIES = {
  '일본': ['오사카', '도쿄'],
  '미국': ['워싱턴', '뉴욕'],
  '중국': ['상하이', '베이징']
}

// TripCreate : 단계별 여행 생성 페이지
export default function TripCreate(){
  const nav = useNavigate()
  const location = useLocation()
  const [step, setStep] = useState(1) // 1: 기본정보, 2: 도시선택, 3: 일정생성

  // 기본 정보
  const [tripName, setTripName] = useState('')
  const [country, setCountry] = useState('')
  const [startDate, setStartDate] = useState(location.state?.start_date || '')
  const [endDate, setEndDate] = useState(location.state?.end_date || '')

  // 도시별 일정
  const [citySchedules, setCitySchedules] = useState([
    { id: crypto.randomUUID(), city: '', startDate: '', endDate: '' }
  ])

  const { createTrip, loading } = useTrip()
  const { getCurrentUser } = useAuth()
  const { getCityByName, createCity } = useCity()

  // Step 1 검증
  const isStep1Valid = tripName.trim() && country && startDate && endDate

  // Step 2 검증 - 모든 여행 기간이 도시로 할당되었는지
  const isStep2Valid = () => {
    if(!startDate || !endDate) return false

    const totalDays = dayjs(endDate).diff(dayjs(startDate), 'day') + 1
    let allocatedDays = 0

    for(let schedule of citySchedules) {
      if(!schedule.city || !schedule.startDate || !schedule.endDate) return false
      const days = dayjs(schedule.endDate).diff(dayjs(schedule.startDate), 'day') + 1
      allocatedDays += days
    }

    return allocatedDays === totalDays
  }

  // 선택된 날짜들
  const getSelectedDates = () => {
    const dates = new Set()
    citySchedules.forEach(schedule => {
      if(schedule.startDate && schedule.endDate) {
        let current = dayjs(schedule.startDate)
        const end = dayjs(schedule.endDate)
        while(current.isBefore(end) || current.isSame(end, 'day')) {
          dates.add(current.format('YYYY-MM-DD'))
          current = current.add(1, 'day')
        }
      }
    })
    return dates
  }

  // 날짜가 선택 가능한지 확인
  const isDateSelectable = (date, scheduleId) => {
    const selectedDates = getSelectedDates()
    const currentSchedule = citySchedules.find(s => s.id === scheduleId)

    // 현재 스케줄의 날짜는 제외
    if(currentSchedule?.startDate && currentSchedule?.endDate) {
      let current = dayjs(currentSchedule.startDate)
      const end = dayjs(currentSchedule.endDate)
      while(current.isBefore(end) || current.isSame(end, 'day')) {
        selectedDates.delete(current.format('YYYY-MM-DD'))
        current = current.add(1, 'day')
      }
    }

    return !selectedDates.has(date)
  }

  const addCitySchedule = () => {
    setCitySchedules([...citySchedules, {
      id: crypto.randomUUID(),
      city: '',
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

  const handleNext = () => {
    if(step === 1 && isStep1Valid) {
      setStep(2)
    } else if(step === 2 && isStep2Valid()) {
      setStep(3)
    }
  }

  const handleSubmit = async () => {
    try {
      const user = await getCurrentUser()

      // 첫 번째 도시를 메인 도시로 설정
      const mainCityName = citySchedules[0].city

      // Get or create main city
      let city = null
      try {
        city = await getCityByName(mainCityName)
      } catch (err) {
        city = await createCity({
          name: mainCityName,
          country: country
        })
      }

      // 여행 생성
      await createTrip({
        title: tripName,
        start_date: startDate,
        end_date: endDate,
        user_id: user.id,
        city_id: city.id
      })

      // TODO: 도시별 일정(citySchedules)을 TripDay로 저장하는 로직 추가

      nav('/trips')
    } catch (err) {
      alert('여행 생성에 실패했습니다: ' + err.message)
    }
  }

  return (
    <Card title="새 여행">
      {/* Step 1: 기본 정보 */}
      {step === 1 && (
        <div className="flex flex-col gap-4">
          <FormField
            label="여행 이름"
            value={tripName}
            onChange={e=>setTripName(e.target.value)}
            required
            placeholder="예: 일본 여행"
          />

          <div>
            <label className="block text-sm font-semibold text-text mb-2">나라 *</label>
            <select
              value={country}
              onChange={e=>setCountry(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-lg border border-primary-dark/20 bg-white text-text text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="">나라를 선택하세요</option>
              {MOCK_COUNTRIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="출발일"
              type="date"
              value={startDate}
              onChange={e=>setStartDate(e.target.value)}
              required
            />
            <FormField
              label="도착일"
              type="date"
              value={endDate}
              onChange={e=>setEndDate(e.target.value)}
              required
              min={startDate}
            />
          </div>

          <Button
            variant="primary"
            onClick={handleNext}
            disabled={!isStep1Valid}
            className="mt-4"
          >
            도시 선택하기
          </Button>
        </div>
      )}

      {/* Step 2: 도시 선택 */}
      {step === 2 && (
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
                    className="ml-auto text-xs text-red-500 hover:text-red-700"
                  >
                    삭제
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-text mb-1">도시</label>
                  <select
                    value={schedule.city}
                    onChange={e=>updateCitySchedule(schedule.id, 'city', e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-primary-dark/20 bg-white text-text text-sm focus:outline-none focus:border-primary"
                    disabled={!country}
                  >
                    <option value="">도시 선택</option>
                    {country && MOCK_CITIES[country]?.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-text mb-1">시작일</label>
                  <input
                    type="date"
                    value={schedule.startDate}
                    onChange={e=>updateCitySchedule(schedule.id, 'startDate', e.target.value)}
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
                    onChange={e=>updateCitySchedule(schedule.id, 'endDate', e.target.value)}
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
              onClick={handleNext}
              disabled={!isStep2Valid()}
            >
              일별 스케줄 짜기
            </Button>
            <Button
              variant="ghost"
              onClick={() => setStep(1)}
            >
              이전
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: 일정 생성 */}
      {step === 3 && (
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-semibold text-text">일별 스케줄</h3>
          <p className="text-sm text-text-soft">일별 세부 일정을 작성해주세요.</p>

          <Separator />

          {/* TODO: 일별 스케줄 작성 UI 추가 */}

          <div className="flex gap-2 mt-4">
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? '저장 중...' : '저장하기'}
            </Button>
            <Button
              variant="ghost"
              onClick={() => setStep(2)}
            >
              이전
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}
