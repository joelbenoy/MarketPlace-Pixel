// src/pages/RoomBuilder.jsx
// Full Room Builder: left item list, centre A-Frame preview, right controls panel.
// Saves to localStorage, generates PIN, encodes shareable URL.

import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import VRScene from '../components/VRScene'
import PinDisplay from '../components/PinDisplay'
import { generatePin } from '../utils/pinUtils'
import { saveRoom, storageUsage } from '../utils/roomStorage'
import { encodeRoomToURL } from '../utils/roomUrl'
import { processPhotos } from '../utils/imageUtils'
import { nanoid } from 'nanoid'
import './RoomBuilder.css'

const EMPTY_ROOM = () => ({
    pin: '',
    roomName: 'My Room',
    background: null,
    items: [],
})

export default function RoomBuilder() {
    const navigate = useNavigate()
    const [room, setRoom] = useState(EMPTY_ROOM())
    const [selectedId, setSelectedId] = useState(null)
    const [showAddModal, setShowAddModal] = useState(false)
    const [showHsModal, setShowHsModal] = useState(false)
    const [showPinDisplay, setShowPinDisplay] = useState(false)
    const [savedPin, setSavedPin] = useState('')
    const [shareURL, setShareURL] = useState('')
    const [toast, setToast] = useState('')
    const [saving, setSaving] = useState(false)

    // Add item modal state
    const [newName, setNewName] = useState('')
    const [newPhotos, setNewPhotos] = useState([]) // base64 strings
    const [photoLoading, setPhotoLoading] = useState(false)

    // Hotspot modal state
    const [hsText, setHsText] = useState('')

    const fileInputRef = useRef(null)

    const selectedItem = room.items.find(i => i.id === selectedId)

    // ── Helpers ────────────────────────────────────────────────
    function showToast(msg) {
        setToast(msg)
        setTimeout(() => setToast(''), 3200)
    }

    function updateRoom(patch) {
        setRoom(prev => ({ ...prev, ...patch }))
    }

    function updateItem(id, patch) {
        setRoom(prev => ({
            ...prev,
            items: prev.items.map(i => i.id === id ? { ...i, ...patch } : i),
        }))
    }

    // ── Photo file picker ──────────────────────────────────────
    async function handlePhotoFiles(e) {
        const files = e.target.files
        if (!files?.length) return
        setPhotoLoading(true)
        try {
            const compressed = await processPhotos(files)
            setNewPhotos(prev => [...prev, ...compressed].slice(0, 5))
        } catch {
            showToast('Photo processing failed')
        }
        setPhotoLoading(false)
    }

    // ── Add item ───────────────────────────────────────────────
    function addItem() {
        if (!newName.trim()) return
        if (!newPhotos.length) { showToast('Add at least one photo'); return }

        const id = `item-${nanoid(6)}`
        const spread = room.items.length
        const newItem = {
            id,
            name: newName.trim(),
            photos: newPhotos,
            position: { x: (spread % 3) * 2.5 - 2.5, y: 0.5, z: -2.5 - Math.floor(spread / 3) * 2 },
            rotation: { y: 0 },
            hotspots: [],
        }

        setRoom(prev => ({ ...prev, items: [...prev.items, newItem] }))
        setSelectedId(id)
        setNewName('')
        setNewPhotos([])
        setShowAddModal(false)
        showToast(`"${newItem.name}" added to room`)
    }

    // ── Remove item ────────────────────────────────────────────
    function removeItem(id) {
        setRoom(prev => ({ ...prev, items: prev.items.filter(i => i.id !== id) }))
        if (selectedId === id) setSelectedId(null)
    }

    // ── Add hotspot ────────────────────────────────────────────
    function addHotspot() {
        if (!selectedItem || !hsText.trim()) return
        const { x, y, z } = selectedItem.position
        const newHs = {
            id: `hs-${nanoid(6)}`,
            x: x + 0.4,
            y: y + 0.9,
            z: z + 0.2,
            text: hsText.trim(),
        }
        updateItem(selectedId, { hotspots: [...selectedItem.hotspots, newHs] })
        setHsText('')
        setShowHsModal(false)
        showToast('Hotspot added')
    }

    function removeHotspot(itemId, hsId) {
        const item = room.items.find(i => i.id === itemId)
        if (!item) return
        updateItem(itemId, { hotspots: item.hotspots.filter(h => h.id !== hsId) })
    }

    // ── Position sliders ───────────────────────────────────────
    function updatePos(axis, val) {
        if (!selectedItem) return
        updateItem(selectedId, {
            position: { ...selectedItem.position, [axis]: parseFloat(val) },
        })
    }

    function updateRot(val) {
        if (!selectedItem) return
        updateItem(selectedId, { rotation: { y: parseFloat(val) } })
    }

    // ── Save room ──────────────────────────────────────────────
    async function saveRoomHandler() {
        if (!room.items.length) { showToast('Add at least one item before saving'); return }
        setSaving(true)

        const pin = generatePin()
        const fullRoom = { ...room, pin, createdAt: new Date().toISOString() }

        const usage = storageUsage()
        if (usage > 0.8) {
            showToast('⚠ Storage nearly full — consider fewer photos')
        }

        const ok = saveRoom(fullRoom)
        if (!ok) {
            showToast('❌ Storage failed — try removing some photos')
            setSaving(false)
            return
        }

        const url = encodeRoomToURL(fullRoom)
        setSavedPin(pin)
        setShareURL(url)
        setShowPinDisplay(true)
        setSaving(false)
    }

    // ── Item position controls ─────────────────────────────────
    const posControls = selectedItem
        ? [
            { label: 'X Position', axis: 'x', min: -8, max: 8, val: selectedItem.position.x },
            { label: 'Y Height', axis: 'y', min: 0, max: 4, val: selectedItem.position.y },
            { label: 'Z Depth', axis: 'z', min: -8, max: 0, val: selectedItem.position.z },
        ]
        : []

    return (
        <div className="builder-root">
            {/* ── Top bar ──────────────────────────────────────── */}
            <header className="builder-topbar">
                <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => navigate('/')}
                    id="builder-home-btn"
                >
                    ← Home
                </button>
                <input
                    id="room-name-input"
                    type="text"
                    className="builder-room-name"
                    value={room.roomName}
                    onChange={e => updateRoom({ roomName: e.target.value })}
                    placeholder="Room Name…"
                    maxLength={40}
                />
                <button
                    id="save-room-btn"
                    className="btn btn-sm"
                    onClick={saveRoomHandler}
                    disabled={saving}
                >
                    {saving ? <span className="spinner" /> : null}
                    {saving ? 'Saving…' : '💾 Save Room'}
                </button>
            </header>

            <div className="builder-body">
                {/* ── Left panel: item list ─────────────────────── */}
                <aside className="builder-left panel">
                    <div className="builder-panel-header">
                        <span className="mono muted" style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                            Items ({room.items.length})
                        </span>
                        <button
                            id="add-item-btn"
                            className="btn btn-sm"
                            onClick={() => { setShowAddModal(true); setNewName(''); setNewPhotos([]) }}
                        >
                            + Add
                        </button>
                    </div>

                    <div className="builder-item-list">
                        {room.items.length === 0 && (
                            <div className="builder-empty-list">
                                <p className="muted" style={{ fontSize: 13, textAlign: 'center' }}>
                                    No items yet.<br />Click <strong>+ Add</strong> to place your first item.
                                </p>
                            </div>
                        )}
                        {room.items.map(item => (
                            <div
                                key={item.id}
                                className={`builder-item-card ${selectedId === item.id ? 'active' : ''}`}
                                onClick={() => setSelectedId(item.id)}
                                id={`item-card-${item.id}`}
                            >
                                <div className="builder-item-thumb">
                                    {item.photos[0] && <img src={item.photos[0]} alt={item.name} />}
                                </div>
                                <div className="builder-item-info">
                                    <span className="builder-item-name">{item.name}</span>
                                    <span className="muted" style={{ fontSize: 11 }}>
                                        {item.photos.length} photo{item.photos.length !== 1 ? 's' : ''}
                                        {item.hotspots.length > 0 ? ` · ${item.hotspots.length} hotspot${item.hotspots.length !== 1 ? 's' : ''}` : ''}
                                    </span>
                                </div>
                                <button
                                    className="builder-item-remove"
                                    onClick={e => { e.stopPropagation(); removeItem(item.id) }}
                                    aria-label="Remove item"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                </aside>

                {/* ── Centre: VR preview ───────────────────────── */}
                <main className="builder-centre">
                    {room.items.length === 0 ? (
                        <div className="builder-centre-empty">
                            <div className="grid-bg" />
                            <div className="z-base" style={{ textAlign: 'center' }}>
                                <span className="accent-line mb-16" style={{ margin: '0 auto 16px' }} />
                                <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 32, marginBottom: 12 }}>
                                    Your Room
                                </h2>
                                <p className="muted">Add items to see them appear here.</p>
                            </div>
                        </div>
                    ) : (
                        <VRScene room={room} showHUD={false} />
                    )}
                    <div className="builder-centre-label mono muted">LIVE VR PREVIEW</div>
                </main>

                {/* ── Right panel: controls ─────────────────────── */}
                <aside className="builder-right panel">
                    <div className="builder-panel-header">
                        <span className="mono muted" style={{ fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                            {selectedItem ? selectedItem.name : 'No Item Selected'}
                        </span>
                    </div>

                    {!selectedItem ? (
                        <div className="builder-panel-body muted" style={{ fontSize: 13, padding: '24px 16px', textAlign: 'center' }}>
                            Select an item from the list to adjust its position and add hotspots.
                        </div>
                    ) : (
                        <div className="builder-panel-body">
                            {/* Position sliders */}
                            {posControls.map(({ label, axis, min, max, val }) => (
                                <div key={axis} className="builder-slider-row">
                                    <div className="builder-slider-label">
                                        <label>{label}</label>
                                        <span className="mono muted" style={{ fontSize: 12 }}>{parseFloat(val).toFixed(2)}</span>
                                    </div>
                                    <input
                                        type="range"
                                        min={min}
                                        max={max}
                                        step="0.1"
                                        value={val}
                                        onChange={e => updatePos(axis, e.target.value)}
                                        className="builder-range"
                                        id={`slider-${axis}-${selectedId}`}
                                    />
                                </div>
                            ))}

                            {/* Rotation */}
                            <div className="builder-slider-row">
                                <div className="builder-slider-label">
                                    <label>Rotation Y</label>
                                    <span className="mono muted" style={{ fontSize: 12 }}>{selectedItem.rotation.y}°</span>
                                </div>
                                <input
                                    type="range"
                                    min={-180}
                                    max={180}
                                    step={5}
                                    value={selectedItem.rotation.y}
                                    onChange={e => updateRot(e.target.value)}
                                    className="builder-range"
                                    id={`slider-rot-${selectedId}`}
                                />
                            </div>

                            <div className="builder-section-divider" />

                            {/* Hotspots */}
                            <div className="builder-section-label mono muted">
                                Hotspot Annotations ({selectedItem.hotspots.length})
                            </div>

                            <div className="builder-hotspot-list">
                                {selectedItem.hotspots.map(hs => (
                                    <div key={hs.id} className="builder-hotspot-item">
                                        <span className="builder-hotspot-dot" />
                                        <span className="builder-hotspot-text">{hs.text}</span>
                                        <button
                                            className="builder-hotspot-remove"
                                            onClick={() => removeHotspot(selectedId, hs.id)}
                                            aria-label="Remove hotspot"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <button
                                id="add-hotspot-btn"
                                className="btn btn-ghost btn-sm w-full"
                                style={{ marginTop: 12 }}
                                onClick={() => { setHsText(''); setShowHsModal(true) }}
                            >
                                + Add Hotspot
                            </button>
                        </div>
                    )}
                </aside>
            </div>

            {/* ── Add Item Modal ────────────────────────────────── */}
            {showAddModal && (
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowAddModal(false)}>
                    <div className="modal-box">
                        <button className="modal-close" onClick={() => setShowAddModal(false)}>✕</button>
                        <span className="accent-line mb-16" />
                        <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 24, marginBottom: 24 }}>Add Item</h2>

                        <div style={{ marginBottom: 16 }}>
                            <label htmlFor="add-item-name">Item Name</label>
                            <input
                                id="add-item-name"
                                type="text"
                                placeholder="e.g. HP LaserJet Printer"
                                value={newName}
                                onChange={e => setNewName(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && addItem()}
                                maxLength={60}
                            />
                        </div>

                        <div style={{ marginBottom: 20 }}>
                            <label>Photos (up to 5, auto-compressed)</label>
                            <div className="builder-photo-zone" onClick={() => fileInputRef.current?.click()}>
                                {photoLoading
                                    ? <span className="spinner" />
                                    : newPhotos.length > 0
                                        ? <div className="builder-photo-thumbs">
                                            {newPhotos.map((src, i) => (
                                                <img key={i} src={src} alt={`Photo ${i + 1}`} className="builder-photo-thumb" />
                                            ))}
                                        </div>
                                        : <span className="muted" style={{ fontSize: 13 }}>Click to select photos…</span>
                                }
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                style={{ display: 'none' }}
                                onChange={handlePhotoFiles}
                                id="add-item-photos"
                            />
                        </div>

                        <button
                            id="confirm-add-item-btn"
                            className="btn w-full"
                            onClick={addItem}
                            disabled={!newName.trim() || !newPhotos.length || photoLoading}
                        >
                            Add to Room →
                        </button>
                    </div>
                </div>
            )}

            {/* ── Add Hotspot Modal ─────────────────────────────── */}
            {showHsModal && (
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowHsModal(false)}>
                    <div className="modal-box">
                        <button className="modal-close" onClick={() => setShowHsModal(false)}>✕</button>
                        <span className="accent-line mb-16" />
                        <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 24, marginBottom: 8 }}>Add Hotspot</h2>
                        <p className="muted mb-16" style={{ fontSize: 13 }}>
                            Add an annotation that floats near <strong>{selectedItem?.name}</strong> in the room.
                        </p>

                        <div style={{ marginBottom: 16 }}>
                            <label htmlFor="hs-text-input">Annotation Text</label>
                            <textarea
                                id="hs-text-input"
                                rows={3}
                                placeholder="e.g. USB port slightly loose — still functional"
                                value={hsText}
                                onChange={e => setHsText(e.target.value)}
                                maxLength={120}
                                style={{ resize: 'vertical' }}
                            />
                        </div>

                        <button
                            id="confirm-add-hotspot-btn"
                            className="btn w-full"
                            onClick={addHotspot}
                            disabled={!hsText.trim()}
                        >
                            Add Hotspot →
                        </button>
                    </div>
                </div>
            )}

            {/* ── Pin Display Modal ─────────────────────────────── */}
            {showPinDisplay && (
                <PinDisplay
                    pin={savedPin}
                    shareURL={shareURL}
                    onClose={() => setShowPinDisplay(false)}
                />
            )}

            {/* ── Toast ─────────────────────────────────────────── */}
            {toast && (
                <div className="toast-container">
                    <div className="toast">{toast}</div>
                </div>
            )}
        </div>
    )
}
