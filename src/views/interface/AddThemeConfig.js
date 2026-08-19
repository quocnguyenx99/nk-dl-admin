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
  CFormSwitch,
  CImage,
  CRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilArrowLeft, cilSave } from '@coreui/icons'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { axiosClient } from '../../axiosConfig'

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

  const uniqueId = `add-dash-pattern-${presetKey}`

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

  // Home Page Sections List
  const [homeSections, setHomeSections] = useState([
    { id: 'topbar', name: 'Thanh Utility Topbar & Hotline', enabled: true },
    { id: 'header', name: 'Header chính & Logo Nguyên Kim', enabled: true },
    { id: 'hero', name: 'Banner Hero Slider chính', enabled: true },
    { id: 'promo_blocks', name: 'Khối Banner khuyến mãi siêu hot', enabled: true },
    { id: 'featured_products', name: 'Khối Sản phẩm nổi bật', enabled: true },
    { id: 'campaign_banner', name: 'Banner sự kiện chiến dịch', enabled: true },
    { id: 'featured_categories', name: 'Danh mục sản phẩm nổi bật', enabled: true },
    { id: 'footer_services', name: 'Cam kết dịch vụ & Khối dịch vụ', enabled: true },
    { id: 'footer', name: 'Chân trang Footer', enabled: true },
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
      {/* Header Bar */}
      <div className="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom">
        <div>
          <h4 className="fw-bold text-dark mb-1 text-uppercase">THÊM MỚI CHIẾN DỊCH GIAO DIỆN</h4>
          <p className="text-muted small mb-0">
            Tạo chiến dịch giao diện mới với màu sắc, họa tiết, bố cục trang & thời gian áp dụng
            riêng
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
                    src={newTheme?.image}
                    className="w-100 h-100"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center justify-content-between mb-1">
                    <span className="fw-bold text-dark fs-6">
                      {newTheme?.name || 'Chiến dịch mới'}
                    </span>
                    <CBadge color="warning">Bản nháp</CBadge>
                  </div>
                  <div className="text-muted text-xs mb-1">Loại: {newTheme?.tag}</div>
                  <div className="text-muted text-xs mb-1">
                    Mã slug: #{newTheme?.code || 'auto'}
                  </div>
                  <div className="text-muted text-xs mb-2">
                    {newTheme?.description || 'Chưa có mô tả chi tiết'}
                  </div>
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
                onClick={() => toast.info('Xem trước hoa văn hiển thị trực tiếp ở khối bên dưới!')}
              >
                <span>👁️ Xem trước giao diện</span>
              </CButton>

              <CButton
                color="primary"
                className="text-white py-2.5 px-3 fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2"
                disabled={isSaving}
                onClick={handleSave}
              >
                <CIcon icon={cilSave} />
                <span>{isSaving ? 'Đang lưu...' : 'Lưu Chiến Dịch Mới'}</span>
              </CButton>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* MIDDLE ROW: 3 CARDS (Pages & Layouts, Page Sections, Banners & Assets) */}
      <CRow className="g-4 mb-4">
        {/* Card 4: Pages & Layouts */}
        <CCol md={4}>
          <CCard className="h-100 shadow-xs border">
            <CCardHeader className="bg-white py-3 fw-bold text-dark border-bottom">
              Trang & Cấu trúc Bố cục (Pages & Layouts)
            </CCardHeader>
            <CCardBody className="p-3 d-flex flex-column justify-content-between">
              <div>
                <p className="text-muted text-xs mb-3">
                  Bật/Tắt trang và chọn kiểu giao diện bố cục phù hợp cho từng trang
                </p>
                <div className="table-responsive">
                  <table className="table table-sm align-middle small m-0">
                    <thead>
                      <tr className="table-light">
                        <th>Trang</th>
                        <th>Trạng thái</th>
                        <th>Bố cục</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagesLayouts.map((item, idx) => (
                        <tr key={item.id}>
                          <td className="fw-semibold">{item.name}</td>
                          <td>
                            <CFormSwitch
                              checked={item.enabled}
                              onChange={(e) => {
                                const next = [...pagesLayouts]
                                next[idx].enabled = e.target.checked
                                setPagesLayouts(next)
                              }}
                            />
                          </td>
                          <td>
                            <span className="badge bg-light text-dark border">{item.layout}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="pt-3 border-top mt-3">
                <CButton
                  color="light"
                  className="border w-100 text-secondary fw-semibold py-1.5"
                  onClick={() => toast.info('Đã bật tất cả cấu hình trang!')}
                >
                  Quản lý Trang & Bố cục
                </CButton>
              </div>
            </CCardBody>
          </CCard>
        </CCol>

        {/* Card 5: Page Sections (Home) */}
        <CCol md={4}>
          <CCard className="h-100 shadow-xs border">
            <CCardHeader className="bg-white py-3 fw-bold text-dark border-bottom d-flex align-items-center justify-content-between">
              <span>Sắp xếp khối trang chủ (Home Sections)</span>
              <span className="badge bg-light text-secondary border font-normal">Sắp xếp</span>
            </CCardHeader>
            <CCardBody className="p-3 d-flex flex-column justify-content-between">
              <div>
                <p className="text-muted text-xs mb-2">
                  Bật/tắt hiển thị các khối nội dung trang chủ
                </p>
                <div className="d-flex flex-column gap-1.5">
                  {homeSections.map((sec, idx) => (
                    <div
                      key={sec.id}
                      className="p-2 border rounded bg-light d-flex align-items-center justify-content-between"
                    >
                      <div className="d-flex align-items-center gap-2">
                        <span className="text-muted cursor-grab">⠿</span>
                        <span className="fw-semibold text-dark text-xs">{sec.name}</span>
                      </div>
                      <CFormSwitch
                        checked={sec.enabled}
                        onChange={(e) => {
                          const next = [...homeSections]
                          next[idx].enabled = e.target.checked
                          setHomeSections(next)
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-top mt-3">
                <CButton
                  color="light"
                  className="border w-100 text-secondary fw-semibold py-1.5"
                  onClick={() => toast.info('Thêm khối mới thành công!')}
                >
                  + Thêm khối nội dung mới
                </CButton>
              </div>
            </CCardBody>
          </CCard>
        </CCol>

        {/* Card 6: Banners & Assets */}
        <CCol md={4}>
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

                {newTheme?.image && (
                  <div>
                    <span className="form-label font-semibold text-dark small d-block mb-1">
                      Ảnh đại diện chiến dịch
                    </span>
                    <div
                      className="rounded border overflow-hidden bg-light mb-3"
                      style={{ height: '140px' }}
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
                  <span>{isSaving ? 'Đang lưu...' : 'Lưu Chiến Dịch Mới'}</span>
                </CButton>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* BOTTOM ROW: 3 CARDS (Colors, Effects & Background, Schedule) */}
      <CRow className="g-4 mb-4">
        {/* Card 7: Colors (Design Tokens) */}
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
                        style={{ width: '80px', fontSize: '11px' }}
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
                ))}
              </div>
            </CCardBody>
          </CCard>
        </CCol>

        {/* Card 8: Effects & Background Patterns */}
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

              <div className="mb-3">
                <label className="form-label font-semibold text-dark small mb-1">
                  Bộ nhận diện lễ hội theo mùa
                </label>
                <CFormSelect
                  size="sm"
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
                    backgroundColor: newTheme?.colors?.background || '#f7f7f7',
                    height: '80px',
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

        {/* Card 9: Schedule & Form Information */}
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
                  placeholder="VD: Tết IT 2027"
                  value={newTheme?.name || ''}
                  onChange={(e) => setNewTheme((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="mb-2">
                <label className="form-label font-semibold text-dark small mb-1">
                  Mã Code (Slug)
                </label>
                <CFormInput
                  size="sm"
                  placeholder="VD: tet_2027"
                  value={newTheme?.code || ''}
                  onChange={(e) => setNewTheme((prev) => ({ ...prev, code: e.target.value }))}
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

              <div>
                <label className="form-label font-semibold text-dark small mb-1">
                  Mô tả chi tiết
                </label>
                <CFormInput
                  size="sm"
                  placeholder="Mô tả chiến dịch..."
                  value={newTheme?.description || ''}
                  onChange={(e) =>
                    setNewTheme((prev) => ({ ...prev, description: e.target.value }))
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
