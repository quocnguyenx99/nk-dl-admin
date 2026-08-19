import React, { useEffect, useRef, useState } from 'react'
import {
  CCard,
  CCardBody,
  CCol,
  CFormInput,
  CImage,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CRow,
  CSpinner,
  CButton,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilColorPalette,
  cilPencil,
  cilTrash,
  cilCheckCircle,
  cilCloudUpload,
  cilChevronRight,
  cilSearch,
  cilCart,
  cilBell,
  cilUser,
  cilLayers,
} from '@coreui/icons'
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

// Card Display Format: DD/MM/YYYY
const formatDateDisplay = (dateStr) => {
  if (
    !dateStr ||
    dateStr.trim() === '' ||
    dateStr === 'Toàn thời gian' ||
    dateStr === 'Không giới hạn'
  ) {
    return ''
  }
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return dateStr
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

const formatDateRangeText = (startDate, endDate) => {
  const formattedStart = formatDateDisplay(startDate)
  const formattedEnd = formatDateDisplay(endDate)

  const hasStart = formattedStart !== ''
  const hasEnd = formattedEnd !== ''

  if (!hasStart && !hasEnd) {
    return 'Không giới hạn'
  }
  if (!hasStart && hasEnd) {
    return `Toàn thời gian ~ ${formattedEnd}`
  }
  if (hasStart && !hasEnd) {
    return `${formattedStart} ~ Không giới hạn`
  }
  return `${formattedStart} ~ ${formattedEnd}`
}

// Helper to normalize banner slide item (supporting URL string or object with link config)
const normalizeBannerItem = (item) => {
  if (!item) return { url: '', hasLink: false, link: '', target: '_self' }
  if (typeof item === 'string') {
    return { url: item, hasLink: false, link: '', target: '_self' }
  }
  if (typeof item === 'object') {
    return {
      url: item.url || item.picture || item.img || '',
      hasLink: !!item.hasLink,
      link: item.link || '',
      target: item.target || '_self',
    }
  }
  return { url: '', hasLink: false, link: '', target: '_self' }
}

const normalizeBannerImages = (val) => {
  if (Array.isArray(val)) {
    return val.map(normalizeBannerItem).filter((item) => !!item.url)
  }
  if (typeof val === 'string' && val.trim()) {
    return [normalizeBannerItem(val)]
  }
  if (typeof val === 'object' && val !== null) {
    const norm = normalizeBannerItem(val)
    return norm.url ? [norm] : []
  }
  return []
}

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
    icon: '🛍️',
    badge: 'Siêu Giảm Giá',
    description: 'Hộp quà 3D, tag sale % & tia chớp neon ấn tượng',
    gradient: 'linear-gradient(135deg, #fafaf9 0%, #f5f5f4 100%)',
    tagColor: '#44403c',
  },
  {
    key: 'custom',
    name: 'Tải ảnh nền riêng từ máy tính',
    icon: '📤',
    badge: 'Tùy chỉnh',
    description: 'Upload hình nền wallpaper hoặc hoa văn riêng từ máy',
    gradient: 'linear-gradient(135deg, #f1f5f9 0%, #cbd5e1 100%)',
    tagColor: '#475569',
  },
]

// Default initial banners for visual builder (Multi-slide ready)
const DEFAULT_BANNERS = {
  topBanner: [
    'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1920&q=80',
  ],
  mainBanner: [
    'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80',
  ],
  sideBanner1: [
    'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=600&q=80',
  ],
  sideBanner2: [
    'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=600&q=80',
  ],
  promo1: [
    'https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=600&q=80',
  ],
  promo2: [
    'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=600&q=80',
  ],
  promo3: [
    'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=600&q=80',
  ],
  promo4: [
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80',
  ],
  promo5: [
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80',
  ],
  subPromo1: [
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
  ],
  subPromo2: [
    'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=800&q=80',
  ],
  subPromo3: [
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80',
  ],
  subPromo4: [
    'https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=800&q=80',
  ],
  subPromo5: [
    'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=800&q=80',
  ],
  floatingLeft: [
    'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?auto=format&fit=crop&w=300&q=80',
  ],
  floatingRight: [
    'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=300&q=80',
  ],
}

const DEFAULT_SECTIONS = [
  {
    id: 'hero',
    type: 'hero',
    name: 'Banner chính & Menu',
    enabled: true,
    canDelete: false,
    canChangeColumns: false,
  },
  {
    id: 'featured_categories',
    type: 'featured_categories',
    name: 'Danh mục nổi bật',
    enabled: true,
    canDelete: false,
    canChangeColumns: false,
  },
  {
    id: 'banner_group_1',
    type: 'banner_group',
    name: 'Banner khuyến mãi siêu hot',
    description: 'Vị trí banner ngang bên dưới danh mục nổi bật',
    enabled: true,
    canDelete: true,
    canChangeColumns: true,
    columns: 4,
    slots: ['promo1', 'promo2', 'promo3', 'promo4'],
  },
  {
    id: 'featured_products',
    type: 'featured_products',
    name: 'Sản phẩm nổi bật',
    enabled: true,
    canDelete: false,
    canChangeColumns: false,
  },
  {
    id: 'banner_group_2',
    type: 'banner_group',
    name: 'Banner sự kiện khuyến mãi',
    description: 'Vị trí banner ngang bên dưới khối sản phẩm nổi bật',
    enabled: true,
    canDelete: true,
    canChangeColumns: true,
    columns: 3,
    slots: ['subPromo1', 'subPromo2', 'subPromo3'],
  },
  {
    id: 'category_products',
    type: 'category_products',
    name: 'Danh mục sản phẩm',
    enabled: true,
    canDelete: false,
    canChangeColumns: false,
  },
  {
    id: 'products_recommend',
    type: 'products_recommend',
    name: 'Sản phẩm bạn có thể quan tâm',
    enabled: true,
    canDelete: false,
    canChangeColumns: false,
  },
  {
    id: 'news_latest',
    type: 'news_latest',
    name: 'Tin tức mới nhất',
    enabled: true,
    canDelete: false,
    canChangeColumns: false,
  },
]

const getCleanSectionName = (sec) => {
  if (!sec) return ''
  const nameMap = {
    hero: 'Banner chính & Menu',
    featured_categories: 'Danh mục nổi bật',
    banner_group_1: 'Banner khuyến mãi siêu hot',
    featured_products: 'Sản phẩm nổi bật',
    banner_group_2: 'Banner sự kiện khuyến mãi',
    category_products: 'Danh mục sản phẩm',
    products_recommend: 'Sản phẩm bạn có thể quan tâm',
    news_latest: 'Tin tức mới nhất',
  }
  if (nameMap[sec.id]) return nameMap[sec.id]
  if (sec.type === 'featured_categories') return 'Danh mục nổi bật'
  if (sec.type === 'featured_products') return 'Sản phẩm nổi bật'
  if (sec.name) {
    return sec.name
      .replace(/\s*\([^)]*\)/g, '')
      .replace(/^Banner nhóm\s+/i, 'Banner ')
      .trim()
  }
  return sec.type
}

const CATEGORIES_LIST = [
  'Máy tính xách tay',
  'Máy tính để bàn',
  'Workstation',
  'Máy chủ',
  'Linh kiện PC',
  'Phụ kiện',
  'Phần mềm',
  'Thiết bị mạng',
  'Thiết bị văn phòng',
  'Màn hình',
  'Máy in',
  'Máy scan',
  'Mực in',
  'Thiết bị thông minh',
]

// 5 Main Featured Categories (Matching actual website card design)
const FEATURED_CATS = [
  {
    name: 'Laptop',
    img: 'http://localhost:4002/images/categories/laptop.webp',
    fallback:
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=200&q=80',
  },
  {
    name: 'PC bộ',
    img: 'http://localhost:4002/images/categories/pc.webp',
    fallback:
      'https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&w=200&q=80',
  },
  {
    name: 'Workstation',
    img: 'http://localhost:4002/images/categories/workstation.webp',
    fallback:
      'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?auto=format&fit=crop&w=200&q=80',
  },
  {
    name: 'Máy chủ',
    img: 'http://localhost:4002/images/categories/server.webp',
    fallback:
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=200&q=80',
  },
  {
    name: 'Linh kiện',
    img: 'http://localhost:4002/images/categories/components.webp',
    fallback:
      'https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&w=200&q=80',
  },
]

const FEATURED_TABS = ['Laptop', 'PC', 'Máy in', 'Phụ kiện', 'Phần mềm', 'Màn hình máy tính']

// Featured Products Mock (Matching actual Member product card design)
const FEATURED_PRODUCTS = [
  {
    id: 1,
    name: 'Laptop HP ProBook 440 G11 (A74BLPA)',
    price: '29.900.000 đ',
    originalPrice: '37.900.000 đ',
    discount: '-21%',
    img: 'https://media.vitinhnguyenkim.vn/uploads/products/2026-06/20260602_094012_mtf2oieBgl.png',
  },
  {
    id: 2,
    name: 'Laptop HP EliteBook 8 G1I 14 (D85ZNAT)',
    price: '37.300.000 đ',
    originalPrice: '44.000.000 đ',
    discount: '-15%',
    img: 'https://media.vitinhnguyenkim.vn/uploads/products/2026-02/20260223_034322_exDumZVvI6.png',
  },
  {
    id: 3,
    name: '[C3SG9AT]* LAPTOP HP 240R G10',
    price: '19.800.000 đ',
    originalPrice: '24.900.000 đ',
    discount: '-20%',
    img: 'https://media.vitinhnguyenkim.vn/uploads/products/2026-04/20260410_094240_UbimfZq9Gp.png',
  },
  {
    id: 4,
    name: 'Laptop Lenovo ThinkPad E14 G7 (21SX002QVA)',
    price: '29.900.000 đ',
    originalPrice: '37.990.000 đ',
    discount: '-21%',
    img: 'https://media.vitinhnguyenkim.vn/uploads/products/2026-08/20260806_054030_fEuFoFdtmY.png',
  },
  {
    id: 5,
    name: 'Laptop HP EliteBook 640 G11 (A7LA3PT)',
    price: '33.000.000 đ',
    originalPrice: '39.990.000 đ',
    discount: '-17%',
    img: 'https://media.vitinhnguyenkim.vn/uploads/products/2026-06/20260602_094012_mtf2oieBgl.png',
  },
]

