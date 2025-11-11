import React, { useEffect, useState } from 'react'
import { cilColorBorder, cilTrash } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import {
  CButton,
  CCol,
  CContainer,
  CFormCheck,
  CFormSelect,
  CFormInput,
  CRow,
  CTable,
  CAccordion,
  CAccordionItem,
  CAccordionHeader,
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
  CAccordionBody,
} from '@coreui/react'
import { Link, useSearchParams } from 'react-router-dom'
import { axiosClient } from '../../axiosConfig'
import moment from 'moment/moment'

import ReactPaginate from 'react-paginate'
import DeletedModal from '../../components/deletedModal/DeletedModal'
import { toast } from 'react-toastify'

function ProductOutOfSync() {
  const [searchParams, setSearchParams] = useSearchParams()

  const [editModalVisible, setEditModalVisible] = useState(false)
  const [editRecord, setEditRecord] = useState(null)
  const [editForm, setEditForm] = useState({})

  // Lấy giá trị `page` từ URL hoặc mặc định là 1
  const pageFromUrl = parseInt(searchParams.get('page')) || 1
  const [pageNumber, setPageNumber] = useState(pageFromUrl)

  useEffect(() => {
    setSearchParams({ page: pageNumber })
  }, [pageNumber, setSearchParams])

  const [dataProductSkip, setDataProductSkip] = useState([])

  // check permission state
  const [isPermissionCheck, setIsPermissionCheck] = useState(true)

  const [selectedCategory, setSelectedCategory] = useState('')

  // show deleted Modal
  const [visible, setVisible] = useState(false)
  const [deletedId, setDeletedId] = useState(null)

  // checkbox selected
  const [isAllCheckbox, setIsAllCheckbox] = useState(false)
  const [selectedCheckbox, setSelectedCheckbox] = useState([])

  const [isCollapse, setIsCollapse] = useState(false)

  const handleToggleCollapse = () => {
    setIsCollapse((prevState) => !prevState)
  }

  // search input
  const [dataSearch, setDataSearch] = useState('')

  const handleEditClick = async (id) => {
    try {
      const res = await axiosClient.get(`admin/price-skip/${id}`)
      if (res.data.status === true) {
        setEditRecord(res.data.data)
        setEditForm(res.data.data)
        setEditModalVisible(true)
      }
    } catch (error) {
      toast.error('Không thể lấy dữ liệu chi tiết!')
    }
  }

  // search Data
  const handleSearch = (keyword) => {
    fetchDataProductSkip(keyword)
  }

  const fetchDataProductSkip = async (dataSearch = '') => {
    try {
      const response = await axiosClient.get(
        `admin/price-skip?search=${dataSearch}&page=${pageNumber}&type=${selectedCategory}`,
      )

      if (response.data.status === true) {
        setDataProductSkip(response.data)
      }

      if (response.data.status === false && response.data.mess == 'no permission') {
        setIsPermissionCheck(false)
      }
    } catch (error) {
      console.error('Fetch product skip data is error', error)
    }
  }

  useEffect(() => {
    fetchDataProductSkip()
  }, [pageNumber, selectedCategory])

  // pagination data
  const handlePageChange = ({ selected }) => {
    const newPage = selected + 1
    setPageNumber(newPage)
    window.scrollTo(0, 0)
  }

  // delete row
  const handleDelete = async () => {
    setVisible(true)
    try {
      const response = await axiosClient.delete(`admin/price-skip/${deletedId}`)
      if (response.data.status === true) {
        setVisible(false)
        fetchDataProductSkip()
      }

      if (response.data.status === false && response.data.mess == 'no permission') {
        toast.warn('Bạn không có quyền thực hiện tác vụ này!')
      }
    } catch (error) {
      console.error('Delete news id is error', error)
      toast.error('Đã xảy ra lỗi khi xóa. Vui lòng thử lại!')
    }
  }

  const handleDeleteSelectedCheckbox = async () => {
    try {
      const response = await axiosClient.post('admin/price-skip-delete', {
        data: selectedCheckbox,
      })
      if (response.data.status === true) {
        toast.success('Xóa tất cả các mục thành công!')
        fetchDataProductSkip()
        setSelectedCheckbox([])
      }
    } catch (error) {
      console.error('Deleted all id checkbox is error', error)
    }
  }

  const items =
    dataProductSkip?.data && dataProductSkip?.data?.length > 0
      ? dataProductSkip?.data.map((item) => ({
          id: (
            <CFormCheck
              key={item?.id}
              aria-label="Default select example"
              defaultChecked={item?.id}
              id={`flexCheckDefault_${item?.id}`}
              value={item?.id}
              checked={selectedCheckbox.includes(item?.id)}
              onChange={(e) => {
                const newsId = item?.id
                const isChecked = e.target.checked
                if (isChecked) {
                  setSelectedCheckbox([...selectedCheckbox, newsId])
                } else {
                  setSelectedCheckbox(selectedCheckbox.filter((id) => id !== newsId))
                }
              }}
            />
          ),
          title: <div>{item?.TenHH}</div>,
          macn: (
            <div>
              <span className="macn-color">{item?.MaHH}</span>
            </div>
          ),
          type: (
            <div className="cate-color">
              {item?.type === 'skip' ? 'Điêu chỉnh giá' : 'So sánh giá'}
            </div>
          ),

          price: <div>{item?.price ? Number(item.price).toLocaleString('vi-VN') : 0} đ</div>,

          info: (
            <div>
              <div>{moment.unix(item?.created_at).format('DD-MM-YYYY')}</div>
            </div>
          ),
          actions: (
            <div className="d-flex">
              <button
                onClick={() => handleEditClick(item.id)}
                className="button-action mr-2 bg-info"
              >
                <CIcon icon={cilColorBorder} className="text-white" />
              </button>
              <button
                onClick={() => {
                  setVisible(true)
                  setDeletedId(item.id)
                }}
                className="button-action bg-danger"
              >
                <CIcon icon={cilTrash} className="text-white" />
              </button>
            </div>
          ),
          _cellProps: { id: { scope: 'row' } },
        }))
      : []

  const columns = [
    {
      key: 'id',
      label: (
        <>
          <CFormCheck
            aria-label="Select all"
            checked={isAllCheckbox}
            onChange={(e) => {
              const isChecked = e.target.checked
              setIsAllCheckbox(isChecked)
              if (isChecked) {
                const allIds = dataProductSkip?.data.map((item) => item.news_id) || []
                setSelectedCheckbox(allIds)
              } else {
                setSelectedCheckbox([])
              }
            }}
          />
        </>
      ),
      _props: { scope: 'col' },
    },
    {
      key: 'title',
      label: 'Tên sản phẩm',
      _props: { scope: 'col' },
    },
    {
      key: 'macn',
      label: 'Mã sản phẩm',
      _props: { scope: 'col' },
    },
    {
      key: 'type',
      label: 'Loại',
      _props: { scope: 'col' },
    },
    {
      key: 'price',
      label: 'Giá sản phẩm',
      _props: { scope: 'col' },
    },

    {
      key: 'actions',
      label: 'Tác vụ',
      _props: { scope: 'col' },
    },
  ]

  // Thêm state cho import Excel
  const [valueForm, setValueForm] = useState(null)
  const [currentUploads, setCurrentUploads] = useState({})

  // Thêm hàm xử lý file upload
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

  // Thêm hàm xử lý submit
  const handleImportSubmit = async () => {
    if (!valueForm) {
      alert('Vui lòng chọn file Excel để tải lên!')
      return
    }

    const formData = new FormData()
    formData.append('file', valueForm)

    try {
      const response = await axiosClient.post('admin/import-price-skip', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      const result = response.data
      console.log('result', result)

      if (result.status === true) {
        alert('Tải lên thành công!')
      } else {
        alert('Tải lên thành công!, nhưng có lỗi về dữ liệu.')
      }
      setCurrentUploads({
        date: result.imported_at,
        fileName: result.filename,
        importedCount: result.imported_count,
        message: result.message,
        notFoundCount: result.not_found_count,
        notFoundProducts: result.not_found_product,
      })
      fetchDataProductSkip()
    } catch (error) {
      console.error(error)
      alert('Đã xảy ra lỗi khi kết nối đến server.')
    }
  }

  const handleEditFormChange = (e) => {
    const { name, value } = e.target
    setEditForm((prev) => ({ ...prev, [name]: value }))
  }

  // Call api put to update product skip
  const handleEditSave = async () => {
    try {
      const res = await axiosClient.put(`admin/price-skip/${editRecord.id}`, editForm)
      if (res.data.status === true) {
        setEditModalVisible(false)
        setEditRecord(null)
        setEditForm({})
        fetchDataProductSkip()
        toast.success('Cập nhật thành công!')
      } else {
        toast.error('Cập nhật thất bại!')
      }
    } catch (error) {
      toast.error('Có lỗi khi cập nhật!')
    }
  }

  const handleEditModalClose = () => {
    setEditModalVisible(false)
    setEditRecord(null)
    setEditForm({})
  }

  return (
    <div>
      {!isPermissionCheck ? (
        <h5>
          <div>Bạn không đủ quyền để thao tác trên danh mục quản trị này.</div>
          <div className="mt-4">
            Vui lòng quay lại trang chủ <Link to={'/dashboard'}>(Nhấn vào để quay lại)</Link>
          </div>
        </h5>
      ) : (
        <>
          <DeletedModal visible={visible} setVisible={setVisible} onDelete={handleDelete} />

          <CRow className="mb-3">
            <CCol>
              <h3>QUẢN LÝ SẢN PHẨM KHÔNG ĐỒNG BỘ</h3>
            </CCol>
            <CCol md={6}>
              <div className="d-flex justify-content-end">
                <Link to={'/product-out-of-sync'}>
                  <CButton color="primary" type="submit" size="sm">
                    Danh sách
                  </CButton>
                </Link>
              </div>
            </CCol>
          </CRow>

          {/* Thêm phần Import Excel */}
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
                    <strong>Yêu cầu định dạng:</strong> Chọn file Excel cần upload, đảm bảo theo
                    đúng bản Excel mẫu.
                  </li>
                  <li>
                    <strong>Bước 1:</strong> Chọn file Excel cần import.
                  </li>
                  <li>
                    <strong>Bước 2:</strong> Đảm bảo điền đầy đủ thông tin cột Mã kho và cột Loại
                    trong file Excel.
                  </li>
                  <li>
                    <strong>Bước 3:</strong> Nhấn nút <strong>Tải lên để import</strong> vào
                    database.
                  </li>
                </ul>
                <p className="mb-0">
                  <strong>Lưu ý:</strong> Nếu thành công sẽ hiển thị thông báo{' '}
                  <span className="text-success fw-bold">Thành công</span>. Nếu có lỗi sẽ hiển thị{' '}
                  <span className="text-danger fw-bold">thông báo upload lỗi</span>.
                </p>
              </div>
            </CCol>
          </CRow>

          <CRow className="mb-3 mt-3">
            <img className="w-100 h-100" src="/excel_not_sync.png" alt="File excel mẫu" />
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
            <CCol md={12} className="d-flex justify-content-center">
              <CButton
                style={{
                  fontSize: 16,
                }}
                onClick={handleImportSubmit}
                size="sm"
                color="primary"
              >
                Tải lên để import
              </CButton>
            </CCol>
          </CRow>

          {/* Hiển thị kết quả import */}
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

          <CRow>
            <CCol>
              <table className="filter-table">
                <thead>
                  <tr>
                    <th colSpan="2">
                      <div className="d-flex justify-content-between">
                        <span>Bộ lọc tìm kiếm</span>
                        <span className="toggle-pointer" onClick={handleToggleCollapse}>
                          {isCollapse ? '▼' : '▲'}
                        </span>
                      </div>
                    </th>
                  </tr>
                </thead>
                {!isCollapse && (
                  <tbody>
                    <tr>
                      <td>Tổng cộng</td>
                      <td className="total-count">{dataProductSkip?.pagination?.total}</td>
                    </tr>
                    <tr>
                      <td>Lọc theo loại sản phẩm</td>
                      <td>
                        <CFormSelect
                          className="component-size w-50"
                          aria-label="Chọn loại lọc"
                          options={[
                            { label: 'Chọn loại lọc', value: '' },
                            { label: 'Điều chỉnh giá', value: 'skip' },
                            { label: 'So sánh giá', value: 'adjustment' },
                          ]}
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td>Tìm kiếm</td>
                      <td>
                        <input
                          type="text"
                          className="search-input"
                          value={dataSearch}
                          onChange={(e) => setDataSearch(e.target.value)}
                        />
                        <button onClick={() => handleSearch(dataSearch)} className="submit-btn">
                          Submit
                        </button>
                      </td>
                    </tr>
                  </tbody>
                )}
              </table>
            </CCol>

            <CCol md={12} className="mt-3">
              <CButton onClick={handleDeleteSelectedCheckbox} color="primary" size="sm">
                Xóa vĩnh viễn
              </CButton>
            </CCol>

            <CCol>
              <CTable hover className="mt-3" columns={columns} items={items} />
            </CCol>

            <div className="d-flex justify-content-end">
              <ReactPaginate
                pageCount={Math.ceil(dataProductSkip?.pagination?.total / 10)}
                pageRangeDisplayed={3}
                marginPagesDisplayed={1}
                pageClassName="page-item"
                pageLinkClassName="page-link"
                previousClassName="page-item"
                previousLinkClassName="page-link"
                nextClassName="page-item"
                nextLinkClassName="page-link"
                breakLabel="..."
                breakClassName="page-item"
                breakLinkClassName="page-link"
                onPageChange={handlePageChange}
                containerClassName={'pagination'}
                activeClassName={'active'}
                previousLabel={'<<'}
                nextLabel={'>>'}
                forcePage={pageNumber - 1}
              />
            </div>
          </CRow>

          <CModal visible={editModalVisible} onClose={handleEditModalClose}>
            <CModalHeader closeButton>
              <strong>Cập nhật sản phẩm</strong>
            </CModalHeader>
            <CModalBody>
              {editForm && (
                <>
                  <div className="mb-2">
                    <label>Tên sản phẩm</label>
                    <CFormInput
                      name="TenHH"
                      value={editForm.TenHH || ''}
                      onChange={handleEditFormChange}
                    />
                  </div>
                  <div className="mb-2">
                    <label>Mã sản phẩm</label>
                    <CFormInput
                      name="MaHH"
                      value={editForm.MaHH || ''}
                      onChange={handleEditFormChange}
                    />
                  </div>
                  <div className="mb-2">
                    <label>Giá</label>
                    <CFormInput
                      name="price"
                      value={editForm.price || ''}
                      onChange={handleEditFormChange}
                    />
                  </div>
                </>
              )}
            </CModalBody>
            <CModalFooter>
              <CButton color="secondary" size="sm" onClick={handleEditModalClose}>
                Đóng
              </CButton>
              <CButton color="primary" size="sm" onClick={handleEditSave}>
                Lưu thay đổi
              </CButton>
            </CModalFooter>
          </CModal>
        </>
      )}
    </div>
  )
}

export default ProductOutOfSync
