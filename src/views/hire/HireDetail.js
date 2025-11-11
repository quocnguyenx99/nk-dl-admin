import {
  CButton,
  CCol,
  CContainer,
  CFormCheck,
  CFormSelect,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ReactPaginate from 'react-paginate'
import { axiosClient } from '../../axiosConfig'
import CIcon from '@coreui/icons-react'
import { cilColorBorder, cilEnvelopeClosed, cilEnvelopeOpen, cilTrash } from '@coreui/icons'
import moment from 'moment'
import DeletedModal from '../../components/deletedModal/DeletedModal'
import { toast } from 'react-toastify'
import Loading from '../../components/loading/Loading'

function HirePost() {
  const navigate = useNavigate()
  const [isCollapse, setIsCollapse] = useState(false)

  // check permission state
  const [isPermissionCheck, setIsPermissionCheck] = useState(true)

  // loading page
  const [isLoading, setIsLoading] = useState(false)

  // show deleted Modal
  const [visible, setVisible] = useState(false)
  const [deletedId, setDeletedId] = useState(null)

  // search input
  const [dataSearch, setDataSearch] = useState('')

  const [dataHirePost, setDataHirePost] = useState([])
  const [dataHireCategory, setDataHireCategory] = useState([])
  const [selectedCate, setSelectedCate] = useState('')

  // checkbox selected
  const [isAllCheckbox, setIsAllCheckbox] = useState(false)
  const [selectedCheckbox, setSelectedCheckbox] = useState([])

  //pagination state
  const [pageNumber, setPageNumber] = useState(1)

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
    fetchCommentData(keyword)
  }

  const handleToggleCollapse = () => {
    setIsCollapse((prevState) => !prevState)
  }

  const handleEditClick = (id) => {
    navigate(`/hire/post/edit?id=${id}`)
  }

  const fetchHireCategory = async () => {
    try {
      const response = await axiosClient.get('admin/hire-category')
      const data = response.data.data
      setDataHireCategory(data)
    } catch (error) {
      console.error('Fetch data hire category is error', error)
    }
  }

  useEffect(() => {
    fetchHireCategory()
  }, [])

  const fetchDataHirePost = async (dataSearch = '') => {
    try {
      setIsLoading(true)
      const response = await axiosClient.get(
        `admin/hire-post?page=${pageNumber}&data=${dataSearch}&cat_id=${selectedCate}`,
      )

      if (response.data.status === true) {
        setDataHirePost(response.data.data)
      }

      if (response.data.status === false && response.data.mess == 'no permission') {
        setIsPermissionCheck(false)
      }
    } catch (error) {
      console.error('Fetch hire post data is error', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDataHirePost()
  }, [pageNumber, selectedCate])

  const handleAddNewClick = () => {
    navigate('/hire/post/add')
  }

  // delete row
  const handleDelete = async () => {
    setVisible(true)
    try {
      const response = await axiosClient.delete(`admin/hire-post/${deletedId}`)
      if (response.data.status === true) {
        setVisible(false)
        fetchDataHirePost()
      }
      if (response.data.status === false && response.data.mess == 'no permission') {
        toast.warn('Bạn không có quyền thực hiện tác vụ này!')
      }
    } catch (error) {
      console.error('Delete hire post id is error', error)
      toast.error('Đã xảy ra lỗi khi xóa. Vui lòng thử lại!')
    }
  }

  const handleDeleteSelectedCheckbox = async () => {
    try {
      const response = await axiosClient.post('admin/delete-all-hire-post', {
        data: selectedCheckbox,
      })

      if (response.data.status === true) {
        toast.success('Xóa tất cả các mục thành công!')
        fetchDataHirePost()
        setSelectedCheckbox([])
      }
    } catch (error) {
      console.error('Delete selected checkbox is error', error)
    }
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
              <h2>QUẢN LÝ BÀI ĐĂNG TUYỂN</h2>
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
                <Link to={`/hire/post`}>
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
                      <td className="total-count">{dataHirePost?.total}</td>
                    </tr>
                    <tr>
                      <td>Lọc theo vị trí</td>
                      <td>
                        <CFormSelect
                          className="component-size w-50"
                          aria-label="Chọn yêu cầu lọc"
                          options={[
                            { label: 'Chọn danh mục tuyển dụng', value: '' },
                            ...(dataHireCategory && dataHireCategory?.length > 0
                              ? dataHireCategory.map((cate) => ({
                                  label: cate.title,
                                  value: cate.id,
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
            </CCol>

            <CCol md={12} className="mt-3">
              <CButton onClick={handleDeleteSelectedCheckbox} color="primary" size="sm">
                Xóa vĩnh viễn
              </CButton>
            </CCol>
            <CCol className="mt-3">
              {isLoading ? (
                <Loading />
              ) : (
                <CTable className="border" hover>
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell scope="col">
                        <CFormCheck
                          aria-label="Select all"
                          checked={isAllCheckbox}
                          onChange={(e) => {
                            const isChecked = e.target.checked
                            setIsAllCheckbox(isChecked)
                            if (isChecked) {
                              const allIds = dataHirePost?.data.map((item) => item.id) || []
                              setSelectedCheckbox(allIds)
                            } else {
                              setSelectedCheckbox([])
                            }
                          }}
                        />
                      </CTableHeaderCell>
                      <CTableHeaderCell scope="col">Tiêu đề</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Danh mục</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Ngày đăng</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Ngày hết hạn</CTableHeaderCell>
                      {/* <CTableHeaderCell scope="col">
                        <CIcon icon={cilEnvelopeClosed} size="lg" />
                      </CTableHeaderCell> */}
                      <CTableHeaderCell scope="col">Tác vụ</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {dataHirePost?.data &&
                      dataHirePost?.data.length > 0 &&
                      dataHirePost?.data.map((item) => (
                        <CTableRow key={item.id}>
                          <CTableHeaderCell scope="row">
                            <CFormCheck
                              key={item?.id}
                              aria-label="Default select example"
                              defaultChecked={item?.id}
                              id={`flexCheckDefault_${item?.id}`}
                              value={item?.id}
                              checked={selectedCheckbox.includes(item?.id)}
                              onChange={(e) => {
                                const postId = item?.id
                                const isChecked = e.target.checked
                                if (isChecked) {
                                  setSelectedCheckbox([...selectedCheckbox, postId])
                                } else {
                                  setSelectedCheckbox(
                                    selectedCheckbox.filter((id) => id !== postId),
                                  )
                                }
                              }}
                            />
                          </CTableHeaderCell>

                          <CTableDataCell>{item.name}</CTableDataCell>

                          <CTableDataCell>
                            <div>{item?.hire_category?.title}</div>
                          </CTableDataCell>

                          <CTableDataCell style={{ fontSize: 13 }} className="orange-txt">
                            {moment(item.created_at).format('DD-MM-YYYY, hh:mm:ss A')}
                          </CTableDataCell>

                          <CTableDataCell style={{ fontSize: 13 }} className="orange-txt">
                            {moment(item.deadline).format('DD-MM-YYYY, hh:mm:ss A')}
                          </CTableDataCell>

                          {/* <CTableDataCell style={{ fontSize: 13 }} className="orange-txt">
                            {item?.status === 1 ? (
                              <CIcon icon={cilEnvelopeOpen} />
                            ) : (
                              <CIcon icon={cilEnvelopeClosed} className="text-warning" size="lg" />
                            )}
                          </CTableDataCell> */}

                          <CTableDataCell className="orange-txt">
                            <div className="d-flex">
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
                          </CTableDataCell>
                        </CTableRow>
                      ))}
                  </CTableBody>
                </CTable>
              )}
              <div className="d-flex justify-content-end">
                <ReactPaginate
                  pageCount={Math.ceil(dataHirePost?.total / dataHirePost?.per_page)}
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

export default HirePost
