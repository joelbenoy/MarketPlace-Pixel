// src/pages/Home.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PinInput from '../components/PinInput'
import { lookupPin } from '../utils/pinUtils'
import './Home.css'

const DEVICE_BADGES = [
    { icon: '⬡', label: 'Meta Quest' },
    { icon: '📱', label: 'Mobile' },
    { icon: '🖥️', label: 'Desktop' },
]

export default function Home() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    function handlePin(pin) {
        setError('')
        setLoading(true)

        setTimeout(() => {
            const result = lookupPin(pin)
            setLoading(false)

            if (result) {
                navigate('/view', { state: { room: result.room } })
            } else {
                setError(`Room "${pin.toUpperCase()}" not found. Try HC-DEMO to see a demo.`)
            }
        }, 600) // slight delay feels like a lookup
    }

    return (
        <div className="home-root">
            <div className="grid-bg" />

            <div className="home-content z-base">
                {/* Logo */}
                <div className="home-logo-area">
                    <span className="accent-line" style={{ width: 64, marginBottom: 20 }} />
                    <h1 className="home-logo">HOLOCART</h1>
                    <p className="home-tagline muted mono">Place it. Pin it. Share it.</p>
                </div>

                {/* Device badges */}
                <div className="home-badges">
                    {DEVICE_BADGES.map(b => (
                        <span key={b.label} className="badge">
                            {b.icon} {b.label}
                        </span>
                    ))}
                </div>

                {/* PIN card */}
                <div className="home-card card">
                    <p className="home-card-label mono muted">Enter a Room PIN</p>
                    <PinInput onSubmit={handlePin} loading={loading} error={error} />

                    <div className="home-divider">
                        <span className="mono muted" style={{ fontSize: 11 }}>OR</span>
                    </div>

                    <a
                        id="build-room-link"
                        href="/build"
                        onClick={e => { e.preventDefault(); navigate('/build') }}
                        className="btn btn-ghost w-full text-center"
                        style={{ justifyContent: 'center' }}
                    >
                        + Build Your Own Room
                    </a>
                </div>

                {/* Feature strip */}
                <div className="home-features">
                    {[
                        { title: 'No App Needed', desc: 'Runs in any browser on any device' },
                        { title: 'Real VR Support', desc: 'Enter on Meta Quest or any WebXR headset' },
                        { title: 'Instant Sharing', desc: 'Share via link — no login, no install' },
                    ].map(f => (
                        <div key={f.title} className="home-feature">
                            <span className="accent-line mb-8" style={{ width: 24 }} />
                            <strong className="home-feature-title">{f.title}</strong>
                            <p className="muted" style={{ fontSize: 13 }}>{f.desc}</p>
                        </div>
                    ))}
                </div>

                <p className="home-footer muted mono">
                    MVP Edition — Zero Database · Zero Cost · Full VR Experience
                </p>
            </div>
        </div>
    )
}
