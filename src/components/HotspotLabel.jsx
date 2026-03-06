// src/components/HotspotLabel.jsx
// Renders an A-Frame text entity that always faces the camera (look-at)
// Positioned near an item, floating at the given x,y,z coords.

export default function HotspotLabel({ x, y, z, text, index }) {
    const wrappedText = text.length > 40 ? text.slice(0, 40) + '…' : text
    return (
        <a-entity
            key={`hs-${index}`}
            position={`${x} ${y} ${z}`}
            look-at="[camera]"
        >
            {/* Background plane */}
            <a-plane
                color="#0d0d1a"
                opacity="0.88"
                width="1.4"
                height="0.28"
                side="double"
            />
            {/* Teal border line on top */}
            <a-plane
                color="#3FFFD2"
                opacity="0.9"
                width="1.4"
                height="0.015"
                position="0 0.13 0.001"
                side="double"
            />
            {/* Text */}
            <a-text
                value={wrappedText}
                color="#EEEAF2"
                align="center"
                width="1.2"
                wrap-count="30"
                position="0 0 0.002"
                font="roboto"
            />
            {/* Dot indicator below */}
            <a-sphere
                position="0 -0.22 0"
                radius="0.03"
                color="#3FFFD2"
                opacity="0.9"
            />
            {/* Vertical stem */}
            <a-cylinder
                position="0 -0.12 0"
                radius="0.008"
                height="0.18"
                color="#3FFFD2"
                opacity="0.5"
            />
        </a-entity>
    )
}
