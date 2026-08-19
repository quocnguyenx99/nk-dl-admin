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
import { Link, useNavigate } from 'react-router-dom'
import ReactPaginate from 'react-paginate'
import { axiosClient, imageBaseUrl } from '../../axiosConfig'
import CIcon from '@coreui/icons-react'
import { cilColorBorder, cilTrash } from '@coreui/icons'
import moment from 'moment'
import DeletedModal from '../../components/deletedModal/DeletedModal'
import { toast } from 'react-toastify'
import Loading from '../../components/loading/Loading'

function HirePost() {
  const navigate = useNavigate()

  // check permission state
  const [isPermissionCheck, setIsPermissionCheck] = useState(true)

  // loading page
  const [isLoading, setIsLoading] = useState(false)

  // show deleted Modal
  const [visible, setVisible] = useState(false)
  const [deletedId, setDeletedId] = useState(null)

  // search input & filters
  const [dataSearch, setDataSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [selectedCate, setSelectedCate] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const [dataHirePost, setDataHirePost] = useState(null)
  const [dataHireCategory, setDataHireCategory] = useState([])
  const [summary, setSummary] = useState({
    total: 0,
    active: 0,
    expired: 0,
    candidates: 0,
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
      console.error('Fetch data hire category error', error)
    }
  }

  useEffect(() => {
    fetchHireCategory()
  }, [])

  const fetchDataHirePost = useCallback(async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      params.append('page', pageNumber)
      if (dataSearch) params.append('data', dataSearch)
      if (selectedCate) params.append('cat_id', selectedCate)
      if (statusFilter) params.append('status_filter', statusFilter)

      const response = await axiosClient.get(`admin/hire-post?${params.toString()}`)

      if (response.data.status === true) {
        setDataHirePost(response.data.data)
        if (response.data.summary) {
          setSummary(response.data.summary)
        }
      }

      if (response.data.status === false && response.data.mess === 'no permission') {
        setIsPermissionCheck(false)
      }
    } catch (error) {
      console.error('Fetch hire post data error', error)
    } finally {
      setIsLoading(false)
    }
  }, [pageNumber, dataSearch, selectedCate, statusFilter])

  useEffect(() => {
    fetchDataHirePost()
  }, [fetchDataHirePost])

  // Search submit
  const handleSearchSubmit = (e) => {
    e?.preventDefault()
    setPageNumber(1)
    setDataSearch(searchInput)
  }

  // Reset filters
  const handleResetFilters = () => {
    setSearchInput('')
    setDataSearch('')
    setSelectedCate('')
    setStatusFilter('')
    setPageNumber(1)
  }

  const handleAddNewClick = () => {
    navigate('/hire/post/add')
  }

  const handleEditClick = (id) => {
    navigate(`/hire/post/edit?id=${id}`)
  }

  // Toggle Display Status (Website Visibility)
  const handleToggleDisplay = async (id) => {
    try {
      const response = await axiosClient.patch(`admin/hire-post/${id}/toggle-display`)
      if (response.data.status === true) {
        toast.success(
          response.data.display === 1
            ? 'Đã bật hiển thị bài đăng trên website!'
            : 'Đã ẩn bài đăng khỏi website!',
        )
        // Update local state smoothly
        setDataHirePost((prev) => {
          if (!prev || !prev.data) return prev
          return {
            ...prev,
            data: prev.data.map((item) =>
              item.id === id ? { ...item, display: response.data.display } : item,
            ),
          }
        })
      }
    } catch (error) {
      console.error('Toggle display error', error)
      toast.error('Không thể cập nhật trạng thái hiển thị!')
    }
  }

  // Delete single row
  const handleDelete = async () => {
    try {
      const response = await axiosClient.delete(`admin/hire-post/${deletedId}`)
      if (response.data.status === true) {
        setVisible(false)
        toast.success('Xóa bài đăng tuyển dụng thành công!')
        fetchDataHirePost()
      }
      if (response.data.status === false && response.data.mess === 'no permission') {
        toast.warn('Bạn không có quyền thực hiện tác vụ này!')
      }
    } catch (error) {
      console.error('Delete hire post error', error)
      toast.error('Đã xảy ra lỗi khi xóa. Vui lòng thử lại!')
    }
  }

  // Delete batch rows
  const handleDeleteSelectedCheckbox = async () => {
    if (!selectedCheckbox.length) return
    if (
      !window.confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn ${selectedCheckbox.length} mục đã chọn?`)
    ) {
      return
    }
    try {
      const response = await axiosClient.post('admin/delete-all-hire-post', {
        data: selectedCheckbox,
      })

      if (response.data.status === true) {
        toast.success(`Đã xóa ${selectedCheckbox.length} mục thành công!`)
        fetchDataHirePost()
        setSelectedCheckbox([])
        setIsAllCheckbox(false)
      }
    } catch (error) {
      console.error('Delete selected checkbox error', error)
      toast.error('Xóa thất bại, vui lòng thử lại!')
    }
  }

  // Helper function for deadline status badge
  const getDeadlineBadge = (deadlineStr) => {
    if (!deadlineStr) {
      return (
        <span className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25 px-2 py-1">
          Không giới hạn
        </span>
      )
    }

    const now = moment().startOf('day')
    const deadline = moment(deadlineStr).startOf('day')
    const diffDays = deadline.diff(now, 'days')

    if (diffDays < 0) {
      return (
        <span
          className="badge px-2 py-1"
          style={{
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            border: '1px solid #fca5a5',
            fontSize: '11px',
          }}
        >
          Đã hết hạn ({Math.abs(diffDays)} ngày trước)
        </span>
      )
    } else if (diffDays === 0) {
      return (
        <span
          className="badge px-2 py-1"
          style={{
            backgroundColor: '#fef3c7',
            color: '#d97706',
            border: '1px solid #fcd34d',
            fontSize: '11px',
          }}
        >
          Hết hạn hôm nay
        </span>
      )
    } else if (diffDays <= 3) {
      return (
        <span
          className="badge px-2 py-1"
          style={{
            backgroundColor: '#fef9c3',
            color: '#ca8a04',
            border: '1px solid #fde047',
            fontSize: '11px',
          }}
        >
          Còn {diffDays} ngày
        </span>
      )
    } else {
      return (
        <span
          className="badge px-2 py-1"
          style={{
            backgroundColor: '#dcfce7',
            color: '#16a34a',
            border: '1px solid #86efac',
            fontSize: '11px',
          }}
        >
          Đang tuyển (Còn {diffDays} ngày)
        </span>
      )
    }
  }

  const formatImage = (img) => {
    if (!img) return null
    if (img.startsWith('http')) return img
    return `${imageBaseUrl}${img}`
  }

  const postsList = dataHirePost?.data || []
  const totalPosts = dataHirePost?.total || 0
  const perPage = dataHirePost?.per_page || 10
  const totalPages = Math.ceil(totalPosts / perPage) || 1
  const startItem = totalPosts === 0 ? 0 : (pageNumber - 1) * perPage + 1
  const endItem = Math.min(pageNumber * perPage, totalPosts)

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
              <h3 className="fw-bold text-uppercase text-dark m-0">QUẢN LÝ BÀI ĐĂNG TUYỂN DỤNG</h3>
              <p className="text-muted text-xs m-0 mt-1">
                Theo dõi các vị trí tuyển dụng, hạn nộp hồ sơ và ứng viên ứng tuyển
              </p>
            </div>
            <div className="d-flex flex-wrap gap-2">
              <Link to="/hire/category">
                <CButton color="light" size="sm" className="border fw-semibold shadow-xs">
                  Danh mục tuyển dụng
                </CButton>
              </Link>
              <Link to="/hire/candidate-cv">
                <CButton
                  color="light"
                  size="sm"
                  className="border fw-semibold shadow-xs position-relative"
                >
                  Hồ sơ ứng tuyển (CV)
                  {summary.candidates > 0 && (
                    <span className="badge bg-primary rounded-pill ms-1.5">
                      {summary.candidates}
                    </span>
                  )}
                </CButton>
              </Link>
              <CButton
                onClick={handleAddNewClick}
                color="primary"
                size="sm"
                className="fw-bold shadow-xs px-3"
              >
                + Đăng tin tuyển dụng mới
              </CButton>
            </div>
          </div>

          {/* KPI STATISTICS CARDS */}
          <div className="row g-3 mb-4">
            <div className="col-6 col-md-3">
              <div
                className="card border-0 shadow-sm rounded-3 p-3 bg-white cursor-pointer h-100 d-flex flex-column justify-content-between"
                onClick={handleResetFilters}
                style={{
                  borderLeft: '4px solid #2563eb',
                  minHeight: '82px',
                }}
              >
                <div
                  className="fw-bold text-truncate"
                  style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.2' }}
                >
                  Tổng bài đăng
                </div>
                <div
                  className="fw-bold mt-2"
                  style={{ fontSize: '24px', lineHeight: '1', color: '#1e293b' }}
                >
                  {summary.total || totalPosts}
                </div>
              </div>
            </div>

            <div className="col-6 col-md-3">
              <div
                className="card border-0 shadow-sm rounded-3 p-3 bg-white cursor-pointer h-100 d-flex flex-column justify-content-between"
                onClick={() => {
                  setStatusFilter('active')
                  setPageNumber(1)
                }}
                style={{
                  borderLeft: '4px solid #16a34a',
                  minHeight: '82px',
                }}
              >
                <div
                  className="fw-bold text-truncate"
                  style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.2' }}
                >
                  Đang tuyển dụng
                </div>
                <div
                  className="fw-bold mt-2"
                  style={{ fontSize: '24px', lineHeight: '1', color: '#16a34a' }}
                >
                  {summary.active || 0}
                </div>
              </div>
            </div>

            <div className="col-6 col-md-3">
              <div
                className="card border-0 shadow-sm rounded-3 p-3 bg-white cursor-pointer h-100 d-flex flex-column justify-content-between"
                onClick={() => {
                  setStatusFilter('expired')
                  setPageNumber(1)
                }}
                style={{
                  borderLeft: '4px solid #dc2626',
                  minHeight: '82px',
                }}
              >
                <div
                  className="fw-bold text-truncate"
                  style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.2' }}
                >
                  Đã hết hạn
                </div>
                <div
                  className="fw-bold mt-2"
                  style={{ fontSize: '24px', lineHeight: '1', color: '#dc2626' }}
                >
                  {summary.expired || 0}
                </div>
              </div>
            </div>

            <div className="col-6 col-md-3">
              <div
                className="card border-0 shadow-sm rounded-3 p-3 bg-white cursor-pointer h-100 d-flex flex-column justify-content-between"
                onClick={() => navigate('/hire/candidate-cv')}
                style={{
                  borderLeft: '4px solid #7c3aed',
                  minHeight: '82px',
                }}
              >
                <div
                  className="fw-bold text-truncate"
                  style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.2' }}
                >
                  Hồ sơ ứng viên
                </div>
                <div
                  className="fw-bold mt-2"
                  style={{ fontSize: '24px', lineHeight: '1', color: '#7c3aed' }}
                >
                  {summary.candidates || 0}
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
                      placeholder="Tìm kiếm vị trí tuyển dụng..."
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
                    <option value="">Tất cả trạng thái hạn nộp</option>
                    <option value="active">Đang tuyển (Còn hạn)</option>
                    <option value="expired">Đã hết hạn nộp</option>
                  </CFormSelect>
                </div>

                <div className="col-12 col-md-2 d-flex gap-2">
                  <CButton type="submit" color="primary" className="w-100 fw-semibold shadow-xs">
                    Tìm kiếm
                  </CButton>
                  {(dataSearch || selectedCate || statusFilter || searchInput) && (
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
                  Đã chọn {selectedCheckbox.length} bài đăng tuyển dụng
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
            ) : postsList.length === 0 ? (
              <div className="p-5 text-center text-muted">
                <h6 className="fw-bold text-dark">Không tìm thấy bài đăng tuyển dụng nào</h6>
                <p className="small text-muted mb-3">
                  Thử thay đổi từ khóa tìm kiếm hoặc bấm thêm bài đăng mới
                </p>
                <CButton color="primary" size="sm" onClick={handleAddNewClick} className="fw-bold">
                  + Thêm bài tuyển dụng mới
                </CButton>
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
                            postsList.length > 0 &&
                            postsList.every((item) => selectedCheckbox.includes(item.id))
                          }
                          onChange={(e) => {
                            const isChecked = e.target.checked
                            setIsAllCheckbox(isChecked)
                            if (isChecked) {
                              setSelectedCheckbox(postsList.map((item) => item.id))
                            } else {
                              setSelectedCheckbox([])
                            }
                          }}
                        />
                      </CTableHeaderCell>
                      <CTableHeaderCell style={{ minWidth: '260px' }}>
                        Vị trí tuyển dụng
                      </CTableHeaderCell>
                      <CTableHeaderCell style={{ minWidth: '150px' }}>
                        Danh mục / Ban
                      </CTableHeaderCell>
                      <CTableHeaderCell style={{ minWidth: '140px' }}>
                        Mức lương & Số lượng
                      </CTableHeaderCell>
                      <CTableHeaderCell style={{ minWidth: '170px' }}>
                        Hạn nộp & Trạng thái
                      </CTableHeaderCell>
                      <CTableHeaderCell style={{ minWidth: '100px' }} className="text-center">
                        Hồ sơ (CV)
                      </CTableHeaderCell>
                      <CTableHeaderCell style={{ minWidth: '110px' }} className="text-center">
                        Hiển thị web
                      </CTableHeaderCell>
                      <CTableHeaderCell style={{ minWidth: '100px' }} className="text-center">
                        Tác vụ
                      </CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {postsList.map((item) => {
                      const isSelected = selectedCheckbox.includes(item.id)
                      const jobImg = formatImage(item.image)

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

                          {/* Vị trí tuyển dụng & Sub-info */}
                          <CTableDataCell>
                            <div className="d-flex align-items-center gap-3">
                              {jobImg ? (
                                <img
                                  src={jobImg}
                                  alt={item.name}
                                  className="rounded-2 border object-fit-contain flex-shrink-0 bg-white p-1 me-2"
                                  style={{ width: '42px', height: '42px' }}
                                />
                              ) : (
                                <div
                                  className="rounded-2 bg-light border d-flex align-items-center justify-content-center flex-shrink-0 text-secondary fw-bold me-2"
                                  style={{ width: '42px', height: '42px', fontSize: '13px' }}
                                >
                                  {item.name ? item.name.charAt(0).toUpperCase() : 'NK'}
                                </div>
                              )}
                              <div className="overflow-hidden">
                                <div
                                  className="fw-bold text-dark cursor-pointer text-truncate mb-0.5"
                                  style={{ fontSize: '13.5px' }}
                                  title={item.name}
                                  onClick={() => handleEditClick(item.id)}
                                >
                                  {item.name}
                                </div>
                                <div
                                  className="d-flex flex-wrap align-items-center gap-1.5 text-muted"
                                  style={{ fontSize: '11px' }}
                                >
                                  {item.rank && (
                                    <span className="badge bg-light text-secondary border px-1.5 py-0.5">
                                      {item.rank}
                                    </span>
                                  )}
                                  {item.form && (
                                    <span className="badge bg-light text-secondary border px-1.5 py-0.5">
                                      {item.form}
                                    </span>
                                  )}
                                  {item.degree && (
                                    <span className="badge bg-light text-muted px-1.5 py-0.5">
                                      {item.degree}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CTableDataCell>

                          {/* Danh mục */}
                          <CTableDataCell>
                            <span
                              className="badge px-2 py-1 rounded-pill"
                              style={{
                                backgroundColor: '#eff6ff',
                                color: '#1d4ed8',
                                border: '1px solid #bfdbfe',
                                fontSize: '11.5px',
                              }}
                            >
                              {item.hire_category?.title || 'Chưa phân loại'}
                            </span>
                            {item.department && (
                              <div className="text-muted mt-1" style={{ fontSize: '11px' }}>
                                Phòng: {item.department}
                              </div>
                            )}
                          </CTableDataCell>

                          {/* Mức lương & Số lượng */}
                          <CTableDataCell>
                            <div className="fw-bold text-success" style={{ fontSize: '12.5px' }}>
                              {item.salary || 'Thỏa thuận'}
                            </div>
                            <div className="text-muted mt-0.5" style={{ fontSize: '11px' }}>
                              Tuyển:{' '}
                              <strong>
                                {item.number ? `${item.number} người` : 'Không giới hạn'}
                              </strong>
                            </div>
                            {item.address && (
                              <div
                                className="text-muted text-truncate"
                                style={{ fontSize: '10.5px', maxWidth: '160px' }}
                                title={item.address}
                              >
                                {item.address}
                              </div>
                            )}
                          </CTableDataCell>

                          {/* Hạn nộp & Badge trạng thái */}
                          <CTableDataCell>
                            <div
                              className="fw-semibold text-dark mb-1"
                              style={{ fontSize: '12px' }}
                            >
                              {item.deadline
                                ? moment(item.deadline).format('DD/MM/YYYY')
                                : 'Vô thời hạn'}
                            </div>
                            <div>{getDeadlineBadge(item.deadline)}</div>
                          </CTableDataCell>

                          {/* Hồ sơ ứng tuyển (CV) */}
                          <CTableDataCell className="text-center">
                            <Link
                              to={`/hire/candidate-cv?post_id=${item.id}`}
                              className="btn btn-sm btn-light border position-relative py-1 px-2.5 shadow-2xs"
                              style={{ fontSize: '11.5px' }}
                              title="Xem danh sách ứng viên nộp bài này"
                            >
                              <span className="fw-bold text-primary">
                                {item.candidates_count !== undefined ? item.candidates_count : 0}
                              </span>{' '}
                              hồ sơ
                            </Link>
                          </CTableDataCell>

                          {/* Hiển thị Website */}
                          <CTableDataCell className="text-center">
                            <button
                              type="button"
                              className={`btn btn-sm text-white fw-bold px-2.5 py-1 shadow-2xs border-0 ${
                                item.display === 1 ? 'bg-success' : 'bg-secondary'
                              }`}
                              style={{ fontSize: '11px', minWidth: '65px', borderRadius: '5px' }}
                              onClick={() => handleToggleDisplay(item.id)}
                              title="Nhấn để bật/tắt hiển thị trên website"
                            >
                              {item.display === 1 ? 'Hiển thị' : 'Đang ẩn'}
                            </button>
                          </CTableDataCell>

                          {/* Tác vụ */}
                          <CTableDataCell className="text-center">
                            <div className="d-flex justify-content-center">
                              <button
                                onClick={() => handleEditClick(item.id)}
                                className="button-action mr-2 bg-info"
                                title="Chỉnh sửa bài đăng"
                              >
                                <CIcon icon={cilColorBorder} className="text-white" />
                              </button>
                              <button
                                onClick={() => {
                                  setVisible(true)
                                  setDeletedId(item.id)
                                }}
                                className="button-action bg-danger"
                                title="Xóa bài đăng"
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
            {postsList.length > 0 && (
              <div className="card-footer bg-white border-top d-flex flex-wrap justify-content-between align-items-center gap-3 p-3">
                <div className="text-muted small">
                  Hiển thị <strong>{startItem}</strong> - <strong>{endItem}</strong> trên tổng số{' '}
                  <strong>{totalPosts}</strong> bài đăng tuyển dụng
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

export default HirePost
