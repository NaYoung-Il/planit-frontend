import { useCallback, useEffect, useRef, useState } from 'react'
import dayjs from 'dayjs'
import Card from '../components/Card'
import { addComment, addPost, listPosts, removePost, toggleLike } from '../services/communityService'
import { getUser } from '../services/authService'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Empty from '../components/ui/Empty'

// 커뮤니티: 후기 작성/목록/댓글/좋아요를 모두 다루는 메인 화면
export default function Community(){
  const [title, setTitle] = useState('')
  const [text, setText] = useState('')
  const [rating, setRating] = useState(5)
  const [photoPreview, setPhotoPreview] = useState('')
  const [photoFile, setPhotoFile] = useState(null)
  const [fileName, setFileName] = useState('')
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef(null)

  const isAuthed = !!getUser()?.token

  const requireAuth = ()=>{
    const current = getUser()
    if(!current?.token){
      alert('로그인이 필요합니다.')
      return null
    }
    return current
  }

  // 후기 목록을 새로 불러오는 함수
  const refresh = useCallback(async ()=>{
    setLoading(true)
    setError('')
    try{
      const data = await listPosts()
      setPosts(data)
    }catch(err){
      console.error(err)
      setError('게시글을 불러오지 못했습니다.')
    }finally{
      setLoading(false)
    }
  }, [])

  useEffect(()=>{ refresh() }, [refresh])

  useEffect(()=>()=>{ if(photoPreview) URL.revokeObjectURL(photoPreview) }, [photoPreview])

  // 평점 입력값을 1~5 사이로 제한
  const onRatingChange = (value)=>{
    const parsed = Number(value)
    if(Number.isNaN(parsed)){
      setRating(1)
      return
    }
    setRating(Math.min(5, Math.max(1, Math.floor(parsed))))
  }

  // 선택한 파일을 미리보기/업로드용으로 보관
  const onUpload = (file)=>{
    if(!file) return
    if(photoPreview) URL.revokeObjectURL(photoPreview)
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
    setFileName(file.name)
  }

  // 폼 초기화
  const resetForm = ()=>{
    if(photoPreview) URL.revokeObjectURL(photoPreview)
    setTitle('')
    setText('')
    setRating(5)
    setPhotoPreview('')
    setPhotoFile(null)
    setFileName('')
    if(fileRef.current) fileRef.current.value = ''
  }

  // 후기 등록 시나리오
  const submit = async (e)=>{
    e.preventDefault()
    if(!title.trim() || !text.trim()) return
    if(!requireAuth()) return

    try{
      await addPost({
        title: title.trim(),
        content: text.trim(),
        rating,
        photo: photoFile,
      })
      resetForm()
      await refresh()
    }catch(err){
      console.error(err)
      alert('게시글을 등록할 수 없습니다.')
    }
  }

  // 좋아요 토글
  const like = async (id)=>{
    if(!requireAuth()) return
    try{
      const info = await toggleLike(id)
      setPosts(prev=> prev.map(post=> post.id===id ? { ...post, likeCount: info.like_count, liked: info.liked } : post))
    }catch(err){
      console.error(err)
    }
  }

  // 댓글 작성
  const comment = async (id, value)=>{
    const textValue = value.trim()
    if(!textValue) return
    if(!requireAuth()) return

    try{
      await addComment(id, textValue)
      await refresh()
    }catch(err){
      console.error(err)
      alert('댓글을 등록할 수 없습니다.')
    }
  }

  // 후기 삭제
  const del = async (id)=>{
    if(!requireAuth()) return
    if(!window.confirm('게시글을 삭제하시겠습니까?')) return
    try{
      await removePost(id)
      await refresh()
    }catch(err){
      console.error(err)
      alert('게시글을 삭제할 수 없습니다.')
    }
  }

  return (
    <div className="grid gap-6 relative z-[1] mt-6 grid-cols-1">
      <div className="col-span-full">
        <Card title="새 후기" subtitle="사진은 선택입니다.">
          <form className="flex flex-col gap-3" onSubmit={submit}>
            <Input
              value={title}
              onChange={e=>setTitle(e.target.value)}
              placeholder="제목을 입력하세요"
              required
            />
            <div className="flex items-center gap-3 max-w-[200px]">
              <Input
                type="number"
                min={1}
                max={5}
                value={rating}
                onChange={e=>onRatingChange(e.target.value)}
                placeholder="평점 (1~5)"
              />
            </div>
            <textarea
              className="w-full min-h-[160px] rounded-lg p-4 bg-white/55 backdrop-blur border border-primary-dark/12 text-text text-sm leading-relaxed resize-y outline-none transition shadow-sm focus:border-primary focus:shadow-[0_0_0_3px_rgba(16,185,129,0.18)] focus:bg-white/70 placeholder:text-text-soft/70"
              value={text}
              onChange={e=>setText(e.target.value)}
              placeholder="여행 후기를 적어주세요..."
            />
            <div className="flex items-center gap-2.5 w-full max-w-[520px]">
              <button type="button" className="px-3.5 py-2.5 rounded-xl bg-gradient-primary text-white border-0 shadow-sm text-sm" onClick={()=>fileRef.current?.click()}>파일 선택</button>
              <div className="flex-1 min-h-[40px] flex items-center px-3.5 border border-primary-dark/16 rounded-xl bg-white text-text text-sm min-w-[220px]">{fileName || '선택된 파일 없음'}</div>
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={e=>onUpload(e.target.files?.[0])} className="hidden" />
            {photoPreview && <img className="mt-2 max-h-[220px] rounded-xl shadow" src={photoPreview} alt="preview" />}
            {!isAuthed && <p className="text-xs text-text-soft">로그인 후 등록할 수 있습니다.</p>}
            <Button variant="primary" type="submit" disabled={!isAuthed}>올리기</Button>
          </form>
        </Card>
      </div>

      <div className="col-span-full flex flex-col gap-6">
        {loading && <Empty message="게시글을 불러오는 중입니다." />}
        {!loading && error && <Empty message={error} />}
        {!loading && !error && posts.length === 0 && <Empty message="아직 등록된 후기가 없습니다." />}
        {posts.map(post=> {
          const subtitleParts = [post.author]
          if(post.rating) subtitleParts.push(`★${post.rating}`)
          if(post.createdAt) subtitleParts.push(dayjs(post.createdAt).format('YYYY.MM.DD HH:mm'))
          return (
            <Card
              key={post.id}
              title={post.title || '제목 없음'}
              subtitle={subtitleParts.filter(Boolean).join(' · ')}
              right={<Button variant="ghost" size="sm" onClick={()=>del(post.id)}>삭제</Button>}
            >
              <div className="flex flex-col gap-2.5">
                {post.photo && <img className="w-full max-h-[360px] object-cover rounded-xl" src={post.photo} alt="post" />}
                {post.text && <p className="my-2.5 whitespace-pre-line leading-relaxed">{post.text}</p>}
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={post.liked ? 'text-primary' : ''}
                    onClick={()=>like(post.id)}
                  >
                    {post.liked ? '❤' : '♡'} {post.likeCount}
                  </Button>
                </div>
                <div className="flex flex-col gap-2 mt-2.5">
                  {post.comments.map(comment=> (
                    <div key={comment.id} className="bg-surface border border-primary-dark/16 px-2.5 py-2 rounded-lg text-sm">
                      <b>{comment.author}</b> {comment.text}
                    </div>
                  ))}
                  <CommentInput onSubmit={value=>comment(post.id, value)} disabled={!isAuthed} />
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

// 댓글 입력 라인
function CommentInput({ onSubmit, disabled }){
  const [value, setValue] = useState('')
  const [pending, setPending] = useState(false)

  const submit = async ()=>{
    if(!value.trim() || pending) return
    setPending(true)
    try{
      await onSubmit(value)
      setValue('')
    }finally{
      setPending(false)
    }
  }

  return (
    <div className="flex gap-2">
      <Input
        className="flex-1"
        placeholder="댓글 달기"
        value={value}
        onChange={e=>setValue(e.target.value)}
        disabled={disabled || pending}
      />
      <Button
        variant="ghost"
        size="sm"
        disabled={disabled || pending}
        onClick={submit}
      >
        게시
      </Button>
    </div>
  )
}
