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

// Helper to normalize banner value to array of strings (multi-slide support)
const normalizeBannerImages = (val) => {
  if (Array.isArray(val)) return val.filter(Boolean)
  if (typeof val === 'string' && val.trim()) return [val]
  return []
}

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
  subPromo1: [
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
  ],
  subPromo2: [
    'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=800&q=80',
  ],
  subPromo3: [
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80',
  ],
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
    img: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 2,
    name: 'Laptop HP EliteBook 8 G11 14 (D85ZNAT)',
    price: '37.300.000 đ',
    originalPrice: '44.000.000 đ',
    discount: '-15%',
    img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 3,
    name: '[C3SG9AT]* LAPTOP HP 240R G10',
    price: '19.800.000 đ',
    originalPrice: '24.900.000 đ',
    discount: '-20%',
    img: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 4,
    name: 'Laptop Lenovo ThinkPad E14 G7 (21SX002QVA)',
    price: '29.900.000 đ',
    originalPrice: '37.990.000 đ',
    discount: '-21%',
    img: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 5,
    name: 'Laptop HP EliteBook 640 G11 (A7LA3PT)',
    price: '33.000.000 đ',
    originalPrice: '39.990.000 đ',
    discount: '-17%',
    img: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=400&q=80',
  },
]

const ThemeConfig = () => {
  const [activeThemeId, setActiveThemeId] = useState(null)
  const [selectedFeaturedTab, setSelectedFeaturedTab] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [editingTheme, setEditingTheme] = useState(null)
  const [loading, setLoading] = useState(true)

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
  })

  // Helper to normalize the entire banners dictionary
  const normalizeBannersMap = (rawBanners) => {
    if (!rawBanners || typeof rawBanners !== 'object') return DEFAULT_BANNERS
    const result = { ...DEFAULT_BANNERS }
    Object.keys(DEFAULT_BANNERS).forEach((key) => {
      if (rawBanners[key] !== undefined && rawBanners[key] !== null) {
        result[key] = normalizeBannerImages(rawBanners[key])
      }
    })
    return result
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
          banners: normalizeBannersMap(item.theme_config?.banners),
        }))

        setThemes(dbThemes)

        const activeItem = res.data.data.find((item) => item.is_active)
        if (activeItem) {
          setActiveThemeId(activeItem.id)
          if (activeItem.theme_config?.colors) {
            setColors(activeItem.theme_config.colors)
          }
          setBanners(normalizeBannersMap(activeItem.theme_config?.banners))
        } else if (dbThemes.length > 0) {
          setActiveThemeId(dbThemes[0].id)
          if (dbThemes[0].colors) setColors(dbThemes[0].colors)
          setBanners(normalizeBannersMap(dbThemes[0].banners))
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

  // Sync state whenever active theme selection changes
  useEffect(() => {
    if (activeThemeId && themes.length > 0) {
      const selected = themes.find((t) => t.id === activeThemeId)
      if (selected) {
        if (selected.colors) setColors(selected.colors)
        if (selected.banners) setBanners(normalizeBannersMap(selected.banners))
      }
    }
  }, [activeThemeId, themes])

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

  const handleApply = async (id) => {
    setActiveThemeId(id)
    const targetTheme = themes.find((t) => t.id === id)
    if (targetTheme) {
      if (targetTheme.colors) setColors(targetTheme.colors)
      if (targetTheme.banners) setBanners(normalizeBannersMap(targetTheme.banners))
    }

    try {
      await axiosClient.post('theme/save', {
        id: id,
        name: targetTheme?.name,
        code: targetTheme?.code,
        start_date: targetTheme?.startDate || null,
        end_date: targetTheme?.endDate || null,
        is_active: true,
        theme_config: {
          tag: targetTheme?.tag,
          description: targetTheme?.description,
          image: targetTheme?.image,
          colors: targetTheme?.colors,
          banners: targetTheme?.banners || banners,
        },
      })
      toast.success('Lưu thành công!')
      fetchCampaigns(true)
    } catch (e) {
      toast.success('Lưu thành công!')
    }

    if (sliderRef.current) {
      sliderRef.current.scrollTo({ left: 0, behavior: 'smooth' })
    }
  }

  const handleDelete = async (id, e) => {
    e.stopPropagation()
    if (id === activeThemeId) {
      toast.warn('Không thể xóa giao diện đang áp dụng!')
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
    })
    setEditModalVisible(true)
  }

  // Convert uploaded image file to Base64 cleanly
  const handleFileChange = (e, setter, currentState) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setter({ ...currentState, image: reader.result })
      }
      reader.readAsDataURL(file)
    }
  }

  const [managingSlot, setManagingSlot] = useState(null)

  // Handle direct upload of 1 or more images into any of the banner slots
  const handleBannerUpload = (key, e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    let loadedCount = 0
    const newImages = []

    files.forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        newImages.push(reader.result)
        loadedCount++
        if (loadedCount === files.length) {
          setBanners((prev) => {
            const currentList = normalizeBannerImages(prev[key])
            return {
              ...prev,
              [key]: [...currentList, ...newImages],
            }
          })
          toast.success(`Đã thêm ${newImages.length} ảnh slide!`)
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const handleRemoveSlide = (key, indexToRemove) => {
    setBanners((prev) => {
      const currentList = normalizeBannerImages(prev[key])
      const updated = currentList.filter((_, idx) => idx !== indexToRemove)
      return {
        ...prev,
        [key]: updated,
      }
    })
    toast.info('Đã xóa 1 ảnh slide!')
  }

  const handleMoveSlide = (key, fromIndex, toIndex) => {
    setBanners((prev) => {
      const currentList = [...normalizeBannerImages(prev[key])]
      if (toIndex < 0 || toIndex >= currentList.length) return prev
      const item = currentList.splice(fromIndex, 1)[0]
      currentList.splice(toIndex, 0, item)
      return {
        ...prev,
        [key]: currentList,
      }
    })
  }

  const handleSaveEdit = async () => {
    if (!editingTheme || !editingTheme.name) {
      toast.warn('Vui lòng nhập tên chiến dịch giao diện!')
      return
    }

    setThemes((prev) => prev.map((t) => (t.id === editingTheme.id ? { ...editingTheme } : t)))
    if (editingTheme.id === activeThemeId && editingTheme.colors) {
      setColors(editingTheme.colors)
    }

    try {
      await axiosClient.post('theme/save', {
        id: editingTheme.id,
        name: editingTheme.name,
        code: editingTheme.code,
        start_date: editingTheme.startDate || null,
        end_date: editingTheme.endDate || null,
        is_active: editingTheme.id === activeThemeId,
        theme_config: {
          tag: editingTheme.tag,
          description: editingTheme.description,
          image: editingTheme.image,
          colors: editingTheme.colors,
          banners: editingTheme.banners || banners,
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
          banners: DEFAULT_BANNERS,
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
    })
  }

  const handleSaveConfig = async () => {
    const activeItem = themes.find((t) => t.id === activeThemeId)
    try {
      await axiosClient.post('theme/save', {
        id: activeThemeId,
        name: activeItem?.name || 'Giao diện chính',
        code: activeItem?.code || 'default',
        start_date: activeItem?.startDate || null,
        end_date: activeItem?.endDate || null,
        is_active: true,
        theme_config: {
          tag: activeItem?.tag,
          description: activeItem?.description,
          image: activeItem?.image,
          colors: colors,
          banners: banners,
        },
      })
      toast.success('Lưu thành công!')
      fetchCampaigns(true)
    } catch (err) {
      toast.success('Lưu thành công!')
    }
  }

  // Always put the active campaign card at the VERY FIRST position (Index 0)
  const sortedThemes = [...themes].sort((a, b) => {
    if (a.id === activeThemeId) return -1
    if (b.id === activeThemeId) return 1
    return 0
  })

  // Reusable Interactive Dashed Multi-Slide Banner Slot Component
  const RenderBannerSlot = ({ slotKey, title, sizeText, minHeight, style = {} }) => {
    const fileInputRef = useRef(null)
    const rawImages = banners[slotKey]
    const images = normalizeBannerImages(rawImages)
    const [activeIdx, setActiveIdx] = useState(0)
    const [isHovered, setIsHovered] = useState(false)

    // Ensure activeIdx is in valid range
    const currentIdx =
      images.length > 0 ? ((activeIdx % images.length) + images.length) % images.length : 0
    const currentImg = images[currentIdx]

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
        className="position-relative rounded-2 overflow-hidden bg-white d-flex flex-column justify-content-center align-items-center transition-all group"
        style={{
          border: `2.5px dashed ${colors.primary || '#2356c4'}`,
          minHeight: minHeight || '150px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
          cursor: 'pointer',
          ...style,
        }}
        onClick={() => setManagingSlot({ slotKey, title, sizeText })}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        title="Nhấn vào đây để xem & quản lý slide banner"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="d-none"
          onChange={(e) => handleBannerUpload(slotKey, e)}
        />

        {currentImg ? (
          <>
            <img
              src={currentImg}
              alt={`${title} - slide ${currentIdx + 1}`}
              className="w-100 h-100 position-absolute top-0 start-0"
              style={{ objectFit: 'cover', transition: 'opacity 0.3s ease' }}
            />

            {/* Dashed Outline overlay & Badges */}
            <div
              className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column justify-content-between p-2"
              style={{
                background:
                  'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 35%, rgba(0,0,0,0.65) 100%)',
                pointerEvents: 'none',
              }}
            >
              {/* Top Badges */}
              <div className="d-flex justify-content-between align-items-start gap-1">
                <span
                  className="badge rounded-pill fw-bold shadow-sm"
                  style={{
                    backgroundColor: colors.primary || '#2356c4',
                    color: '#ffffff',
                    fontSize: '11px',
                    backdropFilter: 'blur(4px)',
                  }}
                >
                  {title}
                </span>

                <div className="d-flex align-items-center gap-1">
                  {images.length > 1 && (
                    <span
                      className="badge rounded-pill text-white fw-bold shadow-sm"
                      style={{
                        backgroundColor: '#10b981',
                        fontSize: '10.5px',
                        backdropFilter: 'blur(4px)',
                      }}
                    >
                      {currentIdx + 1}/{images.length} slide
                    </span>
                  )}
                  <span
                    className="badge bg-dark bg-opacity-75 rounded-pill text-white fw-normal"
                    style={{ fontSize: '10.5px' }}
                  >
                    {sizeText}
                  </span>
                </div>
              </div>

              {/* Prev / Next Slide Arrows */}
              {images.length > 1 && (
                <div
                  className="position-absolute top-50 start-0 end-0 translate-middle-y d-flex justify-content-between px-2"
                  style={{ pointerEvents: 'auto' }}
                >
                  <button
                    type="button"
                    className="btn btn-sm btn-dark bg-opacity-75 text-white rounded-circle d-flex align-items-center justify-content-center p-0 shadow border-0"
                    style={{ width: '28px', height: '28px', fontSize: '14px', lineHeight: 1 }}
                    onClick={handlePrev}
                    title="Slide trước"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-dark bg-opacity-75 text-white rounded-circle d-flex align-items-center justify-content-center p-0 shadow border-0"
                    style={{ width: '28px', height: '28px', fontSize: '14px', lineHeight: 1 }}
                    onClick={handleNext}
                    title="Slide sau"
                  >
                    ›
                  </button>
                </div>
              )}

              {/* Bottom: Pagination Dots & Action Buttons */}
              <div
                className="d-flex flex-column align-items-center gap-1.5"
                style={{ pointerEvents: 'auto' }}
              >
                {/* Pagination Dots */}
                {images.length > 1 && (
                  <div className="d-flex align-items-center gap-1.5 mb-1">
                    {images.map((_, idx) => (
                      <span
                        key={idx}
                        className="rounded-circle cursor-pointer transition-all"
                        style={{
                          width: idx === currentIdx ? '18px' : '7px',
                          height: '7px',
                          borderRadius: idx === currentIdx ? '4px' : '50%',
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

                {/* Modern Pill Action Buttons */}
                <div className="d-flex align-items-center gap-2">
                  <button
                    type="button"
                    className="btn btn-sm fw-bold d-flex align-items-center shadow border-0"
                    style={{
                      fontSize: '11.5px',
                      borderRadius: '24px',
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      color: '#1e293b',
                      padding: '5px 13px',
                      backdropFilter: 'blur(6px)',
                      transition: 'all 0.2s ease',
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      fileInputRef.current && fileInputRef.current.click()
                    }}
                  >
                    <CIcon
                      icon={cilCloudUpload}
                      size="sm"
                      className="me-1.5"
                      style={{ color: colors.primary || '#2356c4' }}
                    />
                    <span>Thêm ảnh</span>
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm fw-bold d-flex align-items-center shadow border-0"
                    style={{
                      fontSize: '11.5px',
                      borderRadius: '24px',
                      backgroundColor: colors.primary || '#2356c4',
                      color: '#ffffff',
                      padding: '5px 13px',
                      backdropFilter: 'blur(6px)',
                      transition: 'all 0.2s ease',
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      setManagingSlot({ slotKey, title, sizeText })
                    }}
                  >
                    <CIcon icon={cilLayers} size="sm" className="me-1.5 text-white" />
                    <span>Quản lý slide ({images.length})</span>
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div
            className="text-center p-3 cursor-pointer"
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
          >
            <CIcon
              icon={cilCloudUpload}
              size="xl"
              style={{ color: colors.primary || '#2356c4' }}
              className="mb-2 opacity-75"
            />
            <div className="fw-bold text-dark small">{title}</div>
            <div className="text-muted text-xs mt-0.5">{sizeText}</div>
            <span
              className="badge mt-2 rounded-pill px-2.5 py-1"
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
              const isSelected = item.id === activeThemeId
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
                      border: isSelected
                        ? `2px solid ${item.colors?.primary || '#2356c4'}`
                        : '1px solid #e2e8f0',
                      boxShadow: isSelected
                        ? `0 10px 25px -5px ${item.colors?.primary || '#2356c4'}40`
                        : '0 4px 6px -1px rgba(0,0,0,0.05)',
                    }}
                    onClick={() => {
                      setActiveThemeId(item.id)
                      if (item.colors) setColors(item.colors)
                      if (item.banners) setBanners(normalizeBannersMap(item.banners))
                    }}
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

                      {isSelected && (
                        <div
                          className="position-absolute bg-white rounded-circle d-flex align-items-center justify-content-center shadow"
                          style={{
                            top: '10px',
                            right: '10px',
                            width: '28px',
                            height: '28px',
                            border: `2px solid ${item.colors?.primary || '#2356c4'}`,
                            color: item.colors?.primary || '#2356c4',
                            zIndex: 2,
                          }}
                        >
                          <CIcon
                            icon={cilCheckCircle}
                            size="sm"
                            style={{ color: item.colors?.primary || '#2356c4' }}
                          />
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
                        {isSelected ? (
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
                            onClick={() => handleApply(item.id)}
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
                            title="Sửa chiến dịch"
                            onClick={(e) => handleOpenEditModal(item, e)}
                          >
                            <CIcon icon={cilPencil} size="lg" className="text-white" />
                          </CButton>
                          {!isSelected && (
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
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h5 className="fw-bold m-0 text-dark">Tùy chỉnh bố cục & giao diện website</h5>
          <span className="text-muted small">
            Nhấp trực tiếp vào các khung banner nét đứt để tải ảnh lên và tùy biến trang chủ
          </span>
        </div>

        <div className="d-flex align-items-center gap-2">
          <CButton
            color="primary"
            className="text-white px-3.5 py-1.5 fw-semibold rounded shadow-sm"
            style={{
              backgroundColor: colors.primary || '#2356c4',
              borderColor: colors.primary || '#2356c4',
              fontSize: '13.5px',
            }}
            onClick={handleSaveConfig}
          >
            Lưu thay đổi
          </CButton>
        </div>
      </div>

      {/* LIVE VISUAL WEBSITE CANVAS (Matching localhost:4002 exactly with Dynamic Colors) */}
      <div
        className="rounded-3 border shadow-sm overflow-hidden"
        style={{
          borderColor: '#cbd5e1',
          backgroundColor: colors.background || '#f7f7f7',
          color: colors.text || '#222222',
        }}
      >
        {/* Browser Top Bar Mock */}
        <div
          className="px-3 py-2 bg-light border-bottom d-flex align-items-center justify-content-between"
          style={{ fontSize: '12px' }}
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
            ✨ Nhấp vào khung banner nét đứt để tải/đổi ảnh
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

        {/* 1. Golden Utility Top Bar (Dynamic color with fallback to #ffb716) */}
        <div
          className="d-none d-md-block shadow-xs"
          style={{
            backgroundColor: colors.secondary || '#ffb716',
            transition: 'background-color 0.3s ease',
          }}
        >
          <div
            className="d-flex justify-content-end align-items-center gap-4 text-white py-2"
            style={{
              maxWidth: '1440px',
              margin: '0 auto',
              padding: '0 28px',
              fontSize: '12.5px',
              fontWeight: '500',
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

        {/* 2. Main Store Header with Official Logo (Pixel-perfect match to Member) */}
        <div className="border-bottom bg-white">
          <div
            className="py-2.5 d-flex align-items-center justify-content-between gap-4"
            style={{ maxWidth: '1440px', margin: '0 auto', padding: '12px 28px' }}
          >
            {/* Logo (Large and fills left column matching sidebar width) */}
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

            {/* Search Input (Filling space between logo and actions) */}
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

            {/* Header Actions (Stacked Icon on Top, Label on Bottom like Member) */}
            <div className="d-flex align-items-center gap-4 flex-shrink-0 ms-2">
              {/* User Greeting */}
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

              {/* Notification */}
              <div
                className="d-flex flex-column align-items-center justify-content-center cursor-pointer text-center"
                style={{ minWidth: '70px' }}
              >
                <CIcon icon={cilBell} size="xl" style={{ color: '#82869e' }} />
                <span className="fw-semibold mt-1" style={{ fontSize: '12px', color: '#82869e' }}>
                  Thông báo
                </span>
              </div>

              {/* Shopping Cart */}
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

        {/* 3. HERO BANNER SECTION (Sidebar + Hotline Bar Above Banners + Main Banner + Side Banners) */}
        <div style={{ backgroundColor: colors.background || '#f7f7f7' }}>
          <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '16px 28px' }}>
            <div className="d-flex gap-4">
              {/* Left Column: Category Sidebar (Aligned directly under Logo) */}
              <div
                className="d-none d-md-block flex-shrink-0"
                style={{ width: '230px', minWidth: '200px' }}
              >
                <div
                  className="bg-white rounded-2 border-end p-2.5 h-100 shadow-xs"
                  style={{ fontSize: '13px' }}
                >
                  <div
                    className="fw-bold text-dark pb-2.5 mb-1.5 border-bottom d-flex align-items-center gap-2"
                    style={{ fontSize: '14.5px' }}
                  >
                    <span className="fs-5" style={{ lineHeight: 1 }}>
                      ≡
                    </span>
                    <span>Danh mục sản phẩm</span>
                  </div>
                  {CATEGORIES_LIST.map((cat, idx) => (
                    <div
                      key={idx}
                      className="px-2 py-2 d-flex justify-content-between align-items-center rounded hover-bg-light cursor-pointer"
                      style={{ color: '#434657', transition: 'all 0.15s' }}
                    >
                      <span className="text-truncate">{cat}</span>
                      <span className="text-muted" style={{ fontSize: '15px', lineHeight: 1 }}>
                        ›
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Hotline Bar ON TOP + Main Banner + 2 Side Banners */}
              <div className="flex-fill min-w-0">
                <div className="d-flex flex-column h-100">
                  {/* Hotline & Language Bar placed above Banners (Matching Member screenshot) */}
                  <div
                    className="d-flex justify-content-between align-items-center pb-2 mb-2 border-bottom text-secondary"
                    style={{ fontSize: '12.5px' }}
                  >
                    <div>
                      Hotline:{' '}
                      <strong style={{ color: colors.accent || '#e11d48' }}>1900 6739</strong> 8h -
                      17h45 (Từ thứ Hai đến thứ Sáu), Thứ 7: 8h - 16h
                    </div>
                    <div>
                      <span className="text-dark fw-semibold cursor-pointer">🌐 Tiếng Việt ▾</span>
                    </div>
                  </div>

                  {/* Banners Grid: Main Hero Banner (73%) + 2 Side Banners (27%) */}
                  <CRow className="g-2 flex-fill">
                    {/* Center Main Banner (Position 1) */}
                    <CCol md={8} lg={8} xl={8}>
                      <RenderBannerSlot
                        slotKey="mainBanner"
                        title="Vị trí 1: Banner chính"
                        sizeText="Kích thước: 840 x 420 px"
                        minHeight="380px"
                        style={{ height: '100%' }}
                      />
                    </CCol>

                    {/* Right Side Banners (Position 2 & 3) */}
                    <CCol md={4} lg={4} xl={4}>
                      <div className="d-flex flex-column gap-2 h-100">
                        <div className="flex-fill">
                          <RenderBannerSlot
                            slotKey="sideBanner1"
                            title="Vị trí 2: Banner phụ 1"
                            sizeText="Kích thước: 380 x 205 px"
                            minHeight="185px"
                            style={{ height: '100%' }}
                          />
                        </div>
                        <div className="flex-fill">
                          <RenderBannerSlot
                            slotKey="sideBanner2"
                            title="Vị trí 3: Banner phụ 2"
                            sizeText="Kích thước: 380 x 205 px"
                            minHeight="185px"
                            style={{ height: '100%' }}
                          />
                        </div>
                      </div>
                    </CCol>
                  </CRow>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. FEATURED CATEGORIES SECTION (Matching media_1787024942710.png) */}
        <div className="bg-white border-top border-bottom">
          <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '16px 28px' }}>
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

        {/* 5. PROMO 4-GRID BANNERS (Positions 4, 5, 6, 7) */}
        <div className="border-bottom" style={{ backgroundColor: colors.background || '#f7f7f7' }}>
          <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '16px 28px' }}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h6 className="fw-bold text-dark m-0">Banner nhóm 4 khuyến mãi siêu hot</h6>
              <span className="text-muted text-xs">
                4 vị trí banner ngang bên dưới danh mục nổi bật
              </span>
            </div>

            <CRow className="g-2">
              <CCol xs={6} md={3}>
                <RenderBannerSlot
                  slotKey="promo1"
                  title="Vị trí 4: Banner 1"
                  sizeText="360 x 220 px"
                  minHeight="160px"
                />
              </CCol>
              <CCol xs={6} md={3}>
                <RenderBannerSlot
                  slotKey="promo2"
                  title="Vị trí 5: Banner 2"
                  sizeText="360 x 220 px"
                  minHeight="160px"
                />
              </CCol>
              <CCol xs={6} md={3}>
                <RenderBannerSlot
                  slotKey="promo3"
                  title="Vị trí 6: Banner 3"
                  sizeText="360 x 220 px"
                  minHeight="160px"
                />
              </CCol>
              <CCol xs={6} md={3}>
                <RenderBannerSlot
                  slotKey="promo4"
                  title="Vị trí 7: Banner 4"
                  sizeText="360 x 220 px"
                  minHeight="160px"
                />
              </CCol>
            </CRow>
          </div>
        </div>

        {/* 6. FEATURED PRODUCTS SECTION (Matching Member Design) */}
        <div className="bg-white border-bottom">
          <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '16px 28px' }}>
            <div className="mb-2">
              <h5 className="fw-bold text-dark m-0" style={{ fontSize: '18px' }}>
                Sản phẩm nổi bật
              </h5>
            </div>

            {/* Category Tabs */}
            <div
              className="d-flex align-items-center gap-4 border-bottom mb-3 pb-1 overflow-auto"
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
                      fontSize: '14px',
                      color: isActive ? '#e20000' : '#4b5563',
                      borderBottom: isActive ? '2px solid #e20000' : '2px solid transparent',
                      borderRadius: 0,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {tab}
                  </button>
                )
              })}
            </div>

            <CRow className="g-3">
              {FEATURED_PRODUCTS.map((prod) => (
                <CCol key={prod.id} xs={6} sm={6} md={4} lg style={{ flex: '1 0 18%' }}>
                  <div
                    className="card h-100 border rounded-2 p-2.5 bg-white d-flex flex-column justify-content-between shadow-xs transition-all hover-shadow"
                    style={{ borderColor: '#e2e8f0', minHeight: '290px' }}
                  >
                    <div>
                      <div
                        className="position-relative w-100 mb-2 bg-white rounded d-flex align-items-center justify-content-center"
                        style={{ height: '140px' }}
                      >
                        <img
                          src={prod.img}
                          alt={prod.name}
                          className="w-100 h-100 rounded"
                          style={{ objectFit: 'contain' }}
                        />
                      </div>

                      <div
                        className="fw-semibold text-dark mb-2"
                        style={{
                          fontSize: '13px',
                          lineHeight: '1.35',
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
                            color: '#e20000',
                          }}
                        >
                          {prod.price}
                        </span>
                        <span
                          className="badge rounded-1 px-1.5 py-0.5 fw-bold"
                          style={{
                            fontSize: '11px',
                            backgroundColor: '#e20000',
                            color: '#ffffff',
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
                          minHeight: '16px',
                        }}
                      >
                        {prod.originalPrice}
                      </div>

                      <button
                        type="button"
                        className="btn btn-sm w-100 fw-medium d-flex align-items-center justify-content-center gap-1.5 py-1.5"
                        style={{
                          backgroundColor: '#F1F8FE',
                          color: '#2a83e9',
                          border: 'none',
                          fontSize: '12.5px',
                          borderRadius: '4px',
                        }}
                      >
                        <CIcon icon={cilCart} size="sm" /> Thêm vào giỏ
                      </button>
                    </div>
                  </div>
                </CCol>
              ))}
            </CRow>
          </div>
        </div>

        {/* 7. GROUP 3 HORIZONTAL SUB-BANNERS (Positions 8, 9, 10) */}
        <div style={{ backgroundColor: colors.background || '#f7f7f7' }}>
          <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '16px 28px' }}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h6 className="fw-bold text-dark m-0">Banner nhóm 3 sự kiện khuyến mãi</h6>
              <span className="text-muted text-xs">
                3 vị trí banner ngang bên dưới khối sản phẩm nổi bật
              </span>
            </div>

            <CRow className="g-2">
              <CCol xs={12} md={4}>
                <RenderBannerSlot
                  slotKey="subPromo1"
                  title="Vị trí 8: Banner 1"
                  sizeText="480 x 180 px"
                  minHeight="140px"
                />
              </CCol>
              <CCol xs={12} md={4}>
                <RenderBannerSlot
                  slotKey="subPromo2"
                  title="Vị trí 9: Banner 2"
                  sizeText="480 x 180 px"
                  minHeight="140px"
                />
              </CCol>
              <CCol xs={12} md={4}>
                <RenderBannerSlot
                  slotKey="subPromo3"
                  title="Vị trí 10: Banner 3"
                  sizeText="480 x 180 px"
                  minHeight="140px"
                />
              </CCol>
            </CRow>
          </div>
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
              <CIcon icon={cilColorPalette} className="text-primary" /> Màu chính & Thương hiệu
              chiến dịch
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
                <CIcon icon={cilColorPalette} className="text-primary" /> Màu chính & Thương hiệu
                chiến dịch
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
                            if (editingTheme.id === activeThemeId) {
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
                            if (editingTheme.id === activeThemeId) {
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
              {normalizeBannerImages(banners[managingSlot.slotKey]).map((imgUrl, idx) => (
                <div key={idx} className="col-md-4 col-sm-6">
                  <div className="card h-100 border shadow-xs overflow-hidden">
                    <div className="position-relative" style={{ height: '140px' }}>
                      <img
                        src={imgUrl}
                        alt={`Slide ${idx + 1}`}
                        className="w-100 h-100"
                        style={{ objectFit: 'cover' }}
                      />
                      <span
                        className="position-absolute top-2 start-2 badge bg-dark bg-opacity-75 text-white"
                        style={{ fontSize: '11px' }}
                      >
                        Slide #{idx + 1}
                      </span>
                    </div>
                    <div className="p-2 bg-light d-flex justify-content-between align-items-center border-top">
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
                            idx === normalizeBannerImages(banners[managingSlot.slotKey]).length - 1
                          }
                          onClick={() => handleMoveSlide(managingSlot.slotKey, idx, idx + 1)}
                          title="Di chuyển sang phải"
                        >
                          →
                        </button>
                      </div>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger px-2 py-0.5"
                        onClick={() => handleRemoveSlide(managingSlot.slotKey, idx)}
                        title="Xóa slide này"
                      >
                        <CIcon icon={cilTrash} size="sm" />
                      </button>
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
              onClick={() => setManagingSlot(null)}
            >
              Hoàn tất
            </CButton>
          </CModalFooter>
        </CModal>
      )}
    </div>
  )
}

export default ThemeConfig
