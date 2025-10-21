const KEY = 'planit.trips'

function read(){
  try{ return JSON.parse(localStorage.getItem(KEY) || '[]') }catch{ return [] }
}
function write(arr){ localStorage.setItem(KEY, JSON.stringify(arr)) }

// 모든 여행 목록 반환
export function listTrips(){ return read() }
// 특정 id의 여행 정보 반환
export function getTrip(id){ return read().find(t=>t.id===id) }
// 여행 정보 저장(신규/수정)
export function saveTrip(trip){
  const arr = read()
  const i = arr.findIndex(t=> t.id===trip.id)
  if(i>=0) arr[i] = trip; else arr.push(trip)
  write(arr)
}
// 여행 정보 삭제
export function removeTrip(id){ write(read().filter(t=>t.id!==id)) }


