import React, { useState } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import EventOverlayEditor, { imageFallback, normalizeOverlayConfig } from './EventOverlayEditor'

function Editor() {
  const [config, setConfig] = useState({})
  return (
    <>
      <EventOverlayEditor
        step="step1"
        config={config}
        onChange={(layout) => setConfig({ layout })}
      />
      <output data-testid="saved-layout">{JSON.stringify(config)}</output>
    </>
  )
}

test('editing and restoring one overlay preserves the other overlay', () => {
  render(<Editor />)
  fireEvent.change(screen.getByLabelText('X (%)'), { target: { value: '35' } })
  expect(screen.getByRole('button', { name: 'Di chuyển Số thứ tự khách' }).style.left).toBe('35%')
  fireEvent.change(screen.getByLabelText('Phần cần điều chỉnh'), { target: { value: 'actions' } })
  fireEvent.change(screen.getByLabelText('Y (%)'), { target: { value: '90' } })
  fireEvent.change(screen.getByLabelText('Phần cần điều chỉnh'), { target: { value: 'counter' } })
  fireEvent.click(screen.getByRole('button', { name: 'Khôi phục vị trí' }))
  const saved = JSON.parse(screen.getByTestId('saved-layout').textContent)
  expect(saved.layout.actions.y).toBe(90)
  expect(saved.layout.counter.x).toBe(76)
  fireEvent.click(screen.getByLabelText('Hiển thị số thứ tự khách'))
  expect(screen.queryByRole('button', { name: 'Di chuyển Số thứ tự khách' })).toBeNull()
})

test('keyboard positioning is stored and shown after reloading saved config', () => {
  const view = render(<Editor />)
  fireEvent.keyDown(screen.getByRole('button', { name: 'Di chuyển Số thứ tự khách' }), {
    key: 'ArrowLeft',
  })
  const saved = JSON.parse(screen.getByTestId('saved-layout').textContent)
  view.unmount()
  render(
    <EventOverlayEditor
      step="step1"
      config={JSON.parse(JSON.stringify(saved))}
      onChange={() => {}}
    />,
  )
  expect(screen.getByRole('button', { name: 'Di chuyển Số thứ tự khách' }).style.left).toBe('75%')
})

test('a failed fallback does not assign src again and start another request', () => {
  const img = document.createElement('img')
  img.src = '/missing.png'
  const setter = jest.spyOn(img, 'src', 'set')
  imageFallback({ currentTarget: img }, '/images/event-floating-icon-default.png')
  imageFallback({ currentTarget: img }, '/images/event-floating-icon-default.png')
  imageFallback({ currentTarget: img }, '/images/event-floating-icon-default.png')
  expect(setter).toHaveBeenCalledTimes(1)
})

test('dragging calculates percentages using the displayed image dimensions', () => {
  window.PointerEvent = MouseEvent
  render(<Editor />)
  const overlay = screen.getByRole('button', { name: 'Di chuyển Số thứ tự khách' })
  overlay.setPointerCapture = jest.fn()
  overlay.parentElement.getBoundingClientRect = () => ({ width: 400, height: 300 })
  fireEvent.pointerDown(overlay, { clientX: 100, clientY: 100 })
  fireEvent.pointerMove(overlay, { clientX: 60, clientY: 130 })
  fireEvent.pointerUp(overlay)
  const saved = JSON.parse(screen.getByTestId('saved-layout').textContent)
  expect(saved.layout.counter.x).toBe(66)
  expect(saved.layout.counter.y).toBe(58)
})

test('font size can be cleared and replaced without clamping intermediate digits', () => {
  render(<Editor />)
  const input = screen.getByLabelText('Cỡ chữ (%)')
  fireEvent.change(input, { target: { value: '200' } })
  fireEvent.change(input, { target: { value: '' } })
  expect(input.value).toBe('')
  fireEvent.change(input, { target: { value: '1' } })
  expect(input.value).toBe('1')
  fireEvent.change(input, { target: { value: '12' } })
  expect(input.value).toBe('12')
  fireEvent.change(input, { target: { value: '120' } })
  fireEvent.blur(input)
  expect(input.value).toBe('120')
  expect(JSON.parse(screen.getByTestId('saved-layout').textContent).layout.counter.scale).toBe(120)
})

test('empty input restores the previous value and limits apply only on commit', () => {
  render(<Editor />)
  const input = screen.getByLabelText('Cỡ chữ (%)')
  fireEvent.change(input, { target: { value: '' } })
  fireEvent.blur(input)
  expect(input.value).toBe('100')
  fireEvent.change(input, { target: { value: '300' } })
  expect(input.value).toBe('300')
  fireEvent.keyDown(input, { key: 'Enter' })
  expect(input.value).toBe('200')
})

test('integer coordinates pass native form validation and decimal input is rejected', () => {
  render(
    <form aria-label="Event configuration">
      <Editor />
    </form>,
  )
  const form = screen.getByRole('form', { name: 'Event configuration' })
  expect(form.checkValidity()).toBe(true)
  const x = screen.getByLabelText('X (%)')
  fireEvent.change(x, { target: { value: '72' } })
  fireEvent.blur(x)
  fireEvent.change(x, { target: { value: '72.33' } })
  expect(x.value).toBe('72')
  expect(form.checkValidity()).toBe(true)
  expect(JSON.parse(screen.getByTestId('saved-layout').textContent).layout.counter.x).toBe(72)
})

test('saving normalizes old decimal layouts while preserving images and other settings', () => {
  const config = {
    step1: {
      image: '/custom.jpg',
      layout: {
        counter: { x: 72.33, y: 44.54, width: 27.15, height: 14.32, scale: 100.5, enabled: false },
      },
    },
    floating_widget: { enabled: false },
  }
  const saved = normalizeOverlayConfig(config)
  expect(saved.step1.layout.counter).toMatchObject({
    x: 72,
    y: 45,
    width: 27,
    height: 14,
    scale: 101,
    enabled: false,
  })
  expect(saved.step1.image).toBe('/custom.jpg')
  expect(saved.floating_widget.enabled).toBe(false)
  expect(config.step1.layout.counter.x).toBe(72.33)
})
