import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { imageFallback } from './EventOverlayEditor'

export default function HeaderGiftBackgroundControl({ config, onChange }) {
  const [draft, setDraft] = useState(null)
  const [error, setError] = useState('')
  const color = /^#[0-9a-f]{6}$/i.test(config.background_color || '') ? config.background_color : ''
  const parseHex = (text) =>
    /^#?[0-9a-f]{6}$/i.test(text) ? `#${text.replace(/^#/, '').toUpperCase()}` : null
  const reset = () => {
    setDraft(null)
    setError('')
    onChange({ ...config, background_color: '' })
  }
  const commit = () => {
    if (draft === null) return
    const text = draft.trim()
    if (!text) reset()
    else {
      const hex = parseHex(text)
      if (hex) {
        onChange({ ...config, background_color: hex })
        setError('')
      } else setError('Mã màu cần 6 ký tự, ví dụ #FFFFFF.')
      setDraft(null)
    }
  }
  return (
    <div className="mb-3">
      <label htmlFor="header-gift-background" className="small fw-bold form-label">
        Màu nền nút hộp quà trên Header:
      </label>
      <div className="gift-color-fields mb-2">
        <input
          id="header-gift-background"
          className="form-control form-control-color"
          type="color"
          value={color || '#FFF7E8'}
          onChange={(event) => {
            setDraft(null)
            setError('')
            onChange({ ...config, background_color: event.target.value.toUpperCase() })
          }}
        />
        <input
          aria-label="Mã màu nền nút hộp quà"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'header-color-error' : undefined}
          className={`form-control gift-color-hex ${error ? 'is-invalid' : ''}`}
          type="text"
          placeholder="#FFFFFF"
          maxLength={7}
          spellCheck={false}
          value={draft ?? color}
          onChange={(event) => {
            const text = event.target.value
            setDraft(text)
            setError('')
            const hex = parseHex(text.trim())
            if (hex) onChange({ ...config, background_color: hex })
          }}
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              commit()
              event.currentTarget.blur()
            }
          }}
        />
        <button type="button" className="btn btn-outline-secondary btn-sm" onClick={reset}>
          Màu mặc định
        </button>
      </div>
      {error && (
        <div id="header-color-error" className="text-danger small mb-2" role="alert">
          {error}
        </div>
      )}
      <div
        aria-label="Xem trước màu nền nút hộp quà"
        className="d-inline-flex align-items-center gap-2 px-3 py-2 rounded-3 border"
        style={{
          background: color || 'linear-gradient(to right, #FFFDF8, #FFF7E8, #FEEDD0)',
          color: '#854D0E',
        }}
      >
        <img
          src={config.image || '/images/event-header-badge-gift.png'}
          alt="Hộp quà"
          width="32"
          height="32"
          style={{ objectFit: 'contain' }}
          onError={(event) => imageFallback(event, '/images/event-header-badge-gift.png')}
        />
        <span className="small fw-semibold">{config.text || 'Nhận lời chúc may mắn'}</span>
      </div>
    </div>
  )
}

HeaderGiftBackgroundControl.propTypes = {
  config: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
}
