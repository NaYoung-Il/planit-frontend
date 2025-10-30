import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Trips from './pages/Trips'
import TripCreate from './pages/TripCreate'
import TripInfoEdit from './pages/TripInfoEdit'
import Login from './pages/Login'
import Community from './pages/Community'
import ReviewEdit from './pages/ReviewEdit'
import Profile from './pages/Profile'
import Protected from './components/Protected'
import Signup from './pages/Signup'

// App: 앱 라우팅, 인증 보호 라우트 적용
export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/community" element={<Protected><Community/></Protected>} />
        <Route path="/community/edit/:reviewId" element={<Protected><ReviewEdit/></Protected>} />
        <Route path="/profile" element={<Protected><Profile/></Protected>} />
        <Route path="/trips" element={<Protected><Trips /></Protected>} />
        <Route path="/trips/new" element={<Protected><TripCreate /></Protected>} />
        <Route path="/trips/:id" element={<Protected><TripInfoEdit /></Protected>} />
      </Route>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

