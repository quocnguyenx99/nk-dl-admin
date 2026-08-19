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
  CNav,
  CNavItem,
  CNavLink,
  CRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilArrowLeft, cilSave } from '@coreui/icons'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { axiosClient } from '../../axiosConfig'
import logoNk from '../../assets/images/logo/nk viền.png'

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

  const [activeOrnamentTab, setActiveOrnamentTab] = useState('header_logo')

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

  const handleFooterOrnamentUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
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
        toast.success('Đã tải ảnh trang trí Chân trang Footer thành công!')
      }
    } catch (err) {
      toast.error('Lỗi upload ảnh trang trí Footer: ' + err.message)
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

  return (
    <div className="pb-5">
      {/* Header Bar */}
      <div className="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom">
        <div>
          <h4 className="fw-bold text-dark mb-1 text-uppercase">THÊM MỚI CHIẾN DỊCH GIAO DIỆN</h4>
          <p className="text-muted small mb-0">
            Tạo chiến dịch mới và xem trước trực tiếp cấu hình trên từng trang (Header, Sản phẩm,
            Thanh toán, Footer)
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

      {/* ROW 1: General Info & Interface Images */}
      <CRow className="g-4 mb-4">
        {/* Thẻ 1: Thông tin chung & Lập lịch chiến dịch */}
        <CCol md={6}>
          <CCard className="h-100 shadow-xs border">
            <CCardHeader className="bg-white py-3 fw-bold text-dark border-bottom d-flex align-items-center justify-content-between">
              <span>
                Thẻ 1: Thông tin chung &amp; Lập lịch chiến dịch (Campaign Info &amp; Schedule)
              </span>
              <CBadge color="warning">Bản nháp</CBadge>
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
                    onChange={(e) => setNewTheme((prev) => ({ ...prev, endDate: e.target.value }))}
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
              <CBadge color="secondary">Hero Assets</CBadge>
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
                  <span className="text-muted text-xs">Chấp nhận JPG, PNG, WEBP (Tối đa 5MB)</span>
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
                      <CImage
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
      <CRow className="mb-4">
        <CCol md={12}>
          <CCard className="shadow-xs border">
            <CCardHeader className="bg-white py-2 border-bottom d-flex align-items-center justify-content-between flex-wrap gap-2">
              <span className="fw-bold text-dark fs-6">
                Thẻ 3: Cấu hình Logo Header &amp; Chân trang Footer
              </span>

              {/* TOP NAV BUTTONS / TABS TO SWITCH BETWEEN HEADER & FOOTER */}
              <CNav variant="pills" className="small">
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
              {/* TAB 1: LOGO HEADER */}
              {activeOrnamentTab === 'header_logo' && (
                <div>
                  <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
                    <div>
                      <h6 className="fw-bold text-primary mb-1">Cấu hình Logo Header</h6>
                      <p className="text-muted text-xs mb-0">
                        Tải ảnh Logo riêng cho chiến dịch (Logo Noel, Logo Tết, Logo Kỷ niệm...)
                        hiển thị trên Header website.
                      </p>
                    </div>
                    <CBadge color="primary">Header Logo</CBadge>
                  </div>

                  <CRow className="g-4 align-items-center">
                    <CCol md={7}>
                      <div className="p-4 bg-light rounded border text-center">
                        <label className="form-label font-semibold text-dark mb-2">
                          Tải ảnh Logo chiến dịch mới từ máy tính
                        </label>
                        <CFormInput
                          type="file"
                          accept="image/*"
                          size="sm"
                          className="mb-2"
                          onChange={handleMainLogoUpload}
                        />
                        <span className="text-muted text-xs d-block">
                          Chấp nhận PNG, WEBP, JPG tách nền. Ảnh logo này sẽ hiển thị thay thế Logo
                          mặc định trên Header website.
                        </span>
                      </div>
                    </CCol>

                    {/* Live Logo Preview Box */}
                    <CCol md={5}>
                      <div className="p-3 bg-light rounded border text-center">
                        <span className="fw-semibold text-dark text-xs d-block mb-2">
                          Xem trước trực tiếp Logo Header
                        </span>
                        <div
                          className="p-3 bg-white rounded border shadow-xs d-flex align-items-center justify-content-center"
                          style={{ height: '120px' }}
                        >
                          <div className="p-2 bg-white rounded border">
                            <img
                              src={newTheme?.decorations?.logoUrl || logoNk}
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

              {/* TAB 2: FOOTER */}
              {activeOrnamentTab === 'footer' && (
                <div>
                  <div className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
                    <div>
                      <h6 className="fw-bold text-info mb-1">Cấu hình Chân trang Footer</h6>
                      <p className="text-muted text-xs mb-0">
                        Tải ảnh trang trí Chân trang Footer hiển thị ở hai bên lề Footer.
                      </p>
                    </div>
                    <CBadge color="info" className="text-white">
                      Footer Emblem
                    </CBadge>
                  </div>

                  <CRow className="g-4 align-items-center">
                    <CCol md={7}>
                      {/* Upload Box */}
                      <div className="p-3 bg-light rounded border text-center mb-3">
                        <label className="form-label font-semibold text-dark small mb-1">
                          Tải ảnh trang trí Chân trang Footer từ máy tính
                        </label>
                        <CFormInput
                          type="file"
                          accept="image/*"
                          size="sm"
                          className="mb-1"
                          onChange={handleFooterOrnamentUpload}
                        />
                        <span className="text-muted text-xs">
                          Khuyên dùng ảnh PNG / WEBP tách nền
                        </span>
                      </div>

                      {/* Position & Size */}
                      <CRow className="g-3">
                        <CCol md={6}>
                          <label className="form-label font-semibold text-dark small mb-1">
                            Vị trí hiển thị trên Footer
                          </label>
                          <CFormSelect
                            size="sm"
                            value={newTheme?.decorations?.footerOrnamentPosition || 'both-corners'}
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
                            <option value="both-corners">Hai bên góc lề Footer (Tiêu chuẩn)</option>
                            <option value="left-only">Chỉ góc bên trái Footer</option>
                            <option value="right-only">Chỉ góc bên phía phải Footer</option>
                          </CFormSelect>
                        </CCol>
                        <CCol md={6}>
                          <label className="form-label font-semibold text-dark small mb-1">
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
                        <span className="fw-semibold text-dark text-xs d-block mb-2">
                          Xem trước trực tiếp Chân trang Footer
                        </span>
                        <div
                          className="p-3 bg-white rounded border shadow-xs d-flex align-items-center justify-content-between overflow-hidden"
                          style={{ height: '120px' }}
                        >
                          <div className="d-flex align-items-center gap-2">
                            {newTheme?.decorations?.footerOrnamentUrl ? (
                              <img
                                src={newTheme.decorations.footerOrnamentUrl}
                                alt="Footer Left"
                                style={{
                                  height: newTheme?.decorations?.footerOrnamentSize || '48px',
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
                            {newTheme?.decorations?.footerOrnamentUrl ? (
                              <img
                                src={newTheme.decorations.footerOrnamentUrl}
                                alt="Footer Right"
                                style={{
                                  height: newTheme?.decorations?.footerOrnamentSize || '48px',
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
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* ROW 3: Watermarks & Color Tokens */}
      <CRow className="g-4 mb-4">
        {/* Thẻ 4: Background & Watermarks */}
        <CCol md={6}>
          <CCard className="h-100 shadow-xs border">
            <CCardHeader className="bg-white py-3 fw-bold text-dark border-bottom d-flex align-items-center justify-content-between">
              <span>Thẻ 4: Họa tiết &amp; Hoa văn nền Website (Background &amp; Watermarks)</span>
              <CBadge color="success">Patterns</CBadge>
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

              {/* LIVE WATERMARK PREVIEW */}
              <div>
                <span className="fw-semibold text-dark text-xs d-block mb-1">
                  Xem trước trực tiếp hoa văn nền (Live Preview)
                </span>
                <div
                  className="rounded border overflow-hidden position-relative"
                  style={{
                    backgroundColor: newTheme?.colors?.background || '#f7f7f7',
                    height: '140px',
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
      </CRow>

      {/* ROW 4: Color Scheme & Design Tokens */}
      <CRow className="mb-4">
        {/* Thẻ 6: Colors */}
        <CCol md={12}>
          <CCard className="shadow-xs border">
            <CCardHeader className="bg-white py-3 fw-bold text-dark border-bottom d-flex align-items-center justify-content-between">
              <span>Thẻ 6: Bảng màu tổng thể Website (Color Scheme &amp; Design Tokens)</span>
              <CBadge color="warning" className="text-dark">
                Theme Colors
              </CBadge>
            </CCardHeader>
            <CCardBody className="p-3">
              <CRow className="g-3">
                {[
                  { label: 'Màu chính (Nút & Viền)', key: 'primary' },
                  { label: 'Màu thanh Menu Topbar', key: 'secondary' },
                  { label: 'Màu nhấn (Sale & Hotline)', key: 'accent' },
                  { label: 'Màu nền website', key: 'background' },
                  { label: 'Màu chữ văn bản', key: 'text' },
                ].map((item) => (
                  <CCol key={item.key} md={2.4}>
                    <div className="p-2 border rounded bg-light d-flex align-items-center justify-content-between">
                      <span className="small text-secondary fw-semibold">{item.label}</span>
                      <div className="d-flex align-items-center gap-2">
                        <input
                          type="color"
                          value={newTheme?.colors?.[item.key] || '#2356c4'}
                          className="form-control form-control-color border-0 p-0 rounded cursor-pointer"
                          style={{ width: '28px', height: '28px' }}
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
                          style={{ width: '75px', fontSize: '11px' }}
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
    </div>
  )
}

export default AddThemeConfig
