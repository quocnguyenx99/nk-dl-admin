import {
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CFormCheck,
  CFormInput,
  CFormSelect,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import React, { useEffect, useState } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

import { Link, useNavigate } from 'react-router-dom'
import CIcon from '@coreui/icons-react'
import { cilTrash, cilColorBorder, cilPlus } from '@coreui/icons'
import moment from 'moment/moment'

import DeletedModal from '../../../components/deletedModal/DeletedModal'
import { axiosClient } from '../../../axiosConfig'
import { toast } from 'react-toastify'

function PromotionDetail() {
  const navigate = useNavigate()
  const [isCollapse, setIsCollapse] = useState(false)
  const [isPermissionCheck, setIsPermissionCheck] = useState(true)

  const [dataGiftPromotion, setDataGiftPromotion] = useState([])
  const [countGiftPromotion, setCountGiftPromotion] = useState(0)

  const [isAllCheckbox, setIsAllCheckbox] = useState(false)
  const [selectedCheckbox, setSelectedCheckbox] = useState([])

  // show deleted Modal
  const [visible, setVisible] = useState(false)
  const [deletedId, setDeletedId] = useState(null)

  // search input
  const [dataSearch, setDataSearch] = useState('')

  // date picker
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)
  const [errors, setErrors] = useState({ startDate: '', endDate: '' })

  const handleToggleCollapse = () => {
    setIsCollapse((prevState) => !prevState)
  }

  const handleAddNewClick = () => {
    navigate('/promotion-detail/add')
  }

  // validate for date start - date end
  const validateDates = (start, end) => {
    const newErrors = { startDate: '', endDate: '' }
    if (start && end && start > end) {
      newErrors.startDate = 'Ngày bắt đầu không được sau ngày kết thúc'
      newErrors.endDate = 'Ngày kết thúc không được trước ngày bắt đầu'
    }
    setErrors(newErrors)
  }

  const handleStartDateChange = (date) => {
    setStartDate(date)
    validateDates(date, endDate)
  }

  const handleEndDateChange = (date) => {
    setEndDate(date)
    validateDates(startDate, date)
  }

  // delete row
  const handleDelete = async () => {
    setVisible(true)
    try {
      const response = await axiosClient.delete(`admin/gift-promotion/${deletedId}`)
      if (response.data.status === true) {
        setVisible(false)
        fetchGiftPromotion()
        toast.success('Xóa chương trình khuyến mãi thành công!')
      }

      if (response.data.status === false && response.data.mess === 'no permission') {
        toast.warn('Bạn không có quyền thực hiện tác vụ này!')
      }
    } catch (error) {
      console.error('Delete promotion error', error)
      toast.error('Đã xảy ra lỗi khi xóa. Vui lòng thử lại!')
    }
  }

  const handleSearch = () => {
    fetchGiftPromotion()
  }

  const handleResetFilter = () => {
    setDataSearch('')
    setStartDate(null)
    setEndDate(null)
  }

  const handleEditClick = (id) => {
    navigate(`/promotion-detail/edit?id=${id}`)
  }

  // sorting columns
  const [sortConfig, setSortConfig] = useState({ key: '', direction: 'ascending' })

  const handleSort = (columnKey) => {
    let direction = 'ascending'
    if (sortConfig.key === columnKey && sortConfig.direction === 'ascending') {
      direction = 'descending'
    }
    setSortConfig({ key: columnKey, direction })
  }

  const convertStringToTimeStamp = (dateObj) => {
    if (!dateObj) return ''
    return moment(dateObj).unix()
  }

  const fetchGiftPromotion = async () => {
    try {
      let queryUrl = `admin/gift-promotion?data=${dataSearch || ''}`
      if (startDate && endDate) {
        const startTs = moment(startDate).startOf('day').unix()
        const endTs = moment(endDate).endOf('day').unix()
        queryUrl += `&StartDate=${startTs}&EndDate=${endTs}`
      }
      const response = await axiosClient.get(queryUrl)
      if (response.data.status === true) {
        setDataGiftPromotion(response.data.data || [])
        setCountGiftPromotion(response.data.data ? response.data.data.length : 0)
      }

      if (response.data.status === false && response.data.mess === 'no permission') {
        setIsPermissionCheck(false)
      }
    } catch (error) {
      console.error('Fetch gift promotion error', error)
    }
  }

  useEffect(() => {
    fetchGiftPromotion()
  }, [])

  const handleDeleteAll = async () => {
    if (selectedCheckbox.length === 0) {
      toast.warn('Vui lòng chọn ít nhất 1 khuyến mãi để xóa!')
      return
    }
    try {
      const response = await axiosClient.post(`admin/delete-all-gift-promotion`, {
        data: selectedCheckbox,
      })
      if (response.data.status === true) {
        toast.success('Xóa tất cả đợt khuyến mãi thành công!')
        fetchGiftPromotion()
        setSelectedCheckbox([])
      }

      if (response.data.status === false && response.data.mess === 'no permission') {
        toast.warn('Bạn không có quyền thực hiện tác vụ này!')
      }
    } catch (error) {
      toast.error('Đã xảy ra lỗi. Vui lòng thử lại!')
    }
  }

  const formatDate = (ts) => {
    if (!ts || Number(ts) <= 0) return '---'
    const m = moment.unix(Number(ts))
    return m.isValid() && m.year() >= 1980 ? m.format('DD-MM-YYYY') : '---'
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
              const allIds = dataGiftPromotion?.map((item) => item.id) || []
              setSelectedCheckbox(allIds)
            } else {
              setSelectedCheckbox([])
            }
          }}
        />
      ),
    },
    { key: 'releaseCode', label: 'Mã đợt phát hành' },
    { key: 'name', label: 'Đợt phát hành' },
    { key: 'rangePrice', label: 'Phân khúc giá' },
    { key: 'giftType', label: 'Đối tượng áp dụng' },
    { key: 'startDate', label: 'Ngày bắt đầu' },
    { key: 'expire', label: 'Hết hạn' },
    { key: 'actions', label: 'Tác vụ' },
  ]

  const items = dataGiftPromotion?.map((item) => ({
    id: (
      <CFormCheck
        key={item?.id}
        aria-label="Select item"
        id={`flexCheckDefault_${item?.id}`}
        checked={selectedCheckbox.includes(item?.id)}
        value={item.id}
        onChange={(e) => {
          const detailId = item.id
          const isChecked = e.target.checked
          if (isChecked) {
            setSelectedCheckbox([...selectedCheckbox, detailId])
          } else {
            setSelectedCheckbox(selectedCheckbox.filter((id) => id !== detailId))
          }
        }}
      />
    ),
    releaseCode: (
      <span className="badge bg-light text-primary border border-primary px-2 py-1 fs-6">
        {item.code}
      </span>
    ),
    name: <div className="fw-semibold text-dark">{item.title}</div>,
    rangePrice: (
      <span className="fw-bold text-danger">
        {Number(item.priceMin).toLocaleString('vi-VN')}đ -{' '}
        {Number(item.priceMax).toLocaleString('vi-VN')}đ
      </span>
    ),
    giftType: (
      <CBadge color={item.type === 0 ? 'info' : 'primary'} className="px-2 py-1 fs-6">
        {item.type === 0 ? 'Ngành hàng' : 'Mã SP chỉ định'}
      </CBadge>
    ),
    startDate: formatDate(item.StartDate),
    expire: formatDate(item.EndDate),
    actions: (
      <div className="d-flex gap-1">
        <CButton
          size="sm"
          color="info"
          className="text-white p-1"
          onClick={() => handleEditClick(item.id)}
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
            setDeletedId(item.id)
          }}
          title="Xóa"
        >
          <CIcon icon={cilTrash} />
        </CButton>
      </div>
    ),
    _cellProps: { id: { scope: 'row' } },
  }))

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
              <h4 className="fw-bold text-dark mb-1">QUẢN LÝ KHUYẾN MÃI & QUÀ TẶNG</h4>
              <p className="text-muted small mb-0">
                Quản lý các đợt phát hành chương trình khuyến mãi, quà tặng theo phân khúc giá và
                danh mục
              </p>
            </div>
            <div>
              <CButton
                color="primary"
                className="fw-semibold d-flex align-items-center gap-1 shadow-xs"
                onClick={handleAddNewClick}
              >
                <CIcon icon={cilPlus} /> Thêm mới khuyến mãi
              </CButton>
            </div>
          </div>

          <CRow>
            <CCol md={12}>
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
                      <td className="total-count">{countGiftPromotion}</td>
                    </tr>

                    <tr>
                      <td>Tạo từ ngày</td>
                      <td>
                        <div className="custom-datepicker-wrapper">
                          <DatePicker
                            className="custom-datepicker"
                            showIcon
                            dateFormat={'dd-MM-yyyy'}
                            selected={startDate}
                            onChange={handleStartDateChange}
                          />
                          <p className="datepicker-label">{'đến ngày'}</p>
                          <DatePicker
                            className="custom-datepicker"
                            showIcon
                            dateFormat={'dd-MM-yyyy'}
                            selected={endDate}
                            onChange={handleEndDateChange}
                          />
                        </div>
                        {errors.startDate && <p className="text-danger">{errors.startDate}</p>}
                        {errors.endDate && <p className="text-danger">{errors.endDate}</p>}
                      </td>
                    </tr>
                    <tr>
                      <td>Tìm kiếm</td>
                      <td>
                        <CFormSelect
                          className="component-size w-25"
                          aria-label="Chọn yêu cầu lọc"
                          options={[{ label: 'Mã đợt phát hành', value: '1' }]}
                        />
                        <div className="mt-2">
                          <input
                            type="text"
                            className="search-input"
                            value={dataSearch}
                            onChange={(e) => setDataSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                          />
                          <button onClick={handleSearch} className="submit-btn ms-2">
                            Submit
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                )}
              </table>
            </CCol>
          </CRow>

          {/* Action Row */}
          <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
            <CButton onClick={handleDeleteAll} color="danger" size="sm" className="fw-semibold">
              Xóa vĩnh viễn ({selectedCheckbox.length})
            </CButton>
          </div>

          {/* Table */}
          <CCard className="mb-4 shadow-xs border">
            <CCardBody className="p-0">
              <CTable hover responsive className="mb-0 align-middle">
                <thead>
                  <tr>
                    {columns.map((column) => (
                      <CTableHeaderCell
                        key={column.key}
                        onClick={() => handleSort(column.key)}
                        className="prevent-select bg-light"
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
            </CCardBody>
          </CCard>
        </>
      )}
    </div>
  )
}

export default PromotionDetail
