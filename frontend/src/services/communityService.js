import axios from 'axios'
import { getUser } from './authService'

// 커뮤니티 API 호출 전용 axios 인스턴스 설정
const RAW_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8090'
const BASE_URL = RAW_BASE_URL.endsWith('/') ? RAW_BASE_URL.slice(0, -1) : RAW_BASE_URL

const api = axios.create({
  baseURL: BASE_URL || undefined,
  withCredentials: true,
})

const DEFAULT_TRIP_ID = Number(import.meta.env.VITE_COMMUNITY_TRIP_ID || '1')

// 토큰이 있을 때만 인증 헤더 반환
function authHeaders(){
  const token = getUser()?.token
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// 이미지 원본 링크를 절대경로로 변환
function resolveUrl(path){
  return BASE_URL ? `${BASE_URL}${path}` : path
}

// 후기 목록의 정보, 좋아요/댓글/사진 정보를 한 번에 가공
export async function listPosts({ tripId = DEFAULT_TRIP_ID, limit = 12, offset = 0 } = {}){
  try{
    const response = await api.get('/reviews/', { params: { trip_id: tripId, limit, offset } })
    const items = Array.isArray(response.data) ? response.data : []

    const ordered = items.sort((a, b)=> new Date(b.created_at) - new Date(a.created_at))

    const mapped = await Promise.all(ordered.map(async (item)=>{
      const reviewId = item.review_id

      const [likeRes, commentRes, photoRes] = await Promise.all([
        api.get(`/reviews/${reviewId}/likes`, { headers: authHeaders() }).catch(()=>null),
        api.get(`/reviews/${reviewId}/comments/`, { params: { limit: 50, offset: 0 } }).catch(()=>({ data: [] })),
        api.get(`/reviews/${reviewId}/photos/`).catch(()=>({ data: [] })),
      ])

      const likeInfo = likeRes?.data || { like_count: item.like_count || 0, liked: false }
      const comments = Array.isArray(commentRes?.data)
        ? commentRes.data.map((comment)=>({
            id: comment.id,
            author: comment.user_id ? `사용자 ${comment.user_id}` : '',
            text: comment.content,
          }))
        : []

      const firstPhoto = Array.isArray(photoRes?.data) ? photoRes.data[0] : null
      const photo = firstPhoto ? resolveUrl(`/reviews/${reviewId}/photos/${firstPhoto.photo_id}/raw`) : ''

      return {
        id: reviewId,
        title: item.title,
        text: item.content,
        rating: item.rating,
        author: item.username || `사용자 ${item.user_id}`,
        likeCount: likeInfo.like_count || 0,
        liked: !!likeInfo.liked,
        comments,
        photo,
        createdAt: item.created_at,
      }
    }))

    return mapped
  }catch(error){
    console.error('listPosts 실패', error)
    throw error
  }
}

// 새 후기 작성 + 선택 사진 업로드 처리
export async function addPost({ title, content, rating, photo, tripId = DEFAULT_TRIP_ID }){
  const headers = authHeaders()
  if(!headers.Authorization) throw new Error('auth_required')

  try{
    const response = await api.post(
      '/reviews/',
      { title, content, rating },
      { params: { trip_id: tripId }, headers }
    )

    const review = response.data

    if(photo){
      const form = new FormData()
      form.append('file', photo)
      await api.post(`/reviews/${review.review_id}/photos/`, form, {
        headers: { ...headers, 'Content-Type': 'multipart/form-data' },
      }).catch((err)=>{
        console.error('사진 업로드 실패', err)
      })
    }

    return review
  }catch(error){
    console.error('addPost 실패', error)
    throw error
  }
}

// 좋아요 토글 후 최신 수치 반환
export async function toggleLike(reviewId){
  const headers = authHeaders()
  if(!headers.Authorization) throw new Error('auth_required')

  try{
    const response = await api.post(`/reviews/${reviewId}/likes`, null, { headers })
    return response.data
  }catch(error){
    console.error('toggleLike 실패', error)
    throw error
  }
}

// 댓글 등록
export async function addComment(reviewId, text){
  const headers = authHeaders()
  if(!headers.Authorization) throw new Error('auth_required')

  try{
    const response = await api.post(
      `/reviews/${reviewId}/comments/`,
      { content: text },
      { headers }
    )
    return response.data
  }catch(error){
    console.error('addComment 실패', error)
    throw error
  }
}

// 후기 삭제
export async function removePost(reviewId){
  const headers = authHeaders()
  if(!headers.Authorization) throw new Error('auth_required')

  try{
    await api.delete(`/reviews/${reviewId}`, { headers })
  }catch(error){
    console.error('removePost 실패', error)
    throw error
  }
}


