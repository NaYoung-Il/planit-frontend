import { Link } from 'react-router-dom'
import Card from '../components/Card'
import { useEffect, useState } from 'react'
import { useTrip } from '../hooks/useTrip'
import { useAuth } from '../hooks/useAuth'
import { useCity } from '../hooks/useCity'
import Button from '../components/ui/Button'
import Empty from '../components/ui/Empty'

// Trips : 저장된 여행 목록 표시 및 수정 화면 이동
export default function Trips(){
  const [items, setItems] = useState([])
  const { getTripsByUser, getTrip, deleteTrip, loading } = useTrip()
  const { getCurrentUser } = useAuth()
  const { getCity } = useCity()

  useEffect(()=>{
    const fetchTrips = async () => {
      try {
        const user = await getCurrentUser()
        const trips = await getTripsByUser(user.id)

        // 각 여행의 도시 이름 가져오기
        const tripsWithCity = await Promise.all(
          trips.map(async (trip) => {
            try {
              const tripDetails = await getTrip(trip.id)
              const city = await getCity(tripDetails.city_id)
              return { ...trip, city_name: city.city_name }
            } catch (err) {
              console.error('도시 정보 조회 실패:', err)
              return { ...trip, city_name: '' }
            }
          })
        )

        setItems(tripsWithCity)
      } catch (err) {
        console.error('여행 목록 조회 실패:', err)
      }
    }
    fetchTrips()
  }, [])

  const del = async (id)=>{
    try {
      await deleteTrip(id)
      const user = await getCurrentUser()
      const trips = await getTripsByUser(user.id)

      // 각 여행의 도시 이름 가져오기
      const tripsWithCity = await Promise.all(
        trips.map(async (trip) => {
          try {
            const tripDetails = await getTrip(trip.id)
            const city = await getCity(tripDetails.city_id)
            return { ...trip, city_name: city.city_name }
          } catch (err) {
            console.error('도시 정보 조회 실패:', err)
            return { ...trip, city_name: '' }
          }
        })
      )

      setItems(tripsWithCity)
    } catch (err) {
      alert('여행 삭제에 실패했습니다')
    }
  }
  return (
    <Card className='m-6' title="여행" right={<Link to="/trips/new"><Button>+ 새 여행</Button></Link>}>
      <div className="flex flex-col gap-3">
        {loading && <div className="text-center text-text-soft">로딩 중...</div>}
        {!loading && items.length===0 && <Empty message="아직 여행이 없어요. 새 여행을 추가해보세요." />}
        {!loading && items.map(t=> (
          <Link key={t.id} to={`/trips/${t.id}`} className="block">
            <div className="p-4 rounded-lg border border-primary-dark/15 flex items-center justify-between gap-2 bg-white/55 backdrop-blur shadow-card hover:shadow-lg hover:border-primary-dark/30 transition-all cursor-pointer">
              <div>
                <h4 className="text-base font-semibold text-text m-0">{t.title || t.name}</h4>
                <div className="text-xs text-text-soft flex gap-3 mt-1">{t.city_name} · {(t.start_date || t.start).split('T')[0]} ~ {(t.end_date || t.end).split('T')[0]}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </Card>
  )
}
