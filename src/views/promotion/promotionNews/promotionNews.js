import { cilColorBorder, cilTrash, cilPlus } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import {
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCol,
  CFormCheck,
  CImage,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
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

      if (response.data.status === false && response.data.mess === 'no permission') {
        setIsPermissionCheck(false)
      }
    } catch (error) {
      console.error('Fetch promotion news data error', error)
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
        toast.success('Xóa tin khuyến mãi thành công!')
      }

      if (response.data.status === false && response.data.mess === 'no permission') {
        toast.warn('Bạn không có quyền thực hiện tác vụ này!')
      }
    } catch (error) {
      console.error('Delete promotion news error', error)
      toast.error('Đã xảy ra lỗi khi xóa. Vui lòng thử lại!')
    }
  }

  const handleDeleteSelectedCheckbox = async () => {
    if (selectedCheckbox.length === 0) {
      toast.warn('Vui lòng chọn ít nhất 1 tin khuyến mãi để xóa!')
      return
    }
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
      console.error('Delete selected items error', error)
    }
  }

  const formatDate = (ts) => {
    if (!ts || Number(ts) <= 0) return 'Không có ngày tạo'
    const m = moment.unix(Number(ts))
    return m.isValid() && m.year() >= 1980 ? m.format('DD-MM-YYYY') : 'Không có ngày tạo'
  }

  const items =
    dataPromotionNews?.data && dataPromotionNews?.data?.length > 0
      ? dataPromotionNews?.data.map((item) => ({
          id: (
            <CFormCheck
              key={item?.promotion_id}
              aria-label="Select item"
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
            <div className="fw-semibold text-dark" style={{ maxWidth: '320px' }}>
              {item?.promotion_desc?.title || 'Chưa có tiêu đề'}
            </div>
          ),
          image: (
            <CImage
              src={`${imageBaseUrl}${item.picture}`}
              alt={`Ảnh tin k/m ${item?.promotion_desc?.id}`}
              style={{ width: '80px', height: '50px', objectFit: 'cover' }}
              className="rounded border shadow-xs"
            />
          ),
          url: (
            <span className="badge bg-light text-secondary border font-monospace px-2 py-1">
              {item?.promotion_desc?.friendly_url || '---'}
            </span>
          ),
          info: (
            <div>
              <span className="fw-semibold text-primary d-block small">
                {item?.views || 0} lượt xem
              </span>
              <div className="text-secondary small">{formatDate(item?.date_post)}</div>
            </div>
          ),
          actions: (
            <div className="d-flex gap-1">
              <CButton
                size="sm"
                color="info"
                className="text-white p-1"
                onClick={() => handleEditClick(item.promotion_id)}
                title="Chỉnh sửa"
              >
                <CIcon icon={cilColorBorder} />
              </CButton>
              <CButton
                size="sm"
                color="danger"
                className="text-white p-1"
                onClick={() => {
                  setVisible(true)
                  setDeletedId(item.promotion_id)
                }}
                title="Xóa"
              >
                <CIcon icon={cilTrash} />
              </CButton>
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
              const allIds = dataPromotionNews?.data.map((item) => item.promotion_id) || []
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
        <h5 className="p-4 text-center">
          <div>Bạn không đủ quyền để thao tác trên danh mục quản trị này.</div>
          <div className="mt-4">
            Vui lòng quay lại trang chủ <Link to={'/dashboard'}>(Nhấn vào để quay lại)</Link>
          </div>
        </h5>
      ) : (
        <>
          <DeletedModal visible={visible} setVisible={setVisible} onDelete={handleDelete} />

          {/* Header Title & Actions */}
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div>
              <h4 className="fw-bold text-dark mb-1">QUẢN LÝ TIN KHUYẾN MÃI</h4>
              <p className="text-muted small mb-0">
                Quản lý các bài viết tin tức khuyến mãi đăng tải trên website
              </p>
            </div>
            <div>
              <CButton
                color="primary"
                className="fw-semibold d-flex align-items-center gap-1 shadow-xs"
                onClick={handleAddNewClick}
              >
                <CIcon icon={cilPlus} /> Thêm mới tin khuyến mãi
              </CButton>
            </div>
          </div>

          <CRow>
            {/* Search filter template cũ - Giữ nguyên Search component */}
            <CCol md={12}>
              <Search count={dataPromotionNews?.total} onSearchData={handleSearch} />
            </CCol>

            {/* Action Row */}
            <CCol md={12} className="my-3">
              <CButton
                onClick={handleDeleteSelectedCheckbox}
                color="danger"
                size="sm"
                className="fw-semibold"
              >
                Xóa vĩnh viễn ({selectedCheckbox.length})
              </CButton>
            </CCol>

            {/* Table */}
            <CCol md={12}>
              <CCard className="mb-4 shadow-xs border">
                <CCardBody className="p-0">
                  <CTable
                    hover
                    responsive
                    className="mb-0 align-middle"
                    columns={columns}
                    items={items}
                  />
                </CCardBody>
              </CCard>
            </CCol>

            {/* Pagination */}
            <div className="d-flex justify-content-end">
              <ReactPaginate
                pageCount={Math.ceil(
                  (dataPromotionNews?.total || 0) / (dataPromotionNews?.per_page || 10),
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
                forcePage={pageNumber - 1}
              />
            </div>
          </CRow>
        </>
      )}
    </div>
  )
}

export default PromotionNews
