import React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import EventGreetingManager from './EventGreetingManager'
import { axiosClient } from '../../axiosConfig'

jest.mock('../../axiosConfig', () => ({ axiosClient: { get: jest.fn(), post: jest.fn() } }))
jest.mock('react-toastify', () => ({ toast: { success: jest.fn(), error: jest.fn() } }))

test('step navigation preserves edited data, removes status card and saves without enabling the event', async () => {
  axiosClient.get.mockImplementation(async (path) => ({
    data: {
      status: true,
      data: path.endsWith('/events')
        ? [
            {
              id: 1,
              title: 'Nhận Lời Chúc May Mắn',
              is_active: false,
              start_date: null,
              end_date: null,
              base_visitor_count: 120,
              display_frequency: 'once_per_day',
              popup_config: {},
            },
          ]
        : path.endsWith('/wishes')
          ? []
          : {},
    },
  }))
  axiosClient.post.mockResolvedValue({ data: { status: true } })
  render(<EventGreetingManager />)
  await waitFor(() => expect(screen.getByDisplayValue('Nhận Lời Chúc May Mắn')).toBeTruthy())
  expect(screen.queryByText(/Trạng Thái Sự Kiện/i)).toBeNull()
  const subtitle = screen.getByDisplayValue('Hãy chạm để khám phá lời chúc dành riêng cho bạn')
  fireEvent.click(screen.getByRole('tab', { name: /Mở quà/ }))
  expect(document.getElementById('popup-step-panel-1').hidden).toBe(true)
  expect(document.getElementById('popup-step-panel-2').hidden).toBe(false)
  fireEvent.change(subtitle, { target: { value: 'Chạm để nhận quà' } })
  fireEvent.click(screen.getByRole('tab', { name: /Lời chúc/ }))
  const save = screen.getByRole('button', { name: 'Lưu Cấu Hình Sự Kiện' })
  expect(save.closest('form').checkValidity()).toBe(true)
  fireEvent.submit(save.closest('form'))
  await waitFor(() =>
    expect(axiosClient.post).toHaveBeenCalledWith(
      'event-greeting/admin/save-event',
      expect.objectContaining({
        is_active: false,
        popup_config: expect.objectContaining({
          step2: expect.objectContaining({ subtitle: 'Chạm để nhận quà' }),
        }),
      }),
    ),
  )
})
