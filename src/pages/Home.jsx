import Card from '../components/Card'
import { useNavigate } from 'react-router-dom'

// Home : 인기 여행지
export default function Home(){
  const nav = useNavigate()

  const goToTripEditWithCity = (cityName)=>{
    nav('/trips/new', {
      state: {
        destination: cityName
      }
    })
  }
  return (
    <div className="flex flex-col gap-6 relative z-[1]">
      <Card title="인기 여행지" subtitle="추천 여행지" className="bg-bg-widget border-primary-dark/20 shadow-md m-6">
        <div className="mt-2">
          <div className="grid gap-6 items-stretch" style={{gridTemplateColumns: 'repeat(3, minmax(0, 1fr))'}}>
            { [
              { 
                name: '발리', days: 'Starting at', price: '', rating: '4.7', 
                bg: 'bg-[linear-gradient(135deg,_#ff6b6b,_#ffa726)]',
                image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=500&q=80'
              },
              { 
                name: '두바이', days: 'Starting at', price: '', rating: '4.6', 
                bg: 'bg-[linear-gradient(135deg,_#4fc3f7,_#29b6f6)]',
                image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=500&q=80'
              },
              { 
                name: '몰디브', days: 'Starting at', price: '', rating: '4.8', 
                bg: 'bg-[linear-gradient(135deg,_#26c6da,_#00acc1)]',
                image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=500&q=80'
              },
            ].map((place, i) => (
              <div key={i} className="w-auto bg-surface rounded-xl shadow-[0_10px_26px_rgba(0,0,0,0.07)] overflow-hidden border border-primary-dark/10 transition relative hover:-translate-y-1 hover:shadow-[0_20px_46px_rgba(0,0,0,0.16)] cursor-pointer" onClick={()=>goToTripEditWithCity(place.name)}>
                <div className={`relative h-[172px] ${place.bg} bg-cover bg-center`} style={{backgroundImage: place.image ? `url(${place.image})` : 'none'}}>
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20"></div>
                  <div className="absolute top-3 right-3 bg-black/65 text-white px-2.5 py-1.5 rounded-2xl text-xs font-semibold backdrop-blur">{place.rating}★</div>
                </div>
                <div className="p-6 pt-6 flex flex-col gap-3.5">
                  <div className="font-bold text-lg text-text mb-1 leading-snug">{place.name}</div>
                  <div className="w-full min-h-[46px] mt-2 bg-gradient-primary text-white rounded-lg px-4 py-2.5 flex justify-between items-center text-sm">
                    <span>{place.days}</span>
                    {place.price && <span className="bg-lime px-2.5 py-1.5 rounded-xl font-extrabold text-xs text-black shadow-[0_5px_14px_rgba(193,255,47,0.28)]">{place.price}</span>}
                  </div>
                </div>
              </div>
            )) }
          </div>
        </div>
      </Card>
    </div>
  )
}

// // 메모 리스트 컴포넌트
// function MemoList({dateKey, onEdit, onDelete}){
//   const { listEvents } = useEvent()
//   const items = listEvents(dateKey)
//   if(items.length===0) return (
//     <Empty message="메모가 없습니다." className="!py-3 !text-xs" />
//   )
//   return (
//     <div className="flex flex-col gap-2 p-2 rounded-lg bg-white/55 backdrop-blur border border-primary-dark/10 mt-1">
//       {items.map(m=> (
//         <div key={m.id} className="p-3 rounded-xl bg-surface border border-primary-dark/12 flex flex-col gap-2">
//           <div className="text-sm font-medium text-text">{m.text}</div>
//           <div className="flex gap-2 mt-1">
//             <Button variant="ghost" size="sm" className="!bg-gradient-primary !text-white !border-0" onClick={()=>onEdit(m.id)}>수정</Button>
//             <Button variant="danger" size="sm" onClick={()=>onDelete(m.id)}>삭제</Button>
//           </div>
//         </div>
//       ))}
//     </div>
//   )
// }