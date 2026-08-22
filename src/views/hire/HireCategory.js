import React, { useEffect, useRef, useState, useCallback } from 'react'
import {
  CButton,
  CCol,
  CContainer,
  CFormCheck,
  CFormInput,
  CFormSelect,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CSpinner,
} from '@coreui/react'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import CIcon from '@coreui/icons-react'
import { cilColorBorder, cilTrash } from '@coreui/icons'
import ReactPaginate from 'react-paginate'
import DeletedModal from '../../components/deletedModal/DeletedModal'
import { toast } from 'react-toastify'
import { axiosClient } from '../../axiosConfig'
import Loading from '../../components/loading/Loading'

function HireCategory() {
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(false)

  const location = useLocation()
  const navigate = useNavigate()

  const params = new URLSearchParams(location.search)
  const id = params.get('id')
  const sub = params.get('sub')

  const [isPermissionCheck, setIsPermissionCheck] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const titleInputRef = useRef(null)

  const [dataHireCategory, setDataHireCategory] = useState(null)
  const [searchInput, setSearchInput] = useState('')
  const [dataSearch, setDataSearch] = useState('')

  const [visible, setVisible] = useState(false)
  const [deletedId, setDeletedId] = useState(null)

  const [isAllCheckbox, setIsAllCheckbox] = useState(false)
  const [selectedCheckbox, setSelectedCheckbox] = useState([])
  const [pageNumber, setPageNumber] = useState(1)

  const [initialValues, setInitialValues] = useState({
    title: '',
    name: '',
    visible: 1,
  })

  const validationSchema = Yup.object({
    title: Yup.string().required('Tiêu đề danh mục không được để trống.'),
    name: Yup.string().required('Tên slug không được để trống.'),
    visible: Yup.number().required('Vui lòng chọn trạng thái hiển thị.'),
  })

  // Helper to slugify title
  const slugify = (str) => {
    if (!str) return ''
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[đĐ]/g, 'd')
      .replace(/([^0-9a-z-\s])/g, '')
      .replace(/(\s+)/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const fetchDataById = useCallback(async () => {
    if (!id || sub !== 'edit') {
      setInitialValues({
        title: '',
        name: '',
        visible: 1,
      })
      return
    }
    try {
      const response = await axiosClient.get(`admin/hire-category/${id}/edit`)
      const data = response.data.data
      if (data) {
        setInitialValues({
          title: data?.title || '',
          name: data?.name || '',
          visible: data?.status !== undefined ? data?.status : 1,
        })
      }
      if (response.data.status === false && response.data.mess === 'no permission') {
        toast.warn('Bạn không có quyền thực hiện tác vụ này!')
      }
    } catch (error) {
      console.error('Fetch data hire category by ID error', error)
    }
  }, [id, sub])

  useEffect(() => {
    if (sub === 'add') {
      setIsEditing(false)
      setInitialValues({
        title: '',
        name: '',
        visible: 1,
      })
      if (titleInputRef.current) {
        titleInputRef.current.focus()
      }
    } else if (sub === 'edit' && id) {
      setIsEditing(true)
      fetchDataById()
    } else {
      setIsEditing(false)
      setInitialValues({
        title: '',
        name: '',
        visible: 1,
      })
    }
  }, [location.search, sub, id, fetchDataById])

  const fetchDataHireCategory = useCallback(async () => {
    try {
      setIsFetching(true)
      const queryParams = new URLSearchParams()
      queryParams.append('page', pageNumber)
      if (dataSearch) queryParams.append('data', dataSearch)

      const response = await axiosClient.get(`admin/hire-category?${queryParams.toString()}`)

      if (response.data.status === true) {
        setDataHireCategory(response.data.data)
      }

      if (response.data.status === false && response.data.mess === 'no permission') {
        setIsPermissionCheck(false)
      }
    } catch (error) {
      console.error('Fetch hire category error', error)
    } finally {
      setIsFetching(false)
    }
  }, [pageNumber, dataSearch])

  useEffect(() => {
    fetchDataHireCategory()
  }, [fetchDataHireCategory])

  const handleSubmit = async (values, { resetForm }) => {
    if (isEditing) {
      setIsLoading(true)
      try {
        const response = await axiosClient.put(`admin/hire-category/${id}`, {
          title: values.title,
          name: values.name,
          status: values.visible,
        })

        if (response.data.status === true) {
          toast.success('Cập nhật danh mục tuyển dụng thành công!')
          resetForm()
          fetchDataHireCategory()
          navigate('/hire/category', { replace: true })
          setIsEditing(false)
        } else if (response.data.status === false && response.data.mess === 'no permission') {
          toast.warn('Bạn không có quyền thực hiện tác vụ này!')
        }
      } catch (error) {
        console.error('Update hire category error', error)
        toast.error('Đã xảy ra lỗi khi cập nhật!')
      } finally {
        setIsLoading(false)
      }
    } else {
      setIsLoading(true)
      try {
        const response = await axiosClient.post('admin/hire-category', {
          title: values.title,
          name: values.name,
          status: values.visible,
        })

        if (response.data.status === true) {
          toast.success('Thêm mới danh mục tuyển dụng thành công!')
          resetForm()
          fetchDataHireCategory()
        } else if (response.data.status === false && response.data.mess === 'no permission') {
          toast.warn('Bạn không có quyền thực hiện tác vụ này!')
        }
      } catch (error) {
        console.error('Post hire category error', error)
        toast.error('Đã xảy ra lỗi khi thêm mới!')
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleSearchSubmit = (e) => {
    e?.preventDefault()
    setPageNumber(1)
    setDataSearch(searchInput)
  }

  const handleResetFilters = () => {
    setSearchInput('')
    setDataSearch('')
    setPageNumber(1)
  }

  const handleCancelEdit = (resetForm) => {
    resetForm()
    setIsEditing(false)
    navigate('/hire/category', { replace: true })
  }

  const handleEditClick = (cateId) => {
    navigate(`/hire/category?id=${cateId}&sub=edit`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async () => {
    try {
      const response = await axiosClient.delete(`admin/hire-category/${deletedId}`)
      if (response.data.status === true) {
        setVisible(false)
        toast.success('Xóa danh mục tuyển dụng thành công!')
        fetchDataHireCategory()
      } else if (response.data.status === false && response.data.mess === 'no permission') {
        toast.warn('Bạn không có quyền thực hiện tác vụ này!')
      }
    } catch (error) {
      console.error('Delete hire category error', error)
      toast.error('Đã xảy ra lỗi khi xóa!')
    }
  }

  const handleDeleteSelectedCheckbox = async () => {
    if (!selectedCheckbox.length) return
    if (
      !window.confirm(
        `Bạn có chắc chắn muốn xóa vĩnh viễn ${selectedCheckbox.length} danh mục đã chọn?`,
      )
    ) {
      return
    }
    try {
      const response = await axiosClient.post('admin/delete-all-hire-category', {
        data: selectedCheckbox,
      })

      if (response.data.status === true) {
        toast.success(`Đã xóa ${selectedCheckbox.length} danh mục thành công!`)
        fetchDataHireCategory()
        setSelectedCheckbox([])
        setIsAllCheckbox(false)
      }
    } catch (error) {
      console.error('Delete selected checkbox error', error)
      toast.error('Xóa thất bại!')
    }
  }

  const handlePageChange = ({ selected }) => {
    const newPage = selected + 1
    setPageNumber(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const allCategories = Array.isArray(dataHireCategory)
    ? dataHireCategory
    : dataHireCategory?.data || []
  const totalItems = Array.isArray(dataHireCategory)
    ? dataHireCategory.length
    : dataHireCategory?.total || allCategories.length
  const perPage = Array.isArray(dataHireCategory) ? 10 : dataHireCategory?.per_page || 10
  const totalPages = Math.ceil(totalItems / perPage) || 1
  const categoryList = Array.isArray(dataHireCategory)
    ? allCategories.slice((pageNumber - 1) * perPage, pageNumber * perPage)
    : allCategories
  const startItem = totalItems === 0 ? 0 : (pageNumber - 1) * perPage + 1
  const endItem = Math.min(pageNumber * perPage, totalItems)

  return (
    <div className="pb-4">
      {!isPermissionCheck ? (
        <div className="card shadow-sm p-4 text-center">
          <h5 className="text-danger fw-bold mb-2">
            Bạn không đủ quyền để truy cập trang quản trị này.
          </h5>
          <p className="text-muted">
            Vui lòng quay lại{' '}
            <Link to={'/dashboard'} className="fw-bold text-primary">
              Bảng điều khiển
            </Link>
          </p>
        </div>
      ) : (
        <>
          <DeletedModal visible={visible} setVisible={setVisible} onDelete={handleDelete} />

          {/* PAGE HEADER */}
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4 pb-2 border-bottom">
            <div>
              <h3 className="fw-bold text-uppercase text-dark m-0">QUẢN LÝ DANH MỤC TUYỂN DỤNG</h3>
              <p className="text-muted text-xs m-0 mt-1">
                Quản lý các nhóm danh mục tuyển dụng (Hành chính nhân sự, CNTT, Kế toán, Kinh
                doanh...)
              </p>
            </div>
            <div className="d-flex flex-wrap gap-2">
              <Link to="/hire/post">
                <CButton color="light" size="sm" className="border fw-semibold shadow-xs">
                  Quản lý bài đăng tuyển dụng
                </CButton>
              </Link>
              <Link to="/hire/candidate-cv">
                <CButton color="light" size="sm" className="border fw-semibold shadow-xs">
                  Hồ sơ ứng tuyển (CV)
                </CButton>
              </Link>
            </div>
          </div>

          <div className="row g-4">
            {/* LEFT COLUMN: ADD / EDIT CATEGORY FORM */}
            <div className="col-12 col-lg-4">
              <div className="card border-0 shadow-sm rounded-3 overflow-hidden bg-white">
                <div className="card-header bg-light border-bottom py-3">
                  <h6 className="fw-bold text-dark m-0 text-uppercase" style={{ fontSize: '13px' }}>
                    {isEditing ? 'Cập nhật danh mục' : 'Thêm danh mục tuyển dụng mới'}
                  </h6>
                </div>
                <div className="card-body p-4">
                  <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                    enableReinitialize
                  >
                    {({ setFieldValue, resetForm, values }) => {
                      return (
                        <Form>
                          {/* Title */}
                          <div className="mb-3">
                            <label className="form-label text-muted small fw-semibold mb-1">
                              Tiêu đề danh mục <span className="text-danger">*</span>
                            </label>
                            <Field name="title">
                              {({ field }) => (
                                <CFormInput
                                  {...field}
                                  type="text"
                                  placeholder="Ví dụ: CNTT - Phần mềm"
                                  ref={titleInputRef}
                                  onChange={(e) => {
                                    field.onChange(e)
                                    if (!isEditing) {
                                      setFieldValue('name', slugify(e.target.value))
                                    }
                                  }}
                                />
                              )}
                            </Field>
                            <div className="form-text text-muted" style={{ fontSize: '11px' }}>
                              Tên hiển thị công khai trên website.
                            </div>
                            <ErrorMessage
                              name="title"
                              component="div"
                              className="text-danger small mt-1"
                            />
                          </div>

                          {/* Slug / Name */}
                          <div className="mb-3">
                            <label className="form-label text-muted small fw-semibold mb-1">
                              Tên slug / Mã danh mục <span className="text-danger">*</span>
                            </label>
                            <Field name="name">
                              {({ field }) => (
                                <CFormInput {...field} type="text" placeholder="phan-mem" />
                              )}
                            </Field>
                            <ErrorMessage
                              name="name"
                              component="div"
                              className="text-danger small mt-1"
                            />
                          </div>

                          {/* Visibility */}
                          <div className="mb-4">
                            <label className="form-label text-muted small fw-semibold mb-1">
                              Hiển thị website
                            </label>
                            <Field name="visible">
                              {({ field }) => (
                                <CFormSelect {...field}>
                                  <option value={1}>Có (Hiển thị)</option>
                                  <option value={0}>Không (Ẩn)</option>
                                </CFormSelect>
                              )}
                            </Field>
                            <ErrorMessage
                              name="visible"
                              component="div"
                              className="text-danger small mt-1"
                            />
                          </div>

                          {/* Action buttons */}
                          <div className="d-flex gap-2">
                            <CButton
                              color="primary"
                              type="submit"
                              className="fw-bold px-3 py-2 shadow-xs w-100"
                              disabled={isLoading}
                            >
                              {isLoading ? (
                                <>
                                  <CSpinner size="sm" className="me-1" /> Đang lưu...
                                </>
                              ) : isEditing ? (
                                'Cập nhật danh mục'
                              ) : (
                                '+ Thêm danh mục mới'
                              )}
                            </CButton>
                            {isEditing && (
                              <CButton
                                color="light"
                                type="button"
                                className="border fw-semibold text-nowrap py-2"
                                onClick={() => handleCancelEdit(resetForm)}
                              >
                                Hủy bỏ
                              </CButton>
                            )}
                          </div>
                        </Form>
                      )
                    }}
                  </Formik>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: CATEGORIES TABLE */}
            <div className="col-12 col-lg-8">
              {/* SEARCH & FILTER BAR */}
              <div className="card border-0 shadow-sm rounded-3 p-3 mb-3 bg-white">
                <form onSubmit={handleSearchSubmit}>
                  <div className="row g-2 align-items-center">
                    <div className="col">
                      <div className="input-group">
                        <span className="input-group-text bg-light border-end-0 text-muted">
                          🔍
                        </span>
                        <input
                          type="text"
                          className="form-control border-start-0 ps-0"
                          placeholder="Tìm kiếm danh mục..."
                          value={searchInput}
                          onChange={(e) => setSearchInput(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="col-auto d-flex gap-2">
                      <CButton
                        type="submit"
                        color="primary"
                        size="sm"
                        className="fw-semibold shadow-xs px-3"
                      >
                        Tìm kiếm
                      </CButton>
                      {(dataSearch || searchInput) && (
                        <CButton
                          type="button"
                          color="light"
                          size="sm"
                          className="border shadow-xs px-2.5"
                          title="Đặt lại bộ lọc"
                          onClick={handleResetFilters}
                        >
                          Đặt lại
                        </CButton>
                      )}
                    </div>
                  </div>
                </form>
              </div>

              {/* BATCH ACTION BAR */}
              {selectedCheckbox.length > 0 && (
                <div className="alert alert-primary bg-primary bg-opacity-10 border-primary border-opacity-25 d-flex justify-content-between align-items-center p-2.5 px-3 rounded-3 mb-3">
                  <div className="d-flex align-items-center gap-2">
                    <span className="fw-bold text-primary">
                      Đã chọn {selectedCheckbox.length} danh mục
                    </span>
                  </div>
                  <CButton
                    color="danger"
                    size="sm"
                    className="fw-semibold text-white shadow-xs"
                    onClick={handleDeleteSelectedCheckbox}
                  >
                    Xóa {selectedCheckbox.length} mục đã chọn
                  </CButton>
                </div>
              )}

              {/* DATA TABLE CARD */}
              <div className="card border-0 shadow-sm rounded-3 overflow-hidden bg-white mb-4">
                {isFetching ? (
                  <div className="p-5 text-center">
                    <Loading />
                  </div>
                ) : categoryList.length === 0 ? (
                  <div className="p-5 text-center text-muted">
                    <h6 className="fw-bold text-dark">Chưa có danh mục tuyển dụng nào</h6>
                    <p className="small text-muted mb-0">
                      Nhập thông tin ở cột bên trái để tạo danh mục đầu tiên.
                    </p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <CTable hover className="align-middle mb-0">
                      <CTableHead
                        className="bg-light text-secondary text-uppercase"
                        style={{ fontSize: '11.5px' }}
                      >
                        <CTableRow>
                          <CTableHeaderCell style={{ width: '40px' }} className="text-center">
                            <CFormCheck
                              aria-label="Select all"
                              checked={
                                categoryList.length > 0 &&
                                categoryList.every((item) => selectedCheckbox.includes(item.id))
                              }
                              onChange={(e) => {
                                const isChecked = e.target.checked
                                setIsAllCheckbox(isChecked)
                                if (isChecked) {
                                  setSelectedCheckbox(categoryList.map((item) => item.id))
                                } else {
                                  setSelectedCheckbox([])
                                }
                              }}
                            />
                          </CTableHeaderCell>
                          <CTableHeaderCell style={{ minWidth: '200px' }}>
                            Tiêu đề danh mục
                          </CTableHeaderCell>
                          <CTableHeaderCell style={{ minWidth: '150px' }}>
                            Tên Slug (Name)
                          </CTableHeaderCell>
                          <CTableHeaderCell style={{ minWidth: '110px' }} className="text-center">
                            Hiển thị
                          </CTableHeaderCell>
                          <CTableHeaderCell style={{ minWidth: '100px' }} className="text-center">
                            Tác vụ
                          </CTableHeaderCell>
                        </CTableRow>
                      </CTableHead>
                      <CTableBody>
                        {categoryList.map((item) => {
                          const isSelected = selectedCheckbox.includes(item.id)

                          return (
                            <CTableRow
                              key={item.id}
                              className={isSelected ? 'table-primary bg-opacity-25' : ''}
                            >
                              {/* Checkbox */}
                              <CTableDataCell className="text-center">
                                <CFormCheck
                                  value={item.id}
                                  checked={isSelected}
                                  onChange={(e) => {
                                    const isChecked = e.target.checked
                                    if (isChecked) {
                                      setSelectedCheckbox([...selectedCheckbox, item.id])
                                    } else {
                                      setSelectedCheckbox(
                                        selectedCheckbox.filter((chkId) => chkId !== item.id),
                                      )
                                    }
                                  }}
                                />
                              </CTableDataCell>

                              {/* Title */}
                              <CTableDataCell>
                                <div
                                  className="fw-bold text-dark cursor-pointer text-truncate"
                                  style={{ fontSize: '13.5px' }}
                                  onClick={() => handleEditClick(item.id)}
                                >
                                  {item.title}
                                </div>
                              </CTableDataCell>

                              {/* Slug */}
                              <CTableDataCell>
                                <span className="badge bg-light text-secondary border font-monospace px-2 py-1">
                                  {item.name}
                                </span>
                              </CTableDataCell>

                              {/* Status / Visibility */}
                              <CTableDataCell className="text-center">
                                {item.status === 1 || item.status === undefined ? (
                                  <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-1">
                                    Hiển thị
                                  </span>
                                ) : (
                                  <span className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25 px-2 py-1">
                                    Đang ẩn
                                  </span>
                                )}
                              </CTableDataCell>

                              {/* Actions */}
                              <CTableDataCell className="text-center">
                                <div className="d-flex justify-content-center">
                                  <button
                                    onClick={() => handleEditClick(item.id)}
                                    className="button-action mr-2 bg-info"
                                    title="Chỉnh sửa danh mục"
                                  >
                                    <CIcon icon={cilColorBorder} className="text-white" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setVisible(true)
                                      setDeletedId(item.id)
                                    }}
                                    className="button-action bg-danger"
                                    title="Xóa danh mục"
                                  >
                                    <CIcon icon={cilTrash} className="text-white" />
                                  </button>
                                </div>
                              </CTableDataCell>
                            </CTableRow>
                          )
                        })}
                      </CTableBody>
                    </CTable>
                  </div>
                )}

                {/* PAGINATION FOOTER */}
                {categoryList.length > 0 && (
                  <div className="card-footer bg-white border-top d-flex flex-wrap justify-content-between align-items-center gap-3 p-3">
                    <div className="text-muted small">
                      Hiển thị <strong>{startItem}</strong> - <strong>{endItem}</strong> trên tổng
                      số <strong>{totalItems}</strong> danh mục
                    </div>
                    <ReactPaginate
                      pageCount={totalPages}
                      forcePage={pageNumber - 1}
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
                      containerClassName={'pagination pagination-sm m-0'}
                      activeClassName={'active'}
                      previousLabel={'« Trước'}
                      nextLabel={'Sau »'}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default HireCategory
