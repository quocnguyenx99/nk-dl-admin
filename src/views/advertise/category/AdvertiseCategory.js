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
  CSpinner,
  CTable,
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

function AdvertiseCategory() {
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

  const [dataAdvertiseCategory, setDataAdvertiseCategroy] = useState([])
  const [countNewsCategory, setCountNewsCategory] = useState(null)

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
    name: '',
    width: '',
    height: '',
    numberOfBanner: '',
    description: '',
    visible: 0,
  }

  const validationSchema = Yup.object({
    title: Yup.string().required('Tiêu đề là bắt buộc.'),
    name: Yup.string().required('Name là bắt buộc.'),
    width: Yup.string().required('Chiều rộng banner là bắt buộc.'),
    height: Yup.string().required('Chiều cao banner là bắt buộc.'),
    numberOfBanner: Yup.string().required('Số lượng banner là bắt buộc.'),
    // description: Yup.string().required('Mô tả là bắt buộc.'),
    visible: Yup.string().required('Cho phép hiển thị là bắt buộc.'),
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

  const fetchDataAdvertiseCategory = async (dataSearch = '') => {
    try {
      const response = await axiosClient.get(`admin/ad-pos?data=${dataSearch}&page=${pageNumber}`)
      if (response.data.status === 'success') {
        setDataAdvertiseCategroy(response.data.list)
      }

      if (response.data.status === false && response.data.mess == 'no permission') {
        setIsPermissionCheck(false)
      }
    } catch (error) {
      console.error('Fetch data product brand is error', error)
    }
  }

  useEffect(() => {
    fetchDataAdvertiseCategory()
  }, [pageNumber])

  const fetchDataById = async (setValues) => {
    try {
      const response = await axiosClient.get(`admin/ad-pos/${id}/edit`)
      const data = response.data.list
      if (data) {
        setValues({
          title: data?.title,
          name: data?.name,
          width: data?.width,
          height: data?.height,
          numberOfBanner: data?.n_show,
          description: data?.description,
          visible: data.display,
        })
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
      console.error('Fetch data id advertise category is error', error.message)
    }
  }

  const handleSubmit = async (values, { resetForm }) => {
    if (isEditing) {
      //call api update data
      try {
        setIsLoading(true)
        const response = await axiosClient.put(`admin/ad-pos/${id}`, {
          title: values.title,
          name: values.name,
          width: values.width,
          height: values.height,
          show: values.numberOfBanner,
          description: values.description,
          display: values.visible,
        })
        if (response.data.status === true) {
          toast.success('Cập nhật vị trí thành công')
          resetForm()
          setIsEditing(false)
          fetchDataAdvertiseCategory()
          navigate('/advertise/category')
        } else {
          console.error('No data found for the given ID.')
        }

        if (response.data.status === false && response.data.mess == 'no permission') {
          toast.warn('Bạn không có quyền thực hiện tác vụ này!')
        }
      } catch (error) {
        console.error('Put data id advertise category is error', error.message)
        toast.error('Đã xảy ra lỗi. Vui lòng thử lại!')
      } finally {
        setIsLoading(false)
      }
    } else {
      //call api post new data
      try {
        setIsLoading(true)
        const response = await axiosClient.post('admin/ad-pos', {
          title: values.title,
          name: values.name,
          width: values.width,
          height: values.height,
          show: values.numberOfBanner,
          description: values.description,
          display: values.visible,
        })
        if (response.data.status === true) {
          toast.success('Thêm mới vị trí thành công!')
          resetForm()
          fetchDataAdvertiseCategory()
          navigate('/advertise/category?sub=add')
        }

        if (response.data.status === false && response.data.mess == 'no permission') {
          toast.warn('Bạn không có quyền thực hiện tác vụ này!')
        }
      } catch (error) {
        console.error('Post data advertise category is error', error)
        toast.error('Đã xảy ra lỗi. Vui lòng thử lại!')
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleAddNewClick = () => {
    navigate('/advertise/category?sub=add')
  }

  const handleEditClick = (id) => {
    navigate(`/advertise/category?id=${id}&sub=edit`)
  }

  // delete row
  const handleDelete = async () => {
    setVisible(true)
    try {
      const response = await axiosClient.delete(`admin/ad-pos/${deletedId}`)
      if (response.data.status === true) {
        setVisible(false)
        fetchDataAdvertiseCategory()
      }

      if (response.data.status === false && response.data.mess == 'no permission') {
        toast.warn('Bạn không có quyền thực hiện tác vụ này!')
      }
    } catch (error) {
      console.error('Delete advertise id is error', error)
      toast.error('Đã xảy ra lỗi khi xóa. Vui lòng thử lại!')
    }
  }

  // delete all
  const handleDeleteSelectedCheckbox = async () => {
    try {
      const response = await axiosClient.post('admin/delete-all-ad-pos', {
        data: selectedCheckbox,
      })

      if (response.data.status === true) {
        toast.success('Đã xóa các mục được chọn!')
        fetchDataAdvertiseCategory()
      }
    } catch (error) {
      console.error('Delete selected checkbox is error', error)
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
    fetchDataAdvertiseCategory(keyword)
  }

  const items =
    dataAdvertiseCategory && dataAdvertiseCategory?.length > 0
      ? dataAdvertiseCategory.map((item) => ({
          id: (
            <CFormCheck
              key={item?.id_pos}
              aria-label="Default select example"
              defaultChecked={item?.id_pos}
              id={`flexCheckDefault_${item?.id_pos}`}
              value={item?.id_pos}
              checked={selectedCheckbox.includes(item?.id_pos)}
              onChange={(e) => {
                const positionId = item?.id_pos
                const isChecked = e.target.checked
                if (isChecked) {
                  setSelectedCheckbox([...selectedCheckbox, positionId])
                } else {
                  setSelectedCheckbox(selectedCheckbox.filter((id) => id !== positionId))
                }
              }}
            />
          ),
          title: item?.title,
          name: item?.name,
          demension: `${item?.width} x ${item?.height}`,
          actions: (
            <div>
              <button
                onClick={() => handleEditClick(item.id_pos)}
                className="button-action mr-2 bg-info"
              >
                <CIcon icon={cilColorBorder} className="text-white" />
              </button>
              <button
                onClick={() => {
                  setVisible(true)
                  setDeletedId(item.id_pos)
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
              const allIds = dataAdvertiseCategory?.map((item) => item.id_pos) || []
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
      key: 'name',
      label: 'Name',
      _props: { scope: 'col' },
    },
    {
      key: 'demension',
      label: 'Kích thước',
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
              <h3>QUẢN LÝ VỊ TRÍ BANNER</h3>
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
                <Link to={'/advertise/category'}>
                  <CButton color="primary" type="submit" size="sm">
                    Danh sách
                  </CButton>
                </Link>
              </div>
            </CCol>
          </CRow>

          <CRow>
            <CCol md={4}>
              <h6>{!isEditing ? 'Thêm danh mục mới' : 'Cập nhật danh mục'}</h6>
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
                              text="Tiêu đề sẽ hiển thị trên trang mạng của bạn."
                            />
                          )}
                        </Field>
                        <ErrorMessage name="title" component="div" className="text-danger" />
                      </CCol>
                      <br />

                      <CCol md={12}>
                        <label htmlFor="name-input">Name</label>
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
                        <label htmlFor="width-input">Chiều rộng</label>
                        <Field
                          name="width"
                          type="text"
                          as={CFormInput}
                          id="width-input"
                          text="Sử dụng đơn vị pixel (px)."
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
                          text="Sử dụng đơn vị pixel (px)."
                        />
                        <ErrorMessage name="height" component="div" className="text-danger" />
                      </CCol>
                      <br />

                      <CCol md={12}>
                        <label htmlFor="numberOfBanner-input">Số banner hiển thị</label>
                        <Field
                          name="numberOfBanner"
                          type="number"
                          as={CFormInput}
                          id="numberOfBanner-input"
                          text="Số banner hiển thị của vị trí."
                        />
                        <ErrorMessage
                          name="numberOfBanner"
                          component="div"
                          className="text-danger"
                        />
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
              <Search count={dataAdvertiseCategory?.length} onSearchData={handleSearch} />

              <CCol className="my-3">
                <CButton onClick={handleDeleteSelectedCheckbox} color="primary" size="sm">
                  Xóa vĩnh viễn
                </CButton>
              </CCol>
              <CTable className="mt-2" columns={columns} items={items} />

              <div className="d-flex justify-content-end">
                <ReactPaginate
                  pageCount={Math.ceil(dataAdvertiseCategory?.length / 15)}
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

export default AdvertiseCategory
