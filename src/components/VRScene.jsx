// src/components/VRScene.jsx
// Renders Anant's outdoor Pixel Marketplace VR environment with room items placed inside.
// Items appear as clickable panels near the central plaza. Clicking opens PannellumViewer.

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

    // Arrange items in a horseshoe around the plaza for easy browsing
    // Each item panel is a floating product display, starting near the fountain
    const ITEM_RADIUS = 7         // distance from plaza centre
    const ITEM_START_ANGLE = -60  // degrees, spread them in an arc
    const ITEM_ARC = 120          // total arc spread in degrees

    return (
        <div className="vr-scene-root">
            {/* ── A-Frame Scene ──────────────────────────────────── */}
            <a-scene
                ref={sceneRef}
                renderer="antialias: true; colorManagement: true"
                vr-mode-ui="enabled: true"
                loading-screen="dotsColor: #00ff64; backgroundColor: #000"
                embedded
                style={{ width: '100%', height: '100%' }}
            >
                {/* Assets */}
                <a-assets>
                    <a-asset-item id="cloud-model" src="/clouds.glb"></a-asset-item>
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

                {/* ── SKY ──────────────────────────── */}
                <a-sky color="#87CEEB"></a-sky>

                {/* ── LIGHTING ─────────────────────── */}
                <a-light type="ambient" intensity="0.6" color="#ffffff"></a-light>
                <a-light type="directional" intensity="0.9" position="-5 15 5" color="#fffbe6"></a-light>
                <a-light type="hemisphere" intensity="0.4" color="#87CEEB" groundColor="#3a6b2a"></a-light>

                {/* ── GROUND ───────────────────────── */}
                <a-plane
                    geometry="primitive: plane; width: 200; height: 200"
                    material="color: #4a8c3f; roughness: 1"
                    rotation="-90 0 0"
                    position="0 0 0"
                    shadow="receive: true"
                />

                {/* ── CENTRAL PLAZA ────────────────── */}
                <a-cylinder
                    geometry="primitive: cylinder; radius: 12; height: 0.15; segmentsRadial: 64"
                    material="color: #c8b08a; roughness: 0.9"
                    position="0 0.05 0"
                    shadow="receive: true"
                />
                {/* Fountain base */}
                <a-cylinder geometry="primitive: cylinder; radius: 2.5; height: 0.8; segmentsRadial: 32" material="color: #888" position="0 0.4 0" />
                <a-torus geometry="primitive: torus; radius: 2.5; radiusTubular: 0.3; segmentsRadial: 32" material="color: #999" position="0 0.8 0" />
                <a-cylinder geometry="primitive: cylinder; radius: 2.2; height: 0.1; segmentsRadial: 32" material="color: #4488cc; transparent: true; opacity: 0.7" position="0 0.75 0" />
                <a-cylinder geometry="primitive: cylinder; radius: 0.3; height: 2" material="color: #aaa" position="0 1.5 0" />
                <a-text value="PIXEL MARKETPLACE" position="0 4 0" align="center" color="#1a3a1a" scale="3 3 3" side="double"></a-text>

                {/* ── ROADS ────────────────────────── */}
                {/* North */}
                <a-plane geometry="primitive: plane; width: 4; height: 25" material="color: #555; roughness: 0.9" rotation="-90 0 0" position="0 0.06 -20" />
                <a-plane geometry="primitive: plane; width: 0.2; height: 25" material="color: #ffff00" rotation="-90 0 0" position="0 0.07 -20" />
                {/* East */}
                <a-plane geometry="primitive: plane; width: 4; height: 25" material="color: #555; roughness: 0.9" rotation="-90 90 0" position="20 0.06 0" />
                <a-plane geometry="primitive: plane; width: 0.2; height: 25" material="color: #ffff00" rotation="-90 90 0" position="20 0.07 0" />
                {/* South */}
                <a-plane geometry="primitive: plane; width: 4; height: 25" material="color: #555; roughness: 0.9" rotation="-90 0 0" position="0 0.06 20" />
                <a-plane geometry="primitive: plane; width: 0.2; height: 25" material="color: #ffff00" rotation="-90 0 0" position="0 0.07 20" />
                {/* West */}
                <a-plane geometry="primitive: plane; width: 4; height: 25" material="color: #555; roughness: 0.9" rotation="-90 90 0" position="-20 0.06 0" />
                <a-plane geometry="primitive: plane; width: 0.2; height: 25" material="color: #ffff00" rotation="-90 90 0" position="-20 0.07 0" />

                {/* ── DIAGONAL PATHWAYS ────────────── */}
                <a-plane geometry="primitive: plane; width: 2; height: 35" material="color: #c8b08a; roughness: 0.9" rotation="-90 45 0" position="16 0.04 -16" />
                <a-plane geometry="primitive: plane; width: 2; height: 35" material="color: #c8b08a; roughness: 0.9" rotation="-90 -45 0" position="16 0.04 16" />
                <a-plane geometry="primitive: plane; width: 2; height: 35" material="color: #c8b08a; roughness: 0.9" rotation="-90 45 0" position="-16 0.04 16" />
                <a-plane geometry="primitive: plane; width: 2; height: 35" material="color: #c8b08a; roughness: 0.9" rotation="-90 -45 0" position="-16 0.04 -16" />

                {/* ── BUILDING 1: CLOTHING STORE (North) ── */}
                <a-entity id="building-clothing" position="0 0 -35">
                    <a-box geometry="primitive: box; width: 14; height: 0.3; depth: 12" material="color: #888" position="0 0.15 0" />
                    <a-box geometry="primitive: box; width: 14; height: 6; depth: 0.3" material="color: #c744ff" position="0 3.15 -6" />
                    <a-box geometry="primitive: box; width: 14; height: 6; depth: 0.3" material="color: #c744ff" position="0 3.15 6" />
                    <a-box geometry="primitive: box; width: 0.3; height: 6; depth: 12" material="color: #b030e0" position="-7 3.15 0" />
                    <a-box geometry="primitive: box; width: 0.3; height: 6; depth: 12" material="color: #b030e0" position="7 3.15 0" />
                    <a-box geometry="primitive: box; width: 15; height: 0.4; depth: 13" material="color: #9d2eff" position="0 6.35 0" />
                    <a-text value="CLOTHING STORE" position="0 5.5 6.2" align="center" color="#ffffff" scale="2.5 2.5 2.5" />
                    <a-text value="Fashion & Apparel" position="0 4.2 6.2" align="center" color="#ffff00" scale="1.2 1.2 1.2" />
                    <a-text value="WALK IN" position="0 3.5 6.2" align="center" color="#00ff64" scale="1 1 1" />
                    <a-box geometry="primitive: box; width: 3; height: 4; depth: 0.1" material="color: #00ff64; transparent: true; opacity: 0.15" position="0 2.2 6.3" />
                    {/* Mannequins */}
                    <a-cylinder geometry="primitive: cylinder; radius: 0.3; height: 1.5" material="color: #ff69b4" position="-3 1 6.3" />
                    <a-sphere geometry="primitive: sphere; radius: 0.25" material="color: #ffdbac" position="-3 1.85 6.3" />
                    <a-cylinder geometry="primitive: cylinder; radius: 0.3; height: 1.5" material="color: #4488ff" position="3 1 6.3" />
                    <a-sphere geometry="primitive: sphere; radius: 0.25" material="color: #ffdbac" position="3 1.85 6.3" />
                </a-entity>

                {/* ── BUILDING 2: FURNITURE STORE (East) ── */}
                <a-entity id="building-furniture" position="35 0 0">
                    <a-box geometry="primitive: box; width: 12; height: 0.3; depth: 14" material="color: #888" position="0 0.15 0" />
                    <a-box geometry="primitive: box; width: 12; height: 6; depth: 0.3" material="color: #d4944a" position="0 3.15 -7" />
                    <a-box geometry="primitive: box; width: 12; height: 6; depth: 0.3" material="color: #d4944a" position="0 3.15 7" />
                    <a-box geometry="primitive: box; width: 0.3; height: 6; depth: 14" material="color: #c07830" position="-6 3.15 0" />
                    <a-box geometry="primitive: box; width: 0.3; height: 6; depth: 14" material="color: #c07830" position="6 3.15 0" />
                    <a-box geometry="primitive: box; width: 13; height: 0.4; depth: 15" material="color: #8B4513" position="0 6.35 0" />
                    <a-text value="FURNITURE STORE" position="-6.2 5.5 0" align="center" color="#ffffff" scale="2.5 2.5 2.5" rotation="0 -90 0" />
                    <a-text value="Home & Living" position="-6.2 4.2 0" align="center" color="#ffff00" scale="1.2 1.2 1.2" rotation="0 -90 0" />
                    <a-text value="WALK IN" position="-6.2 3.5 0" align="center" color="#00ff64" scale="1 1 1" rotation="0 -90 0" />
                    <a-box geometry="primitive: box; width: 0.1; height: 4; depth: 3" material="color: #00ff64; transparent: true; opacity: 0.15" position="-6.3 2.2 0" />
                    {/* Chair */}
                    <a-box geometry="primitive: box; width: 1; height: 0.8; depth: 1" material="color: #8B4513" position="-3 0.5 6.5" />
                    <a-box geometry="primitive: box; width: 1; height: 0.6; depth: 0.2" material="color: #8B4513" position="-3 1.1 6" />
                </a-entity>

                {/* ── BUILDING 3: VEHICLE SHOWROOM (South) ── */}
                <a-entity id="building-vehicle" position="0 0 35">
                    <a-box geometry="primitive: box; width: 16; height: 0.3; depth: 14" material="color: #888" position="0 0.15 0" />
                    <a-box geometry="primitive: box; width: 16; height: 6; depth: 0.3" material="color: #3a3a5a" position="0 3.15 -7" />
                    <a-box geometry="primitive: box; width: 16; height: 6; depth: 0.3" material="color: #3a3a5a" position="0 3.15 7" />
                    <a-box geometry="primitive: box; width: 0.3; height: 6; depth: 14" material="color: #2a2a4a" position="-8 3.15 0" />
                    <a-box geometry="primitive: box; width: 0.3; height: 6; depth: 14" material="color: #2a2a4a" position="8 3.15 0" />
                    <a-box geometry="primitive: box; width: 17; height: 0.4; depth: 15" material="color: #2a2a3a" position="0 6.35 0" />
                    <a-text value="VEHICLE SHOWROOM" position="0 5.5 -7.2" align="center" color="#ffffff" scale="2.5 2.5 2.5" rotation="0 180 0" />
                    <a-text value="Cars & Rides" position="0 4.2 -7.2" align="center" color="#ff4444" scale="1.2 1.2 1.2" rotation="0 180 0" />
                    <a-text value="WALK IN" position="0 3.5 -7.2" align="center" color="#00ff64" scale="1 1 1" rotation="0 180 0" />
                    <a-box geometry="primitive: box; width: 3.5; height: 4.5; depth: 0.1" material="color: #00ff64; transparent: true; opacity: 0.15" position="0 2.4 -7.3" />
                </a-entity>

                {/* ── BUILDING 4: MISCELLANEOUS STORE (West) ── */}
                <a-entity id="building-misc" position="-35 0 0">
                    <a-box geometry="primitive: box; width: 12; height: 0.3; depth: 14" material="color: #888" position="0 0.15 0" />
                    <a-box geometry="primitive: box; width: 12; height: 6; depth: 0.3" material="color: #2a8a4a" position="0 3.15 -7" />
                    <a-box geometry="primitive: box; width: 12; height: 6; depth: 0.3" material="color: #2a8a4a" position="0 3.15 7" />
                    <a-box geometry="primitive: box; width: 0.3; height: 6; depth: 14" material="color: #1a7a3a" position="-6 3.15 0" />
                    <a-box geometry="primitive: box; width: 0.3; height: 6; depth: 14" material="color: #1a7a3a" position="6 3.15 0" />
                    <a-box geometry="primitive: box; width: 13; height: 0.4; depth: 15" material="color: #1a6a2a" position="0 6.35 0" />
                    <a-text value="MISCELLANEOUS" position="6.2 5.5 0" align="center" color="#ffffff" scale="2.5 2.5 2.5" rotation="0 90 0" />
                    <a-text value="Gadgets & More" position="6.2 4.2 0" align="center" color="#ffff00" scale="1.2 1.2 1.2" rotation="0 90 0" />
                    <a-text value="WALK IN" position="6.2 3.5 0" align="center" color="#00ff64" scale="1 1 1" rotation="0 90 0" />
                    <a-box geometry="primitive: box; width: 0.1; height: 4; depth: 3" material="color: #00ff64; transparent: true; opacity: 0.15" position="6.3 2.2 0" />
                </a-entity>

                {/* ── DIRECTION SIGNS ──────────────── */}
                <a-cylinder geometry="primitive: cylinder; radius: 0.15; height: 4" material="color: #654321" position="5 2 5" />
                <a-entity position="5 3.5 5">
                    <a-box geometry="primitive: box; width: 3; height: 0.5; depth: 0.1" material="color: #c744ff" position="0 0 0" />
                    <a-text value="CLOTHING ↑" position="0 0 0.06" align="center" color="#fff" scale="0.9 0.9 0.9" />
                </a-entity>
                <a-entity position="5 3 5">
                    <a-box geometry="primitive: box; width: 3; height: 0.5; depth: 0.1" material="color: #d4944a" position="0 0 0" rotation="0 -90 0" />
                    <a-text value="FURNITURE →" position="0 0 0.06" align="center" color="#fff" scale="0.9 0.9 0.9" rotation="0 -90 0" />
                </a-entity>
                <a-entity position="5 2.5 5">
                    <a-box geometry="primitive: box; width: 3; height: 0.5; depth: 0.1" material="color: #3a3a5a" position="0 0 0" rotation="0 180 0" />
                    <a-text value="VEHICLES ↓" position="0 0 0.06" align="center" color="#fff" scale="0.9 0.9 0.9" rotation="0 180 0" />
                </a-entity>
                <a-entity position="5 2 5">
                    <a-box geometry="primitive: box; width: 3; height: 0.5; depth: 0.1" material="color: #2a8a4a" position="0 0 0" rotation="0 90 0" />
                    <a-text value="← MISC" position="0 0 0.06" align="center" color="#fff" scale="0.9 0.9 0.9" rotation="0 90 0" />
                </a-entity>

                {/* ── STREET LAMPS ─────────────────── */}
                {[
                    [4, -12], [-4, -12], [12, 4], [-12, -4], [4, 12], [-4, 12]
                ].map(([lx, lz], li) => (
                    <a-entity key={`lamp-${li}`} position={`${lx} 0 ${lz}`}>
                        <a-cylinder geometry="primitive: cylinder; radius: 0.1; height: 5" material="color: #333" position="0 2.5 0" />
                        <a-sphere geometry="primitive: sphere; radius: 0.4" material="color: #ffee88; emissive: #ffee44; emissiveIntensity: 0.6" position="0 5 0" />
                        <a-light type="point" intensity="0.4" distance="15" color="#ffee88" position="0 5 0" />
                    </a-entity>
                ))}

                {/* ── BENCHES ──────────────────────── */}
                <a-entity position="3 0 -6">
                    <a-box geometry="primitive: box; width: 2; height: 0.6; depth: 0.6" material="color: #8B4513" position="0 0.3 0" />
                    <a-box geometry="primitive: box; width: 2; height: 0.5; depth: 0.1" material="color: #8B4513" position="0 0.8 -0.25" />
                </a-entity>
                <a-entity position="-3 0 6">
                    <a-box geometry="primitive: box; width: 2; height: 0.6; depth: 0.6" material="color: #8B4513" position="0 0.3 0" />
                    <a-box geometry="primitive: box; width: 2; height: 0.5; depth: 0.1" material="color: #8B4513" position="0 0.8 0.25" />
                </a-entity>

                {/* ── TREES ────────────────────────── */}
                {[
                    [10, -10, '#228B22'], [-10, 10, '#228B22'],
                    [10, 10, '#2E8B57'], [-10, -10, '#2E8B57']
                ].map(([tx, tz, col], ti) => (
                    <a-entity key={`tree-${ti}`} position={`${tx} 0 ${tz}`}>
                        <a-cylinder geometry="primitive: cylinder; radius: 0.3; height: 3" material="color: #654321" position="0 1.5 0" />
                        <a-sphere geometry={`primitive: sphere; radius: ${ti % 2 === 0 ? 2 : 1.8}`} material={`color: ${col}`} position="0 4 0" />
                    </a-entity>
                ))}

                {/* ── CLOUDS (GLB) ─────────────────── */}
                {[
                    [-30, -20, 5], [20, -40, 7], [40, 10, 4],
                    [-15, 35, 6], [0, -60, 8], [50, -30, 5],
                    [-45, 0, 6], [10, 50, 4.5], [-50, -50, 7], [35, 40, 5.5]
                ].map(([cx, cz, cs], ci) => (
                    <a-entity
                        key={`cloud-${ci}`}
                        gltf-model="#cloud-model"
                        position={`${cx} 20 ${cz}`}
                        scale={`${cs} ${cs} ${cs}`}
                    />
                ))}

                {/* ── NPCs ─────────────────────────── */}
                {[
                    { pos: '3.8 0 -6', body: '#e74c3c', head: '#ffdbac' },
                    { pos: '4.4 0 -6', body: '#3498db', head: '#c68642' },
                    { pos: '1.2 0 -18', body: '#9b59b6', head: '#ffdbac' },
                    { pos: '-3 0 2', body: '#2ecc71', head: '#8d5524' },
                    { pos: '-4 0 2.5', body: '#f1c40f', head: '#ffdbac' },
                    { pos: '25 0 1.5', body: '#1abc9c', head: '#ffdbac' },
                    { pos: '8 0 -5', body: '#e91e63', head: '#8d5524' },
                    { pos: '8.8 0 -4.5', body: '#00bcd4', head: '#ffdbac' },
                    { pos: '-26 0 -1', body: '#673ab7', head: '#ffdbac' },
                ].map((npc, ni) => (
                    <a-entity key={`npc-${ni}`} position={npc.pos}>
                        <a-cylinder geometry="primitive: cylinder; radius: 0.2; height: 1.4" material={`color: ${npc.body}`} position="0 0.7 0" />
                        <a-sphere geometry="primitive: sphere; radius: 0.18" material={`color: ${npc.head}`} position="0 1.55 0" />
                    </a-entity>
                ))}

                {/* ── CAMERA RIG ───────────────────── */}
                <a-entity id="camera-rig" position="0 0 8">
                    <a-entity
                        id="player-camera"
                        camera
                        look-controls="pointerLockEnabled: false"
                        wasd-controls="acceleration: 30"
                        cursor="rayOrigin: mouse; fuse: false"
                        raycaster="objects: .clickable; far: 50"
                        position="0 1.6 0"
                    />
                    {/* VR Controllers */}
                    <a-entity
                        id="left-hand"
                        hand-controls="hand: left; handModelStyle: toon"
                        teleport-controls="cameraRig: #camera-rig; teleportOrigin: #player-camera; button: trigger"
                    />
                    <a-entity
                        id="right-hand"
                        hand-controls="hand: right; handModelStyle: toon"
                        teleport-controls="cameraRig: #camera-rig; teleportOrigin: #player-camera; button: trigger"
                    />
                </a-entity>

                {/* ── ROOM ITEMS (Product display panels near plaza) ── */}
                {room.items.map((item, idx) => {
                    // Fan items out in an arc around the plaza, just outside the fountain ring
                    const totalItems = room.items.length
                    const angleStep = totalItems > 1 ? ITEM_ARC / (totalItems - 1) : 0
                    const angleDeg = ITEM_START_ANGLE + idx * angleStep
                    const angleRad = (angleDeg * Math.PI) / 180
                    const ix = Math.sin(angleRad) * ITEM_RADIUS
                    const iz = -Math.cos(angleRad) * ITEM_RADIUS
                    // Face inward toward plaza centre
                    const faceY = -angleDeg

                    const thumbSrc = item.photos[0]

                    return (
                        <a-entity key={item.id} position={`${ix} 0 ${iz}`} rotation={`0 ${faceY} 0`}>
                            {/* Pedestal */}
                            <a-cylinder
                                geometry="primitive: cylinder; radius: 0.6; height: 1.1; segmentsRadial: 16"
                                material="color: #c8b08a; roughness: 0.9"
                                position="0 0.55 0"
                            />
                            {/* Teal glow border frame (behind panel) */}
                            <a-plane
                                width="2.1"
                                height="1.6"
                                material="shader: flat; color: #00ff64; opacity: 0.25; transparent: true"
                                position="0 2.55 -0.015"
                            />
                            {/* Item photo panel */}
                            <a-plane
                                width="2.0"
                                height="1.5"
                                src={thumbSrc}
                                side="double"
                                hc-clickable
                                data-item-id={item.id}
                                class="clickable"
                                position="0 2.55 0"
                            />
                            {/* Item name label above panel */}
                            <a-text
                                value={item.name}
                                color="#00ff64"
                                align="center"
                                width="3"
                                position="0 3.5 0.01"
                                font="roboto"
                            />
                            {/* "Click to inspect" label below */}
                            <a-text
                                value="[ click to inspect ]"
                                color="#ffffff"
                                align="center"
                                width="2.2"
                                position="0 1.75 0.01"
                                font="roboto"
                            />
                            {/* Hotspots */}
                            {item.hotspots?.map((hs, hi) => (
                                <HotspotLabel
                                    key={hs.id || hi}
                                    x={hs.x - ix}
                                    y={hs.y}
                                    z={hs.z - iz}
                                    text={hs.text}
                                    index={hi}
                                />
                            ))}
                        </a-entity>
                    )
                })}
            </a-scene>

            {/* ── HUD overlay ─────────────────────────────────── */}
            {showHUD && (
                <div className="vr-hud">
                    <div className="vr-hud-left">
                        <span className="mono text-accent vr-room-name">{room.roomName}</span>
                        <span className="mono muted vr-item-count">{room.items.length} item{room.items.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="vr-hud-right">
                        <span className="muted" style={{ fontSize: 12 }}>WASD to move · Click item to inspect</span>
                        {webxrSupported && (
                            <button id="enter-vr-btn" className="btn btn-sm" onClick={enterVR}>
                                ⬡ Enter VR
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* ── Pannellum Overlay ───────────────────────────── */}
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
