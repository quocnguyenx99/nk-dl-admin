import React, { useEffect, useRef, useState } from 'react'
import {
  CButton,
  CCol,
  CFormCheck,
  CFormInput,
  CFormSelect,
  CFormTextarea,
  CRow,
  CSpinner,
  CTable,
} from '@coreui/react'

import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Search from '../../../components/search/Search'

import CIcon from '@coreui/icons-react'
import { cilTrash, cilColorBorder } from '@coreui/icons'
import ReactPaginate from 'react-paginate'
import DeletedModal from '../../../components/deletedModal/DeletedModal'
import { toast } from 'react-toastify'
import { axiosClient } from '../../../axiosConfig'

function AdvertiseCategory() {
  const location = useLocation()
  const navigate = useNavigate()

  const params = new URLSearchParams(location.search)
  const id = params.get('id')
  const sub = params.get('sub')

  // check permission state
  const [isPermissionCheck, setIsPermissionCheck] = useState(true)

  const [isEditing, setIsEditing] = useState(false)
  const inputRef = useRef(null)

  // loading button
  const [isLoading, setIsLoading] = useState(false)

  const [dataAdvertiseCategory, setDataAdvertiseCategroy] = useState([])

  // show deleted Modal
  const [visible, setVisible] = useState(false)
  const [deletedId, setDeletedId] = useState(null)

  // checkbox selected
  const [isAllCheckbox, setIsAllCheckbox] = useState(false)
  const [selectedCheckbox, setSelectedCheckbox] = useState([])

  // pagination state
  const [pageNumber, setPageNumber] = useState(1)

  const initialValues = {
    title: '',
    name: '',
    width: '',
    height: '',
    numberOfBanner: '',
    description: '',
    visible: 0,
  }

  const validationSchema = Yup.object({
    title: Yup.string().required('Tiêu đề là bắt buộc.'),
    name: Yup.string().required('Name là bắt buộc.'),
    width: Yup.string().required('Chiều rộng banner là bắt buộc.'),
    height: Yup.string().required('Chiều cao banner là bắt buộc.'),
    numberOfBanner: Yup.string().required('Số lượng banner là bắt buộc.'),
    visible: Yup.string().required('Cho phép hiển thị là bắt buộc.'),
  })

  useEffect(() => {
    if (sub === 'add') {
      setIsEditing(false)
      if (inputRef.current) {
        inputRef.current.focus()
      }
    } else if (sub === 'edit' && id) {
      setIsEditing(true)
    }
  }, [location.search, sub, id])

  const fetchDataAdvertiseCategory = async (dataSearch = '') => {
    try {
      const response = await axiosClient.get(`admin/ad-pos?data=${dataSearch}&page=${pageNumber}`)
      if (response.data.status === 'success') {
        setDataAdvertiseCategroy(response.data.list)
      }

      if (response.data.status === false && response.data.mess === 'no permission') {
        setIsPermissionCheck(false)
      }
    } catch (error) {
      console.error('Fetch data advertise category error', error)
    }
  }

  useEffect(() => {
    fetchDataAdvertiseCategory()
  }, [pageNumber])

  const fetchDataById = async (setValues) => {
    try {
      const response = await axiosClient.get(`admin/ad-pos/${id}/edit`)
      const data = response.data.list
      if (data) {
        setValues({
          title: data?.title,
          name: data?.name,
          width: data?.width,
          height: data?.height,
          numberOfBanner: data?.n_show,
          description: data?.description,
          visible: data.display,
        })
      } else {
        console.error('No data found for the given ID.')
      }

      if (
        sub === 'edit' &&
        response.data.status === false &&
        response.data.mess === 'no permission'
      ) {
        toast.warn('Bạn không có quyền thực hiện tác vụ này!')
      }
    } catch (error) {
      console.error('Fetch data id advertise category is error', error.message)
    }
  }

  const handleSubmit = async (values, { resetForm }) => {
    if (isEditing) {
      try {
        setIsLoading(true)
        const response = await axiosClient.put(`admin/ad-pos/${id}`, {
          title: values.title,
          name: values.name,
          width: values.width,
          height: values.height,
          show: values.numberOfBanner,
          description: values.description,
          display: values.visible,
        })
        if (response.data.status === true) {
          toast.success('Cập nhật vị trí thành công')
          resetForm()
          setIsEditing(false)
          fetchDataAdvertiseCategory()
          navigate('/advertise/category')
        } else {
          console.error('No data found for the given ID.')
        }

        if (response.data.status === false && response.data.mess === 'no permission') {
          toast.warn('Bạn không có quyền thực hiện tác vụ này!')
        }
      } catch (error) {
        console.error('Put data id advertise category is error', error.message)
        toast.error('Đã xảy ra lỗi. Vui lòng thử lại!')
      } finally {
        setIsLoading(false)
      }
    } else {
      try {
        setIsLoading(true)
        const response = await axiosClient.post('admin/ad-pos', {
          title: values.title,
          name: values.name,
          width: values.width,
          height: values.height,
          show: values.numberOfBanner,
          description: values.description,
          display: values.visible,
        })
        if (response.data.status === true) {
          toast.success('Thêm mới vị trí thành công!')
          resetForm()
          fetchDataAdvertiseCategory()
          navigate('/advertise/category?sub=add')
        }

        if (response.data.status === false && response.data.mess === 'no permission') {
          toast.warn('Bạn không có quyền thực hiện tác vụ này!')
        }
      } catch (error) {
        console.error('Post data advertise category is error', error)
        toast.error('Đã xảy ra lỗi. Vui lòng thử lại!')
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleAddNewClick = () => {
    navigate('/advertise/category?sub=add')
  }

  const handleEditClick = (id) => {
    navigate(`/advertise/category?id=${id}&sub=edit`)
  }

  const handleDelete = async () => {
    setVisible(true)
    try {
      const response = await axiosClient.delete(`admin/ad-pos/${deletedId}`)
      if (response.data.status === true) {
        setVisible(false)
        fetchDataAdvertiseCategory()
        toast.success('Xóa vị trí quảng cáo thành công!')
      }

      if (response.data.status === false && response.data.mess === 'no permission') {
        toast.warn('Bạn không có quyền thực hiện tác vụ này!')
      }
    } catch (error) {
      console.error('Delete advertise id is error', error)
      toast.error('Đã xảy ra lỗi khi xóa. Vui lòng thử lại!')
    }
  }

  const handleDeleteSelectedCheckbox = async () => {
    try {
      const response = await axiosClient.post('admin/delete-all-ad-pos', {
        data: selectedCheckbox,
      })

      if (response.data.status === true) {
        toast.success('Đã xóa các mục được chọn!')
        fetchDataAdvertiseCategory()
        setSelectedCheckbox([])
      }
    } catch (error) {
      console.error('Delete selected checkbox is error', error)
    }
  }

  const handlePageChange = ({ selected }) => {
    const newPage = selected + 1
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setPageNumber(newPage)
  }

  const handleSearch = (keyword) => {
    fetchDataAdvertiseCategory(keyword)
  }

  const items =
    dataAdvertiseCategory && dataAdvertiseCategory?.length > 0
      ? dataAdvertiseCategory.map((item) => ({
          id: (
            <CFormCheck
              key={item?.id_pos}
              aria-label="Default select example"
              defaultChecked={item?.id_pos}
              id={`flexCheckDefault_${item?.id_pos}`}
              value={item?.id_pos}
              checked={selectedCheckbox.includes(item?.id_pos)}
              onChange={(e) => {
                const positionId = item?.id_pos
                const isChecked = e.target.checked
                if (isChecked) {
                  setSelectedCheckbox([...selectedCheckbox, positionId])
                } else {
                  setSelectedCheckbox(selectedCheckbox.filter((id) => id !== positionId))
                }
              }}
            />
          ),
          title: (
            <div>
              <div className="fw-bold text-dark" style={{ fontSize: '13.5px' }}>
                {item?.title || 'Chưa đặt tiêu đề'}
              </div>
              {item?.name && (
                <span
                  className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-2 py-0.5 mt-1"
                  style={{ fontSize: '11px' }}
                >
                  #{item.name}
                </span>
              )}
            </div>
          ),
          name: <span className="fw-semibold text-secondary">{item?.name || '—'}</span>,
          demension: (
            <span
              className="badge bg-light text-dark border px-2 py-1"
              style={{ fontSize: '11px' }}
            >
              {item?.width || 0} x {item?.height || 0} px
            </span>
          ),
          actions: (
            <div className="d-flex justify-content-center">
              <button
                onClick={() => handleEditClick(item.id_pos)}
                className="button-action mr-2 bg-info"
                title="Sửa vị trí"
              >
                <CIcon icon={cilColorBorder} className="text-white" />
              </button>
              <button
                onClick={() => {
                  setVisible(true)
                  setDeletedId(item.id_pos)
                }}
                className="button-action bg-danger"
                title="Xóa vị trí"
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
        <CFormCheck
          aria-label="Select all"
          checked={isAllCheckbox}
          onChange={(e) => {
            const isChecked = e.target.checked
            setIsAllCheckbox(isChecked)
            if (isChecked) {
              const allIds = dataAdvertiseCategory?.map((item) => item.id_pos) || []
              setSelectedCheckbox(allIds)
            } else {
              setSelectedCheckbox([])
            }
          }}
        />
      ),
      _props: { scope: 'col', className: 'text-center' },
    },
    {
      key: 'title',
      label: 'Tiêu đề vị trí',
      _props: { scope: 'col' },
    },
    {
      key: 'name',
      label: 'Mã Name',
      _props: { scope: 'col' },
    },
    {
      key: 'demension',
      label: 'Kích thước (WxH)',
      _props: { scope: 'col' },
    },
    {
      key: 'actions',
      label: 'Tác vụ',
      _props: { scope: 'col', className: 'text-center' },
    },
  ]

  return (
    <div className="pb-4">
      {!isPermissionCheck ? (
        <div className="card shadow-sm p-4 text-center">
          <h5 className="text-danger fw-bold mb-2">
            Bạn không đủ quyền để thao tác trên danh mục quản trị này.
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
              <h3 className="fw-bold text-uppercase text-dark m-0">QUẢN LÝ VỊ TRÍ ADVERTISE</h3>
              <p className="text-muted text-xs m-0 mt-1">
                Quản lý vị trí, kích thước hiển thị banner quảng cáo trên hệ thống website
              </p>
            </div>
            <div className="d-flex flex-wrap gap-2">
              <CButton
                onClick={handleAddNewClick}
                color="primary"
                size="sm"
                className="fw-bold px-3 shadow-xs"
              >
                + Thêm vị trí mới
              </CButton>
              <Link to={'/advertise'}>
                <CButton color="light" size="sm" className="border fw-semibold shadow-xs">
                  Danh sách quảng cáo
                </CButton>
              </Link>
            </div>
          </div>

          <CRow className="g-4">
            {/* LEFT COLUMN: FORM */}
            <CCol col={12} lg={4}>
              <div className="card border-0 shadow-sm rounded-3 overflow-hidden bg-white">
                <div className="card-header bg-light border-bottom py-3">
                  <h6 className="fw-bold text-dark m-0 text-uppercase" style={{ fontSize: '13px' }}>
                    {!isEditing ? 'Thêm vị trí mới' : 'Cập nhật vị trí'}
                  </h6>
                </div>
                <div className="card-body p-4">
                  <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                  >
                    {({ setValues }) => {
                      useEffect(() => {
                        fetchDataById(setValues)
                      }, [setValues, id])
                      return (
                        <Form className="d-flex flex-column gap-3">
                          {/* Title */}
                          <div>
                            <label className="form-label text-muted small fw-semibold text-uppercase mb-1">
                              Tiêu đề vị trí <span className="text-danger">*</span>
                            </label>
                            <Field name="title">
                              {({ field }) => (
                                <CFormInput
                                  {...field}
                                  type="text"
                                  id="title-input"
                                  ref={inputRef}
                                  placeholder="Ví dụ: Banner slider trang chủ"
                                />
                              )}
                            </Field>
                            <ErrorMessage
                              name="title"
                              component="div"
                              className="text-danger small mt-1"
                            />
                          </div>

                          {/* Name */}
                          <div>
                            <label className="form-label text-muted small fw-semibold text-uppercase mb-1">
                              Mã Name (Duy nhất) <span className="text-danger">*</span>
                            </label>
                            <Field
                              name="name"
                              type="text"
                              as={CFormInput}
                              id="name-input"
                              placeholder="Ví dụ: home_slider"
                            />
                            <ErrorMessage
                              name="name"
                              component="div"
                              className="text-danger small mt-1"
                            />
                          </div>

                          {/* Dimension W & H */}
                          <div className="row g-2">
                            <div className="col-6">
                              <label className="form-label text-muted small fw-semibold text-uppercase mb-1">
                                Chiều rộng (px) <span className="text-danger">*</span>
                              </label>
                              <Field
                                name="width"
                                type="text"
                                as={CFormInput}
                                id="width-input"
                                placeholder="1920"
                              />
                              <ErrorMessage
                                name="width"
                                component="div"
                                className="text-danger small mt-1"
                              />
                            </div>
                            <div className="col-6">
                              <label className="form-label text-muted small fw-semibold text-uppercase mb-1">
                                Chiều cao (px) <span className="text-danger">*</span>
                              </label>
                              <Field
                                name="height"
                                type="text"
                                as={CFormInput}
                                id="height-input"
                                placeholder="450"
                              />
                              <ErrorMessage
                                name="height"
                                component="div"
                                className="text-danger small mt-1"
                              />
                            </div>
                          </div>

                          {/* Number of banner */}
                          <div>
                            <label className="form-label text-muted small fw-semibold text-uppercase mb-1">
                              Số banner hiển thị <span className="text-danger">*</span>
                            </label>
                            <Field
                              name="numberOfBanner"
                              type="number"
                              as={CFormInput}
                              id="numberOfBanner-input"
                              placeholder="1"
                            />
                            <ErrorMessage
                              name="numberOfBanner"
                              component="div"
                              className="text-danger small mt-1"
                            />
                          </div>

                          {/* Description */}
                          <div>
                            <label className="form-label text-muted small fw-semibold text-uppercase mb-1">
                              Ghi chú / Mô tả
                            </label>
                            <Field
                              style={{ height: '80px' }}
                              name="description"
                              as={CFormTextarea}
                              id="desc-input"
                              placeholder="Nhập mô tả vị trí banner nếu có..."
                            />
                            <ErrorMessage
                              name="description"
                              component="div"
                              className="text-danger small mt-1"
                            />
                          </div>

                          {/* Visibility */}
                          <div>
                            <label className="form-label text-muted small fw-semibold text-uppercase mb-1">
                              Trạng thái hiển thị <span className="text-danger">*</span>
                            </label>
                            <Field
                              name="visible"
                              as={CFormSelect}
                              id="visible-select"
                              options={[
                                { label: 'Có (Hiển thị)', value: 1 },
                                { label: 'Không (Đang ẩn)', value: 0 },
                              ]}
                            />
                            <ErrorMessage
                              name="visible"
                              component="div"
                              className="text-danger small mt-1"
                            />
                          </div>

                          {/* Submit Button */}
                          <div className="pt-2">
                            <CButton
                              color="primary"
                              type="submit"
                              size="sm"
                              className="w-100 py-2 fw-bold"
                              disabled={isLoading}
                            >
                              {isLoading ? (
                                <>
                                  <CSpinner size="sm"></CSpinner> Đang cập nhật...
                                </>
                              ) : isEditing ? (
                                'Cập nhật vị trí'
                              ) : (
                                '+ Thêm vị trí mới'
                              )}
                            </CButton>
                          </div>
                        </Form>
                      )
                    }}
                  </Formik>
                </div>
              </div>
            </CCol>

            {/* RIGHT COLUMN: SEARCH & TABLE */}
            <CCol col={12} lg={8}>
              <div className="mb-3">
                <Search count={dataAdvertiseCategory?.length} onSearchData={handleSearch} />
              </div>

              {/* BATCH ACTION BAR */}
              {selectedCheckbox.length > 0 && (
                <div className="alert alert-primary bg-primary bg-opacity-10 border-primary border-opacity-25 d-flex justify-content-between align-items-center p-2.5 px-3 rounded-3 mb-3">
                  <div className="d-flex align-items-center gap-2">
                    <span className="fw-bold text-primary">
                      Đã chọn {selectedCheckbox.length} vị trí
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

              {/* TABLE CARD */}
              <div className="card border-0 shadow-sm rounded-3 overflow-hidden bg-white mb-4">
                <CTable hover className="align-middle mb-0" columns={columns} items={items} />

                {/* PAGINATION FOOTER */}
                <div className="card-footer bg-white border-top d-flex flex-wrap justify-content-end align-items-center p-3">
                  <ReactPaginate
                    pageCount={Math.ceil((dataAdvertiseCategory?.length || 0) / 15) || 1}
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
                    containerClassName={'pagination mb-0'}
                    activeClassName={'active'}
                    previousLabel={'<<'}
                    nextLabel={'>>'}
                  />
                </div>
              </div>
            </CCol>
          </CRow>
        </>
      )}
    </div>
  )
}

export default AdvertiseCategory
