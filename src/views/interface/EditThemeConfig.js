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
  const [allThemes, setAllThemes] = useState([])
  const [localOpacity, setLocalOpacity] = useState(0.15)
  const [activeMainTab, setActiveMainTab] = useState('overview')
  const [activePreviewTab, setActivePreviewTab] = useState('home')
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

        setAllThemes(themeList)
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

  const handleMainLogoUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const uploadedUrl = await uploadFileToServer(file)
      if (uploadedUrl) {
        setEditingTheme((prev) => ({
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
        setEditingTheme((prev) => ({
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
    setEditingTheme((prev) => ({
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
        setEditingTheme((prev) => ({
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
      toast.warn('Khung viền đã được gắn, hãy nhấn Lưu Thay Đổi để lưu lại.')
    }
  }

  const handleFooterOrnamentUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const uploadedUrl = await uploadFileToServer(file)
      if (uploadedUrl) {
        setEditingTheme((prev) => ({
          ...prev,
          decorations: {
            ...(prev?.decorations || {}),
            footerOrnamentUrl: uploadedUrl,
          },
        }))
        toast.success('Đã tải ảnh trang trí Chân trang Footer thành công!')
      }
    } catch (err) {
      toast.error('Lỗi upload ảnh trang trí Footer: ' + err.message)
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
        is_active: editingTheme.isActive ? 1 : 0,
        theme_config: {
          tag: editingTheme.tag || 'Chiến dịch',
          description: editingTheme.description || '',
          image: editingTheme.image || '',
          colors: editingTheme.colors || {},
          decorations: {
            particles: editingTheme?.background?.preset || editingTheme?.code || 'none',
            ornaments: editingTheme?.background?.preset || editingTheme?.code || 'none',
            productOrnamentUrl: editingTheme?.decorations?.productOrnamentUrl || '',
            productOrnamentPosition: 'full',
            productOrnamentSize: '100%',
            productOrnamentApplyTo:
              editingTheme?.decorations?.productOrnamentApplyTo || 'main_only',
            logoUrl: editingTheme?.decorations?.logoUrl || '',
            logoOrnamentUrl: editingTheme?.decorations?.logoOrnamentUrl || '',
            logoOrnamentPosition: editingTheme?.decorations?.logoOrnamentPosition || 'bottom-right',
            logoOrnamentSize: editingTheme?.decorations?.logoOrnamentSize || '36px',
            footerOrnamentUrl: editingTheme?.decorations?.footerOrnamentUrl || '',
            footerOrnamentPosition:
              editingTheme?.decorations?.footerOrnamentPosition || 'both-corners',
            footerOrnamentSize: editingTheme?.decorations?.footerOrnamentSize || '48px',
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

  const MAIN_BUILDER_TABS = [
    { key: 'overview', label: 'Tổng quan' },
    { key: 'colors', label: 'Màu sắc' },
    { key: 'pages_layout', label: 'Trang & Bố cục' },
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
              {isSaving ? 'Đang lưu...' : 'Lưu Thay Đổi'}
            </CButton>
            <CButton
              color="secondary"
              variant="outline"
              className="fw-semibold px-3 py-2 d-flex align-items-center gap-1"
              onClick={() => navigate('/theme-custom/config')}
            >
              <CIcon icon={cilArrowLeft} /> Quay lại danh sách
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

      {/* TAB 1: TỔNG QUAN (Thông tin chiến dịch & Banner hình ảnh) */}
      {activeMainTab === 'overview' && (
        <CCard className="mb-4 shadow-xs border">
          <CCardHeader className="bg-white py-3 border-bottom d-flex align-items-center justify-content-between">
            <div>
              <h5 className="fw-bold text-dark mb-0">Cấu hình thông tin chiến dịch</h5>
            </div>
          </CCardHeader>
          <CCardBody className="p-4">
            <CRow className="g-4 mb-3">
              <CCol md={6}>
                <label className="form-label fw-bold text-dark mb-1.5" style={{ fontSize: '14px' }}>
                  Tên chiến dịch <span className="text-danger">*</span>
                </label>
                <CFormInput
                  placeholder="Ví dụ: Trung Thu, Giáng Sinh, Tết Nguyên Đán..."
                  value={editingTheme?.name || ''}
                  onChange={(e) => setEditingTheme((prev) => ({ ...prev, name: e.target.value }))}
                />
                <small className="text-muted d-block mt-1">Tên hiển thị nội bộ và quản trị</small>
              </CCol>

              <CCol md={6}>
                <label className="form-label fw-bold text-dark mb-1.5" style={{ fontSize: '14px' }}>
                  Mã chiến dịch
                </label>
                <CFormInput
                  placeholder="ví dụ: trung_thu_2026, tet_2027..."
                  value={editingTheme?.code || ''}
                  onChange={(e) => setEditingTheme((prev) => ({ ...prev, code: e.target.value }))}
                />
                <small className="text-muted d-block mt-1">
                  Định danh hệ thống (viết liền không dấu)
                </small>
              </CCol>

              <CCol md={6}>
                <label className="form-label fw-bold text-dark mb-1.5" style={{ fontSize: '14px' }}>
                  Tag chiến dịch
                </label>
                <CFormInput
                  placeholder="ví dụ: 🥮 Lễ Hội Trung Thu, 🎄 Giáng Sinh Ấm Áp..."
                  value={editingTheme?.tag || ''}
                  onChange={(e) => setEditingTheme((prev) => ({ ...prev, tag: e.target.value }))}
                />
                <small className="text-muted d-block mt-1">
                  Nhãn hiển thị nổi bật trên banner/sự kiện
                </small>
              </CCol>

              <CCol md={6}>
                <label className="form-label fw-bold text-dark mb-1.5" style={{ fontSize: '14px' }}>
                  Thời gian áp dụng
                </label>
                <CRow className="g-2">
                  <CCol xs={6}>
                    <CFormInput
                      type="date"
                      value={editingTheme?.startDate || ''}
                      onChange={(e) =>
                        setEditingTheme((prev) => ({ ...prev, startDate: e.target.value }))
                      }
                    />
                    <small className="text-muted d-block mt-1">Bắt đầu</small>
                  </CCol>
                  <CCol xs={6}>
                    <CFormInput
                      type="date"
                      value={editingTheme?.endDate || ''}
                      onChange={(e) =>
                        setEditingTheme((prev) => ({ ...prev, endDate: e.target.value }))
                      }
                    />
                    <small className="text-muted d-block mt-1">Kết thúc</small>
                  </CCol>
                </CRow>
              </CCol>
            </CRow>

            <div className="mb-4">
              <label className="form-label fw-bold text-dark mb-1.5" style={{ fontSize: '14px' }}>
                Mô tả chiến dịch
              </label>
              <CFormInput
                placeholder="Nhập mô tả ngắn gọn về sự kiện/chiến dịch này..."
                value={editingTheme?.description || ''}
                onChange={(e) =>
                  setEditingTheme((prev) => ({ ...prev, description: e.target.value }))
                }
              />
              <small className="text-muted d-block mt-1">
                Ghi chú nội dung chiến dịch dành cho ban quản trị
              </small>
            </div>

            {/* Banner & Hình ảnh chiến dịch */}
            <div className="pt-3 border-top">
              <label className="form-label fw-bold text-dark mb-3" style={{ fontSize: '14.5px' }}>
                Banner &amp; Hình ảnh đại diện chiến dịch
              </label>
              <CRow className="g-4 align-items-center">
                <CCol md={6}>
                  <div className="p-4 bg-light rounded border text-center">
                    <label
                      className="form-label fw-bold text-dark mb-2 d-block"
                      style={{ fontSize: '14px' }}
                    >
                      Tải banner / ảnh đại diện mới từ máy tính
                    </label>
                    <CFormInput
                      type="file"
                      accept="image/*"
                      className="mb-2"
                      onChange={handleFileChange}
                    />
                    <small className="text-muted d-block">
                      Hỗ trợ định dạng: JPG, PNG, WEBP (Dung lượng tối đa 5MB)
                    </small>
                  </div>
                </CCol>

                <CCol md={6}>
                  <label className="form-label fw-bold text-dark mb-2" style={{ fontSize: '14px' }}>
                    Ảnh đại diện chiến dịch hiện tại
                  </label>
                  {editingTheme?.image ? (
                    <div>
                      <div
                        className="rounded border overflow-hidden bg-white shadow-xs p-2 position-relative"
                        style={{ height: '180px', cursor: 'pointer' }}
                        title="Nhấp để xem phóng to ảnh banner"
                        onClick={() =>
                          setPreviewModal({
                            visible: true,
                            title: 'Xem trước phóng to Banner chiến dịch',
                            type: 'image',
                            imageUrl: editingTheme.image,
                          })
                        }
                      >
                        <CImage
                          src={editingTheme.image}
                          className="w-100 h-100 rounded"
                          style={{ objectFit: 'contain' }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-light rounded border text-center text-muted">
                      Chưa có ảnh đại diện nào được tải lên
                    </div>
                  )}
                </CCol>
              </CRow>
            </div>
          </CCardBody>
        </CCard>
      )}

      {/* TAB 4: BANNER & TÀI NGUYÊN (SẢN PHẨM, LOGO & FOOTER) */}
      {activeMainTab === 'resources' && (
        <CCard className="mb-4 shadow-xs border">
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
                    { key: 'footer', title: 'Chân trang Footer' },
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

                          {editingTheme?.decorations?.productOrnamentUrl && (
                            <div className="d-flex align-items-center justify-content-between p-2 bg-white rounded border mt-2">
                              <div className="d-flex align-items-center gap-2">
                                <img
                                  src={editingTheme.decorations.productOrnamentUrl}
                                  alt="Khung hiện tại"
                                  style={{ width: '36px', height: '36px', objectFit: 'contain' }}
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
                                  setEditingTheme((prev) => ({
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
                            value={editingTheme?.decorations?.productOrnamentApplyTo || 'main_only'}
                            onChange={(e) =>
                              setEditingTheme((prev) => ({
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
                              {editingTheme?.decorations?.productOrnamentUrl ? (
                                <img
                                  src={editingTheme.decorations.productOrnamentUrl}
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
                            <h6 className="fw-bold text-dark mb-1" style={{ fontSize: '13.5px' }}>
                              NB DELL PRO MAX 16 MC16250
                            </h6>
                            <p
                              className="text-secondary small mb-1.5"
                              style={{ fontSize: '10px', lineHeight: '1.3' }}
                            >
                              ULTRA 7 265H VPRO / 16 INCH FHD+ 300NIT / 32GB DDR5 (2X16) / 512GB SSD
                              / RTX PRO 500 6GB GDDR7 / WI-FI 6E / WIN11 HOME
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
                              <div className="btn-group border rounded" style={{ height: '22px' }}>
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
                        <div className="p-4 bg-light rounded border text-center">
                          <label
                            className="form-label fw-bold text-dark mb-2 d-block"
                            style={{ fontSize: '14px' }}
                          >
                            Tải ảnh Logo chiến dịch mới từ máy tính
                          </label>
                          <CFormInput
                            type="file"
                            accept="image/*"
                            className="mb-2"
                            onChange={handleMainLogoUpload}
                          />
                          <small className="text-muted d-block">
                            {
                              'Chấp nhận PNG, WEBP, JPG tách nền. Ảnh logo này sẽ hiển thị thay thế Logo mặc định trên Header website.'
                            }
                          </small>
                        </div>
                      </CCol>

                      {/* Live Logo Preview Box */}
                      <CCol md={5}>
                        <div className="p-3 bg-light rounded border text-center">
                          <label
                            className="form-label fw-bold text-dark mb-2 d-block"
                            style={{ fontSize: '13.5px' }}
                          >
                            Xem trước trực tiếp Logo Header
                          </label>
                          <div
                            className="p-3 bg-white rounded border shadow-xs d-flex align-items-center justify-content-center"
                            style={{ height: '140px' }}
                          >
                            <div className="p-2 bg-white rounded border">
                              <img
                                src={editingTheme?.decorations?.logoUrl || logoNk}
                                alt="Logo Header"
                                style={{ height: '55px', objectFit: 'contain' }}
                              />
                            </div>
                          </div>
                        </div>
                      </CCol>
                    </CRow>
                  </div>
                )}

                {/* SUB-TAB 2: FOOTER */}
                {activeOrnamentTab === 'footer' && (
                  <div>
                    <CRow className="g-4 align-items-center">
                      <CCol md={7}>
                        {/* Upload Box */}
                        <div className="p-3 bg-light rounded border text-center mb-3">
                          <label
                            className="form-label fw-bold text-dark mb-2 d-block"
                            style={{ fontSize: '14px' }}
                          >
                            Tải ảnh trang trí Chân trang Footer từ máy tính
                          </label>
                          <CFormInput
                            type="file"
                            accept="image/*"
                            className="mb-1"
                            onChange={handleFooterOrnamentUpload}
                          />
                          <small className="text-muted d-block">
                            Khuyên dùng ảnh PNG / WEBP tách nền
                          </small>
                        </div>

                        {/* Position & Size */}
                        <CRow className="g-3">
                          <CCol md={6}>
                            <label
                              className="form-label fw-bold text-dark mb-1"
                              style={{ fontSize: '13.5px' }}
                            >
                              Vị trí hiển thị trên Footer
                            </label>
                            <CFormSelect
                              value={
                                editingTheme?.decorations?.footerOrnamentPosition || 'both-corners'
                              }
                              onChange={(e) =>
                                setEditingTheme((prev) => ({
                                  ...prev,
                                  decorations: {
                                    ...(prev?.decorations || {}),
                                    footerOrnamentPosition: e.target.value,
                                  },
                                }))
                              }
                            >
                              <option value="both-corners">
                                Hai bên góc lề Footer (Tiêu chuẩn)
                              </option>
                              <option value="left-only">Chỉ góc bên trái Footer</option>
                              <option value="right-only">Chỉ góc bên phía phải Footer</option>
                            </CFormSelect>
                          </CCol>
                          <CCol md={6}>
                            <label
                              className="form-label fw-bold text-dark mb-1"
                              style={{ fontSize: '13.5px' }}
                            >
                              Kích thước hình trang trí
                            </label>
                            <CFormSelect
                              value={editingTheme?.decorations?.footerOrnamentSize || '48px'}
                              onChange={(e) =>
                                setEditingTheme((prev) => ({
                                  ...prev,
                                  decorations: {
                                    ...(prev?.decorations || {}),
                                    footerOrnamentSize: e.target.value,
                                  },
                                }))
                              }
                            >
                              <option value="32px">Nhỏ (32px)</option>
                              <option value="48px">Vừa tiêu chuẩn (48px)</option>
                              <option value="64px">Lớn (64px)</option>
                              <option value="80px">Rất lớn (80px)</option>
                            </CFormSelect>
                          </CCol>
                        </CRow>
                      </CCol>

                      {/* Live Footer Preview Box */}
                      <CCol md={5}>
                        <div className="p-3 bg-light rounded border text-center">
                          <label
                            className="form-label fw-bold text-dark mb-2 d-block"
                            style={{ fontSize: '13.5px' }}
                          >
                            Xem trước trực tiếp Chân trang Footer
                          </label>
                          <div
                            className="p-3 bg-white rounded border shadow-xs d-flex align-items-center justify-content-between overflow-hidden"
                            style={{ height: '140px' }}
                          >
                            <div className="d-flex align-items-center gap-2">
                              {editingTheme?.decorations?.footerOrnamentUrl ? (
                                <img
                                  src={editingTheme.decorations.footerOrnamentUrl}
                                  alt="Footer Left"
                                  style={{
                                    height: editingTheme?.decorations?.footerOrnamentSize || '48px',
                                    objectFit: 'contain',
                                  }}
                                />
                              ) : (
                                <span className="text-muted text-xs fst-italic">
                                  [Hình trang trí]
                                </span>
                              )}
                            </div>

                            <span className="text-muted text-xs fw-semibold">
                              © 2026 VI TÍNH NGUYÊN KIM
                            </span>

                            <div className="d-flex align-items-center gap-2">
                              {editingTheme?.decorations?.footerOrnamentUrl ? (
                                <img
                                  src={editingTheme.decorations.footerOrnamentUrl}
                                  alt="Footer Right"
                                  style={{
                                    height: editingTheme?.decorations?.footerOrnamentSize || '48px',
                                    objectFit: 'contain',
                                  }}
                                />
                              ) : (
                                <span className="text-muted text-xs fst-italic">
                                  [Hình trang trí]
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </CCol>
                    </CRow>
                  </div>
                )}
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>
      )}

      {/* TAB 5: HIỆU ỨNG (BACKGROUND & PARTICLES) */}
      {activeMainTab === 'effects' && (
        <CCard className="mb-4 shadow-xs border">
          <CCardHeader className="bg-white py-3 border-bottom d-flex align-items-center justify-content-between">
            <div>
              <h5 className="fw-bold text-dark mb-0">Họa tiết &amp; hoa văn nền Website</h5>
            </div>
          </CCardHeader>
          <CCardBody className="p-4">
            <CRow className="g-4">
              <CCol md={6}>
                <div className="mb-3.5">
                  <label className="form-label fw-bold text-dark mb-1" style={{ fontSize: '14px' }}>
                    Chọn mẫu hoa văn nền
                  </label>
                  <CFormSelect
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
                  <small className="text-muted d-block mt-1">
                    Hoa văn biểu tượng sự kiện được lặp tinh tế trên nền trang
                  </small>
                </div>

                {currentPreset === 'custom' && (
                  <div className="mb-3.5">
                    <label
                      className="form-label fw-bold text-dark mb-1"
                      style={{ fontSize: '14px' }}
                    >
                      Tải ảnh nền riêng
                    </label>
                    <CFormInput type="file" onChange={handleCustomBgUpload} />
                  </div>
                )}

                {/* OPACITY SLIDER */}
                <div className="mb-3.5">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <label
                      className="form-label fw-bold text-dark mb-0"
                      style={{ fontSize: '14px' }}
                    >
                      Độ đậm nhạt hoa văn (Opacity)
                    </label>
                    <span className="badge bg-primary px-2 py-1 font-monospace">
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
                      setEditingTheme((prev) => ({
                        ...prev,
                        background: {
                          ...(prev?.background || {}),
                          opacity: val,
                        },
                      }))
                    }}
                  />
                  <small className="text-muted d-block">
                    Khuyên dùng 15% - 25% để không làm rối mắt người dùng khi đọc nội dung
                  </small>
                </div>

                {/* COVERAGE MODE SELECT */}
                <div className="mb-3">
                  <label className="form-label fw-bold text-dark mb-1" style={{ fontSize: '14px' }}>
                    Chế độ áp dụng hoa văn
                  </label>
                  <CFormSelect
                    value={editingTheme?.background?.mode || 'pattern'}
                    onChange={(e) =>
                      setEditingTheme((prev) => ({
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
                  <label
                    className="form-label fw-bold text-dark mb-2 d-block"
                    style={{ fontSize: '14px' }}
                  >
                    Xem trước trực tiếp hoa văn nền (Live Preview)
                  </label>
                  <div
                    className="rounded border overflow-hidden position-relative shadow-xs"
                    style={{
                      backgroundColor: editingTheme?.colors?.background || '#f7f7f7',
                      height: '260px',
                    }}
                  >
                    <ThemeBackgroundWatermarkLayer
                      background={{ ...bgConfig, opacity: localOpacity }}
                      themeCode={editingTheme?.code}
                    />
                  </div>
                </div>
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>
      )}

      {/* TAB 5: BẢNG MÀU */}
      {activeMainTab === 'colors' && (
        <CCard className="mb-4 shadow-xs border">
          <CCardHeader className="bg-white py-3 border-bottom d-flex align-items-center justify-content-between">
            <div>
              <h5 className="fw-bold text-dark mb-0">Bảng màu tổng thể Website</h5>
            </div>
          </CCardHeader>
          <CCardBody className="p-4">
            <CRow className="g-4">
              <CCol md={6}>
                <CRow className="g-3">
                  {[
                    {
                      label: 'Màu chính (Nút & Viền)',
                      key: 'primary',
                      desc: 'Màu nhận diện thương hiệu & nút bấm chính',
                    },
                    {
                      label: 'Màu thanh Menu Topbar',
                      key: 'secondary',
                      desc: 'Màu nền thanh menu điều hướng & topbar',
                    },
                    {
                      label: 'Màu nhấn (Sale & Hotline)',
                      key: 'accent',
                      desc: 'Màu nổi bật cho nhãn giảm giá & hotline',
                    },
                    {
                      label: 'Màu nền website',
                      key: 'background',
                      desc: 'Màu phông nền toàn trang web',
                    },
                    {
                      label: 'Màu chữ văn bản',
                      key: 'text',
                      desc: 'Màu chữ tiêu đề & nội dung chính',
                    },
                  ].map((item) => (
                    <CCol key={item.key} md={12}>
                      <div className="p-3 border rounded bg-light d-flex align-items-center justify-content-between">
                        <div>
                          <label
                            className="form-label fw-bold text-dark mb-0 d-block"
                            style={{ fontSize: '13.5px' }}
                          >
                            {item.label}
                          </label>
                          <small className="text-muted">{item.desc}</small>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <input
                            type="color"
                            value={editingTheme?.colors?.[item.key] || '#2356c4'}
                            className="form-control form-control-color border-0 p-0 rounded cursor-pointer"
                            style={{ width: '34px', height: '34px' }}
                            onChange={(e) => {
                              const newCols = {
                                ...(editingTheme?.colors || {}),
                                [item.key]: e.target.value,
                              }
                              setEditingTheme((prev) => ({ ...prev, colors: newCols }))
                            }}
                          />
                          <CFormInput
                            value={editingTheme?.colors?.[item.key] || '#2356c4'}
                            className="font-monospace text-uppercase"
                            style={{ width: '95px', fontSize: '12px', textAlign: 'center' }}
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
                    backgroundColor: editingTheme?.colors?.background || '#f7f7f7',
                    minHeight: '260px',
                  }}
                >
                  <div
                    className="p-3 rounded mb-3 text-white fw-bold d-flex justify-content-between align-items-center shadow-xs"
                    style={{ backgroundColor: editingTheme?.colors?.secondary || '#ffb716' }}
                  >
                    <span>Menu / Header Topbar</span>
                    <span
                      className="badge px-2.5 py-1.5 fw-bold"
                      style={{ backgroundColor: editingTheme?.colors?.accent || '#e30019' }}
                    >
                      HOT SALE -50%
                    </span>
                  </div>

                  <div className="p-3 bg-white rounded border shadow-xs mb-2">
                    <h6
                      className="fw-bold mb-1"
                      style={{ color: editingTheme?.colors?.text || '#222222' }}
                    >
                      Tiêu đề sản phẩm mẫu
                    </h6>
                    <p
                      className="small mb-3"
                      style={{ color: editingTheme?.colors?.text || '#555555' }}
                    >
                      Mô tả chi tiết sản phẩm hiển thị trên nền website với màu sắc phối chuẩn.
                    </p>
                    <div className="d-flex align-items-center gap-2">
                      <button
                        type="button"
                        className="btn btn-sm text-white fw-bold px-3 py-1.5 rounded"
                        style={{ backgroundColor: editingTheme?.colors?.primary || '#2356c4' }}
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

      {/* TAB 3: TRANG & BỐ CỤC */}
      {activeMainTab === 'pages_layout' && (
        <CCard className="mb-4 shadow-xs border">
          <CCardHeader className="bg-white py-3 border-bottom d-flex align-items-center justify-content-between">
            <div>
              <h5 className="fw-bold text-dark mb-0">Cấu hình Trang &amp; Bố cục hiển thị</h5>
            </div>
          </CCardHeader>
          <CCardBody className="p-4">
            <CRow className="g-4">
              <CCol md={12}>
                <div className="table-responsive border rounded bg-white">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th style={{ width: '60px' }}>STT</th>
                        <th>Tên trang</th>
                        <th>Mẫu bố cục (Layout)</th>
                        <th style={{ width: '160px' }}>Trạng thái</th>
                        <th style={{ width: '130px' }}>Tùy chỉnh</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagesLayouts.map((page, index) => (
                        <tr key={page.id}>
                          <td className="text-muted">{index + 1}</td>
                          <td>
                            <span className="fw-bold text-dark">{page.name}</span>
                          </td>
                          <td>
                            <CFormSelect
                              size="sm"
                              value={page.layout}
                              style={{ maxWidth: '260px' }}
                              onChange={(e) => {
                                const newLayouts = [...pagesLayouts]
                                newLayouts[index].layout = e.target.value
                                setPagesLayouts(newLayouts)
                              }}
                            >
                              <option value="Tiêu chuẩn">Tiêu chuẩn (Mặc định)</option>
                              <option value="Đầy đủ (Full Width)">Đầy đủ (Full Width)</option>
                              <option value="Dạng lưới (Grid)">Dạng lưới (Grid)</option>
                            </CFormSelect>
                          </td>
                          <td>
                            <CFormCheck
                              type="switch"
                              id={`edit-switch-${page.id}`}
                              label={page.enabled ? 'Áp dụng' : 'Tắt'}
                              checked={page.enabled}
                              onChange={(e) => {
                                const newLayouts = [...pagesLayouts]
                                newLayouts[index].enabled = e.target.checked
                                setPagesLayouts(newLayouts)
                              }}
                            />
                          </td>
                          <td>
                            <span className="badge bg-light text-primary border cursor-pointer px-2.5 py-1.5 fw-semibold">
                              ⚙ Thiết lập
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
                  {editingTheme?.decorations?.productOrnamentUrl && (
                    <img
                      src={editingTheme.decorations.productOrnamentUrl}
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
                      {editingTheme?.decorations?.productOrnamentUrl &&
                        editingTheme?.decorations?.productOrnamentApplyTo === 'all' && (
                          <img
                            src={editingTheme.decorations.productOrnamentUrl}
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

export default EditThemeConfig
