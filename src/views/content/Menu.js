import React, { useEffect, useRef, useState } from 'react'
import {
  CButton,
  CCol,
  CContainer,
  CFormInput,
  CFormSelect,
  CImage,
  CRow,
  CSpinner,
} from '@coreui/react'

import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Search from '../../components/search/Search'

import CIcon from '@coreui/icons-react'
import { cilTrash, cilColorBorder } from '@coreui/icons'
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai'
import DeletedModal from '../../components/deletedModal/DeletedModal'
import { toast } from 'react-toastify'
import { axiosClient, imageBaseUrl } from '../../axiosConfig'

import Loading from '../../components/loading/Loading'

function Menu() {
  const location = useLocation()
  const navigate = useNavigate()

  const params = new URLSearchParams(location.search)
  const id = params.get('id')
  const sub = params.get('sub')

  // check permission state
  const [isPermissionCheck, setIsPermissionCheck] = useState(true)

  const [isEditing, setIsEditing] = useState(false)
  const inputRef = useRef(null)

  const [dataMenu, setDataMenu] = useState([])

  const [isLoading, setIsLoading] = useState({
    page: false,
    button: false,
  })

  // show deleted Modal
  const [visible, setVisible] = useState(false)
  const [deletedId, setDeletedId] = useState(null)

  // checkbox selected
  const [isAllCheckbox, setIsAllCheckbox] = useState(false)
  const [selectedCheckbox, setSelectedCheckbox] = useState([])

  // upload image and show image
  const [selectedFile, setSelectedFile] = useState('')
  const [file, setFile] = useState([])

  //pagination state
  const [pageNumber, setPageNumber] = useState(1)

  // Accordion state for expanded menus
  const [expandedMenus, setExpandedMenus] = useState({})
  // Accordion state for expanded submenus
  const [expandedSubMenus, setExpandedSubMenus] = useState({})

  // Toggle expand/collapse for a menu item
  const handleToggleExpand = (menuId) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuId]: !prev[menuId],
    }))
  }

  // Toggle expand/collapse for a sub menu item
  const handleToggleExpandSub = (subMenuId) => {
    setExpandedSubMenus((prev) => ({
      ...prev,
      [subMenuId]: !prev[subMenuId],
    }))
  }

  const initialValues = {
    url: '',
    title: '',
    name: '',
    target: '',
    childOf: '',
    visible: 0,
  }

  const validationSchema = Yup.object().shape({
    title: Yup.string()
      .required('Tiêu đề là bắt buộc.')
      .max(100, 'Tiêu đề không được vượt quá 100 ký tự.'),
    url: Yup.string().required('Liên kết là bắt buộc.'),
    name: Yup.string()
      .required('Tên action là bắt buộc.')
      .max(50, 'Tên action không được vượt quá 50 ký tự.'),
    target: Yup.string()
      .required('Đích đến là bắt buộc.')
      .oneOf(['_self', '_blank', '_parent', '_top'], 'Đích đến không hợp lệ.'),
    visible: Yup.number()
      .required('Trường hiển thị là bắt buộc.')
      .oneOf([0, 1], 'Giá trị hiển thị phải là 0 hoặc 1.'),
  })

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

  const fetchDataMenu = async (dataSearch = '') => {
    try {
      setIsLoading((prev) => ({ ...prev, page: true }))
      const response = await axiosClient.get(`admin/menu?data=${dataSearch}&page=${pageNumber}`)

      if (response.data.message === 'Fetched from database') {
        setDataMenu(response.data.data)
      }

      if (response.data.status === false && response.data.mess == 'no permission') {
        setIsPermissionCheck(false)
      }
    } catch (error) {
      console.error('Fetch data department is error', error)
    } finally {
      setIsLoading((prev) => ({ ...prev, page: false }))
    }
  }

  useEffect(() => {
    fetchDataMenu()
  }, [pageNumber])

  const fetchDataById = async (setValues) => {
    try {
      const response = await axiosClient.get(`admin/menu/${id}/edit`)
      const data = response.data
      if (data && response.data.status === true) {
        setValues({
          title: data?.menuDes.title,
          url: data?.menuDes.link,
          name: data?.menuDes.name,
          target: data?.menu?.target,
          childOf: data?.menu?.parentid,
          visible: data?.menu?.display,
        })
        setSelectedFile(data?.menu?.menu_icon)
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
      //call api update data
      try {
        setIsLoading((prev) => ({ ...prev, button: true }))

        const response = await axiosClient.put(`admin/menu/${id}`, {
          title: values.title,
          link: values.url,
          name: values.name,
          parentid: values.childOf,
          display: values.visible,
          target: values.target,
          picture: selectedFile,
        })
        if (response.data.status === true) {
          toast.success('Cập nhật danh mục thành công')
          resetForm()
          setSelectedFile([])
          setFile([])
          fetchDataMenu()
          navigate('/content/menu')
        } else {
          console.error('No data found for the given ID.')
        }

        // phân quyền tác vụ update
        if (response.data.status === false && response.data.mess == 'no permission') {
          toast.warn('Bạn không có quyền thực hiện tác vụ này!')
        }
      } catch (error) {
        console.error('Put data id menu is error', error.message)
        toast.error('Đã xảy ra lỗi. Vui lòng thử lại!')
      } finally {
        setIsLoading((prev) => ({ ...prev, button: false }))
      }
    } else {
      //call api post new data
      try {
        setIsLoading((prev) => ({ ...prev, button: true }))
        const response = await axiosClient.post('admin/menu', {
          title: values.title,
          link: values.url,
          name: values.name,
          parentid: values.childOf,
          display: values.visible,
          target: values.target,
          picture: selectedFile,
        })
        if (response.data.status === true) {
          toast.success('Thêm mới danh mục thành công!')
          resetForm()
          setSelectedFile([])
          setFile([])
          fetchDataMenu()
          navigate('/content/menu?sub=add')
        }
        // phân quyền tác vụ add
        if (response.data.status === false && response.data.mess == 'no permission') {
          toast.warn('Bạn không có quyền thực hiện tác vụ này!')
        }
      } catch (error) {
        console.error('Post data menu is error', error)
        toast.error('Đã xảy ra lỗi. Vui lòng thử lại!')
      } finally {
        setIsLoading((prev) => ({ ...prev, button: false }))
      }
    }
  }

  const handleAddNewClick = () => {
    navigate('/content/menu?sub=add')
  }

  const handleEditClick = (id) => {
    navigate(`/content/menu?id=${id}&sub=edit`)
  }

  // delete row
  const handleDelete = async () => {
    setVisible(true)
    try {
      const response = await axiosClient.delete(`admin/menu/${deletedId}`)
      if (response.data.status === true) {
        setVisible(false)
        fetchDataMenu()
      }

      // phân quyền tác vụ delete
      if (response.data.status === false && response.data.mess == 'no permission') {
        toast.warn('Bạn không có quyền thực hiện tác vụ này!')
      }
    } catch (error) {
      console.error('Delete menu id is error', error)
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
    fetchDataMenu(keyword)
  }

  const handleDeleteSelectedCheckbox = async () => {
    // console.log('>>> selectedCheckbox', selectedCheckbox)
    // try {
    //   const response = await axiosClient.post('admin/delete-all-comment', {
    //     data: selectedCheckbox,
    //   })
    // } catch (error) {
    //   console.error('Delete selected checkbox is error', error)
    // }
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
              <h2>QUẢN LÝ MENU</h2>
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
                <Link to={'/menu'}>
                  <CButton color="primary" type="submit" size="sm">
                    Danh sách
                  </CButton>
                </Link>
              </div>
            </CCol>
          </CRow>

          <CRow>
            <CCol md={4}>
              <h6>{!isEditing ? 'Thêm menu mới' : 'Cập nhật menu'}</h6>
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
                        <label htmlFor="url-input">Liên kết</label>
                        <Field name="url" type="text" as={CFormInput} id="url-input" />
                        <ErrorMessage name="url" component="div" className="text-danger" />
                      </CCol>
                      <br />

                      <CCol md={12}>
                        <label htmlFor="name-input">Name action</label>
                        <Field name="name" type="text" as={CFormInput} id="name-input" />
                        <ErrorMessage name="name" component="div" className="text-danger" />
                      </CCol>
                      <br />

                      <CCol md={12}>
                        <label htmlFor="target-select">Đích đến</label>
                        <Field
                          className="component-size"
                          name="target"
                          as={CFormSelect}
                          id="target-select"
                          text="Loại hiển thị của liên kết. Mặc định liên kết tại trang (_self)."
                          options={[
                            { label: 'Chọn đích đến', value: '' },
                            { label: 'Tại trang (_self)', value: '_self' },
                            { label: 'Cửa sổ mới (_blank)', value: '_blank' },
                            { label: 'Cửa sổ cha (_parent)', value: '_parent' },
                            { label: 'Cửa sổ trên cùng (_top)', value: '_top' },
                          ]}
                        />
                        <ErrorMessage name="target" component="div" className="text-danger" />
                      </CCol>
                      <br />

                      <CCol md={12}>
                        <label htmlFor="childOf-select">Là con của</label>
                        <CFormSelect
                          className="component-size"
                          aria-label="Chọn yêu cầu lọc"
                          name="childOf"
                          onChange={(e) => setFieldValue('childOf', e.target.value)}
                        >
                          <option value={''}>None</option>
                          {dataMenu &&
                            dataMenu?.map((item) => (
                              <React.Fragment key={item.menu_id}>
                                <option value={item.menu_id}>
                                  {item?.menu_desc?.title} ({item?.menu_id})
                                </option>
                                {item?.parenty &&
                                  item?.parenty.map((subItem) => (
                                    <React.Fragment key={subItem.menu_id}>
                                      <option value={subItem.menu_id}>
                                        &nbsp;&nbsp;&nbsp;{'|--'}
                                        {subItem.menu_desc?.title} ({subItem.menu_id})
                                      </option>

                                      {subItem?.parentx &&
                                        subItem?.parentx.map((subSubItem) => (
                                          <option
                                            key={subSubItem.menu_id}
                                            value={subSubItem.menu_id}
                                          >
                                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{'|--'}
                                            {subSubItem.menu_desc?.title}({subSubItem.menu_id})
                                          </option>
                                        ))}
                                    </React.Fragment>
                                  ))}
                              </React.Fragment>
                            ))}
                        </CFormSelect>
                        <ErrorMessage name="childOf" component="div" className="text-danger" />
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
                              <CImage
                                className="border"
                                src={`${imageBaseUrl}${selectedFile}`}
                                width={200}
                              />
                            </div>
                          ) : (
                            file.map((item, index) => (
                              <CImage className="border" key={index} src={item} width={200} />
                            ))
                          )}
                        </div>
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
                        <CButton
                          color="primary"
                          type="submit"
                          size="sm"
                          disabled={isLoading.button}
                        >
                          {isLoading.button ? (
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
              <Search count={dataMenu?.length} onSearchData={handleSearch} />
              <CCol md={12} className="mt-3">
                <CButton onClick={handleDeleteSelectedCheckbox} color="primary" size="sm">
                  Xóa vĩnh viễn
                </CButton>
              </CCol>
              {/*
              {isLoading.page ? (
                <Loading />
              ) : (

              )} */}

              <>
                <CCol>
                  <table className="table table-hover caption-top mt-3">
                    <thead className="thead-dark">
                      <tr>
                        <th style={{ width: 320 }} scope="col">
                          Tên
                        </th>
                        <th scope="col">Liên kết</th>
                        <th scope="col">Show home</th>
                        <th style={{ width: 120 }} scope="col">
                          Tác vụ
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {dataMenu &&
                        dataMenu?.length > 0 &&
                        dataMenu?.map((item) => (
                          <React.Fragment key={item?.menu_id}>
                            <tr>
                              <td scope="row" style={{ fontWeight: 600 }}>
                                {item?.parenty && item?.parenty.length > 0 && (
                                  <button
                                    type="button"
                                    className="btn btn-link btn-sm p-0 mr-2"
                                    onClick={() => handleToggleExpand(item.menu_id)}
                                    style={{ verticalAlign: 'middle' }}
                                  >
                                    {expandedMenus[item.menu_id] ? '▼' : '▶'}
                                  </button>
                                )}
                                {item?.menu_desc?.title}
                              </td>
                              <td>{item?.menu_desc?.link}</td>
                              <td>
                                {item?.menu_desc?.display == 1 ? (
                                  <span style={{ color: 'green', fontWeight: 600 }}>
                                    <AiOutlineEye
                                      title="Có"
                                      size={20}
                                      style={{ verticalAlign: 'middle' }}
                                    />
                                  </span>
                                ) : (
                                  <span style={{ color: 'red', fontWeight: 600 }}>
                                    <AiOutlineEyeInvisible
                                      title="Không"
                                      size={20}
                                      style={{ verticalAlign: 'middle' }}
                                    />
                                  </span>
                                )}
                              </td>

                              <td scope="row">
                                <div>
                                  <button
                                    onClick={() => handleEditClick(item?.menu_id)}
                                    className="button-action mr-2 bg-info"
                                  >
                                    <CIcon icon={cilColorBorder} className="text-white" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      setVisible(true)
                                      setDeletedId(item?.menu_id)
                                    }}
                                    className="button-action bg-danger"
                                  >
                                    <CIcon icon={cilTrash} className="text-white" />
                                  </button>
                                </div>
                              </td>
                            </tr>

                            {/* SubItems (children) as accordion */}
                            {item.parenty &&
                              item.parenty.map((subItem) =>
                                expandedMenus[item.menu_id] ? (
                                  <React.Fragment key={subItem?.menu_id}>
                                    <tr>
                                      <td>
                                        {subItem?.parentx && subItem?.parentx.length > 0 && (
                                          <button
                                            type="button"
                                            className="btn btn-link btn-sm p-0 mr-2"
                                            onClick={() => handleToggleExpandSub(subItem.menu_id)}
                                            style={{ verticalAlign: 'middle' }}
                                          >
                                            {expandedSubMenus[subItem.menu_id] ? '▼' : '▶'}
                                          </button>
                                        )}
                                        <img
                                          src={
                                            'http://media.vitinhnguyenkim.com.vn/uploads/row-sub.gif'
                                          }
                                          alt="Subcategory"
                                          className="mr-2"
                                        />
                                        {subItem?.menu_desc?.title}
                                      </td>
                                      <td>{subItem?.menu_desc?.link}</td>
                                      {/* <td>
                                          {subItem?.menu_desc?.display == 1 ? (
                                            <span style={{ color: 'green', fontWeight: 600 }}>
                                              <AiOutlineEye
                                                title="Có"
                                                size={20}
                                                style={{ verticalAlign: 'middle' }}
                                              />
                                            </span>
                                          ) : (
                                            <span style={{ color: 'red', fontWeight: 600 }}>
                                              <AiOutlineEyeInvisible
                                                title="Không"
                                                size={20}
                                                style={{ verticalAlign: 'middle' }}
                                              />
                                            </span>
                                          )}
                                        </td> */}
                                      {/* Tới chưa trả ra */}
                                      <td>{subItem?.menu_desc?.display}</td>

                                      <td scope="row">
                                        <div>
                                          <button
                                            onClick={() => handleEditClick(subItem.menu_id)}
                                            className="button-action mr-2 bg-info"
                                          >
                                            <CIcon icon={cilColorBorder} className="text-white" />
                                          </button>
                                          <button
                                            onClick={() => {
                                              setVisible(true)
                                              setDeletedId(subItem.menu_id)
                                            }}
                                            className="button-action bg-danger"
                                          >
                                            <CIcon icon={cilTrash} className="text-white" />
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                    {/* SubSubItems (children of subItem) */}
                                    {subItem.parentx &&
                                      expandedSubMenus[subItem.menu_id] &&
                                      subItem.parentx.map((subSubItem) => (
                                        <tr key={subSubItem.menu_id}>
                                          <td>
                                            <img
                                              src={
                                                'http://media.vitinhnguyenkim.com.vn/uploads/row-sub.gif'
                                              }
                                              alt="Subcategory"
                                              style={{ marginLeft: 16 }}
                                            />
                                            {subSubItem?.menu_desc?.title}
                                          </td>
                                          <td>{subSubItem?.menu_desc?.link}</td>
                                          <td>
                                            {subSubItem?.menu_desc?.display == 1 ? (
                                              <span style={{ color: 'green', fontWeight: 600 }}>
                                                <AiOutlineEye
                                                  title="Có"
                                                  size={20}
                                                  style={{ verticalAlign: 'middle' }}
                                                />
                                              </span>
                                            ) : (
                                              <span style={{ color: 'red', fontWeight: 600 }}>
                                                <AiOutlineEyeInvisible
                                                  title="Không"
                                                  size={20}
                                                  style={{ verticalAlign: 'middle' }}
                                                />
                                              </span>
                                            )}
                                          </td>
                                          <td scope="row">
                                            <div>
                                              <button
                                                onClick={() => handleEditClick(subSubItem.menu_id)}
                                                className="button-action mr-2 bg-info"
                                              >
                                                <CIcon
                                                  icon={cilColorBorder}
                                                  className="text-white"
                                                />
                                              </button>
                                              <button
                                                onClick={() => {
                                                  setVisible(true)
                                                  setDeletedId(subSubItem.menu_id)
                                                }}
                                                className="button-action bg-danger"
                                              >
                                                <CIcon icon={cilTrash} className="text-white" />
                                              </button>
                                            </div>
                                          </td>
                                        </tr>
                                      ))}
                                  </React.Fragment>
                                ) : null,
                              )}
                          </React.Fragment>
                        ))}
                    </tbody>
                  </table>
                </CCol>
              </>
            </CCol>
          </CRow>
        </>
      )}
    </div>
  )
}

export default Menu
