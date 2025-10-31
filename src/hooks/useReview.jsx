import { useState } from 'react'
import api from '../services/api'

export const useReview = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // 리뷰 작성 (이미지 업로드 지원)
  const createReview = async (reviewData, tripId, photoFile = null) => {
    setLoading(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append('title', reviewData.title)
      formData.append('content', reviewData.content)
      formData.append('rating', reviewData.rating)
      
      // 이미지 파일이 있으면 추가 (file -> photo로 변경)
      if (photoFile) {
        formData.append('file', photoFile)
      }


      const response = await api.post(`/reviews/?trip_id=${tripId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data
    } catch (err) {
      setError(err.response?.data?.detail || '리뷰 작성 실패')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // 리뷰 목록 조회
  const getReviews = async (tripId = null, params = {}) => {
    setLoading(true) 
    setError(null)
    try {
      const { search, limit = 100, offset = 0 } = params
      const queryParams = new URLSearchParams({ limit, offset })
      // queryParams.append('trip_id', tripId)  여행계획 종속성제거
      if (search) queryParams.append('search', search)

      const response = await api.get(`/reviews/?${queryParams}`)
      const reviewsData = response.data

      // 리뷰 데이터에 국가, 도시 한글이름 데이터 더해서 반환
      const reviews = await Promise.all(
        reviewsData.map(async (review) => {
          const response = await api.get(`/cities/${review.city_id}`)
          return {
            ...review,
            ko_name: response.data.ko_name,
            ko_country: response.data.ko_country
          }
        })
      )

      return reviews
    } catch (err) {
      setError(err.response?.data?.detail || '리뷰 목록 조회 실패')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // 리뷰 상세 조회
  const getReview = async (reviewId) => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get(`/reviews/${reviewId}`)
      return response.data
    } catch (err) {
      setError(err.response?.data?.detail || '리뷰 조회 실패')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // 리뷰 수정
  const updateReview = async (reviewId, reviewData) => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.put(`/reviews/${reviewId}`, reviewData)
      return response.data
    } catch (err) {
      setError(err.response?.data?.detail || '리뷰 수정 실패')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // 리뷰 삭제
  const deleteReview = async (reviewId) => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.delete(`/reviews/${reviewId}`)
      return response.data
    } catch (err) {
      setError(err.response?.data?.detail || '리뷰 삭제 실패')
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    createReview,
    getReviews,
    getReview,
    updateReview,
    deleteReview,
  }
}
