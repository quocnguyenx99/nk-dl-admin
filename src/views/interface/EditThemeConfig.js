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

// Product ornament positioning style helper
const getProductOrnamentStyle = (pos, size) => {
  if (pos === 'full') {
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
  const isBottom = !pos || pos.includes('bottom')
  const isTop = pos && pos.includes('top')
  const isLeft = !pos || pos.includes('left')
  const isRight = pos && pos.includes('right')

  return {
    position: 'absolute',
    bottom: isBottom ? '4px' : 'auto',
    top: isTop ? '4px' : 'auto',
    left: isLeft ? '4px' : 'auto',
    right: isRight ? '4px' : 'auto',
    width: size || '35%',
    maxWidth: '100%',
    height: 'auto',
    objectFit: 'contain',
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
  const [localOpacity, setLocalOpacity] = useState(0.15)
  const [activeMainTab, setActiveMainTab] = useState('theme_config')
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
    try {
      const uploadedUrl = await uploadFileToServer(file)
      if (uploadedUrl) {
        setEditingTheme((prev) => ({
          ...prev,
          decorations: {
            ...(prev?.decorations || {}),
            productOrnamentUrl: uploadedUrl,
          },
        }))
        toast.success('Đã tải ảnh trang trí sản phẩm thành công!')
      }
    } catch (err) {
      toast.error('Lỗi upload ảnh trang trí sản phẩm: ' + err.message)
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
        is_active: !!editingTheme.isActive,
        theme_config: {
          tag: editingTheme.tag,
          description: editingTheme.description,
          image: editingTheme.image,
          colors: editingTheme.colors,
          decorations: {
            particles: editingTheme?.background?.preset || editingTheme?.code || 'none',
            ornaments: editingTheme?.background?.preset || editingTheme?.code || 'none',
            productOrnamentUrl: editingTheme?.decorations?.productOrnamentUrl || '',
            productOrnamentPosition:
              editingTheme?.decorations?.productOrnamentPosition || 'bottom-left',
            productOrnamentSize: editingTheme?.decorations?.productOrnamentSize || '30%',
            productOrnamentApplyTo:
              editingTheme?.decorations?.productOrnamentApplyTo || 'main_only',
            logoUrl: editingTheme?.decorations?.logoUrl || '',
            logoOrnamentUrl: editingTheme?.decorations?.logoOrnamentUrl || '',
            logoOrnamentPosition: editingTheme?.decorations?.logoOrnamentPosition || 'bottom-left',
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

      {/* 5 MAIN BIG TABS NAVIGATION */}
      <div className="mb-4 bg-white p-2 rounded border shadow-xs">
        <CNav variant="pills" className="d-flex flex-wrap gap-2">
          <CNavItem>
            <CNavLink
              active={activeMainTab === 'theme_config'}
              className="cursor-pointer fw-bold py-2 px-3"
              onClick={() => setActiveMainTab('theme_config')}
            >
              1. Cấu hình theme
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink
              active={activeMainTab === 'images'}
              className="cursor-pointer fw-bold py-2 px-3"
              onClick={() => setActiveMainTab('images')}
            >
              2. Hình ảnh
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink
              active={activeMainTab === 'logo'}
              className="cursor-pointer fw-bold py-2 px-3"
              onClick={() => setActiveMainTab('logo')}
            >
              3. Trang trí
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink
              active={activeMainTab === 'background'}
              className="cursor-pointer fw-bold py-2 px-3"
              onClick={() => setActiveMainTab('background')}
            >
              4. Background website
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink
              active={activeMainTab === 'colors'}
              className="cursor-pointer fw-bold py-2 px-3"
              onClick={() => setActiveMainTab('colors')}
            >
              5. Bảng màu
            </CNavLink>
          </CNavItem>
        </CNav>
      </div>

      {/* TAB 1: CẤU HÌNH THEME */}
      {activeMainTab === 'theme_config' && (
        <CCard className="mb-4 shadow-xs border">
          <CCardHeader className="bg-white py-3 border-bottom d-flex align-items-center justify-content-between">
            <div>
              <h5 className="fw-bold text-dark mb-0">Cấu hình thông tin chiến dịch</h5>
              <small className="text-muted">
                Thiết lập tên, mã định danh và thời gian áp dụng chiến dịch
              </small>
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

            <div className="mb-3">
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

            <CRow className="g-4 mb-3">
              <CCol md={6}>
                <label className="form-label fw-bold text-dark mb-1.5" style={{ fontSize: '14px' }}>
                  Trạng thái kích hoạt
                </label>
                <div className="p-2.5 border rounded bg-light d-flex align-items-center justify-content-between">
                  <div>
                    <span className="fw-semibold text-dark d-block" style={{ fontSize: '13.5px' }}>
                      Kích hoạt áp dụng ngay
                    </span>
                    <small className="text-muted">Áp dụng trực tiếp lên toàn bộ website</small>
                  </div>
                  <CFormCheck
                    type="switch"
                    id="isActiveSwitch"
                    style={{ transform: 'scale(1.25)', marginRight: '8px' }}
                    checked={editingTheme?.isActive}
                    onChange={(e) =>
                      setEditingTheme((prev) => ({ ...prev, isActive: e.target.checked }))
                    }
                  />
                </div>
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>
      )}

      {/* TAB 2: HÌNH ẢNH */}
      {activeMainTab === 'images' && (
        <CCard className="mb-4 shadow-xs border">
          <CCardHeader className="bg-white py-3 border-bottom d-flex align-items-center justify-content-between">
            <div>
              <h5 className="fw-bold text-dark mb-0">Quản lý banner &amp; hình ảnh chiến dịch</h5>
              <small className="text-muted">
                Tải lên và xem trước ảnh đại diện / banner chính của chiến dịch giao diện
              </small>
            </div>
          </CCardHeader>
          <CCardBody className="p-4">
            <CRow className="g-4">
              <CCol md={6}>
                <div className="p-4 bg-light rounded border text-center mb-3">
                  <label
                    className="form-label fw-bold text-dark mb-2 d-block"
                    style={{ fontSize: '14.5px' }}
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
                <label className="form-label fw-bold text-dark mb-2" style={{ fontSize: '14.5px' }}>
                  Ảnh đại diện chiến dịch hiện tại
                </label>
                {editingTheme?.image ? (
                  <div>
                    <div
                      className="rounded border overflow-hidden bg-white shadow-xs p-2 position-relative"
                      style={{ height: '200px', cursor: 'pointer' }}
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
                    <small className="text-primary text-xs d-block mt-1.5 fw-semibold text-center cursor-pointer">
                      🔍 Nhấp vào ảnh để mở popup xem kích thước lớn
                    </small>
                  </div>
                ) : (
                  <div className="p-4 bg-light rounded border text-center text-muted">
                    Chưa có ảnh đại diện nào được tải lên
                  </div>
                )}
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>
      )}

      {/* TAB 3: TRANG TRÍ (SẢN PHẨM, LOGO & FOOTER) */}
      {activeMainTab === 'logo' && (
        <CCard className="mb-4 shadow-xs border">
          <CCardHeader className="bg-white py-3 border-bottom d-flex align-items-center justify-content-between flex-wrap gap-2">
            <div>
              <h5 className="fw-bold text-dark mb-0">
                {'Cấu hình Trang trí (Hình ảnh sản phẩm, Logo & Chân trang)'}
              </h5>
              <small className="text-muted">
                Tùy biến Khung / Huy hiệu đè ảnh sản phẩm, Logo sự kiện và hình trang trí Footer
              </small>
            </div>

            {/* SUB TABS FOR PRODUCT, HEADER & FOOTER */}
            <CNav variant="pills" className="small">
              <CNavItem>
                <CNavLink
                  active={activeOrnamentTab === 'product_image'}
                  className="cursor-pointer fw-bold py-1.5 px-3"
                  onClick={() => setActiveOrnamentTab('product_image')}
                >
                  Hình ảnh sản phẩm
                </CNavLink>
              </CNavItem>
              <CNavItem>
                <CNavLink
                  active={activeOrnamentTab === 'header_logo'}
                  className="cursor-pointer fw-bold py-1.5 px-3"
                  onClick={() => setActiveOrnamentTab('header_logo')}
                >
                  Logo Header
                </CNavLink>
              </CNavItem>
              <CNavItem>
                <CNavLink
                  active={activeOrnamentTab === 'footer'}
                  className="cursor-pointer fw-bold py-1.5 px-3"
                  onClick={() => setActiveOrnamentTab('footer')}
                >
                  Chân trang Footer
                </CNavLink>
              </CNavItem>
            </CNav>
          </CCardHeader>

          <CCardBody className="p-4">
            {/* SUB-TAB 0: HÌNH ẢNH SẢN PHẨM */}
            {activeOrnamentTab === 'product_image' && (
              <div>
                <div className="mb-3 border-bottom pb-2">
                  <h6 className="fw-bold text-success mb-1">
                    Cấu hình Khung &amp; Huy hiệu đè ảnh sản phẩm (Shopee Style)
                  </h6>
                  <p className="text-muted text-xs mb-0">
                    Tải ảnh khung viền chiến dịch hoặc huy hiệu (Badge / Watermark / Logo ngành hàng
                    như Shopee Home, Hàng chính hãng...) đè lên ảnh chi tiết sản phẩm.
                  </p>
                </div>

                <CRow className="g-4 align-items-center">
                  <CCol md={7}>
                    {/* Upload Box */}
                    <div className="p-3 bg-light rounded border text-center mb-3">
                      <label
                        className="form-label fw-bold text-dark mb-2 d-block"
                        style={{ fontSize: '14px' }}
                      >
                        Tải ảnh Khung / Huy hiệu trang trí sản phẩm
                      </label>
                      <CFormInput
                        type="file"
                        accept="image/png,image/webp,image/svg+xml"
                        className="mb-1"
                        onChange={handleProductOrnamentUpload}
                      />
                      <small className="text-muted d-block">
                        Khuyên dùng ảnh PNG / WEBP nền trong suốt chuẩn tỉ lệ 1:1 (Ví dụ:
                        1200x1200px)
                      </small>
                    </div>

                    {/* Options */}
                    <CRow className="g-3">
                      <CCol md={6}>
                        <label
                          className="form-label fw-bold text-dark mb-1"
                          style={{ fontSize: '13.5px' }}
                        >
                          Vị trí hiển thị trên ảnh
                        </label>
                        <CFormSelect
                          value={
                            editingTheme?.decorations?.productOrnamentPosition || 'bottom-left'
                          }
                          onChange={(e) =>
                            setEditingTheme((prev) => ({
                              ...prev,
                              decorations: {
                                ...(prev?.decorations || {}),
                                productOrnamentPosition: e.target.value,
                              },
                            }))
                          }
                        >
                          <option value="bottom-left">
                            Góc dưới bên trái (Tiêu chuẩn Shopee Home)
                          </option>
                          <option value="bottom-right">Góc dưới bên phải</option>
                          <option value="top-left">Góc trên bên trái</option>
                          <option value="top-right">Góc trên bên phải</option>
                          <option value="full">Toàn bộ khung viền 4 cạnh (Frame 1:1)</option>
                        </CFormSelect>
                      </CCol>

                      <CCol md={6}>
                        <label
                          className="form-label fw-bold text-dark mb-1"
                          style={{ fontSize: '13.5px' }}
                        >
                          Kích thước huy hiệu
                        </label>
                        <CFormSelect
                          value={editingTheme?.decorations?.productOrnamentSize || '35%'}
                          disabled={editingTheme?.decorations?.productOrnamentPosition === 'full'}
                          onChange={(e) =>
                            setEditingTheme((prev) => ({
                              ...prev,
                              decorations: {
                                ...(prev?.decorations || {}),
                                productOrnamentSize: e.target.value,
                              },
                            }))
                          }
                        >
                          <option value="20%">Nhỏ gọn (20%)</option>
                          <option value="30%">Tiêu chuẩn (30%)</option>
                          <option value="40%">Vừa lớn (40%)</option>
                          <option value="50%">Lớn nửa cạnh (50%)</option>
                          <option value="65%">Rất lớn (65%)</option>
                          <option value="80%">Cực lớn (80%)</option>
                          <option value="100%">Tràn ngang 100%</option>
                        </CFormSelect>
                      </CCol>

                      <CCol md={12}>
                        <label
                          className="form-label fw-bold text-dark mb-1"
                          style={{ fontSize: '13.5px' }}
                        >
                          Phạm vi áp dụng trên sản phẩm
                        </label>
                        <CFormSelect
                          value={editingTheme?.decorations?.productOrnamentApplyTo || 'main_only'}
                          onChange={(e) =>
                            setEditingTheme((prev) => ({
                              ...prev,
                              decorations: {
                                ...(prev?.decorations || {}),
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
                      </CCol>
                    </CRow>
                  </CCol>

                  {/* Live Product Image Preview Box */}
                  <CCol md={5}>
                    <div className="p-3 bg-light rounded border text-center">
                      <label
                        className="form-label fw-bold text-dark mb-2 d-block"
                        style={{ fontSize: '13.5px' }}
                      >
                        Xem trước trực tiếp trên ảnh sản phẩm
                      </label>
                      <div
                        className="p-3 bg-white rounded border shadow-xs d-flex align-items-center justify-content-center overflow-hidden mx-auto position-relative"
                        style={{ maxWidth: '240px', height: '240px', cursor: 'pointer' }}
                        title="Nhấp vào để phóng to xem ảnh sản phẩm & khung/huy hiệu"
                        onClick={() =>
                          setPreviewModal({
                            visible: true,
                            title: 'Xem trước chi tiết ảnh sản phẩm kèm Khung / Huy hiệu',
                            type: 'product_ornament',
                            imageUrl: '',
                          })
                        }
                      >
                        <div
                          className="position-relative w-100 h-100 rounded border overflow-hidden bg-light d-flex align-items-center justify-content-center"
                          style={{ aspectRatio: '1 / 1' }}
                        >
                          {/* Sample product background */}
                          <img
                            src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=500&q=80"
                            alt="Sample Product"
                            className="w-100 h-100"
                            style={{ objectFit: 'cover' }}
                          />

                          {/* Overlay Frame/Badge */}
                          {editingTheme?.decorations?.productOrnamentUrl ? (
                            <img
                              src={editingTheme.decorations.productOrnamentUrl}
                              alt="Product Ornament Overlay"
                              className="position-absolute pointer-events-none"
                              style={getProductOrnamentStyle(
                                editingTheme?.decorations?.productOrnamentPosition,
                                editingTheme?.decorations?.productOrnamentSize,
                              )}
                            />
                          ) : (
                            <div
                              className="position-absolute bottom-0 start-0 p-1.5 m-2 bg-dark bg-opacity-75 text-white rounded text-xs pointer-events-none"
                              style={{ fontSize: '10px' }}
                            >
                              [Chưa chọn ảnh huy hiệu/khung]
                            </div>
                          )}
                        </div>
                      </div>
                      <small className="text-primary text-xs d-block mt-2 fw-semibold cursor-pointer">
                        🔍 Nhấp vào ảnh để mở popup xem phóng to
                      </small>
                      <small className="text-muted d-block mt-2">
                        Mô phỏng lớp phủ đè lên ảnh gốc giống Shopee
                      </small>
                    </div>
                  </CCol>
                </CRow>
              </div>
            )}

            {/* SUB-TAB 1: LOGO HEADER */}
            {activeOrnamentTab === 'header_logo' && (
              <div>
                <div className="mb-3 border-bottom pb-2">
                  <h6 className="fw-bold text-primary mb-1">Cấu hình Logo Header</h6>
                  <p className="text-muted text-xs mb-0">
                    {
                      'Tải ảnh Logo riêng cho chiến dịch (Logo Noel, Logo Tết, Logo Kỷ niệm...) hiển thị trên Header website.'
                    }
                  </p>
                </div>

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
                <div className="mb-3 border-bottom pb-2">
                  <h6 className="fw-bold text-info mb-1">Cấu hình Chân trang Footer</h6>
                  <p className="text-muted text-xs mb-0">
                    Tải ảnh trang trí Chân trang Footer hiển thị ở hai bên lề Footer.
                  </p>
                </div>

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
                          <option value="both-corners">Hai bên góc lề Footer (Tiêu chuẩn)</option>
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
                            <span className="text-muted text-xs fst-italic">[Hình trang trí]</span>
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
                            <span className="text-muted text-xs fst-italic">[Hình trang trí]</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CCol>
                </CRow>
              </div>
            )}
          </CCardBody>
        </CCard>
      )}

      {/* TAB 4: BACKGROUND WEBSITE */}
      {activeMainTab === 'background' && (
        <CCard className="mb-4 shadow-xs border">
          <CCardHeader className="bg-white py-3 border-bottom d-flex align-items-center justify-content-between">
            <div>
              <h5 className="fw-bold text-dark mb-0">Họa tiết &amp; hoa văn nền Website</h5>
              <small className="text-muted">
                Tùy chỉnh watermark, pattern hoa văn lặp và độ trong suốt nền website
              </small>
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
              <small className="text-muted">
                Thiết lập hệ thống màu sắc chủ đạo, thanh menu và các điểm nhấn trên giao diện
              </small>
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
                className="position-relative mx-auto rounded border shadow bg-white overflow-hidden"
                style={{ width: '100%', maxWidth: '480px', aspectRatio: '1 / 1' }}
              >
                <img
                  src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80"
                  alt="Product Large Mockup"
                  className="w-100 h-100"
                  style={{ objectFit: 'cover' }}
                />
                {editingTheme?.decorations?.productOrnamentUrl && (
                  <img
                    src={editingTheme.decorations.productOrnamentUrl}
                    alt="Product Ornament Large Overlay"
                    className="position-absolute pointer-events-none"
                    style={getProductOrnamentStyle(
                      editingTheme?.decorations?.productOrnamentPosition,
                      editingTheme?.decorations?.productOrnamentSize,
                    )}
                  />
                )}
              </div>
              <small className="text-muted d-block mt-3">
                {`Vị trí: ${
                  editingTheme?.decorations?.productOrnamentPosition === 'full'
                    ? 'Khung viền 4 cạnh 1:1'
                    : editingTheme?.decorations?.productOrnamentPosition || 'Góc dưới bên trái'
                } | Kích thước: ${
                  editingTheme?.decorations?.productOrnamentPosition === 'full'
                    ? '100% (Khung)'
                    : editingTheme?.decorations?.productOrnamentSize || '35%'
                }`}
              </small>
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
