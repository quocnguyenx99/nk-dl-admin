import React, { useEffect, useState } from 'react'
import {
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CFormInput,
  CFormSelect,
  CFormSwitch,
  CImage,
  CNav,
  CNavItem,
  CNavLink,
  CRow,
  CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilArrowLeft, cilSave } from '@coreui/icons'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { axiosClient } from '../../axiosConfig'
import logoNk from '../../assets/images/logo/nk viền.png'

// Date Format Helpers (HTML5 <input type="date"> requires YYYY-MM-DD)
const formatDateInput = (dateStr) => {
  if (
    !dateStr ||
    dateStr.trim() === '' ||
    dateStr === 'Toàn thời gian' ||
    dateStr === 'Không giới hạn'
  ) {
    return ''
  }
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return ''
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
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

  const uniqueId = `edit-live-pattern-${presetKey}`

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
              <text x="80" y="105" fontSize="16" fill="#f59e0b">
                ✦
              </text>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#${uniqueId})`} />
        </svg>
      )}

      {presetKey === 'stars_moon' && (
        <svg className="w-100 h-100" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id={uniqueId} width="220" height="220" patternUnits="userSpaceOnUse">
              <text x="35" y="55" fontSize="32" fill="#eab308">
                🌕
              </text>
              <text x="140" y="60" fontSize="18" fill="#f59e0b">
                ✨
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

function EditThemeConfig() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const themeId = searchParams.get('id')

  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [editingTheme, setEditingTheme] = useState(null)
  const [localOpacity, setLocalOpacity] = useState(0.15)
  const [activePreviewTab, setActivePreviewTab] = useState('home')

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

  useEffect(() => {
    const fetchThemeDetail = async () => {
      try {
        setLoading(true)
        const res = await axiosClient.get('theme/campaigns')
        const rawThemes =
          res.data && res.data.status && Array.isArray(res.data.data) ? res.data.data : []
        const themeList = rawThemes.map((item) => ({
          id: item.id,
          name: item.name,
          code: item.code,
          startDate: formatDateInput(item.start_date),
          endDate: formatDateInput(item.end_date),
          tag: item.theme_config?.tag || 'Chiến dịch',
          description: item.theme_config?.description || '',
          image:
            item.theme_config?.image ||
            'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&q=80',
          colors: item.theme_config?.colors || {
            primary: '#2356c4',
            secondary: '#ffb716',
            accent: '#e30019',
            background: '#f7f7f7',
            text: '#222222',
          },
          decorations: item.theme_config?.decorations || {
            particles: item.theme_config?.background?.preset || item.code || 'none',
            ornaments: item.theme_config?.background?.preset || item.code || 'none',
          },
          background: item.theme_config?.background || {
            preset: item.theme_config?.decorations?.particles || 'none',
            customUrl: '',
            opacity: 0.15,
            mode: 'pattern',
          },
          banners: item.theme_config?.banners || {},
          sections: item.theme_config?.sections || [],
          isActive: !!item.is_active,
        }))

        const target = themeList.find((t) => String(t.id) === String(themeId)) || themeList[0]
        if (target) {
          setEditingTheme(target)
          setLocalOpacity(
            target.background?.opacity !== undefined ? target.background.opacity : 0.15,
          )
        }
      } catch (error) {
        console.error('Fetch theme detail error:', error)
        toast.error('Lỗi khi tải thông tin chiến dịch giao diện!')
      } finally {
        setLoading(false)
      }
    }

    if (themeId) {
      fetchThemeDetail()
    } else {
      toast.warn('Vui lòng chọn chiến dịch cần chỉnh sửa!')
      navigate('/theme-custom/config')
    }
  }, [themeId, navigate])

  const compressImageBeforeUpload = (file, maxWidth = 1600, quality = 0.85) => {
    return new Promise((resolve) => {
      if (
        !file ||
        !file.type ||
        !file.type.startsWith('image/') ||
        file.type === 'image/svg+xml' ||
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
    return res.data?.data?.url || ''
  }

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const uploadedUrl = await uploadFileToServer(file)
      if (uploadedUrl) {
        setEditingTheme((prev) => ({ ...prev, image: uploadedUrl }))
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
        setEditingTheme((prev) => ({
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

  const handleSave = async () => {
    if (!editingTheme?.name) {
      toast.error('Vui lòng nhập tên chiến dịch giao diện!')
      return
    }

    try {
      setIsSaving(true)
      const payload = {
        id: editingTheme.id,
        name: editingTheme.name,
        code: editingTheme.code || 'default',
        start_date: editingTheme.startDate || null,
        end_date: editingTheme.endDate || null,
        is_active: !!editingTheme.isActive,
        theme_config: {
          tag: editingTheme.tag,
          description: editingTheme.description,
          image: editingTheme.image,
          colors: editingTheme.colors,
          decorations: editingTheme.decorations || {
            particles: editingTheme.background?.preset || editingTheme.code || 'none',
            ornaments: editingTheme.background?.preset || editingTheme.code || 'none',
          },
          background: editingTheme.background || {
            preset: editingTheme.decorations?.particles || 'none',
            customUrl: '',
            opacity: localOpacity,
            mode: 'pattern',
          },
          banners: editingTheme.banners || {},
          sections: editingTheme.sections || [],
        },
      }

      const res = await axiosClient.post('theme/save', payload)
      if (res.data?.status === true || res.status === 200) {
        toast.success('Cập nhật chiến dịch giao diện thành công!')
        navigate('/theme-custom/config')
      } else {
        toast.error(res.data?.message || 'Cập nhật thất bại!')
      }
    } catch (error) {
      console.error('Save theme config error:', error)
      toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi lưu chiến dịch!')
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center py-5">
        <CSpinner color="primary" variant="grow" size="sm" className="me-2" />
        <span className="text-muted fw-semibold">Đang tải thông tin chiến dịch...</span>
      </div>
    )
  }

  const currentPreset = editingTheme?.background?.preset || 'none'
  const bgConfig = editingTheme?.background || { preset: 'none', opacity: 0.15, mode: 'pattern' }
  const festiveTheme = editingTheme?.decorations?.particles || editingTheme?.code || 'none'

  return (
    <div className="pb-5">
      {/* Header Bar */}
      <div className="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom">
        <div>
          <h4 className="fw-bold text-dark mb-1 text-uppercase">
            CHỈNH SỬA CHIẾN DỊCH GIAO DIỆN: {editingTheme?.name}
          </h4>
          <p className="text-muted small mb-0">
            Cấu hình trực quan từng vị trí trên từng trang (Header, Sản phẩm, Thanh toán, Footer)
          </p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <CButton
            color="secondary"
            variant="outline"
            className="fw-semibold d-flex align-items-center gap-1"
            onClick={() => navigate('/theme-custom/config')}
          >
            <CIcon icon={cilArrowLeft} /> Quay lại danh sách
          </CButton>
        </div>
      </div>

      {/* TOP ROW: 2 CARDS DASHBOARD (Theme Overview, Quick Actions) */}
      <CRow className="g-4 mb-4">
        {/* Card 1: Theme Overview */}
        <CCol md={6}>
          <CCard className="h-100 shadow-xs border">
            <CCardHeader className="bg-white py-3 fw-bold text-dark border-bottom">
              Tổng quan chiến dịch (Theme Overview)
            </CCardHeader>
            <CCardBody className="p-3">
              <div className="d-flex gap-3">
                <div
                  className="rounded border overflow-hidden bg-light flex-shrink-0"
                  style={{ width: '100px', height: '140px' }}
                >
                  <CImage
                    src={editingTheme?.image}
                    className="w-100 h-100"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center justify-content-between mb-1">
                    <span className="fw-bold text-dark fs-6">{editingTheme?.name}</span>
                    <CBadge color={editingTheme?.isActive ? 'success' : 'warning'}>
                      {editingTheme?.isActive ? 'Đang áp dụng' : 'Bản nháp'}
                    </CBadge>
                  </div>
                  <div className="text-muted text-xs mb-1">Loại: {editingTheme?.tag}</div>
                  <div className="text-muted text-xs mb-1">Mã slug: #{editingTheme?.code}</div>
                  <div className="text-muted text-xs mb-2">
                    {editingTheme?.description || 'Chưa có mô tả chi tiết'}
                  </div>
                  <CFormSwitch
                    label="Kích hoạt áp dụng ngay"
                    checked={editingTheme?.isActive}
                    onChange={(e) =>
                      setEditingTheme((prev) => ({ ...prev, isActive: e.target.checked }))
                    }
                  />
                </div>
              </div>
            </CCardBody>
          </CCard>
        </CCol>

        {/* Card 2: Quick Actions */}
        <CCol md={6}>
          <CCard className="h-100 shadow-xs border">
            <CCardHeader className="bg-white py-3 fw-bold text-dark border-bottom">
              Thao tác nhanh (Quick Actions)
            </CCardHeader>
            <CCardBody className="p-3 d-flex flex-column gap-2 justify-content-center">
              <CButton
                color="light"
                className="border text-dark text-start py-2 px-3 fw-semibold d-flex align-items-center gap-2"
                onClick={() =>
                  toast.info('Xem trước các thay đổi trực tiếp ở khung Live Preview bên dưới!')
                }
              >
                <span>👁️ Xem trước giao diện thực tế</span>
              </CButton>

              <CButton
                color="light"
                className="border text-dark text-start py-2 px-3 fw-semibold d-flex align-items-center gap-2"
                onClick={() => {
                  setEditingTheme((prev) => ({ ...prev, isActive: true }))
                  toast.success('Đã chọn kích hoạt chiến dịch!')
                }}
              >
                <span>🚀 Áp dụng ngay chiến dịch</span>
              </CButton>

              <CButton
                color="primary"
                className="text-white py-2.5 px-3 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2"
                disabled={isSaving}
                onClick={handleSave}
              >
                <CIcon icon={cilSave} />
                <span>{isSaving ? 'Đang lưu...' : 'Lưu Thay Đổi Chiến Dịch'}</span>
              </CButton>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* MULTI-PAGE INTERACTIVE LIVE PREVIEW CANVAS */}
      <CCard className="mb-4 shadow-sm border">
        <CCardHeader className="bg-white py-3 border-bottom d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div className="d-flex align-items-center gap-2">
            <span className="fw-bold text-dark fs-6">
              Xem trước thực tế sự thay đổi trên từng trang (Live Multi-Page Preview)
            </span>
            <span
              className="badge rounded-pill px-2.5 py-1"
              style={{
                backgroundColor: `${editingTheme?.colors?.primary || '#2356c4'}15`,
                color: editingTheme?.colors?.primary || '#2356c4',
                fontSize: '11px',
              }}
            >
              Cập nhật trực tiếp
            </span>
          </div>

          {/* Navigation Tabs */}
          <CNav variant="pills" className="small">
            <CNavItem>
              <CNavLink
                active={activePreviewTab === 'home'}
                className="cursor-pointer fw-semibold py-1 px-3"
                onClick={() => setActivePreviewTab('home')}
              >
                🏠 Trang chủ
              </CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink
                active={activePreviewTab === 'product_detail'}
                className="cursor-pointer fw-semibold py-1 px-3"
                onClick={() => setActivePreviewTab('product_detail')}
              >
                💻 Chi tiết sản phẩm
              </CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink
                active={activePreviewTab === 'checkout'}
                className="cursor-pointer fw-semibold py-1 px-3"
                onClick={() => setActivePreviewTab('checkout')}
              >
                🛒 Trang thanh toán
              </CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink
                active={activePreviewTab === 'header_footer'}
                className="cursor-pointer fw-semibold py-1 px-3"
                onClick={() => setActivePreviewTab('header_footer')}
              >
                📌 Header Logo & Footer
              </CNavLink>
            </CNavItem>
          </CNav>
        </CCardHeader>

        <CCardBody className="p-0 position-relative overflow-hidden bg-light">
          {/* TAB 1: HOME PAGE PREVIEW */}
          {activePreviewTab === 'home' && (
            <div
              className="p-4 position-relative"
              style={{
                backgroundColor: editingTheme?.colors?.background || '#f7f7f7',
                color: editingTheme?.colors?.text || '#222222',
                minHeight: '380px',
              }}
            >
              <ThemeBackgroundWatermarkLayer
                background={{ ...bgConfig, opacity: localOpacity }}
                themeCode={editingTheme?.code}
              />

              {/* Utility Top Bar */}
              <div
                className="py-1.5 px-3 rounded-top d-flex justify-content-end align-items-center gap-3 text-white small shadow-xs"
                style={{ backgroundColor: editingTheme?.colors?.secondary || '#ffb716' }}
              >
                <span>Hotline: 1900 6739</span>
                <span>Tin khuyến mãi</span>
                <span>Tuyển dụng</span>
              </div>

              {/* Main Store Header with Logo & Seasonal Decoration */}
              <div className="bg-white p-3 border-bottom d-flex align-items-center justify-content-between gap-3 shadow-xs">
                <div className="position-relative d-inline-block">
                  {/* Seasonal Emblem on Logo */}
                  {(festiveTheme === 'noel' || festiveTheme === 'noel_snow') && (
                    <span
                      className="position-absolute"
                      style={{ top: '-8px', left: '-12px', fontSize: '20px', zIndex: 2 }}
                    >
                      🌿🍒
                    </span>
                  )}
                  {(festiveTheme === 'trungthu' || festiveTheme === 'mooncakes') && (
                    <span
                      className="position-absolute"
                      style={{ top: '-10px', left: '-10px', fontSize: '18px', zIndex: 2 }}
                    >
                      🏮
                    </span>
                  )}
                  {(festiveTheme === 'backtoschool' || festiveTheme === 'truonghoc') && (
                    <span
                      className="position-absolute"
                      style={{ top: '-12px', left: '-14px', fontSize: '18px', zIndex: 2 }}
                    >
                      ✈️
                    </span>
                  )}
                  {(festiveTheme === 'tet' || festiveTheme === 'tet_blossoms') && (
                    <span
                      className="position-absolute"
                      style={{ top: '-8px', left: '-10px', fontSize: '18px', zIndex: 2 }}
                    >
                      🌼
                    </span>
                  )}
                  <img src={logoNk} alt="Logo" style={{ height: '42px', objectFit: 'contain' }} />
                </div>
                <div className="flex-grow-1 mx-3">
                  <input
                    type="text"
                    className="form-control form-control-sm rounded-pill"
                    placeholder="Tìm kiếm sản phẩm tin học, laptop..."
                    readOnly
                  />
                </div>
                <button
                  className="btn btn-sm text-white fw-bold px-3"
                  style={{
                    backgroundColor: editingTheme?.colors?.primary || '#2356c4',
                    borderRadius: '20px',
                  }}
                >
                  Giỏ hàng (0)
                </button>
              </div>

              {/* Hero Banner Preview */}
              <div className="my-3 rounded overflow-hidden border shadow-xs position-relative bg-white">
                <CImage
                  src={editingTheme?.image}
                  className="w-100"
                  style={{ height: '160px', objectFit: 'cover' }}
                />
              </div>

              {/* Product Grid Sample */}
              <CRow className="g-2">
                {[1, 2, 3, 4].map((n) => (
                  <CCol key={n} md={3}>
                    <div className="p-2 bg-white rounded border shadow-xs text-center">
                      <div className="bg-light rounded p-2 mb-2" style={{ height: '80px' }}>
                        💻
                      </div>
                      <div className="fw-semibold text-truncate small">Laptop ASUS ZenBook {n}</div>
                      <div
                        className="fw-bold small"
                        style={{ color: editingTheme?.colors?.accent || '#dc2626' }}
                      >
                        24.990.000 đ
                      </div>
                    </div>
                  </CCol>
                ))}
              </CRow>
            </div>
          )}

          {/* TAB 2: PRODUCT DETAIL PAGE PREVIEW */}
          {activePreviewTab === 'product_detail' && (
            <div
              className="p-4 position-relative"
              style={{
                backgroundColor: editingTheme?.colors?.background || '#ffffff',
                color: editingTheme?.colors?.text || '#222222',
                minHeight: '380px',
              }}
            >
              <ThemeBackgroundWatermarkLayer
                background={{ ...bgConfig, opacity: localOpacity }}
                themeCode={editingTheme?.code}
              />

              {/* Breadcrumb */}
              <div className="text-muted text-xs mb-3">
                Trang chủ &gt; Laptop &gt; Laptop ASUS &gt; Zenbook &gt; ASUS Zenbook 14 OLED
              </div>

              <CRow className="g-4 align-items-center">
                {/* Product Photo Box with Seasonal Motif */}
                <CCol md={6}>
                  <div
                    className="p-3 rounded-3 border bg-white position-relative overflow-hidden text-center shadow-xs"
                    style={{
                      borderColor: editingTheme?.colors?.primary || '#3b82f6',
                      borderWidth: '2px',
                    }}
                  >
                    {/* Seasonal Motif Header Badge (Back To School 2025 style) */}
                    {(festiveTheme === 'backtoschool' || festiveTheme === 'truonghoc') && (
                      <div className="position-absolute top-0 start-0 p-2 text-start z-1">
                        <span
                          className="badge bg-warning text-dark fw-bold px-2.5 py-1 rounded shadow-xs"
                          style={{ fontSize: '11px' }}
                        >
                          BACK TO SCHOOL 2025 ✏️
                        </span>
                      </div>
                    )}
                    {(festiveTheme === 'noel' || festiveTheme === 'noel_snow') && (
                      <div className="position-absolute top-0 start-0 p-2 text-start z-1">
                        <span
                          className="badge bg-danger text-white fw-bold px-2.5 py-1 rounded shadow-xs"
                          style={{ fontSize: '11px' }}
                        >
                          NOEL XMAS 2026 ❄️
                        </span>
                      </div>
                    )}
                    {(festiveTheme === 'tet' || festiveTheme === 'tet_blossoms') && (
                      <div className="position-absolute top-0 start-0 p-2 text-start z-1">
                        <span
                          className="badge bg-danger text-warning fw-bold px-2.5 py-1 rounded shadow-xs"
                          style={{ fontSize: '11px' }}
                        >
                          TẾT NGUYÊN ĐÁN 🌼
                        </span>
                      </div>
                    )}

                    <img
                      src="https://media.vitinhnguyenkim.vn/uploads/products/2026-08/20260806_054030_fEuFoFdtmY.png"
                      alt="ASUS Zenbook 14 OLED"
                      style={{ maxHeight: '200px', objectFit: 'contain' }}
                    />
                  </div>
                </CCol>

                {/* Specs & Buy Buttons */}
                <CCol md={6}>
                  <h5 className="fw-bold text-dark mb-2">
                    ASUS Zenbook 14 OLED UX3405MA (Intel Core Ultra 7)
                  </h5>
                  <div
                    className="fs-4 fw-bold mb-3"
                    style={{ color: editingTheme?.colors?.accent || '#dc2626' }}
                  >
                    33.990.000 đ
                  </div>
                  <p className="text-muted text-xs mb-3">
                    Màn hình OLED 120Hz 3K sắc nét, pin dùng cả ngày, chuẩn Intel Evo siêu mỏng nhẹ.
                  </p>

                  <div className="d-flex gap-2">
                    <button
                      className="btn text-white fw-bold px-4 py-2 flex-grow-1"
                      style={{ backgroundColor: editingTheme?.colors?.primary || '#2356c4' }}
                    >
                      MUA NGAY GIAO TẬN NƠI
                    </button>
                    <button className="btn btn-outline-secondary px-3 py-2">
                      <CIcon icon={cilSave} />
                    </button>
                  </div>
                </CCol>
              </CRow>
            </div>
          )}

          {/* TAB 3: CHECKOUT PAGE PREVIEW */}
          {activePreviewTab === 'checkout' && (
            <div
              className="p-4 position-relative bg-white"
              style={{
                backgroundColor: editingTheme?.colors?.background || '#ffffff',
                color: editingTheme?.colors?.text || '#222222',
                minHeight: '380px',
              }}
            >
              <ThemeBackgroundWatermarkLayer
                background={{ ...bgConfig, opacity: localOpacity }}
                themeCode={editingTheme?.code}
              />

              {/* Checkout Progress Steps */}
              <div className="d-flex align-items-center justify-content-between mb-4 border-bottom pb-3">
                <div className="d-flex align-items-center gap-2">
                  <div
                    className="rounded-circle text-white fw-bold d-flex align-items-center justify-content-center"
                    style={{
                      width: '28px',
                      height: '28px',
                      backgroundColor: editingTheme?.colors?.primary || '#2356c4',
                    }}
                  >
                    1
                  </div>
                  <span className="fw-bold text-primary small">Thông tin giao hàng</span>
                </div>
                <div className="flex-grow-1 border-top mx-3 border-primary"></div>
                <div className="d-flex align-items-center gap-2 text-muted opacity-75">
                  <div
                    className="rounded-circle border d-flex align-items-center justify-content-center"
                    style={{ width: '28px', height: '28px' }}
                  >
                    2
                  </div>
                  <span className="small">Phương thức thanh toán</span>
                </div>
              </div>

              <CRow className="g-4">
                <CCol md={7}>
                  <h5 className="fw-bold text-dark mb-3">Thanh toán &amp; Nhận hàng ✏️</h5>
                  <div className="p-3 bg-light rounded border mb-2">
                    <label className="form-label small fw-semibold">Họ tên người nhận</label>
                    <input
                      type="text"
                      className="form-control form-control-sm mb-2"
                      defaultValue="Nguyễn Văn A"
                      readOnly
                    />
                    <label className="form-label small fw-semibold">Số điện thoại</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      defaultValue="0908 123 456"
                      readOnly
                    />
                  </div>
                </CCol>

                {/* Order Summary Card (Notebook Spiral Style for Back to School) */}
                <CCol md={5}>
                  <div
                    className="p-3 bg-white border rounded shadow-xs position-relative"
                    style={{
                      borderColor: editingTheme?.colors?.primary || '#bfdbfe',
                      borderLeft: '4px solid ' + (editingTheme?.colors?.primary || '#2356c4'),
                    }}
                  >
                    <h6 className="fw-bold text-dark mb-3 d-flex justify-content-between">
                      <span>Thông tin đơn hàng</span>
                      <span className="text-primary">✦</span>
                    </h6>

                    <div className="d-flex justify-content-between text-muted small mb-2">
                      <span>Tạm tính:</span>
                      <span className="fw-semibold text-dark">63.100.000 đ</span>
                    </div>
                    <div className="d-flex justify-content-between text-muted small mb-2">
                      <span>Phí vận chuyển:</span>
                      <span className="text-success fw-semibold">Miễn phí</span>
                    </div>

                    <hr className="my-2" />

                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <span className="fw-bold text-dark">Thành tiền:</span>
                      <span
                        className="fw-bold fs-5"
                        style={{ color: editingTheme?.colors?.primary || '#2356c4' }}
                      >
                        63.100.000 đ
                      </span>
                    </div>

                    <button
                      className="btn w-100 fw-bold py-2 shadow-xs d-flex align-items-center justify-content-center gap-2"
                      style={{
                        backgroundColor: editingTheme?.colors?.secondary || '#ffb716',
                        color: '#1e293b',
                      }}
                    >
                      <span>ĐẶT HÀNG NGAY</span>
                      <span>✈️</span>
                    </button>
                  </div>
                </CCol>
              </CRow>
            </div>
          )}

          {/* TAB 4: HEADER LOGO & FOOTER FESTIVE ORNAMENTS PREVIEW */}
          {activePreviewTab === 'header_footer' && (
            <div className="p-4 bg-white">
              <h6 className="fw-bold text-dark mb-3 border-bottom pb-2">
                1. Mẫu Trang Trí Logo Header (Góc trái trên cùng)
              </h6>
              <div className="p-4 bg-light rounded border mb-4 d-flex align-items-center justify-content-center">
                <div className="position-relative d-inline-block p-3 bg-white rounded border shadow-xs">
                  {(festiveTheme === 'noel' || festiveTheme === 'noel_snow') && (
                    <span
                      className="position-absolute"
                      style={{ top: '-12px', left: '-12px', fontSize: '26px' }}
                    >
                      🌿🍒
                    </span>
                  )}
                  {(festiveTheme === 'trungthu' || festiveTheme === 'mooncakes') && (
                    <span
                      className="position-absolute"
                      style={{ top: '-14px', left: '-12px', fontSize: '24px' }}
                    >
                      🏮
                    </span>
                  )}
                  {(festiveTheme === 'backtoschool' || festiveTheme === 'truonghoc') && (
                    <span
                      className="position-absolute"
                      style={{ top: '-14px', left: '-14px', fontSize: '24px' }}
                    >
                      ✈️
                    </span>
                  )}
                  {(festiveTheme === 'tet' || festiveTheme === 'tet_blossoms') && (
                    <span
                      className="position-absolute"
                      style={{ top: '-12px', left: '-12px', fontSize: '24px' }}
                    >
                      🌼
                    </span>
                  )}
                  <img
                    src={logoNk}
                    alt="Logo Preview"
                    style={{ height: '55px', objectFit: 'contain' }}
                  />
                </div>
              </div>

              <h6 className="fw-bold text-dark mb-3 border-bottom pb-2">
                2. Mẫu Trang Trí Chân Trang Footer (Hai bên lề &amp; Giữa)
              </h6>
              <div className="p-3 bg-white border rounded shadow-xs">
                <div className="d-flex justify-content-between align-items-center px-2 py-3 border-bottom">
                  <span className="text-muted small">CÔNG TY TNHH VI TÍNH NGUYÊN KIM</span>
                  <span className="text-muted small">Hotline: 1900 6739</span>
                  <span className="text-muted small">© 2026 Vi Tính Nguyên Kim</span>
                </div>
                <div className="d-flex align-items-center justify-content-between pt-2">
                  <span className="fs-5">🎁</span>
                  <div className="d-flex gap-3 align-items-center text-muted small">
                    <span>🔴</span> <span>⭐</span> <span>🔔</span> <span>🎄</span>
                  </div>
                  <span className="fs-5">🎁</span>
                </div>
              </div>
            </div>
          )}
        </CCardBody>
      </CCard>

      {/* Banners & Assets Card */}
      <CRow className="mb-4">
        <CCol md={12}>
          <CCard className="h-100 shadow-xs border">
            <CCardHeader className="bg-white py-3 fw-bold text-dark border-bottom">
              Banner & Hình ảnh Giao diện (Banners & Assets)
            </CCardHeader>
            <CCardBody className="p-3 d-flex flex-column justify-content-between">
              <div>
                <p className="text-muted text-xs mb-2">
                  Quản lý danh sách hình ảnh banner hiển thị trên chiến dịch
                </p>

                {/* Upload Box */}
                <div className="p-3 bg-light rounded border text-center mb-3">
                  <label className="form-label font-semibold text-dark small mb-1">
                    Tải banner mới từ máy tính
                  </label>
                  <CFormInput
                    type="file"
                    accept="image/*"
                    size="sm"
                    className="mb-2"
                    onChange={handleFileChange}
                  />
                  <span className="text-muted text-xs">Chấp nhận JPG, PNG, WEBP (Tối đa 5MB)</span>
                </div>

                {editingTheme?.image && (
                  <div>
                    <span className="form-label font-semibold text-dark small d-block mb-1">
                      Ảnh đại diện chiến dịch
                    </span>
                    <div
                      className="rounded border overflow-hidden bg-light mb-3"
                      style={{ height: '140px' }}
                    >
                      <CImage
                        src={editingTheme.image}
                        className="w-100 h-100"
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Action Save Button directly inside Right Column */}
              <div className="pt-2 border-top d-grid">
                <CButton
                  color="primary"
                  className="text-white py-2.5 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-1.5"
                  style={{ backgroundColor: '#2356c4', borderColor: '#2356c4', fontSize: '14px' }}
                  disabled={isSaving}
                  onClick={handleSave}
                >
                  <CIcon icon={cilSave} />
                  <span>{isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
                </CButton>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* BOTTOM ROW: 3 CARDS (Colors, Effects & Background, Schedule) */}
      <CRow className="g-4 mb-4">
        {/* Card 5: Colors (Design Tokens) */}
        <CCol md={4}>
          <CCard className="h-100 shadow-xs border">
            <CCardHeader className="bg-white py-3 fw-bold text-dark border-bottom">
              Màu tổng thể chiến dịch (Colors)
            </CCardHeader>
            <CCardBody className="p-3">
              <div className="d-flex flex-column gap-2">
                {[
                  { label: 'Màu chính (Nút & Viền)', key: 'primary' },
                  { label: 'Màu thanh Menu Topbar', key: 'secondary' },
                  { label: 'Màu nhấn (Sale & Hotline)', key: 'accent' },
                  { label: 'Màu nền website', key: 'background' },
                  { label: 'Màu chữ văn bản', key: 'text' },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="d-flex align-items-center justify-content-between p-2 border rounded bg-light"
                  >
                    <span className="small text-secondary fw-semibold">{item.label}</span>
                    <div className="d-flex align-items-center gap-2">
                      <input
                        type="color"
                        value={editingTheme?.colors?.[item.key] || '#2356c4'}
                        className="form-control form-control-color border-0 p-0 rounded cursor-pointer"
                        style={{ width: '28px', height: '28px' }}
                        onChange={(e) => {
                          const newCols = {
                            ...(editingTheme?.colors || {}),
                            [item.key]: e.target.value,
                          }
                          setEditingTheme((prev) => ({ ...prev, colors: newCols }))
                        }}
                      />
                      <CFormInput
                        size="sm"
                        value={editingTheme?.colors?.[item.key] || '#2356c4'}
                        className="font-monospace text-uppercase"
                        style={{ width: '80px', fontSize: '11px' }}
                        onChange={(e) => {
                          const newCols = {
                            ...(editingTheme?.colors || {}),
                            [item.key]: e.target.value,
                          }
                          setEditingTheme((prev) => ({ ...prev, colors: newCols }))
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CCardBody>
          </CCard>
        </CCol>

        {/* Card 6: Effects & Background Patterns */}
        <CCol md={4}>
          <CCard className="h-100 shadow-xs border">
            <CCardHeader className="bg-white py-3 fw-bold text-dark border-bottom">
              Họa tiết & Hiệu ứng lễ hội (Effects)
            </CCardHeader>
            <CCardBody className="p-3">
              <div className="mb-3">
                <label className="form-label font-semibold text-dark small mb-1">
                  Chọn mẫu hoa văn nền
                </label>
                <CFormSelect
                  size="sm"
                  value={currentPreset}
                  onChange={(e) =>
                    setEditingTheme((prev) => ({
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

              <div className="mb-3">
                <label className="form-label font-semibold text-dark small mb-1">
                  Bộ nhận diện lễ hội theo mùa
                </label>
                <CFormSelect
                  size="sm"
                  value={editingTheme?.decorations?.particles || editingTheme?.code || 'none'}
                  onChange={(e) => {
                    const val = e.target.value
                    setEditingTheme((prev) => ({
                      ...prev,
                      decorations: {
                        particles: val,
                        ornaments: val,
                      },
                    }))
                  }}
                >
                  <option value="none">Không gắn phụ kiện lễ hội (Tiêu chuẩn)</option>
                  <option value="trungthu">Tết Trung Thu (Lồng đèn, Trăng sao)</option>
                  <option value="noel">Giáng Sinh / Noel (Lá thông, Bông tuyết)</option>
                  <option value="tet">Tết Nguyên Đán (Cành mai, Lì xì)</option>
                  <option value="women_day">Quốc tế Phụ nữ 8/3 & 20/10</option>
                  <option value="backtoschool">Mùa Tựu Trường</option>
                  <option value="blackfriday">Siêu Sale Black Friday</option>
                  <option value="halloween">Lễ Hội Halloween</option>
                </CFormSelect>
              </div>

              {/* LIVE WATERMARK PREVIEW */}
              <div>
                <span className="fw-semibold text-dark text-xs d-block mb-1">
                  Xem trước trực tiếp hoa văn nền (Live Preview)
                </span>
                <div
                  className="rounded border overflow-hidden position-relative"
                  style={{
                    backgroundColor: editingTheme?.colors?.background || '#f7f7f7',
                    height: '80px',
                  }}
                >
                  <ThemeBackgroundWatermarkLayer
                    background={{ ...bgConfig, opacity: localOpacity }}
                    themeCode={editingTheme?.code}
                  />
                </div>
              </div>
            </CCardBody>
          </CCard>
        </CCol>

        {/* Card 7: Schedule & Form Information */}
        <CCol md={4}>
          <CCard className="h-100 shadow-xs border">
            <CCardHeader className="bg-white py-3 fw-bold text-dark border-bottom">
              Thông tin chung & Lập lịch (Schedule)
            </CCardHeader>
            <CCardBody className="p-3">
              <div className="mb-2">
                <label className="form-label font-semibold text-dark small mb-1">
                  Tên chiến dịch *
                </label>
                <CFormInput
                  size="sm"
                  value={editingTheme?.name || ''}
                  onChange={(e) => setEditingTheme((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="mb-2">
                <label className="form-label font-semibold text-dark small mb-1">
                  Mã Code (Slug)
                </label>
                <CFormInput
                  size="sm"
                  value={editingTheme?.code || ''}
                  onChange={(e) => setEditingTheme((prev) => ({ ...prev, code: e.target.value }))}
                />
              </div>

              <CRow className="g-2 mb-2">
                <CCol md={6}>
                  <label className="form-label font-semibold text-dark small mb-1">
                    Ngày bắt đầu
                  </label>
                  <CFormInput
                    type="date"
                    size="sm"
                    value={formatDateInput(editingTheme?.startDate)}
                    onChange={(e) =>
                      setEditingTheme((prev) => ({ ...prev, startDate: e.target.value }))
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
                    value={formatDateInput(editingTheme?.endDate)}
                    onChange={(e) =>
                      setEditingTheme((prev) => ({ ...prev, endDate: e.target.value }))
                    }
                  />
                </CCol>
              </CRow>

              <div>
                <label className="form-label font-semibold text-dark small mb-1">
                  Mô tả chi tiết
                </label>
                <CFormInput
                  size="sm"
                  value={editingTheme?.description || ''}
                  onChange={(e) =>
                    setEditingTheme((prev) => ({ ...prev, description: e.target.value }))
                  }
                />
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Footer Action Bar */}
      <div className="d-flex align-items-center justify-content-end gap-2 pt-3 border-top">
        <CButton
          color="primary"
          className="text-white px-4 py-2 font-bold shadow-sm"
          disabled={isSaving}
          onClick={handleSave}
        >
          {isSaving ? 'Đang lưu...' : 'Lưu Thay Đổi Chiến Dịch'}
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
    </div>
  )
}

export default EditThemeConfig
