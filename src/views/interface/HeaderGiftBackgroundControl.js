import React from 'react'
import PropTypes from 'prop-types'
import { imageFallback } from './EventOverlayEditor'

export default function HeaderGiftBackgroundControl({ config, onChange }) {
  const color = /^#[0-9a-f]{6}$/i.test(config.background_color || '') ? config.background_color : ''
  return (
    <div className="mb-3">
      <label htmlFor="header-gift-background" className="small fw-bold form-label">
        Màu nền nút hộp quà trên Header:
      </label>
      <div className="d-flex gap-2 align-items-center mb-2">
        <input
          id="header-gift-background"
          className="form-control form-control-color"
          type="color"
          value={color || '#FFF7E8'}
          onChange={(event) => onChange({ ...config, background_color: event.target.value })}
        />
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm"
          onClick={() => onChange({ ...config, background_color: '' })}
        >
          Màu mặc định
        </button>
      </div>
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
