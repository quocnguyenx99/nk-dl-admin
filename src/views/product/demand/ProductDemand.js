import {
  CButton,
  CCol,
  CContainer,
  CFormCheck,
  CFormInput,
  CFormSelect,
  CFormTextarea,
  CImage,
  CRow,
  CSpinner,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import React, { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import CIcon from '@coreui/icons-react'
import { cilTrash, cilColorBorder } from '@coreui/icons'

import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import ReactPaginate from 'react-paginate'
import DeletedModal from '../../../components/deletedModal/DeletedModal'
import { toast } from 'react-toastify'
import { axiosClient, imageBaseUrl } from '../../../axiosConfig'

function ProductDemand() {
  const location = useLocation()
  const navigate = useNavigate()

  const params = new URLSearchParams(location.search)
  const id = params.get('id')
  const sub = params.get('sub')

  const [isEditing, setIsEditing] = useState(false)
  const inputRef = useRef(null)

  // check permission state
  const [isPermissionCheck, setIsPermissionCheck] = useState(true)

  // collapse state
  const [isCollapse, setIsCollapse] = useState(false)

  const handleToggleCollapse = () => {
    setIsCollapse((prevState) => !prevState)
  }

  // category
  const [categories, setCategories] = useState([])
  const [choosenCategory, setChoosenCategory] = useState(0)
  const [selectedCate, setSelectedCate] = useState(0)
  const [dataProductDemand, setDataProductDemand] = useState([])

  // loading button
  const [isLoading, setIsLoading] = useState(false)

  // selected checkbox
  const [isAllCheckbox, setIsAllCheckbox] = useState(false)
  const [selectedCheckbox, setSelectedCheckbox] = useState([])

  // upload image and show image
  const [selectedFile, setSelectedFile] = useState('')
  const [file, setFile] = useState([])

  // search input
  const [dataSearch, setDataSearch] = useState('')

  //pagination state
  const [pageNumber, setPageNumber] = useState(1)

  // show deleted Modal
  const [visible, setVisible] = useState(false)
  const [deletedId, setDeletedId] = useState(null)

  // form formik value
  const initialValues = {
    title: '',
    desc: '',
    friendlyUrl: '',
    visible: 0,
  }

  const validationSchema = Yup.object({
    title: Yup.string().required('Tiêu đề là bắt buộc!'),
    desc: Yup.string().required('Mô tả là bắt buộc!'),
    friendlyUrl: Yup.string().required('Chuỗi đường dẫn là bắt buộc!'),
    visible: Yup.number().required('Trạng thái hiển thị là bắt buộc!'),
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

  const fetchCategories = async () => {
    try {
      const response = await axiosClient.get('admin/category')
      if (response.data.status === true) {
        setCategories(response.data.data)
      }
    } catch (error) {
      console.error('No data found for categories.')
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchDataDemand = async (dataSearch = '') => {
    try {
      const response = await axiosClient.get(
        `admin/productStatus?data=${dataSearch}&page=${pageNumber}`,
      )
      if (response.data.status === 'success') {
        setDataProductDemand(response.data.list)
      } else if (response.data.status === false && response.data.mess === 'no permission') {
        setIsPermissionCheck(false)
      } else {
        console.error('Unexpected response format:', response.data)
      }
    } catch (error) {
      console.error('Error fetching product demand data:', error)
    }
  }

  useEffect(() => {
    fetchDataDemand(dataSearch)
  }, [pageNumber, dataSearch])

  const fetchDataById = async (setValues) => {
    if (!id) return
    try {
      const response = await axiosClient.get(`admin/productStatus/${id}/edit`)
      if (response.data.status === true) {
        const data = response.data.productStatus
        setValues({
          title: data.product_status_desc.title,
          desc: data.product_status_desc.description,
          friendlyUrl: data.product_status_desc.friendly_url,
          visible: data.display,
        })
        setSelectedFile(data.picture)
      } else if (response.data.status === false) {
        console.error('No data found for the given ID or insufficient permissions.')
        if (response.data.mess === 'no permission') {
          toast.warn('Bạn không có quyền thực hiện tác vụ này!')
        }
      } else {
        console.error('Unexpected response format:', response.data)
      }
    } catch (error) {
      console.error('Error fetching product demand by ID:', error)
    }
  }

  const handleSubmit = async (values, { resetForm }) => {
    if (isEditing) {
      //call api update data
      try {
        setIsLoading(true)
        const response = await axiosClient.put(`admin/productStatus/${id}`, {
          title: values.title,
          picture: selectedFile,
          description: values.desc,
          friendly_url: values.friendlyUrl,
          display: values.visible,
        })

        if (response.data.status === true) {
          toast.success('Cập nhật nhu cầu thành công')
          resetForm()
          setFile([])
          setSelectedFile([])
          setIsEditing(false)
          navigate('/product/demand')
          fetchDataDemand()
        } else {
          console.error('No data found for the given ID.')
        }

        if (response.data.status === false && response.data.mess == 'no permission') {
          toast.warn('Bạn không có quyền thực hiện tác vụ này!')
        }
      } catch (error) {
        console.error('Put data product status is error', error.message)
        toast.error('Đã xảy ra lỗi. Vui lòng thử lại!')
      } finally {
        setIsLoading(false)
      }
    } else {
      //call api post new data
      try {
        setIsLoading(true)
        const response = await axiosClient.post('admin/productStatus', {
          title: values.title,
          picture: selectedFile,
          description: values.desc,
          friendly_url: values.friendlyUrl,
          display: values.visible,
        })

        if (response.data.status === true) {
          toast.success('Thêm mới nhu cầu thành công!')
          resetForm()
          setFile([])
          setSelectedFile([])
          navigate('/product/demand?sub=add')
          fetchDataDemand()
        }

        if (response.data.status === false && response.data.mess == 'no permission') {
          toast.warn('Bạn không có quyền thực hiện tác vụ này!')
        }
      } catch (error) {
        console.error('Post data product demand is error', error)
        toast.error('Đã xảy ra lỗi. Vui lòng thử lại!')
      } finally {
        setIsLoading(false)
      }
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

  const handleAddNewClick = () => {
    navigate('/product/status?sub=add')
  }

  const handleEditClick = (id) => {
    navigate(`/product/status?id=${id}&sub=edit`)
  }

  // delete row
  const handleDelete = async () => {
    setVisible(true)
    try {
      const response = await axiosClient.delete(`admin/productStatus/${deletedId}`)
      if (response.data.status === true) {
        setVisible(false)
        fetchDataDemand()
      } else {
        console.error('ID not found for deleting product demand')
      }

      if (response.data.status === false && response.data.mess == 'no permission') {
        toast.warn('Bạn không có quyền thực hiện tác vụ này!')
      }
    } catch (error) {
      console.error('Delete product demand id is error', error)
      toast.error('Đã xảy ra lỗi khi xóa. Vui lòng thử lại!')
    } finally {
      setVisible(false)
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
    fetchDataDemand(keyword)
  }

  const handleDeleteAll = async () => {
    try {
      const response = await axiosClient.post(`admin/delete-all-product-status`, {
        data: selectedCheckbox,
      })

      if (response.data.status === true) {
        toast.success('Xóa tất cả danh mục thành công!')
        fetchDataDemand()
        setSelectedCheckbox([])
      }

      if (response.data.status === false && response.data.mess == 'no permission') {
        toast.warn('Bạn không có quyền thực hiện tác vụ này!')
      }
    } catch (error) {
      toast.error('Đã xảy ra lỗi. Vui lòng thử lại!')
    }
  }

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
              const allIds = dataProductDemand?.data.map((item) => item.status_id) || []
              setSelectedCheckbox(allIds)
            } else {
              setSelectedCheckbox([])
            }
          }}
        />
      ),
    },
    { key: 'title', label: 'Tiêu đề' },
    { key: 'images', label: 'Hình ảnh' },
    { key: 'name', label: 'Name' },
    { key: 'actions', label: 'Tác vụ' },
  ]

  const items =
    dataProductDemand?.data && dataProductDemand?.data.length > 0
      ? dataProductDemand?.data.map((item) => ({
          id: (
            <CFormCheck
              key={item.status_id}
              aria-label="Default select example"
              defaultChecked={item?.status_id}
              id={`flexCheckDefault_${item?.status_id}`}
              value={item?.status_id}
              checked={selectedCheckbox.includes(item?.status_id)}
              onChange={(e) => {
                const statusID = item?.status_id
                const isChecked = e.target.checked
                if (isChecked) {
                  setSelectedCheckbox([...selectedCheckbox, statusID])
                } else {
                  setSelectedCheckbox(selectedCheckbox.filter((id) => id !== statusID))
                }
              }}
            />
          ),
          title: item.product_status_desc?.title,
          images: <CImage fluid src={`${imageBaseUrl}${item.picture}`} width={80} />,
          name: item.name,
          actions: (
            <div>
              <button
                onClick={() => handleEditClick(item.status_id)}
                className="button-action mr-2 bg-info"
              >
                <CIcon icon={cilColorBorder} className="text-white" />
              </button>
              <button
                onClick={() => {
                  setVisible(true)
                  setDeletedId(item.status_id)
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
              <h2>NHU CẦU SẢN PHẨM</h2>
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
              </div>
            </CCol>
          </CRow>

          <CRow>
            {/* Form add/ edit */}
            <CCol md={4}>
              <h6>{!isEditing ? 'Thêm mới nhu cầu' : 'Cập nhật nhu cầu'}</h6>
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
                    <Form>
                      <CCol md={12}>
                        <label htmlFor="title-input">Tiêu đề</label>
                        <Field name="title">
                          {({ field }) => (
                            <CFormInput
                              {...field}
                              type="text"
                              id="title-input"
                              ref={inputRef}
                              text="Tên riêng sẽ hiển thị trên trang mạng của bạn."
                            />
                          )}
                        </Field>
                        <ErrorMessage name="title" component="div" className="text-danger" />
                      </CCol>
                      <br />

                      <CCol md={12}>
                        <label htmlFor="desc-input">Mô tả</label>
                        <Field
                          style={{ height: 100 }}
                          name="desc"
                          type="text"
                          as={CFormTextarea}
                          id="desc-input"
                          text="Mô tả bình thường không được sử dụng trong giao diện, tuy nhiên có vài giao diện hiện thị mô tả này."
                        />
                        <ErrorMessage name="desc" component="div" className="text-danger" />
                      </CCol>
                      <br />

                      <CCol md={12}>
                        <label htmlFor="url-input">Chuỗi đường dẫn</label>
                        <Field
                          name="friendlyUrl"
                          type="text"
                          as={CFormInput}
                          id="url-input"
                          text="Chuỗi dẫn tĩnh là phiên bản của tên hợp chuẩn với Đường dẫn (URL). Chuỗi này bao gồm chữ cái thường, số và dấu gạch ngang (-). VD: vi-tinh-nguyen-kim-to-chuc-su-kien-tri-an-dip-20-nam-thanh-lap"
                        />
                        <ErrorMessage name="friendlyUrl" component="div" className="text-danger" />
                      </CCol>
                      <br />

                      <CCol md={12}>
                        <label htmlFor="categories-select">Ngành hàng áp dụng</label>
                        <Field
                          name="categories"
                          as={CFormSelect}
                          id="categories-select"
                          className="select-input"
                          value={choosenCategory}
                          onChange={(e) => setChoosenCategory(e.target.value)}
                          options={[
                            { label: '-- Chọn ngành hàng --', value: 0, disabled: true },
                            ...(categories && categories.length > 0
                              ? categories.map((cate) => ({
                                  label: cate?.category_desc?.cat_name,
                                  value: cate.cat_id,
                                }))
                              : []),
                          ]}
                        />
                      </CCol>
                      <br />

                      <CCol md={12}>
                        <CFormInput
                          name="image"
                          type="file"
                          id="formFile"
                          label="Ảnh đại diện"
                          size="sm"
                          onChange={(e) => onFileChange(e)}
                        />
                        <br />
                        <ErrorMessage name="image" component="div" className="text-danger" />

                        <div>
                          {file.length == 0 ? (
                            <div>
                              <CImage src={`${imageBaseUrl}${selectedFile}`} width={200} />
                            </div>
                          ) : (
                            file.map((item, index) => <CImage key={index} src={item} fluid />)
                          )}
                        </div>
                      </CCol>
                      <br />

                      <CCol md={12}>
                        <label htmlFor="visible-select">Hiển thị</label>
                        <Field
                          className="component-size w-50"
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
            <CCol md={8}>
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
                      <td className="total-count">6</td>
                    </tr>
                    <tr>
                      <td>Lọc theo vị trí</td>
                      <td>
                        <CFormSelect
                          className="component-size w-50"
                          aria-label="Chọn yêu cầu lọc"
                          options={[
                            { label: '-- Chọn danh mục --', value: '', disabled: true },
                            ...(Array.isArray(categories) && categories.length > 0
                              ? categories.map((cate) => ({
                                  label: cate?.category_desc?.cat_name,
                                  value: cate.cat_id,
                                }))
                              : []),
                          ]}
                          value={selectedCate}
                          onChange={(e) => setSelectedCate(e.target.value)}
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
              <CCol md={12} className="mt-3">
                <CButton onClick={handleDeleteAll} color="primary" size="sm">
                  Xóa vĩnh viễn
                </CButton>
              </CCol>
              <CCol className="mt-4">
                <CTable hover className="border">
                  <thead>
                    <tr>
                      {columns.map((column) => (
                        <CTableHeaderCell
                          style={{ whiteSpace: 'nowrap' }}
                          key={column.key}
                          className="prevent-select"
                        >
                          {column.label}
                        </CTableHeaderCell>
                      ))}
                    </tr>
                  </thead>
                  <CTableBody>
                    {items.map((item, index) => (
                      <CTableRow key={index}>
                        {columns.map((column) => (
                          <CTableDataCell key={column.key}>{item[column.key]}</CTableDataCell>
                        ))}
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>

                <div className="d-flex justify-content-end">
                  <ReactPaginate
                    pageCount={Math.round(dataProductDemand?.total / dataProductDemand?.per_page)}
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
            </CCol>
          </CRow>
        </>
      )}
    </div>
  )
}

export default ProductDemand
