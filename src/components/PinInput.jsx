// src/components/PinInput.jsx
import { useState } from 'react'
import './PinInput.css'

export default function PinInput({ onSubmit, loading, error }) {
    const [value, setValue] = useState('')

    function handleSubmit(e) {
        e.preventDefault()
        if (value.trim()) onSubmit(value.trim())
    }

    return (
        <form className="pin-input-form" onSubmit={handleSubmit}>
            <div className="pin-input-wrap">
                <span className="pin-prefix mono">HC —</span>
                <input
                    id="pin-field"
                    type="text"
                    className="pin-field mono"
                    placeholder="XXXX"
                    value={value}
                    onChange={e => setValue(e.target.value.toUpperCase())}
                    maxLength={10}
                    autoComplete="off"
                    spellCheck={false}
                    aria-label="Enter a room PIN"
                />
            </div>

            {error && (
                <p className="pin-error" role="alert">
                    {error}
                </p>
            )}

            <div className="pin-hint muted mono">
                Try <span className="text-accent">HC-DEMO</span> to see a live room
            </div>

            <button
                id="enter-pin-btn"
                type="submit"
                className="btn w-full mt-16"
                disabled={loading || !value.trim()}
            >
                {loading ? <span className="spinner" /> : null}
                {loading ? 'Loading Room…' : 'Enter Room →'}
            </button>
        </form>
    )
}
