import {
  CButton,
  CCol,
  CContainer,
  CFormInput,
  CFormSelect,
  CAccordion,
  CAccordionItem,
  CAccordionHeader,
  CAccordionBody,
  CRow,
} from '@coreui/react'
import React, { useEffect, useState } from 'react'
import './css/adminExcelUpdatePrice.css'
import { axiosClient } from '../../axiosConfig'

function AdminExcelUpdatePrice() {
  const [valueForm, setValueForm] = useState(null)

  const [categoryList, setCategoryList] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [currentUploads, setCurrentUploads] = useState({})

  const fetchCategoryList = async () => {
    try {
      const response = await axiosClient.get(`admin/category`)
      if (response.data && response.data.status === true) {
        setCategoryList(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching category list:', error)
    }
  }

  useEffect(() => {
    fetchCategoryList()
  }, [])

  const onFileChange = (e) => {
    const file = e.target.files[0]
    const allowedTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ]

    if (file && !allowedTypes.includes(file.type)) {
      alert('Vui lòng chọn file Excel có định dạng .xls hoặc .xlsx')
      return
    }

    setValueForm(file)
  }

  const handleSubmit = async () => {
    if (!valueForm) {
      alert('Vui lòng chọn file Excel để tải lên!')
      return
    }

    if (!selectedCategory) {
      alert('Vui lòng chọn ngành hàng!')
      return
    }

    const formData = new FormData()
    formData.append('file', valueForm)
    formData.append('cat_parent_id', selectedCategory)

    try {
      const response = await axiosClient.post('admin/import-technology', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      const result = response.data
      if (result.status === true) {
        alert('Tải lên thành công!')
        setCurrentUploads({
          date: result.imported_at,
          fileName: result.filename,
          importedCount: result.imported_count,
          message: result.message,
          notFoundCount: result.not_found_count,
          notFoundProducts: result.not_found_product,
        })
      }
    } catch (error) {
      console.error(error)
      alert('Đã xảy ra lỗi khi kết nối đến server.')
    }
  }

  return (
    <div>
      <CRow className="mb-3">
        <CCol md={12}>
          <h3>CẬP NHẬT THÔNG SỐ KỸ THUẬT SẢN PHẨM</h3>
        </CCol>
      </CRow>

      <CRow className="mb-4">
        <CCol md={12}>
          <div
            className="p-3"
            style={{
              backgroundColor: '#eaf4fc',
              borderLeft: '5px solid #0d6efd',
              lineHeight: '1.6',
            }}
          >
            <h5 className="fw-bold mb-2">📘 Hướng dẫn và quy định upload</h5>
            <ul className="mb-2">
              <li>
                <strong>Yêu cầu định dạng:</strong> Các file import thông số kỹ thuật phải có các
                trường (column) tương ứng với các trường thông số kỹ thuật của ngành hàng cần cập
                nhật.
              </li>
              <li>
                <strong>Bước 1:</strong> Chọn file cần import thông số kỹ thuật.
              </li>
              <li>
                <strong>Bước 2:</strong> Chọn ngành hàng tương ứng.
              </li>
              <li>
                <strong>Bước 3:</strong> Nhấn nút <strong>Tải lên! bắt đầu xử lý</strong> để import
                file vào database.
              </li>
            </ul>
            <p className="mb-0">
              <strong>Lưu ý:</strong> Nếu thành công sẽ hiển thị thông báo{' '}
              <span className="text-success fw-bold">Thành công</span>. Nếu có lỗi sẽ hiển thị{' '}
              <span className="text-danger fw-bold">nội dung lỗi hoặc mã không tìm thấy</span>.
            </p>
          </div>
        </CCol>
      </CRow>

      <CRow className="mb-3">
        <CCol md={3}>
          <div className="title_admin">
            <span>File excel có định dạng *.xls hoặc *.xlsx</span>
          </div>
        </CCol>
        <CCol md={4}>
          <div className="value_admin">
            <CFormInput
              onChange={onFileChange}
              size="sm"
              type="file"
              id="formFile"
              accept=".xls,.xlsx"
              label={null}
            />
          </div>
        </CCol>
      </CRow>

      <CRow className="mb-3">
        <CCol md={3}>
          <div className="title_admin">
            <span>Ngành hàng</span>
          </div>
        </CCol>
        <CCol md={4}>
          <div className="value_admin">
            <CFormSelect
              size="sm"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="" disabled>
                -- Chọn ngành hàng --
              </option>
              {categoryList.map((cat) => (
                <option key={cat?.category_desc?.cat_id} value={cat?.category_desc?.cat_id}>
                  {cat?.category_desc?.cat_name}
                </option>
              ))}
            </CFormSelect>
          </div>
        </CCol>
      </CRow>

      <CRow className="mb-3">
        <CCol md={3}>
          <div className="title_admin">
            <span>File excel mẫu</span>
          </div>
        </CCol>
        <CCol md={9}>
          <div className="value_admin">
            <img className="w-100 h-100" src="/excel_import_tskt.png" alt="File excel mẫu" />
          </div>
        </CCol>
      </CRow>

      <CRow className="mb-3">
        <CCol md={12} className="d-flex justify-content-center">
          <CButton
            style={{
              fontSize: 16,
            }}
            onClick={handleSubmit}
            size="sm"
            color="primary"
          >
            Tải lên! bắt đầu xử lý
          </CButton>
        </CCol>
      </CRow>

      {/* ✅ Accordion */}
      <CRow className="mb-3">
        <CCol md={12}>
          <h5 className="mb-3 mt-4">📂 Danh sách lần import</h5>
          {currentUploads && Object.keys(currentUploads).length > 0 && (
            <CAccordion alwaysOpen>
              <CAccordionItem className="border mb-2" style={{ borderRadius: 0 }}>
                <CAccordionHeader>
                  <div className="d-flex justify-content-between align-items-center w-100 px-2">
                    <div style={{ flex: '0 0 40%' }} className="fw-semibold">
                      {`Ngày ${currentUploads.date}`}
                    </div>
                    <div style={{ flex: '0 0 40%' }}>{currentUploads.fileName}</div>
                    <div
                      className={`fw-bold text-${currentUploads.message === 'success' ? 'success' : 'danger'}`}
                      style={{ fontSize: '1rem', flex: '0 0 20%' }}
                    >
                      {currentUploads.message === 'success' ? 'Thành công' : 'Lỗi'}
                    </div>
                  </div>
                </CAccordionHeader>
                <CAccordionBody
                  className="py-3 px-4"
                  style={{
                    backgroundColor:
                      currentUploads.message === 'success'
                        ? 'rgba(25,135,84,0.1)'
                        : 'rgba(220,53,69,0.1)',
                    fontSize: '1rem',
                  }}
                >
                  <div className="mt-2">
                    <strong>{`Đã import ${currentUploads.importedCount} sản phẩm.`}</strong>
                  </div>
                  {currentUploads.notFoundCount > 0 && (
                    <div className="mt-2">
                      <strong>{`Có ${currentUploads.notFoundCount} sản phẩm không tìm thấy.`}</strong>
                      <div className="mt-2">
                        <strong>Danh sách mã không tìm thấy: </strong>
                        <span>{currentUploads.notFoundProducts}</span>
                      </div>
                    </div>
                  )}
                </CAccordionBody>
              </CAccordionItem>
            </CAccordion>
          )}
        </CCol>
      </CRow>
    </div>
  )
}

export default AdminExcelUpdatePrice
