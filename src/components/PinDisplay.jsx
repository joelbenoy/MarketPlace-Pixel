// src/components/PinDisplay.jsx
import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import './PinDisplay.css'

export default function PinDisplay({ pin, shareURL, onClose }) {
    const canvasRef = useRef(null)
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        if (canvasRef.current && shareURL) {
            QRCode.toCanvas(canvasRef.current, shareURL, {
                width: 200,
                margin: 2,
                color: { dark: '#3FFFD2', light: '#0d0d1a' },
            })
        }
    }, [shareURL])

    function copyURL() {
        navigator.clipboard.writeText(shareURL).then(() => {
            setCopied(true)
            setTimeout(() => setCopied(false), 2500)
        })
    }

    return (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="modal-box pin-display-box">
                <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>

                <span className="accent-line mb-16" />
                <p className="pin-display-label muted mono">Your Room PIN</p>
                <div id="generated-pin" className="pin-display-code mono">{pin}</div>
                <p className="pin-display-device-note muted mono">Works on this device only</p>

                <div className="pin-display-divider" />

                <p className="pin-display-share-label">Share with anyone, anywhere</p>
                <p className="pin-display-share-sub muted">Scan the QR code or copy the link — works on any device, no app needed.</p>

                <div className="pin-display-qr">
                    <canvas ref={canvasRef} />
                </div>

                <div className="pin-display-url-row">
                    <div className="pin-display-url mono">{shareURL}</div>
                    <button
                        id="copy-link-btn"
                        className={`btn btn-sm ${copied ? 'btn-copied' : ''}`}
                        onClick={copyURL}
                    >
                        {copied ? '✓ Copied!' : 'Copy Link'}
                    </button>
                </div>

                <div className="pin-display-template muted">
                    💬 "Step into my virtual room — open this link on any device or headset"
                </div>
            </div>
        </div>
    )
}