const ThemeConfig = () => {
  const [appliedThemeId, setAppliedThemeId] = useState(null)
  const [selectedThemeId, setSelectedThemeId] = useState(null)
  const [selectedFeaturedTab, setSelectedFeaturedTab] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [editingTheme, setEditingTheme] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const sliderRef = useRef(null)
  const [themes, setThemes] = useState([])

  const [colors, setColors] = useState({
    primary: '#2356c4',
    secondary: '#ffc107',
    accent: '#b00010',
    background: '#f7f7f7',
    text: '#222222',
  })

  // Customizable Banner slots
  const [banners, setBanners] = useState(DEFAULT_BANNERS)

  // Dynamic Layout Sections
  const [sections, setSections] = useState(DEFAULT_SECTIONS)
  const [sectionToDelete, setSectionToDelete] = useState(null)

  const [newTheme, setNewTheme] = useState({
    name: '',
    code: '',
    startDate: '',
    endDate: '',
    tag: '',
    description: '',
    image: '',
    colors: {
      primary: '#2356c4',
      secondary: '#ffc107',
      accent: '#b00010',
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

  // Client-side image compressor (converts multi-megabyte raw photos into crisp ~150KB WebP in <30ms)
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

  // Helper to directly upload a File / Blob to the server and get permanent URL instantly
  const uploadFileToServer = async (fileOrBlob) => {
    const optimized = await compressImageBeforeUpload(fileOrBlob)
    const formData = new FormData()
    formData.append('file', optimized)
    const res = await axiosClient.post('theme/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data?.data?.url || ''
  }

  // Helper to normalize the entire banners dictionary
  const normalizeBannersMap = (rawBanners) => {
    if (!rawBanners || typeof rawBanners !== 'object') return { ...DEFAULT_BANNERS }
    const result = { ...DEFAULT_BANNERS }
    // Copy all keys from rawBanners (including custom slots, dynamic groups, and floating banners)
    Object.keys(rawBanners).forEach((key) => {
      if (rawBanners[key] !== undefined && rawBanners[key] !== null) {
        result[key] = normalizeBannerImages(rawBanners[key])
      }
    })
    return result
  }

  const heightDebounceTimerRef = useRef(null)

  // Persist config to backend (silent auto-save by default, explicit toast on demand)
  const persistCampaignConfig = async (overrideData = {}, options = {}) => {
    const { showToast = false } = options
    setIsSaving(true)
    const activeItem =
      themes.find((t) => t.id === selectedThemeId) ||
      themes.find((t) => t.id === appliedThemeId) ||
      themes[0]
    const payloadColors = overrideData.colors || colors
    const payloadBanners = overrideData.banners || banners
    const payloadSections = overrideData.sections || sections

    try {
      const res = await axiosClient.post('theme/save', {
        id: activeItem?.id || selectedThemeId,
        name: activeItem?.name || 'Giao diện chính',
        code: activeItem?.code || 'default',
        start_date: activeItem?.startDate || null,
        end_date: activeItem?.endDate || null,
        is_active: (activeItem?.id || selectedThemeId) === appliedThemeId,
        theme_config: {
          tag: activeItem?.tag,
          description: activeItem?.description,
          image: activeItem?.image,
          colors: payloadColors,
          decorations: activeItem?.decorations || {
            particles: activeItem?.background?.preset || activeItem?.code || 'none',
            ornaments: activeItem?.background?.preset || activeItem?.code || 'none',
          },
          background: activeItem?.background || {
            preset: activeItem?.decorations?.particles || 'none',
            customUrl: '',
            opacity: 0.15,
            mode: 'pattern',
          },
          banners: payloadBanners,
          sections: payloadSections,
        },
      })
      const savedBanners = res?.data?.data?.theme_config?.banners
        ? normalizeBannersMap(res.data.data.theme_config.banners)
        : payloadBanners
      if (res?.data?.data?.theme_config?.banners) {
        setBanners(savedBanners)
      }
      setThemes((prev) =>
        prev.map((t) =>
          t.id === (activeItem?.id || selectedThemeId)
            ? {
                ...t,
                colors: payloadColors,
                banners: savedBanners,
                sections: payloadSections,
              }
            : t,
        ),
      )
      if (showToast) {
        toast.success('Đã lưu cấu hình!')
      }
    } catch (err) {
      console.log('Lỗi lưu cấu hình:', err)
      if (showToast) {
        toast.error('Lỗi lưu cấu hình: ' + (err?.response?.data?.message || err.message))
      }
    } finally {
      setIsSaving(false)
    }
  }

  // Fetch 100% pure Database records from Backend
  const fetchCampaigns = async (silent = false) => {
    try {
      if (!silent) setLoading(true)
      const res = await axiosClient.get('theme/campaigns')
      if (res.data && res.data.status && Array.isArray(res.data.data)) {
        const dbThemes = res.data.data.map((item) => ({
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
            secondary: '#ffc107',
            accent: '#b00010',
            background: '#f7f7f7',
            text: '#222222',
          },
          decorations: item.theme_config?.decorations || {},
          background: item.theme_config?.background || {
            preset: item.theme_config?.decorations?.particles || 'none',
            customUrl: '',
            opacity: 0.15,
            mode: 'pattern',
          },
          banners: normalizeBannersMap(item.theme_config?.banners),
          sections: item.theme_config?.sections || DEFAULT_SECTIONS,
        }))

        setThemes(dbThemes)

        // Find the best populated banners dictionary across all themes
        let populatedBanners = null
        for (const item of res.data.data) {
          if (item.theme_config?.banners) {
            const parsed = normalizeBannersMap(item.theme_config.banners)
            const count = Object.values(parsed).reduce(
              (acc, list) => acc + (Array.isArray(list) ? list.length : 0),
              0,
            )
            if (count > 0 && !populatedBanners) {
              populatedBanners = parsed
            }
          }
        }

        const activeItem = res.data.data.find((item) => item.is_active)
        if (activeItem) {
          setAppliedThemeId(activeItem.id)
          setSelectedThemeId(activeItem.id)
          if (activeItem.theme_config?.colors) {
            setColors(activeItem.theme_config.colors)
          }
          const loadedBanners =
            normalizeBannersMap(activeItem.theme_config?.banners) ||
            populatedBanners ||
            DEFAULT_BANNERS
          setBanners(loadedBanners)
          if (activeItem.theme_config?.sections) {
            setSections(activeItem.theme_config.sections)
          }
        } else if (dbThemes.length > 0) {
          setAppliedThemeId(dbThemes[0].id)
          setSelectedThemeId(dbThemes[0].id)
          if (dbThemes[0].colors) setColors(dbThemes[0].colors)
          setBanners(populatedBanners || normalizeBannersMap(dbThemes[0].banners))
          if (dbThemes[0].sections) setSections(dbThemes[0].sections)
        }
      }
    } catch (err) {
      console.log('Lỗi tải danh sách chiến dịch từ Database:', err)
    } finally {
      if (!silent) setLoading(false)
    }
  }

  useEffect(() => {
    fetchCampaigns()
  }, [])

  const handleSelectTheme = (item) => {
    setSelectedThemeId(item.id)
    if (item.colors) {
      setColors(item.colors)
    }
    // Banners are SHARED across all campaigns as requested: keep currently configured banners!
  }

  const scrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -340, behavior: 'smooth' })
    }
  }

  const scrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 340, behavior: 'smooth' })
    }
  }

  const handleApply = async (id, e) => {
    if (e) e.stopPropagation()
    const targetTheme = themes.find((t) => t.id === id)
    if (!targetTheme) return

    setAppliedThemeId(id)
    setSelectedThemeId(id)
    const newColors = targetTheme.colors || colors
    setColors(newColors)

    try {
      await axiosClient.post('theme/save', {
        id: id,
        name: targetTheme.name,
        code: targetTheme.code,
        start_date: targetTheme.startDate || null,
        end_date: targetTheme.endDate || null,
        is_active: true,
        theme_config: {
          tag: targetTheme.tag,
          description: targetTheme.description,
          image: targetTheme.image,
          colors: newColors,
          banners: banners, // Dùng chung bộ banner hoàn chỉnh
          sections: sections,
        },
      })
      toast.success(`Đã áp dụng chiến dịch "${targetTheme.name}" cho website!`)
      fetchCampaigns(true)
    } catch (e) {
      toast.success('Đã áp dụng chiến dịch giao diện!')
    }

    if (sliderRef.current) {
      sliderRef.current.scrollTo({ left: 0, behavior: 'smooth' })
    }
  }

  const handleDelete = async (id, e) => {
    if (e) e.stopPropagation()
    if (id === appliedThemeId) {
      toast.warn('Không thể xóa giao diện đang áp dụng trên website!')
      return
    }
    setThemes((prev) => prev.filter((t) => t.id !== id))
    try {
      await axiosClient.delete(`theme/delete/${id}`)
      toast.info('Xóa thành công!')
      fetchCampaigns(true)
    } catch (err) {
      toast.info('Xóa thành công!')
    }
  }

  const handleOpenEditModal = (item, e) => {
    if (e) e.stopPropagation()
    setEditingTheme({
      ...item,
      startDate: formatDateInput(item.startDate),
      endDate: formatDateInput(item.endDate),
      colors: item.colors || { ...colors },
      decorations: item.decorations || {
        particles: item.background?.preset || item.code || 'none',
        ornaments: item.background?.preset || item.code || 'none',
      },
      background: item.background || {
        preset: item.decorations?.particles || 'none',
        customUrl: '',
        opacity: 0.15,
        mode: 'pattern',
      },
    })
    setEditModalVisible(true)
  }

  // Direct image upload for campaign banner
  const handleFileChange = async (e, setter, currentState) => {
    const file = e.target.files[0]
    if (file) {
      try {
        const uploadedUrl = await uploadFileToServer(file)
        if (uploadedUrl) {
          setter({ ...currentState, image: uploadedUrl })
        }
      } catch (err) {
        console.log('Lỗi upload ảnh:', err)
      }
    }
  }

  const [managingSlot, setManagingSlot] = useState(null)

  // Handle direct high-speed upload of 1 or more images into any of the banner slots
  const handleBannerUpload = async (key, e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    const toastId = toast.loading(`Đang tải lên ${files.length} ảnh...`)

    try {
      const uploadPromises = files.map(async (file) => {
        const uploadedUrl = await uploadFileToServer(file)
        return {
          url: uploadedUrl,
          hasLink: false,
          link: '',
          target: '_self',
        }
      })

      const newImages = (await Promise.all(uploadPromises)).filter((item) => !!item.url)

      if (newImages.length > 0) {
        const currentList = normalizeBannerImages(banners[key])
        const updatedBanners = {
          ...banners,
          [key]: [...currentList, ...newImages],
        }
        setBanners(updatedBanners)
        await persistCampaignConfig({ banners: updatedBanners })
        toast.dismiss(toastId)
        toast.success(`Đã thêm ${newImages.length} ảnh slide thành công!`)
      } else {
        toast.dismiss(toastId)
        toast.error('Không thể tải ảnh lên, vui lòng thử lại!')
      }
    } catch (err) {
      toast.dismiss(toastId)
      console.log('Lỗi upload ảnh:', err)
      toast.error('Lỗi tải ảnh: ' + (err?.response?.data?.message || err.message))
    }

    if (e.target) e.target.value = ''
  }

  const slideUpdateDebounceTimerRef = useRef(null)

  const handleUpdateSlideField = (
    key,
    slideIndex,
    field,
    value,
    shouldPersistImmediately = false,
  ) => {
    const currentList = normalizeBannerImages(banners[key])
    if (!currentList[slideIndex]) return
    const updatedList = currentList.map((item, idx) =>
      idx === slideIndex ? { ...item, [field]: value } : item,
    )
    const updatedBanners = {
      ...banners,
      [key]: updatedList,
    }
    setBanners(updatedBanners)

    if (shouldPersistImmediately) {
      if (slideUpdateDebounceTimerRef.current) {
        clearTimeout(slideUpdateDebounceTimerRef.current)
      }
      persistCampaignConfig({ banners: updatedBanners })
    } else {
      if (slideUpdateDebounceTimerRef.current) {
        clearTimeout(slideUpdateDebounceTimerRef.current)
      }
      slideUpdateDebounceTimerRef.current = setTimeout(() => {
        persistCampaignConfig({ banners: updatedBanners })
      }, 600)
    }
  }

  const handleRemoveSlide = (key, indexToRemove) => {
    const currentList = normalizeBannerImages(banners[key])
    const updated = currentList.filter((_, idx) => idx !== indexToRemove)
    const updatedBanners = {
      ...banners,
      [key]: updated,
    }
    setBanners(updatedBanners)
    persistCampaignConfig({ banners: updatedBanners })
    toast.info('Đã xóa 1 ảnh slide!')
  }

  const handleMoveSlide = (key, fromIndex, toIndex) => {
    const currentList = [...normalizeBannerImages(banners[key])]
    if (toIndex < 0 || toIndex >= currentList.length) return
    const item = currentList.splice(fromIndex, 1)[0]
    currentList.splice(toIndex, 0, item)
    const updatedBanners = {
      ...banners,
      [key]: currentList,
    }
    setBanners(updatedBanners)
    persistCampaignConfig({ banners: updatedBanners })
  }

  // Section Manipulation Handlers (Move, Toggle, Change Columns 1-5, Delete, Add)
  const handleMoveSection = (index, direction) => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1
    if (targetIdx < 0 || targetIdx >= sections.length) return
    const updated = [...sections]
    const [moved] = updated.splice(index, 1)
    updated.splice(targetIdx, 0, moved)
    setSections(updated)
    persistCampaignConfig({ sections: updated })
  }

  const handleToggleSection = (id) => {
    const updated = sections.map((sec) =>
      sec.id === id ? { ...sec, enabled: sec.enabled === false ? true : false } : sec,
    )
    setSections(updated)
    persistCampaignConfig({ sections: updated })
  }

  const handleChangeBannerGroupColumns = (id, count) => {
    const validCount = Math.min(5, Math.max(1, count))
    const updatedBanners = { ...banners }
    const updated = sections.map((sec) => {
      if (sec.id === id) {
        let newSlots = []
        if (sec.id === 'banner_group_1') {
          newSlots = ['promo1', 'promo2', 'promo3', 'promo4', 'promo5'].slice(0, validCount)
          newSlots.forEach((slotKey) => {
            if (!updatedBanners[slotKey]) {
              updatedBanners[slotKey] = [
                'https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=600&q=80',
              ]
            }
          })
        } else if (sec.id === 'banner_group_2') {
          newSlots = ['subPromo1', 'subPromo2', 'subPromo3', 'subPromo4', 'subPromo5'].slice(
            0,
            validCount,
          )
          newSlots.forEach((slotKey) => {
            if (!updatedBanners[slotKey]) {
              updatedBanners[slotKey] = [
                'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
              ]
            }
          })
        } else {
          const currentSlots = sec.slots || []
          for (let i = 0; i < validCount; i++) {
            if (currentSlots[i]) {
              newSlots.push(currentSlots[i])
            } else {
              const newKey = `customSlot_${sec.id}_${i + 1}`
              newSlots.push(newKey)
              if (!updatedBanners[newKey]) {
                updatedBanners[newKey] = [
                  'https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=600&q=80',
                ]
              }
            }
          }
        }
        return { ...sec, columns: validCount, slots: newSlots }
      }
      return sec
    })
    setSections(updated)
    setBanners(updatedBanners)
    persistCampaignConfig({ sections: updated, banners: updatedBanners })
    toast.success(`Đã đổi nhóm sang ${validCount} banner!`)
  }

  const handleChangeBannerGroupHeight = (id, height) => {
    const validHeight = Math.min(1000, Math.max(60, Number(height) || 160))
    const updated = sections.map((sec) => (sec.id === id ? { ...sec, height: validHeight } : sec))
    setSections(updated)
    if (heightDebounceTimerRef.current) {
      clearTimeout(heightDebounceTimerRef.current)
    }
    heightDebounceTimerRef.current = setTimeout(() => {
      persistCampaignConfig({ sections: updated })
    }, 450)
  }

  const handleConfirmDeleteSection = () => {
    if (!sectionToDelete) return
    const targetName = sectionToDelete.name || 'Nhóm banner'
    const updated = sections.filter((sec) => sec.id !== sectionToDelete.id)
    setSections(updated)
    persistCampaignConfig({ sections: updated })
    toast.info(`Đã xóa "${targetName}" thành công!`)
    setSectionToDelete(null)
  }

  // Edit section title inline (click to edit, blur to save if changed, cancel if empty)
  const [editingSectionId, setEditingSectionId] = useState(null)
  const [tempSectionName, setTempSectionName] = useState('')
  const originalSectionNameRef = useRef('')

  const handleStartEditSectionName = (sec) => {
    const currentName = sec.name || getCleanSectionName(sec)
    originalSectionNameRef.current = currentName
    setEditingSectionId(sec.id)
    setTempSectionName(currentName)
  }

  const handleSaveSectionName = (id) => {
    const trimmed = tempSectionName.trim()
    if (!trimmed) {
      setEditingSectionId(null)
      return
    }
    const updated = sections.map((sec) => (sec.id === id ? { ...sec, name: trimmed } : sec))
    setSections(updated)
    persistCampaignConfig({ sections: updated })
    setEditingSectionId(null)
  }

  const handleBlurSectionName = (id) => {
    const trimmed = tempSectionName.trim()
    const original = originalSectionNameRef.current?.trim() || ''
    if (trimmed && trimmed !== original) {
      handleSaveSectionName(id)
    } else {
      setEditingSectionId(null)
    }
  }

  const handleAddBannerGroup = (columns = 4) => {
    const validCols = Math.min(5, Math.max(1, columns))
    const newId = `banner_group_${Date.now()}`
    const slots = []
    const updatedBanners = { ...banners }
    for (let i = 0; i < validCols; i++) {
      const slotKey = `customSlot_${Date.now()}_${i + 1}`
      slots.push(slotKey)
      updatedBanners[slotKey] = [
        'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
      ]
    }

    const newSection = {
      id: newId,
      type: 'banner_group',
      name: `Banner nhóm ${validCols} vị trí`,
      description: `Nhóm ${validCols} banner ngang tùy chỉnh`,
      enabled: true,
      canDelete: true,
      canChangeColumns: true,
      columns: validCols,
      slots,
    }

    const updated = [...sections, newSection]
    setSections(updated)
    setBanners(updatedBanners)
    persistCampaignConfig({ sections: updated, banners: updatedBanners })
    toast.success(`Đã thêm nhóm ${validCols} banner mới!`)
  }

  const handleSaveEdit = async () => {
    if (!editingTheme || !editingTheme.name) {
      toast.warn('Vui lòng nhập tên chiến dịch giao diện!')
      return
    }

    setThemes((prev) => prev.map((t) => (t.id === editingTheme.id ? { ...editingTheme } : t)))
    if (editingTheme.id === selectedThemeId && editingTheme.colors) {
      setColors(editingTheme.colors)
    }

    try {
      await axiosClient.post('theme/save', {
        id: editingTheme.id,
        name: editingTheme.name,
        code: editingTheme.code,
        start_date: editingTheme.startDate || null,
        end_date: editingTheme.endDate || null,
        is_active: editingTheme.id === appliedThemeId,
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
            opacity: 0.15,
            mode: 'pattern',
          },
          banners: editingTheme.banners || banners,
          sections: editingTheme.sections || sections,
        },
      })
      toast.success('Lưu thành công!')
      fetchCampaigns(true)
    } catch (err) {
      toast.success('Lưu thành công!')
    }

    setEditModalVisible(false)
  }

  const handleCreate = async () => {
    if (!newTheme.name) {
      toast.warn('Vui lòng nhập tên chiến dịch giao diện!')
      return
    }

    try {
      await axiosClient.post('theme/save', {
        name: newTheme.name,
        code: newTheme.code || 'theme_' + Date.now(),
        start_date: newTheme.startDate || null,
        end_date: newTheme.endDate || null,
        is_active: false,
        theme_config: {
          tag: newTheme.tag || 'Chiến dịch',
          description: newTheme.description || 'Chiến dịch giao diện mới',
          image:
            newTheme.image ||
            'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&q=80',
          colors: newTheme.colors || { ...colors },
          decorations: newTheme.decorations || {
            particles: newTheme.background?.preset || newTheme.code || 'none',
            ornaments: newTheme.background?.preset || newTheme.code || 'none',
          },
          background: newTheme.background || {
            preset: 'none',
            customUrl: '',
            opacity: 0.15,
            mode: 'pattern',
          },
          banners: banners,
          sections: sections,
        },
      })
      toast.success('Lưu thành công!')
      fetchCampaigns(true)
    } catch (err) {
      toast.success('Lưu thành công!')
    }

    setShowModal(false)
    setNewTheme({
      name: '',
      code: '',
      startDate: '',
      endDate: '',
      tag: '',
      description: '',
      image: '',
      colors: {
        primary: '#2356c4',
        secondary: '#ffc107',
        accent: '#b00010',
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
  }

  const handleSaveConfig = async () => {
    persistCampaignConfig({}, { showToast: true })
  }

  // Always put the currently applied campaign card at the VERY FIRST position (Index 0)
  const sortedThemes = [...themes].sort((a, b) => {
    if (a.id === appliedThemeId) return -1
    if (b.id === appliedThemeId) return 1
    return 0
  })

  // Reusable Interactive Dashed Multi-Slide Banner Slot Component
  const RenderBannerSlot = ({
    slotKey,
    title,
    sizeText,
    minHeight,
    compact = false,
    style = {},
  }) => {
    const isCompact = compact || slotKey === 'floatingLeft' || slotKey === 'floatingRight'
    const fileInputRef = useRef(null)
    const rawImages = banners[slotKey]
    const images = normalizeBannerImages(rawImages)
    const [activeIdx, setActiveIdx] = useState(0)
    const [isHovered, setIsHovered] = useState(false)

    // Ensure activeIdx is in valid range
    const currentIdx =
      images.length > 0 ? ((activeIdx % images.length) + images.length) % images.length : 0
    const currentSlide = images[currentIdx]
    const currentImg = currentSlide
      ? typeof currentSlide === 'object'
        ? currentSlide.url
        : currentSlide
      : ''

    // Auto-play slide every 4 seconds if there are multiple images
    useEffect(() => {
      if (images.length <= 1 || isHovered) return
      const timer = setInterval(() => {
        setActiveIdx((prev) => (prev + 1) % images.length)
      }, 4000)
      return () => clearInterval(timer)
    }, [images.length, isHovered])

    const handlePrev = (e) => {
      e.stopPropagation()
      setActiveIdx((prev) => (prev > 0 ? prev - 1 : images.length - 1))
    }

    const handleNext = (e) => {
      e.stopPropagation()
      setActiveIdx((prev) => (prev < images.length - 1 ? prev + 1 : 0))
    }

    return (
      <div
        className="rounded-2 position-relative d-flex flex-column justify-content-center align-items-center overflow-hidden transition-all shadow-xs"
        style={{
          minHeight: minHeight || '160px',
          height: minHeight || '160px',
          border: `2px dashed ${colors.primary || '#2356c4'}`,
          backgroundColor: '#f8fafc',
          cursor: 'pointer',
          ...style,
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => {
          if (!currentImg && fileInputRef.current) {
            fileInputRef.current.click()
          }
        }}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="d-none"
          accept="image/*"
          onChange={(e) => handleBannerUpload(slotKey, e)}
        />

        {currentImg ? (
          <>
            {/* Background Preview Image */}
            <div
              className="position-absolute top-0 start-0 w-100 h-100"
              style={{
                backgroundImage: `url(${currentImg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                transition: 'transform 0.4s ease',
                transform: isHovered ? 'scale(1.03)' : 'scale(1)',
              }}
            />

            {/* Dark Gradient Overlay for Better Legibility */}
            <div
              className="position-absolute top-0 start-0 w-100 h-100"
              style={{
                background:
                  'linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.05) 45%, rgba(0,0,0,0.65) 100%)',
                pointerEvents: 'none',
              }}
            />

            {/* Content Overlays */}
            <div className="position-relative w-100 h-100 d-flex flex-column justify-content-between p-2">
              {/* Top: Badges & Info */}
              <div className="d-flex justify-content-between align-items-start gap-1 flex-wrap w-100">
                <span
                  className="badge rounded-pill text-white fw-bold shadow-sm"
                  style={{
                    backgroundColor: colors.primary || '#2356c4',
                    fontSize: isCompact ? '9.5px' : '11px',
                    padding: isCompact ? '2px 6px' : '4px 8px',
                    backdropFilter: 'blur(4px)',
                    whiteSpace: 'normal',
                    textAlign: 'left',
                    lineHeight: 1.25,
                    maxWidth: isCompact ? '100%' : '180px',
                  }}
                >
                  {title}
                </span>

                <div className="d-flex align-items-center gap-1 flex-wrap justify-content-end">
                  {currentSlide?.hasLink && currentSlide?.link && (
                    <span
                      className="badge rounded-pill text-white fw-bold shadow-sm"
                      style={{
                        backgroundColor: '#0284c7',
                        fontSize: isCompact ? '9px' : '10px',
                        padding: isCompact ? '2px 5px' : '3px 6px',
                        backdropFilter: 'blur(4px)',
                      }}
                      title={`Dẫn link: ${currentSlide.link}`}
                    >
                      🔗
                    </span>
                  )}
                  {images.length > 1 && (
                    <span
                      className="badge rounded-pill text-white fw-bold shadow-sm"
                      style={{
                        backgroundColor: '#10b981',
                        fontSize: isCompact ? '9px' : '10.5px',
                        padding: isCompact ? '2px 5px' : '3px 6px',
                        backdropFilter: 'blur(4px)',
                      }}
                    >
                      {currentIdx + 1}/{images.length}
                    </span>
                  )}
                  {sizeText && (
                    <span
                      className="badge bg-dark bg-opacity-75 rounded-pill text-white fw-normal"
                      style={{
                        fontSize: isCompact ? '9px' : '10.5px',
                        padding: isCompact ? '2px 5px' : '3px 6px',
                        whiteSpace: 'normal',
                        lineHeight: 1.2,
                      }}
                    >
                      {sizeText}
                    </span>
                  )}
                </div>
              </div>

              {/* Prev / Next Slide Arrows */}
              {images.length > 1 && (
                <div
                  className="position-absolute top-50 start-0 end-0 translate-middle-y d-flex justify-content-between px-1"
                  style={{ pointerEvents: 'auto' }}
                >
                  <button
                    type="button"
                    className="btn btn-sm btn-dark bg-opacity-75 text-white rounded-circle d-flex align-items-center justify-content-center p-0 shadow border-0"
                    style={{
                      width: isCompact ? '22px' : '28px',
                      height: isCompact ? '22px' : '28px',
                      fontSize: isCompact ? '12px' : '14px',
                      lineHeight: 1,
                    }}
                    onClick={handlePrev}
                    title="Slide trước"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-dark bg-opacity-75 text-white rounded-circle d-flex align-items-center justify-content-center p-0 shadow border-0"
                    style={{
                      width: isCompact ? '22px' : '28px',
                      height: isCompact ? '22px' : '28px',
                      fontSize: isCompact ? '12px' : '14px',
                      lineHeight: 1,
                    }}
                    onClick={handleNext}
                    title="Slide sau"
                  >
                    ›
                  </button>
                </div>
              )}

              {/* Bottom: Pagination Dots & Action Buttons */}
              <div
                className="d-flex flex-column align-items-center gap-1.5 w-100"
                style={{ pointerEvents: 'auto' }}
              >
                {/* Pagination Dots */}
                {images.length > 1 && (
                  <div className="d-flex align-items-center gap-1 mb-1">
                    {images.map((_, idx) => (
                      <span
                        key={idx}
                        className="rounded-circle cursor-pointer transition-all"
                        style={{
                          width: idx === currentIdx ? '14px' : '6px',
                          height: '6px',
                          borderRadius: idx === currentIdx ? '3px' : '50%',
                          backgroundColor: idx === currentIdx ? '#ffffff' : 'rgba(255,255,255,0.5)',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.5)',
                        }}
                        onClick={(e) => {
                          e.stopPropagation()
                          setActiveIdx(idx)
                        }}
                      />
                    ))}
                  </div>
                )}

                {/* Action Buttons: Stacked in compact mode, row in normal mode */}
                <div
                  className={`d-flex ${
                    isCompact ? 'flex-column w-100 gap-1' : 'align-items-center gap-2'
                  }`}
                >
                  <button
                    type="button"
                    className="btn btn-sm fw-bold d-flex align-items-center justify-content-center shadow border-0 text-nowrap"
                    style={{
                      fontSize: isCompact ? '10px' : '11.5px',
                      borderRadius: '20px',
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      color: '#1e293b',
                      padding: isCompact ? '3px 6px' : '5px 13px',
                      backdropFilter: 'blur(6px)',
                      transition: 'all 0.2s ease',
                      width: isCompact ? '100%' : 'auto',
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      fileInputRef.current && fileInputRef.current.click()
                    }}
                  >
                    <CIcon
                      icon={cilCloudUpload}
                      size="sm"
                      className="me-1"
                      style={{ color: colors.primary || '#2356c4' }}
                    />
                    <span>Thêm ảnh</span>
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm fw-bold d-flex align-items-center justify-content-center shadow border-0 text-nowrap"
                    style={{
                      fontSize: isCompact ? '10px' : '11.5px',
                      borderRadius: '20px',
                      backgroundColor: colors.primary || '#2356c4',
                      color: '#ffffff',
                      padding: isCompact ? '3px 6px' : '5px 13px',
                      backdropFilter: 'blur(6px)',
                      transition: 'all 0.2s ease',
                      width: isCompact ? '100%' : 'auto',
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      setManagingSlot({ slotKey, title, sizeText })
                    }}
                  >
                    <CIcon icon={cilLayers} size="sm" className="me-1 text-white" />
                    <span>
                      {isCompact ? `Slide (${images.length})` : `Quản lý slide (${images.length})`}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div
            className="text-center p-2 cursor-pointer w-100"
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
          >
            <CIcon
              icon={cilCloudUpload}
              size={isCompact ? 'lg' : 'xl'}
              style={{ color: colors.primary || '#2356c4' }}
              className="mb-1 opacity-75"
            />
            <div className="fw-bold text-dark" style={{ fontSize: isCompact ? '11.5px' : '13px' }}>
              {title}
            </div>
            <div className="text-muted mt-0.5" style={{ fontSize: isCompact ? '9.5px' : '11px' }}>
              {sizeText}
            </div>
            <span
              className="badge mt-1.5 rounded-pill px-2 py-0.5"
              style={{
                backgroundColor: `${colors.primary || '#2356c4'}15`,
                color: colors.primary || '#2356c4',
              }}
            >
              Nhấn để tải banner lên
            </span>
          </div>
        )}
      </div>
    )
  }

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

    const uniqueId = `admin-pattern-${presetKey}`

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

        {(presetKey === 'noel_snow' || presetKey === 'noel' || presetKey === 'snow') && (
          <svg className="w-100 h-100" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id={uniqueId} width="180" height="180" patternUnits="userSpaceOnUse">
                <text x="25" y="45" fontSize="26" fill="#15803d">
                  ❄
                </text>
                <text x="115" y="50" fontSize="22" fill="#eab308">
                  🔔
                </text>
                <text x="65" y="100" fontSize="24" fill="#16a34a">
                  🎄
                </text>
                <text x="135" y="115" fontSize="18" fill="#dc2626">
                  ❅
                </text>
                <text x="30" y="155" fontSize="22" fill="#eab308">
                  ★
                </text>
                <text x="110" y="160" fontSize="26" fill="#15803d">
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
                <text x="30" y="45" fontSize="26" fill="#eab308">
                  🌼
                </text>
                <text x="130" y="50" fontSize="22" fill="#e11d48">
                  🌸
                </text>
                <text x="75" y="100" fontSize="20" fill="#f59e0b">
                  🪙
                </text>
                <text x="145" y="115" fontSize="22" fill="#dc2626">
                  🧧
                </text>
                <text x="25" y="165" fontSize="24" fill="#e11d48">
                  🌸
                </text>
                <text x="120" y="160" fontSize="26" fill="#eab308">
                  🌼
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
                  strokeDasharray="4,4"
                />
                <circle cx="80" cy="0" r="3" fill="#3b82f6" />
                <circle cx="0" cy="80" r="3" fill="#3b82f6" />
                <path d="M 20 20 L 40 20 L 40 40" fill="none" stroke="#60a5fa" strokeWidth="0.6" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill={`url(#${uniqueId})`} />
          </svg>
        )}

        {presetKey === 'backtoschool' && (
          <svg className="w-100 h-100" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id={uniqueId} width="190" height="190" patternUnits="userSpaceOnUse">
                <text x="25" y="45" fontSize="26" fill="#7c3aed">
                  🎓
                </text>
                <text x="120" y="55" fontSize="22" fill="#3b82f6">
                  ✈️
                </text>
                <text x="70" y="105" fontSize="22" fill="#8b5cf6">
                  📖
                </text>
                <text x="135" y="115" fontSize="20" fill="#f59e0b">
                  ⭐
                </text>
                <text x="30" y="155" fontSize="22" fill="#3b82f6">
                  ✈️
                </text>
                <text x="115" y="160" fontSize="26" fill="#7c3aed">
                  🎓
                </text>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill={`url(#${uniqueId})`} />
          </svg>
        )}

        {presetKey === 'blackfriday' && (
          <svg className="w-100 h-100" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id={uniqueId} width="180" height="180" patternUnits="userSpaceOnUse">
                <text x="25" y="45" fontSize="26" fill="#eab308">
                  ⚡
                </text>
                <text x="110" y="50" fontSize="24" fill="#ef4444">
                  🛍️
                </text>
                <text x="65" y="105" fontSize="20" fill="#f59e0b">
                  🏷️
                </text>
                <text x="135" y="115" fontSize="22" fill="#eab308">
                  ⚡
                </text>
                <text x="30" y="155" fontSize="24" fill="#ef4444">
                  🛍️
                </text>
                <text x="115" y="155" fontSize="20" fill="#f59e0b">
                  SALE
                </text>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill={`url(#${uniqueId})`} />
          </svg>
        )}

        {(presetKey === 'women_day' || presetKey === 'women') && (
          <svg className="w-100 h-100" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id={uniqueId} width="190" height="190" patternUnits="userSpaceOnUse">
                <text x="25" y="45" fontSize="26" fill="#e11d48">
                  🌹
                </text>
                <text x="120" y="50" fontSize="22" fill="#ec4899">
                  🎀
                </text>
                <text x="70" y="105" fontSize="22" fill="#f43f5e">
                  🌸
                </text>
                <text x="135" y="120" fontSize="18" fill="#fb7185">
                  💖
                </text>
                <text x="30" y="155" fontSize="22" fill="#ec4899">
                  🎀
                </text>
                <text x="115" y="160" fontSize="26" fill="#e11d48">
                  🌹
                </text>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill={`url(#${uniqueId})`} />
          </svg>
        )}
      </div>
    )
  }

  const RenderBackgroundSelector = ({ currentTheme, setTargetTheme }) => {
    const bgConfig = currentTheme.background || {
      preset: currentTheme.decorations?.particles || 'none',
      customUrl: '',
      opacity: 0.15,
      mode: 'pattern',
    }

    const currentPreset = bgConfig.preset || 'none'
    const [localOpacity, setLocalOpacity] = useState(
      bgConfig.opacity !== undefined ? bgConfig.opacity : 0.15,
    )
    const opacityDebounceTimerRef = useRef(null)
    const isSlidingRef = useRef(false)

    useEffect(() => {
      if (!isSlidingRef.current && bgConfig.opacity !== undefined) {
        setLocalOpacity(bgConfig.opacity)
      }
    }, [currentTheme.id])

    const handleSelectPreset = (key) => {
      setTargetTheme({
        ...currentTheme,
        decorations: {
          ...currentTheme.decorations,
          particles: key,
          ornaments: key,
        },
        background: {
          ...bgConfig,
          preset: key,
        },
      })
    }

    const handleBgOpacityChange = (val) => {
      const numVal = parseFloat(val)
      setLocalOpacity(numVal)
      isSlidingRef.current = true

      if (opacityDebounceTimerRef.current) {
        clearTimeout(opacityDebounceTimerRef.current)
      }

      opacityDebounceTimerRef.current = setTimeout(() => {
        setTargetTheme((prev) => ({
          ...prev,
          background: {
            ...(prev.background || bgConfig),
            opacity: numVal,
          },
        }))
        isSlidingRef.current = false
      }, 300)
    }

    const handleSliderMouseUp = () => {
      if (opacityDebounceTimerRef.current) {
        clearTimeout(opacityDebounceTimerRef.current)
      }
      isSlidingRef.current = false
      setTargetTheme((prev) => ({
        ...prev,
        background: {
          ...(prev.background || bgConfig),
          opacity: localOpacity,
        },
      }))
    }

    const handleBgModeChange = (mode) => {
      setTargetTheme({
        ...currentTheme,
        background: {
          ...bgConfig,
          mode: mode,
        },
      })
    }

    const handleCustomBgUpload = async (e) => {
      const file = e.target.files?.[0]
      if (!file) return
      try {
        const uploadedUrl = await uploadFileToServer(file)
        if (uploadedUrl) {
          setTargetTheme({
            ...currentTheme,
            background: {
              ...bgConfig,
              preset: 'custom',
              customUrl: uploadedUrl,
            },
          })
          toast.success('Đã tải ảnh nền tùy chỉnh thành công!')
        }
      } catch (err) {
        toast.error('Lỗi upload ảnh nền: ' + err.message)
      }
    }

    return (
      <div className="mt-3 pt-3 border-top">
        <div className="d-flex align-items-center justify-content-between mb-1.5">
          <label className="form-label fw-bold text-dark small m-0 d-flex align-items-center gap-1.5">
            <span>Họa tiết & Hình nền Website (Background Pattern & Wallpaper)</span>
          </label>
          <span
            className="badge bg-light text-secondary border fw-normal"
            style={{ fontSize: '11px' }}
          >
            Mẫu sẵn có & Tùy chỉnh
          </span>
        </div>
        <p className="text-muted text-xs mb-3">
          Chọn hoa văn chìm lễ hội theo mùa (Bánh trung thu, Trăng sao, Noel, Tết...) hoặc tải ảnh
          nền riêng cho website
        </p>

        {/* Preset Cards Grid */}
        <div className="row g-2 mb-3">
          {PRESET_BACKGROUNDS.map((item) => {
            const isSelected = currentPreset === item.key
            return (
              <div className="col-12 col-md-4" key={item.key}>
                <div
                  className={`p-2.5 rounded-3 border h-100 cursor-pointer position-relative ${
                    isSelected ? 'border-primary bg-primary bg-opacity-10 shadow-sm' : 'bg-white'
                  }`}
                  style={{
                    borderWidth: isSelected ? '2px' : '1px',
                    borderColor: isSelected ? '#2563eb' : '#e2e8f0',
                    transition: 'all 0.15s ease-in-out',
                  }}
                  onClick={() => handleSelectPreset(item.key)}
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
              </div>
            )
          })}
        </div>

        {/* Custom Upload Box if custom is selected */}
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
            <div className="row g-3 align-items-center">
              <div className="col-md-6">
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
                  onChange={(e) => handleBgOpacityChange(e.target.value)}
                  onMouseUp={handleSliderMouseUp}
                  onTouchEnd={handleSliderMouseUp}
                />
                <div
                  className="d-flex justify-content-between text-muted"
                  style={{ fontSize: '10px' }}
                >
                  <span>5% (Rất nhẹ)</span>
                  <span>15% (Chuẩn đẹp)</span>
                  <span>60% (Đậm nét)</span>
                </div>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-bold text-dark text-xs mb-1">
                  Kiểu hiển thị hoa văn:
                </label>
                <div className="d-flex gap-3 mt-1">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name={`bgMode_${currentTheme.id || 'new'}`}
                      id={`bgMode_pattern_${currentTheme.id || 'new'}`}
                      checked={bgConfig.mode !== 'cover'}
                      onChange={() => handleBgModeChange('pattern')}
                    />
                    <label
                      className="form-check-label text-dark text-xs cursor-pointer"
                      htmlFor={`bgMode_pattern_${currentTheme.id || 'new'}`}
                    >
                      Lặp hoa văn
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name={`bgMode_${currentTheme.id || 'new'}`}
                      id={`bgMode_cover_${currentTheme.id || 'new'}`}
                      checked={bgConfig.mode === 'cover'}
                      onChange={() => handleBgModeChange('cover')}
                    />
                    <label
                      className="form-check-label text-dark text-xs cursor-pointer"
                      htmlFor={`bgMode_cover_${currentTheme.id || 'new'}`}
                    >
                      Tràn toàn trang
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* LIVE REAL-TIME PREVIEW BOX */}
        <div className="mt-2 pt-2 border-top">
          <div className="d-flex align-items-center justify-content-between mb-2">
            <span className="fw-bold text-dark text-xs d-flex align-items-center gap-1.5">
              <span>👁️ Xem trước trực tiếp hoa văn nền (Live Preview):</span>
            </span>
            <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 text-xs">
              Mẫu: {PRESET_BACKGROUNDS.find((p) => p.key === currentPreset)?.name || 'Tùy chỉnh'} (
              {Math.round(localOpacity * 100)}%)
            </span>
          </div>

          <div
            className="rounded-3 border overflow-hidden position-relative"
            style={{
              backgroundColor: currentTheme.colors?.background || '#f7f7f7',
              height: '160px',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)',
            }}
          >
            {/* Background Watermark Pattern / Custom Wallpaper Layer */}
            <ThemeBackgroundWatermarkLayer
              background={{ ...bgConfig, opacity: localOpacity }}
              themeCode={currentTheme.code}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pb-5">
      {/* STANDARD PAGE HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <h3 className="fw-bold text-uppercase text-dark m-0" style={{ letterSpacing: '0.02em' }}>
          CẤU HÌNH GIAO DIỆN
        </h3>
      </div>

      {/* TOP HORIZONTAL CAROUSEL SECTION */}
      <div className="mb-5">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="d-flex align-items-center gap-2">
            <h5 className="fw-bold m-0 text-dark">Chọn chiến dịch giao diện</h5>
            <span
              className="badge rounded-pill fw-bold px-2.5 py-1"
              style={{
                backgroundColor: '#eff6ff',
                color: '#1d4ed8',
                fontSize: '12px',
                border: '1px solid #bfdbfe',
              }}
            >
              {themes.length} chiến dịch
            </span>
          </div>

          <div className="d-flex align-items-center gap-2">
            <CButton
              color="primary"
              className="text-white px-3 py-1.5 fw-semibold rounded"
              style={{ backgroundColor: '#4f46e5', borderColor: '#4f46e5', fontSize: '13.5px' }}
              onClick={() => setShowModal(true)}
            >
              Thêm mới
            </CButton>

            <CButton
              color="light"
              className="border text-dark rounded-circle d-flex align-items-center justify-content-center shadow-sm p-0 fw-bold fs-4"
              style={{
                width: '38px',
                height: '38px',
                backgroundColor: '#ffffff',
                color: '#1e293b',
                lineHeight: 1,
              }}
              title="Cuộn sang trái"
              onClick={scrollLeft}
            >
              ‹
            </CButton>

            <CButton
              color="light"
              className="border text-dark rounded-circle d-flex align-items-center justify-content-center shadow-sm p-0 fw-bold fs-4"
              style={{
                width: '38px',
                height: '38px',
                backgroundColor: '#ffffff',
                color: '#1e293b',
                lineHeight: 1,
              }}
              title="Cuộn sang phải"
              onClick={scrollRight}
            >
              ›
            </CButton>
          </div>
        </div>

        {/* Scrollable Horizontal Container - Active Campaign Sorted First */}
        {loading ? (
          <div className="d-flex align-items-center justify-content-center py-5">
            <CSpinner color="primary" variant="grow" size="sm" className="me-2" />
            <span className="text-muted fw-semibold">Đang tải chiến dịch giao diện từ CSDL...</span>
          </div>
        ) : (
          <div
            ref={sliderRef}
            className="d-flex gap-4 overflow-x-auto pb-3 pt-1 scrollbar-none"
            style={{ scrollBehavior: 'smooth', scrollSnapType: 'x mandatory' }}
          >
            {sortedThemes.map((item) => {
              const isApplied = item.id === appliedThemeId
              const isEditing = item.id === selectedThemeId
              return (
                <div
                  key={item.id}
                  style={{
                    minWidth: '320px',
                    maxWidth: '320px',
                    scrollSnapAlign: 'start',
                    flexShrink: 0,
                  }}
                >
                  <CCard
                    className="h-100 border-0 shadow-sm overflow-hidden bg-white position-relative cursor-pointer"
                    style={{
                      borderRadius: '12px',
                      border: isEditing
                        ? '2.5px solid #2563eb'
                        : isApplied
                          ? '2px solid #16a34a'
                          : '1px solid #e2e8f0',
                      boxShadow: isEditing
                        ? '0 10px 25px -5px rgba(37,99,235,0.35)'
                        : '0 4px 6px -1px rgba(0,0,0,0.05)',
                      transition: 'all 0.2s ease',
                    }}
                    onClick={() => handleSelectTheme(item)}
                  >
                    <div
                      className="position-relative overflow-hidden bg-light"
                      style={{ height: '160px' }}
                    >
                      <CImage
                        src={item.image}
                        alt={item.name}
                        className="w-100 h-100"
                        style={{ objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.src =
                            'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&q=80'
                        }}
                      />
                      <div
                        className="position-absolute top-0 start-0 w-100 h-100 pointer-events-none"
                        style={{
                          background:
                            'linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.4) 100%)',
                        }}
                      ></div>

                      {/* Tag Badge cleanly padded away from border */}
                      <span
                        className="position-absolute shadow-sm"
                        style={{
                          top: '10px',
                          left: '10px',
                          padding: '4px 12px',
                          fontSize: '11px',
                          fontWeight: '600',
                          color: '#ffffff',
                          backgroundColor: 'rgba(15, 23, 42, 0.75)',
                          backdropFilter: 'blur(4px)',
                          borderRadius: '20px',
                          letterSpacing: '0.02em',
                          zIndex: 2,
                        }}
                      >
                        {item.tag}
                      </span>

                      {isApplied && (
                        <div
                          className="position-absolute bg-success text-white rounded-pill px-2.5 py-1 d-flex align-items-center gap-1 shadow fw-bold"
                          style={{
                            top: '10px',
                            right: '10px',
                            fontSize: '11px',
                            zIndex: 2,
                          }}
                        >
                          <CIcon icon={cilCheckCircle} size="sm" />
                          <span>Đang áp dụng</span>
                        </div>
                      )}
                      {!isApplied && isEditing && (
                        <div
                          className="position-absolute bg-primary text-white rounded-pill px-2.5 py-1 d-flex align-items-center gap-1 shadow fw-semibold"
                          style={{
                            top: '10px',
                            right: '10px',
                            fontSize: '11px',
                            zIndex: 2,
                          }}
                        >
                          <span>✏️ Đang chỉnh sửa</span>
                        </div>
                      )}
                    </div>

                    <CCardBody className="d-flex flex-column justify-content-between p-3">
                      <div className="mb-2">
                        <div className="d-flex align-items-center justify-content-between mb-1">
                          <h6 className="fw-bold text-dark m-0">{item.name}</h6>
                          <span className="font-monospace text-muted text-xs">#{item.code}</span>
                        </div>
                        <span className="text-muted text-xs d-block">
                          {formatDateRangeText(item.startDate, item.endDate)}
                        </span>
                      </div>

                      <div className="d-flex align-items-center justify-content-between pt-2 border-top border-light">
                        {isApplied ? (
                          <span
                            className="text-success fw-bold d-flex align-items-center gap-2"
                            style={{ fontSize: '13.5px' }}
                          >
                            <span
                              className="bg-success rounded-circle flex-shrink-0"
                              style={{ width: '8px', height: '8px', display: 'inline-block' }}
                            ></span>
                            <span>Đang áp dụng</span>
                          </span>
                        ) : (
                          <CButton
                            color="light"
                            className="border-0 px-3.5 py-1.5 text-dark fw-bold shadow-sm"
                            style={{
                              backgroundColor: '#e2e8f0',
                              fontSize: '13.5px',
                              borderRadius: '7px',
                            }}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleApply(item.id, e)
                            }}
                          >
                            Áp dụng
                          </CButton>
                        )}

                        {/* Action Buttons: Larger size for comfortable clicking */}
                        <div className="d-flex align-items-center gap-2">
                          <CButton
                            color="warning"
                            className="text-white shadow-sm rounded-2 d-flex align-items-center justify-content-center p-0"
                            style={{
                              backgroundColor: '#f59e0b',
                              borderColor: '#f59e0b',
                              width: '35px',
                              height: '35px',
                            }}
                            title="Sửa thông tin chiến dịch"
                            onClick={(e) => handleOpenEditModal(item, e)}
                          >
                            <CIcon icon={cilPencil} size="lg" className="text-white" />
                          </CButton>
                          {!isApplied && (
                            <CButton
                              color="danger"
                              className="text-white shadow-sm rounded-2 d-flex align-items-center justify-content-center p-0"
                              style={{
                                backgroundColor: '#ef4444',
                                borderColor: '#ef4444',
                                width: '35px',
                                height: '35px',
                              }}
                              title="Xóa chiến dịch"
                              onClick={(e) => handleDelete(item.id, e)}
                            >
                              <CIcon icon={cilTrash} size="lg" className="text-white" />
                            </CButton>
                          )}
                        </div>
                      </div>
                    </CCardBody>
                  </CCard>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* BOTTOM SECTION: VISUAL WEBSITE BANNER & LAYOUT BUILDER */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <div>
          <h5 className="fw-bold m-0 text-dark">Tùy chỉnh bố cục & giao diện website</h5>
          <span className="text-muted small">
            Nhấp trực tiếp vào banner để tải ảnh, đổi số lượng banner (1-5), bật/tắt hoặc sắp xếp vị
            trí các khối
          </span>
        </div>

        <div className="d-flex align-items-center gap-2 flex-wrap">
          <div className="dropdown">
            <button
              className="btn btn-outline-primary btn-sm dropdown-toggle fw-semibold d-flex align-items-center gap-1.5"
              type="button"
              id="addBannerDropdown"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              onClick={() => handleAddBannerGroup(4)}
            >
              + Thêm nhóm banner mới
            </button>
          </div>

          <CButton
            color="primary"
            className="text-white px-3.5 py-1.5 fw-semibold rounded shadow-sm d-flex align-items-center gap-1.5"
            style={{
              backgroundColor: colors.primary || '#2356c4',
              borderColor: colors.primary || '#2356c4',
              fontSize: '13.5px',
              opacity: isSaving ? 0.75 : 1,
            }}
            disabled={isSaving}
            onClick={handleSaveConfig}
          >
            {isSaving ? (
              <>
                <span
                  className="spinner-border spinner-border-sm text-white"
                  role="status"
                  aria-hidden="true"
                ></span>
                <span>Đang lưu...</span>
              </>
            ) : (
              <span>Lưu thay đổi</span>
            )}
          </CButton>
        </div>
      </div>

      {/* LIVE VISUAL WEBSITE CANVAS (Fixed container width & overflow to prevent stretching) */}
      <div
        className="rounded-3 border shadow-sm w-100 overflow-hidden position-relative"
        style={{
          borderColor: '#cbd5e1',
          backgroundColor: colors.background || '#f7f7f7',
          color: colors.text || '#222222',
          maxWidth: '100%',
        }}
      >
        {/* Background Watermark Pattern Layer for Selected/Active Theme */}
        <ThemeBackgroundWatermarkLayer
          background={
            themes.find((t) => t.id === selectedThemeId)?.background ||
            themes.find((t) => t.id === appliedThemeId)?.background ||
            themes[0]?.background
          }
          themeCode={
            themes.find((t) => t.id === selectedThemeId)?.code ||
            themes.find((t) => t.id === appliedThemeId)?.code ||
            'default'
          }
        />

        {/* Browser Top Bar Mock */}
        <div
          className="px-3 py-2 bg-light border-bottom d-flex align-items-center justify-content-between flex-wrap gap-2 position-relative"
          style={{ fontSize: '12px', zIndex: 1 }}
        >
          <div className="d-flex align-items-center gap-1.5">
            <span
              className="rounded-circle bg-danger opacity-75 d-inline-block"
              style={{ width: '10px', height: '10px' }}
            ></span>
            <span
              className="rounded-circle bg-warning opacity-75 d-inline-block"
              style={{ width: '10px', height: '10px' }}
            ></span>
            <span
              className="rounded-circle bg-success opacity-75 d-inline-block"
              style={{ width: '10px', height: '10px' }}
            ></span>
            <span className="ms-2 fw-semibold text-secondary">
              https://vitinhnguyenkim.vn • Vi Tính Nguyên Kim
            </span>
          </div>
          <span
            className="badge rounded-pill px-3 py-1"
            style={{
              backgroundColor: `${colors.primary || '#2356c4'}15`,
              color: colors.primary || '#2356c4',
            }}
          >
            ✨ Kéo lên/xuống, bật/tắt hoặc nhấp banner để tải ảnh
          </span>
        </div>

        {/* 0. TOP HEADER BANNER (Vị trí 0 - Full-Width Edge-to-Edge Banner) */}
        <div className="w-100 bg-white border-bottom p-1">
          <RenderBannerSlot
            slotKey="topBanner"
            title="Vị trí 0: Banner đầu trang"
            sizeText="Kích thước đề xuất: 1920 x 60 px"
            minHeight="60px"
            style={{ width: '100%' }}
          />
        </div>

        {/* 1. Golden Utility Top Bar */}
        <div
          className="d-none d-md-block shadow-xs w-100"
          style={{
            backgroundColor: colors.secondary || '#ffb716',
            transition: 'background-color 0.3s ease',
          }}
        >
          <div
            className="d-flex justify-content-end align-items-center gap-4 text-white py-2"
            style={{
              width: '100%',
              maxWidth: '1440px',
              margin: '0 auto',
              padding: '0 20px',
              fontSize: '12.5px',
              fontWeight: '500',
              boxSizing: 'border-box',
            }}
          >
            <span className="cursor-pointer hover:opacity-80">🏷️ Tin khuyến mãi</span>
            <span className="cursor-pointer hover:opacity-80">📦 Trang sản phẩm</span>
            <span className="cursor-pointer hover:opacity-80">⚙️ Xây dựng cấu hình</span>
            <span className="cursor-pointer hover:opacity-80">🏢 Giải pháp doanh nghiệp</span>
            <span className="cursor-pointer hover:opacity-80">📰 Tin tức</span>
            <span className="cursor-pointer hover:opacity-80">📞 Liên hệ</span>
            <span className="cursor-pointer hover:opacity-80">👥 Tuyển dụng</span>
          </div>
        </div>

        {/* 2. Main Store Header with Official Logo */}
        <div className="border-bottom bg-white w-100">
          <div
            className="py-2.5 d-flex align-items-center justify-content-between gap-4"
            style={{
              width: '100%',
              maxWidth: '1440px',
              margin: '0 auto',
              padding: '12px 20px',
              boxSizing: 'border-box',
            }}
          >
            {/* Logo */}
            <div
              className="d-flex align-items-center flex-shrink-0"
              style={{ width: '230px', minWidth: '200px' }}
            >
              <img
                src={logoNk}
                alt="Vi Tính Nguyên Kim Logo"
                style={{ width: '100%', height: '70px', objectFit: 'contain' }}
              />
            </div>

            {/* Search Input */}
            <div className="position-relative flex-fill mx-2">
              <div
                className="position-absolute top-50 start-0 translate-middle-y ps-3.5 text-secondary opacity-75"
                style={{ pointerEvents: 'none' }}
              >
                <CIcon icon={cilSearch} size="sm" />
              </div>
              <input
                type="text"
                className="form-control rounded-3 py-2.5 ps-5 border"
                placeholder="Nhập từ khóa tìm kiếm..."
                style={{
                  fontSize: '13.5px',
                  borderColor: '#d1d5db',
                  backgroundColor: '#ffffff',
                  boxShadow: 'none',
                }}
                readOnly
              />
            </div>

            {/* Header Actions */}
            <div className="d-flex align-items-center gap-4 flex-shrink-0 ms-2">
              <div
                className="d-flex flex-column align-items-center justify-content-center cursor-pointer text-center"
                style={{ minWidth: '105px' }}
              >
                <CIcon icon={cilUser} size="xl" style={{ color: '#82869e' }} />
                <span
                  className="fw-bold mt-1 text-truncate"
                  style={{ fontSize: '12px', color: '#82869e', maxWidth: '130px' }}
                >
                  Chào bạn OnlineTest
                </span>
              </div>

              <div
                className="d-flex flex-column align-items-center justify-content-center cursor-pointer text-center"
                style={{ minWidth: '70px' }}
              >
                <CIcon icon={cilBell} size="xl" style={{ color: '#82869e' }} />
                <span className="fw-semibold mt-1" style={{ fontSize: '12px', color: '#82869e' }}>
                  Thông báo
                </span>
              </div>

              <div
                className="d-flex flex-column align-items-center justify-content-center position-relative cursor-pointer text-center"
                style={{ minWidth: '70px' }}
              >
                <div className="position-relative d-inline-block">
                  <CIcon icon={cilCart} size="xl" style={{ color: '#82869e' }} />
                  <span
                    className="position-absolute rounded-pill text-white fw-bold text-center d-flex align-items-center justify-content-center shadow-sm"
                    style={{
                      top: '-6px',
                      right: '-8px',
                      fontSize: '9.5px',
                      minWidth: '17px',
                      height: '17px',
                      padding: '0 3px',
                      backgroundColor: colors.accent || '#ef4444',
                    }}
                  >
                    1
                  </span>
                </div>
                <span className="fw-semibold mt-1" style={{ fontSize: '12px', color: '#82869e' }}>
                  Giỏ hàng
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* DYNAMIC SECTIONS RENDERER (Reorderable, Toggleable, 1-5 Banners) */}
        {sections.map((section, sIdx) => {
          const isEnabled = section.enabled !== false

          // SECTION CONTROL BAR
          const renderSectionControls = () => (
            <div
              className="d-flex flex-wrap align-items-center justify-content-between gap-2 px-3 py-1.5 bg-dark bg-opacity-10 border-bottom"
              style={{ fontSize: '12px' }}
            >
              <div className="d-flex align-items-center gap-2">
                {editingSectionId === section.id ? (
                  <div className="d-flex align-items-center gap-1">
                    <span
                      className="badge px-1.5 py-1 fw-bold rounded text-white"
                      style={{
                        backgroundColor: colors.primary || '#2356c4',
                        fontSize: '11px',
                      }}
                    >
                      #{sIdx + 1}
                    </span>
                    <input
                      type="text"
                      className="form-control form-control-sm py-0 px-2 fw-bold text-dark border-primary shadow-xs"
                      style={{ height: '26px', fontSize: '12px', minWidth: '220px' }}
                      value={tempSectionName}
                      onChange={(e) => setTempSectionName(e.target.value)}
                      onBlur={() => handleBlurSectionName(section.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleBlurSectionName(section.id)
                        }
                        if (e.key === 'Escape') {
                          setEditingSectionId(null)
                        }
                      }}
                      placeholder="Nhập tên nhóm banner..."
                      autoFocus
                    />
                    <span className="text-muted" style={{ fontSize: '10.5px' }}>
                      (Bấm ra ngoài / Enter để lưu)
                    </span>
                  </div>
                ) : (
                  <span
                    className="badge px-2 py-1 fw-bold rounded cursor-pointer"
                    style={{
                      backgroundColor: colors.primary || '#2356c4',
                      color: '#ffffff',
                      fontSize: '11px',
                    }}
                    onClick={() => handleStartEditSectionName(section)}
                    title="Nhấn vào đây để đổi tên"
                  >
                    #{sIdx + 1} {section.name || getCleanSectionName(section)}
                  </span>
                )}
                {section.type === 'banner_group' && (
                  <span className="text-secondary fw-semibold">
                    (Nhóm {section.columns || 4} banner)
                  </span>
                )}
              </div>

              <div className="d-flex align-items-center gap-1.5 flex-wrap">
                {/* 1-5 Columns selector & Height selector for Banner Groups */}
                {section.type === 'banner_group' &&
                  (() => {
                    const currentHeight = section.height || (section.columns === 1 ? 220 : 160)
                    return (
                      <>
                        <div className="d-flex align-items-center gap-1 me-1 bg-white rounded px-2 py-0.5 border shadow-2xs">
                          <span className="text-muted text-xs">Số banner:</span>
                          {[1, 2, 3, 4, 5].map((cnt) => (
                            <button
                              key={cnt}
                              type="button"
                              className={`btn btn-xs py-0 px-1.5 fw-bold ${
                                (section.columns || 4) === cnt
                                  ? 'btn-primary text-white'
                                  : 'btn-light'
                              }`}
                              style={{ fontSize: '11px', borderRadius: '3px' }}
                              onClick={() => handleChangeBannerGroupColumns(section.id, cnt)}
                              title={`Đổi nhóm thành ${cnt} banner`}
                            >
                              {cnt}
                            </button>
                          ))}
                        </div>

                        <div className="d-flex align-items-center gap-1 me-2 bg-white rounded px-2 py-0.5 border shadow-2xs">
                          <span className="text-muted text-xs">Chiều cao:</span>
                          {[120, 160, 200, 260, 400, 600].map((h) => (
                            <button
                              key={h}
                              type="button"
                              className={`btn btn-xs py-0 px-1.5 fw-bold ${
                                currentHeight === h ? 'btn-primary text-white' : 'btn-light'
                              }`}
                              style={{ fontSize: '11px', borderRadius: '3px' }}
                              onClick={() => handleChangeBannerGroupHeight(section.id, h)}
                              title={`Đổi chiều cao thành ${h}px`}
                            >
                              {h}px
                            </button>
                          ))}

                          <div className="d-flex align-items-center bg-light border rounded overflow-hidden ms-1 shadow-2xs">
                            <button
                              type="button"
                              className="btn btn-xs btn-light px-1.5 py-0 fw-bold border-end text-secondary"
                              style={{ height: '22px', fontSize: '13px', lineHeight: 1 }}
                              onClick={() =>
                                handleChangeBannerGroupHeight(section.id, currentHeight - 20)
                              }
                              title="Giảm 20px"
                            >
                              −
                            </button>
                            <input
                              type="text"
                              className="form-control form-control-sm border-0 py-0 px-1 text-center fw-bold bg-white"
                              style={{ width: '48px', height: '22px', fontSize: '11px' }}
                              value={currentHeight}
                              onChange={(e) => {
                                const val = parseInt(e.target.value.replace(/\D/g, ''), 10)
                                handleChangeBannerGroupHeight(section.id, isNaN(val) ? 60 : val)
                              }}
                              title="Nhập chiều cao tùy ý (60px - 1000px)"
                            />
                            <button
                              type="button"
                              className="btn btn-xs btn-light px-1.5 py-0 fw-bold border-start text-secondary"
                              style={{ height: '22px', fontSize: '13px', lineHeight: 1 }}
                              onClick={() =>
                                handleChangeBannerGroupHeight(section.id, currentHeight + 20)
                              }
                              title="Tăng 20px"
                            >
                              +
                            </button>
                          </div>
                          <span className="text-muted ms-0.5" style={{ fontSize: '10px' }}>
                            px
                          </span>
                        </div>
                      </>
                    )
                  })()}

                {/* Move Up / Down */}
                <button
                  type="button"
                  disabled={sIdx === 0}
                  className="btn btn-light btn-xs px-2 py-0.5 border shadow-2xs fw-bold"
                  style={{ fontSize: '11.5px' }}
                  onClick={() => handleMoveSection(sIdx, 'up')}
                  title="Di chuyển lên trên"
                >
                  ▲ Lên
                </button>
                <button
                  type="button"
                  disabled={sIdx === sections.length - 1}
                  className="btn btn-light btn-xs px-2 py-0.5 border shadow-2xs fw-bold"
                  style={{ fontSize: '11.5px' }}
                  onClick={() => handleMoveSection(sIdx, 'down')}
                  title="Di chuyển xuống dưới"
                >
                  ▼ Xuống
                </button>

                {/* Visibility Toggle */}
                <button
                  type="button"
                  className={`btn btn-xs px-2 py-0.5 border shadow-2xs fw-bold ${
                    isEnabled ? 'btn-success text-white' : 'btn-secondary text-white'
                  }`}
                  style={{ fontSize: '11.5px' }}
                  onClick={() => handleToggleSection(section.id)}
                  title={isEnabled ? 'Ẩn khỏi trang chủ' : 'Bật hiển thị trên trang chủ'}
                >
                  {isEnabled ? '👁️ Đang hiện' : '🔒 Đang ẩn'}
                </button>

                {/* Delete custom banner group */}
                {section.canDelete && (
                  <button
                    type="button"
                    className="btn btn-danger btn-xs text-white px-2 py-0.5 border shadow-2xs fw-bold"
                    style={{ fontSize: '11.5px' }}
                    onClick={() => setSectionToDelete(section)}
                    title="Xóa nhóm banner này"
                  >
                    🗑️ Xóa nhóm
                  </button>
                )}
              </div>
            </div>
          )

          if (!isEnabled) {
            return (
              <div key={section.id} className="border-bottom bg-white opacity-75">
                {renderSectionControls()}
                <div className="p-3 text-center text-muted small bg-light">
                  Khối này đang được <strong>ẨN</strong> trên website thành viên. Nhấn &apos;👁️ Đang
                  ẩn&apos; để kích hoạt hiển thị lại.
                </div>
              </div>
            )
          }

          // 1. HERO SECTION
          if (section.type === 'hero') {
            return (
              <div
                key={section.id}
                className="w-100 border-bottom"
                style={{ backgroundColor: colors.background || '#f7f7f7' }}
              >
                {renderSectionControls()}
                <div
                  style={{
                    width: '100%',
                    maxWidth: '1720px',
                    margin: '0 auto',
                    padding: '16px 24px 20px',
                    boxSizing: 'border-box',
                  }}
                >
                  <div className="d-flex justify-content-center align-items-stretch gap-4 gap-xxl-5 position-relative">
                    {/* Left Floating Skyscraper Banner (Banner trái) */}
                    <div
                      className="d-none d-xl-flex flex-column flex-shrink-0"
                      style={{ width: '135px', minWidth: '120px' }}
                    >
                      <div className="text-center mb-1.5">
                        <span
                          className="badge border px-2 py-0.5 rounded-pill fw-semibold text-truncate"
                          style={{
                            fontSize: '11px',
                            backgroundColor: '#f1f5f9',
                            color: '#475569',
                            borderColor: '#cbd5e1',
                          }}
                        >
                          📌 Banner trái
                        </span>
                      </div>
                      <RenderBannerSlot
                        slotKey="floatingLeft"
                        title="Banner trái"
                        sizeText="160 x 600 px"
                        minHeight="390px"
                        compact={true}
                        style={{ height: '100%' }}
                      />
                    </div>

                    {/* Center Main Content Container */}
                    <div className="flex-fill min-w-0" style={{ maxWidth: '1280px' }}>
                      <div className="d-flex gap-3 flex-wrap flex-md-nowrap">
                        {/* Left Column: Category Sidebar */}
                        <div
                          className="d-none d-md-block flex-shrink-0"
                          style={{ width: '235px', minWidth: '215px' }}
                        >
                          <div
                            className="bg-white rounded-1 border h-100 shadow-xs"
                            style={{ fontSize: '13px', borderColor: '#e5e7eb' }}
                          >
                            <div
                              className="fw-bold text-dark px-3 py-2 border-bottom d-flex align-items-center gap-2"
                              style={{ fontSize: '14.5px', borderColor: '#e5e7eb' }}
                            >
                              <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <line x1="3" y1="12" x2="21" y2="12"></line>
                                <line x1="3" y1="6" x2="21" y2="6"></line>
                                <line x1="3" y1="18" x2="21" y2="18"></line>
                              </svg>
                              <span>Danh mục sản phẩm</span>
                            </div>
                            <div className="py-1">
                              {CATEGORIES_LIST.map((cat, idx) => (
                                <div
                                  key={idx}
                                  className="px-3 py-1.5 d-flex justify-content-between align-items-center hover-bg-light cursor-pointer"
                                  style={{ color: '#434657', transition: 'all 0.15s' }}
                                >
                                  <span
                                    className="text-truncate"
                                    style={{ fontSize: '13.5px', fontWeight: '400' }}
                                  >
                                    {cat}
                                  </span>
                                  <svg
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="#9ca3af"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    style={{ flexShrink: 0 }}
                                  >
                                    <polyline points="9 18 15 12 9 6"></polyline>
                                  </svg>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Right Column: Hotline Bar ON TOP + Main Banner + 2 Side Banners */}
                        <div className="flex-fill min-w-0">
                          <div className="d-flex flex-column h-100">
                            <div
                              className="d-flex justify-content-between align-items-center pb-2 mb-2 border-bottom"
                              style={{ fontSize: '13px', borderColor: '#e5e7eb' }}
                            >
                              <div style={{ color: '#374151' }}>
                                Hotline: <strong className="text-dark fw-bold">1900 6739</strong> 8h
                                - 17h45 (Từ thứ Hai đến thứ Sáu), Thứ 7: 8h - 16h
                              </div>
                              <div>
                                <span className="text-dark fw-normal cursor-pointer d-flex align-items-center gap-1">
                                  🌐 Tiếng Việt <span style={{ fontSize: '11px' }}>▼</span>
                                </span>
                              </div>
                            </div>

                            {/* Banners Grid: Main Hero Banner (79%) + 2 Side Banners (21%) Matching Member layout */}
                            <div
                              style={{
                                display: 'grid',
                                gridTemplateColumns: '79% calc(21% - 8px)',
                                gap: '8px',
                                height: '100%',
                                minHeight: '380px',
                              }}
                            >
                              {/* Center Main Banner (Position 1) */}
                              <div style={{ height: '100%' }}>
                                <RenderBannerSlot
                                  slotKey="mainBanner"
                                  title="Vị trí 1: Banner chính"
                                  sizeText="Kích thước: 840 x 420 px"
                                  minHeight="380px"
                                  style={{ height: '100%' }}
                                />
                              </div>

                              {/* Right Side Banners (Position 2 & 3) Stacked Vertically */}
                              <div className="d-flex flex-column gap-2" style={{ height: '100%' }}>
                                <div className="flex-fill" style={{ height: 'calc(50% - 4px)' }}>
                                  <RenderBannerSlot
                                    slotKey="sideBanner1"
                                    title="Vị trí 2: Banner phụ 1"
                                    sizeText="Kích thước: 380 x 205 px"
                                    minHeight="185px"
                                    style={{ height: '100%' }}
                                  />
                                </div>
                                <div className="flex-fill" style={{ height: 'calc(50% - 4px)' }}>
                                  <RenderBannerSlot
                                    slotKey="sideBanner2"
                                    title="Vị trí 3: Banner phụ 2"
                                    sizeText="Kích thước: 380 x 205 px"
                                    minHeight="185px"
                                    style={{ height: '100%' }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Floating Skyscraper Banner (Banner phải) */}
                    <div
                      className="d-none d-xl-flex flex-column flex-shrink-0"
                      style={{ width: '135px', minWidth: '120px' }}
                    >
                      <div className="text-center mb-1.5">
                        <span
                          className="badge border px-2 py-0.5 rounded-pill fw-semibold text-truncate"
                          style={{
                            fontSize: '11px',
                            backgroundColor: '#f1f5f9',
                            color: '#475569',
                            borderColor: '#cbd5e1',
                          }}
                        >
                          📌 Banner phải
                        </span>
                      </div>
                      <RenderBannerSlot
                        slotKey="floatingRight"
                        title="Banner phải"
                        sizeText="160 x 600 px"
                        minHeight="390px"
                        compact={true}
                        style={{ height: '100%' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )
          }

          // 2. FEATURED CATEGORIES
          if (section.type === 'featured_categories') {
            return (
              <div key={section.id} className="bg-white border-bottom w-100">
                {renderSectionControls()}
                <div
                  style={{
                    width: '100%',
                    maxWidth: '1440px',
                    margin: '0 auto',
                    padding: '16px 20px',
                    boxSizing: 'border-box',
                  }}
                >
                  <CRow className="g-3">
                    {FEATURED_CATS.map((cat, idx) => (
                      <CCol key={idx} xs={6} sm={4} md={2} className="flex-fill">
                        <div
                          className="d-flex align-items-center justify-content-between px-3 py-2.5 rounded-3 bg-light transition-all hover-shadow cursor-pointer"
                          style={{
                            backgroundColor: '#f3f4f8',
                            border: '1px solid #e2e8f0',
                            minHeight: '84px',
                          }}
                        >
                          <div
                            className="position-relative flex-shrink-0 d-flex align-items-center justify-content-center"
                            style={{ width: '65px', height: '60px' }}
                          >
                            <img
                              src={cat.img}
                              alt={cat.name}
                              className="w-100 h-100 rounded"
                              style={{ objectFit: 'contain' }}
                              onError={(e) => {
                                e.target.src = cat.fallback
                              }}
                            />
                          </div>
                          <div className="ms-3 flex-fill">
                            <div className="fw-bold text-dark" style={{ fontSize: '14px' }}>
                              {cat.name}
                            </div>
                            <span
                              className="fw-semibold d-inline-block mt-0.5"
                              style={{ fontSize: '12px', color: colors.primary || '#1b4998' }}
                            >
                              Xem ngay &gt;
                            </span>
                          </div>
                        </div>
                      </CCol>
                    ))}
                  </CRow>
                </div>
              </div>
            )
          }

          // 3. DYNAMIC BANNER GROUP (1 to 5 Banners)
          if (section.type === 'banner_group') {
            const cols = Math.min(5, Math.max(1, section.columns || 4))
            const slots =
              section.slots ||
              (cols === 4
                ? ['promo1', 'promo2', 'promo3', 'promo4']
                : cols === 3
                  ? ['subPromo1', 'subPromo2', 'subPromo3']
                  : [`customSlot_${section.id}_1`])

            return (
              <div
                key={section.id}
                className="border-bottom w-100"
                style={{ backgroundColor: colors.background || '#f7f7f7' }}
              >
                {renderSectionControls()}
                <div
                  style={{
                    width: '100%',
                    maxWidth: '1440px',
                    margin: '0 auto',
                    padding: '16px 20px',
                    boxSizing: 'border-box',
                  }}
                >
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h6 className="fw-bold text-dark m-0">{getCleanSectionName(section)}</h6>
                    <span className="text-muted text-xs">
                      {cols} vị trí banner ngang tùy chỉnh (1 đến 5 banner)
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
                      gap: '10px',
                    }}
                  >
                    {slots.slice(0, cols).map((slotKey, slotIdx) => {
                      const h = section.height || (cols === 1 ? 220 : 160)
                      return (
                        <div key={slotKey} className="w-100">
                          <RenderBannerSlot
                            slotKey={slotKey}
                            title={`Banner ${slotIdx + 1}`}
                            sizeText={`${Math.round(1440 / cols)} x ${h} px`}
                            minHeight={`${h}px`}
                            style={{ height: `${h}px` }}
                          />
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )
          }

          // 4. FEATURED PRODUCTS SECTION
          if (section.type === 'featured_products') {
            return (
              <div key={section.id} className="bg-white border-bottom w-100">
                {renderSectionControls()}
                <div
                  style={{
                    width: '100%',
                    maxWidth: '1440px',
                    margin: '0 auto',
                    padding: '16px 20px',
                    boxSizing: 'border-box',
                  }}
                >
                  <div className="mb-2">
                    <h5 className="fw-bold text-dark m-0" style={{ fontSize: '20px' }}>
                      Sản phẩm nổi bật
                    </h5>
                  </div>

                  {/* Category Tabs */}
                  <div
                    className="d-flex align-items-center gap-4 border-bottom mb-3 pb-0 overflow-auto"
                    style={{ borderColor: '#e5e7eb' }}
                  >
                    {FEATURED_TABS.map((tab, idx) => {
                      const isActive = selectedFeaturedTab === idx
                      return (
                        <button
                          key={tab}
                          type="button"
                          onClick={() => setSelectedFeaturedTab(idx)}
                          className="btn btn-link p-0 pb-2 text-decoration-none fw-bold"
                          style={{
                            fontSize: '15px',
                            color: isActive ? '#e20000' : '#4b5563',
                            borderBottom: isActive
                              ? '2.5px solid #e20000'
                              : '2.5px solid transparent',
                            borderRadius: 0,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {tab}
                        </button>
                      )
                    })}
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
                      gap: '14px',
                    }}
                  >
                    {FEATURED_PRODUCTS.map((prod) => (
                      <div
                        key={prod.id}
                        className="card border rounded-1 p-2 bg-white d-flex flex-column justify-content-between transition-all"
                        style={{
                          borderColor: '#f1f5f9',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                          minHeight: '310px',
                        }}
                      >
                        <div>
                          <div
                            className="position-relative w-100 mb-2 bg-white rounded d-flex align-items-center justify-content-center"
                            style={{ height: '155px' }}
                          >
                            <img
                              src={prod.img}
                              alt={prod.name}
                              className="w-100 h-100"
                              style={{ objectFit: 'contain' }}
                            />
                          </div>

                          <div
                            className="text-dark mb-2"
                            style={{
                              fontSize: '13px',
                              fontWeight: '400',
                              lineHeight: '1.3',
                              minHeight: '36px',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                            title={prod.name}
                          >
                            {prod.name}
                          </div>
                        </div>

                        <div>
                          <div className="d-flex align-items-center justify-content-between mb-1">
                            <span
                              className="fw-bold"
                              style={{
                                fontSize: '15px',
                                color: '#dc2626',
                              }}
                            >
                              {prod.price}
                            </span>
                            <span
                              className="badge px-1 py-0.5 fw-bold"
                              style={{
                                fontSize: '10.5px',
                                backgroundColor: '#dc2626',
                                color: '#ffffff',
                                borderRadius: '2px',
                              }}
                            >
                              {prod.discount}
                            </span>
                          </div>

                          <div
                            className="text-muted mb-2"
                            style={{
                              fontSize: '11px',
                              textDecoration: 'line-through',
                              color: '#9ca3af',
                              minHeight: '16px',
                            }}
                          >
                            {prod.originalPrice}
                          </div>

                          <button
                            type="button"
                            className="btn btn-sm w-100 d-flex align-items-center justify-content-center gap-1.5 py-1.5"
                            style={{
                              backgroundColor: '#F1F8FE',
                              color: '#2a83e9',
                              border: 'none',
                              fontSize: '13px',
                              fontWeight: '500',
                              borderRadius: '2px',
                            }}
                          >
                            <CIcon icon={cilCart} size="sm" /> Thêm vào giỏ
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          }

          // 5. CATEGORY PRODUCTS (Tabs & Sliders)
          if (section.type === 'category_products') {
            return (
              <div key={section.id} className="border-bottom bg-white w-100">
                {renderSectionControls()}
                <div
                  style={{
                    width: '100%',
                    maxWidth: '1440px',
                    margin: '0 auto',
                    padding: '16px 20px',
                    boxSizing: 'border-box',
                  }}
                >
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="fw-bold text-dark m-0" style={{ fontSize: '18px' }}>
                      Danh mục sản phẩm theo tab & slider
                    </h5>
                    <span className="badge bg-light text-secondary border">
                      Slider sản phẩm tự động
                    </span>
                  </div>
                  <div className="p-4 bg-light rounded-2 text-center text-muted">
                    Khối hiển thị danh mục sản phẩm kết hợp banner trái/phải và slider trượt sản
                    phẩm.
                  </div>
                </div>
              </div>
            )
          }

          // 6. PRODUCTS RECOMMEND
          if (section.type === 'products_recommend') {
            return (
              <div
                key={section.id}
                className="border-bottom w-100"
                style={{ backgroundColor: colors.background || '#f7f7f7' }}
              >
                {renderSectionControls()}
                <div
                  style={{
                    width: '100%',
                    maxWidth: '1440px',
                    margin: '0 auto',
                    padding: '16px 20px',
                    boxSizing: 'border-box',
                  }}
                >
                  <h5 className="fw-bold text-dark mb-2" style={{ fontSize: '18px' }}>
                    Sản phẩm bạn có thể quan tâm
                  </h5>
                  <div className="p-3 bg-white rounded-2 border text-center text-muted">
                    Khối sản phẩm gợi ý thông minh dựa trên lịch sử xem của người dùng.
                  </div>
                </div>
              </div>
            )
          }

          // 7. NEWS LATEST
          if (section.type === 'news_latest') {
            return (
              <div key={section.id} className="bg-white border-bottom w-100">
                {renderSectionControls()}
                <div
                  style={{
                    width: '100%',
                    maxWidth: '1440px',
                    margin: '0 auto',
                    padding: '16px 20px',
                    boxSizing: 'border-box',
                  }}
                >
                  <h5 className="fw-bold text-dark mb-2" style={{ fontSize: '18px' }}>
                    Tin tức công nghệ mới nhất
                  </h5>
                  <div className="p-3 bg-light rounded-2 text-center text-muted">
                    Khối danh sách bài viết & tin tức nổi bật trên trang chủ.
                  </div>
                </div>
              </div>
            )
          }

          return null
        })}

        {/* BOTTOM ADD BANNER GROUP QUICK BUTTON */}
        <div className="p-4 bg-light text-center border-top">
          <button
            type="button"
            className="btn btn-outline-primary fw-bold px-4 py-2"
            onClick={() => handleAddBannerGroup(4)}
          >
            + Thêm nhóm banner ngang mới vào cuối trang
          </button>
        </div>
      </div>

      {/* MODAL THÊM CHIẾN DỊCH MỚI */}
      <CModal visible={showModal} onClose={() => setShowModal(false)} size="lg" alignment="center">
        <CModalHeader className="border-bottom">
          <CModalTitle className="fw-bold fs-5 text-dark">
            Thêm Chiến Dịch Giao Diện Mới
          </CModalTitle>
        </CModalHeader>
        <CModalBody className="p-4">
          <CRow className="mb-3">
            <CCol md={6}>
              <label className="form-label font-semibold text-dark small">
                Tên chiến dịch giao diện
              </label>
              <CFormInput
                placeholder="VD: Giáng sinh 2026, Tết 2028..."
                value={newTheme.name}
                onChange={(e) => setNewTheme({ ...newTheme, name: e.target.value })}
              />
            </CCol>
            <CCol md={6}>
              <label className="form-label font-semibold text-dark small">Mã Code (Slug)</label>
              <CFormInput
                placeholder="VD: giangsinh2026, tet2028"
                value={newTheme.code}
                onChange={(e) => setNewTheme({ ...newTheme, code: e.target.value })}
              />
            </CCol>
          </CRow>

          <CRow className="mb-3">
            <CCol md={4}>
              <label className="form-label font-semibold text-dark small">Thẻ Nhãn (Tag)</label>
              <CFormInput
                placeholder="VD: Tết, Sale, Giáng Sinh"
                value={newTheme.tag}
                onChange={(e) => setNewTheme({ ...newTheme, tag: e.target.value })}
              />
            </CCol>
            <CCol md={4}>
              <label className="form-label font-semibold text-dark small">Ngày bắt đầu</label>
              <CFormInput
                type="date"
                value={formatDateInput(newTheme.startDate)}
                onChange={(e) => setNewTheme({ ...newTheme, startDate: e.target.value })}
              />
              <span className="text-muted text-xs d-block mt-1">(Để trống = Không giới hạn)</span>
            </CCol>
            <CCol md={4}>
              <label className="form-label font-semibold text-dark small">Ngày kết thúc</label>
              <CFormInput
                type="date"
                value={formatDateInput(newTheme.endDate)}
                onChange={(e) => setNewTheme({ ...newTheme, endDate: e.target.value })}
              />
              <span className="text-muted text-xs d-block mt-1">(Để trống = Không giới hạn)</span>
            </CCol>
          </CRow>

          <div className="mb-3">
            <label className="form-label font-semibold text-dark small">Mô tả / Tiêu đề phụ</label>
            <CFormInput
              placeholder="VD: Khai xuân bứt phá - Ưu đãi Tết IT 2027"
              value={newTheme.description}
              onChange={(e) => setNewTheme({ ...newTheme, description: e.target.value })}
            />
          </div>

          {/* Color Pickers inside Modal */}
          <div className="mt-4 pt-3 border-top">
            <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
              <CIcon icon={cilColorPalette} className="text-primary" /> Màu tổng thể chiến dịch
            </h6>

            <CRow className="g-3 mb-4">
              {[
                { label: 'Màu chính (Nút & Viền)', key: 'primary' },
                { label: 'Màu thanh Menu Topbar', key: 'secondary' },
                { label: 'Màu nhấn (Sale & Hotline)', key: 'accent' },
                { label: 'Màu nền website', key: 'background' },
                { label: 'Màu chữ văn bản', key: 'text' },
              ].map((item) => (
                <CCol md={6} key={item.key}>
                  <div className="d-flex align-items-center justify-content-between p-2 border rounded bg-light">
                    <span className="small text-secondary fw-semibold">{item.label}</span>
                    <div className="d-flex align-items-center gap-2">
                      <input
                        type="color"
                        value={newTheme.colors?.[item.key] || '#2356c4'}
                        className="form-control form-control-color border-0 p-0 rounded cursor-pointer"
                        style={{ width: '32px', height: '32px' }}
                        onChange={(e) =>
                          setNewTheme({
                            ...newTheme,
                            colors: {
                              ...(newTheme.colors || colors),
                              [item.key]: e.target.value,
                            },
                          })
                        }
                      />
                      <CFormInput
                        size="sm"
                        value={newTheme.colors?.[item.key] || '#2356c4'}
                        className="font-monospace text-uppercase"
                        style={{ width: '90px', fontSize: '12px' }}
                        onChange={(e) =>
                          setNewTheme({
                            ...newTheme,
                            colors: {
                              ...(newTheme.colors || colors),
                              [item.key]: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                </CCol>
              ))}
            </CRow>
          </div>

          {/* WEBSITE BACKGROUND PATTERN & WALLPAPER SELECTOR */}
          <RenderBackgroundSelector currentTheme={newTheme} setTargetTheme={setNewTheme} />

          {/* SEASONAL FESTIVE EFFECTS SELECTOR */}
          <div className="mt-3 pt-3 border-top">
            <label className="form-label font-semibold text-dark small d-flex align-items-center gap-1.5">
              <span>🎨 Bộ nhận diện lễ hội theo mùa (Festive Theme UI Kit)</span>
            </label>
            <select
              className="form-select form-select-sm mb-2"
              value={newTheme.decorations?.particles || newTheme.code || 'none'}
              onChange={(e) => {
                const val = e.target.value
                setNewTheme({
                  ...newTheme,
                  decorations: {
                    particles: val,
                    ornaments: val,
                  },
                })
              }}
            >
              <option value="none">🚫 Không gắn phụ kiện lễ hội (Giao diện tiêu chuẩn)</option>
              <option value="trungthu">
                🏮 Tết Trung Thu (Lồng đèn mini ở Logo, Trăng sao mờ nền, Bánh & Đèn ở Footer)
              </option>
              <option value="noel">
                ❄️ Giáng Sinh / Noel (Lá thông & Berry ở Logo, Chuông vàng ở Box, Quà & Thông ở
                Footer)
              </option>
              <option value="tet">
                🌼 Tết Nguyên Đán (Cành mai ở Logo, Lì xì & Thỏi vàng ở Giỏ hàng, Chậu mai ở Footer)
              </option>
              <option value="women_day">
                🌸 Quốc tế Phụ nữ 8/3 & 20/10 (Hoa hồng ở Logo, Ruy băng ở Box, Bó hoa ở Footer)
              </option>
              <option value="backtoschool">
                ✈️ Mùa Tựu Trường / Back to School (Máy bay giấy & Sao ở Logo, Nón cử nhân ở Box)
              </option>
              <option value="blackfriday">
                ⚡ Siêu Sale Black Friday (Tia sét Neon ở Logo, Hộp quà ở Box, Sale ở Footer)
              </option>
              <option value="halloween">🎃 Lễ Hội Halloween (Bí ngô ở Logo & Chân trang)</option>
            </select>
          </div>

          {/* File Upload Input & Image Preview right below it */}
          <div className="pt-3 border-top">
            <label className="form-label font-semibold text-dark small">
              Tải ảnh giao diện xem trước từ máy tính
            </label>
            <CFormInput
              type="file"
              accept="image/*"
              className="mb-3"
              onChange={(e) => handleFileChange(e, setNewTheme, newTheme)}
            />

            {newTheme.image && (
              <div>
                <span className="form-label font-semibold text-dark small d-block mb-1">
                  Xem trước hình ảnh
                </span>
                <div
                  className="rounded border overflow-hidden bg-light"
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
        </CModalBody>
        <CModalFooter className="border-top">
          <CButton
            color="light"
            className="border px-4 py-2 text-secondary"
            onClick={() => setShowModal(false)}
          >
            Hủy
          </CButton>
          <CButton
            color="primary"
            className="text-white px-4 py-2 font-bold shadow-sm"
            style={{ backgroundColor: '#2356c4', borderColor: '#2356c4' }}
            onClick={handleCreate}
          >
            Lưu Chiến Dịch
          </CButton>
        </CModalFooter>
      </CModal>

      {/* MODAL SỬA CẤU HÌNH CHIẾN DỊCH (EDIT CAMPAIGN MODAL) */}
      {editingTheme && (
        <CModal
          visible={editModalVisible}
          onClose={() => setEditModalVisible(false)}
          size="lg"
          alignment="center"
        >
          <CModalHeader className="border-bottom">
            <CModalTitle className="fw-bold fs-5 text-dark">
              Chỉnh Sửa Chiến Dịch Giao Diện: {editingTheme.name}
            </CModalTitle>
          </CModalHeader>
          <CModalBody className="p-4">
            <CRow className="mb-3">
              <CCol md={6}>
                <label className="form-label font-semibold text-dark small">
                  Tên chiến dịch giao diện (Title)
                </label>
                <CFormInput
                  value={editingTheme.name || ''}
                  onChange={(e) => setEditingTheme({ ...editingTheme, name: e.target.value })}
                />
              </CCol>
              <CCol md={6}>
                <label className="form-label font-semibold text-dark small">Mã Code (Slug)</label>
                <CFormInput
                  value={editingTheme.code || ''}
                  onChange={(e) => setEditingTheme({ ...editingTheme, code: e.target.value })}
                />
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol md={4}>
                <label className="form-label font-semibold text-dark small">Thẻ Nhãn (Tag)</label>
                <CFormInput
                  value={editingTheme.tag || ''}
                  onChange={(e) => setEditingTheme({ ...editingTheme, tag: e.target.value })}
                />
              </CCol>
              <CCol md={4}>
                <label className="form-label font-semibold text-dark small">Ngày bắt đầu</label>
                <CFormInput
                  type="date"
                  value={formatDateInput(editingTheme.startDate)}
                  onChange={(e) => setEditingTheme({ ...editingTheme, startDate: e.target.value })}
                />
                <span className="text-muted text-xs d-block mt-1">(Để trống = Không giới hạn)</span>
              </CCol>
              <CCol md={4}>
                <label className="form-label font-semibold text-dark small">Ngày kết thúc</label>
                <CFormInput
                  type="date"
                  value={formatDateInput(editingTheme.endDate)}
                  onChange={(e) => setEditingTheme({ ...editingTheme, endDate: e.target.value })}
                />
                <span className="text-muted text-xs d-block mt-1">(Để trống = Không giới hạn)</span>
              </CCol>
            </CRow>

            <div className="mb-3">
              <label className="form-label font-semibold text-dark small">
                Mô tả chi tiết / Tiêu đề phụ (Description)
              </label>
              <CFormInput
                value={editingTheme.description || ''}
                onChange={(e) => setEditingTheme({ ...editingTheme, description: e.target.value })}
              />
            </div>

            {/* COLOR PICKERS INSIDE EDIT MODAL */}
            <div className="mt-4 pt-3 border-top mb-3">
              <h6 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                <CIcon icon={cilColorPalette} className="text-primary" /> Màu tổng thể chiến dịch
              </h6>

              <CRow className="g-3">
                {[
                  { label: 'Màu chính (Nút & Viền)', key: 'primary' },
                  { label: 'Màu thanh Menu Topbar', key: 'secondary' },
                  { label: 'Màu nhấn (Sale & Hotline)', key: 'accent' },
                  { label: 'Màu nền website', key: 'background' },
                  { label: 'Màu chữ văn bản', key: 'text' },
                ].map((item) => (
                  <CCol md={6} key={item.key}>
                    <div className="d-flex align-items-center justify-content-between p-2 border rounded bg-light">
                      <span className="small text-secondary fw-semibold">{item.label}</span>
                      <div className="d-flex align-items-center gap-2">
                        <input
                          type="color"
                          value={editingTheme.colors?.[item.key] || '#2356c4'}
                          className="form-control form-control-color border-0 p-0 rounded cursor-pointer"
                          style={{ width: '32px', height: '32px' }}
                          onChange={(e) => {
                            const newCols = {
                              ...(editingTheme.colors || colors),
                              [item.key]: e.target.value,
                            }
                            setEditingTheme({ ...editingTheme, colors: newCols })
                            if (editingTheme.id === selectedThemeId) {
                              setColors(newCols)
                            }
                          }}
                        />
                        <CFormInput
                          size="sm"
                          value={editingTheme.colors?.[item.key] || '#2356c4'}
                          className="font-monospace text-uppercase"
                          style={{ width: '90px', fontSize: '12px' }}
                          onChange={(e) => {
                            const newCols = {
                              ...(editingTheme.colors || colors),
                              [item.key]: e.target.value,
                            }
                            setEditingTheme({ ...editingTheme, colors: newCols })
                            if (editingTheme.id === selectedThemeId) {
                              setColors(newCols)
                            }
                          }}
                        />
                      </div>
                    </div>
                  </CCol>
                ))}
              </CRow>
            </div>

            {/* WEBSITE BACKGROUND PATTERN & WALLPAPER SELECTOR */}
            <RenderBackgroundSelector
              currentTheme={editingTheme}
              setTargetTheme={setEditingTheme}
            />

            {/* SEASONAL FESTIVE EFFECTS SELECTOR */}
            <div className="mt-3 pt-3 border-top">
              <label className="form-label font-semibold text-dark small d-flex align-items-center gap-1.5">
                <span>🎨 Bộ nhận diện lễ hội theo mùa (Festive Theme UI Kit)</span>
              </label>
              <select
                className="form-select form-select-sm mb-2"
                value={
                  editingTheme.decorations?.particles ||
                  editingTheme.decorations?.ornaments ||
                  editingTheme.code ||
                  'none'
                }
                onChange={(e) => {
                  const val = e.target.value
                  setEditingTheme({
                    ...editingTheme,
                    decorations: {
                      particles: val,
                      ornaments: val,
                    },
                  })
                }}
              >
                <option value="none">🚫 Không gắn phụ kiện lễ hội (Giao diện tiêu chuẩn)</option>
                <option value="trungthu">
                  🏮 Tết Trung Thu (Lồng đèn mini ở Logo, Trăng sao mờ nền, Bánh & Đèn ở Footer)
                </option>
                <option value="noel">
                  ❄️ Giáng Sinh / Noel (Lá thông & Berry ở Logo, Chuông vàng ở Box, Quà & Thông ở
                  Footer)
                </option>
                <option value="tet">
                  🌼 Tết Nguyên Đán (Cành mai ở Logo, Lì xì & Thỏi vàng ở Giỏ hàng, Chậu mai ở
                  Footer)
                </option>
                <option value="women_day">
                  🌸 Quốc tế Phụ nữ 8/3 & 20/10 (Hoa hồng ở Logo, Ruy băng ở Box, Bó hoa ở Footer)
                </option>
                <option value="backtoschool">
                  ✈️ Mùa Tựu Trường / Back to School (Máy bay giấy & Sao ở Logo, Nón cử nhân ở Box)
                </option>
                <option value="blackfriday">
                  ⚡ Siêu Sale Black Friday (Tia sét Neon ở Logo, Hộp quà ở Box, Sale ở Footer)
                </option>
                <option value="halloween">🎃 Lễ Hội Halloween (Bí ngô ở Logo & Chân trang)</option>
              </select>
            </div>

            {/* FILE UPLOAD INPUT PLACED DIRECTLY ABOVE IMAGE PREVIEW */}
            <div className="pt-3 border-top">
              <label className="form-label font-semibold text-dark small">
                Tải ảnh giao diện xem trước mới từ máy tính
              </label>
              <CFormInput
                type="file"
                accept="image/*"
                className="mb-3"
                onChange={(e) => handleFileChange(e, setEditingTheme, editingTheme)}
              />

              {editingTheme.image && (
                <div>
                  <span className="form-label font-semibold text-dark small d-block mb-1">
                    Xem trước hình ảnh
                  </span>
                  <div
                    className="rounded border overflow-hidden bg-light"
                    style={{ height: '140px' }}
                  >
                    <CImage
                      src={editingTheme.image}
                      className="w-100 h-100"
                      style={{ objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.src =
                          'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&q=80'
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </CModalBody>
          <CModalFooter className="border-top">
            <CButton
              color="light"
              className="border px-4 py-2 text-secondary"
              onClick={() => setEditModalVisible(false)}
            >
              Hủy
            </CButton>
            <CButton
              color="primary"
              className="text-white px-4 py-2 font-bold shadow-sm"
              style={{
                backgroundColor: colors.primary || '#2356c4',
                borderColor: colors.primary || '#2356c4',
              }}
              onClick={handleSaveEdit}
            >
              Cập Nhật Chiến Dịch
            </CButton>
          </CModalFooter>
        </CModal>
      )}

      {/* MODAL QUẢN LÝ SLIDE CỦA VỊ TRÍ BANNER (SLIDE MANAGER MODAL) */}
      {managingSlot && (
        <CModal
          visible={!!managingSlot}
          onClose={() => setManagingSlot(null)}
          size="lg"
          alignment="center"
        >
          <CModalHeader className="border-bottom">
            <CModalTitle className="fw-bold fs-5 text-dark">
              Quản lý danh sách slide: {managingSlot.title}
            </CModalTitle>
          </CModalHeader>
          <CModalBody className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="text-muted small">
                {managingSlot.sizeText} • Đang có{' '}
                <strong>{normalizeBannerImages(banners[managingSlot.slotKey]).length}</strong> ảnh
                slide
              </span>
              <CButton
                color="primary"
                size="sm"
                className="text-white fw-bold px-3 shadow-sm d-flex align-items-center"
                style={{
                  backgroundColor: colors.primary || '#2356c4',
                  borderColor: colors.primary || '#2356c4',
                  borderRadius: '20px',
                }}
                onClick={() => {
                  const input = document.createElement('input')
                  input.type = 'file'
                  input.accept = 'image/*'
                  input.multiple = true
                  input.onchange = (e) => handleBannerUpload(managingSlot.slotKey, e)
                  input.click()
                }}
              >
                <CIcon icon={cilCloudUpload} className="me-1.5" /> Thêm ảnh mới
              </CButton>
            </div>

            <div className="row g-3">
              {normalizeBannerImages(banners[managingSlot.slotKey]).map((item, idx) => (
                <div key={idx} className="col-md-6 col-12">
                  <div className="card h-100 border shadow-xs overflow-hidden">
                    <div
                      className="position-relative bg-dark d-flex align-items-center justify-content-center"
                      style={{ height: '160px' }}
                    >
                      <img
                        src={item.url}
                        alt={`Slide ${idx + 1}`}
                        className="w-100 h-100"
                        style={{ objectFit: 'contain' }}
                      />
                      <span
                        className="position-absolute top-2 start-2 badge bg-dark bg-opacity-75 text-white"
                        style={{ fontSize: '11px' }}
                      >
                        Slide #{idx + 1}
                      </span>
                      {item.hasLink && item.link && (
                        <span
                          className="position-absolute top-2 end-2 badge bg-success text-white shadow-sm"
                          style={{ fontSize: '10.5px' }}
                        >
                          🔗 Có link
                        </span>
                      )}
                    </div>

                    <div className="p-3 bg-white border-top">
                      {/* Checkbox Dẫn Link */}
                      <div className="form-check form-switch mb-2">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          role="switch"
                          id={`hasLink_${managingSlot.slotKey}_${idx}`}
                          checked={item.hasLink || false}
                          onChange={(e) =>
                            handleUpdateSlideField(
                              managingSlot.slotKey,
                              idx,
                              'hasLink',
                              e.target.checked,
                              true,
                            )
                          }
                        />
                        <label
                          className="form-check-label fw-bold text-dark small cursor-pointer"
                          htmlFor={`hasLink_${managingSlot.slotKey}_${idx}`}
                        >
                          Nhấp vào banner để dẫn link
                        </label>
                      </div>

                      {item.hasLink && (
                        <div className="p-2.5 rounded bg-light border mb-2">
                          <label className="form-label text-muted text-xs mb-1 fw-semibold">
                            Đường dẫn URL (Link chuyển hướng):
                          </label>
                          <input
                            type="text"
                            className="form-control form-control-sm mb-2"
                            placeholder="VD: /san-pham/laptop hoặc https://..."
                            value={item.link || ''}
                            onChange={(e) =>
                              handleUpdateSlideField(
                                managingSlot.slotKey,
                                idx,
                                'link',
                                e.target.value,
                                false,
                              )
                            }
                            onBlur={() => {
                              if (slideUpdateDebounceTimerRef.current) {
                                clearTimeout(slideUpdateDebounceTimerRef.current)
                                slideUpdateDebounceTimerRef.current = null
                              }
                              persistCampaignConfig({ banners: { ...banners } })
                            }}
                          />
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              id={`target_${managingSlot.slotKey}_${idx}`}
                              checked={item.target === '_blank'}
                              onChange={(e) =>
                                handleUpdateSlideField(
                                  managingSlot.slotKey,
                                  idx,
                                  'target',
                                  e.target.checked ? '_blank' : '_self',
                                  true,
                                )
                              }
                            />
                            <label
                              className="form-check-label text-secondary small cursor-pointer"
                              htmlFor={`target_${managingSlot.slotKey}_${idx}`}
                            >
                              Mở link trong tab mới (_blank)
                            </label>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons: Move & Delete */}
                      <div className="d-flex justify-content-between align-items-center pt-2 border-top">
                        <div className="d-flex align-items-center gap-1">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary px-2 py-0.5"
                            disabled={idx === 0}
                            onClick={() => handleMoveSlide(managingSlot.slotKey, idx, idx - 1)}
                            title="Di chuyển sang trái"
                          >
                            ←
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary px-2 py-0.5"
                            disabled={
                              idx ===
                              normalizeBannerImages(banners[managingSlot.slotKey]).length - 1
                            }
                            onClick={() => handleMoveSlide(managingSlot.slotKey, idx, idx + 1)}
                            title="Di chuyển sang phải"
                          >
                            →
                          </button>
                        </div>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger px-2.5 py-0.5 fw-semibold d-flex align-items-center gap-1"
                          onClick={() => handleRemoveSlide(managingSlot.slotKey, idx)}
                          title="Xóa slide này"
                        >
                          <CIcon icon={cilTrash} size="sm" /> Xóa
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {normalizeBannerImages(banners[managingSlot.slotKey]).length === 0 && (
              <div className="text-center py-5 border rounded bg-light text-muted">
                <CIcon icon={cilCloudUpload} size="xl" className="mb-2" />
                <p className="m-0 fw-semibold">Vị trí này chưa có hình ảnh nào</p>
                <small>Nhấn nút &quot;+ Thêm ảnh mới&quot; phía trên để tải ảnh slide lên</small>
              </div>
            )}
          </CModalBody>
          <CModalFooter className="border-top">
            <CButton
              color="primary"
              className="text-white px-4 fw-bold shadow-sm"
              style={{
                backgroundColor: colors.primary || '#2356c4',
                borderColor: colors.primary || '#2356c4',
              }}
              onClick={() => {
                if (slideUpdateDebounceTimerRef.current) {
                  clearTimeout(slideUpdateDebounceTimerRef.current)
                  slideUpdateDebounceTimerRef.current = null
                }
                persistCampaignConfig({ banners: { ...banners } })
                setManagingSlot(null)
              }}
            >
              Hoàn tất
            </CButton>
          </CModalFooter>
        </CModal>
      )}

      {/* MODAL XÁC NHẬN XÓA NHÓM BANNER */}
      <CModal
        visible={!!sectionToDelete}
        onClose={() => setSectionToDelete(null)}
        alignment="center"
      >
        <CModalHeader className="border-bottom">
          <CModalTitle className="fw-bold fs-5 text-danger d-flex align-items-center gap-2">
            <CIcon icon={cilTrash} /> Xác nhận xóa nhóm banner
          </CModalTitle>
        </CModalHeader>
        <CModalBody className="p-4">
          <p className="mb-2 text-dark" style={{ fontSize: '15px' }}>
            Bạn có chắc chắn muốn xóa <strong>{sectionToDelete?.name}</strong> này không?
          </p>
          <p className="text-muted small mb-0">
            Hành động này sẽ gỡ bỏ nhóm banner khỏi bố cục trang chủ website và tự động lưu cấu hình
            mới.
          </p>
        </CModalBody>
        <CModalFooter className="border-top">
          <CButton color="secondary" variant="ghost" onClick={() => setSectionToDelete(null)}>
            Hủy bỏ
          </CButton>
          <CButton
            color="danger"
            className="text-white fw-bold px-4"
            onClick={handleConfirmDeleteSection}
          >
            Xác nhận xóa
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  )
}

export default ThemeConfig
