import { useState } from 'react'
import api from '../services/api'

export const useAuth = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // 회원가입
  const signup = async (username, email, password) => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.post('/users/join', { username, email, password })
      return response.data
    } catch (err) {
      setError(err.response?.data?.detail || '회원가입 실패')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // 로그인
  const login = async (email, password) => {
    setLoading(true)
    setError(null)
    try {
      const formData = new URLSearchParams()
      formData.append('username', email)
      formData.append('password', password)

      const response = await api.post('/users/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      })

      const { access_token } = response.data
      localStorage.setItem('access_token', access_token)
      return response.data
    } catch (err) {
      setError(err.response?.data?.detail || '로그인 실패')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // 로그아웃
  const logout = () => {
    localStorage.removeItem('access_token')
  }

  // 현재 사용자 정보 조회
  const getCurrentUser = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get('/users/me')
      return response.data
    } catch (err) {
      setError(err.response?.data?.detail || '사용자 정보 조회 실패')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // 모든 사용자 조회
  const getAllUsers = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get('/users/')
      return response.data
    } catch (err) {
      setError(err.response?.data?.detail || '사용자 목록 조회 실패')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // 사용자 정보 수정
  const updateUser = async (userData) => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.patch('/users/me', userData)
      return response.data
    } catch (err) {
      setError(err.response?.data?.detail || '사용자 정보 수정 실패')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // 회원 탈퇴
  const deleteUser = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.delete('/users/me')
      localStorage.removeItem('access_token')
      return response.data
    } catch (err) {
      setError(err.response?.data?.detail || '회원 탈퇴 실패')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // 프로필 사진 업로드
  const uploadAvatar = async (file) => {
    setLoading(true)
    setError(null)
    try {
      // 백엔드 API 완성 후 주석 해제
      // const formData = new FormData()
      // formData.append('file', file)
      // const response = await api.post('/users/me/avatar', formData, {
      //   headers: { 'Content-Type': 'multipart/form-data' }
      // })
      // return response.data

      // 임시: 로컬 미리보기만 (백엔드 API 완성 되면 삭제 예정)
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = () => resolve({ avatar_url: reader.result })
        reader.readAsDataURL(file)
      })
    } catch (err) {
      setError(err.response?.data?.detail || '프로필 사진 업로드 실패')
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    signup,
    login,
    logout,
    getCurrentUser,
    getAllUsers,
    updateUser,
    deleteUser,
    uploadAvatar,
  }
}
