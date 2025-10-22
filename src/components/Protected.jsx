import { Navigate, useLocation } from 'react-router-dom'

// 인증 필요 영역 보호, 비인증 시 /login으로 리다이렉트
export default function Protected({children}){
  const token = localStorage.getItem('access_token')
  const loc = useLocation()

  if(!token){
    alert('비로그인 상태입니다. 로그인 페이지로 이동합니다.');
    return <Navigate to="/login" replace state={{ from: loc.pathname }} />
  }

  return children
}