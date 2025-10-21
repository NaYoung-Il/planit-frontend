const KEY = 'planit.events'

function read(){ try{ return JSON.parse(localStorage.getItem(KEY)||'{}') }catch{ return {} } }
function write(obj){ localStorage.setItem(KEY, JSON.stringify(obj)) }

// 월별(YYYY-MM) 이벤트 개수 반환
export function listByMonth(ym){
  const all = read()
  const res = {}
  Object.keys(all).forEach(k=>{ if(k.startsWith(ym)) res[k] = all[k].length })
  return res
}

// 날짜별 이벤트 추가
export function addEvent(dateKey, text){
  const all = read(); const arr = all[dateKey] || []
  arr.push({ id: crypto.randomUUID(), text, created: Date.now() })
  all[dateKey] = arr; write(all)
}

// 특정 날짜의 이벤트 목록 반환
export function listEvents(dateKey){
  const all = read(); return all[dateKey] || []
}

// 이벤트 내용 수정
export function updateEvent(dateKey, id, text){
  const all = read(); const arr = all[dateKey] || []
  const i = arr.findIndex(e=>e.id===id); if(i>=0){ arr[i].text = text; write(all) }
}

// 이벤트 삭제
export function removeEvent(dateKey, id){
  const all = read(); const arr = all[dateKey] || []
  all[dateKey] = arr.filter(e=>e.id!==id); write(all)
}




