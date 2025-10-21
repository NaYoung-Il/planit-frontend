import { useState } from 'react'

const KEY = 'planit.events'

function read(){
  try{
    return JSON.parse(localStorage.getItem(KEY)||'{}')
  } catch {
    return {}
  }
}

function write(obj){
  localStorage.setItem(KEY, JSON.stringify(obj))
}

export const useEvent = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // 월별(YYYY-MM) 이벤트 개수 반환
  const listByMonth = (ym) => {
    try {
      const all = read()
      const res = {}
      Object.keys(all).forEach(k => {
        if(k.startsWith(ym)) res[k] = all[k].length
      })
      return res
    } catch (err) {
      setError('이벤트 목록 조회 실패')
      return {}
    }
  }

  // 날짜별 이벤트 추가
  const addEvent = (dateKey, text) => {
    try {
      setLoading(true)
      setError(null)
      const all = read()
      const arr = all[dateKey] || []
      arr.push({ id: crypto.randomUUID(), text, created: Date.now() })
      all[dateKey] = arr
      write(all)
      return true
    } catch (err) {
      setError('이벤트 추가 실패')
      return false
    } finally {
      setLoading(false)
    }
  }

  // 특정 날짜의 이벤트 목록 반환
  const listEvents = (dateKey) => {
    try {
      const all = read()
      return all[dateKey] || []
    } catch (err) {
      setError('이벤트 목록 조회 실패')
      return []
    }
  }

  // 이벤트 내용 수정
  const updateEvent = (dateKey, id, text) => {
    try {
      setLoading(true)
      setError(null)
      const all = read()
      const arr = all[dateKey] || []
      const i = arr.findIndex(e => e.id === id)
      if(i >= 0) {
        arr[i].text = text
        write(all)
        return true
      }
      return false
    } catch (err) {
      setError('이벤트 수정 실패')
      return false
    } finally {
      setLoading(false)
    }
  }

  // 이벤트 삭제
  const removeEvent = (dateKey, id) => {
    try {
      setLoading(true)
      setError(null)
      const all = read()
      const arr = all[dateKey] || []
      all[dateKey] = arr.filter(e => e.id !== id)
      write(all)
      return true
    } catch (err) {
      setError('이벤트 삭제 실패')
      return false
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    listByMonth,
    addEvent,
    listEvents,
    updateEvent,
    removeEvent,
  }
}
