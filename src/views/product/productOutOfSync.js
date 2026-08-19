import React, { useEffect, useState } from 'react'
import { cilColorBorder, cilTrash, cilPlus, cilCloudUpload } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import {
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CFormCheck,
  CFormInput,
  CFormSelect,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CRow,
  CTable,
  CAccordion,
  CAccordionItem,
  CAccordionHeader,
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

  // Modal edit states
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [editRecord, setEditRecord] = useState(null)
  const [editForm, setEditForm] = useState({})

  // Modal add states
  const [addModalVisible, setAddModalVisible] = useState(false)
  const [addForm, setAddForm] = useState({
    MaHH: '',
    TenHH: '',
    price: '',
    type: 'skip',
  })

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
        setEditForm({
          TenHH: res.data.data.TenHH || '',
          MaHH: res.data.data.MaHH || '',
          price: res.data.data.price || '',
          type: res.data.data.type || 'skip',
        })
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

  const handleResetFilter = () => {
    setSelectedCategory('')
    setDataSearch('')
  }

  const fetchDataProductSkip = async (searchKeyword = '') => {
    try {
      const querySearch = searchKeyword !== '' ? searchKeyword : dataSearch
      const response = await axiosClient.get(
        `admin/price-skip?search=${querySearch}&page=${pageNumber}&type=${selectedCategory}`,
      )

      if (response.data.status === true) {
        setDataProductSkip(response.data)
      }

      if (response.data.status === false && response.data.mess === 'no permission') {
        setIsPermissionCheck(false)
      }
    } catch (error) {
      console.error('Fetch product skip data error', error)
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
        toast.success('Xóa sản phẩm thành công!')
      }

      if (response.data.status === false && response.data.mess === 'no permission') {
        toast.warn('Bạn không có quyền thực hiện tác vụ này!')
      }
    } catch (error) {
      console.error('Delete item error', error)
      toast.error('Đã xảy ra lỗi khi xóa. Vui lòng thử lại!')
    }
  }

  const handleDeleteSelectedCheckbox = async () => {
    if (selectedCheckbox.length === 0) {
      toast.warn('Vui lòng chọn ít nhất 1 sản phẩm để xóa!')
      return
    }
    try {
      const response = await axiosClient.post('admin/price-skip-delete', {
        ids: selectedCheckbox,
        data: selectedCheckbox,
      })
      if (response.data.status === true) {
        toast.success('Xóa tất cả các mục thành công!')
        fetchDataProductSkip()
        setSelectedCheckbox([])
      }
    } catch (error) {
      console.error('Deleted all selected items error', error)
    }
  }

  const items =
    dataProductSkip?.data && dataProductSkip?.data?.length > 0
      ? dataProductSkip?.data.map((item) => ({
          id: (
            <CFormCheck
              key={item?.id}
              aria-label="Select row"
              id={`flexCheckDefault_${item?.id}`}
              value={item?.id}
              checked={selectedCheckbox.includes(item?.id)}
              onChange={(e) => {
                const itemId = item?.id
                const isChecked = e.target.checked
                if (isChecked) {
                  setSelectedCheckbox([...selectedCheckbox, itemId])
                } else {
                  setSelectedCheckbox(selectedCheckbox.filter((id) => id !== itemId))
                }
              }}
            />
          ),
          title: <div className="fw-semibold text-dark">{item?.TenHH || 'Chưa cập nhật tên'}</div>,
          macn: (
            <div>
              <span className="badge bg-light text-primary border border-primary px-2 py-1 fs-6">
                {item?.MaHH}
              </span>
            </div>
          ),
          type: (
            <div>
              <CBadge color={item?.type === 'skip' ? 'warning' : 'info'} className="px-2 py-1 fs-6">
                {item?.type === 'skip'
                  ? 'Điều chỉnh giá'
                  : item?.type === 'adjustment'
                  ? 'So sánh giá'
                  : item?.type || 'Điều chỉnh giá'}
              </CBadge>
            </div>
          ),

          price: (
            <div className="fw-bold text-danger">
              {item?.price ? Number(item.price).toLocaleString('vi-VN') : 0} đ
            </div>
          ),

          info: (
            <div className="text-secondary small">
              {item?.created_at ? moment.unix(item.created_at).format('DD-MM-YYYY HH:mm') : '---'}
            </div>
          ),
          actions: (
            <div className="d-flex gap-1">
              <CButton
                size="sm"
                color="info"
                className="text-white p-1"
                onClick={() => handleEditClick(item.id)}
                title="Chỉnh sửa"
              >
                <CIcon icon={cilColorBorder} />
              </CButton>
              <CButton
                size="sm"
                color="danger"
                className="text-white p-1"
                onClick={() => {
                  setVisible(true)
                  setDeletedId(item.id)
                }}
                title="Xóa"
              >
                <CIcon icon={cilTrash} />
              </CButton>
            </div>
          ),
          _cellProps: { id: { scope: 'row' } },
        }))
      : []

  const columns = [
    {
      key: 'id',
      label: (
        <CFormCheck
          aria-label="Select all"
          checked={isAllCheckbox}
          onChange={(e) => {
            const isChecked = e.target.checked
            setIsAllCheckbox(isChecked)
            if (isChecked) {
              const allIds = dataProductSkip?.data.map((item) => item.id) || []
              setSelectedCheckbox(allIds)
            } else {
              setSelectedCheckbox([])
            }
          }}
        />
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
      label: 'Loại điều chỉnh',
      _props: { scope: 'col' },
    },
    {
      key: 'price',
      label: 'Giá sản phẩm',
      _props: { scope: 'col' },
    },
    {
      key: 'info',
      label: 'Ngày tạo',
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

  // Thêm hàm xử lý submit import
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

      if (result.status === true) {
        toast.success('Tải lên thành công!')
      } else {
        toast.warn('Tải lên hoàn tất, có một số ghi chú dữ liệu.')
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
      toast.error('Đã xảy ra lỗi khi kết nối đến server.')
    }
  }

  // Handlers Edit Form
  const handleEditFormChange = (e) => {
    const { name, value } = e.target
    setEditForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleEditSave = async () => {
    if (!editForm.MaHH) {
      toast.error('Mã sản phẩm không được để trống!')
      return
    }
    if (!editForm.price || Number(editForm.price) < 1000) {
      toast.error('Giá sản phẩm không hợp lệ (tối thiểu 1000)!')
      return
    }
    if (!editForm.type) {
      toast.error('Vui lòng chọn loại điều chỉnh!')
      return
    }

    try {
      const res = await axiosClient.put(`admin/price-skip/${editRecord.id}`, editForm)
      if (res.data.status === true) {
        setEditModalVisible(false)
        setEditRecord(null)
        setEditForm({})
        fetchDataProductSkip()
        toast.success('Cập nhật sản phẩm thành công!')
      } else {
        toast.error(res.data.message || 'Cập nhật thất bại!')
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Có lỗi khi cập nhật!')
    }
  }

  const handleEditModalClose = () => {
    setEditModalVisible(false)
    setEditRecord(null)
    setEditForm({})
  }

  // Handlers Add Form
  const handleAddFormChange = (e) => {
    const { name, value } = e.target
    setAddForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddSave = async () => {
    if (!addForm.MaHH) {
      toast.error('Vui lòng nhập mã sản phẩm!')
      return
    }
    if (!addForm.price || Number(addForm.price) < 1000) {
      toast.error('Vui lòng nhập giá sản phẩm (tối thiểu 1000)!')
      return
    }
    if (!addForm.type) {
      toast.error('Vui lòng chọn loại điều chỉnh!')
      return
    }

    try {
      const res = await axiosClient.post('admin/price-skip', addForm)
      if (res.data.status === true) {
        setAddModalVisible(false)
        setAddForm({ MaHH: '', TenHH: '', price: '', type: 'skip' })
        fetchDataProductSkip()
        toast.success('Thêm mới sản phẩm không đồng bộ thành công!')
      } else {
        toast.error(res.data.message || 'Thêm mới thất bại!')
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Có lỗi khi thêm mới sản phẩm!')
    }
  }

  const handleAddModalClose = () => {
    setAddModalVisible(false)
    setAddForm({ MaHH: '', TenHH: '', price: '', type: 'skip' })
  }

  return (
    <div>
      {!isPermissionCheck ? (
        <h5 className="p-4 text-center">
          <div>Bạn không đủ quyền để thao tác trên danh mục quản trị này.</div>
          <div className="mt-4">
            Vui lòng quay lại trang chủ <Link to={'/dashboard'}>(Nhấn vào để quay lại)</Link>
          </div>
        </h5>
      ) : (
        <>
          <DeletedModal visible={visible} setVisible={setVisible} onDelete={handleDelete} />

          {/* Header Title & Actions */}
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div>
              <h4 className="fw-bold text-dark mb-1">QUẢN LÝ SẢN PHẨM KHÔNG ĐỒNG BỘ</h4>
              <p className="text-muted small mb-0">
                Quản lý các mã sản phẩm tạm ngưng đồng bộ giá hoặc so sánh giá từ hệ thống SAP
              </p>
            </div>
            <div>
              <CButton
                color="primary"
                className="fw-semibold d-flex align-items-center gap-1 shadow-xs"
                onClick={() => setAddModalVisible(true)}
              >
                <CIcon icon={cilPlus} /> Thêm mới sản phẩm
              </CButton>
            </div>
          </div>

          {/* CoreUI Card Import Excel */}
          <CCard className="mb-4 shadow-xs border">
            <CCardHeader className="bg-primary text-white py-2 px-3 fw-bold d-flex align-items-center gap-2">
              <CIcon icon={cilCloudUpload} /> Import danh sách sản phẩm bằng File Excel
            </CCardHeader>
            <CCardBody className="p-3">
              <div
                className="p-3 rounded-2 mb-3"
                style={{
                  backgroundColor: '#eaf4fc',
                  borderLeft: '4px solid #0d6efd',
                  lineHeight: '1.6',
                }}
              >
                <h6 className="fw-bold text-primary mb-2">📘 Hướng dẫn & Quy định tải file</h6>
                <ul className="mb-2 ps-3 small text-secondary">
                  <li>
                    <strong>Bước 1:</strong> Chuẩn bị file Excel (.xls hoặc .xlsx) theo đúng mẫu hệ thống.
                  </li>
                  <li>
                    <strong>Bước 2:</strong> Điền đầy đủ thông tin cột <strong>Mã kho</strong>, <strong>Tên hàng</strong>, <strong>Giá</strong> và cột <strong>Loại</strong> (skip hoặc adjustment).
                  </li>
                  <li>
                    <strong>Bước 3:</strong> Chọn tệp bên dưới và bấm nút <strong>Tải lên để import</strong>.
                  </li>
                </ul>
              </div>

              <div className="text-center mb-3">
                <img
                  className="img-fluid rounded border shadow-xs"
                  src="/excel_not_sync.png"
                  alt="File excel mẫu"
                  style={{ maxHeight: '180px' }}
                />
              </div>

              <CRow className="g-2 align-items-center justify-content-center">
                <CCol md={6} sm={8}>
                  <CFormInput
                    onChange={onFileChange}
                    size="sm"
                    type="file"
                    id="formFile"
                    accept=".xls,.xlsx"
                  />
                </CCol>
                <CCol md={3} sm={4}>
                  <CButton
                    onClick={handleImportSubmit}
                    size="sm"
                    color="primary"
                    className="w-100 fw-semibold"
                  >
                    Tải lên để import
                  </CButton>
                </CCol>
              </CRow>

              {/* Import Results Notification */}
              {currentUploads && Object.keys(currentUploads).length > 0 && (
                <div className="mt-3">
                  <CAccordion alwaysOpen>
                    <CAccordionItem className="border rounded-2">
                      <CAccordionHeader>
                        <div className="d-flex justify-content-between align-items-center w-100 px-2">
                          <div className="fw-semibold">{`Ngày import: ${currentUploads.date}`}</div>
                          <div>{currentUploads.fileName}</div>
                          <div
                            className={`fw-bold text-${currentUploads.message === 'success' ? 'success' : 'danger'}`}
                          >
                            {currentUploads.message === 'success' ? 'Thành công' : 'Có lỗi'}
                          </div>
                        </div>
                      </CAccordionHeader>
                      <CAccordionBody
                        className="py-3 px-4"
                        style={{
                          backgroundColor:
                            currentUploads.message === 'success'
                              ? 'rgba(25,135,84,0.08)'
                              : 'rgba(220,53,69,0.08)',
                        }}
                      >
                        <div>
                          <strong>{`Đã import thành công: ${currentUploads.importedCount} sản phẩm.`}</strong>
                        </div>
                        {currentUploads.notFoundCount > 0 && (
                          <div className="mt-2 text-danger">
                            <strong>{`Có ${currentUploads.notFoundCount} mã sản phẩm không tìm thấy.`}</strong>
                            <div className="mt-1 small">
                              <strong>Danh sách mã lỗi: </strong>
                              <span>{currentUploads.notFoundProducts}</span>
                            </div>
                          </div>
                        )}
                      </CAccordionBody>
                    </CAccordionItem>
                  </CAccordion>
                </div>
              )}
            </CCardBody>
          </CCard>

          {/* CoreUI Search Filter Card */}
          <CCard className="mb-3 shadow-xs border">
            <CCardHeader className="bg-white py-2 px-3 d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-3">
                <span className="fw-bold text-dark">Bộ lọc tìm kiếm</span>
                <CBadge color="danger" className="px-2 py-1 fs-6 font-normal">
                  Tổng cộng: <span className="fw-bold text-white">{dataProductSkip?.pagination?.total?.toLocaleString('vi-VN') || 0}</span> sản phẩm
                </CBadge>
              </div>
              <CButton
                color="light"
                size="sm"
                className="text-secondary fw-semibold border"
                onClick={handleToggleCollapse}
              >
                {isCollapse ? 'Hiện bộ lọc ▼' : 'Ẩn bộ lọc ▲'}
              </CButton>
            </CCardHeader>

            {!isCollapse && (
              <CCardBody className="bg-light p-3">
                <CRow className="g-2">
                  <CCol md={4} sm={6}>
                    <label className="form-label fw-semibold text-dark small mb-1">Loại sản phẩm</label>
                    <CFormSelect
                      size="sm"
                      aria-label="Chọn loại lọc"
                      options={[
                        { label: '-- Tất cả loại --', value: '' },
                        { label: 'Điều chỉnh giá (skip)', value: 'skip' },
                        { label: 'So sánh giá (adjustment)', value: 'adjustment' },
                      ]}
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                    />
                  </CCol>

                  <CCol md={8} sm={12}>
                    <label className="form-label fw-semibold text-dark small mb-1">Từ khóa tìm kiếm</label>
                    <div className="d-flex gap-2">
                      <CFormInput
                        size="sm"
                        type="text"
                        placeholder="Nhập Mã kho, Tên sản phẩm..."
                        value={dataSearch}
                        onChange={(e) => setDataSearch(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch(dataSearch)}
                      />
                      <CButton color="primary" size="sm" className="px-3 text-nowrap" onClick={() => handleSearch(dataSearch)}>
                        Tìm kiếm
                      </CButton>
                      <CButton color="secondary" variant="outline" size="sm" className="px-3 text-nowrap" onClick={handleResetFilter}>
                        Làm mới
                      </CButton>
                    </div>
                  </CCol>
                </CRow>
              </CCardBody>
            )}
          </CCard>

          {/* Action Row */}
          <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
            <CButton onClick={handleDeleteSelectedCheckbox} color="danger" size="sm" className="fw-semibold">
              Xóa vĩnh viễn ({selectedCheckbox.length})
            </CButton>
          </div>

          {/* Product Out Of Sync Table */}
          <CCard className="mb-4 shadow-xs border">
            <CCardBody className="p-0">
              <CTable hover responsive className="mb-0 align-middle" columns={columns} items={items} />
            </CCardBody>
          </CCard>

          {/* Pagination */}
          <div className="d-flex justify-content-end mb-4">
            <ReactPaginate
              pageCount={Math.ceil((dataProductSkip?.pagination?.total || 0) / 10)}
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

          {/* Modal Thêm Mới Sản Phẩm */}
          <CModal visible={addModalVisible} onClose={handleAddModalClose}>
            <CModalHeader closeButton className="bg-primary text-white py-2">
              <strong className="fs-6">Thêm mới sản phẩm không đồng bộ</strong>
            </CModalHeader>
            <CModalBody className="p-3">
              <div className="mb-3">
                <label className="form-label fw-semibold text-dark small">Tên sản phẩm</label>
                <CFormInput
                  size="sm"
                  name="TenHH"
                  placeholder="Nhập tên sản phẩm..."
                  value={addForm.TenHH || ''}
                  onChange={handleAddFormChange}
                />
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold text-dark small">
                  Mã sản phẩm <span className="text-danger">*</span>
                </label>
                <CFormInput
                  size="sm"
                  name="MaHH"
                  placeholder="Ví dụ: MHSS_LS27B800PXEXXV"
                  value={addForm.MaHH || ''}
                  onChange={handleAddFormChange}
                />
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold text-dark small">
                  Giá sản phẩm (VNĐ) <span className="text-danger">*</span>
                </label>
                <CFormInput
                  size="sm"
                  type="number"
                  name="price"
                  placeholder="Nhập giá (VNĐ)..."
                  value={addForm.price || ''}
                  onChange={handleAddFormChange}
                />
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold text-dark small">
                  Loại điều chỉnh <span className="text-danger">*</span>
                </label>
                <CFormSelect
                  size="sm"
                  name="type"
                  value={addForm.type || 'skip'}
                  onChange={handleAddFormChange}
                  options={[
                    { label: 'Điều chỉnh giá (skip)', value: 'skip' },
                    { label: 'So sánh giá (adjustment)', value: 'adjustment' },
                  ]}
                />
              </div>
            </CModalBody>
            <CModalFooter className="py-2">
              <CButton color="secondary" size="sm" onClick={handleAddModalClose}>
                Đóng
              </CButton>
              <CButton color="primary" size="sm" className="fw-semibold" onClick={handleAddSave}>
                Thêm mới
              </CButton>
            </CModalFooter>
          </CModal>

          {/* Modal Cập Nhật Sản Phẩm */}
          <CModal visible={editModalVisible} onClose={handleEditModalClose}>
            <CModalHeader closeButton className="bg-primary text-white py-2">
              <strong className="fs-6">Cập nhật sản phẩm không đồng bộ</strong>
            </CModalHeader>
            <CModalBody className="p-3">
              {editForm && (
                <>
                  <div className="mb-3">
                    <label className="form-label fw-semibold text-dark small">Tên sản phẩm</label>
                    <CFormInput
                      size="sm"
                      name="TenHH"
                      value={editForm.TenHH || ''}
                      onChange={handleEditFormChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold text-dark small">
                      Mã sản phẩm <span className="text-danger">*</span>
                    </label>
                    <CFormInput
                      size="sm"
                      name="MaHH"
                      value={editForm.MaHH || ''}
                      onChange={handleEditFormChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold text-dark small">
                      Giá sản phẩm (VNĐ) <span className="text-danger">*</span>
                    </label>
                    <CFormInput
                      size="sm"
                      type="number"
                      name="price"
                      value={editForm.price || ''}
                      onChange={handleEditFormChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold text-dark small">
                      Loại điều chỉnh <span className="text-danger">*</span>
                    </label>
                    <CFormSelect
                      size="sm"
                      name="type"
                      value={editForm.type || 'skip'}
                      onChange={handleEditFormChange}
                      options={[
                        { label: 'Điều chỉnh giá (skip)', value: 'skip' },
                        { label: 'So sánh giá (adjustment)', value: 'adjustment' },
                      ]}
                    />
                  </div>
                </>
              )}
            </CModalBody>
            <CModalFooter className="py-2">
              <CButton color="secondary" size="sm" onClick={handleEditModalClose}>
                Đóng
              </CButton>
              <CButton color="primary" size="sm" className="fw-semibold" onClick={handleEditSave}>
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
