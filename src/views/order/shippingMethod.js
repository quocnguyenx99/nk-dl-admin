import {
  CButton,
  CCol,
  CContainer,
  CFormCheck,
  CFormInput,
  CFormSelect,
  CFormText,
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

import CKedtiorCustom from '../../components/customEditor/ckEditorCustom'
import { formatNumber, unformatNumber } from '../../helper/utils'
import { toast } from 'react-toastify'
import { axiosClient } from '../../axiosConfig'

function ShippingMethod() {
  const location = useLocation()
  const navigate = useNavigate()

  const params = new URLSearchParams(location.search)
  const id = params.get('id')
  const sub = params.get('sub')
  // editor
  const [editorData, setEditorData] = useState(null)

  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingButton, setIsLoadingButton] = useState(false)

  // check permission state
  const [isPermissionCheck, setIsPermissionCheck] = useState(true)

  const [isEditing, setIsEditing] = useState(false)
  const inputRef = useRef(null)

  const [dataShippingMethod, setDataShippingMethod] = useState([])
  const [deletedId, setDeletedId] = useState(null)

  // selected checkbox
  const [isAllCheckbox, setIsAllCheckbox] = useState(false)
  const [selectedCheckbox, setSelectedCheckbox] = useState([])

  // search input
  const [dataSearch, setDataSearch] = useState('')

  //pagination state
  const [pageNumber, setPageNumber] = useState(1)

  // show deleted Modal
  const [visible, setVisible] = useState(false)

  // form formik value
  const initialValues = {
    title: '',
    name: '',
    charge: '0',
    visible: 0,
  }

  const validationSchema = Yup.object({
    title: Yup.string().required('Tiêu đề là bắt buộc!'),
    name: Yup.string().required('Name là bắt buộc!'),
    charge: Yup.string().required('Mức phí là bắt buộc!'),
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

  const fetchDataShippingMethod = async (dataSearch) => {
    try {
      const response = await axiosClient.get(
        `admin/shipping-method?data=${dataSearch}&page=${pageNumber}`,
      )
      const shippingMethodData = response.data
      if (shippingMethodData.status === true) {
        setDataShippingMethod(shippingMethodData.data)
      }

      if (response.data.status === false && response.data.mess == 'no permission') {
        setIsPermissionCheck(false)
      }
    } catch (error) {
      console.error('Fetch data shipping method is error', error)
    }
  }

  useEffect(() => {
    fetchDataShippingMethod()
  }, [dataSearch, pageNumber])

  const fetchDataById = async (setValues) => {
    try {
      const response = await axiosClient.get(`admin/shipping-method/${id}/edit`)
      const shippingMethodData = response.data.data
      if (shippingMethodData) {
        setValues({
          title: shippingMethodData.title,
          name: shippingMethodData.name,
          charge: shippingMethodData.price,
          visible: shippingMethodData.display,
        })
        setEditorData(shippingMethodData.description || '')
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
      console.error('Fetch data id shipping method is error', error.message)
    }
  }

  const handleSubmit = async (values, { resetForm }) => {
    if (isEditing) {
      //call api update data
      try {
        setIsLoadingButton(true)
        const response = await axiosClient.put(`admin/shipping-method/${id}`, {
          title: values.title,
          display: values.visible,
          name: values.name,
          description: editorData,
          price: values.charge,
        })

        if (response.data.status === true) {
          toast.success('Cập nhật phương thức thành công!')
          resetForm()
          setEditorData('')
          fetchDataShippingMethod()
          setIsEditing(false)
          navigate('/order/shipping-method')
        }

        if (response.data.status === false && response.data.mess == 'no permission') {
          toast.warn('Bạn không có quyền thực hiện tác vụ này!')
        }
      } catch (error) {
        console.error('Put data shipping method is error', error)
        toast.error('Đã xảy ra lỗi. Vui lòng thử lại!')
      } finally {
        setIsLoadingButton(false)
      }
    } else {
      //call api post new data
      try {
        setIsLoadingButton(true)
        const response = await axiosClient.post('admin/shipping-method', {
          title: values.title,
          display: values.visible,
          name: values.name,
          description: editorData,
          price: values.charge,
        })

        if (response.data.status === true) {
          toast.success('Thêm mới phương thức thành công!')
          resetForm()
          setEditorData('')
          fetchDataShippingMethod()
          navigate('/order/shipping-method?sub=add')
        }

        if (response.data.status === false && response.data.mess == 'no permission') {
          toast.warn('Bạn không có quyền thực hiện tác vụ này!')
        }
      } catch (error) {
        console.error('Post data shipping method is error', error)
        toast.error('Đã xảy ra lỗi. Vui lòng thử lại!')
      } finally {
        setIsLoadingButton(false)
      }
    }
  }

  const handleAddNewClick = () => {
    navigate('/order/shipping-method?sub=add')
  }

  const handleEditClick = (id) => {
    navigate(`/order/shipping-method?id=${id}&sub=edit`)
  }

  // delete row
  const handleDelete = async () => {
    setVisible(true)
    try {
      const response = await axiosClient.delete(`admin/shipping-method/${deletedId}`)
      if (response.data.status === true) {
        setVisible(false)
        fetchDataShippingMethod()
      }

      if (response.data.status === false && response.data.mess == 'no permission') {
        toast.warn('Bạn không có quyền thực hiện tác vụ này!')
      }
    } catch (error) {
      console.error('Delete shipping method is error', error)
      toast.error('Đã xảy ra lỗi khi xóa. Vui lòng thử lại!')
    }
  }

  const handleEditorChange = (data) => {
    setEditorData(data)
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
    fetchDataShippingMethod(keyword)
  }

  const [sortConfig, setSortConfig] = React.useState({ key: '', direction: 'ascending' })

  const handleSort = (columnKey) => {
    let direction = 'ascending'
    if (sortConfig.key === columnKey && sortConfig.direction === 'ascending') {
      direction = 'descending'
    }
    setSortConfig({ key: columnKey, direction })
  }

  const handleDeleteAll = async () => {
    try {
      const response = await axiosClient.post(`/admin/delete-all-shipping-method`, {
        data: selectedCheckbox,
      })

      if (response.data.status === true) {
        toast.success('Xóa tất cả thành công!')
        fetchDataShippingMethod()
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
              const allIds = dataShippingMethod?.data.map((item) => item.shipping_id) || []
              setSelectedCheckbox(allIds)
            } else {
              setSelectedCheckbox([])
            }
          }}
        />
      ),
    },
    { key: 'title', label: 'Tiêu đề' },
    { key: 'name', label: 'Name' },
    { key: 'charge', label: 'Mức phí' },
    { key: 'actions', label: 'Tác vụ' },
  ]

  const items = dataShippingMethod?.data
    ? dataShippingMethod?.data.map((method) => ({
        id: (
          <CFormCheck
            key={method?.shipping_id}
            defaultChecked={method?.shipping_id}
            id={`flexCheckDefault_${method?.shipping_id}`}
            value={method?.shipping_id}
            checked={selectedCheckbox.includes(method?.shipping_id)}
            onChange={(e) => {
              const shippingId = method?.shipping_id
              const isChecked = e.target.checked
              if (isChecked) {
                setSelectedCheckbox([...selectedCheckbox, shippingId])
              } else {
                setSelectedCheckbox(selectedCheckbox.filter((id) => id !== shippingId))
              }
            }}
          />
        ),
        title: <span className="blue-txt">{method.title}</span>,
        name: method.name,
        charge: (
          <span className="orange-txt">{`${Number(method.price).toLocaleString('vi-VN')} đ`}</span>
        ),
        actions: (
          <div>
            <button
              onClick={() => handleEditClick(method.shipping_id)}
              className="button-action mr-2 bg-info"
            >
              <CIcon icon={cilColorBorder} className="text-white" />
            </button>
            <button
              onClick={() => {
                setVisible(true)
                setDeletedId(method.shipping_id)
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

  const sortedItems = React.useMemo(() => {
    let sortableItems = [...items]
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1
        }
        return 0
      })
    }
    return sortableItems
  }, [items, sortConfig])

  return (
    <>
      {isLoading ? (
        <CSpinner size="large" />
      ) : (
        <div>
          {!isPermissionCheck ? (
            <h5>
              <div>Bạn không đủ quyền để thao tác trên danh mục quản trị này.</div>
              <div className="mt-4">
                Vui lòng quay lại trang chủ <Link to={'/dashboard'}>(Nhấn vào để quay lại)</Link>
              </div>
            </h5>
          ) : (
            <div>
              <DeletedModal visible={visible} setVisible={setVisible} onDelete={handleDelete} />
              <CRow className="mb-3">
                <CCol md={6}>
                  <h2>PHƯƠNG THỨC VẬN CHUYỂN</h2>
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
                    <Link to={`/order/shipping-method`}>
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
                  <h6>{!isEditing ? 'Thêm mới phương thức' : 'Cập nhật phương thức'}</h6>
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
                                  text="Tên riêng sẽ hiển thị trên trang mạng của bạn."
                                />
                              )}
                            </Field>
                            <ErrorMessage name="title" component="div" className="text-danger" />
                          </CCol>
                          <br />
                          <CCol md={12}>
                            <lable htmlFor="name-input">Name</lable>
                            <Field
                              name="name"
                              type="text"
                              as={CFormInput}
                              id="name-input"
                              text="Name là bắt buộc và duy nhất."
                            />
                            <ErrorMessage name="name" component="div" className="text-danger" />
                          </CCol>
                          <br />
                          <CCol md={12}>
                            <label htmlFor="charge-select">Mức phí</label>
                            <Field name="charge">
                              {({ field }) => (
                                <CFormInput
                                  {...field}
                                  type="text"
                                  id="charge-input"
                                  text="Phí vận chuyển tính của phương thức."
                                  value={formatNumber(field.value)}
                                  onChange={(e) => {
                                    const rawValue = unformatNumber(e.target.value)
                                    setFieldValue(field.name, rawValue)
                                  }}
                                />
                              )}
                            </Field>
                            <ErrorMessage name="charge" component="div" className="text-danger" />
                          </CCol>
                          <br />

                          <CCol md={12}>
                            <label htmlFor="visible-select">Mô tả</label>
                            <CKedtiorCustom data={editorData} onChangeData={handleEditorChange} />
                            <CFormText>
                              Mô tả bình thường không được sử dụng trong giao diện, tuy nhiên có vài
                              giao diện hiện thị mô tả này.
                            </CFormText>
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
                <CCol md={8}>
                  <Search count={dataShippingMethod?.total} onSearchData={handleSearch} />
                  <CCol md={12} className="mt-3">
                    <CButton onClick={handleDeleteAll} color="primary" size="sm">
                      Xóa vĩnh viễn
                    </CButton>
                  </CCol>
                  <CCol className="mt-4">
                    <CTable hover={true} className="border">
                      <thead>
                        <tr>
                          {columns.map((column) => (
                            <CTableHeaderCell
                              style={{ whiteSpace: 'nowrap' }}
                              key={column.key}
                              onClick={() => handleSort(column.key)}
                              className="prevent-select"
                            >
                              {column.label}
                              {sortConfig.key === column.key
                                ? sortConfig.direction === 'ascending'
                                  ? ' ▼'
                                  : ' ▲'
                                : ''}
                            </CTableHeaderCell>
                          ))}
                        </tr>
                      </thead>
                      <CTableBody>
                        {sortedItems.map((item, index) => (
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
                        pageCount={Math.ceil(
                          dataShippingMethod?.total / dataShippingMethod?.per_page,
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
                </CCol>
              </CRow>
            </div>
          )}
        </div>
      )}
    </>
  )
}

export default ShippingMethod
