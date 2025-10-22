import FormField from '../components/ui/FormField'
import Button from '../components/ui/Button'

// 목업 데이터
const MOCK_COUNTRIES = ['일본', '미국', '중국']

// TripCreate1: Step 1 - 기본 정보 입력
export default function TripCreate1({
  tripName,
  setTripName,
  country,
  setCountry,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  onNext
}) {
  const isValid = tripName.trim() && country && startDate && endDate

  return (
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
        <select
          value={country}
          onChange={e => setCountry(e.target.value)}
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
          onChange={e => setStartDate(e.target.value)}
          required
        />
        <FormField
          label="도착일"
          type="date"
          value={endDate}
          onChange={e => setEndDate(e.target.value)}
          required
          min={startDate}
        />
      </div>

      <Button
        variant="primary"
        onClick={onNext}
        disabled={!isValid}
        className="mt-4"
      >
        도시 선택하기
      </Button>
    </div>
  )
}
