import axios from 'axios'

const KEY = 'planit.user'

const RAW_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8090'
const BASE_URL = RAW_BASE_URL.endsWith('/') ? RAW_BASE_URL.slice(0, -1) : RAW_BASE_URL

const api = axios.create({
  baseURL: BASE_URL || undefined,
  withCredentials: true,
})

// 현재 로그인된 사용자 정보 반환
export function getUser(){
  try{ return JSON.parse(localStorage.getItem(KEY) || 'null') }catch{ return null }
}

// 로그인 여부 확인
export function isAuthed(){
  return !!getUser()?.token
}

// 이메일/비밀번호로 로그인(백엔드 연동)
export async function login(email, password){
  const form = new URLSearchParams()
  form.append('username', email)
  form.append('password', password)
  form.append('grant_type', 'password')

  const tokenRes = await api.post('/users/login', form, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })

  const accessToken = tokenRes.data?.access_token
  if(!accessToken) throw new Error('login_failed')

  let profile = null
  try{
    const me = await api.get('/users/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    profile = me.data
  }catch(err){
    console.error('프로필 조회 실패', err)
  }

  const user = {
    email,
    name: profile?.username || email.split('@')[0] || 'user',
    token: accessToken,
  }

  localStorage.setItem(KEY, JSON.stringify(user))
  return user
}

// 로그아웃(로컬스토리지 정보 삭제)
export function logout(){
  localStorage.removeItem(KEY)
}

// 사용자 정보 일부 수정
export function updateProfile(patch){
  const u = getUser() || {}
  const nu = { ...u, ...patch }
  localStorage.setItem(KEY, JSON.stringify(nu))
  return nu
}


