import {
  CButton,
  CCol,
  CFormCheck,
  CFormInput,
  CFormSelect,
  CRow,
  CSpinner,
  CTable,
  CTableHead,
  CTableBody,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
} from '@coreui/react'
import React, { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import CIcon from '@coreui/icons-react'
import { cilTrash, cilColorBorder } from '@coreui/icons'

import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import ReactPaginate from 'react-paginate'
import DeletedModal from '../../components/deletedModal/DeletedModal'
import { toast } from 'react-toastify'
import { axiosClient } from '../../axiosConfig'
import Loading from '../../components/loading/Loading'

function Support() {
  const location = useLocation()
  const navigate = useNavigate()

  const params = new URLSearchParams(location.search)
  const id = params.get('id')
  const sub = params.get('sub')

  const [isPermissionCheck, setIsPermissionCheck] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const inputRef = useRef(null)

  const [supportGroup, setSupportGroup] = useState([])
  const [dataSupport, setDataSupport] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState('')

  const [isAllCheckbox, setIsAllCheckbox] = useState(false)
  const [selectedCheckbox, setSelectedCheckbox] = useState([])
  const [isCollapse, setIsCollapse] = useState(false)

  const [dataSearch, setDataSearch] = useState('')
  const [pageNumber, setPageNumber] = useState(1)

  const [visible, setVisible] = useState(false)
  const [deletedId, setDeletedId] = useState(null)

  const initialValues = {
    name: '',
    phone: '',
    email: '',
    skyName: '',
    type: '',
    groupType: '',
    display: 1,
  }

  const validationSchema = Yup.object().shape({
    name: Yup.string().required('Tên nhân viên là bắt buộc.'),
    phone: Yup.string()
      .required('Số điện thoại là bắt buộc.')
      .matches(/^\d{10,11}$/, 'Số điện thoại gồm 10 - 11 chữ số.'),
    email: Yup.string().required('Email là bắt buộc.').email('Email không hợp lệ.'),
    skyName: Yup.string(),
    groupType: Yup.string().when('type', {
      is: 'group',
      then: Yup.string().required('Nhóm support là bắt buộc.'),
    }),
    display: Yup.number().required('Trạng thái hiển thị là bắt buộc.'),
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

  const fetchDataSupportGroup = async () => {
    try {
      const response = await axiosClient.get('admin/support-group')
      if (response.data.status === true) {
        setSupportGroup(response.data.data || [])
      }

      if (response.data.status === false && response.data.mess === 'no permission') {
        setIsPermissionCheck(false)
      }
    } catch (error) {
      console.error('Fetch support group error', error)
    }
  }

  useEffect(() => {
    fetchDataSupportGroup()
  }, [])

  const fetchSupportData = async (keyword = '') => {
    try {
      setIsLoading(true)
      const response = await axiosClient.get(
        `admin/support?data=${keyword}&page=${pageNumber}&group=${selectedGroup}`,
      )
      if (response.data.status === true) {
        setDataSupport(response.data.data)
      }
    } catch (error) {
      console.error('Fetch support data error', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSupportData()
  }, [pageNumber, selectedGroup])

  const fetchDataById = async (setValues) => {
    try {
      const response = await axiosClient.get(`admin/support/${id}/edit`)
      const data = response.data.data

      if (response.data.status === true && data) {
        setValues({
          name: data?.title || '',
          phone: data?.phone || '',
          email: data?.email || '',
          skyName: data?.name || '',
          type: data?.type || '',
          groupType: data?.group || '',
          display: data?.display !== undefined ? data.display : 1,
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
      console.error('Fetch data id support error', error.message)
    }
  }

  const handleSubmit = async (values, { resetForm }) => {
    if (isEditing) {
      try {
        setIsLoading(true)
        const response = await axiosClient.put(`admin/support/${id}`, {
          title: values.name,
          email: values.email,
          phone: values.phone,
          name: values.skyName,
          type: values.type,
          group: values.groupType,
          display: values.display,
        })

        if (response.data.status === true) {
          toast.success('Cập nhật thông tin support thành công.')
          resetForm()
          setIsEditing(false)
          fetchSupportData()
          navigate('/support')
        } else {
          console.error('No data found for the given ID.')
        }
        if (response.data.status === false && response.data.mess === 'no permission') {
          toast.warn('Bạn không có quyền thực hiện tác vụ này!')
        }
      } catch (error) {
        console.error('Put data support error', error.message)
        toast.error('Đã xảy ra lỗi. Vui lòng thử lại!')
      } finally {
        setIsLoading(false)
      }
    } else {
      try {
        setIsLoading(true)
        const response = await axiosClient.post('admin/support', {
          title: values.name,
          email: values.email,
          phone: values.phone,
          name: values.skyName,
          type: values.type,
          group: values.groupType,
          display: values.display,
        })

        if (response.data.status === true) {
          toast.success('Thêm mới nhân viên support thành công!')
          resetForm()
          fetchSupportData()
          navigate('/support?sub=add')
        }

        if (response.data.status === false && response.data.mess === 'no permission') {
          toast.warn('Bạn không có quyền thực hiện tác vụ này!')
        }
      } catch (error) {
        console.error('Post data support error', error)
        toast.error('Đã xảy ra lỗi. Vui lòng thử lại!')
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleAddNewClick = () => {
    navigate('/support?sub=add')
  }

  const handleEditClick = (id) => {
    navigate(`/support?id=${id}&sub=edit`)
  }

  const handleDelete = async () => {
    setVisible(true)
    try {
      const response = await axiosClient.delete(`admin/support/${deletedId}`)
      if (response.data.status === true) {
        setVisible(false)
        fetchSupportData()
        toast.success('Xóa nhân viên support thành công!')
      }

      if (response.data.status === false && response.data.mess === 'no permission') {
        toast.warn('Bạn không có quyền thực hiện tác vụ này!')
      }
    } catch (error) {
      console.error('Delete support error', error)
      toast.error('Đã xảy ra lỗi khi xóa. Vui lòng thử lại!')
    } finally {
      setVisible(false)
    }
  }

  const handleToggleCollapse = () => {
    setIsCollapse((prevState) => !prevState)
  }

  const handlePageChange = ({ selected }) => {
    const newPage = selected + 1
    setPageNumber(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSearch = (keyword) => {
    setPageNumber(1)
    fetchSupportData(keyword)
  }

  const handleDeleteAll = async () => {
    try {
      const response = await axiosClient.post(`/admin/delete-all-support`, {
        data: selectedCheckbox,
      })

      if (response.data.status === true) {
        toast.success('Xóa tất cả mục đã chọn thành công!')
        fetchSupportData()
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
    dataSupport?.data && dataSupport?.data.length > 0
      ? dataSupport?.data.map((item) => ({
          id: (
            <CFormCheck
              key={item?.id}
              aria-label="Default select example"
              defaultChecked={item?.id}
              id={`flexCheckDefault_${item?.id}`}
              checked={selectedCheckbox.includes(item?.id)}
              value={item.id}
              onChange={(e) => {
                const supportId = item.id
                const isChecked = e.target.checked
                if (isChecked) {
                  setSelectedCheckbox([...selectedCheckbox, supportId])
                } else {
                  setSelectedCheckbox(selectedCheckbox.filter((id) => id !== supportId))
                }
              }}
            />
          ),
          name: (
            <div className="fw-bold text-dark" style={{ fontSize: '13.5px' }}>
              {item?.title || '—'}
            </div>
          ),
          contact: (
            <div className="d-flex flex-column gap-1">
              {item?.phone && (
                <div className="fw-semibold text-dark" style={{ fontSize: '13px' }}>
                  {item.phone}
                </div>
              )}
              {item?.email && <div className="text-secondary small">{item.email}</div>}
            </div>
          ),
          skyName: <span className="text-secondary small">{item?.name || '—'}</span>,
          type: (
            <div>
              {item?.type === 'chat' ? (
                <span
                  className="badge bg-info bg-opacity-10 text-info border border-info border-opacity-25 px-2 py-1"
                  style={{ fontSize: '11px' }}
                >
                  Chat
                </span>
              ) : item?.type === 'call' ? (
                <span
                  className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-1"
                  style={{ fontSize: '11px' }}
                >
                  Call
                </span>
              ) : (
                <span className="text-muted small">—</span>
              )}
            </div>
          ),
          status: (
            <div className="text-center">
              {item?.display === 1 || item?.display === '1' ? (
                <span
                  className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-1"
                  style={{ fontSize: '11px', fontWeight: 600 }}
                >
                  Hiển thị
                </span>
              ) : (
                <span
                  className="badge bg-danger bg-opacity-10 text-danger border border-danger border-opacity-25 px-2 py-1"
                  style={{ fontSize: '11px', fontWeight: 600 }}
                >
                  Đang ẩn
                </span>
              )}
            </div>
          ),
          actions: (
            <div className="d-flex justify-content-center">
              <button
                onClick={() => handleEditClick(item.id)}
                className="button-action mr-2 bg-info"
                title="Sửa nhân viên"
              >
                <CIcon icon={cilColorBorder} className="text-white" />
              </button>
              <button
                onClick={() => {
                  setVisible(true)
                  setDeletedId(item.id)
                }}
                className="button-action bg-danger"
                title="Xóa nhân viên"
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
              const allIds = dataSupport?.data.map((item) => item.id) || []
              setSelectedCheckbox(allIds)
            } else {
              setSelectedCheckbox([])
            }
          }}
        />
      ),
      _props: { scope: 'col', className: 'text-center' },
    },
    { key: 'name', label: 'Tên nhân viên', _props: { scope: 'col' } },
    { key: 'contact', label: 'Liên hệ (SĐT & Email)', _props: { scope: 'col' } },
    { key: 'skyName', label: 'Skype Name', _props: { scope: 'col' } },
    { key: 'type', label: 'Loại', _props: { scope: 'col' } },
    { key: 'status', label: 'Trạng thái', _props: { scope: 'col', className: 'text-center' } },
    { key: 'actions', label: 'Tác vụ', _props: { scope: 'col', className: 'text-center' } },
  ]

  const totalItems = dataSupport?.total || 0
  const perPage = dataSupport?.per_page || 10
  const totalPages = Math.ceil(totalItems / perPage) || 1
  const startItem = totalItems === 0 ? 0 : (pageNumber - 1) * perPage + 1
  const endItem = Math.min(pageNumber * perPage, totalItems)

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
              <h3 className="fw-bold text-uppercase text-dark m-0">QUẢN LÝ NHÂN VIÊN SUPPORT</h3>
              <p className="text-muted text-xs m-0 mt-1">
                Quản lý danh sách thông tin nhân viên hỗ trợ, hotline, email và nhóm phụ trách
              </p>
            </div>
            <div className="d-flex flex-wrap gap-2">
              <CButton
                onClick={handleAddNewClick}
                color="primary"
                size="sm"
                className="fw-bold px-3 shadow-xs"
              >
                + Thêm mới support
              </CButton>
              <Link to={'/group-support'}>
                <CButton color="light" size="sm" className="border fw-semibold shadow-xs">
                  Quản lý nhóm support
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
                    {!isEditing ? 'Thêm support mới' : 'Cập nhật support'}
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
                          {/* Name */}
                          <div>
                            <label className="form-label text-muted small fw-semibold text-uppercase mb-1">
                              Tên nhân viên <span className="text-danger">*</span>
                            </label>
                            <Field name="name">
                              {({ field }) => (
                                <CFormInput
                                  {...field}
                                  type="text"
                                  id="name-input"
                                  ref={inputRef}
                                  placeholder="Ví dụ: Ms.Phương"
                                />
                              )}
                            </Field>
                            <ErrorMessage
                              name="name"
                              component="div"
                              className="text-danger small mt-1"
                            />
                          </div>

                          {/* Phone */}
                          <div>
                            <label className="form-label text-muted small fw-semibold text-uppercase mb-1">
                              Số điện thoại <span className="text-danger">*</span>
                            </label>
                            <Field
                              name="phone"
                              type="text"
                              as={CFormInput}
                              id="phone-input"
                              placeholder="Ví dụ: 0903861434"
                            />
                            <ErrorMessage
                              name="phone"
                              component="div"
                              className="text-danger small mt-1"
                            />
                          </div>

                          {/* Email */}
                          <div>
                            <label className="form-label text-muted small fw-semibold text-uppercase mb-1">
                              Thư điện tử (Email) <span className="text-danger">*</span>
                            </label>
                            <Field
                              name="email"
                              type="email"
                              as={CFormInput}
                              id="email-input"
                              placeholder="cskh@nguyenkimvn.vn"
                            />
                            <ErrorMessage
                              name="email"
                              component="div"
                              className="text-danger small mt-1"
                            />
                          </div>

                          {/* Skype Name */}
                          <div>
                            <label className="form-label text-muted small fw-semibold text-uppercase mb-1">
                              Skype Name / Ghi chú
                            </label>
                            <Field
                              name="skyName"
                              type="text"
                              as={CFormInput}
                              id="skyName-input"
                              placeholder="skype_name..."
                            />
                            <ErrorMessage
                              name="skyName"
                              component="div"
                              className="text-danger small mt-1"
                            />
                          </div>

                          {/* Type */}
                          <div>
                            <label className="form-label text-muted small fw-semibold text-uppercase mb-1">
                              Loại hình hỗ trợ
                            </label>
                            <Field
                              name="type"
                              as={CFormSelect}
                              id="type-select"
                              options={[
                                { label: 'Chọn loại support', value: '' },
                                { label: 'Chat', value: 'chat' },
                                { label: 'Call (Gọi điện)', value: 'call' },
                              ]}
                            />
                            <ErrorMessage
                              name="type"
                              component="div"
                              className="text-danger small mt-1"
                            />
                          </div>

                          {/* Group Type */}
                          <div>
                            <label className="form-label text-muted small fw-semibold text-uppercase mb-1">
                              Nhóm Support
                            </label>
                            <Field
                              name="groupType"
                              as={CFormSelect}
                              id="groupType-select"
                              options={[
                                { label: 'Chọn nhóm support', value: '' },
                                ...(supportGroup && supportGroup.length > 0
                                  ? supportGroup.map((group) => ({
                                      label: group.title,
                                      value: group.name,
                                    }))
                                  : []),
                              ]}
                            />
                            <ErrorMessage
                              name="groupType"
                              component="div"
                              className="text-danger small mt-1"
                            />
                          </div>

                          {/* Display */}
                          <div>
                            <label className="form-label text-muted small fw-semibold text-uppercase mb-1">
                              Trạng thái hiển thị <span className="text-danger">*</span>
                            </label>
                            <Field
                              name="display"
                              as={CFormSelect}
                              id="display-select"
                              options={[
                                { label: 'Có (Hiển thị)', value: 1 },
                                { label: 'Không (Đang ẩn)', value: 0 },
                              ]}
                            />
                            <ErrorMessage
                              name="display"
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
                              className="w-100 py-2 fw-bold shadow-xs"
                              disabled={isLoading}
                            >
                              {isLoading ? (
                                <>
                                  <CSpinner size="sm" /> Đang cập nhật...
                                </>
                              ) : isEditing ? (
                                'Cập nhật support'
                              ) : (
                                '+ Thêm support mới'
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

            {/* RIGHT COLUMN: FILTER & TABLE */}
            <CCol col={12} lg={8}>
              {/* PRESERVED FILTER TABLE */}
              <div className="mb-4">
                <table className="filter-table">
                  <thead>
                    <tr>
                      <th colSpan="2">
                        <div className="d-flex justify-content-between align-items-center">
                          <span>Bộ lọc tìm kiếm</span>
                          <span className="toggle-pointer" onClick={handleToggleCollapse}>
                            {isCollapse ? '▼' : '▲'}
                          </span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  {!isCollapse ? (
                    <tbody>
                      <tr>
                        <td>Tổng cộng</td>
                        <td style={{ textAlign: 'left', fontWeight: 600 }}>
                          <span className="text-danger fw-bold" style={{ fontSize: '15px' }}>
                            {dataSupport?.total || 0}
                          </span>{' '}
                          <span className="text-dark fw-normal">nhân viên</span>
                        </td>
                      </tr>
                      <tr>
                        <td>Lọc theo nhóm</td>
                        <td>
                          <CFormSelect
                            className="component-size w-75"
                            aria-label="Chọn nhóm lọc"
                            options={[
                              { label: 'Tất cả nhóm support', value: '' },
                              ...(supportGroup && supportGroup.length > 0
                                ? supportGroup.map((group) => ({
                                    label: group.title,
                                    value: group.name,
                                  }))
                                : []),
                            ]}
                            value={selectedGroup}
                            onChange={(e) => setSelectedGroup(e.target.value)}
                          />
                        </td>
                      </tr>
                      <tr>
                        <td>Tìm kiếm</td>
                        <td>
                          <div className="d-flex gap-2 align-items-center mt-1">
                            <input
                              type="text"
                              className="search-input flex-grow-1"
                              placeholder="Nhập tên, số điện thoại, email..."
                              value={dataSearch}
                              onChange={(e) => setDataSearch(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSearch(dataSearch)
                              }}
                            />
                            <button onClick={() => handleSearch(dataSearch)} className="submit-btn">
                              Tìm kiếm
                            </button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  ) : null}
                </table>
              </div>

              {/* BATCH ACTION BAR */}
              {selectedCheckbox.length > 0 && (
                <div className="alert alert-primary bg-primary bg-opacity-10 border-primary border-opacity-25 d-flex justify-content-between align-items-center p-2.5 px-3 rounded-3 mb-3">
                  <div className="d-flex align-items-center gap-2">
                    <span className="fw-bold text-primary">
                      Đã chọn {selectedCheckbox.length} mục
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

              {/* DATA TABLE CARD */}
              <div className="card border-0 shadow-sm rounded-3 overflow-hidden bg-white mb-4">
                {isLoading ? (
                  <div className="p-5 text-center">
                    <Loading />
                  </div>
                ) : items.length === 0 ? (
                  <div className="p-5 text-center text-muted">
                    <h6 className="fw-bold text-dark">Chưa có thông tin nhân viên support nào</h6>
                    <p className="small text-muted mb-0">
                      Nhập thông tin bên khung trái và bấm nút &quot;+ Thêm support mới&quot;.
                    </p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <CTable hover className="align-middle mb-0">
                      <thead>
                        <CTableRow
                          className="bg-light text-secondary text-uppercase"
                          style={{ fontSize: '11.5px' }}
                        >
                          {columns.map((column) => (
                            <CTableHeaderCell key={column.key} className={column._props?.className}>
                              {column.label}
                            </CTableHeaderCell>
                          ))}
                        </CTableRow>
                      </thead>
                      <tbody>
                        {items.map((item, index) => (
                          <CTableRow key={index}>
                            {columns.map((column) => (
                              <CTableDataCell key={column.key} className={column._props?.className}>
                                {item[column.key]}
                              </CTableDataCell>
                            ))}
                          </CTableRow>
                        ))}
                      </tbody>
                    </CTable>
                  </div>
                )}

                {/* PAGINATION FOOTER */}
                {totalItems > 0 && (
                  <div className="card-footer bg-white border-top d-flex flex-wrap justify-content-between align-items-center gap-3 p-3">
                    <div className="text-muted small">
                      Hiển thị <strong>{startItem}</strong> - <strong>{endItem}</strong> trên tổng
                      số <strong>{totalItems}</strong> nhân viên
                    </div>
                    <ReactPaginate
                      pageCount={totalPages}
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
                      forcePage={pageNumber - 1}
                    />
                  </div>
                )}
              </div>
            </CCol>
          </CRow>
        </>
      )}
    </div>
  )
}

export default Support
