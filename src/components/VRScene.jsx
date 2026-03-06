// src/components/VRScene.jsx
// Wraps A-Frame scene with all room items, hotspot labels, floor, and controllers.
// Items render as clickable <a-plane> entities. Clicking opens PannellumViewer.

import { useState, useRef } from 'react'
import HotspotLabel from './HotspotLabel'
import PannellumViewer from './PannellumViewer'
import './VRScene.css'

// Register a simple click-passthrough component once
if (typeof window !== 'undefined' && window.AFRAME && !window.AFRAME.components['hc-clickable']) {
    window.AFRAME.registerComponent('hc-clickable', {
        init() {
            this.el.addEventListener('click', () => {
                const itemId = this.el.getAttribute('data-item-id')
                document.dispatchEvent(new CustomEvent('hc-item-click', { detail: { itemId } }))
            })
        },
    })
}

export default function VRScene({ room, showHUD = true }) {
    const [activeItem, setActiveItem] = useState(null)
    const sceneRef = useRef(null)

    // Listen for item clicks from A-Frame
    useState(() => {
        function handler(e) {
            const item = room.items.find(i => i.id === e.detail.itemId)
            if (item) setActiveItem(item)
        }
        document.addEventListener('hc-item-click', handler)
        return () => document.removeEventListener('hc-item-click', handler)
    })

    function enterVR() {
        const scene = document.querySelector('a-scene')
        if (scene) scene.enterVR()
    }

    const webxrSupported = typeof navigator !== 'undefined' && !!navigator.xr

    return (
        <div className="vr-scene-root">
            {/* ── A-Frame Scene ──────────────────────────────────── */}
            <a-scene
                ref={sceneRef}
                webxr="requiredFeatures: local-floor"
                renderer="antialias: true; colorManagement: true; physicallyCorrectLights: true"
                vr-mode-ui="enabled: true"
                loading-screen="dotsColor: #3FFFD2; backgroundColor: #080810"
                embedded
                style={{ width: '100%', height: '100%' }}
            >
                {/* Assets */}
                <a-assets>
                    {room.items.map(item =>
                        item.photos.slice(0, 1).map((src, i) => (
                            <img
                                key={`${item.id}-img-${i}`}
                                id={`img-${item.id}`}
                                src={src}
                                crossOrigin="anonymous"
                            />
                        ))
                    )}
                </a-assets>

                {/* Sky / environment */}
                <a-sky color="#020208" />

                {/* Dark floor */}
                <a-plane
                    position="0 0 0"
                    rotation="-90 0 0"
                    width="30"
                    height="30"
                    color="#0D0D1A"
                    shadow="receive: true"
                />

                {/* Teal grid overlay on floor */}
                <a-entity
                    position="0 0.001 0"
                    rotation="-90 0 0"
                    geometry="primitive: plane; width: 30; height: 30"
                    material={`
            color: #3FFFD2;
            opacity: 0.04;
            transparent: true;
            wireframe: false;
            repeat: 30 30;
          `}
                />

                {/* Ambient + directional light */}
                <a-light type="ambient" color="#142828" intensity="0.7" />
                <a-light type="directional" position="2 6 2" color="#3FFFD2" intensity="0.25" />
                <a-light type="point" position="0 4 0" color="#ffffff" intensity="0.5" distance="20" />

                {/* Camera rig with locomotion */}
                <a-entity
                    id="camera-rig"
                    movement-controls="constrainToNavMesh: false; speed: 0.15"
                    position="0 0 3"
                >
                    <a-entity
                        id="player-camera"
                        camera
                        look-controls="pointerLockEnabled: false"
                        wasd-controls="acceleration: 20"
                        position="0 1.6 0"
                    />

                    {/* Left VR controller */}
                    <a-entity
                        id="left-hand"
                        hand-controls="hand: left; handModelStyle: toon"
                        teleport-controls="cameraRig: #camera-rig; teleportOrigin: #player-camera; button: trigger"
                    />
                    {/* Right VR controller */}
                    <a-entity
                        id="right-hand"
                        hand-controls="hand: right; handModelStyle: toon"
                        teleport-controls="cameraRig: #camera-rig; teleportOrigin: #player-camera; button: trigger"
                    />
                </a-entity>

                {/* ── Room Items ─────────────────────────────────── */}
                {room.items.map(item => {
                    const { x, y, z } = item.position
                    const ry = item.rotation?.y || 0
                    const thumb = `#img-${item.id}`

                    return (
                        <a-entity key={item.id} position={`${x} ${y} ${z}`} rotation={`0 ${ry} 0`}>
                            {/* Item thumbnail plane */}
                            <a-plane
                                width="1.4"
                                height="1.0"
                                src={thumb}
                                side="double"
                                shadow="cast: true"
                                hc-clickable
                                data-item-id={item.id}
                                cursor-listener
                                class="clickable"
                            />
                            {/* Item name label */}
                            <a-text
                                value={item.name}
                                color="#3FFFD2"
                                align="center"
                                width="2"
                                position="0 0.72 0"
                                font="roboto"
                            />
                            {/* Hotspots */}
                            {item.hotspots?.map((hs, hi) => (
                                <HotspotLabel
                                    key={hs.id || hi}
                                    x={hs.x - x}
                                    y={hs.y - y}
                                    z={hs.z - z}
                                    text={hs.text}
                                    index={hi}
                                />
                            ))}
                        </a-entity>
                    )
                })}

                {/* Cursor for desktop clicking */}
                <a-entity camera>
                    <a-entity
                        cursor="fuse: false; rayOrigin: mouse"
                        raycaster="objects: .clickable; recursive: false"
                    />
                </a-entity>
            </a-scene>

            {/* ── HUD overlay ────────────────────────────────── */}
            {showHUD && (
                <div className="vr-hud">
                    <div className="vr-hud-left">
                        <span className="mono text-accent vr-room-name">{room.roomName}</span>
                        <span className="mono muted vr-item-count">{room.items.length} item{room.items.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="vr-hud-right">
                        <span className="muted" style={{ fontSize: 12 }}>Click an item to inspect</span>
                        {webxrSupported && (
                            <button id="enter-vr-btn" className="btn btn-sm" onClick={enterVR}>
                                ⬡ Enter VR
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* ── Pannellum Overlay ──────────────────────────── */}
            {activeItem && (
                <PannellumViewer
                    photos={activeItem.photos}
                    itemName={activeItem.name}
                    onClose={() => setActiveItem(null)}
                />
            )}
        </div>
    )
}
