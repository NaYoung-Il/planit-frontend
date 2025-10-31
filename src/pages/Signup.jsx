import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import FormField from '../components/ui/FormField'
import Button from '../components/ui/Button'

// Signup: Backend API를 이용한 회원가입
export default function Signup(){
  const [username, setUsername] = useState('')
  const [email,setEmail] = useState('')
  const [pw,setPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const nav = useNavigate()
  const { signup, loading, error } = useAuth()

  const submit = async (e)=>{
    e.preventDefault()
    setErrorMsg('')

    if (pw !== confirmPw) {
      setErrorMsg('비밀번호가 일치하지 않습니다.')
      return
    }

    try {
      await signup(username, email, pw)
      nav('/login', { replace: true })
    } catch (err) {
      setErrorMsg(error || '회원가입에 실패했습니다.')
    }
  }

  return (
    <div className="min-h-dvh grid place-items-center p-12 px-4">
      {/* <img className="object-contain self-end w-20 m-6 cursor-pointer transition hover:scale-105" src="http://localhost:8081/reviews/1/photos/3/raw" onClick={()=>nav('/')}/> */}
      <div className="font-bold text-xl self-end mb-6 text-sidebar-brand cursor-pointer transition hover:scale-105" style={{filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.08))'}} onClick={()=>nav('/')}>Plan‑it</div>
      <form className="w-[380px] self-start max-w-full bg-surface border border-primary-dark/18 shadow-[0_10px_28px_rgba(16,185,129,0.08)] rounded-lg backdrop-blur" onSubmit={submit}>
        <div className="p-5 pt-5 pb-0">
          <h3 className="m-0 text-base font-bold text-text">회원가입</h3>
        </div>
        <div className="p-5 pt-4 pb-6 flex flex-col gap-3.5">
          <FormField
            label="username"
            type="text"
            value={username}
            onChange={e=>setUsername(e.target.value)}
            required
          />
          <FormField
            label="email"
            type="email"
            value={email}
            onChange={e=>setEmail(e.target.value)}
            required
          />
          <FormField
            label="password"
            type="password"
            value={pw}
            onChange={e=>setPw(e.target.value)}
            required
          />
          <FormField
            label="비밀번호 확인"
            type="password"
            value={confirmPw}
            onChange={e=>setConfirmPw(e.target.value)}
            required
          />
          {errorMsg && <div className="text-red-500 text-xs">{errorMsg}</div>}
          <Button variant="primary" type="submit" disabled={loading} className="w-full h-11 !text-sm !font-semibold tracking-wide">
            {loading ? '가입 중...' : '가입하기'}
          </Button>
          <div className="text-center text-sm text-text/70">
            계정이 있으신가요? <button type="button" onClick={() => nav('/login')} className="text-primary hover:underline font-medium">로그인</button>
          </div>
        </div>
      </form>
    </div>
  )
}
