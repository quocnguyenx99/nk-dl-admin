import React, { useEffect, useRef, useState } from 'react'
import {
  CButton,
  CCol,
  CContainer,
  CFormInput,
  CImage,
  CRow,
  CFormSelect,
  CTable,
  CFormCheck,
  CSpinner,
} from '@coreui/react'
import './css/adminList.css'
import CIcon from '@coreui/icons-react'
import { cilTrash, cilColorBorder } from '@coreui/icons'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import ReactPaginate from 'react-paginate'
import DeletedModal from '../../components/deletedModal/DeletedModal'

import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { axiosClient, imageBaseUrl } from '../../axiosConfig'
import moment from 'moment/moment'
import { toast } from 'react-toastify'

function AdminList() {
  const location = useLocation()
  const navigate = useNavigate()

  const params = new URLSearchParams(location.search)
  const id = params.get('id')
  const sub = params.get('sub')

  // check permission state
  const [isPermissionCheck, setIsPermissionCheck] = useState(true)

  const [isEditing, setIsEditing] = useState(false)
  const inputRef = useRef(null)

  const [dataRole, setDataRole] = useState([])
  const [adminListData, setAdminListData] = useState([])
  const [roleChoosen, setRoleChoosen] = useState('')

  // loading button
  const [isLoadingButton, setIsLoadingButton] = useState(false)

  // selected checkbox
  // selected checkbox
  const [isAllCheckbox, setIsAllCheckbox] = useState(false)
  const [selectedCheckbox, setSelectedCheckbox] = useState([])

  const [isCollapse, setIsCollapse] = useState(false)

  // search input
  const [dataSearch, setDataSearch] = useState('')

  //pagination state
  const [pageNumber, setPageNumber] = useState(1)

  // show deleted Modal
  const [visible, setVisible] = useState(false)
  const [deletedId, setDeletedId] = useState(null)

  // upload image and show image
  const [selectedFile, setSelectedFile] = useState('')
  const [file, setFile] = useState([])

  // form formik value
  const initialValues = {
    username: '',
    password: '',
    email: '',
    phone: '',
    displayName: '',
    role: '',
  }

  const validationSchema = Yup.object({
    username: Yup.string().required('Tên đăng nhập là bắt buộc.'),
    email: Yup.string().email('Địa chỉ email không hợp lệ.').required('Email là bắt buộc.'),
    phone: Yup.string().required('Số điện thoại là bắt buộc.'),
    displayName: Yup.string().required('Tên hiển thị là bắt buộc.'),
    role: Yup.string().required('Vai trò là bắt buộc.'),
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

  const fetchDataById = async (setValues) => {
    try {
      const response = await axiosClient.get(`/admin/information/${id}/edit`)
      const data = response.data.userAdminDetail

      if (data && response.data.status === true) {
        setValues({
          username: data.username,
          // password: '',
          email: data.email,
          displayName: data.display_name,
          phone: data.phone,
          role: data?.roles[0].id,
        })
        setSelectedFile(data.avatar)
      } else {
        console.error('No data found for the given ID.')
      }
    } catch (error) {
      console.error('Fetch data id admin is error', error.message)
    }
  }

  const fetchAdminGroupData = async () => {
    try {
      const response = await axiosClient.get(`admin/role`)

      if (response.data.status === true) {
        setDataRole(response.data.roles)
      }
    } catch (error) {
      console.error('Fetch role adminstrator data is error', error)
    }
  }

  useEffect(() => {
    fetchAdminGroupData()
  }, [])

  const fetchAdminListData = async (dataSearch = '') => {
    try {
      const response = await axiosClient.get(
        `/admin/information?data=${dataSearch}&page=${pageNumber}&role_id=${roleChoosen}`,
      )

      if (response.data.status === true) {
        setAdminListData(response.data.adminList)
      }

      if (response.data.status === false && response.data.mess == 'no permission') {
        setIsPermissionCheck(false)
      }
    } catch (error) {
      console.error('Fetch admin list data is error', error)
    }
  }

  useEffect(() => {
    fetchAdminListData()
  }, [pageNumber, roleChoosen])

  const handleSubmit = async (values, { resetForm }) => {
    if (isEditing) {
      //call api update data
      try {
        setIsLoadingButton(true)
        const response = await axiosClient.put(`/admin/information/${id}`, {
          email: values.email,
          display_name: values.displayName,
          avatar: selectedFile,
          phone: values.phone,
          role_id: values.role,
        })
        if (response.data.status === true) {
          toast.success('Cập nhật thông tin admin thành công!')
          resetForm()
          fetchAdminListData()
          navigate('/admin/list')
        }

        if (response.data.status === false && response.data.mess == 'no permission') {
          toast.warn('Bạn không có quyền thực hiện tác vụ này!')
        }
      } catch (error) {
        console.error('Put data admin is error', error)
      } finally {
        setIsLoadingButton(false)
      }
    } else {
      //call api post new data
      try {
        setIsLoadingButton(true)
        const response = await axiosClient.post('/admin/information', {
          username: values.username,
          password: values.password,
          email: values.email,
          display_name: values.displayName,
          avatar: selectedFile,
          phone: values.phone,
          role_id: values.role,
        })

        if (response.data.status === true) {
          toast.success('Thêm mới thông tin admin thành công!')
          resetForm()
          setFile([])
          setSelectedFile([])
          navigate('/admin/list?sub=add')
          fetchAdminListData()
        }

        if (response.data.status === false && response.data.mess == 'no permission') {
          toast.warn('Bạn không có quyền thực hiện tác vụ này!')
        }
      } catch (error) {
        console.error('Post data admin is error', error)
      } finally {
        setIsLoadingButton(false)
      }
    }
  }

  const handleAddNewClick = () => {
    navigate('/admin/list?sub=add')
  }

  const handleEditClick = (id) => {
    navigate(`/admin/list?id=${id}&sub=edit`)
  }

  // delete row
  const handleDelete = async () => {
    setVisible(true)
    try {
      const response = await axiosClient.delete(`/admin/information/${deletedId}`)
      if (response.data.status === true) {
        setVisible(false)
        fetchAdminListData()
      }
    } catch (error) {
      console.error('Delete admin id is error', error)
      toast.error('Đã xảy ra lỗi khi xóa. Vui lòng thử lại!')
    }
  }

  const handleToggleCollapse = () => {
    setIsCollapse((prevState) => !prevState)
  }

  // search Data
  const handleSearch = (keyword) => {
    fetchAdminListData(keyword)
  }

  const handleDeleteAll = async () => {
    // alert('Chức năng đang thực hiện...')

    try {
      const response = await axiosClient.post(`/admin/delete-all-admin`, {
        data: selectedCheckbox,
      })

      if (response.data.status === true) {
        toast.success('Xóa tất cả thành công!')
        fetchAdminListData()
        setSelectedCheckbox([])
      }

      if (response.data.status === false && response.data.mess == 'no permission') {
        toast.warn('Bạn không có quyền thực hiện tác vụ này!')
      }
    } catch (error) {
      toast.error('Đã xảy ra lỗi. Vui lòng thử lại!')
    }
  }

  //set img avatar
  function onFileChange(e) {
    const files = e.target.files
    const selectedFiles = []
    const fileUrls = []

    Array.from(files).forEach((file) => {
      // Create a URL for the file
      fileUrls.push(URL.createObjectURL(file))

      // Read the file as base64
      const fileReader = new FileReader()
      fileReader.readAsDataURL(file)

      fileReader.onload = (event) => {
        selectedFiles.push(event.target.result)
        // Set base64 data after all files have been read
        if (selectedFiles.length === files.length) {
          setSelectedFile(selectedFiles)
        }
      }
    })

    // Set file URLs for immediate preview
    setFile(fileUrls)
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

  const items =
    adminListData?.data && adminListData?.data?.length > 0
      ? adminListData?.data.map((item) => ({
          id: (
            <CFormCheck
              id={item.id}
              checked={selectedCheckbox.includes(item.id)}
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
          username: <div className="blue-txt">{item.username}</div>,
          role: item.roles && item?.roles.length > 0 ? item.roles[0].title : 'Không',
          visited:
            item.lastlogin !== '0'
              ? moment.unix(item?.lastlogin).format('DD-MM-YYYY, hh:mm:ss A')
              : 'Chưa từng đăng nhập',
          actions: (
            <div>
              <button
                onClick={() => handleEditClick(item.id)}
                className="button-action mr-2 bg-info"
              >
                <CIcon icon={cilColorBorder} className="text-white" />
              </button>
              <button
                onClick={() => {
                  setVisible(true)
                  setDeletedId(item?.id)
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
              const allIds = adminListData?.data.map((item) => item.id) || []
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
      key: 'username',
      label: 'Tên đăng nhập',
      _props: { scope: 'col' },
    },
    {
      key: 'role',
      label: 'Vai trò',
      _props: { scope: 'col' },
    },
    {
      key: 'visited',
      label: 'Đăng nhập gần đây',
      _props: { scope: 'col' },
    },
    {
      key: 'actions',
      label: 'Tác vụ',
      _props: { scope: 'col' },
    },
  ]

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
              <h2>QUẢN LÝ TÀI KHOẢN AMDIN</h2>
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
                <CButton color="primary" type="submit" size="sm">
                  Danh sách
                </CButton>
              </div>
            </CCol>
          </CRow>

          <CRow>
            {/* Form add/ edit */}
            <CCol md={4}>
              <h6>{!isEditing ? 'Thêm admin mới' : 'Cập nhật tài khoản admin'}</h6>
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
                        <label htmlFor="username-input">Tên đăng nhập</label>
                        <Field name="username">
                          {({ field }) => (
                            <CFormInput {...field} type="text" id="username-input" ref={inputRef} />
                          )}
                        </Field>
                        <ErrorMessage name="username" component="div" className="text-danger" />
                      </CCol>
                      <br />

                      <CCol md={12}>
                        <label htmlFor="password-input">Mật khẩu</label>
                        <Field
                          name="password"
                          type="password"
                          as={CFormInput}
                          id="password-input"
                        />
                        <ErrorMessage name="password" component="div" className="text-danger" />
                      </CCol>
                      <br />

                      <CCol md={12}>
                        <label htmlFor="email-input">Thư điện tử</label>
                        <Field name="email" type="email" as={CFormInput} id="email-input" />
                        <ErrorMessage name="email" component="div" className="text-danger" />
                      </CCol>
                      <br />

                      <CCol md={12}>
                        <label htmlFor="phone-input">Số điện thoại</label>
                        <Field name="phone" type="text" as={CFormInput} id="phone-input" />
                        <ErrorMessage name="phone" component="div" className="text-danger" />
                      </CCol>
                      <br />

                      <CCol md={12}>
                        <label htmlFor="display-name-input">Tên hiển thị</label>
                        <Field
                          name="displayName"
                          type="text"
                          as={CFormInput}
                          id="display-name-input"
                        />
                        <ErrorMessage name="displayName" component="div" className="text-danger" />
                      </CCol>
                      <br />

                      <CCol md={12}>
                        <CFormInput
                          name="avatar"
                          type="file"
                          id="formFile"
                          label="Ảnh đại diện"
                          size="sm"
                          onChange={(e) => onFileChange(e)}
                        />
                        <br />
                        <ErrorMessage name="avatar" component="div" className="text-danger" />

                        <div>
                          {file.length == 0 ? (
                            <div>
                              <CImage src={`${imageBaseUrl}` + selectedFile} width={370} />
                            </div>
                          ) : (
                            file.map((item, index) => <CImage key={index} src={item} width={370} />)
                          )}
                        </div>
                      </CCol>
                      <br />

                      <CCol md={12}>
                        <label htmlFor="role-select">Vai trò</label>
                        <Field
                          name="role"
                          as={CFormSelect}
                          id="role-select"
                          options={[
                            { label: 'Chọn vai trò', value: '', disabled: true },
                            ...(dataRole && dataRole?.length > 0
                              ? dataRole?.map((role) => ({ label: role.title, value: role.id }))
                              : []),
                          ]}
                        />
                        <ErrorMessage name="role" component="div" className="text-danger" />
                      </CCol>
                      <br />

                      <CCol xs={12}>
                        <CButton color="primary" type="submit" size="sm" disabled={isLoadingButton}>
                          {isLoadingButton ? (
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

            {/* search, table view */}
            <CCol md={8}>
              <CRow>
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
                        <td className="total-count">{adminListData?.total}</td>
                      </tr>
                      <tr>
                        <td>Lọc</td>
                        <td>
                          <CFormSelect
                            className="component-size w-50"
                            aria-label="Chọn yêu cầu lọc"
                            options={[
                              { label: 'Tất cả', value: '' },
                              ...(Array.isArray(dataRole) && dataRole.length > 0
                                ? dataRole.map((role) => ({ label: role.title, value: role.id }))
                                : []),
                            ]}
                            value={roleChoosen}
                            onChange={(e) => setRoleChoosen(e.target.value)}
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
              </CRow>
              <CRow>
                <CCol className="my-2" md={4}>
                  <CButton color="primary" size="sm" onClick={handleDeleteAll}>
                    Xóa vĩnh viễn
                  </CButton>
                </CCol>
              </CRow>
              <CRow>
                <CTable className="mt-2" columns={columns} items={items} />
                <div className="d-flex justify-content-end">
                  <ReactPaginate
                    pageCount={Math.ceil(adminListData?.total / adminListData?.per_page)}
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
              </CRow>
            </CCol>
          </CRow>
        </>
      )}
    </div>
  )
}

export default AdminList
