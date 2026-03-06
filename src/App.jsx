import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import RoomBuilder from './pages/RoomBuilder'
import RoomViewer from './pages/RoomViewer'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/build" element={<RoomBuilder />} />
        <Route path="/view" element={<RoomViewer />} />
      </Routes>
    </BrowserRouter>
  )
}
