// src/utils/pinUtils.js
import { DUMMY_ROOMS } from '../data/dummyRooms.js'
import { nanoid } from 'nanoid'

export function generatePin() {
    const code = nanoid(4).toUpperCase().replace(/[^A-Z0-9]/g, 'X')
    return `HC-${code}`
}

export function lookupPin(pin) {
    const normalised = pin.toUpperCase().trim()

    // 1. Check hardcoded dummy rooms
    if (DUMMY_ROOMS[normalised]) {
        return { source: 'dummy', room: DUMMY_ROOMS[normalised] }
    }

    // 2. Check localStorage (user-created rooms on this device)
    try {
        const local = JSON.parse(localStorage.getItem('holocart_rooms') || '{}')
        if (local[normalised]) {
            return { source: 'local', room: local[normalised] }
        }
    } catch {
        // localStorage unavailable or corrupt
    }

    return null
}
