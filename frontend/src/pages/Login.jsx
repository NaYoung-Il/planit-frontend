import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { login } from '../services/authService'
import FormField from '../components/ui/FormField'
import Button from '../components/ui/Button'

// Login: 클라이언트 localStorage를 이용한 목업 로그인
export default function Login(){
  const [email,setEmail] = useState('')
  const [pw,setPw] = useState('')
  const [error,setError] = useState('')
  const [loading,setLoading] = useState(false)
  const nav = useNavigate()
  const loc = useLocation()
  const submit = async (e)=>{
    e.preventDefault()
    setError('')
    setLoading(true)
    try{
      await login(email, pw)
      const back = loc.state?.from || '/'
      nav(back, { replace: true })
    }catch(err){
      console.error('로그인 실패', err)
      setError('로그인에 실패했어요. 이메일/비밀번호를 다시 확인해주세요.')
    }finally{
      setLoading(false)
    }
  }
  return (
    <div className="min-h-dvh grid place-items-center p-12 px-4">
      <form className="w-[380px] max-w-full bg-surface border border-primary-dark/18 shadow-[0_10px_28px_rgba(16,185,129,0.08)] rounded-lg backdrop-blur" onSubmit={submit}>
        <div className="p-5 pt-5 pb-0">
          <h3 className="m-0 text-base font-bold text-text">로그인</h3>
        </div>
        <div className="p-5 pt-4 pb-6 flex flex-col gap-3.5">
          {error ? <p className="text-sm text-danger font-medium">{error}</p> : null}
          <FormField
            label="이메일"
            type="email"
            value={email}
            onChange={e=>setEmail(e.target.value)}
            required
          />
          <FormField
            label="비밀번호"
            type="password"
            value={pw}
            onChange={e=>setPw(e.target.value)}
            required
          />
          <Button variant="primary" type="submit" className="w-full h-11 !text-sm !font-semibold tracking-wide" disabled={loading}>
            {loading ? '로그인 중...' : '로그인'}
          </Button>
        </div>
      </form>
    </div>
  )
}
