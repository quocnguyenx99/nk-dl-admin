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
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

import { Link, useNavigate, useSearchParams } from 'react-router-dom'

import CIcon from '@coreui/icons-react'
import { cilTrash, cilColorBorder } from '@coreui/icons'

import './css/coupon.css'
import axios from 'axios'
import moment from 'moment/moment'
import ReactPaginate from 'react-paginate'
import { convertStringToTimeStamp } from '../../helper/utils'
import { axiosClient } from '../../axiosConfig'
import vi from 'date-fns/locale/vi'
import { getYear, getMonth } from 'date-fns'

function Coupon() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  //pagination state
  const pageFromUrl = parseInt(searchParams.get('page')) || 1
  const [pageNumber, setPageNumber] = useState(pageFromUrl)

  useEffect(() => {
    setSearchParams({ page: pageNumber })
  }, [pageNumber, setSearchParams])

  const [isCollapse, setIsCollapse] = useState(false)

  // check permission state
  const [isPermissionCheck, setIsPermissionCheck] = useState(true)

  const [dataCoupon, setDataCoupon] = useState([])
  const [countCoupon, setCountCoupon] = useState(null)

  const [selectedCheckbox, setSelectedCheckbox] = useState([])

  // search input
  const [dataSearch, setDataSearch] = useState('')

  // date picker
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [errors, setErrors] = useState({ startDate: '', endDate: '' })

  const handleToggleCollapse = () => {
    setIsCollapse((prevState) => !prevState)
  }

  const handleAddNewClick = () => {
    navigate('/coupon/add')
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
    setPageNumber(newPage)
    window.scrollTo(0, 0)
  }

  // search Data
  const handleSearch = (keyword) => {
    fetchDataCoupon(keyword)
  }

  const handleEditClick = (id) => {
    navigate(`/coupon/edit?id=${id}`)
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

  const fetchDataCoupon = async (dataSearch) => {
    try {
      const response = await axiosClient.get(
        `admin/coupon?data=${dataSearch}&StartCouponDate=${startDate !== null ? convertStringToTimeStamp(startDate) : ''}&EndCouponDate=${endDate !== null ? convertStringToTimeStamp(endDate) : ''}&page=${pageNumber}`,
      )
      setDataCoupon(response.data.listCoupon)
      setCountCoupon(response.data.countCoupon)

      if (response.data.status === false && response.data.mess == 'no permission') {
        setIsPermissionCheck(false)
      }
    } catch (error) {
      console.error('Fetch coupon data is error', error)
    }
  }

  useEffect(() => {
    fetchDataCoupon()
  }, [startDate, endDate, pageNumber])

  const columns = [
    { key: 'releaseCode', label: 'Mã đợt phát hành' },
    { key: 'release', label: 'Đợt phát hành' },
    { key: 'createAt', label: 'Ngày tạo' },
    { key: 'startDate', label: 'Ngày bắt đầu' },
    { key: 'expire', label: 'Hết hạn' },
    { key: 'sumOfCoupon', label: 'Tổng số ' },
    // { key: 'used', label: 'Đã dùng' },
    { key: 'status', label: 'Trạng thái' },
    { key: 'actions', label: 'Tác vụ' },
  ]

  const items = dataCoupon
    ? dataCoupon?.map((item) => ({
        releaseCode: <span className="blue-txt">{item.MaPhatHanh}</span>,
        release: item.couponName,
        createAt: moment.unix(Number(item.DateCreateCoupon)).format('DD-MM-YYYY'),
        startDate: moment.unix(Number(item.StartCouponDate)).format('DD-MM-YYYY'),
        expire: moment.unix(Number(item.EndCouponDate)).format('DD-MM-YYYY'),
        sumOfCoupon: <span className="orange-txt">{item.SoLuongMa}</span>,
        // used: '4',
        status: (
          <span
            style={{
              color: item.status === 2 ? 'red' : 'green',
            }}
          >
            {item.status === 2 ? 'Ngừng phát hành' : 'Đang phát hành'}
          </span>
        ),
        actions: (
          <div>
            <button onClick={() => handleEditClick(item.id)} className="button-action mr-2 bg-info">
              <CIcon icon={cilColorBorder} className="text-white" />
            </button>
          </div>
        ),
        _cellProps: { id: { scope: 'row' } },
      }))
    : []

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

  const years = React.useMemo(() => {
    const end = getYear(new Date())
    return Array.from({ length: end - 1990 + 1 }, (_, i) => 1990 + i)
  }, [])
  const months = React.useMemo(
    () => [
      'Tháng 1',
      'Tháng 2',
      'Tháng 3',
      'Tháng 4',
      'Tháng 5',
      'Tháng 6',
      'Tháng 7',
      'Tháng 8',
      'Tháng 9',
      'Tháng 10',
      'Tháng 11',
      'Tháng 12',
    ],
    [],
  )

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
          <CRow className="mb-3">
            <CCol>
              <h2>QUẢN LÝ COUPON</h2>
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
                <Link to={`/coupon`}>
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
                      <td className="total-count">{countCoupon}</td>
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
                            locale="vi"
                            renderCustomHeader={(props) => {
                              const {
                                date,
                                changeYear,
                                changeMonth,
                                decreaseMonth,
                                increaseMonth,
                                prevMonthButtonDisabled,
                                nextMonthButtonDisabled,
                              } = props

                              return (
                                <div
                                  style={{
                                    margin: 10,
                                    display: 'flex',
                                    justifyContent: 'center',
                                    gap: 8,
                                    alignItems: 'center',
                                  }}
                                >
                                  <button
                                    onClick={decreaseMonth}
                                    disabled={prevMonthButtonDisabled}
                                    type="button"
                                    className="react-datepicker__navigation react-datepicker__navigation--previous"
                                  >
                                    {'<'}
                                  </button>
                                  <select
                                    value={getYear(date)}
                                    onChange={({ target: { value } }) =>
                                      changeYear(parseInt(value, 10))
                                    }
                                  >
                                    {years.map((option) => (
                                      <option key={option} value={option}>
                                        {option}
                                      </option>
                                    ))}
                                  </select>
                                  <select
                                    value={months[getMonth(date)]}
                                    onChange={({ target: { value } }) =>
                                      changeMonth(months.indexOf(value))
                                    }
                                  >
                                    {months.map((option) => (
                                      <option key={option} value={option}>
                                        {option}
                                      </option>
                                    ))}
                                  </select>
                                  <button
                                    onClick={increaseMonth}
                                    disabled={nextMonthButtonDisabled}
                                    type="button"
                                    className="react-datepicker__navigation react-datepicker__navigation--next"
                                  >
                                    {'>'}
                                  </button>
                                </div>
                              )
                            }}
                          />
                          <p className="datepicker-label">{'đến ngày'}</p>
                          <DatePicker
                            className="custom-datepicker"
                            showIcon
                            dateFormat={'dd-MM-yyyy'}
                            selected={endDate}
                            onChange={handleEndDateChange}
                            locale="vi"
                            renderCustomHeader={(props) => {
                              const {
                                date,
                                changeYear,
                                changeMonth,
                                decreaseMonth,
                                increaseMonth,
                                prevMonthButtonDisabled,
                                nextMonthButtonDisabled,
                              } = props

                              return (
                                <div
                                  style={{
                                    margin: 10,
                                    display: 'flex',
                                    justifyContent: 'center',
                                    gap: 8,
                                    alignItems: 'center',
                                  }}
                                >
                                  <button
                                    onClick={decreaseMonth}
                                    disabled={prevMonthButtonDisabled}
                                    type="button"
                                    className="react-datepicker__navigation react-datepicker__navigation--previous"
                                  >
                                    {'<'}
                                  </button>
                                  <select
                                    value={getYear(date)}
                                    onChange={({ target: { value } }) =>
                                      changeYear(parseInt(value, 10))
                                    }
                                  >
                                    {years.map((option) => (
                                      <option key={option} value={option}>
                                        {option}
                                      </option>
                                    ))}
                                  </select>
                                  <select
                                    value={months[getMonth(date)]}
                                    onChange={({ target: { value } }) =>
                                      changeMonth(months.indexOf(value))
                                    }
                                  >
                                    {months.map((option) => (
                                      <option key={option} value={option}>
                                        {option}
                                      </option>
                                    ))}
                                  </select>
                                  <button
                                    onClick={increaseMonth}
                                    disabled={nextMonthButtonDisabled}
                                    type="button"
                                    className="react-datepicker__navigation react-datepicker__navigation--next"
                                  >
                                    {'>'}
                                  </button>
                                </div>
                              )
                            }}
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
                          <button onClick={() => handleSearch(dataSearch)} className="submit-btn">
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

              <div className="d-flex justify-content-end">
                <ReactPaginate
                  pageCount={Math.ceil(countCoupon / 10)}
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
            </CCol>
          </CRow>
        </>
      )}
    </div>
  )
}

export default Coupon
