import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Card from '../components/Card'
import Button from '../components/ui/Button'
import FormField from '../components/ui/FormField'
import Separator from '../components/ui/Separator'
import { useTrip } from '../hooks/useTrip'
import { useCity } from '../hooks/useCity'
import { useAuth } from '../hooks/useAuth'
import dayjs from 'dayjs'

const MOCK_COUNTRIES = ['일본', '미국', '중국']
const MOCK_CITIES = {
  '일본': ['오사카', '도쿄'],
  '미국': ['워싱턴', '뉴욕'],
  '중국': ['상하이', '베이징']
}

export default function TripInfoEdit() {
  const nav = useNavigate()
  const { id } = useParams()
  const [isEditMode, setIsEditMode] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [hasResetWarningShown, setHasResetWarningShown] = useState(false)

  // Step 1: 기본 정보
  const [tripName, setTripName] = useState('')
  const [country, setCountry] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // Step 2: 도시별 일정
  const [citySchedules, setCitySchedules] = useState([
    { id: crypto.randomUUID(), city: '', startDate: '', endDate: '' }
  ])

  // Step 3: 일자별 상세 일정
  const [dayDetails, setDayDetails] = useState({})
  const [expandedDay, setExpandedDay] = useState(null)
  const [tripDays, setTripDays] = useState([])

  // 원본 데이터 보관 (변경 감지용)
  const [originalData, setOriginalData] = useState({
    startDate: '',
    endDate: '',
    citySchedules: []
  })

  const {
    getTrip,
    getTripDays,
    getSchedulesByDay,
    getChecklistItemsByTrip,
    updateTrip,
    deleteTrip,
    createTripDay,
    createSchedule,
    createChecklistItem,
    updateSchedule,
    updateChecklistItem,
    deleteSchedule,
    deleteChecklistItem,
    loading
  } = useTrip()
  const { getCity } = useCity()
  const { getCurrentUser } = useAuth()

  // 데이터 로드
  useEffect(() => {
    loadTripData()
  }, [id])

  const loadTripData = async () => {
    try {
      setIsLoadingData(true)

      const trip = await getTrip(id)
      setTripName(trip.title)
      setCountry(trip.country || 'trip.country')
      setStartDate(trip.start_date)
      setEndDate(trip.end_date)

      const fetchedTripDays = await getTripDays(id)
      setTripDays(fetchedTripDays)

      // citySchedules 복원 (현재 백엔드 구조상 Trip의 city_id만 사용 가능)
      const city = await getCity(trip.city_id)
      const cityName = city.city_name

      // TripDay 날짜 범위로 citySchedules 추정
      const restoredCitySchedules = fetchedTripDays.length > 0 ? [{
        id: crypto.randomUUID(),
        city: cityName,
        startDate: fetchedTripDays[0].day_date,
        endDate: fetchedTripDays[fetchedTripDays.length - 1].day_date
      }] : [{ id: crypto.randomUUID(), city: '', startDate: '', endDate: '' }]

      setCitySchedules(restoredCitySchedules)

      // // citySchedules 복원 (TripDay에서 도시 정보 가져오기) - TripDay에 city_id 없음
      // const citySchedulesMap = {}
      // for (const tripDay of fetchedTripDays) {
      //   const city = await getCity(tripDay.city_id)
      //   const cityName = city.city_name

      //   if (!citySchedulesMap[cityName]) {
      //     citySchedulesMap[cityName] = {
      //       id: crypto.randomUUID(),
      //       city: cityName,
      //       startDate: tripDay.day_date,
      //       endDate: tripDay.day_date
      //     }
      //   } else {
      //     citySchedulesMap[cityName].endDate = tripDay.day_date
      //   }
      // }

      // const restoredCitySchedules = Object.values(citySchedulesMap)
      // setCitySchedules(restoredCitySchedules.length > 0 ? restoredCitySchedules : [{ id: crypto.randomUUID(), city: '', startDate: '', endDate: '' }])

      // 원본 데이터 저장
      setOriginalData({
        startDate: trip.start_date,
        endDate: trip.end_date,
        citySchedules: JSON.parse(JSON.stringify(restoredCitySchedules))
      })

      const checklists = await getChecklistItemsByTrip(id)
      const allDayDetails = {}

      for (const tripDay of fetchedTripDays) {
        const date = tripDay.day_date
        const schedules = await getSchedulesByDay(tripDay.id)

        allDayDetails[date] = {
          tripDayId: tripDay.id,
          checklists: checklists.map(item => ({
            ...item,
            id: item.id || crypto.randomUUID(),
            isNew: false
          })),
          schedules: schedules.map(schedule => ({
            ...schedule,
            id: schedule.id || crypto.randomUUID(),
            start_time: schedule.start_time || '',
            end_time: schedule.end_time || '',
            place: schedule.place_id || '',
            isNew: false
          }))
        }
      }

      setDayDetails(allDayDetails)
    } catch (err) {
      console.error('여행 데이터 로드 실패:', err)
      alert('여행 데이터를 불러오는데 실패했습니다.')
      nav('/trips')
    } finally {
      setIsLoadingData(false)
    }
  }

  // 일자별 목록 생성
  const getDaysList = () => {
    const days = []
    citySchedules.forEach(schedule => {
      if (schedule.startDate && schedule.endDate && schedule.city) {
        let current = dayjs(schedule.startDate)
        const end = dayjs(schedule.endDate)
        while (current.isBefore(end) || current.isSame(end, 'day')) {
          days.push({
            date: current.format('YYYY-MM-DD'),
            city: schedule.city,
            dayNumber: days.length + 1
          })
          current = current.add(1, 'day')
        }
      }
    })
    return days
  }

  // 일정 초기화 확인
  const checkAndResetSchedule = (field) => {
    if (!isEditMode) return true

    const message = '수정 시 일자별 세부일정이 초기화됩니다. 계속 진행하시겠습니까?'
    const confirmed = window.confirm(message)

    if (confirmed) {
      setDayDetails({})
      setHasResetWarningShown(true)
    }

    return confirmed
  }

  // Step 1 핸들러
  const handleStartDateChange = (e) => {
    if (originalData.startDate !== e.target.value) {
      if (checkAndResetSchedule('startDate')) {
        setStartDate(e.target.value)
      }
    } else {
      setStartDate(e.target.value)
    }
  }

  const handleEndDateChange = (e) => {
    if (originalData.endDate !== e.target.value) {
      if (checkAndResetSchedule('endDate')) {
        setEndDate(e.target.value)
      }
    } else {
      setEndDate(e.target.value)
    }
  }

  // Step 2 핸들러
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
    if (checkAndResetSchedule('citySchedule')) {
      // 초기화 진행
    }
  }

  const updateCitySchedule = (id, field, value) => {
    const oldSchedule = citySchedules.find(s => s.id === id)
    const originalSchedule = originalData.citySchedules.find(s => s.city === oldSchedule.city)

    let needsReset = false
    if (originalSchedule) {
      if (field === 'city' && originalSchedule.city !== value) needsReset = true
      if (field === 'startDate' && originalSchedule.startDate !== value) needsReset = true
      if (field === 'endDate' && originalSchedule.endDate !== value) needsReset = true
    }

    if (needsReset && !checkAndResetSchedule('citySchedule')) {
      return
    }

    setCitySchedules(citySchedules.map(s =>
      s.id === id ? { ...s, [field]: value } : s
    ))
  }

  // Step 3 핸들러
  const addCheck = (date) => {
    setDayDetails(prev => ({
      ...prev,
      [date]: {
        ...prev[date],
        checklists: [
          ...(prev[date]?.checklists || []),
          { id: crypto.randomUUID(), is_checked: false, item_name: '', isNew: true }
        ]
      }
    }))
  }

  const handleUpdateCheck = (date, itemId, field, value) => {
    setDayDetails(prev => ({
      ...prev,
      [date]: {
        ...prev[date],
        checklists: (prev[date]?.checklists || []).map(item =>
          item.id === itemId ? { ...item, [field]: value } : item
        )
      }
    }))
  }

  const handleRemoveCheck = (date, itemId) => {
    setDayDetails(prev => ({
      ...prev,
      [date]: {
        ...prev[date],
        checklists: (prev[date]?.checklists || []).filter(item => item.id !== itemId)
      }
    }))
  }

  const addSchedule = (date) => {
    setDayDetails(prev => ({
      ...prev,
      [date]: {
        ...prev[date],
        schedules: [
          ...(prev[date]?.schedules || []),
          { id: crypto.randomUUID(), schedule_content: '', start_time: '', end_time: '', place: '', isNew: true }
        ]
      }
    }))
  }

  const handleUpdateSchedule = (date, itemId, field, value) => {
    setDayDetails(prev => ({
      ...prev,
      [date]: {
        ...prev[date],
        schedules: (prev[date]?.schedules || []).map(item =>
          item.id === itemId ? { ...item, [field]: value } : item
        )
      }
    }))
  }

  const handleRemoveSchedule = (date, itemId) => {
    setDayDetails(prev => ({
      ...prev,
      [date]: {
        ...prev[date],
        schedules: (prev[date]?.schedules || []).filter(item => item.id !== itemId)
      }
    }))
  }

  // 삭제
  const handleDelete = async () => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return

    try {
      await deleteTrip(id)
      alert('여행이 삭제되었습니다.')
      nav('/trips')
    } catch (err) {
      console.error('여행 삭제 실패:', err)
      alert('여행 삭제에 실패했습니다.')
    }
  }

  // 수정 완료
  const handleSubmit = async () => {
    try {
      const user = await getCurrentUser()

      // 여행 기본 정보 수정
      await updateTrip(id, {
        title: tripName,
        start_date: startDate,
        end_date: endDate,
        user_id: user.id,
        city_id: (await getTrip(id)).city_id
      })

      // 일자/도시 변경 시 TripDay, Schedule, ChecklistItem 전부 삭제 후 재생성
      const hasDateOrCityChanged =
        originalData.startDate !== startDate ||
        originalData.endDate !== endDate ||
        JSON.stringify(originalData.citySchedules) !== JSON.stringify(citySchedules)

      if (hasDateOrCityChanged) {
        // 기존 데이터 삭제
        for (const tripDay of tripDays) {
          const schedules = await getSchedulesByDay(tripDay.id)
          for (const schedule of schedules) {
            await deleteSchedule(schedule.id)
          }
        }

        const checklists = await getChecklistItemsByTrip(id)
        for (const checklist of checklists) {
          await deleteChecklistItem(checklist.id)
        }

        // TripDay는 백엔드에서 cascade delete되지 않으므로 직접 삭제 필요 (API 확인 필요)
        // 여기서는 재생성만 진행

        // 새로운 데이터 생성
        const daysList = getDaysList()
        for (const day of daysList) {
          const tripDay = await createTripDay({
            trip_id: parseInt(id),
            day_sequence: day.dayNumber,
            day_date: day.date
          })

          const checklists = dayDetails[day.date]?.checklists || []
          for (const item of checklists) {
            if (item.item_name.trim()) {
              await createChecklistItem({
                trip_id: parseInt(id),
                item_name: item.item_name,
                is_checked: item.is_checked
              })
            }
          }

          const schedules = dayDetails[day.date]?.schedules || []
          for (const schedule of schedules) {
            if (schedule.schedule_content.trim()) {
              await createSchedule({
                trip_day_id: tripDay.id,
                schedule_content: schedule.schedule_content,
                start_time: schedule.start_time || null,
                end_time: schedule.end_time || null,
                place_id: null,
                schedule_datetime: new Date().toISOString()
              })
            }
          }
        }
      } else {
        // 체크리스트, 스케줄만 수정
        for (const date in dayDetails) {
          const details = dayDetails[date]

          // 체크리스트
          for (const item of details.checklists || []) {
            if (item.isNew) {
              if (item.item_name.trim()) {
                await createChecklistItem({
                  trip_id: parseInt(id),
                  item_name: item.item_name,
                  is_checked: item.is_checked
                })
              }
            } else {
              await updateChecklistItem(item.id, {
                item_name: item.item_name,
                is_checked: item.is_checked
              })
            }
          }

          // 스케줄
          for (const schedule of details.schedules || []) {
            if (schedule.isNew) {
              if (schedule.schedule_content.trim()) {
                await createSchedule({
                  trip_day_id: details.tripDayId,
                  schedule_content: schedule.schedule_content,
                  start_time: schedule.start_time || null,
                  end_time: schedule.end_time || null,
                  place_id: null,
                  schedule_datetime: new Date().toISOString()
                })
              }
            } else {
              await updateSchedule(schedule.id, {
                schedule_content: schedule.schedule_content,
                start_time: schedule.start_time || null,
                end_time: schedule.end_time || null,
                place_id: null
              })
            }
          }
        }
      }

      alert('여행이 수정되었습니다.')
      setIsEditMode(false)
      await loadTripData()
    } catch (err) {
      console.error('여행 수정 실패:', err)
      alert('여행 수정에 실패했습니다: ' + err.message)
    }
  }

  if (isLoadingData) {
    return (
      <Card title="여행 정보" subtitle="여행 정보">
        <div className="flex justify-center items-center py-8">
          <p className="text-text-soft">데이터를 불러오는 중...</p>
        </div>
      </Card>
    )
  }

  return (
    <Card
      title={tripName}
      subtitle={isEditMode ? '여행 수정' : '여행 정보'}
      right={
        <div className="flex gap-2">
          {!isEditMode ? (
            <>
              <Button onClick={() => setIsEditMode(true)}>수정</Button>
              <button
                onClick={handleDelete}
                className="text-lg hover:scale-110 transition-transform"
                title="삭제"
              >
                🗑️
              </button>
            </>
          ) : (
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? '저장 중...' : '수정 완료'}
            </Button>
          )}
        </div>
      }
    >
      <div className="flex flex-col gap-6">
        {/* Step 1: 기본 정보 */}
        <div>
          {!isEditMode ? (
            <div className="flex flex-col gap-3">
              <div>
                <span className="text-sm text-text-soft">🚩</span>
                <p className="text-text text-lg mt-1">{country || 'trip.country'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-lg text-text-soft">🛫 출발</span>
                  <p className="text-text text-lg mt-1">{startDate?.split('T')[0]}</p>
                </div>
                <div>
                  <span className="text-lg text-text-soft">🛬 도착</span>
                  <p className="text-text text-lg mt-1">{endDate?.split('T')[0]}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <FormField
                label="여행 이름"
                value={tripName}
                onChange={e => setTripName(e.target.value)}
                required
                placeholder="예: 일본 여행"
              />
              <div>
                <label className="block text-sm font-semibold text-text mb-2">나라 *</label>
                <input
                  type="text"
                  value={country || 'trip.country'}
                  disabled
                  className="w-full px-4 py-2.5 rounded-lg border border-primary-dark/20 bg-gray-100 text-text-soft text-sm cursor-not-allowed"
                  title="나라 변경은 지원되지 않습니다. 새 여행을 생성해주세요."
                />
                <p className="text-xs text-text-soft mt-1">나라 변경은 지원되지 않습니다. 새 여행을 생성해주세요.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="출발일"
                  type="date"
                  value={startDate?.split('T')[0]}
                  onChange={handleStartDateChange}
                  required
                />
                <FormField
                  label="도착일"
                  type="date"
                  value={endDate?.split('T')[0]}
                  onChange={handleEndDateChange}
                  required
                  min={startDate?.split('T')[0]}
                />
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Step 2: 도시 선택 */}
        <div>
          <h3 className="text-lg font-semibold text-text mb-4">📍 도시별 일정</h3>
          {!isEditMode ? (
            <div className="flex flex-col gap-2">
              {citySchedules.map((schedule, index) => (
                <div key={schedule.id} className="text-text">
                  <span className="font-semibold">{schedule.city}</span>
                  <span className="text-text-soft text-sm ml-2">
                    {schedule.startDate?.split('T')[0]} ~ {schedule.endDate?.split('T')[0]}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="text-sm text-text-soft mb-4">
                총 여행 기간: {dayjs(endDate).diff(dayjs(startDate), 'day') + 1}일
              </div>
              {citySchedules.map((schedule, index) => (
                <div key={schedule.id} className="p-4 border border-primary-dark/20 rounded-lg bg-white/50 mb-3">
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
                        onChange={e => updateCitySchedule(schedule.id, 'city', e.target.value)}
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
                        value={schedule.startDate?.split('T')[0]}
                        onChange={e => updateCitySchedule(schedule.id, 'startDate', e.target.value)}
                        min={startDate?.split('T')[0]}
                        max={endDate?.split('T')[0]}
                        required
                        className="w-full px-3 py-2 rounded-lg border border-primary-dark/20 bg-white text-text text-sm focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-text mb-1">종료일</label>
                      <input
                        type="date"
                        value={schedule.endDate?.split('T')[0]}
                        onChange={e => updateCitySchedule(schedule.id, 'endDate', e.target.value)}
                        min={schedule.startDate?.split('T')[0] || startDate?.split('T')[0]}
                        max={endDate?.split('T')[0]}
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
            </>
          )}
        </div>

        <Separator />

        {/* Step 3: 일별 스케줄 */}
        <div>
          <h3 className="text-lg font-semibold text-text mb-4">일별 스케줄</h3>
          <div className="flex flex-col gap-3">
            {getDaysList().map((day) => (
              <div key={day.date} className="border border-primary-dark/20 rounded-lg bg-white overflow-hidden">
                <button
                  type="button"
                  onClick={() => setExpandedDay(expandedDay === day.date ? null : day.date)}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-primary-dark/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-text">{day.dayNumber}일차</span>
                    <span className="text-sm text-text-soft">{day.date}</span>
                    <span className="text-sm text-primary font-medium">{day.city}</span>
                  </div>
                  <span className="text-text-soft">
                    {expandedDay === day.date ? '▲' : '▼'}
                  </span>
                </button>

                {expandedDay === day.date && (
                  <div className="px-4 py-4 border-t border-primary-dark/10 bg-white/50">
                    {/* 체크리스트 */}
                    <div className="mb-6">
                      <h4 className="text-md font-semibold text-text mb-3">체크리스트</h4>
                      <div className="flex flex-col gap-2 mb-3">
                        {(dayDetails[day.date]?.checklists || []).map((item) => (
                          <div key={item.id} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={item.is_checked}
                              onChange={(e) => handleUpdateCheck(day.date, item.id, 'is_checked', e.target.checked)}
                              className="w-4 h-4 rounded border-primary-dark/20"
                              disabled={!isEditMode}
                            />
                            <input
                              type="text"
                              value={item.item_name}
                              onChange={(e) => handleUpdateCheck(day.date, item.id, 'item_name', e.target.value)}
                              placeholder="준비물 이름"
                              className="flex-1 px-3 py-2 rounded-lg border border-primary-dark/20 bg-white text-text text-sm focus:outline-none focus:border-primary"
                              disabled={!isEditMode}
                            />
                            {isEditMode && (
                              <button
                                type="button"
                                onClick={() => handleRemoveCheck(day.date, item.id)}
                                className="text-lg hover:scale-110 transition-transform px-2"
                                title="삭제"
                              >
                                🗑️
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                      {isEditMode && (
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => addCheck(day.date)}
                          className="text-sm"
                        >
                          + 항목 추가하기
                        </Button>
                      )}
                    </div>

                    <Separator />

                    {/* 시간별 일정 */}
                    <div className="mt-6">
                      <h4 className="text-md font-semibold text-text mb-3">시간별 일정</h4>
                      <div className="flex flex-col gap-3 mb-3">
                        {(dayDetails[day.date]?.schedules || []).map((schedule) => (
                          <div key={schedule.id} className="p-3 border border-primary-dark/10 rounded-lg bg-white">
                            <div className="flex flex-col gap-2">
                              <input
                                type="text"
                                value={schedule.schedule_content}
                                onChange={(e) => handleUpdateSchedule(day.date, schedule.id, 'schedule_content', e.target.value)}
                                placeholder="일정 제목"
                                className="px-3 py-2 rounded-lg border border-primary-dark/20 bg-white text-text text-sm focus:outline-none focus:border-primary font-medium"
                                disabled={!isEditMode}
                              />

                              <div className="grid grid-cols-2 gap-2">
                                <input
                                  type="time"
                                  value={schedule.start_time}
                                  onChange={(e) => handleUpdateSchedule(day.date, schedule.id, 'start_time', e.target.value)}
                                  placeholder="시작 시간"
                                  className="px-3 py-2 rounded-lg border border-primary-dark/20 bg-white text-text text-sm focus:outline-none focus:border-primary"
                                  disabled={!isEditMode}
                                />
                                <input
                                  type="time"
                                  value={schedule.end_time}
                                  onChange={(e) => handleUpdateSchedule(day.date, schedule.id, 'end_time', e.target.value)}
                                  placeholder="종료 시간"
                                  className="px-3 py-2 rounded-lg border border-primary-dark/20 bg-white text-text text-sm focus:outline-none focus:border-primary"
                                  disabled={!isEditMode}
                                />
                              </div>

                              <input
                                type="text"
                                value={schedule.place}
                                onChange={(e) => handleUpdateSchedule(day.date, schedule.id, 'place', e.target.value)}
                                placeholder="장소"
                                className="px-3 py-2 rounded-lg border border-primary-dark/20 bg-white text-text text-sm focus:outline-none focus:border-primary"
                                disabled={!isEditMode}
                              />

                              {isEditMode && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveSchedule(day.date, schedule.id)}
                                  className="text-lg hover:scale-110 transition-transform self-end"
                                  title="삭제"
                                >
                                  🗑️
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      {isEditMode && (
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => addSchedule(day.date)}
                          className="text-sm"
                        >
                          + 일정 추가하기
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}
