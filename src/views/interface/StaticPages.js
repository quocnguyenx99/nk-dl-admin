import React, { useState } from 'react'
import {
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import { toast } from 'react-toastify'

const StaticPages = () => {
  const [pages, setPages] = useState([
    {
      id: 1,
      title: 'Giới thiệu về Nguyên Kim',
      slug: 'gioi-thieu',
      updatedAt: '2026-08-10',
      status: 'Xuất bản',
    },
    {
      id: 2,
      title: 'Chính sách bảo hành & Đổi trả',
      slug: 'chinh-sach-bao-hanh',
      updatedAt: '2026-08-12',
      status: 'Xuất bản',
    },
    {
      id: 3,
      title: 'Hướng dẫn mua hàng & Thanh toán',
      slug: 'huong-dan-mua-hang',
      updatedAt: '2026-08-14',
      status: 'Xuất bản',
    },
    {
      id: 4,
      title: 'Chính sách bảo mật thông tin',
      slug: 'chinh-sach-bao-mat',
      updatedAt: '2026-08-15',
      status: 'Xuất bản',
    },
    {
      id: 5,
      title: 'Giải pháp Công nghệ doanh nghiệp',
      slug: 'giai-phap-doanh-nghiep',
      updatedAt: '2026-08-16',
      status: 'Nháp',
    },
  ])

  const handleDelete = (id) => {
    setPages((prev) => prev.filter((p) => p.id !== id))
    toast.info('Đã xóa trang tĩnh!')
  }

  return (
    <div>
      <CRow className="mb-3 align-items-center">
        <CCol md={8}>
          <h3 className="font-bold text-uppercase">QUẢN LÝ TRANG TĨNH</h3>
          <p className="text-medium-emphasis">
            Tạo và chỉnh sửa nội dung các trang chính sách, giới thiệu, hướng dẫn mua hàng
          </p>
        </CCol>
        <CCol md={4} className="text-end">
          <CButton
            color="danger"
            className="text-white font-bold"
            onClick={() => toast.info('Tính năng tạo trang mới')}
          >
            + Tạo Trang Tĩnh Mới
          </CButton>
        </CCol>
      </CRow>

      <CCard className="mb-4">
        <CCardHeader className="fw-bold">Danh sách Trang Tĩnh Website</CCardHeader>
        <CCardBody>
          <CTable align="middle" className="mb-0 border" hover responsive>
            <CTableHead color="light">
              <CTableRow>
                <CTableHeaderCell>#</CTableHeaderCell>
                <CTableHeaderCell>Tiêu đề trang</CTableHeaderCell>
                <CTableHeaderCell>Đường dẫn (Slug)</CTableHeaderCell>
                <CTableHeaderCell>Ngày cập nhật</CTableHeaderCell>
                <CTableHeaderCell>Trạng thái</CTableHeaderCell>
                <CTableHeaderCell className="text-center">Thao tác</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {pages.map((p, idx) => (
                <CTableRow key={p.id}>
                  <CTableDataCell>{idx + 1}</CTableDataCell>
                  <CTableDataCell className="fw-bold text-dark">{p.title}</CTableDataCell>
                  <CTableDataCell className="text-primary">/{p.slug}</CTableDataCell>
                  <CTableDataCell>{p.updatedAt}</CTableDataCell>
                  <CTableDataCell>
                    <CBadge color={p.status === 'Xuất bản' ? 'success' : 'warning'}>
                      {p.status}
                    </CBadge>
                  </CTableDataCell>
                  <CTableDataCell className="text-center">
                    <CButton
                      color="info"
                      size="sm"
                      className="text-white me-2"
                      onClick={() => toast.success(`Đang mở trang ${p.title}`)}
                    >
                      Sửa
                    </CButton>
                    <CButton
                      color="danger"
                      size="sm"
                      className="text-white"
                      onClick={() => handleDelete(p.id)}
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

export default StaticPages
