import { Link } from 'react-router-dom'
import Card from '../components/Card'
import { useEffect, useState } from 'react'
import { listTrips, removeTrip } from '../services/storageService'
import Button from '../components/ui/Button'
import Empty from '../components/ui/Empty'

// Trips : 저장된 여행 목록 표시 및 수정 화면 이동
export default function Trips(){
  const [items, setItems] = useState([])
  useEffect(()=>{ setItems(listTrips()) },[])
  const del = (id)=>{
    removeTrip(id)
    setItems(listTrips())
  }
  return (
    <Card title="여행" right={<Link to="/trips/new"><Button>+ 새 여행</Button></Link>}>
      <div className="flex flex-col gap-3">
        {items.length===0 && <Empty message="아직 여행이 없어요. 새 여행을 추가해보세요." />}
        {items.map(t=> (
          <div key={t.id} className="p-4 rounded-lg border border-primary-dark/15 flex items-center justify-between gap-2 bg-white/55 backdrop-blur shadow-card">
            <div>
              <h4 className="text-base font-semibold text-text m-0">{t.name}</h4>
              <div className="text-xs text-text-soft flex gap-3 mt-1">{t.city} · {t.start} ~ {t.end}</div>
            </div>
            <div className="flex gap-2">
              <Link to={`/trips/${t.id}`}><Button variant="ghost" size="sm">수정</Button></Link>
              <Button variant="danger" size="sm" onClick={()=>del(t.id)}>삭제</Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
