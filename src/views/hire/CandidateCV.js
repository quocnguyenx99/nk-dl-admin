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
import React, { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import ReactPaginate from 'react-paginate'
import { axiosClient, imageBaseUrl } from '../../axiosConfig'
import CIcon from '@coreui/icons-react'
import { cilColorBorder, cilEnvelopeClosed, cilEnvelopeOpen, cilTrash } from '@coreui/icons'
import moment from 'moment'
import DeletedModal from '../../components/deletedModal/DeletedModal'
import { toast } from 'react-toastify'
import Loading from '../../components/loading/Loading'

function CandidateCV() {
  const navigate = useNavigate()
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const initialPostId = searchParams.get('post_id') || ''

  // check permission state
  const [isPermissionCheck, setIsPermissionCheck] = useState(true)

  // loading page
  const [isLoading, setIsLoading] = useState(false)

  // show deleted Modal
  const [visible, setVisible] = useState(false)
  const [deletedId, setDeletedId] = useState(null)

  // search & filter state
  const [searchInput, setSearchInput] = useState('')
  const [dataSearch, setDataSearch] = useState('')
  const [selectedCate, setSelectedCate] = useState('')
  const [selectedPost, setSelectedPost] = useState(initialPostId)
  const [statusFilter, setStatusFilter] = useState('')

  const [dataCandidate, setDataCandidate] = useState(null)
  const [dataHireCategory, setDataHireCategory] = useState([])
  const [dataHirePost, setDataHirePost] = useState([])
  const [summary, setSummary] = useState({
    total: 0,
    unread: 0,
    read: 0,
  })

  // checkbox selected
  const [isAllCheckbox, setIsAllCheckbox] = useState(false)
  const [selectedCheckbox, setSelectedCheckbox] = useState([])

  // pagination state
  const [pageNumber, setPageNumber] = useState(1)

  // pagination handler
  const handlePageChange = ({ selected }) => {
    const newPage = selected + 1
    setPageNumber(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const fetchHireCategory = async () => {
    try {
      const response = await axiosClient.get('admin/hire-category')
      const data = response.data.data
      setDataHireCategory(data || [])
    } catch (error) {
      console.error('Fetch hire category error', error)
    }
  }

  const fetchHirePosts = async () => {
    try {
      const response = await axiosClient.get('admin/hire-post?per_page=100')
      const data = response.data.data?.data || response.data.data || []
      setDataHirePost(data)
    } catch (error) {
      console.error('Fetch hire posts error', error)
    }
  }

  useEffect(() => {
    fetchHireCategory()
    fetchHirePosts()
  }, [])

  const fetchDataCandidate = useCallback(async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      params.append('page', pageNumber)
      if (dataSearch) params.append('data', dataSearch)
      if (selectedCate) params.append('cat_id', selectedCate)
      if (selectedPost) params.append('post_id', selectedPost)
      if (statusFilter) params.append('status_filter', statusFilter)

      const response = await axiosClient.get(`admin/show-candidates?${params.toString()}`)

      if (response.data.status === true) {
        setDataCandidate(response.data.data)
        if (response.data.summary) {
          setSummary(response.data.summary)
        }
      }

      if (response.data.status === false && response.data.mess === 'no permission') {
        setIsPermissionCheck(false)
      }
    } catch (error) {
      console.error('Fetch candidate data error', error)
    } finally {
      setIsLoading(false)
    }
  }, [pageNumber, dataSearch, selectedCate, selectedPost, statusFilter])

  useEffect(() => {
    fetchDataCandidate()
  }, [fetchDataCandidate])

  const handleSearchSubmit = (e) => {
    e?.preventDefault()
    setPageNumber(1)
    setDataSearch(searchInput)
  }

  const handleResetFilters = () => {
    setSearchInput('')
    setDataSearch('')
    setSelectedCate('')
    setSelectedPost('')
    setStatusFilter('')
    setPageNumber(1)
    navigate('/hire/candidate-cv', { replace: true })
  }

  const handleEditClick = (id) => {
    navigate(`/hire/candidate-cv/edit?id=${id}`)
  }

  const handleDelete = async () => {
    try {
      const response = await axiosClient.delete(`admin/candidates/${deletedId}`)
      if (response.data.status === true) {
        setVisible(false)
        toast.success('Xóa hồ sơ ứng viên thành công!')
        fetchDataCandidate()
      } else {
        toast.error('Không thể xóa hồ sơ này!')
      }
    } catch (error) {
      console.error('Delete candidate error', error)
      toast.error('Đã xảy ra lỗi khi xóa. Vui lòng thử lại!')
    }
  }

  const handleDeleteSelectedCheckbox = async () => {
    if (!selectedCheckbox.length) return
    if (
      !window.confirm(
        `Bạn có chắc chắn muốn xóa vĩnh viễn ${selectedCheckbox.length} hồ sơ đã chọn?`,
      )
    ) {
      return
    }
    try {
      const response = await axiosClient.post('admin/delete-all-candidates', {
        data: selectedCheckbox,
      })

      if (response.data.status === true) {
        toast.success(`Đã xóa ${selectedCheckbox.length} hồ sơ thành công!`)
        fetchDataCandidate()
        setSelectedCheckbox([])
        setIsAllCheckbox(false)
      } else {
        toast.error('Xóa thất bại!')
      }
    } catch (error) {
      console.error('Delete selected checkbox error', error)
      toast.error('Đã xảy ra lỗi khi xóa!')
    }
  }

  const formatCandidateDate = (dateVal) => {
    if (!dateVal) return 'Chưa cập nhật'
    if (typeof dateVal === 'number' || (!isNaN(dateVal) && String(dateVal).length <= 11)) {
      return moment.unix(Number(dateVal)).format('DD/MM/YYYY HH:mm')
    }
    return moment(dateVal).isValid() ? moment(dateVal).format('DD/MM/YYYY HH:mm') : String(dateVal)
  }

  const apiUploadBaseUrl = 'https://api-nk.vitinhnguyenkim.vn/'

  const getRawFileUrl = (filePath) => {
    if (!filePath) return null
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) return filePath
    const cleanPath = filePath.replace(/^\/+/, '')
    if (cleanPath.startsWith('uploads/candidate/')) {
      return `${apiUploadBaseUrl}${cleanPath}`
    }
    return `${imageBaseUrl}${cleanPath}`
  }

  const getViewableFileUrl = (filePath) => {
    const rawUrl = getRawFileUrl(filePath)
    if (!rawUrl) return null
    const ext = rawUrl.split('.').pop()?.toLowerCase()
    if (ext === 'doc' || ext === 'docx') {
      return `https://docs.google.com/viewer?url=${encodeURIComponent(rawUrl)}`
    }
    return rawUrl
  }

  const candidateList = dataCandidate?.data || []
  const totalItems = dataCandidate?.total || 0
  const perPage = dataCandidate?.per_page || 10
  const totalPages = Math.ceil(totalItems / perPage) || 1
  const startItem = totalItems === 0 ? 0 : (pageNumber - 1) * perPage + 1
  const endItem = Math.min(pageNumber * perPage, totalItems)

  return (
    <div className="pb-4">
      {!isPermissionCheck ? (
        <div className="card shadow-sm p-4 text-center">
          <h5 className="text-danger fw-bold mb-2">
            Bạn không đủ quyền để truy cập trang quản trị này.
          </h5>
          <p className="text-muted">
            Vui lòng quay lại{' '}
            <Link to={'/dashboard'} className="fw-bold text-primary">
              Bảng điều khiển
            </Link>
          </p>
        </div>
      ) : (
        <>
          <DeletedModal visible={visible} setVisible={setVisible} onDelete={handleDelete} />

          {/* PAGE HEADER */}
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4 pb-2 border-bottom">
            <div>
              <h3 className="fw-bold text-uppercase text-dark m-0">QUẢN LÝ HỒ SƠ ỨNG TUYỂN</h3>
              <p className="text-muted text-xs m-0 mt-1">
                Theo dõi thông tin ứng viên, xem và tải hồ sơ CV ứng tuyển theo từng vị trí
              </p>
            </div>
            <div className="d-flex flex-wrap gap-2">
              <Link to="/hire/post">
                <CButton color="light" size="sm" className="border fw-semibold shadow-xs">
                  Quản lý bài đăng tuyển dụng
                </CButton>
              </Link>
              <Link to="/hire/category">
                <CButton color="light" size="sm" className="border fw-semibold shadow-xs">
                  Danh mục tuyển dụng
                </CButton>
              </Link>
            </div>
          </div>

          {/* KPI STATISTICS CARDS */}
          <div className="row g-3 mb-4">
            <div className="col-12 col-md-4">
              <div
                className="card border-0 shadow-sm rounded-3 p-3 bg-white cursor-pointer h-100 d-flex flex-column justify-content-between"
                onClick={handleResetFilters}
                style={{ borderLeft: '4px solid #2563eb', minHeight: '82px' }}
              >
                <div
                  className="fw-bold text-truncate"
                  style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.2' }}
                >
                  Tổng hồ sơ ứng tuyển
                </div>
                <div
                  className="fw-bold mt-2"
                  style={{ fontSize: '24px', lineHeight: '1', color: '#1e293b' }}
                >
                  {summary.total || totalItems}
                </div>
              </div>
            </div>

            <div className="col-12 col-md-4">
              <div
                className="card border-0 shadow-sm rounded-3 p-3 bg-white cursor-pointer h-100 d-flex flex-column justify-content-between"
                onClick={() => {
                  setStatusFilter('unread')
                  setPageNumber(1)
                }}
                style={{ borderLeft: '4px solid #f59e0b', minHeight: '82px' }}
              >
                <div
                  className="fw-bold text-truncate"
                  style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.2' }}
                >
                  Hồ sơ chưa xem
                </div>
                <div
                  className="fw-bold mt-2"
                  style={{ fontSize: '24px', lineHeight: '1', color: '#d97706' }}
                >
                  {summary.unread || 0}
                </div>
              </div>
            </div>

            <div className="col-12 col-md-4">
              <div
                className="card border-0 shadow-sm rounded-3 p-3 bg-white cursor-pointer h-100 d-flex flex-column justify-content-between"
                onClick={() => {
                  setStatusFilter('read')
                  setPageNumber(1)
                }}
                style={{ borderLeft: '4px solid #16a34a', minHeight: '82px' }}
              >
                <div
                  className="fw-bold text-truncate"
                  style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.2' }}
                >
                  Hồ sơ đã xem
                </div>
                <div
                  className="fw-bold mt-2"
                  style={{ fontSize: '24px', lineHeight: '1', color: '#16a34a' }}
                >
                  {summary.read || 0}
                </div>
              </div>
            </div>
          </div>

          {/* FILTER & SEARCH CARD */}
          <div className="card border-0 shadow-sm rounded-3 p-3 mb-4 bg-white">
            <form onSubmit={handleSearchSubmit}>
              <div className="row g-2 align-items-center">
                <div className="col-12 col-md-4">
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0 text-muted">🔍</span>
                    <input
                      type="text"
                      className="form-control border-start-0 ps-0"
                      placeholder="Tìm tên ứng viên, email, SĐT..."
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                    />
                  </div>
                </div>

                <div className="col-12 col-md-3">
                  <CFormSelect
                    value={selectedCate}
                    onChange={(e) => {
                      setSelectedCate(e.target.value)
                      setPageNumber(1)
                    }}
                  >
                    <option value="">📁 Tất cả danh mục</option>
                    {dataHireCategory?.map((cate) => (
                      <option key={cate.id} value={cate.id}>
                        {cate.title}
                      </option>
                    ))}
                  </CFormSelect>
                </div>

                <div className="col-12 col-md-3">
                  <CFormSelect
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value)
                      setPageNumber(1)
                    }}
                  >
                    <option value="">Tất cả trạng thái xem</option>
                    <option value="unread">Chưa xem (Mới)</option>
                    <option value="read">Đã xem</option>
                  </CFormSelect>
                </div>

                <div className="col-12 col-md-2 d-flex gap-2">
                  <CButton type="submit" color="primary" className="w-100 fw-semibold shadow-xs">
                    Tìm kiếm
                  </CButton>
                  {(dataSearch || selectedCate || selectedPost || statusFilter || searchInput) && (
                    <CButton
                      type="button"
                      color="light"
                      className="border shadow-xs px-2.5 text-nowrap"
                      title="Đặt lại bộ lọc"
                      onClick={handleResetFilters}
                    >
                      Đặt lại
                    </CButton>
                  )}
                </div>
              </div>
            </form>
          </div>

          {/* BATCH ACTION BAR (If items are selected) */}
          {selectedCheckbox.length > 0 && (
            <div className="alert alert-primary bg-primary bg-opacity-10 border-primary border-opacity-25 d-flex justify-content-between align-items-center p-2.5 px-3 rounded-3 mb-3">
              <div className="d-flex align-items-center gap-2">
                <span className="fw-bold text-primary">
                  Đã chọn {selectedCheckbox.length} hồ sơ ứng tuyển
                </span>
              </div>
              <CButton
                color="danger"
                size="sm"
                className="fw-semibold text-white shadow-xs"
                onClick={handleDeleteSelectedCheckbox}
              >
                Xóa {selectedCheckbox.length} mục đã chọn
              </CButton>
            </div>
          )}

          {/* DATA TABLE */}
          <div className="card border-0 shadow-sm rounded-3 overflow-hidden bg-white mb-4">
            {isLoading ? (
              <div className="p-5 text-center">
                <Loading />
              </div>
            ) : candidateList.length === 0 ? (
              <div className="p-5 text-center text-muted">
                <h6 className="fw-bold text-dark">Chưa có hồ sơ ứng tuyển nào</h6>
                <p className="small text-muted mb-0">
                  Khi ứng viên nộp CV qua website, thông tin sẽ hiển thị tự động tại đây.
                </p>
              </div>
            ) : (
              <div className="table-responsive">
                <CTable hover className="align-middle mb-0">
                  <CTableHead
                    className="bg-light text-secondary text-uppercase"
                    style={{ fontSize: '11.5px' }}
                  >
                    <CTableRow>
                      <CTableHeaderCell style={{ width: '40px' }} className="text-center">
                        <CFormCheck
                          aria-label="Select all"
                          checked={
                            candidateList.length > 0 &&
                            candidateList.every((item) => selectedCheckbox.includes(item.id))
                          }
                          onChange={(e) => {
                            const isChecked = e.target.checked
                            setIsAllCheckbox(isChecked)
                            if (isChecked) {
                              setSelectedCheckbox(candidateList.map((item) => item.id))
                            } else {
                              setSelectedCheckbox([])
                            }
                          }}
                        />
                      </CTableHeaderCell>
                      <CTableHeaderCell style={{ minWidth: '220px' }}>Ứng viên</CTableHeaderCell>
                      <CTableHeaderCell style={{ minWidth: '180px' }}>
                        Email & Liên hệ
                      </CTableHeaderCell>
                      <CTableHeaderCell style={{ minWidth: '200px' }}>
                        Vị trí ứng tuyển
                      </CTableHeaderCell>
                      <CTableHeaderCell style={{ minWidth: '140px' }}>
                        Ngày nộp hồ sơ
                      </CTableHeaderCell>
                      <CTableHeaderCell style={{ width: '80px' }} className="text-center">
                        <CIcon icon={cilEnvelopeClosed} size="lg" title="Trạng thái xem hồ sơ" />
                      </CTableHeaderCell>
                      <CTableHeaderCell style={{ minWidth: '110px' }} className="text-center">
                        Tệp CV
                      </CTableHeaderCell>
                      <CTableHeaderCell style={{ minWidth: '100px' }} className="text-center">
                        Tác vụ
                      </CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {candidateList.map((item) => {
                      const isSelected = selectedCheckbox.includes(item.id)
                      const cvLink = getViewableFileUrl(item.cv)

                      return (
                        <CTableRow
                          key={item.id}
                          className={isSelected ? 'table-primary bg-opacity-25' : ''}
                        >
                          {/* Checkbox */}
                          <CTableDataCell className="text-center">
                            <CFormCheck
                              value={item.id}
                              checked={isSelected}
                              onChange={(e) => {
                                const isChecked = e.target.checked
                                if (isChecked) {
                                  setSelectedCheckbox([...selectedCheckbox, item.id])
                                } else {
                                  setSelectedCheckbox(
                                    selectedCheckbox.filter((id) => id !== item.id),
                                  )
                                }
                              }}
                            />
                          </CTableDataCell>

                          {/* Candidate Name & Initials */}
                          <CTableDataCell>
                            <div className="d-flex align-items-center gap-2.5">
                              <div
                                className="rounded-circle bg-primary bg-opacity-10 text-primary fw-bold d-flex align-items-center justify-content-center flex-shrink-0"
                                style={{ width: '38px', height: '38px', fontSize: '13px' }}
                              >
                                {item.name ? item.name.charAt(0).toUpperCase() : 'U'}
                              </div>
                              <div>
                                <div
                                  className="fw-bold text-dark cursor-pointer text-truncate"
                                  style={{ fontSize: '13.5px' }}
                                  onClick={() => handleEditClick(item.id)}
                                >
                                  {item.name || 'Ứng viên chưa nhập tên'}
                                </div>
                                {item.phone && (
                                  <a
                                    href={`tel:${item.phone}`}
                                    className="text-muted text-decoration-none"
                                    style={{ fontSize: '11.5px' }}
                                  >
                                    {item.phone}
                                  </a>
                                )}
                              </div>
                            </div>
                          </CTableDataCell>

                          {/* Email */}
                          <CTableDataCell>
                            {item.gmail ? (
                              <a
                                href={`mailto:${item.gmail}`}
                                className="text-primary text-decoration-none fw-semibold text-truncate d-block"
                                style={{ fontSize: '12.5px', maxWidth: '200px' }}
                                title={item.gmail}
                              >
                                {item.gmail}
                              </a>
                            ) : (
                              <span className="text-muted small">Chưa có email</span>
                            )}
                          </CTableDataCell>

                          {/* Position */}
                          <CTableDataCell>
                            <div className="fw-semibold text-dark" style={{ fontSize: '12.5px' }}>
                              {item.hire_post?.name || 'Vị trí tuyển dụng đã đóng/xóa'}
                            </div>
                            {item.hire_post?.hire_category?.title && (
                              <span
                                className="badge mt-1 px-2 py-0.5 rounded-pill"
                                style={{
                                  backgroundColor: '#eff6ff',
                                  color: '#1d4ed8',
                                  border: '1px solid #bfdbfe',
                                  fontSize: '11px',
                                }}
                              >
                                {item.hire_post.hire_category.title}
                              </span>
                            )}
                          </CTableDataCell>

                          {/* Date Submitted */}
                          <CTableDataCell>
                            <div className="text-secondary" style={{ fontSize: '12px' }}>
                              {formatCandidateDate(item.date_post || item.created_at)}
                            </div>
                          </CTableDataCell>

                          {/* Status - Envelope Icons */}
                          <CTableDataCell className="text-center">
                            {item.status === 1 ? (
                              <CIcon
                                icon={cilEnvelopeOpen}
                                className="text-secondary"
                                size="lg"
                                title="Đã xem"
                              />
                            ) : (
                              <CIcon
                                icon={cilEnvelopeClosed}
                                className="text-warning"
                                size="lg"
                                title="Chưa xem (Mới)"
                              />
                            )}
                          </CTableDataCell>

                          {/* View CV file */}
                          <CTableDataCell className="text-center">
                            {cvLink ? (
                              <a
                                href={cvLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-sm btn-outline-primary py-0.5 px-2 fw-semibold"
                                style={{ fontSize: '11px' }}
                              >
                                Xem CV
                              </a>
                            ) : (
                              <span className="text-muted" style={{ fontSize: '11px' }}>
                                Không có
                              </span>
                            )}
                          </CTableDataCell>

                          {/* Actions */}
                          <CTableDataCell className="text-center">
                            <div className="d-flex justify-content-center">
                              <button
                                onClick={() => handleEditClick(item.id)}
                                className="button-action mr-2 bg-info"
                                title="Xem chi tiết hồ sơ"
                              >
                                <CIcon icon={cilColorBorder} className="text-white" />
                              </button>
                              <button
                                onClick={() => {
                                  setVisible(true)
                                  setDeletedId(item.id)
                                }}
                                className="button-action bg-danger"
                                title="Xóa hồ sơ"
                              >
                                <CIcon icon={cilTrash} className="text-white" />
                              </button>
                            </div>
                          </CTableDataCell>
                        </CTableRow>
                      )
                    })}
                  </CTableBody>
                </CTable>
              </div>
            )}

            {/* PAGINATION FOOTER */}
            {candidateList.length > 0 && (
              <div className="card-footer bg-white border-top d-flex flex-wrap justify-content-between align-items-center gap-3 p-3">
                <div className="text-muted small">
                  Hiển thị <strong>{startItem}</strong> - <strong>{endItem}</strong> trên tổng số{' '}
                  <strong>{totalItems}</strong> hồ sơ ứng tuyển
                </div>
                <ReactPaginate
                  pageCount={totalPages}
                  forcePage={pageNumber - 1}
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
                  containerClassName={'pagination pagination-sm m-0'}
                  activeClassName={'active'}
                  previousLabel={'« Trước'}
                  nextLabel={'Sau »'}
                />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default CandidateCV
