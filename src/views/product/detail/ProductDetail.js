import {
  CButton,
  CCol,
  CContainer,
  CFormCheck,
  CFormSelect,
  CImage,
  CRow,
  CSpinner,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

import DatePicker, { registerLocale } from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import vi from 'date-fns/locale/vi'
import { getYear, getMonth } from 'date-fns'
registerLocale('vi', vi)

import CIcon from '@coreui/icons-react'
import { cilTrash, cilColorBorder } from '@coreui/icons'
import ReactPaginate from 'react-paginate'
import moment from 'moment'

import './css/productDetail.css'
import DeletedModal from '../../../components/deletedModal/DeletedModal'
import { axiosClient, imageBaseUrl } from '../../../axiosConfig'
import { toast } from 'react-toastify'
import Loading from '../../../components/loading/Loading'
import useDebounce from '../../../helper/debounce'

function ProductDetail() {
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

  const [dataProductList, setDataProductList] = useState([])

  //loading button
  const [isLoading, setIsLoading] = useState(false)

  const [isLoadingButton, setIsLoadingButton] = useState({
    excelCategoryButton: false,
    excelAllButton: false,
  })

  // category
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('')

  // brand
  const [brands, setBrands] = useState([])
  const [selectedBrand, setSelectedBrand] = useState('')

  // status
  const [status, setStatus] = useState([])
  const [selectedStatus, setSelectedStatus] = useState('')

  // date picker
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [errors, setErrors] = useState({ startDate: '', endDate: '' })

  // Danh sách năm và tháng (tiếng Việt) cho custom header
  const years = useMemo(() => {
    const end = getYear(new Date())
    return Array.from({ length: end - 1990 + 1 }, (_, i) => 1990 + i)
  }, [])

  const months = useMemo(
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

  // selected checkbox
  const [isAllCheckbox, setIsAllCheckbox] = useState(false)
  const [selectedCheckbox, setSelectedCheckbox] = useState([])

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

  // show deleted Modal
  const [visible, setVisible] = useState(false)
  const [deletedId, setDeletedId] = useState(null)

  // toggel table
  const [isCollapse, setIsCollapse] = useState(false)

  // search input
  const [dataSearch, setDataSearch] = useState('')
  const debouncedSearch = useDebounce(dataSearch, 300) // Áp dụng debounce với 300ms

  const fetchData = async () => {
    try {
      const [categoriesResult, brandsResult, statusResult] = await Promise.allSettled([
        axiosClient.get('admin/category'),
        axiosClient.get('admin/brand?type=all'),
        axiosClient.get('admin/productStatus'),
      ])

      if (categoriesResult.status === 'fulfilled') {
        setCategories(categoriesResult.value.data.data)
      } else {
        console.error('Fetch categories data error', categoriesResult.reason)
      }

      if (brandsResult.status === 'fulfilled' && brandsResult.value.data.status === true) {
        setBrands(brandsResult.value.data.list)
      } else {
        console.error('Fetch brands data error', brandsResult.reason)
      }

      if (statusResult.status === 'fulfilled' && statusResult.value.data.status === 'success') {
        setStatus(statusResult.value.data.list.data)
      } else {
        console.error('Fetch status data error', statusResult.reason)
      }
    } catch (error) {
      console.error('Fetch data error', error)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const fetchProductData = async () => {
    try {
      setIsLoading(true)
      const response = await axiosClient.get(
        `admin/product?page=${pageNumber}&data=${dataSearch}&brand=${selectedBrand}&category=${selectedCategory}&status=${selectedStatus}`,
      )
      if (response.data.status === true) {
        setDataProductList(response.data.product)
      }

      if (response.data.status === false && response.data.mess == 'no permission') {
        setIsPermissionCheck(false)
      }
    } catch (error) {
      console.error('Fetch product data list is error', error.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProductData()
  }, [pageNumber, debouncedSearch, selectedBrand, selectedCategory, selectedStatus])

  const handleAddNewClick = () => {
    navigate('/product/add')
  }

  const handleUpdateClick = (id) => {
    navigate(`/product/edit?id=${id}&page=${pageNumber}`)
  }

  const handleToggleCollapse = () => {
    setIsCollapse((prevState) => !prevState)
  }

  // delete row
  const handleDelete = async () => {
    setVisible(true)
    try {
      const response = await axiosClient.delete(`admin/product/${deletedId}`)
      if (response.data.status === true) {
        setVisible(false)
        fetchProductData()
      }

      if (response.data.status === false && response.data.mess == 'no permission') {
        toast.warn('Bạn không có quyền thực hiện tác vụ này!')
      }
    } catch (error) {
      console.error('Delete product id is error', error)
      toast.error('Đã xảy ra lỗi khi xóa. Vui lòng thử lại!')
    }
  }

  // deleted all checkbox
  const handleDeleteSelectedCheckbox = async () => {
    try {
      const response = await axiosClient.post('admin/delete-all-product', {
        data: selectedCheckbox,
      })
      if (response.data.status === true) {
        toast.success('Xóa tất cả các mục thành công!')
        fetchDataInstruct()
        setSelectedCheckbox([])
      }
    } catch (error) {
      console.error('Deleted all id checkbox is error', error)
    }
  }

  const handleSearch = (keyword) => {
    fetchProductData(keyword)
  }

  // pagination data
  const handlePageChange = ({ selected }) => {
    const newPage = selected + 1
    setPageNumber(newPage)
    window.scrollTo(0, 0)
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

  const columns = [
    {
      key: 'id',
      label: (
        <>
          <CFormCheck
            style={{
              transform: 'scale(1.4)',
              accentColor: '#198754',
            }}
            aria-label="Select all"
            checked={isAllCheckbox}
            onChange={(e) => {
              const isChecked = e.target.checked
              setIsAllCheckbox(isChecked)
              if (isChecked) {
                const allIds = dataProductList?.data.map((item) => item.product_id) || []
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
    { key: 'title', label: 'Tiêu đề' },
    { key: 'image', label: 'Hình ảnh' },
    { key: 'price', label: 'Giá bán sỉ' },
    { key: 'marketPrice', label: 'Giá bán lẻ' },
    { key: 'status', label: 'Tình trạng' },
    { key: 'create_at', label: 'Ngày đồng bộ' },
    { key: 'update_at', label: 'Cập nhật' },
    { key: 'actions', label: 'Tác vụ' },
  ]

  const items =
    dataProductList?.data && dataProductList?.data.length > 0
      ? dataProductList?.data?.map((item) => ({
          id: (
            <CFormCheck
              style={{
                transform: 'scale(1.4)',
                accentColor: '#198754',
              }}
              key={item?.product_id}
              aria-label="Default select example"
              defaultChecked={item?.product_id}
              id={`flexCheckDefault_${item?.product_id}`}
              value={item?.product_id}
              checked={selectedCheckbox.includes(item?.product_id)}
              onChange={(e) => {
                const productId = item?.product_id
                const isChecked = e.target.checked
                if (isChecked) {
                  setSelectedCheckbox([...selectedCheckbox, productId])
                } else {
                  setSelectedCheckbox(selectedCheckbox.filter((id) => id !== productId))
                }
              }}
            />
          ),
          title: (
            <div
              style={{
                maxWidth: '400px',
              }}
            >
              <Link to={`/product/edit?id=${item?.product_id}`}>
                <p
                  className="blue-txt m-0"
                  style={{
                    wordWrap: 'break-word',
                    whiteSpace: 'normal',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                  title={item?.TenHH ? item?.product_desc?.title : item?.TenHH}
                >
                  {item?.TenHH ? item?.product_desc?.title : item?.TenHH}
                </p>
              </Link>
              <p
                style={{
                  fontWeight: 600,
                  color: '#444',
                }}
              >
                {item?.TenTrenWeb2 ? item?.TenTrenWeb2 : ''}
              </p>
              <p className="orange-txt">{`#${item?.MaHH ? item?.MaHH : item?.macn}`}</p>
            </div>
          ),
          image: (
            <CImage
              className="d-flex justify-content-center align-items-center"
              width={80}
              src={`${imageBaseUrl}${item.picture}`}
              alt={`image_${item?.macn}`}
              loading="lazy"
            />
          ),
          price: (
            <span className="orange-txt">{`${Number(item.price).toLocaleString('vi-VN')}đ`}</span>
          ),
          marketPrice: `${Number(item.price_old).toLocaleString('vi-VN')}đ`,
          status: (
            <>
              <span>
                {item.stock > 0 ? (item.stock === 1 ? 'Còn hàng' : 'Ngừng kinh doanh') : 'Hết hàng'}
              </span>
              <p
                style={{
                  color: item.Hienthi === 'Y' ? '#28a745' : '#dc3545',
                  fontWeight: 'bold',
                }}
              >
                {item.Hienthi === 'Y' ? 'Hiển thị' : 'Ẩn'}
              </p>
            </>
          ),

          // info: (
          //   <>
          //     <p>{item.views} lượt xem</p>
          //     <p>{moment.unix(item.date_post).format('DD-MM-YYYY, hh:mm:ss A')}</p>
          //   </>
          // ),

          create_at: (
            <>
              <p>{moment(item?.created_at).format('DD-MM-YYYY, HH:mm:ss A')}</p>
            </>
          ),

          update_at: (
            <>
              <p>{moment(item?.updated_at).format('DD-MM-YYYY, HH:mm:ss A')}</p>
            </>
          ),

          actions: (
            <div className="d-flex justify-content-start">
              <button
                onClick={() => handleUpdateClick(item.product_id)}
                className="button-action mr-2 bg-info"
              >
                <CIcon icon={cilColorBorder} className="text-white" />
              </button>

              <button
                onClick={() => {
                  setVisible(true)
                  setDeletedId(item.product_id)
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

  // export excel by category and brand

  const handleExportExcelByCategoryAndBrand = async () => {
    if (!selectedCategory || !selectedBrand) {
      alert('Vui lòng chọn đầy đủ danh mục và thương hiệu trước khi xuất Excel.')
      return
    }
    try {
      setIsLoadingButton((prev) => ({ ...prev, excelCategoryButton: true }))
      const response = await axiosClient({
        url: `/member/products/export/technology?categoryId=${selectedCategory}&brandId=${selectedBrand}`,
        method: 'GET',
        responseType: 'blob',
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `Thong_tin_sp_theo_danh_muc.xlsx`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Export excel by category and brand is error:', error)
    } finally {
      setIsLoadingButton((prev) => ({ ...prev, excelCategoryButton: false }))
    }
  }

  // export excel all products by category and brand

  const handleExportExcelAllProductByCategoryAndBrand = async () => {
    if (!selectedCategory || !selectedBrand) {
      alert('Vui lòng chọn đầy đủ danh mục và thương hiệu trước khi xuất Excel.')
      return
    }
    try {
      setIsLoadingButton((prev) => ({ ...prev, excelAllButton: true }))

      const response = await axiosClient({
        url: `/member/products-export-properties?categoryId=${selectedCategory}&brandId=${selectedBrand}`,
        method: 'GET',
        responseType: 'blob',
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `Tskt_sp_theo_danh_muc.xlsx`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Export excel technology by category and brand is error:', error)
    } finally {
      setIsLoadingButton((prev) => ({ ...prev, excelAllButton: false }))
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
              <h2>QUẢN LÝ SẢN PHẨM</h2>
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
                <Link to={`/product`}>
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
                      <td className="total-count">{dataProductList?.total}</td>
                    </tr>
                    <tr>
                      <td>Lọc</td>
                      <td>
                        <div
                          className="d-flex"
                          style={{
                            columnGap: 10,
                          }}
                        >
                          <CFormSelect
                            className="component-size w-25"
                            aria-label="Chọn yêu cầu lọc"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            options={[
                              { label: 'Chọn danh mục', value: '' },
                              ...(categories && categories.length > 0
                                ? categories.map((cate) => ({
                                    label: cate.category_desc.cat_name,
                                    value: cate.cat_id,
                                  }))
                                : []),
                            ]}
                          />
                          <CFormSelect
                            className="component-size w-25"
                            aria-label="Chọn thương hiệu"
                            value={selectedBrand}
                            onChange={(e) => setSelectedBrand(e.target.value)}
                            options={[
                              { label: 'Chọn thương hiệu', value: '' },
                              ...(brands && brands.length > 0
                                ? brands.map((brand) => ({
                                    label: brand.title,
                                    value: brand.brandId,
                                  }))
                                : []),
                            ]}
                          />
                          <CFormSelect
                            className="component-size w-25"
                            aria-label="Chọn trạng thái"
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            options={[
                              { label: 'Chọn trạng thái', value: '' },
                              ...(status && status.length > 0
                                ? status.map((status) => ({
                                    label: status.name,
                                    value: status.status_id,
                                  }))
                                : []),
                            ]}
                          />
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td>Xem từ ngày</td>
                      <td>
                        <div className="custom-datepicker-wrapper">
                          <DatePicker
                            className="custom-datepicker"
                            showIcon
                            dateFormat={'dd-MM-yyyy'}
                            selected={startDate}
                            onChange={handleStartDateChange}
                            locale="vi"
                            renderCustomHeader={({
                              date,
                              changeYear,
                              changeMonth,
                              decreaseMonth,
                              increaseMonth,
                              prevMonthButtonDisabled,
                              nextMonthButtonDisabled,
                            }) => (
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
                            )}
                          />
                          <p className="datepicker-label">{'đến ngày'}</p>
                          <DatePicker
                            className="custom-datepicker"
                            showIcon
                            dateFormat={'dd-MM-yyyy'}
                            selected={endDate}
                            onChange={handleEndDateChange}
                            locale="vi"
                            renderCustomHeader={({
                              date,
                              changeYear,
                              changeMonth,
                              decreaseMonth,
                              increaseMonth,
                              prevMonthButtonDisabled,
                              nextMonthButtonDisabled,
                            }) => (
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
                            )}
                          />
                        </div>
                        {errors.startDate && <p className="text-danger">{errors.startDate}</p>}
                        {errors.endDate && <p className="text-danger">{errors.endDate}</p>}
                      </td>
                    </tr>
                    <tr>
                      <td>Tìm kiếm</td>
                      <td>
                        <strong>
                          <em>Tìm kiếm theo Tiêu đề, Mã kho, Mã số, Giá bán</em>
                        </strong>
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

            <div className="d-flex gap-3 mt-3">
              {' '}
              <div>
                <CButton onClick={handleDeleteSelectedCheckbox} color="primary" size="sm">
                  Xóa vĩnh viễn
                </CButton>
              </div>
              <div>
                <CButton
                  onClick={handleExportExcelByCategoryAndBrand}
                  color="primary"
                  size="sm"
                  disabled={isLoadingButton.excelCategoryButton}
                >
                  {isLoadingButton.excelCategoryButton ? (
                    <>
                      Đang tải xuống <CSpinner size="sm" />
                    </>
                  ) : (
                    'Xuất excel sản phẩm theo danh mục, thương hiệu'
                  )}
                </CButton>
              </div>
              <div>
                <CButton
                  onClick={handleExportExcelAllProductByCategoryAndBrand}
                  color="primary"
                  size="sm"
                  disabled={isLoadingButton.excelAllButton}
                >
                  {isLoadingButton.excelAllButton ? (
                    <>
                      Đang tải xuống <CSpinner size="sm" />
                    </>
                  ) : (
                    'Xuất excel toàn bộ thông tin sản phẩm'
                  )}
                </CButton>
              </div>
            </div>
            <CCol>
              {isLoading ? (
                <Loading />
              ) : (
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
              )}

              <div className="d-flex justify-content-end">
                <ReactPaginate
                  pageCount={Math.ceil(dataProductList?.total / dataProductList?.per_page)}
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

export default ProductDetail
