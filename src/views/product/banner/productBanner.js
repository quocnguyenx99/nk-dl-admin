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
import Loading from '../../../components/loading/Loading'

function ProductBanner() {
  const location = useLocation()
  const navigate = useNavigate()

  const params = new URLSearchParams(location.search)
  const id = params.get('id')
  const sub = params.get('sub')

  const [isEditing, setIsEditing] = useState(false)
  const inputRef = useRef(null)

  // check permission state
  const [isPermissionCheck, setIsPermissionCheck] = useState(true)

  const [categories, setCategories] = useState([])
  const [dataBanner, setDataBanner] = useState([])

  //loading
  const [isLoading, setIsLoading] = useState({
    page: false,
    button: false,
  })

  const [selectedCate, setSelectedCate] = useState('')

  // selected checkbox
  const [isAllCheckbox, setIsAllCheckbox] = useState(false)
  const [selectedCheckbox, setSelectedCheckbox] = useState([])

  // upload image and show image
  const [selectedFile, setSelectedFile] = useState('')
  const [file, setFile] = useState([])

  const [isCollapse, setIsCollapse] = useState(false)

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
    image: '',
    url: '',
    destination: '_self',
    categories: 'Laptop',
    width: '',
    height: '',
    desc: '',
    visible: 0,
  }

  const validationSchema = Yup.object({
    title: Yup.string().required('Tiêu đề là bắt buộc!'),
    url: Yup.string().required('Chuỗi đường dẫn ảnh là bắt buộc!'),
    destination: Yup.string().required('Chọn vị trí liên kết!'),
    categories: Yup.string().required('Danh mục đăng ảnh là bắt buộc!'),
    width: Yup.string().required('Chiều rộng ảnh là bắt buộc.'),
    height: Yup.string().required('Chiều cao ảnh là bắt buộc.'),
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

  const fetchCategoriesData = async () => {
    try {
      const response = await axiosClient.get('admin/category')
      setCategories(response.data.data)
    } catch (error) {
      console.error('Fetch categories data error', error)
    }
  }

  useEffect(() => {
    fetchCategoriesData()
  }, [])

  const fetchDataBanner = async () => {
    try {
      setIsLoading((prev) => ({ ...prev, page: true }))

      const response = await axiosClient.get(
        `admin/product-advertise?data=${dataSearch}&page=${pageNumber}&cat=${selectedCate}`,
      )
      if (response.data.status === true) {
        setDataBanner(response.data.data)
      }

      if (response.data.status === false && response.data.mess == 'no permission') {
        setIsPermissionCheck(false)
      }
    } catch (error) {
      console.error('Fetch data banner is error', error)
    } finally {
      setIsLoading((prev) => ({ ...prev, page: false }))
    }
  }

  useEffect(() => {
    fetchDataBanner()
  }, [pageNumber, selectedCate])

  const fetchDataById = async (setValues) => {
    //api?search={dataSearch}
    try {
      const response = await axiosClient.get(`admin/product-advertise/${id}/edit`)
      const data = response.data.data
      if (response.data.status === true) {
        setValues({
          title: data.title,
          url: data.link,
          destination: data.target,
          categories: data.pos,
          width: data.width,
          height: data.height,
          desc: data.description,
          visible: data.display,
        })
        setSelectedFile(data.picture)
      } else {
        console.error('No data found for the given ID.')
      }

      if (
        sub == 'edit' &&
        response.data.status === false &&
        response.data.mess == 'no permission'
      ) {
        toast.warn('Bạn không có quyền thực hiện tác vụ này!')
      }
    } catch (error) {
      console.error('Fetch data id product banner is error', error.message)
    }
  }

  const handleSubmit = async (values, { resetForm }) => {
    if (isEditing) {
      //call api update data
      try {
        setIsLoading((prev) => ({ ...prev, button: true }))

        const response = await axiosClient.put(`admin/product-advertise/${id}`, {
          title: values.title,
          picture: selectedFile,
          link: values.url,
          target: values.destination,
          pos: values.categories,
          width: values.width,
          height: values.height,
          description: values.desc,
          display: values.visible,
        })

        if (response.data.status === true) {
          toast.success('Cập nhật trạng thái thành công')
          resetForm()
          setFile([])
          setSelectedFile([])
          setIsEditing(false)
          navigate('/product/banner')
          fetchDataBanner()
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
        setIsLoading((prev) => ({ ...prev, button: false }))
      }
    } else {
      //call api post new data
      try {
        setIsLoading((prev) => ({ ...prev, button: true }))

        const response = await axiosClient.post('admin/product-advertise', {
          title: values.title,
          picture: selectedFile,
          link: values.url,
          target: values.destination,
          pos: values.categories,
          width: values.width,
          height: values.height,
          description: values.desc,
          display: values.visible,
        })

        if (response.data.status === true) {
          toast.success('Cập nhật banner sản phẩm thành công!')
          resetForm()
          setFile([])
          setSelectedFile([])
          navigate('/product/banner?sub=add')
          fetchDataBanner()
        }

        if (response.data.status === false && response.data.mess == 'no permission') {
          toast.warn('Bạn không có quyền thực hiện tác vụ này!')
        }
      } catch (error) {
        console.error('Put data product banner is error', error)
        toast.error('Đã xảy ra lỗi. Vui lòng thử lại!')
      } finally {
        setIsLoading((prev) => ({ ...prev, button: false }))
      }
    }
  }

  const handleAddNewClick = () => {
    navigate('/product/banner?sub=add')
  }

  const handleEditClick = (id) => {
    navigate(`/product/banner?id=${id}&sub=edit`)
  }

  // delete row
  const handleDelete = async () => {
    setVisible(true)
    try {
      const response = await axiosClient.delete(`admin/product-advertise/${deletedId}`)
      if (response.data.status === true) {
        setVisible(false)
        fetchDataBanner()
      } else {
        console.error('ID not found for deleting product status')
      }

      if (response.data.status === false && response.data.mess == 'no permission') {
        toast.warn('Bạn không có quyền thực hiện tác vụ này!')
      }
    } catch (error) {
      console.error('Delete product banner id is error', error)
      toast.error('Đã xảy ra lỗi khi xóa. Vui lòng thử lại!')
    } finally {
      setVisible(false)
    }
  }

  const handleToggleCollapse = () => {
    setIsCollapse((prevState) => !prevState)
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
    fetchDataBanner(keyword)
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

  const handleDeleteAll = async () => {
    try {
      const response = await axiosClient.post(`/admin/delete-all-product-advertise `, {
        data: selectedCheckbox,
      })

      if (response.data.status === true) {
        toast.success('Xóa tất cả các danh mục thành công!')
        fetchDataBanner()
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
              const allIds = dataBanner?.data.map((item) => item.id) || []
              setSelectedCheckbox(allIds)
            } else {
              setSelectedCheckbox([])
            }
          }}
        />
      ),
    },
    { key: 'images', label: 'Hình ảnh' },
    { key: 'url', label: 'Liên kết' },
    { key: 'dimensions', label: 'Kích thước' },
    { key: 'actions', label: 'Tác vụ' },
  ]

  const items =
    dataBanner?.data && dataBanner?.data.length > 0
      ? dataBanner?.data.map((item) => ({
          id: (
            <CFormCheck
              key={item?.id}
              aria-label="Default select example"
              defaultChecked={item?.id}
              id={`flexCheckDefault_${item?.id}`}
              value={item?.id}
              checked={selectedCheckbox.includes(item?.id)}
              onChange={(e) => {
                const bannerID = item?.id
                const isChecked = e.target.checked
                if (isChecked) {
                  setSelectedCheckbox([...selectedCheckbox, bannerID])
                } else {
                  setSelectedCheckbox(selectedCheckbox.filter((id) => id !== bannerID))
                }
              }}
            />
          ),
          images: <CImage className="border" fluid src={`${imageBaseUrl}${item.picture}`} />,
          url: item.link,
          dimensions: `${item.width}x${item.height}`,
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
              <h2>BANNER SẢN PHẨM</h2>
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
                <Link to={`/product/banner`}>
                  <CButton color="primary" type="submit" size="sm">
                    Danh sách
                  </CButton>
                </Link>
              </div>
            </CCol>
          </CRow>

          <CRow>
            {/* Form add/ edit */}
            <CCol md={4}>
              <h6>{!isEditing ? 'Thêm mới banner' : 'Cập nhật banner'}</h6>
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
                        <label htmlFor="title-input">Tiêu đề</label>
                        <Field name="title">
                          {({ field }) => (
                            <CFormInput
                              {...field}
                              type="text"
                              id="title-input"
                              ref={inputRef}
                              text="Tiêu đề được sử dụng trên trang mạng của bạn và làm thẻ ALT của banner."
                            />
                          )}
                        </Field>
                        <ErrorMessage name="title" component="div" className="text-danger" />
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
                              <CImage
                                className="border"
                                src={`${imageBaseUrl}${selectedFile}`}
                                width={300}
                              />
                            </div>
                          ) : (
                            file.map((item, index) => (
                              <CImage className="border" key={index} src={item} fluid />
                            ))
                          )}
                        </div>
                      </CCol>
                      <br />
                      <CCol md={12}>
                        <label htmlFor="url-input">Liên kết</label>
                        <Field
                          name="url"
                          type="url"
                          as={CFormInput}
                          id="url-input"
                          text="Liên kết có hoặc không: https://vitinhnguyenkim.vn/"
                          placeholder="https://"
                        />
                        <ErrorMessage name="url" component="div" className="text-danger" />
                      </CCol>
                      <br />
                      <CCol md={12}>
                        <label htmlFor="destination-select">Đích đến</label>
                        <Field
                          className="component-size"
                          name="destination"
                          as={CFormSelect}
                          id="destination-select"
                          text="Loại hiển thị của liên kết. Mặc định liên kết tại trang (_self)."
                          options={[
                            { label: 'Tại trang (_self)', value: '_self' },
                            { label: 'Cửa sổ mới (_blank)', value: '_blank' },
                            { label: 'Cửa sổ cha (_parent)', value: '_parent' },
                            { label: 'Cửa sổ trên cùng (_top)', value: '_top' },
                          ]}
                        />
                        <ErrorMessage name="destination" component="div" className="text-danger" />
                      </CCol>
                      <br />

                      <CCol md={12}>
                        <label htmlFor="categories-select">Danh mục đăng</label>
                        <Field
                          className="component-size"
                          name="categories"
                          as={CFormSelect}
                          id="categories-select"
                          text="Lựa chọn danh mục sẽ hiển thị banner ngoài trang chủ."
                          options={
                            categories &&
                            categories.length > 0 &&
                            categories.map((cate) => ({
                              label: cate.category_desc.cat_name,
                              value: cate.cat_name,
                            }))
                          }
                        />
                        <ErrorMessage name="categories" component="div" className="text-danger" />
                      </CCol>
                      <br />

                      <CCol md={12}>
                        <label htmlFor="width-input">Chiều rộng</label>
                        <Field
                          name="width"
                          type="width"
                          as={CFormInput}
                          id="width-input"
                          text="Đơn vị chiều rộng được sử dụng đơn vị pixel."
                        />
                        <ErrorMessage name="width" component="div" className="text-danger" />
                      </CCol>
                      <br />
                      <CCol md={12}>
                        <label htmlFor="height-input">Chiều cao</label>
                        <Field
                          name="height"
                          type="text"
                          as={CFormInput}
                          id="height-input"
                          text="Đơn vị chiều cao được sử dụng đơn vị pixel."
                        />
                        <ErrorMessage name="height" component="div" className="text-danger" />
                      </CCol>
                      <br />
                      <CCol md={12}>
                        <label htmlFor="desc-input">Mô tả</label>
                        <Field
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
                            { label: 'Chọn danh mục', value: '' },
                            ...(Array.isArray(categories) && categories.length > 0
                              ? categories.map((cate) => ({
                                  label: cate.category_desc.cat_name,
                                  value: cate.category_desc.cat_name,
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

              <CCol className="mt-4">
                <CCol md={12} className="mt-2 mb-2">
                  <CButton onClick={handleDeleteAll} color="primary" size="sm">
                    Xóa vĩnh viễn
                  </CButton>
                </CCol>
                {isLoading.page ? (
                  <Loading />
                ) : (
                  <CTable>
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
                )}

                <div className="d-flex justify-content-end">
                  <ReactPaginate
                    pageCount={Math.round(dataBanner?.total / dataBanner?.per_page)}
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

export default ProductBanner
