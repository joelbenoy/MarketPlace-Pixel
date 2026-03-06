// src/utils/roomUrl.js
// Encode / decode room data into a shareable URL via LZ-String compression

import LZString from 'lz-string'

export function encodeRoomToURL(roomData, baseURL = window.location.origin) {
    const json = JSON.stringify(roomData)
    const compressed = LZString.compressToEncodedURIComponent(json)
    return `${baseURL}/view?room=${compressed}`
}

export function decodeRoomFromURL() {
    const params = new URLSearchParams(window.location.search)
    const encoded = params.get('room')
    if (!encoded) return null
    try {
        const json = LZString.decompressFromEncodedURIComponent(encoded)
        return JSON.parse(json)
    } catch {
        return null
    }
}
