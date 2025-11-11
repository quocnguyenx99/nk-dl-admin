import {
  CButton,
  CCol,
  CContainer,
  CFormCheck,
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
import Loading from '../../../components/loading/Loading'
import { axiosClient, imageBaseUrl } from '../../../axiosConfig'
function ProductHot() {
  // check permission state
  const [isPermissionCheck, setIsPermissionCheck] = useState(true)

  const [dataProductList, setDataProductList] = useState([])
  const [productHotData, setProductHotData] = useState([])

  //loading
  const [isLoading, setIsLoading] = useState(false)

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
      setIsLoading(true)
      const response = await axiosClient.get(
        `admin/product?page=${pageNumber}&data=${dataSearch}&brand=${selectedBrand}&category=${selectedCategory}&status=${selectedStatus}&stock=${true}`,
      )
      if (response.data.status === true) {
        setDataProductList(response.data.product)
      }
    } catch (error) {
      console.error('Fetch product data list is error', error.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProductData()
  }, [pageNumber, dataSearch, selectedBrand, selectedCategory, selectedStatus])

  const fetchProductHot = async () => {
    try {
      const response = await axiosClient.get(`admin/product-hot`)

      if (response.data.status === true) {
        setProductHotData(response.data.list)
      }

      if (response.data.status === false && response.data.mess == 'no permission') {
        setIsPermissionCheck(false)
      }
    } catch (error) {
      console.error('Fetch flash sale data is error', error)
    }
  }

  useEffect(() => {
    fetchProductHot()
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
      const response = await axiosClient.post(`admin/product-hot`, {
        data: selectedDealCheckbox,
        status_id: 4,
      })

      if (response.data.status === true) {
        toast.success('Set deal các mục thành công!')
        fetchProductHot()
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

  const handleSubmitUndeal = async () => {
    try {
      const response = await axiosClient.post(`admin/delete-all-hot `, {
        data: selectedUnDealCheckbox,
      })

      if (response.data.status === true) {
        toast.success('Set undeal các mục thành công!')
        fetchProductHot()
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
              src={`${imageBaseUrl}${item.picture}`}
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
              <p>{moment.unix(item.date_post).format('DD-MM-YYYY, hh:mm:ss A')}</p>
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
            <CCol>
              <h2>SẢN PHẨM HOT</h2>
            </CCol>
            <CCol md={{ span: 4, offset: 4 }}>
              <div className="d-flex justify-content-end">
                <Link to={`/product`}>
                  <CButton color="primary" type="submit" size="sm">
                    Danh sách
                  </CButton>
                </Link>
              </div>
            </CCol>
          </CRow>

          {isLoading ? (
            <Loading />
          ) : (
            <CRow>
              <CCol className="d-flex gap-3 mb-2" md={12}>
                <CButton onClick={handleSubmitUndeal} size="sm" color="primary">
                  Bỏ set deal các mục đã chọn
                </CButton>
              </CCol>
              <CCol>
                <CTable className="border">
                  <CTableHead>
                    <CTableRow>
                      <CTableHeaderCell scope="col">
                        <CFormCheck
                          aria-label="Select all"
                          checked={isAllUnDealCheckbox}
                          onChange={(e) => {
                            const isChecked = e.target.checked
                            setIsAllUnDealCheckbox(isChecked)
                            if (isChecked) {
                              const allIds = productHotData?.map((item) => item.product_id) || []
                              setSelectedUnDealCheckbox(allIds)
                            } else {
                              setSelectedUnDealCheckbox([])
                            }
                          }}
                        />
                      </CTableHeaderCell>
                      <CTableHeaderCell scope="col">Tiêu đề</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Hình ảnh</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Lượt xem</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Giá bán</CTableHeaderCell>
                      <CTableHeaderCell scope="col">Giá thị trường</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {productHotData &&
                      productHotData.length > 0 &&
                      productHotData.map((item) => (
                        <CTableRow key={item.id}>
                          <CTableHeaderCell scope="row">
                            <CFormCheck
                              key={item?.product_id}
                              aria-label="Default select example"
                              defaultChecked={item?.product_id}
                              id={`flexCheckDefault_${item?.product_id}`}
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

                          <CTableDataCell
                            style={{
                              width: '40%',
                            }}
                          >
                            <Link to={`/product/edit?id=${item?.product_id}`}>
                              {item?.product_desc?.title}
                            </Link>
                          </CTableDataCell>

                          <CTableDataCell>
                            <CImage
                              className="d-flex justify-content-center align-items-center"
                              width={50}
                              src={`${imageBaseUrl}${item?.picture}`}
                              alt={`image_1`}
                            />
                          </CTableDataCell>

                          <CTableDataCell>{item?.views} lượt xem</CTableDataCell>

                          <CTableDataCell style={{ fontSize: 13 }} className="orange-txt">
                            {(item?.price_old).toLocaleString('vi-VN')}đ
                          </CTableDataCell>
                          <CTableDataCell style={{ fontSize: 13 }} className="orange-txt">
                            {(item?.price).toLocaleString('vi-VN')}đ
                          </CTableDataCell>
                        </CTableRow>
                      ))}
                  </CTableBody>
                </CTable>
              </CCol>
            </CRow>
          )}

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

export default ProductHot
