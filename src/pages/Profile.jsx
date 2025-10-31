import Card from '../components/Card'
import { useAuth } from '../hooks/useAuth'
import { useState, useRef, useEffect } from 'react'
import FormField from '../components/ui/FormField'
import Button from '../components/ui/Button'

// Profile : 닉네임/아바타 편집
export default function Profile(){
  const { getCurrentUser, updateUser, uploadAvatar, getAvatar, deleteAvatar } = useAuth()
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getCurrentUser()
        setName(user?.username || user?.email || '')
        const savedAvatar = getAvatar()
        setAvatar(savedAvatar || '')
      } catch (err) {
        console.error('사용자 정보 조회 실패:', err)
      }
    }
    fetchUser()
  }, [])

  const save = async ()=>{
    try {
      await updateUser({ username: name })
      alert('저장되었습니다')
    } catch (err) {
      alert('저장에 실패했습니다')
    }
  }
  
  const onUpload = async (f)=>{
    if(!f) return
    setUploading(true)
    try {
      const result = await uploadAvatar(f)
      setAvatar(result.avatar_url)
    } catch (err) {
      console.error('업로드 실패:', err)
      alert('이미지 업로드에 실패했습니다')
    } finally {
      setUploading(false)
    }
  }
  
  const onDelete = () => {
    deleteAvatar()
    setAvatar('')
  }
  return (
    <Card title="프로필 편집" className="overflow-visible m-3">
      <form className="flex flex-col gap-4 max-w-[420px]" onSubmit={e=>{e.preventDefault();save()}}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl font-semibold overflow-hidden flex-shrink-0 shadow-button border-2 ${avatar ? 'bg-gradient-primary p-0.5' : 'bg-gradient-primary text-white'}`}>
            {avatar ? <img src={avatar} alt="아바타" className="w-full h-full object-cover rounded-full" /> : (name?.[0]?.toUpperCase()||'U')}
          </div>
          <div className="flex flex-col gap-5 w-full">
            <FormField
              label="닉네임"
              value={name}
              onChange={e=>setName(e.target.value)}
              className="w-full"
            />
            <div className="flex flex-col gap-2 text-xs font-semibold text-text-soft">
              <span>아바타 이미지</span>
              <div className="flex gap-2">
                <button type="button" className="px-4 py-2 rounded-lg bg-gradient-primary text-white text-xs font-semibold shadow-button hover:-translate-y-px transition" onClick={()=>fileRef.current?.click()}>이미지 선택</button>
                {avatar && (
                  <button type="button" className="px-4 py-2 rounded-lg bg-red-500 text-white text-xs font-semibold shadow-button hover:-translate-y-px transition" onClick={onDelete}>삭제</button>)}
              </div>
              <input ref={fileRef} type="file" accept="image/*" onChange={e=>onUpload(e.target.files?.[0])} className="hidden" />
            </div>
          </div>
        </div>
        <Button variant="primary" type="submit" className="mt-4">저장</Button>
      </form>
    </Card>
  )
}