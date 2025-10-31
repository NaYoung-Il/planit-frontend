import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Card from '../components/Card'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import { useReview } from '../hooks/useReview'
import { useTrip } from '../hooks/useTrip'
import { useAuth } from '../hooks/useAuth'
import { usePhoto } from '../hooks/usePhoto'

export default function ReviewEdit() {
  const { reviewId } = useParams()
  const nav = useNavigate()
  const fileRef = useRef(null)

  const { getReview, updateReview } = useReview()
  const { getTripsByUser } = useTrip()
  const { getCurrentUser } = useAuth()
  const { getPhotos, uploadPhoto, deletePhoto: deletePhotoApi } = usePhoto()

  const [title, setTitle] = useState('')
  const [text, setText] = useState('')
  const [rating, setRating] = useState(5)
  const [selectedTripId, setSelectedTripId] = useState('')
  const [photoPreview, setPhotoPreview] = useState('')
  const [photoFile, setPhotoFile] = useState(null)
  const [fileName, setFileName] = useState('')
  const [userTrips, setUserTrips] = useState([])
  const [loading, setLoading] = useState(false)
  const [existingPhotoId, setExistingPhotoId] = useState(null)
  const [shouldDeletePhoto, setShouldDeletePhoto] = useState(false)

  // 리뷰 데이터 로드
  useEffect(() => {
    const loadReviewData = async () => {
      setLoading(true)
      const user = await getCurrentUser()
      const review = await getReview(reviewId)

      setTitle(review.title)
      setText(review.content)
      setRating(review.rating)
      setSelectedTripId(review.trip_id)

      if (review.photo_url) {
        setPhotoPreview(review.photo_url)
        const photos = await getPhotos(reviewId)
        setExistingPhotoId(photos[0].photo_id)
      }

      const trips = await getTripsByUser(user.id)
      setUserTrips(trips)
      setLoading(false)
    }
    loadReviewData()
  }, [reviewId])

  const onUpload = (file) => {
    setPhotoFile(file)
    setFileName(file.name)
    setPhotoPreview(URL.createObjectURL(file))
    setShouldDeletePhoto(true)
    console.log("onUpload")
  }

  const handleDeletePhoto = () => {
    setPhotoPreview('')
    setPhotoFile(null)
    setFileName('')
    setShouldDeletePhoto(true)
    console.log("handleDeletePhoto")
  }

  const handleBack = () => {
    nav('/community')
  }

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const reviewData = {
      title: title.trim(),
      content: text.trim(),
      rating,
      trip_id: parseInt(selectedTripId)
    }

    // 기존 사진이 있고 새 파일을 업로드하는 경우
    if (shouldDeletePhoto && existingPhotoId && photoFile) {
      await deletePhotoApi(reviewId, existingPhotoId)
      await uploadPhoto(reviewId, photoFile)
      await updateReview(reviewId, reviewData)
      console.log("scene 1")
    }

    // 사진만 삭제하는 경우 (새 파일 업로드 없이)
    if (shouldDeletePhoto && existingPhotoId && !photoFile) {
      await deletePhotoApi(reviewId, existingPhotoId)
      console.log("scene 2")
    }

    // 새 파일 업로드
    if (!existingPhotoId && shouldDeletePhoto && photoFile) {
      await uploadPhoto(reviewId, photoFile)
      console.log("scene 3")
    }

    setExistingPhotoId(null)
    await updateReview(reviewId, reviewData)
    setLoading(false)
    nav('/community')
  }


  return (
    <div>
      <Card
        className="m-3"
        title="후기 수정"
        right={
          <Button
            variant='ghost'
            onClick={handleBack}
            size='sm'
            title="뒤로가기"
          >
            취소
          </Button>
        }
      >
        <form className="flex flex-col gap-3" onSubmit={submit}>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-text-soft">여행 계획 선택</label>
            <select
              value={selectedTripId}
              onChange={e => setSelectedTripId(e.target.value)}
              className="px-4 py-2.5 rounded-lg border border-primary-dark/20 bg-white text-text text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              required
            >
              {userTrips.map(trip => (
                <option key={trip.id} value={trip.id}>
                  {trip.title} ({trip.start_date.split('T')[0]} ~ {trip.end_date.split('T')[0]})
                </option>
              ))}
            </select>
          </div>
          <Input
            value={title}
            onChange={e => setTitle(e.target.value)}
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
            onChange={e => setText(e.target.value)}
            placeholder="여행 후기를 적어주세요"
          />
          <div className="flex items-center gap-2.5 w-full max-w-[520px]">
            <button
              type="button"
              className="px-3.5 py-2.5 rounded-xl bg-gradient-primary text-white border-0 shadow-sm text-sm"
              onClick={() => fileRef.current?.click()}
            >
              파일 선택
            </button>
            <div className="flex-1 min-h-[40px] flex items-center px-3.5 border border-primary-dark/16 rounded-xl bg-white text-text text-sm min-w-[220px]">
              {fileName}
            </div>
            <button
              type="button"
              onClick={handleDeletePhoto}
              className="px-3.5 py-2.5 rounded-xl bg-red-500 text-white border-0 shadow-sm text-sm hover:bg-red-600 transition"
            >
              사진 삭제
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={e => onUpload(e.target.files[0])} className="hidden" />
          <img className="mt-2 max-h-[220px] max-w-full object-contain rounded-xl shadow" src={photoPreview} alt="preview" />
          <Button variant="primary" type="submit">수정 완료</Button>
        </form>
      </Card>
    </div>
  )
}
