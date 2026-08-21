import React, { useState } from 'react'
import {
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CFormInput,
  CFormSelect,
  CFormCheck,
  CImage,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CNav,
  CNavItem,
  CNavLink,
  CRow,
} from '@coreui/react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { axiosClient } from '../../axiosConfig'
import logoNk from '../../assets/images/logo/nk viền.png'

// Product ornament positioning style helper (Full frame 1:1)
const getProductOrnamentStyle = () => {
  return {
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    objectFit: 'fill',
    zIndex: 10,
  }
}

// Preset Background Patterns & Wallpapers
const PRESET_BACKGROUNDS = [
  {
    key: 'none',
    name: 'Nền trơn tiêu chuẩn',
    badge: 'Màu trơn',
    description: 'Chỉ hiển thị màu nền website thuần túy',
    gradient: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    tagColor: '#64748b',
  },
  {
    key: 'mooncakes',
    name: 'Bánh Trung Thu & Lồng Đèn',
    badge: 'Lễ Hội',
    description: 'Họa tiết bánh nướng sen, bánh dẻo & lồng đèn trung thu',
    gradient: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
    tagColor: '#d97706',
  },
  {
    key: 'stars_moon',
    name: 'Trăng Rằm & Tinh Tú',
    badge: 'Ban Đêm / Rằm',
    description: 'Mặt trăng vàng, mây ngũ sắc & chòm sao lung linh',
    gradient: 'linear-gradient(135deg, #fefce8 0%, #fef08a 100%)',
    tagColor: '#ca8a04',
  },
  {
    key: 'noel_snow',
    name: 'Giáng Sinh Tuyết Rơi & Chuông Vàng',
    badge: 'Noel / Xmas',
    description: 'Bông tuyết trắng tinh khôi, cây thông & chuông vàng Noel',
    gradient: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
    tagColor: '#16a34a',
  },
  {
    key: 'tet_blossoms',
    name: 'Tết Hoa Mai, Hoa Đào & Pháo Hoa',
    badge: 'Tết Nguyên Đán',
    description: 'Cành mai vàng, hoa đào hồng, thỏi vàng & bao lì xì',
    gradient: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)',
    tagColor: '#e11d48',
  },
  {
    key: 'cyber_grid',
    name: 'Công Nghệ Cyber & Mạch Vi Xử Lý',
    badge: 'Công Nghệ',
    description: 'Lưới ma trận Cyber Matrix & vi mạch máy tính hiện đại',
    gradient: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
    tagColor: '#2563eb',
  },
  {
    key: 'backtoschool',
    name: 'Tuổi Học Trò & Mùa Tựu Trường',
    badge: 'Khai Trường',
    description: 'Máy bay giấy, nón cử nhân, sách vở & ngôi sao học trò',
    gradient: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
    tagColor: '#7c3aed',
  },
  {
    key: 'blackfriday',
    name: 'Black Friday & Siêu Sale',
    badge: 'Siêu Giảm Giá',
    description: 'Họa tiết hộp quà, sấm sét neon & tag giảm giá hot',
    gradient: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    tagColor: '#0f172a',
  },
  {
    key: 'custom',
    name: 'Tải ảnh nền riêng từ máy tính',
    badge: 'Tùy chỉnh',
    description: 'Sử dụng ảnh nền tùy chỉnh riêng độc quyền của bạn',
    gradient: 'linear-gradient(135deg, #f1f5f9 0%, #cbd5e1 100%)',
    tagColor: '#334155',
  },
]

// Watermark Layer Component for Live Pattern Preview
const ThemeBackgroundWatermarkLayer = ({ background, themeCode }) => {
  const presetKey = background?.preset || themeCode || 'none'
  const opacityVal = background?.opacity !== undefined ? background.opacity : 0.15

  if (background?.customUrl) {
    return (
      <div
        aria-hidden="true"
        className="position-absolute top-0 start-0 w-100 h-100 pointer-events-none select-none"
        style={{
          backgroundImage: `url(${background.customUrl})`,
          backgroundRepeat: background.mode === 'cover' ? 'no-repeat' : 'repeat',
          backgroundSize: background.mode === 'cover' ? 'cover' : 'auto',
          backgroundPosition: 'center top',
          opacity: opacityVal,
          zIndex: 0,
        }}
      />
    )
  }

  if (!presetKey || presetKey === 'none' || presetKey === 'default') {
    return null
  }

  const uniqueId = `add-live-pattern-${presetKey}`

  return (
    <div
      aria-hidden="true"
      className="position-absolute top-0 start-0 w-100 h-100 overflow-hidden pointer-events-none select-none"
      style={{ opacity: opacityVal, zIndex: 0 }}
    >
      {(presetKey === 'mooncakes' || presetKey === 'trungthu') && (
        <svg className="w-100 h-100" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id={uniqueId} width="200" height="200" patternUnits="userSpaceOnUse">
              <text x="25" y="45" fontSize="28" fill="#d97706">
                🥮
              </text>
              <text x="130" y="55" fontSize="22" fill="#b45309">
                🏮
              </text>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#${uniqueId})`} />
        </svg>
      )}

      {(presetKey === 'backtoschool' || presetKey === 'truonghoc') && (
        <svg className="w-100 h-100" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id={uniqueId} width="160" height="160" patternUnits="userSpaceOnUse">
              <line
                x1="0"
                y1="40"
                x2="160"
                y2="40"
                stroke="#bfdbfe"
                strokeWidth="0.8"
                opacity="0.6"
              />
              <line
                x1="0"
                y1="80"
                x2="160"
                y2="80"
                stroke="#bfdbfe"
                strokeWidth="0.8"
                opacity="0.6"
              />
              <line
                x1="0"
                y1="120"
                x2="160"
                y2="120"
                stroke="#bfdbfe"
                strokeWidth="0.8"
                opacity="0.6"
              />
              <text x="20" y="30" fontSize="14" fill="#3b82f6" opacity="0.5">
                ✈
              </text>
              <text x="100" y="70" fontSize="14" fill="#3b82f6" opacity="0.5">
                ✦
              </text>
              <text x="60" y="110" fontSize="14" fill="#3b82f6" opacity="0.5">
                ✏
              </text>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#${uniqueId})`} />
        </svg>
      )}

      {presetKey === 'cyber_grid' && (
        <svg className="w-100 h-100" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id={uniqueId} width="80" height="80" patternUnits="userSpaceOnUse">
              <path
                d="M 80 0 L 0 0 0 80"
                fill="none"
                stroke="#2563eb"
                strokeWidth="0.8"
                strokeOpacity="0.3"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#${uniqueId})`} />
        </svg>
      )}
    </div>
  )
}

