import {
  CButton,
  CCol,
  CContainer,
  CFormCheck,
  CFormInput,
  CFormSelect,
  CImage,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

import ReactPaginate from 'react-paginate'
import moment from 'moment'
import { formatNumber, unformatNumber } from '../../../helper/utils'
import { toast } from 'react-toastify'
import './css/productFlashSale.css'
import { axiosClient, imageBaseUrl } from '../../../axiosConfig'

function ProductFlashSale() {
  // check permission state
  const [isPermissionCheck, setIsPermissionCheck] = useState(true)

  const [dataProductList, setDataProductList] = useState([])
  const [flashSaleData, setFlashSaleData] = useState([])

  // is set deal
  const [isEditDeal, setIsEditDeal] = useState(null)
  const [editedPrice, setEditedPrice] = useState('')

  // category
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('')

  // brand
  const [brands, setBrands] = useState([])
  const [selectedBrand, setSelectedBrand] = useState('')

  // status
  const [status, setStatus] = useState([])
  const [selectedStatus, setSelectedStatus] = useState('')

  //checkbox for set deal
  const [isAllDealCheckbox, setIsAllDealCheckbox] = useState(false)
  const [selectedDealCheckbox, setSelectedDealCheckbox] = useState([])

  //checkbox for unset deal
  const [isAllUnDealCheckbox, setIsAllUnDealCheckbox] = useState(false)
  const [selectedUnDealCheckbox, setSelectedUnDealCheckbox] = useState([])

  // date picker
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [errors, setErrors] = useState({ startDate: '', endDate: '' })

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

  // toggel table
  const [isCollapse, setIsCollapse] = useState(false)

  // search input
  const [dataSearch, setDataSearch] = useState('')

  //pagination state
  const [pageNumber, setPageNumber] = useState(1)

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
      const response = await axiosClient.get(
        `admin/product?page=${pageNumber}&data=${dataSearch}&brand=${selectedBrand}&category=${selectedCategory}&status=${selectedStatus}&stock=${true}`,
      )
      if (response.data.status === true) {
        setDataProductList(response.data.product)
      }
    } catch (error) {
      console.error('Fetch product data list is error', error.message)
    }
  }

  useEffect(() => {
    fetchProductData()
  }, [pageNumber, dataSearch, selectedBrand, selectedCategory, selectedStatus])

  const fetchFlashSaleData = async () => {
    try {
      const response = await axiosClient.get(`admin/product-flash-sale`)
      if (response.data.status === true) {
        setFlashSaleData(response.data.list)
      }

      if (response.data.status === false && response.data.mess == 'no permission') {
        setIsPermissionCheck(false)
      }
    } catch (error) {
      console.error('Fetch flash sale data is error', error)
    }
  }

  useEffect(() => {
    fetchFlashSaleData()
  }, [])

  const handleToggleCollapse = () => {
    setIsCollapse((prevState) => !prevState)
  }

  const handleSearch = (keyword) => {
    fetchProductData(keyword)
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

  const handleSubmitDeal = async () => {
    try {
      const response = await axiosClient.post(`admin/product-flash-sale`, {
        data: selectedDealCheckbox,
        status_id: 5,
      })

      if (response.data.status === true) {
        toast.success('Set deal các mục thành công!')
        fetchFlashSaleData()
        setSelectedDealCheckbox([])
      }

      if (response.data.status === false && response.data.mess == 'no permission') {
        toast.warn('Bạn không có quyền thực hiện tác vụ này!')
      }
    } catch (error) {
      console.error('Post set deal data is error', error)
      toast.error('Đã xảy ra lỗi. Vui lòng thử lại!')
    }
  }

  const handleEditDeal = async (id) => {
    try {
      const response = await axiosClient.put(`admin/product-flash-sale/${id}`, {
        discount_price: editedPrice,
        start_time: startDate,
        end_time: endDate,
      })

      if (response.data.status === true) {
        toast.success('Cập nhật thông tin flashsale thành công.')
        fetchFlashSaleData()
        setIsEditDeal(null)
        setStartDate('')
        setEndDate('')
      }

      if (response.data.status === false && response.data.mess == 'no permission') {
        toast.warn('Bạn không có quyền thực hiện tác vụ này!')
      }
    } catch (error) {
      console.error('Update product flash-sale is error', error)
      toast.error('Đã xảy ra lỗi khi cập nhật. Vui lòng thử lại!')
    }
  }

  const handleSubmitUndeal = async () => {
    try {
      const response = await axiosClient.post(`admin/delete-all-flash-sale`, {
        data: selectedUnDealCheckbox,
      })

      if (response.data.status === true) {
        toast.success('Set undeal các mục thành công!')
        fetchFlashSaleData()
        setSelectedUnDealCheckbox([])
      }

      if (response.data.status === false && response.data.mess == 'no permission') {
        toast.warn('Bạn không có quyền thực hiện tác vụ này!')
      }
    } catch (error) {
      console.error('Post set undeal data is error', error)
      toast.error('Đã xảy ra lỗi. Vui lòng thử lại!')
    }
  }

  const columns = [
    {
      key: 'checklist',
      label: (
        <CFormCheck
          style={{
            transform: 'scale(1.4)',
            accentColor: '#198754',
          }}
          aria-label="Select all"
          checked={isAllDealCheckbox}
          onChange={(e) => {
            const isChecked = e.target.checked
            setIsAllDealCheckbox(isChecked)
            if (isChecked) {
              const allIds = dataProductList?.data.map((item) => item.product_id) || []
              setSelectedDealCheckbox(allIds)
            } else {
              setSelectedDealCheckbox([])
            }
          }}
        />
      ),
    },
    { key: 'title', label: 'Tiêu đề' },
    { key: 'image', label: 'Hình ảnh' },
    { key: 'price', label: 'Giá bán' },
    { key: 'marketPrice', label: 'Giá thị trường' },
    { key: 'status', label: 'Tình trạng' },
    { key: 'info', label: 'Thông tin ' },
  ]

  const items =
    dataProductList?.data && dataProductList?.data.length > 0
      ? dataProductList?.data?.map((item) => ({
          checklist: (
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
              checked={selectedDealCheckbox.includes(item?.product_id)}
              onChange={(e) => {
                const dealId = item?.product_id
                const isChecked = e.target.checked
                if (isChecked) {
                  setSelectedDealCheckbox([...selectedDealCheckbox, dealId])
                } else {
                  setSelectedDealCheckbox(selectedDealCheckbox.filter((id) => id !== dealId))
                }
              }}
            />
          ),
          title: (
            <>
              <p className="blue-txt m-0">{item?.product_desc?.title}</p>
              <p className="orange-txt">{`#${item?.macn}`}</p>
            </>
          ),
          image: (
            <CImage
              className="d-flex justify-content-center align-items-center"
              width={50}
              src={`${imageBaseUrl}${item?.picture}`}
              alt={`image_${item?.macn}`}
            />
          ),
          price: (
            <span className="orange-txt">{`${Number(item.price_old).toLocaleString('vi-VN')}đ`}</span>
          ),
          marketPrice: `${Number(item.price).toLocaleString('vi-VN')}đ`,
          status: (
            <>
              <span>
                {item.stock > 0 ? (item.stock === 1 ? 'Còn hàng' : 'Ngừng kinh doanh') : 'Hết hàng'}
              </span>
              <p>{item.display === 1 ? 'Hiển thị' : 'Ẩn'}</p>
            </>
          ),
          info: (
            <>
              <p>{item.views} lượt xem</p>
              <p>{moment.unix(item?.date_post).format('DD-MM-YYYY, hh:mm:ss A')}</p>
            </>
          ),
          _cellProps: { id: { scope: 'row' } },
        }))
      : []

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
          <CRow className="my-3">
            <CCol md={6}>
              <h2>SẢN PHẨM FLASH SALE</h2>
            </CCol>
            <CCol md={6}>
              <div className="d-flex justify-content-end">
                <Link to={`/product`}>
                  <CButton color="primary" type="submit" size="sm">
                    Danh sách
                  </CButton>
                </Link>
              </div>
            </CCol>
          </CRow>

          <CRow>
            <CCol className="d-flex gap-3 mb-2" md={12}>
              <CButton onClick={handleSubmitUndeal} size="sm" color="primary">
                Bỏ set deal các mục đã chọn
              </CButton>
            </CCol>
            <CCol>
              <CTable
                className="border"
                hover
                responsive
                style={{ borderRadius: 8, overflow: 'hidden' }}
              >
                <CTableHead>
                  <CTableRow style={{ background: '#f5f6fa' }}>
                    <CTableHeaderCell scope="col" style={{ textAlign: 'center', width: 40 }}>
                      <CFormCheck
                        style={{
                          transform: 'scale(1.4)',
                          accentColor: '#198754',
                        }}
                        aria-label="Select all"
                        checked={isAllUnDealCheckbox}
                        onChange={(e) => {
                          const isChecked = e.target.checked
                          setIsAllUnDealCheckbox(isChecked)
                          if (isChecked) {
                            const allIds = flashSaleData?.map((item) => item.product_id) || []
                            setSelectedUnDealCheckbox(allIds)
                          } else {
                            setSelectedUnDealCheckbox([])
                          }
                        }}
                      />
                    </CTableHeaderCell>
                    <CTableHeaderCell scope="col" style={{ minWidth: 180 }}>
                      Tiêu đề
                    </CTableHeaderCell>
                    <CTableHeaderCell scope="col" style={{ textAlign: 'center', width: 80 }}>
                      Hình ảnh
                    </CTableHeaderCell>
                    <CTableHeaderCell scope="col" style={{ textAlign: 'center', minWidth: 140 }}>
                      Thời gian bắt đầu
                    </CTableHeaderCell>
                    <CTableHeaderCell scope="col" style={{ textAlign: 'center', minWidth: 140 }}>
                      Thời gian kết thúc
                    </CTableHeaderCell>
                    <CTableHeaderCell scope="col" style={{ textAlign: 'center', minWidth: 110 }}>
                      Giá gốc
                    </CTableHeaderCell>
                    <CTableHeaderCell scope="col" style={{ textAlign: 'center', minWidth: 110 }}>
                      Giá bán
                    </CTableHeaderCell>
                    <CTableHeaderCell scope="col" style={{ textAlign: 'center', width: 110 }}>
                      Tác vụ
                    </CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {flashSaleData &&
                    flashSaleData.length > 0 &&
                    flashSaleData.map((item) => (
                      <CTableRow
                        key={item.id}
                        style={{
                          verticalAlign: 'middle',
                          transition: 'background 0.2s',
                          cursor: 'pointer',
                        }}
                        className="flashsale-row"
                      >
                        <CTableHeaderCell scope="row" style={{ textAlign: 'center' }}>
                          <CFormCheck
                            style={{
                              transform: 'scale(1.3)',
                              accentColor: '#198754',
                            }}
                            key={item?.id}
                            aria-label="Default select example"
                            defaultChecked={item?.product_id}
                            id={`flexCheckDefault_${item?.id}`}
                            value={item?.product_id}
                            checked={selectedUnDealCheckbox.includes(item?.product_id)}
                            onChange={(e) => {
                              const undealId = item?.product_id
                              const isChecked = e.target.checked
                              if (isChecked) {
                                setSelectedUnDealCheckbox([...selectedUnDealCheckbox, undealId])
                              } else {
                                setSelectedUnDealCheckbox(
                                  selectedUnDealCheckbox.filter((id) => id !== undealId),
                                )
                              }
                            }}
                          />
                        </CTableHeaderCell>
                        <CTableDataCell style={{ fontWeight: 500 }}>
                          <Link
                            to={`/product/edit?id=${item?.product?.product_id}`}
                            style={{ color: '#2a73cc', textDecoration: 'none' }}
                          >
                            {item?.product?.product_desc?.title}
                          </Link>
                        </CTableDataCell>
                        <CTableDataCell style={{ textAlign: 'center' }}>
                          <CImage
                            className="d-flex justify-content-center align-items-center"
                            width={50}
                            src={`${imageBaseUrl}${item?.product?.picture}`}
                            alt={`image_1`}
                            style={{
                              borderRadius: 8,
                              border: '1px solid #eee',
                              background: '#fff',
                            }}
                          />
                        </CTableDataCell>
                        <CTableDataCell style={{ textAlign: 'center' }}>
                          {isEditDeal === item?.id ? (
                            <>
                              <DatePicker
                                className="custom-datepicker"
                                showIcon
                                dateFormat={'dd-MM-yyyy'}
                                selected={startDate}
                                onChange={handleStartDateChange}
                                popperPlacement="bottom"
                                style={{ minWidth: 120 }}
                              />
                              {errors.startDate && (
                                <p className="text-danger mb-0" style={{ fontSize: 12 }}>
                                  {errors.startDate}
                                </p>
                              )}
                            </>
                          ) : (
                            <DatePicker
                              className="custom-datepicker"
                              showIcon
                              dateFormat={'dd-MM-yyyy'}
                              selected={
                                item?.start_time !== null && !isNaN(item?.start_time)
                                  ? moment.unix(Number(item?.start_time)).isValid()
                                    ? moment.unix(Number(item?.start_time)).toDate()
                                    : ''
                                  : ''
                              }
                              disabled
                              style={{ background: '#f8f9fa', minWidth: 120 }}
                            />
                          )}
                        </CTableDataCell>
                        <CTableDataCell style={{ textAlign: 'center' }}>
                          {isEditDeal === item?.id ? (
                            <>
                              <DatePicker
                                className="custom-datepicker"
                                showIcon
                                dateFormat={'dd-MM-yyyy'}
                                selected={endDate}
                                onChange={handleEndDateChange}
                                popperPlacement="bottom"
                                style={{ minWidth: 120 }}
                              />
                              {errors.endDate && (
                                <p className="text-danger mb-0" style={{ fontSize: 12 }}>
                                  {errors.endDate}
                                </p>
                              )}
                            </>
                          ) : (
                            <DatePicker
                              className="custom-datepicker"
                              showIcon
                              dateFormat={'dd-MM-yyyy'}
                              selected={
                                item?.end_time !== null && !isNaN(item?.end_time)
                                  ? moment.unix(Number(item?.end_time)).isValid()
                                    ? moment.unix(Number(item?.end_time)).toDate()
                                    : ''
                                  : ''
                              }
                              disabled
                              style={{ background: '#f8f9fa', minWidth: 120 }}
                            />
                          )}
                        </CTableDataCell>
                        <CTableDataCell style={{ textAlign: 'center' }}>
                          {isEditDeal === item?.id ? (
                            <CFormInput
                              style={{
                                width: '100px',
                                fontSize: 13,
                                margin: '0 auto',
                                borderRadius: 6,
                                border: '1px solid #bdbdbd',
                              }}
                              type="text"
                              id="price-input"
                              value={formatNumber(editedPrice)}
                              onChange={(e) => {
                                const rawValue = unformatNumber(e.target.value)
                                setEditedPrice(rawValue)
                              }}
                            />
                          ) : (
                            <CFormInput
                              style={{
                                width: '100px',
                                fontSize: 13,
                                margin: '0 auto',
                                borderRadius: 6,
                                border: '1px solid #e0e0e0',
                                background: '#f8f9fa',
                              }}
                              type="text"
                              id="price-input"
                              value={formatNumber(item?.discount_price)}
                              disabled
                            />
                          )}
                        </CTableDataCell>
                        <CTableDataCell
                          style={{
                            fontSize: 13,
                            color: '#ff7a00',
                            textAlign: 'center',
                            fontWeight: 500,
                          }}
                        >
                          {(item?.price).toLocaleString('vi-VN')}đ
                        </CTableDataCell>
                        <CTableDataCell style={{ textAlign: 'center' }}>
                          <div>
                            {isEditDeal === item?.id ? (
                              <CButton
                                size="sm"
                                color="success"
                                onClick={() => handleEditDeal(item?.product_id)}
                                className="button-action mr-2"
                                style={{
                                  minWidth: 80,
                                  fontWeight: 600,
                                  borderRadius: 6,
                                  color: '#fff',
                                }}
                                title="Lưu cập nhật"
                              >
                                Cập nhật
                              </CButton>
                            ) : (
                              <CButton
                                size="sm"
                                color="info"
                                onClick={() => {
                                  setIsEditDeal(item?.id)
                                  setEditedPrice(item.discount_price)
                                }}
                                className="button-action mr-2"
                                style={{
                                  minWidth: 80,
                                  fontWeight: 600,
                                  borderRadius: 6,
                                  color: '#fff',
                                }}
                                title="Chỉnh sửa thông tin"
                              >
                                Chỉnh sửa
                              </CButton>
                            )}
                          </div>
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                </CTableBody>
              </CTable>
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
                          >
                            <option value={''}>Chọn danh mục</option>
                            {categories &&
                              categories?.map((category) => (
                                <React.Fragment key={category.cat_id}>
                                  <option value={category.cat_id}>
                                    {category?.category_desc?.cat_name} ({category.cat_id})
                                  </option>
                                  {category.parenty &&
                                    category.parenty.map((subCategory) => (
                                      <React.Fragment key={subCategory.cat_id}>
                                        <option value={subCategory.cat_id}>
                                          &nbsp;&nbsp;&nbsp;{'|--'}
                                          {subCategory?.category_desc?.cat_name} (
                                          {subCategory.cat_id})
                                        </option>

                                        {subCategory.parentx &&
                                          subCategory.parentx.map((subSubCategory) => (
                                            <option
                                              key={subSubCategory.cat_id}
                                              value={subSubCategory.cat_id}
                                            >
                                              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{'|--'}
                                              {subSubCategory?.category_desc?.cat_name}(
                                              {subSubCategory.cat_id})
                                            </option>
                                          ))}
                                      </React.Fragment>
                                    ))}
                                </React.Fragment>
                              ))}
                          </CFormSelect>

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

            <CCol className="mt-3">
              <CButton onClick={handleSubmitDeal} color="primary" size="sm">
                Set deal các mục đã chọn
              </CButton>
              <CTable hover className="mt-2 border" columns={columns} items={items} />

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
                />
              </div>
            </CCol>
          </CRow>
        </>
      )}
    </div>
  )
}

export default ProductFlashSale
