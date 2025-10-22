import Button from '../components/ui/Button'
import Separator from '../components/ui/Separator'

// TripCreate3: Step 3 - 일정 생성
export default function TripCreate3({
  daysList,
  dayDetails,
  expandedDay,
  setExpandedDay,
  onAddCheck,
  onUpdateCheck,
  onRemoveCheck,
  onAddSchedule,
  onUpdateSchedule,
  onRemoveSchedule,
  onSubmit,
  onPrevious,
  loading
}) {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-semibold text-text">일별 스케줄</h3>
      <p className="text-sm text-text-soft">일별 세부 일정을 작성해주세요. (선택사항)</p>

      <Separator />

      {/* 일자별 목록 */}
      <div className="flex flex-col gap-3">
        {daysList.map((day) => (
          <div key={day.date} className="border border-primary-dark/20 rounded-lg bg-white overflow-hidden">
            {/* 일자 헤더 (클릭 가능) */}
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

            {/* 확장된 내용 */}
            {expandedDay === day.date && (
              <div className="px-4 py-4 border-t border-primary-dark/10 bg-white/50">
                {/* 체크리스트 섹션 */}
                <div className="mb-6">
                  <h4 className="text-md font-semibold text-text mb-3">체크리스트</h4>

                  {/* 체크리스트 항목들 */}
                  <div className="flex flex-col gap-2 mb-3">
                    {(dayDetails[day.date]?.checklists || []).map((item) => (
                      <div key={item.id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={item.is_checked}
                          onChange={(e) => onUpdateCheck(day.date, item.id, 'is_checked', e.target.checked)}
                          className="w-4 h-4 rounded border-primary-dark/20"
                        />
                        <input
                          type="text"
                          value={item.item_name}
                          onChange={(e) => onUpdateCheck(day.date, item.id, 'item_name', e.target.value)}
                          placeholder="준비물 이름"
                          className="flex-1 px-3 py-2 rounded-lg border border-primary-dark/20 bg-white text-text text-sm focus:outline-none focus:border-primary"
                        />
                        <button
                          type="button"
                          onClick={() => onRemoveCheck(day.date, item.id)}
                          className="text-lg hover:scale-110 transition-transform px-2"
                          title="삭제"
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => onAddCheck(day.date)}
                    className="text-sm"
                  >
                    + 항목 추가하기
                  </Button>
                </div>

                <Separator />

                {/* 시간별 일정 섹션 */}
                <div className="mt-6">
                  <h4 className="text-md font-semibold text-text mb-3">시간별 일정</h4>

                  {/* 일정 항목들 */}
                  <div className="flex flex-col gap-3 mb-3">
                    {(dayDetails[day.date]?.schedules || []).map((schedule) => (
                      <div key={schedule.id} className="p-3 border border-primary-dark/10 rounded-lg bg-white">
                        <div className="flex flex-col gap-2">
                          <input
                            type="text"
                            value={schedule.schedule_content}
                            onChange={(e) => onUpdateSchedule(day.date, schedule.id, 'schedule_content', e.target.value)}
                            placeholder="일정 제목"
                            className="px-3 py-2 rounded-lg border border-primary-dark/20 bg-white text-text text-sm focus:outline-none focus:border-primary font-medium"
                          />

                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="time"
                              value={schedule.start_time}
                              onChange={(e) => onUpdateSchedule(day.date, schedule.id, 'start_time', e.target.value)}
                              placeholder="시작 시간"
                              className="px-3 py-2 rounded-lg border border-primary-dark/20 bg-white text-text text-sm focus:outline-none focus:border-primary"
                            />
                            <input
                              type="time"
                              value={schedule.end_time}
                              onChange={(e) => onUpdateSchedule(day.date, schedule.id, 'end_time', e.target.value)}
                              placeholder="종료 시간"
                              className="px-3 py-2 rounded-lg border border-primary-dark/20 bg-white text-text text-sm focus:outline-none focus:border-primary"
                            />
                          </div>

                          <input
                            type="text"
                            value={schedule.place}
                            onChange={(e) => onUpdateSchedule(day.date, schedule.id, 'place', e.target.value)}
                            placeholder="장소"
                            className="px-3 py-2 rounded-lg border border-primary-dark/20 bg-white text-text text-sm focus:outline-none focus:border-primary"
                          />

                          <button
                            type="button"
                            onClick={() => onRemoveSchedule(day.date, schedule.id)}
                            className="text-lg hover:scale-110 transition-transform self-end"
                            title="삭제"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => onAddSchedule(day.date)}
                    className="text-sm"
                  >
                    + 일정 추가하기
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <Separator />

      <div className="flex gap-2 mt-4">
        <Button
          variant="primary"
          onClick={onSubmit}
          disabled={loading}
        >
          {loading ? '저장 중...' : '여행 저장하기'}
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
