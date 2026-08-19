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
  CImage,
  CRow,
  CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilArrowLeft,
  cilColorPalette,
  cilCloudUpload,
  cilCheckCircle,
  cilSave,
} from '@coreui/icons'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { axiosClient } from '../../axiosConfig'

// Preset Website Background Patterns & Wallpapers
const PRESET_BACKGROUNDS = [
  {
    key: 'none',
    name: 'Nền trơn tiêu chuẩn',
    icon: '🚫',
    badge: 'Màu trơn',
    description: 'Chỉ hiển thị màu nền website thuần túy',
    gradient: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    tagColor: '#64748b',
  },
  {
    key: 'mooncakes',
    name: 'Bánh Trung Thu & Lồng Đèn',
    icon: '🥮',
    badge: 'Lễ Hội',
    description: 'Họa tiết bánh nướng sen, bánh dẻo & lồng đèn trung thu',
    gradient: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
    tagColor: '#d97706',
  },
  {
    key: 'stars_moon',
    name: 'Trăng Rằm & Tinh Tú',
    icon: '🌕',
    badge: 'Ban Đêm / Rằm',
    description: 'Mặt trăng vàng, mây ngũ sắc & chòm sao lung linh',
    gradient: 'linear-gradient(135deg, #fefce8 0%, #fef08a 100%)',
    tagColor: '#ca8a04',
  },
  {
    key: 'noel_snow',
    name: 'Giáng Sinh Tuyết Rơi & Chuông Vàng',
    icon: '❄️',
    badge: 'Noel / Xmas',
    description: 'Bông tuyết trắng tinh khôi, cây thông & chuông vàng Noel',
    gradient: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
    tagColor: '#16a34a',
  },
  {
    key: 'tet_blossoms',
    name: 'Tết Hoa Mai, Hoa Đào & Pháo Hoa',
    icon: '🌸',
    badge: 'Tết Nguyên Đán',
    description: 'Cành mai vàng, hoa đào hồng, thỏi vàng & bao lì xì',
    gradient: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)',
    tagColor: '#e11d48',
  },
  {
    key: 'cyber_grid',
    name: 'Công Nghệ Cyber & Mạch Vi Xử Lý',
    icon: '⚡',
    badge: 'Công Nghệ',
    description: 'Lưới ma trận Cyber Matrix & vi mạch máy tính hiện đại',
    gradient: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
    tagColor: '#2563eb',
  },
  {
    key: 'backtoschool',
    name: 'Tuổi Học Trò & Mùa Tựu Trường',
    icon: '🎓',
    badge: 'Khai Trường',
    description: 'Máy bay giấy, nón cử nhân, sách vở & ngôi sao học trò',
    gradient: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
    tagColor: '#7c3aed',
  },
  {
    key: 'blackfriday',
    name: 'Black Friday & Siêu Sale',
    icon: '⚡',
    badge: 'Siêu Giảm Giá',
    description: 'Họa tiết hộp quà, sấm sét neon & tag giảm giá hot',
    gradient: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    tagColor: '#0f172a',
  },
  {
    key: 'custom',
    name: 'Tải ảnh nền riêng từ máy tính',
    icon: '📤',
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

  const uniqueId = `add-pattern-${presetKey}`

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
              <text x="30" y="160" fontSize="24" fill="#b45309">
                🏮
              </text>
              <text x="125" y="155" fontSize="26" fill="#d97706">
                🥮
              </text>
              <text x="175" y="110" fontSize="14" fill="#f59e0b">
                ★
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
              <text x="85" y="110" fontSize="24" fill="#d97706">
                ☁
              </text>
              <text x="30" y="170" fontSize="20" fill="#eab308">
                ⭐
              </text>
              <text x="145" y="165" fontSize="28" fill="#eab308">
                🌕
              </text>
              <text x="185" y="125" fontSize="16" fill="#f59e0b">
                ✦
              </text>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#${uniqueId})`} />
        </svg>
      )}

      {(presetKey === 'noel_snow' || presetKey === 'noel') && (
        <svg className="w-100 h-100" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id={uniqueId} width="180" height="180" patternUnits="userSpaceOnUse">
              <text x="25" y="45" fontSize="22" fill="#0284c7">
                ❄
              </text>
              <text x="110" y="50" fontSize="26" fill="#eab308">
                🔔
              </text>
              <text x="65" y="100" fontSize="18" fill="#38bdf8">
                ✦
              </text>
              <text x="20" y="145" fontSize="26" fill="#eab308">
                🔔
              </text>
              <text x="105" y="140" fontSize="22" fill="#0284c7">
                ❄
              </text>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#${uniqueId})`} />
        </svg>
      )}

      {(presetKey === 'tet_blossoms' || presetKey === 'tet') && (
        <svg className="w-100 h-100" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id={uniqueId} width="200" height="200" patternUnits="userSpaceOnUse">
              <text x="25" y="45" fontSize="26" fill="#e11d48">
                🌸
              </text>
              <text x="120" y="55" fontSize="26" fill="#eab308">
                🌼
              </text>
              <text x="75" y="105" fontSize="20" fill="#dc2626">
                🧧
              </text>
              <text x="25" y="160" fontSize="26" fill="#eab308">
                🌼
              </text>
              <text x="115" y="155" fontSize="26" fill="#e11d48">
                🌸
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
              <circle cx="0" cy="0" r="2.5" fill="#3b82f6" />
              <circle cx="80" cy="0" r="2.5" fill="#3b82f6" />
              <circle cx="0" cy="80" r="2.5" fill="#3b82f6" />
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
          decorations: newTheme.decorations || {
            particles: newTheme.background?.preset || newTheme.code || 'none',
            ornaments: newTheme.background?.preset || newTheme.code || 'none',
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

  return (
    <div className="pb-5">
      {/* Header & Back Action */}
      <div className="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom">
        <div>
          <h4 className="fw-bold text-dark mb-1 text-uppercase">THÊM MỚI CHIẾN DỊCH GIAO DIỆN</h4>
          <p className="text-muted small mb-0">
            Tạo chiến dịch giao diện mới với màu sắc, họa tiết và thời gian áp dụng riêng
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
          <CButton
            color="primary"
            className="text-white fw-bold d-flex align-items-center gap-1.5 shadow-sm"
            disabled={isSaving}
            onClick={handleSave}
          >
            {isSaving ? (
              <>
                <CSpinner size="sm" /> <span>Đang lưu...</span>
              </>
            ) : (
              <>
                <CIcon icon={cilSave} /> <span>Lưu Chiến Dịch</span>
              </>
            )}
          </CButton>
        </div>
      </div>

      <CRow className="g-4">
        {/* Left Column: Form Details & Color Options */}
        <CCol md={8}>
          {/* Card 1: General Info */}
          <CCard className="mb-4 shadow-xs border">
            <CCardHeader className="bg-white py-3 fw-bold text-dark border-bottom">
              📘 Thông tin chung chiến dịch
            </CCardHeader>
            <CCardBody className="p-4">
              <CRow className="mb-3">
                <CCol md={6}>
                  <label className="form-label font-semibold text-dark small">
                    Tên chiến dịch giao diện (Title) *
                  </label>
                  <CFormInput
                    placeholder="VD: Khai Xuân Bứt Phá - Tết 2027"
                    value={newTheme.name}
                    onChange={(e) => setNewTheme((prev) => ({ ...prev, name: e.target.value }))}
                  />
                </CCol>
                <CCol md={6}>
                  <label className="form-label font-semibold text-dark small">Mã Code (Slug)</label>
                  <CFormInput
                    placeholder="VD: tet_2027"
                    value={newTheme.code}
                    onChange={(e) => setNewTheme((prev) => ({ ...prev, code: e.target.value }))}
                  />
                </CCol>
              </CRow>

              <CRow className="mb-3">
                <CCol md={4}>
                  <label className="form-label font-semibold text-dark small">Thẻ Nhãn (Tag)</label>
                  <CFormInput
                    placeholder="VD: Lễ Hội / Siêu Sale"
                    value={newTheme.tag}
                    onChange={(e) => setNewTheme((prev) => ({ ...prev, tag: e.target.value }))}
                  />
                </CCol>
                <CCol md={4}>
                  <label className="form-label font-semibold text-dark small">Ngày bắt đầu</label>
                  <CFormInput
                    type="date"
                    value={newTheme.startDate}
                    onChange={(e) =>
                      setNewTheme((prev) => ({ ...prev, startDate: e.target.value }))
                    }
                  />
                  <span className="text-muted text-xs d-block mt-1">
                    (Để trống = Không giới hạn)
                  </span>
                </CCol>
                <CCol md={4}>
                  <label className="form-label font-semibold text-dark small">Ngày kết thúc</label>
                  <CFormInput
                    type="date"
                    value={newTheme.endDate}
                    onChange={(e) => setNewTheme((prev) => ({ ...prev, endDate: e.target.value }))}
                  />
                  <span className="text-muted text-xs d-block mt-1">
                    (Để trống = Không giới hạn)
                  </span>
                </CCol>
              </CRow>

              <div>
                <label className="form-label font-semibold text-dark small">
                  Mô tả chi tiết / Tiêu đề phụ (Description)
                </label>
                <CFormInput
                  placeholder="VD: Ưu đãi mua máy tính xách tay & linh kiện PC nhận lì xì tới 2 triệu"
                  value={newTheme.description}
                  onChange={(e) =>
                    setNewTheme((prev) => ({ ...prev, description: e.target.value }))
                  }
                />
              </div>
            </CCardBody>
          </CCard>

          {/* Card 2: Color Palette */}
          <CCard className="mb-4 shadow-xs border">
            <CCardHeader className="bg-white py-3 fw-bold text-dark border-bottom d-flex align-items-center gap-2">
              <CIcon icon={cilColorPalette} className="text-primary" /> Màu tổng thể chiến dịch
            </CCardHeader>
            <CCardBody className="p-4">
              <CRow className="g-3">
                {[
                  { label: 'Màu chính (Nút & Viền)', key: 'primary' },
                  { label: 'Màu thanh Menu Topbar', key: 'secondary' },
                  { label: 'Màu nhấn (Sale & Hotline)', key: 'accent' },
                  { label: 'Màu nền website', key: 'background' },
                  { label: 'Màu chữ văn bản', key: 'text' },
                ].map((item) => (
                  <CCol md={6} key={item.key}>
                    <div className="d-flex align-items-center justify-content-between p-2.5 border rounded bg-light">
                      <span className="small text-secondary fw-semibold">{item.label}</span>
                      <div className="d-flex align-items-center gap-2">
                        <input
                          type="color"
                          value={newTheme.colors?.[item.key] || '#2356c4'}
                          className="form-control form-control-color border-0 p-0 rounded cursor-pointer"
                          style={{ width: '34px', height: '34px' }}
                          onChange={(e) => {
                            const newCols = {
                              ...(newTheme.colors || {}),
                              [item.key]: e.target.value,
                            }
                            setNewTheme((prev) => ({ ...prev, colors: newCols }))
                          }}
                        />
                        <CFormInput
                          size="sm"
                          value={newTheme.colors?.[item.key] || '#2356c4'}
                          className="font-monospace text-uppercase"
                          style={{ width: '90px', fontSize: '12px' }}
                          onChange={(e) => {
                            const newCols = {
                              ...(newTheme.colors || {}),
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
            </CCardBody>
          </CCard>

          {/* Card 3: Background Patterns & Wallpapers */}
          <CCard className="mb-4 shadow-xs border">
            <CCardHeader className="bg-white py-3 fw-bold text-dark border-bottom d-flex align-items-center justify-content-between">
              <span>Họa tiết & Hình nền Website (Background Pattern & Wallpaper)</span>
              <CBadge color="light" className="text-secondary border font-normal">
                Mẫu sẵn có & Tùy chỉnh
              </CBadge>
            </CCardHeader>
            <CCardBody className="p-4">
              <p className="text-muted small mb-3">
                Chọn hoa văn chìm lễ hội theo mùa (Bánh trung thu, Trăng sao, Noel, Tết...) hoặc tải
                ảnh nền riêng cho website
              </p>

              {/* Preset Cards Grid */}
              <CRow className="g-2 mb-3">
                {PRESET_BACKGROUNDS.map((item) => {
                  const isSelected = currentPreset === item.key
                  return (
                    <CCol md={4} key={item.key}>
                      <div
                        className={`p-2.5 rounded-3 border h-100 cursor-pointer position-relative ${
                          isSelected
                            ? 'border-primary bg-primary bg-opacity-10 shadow-sm'
                            : 'bg-white'
                        }`}
                        style={{
                          borderWidth: isSelected ? '2px' : '1px',
                          borderColor: isSelected ? '#2563eb' : '#e2e8f0',
                          transition: 'all 0.15s ease-in-out',
                        }}
                        onClick={() =>
                          setNewTheme((prev) => ({
                            ...prev,
                            background: {
                              ...bgConfig,
                              preset: item.key,
                              customUrl: item.key === 'custom' ? bgConfig.customUrl : '',
                            },
                          }))
                        }
                      >
                        <div className="d-flex align-items-start gap-2">
                          <div
                            className="rounded-2 d-flex align-items-center justify-content-center flex-shrink-0"
                            style={{
                              width: '36px',
                              height: '36px',
                              background: item.gradient,
                              fontSize: '18px',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                            }}
                          >
                            {item.icon}
                          </div>
                          <div className="flex-grow-1 overflow-hidden">
                            <div className="d-flex align-items-center justify-content-between mb-0.5">
                              <span
                                className="fw-bold text-truncate"
                                style={{
                                  fontSize: '12px',
                                  color: isSelected ? '#1e40af' : '#1e293b',
                                }}
                              >
                                {item.name}
                              </span>
                            </div>
                            <span
                              className="badge px-1.5 py-0.5"
                              style={{
                                fontSize: '9.5px',
                                backgroundColor: `${item.tagColor}15`,
                                color: item.tagColor,
                                border: `1px solid ${item.tagColor}30`,
                              }}
                            >
                              {item.badge}
                            </span>
                          </div>
                          {isSelected && (
                            <div
                              className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                              style={{ width: '18px', height: '18px', fontSize: '11px' }}
                            >
                              ✓
                            </div>
                          )}
                        </div>
                      </div>
                    </CCol>
                  )
                })}
              </CRow>

              {/* Custom Upload Input */}
              {currentPreset === 'custom' && (
                <div className="p-3 bg-light rounded-3 border mb-3">
                  <label className="form-label fw-bold text-dark text-xs mb-1.5">
                    📤 Tải ảnh nền từ máy tính (PNG, JPG, WebP, SVG):
                  </label>
                  <CFormInput
                    type="file"
                    accept="image/*"
                    size="sm"
                    className="mb-2"
                    onChange={handleCustomBgUpload}
                  />
                  {bgConfig.customUrl && (
                    <div className="mt-2 d-flex align-items-center gap-2">
                      <img
                        src={bgConfig.customUrl}
                        alt="Custom Background"
                        className="rounded border"
                        style={{ width: '60px', height: '40px', objectFit: 'cover' }}
                      />
                      <span className="text-success text-xs fw-semibold">✓ Đã tải ảnh nền</span>
                    </div>
                  )}
                </div>
              )}

              {/* Controls: Opacity & Display Mode */}
              {currentPreset !== 'none' && (
                <div className="p-3 bg-light rounded-3 border mb-3">
                  <CRow className="g-3 align-items-center">
                    <CCol md={6}>
                      <label className="form-label fw-bold text-dark text-xs mb-1 d-flex justify-content-between">
                        <span>Độ mờ hoa văn nền (Opacity):</span>
                        <span className="text-primary font-monospace">
                          {Math.round(localOpacity * 100)}%
                        </span>
                      </label>
                      <input
                        type="range"
                        className="form-range"
                        min="0.05"
                        max="0.6"
                        step="0.01"
                        value={localOpacity}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value)
                          setLocalOpacity(val)
                          setNewTheme((prev) => ({
                            ...prev,
                            background: {
                              ...bgConfig,
                              opacity: val,
                            },
                          }))
                        }}
                      />
                      <div
                        className="d-flex justify-content-between text-muted"
                        style={{ fontSize: '10px' }}
                      >
                        <span>5% (Rất nhẹ)</span>
                        <span>15% (Chuẩn đẹp)</span>
                        <span>60% (Đậm nét)</span>
                      </div>
                    </CCol>

                    <CCol md={6}>
                      <label className="form-label fw-bold text-dark text-xs mb-1">
                        Kiểu hiển thị hoa văn:
                      </label>
                      <div className="d-flex gap-3 mt-1">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="add_bgMode"
                            id="add_bgMode_pattern"
                            checked={bgConfig.mode !== 'cover'}
                            onChange={() =>
                              setNewTheme((prev) => ({
                                ...prev,
                                background: {
                                  ...bgConfig,
                                  mode: 'pattern',
                                },
                              }))
                            }
                          />
                          <label
                            className="form-check-label text-dark text-xs cursor-pointer"
                            htmlFor="add_bgMode_pattern"
                          >
                            Lặp hoa văn
                          </label>
                        </div>
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="radio"
                            name="add_bgMode"
                            id="add_bgMode_cover"
                            checked={bgConfig.mode === 'cover'}
                            onChange={() =>
                              setNewTheme((prev) => ({
                                ...prev,
                                background: {
                                  ...bgConfig,
                                  mode: 'cover',
                                },
                              }))
                            }
                          />
                          <label
                            className="form-check-label text-dark text-xs cursor-pointer"
                            htmlFor="add_bgMode_cover"
                          >
                            Tràn toàn trang
                          </label>
                        </div>
                      </div>
                    </CCol>
                  </CRow>
                </div>
              )}

              {/* LIVE PREVIEW BOX */}
              <div className="mt-3">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="fw-bold text-dark text-xs">
                    👁️ Xem trước trực tiếp hoa văn nền (Live Preview):
                  </span>
                  <CBadge color="primary" className="bg-opacity-10 text-primary border text-xs">
                    Mẫu:{' '}
                    {PRESET_BACKGROUNDS.find((p) => p.key === currentPreset)?.name || 'Tùy chỉnh'} (
                    {Math.round(localOpacity * 100)}%)
                  </CBadge>
                </div>

                <div
                  className="rounded-3 border overflow-hidden position-relative"
                  style={{
                    backgroundColor: newTheme?.colors?.background || '#f7f7f7',
                    height: '160px',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)',
                  }}
                >
                  <ThemeBackgroundWatermarkLayer
                    background={{ ...bgConfig, opacity: localOpacity }}
                    themeCode={newTheme?.code}
                  />
                </div>
              </div>
            </CCardBody>
          </CCard>
        </CCol>

        {/* Right Column: Festive Accessories & Cover Image */}
        <CCol md={4}>
          {/* Card 4: Festive Kit */}
          <CCard className="mb-4 shadow-xs border">
            <CCardHeader className="bg-white py-3 fw-bold text-dark border-bottom">
              🎨 Bộ nhận diện lễ hội theo mùa
            </CCardHeader>
            <CCardBody className="p-3">
              <label className="form-label font-semibold text-dark small mb-2">
                Chọn phụ kiện & hiệu ứng lễ hội (Festive Theme UI Kit)
              </label>
              <CFormSelect
                size="sm"
                className="mb-2"
                value={newTheme?.decorations?.particles || newTheme?.code || 'none'}
                onChange={(e) => {
                  const val = e.target.value
                  setNewTheme((prev) => ({
                    ...prev,
                    decorations: {
                      particles: val,
                      ornaments: val,
                    },
                  }))
                }}
              >
                <option value="none">🚫 Không gắn phụ kiện lễ hội (Tiêu chuẩn)</option>
                <option value="trungthu">🏮 Tết Trung Thu (Lồng đèn, Trăng sao)</option>
                <option value="noel">❄️ Giáng Sinh / Noel (Lá thông, Bông tuyết, Chuông)</option>
                <option value="tet">🌼 Tết Nguyên Đán (Cành mai, Lì xì, Thỏi vàng)</option>
                <option value="women_day">🌸 Quốc tế Phụ nữ 8/3 & 20/10 (Hoa hồng)</option>
                <option value="backtoschool">✈️ Mùa Tựu Trường (Máy bay giấy, Nón cử nhân)</option>
                <option value="blackfriday">⚡ Siêu Sale Black Friday (Tia sét Neon)</option>
                <option value="halloween">🎃 Lễ Hội Halloween (Bí ngô)</option>
              </CFormSelect>
            </CCardBody>
          </CCard>

          {/* Card 5: Cover Image */}
          <CCard className="mb-4 shadow-xs border">
            <CCardHeader className="bg-white py-3 fw-bold text-dark border-bottom">
              🖼️ Ảnh đại diện giao diện xem trước
            </CCardHeader>
            <CCardBody className="p-3">
              <label className="form-label font-semibold text-dark small mb-2">
                Tải ảnh giao diện xem trước từ máy tính
              </label>
              <CFormInput
                type="file"
                accept="image/*"
                size="sm"
                className="mb-3"
                onChange={handleFileChange}
              />

              {newTheme?.image && (
                <div>
                  <span className="form-label font-semibold text-dark small d-block mb-1">
                    Xem trước hình ảnh
                  </span>
                  <div
                    className="rounded border overflow-hidden bg-light"
                    style={{ height: '180px' }}
                  >
                    <CImage
                      src={newTheme.image}
                      className="w-100 h-100"
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                </div>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Footer Action Bar */}
      <div className="d-flex align-items-center justify-content-end gap-2 pt-3 border-top">
        <CButton
          color="secondary"
          variant="outline"
          className="px-4 py-2 fw-semibold"
          onClick={() => navigate('/theme-custom/config')}
        >
          Hủy / Quay lại
        </CButton>
        <CButton
          color="primary"
          className="text-white px-4 py-2 font-bold shadow-sm"
          disabled={isSaving}
          onClick={handleSave}
        >
          {isSaving ? 'Đang lưu...' : 'Lưu Chiến Dịch Mới'}
        </CButton>
      </div>
    </div>
  )
}

export default AddThemeConfig
