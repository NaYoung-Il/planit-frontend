import { useCallback, useEffect, useRef, useState } from 'react'
import dayjs from 'dayjs'
import Card from '../components/Card'
import { useReview } from '../hooks/useReview'
import { useComment } from '../hooks/useComment'
import { useLike } from '../hooks/useLike'
import { useAuth } from '../hooks/useAuth'
import { useTrip } from '../hooks/useTrip'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Empty from '../components/ui/Empty'

// 커뮤니티: 후기 작성/목록/댓글/좋아요를 모두 다루는 메인 화면
export default function Community(){
  const [title, setTitle] = useState('')
  const [text, setText] = useState('')
  const [rating, setRating] = useState(5)
  const [selectedTripId, setSelectedTripId] = useState('')
  const [photoPreview, setPhotoPreview] = useState('')
  const [photoFile, setPhotoFile] = useState(null)
  const [fileName, setFileName] = useState('')
  const [posts, setPosts] = useState([])
  const [userTrips, setUserTrips] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [currentUser, setCurrentUser] = useState(null)
  const fileRef = useRef(null)

  const { createReview, getReviews, deleteReview } = useReview()
  const { createComment } = useComment()
  const { toggleLike: toggleLikeHook } = useLike()
  const { getCurrentUser } = useAuth()
  const { getTripsByUser } = useTrip()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getCurrentUser()
        setCurrentUser(user)
        // 사용자의 여행 목록 가져오기
        const trips = await getTripsByUser(user.id)
        setUserTrips(trips)
        if(trips.length > 0) setSelectedTripId(trips[0].id)
      } catch (err) {
        setCurrentUser(null)
      }
    }
    fetchUser()
  }, [])

  const isAuthed = !!currentUser

  const requireAuth = ()=>{
    if(!currentUser){
      alert('로그인이 필요합니다.')
      return null
    }
    return currentUser
  }

  // 후기 목록을 새로 불러오는 함수
  const refresh = useCallback(async ()=>{
    if(!selectedTripId) return
    setLoading(true)
    setError('')
    try{
      const data = await getReviews(selectedTripId)
      setPosts(Array.isArray(data) ? data : [])
    }catch(err){
      console.error(err)
      setError('게시글을 불러오지 못했습니다.')
      setPosts([])
    }finally{
      setLoading(false)
    }
  }, [selectedTripId])

  useEffect(()=>{ refresh() }, [refresh])

  useEffect(()=>()=>{ if(photoPreview) URL.revokeObjectURL(photoPreview) }, [photoPreview])

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
    if(!selectedTripId) {
      alert('여행 계획을 선택해주세요.')
      return
    }
    if(!requireAuth()) return

    try{
      await createReview({
        title: title.trim(),
        content: text.trim(),
        rating,
      }, selectedTripId, photoFile)
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
      const info = await toggleLikeHook(id)
      // 백엔드 응답: { like_count, is_liked } 또는 { count, is_liked }
      const newCount = info.like_count !== undefined ? info.like_count : info.count
      const newLiked = info.is_liked !== undefined ? info.is_liked : info.liked
      setPosts(prev=> prev.map(post=> {
        const postId = post.review_id || post.id
        return postId === id ? { ...post, like_count: newCount, is_liked: newLiked } : post
      }))
    }catch(err){
      console.error(err)
      alert('좋아요 처리에 실패했습니다.')
    }
  }

  // 댓글 작성
  const comment = async (id, value)=>{
    const textValue = value.trim()
    if(!textValue) return
    if(!requireAuth()) return

    try{
      await createComment(id, { content: textValue })
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
      await deleteReview(id)
      await refresh()
    }catch(err){
      console.error(err)
      alert('게시글을 삭제할 수 없습니다.')
    }
  }

  return (
    <div className="grid gap-6 relative z-[1] mt-6 grid-cols-1">
      <div className="col-span-full">
        <Card title="새 후기">
          <form className="flex flex-col gap-3" onSubmit={submit}>
            {userTrips.length > 0 ? (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-text-soft">여행 계획 선택</label>
                <select
                  value={selectedTripId}
                  onChange={e=>setSelectedTripId(e.target.value)}
                  className="px-4 py-2.5 rounded-lg border border-primary-dark/20 bg-white text-text text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  required
                >
                  {userTrips.map(trip => (
                    <option key={trip.id} value={trip.id}>
                      {trip.title} ({trip.start_date?.split('T')[0]} ~ {trip.end_date?.split('T')[0]})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <p className="text-xs text-red-500">여행 계획을 먼저 생성해주세요.</p>
            )}
            <Input
              value={title}
              onChange={e=>setTitle(e.target.value)}
              placeholder="제목을 입력하세요"
              required
            />
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-text-soft">평점</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="text-xl text-yellow-500 transition-transform hover:scale-110 cursor-pointer"
                  >
                    {star <= rating ? '★' : '☆'}
                  </button>
                ))}
              </div>
            </div>
            <textarea
              className="w-full min-h-[160px] rounded-lg p-4 bg-white/55 backdrop-blur border border-primary-dark/12 text-text text-sm leading-relaxed resize-y outline-none transition shadow-sm focus:border-primary focus:shadow-[0_0_0_3px_rgba(16,185,129,0.18)] focus:bg-white/70 placeholder:text-text-soft/70"
              value={text}
              onChange={e=>setText(e.target.value)}
              placeholder="여행 후기를 적어주세요"
            />
            <div className="flex items-center gap-2.5 w-full max-w-[520px]">
              <button type="button" className="px-3.5 py-2.5 rounded-xl bg-gradient-primary text-white border-0 shadow-sm text-sm" onClick={()=>fileRef.current?.click()}>파일 선택</button>
              <div className="flex-1 min-h-[40px] flex items-center px-3.5 border border-primary-dark/16 rounded-xl bg-white text-text text-sm min-w-[220px]">{fileName || '선택된 파일 없음'}</div>
            </div>
            <input ref={fileRef} type="file" accept="image/*" onChange={e=>onUpload(e.target.files?.[0])} className="hidden" />
            {photoPreview && <img className="mt-2 max-h-[220px] max-w-full object-contain rounded-xl shadow" src={photoPreview} alt="preview" />}
            {!isAuthed && <p className="text-xs text-text-soft">로그인 후 등록할 수 있습니다.</p>}
            <Button variant="primary" type="submit" disabled={!isAuthed || userTrips.length === 0}>올리기</Button>
          </form>
        </Card>
      </div>

      <div className="col-span-full flex flex-col gap-6">
        {loading && <Empty message="게시글을 불러오는 중입니다." />}
        {!loading && error && <Empty message={error} />}
        {!loading && !error && posts.length === 0 && <Empty message="아직 등록된 후기가 없습니다." />}
        {!loading && !error && Array.isArray(posts) && posts.map(post=> {
          // 백엔드 응답 필드명 매핑
          const postId = post.review_id || post.id
          const author = post.username || post.author || post.user?.username 
          const content = post.content || post.text 
          const photoUrl = post.photo_url || post.photo || post.image_url 
          const comments = post.comments || []
          const likeCount = post.like_count || post.likeCount || post.likes || 0
          const liked = post.is_liked || post.liked || false
          const createdAt = post.created_at || post.createdAt
          const cityName = post.city_name || post.city?.name || post.trip?.city_name 
          
          const subtitleParts = [author]
          if(cityName) subtitleParts.push(cityName)
          if(post.rating) subtitleParts.push(`★${post.rating}`)
          if(createdAt) {
            subtitleParts.push(dayjs(createdAt).format('YYYY.MM.DD HH:mm'))
          }
          return (
            <Card
              key={postId}
              title={post.title || '제목 없음'}
              subtitle={subtitleParts.filter(Boolean).join(' · ')}
              right={<Button variant="ghost" size="sm" onClick={()=>del(postId)}>삭제</Button>}
            >
              <div className="flex flex-col gap-2.5">
                {photoUrl && <img className="w-full max-h-[360px] object-contain rounded-xl" src={photoUrl} alt="post" />}
                {content && <p className="my-2.5 whitespace-pre-line leading-relaxed">{content}</p>}
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={liked ? 'text-primary' : ''}
                    onClick={()=>like(postId)}
                  >
                    {liked ? '❤' : '♡'} {likeCount}
                  </Button>
                </div>
                <div className="flex flex-col gap-2 mt-2.5">
                  {Array.isArray(comments) && comments.map(comment=> {
                    const commentId = comment.comment_id || comment.id
                    const commentAuthor = comment.username || comment.author || comment.user?.username
                    const commentContent = comment.content || comment.text
                    return (
                      <div key={commentId} className="bg-surface border border-primary-dark/16 px-2.5 py-2 rounded-lg text-sm">
                        <b>{commentAuthor}</b> {commentContent}
                      </div>
                    )
                  })}
                  <CommentInput onSubmit={value=>comment(postId, value)} disabled={!isAuthed} />
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