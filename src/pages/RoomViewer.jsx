// src/pages/RoomViewer.jsx
// Loads room data from: 1) URL ?room= param, 2) React Router state, 3) PIN lookup
// Then passes room to VRScene for rendering.

import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import VRScene from '../components/VRScene'
import { decodeRoomFromURL } from '../utils/roomUrl'
import './RoomViewer.css'

export default function RoomViewer() {
    const location = useLocation()
    const navigate = useNavigate()
    const [room, setRoom] = useState(null)
    const [err, setErr] = useState('')

    useEffect(() => {
        // Priority 1: URL ?room= param (cross-device shareable)
        const urlRoom = decodeRoomFromURL()
        if (urlRoom) {
            setRoom(urlRoom)
            return
        }

        // Priority 2: React Router state (same-device PIN lookup)
        if (location.state?.room) {
            setRoom(location.state.room)
            return
        }

        setErr('No room data found. Return to home and enter a PIN or open a share link.')
    }, [])

    if (err) {
        return (
            <div className="viewer-error">
                <div className="grid-bg" />
                <div className="viewer-error-box card z-base">
                    <span className="accent-line mb-16" />
                    <h2 style={{ fontFamily: 'var(--font-head)', marginBottom: 12 }}>Room Not Found</h2>
                    <p className="muted" style={{ marginBottom: 24 }}>{err}</p>
                    <button className="btn" onClick={() => navigate('/')}>← Back to Home</button>
                </div>
            </div>
        )
    }

    if (!room) {
        return (
            <div className="viewer-loading">
                <span className="spinner" style={{ width: 40, height: 40, borderWidth: 3 }} />
                <p className="mono muted mt-16">Loading room…</p>
            </div>
        )
    }

    return (
        <div className="viewer-root">
            {/* Back button */}
            <button
                id="viewer-back-btn"
                className="viewer-back btn btn-ghost btn-sm"
                onClick={() => navigate('/')}
            >
                ← Home
            </button>

            <VRScene room={room} showHUD={true} />
        </div>
    )
}
