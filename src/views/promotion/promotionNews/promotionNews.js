import { cilColorBorder, cilTrash } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { CButton, CCol, CContainer, CFormCheck, CImage, CRow, CTable } from '@coreui/react'
import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Search from '../../../components/search/Search'
import { axiosClient, imageBaseUrl } from '../../../axiosConfig'
import moment from 'moment/moment'

import '../promotionNews/css/promotionNews.css'
import ReactPaginate from 'react-paginate'
import DeletedModal from '../../../components/deletedModal/DeletedModal'
import { toast } from 'react-toastify'

function PromotionNews() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  // Lấy giá trị `page` từ URL hoặc mặc định là 1
  const pageFromUrl = parseInt(searchParams.get('page')) || 1
  const [pageNumber, setPageNumber] = useState(pageFromUrl)

  useEffect(() => {
    setSearchParams({ page: pageNumber })
  }, [pageNumber, setSearchParams])

  // check permission state
  const [isPermissionCheck, setIsPermissionCheck] = useState(true)

  const [dataPromotionNews, setDataPromotionNews] = useState([])

  // show deleted Modal
  const [visible, setVisible] = useState(false)
  const [deletedId, setDeletedId] = useState(null)

  // checkbox selected
  const [isAllCheckbox, setIsAllCheckbox] = useState(false)
  const [selectedCheckbox, setSelectedCheckbox] = useState([])

  const handleAddNewClick = () => {
    navigate('/promotion/add')
  }

  const handleEditClick = (id) => {
    navigate(`/promotion/edit?id=${id}`)
  }

  // search Data
  const handleSearch = (keyword) => {
    fetchPromotionNewsData(keyword)
  }

  const fetchPromotionNewsData = async (dataSearch = '') => {
    try {
      const response = await axiosClient.get(
        `admin/promotion?data=${dataSearch}&page=${pageNumber}`,
      )

      if (response.data.status === true) {
        setDataPromotionNews(response.data.list)
      }

      if (response.data.status === false && response.data.mess == 'no permission') {
        setIsPermissionCheck(false)
      }
    } catch (error) {
      console.error('Fetch promotion news data is error', error)
    }
  }

  useEffect(() => {
    fetchPromotionNewsData()
  }, [pageNumber])

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
      const response = await axiosClient.delete(`admin/promotion/${deletedId}`)
      if (response.data.status === true) {
        setVisible(false)
        fetchPromotionNewsData()
      }

      if (response.data.status === false && response.data.mess == 'no permission') {
        toast.warn('Bạn không có quyền thực hiện tác vụ này!')
      }
    } catch (error) {
      console.error('Delete promotion news id is error', error)
      toast.error('Đã xảy ra lỗi khi xóa. Vui lòng thử lại!')
    }
  }

  const handleDeleteSelectedCheckbox = async () => {
    try {
      const response = await axiosClient.post('admin/delete-all-promotion', {
        data: selectedCheckbox,
      })

      if (response.data.status === true) {
        toast.success('Xóa tất cả các mục thành công!')
        fetchPromotionNewsData()
        setSelectedCheckbox([])
      }
    } catch (error) {
      console.error('Deleted all id checkbox is error', error)
    }
  }

  const items =
    dataPromotionNews?.data && dataPromotionNews?.data?.length > 0
      ? dataPromotionNews?.data.map((item) => ({
          id: (
            <CFormCheck
              key={item?.promotion_id}
              aria-label="Default select example"
              defaultChecked={item?.promotion_id}
              id={`flexCheckDefault_${item?.promotion_id}`}
              value={item?.promotion_id}
              checked={selectedCheckbox.includes(item?.promotion_id)}
              onChange={(e) => {
                const commentId = item?.promotion_id
                const isChecked = e.target.checked
                if (isChecked) {
                  setSelectedCheckbox([...selectedCheckbox, commentId])
                } else {
                  setSelectedCheckbox(selectedCheckbox.filter((id) => id !== commentId))
                }
              }}
            />
          ),
          title: (
            <div
              style={{
                width: 300,
              }}
            >
              {item?.promotion_desc?.title}
            </div>
          ),
          image: (
            <CImage
              src={`${imageBaseUrl}${item.picture}`}
              alt={`Ảnh tin k/m ${item?.promotion_desc?.id}`}
              width={100}
            />
          ),
          url: <div>{item?.promotion_desc?.friendly_url}</div>,
          info: (
            <div>
              <span>{item?.views} lượt xem</span>
              <div>{moment.unix(item?.date_post).format('DD-MM-YYYY')}</div>
            </div>
          ),
          actions: (
            <div>
              <button
                onClick={() => handleEditClick(item.promotion_id)}
                className="button-action mr-2 bg-info"
              >
                <CIcon icon={cilColorBorder} className="text-white" />
              </button>
              <button
                onClick={() => {
                  setVisible(true)
                  setDeletedId(item.promotion_id)
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
                const allIds = dataPromotionNews?.data.map((item) => item.promotion_id) || []
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
      key: 'url',
      label: 'Chuỗi đường dẫn',
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
              <h3>QUẢN LÝ TIN KHUYẾN MÃI</h3>
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
                <Link to={'/promotion'}>
                  <CButton color="primary" type="submit" size="sm">
                    Danh sách
                  </CButton>
                </Link>
              </div>
            </CCol>
          </CRow>

          <CRow>
            <Search count={dataPromotionNews?.total} onSearchData={handleSearch} />

            <CCol md={12} className="mt-3">
              <CButton onClick={handleDeleteSelectedCheckbox} color="primary" size="sm">
                Xóa vĩnh viễn
              </CButton>
            </CCol>

            <CTable className="mt-2" columns={columns} items={items} />
            <div className="d-flex justify-content-end">
              <ReactPaginate
                pageCount={Math.ceil(dataPromotionNews?.total / dataPromotionNews?.per_page)}
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

export default PromotionNews