function AddThemeConfig() {
  const navigate = useNavigate()
  const [isSaving, setIsSaving] = useState(false)
  const [localOpacity, setLocalOpacity] = useState(0.15)
  const [activePreviewTab, setActivePreviewTab] = useState('home')

  const [newTheme, setNewTheme] = useState({
    name: '',
    code: '',
    tag: 'Chiến dịch mới',
    startDate: '',
    endDate: '',
    description: '',
    image:
      'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&q=80',
    colors: {
      primary: '#2356c4',
      secondary: '#ffb716',
      accent: '#e30019',
      background: '#f7f7f7',
      text: '#222222',
    },
    decorations: {
      particles: 'none',
      ornaments: 'none',
    },
    background: {
      preset: 'none',
      customUrl: '',
      opacity: 0.15,
      mode: 'pattern',
    },
  })

  const [activeMainTab, setActiveMainTab] = useState('overview')
  const [activeOrnamentTab, setActiveOrnamentTab] = useState('header_logo')
  const [previewModal, setPreviewModal] = useState({
    visible: false,
    title: '',
    type: 'product_ornament',
    imageUrl: '',
  })

  // Pages & Layout State
  const [pagesLayouts, setPagesLayouts] = useState([
    { id: 'home', name: 'Trang chủ (Home)', enabled: true, layout: 'Home - Tiêu chuẩn' },
    { id: 'category', name: 'Danh mục (Category)', enabled: true, layout: 'Category - Dạng lưới' },
    {
      id: 'product',
      name: 'Chi tiết sản phẩm (Product Detail)',
      enabled: true,
      layout: 'Product - Tiêu chuẩn',
    },
    { id: 'cart', name: 'Giỏ hàng (Cart)', enabled: true, layout: 'Cart - Tiêu chuẩn' },
    {
      id: 'checkout',
      name: 'Thanh toán (Checkout)',
      enabled: true,
      layout: 'Checkout - Tiêu chuẩn',
    },
  ])

  const compressImageBeforeUpload = (file, maxWidth = 1600, quality = 0.85) => {
    return new Promise((resolve) => {
      if (
        !file ||
        !file.type ||
        !file.type.startsWith('image/') ||
        file.type === 'image/svg+xml' ||
        file.type === 'image/png' ||
        file.size < 200 * 1024
      ) {
        resolve(file)
        return
      }

      const img = new Image()
      const reader = new FileReader()
      reader.onload = (e) => {
        img.onload = () => {
          let { width, height } = img
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width)
            width = maxWidth
          }

          const canvas = document.createElement('canvas')
          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0, width, height)

          canvas.toBlob(
            (blob) => {
              if (blob && blob.size < file.size) {
                const optimizedFile = new File(
                  [blob],
                  file.name.replace(/\.[^/.]+$/, '') + '.webp',
                  {
                    type: 'image/webp',
                    lastModified: Date.now(),
                  },
                )
                resolve(optimizedFile)
              } else {
                resolve(file)
              }
            },
            'image/webp',
            quality,
          )
        }
        img.onerror = () => resolve(file)
        img.src = e.target.result
      }
      reader.onerror = () => resolve(file)
      reader.readAsDataURL(file)
    })
  }

  const uploadFileToServer = async (fileOrBlob) => {
    const optimized = await compressImageBeforeUpload(fileOrBlob)
    const formData = new FormData()
    formData.append('file', optimized)
    const res = await axiosClient.post('theme/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return (
      res.data?.data?.url ||
      res.data?.url ||
      res.data?.data?.image ||
      res.data?.data?.filePath ||
      res.data?.filePath ||
      ''
    )
  }

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const uploadedUrl = await uploadFileToServer(file)
      if (uploadedUrl) {
        setNewTheme((prev) => ({ ...prev, image: uploadedUrl }))
        toast.success('Đã tải ảnh giao diện lên thành công!')
      }
    } catch (err) {
      toast.error('Lỗi upload ảnh: ' + err.message)
    }
  }

  const handleCustomBgUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const uploadedUrl = await uploadFileToServer(file)
      if (uploadedUrl) {
        setNewTheme((prev) => ({
          ...prev,
          background: {
            ...(prev?.background || {}),
            preset: 'custom',
            customUrl: uploadedUrl,
          },
        }))
        toast.success('Đã tải ảnh nền tùy chỉnh thành công!')
      }
    } catch (err) {
      toast.error('Lỗi upload ảnh nền: ' + err.message)
    }
  }

  const handleMainLogoUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const uploadedUrl = await uploadFileToServer(file)
      if (uploadedUrl) {
        setNewTheme((prev) => ({
          ...prev,
          decorations: {
            ...(prev?.decorations || {}),
            logoUrl: uploadedUrl,
          },
        }))
        toast.success('Đã tải ảnh Logo chiến dịch thành công!')
      }
    } catch (err) {
      toast.error('Lỗi upload ảnh Logo chiến dịch: ' + err.message)
    }
  }

  const handleLogoOrnamentUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const uploadedUrl = await uploadFileToServer(file)
      if (uploadedUrl) {
        setNewTheme((prev) => ({
          ...prev,
          decorations: {
            ...(prev?.decorations || {}),
            logoOrnamentUrl: uploadedUrl,
          },
        }))
        toast.success('Đã tải ảnh phụ kiện trang trí Logo thành công!')
      }
    } catch (err) {
      toast.error('Lỗi upload ảnh phụ kiện Logo: ' + err.message)
    }
  }

  const handleProductOrnamentUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Immediately show local preview
    const localUrl = URL.createObjectURL(file)
    setNewTheme((prev) => ({
      ...prev,
      decorations: {
        ...(prev?.decorations || {}),
        productOrnamentUrl: localUrl,
        productOrnamentPosition: 'full',
        productOrnamentSize: '100%',
      },
    }))

    try {
      const uploadedUrl = await uploadFileToServer(file)
      if (uploadedUrl) {
        setNewTheme((prev) => ({
          ...prev,
          decorations: {
            ...(prev?.decorations || {}),
            productOrnamentUrl: uploadedUrl,
            productOrnamentPosition: 'full',
            productOrnamentSize: '100%',
          },
        }))
        toast.success('Đã tải ảnh khung viền sản phẩm thành công!')
      } else {
        toast.warn('Đã chọn khung viền, vui lòng nhấn Lưu để hoàn tất!')
      }
    } catch (err) {
      console.error('Upload product ornament error:', err)
      toast.warn('Khung viền đã được gắn, hãy nhấn Lưu Chiến Dịch để lưu lại.')
    }
  }

  const handleFooterOrnamentUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Immediately show local preview
    const localUrl = URL.createObjectURL(file)
    setNewTheme((prev) => ({
      ...prev,
      decorations: {
        ...(prev?.decorations || {}),
        footerOrnamentUrl: localUrl,
      },
    }))

    try {
      const uploadedUrl = await uploadFileToServer(file)
      if (uploadedUrl) {
        setNewTheme((prev) => ({
          ...prev,
          decorations: {
            ...(prev?.decorations || {}),
            footerOrnamentUrl: uploadedUrl,
          },
        }))
        toast.success('Đã tải ảnh trang trí Chân trang thành công!')
      } else {
        toast.warn('Đã chọn hình trang trí, vui lòng nhấn Lưu để hoàn tất!')
      }
    } catch (err) {
      console.error('Upload footer ornament error:', err)
      toast.warn('Hình trang trí đã được gắn, hãy nhấn Lưu Chiến Dịch để lưu lại.')
    }
  }

  const handleSave = async () => {
    if (!newTheme.name) {
      toast.error('Vui lòng nhập tên chiến dịch giao diện!')
      return
    }

    try {
      setIsSaving(true)
      const payload = {
        name: newTheme.name,
        code: newTheme.code || 'campaign_' + Date.now(),
        start_date: newTheme.startDate || null,
        end_date: newTheme.endDate || null,
        is_active: false,
        theme_config: {
          tag: newTheme.tag,
          description: newTheme.description,
          image: newTheme.image,
          colors: newTheme.colors,
          decorations: {
            particles: newTheme?.background?.preset || newTheme?.code || 'none',
            ornaments: newTheme?.background?.preset || newTheme?.code || 'none',
            productOrnamentUrl: newTheme?.decorations?.productOrnamentUrl || '',
            productOrnamentPosition:
              newTheme?.decorations?.productOrnamentPosition || 'bottom-left',
            productOrnamentSize: newTheme?.decorations?.productOrnamentSize || '30%',
            productOrnamentApplyTo: newTheme?.decorations?.productOrnamentApplyTo || 'main_only',
            logoUrl: newTheme?.decorations?.logoUrl || '',
            logoOrnamentUrl: newTheme?.decorations?.logoOrnamentUrl || '',
            logoOrnamentPosition: newTheme?.decorations?.logoOrnamentPosition || 'bottom-left',
            logoOrnamentSize: newTheme?.decorations?.logoOrnamentSize || '36px',
            footerOrnamentUrl: newTheme?.decorations?.footerOrnamentUrl || '',
            footerOrnamentPosition: newTheme?.decorations?.footerOrnamentPosition || 'both-corners',
            footerOrnamentSize: newTheme?.decorations?.footerOrnamentSize || '48px',
          },
          background: newTheme.background || {
            preset: newTheme.decorations?.particles || 'none',
            customUrl: '',
            opacity: localOpacity,
            mode: 'pattern',
          },
          banners: {},
          sections: [],
        },
      }

      const res = await axiosClient.post('theme/save', payload)
      if (res.data?.status === true || res.status === 200) {
        toast.success('Tạo mới chiến dịch giao diện thành công!')
        navigate('/theme-custom/config')
      } else {
        toast.error(res.data?.message || 'Thêm mới thất bại!')
      }
    } catch (error) {
      console.error('Create theme config error:', error)
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi tạo mới chiến dịch!')
    } finally {
      setIsSaving(false)
    }
  }

  const currentPreset = newTheme?.background?.preset || 'none'
  const bgConfig = newTheme?.background || { preset: 'none', opacity: 0.15, mode: 'pattern' }
  const festiveTheme = newTheme?.decorations?.particles || newTheme?.code || 'none'

  const MAIN_BUILDER_TABS = [
    { key: 'overview', label: 'Tổng quan' },
    { key: 'colors', label: 'Màu sắc' },
    { key: 'resources', label: 'Banner & Tài nguyên' },
    { key: 'effects', label: 'Hiệu ứng' },
  ]

  return (
    <div className="pb-5">
      {/* Top Builder Header */}
      <div className="mb-4">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
          <h3 className="fw-bold mb-0" style={{ color: '#4a1512', fontSize: '23px' }}>
            Trình xây dựng giao diện
          </h3>
          <div className="d-flex align-items-center gap-2">
            <CButton
              color="primary"
              className="text-white px-3.5 py-2 fw-bold shadow-sm d-flex align-items-center gap-1.5"
              disabled={isSaving}
              onClick={handleSave}
            >
              {isSaving ? 'Đang lưu...' : 'Lưu Chiến Dịch Mới'}
            </CButton>
            <CButton
              color="secondary"
              variant="outline"
              className="fw-semibold px-3 py-2 d-flex align-items-center gap-1"
              onClick={() => navigate('/theme-custom/config')}
            >
              Quay lại danh sách
            </CButton>
          </div>
        </div>

        {/* Underline Style Navigation Tabs */}
        <div className="d-flex align-items-center gap-4 border-bottom pt-1 pb-0 overflow-auto">
          {MAIN_BUILDER_TABS.map((tab) => {
            const isActive = activeMainTab === tab.key
            return (
              <button
                key={tab.key}
                type="button"
                className={`btn btn-link text-decoration-none px-1 py-2.5 position-relative border-0 shadow-none ${
                  isActive ? 'text-danger fw-bold' : 'text-secondary fw-semibold'
                }`}
                style={{ fontSize: '14.5px', whiteSpace: 'nowrap' }}
                onClick={() => setActiveMainTab(tab.key)}
              >
                {tab.label}
                {isActive && (
                  <div
                    className="position-absolute bottom-0 start-0 w-100"
                    style={{
                      height: '3px',
                      backgroundColor: '#b91c1c',
                      borderRadius: '3px 3px 0 0',
                    }}
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* TAB 1: TỔNG QUAN */}
      {activeMainTab === 'overview' && (
        <CRow className="g-4 mb-4">
          {/* Thẻ 1: Thông tin chung & Lập lịch chiến dịch */}
          <CCol md={6}>
            <CCard className="h-100 shadow-xs border">
              <CCardHeader className="bg-white py-3 fw-bold text-dark border-bottom d-flex align-items-center justify-content-between">
                <span>
                  Thẻ 1: Thông tin chung &amp; Lập lịch chiến dịch (Campaign Info &amp; Schedule)
                </span>
              </CCardHeader>
              <CCardBody className="p-3">
                <CRow className="g-2 mb-2">
                  <CCol md={6}>
                    <label className="form-label font-semibold text-dark small mb-1">
                      Tên chiến dịch *
                    </label>
                    <CFormInput
                      size="sm"
                      placeholder="VD: Giáng Sinh 2026 / Tết 2027"
                      value={newTheme?.name || ''}
                      onChange={(e) => setNewTheme((prev) => ({ ...prev, name: e.target.value }))}
                    />
                  </CCol>
                  <CCol md={6}>
                    <label className="form-label font-semibold text-dark small mb-1">
                      Mã Code (Slug)
                    </label>
                    <CFormInput
                      size="sm"
                      placeholder="VD: noel_2026"
                      value={newTheme?.code || ''}
                      onChange={(e) => setNewTheme((prev) => ({ ...prev, code: e.target.value }))}
                    />
                  </CCol>
                </CRow>

                <CRow className="g-2 mb-2">
                  <CCol md={6}>
                    <label className="form-label font-semibold text-dark small mb-1">
                      Phân loại chiến dịch
                    </label>
                    <CFormInput
                      size="sm"
                      placeholder="VD: festive"
                      value={newTheme?.tag || 'festive'}
                      onChange={(e) => setNewTheme((prev) => ({ ...prev, tag: e.target.value }))}
                    />
                  </CCol>
                  <CCol md={6}>
                    <label className="form-label font-semibold text-dark small mb-1">
                      Mô tả chi tiết chiến dịch
                    </label>
                    <CFormInput
                      size="sm"
                      placeholder="Mô tả..."
                      value={newTheme?.description || ''}
                      onChange={(e) =>
                        setNewTheme((prev) => ({ ...prev, description: e.target.value }))
                      }
                    />
                  </CCol>
                </CRow>

                <CRow className="g-2 mb-2">
                  <CCol md={6}>
                    <label className="form-label font-semibold text-dark small mb-1">
                      Ngày bắt đầu
                    </label>
                    <CFormInput
                      type="date"
                      size="sm"
                      value={newTheme?.startDate || ''}
                      onChange={(e) =>
                        setNewTheme((prev) => ({ ...prev, startDate: e.target.value }))
                      }
                    />
                  </CCol>
                  <CCol md={6}>
                    <label className="form-label font-semibold text-dark small mb-1">
                      Ngày kết thúc
                    </label>
                    <CFormInput
                      type="date"
                      size="sm"
                      value={newTheme?.endDate || ''}
                      onChange={(e) =>
                        setNewTheme((prev) => ({ ...prev, endDate: e.target.value }))
                      }
                    />
                  </CCol>
                </CRow>
              </CCardBody>
            </CCard>
          </CCol>

          {/* Thẻ 2: Banner & Hero Assets */}
          <CCol md={6}>
            <CCard className="h-100 shadow-xs border">
              <CCardHeader className="bg-white py-3 fw-bold text-dark border-bottom d-flex align-items-center justify-content-between">
                <span>Thẻ 2: Banner &amp; Hình ảnh Giao diện (Banners &amp; Assets)</span>
              </CCardHeader>
              <CCardBody className="p-3 d-flex flex-column justify-content-between">
                <div>
                  <p className="text-muted text-xs mb-2">
                    Quản lý danh sách hình ảnh banner hiển thị trên chiến dịch
                  </p>

                  {/* Upload Box */}
                  <div className="p-3 bg-light rounded border text-center mb-3">
                    <label className="form-label font-semibold text-dark small mb-1">
                      Tải banner / ảnh đại diện mới từ máy tính
                    </label>
                    <CFormInput
                      type="file"
                      accept="image/*"
                      size="sm"
                      className="mb-2"
                      onChange={handleFileChange}
                    />
                    <span className="text-muted text-xs">
                      Chấp nhận JPG, PNG, WEBP (Tối đa 5MB)
                    </span>
                  </div>

                  {newTheme?.image && (
                    <div>
                      <span className="form-label font-semibold text-dark small d-block mb-1">
                        Ảnh đại diện chiến dịch
                      </span>
                      <div
                        className="rounded border overflow-hidden bg-light mb-3"
                        style={{ height: '120px' }}
                      >
                        <img
                          src={newTheme.image}
                          className="w-100 h-100"
                          style={{ objectFit: 'cover' }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      )}

      {/* TAB 2: MÀU SẮC */}
      {activeMainTab === 'colors' && (
        <CCard className="mb-4 shadow-xs border">
          <CCardHeader className="bg-white py-3 fw-bold text-dark border-bottom d-flex align-items-center justify-content-between">
            <span>Bảng màu tổng thể Website (Color Scheme &amp; Design Tokens)</span>
          </CCardHeader>
          <CCardBody className="p-4">
            <CRow className="g-4">
              <CCol md={6}>
                <CRow className="g-3">
                  {[
                    { label: 'Màu chính (Nút & Viền)', key: 'primary' },
                    { label: 'Màu thanh Menu Topbar', key: 'secondary' },
                    { label: 'Màu nhấn (Sale & Hotline)', key: 'accent' },
                    { label: 'Màu nền website', key: 'background' },
                    { label: 'Màu chữ văn bản', key: 'text' },
                  ].map((item) => (
                    <CCol key={item.key} md={12}>
                      <div className="p-3 border rounded bg-light d-flex align-items-center justify-content-between">
                        <span className="small text-secondary fw-semibold">{item.label}</span>
                        <div className="d-flex align-items-center gap-2">
                          <input
                            type="color"
                            value={newTheme?.colors?.[item.key] || '#2356c4'}
                            className="form-control form-control-color border-0 p-0 rounded cursor-pointer"
                            style={{ width: '32px', height: '32px' }}
                            onChange={(e) => {
                              const newCols = {
                                ...(newTheme?.colors || {}),
                                [item.key]: e.target.value,
                              }
                              setNewTheme((prev) => ({ ...prev, colors: newCols }))
                            }}
                          />
                          <CFormInput
                            size="sm"
                            value={newTheme?.colors?.[item.key] || '#2356c4'}
                            className="font-monospace text-uppercase"
                            style={{ width: '90px', fontSize: '12px' }}
                            onChange={(e) => {
                              const newCols = {
                                ...(newTheme?.colors || {}),
                                [item.key]: e.target.value,
                              }
                              setNewTheme((prev) => ({ ...prev, colors: newCols }))
                            }}
                          />
                        </div>
                      </div>
                    </CCol>
                  ))}
                </CRow>
              </CCol>

              <CCol md={6}>
                <label
                  className="form-label fw-bold text-dark mb-2 d-block"
                  style={{ fontSize: '14px' }}
                >
                  Xem trước phối màu giao diện (Color Mockup)
                </label>
                <div
                  className="p-3 rounded border shadow-xs"
                  style={{
                    backgroundColor: newTheme?.colors?.background || '#f7f7f7',
                    minHeight: '260px',
                  }}
                >
                  <div
                    className="p-3 rounded mb-3 text-white fw-bold d-flex justify-content-between align-items-center shadow-xs"
                    style={{ backgroundColor: newTheme?.colors?.secondary || '#ffb716' }}
                  >
                    <span>Menu / Header Topbar</span>
                    <span
                      className="badge px-2.5 py-1.5 fw-bold"
                      style={{ backgroundColor: newTheme?.colors?.accent || '#e30019' }}
                    >
                      HOT SALE -50%
                    </span>
                  </div>

                  <div className="p-3 bg-white rounded border shadow-xs mb-2">
                    <h6
                      className="fw-bold mb-1"
                      style={{ color: newTheme?.colors?.text || '#222222' }}
                    >
                      Tiêu đề sản phẩm mẫu
                    </h6>
                    <p
                      className="small mb-3"
                      style={{ color: newTheme?.colors?.text || '#555555' }}
                    >
                      Mô tả chi tiết sản phẩm hiển thị trên nền website với màu sắc phối chuẩn.
                    </p>
                    <div className="d-flex align-items-center gap-2">
                      <button
                        type="button"
                        className="btn btn-sm text-white fw-bold px-3 py-1.5 rounded"
                        style={{ backgroundColor: newTheme?.colors?.primary || '#2356c4' }}
                      >
                        Thêm vào giỏ hàng
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary fw-semibold px-3 py-1.5 rounded"
                      >
                        Xem chi tiết
                      </button>
                    </div>
                  </div>
                </div>
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>
      )}

      {/* TAB 4: BANNER & TÀI NGUYÊN (KHUNG SẢN PHẨM, LOGO & FOOTER) */}
      {activeMainTab === 'resources' && (
        <CRow className="mb-4">
          <CCol md={12}>
            <CCard className="shadow-xs border">
              <CCardHeader className="bg-white py-3 border-bottom">
                <h5 className="fw-bold text-dark mb-0">
                  {'Cấu hình Banner & Tài nguyên (Khung sản phẩm, Logo & Chân trang)'}
                </h5>
              </CCardHeader>

              <CCardBody className="p-4">
                <CRow className="g-4">
                  {/* Cột trái: Danh mục các mục trang trí */}
                  <CCol md={3} className="border-end pe-md-3">
                    <div className="d-flex flex-column gap-2">
                      {[
                        { key: 'product_image', title: 'Hình ảnh sản phẩm' },
                        { key: 'header_logo', title: 'Logo Header' },
                        { key: 'footer', title: 'Chân trang' },
                      ].map((subTab) => {
                        const isActive = activeOrnamentTab === subTab.key
                        return (
                          <button
                            key={subTab.key}
                            type="button"
                            className={`btn text-start py-2.5 px-3 rounded border transition-all ${
                              isActive
                                ? 'btn-primary text-white shadow-sm border-primary fw-bold'
                                : 'btn-light text-dark bg-white border-light-subtle fw-semibold'
                            }`}
                            style={{ fontSize: '13.5px' }}
                            onClick={() => setActiveOrnamentTab(subTab.key)}
                          >
                            {subTab.title}
                          </button>
                        )
                      })}
                    </div>
                  </CCol>

                  {/* Cột phải: Nội dung chi tiết cấu hình */}
                  <CCol md={9} className="ps-md-3">
                    {/* SUB-TAB 0: HÌNH ẢNH SẢN PHẨM */}
                    {activeOrnamentTab === 'product_image' && (
                      <CRow className="g-4 align-items-start">
                        {/* Cột trái: Tải ảnh khung viền & Phạm vi áp dụng */}
                        <CCol lg={5} md={12}>
                          <div className="d-flex flex-column gap-3">
                            {/* Khối 1: Tải ảnh khung viền */}
                            <div className="p-3 bg-light rounded border shadow-xs">
                              <label
                                className="form-label fw-bold text-dark mb-1 d-block"
                                style={{ fontSize: '13.5px' }}
                              >
                                Tải ảnh Khung viền trang trí sản phẩm
                              </label>
                              <CFormInput
                                type="file"
                                accept="image/png,image/webp,image/svg+xml"
                                size="sm"
                                className="mb-2"
                                onChange={handleProductOrnamentUpload}
                              />
                              <small
                                className="text-muted d-block mb-2"
                                style={{ fontSize: '11.5px', lineHeight: '1.4' }}
                              >
                                Khuyên dùng ảnh PNG / WEBP trong suốt chuẩn tỉ lệ 1:1 (Ví dụ:
                                1200x1200px)
                              </small>

                              {newTheme?.decorations?.productOrnamentUrl && (
                                <div className="d-flex align-items-center justify-content-between p-2 bg-white rounded border mt-2">
                                  <div className="d-flex align-items-center gap-2">
                                    <img
                                      src={newTheme.decorations.productOrnamentUrl}
                                      alt="Khung hiện tại"
                                      style={{
                                        width: '36px',
                                        height: '36px',
                                        objectFit: 'contain',
                                      }}
                                      className="rounded border p-0.5 bg-light"
                                    />
                                    <span
                                      className="text-success small fw-semibold"
                                      style={{ fontSize: '12px' }}
                                    >
                                      Đã gắn khung viền
                                    </span>
                                  </div>
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-danger py-0.5 px-2"
                                    style={{ fontSize: '11.5px' }}
                                    onClick={() =>
                                      setNewTheme((prev) => ({
                                        ...prev,
                                        decorations: {
                                          ...(prev?.decorations || {}),
                                          productOrnamentUrl: '',
                                        },
                                      }))
                                    }
                                  >
                                    Gỡ khung
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Khối 2: Phạm vi áp dụng */}
                            <div className="p-3 bg-light rounded border shadow-xs">
                              <label
                                className="form-label fw-bold text-dark mb-1 d-block"
                                style={{ fontSize: '13.5px' }}
                              >
                                Phạm vi áp dụng khung viền
                              </label>
                              <CFormSelect
                                size="sm"
                                value={newTheme?.decorations?.productOrnamentApplyTo || 'main_only'}
                                onChange={(e) =>
                                  setNewTheme((prev) => ({
                                    ...prev,
                                    decorations: {
                                      ...(prev?.decorations || {}),
                                      productOrnamentPosition: 'full',
                                      productOrnamentSize: '100%',
                                      productOrnamentApplyTo: e.target.value,
                                    },
                                  }))
                                }
                              >
                                <option value="main_only">
                                  Chỉ áp dụng cho ảnh bìa / đại diện chính của sản phẩm
                                </option>
                                <option value="all">
                                  Áp dụng cho tất cả hình ảnh trong chi tiết sản phẩm
                                </option>
                              </CFormSelect>
                              <small
                                className="text-muted d-block mt-2"
                                style={{ fontSize: '11.5px', lineHeight: '1.4' }}
                              >
                                Khung viền sẽ tự động áp dụng vừa vặn 4 cạnh lên khung ảnh sản phẩm
                              </small>
                            </div>
                          </div>
                        </CCol>

                        {/* Cột phải: Realistic Product Detail Mockup */}
                        <CCol lg={7} md={12}>
                          <div className="p-3 border rounded bg-white shadow-xs position-relative">
                            <div className="text-muted mb-2" style={{ fontSize: '11px' }}>
                              <span>Trang chủ</span> <span className="mx-1">/</span>
                              <span>Laptop</span> <span className="mx-1">/</span>
                              <span>Laptop Dell</span> <span className="mx-1">/</span>
                              <span className="text-dark fw-semibold">Laptop Dell Max</span>
                            </div>

                            <CRow className="g-3 align-items-center">
                              {/* Left: Product Image */}
                              <CCol md={5} sm={12}>
                                <div
                                  className="position-relative w-100 rounded border overflow-hidden bg-white d-flex align-items-center justify-content-center cursor-pointer shadow-xs mx-auto"
                                  style={{ maxWidth: '210px', aspectRatio: '1 / 1' }}
                                  title="Nhấp vào để phóng to xem chi tiết"
                                  onClick={() =>
                                    setPreviewModal({
                                      visible: true,
                                      title: 'Xem trước chi tiết ảnh sản phẩm kèm Khung viền',
                                      type: 'product_ornament',
                                      imageUrl: '',
                                    })
                                  }
                                >
                                  {/* Navigation Arrows */}
                                  <span
                                    className="position-absolute start-0 top-50 translate-middle-y text-muted ps-1.5 fw-bold user-select-none"
                                    style={{ fontSize: '16px', opacity: 0.5, zIndex: 5 }}
                                  >
                                    ‹
                                  </span>
                                  <span
                                    className="position-absolute end-0 top-50 translate-middle-y text-muted pe-1.5 fw-bold user-select-none"
                                    style={{ fontSize: '16px', opacity: 0.5, zIndex: 5 }}
                                  >
                                    ›
                                  </span>

                                  {/* Main Laptop Image */}
                                  <img
                                    src="https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80"
                                    alt="Dell Laptop Main"
                                    className="w-100 h-100"
                                    style={{ objectFit: 'contain', padding: '8px' }}
                                  />

                                  {/* Overlay Frame */}
                                  {newTheme?.decorations?.productOrnamentUrl ? (
                                    <img
                                      src={newTheme.decorations.productOrnamentUrl}
                                      alt="Product Ornament Overlay"
                                      className="position-absolute pointer-events-none"
                                      style={getProductOrnamentStyle()}
                                    />
                                  ) : (
                                    <div
                                      className="position-absolute bottom-0 start-0 p-1 m-1 bg-dark bg-opacity-75 text-white rounded pointer-events-none"
                                      style={{ fontSize: '8.5px' }}
                                    >
                                      [Chưa có khung]
                                    </div>
                                  )}
                                </div>
                              </CCol>

                              {/* Right: Product Info */}
                              <CCol md={7} sm={12}>
                                <h6
                                  className="fw-bold text-dark mb-1"
                                  style={{ fontSize: '13.5px' }}
                                >
                                  NB DELL PRO MAX 16 MC16250
                                </h6>
                                <p
                                  className="text-secondary small mb-1.5"
                                  style={{ fontSize: '10px', lineHeight: '1.3' }}
                                >
                                  ULTRA 7 265H VPRO / 16 INCH FHD+ 300NIT / 32GB DDR5 (2X16) / 512GB
                                  SSD / RTX PRO 500 6GB GDDR7 / WI-FI 6E / WIN11 HOME
                                </p>

                                <div
                                  className="d-flex flex-wrap align-items-center gap-1.5 text-muted small mb-1"
                                  style={{ fontSize: '10.5px' }}
                                >
                                  <span>
                                    Mã SP:{' '}
                                    <span className="text-primary fw-semibold">NBDE_MC16250</span>
                                  </span>
                                  <span>|</span>
                                  <span>
                                    Hiệu: <span className="text-primary fw-semibold">Dell</span>
                                  </span>
                                  <span>|</span>
                                  <span className="text-success fw-bold">Còn hàng</span>
                                </div>

                                <div className="d-flex align-items-center gap-1 mb-1">
                                  <span className="text-warning" style={{ fontSize: '11px' }}>
                                    ★★★★★
                                  </span>
                                  <span className="text-muted small" style={{ fontSize: '10px' }}>
                                    5
                                  </span>
                                </div>

                                <div className="d-flex align-items-baseline gap-2 mb-1">
                                  <span className="text-danger fw-bold fs-6">90.200.000 đ</span>
                                  <small className="text-muted" style={{ fontSize: '10px' }}>
                                    (Đã bao gồm VAT)
                                  </small>
                                </div>

                                <div
                                  className="text-success small fw-semibold mb-2 d-flex align-items-center gap-1"
                                  style={{ fontSize: '10.5px' }}
                                >
                                  <span>✔</span> Sẵn sàng giao ngay
                                </div>

                                {/* Quantity & Action Buttons */}
                                <div className="d-flex align-items-center gap-2 mb-2">
                                  <span
                                    className="text-dark small fw-semibold me-1"
                                    style={{ fontSize: '11px' }}
                                  >
                                    SL:
                                  </span>
                                  <div
                                    className="btn-group border rounded"
                                    style={{ height: '22px' }}
                                  >
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-light py-0 px-1.5 fw-bold"
                                      style={{ fontSize: '10px' }}
                                    >
                                      -
                                    </button>
                                    <span
                                      className="px-2 d-flex align-items-center bg-white small fw-bold"
                                      style={{ fontSize: '10px' }}
                                    >
                                      1
                                    </span>
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-light py-0 px-1.5 fw-bold"
                                      style={{ fontSize: '10px' }}
                                    >
                                      +
                                    </button>
                                  </div>
                                </div>

                                <div className="d-flex align-items-center gap-2">
                                  <button
                                    type="button"
                                    className="btn btn-warning fw-bold text-dark flex-grow-1 py-1 px-2 shadow-xs"
                                    style={{
                                      fontSize: '11px',
                                      backgroundColor: '#eab308',
                                      borderColor: '#eab308',
                                    }}
                                  >
                                    🛒 Thêm vào giỏ
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-primary fw-bold text-white flex-grow-1 py-1 px-2 shadow-xs"
                                    style={{
                                      fontSize: '11px',
                                      backgroundColor: '#2563eb',
                                      borderColor: '#2563eb',
                                    }}
                                  >
                                    ⚡ Mua ngay
                                  </button>
                                </div>
                              </CCol>
                            </CRow>
                          </div>
                        </CCol>
                      </CRow>
                    )}

                    {/* SUB-TAB 1: LOGO HEADER */}
                    {activeOrnamentTab === 'header_logo' && (
                      <div>
                        <CRow className="g-4 align-items-center">
                          <CCol md={7}>
                            <div className="p-3 bg-light rounded border mb-3">
                              <label className="form-label font-semibold text-dark small mb-1">
                                Tải ảnh Logo chiến dịch (Thay thế logo gốc)
                              </label>
                              <CFormInput
                                type="file"
                                accept="image/*"
                                size="sm"
                                className="mb-1"
                                onChange={handleMainLogoUpload}
                              />
                            </div>

                            <div className="p-3 bg-light rounded border mb-3">
                              <label className="form-label font-semibold text-dark small mb-1">
                                Tải hình phụ kiện trang trí gắn kèm Logo
                              </label>
                              <CFormInput
                                type="file"
                                accept="image/*"
                                size="sm"
                                className="mb-1"
                                onChange={handleLogoOrnamentUpload}
                              />
                            </div>

                            <CRow className="g-2">
                              <CCol md={6}>
                                <label className="form-label font-semibold text-dark text-xs mb-1">
                                  Vị trí gắn phụ kiện
                                </label>
                                <CFormSelect
                                  size="sm"
                                  value={
                                    newTheme?.decorations?.logoOrnamentPosition || 'bottom-right'
                                  }
                                  onChange={(e) =>
                                    setNewTheme((prev) => ({
                                      ...prev,
                                      decorations: {
                                        ...(prev?.decorations || {}),
                                        logoOrnamentPosition: e.target.value,
                                      },
                                    }))
                                  }
                                >
                                  <option value="top-left">Góc trên bên trái</option>
                                  <option value="top-right">Góc trên bên phải</option>
                                  <option value="bottom-left">Góc dưới bên trái</option>
                                  <option value="bottom-right">Góc dưới bên phải</option>
                                </CFormSelect>
                              </CCol>
                              <CCol md={6}>
                                <label className="form-label font-semibold text-dark text-xs mb-1">
                                  Kích thước phụ kiện
                                </label>
                                <CFormSelect
                                  size="sm"
                                  value={newTheme?.decorations?.logoOrnamentSize || '36px'}
                                  onChange={(e) =>
                                    setNewTheme((prev) => ({
                                      ...prev,
                                      decorations: {
                                        ...(prev?.decorations || {}),
                                        logoOrnamentSize: e.target.value,
                                      },
                                    }))
                                  }
                                >
                                  <option value="24px">Nhỏ (24px)</option>
                                  <option value="36px">Vừa (36px)</option>
                                  <option value="48px">Lớn (48px)</option>
                                  <option value="60px">Rất lớn (60px)</option>
                                </CFormSelect>
                              </CCol>
                            </CRow>
                          </CCol>

                          {/* Live Logo Preview Box */}
                          <CCol md={5}>
                            <div className="p-3 bg-light rounded border text-center">
                              <span className="fw-semibold text-dark text-xs d-block mb-2">
                                Xem trước trực tiếp Logo trên thanh Header
                              </span>
                              <div
                                className="p-3 rounded border shadow-xs d-flex align-items-center justify-content-center position-relative overflow-hidden"
                                style={{
                                  backgroundColor: newTheme?.colors?.secondary || '#ffb716',
                                  height: '110px',
                                }}
                              >
                                <div className="position-relative d-inline-block p-1">
                                  <img
                                    src={
                                      newTheme?.decorations?.logoUrl ||
                                      'https://vitinhnguyenkim.vn/wp-content/uploads/2023/10/logo-nguyen-kim.png'
                                    }
                                    alt="Logo Preview"
                                    style={{ maxHeight: '42px', objectFit: 'contain' }}
                                  />
                                  {newTheme?.decorations?.logoOrnamentUrl && (
                                    <img
                                      src={newTheme.decorations.logoOrnamentUrl}
                                      alt="Logo Ornament Preview"
                                      className="position-absolute"
                                      style={{
                                        ...getLogoOrnamentStyle(),
                                        width: newTheme?.decorations?.logoOrnamentSize || '36px',
                                        height: newTheme?.decorations?.logoOrnamentSize || '36px',
                                      }}
                                    />
                                  )}
                                </div>
                              </div>
                            </div>
                          </CCol>
                        </CRow>
                      </div>
                    )}

                    {/* SUB-TAB 2: FOOTER */}
                    {activeOrnamentTab === 'footer' && (
                      <CRow className="g-4 align-items-start">
                        {/* Cột trái: Tải ảnh & Cấu hình vị trí */}
                        <CCol lg={4} md={12}>
                          <div className="d-flex flex-column gap-3">
                            {/* Khối 1: Tải ảnh */}
                            <div className="p-3 bg-light rounded border shadow-xs">
                              <label
                                className="form-label fw-bold text-dark mb-1 d-block"
                                style={{ fontSize: '13.5px' }}
                              >
                                Tải ảnh trang trí Chân trang
                              </label>
                              <CFormInput
                                type="file"
                                accept="image/png,image/webp,image/svg+xml,image/*"
                                size="sm"
                                className="mb-2"
                                onChange={handleFooterOrnamentUpload}
                              />
                              <small
                                className="text-muted d-block mb-2"
                                style={{ fontSize: '11.5px', lineHeight: '1.4' }}
                              >
                                Khuyên dùng ảnh PNG / WEBP tách nền trong suốt
                              </small>

                              {newTheme?.decorations?.footerOrnamentUrl && (
                                <div className="d-flex align-items-center justify-content-between p-2 bg-white rounded border mt-2">
                                  <div className="d-flex align-items-center gap-2">
                                    <img
                                      src={newTheme.decorations.footerOrnamentUrl}
                                      alt="Footer Ornament"
                                      style={{
                                        width: '36px',
                                        height: '36px',
                                        objectFit: 'contain',
                                      }}
                                      className="rounded border p-0.5 bg-light"
                                    />
                                    <span
                                      className="text-success small fw-semibold"
                                      style={{ fontSize: '12px' }}
                                    >
                                      Đã gắn hình trang trí
                                    </span>
                                  </div>
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-danger py-0.5 px-2"
                                    style={{ fontSize: '11.5px' }}
                                    onClick={() =>
                                      setNewTheme((prev) => ({
                                        ...prev,
                                        decorations: {
                                          ...(prev?.decorations || {}),
                                          footerOrnamentUrl: '',
                                        },
                                      }))
                                    }
                                  >
                                    Gỡ hình
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Khối 2: Vị trí hiển thị */}
                            <div className="p-3 bg-light rounded border shadow-xs">
                              <label
                                className="form-label fw-bold text-dark mb-1 d-block"
                                style={{ fontSize: '13.5px' }}
                              >
                                Vị trí hiển thị trên Chân trang
                              </label>
                              <CFormSelect
                                size="sm"
                                value={
                                  newTheme?.decorations?.footerOrnamentPosition || 'both-corners'
                                }
                                onChange={(e) =>
                                  setNewTheme((prev) => ({
                                    ...prev,
                                    decorations: {
                                      ...(prev?.decorations || {}),
                                      footerOrnamentPosition: e.target.value,
                                    },
                                  }))
                                }
                              >
                                <option value="both-corners">
                                  Hai bên góc Chân trang (Both Corners)
                                </option>
                                <option value="top">
                                  Dải viền trên đầu Chân trang (Top Strip)
                                </option>
                                <option value="left-only">Chỉ góc bên trái Chân trang</option>
                                <option value="right-only">Chỉ góc bên phải Chân trang</option>
                                <option value="full">
                                  Phủ nền chìm toàn bộ Chân trang (Watermark)
                                </option>
                              </CFormSelect>
                              <small
                                className="text-muted d-block mt-2"
                                style={{ fontSize: '11.5px', lineHeight: '1.4' }}
                              >
                                Hình ảnh trang trí sẽ tự động đè lên vị trí tương ứng trên Chân
                                trang
                              </small>
                            </div>

                            {/* Khối 3: Kích thước */}
                            <div className="p-3 bg-light rounded border shadow-xs">
                              <label
                                className="form-label fw-bold text-dark mb-1 d-block"
                                style={{ fontSize: '13.5px' }}
                              >
                                Kích thước hình trang trí
                              </label>
                              <CFormSelect
                                size="sm"
                                value={newTheme?.decorations?.footerOrnamentSize || '48px'}
                                onChange={(e) =>
                                  setNewTheme((prev) => ({
                                    ...prev,
                                    decorations: {
                                      ...(prev?.decorations || {}),
                                      footerOrnamentSize: e.target.value,
                                    },
                                  }))
                                }
                              >
                                <option value="36px">Nhỏ (36px)</option>
                                <option value="48px">Tiêu chuẩn (48px)</option>
                                <option value="64px">Lớn (64px)</option>
                                <option value="80px">Rất lớn (80px)</option>
                                <option value="110px">Cực lớn (110px)</option>
                              </CFormSelect>
                            </div>
                          </div>
                        </CCol>

                        {/* Cột phải: Realistic Nguyen Kim Footer Mockup */}
                        <CCol lg={8} md={12}>
                          <div className="p-3 border rounded bg-white shadow-xs position-relative overflow-hidden">
                            <div className="d-flex align-items-center justify-content-between mb-2">
                              <span className="text-dark fw-bold" style={{ fontSize: '12px' }}>
                                Xem trước Chân trang Website (Live Footer Preview)
                              </span>
                              <span
                                className="badge bg-light text-muted border"
                                style={{ fontSize: '10.5px' }}
                              >
                                Khớp 100% giao diện thực tế
                              </span>
                            </div>

                            {/* Mockup Container */}
                            <div
                              className="position-relative border rounded p-3 bg-white shadow-xs"
                              style={{
                                minHeight: '340px',
                                backgroundColor: '#ffffff',
                                fontSize: '11px',
                                color: '#444',
                                fontFamily: 'system-ui, -apple-system, sans-serif',
                              }}
                            >
                              {/* FLOATING ACTION BUTTONS (LEFT) */}
                              <div
                                className="position-absolute start-0 top-50 translate-middle-y d-flex flex-column gap-1.5 ms-1"
                                style={{ zIndex: 12 }}
                              >
                                <div
                                  className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center shadow-xs"
                                  style={{ width: '24px', height: '24px', fontSize: '11px' }}
                                  title="Messenger"
                                >
                                  💬
                                </div>
                                <div
                                  className="rounded-circle text-white d-flex align-items-center justify-content-center fw-bold shadow-xs"
                                  style={{
                                    width: '24px',
                                    height: '24px',
                                    fontSize: '8.5px',
                                    backgroundColor: '#0068ff',
                                  }}
                                  title="Zalo"
                                >
                                  Zalo
                                </div>
                                <div
                                  className="rounded-circle text-white d-flex align-items-center justify-content-center shadow-xs"
                                  style={{
                                    width: '24px',
                                    height: '24px',
                                    fontSize: '10px',
                                    backgroundColor: '#eab308',
                                  }}
                                  title="Hotline"
                                >
                                  🎧
                                </div>
                              </div>

                              {/* FLOATING BACK TO TOP (BOTTOM RIGHT) */}
                              <div
                                className="position-absolute end-0 bottom-0 m-2 rounded-circle text-white d-flex align-items-center justify-content-center shadow-xs"
                                style={{
                                  width: '24px',
                                  height: '24px',
                                  fontSize: '10px',
                                  backgroundColor: '#eab308',
                                  zIndex: 12,
                                }}
                                title="Lên đầu trang"
                              >
                                ▲
                              </div>

                              {/* OVERLAY ORNAMENT LAYERS */}
                              {newTheme?.decorations?.footerOrnamentUrl && (
                                <>
                                  {/* Position: TOP STRIP */}
                                  {newTheme.decorations.footerOrnamentPosition === 'top' && (
                                    <img
                                      src={newTheme.decorations.footerOrnamentUrl}
                                      alt="Footer Ornament Top"
                                      className="position-absolute start-0 end-0 top-0 w-100 pointer-events-none"
                                      style={{
                                        height: newTheme.decorations.footerOrnamentSize || '48px',
                                        objectFit: 'cover',
                                        zIndex: 10,
                                      }}
                                    />
                                  )}

                                  {/* Position: BOTH CORNERS */}
                                  {(newTheme.decorations.footerOrnamentPosition ===
                                    'both-corners' ||
                                    !newTheme.decorations.footerOrnamentPosition) && (
                                    <>
                                      <img
                                        src={newTheme.decorations.footerOrnamentUrl}
                                        alt="Footer Corner Left"
                                        className="position-absolute start-0 top-0 pointer-events-none p-1"
                                        style={{
                                          height: newTheme.decorations.footerOrnamentSize || '48px',
                                          objectFit: 'contain',
                                          zIndex: 10,
                                        }}
                                      />
                                      <img
                                        src={newTheme.decorations.footerOrnamentUrl}
                                        alt="Footer Corner Right"
                                        className="position-absolute end-0 top-0 pointer-events-none p-1"
                                        style={{
                                          height: newTheme.decorations.footerOrnamentSize || '48px',
                                          objectFit: 'contain',
                                          zIndex: 10,
                                          transform: 'scaleX(-1)',
                                        }}
                                      />
                                    </>
                                  )}

                                  {/* Position: LEFT ONLY */}
                                  {newTheme.decorations.footerOrnamentPosition === 'left-only' && (
                                    <img
                                      src={newTheme.decorations.footerOrnamentUrl}
                                      alt="Footer Left Only"
                                      className="position-absolute start-0 bottom-0 pointer-events-none p-1.5"
                                      style={{
                                        height: newTheme.decorations.footerOrnamentSize || '48px',
                                        objectFit: 'contain',
                                        zIndex: 10,
                                      }}
                                    />
                                  )}

                                  {/* Position: RIGHT ONLY */}
                                  {newTheme.decorations.footerOrnamentPosition === 'right-only' && (
                                    <img
                                      src={newTheme.decorations.footerOrnamentUrl}
                                      alt="Footer Right Only"
                                      className="position-absolute end-0 bottom-0 pointer-events-none p-1.5"
                                      style={{
                                        height: newTheme.decorations.footerOrnamentSize || '48px',
                                        objectFit: 'contain',
                                        zIndex: 10,
                                      }}
                                    />
                                  )}

                                  {/* Position: FULL WATERMARK OVERLAY */}
                                  {newTheme.decorations.footerOrnamentPosition === 'full' && (
                                    <img
                                      src={newTheme.decorations.footerOrnamentUrl}
                                      alt="Footer Full Overlay"
                                      className="position-absolute start-0 top-0 w-100 h-100 pointer-events-none"
                                      style={{
                                        objectFit: 'cover',
                                        opacity: 0.18,
                                        zIndex: 0,
                                      }}
                                    />
                                  )}
                                </>
                              )}

                              {/* FOOTER REALISTIC CONTENT */}
                              <div className="position-relative px-2 py-1" style={{ zIndex: 2 }}>
                                {/* TOP ROW: 4 COLUMNS */}
                                <CRow className="g-3 mb-3">
                                  {/* Cột 1: Về Nguyên Kim */}
                                  <CCol md={3} xs={6}>
                                    <div
                                      className="fw-bold mb-2"
                                      style={{ color: '#d97706', fontSize: '11.5px' }}
                                    >
                                      Về Nguyên Kim
                                    </div>
                                    <div
                                      className="d-flex flex-column gap-1 text-secondary"
                                      style={{ fontSize: '9.5px', lineHeight: '1.4' }}
                                    >
                                      <span>Giới thiệu công ty</span>
                                      <span>Tư vấn hỏi đáp</span>
                                      <span>Liên hệ và góp ý</span>
                                      <span>Yêu cầu báo giá</span>
                                    </div>
                                  </CCol>

                                  {/* Cột 2: Chính sách & Điều khoản */}
                                  <CCol md={3} xs={6}>
                                    <div
                                      className="fw-bold mb-2"
                                      style={{ color: '#d97706', fontSize: '11.5px' }}
                                    >
                                      Chính sách &amp; Điều khoản
                                    </div>
                                    <div
                                      className="d-flex flex-column gap-1 text-secondary"
                                      style={{ fontSize: '9.5px', lineHeight: '1.4' }}
                                    >
                                      <span>Hướng dẫn gửi bảo hành</span>
                                      <span>Chính sách bảo mật TT cá nhân</span>
                                      <span>Chính sách giao hàng</span>
                                      <span>Chính sách bảo hành</span>
                                      <span>Quy định thanh toán</span>
                                      <span>Chính sách hoàn tiền</span>
                                      <span>Chính sách đổi sản phẩm</span>
                                      <span>Chính sách kiểm hàng</span>
                                    </div>
                                  </CCol>

                                  {/* Cột 3: Tổng đài hỗ trợ */}
                                  <CCol md={3} xs={6}>
                                    <div
                                      className="fw-bold mb-2"
                                      style={{ color: '#d97706', fontSize: '11.5px' }}
                                    >
                                      Tổng đài hỗ trợ
                                    </div>
                                    <div className="d-flex align-items-center gap-1.5 mb-2">
                                      <span
                                        className="d-inline-flex align-items-center justify-content-center text-white rounded"
                                        style={{
                                          backgroundColor: '#cc181e',
                                          width: '22px',
                                          height: '22px',
                                          fontSize: '9px',
                                        }}
                                      >
                                        ▶
                                      </span>
                                      <span
                                        className="d-inline-flex align-items-center justify-content-center text-white rounded fw-bold"
                                        style={{
                                          backgroundColor: '#1877f2',
                                          width: '22px',
                                          height: '22px',
                                          fontSize: '11px',
                                        }}
                                      >
                                        f
                                      </span>
                                    </div>
                                    <div
                                      className="border rounded bg-white p-1.5 shadow-xs"
                                      style={{ fontSize: '9px', maxWidth: '140px' }}
                                    >
                                      <div className="d-flex align-items-center gap-1 mb-1">
                                        <span
                                          className="rounded-circle border d-inline-block"
                                          style={{
                                            width: '14px',
                                            height: '14px',
                                            backgroundColor: '#d97706',
                                          }}
                                        />
                                        <span
                                          className="fw-bold text-dark"
                                          style={{ fontSize: '8.5px' }}
                                        >
                                          Vi Tính Nguyên Kim
                                        </span>
                                      </div>
                                      <div
                                        className="text-muted mb-1"
                                        style={{ fontSize: '7.5px' }}
                                      >
                                        25K người theo dõi
                                      </div>
                                      <button
                                        type="button"
                                        className="btn btn-sm btn-light border py-0 px-1 w-100 fw-semibold"
                                        style={{ fontSize: '8px' }}
                                      >
                                        f Theo dõi Trang
                                      </button>
                                    </div>
                                  </CCol>

                                  {/* Cột 4: Vị trí của chúng tôi */}
                                  <CCol md={3} xs={6}>
                                    <div
                                      className="fw-bold mb-2"
                                      style={{ color: '#d97706', fontSize: '11.5px' }}
                                    >
                                      Vị trí của chúng tôi
                                    </div>
                                    <div
                                      className="border rounded bg-light p-1.5 position-relative overflow-hidden text-center"
                                      style={{
                                        height: '80px',
                                        background:
                                          'linear-gradient(135deg, #e0f2fe 0%, #fef3c7 100%)',
                                      }}
                                    >
                                      <span
                                        className="badge bg-white text-primary border position-absolute top-0 start-0 m-1"
                                        style={{ fontSize: '7.5px' }}
                                      >
                                        Maps ↗
                                      </span>
                                      <div
                                        className="mt-3 text-danger fw-bold"
                                        style={{ fontSize: '8.5px' }}
                                      >
                                        📍 Công Ty TNHH TTNA
                                      </div>
                                      <small
                                        className="text-muted d-block"
                                        style={{ fontSize: '7.5px' }}
                                      >
                                        Nhà Thờ Giáo Xứ Tân Định
                                      </small>
                                    </div>
                                  </CCol>
                                </CRow>

                                {/* BOTTOM ROW: COMPANY INFO & CERTIFICATES */}
                                <CRow className="g-3 align-items-center pt-2">
                                  {/* Thông tin công ty & Logo */}
                                  <CCol md={4} sm={12}>
                                    <div className="mb-1.5">
                                      <div className="lh-1 mb-1">
                                        <span
                                          className="fw-bold"
                                          style={{ color: '#e11d48', fontSize: '15px' }}
                                        >
                                          nguyên kim
                                        </span>
                                        <br />
                                        <span
                                          className="fw-bold"
                                          style={{ color: '#2563eb', fontSize: '13px' }}
                                        >
                                          computer
                                        </span>
                                        <small
                                          className="d-block text-danger fw-semibold"
                                          style={{ fontSize: '7.5px' }}
                                        >
                                          Since 2004
                                        </small>
                                      </div>
                                      <div
                                        className="fw-bold"
                                        style={{ color: '#2563eb', fontSize: '10.5px' }}
                                      >
                                        Công ty TNHH Vi tính Nguyên Kim
                                      </div>
                                    </div>

                                    <div
                                      className="text-secondary d-flex flex-column gap-0.5"
                                      style={{ fontSize: '8.5px', lineHeight: '1.35' }}
                                    >
                                      <div>
                                        📍 245B Trần Quang Khải, khu phố 9, Phường Tân Định, TP. Hồ
                                        Chí Minh
                                      </div>
                                      <div>
                                        📞 CSKH: <strong className="text-dark">1800 6739</strong> -
                                        Mã Số Thuế: 0303753468
                                      </div>
                                      <div>✉ cskh@nguyenkimvn.vn</div>
                                      <div>
                                        🕒 8h - 17h45 (Từ thứ Hai đến thứ Sáu), Thứ 7: 8h - 16h
                                      </div>
                                    </div>

                                    <div className="mt-1.5">
                                      <span
                                        className="badge px-1.5 py-1 text-primary border"
                                        style={{
                                          fontSize: '7.5px',
                                          backgroundColor: '#eff6ff',
                                          borderColor: '#bfdbfe',
                                        }}
                                      >
                                        ✔ ĐÃ THÔNG BÁO BỘ CÔNG THƯƠNG
                                      </span>
                                    </div>
                                  </CCol>

                                  {/* Nhà phân phối uy tín */}
                                  <CCol md={4} sm={6}>
                                    <div className="text-center">
                                      <div
                                        className="fw-bold mb-2"
                                        style={{ color: '#d97706', fontSize: '9px' }}
                                      >
                                        NHÀ PHÂN PHỐI UY TÍN CHẤT LƯỢNG HÀNG ĐẦU
                                      </div>
                                      <div className="d-flex flex-wrap align-items-center justify-content-center gap-1.5">
                                        <div
                                          className="border rounded p-1 bg-white text-center shadow-xs"
                                          style={{ width: '46px', height: '46px' }}
                                        >
                                          <div style={{ fontSize: '7px', color: '#b45309' }}>
                                            🏛
                                          </div>
                                          <span style={{ fontSize: '6px', fontWeight: 'bold' }}>
                                            TRUST
                                          </span>
                                        </div>
                                        <div
                                          className="border rounded p-1 bg-white text-center shadow-xs"
                                          style={{ width: '46px', height: '46px' }}
                                        >
                                          <div style={{ fontSize: '7px', color: '#d97706' }}>
                                            🏆
                                          </div>
                                          <span style={{ fontSize: '6px', fontWeight: 'bold' }}>
                                            TOP BRAND
                                          </span>
                                        </div>
                                        <div
                                          className="border rounded p-1 bg-white text-center shadow-xs d-flex align-items-center justify-content-center"
                                          style={{ width: '46px', height: '46px' }}
                                        >
                                          <span
                                            className="fw-bold text-success"
                                            style={{ fontSize: '7px' }}
                                          >
                                            FAST500
                                          </span>
                                        </div>
                                        <div
                                          className="border rounded p-1 bg-white text-center shadow-xs d-flex align-items-center justify-content-center"
                                          style={{ width: '46px', height: '46px' }}
                                        >
                                          <span
                                            className="fw-bold text-danger"
                                            style={{ fontSize: '7px' }}
                                          >
                                            VNR500
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </CCol>

                                  {/* Chứng nhận đối tác */}
                                  <CCol md={4} sm={6}>
                                    <div className="text-center">
                                      <div
                                        className="fw-bold mb-2"
                                        style={{ color: '#d97706', fontSize: '9px' }}
                                      >
                                        CHỨNG NHẬN ĐỐI TÁC
                                      </div>
                                      <div className="d-flex flex-wrap align-items-center justify-content-center gap-1.5">
                                        <div
                                          className="border rounded p-1 bg-white shadow-xs d-flex align-items-center justify-content-center"
                                          style={{ width: '48px', height: '36px' }}
                                        >
                                          <span
                                            className="fw-bold text-primary"
                                            style={{ fontSize: '11px' }}
                                          >
                                            hp
                                          </span>
                                        </div>
                                        <div
                                          className="border rounded p-1 bg-white shadow-xs d-flex align-items-center justify-content-center"
                                          style={{ width: '48px', height: '36px' }}
                                        >
                                          <span
                                            className="fw-bold text-dark"
                                            style={{ fontSize: '9px' }}
                                          >
                                            ASUS
                                          </span>
                                        </div>
                                        <div
                                          className="border rounded p-1 bg-white shadow-xs d-flex align-items-center justify-content-center"
                                          style={{ width: '56px', height: '36px' }}
                                        >
                                          <span
                                            className="fw-bold text-info"
                                            style={{ fontSize: '8px' }}
                                          >
                                            DELL
                                          </span>
                                        </div>
                                        <div
                                          className="border rounded p-1 bg-white shadow-xs d-flex align-items-center justify-content-center"
                                          style={{ width: '52px', height: '36px' }}
                                        >
                                          <span
                                            className="badge bg-danger text-white p-0.5"
                                            style={{ fontSize: '7.5px' }}
                                          >
                                            Lenovo
                                          </span>
                                        </div>
                                        <div
                                          className="border rounded p-1 bg-white shadow-xs d-flex align-items-center justify-content-center"
                                          style={{ width: '56px', height: '36px' }}
                                        >
                                          <span
                                            className="fw-bold text-primary"
                                            style={{ fontSize: '7.5px' }}
                                          >
                                            SAMSUNG
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </CCol>
                                </CRow>
                              </div>
                            </div>
                          </div>
                        </CCol>
                      </CRow>
                    )}
                  </CCol>
                </CRow>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      )}

      {/* TAB 5: HIỆU ỨNG (BACKGROUND & WATERMARKS) */}
      {activeMainTab === 'effects' && (
        <CCard className="mb-4 shadow-xs border">
          <CCardHeader className="bg-white py-3 fw-bold text-dark border-bottom d-flex align-items-center justify-content-between">
            <span>Họa tiết &amp; Hoa văn nền Website (Background &amp; Watermarks)</span>
          </CCardHeader>
          <CCardBody className="p-4">
            <CRow className="g-4">
              <CCol md={6}>
                <div className="mb-3">
                  <label className="form-label font-semibold text-dark small mb-1">
                    Chọn mẫu hoa văn nền
                  </label>
                  <CFormSelect
                    size="sm"
                    value={currentPreset}
                    onChange={(e) =>
                      setNewTheme((prev) => ({
                        ...prev,
                        background: {
                          ...bgConfig,
                          preset: e.target.value,
                        },
                      }))
                    }
                  >
                    {PRESET_BACKGROUNDS.map((p) => (
                      <option key={p.key} value={p.key}>
                        {p.name}
                      </option>
                    ))}
                  </CFormSelect>
                </div>

                {currentPreset === 'custom' && (
                  <div className="mb-3">
                    <label className="form-label font-semibold text-dark small mb-1">
                      Tải ảnh nền riêng
                    </label>
                    <CFormInput type="file" size="sm" onChange={handleCustomBgUpload} />
                  </div>
                )}

                {/* OPACITY SLIDER */}
                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <label className="form-label font-semibold text-dark small mb-0">
                      Độ đậm nhạt hoa văn (Opacity)
                    </label>
                    <span className="text-muted text-xs font-monospace">
                      {Math.round((localOpacity || 0.15) * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    className="form-range"
                    min="0.05"
                    max="0.8"
                    step="0.05"
                    value={localOpacity || 0.15}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value)
                      setLocalOpacity(val)
                      setNewTheme((prev) => ({
                        ...prev,
                        background: {
                          ...(prev?.background || {}),
                          opacity: val,
                        },
                      }))
                    }}
                  />
                </div>

                {/* COVERAGE MODE SELECT */}
                <div className="mb-3">
                  <label className="form-label font-semibold text-dark small mb-1">
                    Chế độ áp dụng hoa văn
                  </label>
                  <CFormSelect
                    size="sm"
                    value={newTheme?.background?.mode || 'pattern'}
                    onChange={(e) =>
                      setNewTheme((prev) => ({
                        ...prev,
                        background: {
                          ...(prev?.background || {}),
                          mode: e.target.value,
                        },
                      }))
                    }
                  >
                    <option value="pattern">Áp dụng lặp lại toàn trang (Full Page)</option>
                    <option value="banner_only">Chỉ áp dụng khu vực Banner chính</option>
                    <option value="header_footer">Áp dụng khu vực Header &amp; Footer</option>
                  </CFormSelect>
                </div>
              </CCol>

              <CCol md={6}>
                {/* LIVE WATERMARK PREVIEW */}
                <div>
                  <span className="fw-semibold text-dark text-xs d-block mb-1">
                    Xem trước trực tiếp hoa văn nền (Live Preview)
                  </span>
                  <div
                    className="rounded border overflow-hidden position-relative"
                    style={{
                      backgroundColor: newTheme?.colors?.background || '#f7f7f7',
                      height: '180px',
                    }}
                  >
                    <ThemeBackgroundWatermarkLayer
                      background={{ ...bgConfig, opacity: localOpacity }}
                      themeCode={newTheme?.code}
                    />
                  </div>
                </div>
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>
      )}

      {/* Footer Action Bar */}
      <div className="d-flex align-items-center justify-content-end gap-2 pt-3 border-top">
        <CButton
          color="primary"
          className="text-white px-4 py-2 font-bold shadow-sm"
          disabled={isSaving}
          onClick={handleSave}
        >
          {isSaving ? 'Đang lưu...' : 'Lưu Chiến Dịch Mới'}
        </CButton>
        <CButton
          color="secondary"
          variant="outline"
          className="px-4 py-2 fw-semibold"
          onClick={() => navigate('/theme-custom/config')}
        >
          Hủy / Quay lại
        </CButton>
      </div>

      {/* Image / Mockup Zoom Preview Modal */}
      <CModal
        alignment="center"
        size="lg"
        visible={previewModal.visible}
        onClose={() => setPreviewModal((prev) => ({ ...prev, visible: false }))}
      >
        <CModalHeader>
          <CModalTitle className="fw-bold fs-6">{previewModal.title}</CModalTitle>
        </CModalHeader>
        <CModalBody className="p-4 d-flex flex-column align-items-center justify-content-center bg-light">
          {previewModal.type === 'product_ornament' ? (
            <div className="text-center w-100">
              <div
                className="p-3 bg-white rounded border shadow mx-auto"
                style={{ width: '100%', maxWidth: '520px' }}
              >
                {/* Main Product Frame */}
                <div
                  className="position-relative w-100 rounded border overflow-hidden bg-white d-flex align-items-center justify-content-center"
                  style={{ aspectRatio: '1 / 1' }}
                >
                  {/* Prev / Next Indicator */}
                  <span
                    className="position-absolute start-0 top-50 translate-middle-y text-muted ps-2 fw-bold user-select-none"
                    style={{ fontSize: '24px', opacity: 0.6, zIndex: 5 }}
                  >
                    ‹
                  </span>
                  <span
                    className="position-absolute end-0 top-50 translate-middle-y text-muted pe-2 fw-bold user-select-none"
                    style={{ fontSize: '24px', opacity: 0.6, zIndex: 5 }}
                  >
                    ›
                  </span>

                  {/* Sample Laptop Product */}
                  <img
                    src="https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80"
                    alt="Laptop Large Mockup"
                    className="w-100 h-100"
                    style={{ objectFit: 'contain', padding: '16px' }}
                  />

                  {/* Overlay Frame */}
                  {newTheme?.decorations?.productOrnamentUrl && (
                    <img
                      src={newTheme.decorations.productOrnamentUrl}
                      alt="Product Ornament Large Overlay"
                      className="position-absolute pointer-events-none"
                      style={getProductOrnamentStyle()}
                    />
                  )}
                </div>

                {/* Thumbnails row */}
                <div className="d-flex align-items-center justify-content-center gap-2 mt-3">
                  {[
                    'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=150&q=80',
                    'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=150&q=80',
                    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=150&q=80',
                    'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=150&q=80',
                    'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=150&q=80',
                  ].map((thumb, idx) => (
                    <div
                      key={idx}
                      className={`position-relative rounded border overflow-hidden p-1 ${
                        idx === 0 ? 'border-primary border-2' : 'border-light-subtle'
                      }`}
                      style={{ width: '55px', height: '55px', backgroundColor: '#fff' }}
                    >
                      <img
                        src={thumb}
                        alt={`Thumb ${idx}`}
                        className="w-100 h-100"
                        style={{ objectFit: 'contain' }}
                      />
                      {newTheme?.decorations?.productOrnamentUrl &&
                        newTheme?.decorations?.productOrnamentApplyTo === 'all' && (
                          <img
                            src={newTheme.decorations.productOrnamentUrl}
                            alt="Frame Thumb"
                            className="position-absolute pointer-events-none"
                            style={getProductOrnamentStyle()}
                          />
                        )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center w-100">
              <img
                src={previewModal.imageUrl}
                alt="Preview Detail"
                className="img-fluid rounded border shadow-sm"
                style={{ maxHeight: '70vh', objectFit: 'contain' }}
              />
            </div>
          )}
        </CModalBody>
      </CModal>
    </div>
  )
}

export default AddThemeConfig
