import React, { useState } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import HeaderGiftBackgroundControl from './HeaderGiftBackgroundControl'

function Editor() {
  const [config, setConfig] = useState({
    enabled: false,
    text: 'Lời chúc của bạn',
    background_color: '#FFF7E8',
  })
  return (
    <>
      <HeaderGiftBackgroundControl config={config} onChange={setConfig} />
      <output data-testid="config">{JSON.stringify(config)}</output>
    </>
  )
}

test('HEX typing and color picker stay in sync and preserve existing configuration', () => {
  render(<Editor />)
  const hex = screen.getByLabelText('Mã màu nền nút hộp quà')
  fireEvent.change(hex, { target: { value: '' } })
  fireEvent.change(hex, { target: { value: '#ff' } })
  expect(hex.value).toBe('#ff')
  fireEvent.change(hex, { target: { value: '#ffffff' } })
  fireEvent.blur(hex)
  expect(hex.value).toBe('#FFFFFF')
  expect(screen.getByLabelText('Màu nền nút hộp quà trên Header:').value).toBe('#ffffff')
  expect(JSON.parse(screen.getByTestId('config').textContent)).toMatchObject({
    enabled: false,
    text: 'Lời chúc của bạn',
    background_color: '#FFFFFF',
  })
  fireEvent.click(screen.getByRole('button', { name: 'Màu mặc định' }))
  expect(hex.value).toBe('')
})

test('invalid HEX is not saved and shows an error', () => {
  render(<Editor />)
  const hex = screen.getByLabelText('Mã màu nền nút hộp quà')
  fireEvent.change(hex, { target: { value: '#GGGGGG' } })
  fireEvent.blur(hex)
  expect(screen.getByRole('alert').textContent).toContain('#FFFFFF')
  expect(JSON.parse(screen.getByTestId('config').textContent).background_color).toBe('#FFF7E8')
})
