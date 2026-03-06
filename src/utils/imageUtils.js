// src/utils/imageUtils.js
// File → base64 conversion with canvas compression

const MAX_WIDTH = 800
const JPEG_QUALITY = 0.7

export function compressImage(file) {
    return new Promise((resolve) => {
        const img = new Image()
        const objectURL = URL.createObjectURL(file)

        img.onload = () => {
            const canvas = document.createElement('canvas')
            const scale = img.width > MAX_WIDTH ? MAX_WIDTH / img.width : 1
            canvas.width = img.width * scale
            canvas.height = img.height * scale
            const ctx = canvas.getContext('2d')
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
            URL.revokeObjectURL(objectURL)
            resolve(canvas.toDataURL('image/jpeg', JPEG_QUALITY))
        }

        img.onerror = () => {
            URL.revokeObjectURL(objectURL)
            // fallback: read raw
            fileToBase64(file).then(resolve)
        }

        img.src = objectURL
    })
}

export function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsDataURL(file)
    })
}

export async function processPhotos(files) {
    return Promise.all(Array.from(files).map(compressImage))
}
