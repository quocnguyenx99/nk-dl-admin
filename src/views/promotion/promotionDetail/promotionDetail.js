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
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import React, { useEffect, useState } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

import { Link, useNavigate } from 'react-router-dom'

import CIcon from '@coreui/icons-react'
import { cilTrash, cilColorBorder } from '@coreui/icons'

import axios from 'axios'
import moment from 'moment/moment'
import DeletedModal from '../../../components/deletedModal/DeletedModal'
import { axiosClient } from '../../../axiosConfig'
import { toast } from 'react-toastify'

function PromotionDetail() {
  const navigate = useNavigate()
  const [isCollapse, setIsCollapse] = useState(false)

  // check permission state
  const [isPermissionCheck, setIsPermissionCheck] = useState(true)

  const [dataGiftPromotion, setDataGiftPromotion] = useState([])
  const [countGiftPromotion, setCountGiftPromotion] = useState(null)

  const [isAllCheckbox, setIsAllCheckbox] = useState(false)
  const [selectedCheckbox, setSelectedCheckbox] = useState([])

  // show deleted Modal
  const [visible, setVisible] = useState(false)
  const [deletedId, setDeletedId] = useState(null)

  // search input
  const [dataSearch, setDataSearch] = useState('')

  //pagination state
  const [pageNumber, setPageNumber] = useState(1)

  // date picker
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
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
      const response = await axiosClient.delete(`admin/gift-promotion/${deletedId}`)
      if (response.data.status === true) {
        setVisible(false)
        fetchGiftPromotion()
      }

      if (response.data.status === false && response.data.mess == 'no permission') {
        toast.warn('Bạn không có quyền thực hiện tác vụ này!')
      }
    } catch (error) {
      console.error('Delete status order is error', error)
      toast.error('Đã xảy ra lỗi khi xóa. Vui lòng thử lại!')
    }
  }

  // search Data
  const handleSearch = (keyword) => {
    fetchDataById(keyword)
  }

  const handleEditClick = (id) => {
    navigate(`/promotion-detail/edit?id=${id}`)
  }

  // sorting columns
  const [sortConfig, setSortConfig] = React.useState({ key: '', direction: 'ascending' })

  const handleSort = (columnKey) => {
    let direction = 'ascending'
    if (sortConfig.key === columnKey && sortConfig.direction === 'ascending') {
      direction = 'descending'
    }
    setSortConfig({ key: columnKey, direction })
  }

  const convertStringToTimeStamp = (dateString) => {
    if (dateString == '') {
      return ''
    } else {
      const dateMoment = moment(dateString, 'ddd MMM DD YYYY HH:mm:ss GMTZ')
      return dateMoment.unix()
    }
  }

  const fetchGiftPromotion = async () => {
    try {
      const response = await axiosClient.get(
        `admin/gift-promotion?data=${dataSearch}&StartDate=${startDate !== null ? convertStringToTimeStamp(startDate) : ''}&EndDate=${endDate !== null ? convertStringToTimeStamp(endDate) : ''}`,
      )
      if (response.data.status === true) {
        setDataGiftPromotion(response.data.data)
        setCountGiftPromotion(response.data.data.length)
      }

      if (response.data.status === false && response.data.mess == 'no permission') {
        setIsPermissionCheck(false)
      }
    } catch (error) {
      console.error('Fetch coupon data is error', error)
    }
  }

  useEffect(() => {
    fetchGiftPromotion()
  }, [dataSearch, startDate, endDate])

  const handleDeleteAll = async () => {
    console.log('>>> check undeal', selectedCheckbox)
    // alert('Chức năng đang thực hiện...')
    try {
      const response = await axiosClient.post(`admin/delete-all-gift-promotion`, {
        data: selectedCheckbox,
      })
      if (response.data.status === true) {
        toast.success('Xóa tất cả thành công!')
        fetchGiftPromotion()
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
    { key: 'giftType', label: 'Áp dụng' },
    { key: 'startDate', label: 'Ngày bắt đầu' },
    { key: 'expire', label: 'Hết hạn' },
    { key: 'actions', label: 'Tác vụ' },
  ]

  const items = dataGiftPromotion?.map((item) => ({
    id: (
      <CFormCheck
        key={item?.id}
        aria-label="Default select example"
        defaultChecked={item?.id}
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
    releaseCode: <span className="blue-txt">{item.code}</span>,
    name: item.title,
    rangePrice: `${Number(item.priceMin).toLocaleString('vi-VN')}đ - ${Number(item.priceMax).toLocaleString('vi-VN')}đ`,

    giftType: item.type === 0 ? 'Áp dụng cho nghành hàng' : 'Áp dụng cho Mã SP chỉ định',
    startDate: moment.unix(Number(item.StartDate)).format('DD-MM-YYYY'),
    expire: moment.unix(Number(item.EndDate)).format('DD-MM-YYYY'),
    actions: (
      <div className="d-flex">
        <button onClick={() => handleEditClick(item.id)} className="button-action mr-2 bg-info">
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
              <h3>QUẢN LÝ KHUYẾN MÃI</h3>
            </CCol>
            <CCol md={{ span: 4, offset: 4 }}>
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
                <Link to={`/promotion-detail`}>
                  <CButton color="primary" type="submit" size="sm">
                    Danh sách
                  </CButton>
                </Link>
              </div>
            </CCol>
          </CRow>

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
                          />
                          <button onClick={handleSearch} className="submit-btn">
                            Submit
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                )}
              </table>
            </CCol>

            <CCol>
              <CCol md={12} className="mt-3">
                <CButton onClick={handleDeleteAll} color="primary" size="sm">
                  Xóa vĩnh viễn
                </CButton>
              </CCol>
              <CTable hover className="mt-3 border">
                <thead>
                  <tr>
                    {columns.map((column) => (
                      <CTableHeaderCell
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
            </CCol>
          </CRow>
        </>
      )}
    </div>
  )
}

export default PromotionDetail
