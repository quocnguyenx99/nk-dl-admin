import React, { useState } from 'react'
import {
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CImage,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import { toast } from 'react-toastify'

const BannerManager = () => {
  const [banners, setBanners] = useState([
    {
      id: 1,
      title: 'Banner Khuyến Mãi Tết IT 2027',
      position: 'Banner Slide Chính',
      image: '/uploads/banner-1.jpg',
      link: '/tin-khuyen-mai',
      status: 'Hiển thị',
    },
    {
      id: 2,
      title: 'Banner Nhóm 4 Ô - Laptop Mới',
      position: 'Group 4 Banners',
      image: '/uploads/banner-2.jpg',
      link: '/san-pham/laptop',
      status: 'Hiển thị',
    },
    {
      id: 3,
      title: 'Banner Nhóm 3 Ô - Máy Chủ Server',
      position: 'Group 3 Banners',
      image: '/uploads/banner-3.jpg',
      link: '/san-pham/may-chu',
      status: 'Hiển thị',
    },
    {
      id: 4,
      title: 'Banner Popup Quảng Cáo Trang Chủ',
      position: 'Popup Chào Mừng',
      image: '/uploads/banner-4.jpg',
      link: '/khuyen-mai-dac-biet',
      status: 'Hiển thị',
    },
  ])

  const handleDelete = (id) => {
    setBanners((prev) => prev.filter((b) => b.id !== id))
    toast.info('Đã xóa Banner!')
  }

  return (
    <div>
      <CRow className="mb-3 align-items-center">
        <CCol md={8}>
          <h3 className="font-bold text-uppercase">QUẢN LÝ BANNER GIAO DIỆN</h3>
          <p className="text-medium-emphasis">
            Quản lý hình ảnh Slider chính, Banner quảng cáo nhóm và Banner Popup trên Trang chủ
          </p>
        </CCol>
        <CCol md={4} className="text-end">
          <CButton
            color="danger"
            className="text-white font-bold"
            onClick={() => toast.info('Mở form thêm Banner mới')}
          >
            + Thêm Banner Mới
          </CButton>
        </CCol>
      </CRow>

      <CCard className="mb-4">
        <CCardHeader className="fw-bold">Danh sách Banner Đang Hoạt Động</CCardHeader>
        <CCardBody>
          <CTable align="middle" className="mb-0 border" hover responsive>
            <CTableHead color="light">
              <CTableRow>
                <CTableHeaderCell>#</CTableHeaderCell>
                <CTableHeaderCell>Tên Banner</CTableHeaderCell>
                <CTableHeaderCell>Vị trí Banner</CTableHeaderCell>
                <CTableHeaderCell>Liên kết (Link)</CTableHeaderCell>
                <CTableHeaderCell>Trạng thái</CTableHeaderCell>
                <CTableHeaderCell className="text-center">Thao tác</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {banners.map((b, idx) => (
                <CTableRow key={b.id}>
                  <CTableDataCell>{idx + 1}</CTableDataCell>
                  <CTableDataCell className="fw-bold text-dark">{b.title}</CTableDataCell>
                  <CTableDataCell>
                    <CBadge color="primary">{b.position}</CBadge>
                  </CTableDataCell>
                  <CTableDataCell className="text-primary">{b.link}</CTableDataCell>
                  <CTableDataCell>
                    <CBadge color="success">{b.status}</CBadge>
                  </CTableDataCell>
                  <CTableDataCell className="text-center">
                    <CButton
                      color="info"
                      size="sm"
                      className="text-white me-2"
                      onClick={() => toast.success(`Mở chỉnh sửa ${b.title}`)}
                    >
                      Sửa
                    </CButton>
                    <CButton
                      color="danger"
                      size="sm"
                      className="text-white"
                      onClick={() => handleDelete(b.id)}
                    >
                      Xóa
                    </CButton>
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        </CCardBody>
      </CCard>
    </div>
  )
}

export default BannerManager
