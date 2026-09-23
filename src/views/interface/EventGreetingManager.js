import React, { useState, useEffect, useRef, useMemo } from 'react'
import {
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormCheck,
  CFormSwitch,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CFormTextarea,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CNav,
  CNavItem,
  CNavLink,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CTabContent,
  CTabPane,
  CSpinner,
  CImage,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilGift,
  cilPlus,
  cilPencil,
  cilTrash,
  cilReload,
  cilSettings,
  cilCloudUpload,
  cilImagePlus,
  cilCheckCircle,
} from '@coreui/icons'
import axios from 'axios'
import { toast } from 'react-toastify'
import { axiosClient } from '../../axiosConfig'

const sanitizeBlobs = (obj) => {
  if (!obj || typeof obj !== 'object') return obj
  const copy = Array.isArray(obj) ? [...obj] : { ...obj }
  for (const key of Object.keys(copy)) {
    if (typeof copy[key] === 'string' && copy[key].startsWith('blob:')) {
      copy[key] = ''
    } else if (typeof copy[key] === 'object' && copy[key] !== null) {
      copy[key] = sanitizeBlobs(copy[key])
    }
  }
  return copy
}

const EventGreetingManager = () => {
  const [activeTab, setActiveTab] = useState(1)
  const [loading, setLoading] = useState(false)
  const [uploadingField, setUploadingField] = useState(null)

  const [eventData, setEventData] = useState({
    id: null,
    title: 'Sự kiện Tết Trung Thu - Nhận Lời Chúc May Mắn',
    code: 'mid_autumn_2026',
    is_active: true,
    start_date: '',
    end_date: '',
    base_visitor_count: 120,
    display_frequency: 'once_per_day',
    popup_config: {
      theme: 'mid_autumn',
      step1: {
        badge: 'Chúc mừng!',
        title: 'Bạn là khách truy cập thứ {number} hôm nay',
        message: 'Nguyên Kim gửi đến bạn một lời chúc Trung Thu vui vẻ, an lành và nhiều may mắn!',
        image: '',
        btn_open: 'Mở quà ngay',
        btn_later: 'Để sau',
      },
      step2: {
        title: 'Mở quà bất ngờ',
        subtitle: 'Hãy chạm để khám phá lời chúc dành riêng cho bạn',
        image: '',
        btn_explore: 'Khám phá ngay',
      },
      step3: {
        badge: 'Lời chúc từ Nguyên Kim ❤️',
        title: 'Bạn nhận được một lời chúc đặc biệt!',
        image: '',
        card_bg_image: '',
        btn_continue: 'Tiếp tục khám phá',
        btn_close: 'Đóng',
      },
      mini_badge: {
        text: 'Bạn đã nhận lời chúc Trung Thu rồi!',
        image: 'https://api-nk.vitinhnguyenkim.vn/uploads/events/event_1790130032_xPSRBkDy.png',
        enabled: true,
      },
      floating_widget: {
        title: 'Lời chúc của bạn đã sẵn sàng!',
        message: 'Chúc bạn một ngày thật vui vẻ, nhiều may mắn và thật nhiều năng lượng tích cực!',
        btn_text: 'Xem lời chúc',
        enabled: true,
      },
    },
  })

  // Quản lý câu chúc
  const [wishes, setWishes] = useState([])
  const [modalWishVisible, setModalWishVisible] = useState(false)
  const [editingWish, setEditingWish] = useState({
    id: null,
    title: '',
    content: '',
    author: 'Vi tính Nguyên Kim',
    is_active: true,
  })

  const [wishSearch, setWishSearch] = useState('')

  const filteredWishes = useMemo(() => {
    if (!wishSearch.trim()) return wishes
    const kw = wishSearch.toLowerCase().trim()
    return wishes.filter(
      (w) =>
        (w.title && w.title.toLowerCase().includes(kw)) ||
        (w.content && w.content.toLowerCase().includes(kw)) ||
        (w.author && w.author.toLowerCase().includes(kw))
    )
  }, [wishes, wishSearch])

  // Thống kê
  const [stats, setStats] = useState({
    today: { visitor_count: 0, gift_opened_count: 0 },
    total_wishes: 0,
    active_wishes: 0,
  })

  // Load dữ liệu ban đầu
  const fetchEventConfig = async () => {
    try {
      setLoading(true)
      const res = await axiosClient.get('event-greeting/admin/events')
      if (res?.data?.status && res?.data?.data?.length > 0) {
        const ev = res.data.data[0]
        const cleanConfig = sanitizeBlobs(ev.popup_config || {})
        setEventData({
          ...ev,
          is_active: Boolean(ev.is_active),
          start_date: ev.start_date ? ev.start_date.substring(0, 16) : '',
          end_date: ev.end_date ? ev.end_date.substring(0, 16) : '',
          popup_config: {
            ...eventData.popup_config,
            ...cleanConfig,
            step1: { ...eventData.popup_config.step1, ...(cleanConfig?.step1 || {}) },
            step2: { ...eventData.popup_config.step2, ...(cleanConfig?.step2 || {}) },
            step3: { ...eventData.popup_config.step3, ...(cleanConfig?.step3 || {}) },
            mini_badge: { ...eventData.popup_config.mini_badge, ...(cleanConfig?.mini_badge || {}) },
            floating_widget: { ...eventData.popup_config.floating_widget, ...(cleanConfig?.floating_widget || {}) },
          },
        })
      }
    } catch (error) {
      console.error('Lỗi lấy config sự kiện:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchWishes = async () => {
    try {
      const res = await axiosClient.get('event-greeting/admin/wishes')
      if (res?.data?.status) {
        setWishes(res.data.data || [])
      }
    } catch (error) {
      console.error('Lỗi lấy danh sách câu chúc:', error)
    }
  }

  const fetchStats = async () => {
    try {
      const res = await axiosClient.get('event-greeting/admin/stats')
      if (res?.data?.status) {
        setStats(res.data.data || {})
      }
    } catch (error) {
      console.error('Lỗi lấy thống kê:', error)
    }
  }

  useEffect(() => {
    fetchEventConfig()
    fetchWishes()
    fetchStats()
  }, [])

  // Xử lý upload ảnh trực tiếp
  const handleUploadFile = async (e, stepKey, fieldKey = 'image') => {
    const file = e.target.files?.[0]
    if (!file) return

    const uploadKey = `${stepKey}_${fieldKey}`
    setUploadingField(uploadKey)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const token = localStorage.getItem('adminNKCP')
      // Gọi trực tiếp qua axios để trình duyệt tự động đính kèm multipart boundary
      const res = await axios.post(
        'https://api-nk.vitinhnguyenkim.vn/api/event-greeting/admin/upload-image',
        formData,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
          },
        }
      )

      if (res?.data?.status && res?.data?.data?.url) {
        const uploadedUrl = res.data.data.url
        setEventData((prev) => {
          if (fieldKey === 'root') {
            return {
              ...prev,
              popup_config: {
                ...prev.popup_config,
                [stepKey]: uploadedUrl,
              },
            }
          }
          return {
            ...prev,
            popup_config: {
              ...prev.popup_config,
              [stepKey]: {
                ...prev.popup_config?.[stepKey],
                [fieldKey]: uploadedUrl,
              },
            },
          }
        })
        toast.success('Tải ảnh lên thành công!')
      } else {
        throw new Error(res?.data?.message || 'Lỗi tải ảnh lên!')
      }
    } catch (err) {
      console.warn('Lỗi upload API, dùng FileReader Base64:', err)
      // Fallback: Chuyển sang Base64
      const reader = new FileReader()
      reader.onload = () => {
        const base64Url = reader.result
        setEventData((prev) => {
          if (fieldKey === 'root') {
            return {
              ...prev,
              popup_config: {
                ...prev.popup_config,
                [stepKey]: base64Url,
              },
            }
          }
          return {
            ...prev,
            popup_config: {
              ...prev.popup_config,
              [stepKey]: {
                ...prev.popup_config?.[stepKey],
                [fieldKey]: base64Url,
              },
            },
          }
        })
        toast.info('Đã chuyển ảnh sang dữ liệu Base64, vui lòng bấm "Lưu Cấu Hình Sự Kiện"!')
      }
      reader.readAsDataURL(file)
    } finally {
      setUploadingField(null)
    }
  }

  // Lưu cấu hình sự kiện
  const handleSaveEvent = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const cleanConfig = sanitizeBlobs(eventData.popup_config || {})
      const payload = {
        ...eventData,
        popup_config: cleanConfig,
        start_date: eventData.start_date ? eventData.start_date.replace('T', ' ') : null,
        end_date: eventData.end_date ? eventData.end_date.replace('T', ' ') : null,
      }
      const res = await axiosClient.post('event-greeting/admin/save-event', payload)
      if (res?.data?.status) {
        toast.success('Lưu cấu hình sự kiện thành công!')
      } else {
        toast.error(res?.data?.message || 'Lỗi lưu cấu hình!')
      }
    } catch (error) {
      toast.error('Lỗi hệ thống khi lưu sự kiện: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  // Thêm / Sửa câu chúc
  const handleSaveWish = async () => {
    if (!editingWish.content.trim()) {
      toast.warning('Vui lòng nhập nội dung câu chúc!')
      return
    }
    try {
      const res = await axiosClient.post('event-greeting/admin/save-wish', editingWish)
      if (res?.data?.status) {
        toast.success(editingWish.id ? 'Cập nhật câu chúc thành công!' : 'Thêm câu chúc mới thành công!')
        setModalWishVisible(false)
        fetchWishes()
        fetchStats()
      } else {
        toast.error(res?.data?.message || 'Có lỗi xảy ra!')
      }
    } catch (error) {
      toast.error('Lỗi lưu câu chúc: ' + error.message)
    }
  }

  // Xóa câu chúc
  const handleDeleteWish = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa câu chúc này không?')) return
    try {
      const res = await axiosClient.delete(`event-greeting/admin/delete-wish/${id}`)
      if (res?.data?.status) {
        toast.success('Xóa câu chúc thành công!')
        fetchWishes()
        fetchStats()
      }
    } catch (error) {
      toast.error('Lỗi xóa câu chúc: ' + error.message)
    }
  }

  // Nạp lại câu chúc mẫu
  const handleSeedDefaults = async () => {
    if (!window.confirm('Hành động này sẽ nạp / bổ sung đầy đủ bộ 75 câu chúc Trung Thu & Công nghệ chuẩn cho Vi tính Nguyên Kim. Bạn có đồng ý không?')) return
    try {
      const res = await axiosClient.post('event-greeting/admin/seed-defaults', { force: false })
      if (res?.data?.status) {
        toast.success(res.data.message || 'Đã nạp bộ 75 câu chúc mẫu thành công!')
        fetchWishes()
        fetchStats()
      }
    } catch (error) {
      toast.error('Lỗi: ' + error.message)
    }
  }

  return (
    <div>
      {/* Header Widget Thống kê nhanh */}
      <CRow className="mb-4">
        <CCol sm={6} lg={3}>
          <CCard className="text-white bg-primary shadow-sm">
            <CCardBody className="p-3">
              <div className="text-uppercase font-weight-bold text-white-50 small">Khách Truy Cập Hôm Nay</div>
              <div className="fs-3 fw-bold my-1">
                {(eventData.base_visitor_count || 120) + (stats.today?.visitor_count || 0)}
              </div>
              <small className="text-white-50">Thực tế: +{stats.today?.visitor_count || 0} lượt</small>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol sm={6} lg={3}>
          <CCard className="text-white bg-danger shadow-sm">
            <CCardBody className="p-3">
              <div className="text-uppercase font-weight-bold text-white-50 small">Lượt Mở Hộp Quà</div>
              <div className="fs-3 fw-bold my-1">{stats.today?.gift_opened_count || 0}</div>
              <small className="text-white-50">Tương tác khám phá lời chúc</small>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol sm={6} lg={3}>
          <CCard className="text-white bg-warning shadow-sm">
            <CCardBody className="p-3">
              <div className="text-uppercase font-weight-bold text-white-50 small">Kho Lời Chúc Hoạt Động</div>
              <div className="fs-3 fw-bold my-1">
                {stats.active_wishes || 0} / {stats.total_wishes || 0}
              </div>
              <small className="text-white-50">Câu chúc may mắn đang active</small>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol sm={6} lg={3}>
          <CCard className="text-white bg-success shadow-sm">
            <CCardBody className="p-3">
              <div className="text-uppercase font-weight-bold text-white-50 small">Trạng Thái Sự Kiện</div>
              <div className="fs-3 fw-bold my-1">
                {eventData.is_active ? 'ĐANG BẬT' : 'ĐANG TẮT'}
              </div>
              <small className="text-white-50">{eventData.code}</small>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Tabs Điều hướng */}
      <CCard className="shadow-sm border-0">
        <CCardHeader className="bg-white border-bottom p-0">
          <CNav variant="tabs">
            <CNavItem>
              <CNavLink
                active={activeTab === 1}
                className="cursor-pointer py-3 px-4 fw-bold"
                onClick={() => setActiveTab(1)}
              >
                <CIcon icon={cilSettings} className="me-2 text-primary" />
                Cấu Hình Sự Kiện & Popup
              </CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink
                active={activeTab === 2}
                className="cursor-pointer py-3 px-4 fw-bold"
                onClick={() => setActiveTab(2)}
              >
                <CIcon icon={cilGift} className="me-2 text-danger" />
                Quản Lý Kho Lời Chúc ({wishes.length})
              </CNavLink>
            </CNavItem>
          </CNav>
        </CCardHeader>

        <CCardBody className="p-4">
          <CTabContent>
            {/* TAB 1: CẤU HÌNH SỰ KIỆN */}
            <CTabPane visible={activeTab === 1}>
              <CForm onSubmit={handleSaveEvent}>
                <CRow className="g-4">
                  {/* Cột Trái: Thông tin cơ bản */}
                  <CCol lg={5}>
                    <h5 className="fw-bold mb-3 text-primary border-bottom pb-2">1. Cài Đặt Chung</h5>

                    <div className="mb-3 p-3 bg-light rounded border d-flex align-items-center justify-content-between">
                      <div className="flex-grow-1 me-3">
                        <CFormSwitch
                          id="eventActiveSwitch"
                          size="xl"
                          label={
                            <span className={`fw-bold ms-2 cursor-pointer ${eventData.is_active ? 'text-success' : 'text-danger'}`}>
                              {eventData.is_active
                                ? 'Kích hoạt hiển thị sự kiện trên Website'
                                : 'Đang TẮT hiển thị sự kiện trên Website'}
                            </span>
                          }
                          checked={Boolean(eventData.is_active)}
                          onChange={(e) =>
                            setEventData((prev) => ({ ...prev, is_active: e.target.checked }))
                          }
                        />
                      </div>
                      <CBadge color={eventData.is_active ? 'success' : 'secondary'} className="px-3 py-2 fs-7">
                        {eventData.is_active ? 'ON' : 'OFF'}
                      </CBadge>
                    </div>

                    <div className="mb-3">
                      <CFormLabel className="fw-semibold">Tên Sự Kiện / Chiến Dịch</CFormLabel>
                      <CFormInput
                        value={eventData.title}
                        onChange={(e) => setEventData({ ...eventData, title: e.target.value })}
                        placeholder="VD: Sự kiện Tết Trung Thu - Nhận Lời Chúc May Mắn"
                      />
                    </div>

                    <CRow className="mb-3">
                      <CCol md={6}>
                        <CFormLabel className="fw-semibold">Thời Gian Bắt Đầu</CFormLabel>
                        <CFormInput
                          type="datetime-local"
                          value={eventData.start_date}
                          onChange={(e) => setEventData({ ...eventData, start_date: e.target.value })}
                        />
                      </CCol>
                      <CCol md={6}>
                        <CFormLabel className="fw-semibold">Thời Gian Kết Thúc</CFormLabel>
                        <CFormInput
                          type="datetime-local"
                          value={eventData.end_date}
                          onChange={(e) => setEventData({ ...eventData, end_date: e.target.value })}
                        />
                      </CCol>
                    </CRow>

                    <CRow className="mb-3">
                      <CCol md={6}>
                        <CFormLabel className="fw-semibold">Số Thứ Tự Khách Khởi Điểm (Mỗi ngày)</CFormLabel>
                        <CFormInput
                          type="number"
                          value={eventData.base_visitor_count}
                          onChange={(e) =>
                            setEventData({ ...eventData, base_visitor_count: parseInt(e.target.value) || 0 })
                          }
                          placeholder="120"
                        />
                      </CCol>
                      <CCol md={6}>
                        <CFormLabel className="fw-semibold">Tần Suất Hiển Thị Popup</CFormLabel>
                        <CFormSelect
                          value={eventData.display_frequency}
                          onChange={(e) => setEventData({ ...eventData, display_frequency: e.target.value })}
                        >
                          <option value="once_per_event">1 lần cho cả sự kiện</option>
                          <option value="once_per_day">1 lần mỗi ngày (Khuyên dùng)</option>
                          <option value="once_per_session">1 lần mỗi phiên trình duyệt</option>
                          <option value="always">Luôn hiển thị (Dành cho kiểm tra / Test)</option>
                        </CFormSelect>
                      </CCol>
                    </CRow>

                    {/* Cấu Hình Logo Popup & Phụ Kiện Trang Trí */}
                    <div className="p-3 bg-light rounded border mt-3 shadow-xs">
                      <h6 className="fw-bold mb-3 text-primary d-flex align-items-center justify-content-between">
                        <span>🎨 Cấu Hình Logo Popup Sự Kiện</span>
                        {eventData.popup_config?.logo && (
                          <button
                            type="button"
                            className="btn btn-link text-danger p-0 text-decoration-none small"
                            onClick={() =>
                              setEventData((prev) => ({
                                ...prev,
                                popup_config: {
                                  ...prev.popup_config,
                                  logo: '',
                                },
                              }))
                            }
                          >
                            Xóa (Dùng logo mặc định)
                          </button>
                        )}
                      </h6>

                      {/* 1. Ảnh Logo */}
                      {/* 1. Ảnh Logo */}
                      <div className="mb-1">
                        <CFormLabel className="small fw-bold">Ảnh Logo Popup:</CFormLabel>
                        <div className="d-flex gap-3 align-items-center">
                          <div
                            className="border rounded p-1 bg-white d-flex align-items-center justify-content-center shadow-xs position-relative"
                            style={{ width: '90px', height: '60px' }}
                          >
                            <img
                              src={eventData.popup_config?.logo || '/images/logo.png'}
                              alt="Logo Popup"
                              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                              onError={(e) => {
                                e.target.src = 'https://api-nk.vitinhnguyenkim.vn/uploads/logo/logo.png'
                              }}
                            />
                          </div>

                          <div className="flex-grow-1">
                            <input
                              type="file"
                              accept="image/*"
                              className="form-control form-control-sm mb-1"
                              onChange={(e) => handleUploadFile(e, 'logo', 'root')}
                            />
                            <div className="input-group input-group-sm">
                              <span className="input-group-text">URL</span>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Hoặc dán URL logo..."
                                value={eventData.popup_config?.logo || ''}
                                onChange={(e) =>
                                  setEventData({
                                    ...eventData,
                                    popup_config: {
                                      ...eventData.popup_config,
                                      logo: e.target.value,
                                    },
                                  })
                                }
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-light rounded border mt-3">
                      <h6 className="fw-bold mb-2 text-secondary">Vị trí hiển thị phụ trên giao diện:</h6>
                      <div>
                        <CFormCheck
                          id="checkMiniBadge"
                          className="fw-semibold mb-2"
                          label="Hiển thị nút 'Bạn đã nhận lời chúc Trung Thu rồi!' trên Header (cạnh Giỏ hàng)"
                          checked={eventData.popup_config?.mini_badge?.enabled !== false}
                          onChange={(e) =>
                            setEventData({
                              ...eventData,
                              popup_config: {
                                ...eventData.popup_config,
                                mini_badge: {
                                  ...eventData.popup_config?.mini_badge,
                                  enabled: e.target.checked,
                                },
                              },
                            })
                          }
                        />

                        {eventData.popup_config?.mini_badge?.enabled !== false && (
                          <div className="ps-3 border-start border-2 border-warning mt-2 mb-3">
                            {/* 1. Dòng chữ text cấu hình */}
                            <div className="mb-2">
                              <CFormLabel className="small fw-bold">Dòng chữ hiển thị trên nút Header:</CFormLabel>
                              <CFormInput
                                size="sm"
                                placeholder="VD: Bạn đã nhận lời chúc Trung Thu rồi!"
                                value={eventData.popup_config?.mini_badge?.text || ''}
                                onChange={(e) =>
                                  setEventData({
                                    ...eventData,
                                    popup_config: {
                                      ...eventData.popup_config,
                                      mini_badge: {
                                        ...eventData.popup_config?.mini_badge,
                                        text: e.target.value,
                                      },
                                    },
                                  })
                                }
                              />
                            </div>

                            {/* 2. Hình ảnh hộp quà / icon tự gắn */}
                            <div className="mb-2">
                              <CFormLabel className="small fw-bold d-flex justify-content-between align-items-center">
                                <span>Hình ảnh Icon / Hộp quà trên góc nút:</span>
                                {eventData.popup_config?.mini_badge?.image && (
                                  <button
                                    type="button"
                                    className="btn btn-link text-danger p-0 text-decoration-none small"
                                    onClick={() =>
                                      setEventData((prev) => ({
                                        ...prev,
                                        popup_config: {
                                          ...prev.popup_config,
                                          mini_badge: {
                                            ...prev.popup_config?.mini_badge,
                                            image: '',
                                          },
                                        },
                                      }))
                                    }
                                  >
                                    Xóa ảnh (dùng hộp quà mặc định)
                                  </button>
                                )}
                              </CFormLabel>

                              <div className="d-flex gap-3 align-items-center">
                                <div
                                  className="border rounded p-1 bg-white d-flex align-items-center justify-content-center shadow-xs"
                                  style={{ width: '60px', height: '60px' }}
                                >
                                  <img
                                    src={
                                      eventData.popup_config?.mini_badge?.image ||
                                      'https://api-nk.vitinhnguyenkim.vn/uploads/events/event_1790130032_xPSRBkDy.png'
                                    }
                                    alt="Header Badge Icon"
                                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                                    onError={(e) => {
                                      e.target.src =
                                        'https://api-nk.vitinhnguyenkim.vn/uploads/events/event_1790130032_xPSRBkDy.png'
                                    }}
                                  />
                                </div>

                                <div className="flex-grow-1">
                                  <div className="d-flex align-items-center gap-2 mb-1">
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="form-control form-control-sm"
                                      onChange={(e) => handleUploadFile(e, 'mini_badge', 'image')}
                                      disabled={uploadingField === 'mini_badge_image'}
                                    />
                                    {uploadingField === 'mini_badge_image' && (
                                      <CSpinner size="sm" color="primary" />
                                    )}
                                  </div>
                                  <div className="input-group input-group-sm mb-1">
                                    <span className="input-group-text">URL</span>
                                    <input
                                      type="text"
                                      className="form-control"
                                      placeholder="Hoặc dán URL ảnh hộp quà..."
                                      value={eventData.popup_config?.mini_badge?.image || ''}
                                      onChange={(e) =>
                                        setEventData({
                                          ...eventData,
                                          popup_config: {
                                            ...eventData.popup_config,
                                            mini_badge: {
                                              ...eventData.popup_config?.mini_badge,
                                              image: e.target.value,
                                            },
                                          },
                                        })
                                      }
                                    />
                                  </div>
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-warning py-0 px-2 small fw-semibold"
                                    onClick={() => {
                                      setEventData((prev) => ({
                                        ...prev,
                                        popup_config: {
                                          ...prev.popup_config,
                                          mini_badge: {
                                            ...prev.popup_config?.mini_badge,
                                            image:
                                              'https://api-nk.vitinhnguyenkim.vn/uploads/events/event_1790130032_xPSRBkDy.png',
                                          },
                                        },
                                      }))
                                      toast.success('Đã chọn hình Hộp Quà Tết Trung Thu!')
                                    }}
                                  >
                                    🎁 Dùng ảnh Hộp quà 3D mặc định
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Cấu hình Icon Nổi (Floating Widget) phía trên nút Lên đầu trang */}
                      <hr className="my-3" />
                      <div>
                        <CFormCheck
                          id="checkFloatingWidget"
                          className="mb-2 fw-semibold"
                          label="Hiển thị Icon nổi góc dưới phải (phía trên nút Cuộn lên đầu trang) khi đóng popup"
                          checked={eventData.popup_config?.floating_widget?.enabled !== false}
                          onChange={(e) =>
                            setEventData({
                              ...eventData,
                              popup_config: {
                                ...eventData.popup_config,
                                floating_widget: {
                                  ...eventData.popup_config?.floating_widget,
                                  enabled: e.target.checked,
                                },
                              },
                            })
                          }
                        />

                        {eventData.popup_config?.floating_widget?.enabled !== false && (
                          <div className="ps-3 border-start border-2 border-warning mt-2">
                            <div className="mb-2">
                              <CFormLabel className="small fw-bold">Tiêu đề / Tooltip khi rê chuột:</CFormLabel>
                              <CFormInput
                                size="sm"
                                placeholder="VD: Lời chúc của bạn đã sẵn sàng!"
                                value={eventData.popup_config?.floating_widget?.title || ''}
                                onChange={(e) =>
                                  setEventData({
                                    ...eventData,
                                    popup_config: {
                                      ...eventData.popup_config,
                                      floating_widget: {
                                        ...eventData.popup_config?.floating_widget,
                                        title: e.target.value,
                                      },
                                    },
                                  })
                                }
                              />
                            </div>

                            <div className="mb-2">
                              <CFormLabel className="small fw-bold d-flex justify-content-between">
                                <span>Hình ảnh Icon nổi (Thỏ/Hộp quà):</span>
                                {eventData.popup_config?.floating_widget?.image && (
                                  <button
                                    type="button"
                                    className="btn btn-link text-danger p-0 text-decoration-none small"
                                    onClick={() =>
                                      setEventData((prev) => ({
                                        ...prev,
                                        popup_config: {
                                          ...prev.popup_config,
                                          floating_widget: {
                                            ...prev.popup_config?.floating_widget,
                                            image: '',
                                          },
                                        },
                                      }))
                                    }
                                  >
                                    Xóa ảnh (dùng mặc định)
                                  </button>
                                )}
                              </CFormLabel>

                              <div className="d-flex gap-2 align-items-center">
                                <div
                                  className="border rounded-circle p-1 bg-white d-flex align-items-center justify-content-center shadow-xs position-relative overflow-hidden"
                                  style={{ width: '50px', height: '50px', flexShrink: 0 }}
                                >
                                  <img
                                    src={
                                      eventData.popup_config?.floating_widget?.image ||
                                      '/images/event-floating-icon-default.png'
                                    }
                                    alt="Floating Icon"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    onError={(e) => {
                                      e.target.src = '/images/event-floating-icon-default.png'
                                    }}
                                  />
                                </div>

                                <div className="flex-grow-1">
                                  <div className="d-flex align-items-center gap-2 mb-1">
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="form-control form-control-sm"
                                      onChange={(e) => handleUploadFile(e, 'floating_widget', 'image')}
                                      disabled={uploadingField === 'floating_widget_image'}
                                    />
                                    {uploadingField === 'floating_widget_image' && (
                                      <CSpinner size="sm" color="primary" />
                                    )}
                                  </div>
                                  <div className="input-group input-group-sm">
                                    <span className="input-group-text">URL</span>
                                    <input
                                      type="text"
                                      className="form-control"
                                      placeholder="Hoặc dán URL icon..."
                                      value={eventData.popup_config?.floating_widget?.image || ''}
                                      onChange={(e) =>
                                        setEventData({
                                          ...eventData,
                                          popup_config: {
                                            ...eventData.popup_config,
                                            floating_widget: {
                                              ...eventData.popup_config?.floating_widget,
                                              image: e.target.value,
                                            },
                                          },
                                        })
                                      }
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CCol>

                  {/* Cột Phải: Tùy chỉnh Nội dung và HÌNH ẢNH các Bước */}
                  <CCol lg={7}>
                    <h5 className="fw-bold mb-3 text-primary border-bottom pb-2">
                      2. Nội Dung & Hình Ảnh Các Bước Popup
                    </h5>

                    {/* Bước 1 */}
                    <div className="p-3 mb-3 border rounded bg-white shadow-xs">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <strong className="text-danger">Bước 1: Chào Mừng & Đếm Khách (Ảnh 1)</strong>
                        <CBadge color="danger">Step 1</CBadge>
                      </div>

                      <div className="mb-3">
                        <CFormLabel className="small fw-bold">Nút hành động mở quà (Text nút bấm):</CFormLabel>
                        <CFormInput
                          value={eventData.popup_config?.step1?.button_text || ''}
                          placeholder="Mở quà ngay (hoặc Khám phá ngay, Xem quà...)"
                          onChange={(e) =>
                            setEventData({
                              ...eventData,
                              popup_config: {
                                ...eventData.popup_config,
                                step1: { ...eventData.popup_config?.step1, button_text: e.target.value },
                              },
                            })
                          }
                        />
                      </div>

                      {/* Upload ảnh minh họa Bước 1 */}
                      <div>
                        <CFormLabel className="small fw-bold d-flex justify-content-between">
                          <span>Hình ảnh minh họa Bước 1 (Thỏ ngọc & Quà):</span>
                          {eventData.popup_config?.step1?.image && (
                            <button
                              type="button"
                              className="text-danger btn btn-link p-0 text-decoration-none small"
                              onClick={() =>
                                setEventData((prev) => ({
                                  ...prev,
                                  popup_config: {
                                    ...prev.popup_config,
                                    step1: { ...prev.popup_config?.step1, image: '' },
                                  },
                                }))
                              }
                            >
                              Xóa ảnh (dùng mặc định)
                            </button>
                          )}
                        </CFormLabel>

                        <div className="d-flex gap-3 align-items-center">
                          {eventData.popup_config?.step1?.image ? (
                            <div className="position-relative border rounded p-1 bg-light">
                              <img
                                src={eventData.popup_config.step1.image}
                                alt="Step 1 Preview"
                                style={{ width: '80px', height: '80px', objectFit: 'contain' }}
                              />
                            </div>
                          ) : (
                            <div
                              className="border rounded d-flex align-items-center justify-content-center text-muted bg-light"
                              style={{ width: '80px', height: '80px', fontSize: '2rem' }}
                            >
                              🐰
                            </div>
                          )}

                          <div className="flex-grow-1">
                            <div className="d-flex align-items-center gap-2 mb-1">
                              <input
                                type="file"
                                accept="image/*"
                                className="form-control form-control-sm"
                                onChange={(e) => handleUploadFile(e, 'step1', 'image')}
                                disabled={uploadingField === 'step1_image'}
                              />
                              {uploadingField === 'step1_image' && (
                                <CSpinner size="sm" color="primary" />
                              )}
                            </div>
                            <div className="input-group input-group-sm mb-1">
                              <span className="input-group-text">URL</span>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Hoặc dán URL ảnh tại đây..."
                                value={eventData.popup_config?.step1?.image || ''}
                                onChange={(e) =>
                                  setEventData({
                                    ...eventData,
                                    popup_config: {
                                      ...eventData.popup_config,
                                      step1: { ...eventData.popup_config?.step1, image: e.target.value },
                                    },
                                  })
                                }
                              />
                            </div>
                            <div>
                              <button
                                type="button"
                                className="btn btn-outline-danger btn-sm py-0 px-2 small"
                                style={{ fontSize: '11px' }}
                                onClick={() =>
                                  setEventData({
                                    ...eventData,
                                    popup_config: {
                                      ...eventData.popup_config,
                                      step1: {
                                        ...eventData.popup_config?.step1,
                                        image:
                                          'https://api-nk.vitinhnguyenkim.vn/uploads/events/event_1790061385_pGhFFd5d.jpg',
                                      },
                                    },
                                  })
                                }
                              >
                                🎯 Dùng ngay banner Trung Thu vừa tải lên
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bước 2 */}
                    <div className="p-3 mb-3 border rounded bg-white shadow-xs">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <strong className="text-warning text-dark">Bước 2: Hộp Quà Bất Ngờ (Ảnh 2)</strong>
                        <CBadge color="warning">Step 2</CBadge>
                      </div>

                      <div className="mb-3">
                        <CFormLabel className="small fw-bold">Tiêu đề phụ:</CFormLabel>
                        <CFormInput
                          value={eventData.popup_config?.step2?.subtitle || ''}
                          onChange={(e) =>
                            setEventData({
                              ...eventData,
                              popup_config: {
                                ...eventData.popup_config,
                                step2: { ...eventData.popup_config?.step2, subtitle: e.target.value },
                              },
                            })
                          }
                        />
                      </div>

                      {/* Upload ảnh Bước 2 */}
                      <div>
                        <CFormLabel className="small fw-bold d-flex justify-content-between">
                          <span>Hình ảnh Hộp quà mở tỏa sáng (Bước 2):</span>
                          {eventData.popup_config?.step2?.image && (
                            <button
                              type="button"
                              className="text-danger btn btn-link p-0 text-decoration-none small"
                              onClick={() =>
                                setEventData((prev) => ({
                                  ...prev,
                                  popup_config: {
                                    ...prev.popup_config,
                                    step2: { ...prev.popup_config?.step2, image: '' },
                                  },
                                }))
                              }
                            >
                              Xóa ảnh (dùng mặc định)
                            </button>
                          )}
                        </CFormLabel>

                        <div className="d-flex gap-3 align-items-center">
                          {eventData.popup_config?.step2?.image ? (
                            <div className="position-relative border rounded p-1 bg-light">
                              <img
                                src={eventData.popup_config.step2.image}
                                alt="Step 2 Preview"
                                style={{ width: '80px', height: '80px', objectFit: 'contain' }}
                              />
                            </div>
                          ) : (
                            <div
                              className="border rounded d-flex align-items-center justify-content-center text-muted bg-light"
                              style={{ width: '80px', height: '80px', fontSize: '2rem' }}
                            >
                              🎁
                            </div>
                          )}

                          <div className="flex-grow-1">
                            <div className="d-flex align-items-center gap-2 mb-1">
                              <input
                                type="file"
                                accept="image/*"
                                className="form-control form-control-sm"
                                onChange={(e) => handleUploadFile(e, 'step2', 'image')}
                                disabled={uploadingField === 'step2_image'}
                              />
                              {uploadingField === 'step2_image' && (
                                <CSpinner size="sm" color="primary" />
                              )}
                            </div>
                            <div className="input-group input-group-sm">
                              <span className="input-group-text">URL</span>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Hoặc dán URL ảnh tại đây..."
                                value={eventData.popup_config?.step2?.image || ''}
                                onChange={(e) =>
                                  setEventData({
                                    ...eventData,
                                    popup_config: {
                                      ...eventData.popup_config,
                                      step2: { ...eventData.popup_config?.step2, image: e.target.value },
                                    },
                                  })
                                }
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bước 3: NHẬN LỜI CHÚC & ẢNH THIỆP CHÚC (ẢNH 4) */}
                    <div className="p-3 mb-3 border rounded bg-white shadow-xs border-success">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <strong className="text-success">Bước 3: Nhận Lời Chúc & Ảnh Thiệp (Ảnh 4)</strong>
                        <CBadge color="success">Step 3</CBadge>
                      </div>

                      <div className="mb-3">
                        <CFormLabel className="small fw-bold">Tiêu đề popup kết quả:</CFormLabel>
                        <CFormInput
                          value={eventData.popup_config?.step3?.title || ''}
                          onChange={(e) =>
                            setEventData({
                              ...eventData,
                              popup_config: {
                                ...eventData.popup_config,
                                step3: { ...eventData.popup_config?.step3, title: e.target.value },
                              },
                            })
                          }
                        />
                      </div>

                      {/* 2. Ảnh nền thiệp chúc (Khung nền để fill chữ câu chúc vào) */}
                      <div className="p-3 rounded bg-light border border-success">
                        <CFormLabel className="small fw-bold text-success d-flex justify-content-between align-items-center">
                          <span>🌟 Ảnh Nền Thiệp Chúc Mừng (Nơi fill câu chúc vào):</span>
                          {eventData.popup_config?.step3?.card_bg_image && (
                            <button
                              type="button"
                              className="text-danger btn btn-link p-0 text-decoration-none small"
                              onClick={() =>
                                setEventData((prev) => ({
                                  ...prev,
                                  popup_config: {
                                    ...prev.popup_config,
                                    step3: { ...prev.popup_config?.step3, card_bg_image: '' },
                                  },
                                }))
                              }
                            >
                              Xóa ảnh nền thiệp (dùng nền giấy ngà mặc định)
                            </button>
                          )}
                        </CFormLabel>

                        <div className="d-flex gap-3 align-items-center mb-2">
                          {eventData.popup_config?.step3?.card_bg_image ? (
                            <div
                              className="position-relative border rounded overflow-hidden shadow-xs"
                              style={{
                                width: '120px',
                                height: '80px',
                                backgroundImage: `url(${eventData.popup_config.step3.card_bg_image})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                              }}
                            />
                          ) : (
                            <div
                              className="border rounded d-flex align-items-center justify-content-center text-muted bg-white text-center p-2"
                              style={{ width: '120px', height: '80px', fontSize: '0.75rem' }}
                            >
                              Nền giấy ngà chuẩn
                            </div>
                          )}

                          <div className="flex-grow-1">
                            <div className="d-flex align-items-center gap-2 mb-1">
                              <input
                                type="file"
                                accept="image/*"
                                className="form-control form-control-sm"
                                onChange={(e) => handleUploadFile(e, 'step3', 'card_bg_image')}
                                disabled={uploadingField === 'step3_card_bg_image'}
                              />
                              {uploadingField === 'step3_card_bg_image' && (
                                <CSpinner size="sm" color="success" />
                              )}
                            </div>
                            <div className="input-group input-group-sm mb-1">
                              <span className="input-group-text">URL</span>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Dán link ảnh nền thiệp tại đây..."
                                value={eventData.popup_config?.step3?.card_bg_image || ''}
                                onChange={(e) =>
                                  setEventData({
                                    ...eventData,
                                    popup_config: {
                                      ...eventData.popup_config,
                                      step3: { ...eventData.popup_config?.step3, card_bg_image: e.target.value },
                                    },
                                  })
                                }
                              />
                            </div>
                            <div className="mt-1 d-flex flex-wrap gap-2">
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-success py-1 px-2.5 small fw-bold"
                                onClick={() => {
                                  setEventData((prev) => ({
                                    ...prev,
                                    popup_config: {
                                      ...prev.popup_config,
                                      step3: {
                                        ...prev.popup_config?.step3,
                                        card_bg_image:
                                          'https://api-nk.vitinhnguyenkim.vn/uploads/events/event_1790068535_kVWk0wTF.jpg',
                                      },
                                    },
                                  }))
                                  toast.success('Đã áp dụng ảnh banner Thiệp chúc mừng Trung Thu!')
                                }}
                              >
                                🎯 Dùng ngay banner Thiệp Chúc Mừng vừa tải lên
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-end mt-4">
                      <CButton
                        type="submit"
                        color="primary"
                        size="lg"
                        disabled={loading}
                        className="px-5 fw-bold shadow"
                      >
                        {loading ? <CSpinner size="sm" /> : 'Lưu Cấu Hình Sự Kiện'}
                      </CButton>
                    </div>
                  </CCol>
                </CRow>
              </CForm>
            </CTabPane>

            {/* TAB 2: QUẢN LÝ LỜI CHÚC */}
            <CTabPane visible={activeTab === 2}>
              <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                <div>
                  <h5 className="fw-bold text-dark m-0">Kho Lời Chúc May Mắn ({wishes.length} câu)</h5>
                  <small className="text-muted">
                    Khi người dùng bấm &quot;Mở quà ngay&quot;, hệ thống sẽ chọn ngẫu nhiên 1 lời chúc đang kích hoạt để trao tặng (tự động loại trừ các câu đã xem gần đây).
                  </small>
                </div>
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <div style={{ minWidth: '220px' }}>
                    <CFormInput
                      size="sm"
                      placeholder="Tìm kiếm lời chúc..."
                      value={wishSearch}
                      onChange={(e) => setWishSearch(e.target.value)}
                    />
                  </div>
                  <CButton
                    color="light"
                    className="border text-dark fw-semibold btn-sm"
                    onClick={handleSeedDefaults}
                  >
                    <CIcon icon={cilReload} className="me-1" /> Nạp Bộ Câu Chúc Mẫu
                  </CButton>
                  <CButton
                    color="danger"
                    className="text-white fw-bold shadow-sm btn-sm"
                    onClick={() => {
                      setEditingWish({
                        id: null,
                        title: 'Lời chúc đặc biệt',
                        content: '',
                        author: 'Vi tính Nguyên Kim',
                        is_active: true,
                      })
                      setModalWishVisible(true)
                    }}
                  >
                    <CIcon icon={cilPlus} className="me-1" /> Thêm Câu Chúc Mới
                  </CButton>
                </div>
              </div>

              <div className="border rounded overflow-hidden shadow-sm">
                <CTable hover responsive align="middle" className="mb-0">
                  <CTableHead color="light">
                    <CTableRow>
                      <CTableHeaderCell style={{ width: '60px' }}>ID</CTableHeaderCell>
                      <CTableHeaderCell style={{ width: '220px' }}>Tiêu Đề</CTableHeaderCell>
                      <CTableHeaderCell>Nội Dung Câu Chúc</CTableHeaderCell>
                      <CTableHeaderCell style={{ width: '180px' }}>Ký Tên</CTableHeaderCell>
                      <CTableHeaderCell style={{ width: '100px' }} className="text-center">
                        Lượt Mở
                      </CTableHeaderCell>
                      <CTableHeaderCell style={{ width: '110px' }} className="text-center">
                        Trạng Thái
                      </CTableHeaderCell>
                      <CTableHeaderCell style={{ width: '120px' }} className="text-center">
                        Thao Tác
                      </CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {filteredWishes.length === 0 ? (
                      <CTableRow>
                        <CTableDataCell colSpan={7} className="text-center py-4 text-muted">
                          {wishSearch ? 'Không tìm thấy câu chúc nào phù hợp với từ khóa tìm kiếm.' : 'Chưa có câu chúc nào. Hãy nhấn "Nạp Bộ Câu Chúc Mẫu" hoặc "Thêm Câu Chúc Mới"!'}
                        </CTableDataCell>
                      </CTableRow>
                    ) : (
                      filteredWishes.map((w) => (
                        <CTableRow key={w.id}>
                          <CTableDataCell className="fw-semibold text-muted">{w.id}</CTableDataCell>
                          <CTableDataCell className="fw-bold text-primary">{w.title || 'Lời chúc'}</CTableDataCell>
                          <CTableDataCell style={{ whiteSpace: 'pre-line' }}>{w.content}</CTableDataCell>
                          <CTableDataCell className="text-secondary small">{w.author || 'Vi tính Nguyên Kim'}</CTableDataCell>
                          <CTableDataCell className="text-center fw-bold">{w.views_count || 0}</CTableDataCell>
                          <CTableDataCell className="text-center">
                            {w.is_active ? (
                              <CBadge color="success">Kích hoạt</CBadge>
                            ) : (
                              <CBadge color="secondary">Tạm tắt</CBadge>
                            )}
                          </CTableDataCell>
                          <CTableDataCell className="text-center">
                            <CButton
                              color="light"
                              size="sm"
                              className="me-1 text-primary border"
                              onClick={() => {
                                setEditingWish(w)
                                setModalWishVisible(true)
                              }}
                            >
                              <CIcon icon={cilPencil} />
                            </CButton>
                            <CButton
                              color="light"
                              size="sm"
                              className="text-danger border"
                              onClick={() => handleDeleteWish(w.id)}
                            >
                              <CIcon icon={cilTrash} />
                            </CButton>
                          </CTableDataCell>
                        </CTableRow>
                      ))
                    )}
                  </CTableBody>
                </CTable>
              </div>
            </CTabPane>
          </CTabContent>
        </CCardBody>
      </CCard>

      {/* Modal Thêm / Sửa Câu Chúc */}
      <CModal visible={modalWishVisible} onClose={() => setModalWishVisible(false)}>
        <CModalHeader>
          <CModalTitle>{editingWish.id ? 'Chỉnh Sửa Câu Chúc' : 'Thêm Câu Chúc Mới'}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <div className="mb-3">
            <CFormLabel className="fw-semibold">Tiêu Đề Câu Chúc</CFormLabel>
            <CFormInput
              value={editingWish.title}
              onChange={(e) => setEditingWish({ ...editingWish, title: e.target.value })}
              placeholder="VD: Mùa Trăng Sum Vầy, Vạn Sự Như Ý..."
            />
          </div>
          <div className="mb-3">
            <CFormLabel className="fw-semibold">Nội Dung Lời Chúc (*)</CFormLabel>
            <CFormTextarea
              rows={4}
              value={editingWish.content}
              onChange={(e) => setEditingWish({ ...editingWish, content: e.target.value })}
              placeholder="Nhập nội dung lời chúc ý nghĩa gửi tới khách hàng..."
            />
          </div>
          <div className="mb-3">
            <CFormLabel className="fw-semibold">Chữ Ký / Đơn Vị Gửi</CFormLabel>
            <CFormInput
              value={editingWish.author}
              onChange={(e) => setEditingWish({ ...editingWish, author: e.target.value })}
              placeholder="Vi tính Nguyên Kim"
            />
          </div>
          <div className="mb-2">
            <CFormCheck
              id="wishActiveCheck"
              label="Kích hoạt câu chúc này trong danh sách quay ngẫu nhiên"
              checked={editingWish.is_active}
              onChange={(e) => setEditingWish({ ...editingWish, is_active: e.target.checked })}
            />
          </div>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalWishVisible(false)}>
            Hủy
          </CButton>
          <CButton color="primary" onClick={handleSaveWish}>
            Lưu Câu Chúc
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  )
}

export default EventGreetingManager
