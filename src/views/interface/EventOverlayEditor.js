import React, { useRef, useState } from 'react'
import PropTypes from 'prop-types'

export const OVERLAY_DEFAULTS = {
  step1: {
    counter: {
      x: 76,
      y: 48,
      width: 27,
      height: 14,
      scale: 100,
      color: '#D02626',
      align: 'center',
      enabled: true,
    },
    actions: { x: 76, y: 74, width: 47, height: 12, scale: 100, enabled: true },
  },
  step2: {
    subtitle: {
      x: 50,
      y: 75,
      width: 80,
      height: 16,
      scale: 100,
      color: '#451A03',
      align: 'center',
      enabled: false,
    },
  },
  step3: {
    wish: {
      x: 71,
      y: 61,
      width: 41,
      height: 32,
      scale: 100,
      color: '#451A03',
      align: 'center',
      enabled: true,
    },
    actions: { x: 71, y: 84, width: 52, height: 12, scale: 100, enabled: true },
  },
}

const LABELS = {
  counter: 'Số thứ tự khách',
  actions: 'Các nút thao tác',
  subtitle: 'Chữ hướng dẫn',
  wish: 'Tiêu đề, lời chúc và chữ ký',
}
const clamp = (value, min, max) => Math.min(max, Math.max(min, value))
const number = (value, fallback, min, max) =>
  Number.isFinite(Number(value)) && value !== '' && value !== null
    ? clamp(Math.round(Number(value)), min, max)
    : fallback

export const getOverlay = (step, key, layout) => {
  const defaults = OVERLAY_DEFAULTS[step][key]
  const saved = layout?.[key] || {}
  return {
    ...defaults,
    ...saved,
    x: number(saved.x, defaults.x, 0, 100),
    y: number(saved.y, defaults.y, 0, 100),
    width: number(saved.width, defaults.width, 5, 100),
    height: number(saved.height, defaults.height, 5, 100),
    scale: number(saved.scale, defaults.scale, 50, 200),
    color: /^#[0-9a-f]{6}$/i.test(saved.color || '') ? saved.color : defaults.color,
    align: ['left', 'center', 'right'].includes(saved.align) ? saved.align : defaults.align,
  }
}

export const normalizeOverlayConfig = (config) => {
  const normalized = { ...config }
  for (const [step, overlays] of Object.entries(OVERLAY_DEFAULTS)) {
    const current = config[step] || {}
    const layout = { ...current.layout }
    for (const key of Object.keys(overlays)) layout[key] = getOverlay(step, key, current.layout)
    normalized[step] = { ...current, layout }
  }
  return normalized
}

export const imageFallback = (event, fallback) => {
  const target = event.currentTarget
  if (target.src !== new URL(fallback, window.location.href).href) target.src = fallback
}

