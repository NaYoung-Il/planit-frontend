import { Navigate, useLocation } from 'react-router-dom'
import { isAuthed } from '../services/authService'

// 인증 필요 영역 보호, 비인증 시 /login으로 리다이렉트
export default function Protected({children}){
  const authed = isAuthed()
  const loc = useLocation()
  if(!authed){
    return <Navigate to="/login" replace state={{ from: loc.pathname }} />
  }
  return children
}
