import React, { useEffect, useRef, useState } from 'react'
import {
  CButton,
  CCol,
  CContainer,
  CFormCheck,
  CFormInput,
  CFormSelect,
  CFormTextarea,
  CRow,
  CTable,
  CSpinner,
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
import Loading from '../../../components/loading/Loading'

function Department() {
  const [isLoading, setIsLoading] = useState(false)

  const location = useLocation()
  const navigate = useNavigate()

  const params = new URLSearchParams(location.search)
  const id = params.get('id')
  const sub = params.get('sub')

  // check permission state
  const [isPermissionCheck, setIsPermissionCheck] = useState(true)

  const [isEditing, setIsEditing] = useState(false)
  const inputRef = useRef(null)

  const [dataDepartment, setDataDepartment] = useState([])

  // show deleted Modal
  const [visible, setVisible] = useState(false)
  const [deletedId, setDeletedId] = useState(null)

  // checkbox selected
  const [isAllCheckbox, setIsAllCheckbox] = useState(false)
  const [selectedCheckbox, setSelectedCheckbox] = useState([])

  //pagination state
  const [pageNumber, setPageNumber] = useState(1)

  const initialValues = {
    title: '',
    email: '',
    phone: '',
    description: '',
    visible: 0,
  }

  const validationSchema = Yup.object({
    title: Yup.string().required('Tiêu đề là bắt buộc.').min(5, 'Tiêu đề phải có ít nhất 5 ký tự.'),
    email: Yup.string().required('Email là bắt buộc.').email('Email không hợp lệ.'),
    visible: Yup.number()
      .required('Trường này là bắt buộc.')
      .oneOf([0, 1], 'Giá trị phải là 0 hoặc 1.'),
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
  }, [location.search])

  const fetchDataDepartment = async (dataSearch = '') => {
    try {
      const response = await axiosClient.get(
        `admin/contact-staff?data=${dataSearch}&page=${pageNumber}`,
      )

      if (response.data.status === true) {
        setDataDepartment(response.data.data)
      }

      if (response.data.status === false && response.data.mess == 'no permission') {
        setIsPermissionCheck(false)
      }
    } catch (error) {
      console.error('Fetch data department is error', error)
    }
  }

  useEffect(() => {
    fetchDataDepartment()
  }, [pageNumber])

  const fetchDataById = async (setValues) => {
    try {
      const response = await axiosClient.get(`admin/contact-staff/${id}/edit`)
      const data = response.data.contactStaff
      if (data) {
        setValues({
          title: data?.title,
          email: data?.email,
          phone: data?.phone,
          description: data?.description,
          visible: data?.display,
        })
        setSelectedFile(data.picture)
      } else {
        console.error('No data found for the given ID.')
      }

      // phân quyền tác vụ edit
      if (
        sub == 'edit' &&
        response.data.status === false &&
        response.data.mess == 'no permission'
      ) {
        toast.warn('Bạn không có quyền thực hiện tác vụ này!')
      }
    } catch (error) {
      console.error('Fetch data id department is error', error.message)
    }
  }

  const handleSubmit = async (values, { resetForm }) => {
    if (isEditing) {
      setIsLoading(true)
      //call api update data
      try {
        const response = await axiosClient.put(`admin/contact-staff/${id}`, {
          title: values.title,
          email: values.email,
          phone: values.phone,
          description: values.description,
          display: values.visible,
        })
        if (response.data.status === true) {
          toast.success('Cập nhật phòng ban thành công')
          resetForm()
          fetchDataDepartment()
          navigate('/department')
          setIsEditing(false)
        } else {
          console.error('No data found for the given ID.')
        }

        // phân quyền tác vụ update
        if (response.data.status === false && response.data.mess == 'no permission') {
          toast.warn('Bạn không có quyền thực hiện tác vụ này!')
        }
      } catch (error) {
        console.error('Put data id department is error', error.message)
        toast.error('Đã xảy ra lỗi. Vui lòng thử lại!')
      } finally {
        setIsLoading(false)
      }
    } else {
      setIsLoading(true)
      //call api post new data
      try {
        const response = await axiosClient.post('admin/contact-staff', {
          title: values.title,
          email: values.email,
          phone: values.phone,
          description: values.description,
          display: values.visible,
        })

        if (response.data.status === true) {
          toast.success('Thêm mới phòng ban thành công!')
          resetForm()
          fetchDataDepartment()
          navigate('/department?sub=add')
        }

        // phân quyền tác vụ add
        if (response.data.status === false && response.data.mess == 'no permission') {
          toast.warn('Bạn không có quyền thực hiện tác vụ này!')
        }
      } catch (error) {
        console.error('Post data department is error', error)
        toast.error('Đã xảy ra lỗi. Vui lòng thử lại!')
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleAddNewClick = () => {
    navigate('/department?sub=add')
  }

  const handleEditClick = (id) => {
    navigate(`/department?id=${id}&sub=edit`)
  }

  // delete row
  const handleDelete = async () => {
    setVisible(true)
    try {
      const response = await axiosClient.delete(`admin/contact-staff/${deletedId}`)
      if (response.data.status === true) {
        setVisible(false)
        fetchDataDepartment()
      }

      // phân quyền tác vụ delete
      if (response.data.status === false && response.data.mess == 'no permission') {
        toast.warn('Bạn không có quyền thực hiện tác vụ này!')
      }
    } catch (error) {
      console.error('Delete department id is error', error)
      toast.error('Đã xảy ra lỗi khi xóa. Vui lòng thử lại!')
    }
  }

  // pagination data
  const handlePageChange = ({ selected }) => {
    const newPage = selected + 1
    if (newPage < 2) {
      setPageNumber(newPage)
      window.scrollTo(0, 0)
      return
    }
    window.scrollTo(0, 0)
    setPageNumber(newPage)
  }

  // search Data
  const handleSearch = (keyword) => {
    fetchDataDepartment(keyword)
  }

  const items =
    dataDepartment?.data && dataDepartment?.data?.length > 0
      ? dataDepartment?.data.map((item) => ({
          id: (
            <CFormCheck
              id={item.staff_id}
              checked={selectedCheckbox.includes(item.staff_id)}
              value={item.staff_id}
              onChange={(e) => {
                const idx = item.staff_id
                const isChecked = e.target.checked
                if (isChecked) {
                  setSelectedCheckbox([...selectedCheckbox, idx])
                } else {
                  setSelectedCheckbox(selectedCheckbox.filter((id) => id !== idx))
                }
              }}
            />
          ),
          title: item?.title,

          mail: item?.email,
          actions: (
            <div>
              <button
                onClick={() => handleEditClick(item.staff_id)}
                className="button-action mr-2 bg-info"
              >
                <CIcon icon={cilColorBorder} className="text-white" />
              </button>
              <button
                onClick={() => {
                  setVisible(true)
                  setDeletedId(item.staff_id)
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
        <CFormCheck
          aria-label="Select all"
          checked={isAllCheckbox}
          onChange={(e) => {
            const isChecked = e.target.checked
            setIsAllCheckbox(isChecked)
            if (isChecked) {
              const allIds = dataDepartment?.data.map((item) => item.staff_id) || []
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
      label: 'Tiêu đề',
      _props: { scope: 'col' },
    },
    {
      key: 'mail',
      label: 'Thư điện tử',
      _props: { scope: 'col' },
    },

    {
      key: 'actions',
      label: 'Tác vụ',
      _props: { scope: 'col' },
    },
  ]

  const handleDeleteSelectedCheckbox = async () => {
    try {
      const response = await axiosClient.post('admin/delete-all-contact-staff', {
        data: selectedCheckbox,
      })

      if (response.data.status === true) {
        toast.success('Xóa tất cả các mục thành công!')
        fetchDataDepartment()
        setSelectedCheckbox([])
      }
    } catch (error) {
      console.error('Delete selected checkbox is error', error)
    }
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
            <CCol md={6}>
              <h2>QUẢN LÝ PHÒNG BAN</h2>
            </CCol>
            <CCol md={6}>
              <div className="d-flex justify-content-end">
                <CButton
                  onClick={handleAddNewClick}
                  color="primary"
                  type="submit"
                  size="sm"
                  className="button-add"
                >
                  Thêm mới
                </CButton>
                <Link to={'/department'}>
                  <CButton color="primary" type="submit" size="sm">
                    Danh sách
                  </CButton>
                </Link>
              </div>
            </CCol>
          </CRow>

          <CRow>
            <CCol md={4}>
              <h6>{!isEditing ? 'Thêm thương hiệu mới' : 'Cập nhật thương hiệu'}</h6>
              <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {({ setFieldValue, setValues }) => {
                  useEffect(() => {
                    fetchDataById(setValues)
                  }, [setValues, id])
                  return (
                    <Form>
                      <CCol md={12}>
                        <label htmlFor="title-input">Tiêu đề </label>
                        <Field name="title">
                          {({ field }) => (
                            <CFormInput
                              {...field}
                              type="text"
                              id="title-input"
                              ref={inputRef}
                              text="Tên riêng sẽ hiển thị lên trang web của bạn."
                            />
                          )}
                        </Field>
                        <ErrorMessage name="title" component="div" className="text-danger" />
                      </CCol>
                      <br />

                      <CCol md={12}>
                        <label htmlFor="email-input">Thư điện tử</label>
                        <Field name="email" type="email" as={CFormInput} id="email-input" />
                        <ErrorMessage name="email" component="div" className="text-danger" />
                      </CCol>
                      <br />
                      <CCol md={12}>
                        <label htmlFor="phone-input">Điện thoại</label>
                        <Field name="phone" type="number" as={CFormInput} id="phone-input" />
                        <ErrorMessage name="phone" component="div" className="text-danger" />
                      </CCol>
                      <br />

                      <CCol md={12}>
                        <label htmlFor="desc-input">Mô tả</label>
                        <Field
                          style={{ height: '100px' }}
                          name="description"
                          type="text"
                          as={CFormTextarea}
                          id="desc-input"
                          text="Mô tả bình thường không được sử dụng trong giao diện, tuy nhiên có vài giao diện hiện thị mô tả này."
                        />
                        <ErrorMessage name="description" component="div" className="text-danger" />
                      </CCol>
                      <br />

                      <CCol md={12}>
                        <label htmlFor="visible-select">Hiển thị</label>
                        <Field
                          name="visible"
                          as={CFormSelect}
                          id="visible-select"
                          options={[
                            { label: 'Không', value: 0 },
                            { label: 'Có', value: 1 },
                          ]}
                        />
                        <ErrorMessage name="visible" component="div" className="text-danger" />
                      </CCol>
                      <br />

                      <CCol xs={12}>
                        <CButton color="primary" type="submit" size="sm" disabled={isLoading}>
                          {isLoading ? (
                            <>
                              <CSpinner size="sm"></CSpinner> Đang cập nhật...
                            </>
                          ) : isEditing ? (
                            'Cập nhật'
                          ) : (
                            'Thêm mới'
                          )}
                        </CButton>
                      </CCol>
                    </Form>
                  )
                }}
              </Formik>
            </CCol>

            <CCol>
              <Search count={dataDepartment?.total} onSearchData={handleSearch} />
              <CCol md={12} className="mt-3">
                <CButton onClick={handleDeleteSelectedCheckbox} color="primary" size="sm">
                  Xóa vĩnh viễn
                </CButton>
              </CCol>

              <CTable className="mt-3" columns={columns} items={items} />

              <div className="d-flex justify-content-end">
                <ReactPaginate
                  pageCount={Math.ceil(dataDepartment?.total / dataDepartment?.per_page)}
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
                />
              </div>
            </CCol>
          </CRow>
        </>
      )}
    </div>
  )
}

export default Department