function OverlayNumberInput({ value, min, max, onChange }) {
  const [draft, setDraft] = useState(null)
  const commit = () => {
    if (draft !== null && draft.trim() !== '' && Number.isFinite(Number(draft))) {
      onChange(clamp(Math.round(Number(draft)), min, max))
    }
    setDraft(null)
  }
  return (
    <input
      className="form-control form-control-sm"
      type="number"
      min={min}
      max={max}
      step="1"
      inputMode="numeric"
      value={draft ?? value}
      onChange={(event) => {
        const text = event.target.value
        if (!/^\d*$/.test(text)) return
        setDraft(text)
        const numeric = Number(text)
        if (text !== '' && Number.isFinite(numeric) && numeric >= min && numeric <= max) {
          onChange(numeric)
        }
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
  )
}

OverlayNumberInput.propTypes = {
  value: PropTypes.number.isRequired,
  min: PropTypes.number.isRequired,
  max: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
}

export default function EventOverlayEditor({ step, config, onChange, wish }) {
  const keys = Object.keys(OVERLAY_DEFAULTS[step])
  const [selected, setSelected] = useState(keys[0])
  const preview = useRef(null)
  const drag = useRef(null)
  const current = getOverlay(step, selected, config.layout)
  const fallback = `/images/event-${step}-default.jpg`
  const image = (step === 'step3' ? config.card_bg_image || config.image : config.image) || fallback
  const update = (changes, key = selected) =>
    onChange({ ...config.layout, [key]: { ...getOverlay(step, key, config.layout), ...changes } })
  const previewContent = (key) => {
    if (key === 'counter') return <strong style={{ fontSize: '3.5em' }}>128</strong>
    if (key === 'actions')
      return (
        <div className="d-flex flex-wrap justify-content-center align-items-center gap-2">
          <span
            className="bg-danger text-white fw-bold shadow-sm"
            style={{
              fontSize: 'inherit',
              lineHeight: 1.4,
              borderRadius: '999px',
              padding: 'clamp(6px, 1.22cqw, 10px) clamp(8px, 3.2cqw, 28px)',
              whiteSpace: 'nowrap',
            }}
          >
            {step === 'step1'
              ? config.button_text || config.btn_open || 'Khám phá ngay'
              : config.btn_continue || 'Tiếp tục khám phá'}
          </span>
          <span
            className="bg-white text-dark fw-semibold border shadow-sm"
            style={{
              fontSize: 'inherit',
              lineHeight: 1.4,
              borderRadius: '999px',
              padding: 'clamp(6px, 1.22cqw, 10px) clamp(6px, 2.45cqw, 20px)',
              whiteSpace: 'nowrap',
            }}
          >
            {step === 'step1' ? config.btn_later || 'Để sau' : config.btn_close || 'Đóng'}
          </span>
        </div>
      )
    if (key === 'subtitle')
      return (
        <strong>{config.subtitle || 'Hãy chạm để khám phá lời chúc dành riêng cho bạn'}</strong>
      )
    return (
      <div>
        <strong style={{ color: '#B91C1C' }}>{wish?.title || 'Lời Chúc Từ Nguyên Kim'}</strong>
        <p className="my-1">
          {wish?.content ||
            'Chúc bạn luôn khỏe mạnh, bình an, nhiều niềm vui và thật nhiều điều may mắn!'}
        </p>
        <small>— {wish?.author || 'Vi tính Nguyên Kim'} —</small>
      </div>
    )
  }
  return (
    <div className="mt-3 p-3 border rounded bg-light">
      <strong>Vị trí chữ trên ảnh</strong>
      <div className="d-flex gap-2 align-items-center mb-3">
        <select
          aria-label="Phần cần điều chỉnh"
          className="form-select form-select-sm"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
        >
          {keys.map((key) => (
            <option key={key} value={key}>
              {LABELS[key]}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm text-nowrap"
          onClick={() => update(OVERLAY_DEFAULTS[step][selected])}
        >
          Khôi phục vị trí
        </button>
      </div>
      <label className="d-flex gap-2 align-items-center mb-2">
        <input
          type="checkbox"
          checked={current.enabled !== false}
          onChange={(e) => update({ enabled: e.target.checked })}
        />
        Hiển thị {LABELS[selected].toLowerCase()}
      </label>
      <div className="row g-2 mb-3">
        {[
          ['x', 'X (%)', 0, 100],
          ['y', 'Y (%)', 0, 100],
          ['width', 'Rộng (%)', 5, 100],
          ['height', 'Cao (%)', 5, 100],
          ['scale', 'Cỡ chữ (%)', 50, 200],
        ].map(([key, label, min, max]) => (
          <label className="col-6 col-md-4 small" key={key}>
            {label}
            <OverlayNumberInput
              key={`${selected}-${key}`}
              min={min}
              max={max}
              value={current[key]}
              onChange={(value) => update({ [key]: value })}
            />
          </label>
        ))}
        {selected !== 'actions' && (
          <>
            <label className="col-6 col-md-4 small">
              Màu chữ
              <input
                className="form-control form-control-color"
                type="color"
                value={current.color}
                onChange={(e) => update({ color: e.target.value })}
              />
            </label>
            <label className="col-6 col-md-4 small">
              Căn chữ
              <select
                className="form-select form-select-sm"
                value={current.align}
                onChange={(e) => update({ align: e.target.value })}
              >
                <option value="left">Trái</option>
                <option value="center">Giữa</option>
                <option value="right">Phải</option>
              </select>
            </label>
          </>
        )}
      </div>
      <div
        ref={preview}
        className="position-relative overflow-hidden rounded border bg-white"
        style={{
          aspectRatio: step === 'step3' ? '1024 / 618' : '4 / 3',
          touchAction: 'none',
          containerType: 'inline-size',
        }}
      >
        <img
          src={image}
          alt="Xem trước vị trí chữ"
          draggable={false}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            pointerEvents: 'none',
          }}
          onError={(e) => imageFallback(e, fallback)}
        />
        {keys.map((key) => {
          const overlay = getOverlay(step, key, config.layout)
          if (overlay.enabled === false) return null
          return (
            <div
              key={key}
              role="button"
              tabIndex={0}
              aria-label={`Di chuyển ${LABELS[key]}`}
              onKeyDown={(e) => {
                const delta = {
                  ArrowLeft: [-1, 0],
                  ArrowRight: [1, 0],
                  ArrowUp: [0, -1],
                  ArrowDown: [0, 1],
                }[e.key]
                if (delta) {
                  e.preventDefault()
                  setSelected(key)
                  update(
                    {
                      x: clamp(overlay.x + delta[0], 0, 100),
                      y: clamp(overlay.y + delta[1], 0, 100),
                    },
                    key,
                  )
                }
              }}
              onPointerDown={(e) => {
                e.preventDefault()
                setSelected(key)
                e.currentTarget.setPointerCapture(e.pointerId)
                drag.current = { key, px: e.clientX, py: e.clientY, x: overlay.x, y: overlay.y }
              }}
              onPointerMove={(e) => {
                if (!drag.current || drag.current.key !== key) return
                const rect = preview.current.getBoundingClientRect()
                update(
                  {
                    x: Number(
                      clamp(
                        drag.current.x + ((e.clientX - drag.current.px) / rect.width) * 100,
                        0,
                        100,
                      ).toFixed(0),
                    ),
                    y: Number(
                      clamp(
                        drag.current.y + ((e.clientY - drag.current.py) / rect.height) * 100,
                        0,
                        100,
                      ).toFixed(0),
                    ),
                  },
                  key,
                )
              }}
              onPointerUp={() => {
                drag.current = null
              }}
              onPointerCancel={() => {
                drag.current = null
              }}
              onLostPointerCapture={() => {
                drag.current = null
              }}
              style={{
                position: 'absolute',
                left: `${overlay.x}%`,
                top: `${overlay.y}%`,
                width: `${overlay.width}%`,
                height: `${overlay.height}%`,
                transform: 'translate(-50%, -50%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent:
                  key === 'actions'
                    ? 'center'
                    : { left: 'flex-start', center: 'center', right: 'flex-end' }[overlay.align],
                textAlign: overlay.align,
                color: overlay.color,
                fontSize:
                  key === 'actions'
                    ? `clamp(${(7.8 * overlay.scale) / 100}px, ${(1.95 * overlay.scale) / 100}cqw, ${(17.55 * overlay.scale) / 100}px)`
                    : `clamp(7px, ${(1.7 * overlay.scale) / 100}cqw, 28px)`,
                lineHeight: 1.4,
                padding: '2px',
                cursor: 'move',
                border: `2px ${selected === key ? 'solid #0d6efd' : 'dashed #888'}`,
                overflow: 'hidden',
                userSelect: 'none',
              }}
            >
              {previewContent(key)}
            </div>
          )
        })}
      </div>
    </div>
  )
}

EventOverlayEditor.propTypes = {
  step: PropTypes.oneOf(['step1', 'step2', 'step3']).isRequired,
  config: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  wish: PropTypes.object,
}
