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
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import { toast } from 'react-toastify'

const MenuCategory = () => {
  const [showModal, setShowModal] = useState(false)
  const [menuItems, setMenuItems] = useState([
    {
      id: 1,
      name: 'Trang chủ',
      link: '/',
      order: 1,
      position: 'Header Top',
      status: 'Hiển thị',
    },
    {
      id: 2,
      name: 'Danh mục sản phẩm',
      link: '/san-pham',
      order: 2,
      position: 'Header Main',
      status: 'Hiển thị',
    },
    {
      id: 3,
      name: 'Tin khuyến mãi',
      link: '/tin-khuyen-mai',
      order: 3,
      position: 'Header Main',
      status: 'Hiển thị',
    },
    {
      id: 4,
      name: 'Xây dựng cấu hình',
      link: '/xay-dung-cau-hinh',
      order: 4,
      position: 'Header Main',
      status: 'Hiển thị',
    },
    {
      id: 5,
      name: 'Dịch vụ & Bảo hành',
      link: '/dich-vu',
      order: 5,
      position: 'Footer Column 1',
      status: 'Hiển thị',
    },
  ])

  const [newItem, setNewItem] = useState({ name: '', link: '', position: 'Header Main', order: 1 })

  const handleAdd = () => {
    if (!newItem.name) {
      toast.warn('Vui lòng nhập tên menu!')
      return
    }
    setMenuItems((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: newItem.name,
        link: newItem.link || '#',
        order: Number(newItem.order),
        position: newItem.position,
        status: 'Hiển thị',
      },
    ])
    setShowModal(false)
    setNewItem({ name: '', link: '', position: 'Header Main', order: 1 })
    toast.success('Thêm menu thành công!')
  }

  const handleDelete = (id) => {
    setMenuItems((prev) => prev.filter((item) => item.id !== id))
    toast.info('Đã xóa menu!')
  }

  return (
    <div>
      <CRow className="mb-3 align-items-center">
        <CCol md={8}>
          <h3 className="font-bold text-uppercase">MENU & DANH MỤC GIAO DIỆN</h3>
          <p className="text-medium-emphasis">
            Quản lý các menu điều hướng trên Header, Sidebar và Chân trang Website
          </p>
        </CCol>
        <CCol md={4} className="text-end">
          <CButton
            color="danger"
            className="text-white font-bold"
            onClick={() => setShowModal(true)}
          >
            + Thêm Menu Mới
          </CButton>
        </CCol>
      </CRow>

      <CCard className="mb-4">
        <CCardHeader className="fw-bold">Danh sách Menu hiện tại</CCardHeader>
        <CCardBody>
          <CTable align="middle" className="mb-0 border" hover responsive>
            <CTableHead color="light">
              <CTableRow>
                <CTableHeaderCell>#</CTableHeaderCell>
                <CTableHeaderCell>Tên Menu</CTableHeaderCell>
                <CTableHeaderCell>Đường dẫn (URL)</CTableHeaderCell>
                <CTableHeaderCell>Vị trí</CTableHeaderCell>
                <CTableHeaderCell>Thứ tự</CTableHeaderCell>
                <CTableHeaderCell>Trạng thái</CTableHeaderCell>
                <CTableHeaderCell className="text-center">Thao tác</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {menuItems.map((item, idx) => (
                <CTableRow key={item.id}>
                  <CTableDataCell>{idx + 1}</CTableDataCell>
                  <CTableDataCell className="fw-bold text-primary">{item.name}</CTableDataCell>
                  <CTableDataCell>{item.link}</CTableDataCell>
                  <CTableDataCell>
                    <CBadge color="info">{item.position}</CBadge>
                  </CTableDataCell>
                  <CTableDataCell>{item.order}</CTableDataCell>
                  <CTableDataCell>
                    <CBadge color="success">{item.status}</CBadge>
                  </CTableDataCell>
                  <CTableDataCell className="text-center">
                    <CButton
                      color="danger"
                      size="sm"
                      className="text-white"
                      onClick={() => handleDelete(item.id)}
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

      {/* Modal Thêm */}
      <CModal visible={showModal} onClose={() => setShowModal(false)}>
        <CModalHeader>
          <CModalTitle>Thêm Menu Mới</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <div className="mb-3">
            <label className="form-label font-bold">Tên Menu</label>
            <CFormInput
              placeholder="VD: Sản phẩm Hot, Tuyển dụng..."
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            />
          </div>
          <div className="mb-3">
            <label className="form-label font-bold">Đường dẫn (URL)</label>
            <CFormInput
              placeholder="VD: /san-pham-hot"
              value={newItem.link}
              onChange={(e) => setNewItem({ ...newItem, link: e.target.value })}
            />
          </div>
          <div className="mb-3">
            <label className="form-label font-bold">Vị trí hiển thị</label>
            <CFormSelect
              value={newItem.position}
              onChange={(e) => setNewItem({ ...newItem, position: e.target.value })}
            >
              <option value="Header Main">Header Main (Thanh chính)</option>
              <option value="Header Top">Header Top (Thanh trên)</option>
              <option value="Sidebar Category">Sidebar Danh mục</option>
              <option value="Footer Column 1">Footer Cột 1</option>
              <option value="Footer Column 2">Footer Cột 2</option>
            </CFormSelect>
          </div>
          <div className="mb-3">
            <label className="form-label font-bold">Thứ tự ưu tiên</label>
            <CFormInput
              type="number"
              value={newItem.order}
              onChange={(e) => setNewItem({ ...newItem, order: e.target.value })}
            />
          </div>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowModal(false)}>
            Hủy
          </CButton>
          <CButton color="danger" className="text-white" onClick={handleAdd}>
            Lưu Menu
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  )
}

export default MenuCategory
