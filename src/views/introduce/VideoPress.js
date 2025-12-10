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
import ReactPaginate from 'react-paginate'
import CIcon from '@coreui/icons-react'
import { cilTrash, cilColorBorder } from '@coreui/icons'
import { toast } from 'react-toastify'
import { axiosClient } from '../../axiosConfig'
import Loading from '../../components/loading/Loading'
import DeletedModal from '../../components/deletedModal/DeletedModal'
import { onFilesChange, revokeObjectURLs } from '../../helper/fileUpload'

function VideoPress() {
  const location = useLocation()
  const navigate = useNavigate()

  const params = new URLSearchParams(location.search)
  const id = params.get('id')
  const sub = params.get('sub')

  const [isPermissionCheck, setIsPermissionCheck] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const inputRef = useRef(null)

  const [dataItems, setDataItems] = useState([])
  const [selectedCate, setSelectedCate] = useState('') // 0: Video, 1: Báo chí

  const [isLoading, setIsLoading] = useState({ page: false, button: false })

  const [visible, setVisible] = useState(false)
  const [deletedId, setDeletedId] = useState(null)

  const [imagePreview, setImagePreview] = useState([])
  const [imageBase64, setImageBase64] = useState([])

  const [pageNumber, setPageNumber] = useState(1)
  const [dataSearch, setDataSearch] = useState('')
  const [isCollapse, setIsCollapse] = useState(false)

  const handleToggleCollapse = () => setIsCollapse((s) => !s)

  const initialValues = { title: '', url: '', type: 0, visible: 0 }
  const [formValues, setFormValues] = useState(initialValues)

  const validationSchema = Yup.object().shape({
    title: Yup.string().required('Tiêu đề là bắt buộc.').max(100, 'Tối đa 100 ký tự.'),
    url: Yup.string().required('Liên kết là bắt buộc.'),
    type: Yup.number().required('Vui lòng chọn thể loại.').oneOf([0, 1], 'Giá trị không hợp lệ.'),
    visible: Yup.number()
      .required('Vui lòng chọn hiển thị.')
      .oneOf([0, 1], 'Giá trị không hợp lệ.'),
  })

  const handleImageChange = (e) => {
    onFilesChange(e, {
      multiple: false,
      setUrls: setImagePreview,
      previousUrls: imagePreview,
      setBase64: (arr) => setImageBase64(Array.isArray(arr) ? arr : []),
      onError: (err) => console.error('Image upload error:', err),
    })
  }

  useEffect(() => {
    if (sub === 'add') {
      setIsEditing(false)
      inputRef.current?.focus()
      revokeObjectURLs(imagePreview)
      setImagePreview([])
      setImageBase64([])
      setFormValues(initialValues)
    } else if (sub === 'edit' && id) {
      setIsEditing(true)
    }
  }, [location.search])

  const fetchDataList = async (keyword = '', signal) => {
    try {
      setIsLoading((p) => ({ ...p, page: true }))
      const res = await axiosClient.get(
        `/admin/link-news?data=${encodeURIComponent(keyword)}&page=${pageNumber}&type=${selectedCate}`,
        { signal },
      )
      if (res?.data?.status === true) {
        setDataItems(res.data.list || [])
      } else if (res?.data?.status === false && res?.data?.mess === 'no permission') {
        setIsPermissionCheck(false)
      }
    } catch (error) {
      if (error.name !== 'CanceledError' && error.name !== 'AbortError') {
        console.error('Fetch list error', error)
      }
    } finally {
      setIsLoading((p) => ({ ...p, page: false }))
    }
  }

  useEffect(() => {
    const controller = new AbortController()
    fetchDataList(dataSearch, controller.signal)
    return () => controller.abort()
  }, [pageNumber, selectedCate])

  const fetchDataById = async (signal) => {
    if (!id) return
    try {
      const res = await axiosClient.get(`/admin/link-news/${id}/edit`, { signal })
      const data = res?.data?.data
      if (res?.data?.status === true && data) {
        setFormValues({
          title: data.title ?? '',
          url: data.link ?? '',
          type: data.type ?? 0,
          visible: data.display ?? 0,
        })
        if (typeof data.picture === 'string' && data.picture) {
          setImagePreview([data.picture])
          setImageBase64([])
        }
      } else if (res?.data?.status === false && res?.data?.mess === 'no permission') {
        toast.warn('Bạn không có quyền thực hiện tác vụ này!')
      }
    } catch (error) {
      if (error.name !== 'CanceledError' && error.name !== 'AbortError') {
        console.error('Fetch by id error', error)
      }
    }
  }

  useEffect(() => {
    if (sub === 'edit' && id) {
      const controller = new AbortController()
      fetchDataById(controller.signal)
      return () => controller.abort()
    }
  }, [id, sub])

  const handleSubmit = async (values, { resetForm }) => {
    try {
      setIsLoading((p) => ({ ...p, button: true }))
      const payload = {
        title: values.title,
        link: values.url,
        display: values.visible,
        type: values.type,
        picture: imageBase64[0] || null, // gửi base64 nếu có chọn mới
      }

      if (isEditing) {
        const res = await axiosClient.put(`/api/link-news/${id}`, payload)
        if (res?.data?.status === true) {
          toast.success('Cập nhật thông tin thành công')
          resetForm()
          revokeObjectURLs(imagePreview)
          setImagePreview([])
          setImageBase64([])
          fetchDataList(dataSearch)
          navigate('/introduce/video-press')
        } else {
          toast.error(res?.data?.message || 'Không thể cập nhật')
        }
      } else {
        const res = await axiosClient.post(`/api/link-news`, payload)
        if (res?.data?.status === true) {
          toast.success('Thêm mới thông tin thành công!')
          resetForm()
          revokeObjectURLs(imagePreview)
          setImagePreview([])
          setImageBase64([])
          fetchDataList(dataSearch)
          navigate('/introduce/video-press?sub=add')
        } else {
          toast.error(res?.data?.message || 'Không thể thêm mới')
        }
      }
    } catch (error) {
      console.error('Submit error', error)
      toast.error('Đã xảy ra lỗi. Vui lòng thử lại!')
    } finally {
      setIsLoading((p) => ({ ...p, button: false }))
    }
  }

  const handleAddNewClick = () => navigate('/introduce/video-press?sub=add')
  const handleEditClick = (rowId) => navigate(`/introduce/video-press?id=${rowId}&sub=edit`)

  const handleDelete = async () => {
    try {
      const res = await axiosClient.delete(`/admin/link-news/${deletedId}`)
      if (res?.data?.status === true) {
        toast.success('Xóa thành công')
        setVisible(false)
        fetchDataList(dataSearch)
      } else {
        toast.error(res?.data?.message || 'Không thể xóa')
      }
    } catch (error) {
      console.error('Delete error', error)
      toast.error('Đã xảy ra lỗi khi xóa. Vui lòng thử lại!')
    }
  }

  const handlePageChange = ({ selected }) => {
    const newPage = selected + 1
    window.scrollTo(0, 0)
    setPageNumber(newPage)
  }

  const handleSearch = (keyword) => {
    setDataSearch(keyword)
    setPageNumber(1)
    const controller = new AbortController()
    fetchDataList(keyword, controller.signal)
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
              <h3>QUẢN LÝ VIDEO / BÁO CHÍ</h3>
            </CCol>
            <CCol md={6}>
              <div className="d-flex justify-content-end gap-3">
                <CButton
                  onClick={handleAddNewClick}
                  color="primary"
                  type="button"
                  size="sm"
                  className="button-add"
                >
                  Thêm mới
                </CButton>
                <Link to={'/introduce/video-press'}>
                  <CButton color="primary" type="button" size="sm">
                    Danh sách
                  </CButton>
                </Link>
              </div>
            </CCol>
          </CRow>

          <CRow>
            <CCol md={4}>
              <h6>{!isEditing ? 'Thêm mới' : 'Cập nhật'}</h6>
              <Formik
                initialValues={formValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
                enableReinitialize
              >
                {() => (
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
                      <CFormInput
                        name="avatar"
                        type="file"
                        id="formFile"
                        label="Ảnh đại diện"
                        size="sm"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                      <br />
                      <div>
                        {imagePreview.length > 0 &&
                          imagePreview.map((src, idx) => (
                            <CImage className="border me-2 mb-2" key={idx} src={src} width={200} />
                          ))}
                      </div>
                    </CCol>
                    <br />

                    <CCol md={12}>
                      <label htmlFor="type-select">Thể loại</label>
                      <Field
                        name="type"
                        as={CFormSelect}
                        id="type-select"
                        options={[
                          { label: 'Video', value: 0 },
                          { label: 'Báo chí', value: 1 },
                        ]}
                      />
                      <ErrorMessage name="type" component="div" className="text-danger" />
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
                      <CButton color="primary" type="submit" size="sm" disabled={isLoading.button}>
                        {isLoading.button ? (
                          <>
                            <CSpinner size="sm" /> Đang cập nhật...
                          </>
                        ) : isEditing ? (
                          'Cập nhật'
                        ) : (
                          'Thêm mới'
                        )}
                      </CButton>
                    </CCol>
                  </Form>
                )}
              </Formik>
            </CCol>

            <CCol>
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
                      <td className="total-count">{dataItems.length}</td>
                    </tr>
                    <tr>
                      <td>Lọc theo vị trí</td>
                      <td>
                        <CFormSelect
                          className="component-size w-50"
                          aria-label="Chọn yêu cầu lọc"
                          options={[
                            { label: 'Chọn danh mục', value: '' },
                            { label: 'Video', value: 0 },
                            { label: 'Báo chí', value: 1 },
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

              {isLoading.page ? (
                <Loading />
              ) : (
                <CCol>
                  <table className="table border table-hover caption-top mt-3">
                    <thead className="thead-dark">
                      <tr>
                        <th scope="col">Hình ảnh</th>
                        <th scope="col">Liên kết</th>
                        <th scope="col">Tác vụ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.isArray(dataItems) &&
                        dataItems.length > 0 &&
                        dataItems.map((item) => (
                          <tr key={item?.id}>
                            <td scope="row">
                              <CImage width={80} src={item.picture} />
                            </td>
                            <td
                              style={{
                                maxWidth: 300,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                              title={item?.link}
                            >
                              {item?.link}
                            </td>
                            <td scope="row">
                              <div className="d-flex">
                                <button
                                  onClick={() => handleEditClick(item?.id)}
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
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </CCol>
              )}

              <div className="d-flex justify-content-end">
                <ReactPaginate
                  pageCount={Math.ceil((dataItems?.length || 0) / 10) || 1}
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

export default VideoPress
