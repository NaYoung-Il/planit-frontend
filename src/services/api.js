  import axios from 'axios'

  // API Base URL
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081'

  // Axios instance 생성
  const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  // Request Interceptor - 토큰 자동 추가
  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('access_token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )

  // Response Interceptor - 에러 처리
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      // 로그인 요청이 아닌 경우에만 401 처리
      if (error.response?.status === 401 && !error.config.url.includes('/login'))     
  {
        // 토큰 만료 시 로그아웃 처리
        localStorage.removeItem('access_token')
        window.location.href = '/login'
      }
      return Promise.reject(error)
    }
  )

  export default api