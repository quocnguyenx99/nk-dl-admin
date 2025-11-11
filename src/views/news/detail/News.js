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
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { axiosClient, imageBaseUrl } from '../../../axiosConfig'
import moment from 'moment/moment'

import ReactPaginate from 'react-paginate'
import DeletedModal from '../../../components/deletedModal/DeletedModal'
import { toast } from 'react-toastify'

import './css/news.scss'

function News() {
  const navigate = useNavigate()

  const [searchParams, setSearchParams] = useSearchParams()

  // Lấy giá trị `page` từ URL hoặc mặc định là 1
  const pageFromUrl = parseInt(searchParams.get('page')) || 1
  const [pageNumber, setPageNumber] = useState(pageFromUrl)

  useEffect(() => {
    setSearchParams({ page: pageNumber })
  }, [pageNumber, setSearchParams])

  const [dataNews, setDataNews] = useState([])

  // check permission state
  const [isPermissionCheck, setIsPermissionCheck] = useState(true)

  const [dataNewsCategory, setDataNewsCategroy] = useState([])
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

  // search input
  const [dataSearch, setDataSearch] = useState('')

  const handleAddNewClick = () => {
    navigate('/news/add')
  }

  const handleEditClick = (id) => {
    navigate(`/news/edit?id=${id}`)
  }

  // search Data
  const handleSearch = (keyword) => {
    fetchDataNews(keyword)
  }

  const fetchDataNewsCategory = async () => {
    try {
      const response = await axiosClient.get(`admin/news-category`)
      if (response.data.status === true) {
        setDataNewsCategroy(response.data.list)
      }
    } catch (error) {
      console.error('Fetch data news is error', error)
    }
  }

  useEffect(() => {
    fetchDataNewsCategory()
  }, [])

  const fetchDataNews = async (dataSearch = '') => {
    try {
      const response = await axiosClient.get(
        `admin/news?data=${dataSearch}&page=${pageNumber}&category=${selectedCategory}`,
      )

      if (response.data.status === true) {
        setDataNews(response.data.list)
      }

      if (response.data.status === false && response.data.mess == 'no permission') {
        setIsPermissionCheck(false)
      }
    } catch (error) {
      console.error('Fetch promotion news data is error', error)
    }
  }

  useEffect(() => {
    fetchDataNews()
  }, [pageNumber, selectedCategory])

  // pagination data
  const handlePageChange = ({ selected }) => {
    const newPage = selected + 1
    setPageNumber(newPage)
    window.scrollTo(0, 0)
  }

  // delete row
  const handleDelete = async () => {
    setVisible(true)
    try {
      const response = await axiosClient.delete(`admin/news/${deletedId}`)
      if (response.data.status === true) {
        setVisible(false)
        fetchDataNews()
      }

      if (response.data.status === false && response.data.mess == 'no permission') {
        toast.warn('Bạn không có quyền thực hiện tác vụ này!')
      }
    } catch (error) {
      console.error('Delete news id is error', error)
      toast.error('Đã xảy ra lỗi khi xóa. Vui lòng thử lại!')
    }
  }

  // Long làm liền
  const handleDeleteSelectedCheckbox = async () => {
    try {
      const response = await axiosClient.post('admin/delete-all-news', {
        data: selectedCheckbox,
      })
      if (response.data.status === true) {
        toast.success('Xóa tất cả các mục thành công!')
        fetchDataNews()
        setSelectedCheckbox([])
      }
    } catch (error) {
      console.error('Deleted all id checkbox is error', error)
    }
  }

  const items =
    dataNews?.data && dataNews?.data?.length > 0
      ? dataNews?.data.map((item) => ({
          id: (
            <CFormCheck
              key={item?.news_id}
              aria-label="Default select example"
              defaultChecked={item?.news_id}
              id={`flexCheckDefault_${item?.news_id}`}
              value={item?.news_id}
              checked={selectedCheckbox.includes(item?.news_id)}
              onChange={(e) => {
                const newsId = item?.news_id
                const isChecked = e.target.checked
                if (isChecked) {
                  setSelectedCheckbox([...selectedCheckbox, newsId])
                } else {
                  setSelectedCheckbox(selectedCheckbox.filter((id) => id !== newsId))
                }
              }}
            />
          ),
          title: (
            <div
              className="title-color"
              style={{
                fontWeight: 600,
                maxWidth: '400px',
                wordWrap: 'break-word',
                whiteSpace: 'normal',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {item?.news_desc?.title}
            </div>
          ),
          image: (
            <CImage
              className="border"
              src={`${imageBaseUrl}${item.picture}`}
              alt={`Ảnh tin k/m ${item?.news_desc?.id}`}
              width={120}
              height={100}
              loading="lazy"
              onError={(e) => {
                e.target.onerror = null
                e.target.src = `${imageBaseUrl}no-image.jpg`
              }}
            />
          ),
          cate: <div className="cate-color">{item?.category_desc?.[0].cat_name}</div>,
          info: (
            <div>
              <span>{item?.views} lượt xem</span>
              <div>{moment.unix(item?.date_post).format('DD-MM-YYYY')}</div>
            </div>
          ),
          actions: (
            <div className="d-flex">
              <button
                onClick={() => handleEditClick(item.news_id)}
                className="button-action mr-2 bg-info"
              >
                <CIcon icon={cilColorBorder} className="text-white" />
              </button>
              <button
                onClick={() => {
                  setVisible(true)
                  setDeletedId(item.news_id)
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
                const allIds = dataNews?.data.map((item) => item.news_id) || []
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
      key: 'image',
      label: 'Hình ảnh',
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
              <h3>QUẢN LÝ TIN TỨC</h3>
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
            {/* <Search count={dataNews?.total} onSearchData={handleSearch} /> */}

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
                      <td className="total-count">{dataNews?.total}</td>
                    </tr>
                    <tr>
                      <td>Lọc theo vị trí</td>
                      <td>
                        <CFormSelect
                          className="component-size w-50"
                          aria-label="Chọn yêu cầu lọc"
                          options={[
                            { label: 'Chọn danh mục', value: '' },
                            ...(dataNewsCategory && dataNewsCategory.length > 0
                              ? dataNewsCategory.map((group) => ({
                                  label: group?.news_category_desc?.cat_name,
                                  value: group.cat_id,
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
                pageCount={Math.ceil(dataNews?.total / dataNews?.per_page)}
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
                forcePage={pageNumber - 1} // Đảm bảo pagination hiển thị đúng trang hiện tại
              />
            </div>
          </CRow>
        </>
      )}
    </div>
  )
}

export default News
