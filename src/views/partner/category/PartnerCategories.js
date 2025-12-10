import React, { useEffect, useRef, useState } from 'react'
import {
  CButton,
  CCol,
  CContainer,
  CFormCheck,
  CFormInput,
  CFormSelect,
  CImage,
  CRow,
  CSpinner,
  CTable,
} from '@coreui/react'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import ReactPaginate from 'react-paginate'
import CIcon from '@coreui/icons-react'
import { cilTrash, cilColorBorder } from '@coreui/icons'
import { toast } from 'react-toastify'
import axios from 'axios'
import DeletedModal from '../../../components/deletedModal/DeletedModal'
import Search from '../../../components/search/Search'
import { onFilesChange, revokeObjectURLs } from '../../../helper/fileUpload'
import { axiosClient, imageBaseUrl } from '../../../axiosConfig'

function PartnerCategories() {
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

  // data list
  const [dataPartner, setDataPartner] = useState([])
  const [pageNumber, setPageNumber] = useState(1)
  const [pagination, setPagination] = useState({ total: 0, perPage: 10 })
  const [dataSearch, setDataSearch] = useState('')

  // show deleted Modal
  const [visible, setVisible] = useState(false)
  const [deletedId, setDeletedId] = useState(null)

  // checkbox selected
  const [isAllCheckbox, setIsAllCheckbox] = useState(false)
  const [selectedCheckbox, setSelectedCheckbox] = useState([])

  const [logoPreview, setLogoPreview] = useState([])
  const [logoBase64, setLogoBase64] = useState('')

  const [companyPreview, setCompanyPreview] = useState([])
  const [companyBase64, setCompanyBase64] = useState([])

  const initialValues = {
    partnerName: '',
    partnerUrl: '',
    friendlyUrl: '',
    visible: '1',
  }

  const validationSchema = Yup.object({
    partnerName: Yup.string().required('Tên đối tác là bắt buộc.'),
    partnerUrl: Yup.string().url('Đường dẫn không hợp lệ.').required('Đường dẫn là bắt buộc.'),
    friendlyUrl: Yup.string().required('Chuỗi đường dẫn là bắt buộc.'),
    visible: Yup.string().required('Hiển thị là bắt buộc.'),
  })

  useEffect(() => {
    if (sub === 'add') {
      setIsEditing(false)
      if (inputRef.current) inputRef.current.focus()
      revokeObjectURLs(logoPreview)
      setLogoPreview([])
      setLogoBase64('')
      revokeObjectURLs(companyPreview)
      setCompanyPreview([])
      setCompanyBase64('')
    } else if (sub === 'edit' && id) {
      setIsEditing(true)
    }
  }, [location.search])

  const onLogoChange = (e) => {
    onFilesChange(e, {
      multiple: false,
      setUrls: setLogoPreview,
      previousUrls: logoPreview,
      setBase64: (arr) => setLogoBase64(Array.isArray(arr) && arr.length ? arr[0] : ''),
      onError: (err) => console.error('Logo upload error:', err),
    })
  }

  const onCompanyImageChange = (e) => {
    onFilesChange(e, {
      multiple: true,
      setUrls: setCompanyPreview,
      previousUrls: companyPreview,
      setBase64: setCompanyBase64,
      onError: (err) => console.error('Company image upload error:', err),
    })
  }

  // API: List (GET)
  const fetchDataPartner = async (keyword = '') => {
    try {
      const response = await axiosClient.get(
        `admin/partner?page=${pageNumber}&data=${encodeURIComponent(keyword)}`,
      )
      if (response?.data) {
        const list = response.data.partnerList?.data || []
        setDataPartner(list)
        setPagination({
          total:
            response.data.partnerList?.total ??
            (response.data.partnerList?.total ? response.data.pagination.total : list.length),
          perPage: response.data.partnerList?.per_page ?? 10,
        })
        setIsPermissionCheck(true)
      }
    } catch (error) {
      console.error('Fetch partner list error:', error)
    }
  }

  useEffect(() => {
    fetchDataPartner(dataSearch)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNumber])

  // API: Fetch by id (GET) — tùy API, bạn có thể cần chỉnh endpoint nếu khác
  const fetchDataById = async (setValues) => {
    if (!id) return
    try {
      const url = `https://api.vitinhnguyenkim.com.vn/api/admin/partner/${id}`
      const response = await axios.get(url)
      const data = response?.data?.partner || response?.data?.data || response?.data
      if (data) {
        setValues({
          partnerName: data?.name || '',
          partnerUrl: data?.url || data?.website_url || '',
          friendlyUrl: data?.friendly_url || '',
          visible: String(data?.display ?? '1'),
        })
        // set preview if API returns image URLs
        if (data?.logo) setLogoPreview([data.logo])
        if (data?.company_image) setCompanyPreview([data.company_image])
        // base64 không có từ API; chỉ set khi user chọn lại ảnh
      } else {
        console.warn('Không tìm thấy dữ liệu đối tác.')
      }
    } catch (error) {
      console.error('Fetch partner by id error:', error)
    }
  }

  const handleSubmit = async (values, { resetForm }) => {
    const payload = {
      name: values.partnerName,
      website_url: values.partnerUrl,
      friendly_url: values.friendlyUrl,
      display: values.visible,
      logo_picture: logoBase64,
      company_picture: companyBase64,
    }

    if (isEditing) {
      try {
        setIsLoading(true)
        const url = `https://media.vitinhnguyenkim.com.vn/api/partner/${id}`
        const response = await axios.put(url, payload)
        if (response?.data) {
          toast.success('Cập nhật đối tác thành công')
          resetForm()
          navigate('/partner/category')
          setIsEditing(false)
          // cleanup previews and reset images
          revokeObjectURLs(logoPreview)
          setLogoPreview([])
          setLogoBase64('')
          revokeObjectURLs(companyPreview)
          setCompanyPreview([])
          setCompanyBase64([])
          fetchDataPartner(dataSearch)
        }
      } catch (error) {
        console.error('Update partner error:', error)
        toast.error('Đã xảy ra lỗi. Vui lòng thử lại!')
      } finally {
        setIsLoading(false)
      }
    } else {
      try {
        setIsLoading(true)
        const url = 'https://media.vitinhnguyenkim.com.vn/api/partner'
        const response = await axios.post(url, payload)
        if (response?.data) {
          toast.success('Thêm mới đối tác thành công!')
          resetForm()
          // cleanup previews and reset images
          revokeObjectURLs(logoPreview)
          setLogoPreview([])
          setLogoBase64('')
          revokeObjectURLs(companyPreview)
          setCompanyPreview([])
          setCompanyBase64([])
          navigate('/partner/category?sub=add')
          fetchDataPartner(dataSearch)
        }
      } catch (error) {
        console.error('Create partner error:', error)
        toast.error('Đã xảy ra lỗi. Vui lòng thử lại!')
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleAddNewClick = () => {
    navigate('/partner/category?sub=add')
  }

  const handleEditClick = (pid) => {
    navigate(`/partner/category?id=${pid}&sub=edit`)
  }

  // delete 1 item
  const handleDelete = async () => {
    try {
      const url = `https://api.vitinhnguyenkim.com.vn/api/admin/partner/${deletedId}`
      const response = await axios.delete(url)
      if (response?.data) {
        toast.success('Xóa đối tác thành công')
        setVisible(false)
        fetchDataPartner(dataSearch)
      }
    } catch (error) {
      console.error('Delete partner error:', error)
      toast.error('Đã xảy ra lỗi khi xóa. Vui lòng thử lại!')
    }
  }

  // delete multi
  const handleDeleteAll = async () => {
    try {
      await Promise.all(
        selectedCheckbox.map((pid) =>
          axios.delete(`https://api.vitinhnguyenkim.com.vn/api/admin/partner/${pid}`),
        ),
      )
      toast.success('Xóa các đối tác đã chọn thành công')
      setSelectedCheckbox([])
      fetchDataPartner(dataSearch)
    } catch (error) {
      console.error('Delete multiple partners error:', error)
      toast.error('Đã xảy ra lỗi. Vui lòng thử lại!')
    }
  }

  // pagination
  const handlePageChange = ({ selected }) => {
    const newPage = selected + 1
    window.scrollTo(0, 0)
    setPageNumber(newPage)
  }

  // search
  const handleSearch = (keyword) => {
    setDataSearch(keyword)
    setPageNumber(1)
    fetchDataPartner(keyword)
  }

  // table data
  const items =
    Array.isArray(dataPartner) && dataPartner.length > 0
      ? dataPartner.map((item) => ({
          id: (
            <CFormCheck
              key={item?.id}
              aria-label="Select row"
              id={`partnerCheck_${item?.id}`}
              value={item?.id}
              checked={selectedCheckbox.includes(item?.id)}
              onChange={(e) => {
                const pid = item?.id
                const isChecked = e.target.checked
                if (isChecked) {
                  setSelectedCheckbox([...selectedCheckbox, pid])
                } else {
                  setSelectedCheckbox(selectedCheckbox.filter((id) => id !== pid))
                }
              }}
            />
          ),
          name: item?.namePartner || 'Chưa có tên',
          image: (
            <CImage
              className="border"
              src={`${imageBaseUrl}${item?.logo}`}
              alt={`Ảnh tin k/m ${item?.id}`}
              width={100}
              height={80}
              loading="lazy"
              onError={(e) => {
                e.target.onerror = null
                e.target.src = `${imageBaseUrl}no-image.jpg`
              }}
            />
          ),
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
              const allIds = (dataPartner || []).map((item) => item.id)
              setSelectedCheckbox(allIds)
            } else {
              setSelectedCheckbox([])
            }
          }}
        />
      ),
    },
    { key: 'name', label: 'Tên đối tác', _props: { scope: 'col' } },
    { key: 'image', label: 'Hình ảnh', _props: { scope: 'col' } },
    { key: 'actions', label: 'Tác vụ', _props: { scope: 'col' } },
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
              <h3>DANH MỤC ĐỐI TÁC</h3>
            </CCol>
            <CCol md={6}>
              <div className="d-flex justify-content-end">
                <CButton
                  onClick={handleAddNewClick}
                  color="primary"
                  type="button"
                  size="sm"
                  className="button-add"
                >
                  Thêm mới
                </CButton>
                <Link to={'/partner/category'}>
                  <CButton color="primary" type="button" size="sm">
                    Danh sách
                  </CButton>
                </Link>
              </div>
            </CCol>
          </CRow>

          <CRow>
            <CCol md={4}>
              <h6>{!isEditing ? 'Thêm đối tác mới' : 'Cập nhật đối tác'}</h6>
              <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {({ setValues }) => {
                  useEffect(() => {
                    if (sub === 'edit' && id) fetchDataById(setValues)
                    // eslint-disable-next-line react-hooks/exhaustive-deps
                  }, [id, sub])
                  return (
                    <Form>
                      <CCol md={12}>
                        <label htmlFor="partnerName-input">Tên đối tác</label>
                        <Field name="partnerName">
                          {({ field }) => (
                            <CFormInput
                              {...field}
                              type="text"
                              id="partnerName-input"
                              ref={inputRef}
                              text="Tên đối tác sẽ hiển thị trên website."
                            />
                          )}
                        </Field>
                        <ErrorMessage name="partnerName" component="div" className="text-danger" />
                      </CCol>
                      <br />

                      <CCol md={12}>
                        <label htmlFor="partnerUrl-input">Đường dẫn tới trang của đối tác</label>
                        <Field name="partnerUrl" type="url" as={CFormInput} id="partnerUrl-input" />
                        <ErrorMessage name="partnerUrl" component="div" className="text-danger" />
                      </CCol>
                      <br />

                      <CCol md={12}>
                        <label htmlFor="friendlyUrl-input">Chuỗi đường dẫn</label>
                        <Field
                          name="friendlyUrl"
                          type="text"
                          as={CFormInput}
                          id="friendlyUrl-input"
                        />
                        <ErrorMessage name="friendlyUrl" component="div" className="text-danger" />
                      </CCol>
                      <br />

                      <CCol md={12}>
                        <CFormInput
                          name="logo"
                          type="file"
                          id="logoFile"
                          label="Hình ảnh logo của hãng"
                          size="sm"
                          accept="image/*"
                          onChange={onLogoChange}
                        />
                        <br />
                        <div>
                          {logoPreview.length === 0
                            ? null
                            : logoPreview.map((src, idx) => (
                                <CImage className="border me-2" key={idx} src={src} width={200} />
                              ))}
                        </div>
                      </CCol>
                      <br />

                      <CCol md={12}>
                        <CFormInput
                          name="companyImage"
                          type="file"
                          multiple
                          id="companyFile"
                          label="Hình ảnh công ty và hãng"
                          size="sm"
                          accept="image/*"
                          onChange={onCompanyImageChange}
                        />
                        <br />
                        <div>
                          {companyPreview.length === 0
                            ? null
                            : companyPreview.map((src, idx) => (
                                <CImage className="border me-2" key={idx} src={src} width={200} />
                              ))}
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
                            { label: 'Không', value: '0' },
                            { label: 'Có', value: '1' },
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
              {/* THAY: khối input tìm kiếm thủ công bằng Search component giống NewsCategory */}
              <Search
                count={pagination.total || (Array.isArray(dataPartner) ? dataPartner.length : 0)}
                onSearchData={handleSearch}
              />

              <CCol md={12} className="mt-3">
                <CButton onClick={handleDeleteAll} color="primary" size="sm">
                  Xóa vĩnh viễn
                </CButton>
              </CCol>

              <CTable className="mt-2" columns={columns} items={items} />

              <div className="d-flex justify-content-end">
                <ReactPaginate
                  pageCount={Math.ceil(
                    (pagination.total || dataPartner.length || 1) / pagination.perPage,
                  )}
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

export default PartnerCategories
