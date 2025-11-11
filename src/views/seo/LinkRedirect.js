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
import Search from '../../components/search/Search'
import DeletedModal from '../../components/deletedModal/DeletedModal'
import { toast } from 'react-toastify'
import { axiosClient, imageBaseUrl } from '../../axiosConfig'

function LinkRedirect() {
  const location = useLocation()
  const navigate = useNavigate()

  const params = new URLSearchParams(location.search)
  const id = params.get('id')
  const sub = params.get('sub')

  const [isEditing, setIsEditing] = useState(false)
  const inputRef = useRef(null)

  // check permission state
  const [isPermissionCheck, setIsPermissionCheck] = useState(true)

  const [dataLinks, setDataLinks] = useState([])

  // loading button
  const [isLoading, setIsLoading] = useState(false)

  // selected checkbox
  const [isAllCheckbox, setIsAllCheckbox] = useState(false)
  const [selectedCheckbox, setSelectedCheckbox] = useState([])

  //pagination state
  const [pageNumber, setPageNumber] = useState(1)

  // show deleted Modal
  const [visible, setVisible] = useState(false)
  const [deletedId, setDeletedId] = useState(null)

  // form formik value
  const initialValues = {
    oldLink: '',
    newLink: '',
    visible: 0,
  }

  const validationSchema = Yup.object({
    oldLink: Yup.string().required('Link cũ là bắt buộc!'),
    newLink: Yup.string().required('Link mới là bắt buộc!'),
    visible: Yup.number().oneOf([0, 1], 'Giá trị không hợp lệ!').required('Hiển thị là bắt buộc!'),
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

  const fetchDataLinks = async (dataSearch = '') => {
    try {
      const response = await axiosClient.get(
        `admin/productStatus?data=${dataSearch}&page=${pageNumber}`,
      )
      if (response.data.status === 'success') {
        setDataLinks(response.data.list)
      }

      if (response.data.status === false && response.data.mess == 'no permission') {
        setIsPermissionCheck(false)
      }
    } catch (error) {
      console.error('Fetch data links is error', error)
    }
  }

  useEffect(() => {
    fetchDataLinks()
  }, [pageNumber])

  const fetchDataById = async (setValues) => {
    //api?search={dataSearch}
    try {
      const response = await axiosClient.get(`admin/productStatus/${id}/edit`)
      const data = response.data.productStatus
      if (response.data.status === true) {
        setValues({
          title: data.product_status_desc.title,
          name: data.name,
          width: data.width,
          height: data.height,
          desc: data.product_status_desc.description,
          friendlyUrl: data.product_status_desc.friendly_url,
          pageTitle: data.product_status_desc.friendly_title,
          metaKeyword: data.product_status_desc.metakey,
          metaDesc: data.product_status_desc.metadesc,
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
      console.error('Fetch data links by id is error', error.message)
    }
  }

  const handleSubmit = async (values, { resetForm }) => {
    if (isEditing) {
      //call api update data
      try {
        setIsLoading(true)
        const response = await axiosClient.put(`admin/productStatus/${id}`, {
          title: values.title,
          name: values.name,
          picture: selectedFile,
          width: values.width,
          height: values.height,
          description: values.desc,
          friendly_url: values.friendlyUrl,
          friendly_title: values.pageTitle,
          metakey: values.metaKeyword,
          metadesc: values.metaDesc,
          display: values.visible,
        })

        if (response.data.status === true) {
          toast.success('Cập nhật links redirect thành công')
          resetForm()
          setFile([])
          setSelectedFile([])
          setIsEditing(false)
          navigate('/product/status')
          fetchDataLinks()
        } else {
          console.error('No data found for the given ID.')
        }

        if (response.data.status === false && response.data.mess == 'no permission') {
          toast.warn('Bạn không có quyền thực hiện tác vụ này!')
        }
      } catch (error) {
        console.error('Put data links redirect is error', error.message)
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
          name: values.name,
          picture: selectedFile,
          width: values.width,
          height: values.height,
          description: values.desc,
          friendly_url: values.friendlyUrl,
          friendly_title: values.pageTitle,
          metakey: values.metaKeyword,
          metadesc: values.metaDesc,
          display: values.visible,
        })

        if (response.data.status === true) {
          toast.success('Thêm mới links redirect thành công!')
          resetForm()
          setFile([])
          setSelectedFile([])
          navigate('/product/status?sub=add')
          fetchDataLinks()
        }

        if (response.data.status === false && response.data.mess == 'no permission') {
          toast.warn('Bạn không có quyền thực hiện tác vụ này!')
        }
      } catch (error) {
        console.error('Post data links redirect is error', error)
        toast.error('Đã xảy ra lỗi. Vui lòng thử lại!')
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleAddNewClick = () => {
    navigate('/seo/links-redirect?sub=add')
  }

  const handleEditClick = (id) => {
    navigate(`/seo/links-redirect?id=${id}&sub=edit`)
  }

  // delete row
  const handleDelete = async () => {
    setVisible(true)
    try {
      const response = await axiosClient.delete(`admin/productStatus/${deletedId}`)
      if (response.data.status === true) {
        setVisible(false)
        fetchDataLinks()
      } else {
        console.error('ID not found for deleting links redirect')
      }

      if (response.data.status === false && response.data.mess == 'no permission') {
        toast.warn('Bạn không có quyền thực hiện tác vụ này!')
      }
    } catch (error) {
      console.error('Delete links redirect id is error', error)
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
    fetchDataLinks(keyword)
  }

  const handleDeleteAll = async () => {
    try {
      const response = await axiosClient.post(`admin/delete-all-product-status`, {
        data: selectedCheckbox,
      })

      if (response.data.status === true) {
        toast.success('Xóa tất cả danh mục thành công!')
        fetchDataLinks()
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
          style={{
            transform: 'scale(1.4)',
            accentColor: '#198754',
          }}
          aria-label="Select all"
          checked={isAllCheckbox}
          onChange={(e) => {
            const isChecked = e.target.checked
            setIsAllCheckbox(isChecked)
            if (isChecked) {
              const allIds = dataLinks?.data.map((item) => item.status_id) || []
              setSelectedCheckbox(allIds)
            } else {
              setSelectedCheckbox([])
            }
          }}
        />
      ),
    },
    { key: 'title', label: 'Link cũ' },
    { key: 'images', label: 'Link mới' },
    { key: 'actions', label: 'Tác vụ' },
  ]

  const items =
    dataLinks?.data && dataLinks?.data.length > 0
      ? dataLinks?.data.map((item) => ({
          id: (
            <CFormCheck
              style={{
                transform: 'scale(1.4)',
                accentColor: '#198754',
              }}
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
              <h2>QUẢN LÝ LINK REDIRECT</h2>
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
                <Link to={`/seo/links-redirect`}>
                  <CButton color="primary" type="submit" size="sm">
                    Danh sách
                  </CButton>
                </Link>
              </div>
            </CCol>
          </CRow>

          <CRow>
            <CCol md={4}>
              <h6>{!isEditing ? 'Thêm link redirect mới' : 'Cập nhật link redirect'}</h6>
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
                        <label htmlFor="title-input">Link cũ</label>
                        <Field name="oldLink">
                          {({ field }) => (
                            <CFormInput
                              {...field}
                              type="text"
                              id="title-input"
                              placeholder="https://"
                              ref={inputRef}
                            />
                          )}
                        </Field>
                        <ErrorMessage name="oldLink" component="div" className="text-danger" />
                      </CCol>
                      <br />

                      <CCol md={12}>
                        <label htmlFor="title-input">Link mới</label>
                        <Field name="newLink">
                          {({ field }) => (
                            <CFormInput
                              {...field}
                              type="text"
                              id="title-input"
                              placeholder="https://"
                              ref={inputRef}
                            />
                          )}
                        </Field>
                        <ErrorMessage name="newLink" component="div" className="text-danger" />
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
              <Search count={dataLinks?.total} onSearchData={handleSearch} />
              <CCol md={12} className="mt-3">
                <CButton onClick={handleDeleteAll} color="primary" size="sm">
                  Xóa vĩnh viễn
                </CButton>
              </CCol>
              <CCol className="mt-4">
                <CTable hover>
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
                    pageCount={Math.round(dataLinks?.total / dataLinks?.per_page)}
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

export default LinkRedirect
