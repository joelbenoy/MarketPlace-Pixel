// src/data/dummyRooms.js
// Hardcoded demo rooms — always available on any device, no localStorage needed.

export const DUMMY_ROOMS = {
    'HC-DEMO': {
        pin: 'HC-DEMO',
        roomName: 'Demo Showroom',
        background: null,
        createdAt: '2025-01-01',
        items: [
            {
                id: 'item-001',
                name: 'HP LaserJet Printer',
                photos: [
                    'https://picsum.photos/seed/printer1/800/600',
                    'https://picsum.photos/seed/printer2/800/600',
                    'https://picsum.photos/seed/printer3/800/600',
                    'https://picsum.photos/seed/printer4/800/600',
                    'https://picsum.photos/seed/printer5/800/600',
                ],
                position: { x: 0, y: 0.5, z: -3 },
                rotation: { y: 0 },
                hotspots: [
                    { id: 'hs-001a', x: 0.3, y: 1.4, z: -2.8, text: 'USB port slightly loose — still functional' },
                    { id: 'hs-001b', x: -0.4, y: 1.0, z: -3.1, text: 'Original power cable included' },
                ],
            },
            {
                id: 'item-002',
                name: 'Ergonomic Office Chair',
                photos: [
                    'https://picsum.photos/seed/chair1/800/600',
                    'https://picsum.photos/seed/chair2/800/600',
                    'https://picsum.photos/seed/chair3/800/600',
                ],
                position: { x: 2.5, y: 0.5, z: -2 },
                rotation: { y: 45 },
                hotspots: [
                    { id: 'hs-002a', x: 2.5, y: 1.6, z: -1.8, text: 'Height adjustment works perfectly' },
                    { id: 'hs-002b', x: 2.8, y: 1.0, z: -2.2, text: 'Minor scuff on left armrest — shown in photo 3' },
                ],
            },
            {
                id: 'item-003',
                name: 'Vintage Wooden Desk',
                photos: [
                    'https://picsum.photos/seed/desk1/800/600',
                    'https://picsum.photos/seed/desk2/800/600',
                    'https://picsum.photos/seed/desk3/800/600',
                    'https://picsum.photos/seed/desk4/800/600',
                ],
                position: { x: -2.5, y: 0.5, z: -3.5 },
                rotation: { y: -30 },
                hotspots: [
                    { id: 'hs-003a', x: -2.5, y: 1.5, z: -3.2, text: 'Three drawers — all open smoothly' },
                    { id: 'hs-003b', x: -2.1, y: 0.8, z: -3.8, text: 'Solid oak — minor watermark on top surface' },
                ],
            },
        ],
    },

    'HC-0001': {
        pin: 'HC-0001',
        roomName: 'Empty Demo Room',
        background: null,
        createdAt: '2025-01-01',
        items: [],
    },
}
