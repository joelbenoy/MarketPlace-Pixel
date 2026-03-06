// src/components/PannellumViewer.jsx
// Full-screen photo overlay using Pannellum CDN (loaded in index.html)
// Renders an array of photos as a navigable equirectangular viewer.

import { useEffect, useRef, useState } from 'react'
import './PannellumViewer.css'

export default function PannellumViewer({ photos, initialIndex = 0, itemName, onClose }) {
    const containerRef = useRef(null)
    const viewerRef = useRef(null)
    const [current, setCurrent] = useState(initialIndex)
    const [loading, setLoading] = useState(true)

    function loadPhoto(index) {
        setLoading(true)
        if (viewerRef.current) {
            viewerRef.current.destroy()
            viewerRef.current = null
        }

        if (!window.pannellum || !containerRef.current) return

        viewerRef.current = window.pannellum.viewer(containerRef.current, {
            type: 'equirectangular',
            panorama: photos[index],
            autoLoad: true,
            showControls: false,
            hfov: 100,
            minHfov: 40,
            maxHfov: 140,
            mouseZoom: true,
            touchZoom: true,
            strings: { loadingLabel: '' },
        })

        viewerRef.current.on('load', () => setLoading(false))
        viewerRef.current.on('error', () => setLoading(false))
        // fallback if event doesn't fire
        setTimeout(() => setLoading(false), 2000)
    }

    useEffect(() => {
        loadPhoto(current)
        return () => { viewerRef.current?.destroy() }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    function goTo(idx) {
        const next = (idx + photos.length) % photos.length
        setCurrent(next)
        loadPhoto(next)
    }

    function handleKeyDown(e) {
        if (e.key === 'Escape') onClose()
        if (e.key === 'ArrowLeft') goTo(current - 1)
        if (e.key === 'ArrowRight') goTo(current + 1)
    }

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    })

    return (
        <div className="pannellum-overlay" role="dialog" aria-label={`Photo viewer: ${itemName}`}>
            {/* Header */}
            <div className="pannellum-header">
                <span className="mono muted pannellum-item-name">{itemName}</span>
                <span className="pannellum-photo-count mono muted">
                    {current + 1} / {photos.length}
                </span>
                <button id="pannellum-close-btn" className="btn btn-sm btn-ghost" onClick={onClose}>
                    ✕ Close
                </button>
            </div>

            {/* Main viewer */}
            <div className="pannellum-main">
                {loading && (
                    <div className="pannellum-loading">
                        <span className="spinner" />
                    </div>
                )}
                <div ref={containerRef} className="pannellum-container" />
            </div>

            {/* Nav controls */}
            {photos.length > 1 && (
                <div className="pannellum-nav">
                    <div className="pannellum-thumbnails">
                        {photos.map((src, i) => (
                            <button
                                key={i}
                                className={`pannellum-thumb ${i === current ? 'active' : ''}`}
                                onClick={() => goTo(i)}
                                aria-label={`Photo ${i + 1}`}
                            >
                                <img src={src} alt={`Photo ${i + 1}`} loading="lazy" />
                            </button>
                        ))}
                    </div>
                    <div className="pannellum-arrows">
                        <button
                            id="pannellum-prev-btn"
                            className="btn btn-ghost btn-sm"
                            onClick={() => goTo(current - 1)}
                            aria-label="Previous photo"
                        >
                            ← Prev
                        </button>
                        <button
                            id="pannellum-next-btn"
                            className="btn btn-sm"
                            onClick={() => goTo(current + 1)}
                            aria-label="Next photo"
                        >
                            Next →
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
