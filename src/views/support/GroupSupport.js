import React, { useEffect, useRef, useState } from 'react'
import { CButton, CCol, CFormCheck, CFormInput, CRow, CSpinner, CTable } from '@coreui/react'

import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Search from '../../components/search/Search'

import CIcon from '@coreui/icons-react'
import { cilTrash, cilColorBorder } from '@coreui/icons'
import DeletedModal from '../../components/deletedModal/DeletedModal'
import { toast } from 'react-toastify'
import { axiosClient } from '../../axiosConfig'

function GroupSupport() {
  const location = useLocation()
  const navigate = useNavigate()

  const params = new URLSearchParams(location.search)
  const id = params.get('id')
  const sub = params.get('sub')

  const [isPermissionCheck, setIsPermissionCheck] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const inputRef = useRef(null)

  const [dataSupportGroup, setDataSupportGroup] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  const [visible, setVisible] = useState(false)
  const [deletedId, setDeletedId] = useState(null)

  const [isAllCheckbox, setIsAllCheckbox] = useState(false)
  const [selectedCheckbox, setSelectedCheckbox] = useState([])

  const initialValues = {
    title: '',
    name: '',
  }

  const validationSchema = Yup.object({
    title: Yup.string().required('Tiêu đề là bắt buộc.'),
    name: Yup.string().required('Name là bắt buộc.'),
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

  const fetchDataSupportGroup = async (dataSearch = '') => {
    try {
      const response = await axiosClient.get(`admin/support-group?data=${dataSearch}`)
      if (response.data.status === true) {
        setDataSupportGroup(response.data.data)
      }

      if (response.data.status === false && response.data.mess === 'no permission') {
        setIsPermissionCheck(false)
      }
    } catch (error) {
      console.error('Fetch data support group is error', error)
    }
  }

  useEffect(() => {
    fetchDataSupportGroup()
  }, [])

  const fetchDataById = async (setValues) => {
    try {
      const response = await axiosClient.get(`admin/support-group/${id}/edit`)
      const data = response.data.data
      if (data && response.data.status === true) {
        setValues({
          title: data.title,
          name: data.name,
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
      console.error('Fetch data id group support is error', error.message)
    }
  }

  const handleSubmit = async (values, { resetForm }) => {
    if (isEditing) {
      try {
        setIsLoading(true)
        const response = await axiosClient.put(`admin/support-group/${id}`, {
          title: values.title,
          name: values.name,
        })
        if (response.data.status === true) {
          toast.success('Cập nhật nhóm support thành công')
          resetForm()
          fetchDataSupportGroup()
          setIsEditing(false)
          navigate('/group-support')
        } else {
          console.error('No data found for the given ID.')
        }

        if (response.data.status === false && response.data.mess === 'no permission') {
          toast.warn('Bạn không có quyền thực hiện tác vụ này!')
        }
      } catch (error) {
        console.error('Put data id group support is error', error.message)
        toast.error('Đã xảy ra lỗi. Vui lòng thử lại!')
      } finally {
        setIsLoading(false)
      }
    } else {
      try {
        setIsLoading(true)
        const response = await axiosClient.post('admin/support-group', {
          title: values.title,
          name: values.name,
        })
        if (response.data.status === true) {
          toast.success('Thêm mới nhóm support thành công!')
          resetForm()
          fetchDataSupportGroup()
          navigate('/group-support?sub=add')
        }

        if (response.data.status === false && response.data.mess === 'no permission') {
          toast.warn('Bạn không có quyền thực hiện tác vụ này!')
        }
      } catch (error) {
        console.error('Post data group support is error', error)
        toast.error('Đã xảy ra lỗi. Vui lòng thử lại!')
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleAddNewClick = () => {
    navigate('/group-support?sub=add')
  }

  const handleEditClick = (id) => {
    navigate(`/group-support?id=${id}&sub=edit`)
  }

  const handleDelete = async () => {
    setVisible(true)
    try {
      const response = await axiosClient.delete(`admin/support-group/${deletedId}`)
      if (response.data.status === true) {
        setVisible(false)
        fetchDataSupportGroup()
        toast.success('Xóa nhóm support thành công!')
      }

      if (response.data.status === false && response.data.mess === 'no permission') {
        toast.warn('Bạn không có quyền thực hiện tác vụ này!')
      }
    } catch (error) {
      console.error('Delete support group id is error', error)
      toast.error('Đã xảy ra lỗi khi xóa. Vui lòng thử lại!')
    }
  }

  const handleSearch = (keyword) => {
    fetchDataSupportGroup(keyword)
  }

  const handleDeleteAll = async () => {
    try {
      const response = await axiosClient.post(`admin/delete-all-support-group`, {
        data: selectedCheckbox,
      })

      if (response.data.status === true) {
        toast.success('Đã xóa các nhóm được chọn!')
        fetchDataSupportGroup()
        setSelectedCheckbox([])
      }

      if (response.data.status === false && response.data.mess === 'no permission') {
        toast.warn('Bạn không có quyền thực hiện tác vụ này!')
      }
    } catch (error) {
      toast.error('Đã xảy ra lỗi. Vui lòng thử lại!')
    }
  }

  const items =
    dataSupportGroup && dataSupportGroup?.length > 0
      ? dataSupportGroup.map((item) => ({
          id: (
            <CFormCheck
              key={item?.id}
              aria-label="Default select example"
              defaultChecked={item?.id}
              id={`flexCheckDefault_${item?.id}`}
              checked={selectedCheckbox.includes(item?.id)}
              value={item.id}
              onChange={(e) => {
                const idx = item.id
                const isChecked = e.target.checked
                if (isChecked) {
                  setSelectedCheckbox([...selectedCheckbox, idx])
                } else {
                  setSelectedCheckbox(selectedCheckbox.filter((id) => id !== idx))
                }
              }}
            />
          ),
          title: (
            <div>
              <div className="fw-bold text-dark" style={{ fontSize: '13.5px' }}>
                {item.title}
              </div>
              {item.name && (
                <span
                  className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-2 py-0.5 mt-1"
                  style={{ fontSize: '11px' }}
                >
                  #{item.name}
                </span>
              )}
            </div>
          ),
          name: <span className="fw-semibold text-secondary">{item.name || '—'}</span>,
          actions: (
            <div className="d-flex justify-content-center">
              <button
                onClick={() => handleEditClick(item.id)}
                className="button-action mr-2 bg-info"
                title="Sửa nhóm"
              >
                <CIcon icon={cilColorBorder} className="text-white" />
              </button>
              <button
                onClick={() => {
                  setVisible(true)
                  setDeletedId(item.id)
                }}
                className="button-action bg-danger"
                title="Xóa nhóm"
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
              const allIds = dataSupportGroup?.map((item) => item.id) || []
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
      label: 'Tiêu đề nhóm',
      _props: { scope: 'col' },
    },
    {
      key: 'name',
      label: 'Mã Name',
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
              <h3 className="fw-bold text-uppercase text-dark m-0">QUẢN LÝ NHÓM SUPPORT</h3>
              <p className="text-muted text-xs m-0 mt-1">
                Quản lý phân loại nhóm hỗ trợ khách hàng (Chăm sóc khách hàng, Kinh doanh Online...)
              </p>
            </div>
            <div className="d-flex flex-wrap gap-2">
              <CButton
                onClick={handleAddNewClick}
                color="primary"
                size="sm"
                className="fw-bold px-3 shadow-xs"
              >
                + Thêm nhóm mới
              </CButton>
              <Link to={'/support'}>
                <CButton color="light" size="sm" className="border fw-semibold shadow-xs">
                  Danh sách nhân viên Support
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
                    {!isEditing ? 'Thêm nhóm support mới' : 'Cập nhật nhóm support'}
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
                          <div>
                            <label className="form-label text-muted small fw-semibold text-uppercase mb-1">
                              Tiêu đề nhóm <span className="text-danger">*</span>
                            </label>
                            <Field name="title">
                              {({ field }) => (
                                <CFormInput
                                  {...field}
                                  type="text"
                                  id="title-input"
                                  ref={inputRef}
                                  placeholder="Ví dụ: Chăm sóc khách hàng"
                                />
                              )}
                            </Field>
                            <ErrorMessage
                              name="title"
                              component="div"
                              className="text-danger small mt-1"
                            />
                          </div>

                          <div>
                            <label className="form-label text-muted small fw-semibold text-uppercase mb-1">
                              Mã Name (Duy nhất) <span className="text-danger">*</span>
                            </label>
                            <Field
                              name="name"
                              type="text"
                              as={CFormInput}
                              id="name-input"
                              placeholder="Ví dụ: cskh"
                            />
                            <ErrorMessage
                              name="name"
                              component="div"
                              className="text-danger small mt-1"
                            />
                          </div>

                          <div className="pt-2">
                            <CButton
                              color="primary"
                              type="submit"
                              size="sm"
                              className="w-100 py-2 fw-bold shadow-xs"
                              disabled={isLoading}
                            >
                              {isLoading ? (
                                <>
                                  <CSpinner size="sm" /> Đang cập nhật...
                                </>
                              ) : isEditing ? (
                                'Cập nhật nhóm'
                              ) : (
                                '+ Thêm nhóm mới'
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
                <Search count={dataSupportGroup?.length} onSearchData={handleSearch} />
              </div>

              {/* BATCH ACTION BAR */}
              {selectedCheckbox.length > 0 && (
                <div className="alert alert-primary bg-primary bg-opacity-10 border-primary border-opacity-25 d-flex justify-content-between align-items-center p-2.5 px-3 rounded-3 mb-3">
                  <div className="d-flex align-items-center gap-2">
                    <span className="fw-bold text-primary">
                      Đã chọn {selectedCheckbox.length} nhóm
                    </span>
                  </div>
                  <CButton
                    color="danger"
                    size="sm"
                    className="fw-semibold text-white shadow-xs"
                    onClick={handleDeleteAll}
                  >
                    Xóa {selectedCheckbox.length} mục đã chọn
                  </CButton>
                </div>
              )}

              {/* TABLE CARD */}
              <div className="card border-0 shadow-sm rounded-3 overflow-hidden bg-white mb-4">
                <CTable hover className="align-middle mb-0" columns={columns} items={items} />
              </div>
            </CCol>
          </CRow>
        </>
      )}
    </div>
  )
}

export default GroupSupport
