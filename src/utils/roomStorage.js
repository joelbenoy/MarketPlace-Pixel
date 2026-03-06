// src/utils/roomStorage.js
// localStorage helpers for user-created rooms

const KEY = 'holocart_rooms'

export function saveRoom(room) {
    try {
        const existing = JSON.parse(localStorage.getItem(KEY) || '{}')
        existing[room.pin] = room
        localStorage.setItem(KEY, JSON.stringify(existing))
        return true
    } catch (e) {
        console.error('saveRoom failed:', e)
        return false
    }
}

export function loadRoom(pin) {
    try {
        const all = JSON.parse(localStorage.getItem(KEY) || '{}')
        return all[pin] || null
    } catch {
        return null
    }
}

export function loadAllRooms() {
    try {
        return JSON.parse(localStorage.getItem(KEY) || '{}')
    } catch {
        return {}
    }
}

export function deleteRoom(pin) {
    try {
        const all = JSON.parse(localStorage.getItem(KEY) || '{}')
        delete all[pin]
        localStorage.setItem(KEY, JSON.stringify(all))
    } catch { /* noop */ }
}

/** Returns estimated storage usage 0–1 */
export function storageUsage() {
    try {
        const value = localStorage.getItem(KEY) || ''
        // Rough: 5 MB localStorage limit
        return (value.length * 2) / (5 * 1024 * 1024)
    } catch {
        return 0
    }
}
