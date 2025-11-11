import { cilColorBorder, cilTrash } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import {
  CButton,
  CCol,
  CContainer,
  CFormCheck,
  CFormSelect,
  CImage,
  CRow,
  CTable,
} from '@coreui/react'
import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { axiosClient, imageBaseUrl } from '../../../axiosConfig'
import moment from 'moment/moment'

import ReactPaginate from 'react-paginate'
import DeletedModal from '../../../components/deletedModal/DeletedModal'
import { toast } from 'react-toastify'

function Consultant() {
  const navigate = useNavigate()

  // check permission state
  const [isPermissionCheck, setIsPermissionCheck] = useState(true)

  const [dataConsultant, setDataConsultant] = useState([])

  const [dataConsultantCate, setDataConsultantCate] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('')

  // show deleted Modal
  const [visible, setVisible] = useState(false)
  const [deletedId, setDeletedId] = useState(null)

  // checkbox selected
  const [isAllCheckbox, setIsAllCheckbox] = useState(false)
  const [selectedCheckbox, setSelectedCheckbox] = useState([])

  const [isCollapse, setIsCollapse] = useState(false)

  const handleToggleCollapse = () => {
    setIsCollapse((prevState) => !prevState)
  }

  //pagination state
  const [pageNumber, setPageNumber] = useState(1)

  // search input
  const [dataSearch, setDataSearch] = useState('')

  const handleAddNewClick = () => {
    navigate('/consultant/add')
  }

  const handleEditClick = (id) => {
    navigate(`/consultant/edit?id=${id}`)
  }

  // search Data
  const handleSearch = (keyword) => {
    fetchDataConsultant(keyword)
  }

  const fetchDataConsultantCate = async () => {
    try {
      const response = await axiosClient.get(`admin/faqs-category`)
      if (response.data.status === true) {
        setDataConsultantCate(response.data.list)
      }
    } catch (error) {
      console.error('Fetch data faqs cate is error', error)
    }
  }

  useEffect(() => {
    fetchDataConsultantCate()
  }, [])

  const fetchDataConsultant = async (dataSearch = '') => {
    try {
      const response = await axiosClient.get(
        `admin/faqs?data=${dataSearch}&page=${pageNumber}&cat_id=${selectedCategory}`,
      )

      if (response.data.status === true) {
        setDataConsultant(response.data.list)
      }

      if (response.data.status === false && response.data.mess == 'no permission') {
        setIsPermissionCheck(false)
      }
    } catch (error) {
      console.error('Fetch consultant data is error', error)
    }
  }

  useEffect(() => {
    fetchDataConsultant()
  }, [pageNumber, selectedCategory])

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

  // delete row
  const handleDelete = async () => {
    setVisible(true)
    try {
      const response = await axiosClient.delete(`admin/faqs/${deletedId}`)
      if (response.data.status === true) {
        setVisible(false)
        fetchDataConsultant()
      }

      if (response.data.status === false && response.data.mess == 'no permission') {
        toast.warn('Bạn không có quyền thực hiện tác vụ này!')
      }
    } catch (error) {
      console.error('Delete consultant id is error', error)
      toast.error('Đã xảy ra lỗi khi xóa. Vui lòng thử lại!')
    }
  }

  const handleDeleteSelectedCheckbox = async () => {
    try {
      const response = await axiosClient.post('admin/delete-all-faqs', {
        data: selectedCheckbox,
      })
      if (response.data.status === true) {
        toast.success('Xóa tất cả các mục thành công!')
        fetchDataConsultant()
        setSelectedCheckbox([])
      }
    } catch (error) {
      console.error('Deleted all id checkbox is error', error)
    }
  }

  const items =
    dataConsultant?.data && dataConsultant?.data?.length > 0
      ? dataConsultant?.data.map((item) => ({
          id: (
            <CFormCheck
              key={item?.faqs_id}
              aria-label="Default select example"
              defaultChecked={item?.faqs_id}
              id={`flexCheckDefault_${item?.faqs_id}`}
              value={item?.faqs_id}
              checked={selectedCheckbox.includes(item?.faqs_id)}
              onChange={(e) => {
                const faqsId = item?.faqs_id
                const isChecked = e.target.checked
                if (isChecked) {
                  setSelectedCheckbox([...selectedCheckbox, faqsId])
                } else {
                  setSelectedCheckbox(selectedCheckbox.filter((id) => id !== faqsId))
                }
              }}
            />
          ),
          title: (
            <div
              className="blue-txt"
              style={{
                width: 300,
              }}
            >
              {item?.faqs_desc?.title}
            </div>
          ),

          cate: <div className="cate-color">{item?.faqs_cate?.cat_name}</div>,
          info: (
            <div>
              <span>{item?.views} lượt xem</span>
            </div>
          ),
          create: <div>{moment.unix(item?.date_post).format('hh:mm:ss A, DD/MM/YYYY')}</div>,
          actions: (
            <div>
              <button
                onClick={() => handleEditClick(item.faqs_id)}
                className="button-action mr-2 bg-info"
              >
                <CIcon icon={cilColorBorder} className="text-white" />
              </button>
              <button
                onClick={() => {
                  setVisible(true)
                  setDeletedId(item.faqs_id)
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
        <>
          <CFormCheck
            aria-label="Select all"
            checked={isAllCheckbox}
            onChange={(e) => {
              const isChecked = e.target.checked
              setIsAllCheckbox(isChecked)
              if (isChecked) {
                const allIds = dataConsultant?.data.map((item) => item.faqs_id) || []
                setSelectedCheckbox(allIds)
              } else {
                setSelectedCheckbox([])
              }
            }}
          />
        </>
      ),
      _props: { scope: 'col' },
    },
    {
      key: 'title',
      label: 'Tiêu đề',
      _props: { scope: 'col' },
    },
    {
      key: 'cate',
      label: 'Danh mục',
      _props: { scope: 'col' },
    },
    {
      key: 'info',
      label: 'Thông tin',
      _props: { scope: 'col' },
    },
    {
      key: 'create',
      label: 'Ngày đăng',
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
            <CCol>
              <h2>QUẢN LÝ TƯ VẤN</h2>
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
                <Link to={'/promotion-news'}>
                  <CButton color="primary" type="submit" size="sm">
                    Danh sách
                  </CButton>
                </Link>
              </div>
            </CCol>
          </CRow>

          <CRow>
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
                      <td className="total-count">{dataConsultant?.total}</td>
                    </tr>
                    <tr>
                      <td>Lọc theo vị trí</td>
                      <td>
                        <CFormSelect
                          className="component-size w-50"
                          aria-label="Chọn yêu cầu lọc"
                          options={[
                            { label: 'Chọn danh mục', value: '' },
                            ...(dataConsultantCate && dataConsultantCate?.length > 0
                              ? dataConsultantCate?.map((cate) => ({
                                  label: cate?.faqs_category_desc.cat_name,
                                  value: cate?.cat_id,
                                }))
                              : []),
                          ]}
                          value={selectedCategory}
                          onChange={(e) => setSelectedCategory(e.target.value)}
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
            </CCol>

            <CCol md={12} className="mt-3">
              <CButton onClick={handleDeleteSelectedCheckbox} color="primary" size="sm">
                Xóa vĩnh viễn
              </CButton>
            </CCol>

            <CCol>
              <CTable hover className="mt-3" columns={columns} items={items} />
            </CCol>

            <div className="d-flex justify-content-end">
              <ReactPaginate
                pageCount={Math.ceil(dataConsultant?.total / dataConsultant?.per_page)}
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
        </>
      )}
    </div>
  )
}

export default Consultant
