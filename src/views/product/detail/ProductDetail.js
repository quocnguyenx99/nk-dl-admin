import {
  CButton,
  CCol,
  CFormCheck,
  CFormSelect,
  CImage,
  CRow,
  CSpinner,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import React, { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import CIcon from '@coreui/icons-react'
import { cilColorBorder, cilTrash } from '@coreui/icons'
import ReactPaginate from 'react-paginate'
import moment from 'moment'
import DeletedModal from '../../../components/deletedModal/DeletedModal'
import { axiosClient, imageBaseUrl } from '../../../axiosConfig'
import { toast } from 'react-toastify'
import Loading from '../../../components/loading/Loading'
import useDebounce from '../../../helper/debounce'

function ProductDetail() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const pageFromUrl = parseInt(searchParams.get('page')) || 1
  const [pageNumber, setPageNumber] = useState(pageFromUrl)

  useEffect(() => {
    setSearchParams({ page: pageNumber })
  }, [pageNumber, setSearchParams])

  const [isPermissionCheck, setIsPermissionCheck] = useState(true)
  const [dataProductList, setDataProductList] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingButton, setIsLoadingButton] = useState({
    excelCategoryButton: false,
    excelAllButton: false,
  })

  // filters
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [brands, setBrands] = useState([])
  const [selectedBrand, setSelectedBrand] = useState('')
  const [statusList, setStatusList] = useState([])
  const [selectedStatus, setSelectedStatus] = useState('')

  const [searchInput, setSearchInput] = useState('')
  const [dataSearch, setDataSearch] = useState('')
  const debouncedSearch = useDebounce(dataSearch, 300)

  // checkbox selected
  const [isAllCheckbox, setIsAllCheckbox] = useState(false)
  const [selectedCheckbox, setSelectedCheckbox] = useState([])

  // delete modal
  const [visible, setVisible] = useState(false)
  const [deletedId, setDeletedId] = useState(null)

  const fetchDataFilters = async () => {
    try {
      const [categoriesResult, brandsResult, statusResult] = await Promise.allSettled([
        axiosClient.get('admin/category'),
        axiosClient.get('admin/brand?type=all'),
        axiosClient.get('admin/productStatus'),
      ])

      if (categoriesResult.status === 'fulfilled') {
        setCategories(categoriesResult.value.data.data || [])
      }
      if (brandsResult.status === 'fulfilled' && brandsResult.value.data.status === true) {
        setBrands(brandsResult.value.data.list || [])
      }
      if (statusResult.status === 'fulfilled' && statusResult.value.data.status === 'success') {
        setStatusList(statusResult.value.data.list?.data || [])
      }
    } catch (error) {
      console.error('Fetch filter data error', error)
    }
  }

  useEffect(() => {
    fetchDataFilters()
  }, [])

  const fetchProductData = useCallback(async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      params.append('page', pageNumber)
      if (dataSearch) params.append('data', dataSearch)
      if (selectedBrand) params.append('brand', selectedBrand)
      if (selectedCategory) params.append('category', selectedCategory)
      if (selectedStatus) params.append('status', selectedStatus)

      const response = await axiosClient.get(`admin/product?${params.toString()}`)

      if (response.data.status === true) {
        setDataProductList(response.data.product)
      }

      if (response.data.status === false && response.data.mess === 'no permission') {
        setIsPermissionCheck(false)
      }
    } catch (error) {
      console.error('Fetch product list error', error)
    } finally {
      setIsLoading(false)
    }
  }, [pageNumber, dataSearch, selectedBrand, selectedCategory, selectedStatus])

  useEffect(() => {
    fetchProductData()
  }, [fetchProductData, debouncedSearch])

  const handleSearchSubmit = (e) => {
    e?.preventDefault()
    setPageNumber(1)
    setDataSearch(searchInput)
  }

  const handleResetFilters = () => {
    setSearchInput('')
    setDataSearch('')
    setSelectedCategory('')
    setSelectedBrand('')
    setSelectedStatus('')
    setPageNumber(1)
  }

  const handleAddNewClick = () => {
    navigate('/product/add')
  }

  const handleUpdateClick = (productId) => {
    navigate(`/product/edit?id=${productId}&page=${pageNumber}`)
  }

  const handleDelete = async () => {
    try {
      const response = await axiosClient.delete(`admin/product/${deletedId}`)
      if (response.data.status === true) {
        setVisible(false)
        toast.success('Xóa sản phẩm thành công!')
        fetchProductData()
      } else if (response.data.status === false && response.data.mess === 'no permission') {
        toast.warn('Bạn không có quyền thực hiện tác vụ này!')
      }
    } catch (error) {
      console.error('Delete product error', error)
      toast.error('Đã xảy ra lỗi khi xóa sản phẩm!')
    }
  }

  const handleDeleteSelectedCheckbox = async () => {
    if (!selectedCheckbox.length) return
    if (
      !window.confirm(
        `Bạn có chắc chắn muốn xóa vĩnh viễn ${selectedCheckbox.length} sản phẩm đã chọn?`,
      )
    ) {
      return
    }
    try {
      const response = await axiosClient.post('admin/delete-all-product', {
        data: selectedCheckbox,
      })
      if (response.data.status === true) {
        toast.success(`Đã xóa ${selectedCheckbox.length} sản phẩm thành công!`)
        fetchProductData()
        setSelectedCheckbox([])
        setIsAllCheckbox(false)
      }
    } catch (error) {
      console.error('Delete selected checkbox error', error)
      toast.error('Xóa thất bại!')
    }
  }

  const handlePageChange = ({ selected }) => {
    const newPage = selected + 1
    setPageNumber(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleExportExcelByCategoryAndBrand = async () => {
    if (!selectedCategory || !selectedBrand) {
      toast.warn('Vui lòng chọn đầy đủ danh mục và thương hiệu trước khi xuất Excel.')
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
      toast.success('Tải tệp Excel thành công!')
    } catch (error) {
      console.error('Export excel error:', error)
      toast.error('Xuất Excel thất bại!')
    } finally {
      setIsLoadingButton((prev) => ({ ...prev, excelCategoryButton: false }))
    }
  }

  const handleExportExcelAllProductByCategoryAndBrand = async () => {
    if (!selectedCategory || !selectedBrand) {
      toast.warn('Vui lòng chọn đầy đủ danh mục và thương hiệu trước khi xuất Excel.')
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
      toast.success('Tải tệp Excel thành công!')
    } catch (error) {
      console.error('Export excel error:', error)
      toast.error('Xuất Excel thất bại!')
    } finally {
      setIsLoadingButton((prev) => ({ ...prev, excelAllButton: false }))
    }
  }

  const productList = dataProductList?.data || []
  const totalItems = dataProductList?.total || 0
  const perPage = dataProductList?.per_page || 10
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
              <h3 className="fw-bold text-uppercase text-dark m-0">QUẢN LÝ SẢN PHẨM</h3>
              <p className="text-muted text-xs m-0 mt-1">
                Danh sách thông tin sản phẩm, giá bán, tồn kho, thương hiệu và trạng thái hiển thị
              </p>
            </div>
            <div className="d-flex flex-wrap gap-2">
              <Link to="/product/category">
                <CButton color="light" size="sm" className="border fw-semibold shadow-xs">
                  Danh mục sản phẩm
                </CButton>
              </Link>
              <Link to="/product/brand">
                <CButton color="light" size="sm" className="border fw-semibold shadow-xs">
                  Thương hiệu
                </CButton>
              </Link>
              <CButton
                onClick={handleAddNewClick}
                color="primary"
                size="sm"
                className="fw-bold shadow-xs px-3"
              >
                + Thêm sản phẩm mới
              </CButton>
            </div>
          </div>

          {/* FILTER & SEARCH CARD */}
          <div className="card border-0 shadow-sm rounded-3 p-3 mb-4 bg-white">
            <form onSubmit={handleSearchSubmit}>
              <div className="row g-2 align-items-center">
                {/* Search input */}
                <div className="col-12 col-md-3">
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0 text-muted">🔍</span>
                    <input
                      type="text"
                      className="form-control border-start-0 ps-0"
                      placeholder="Tìm tên sản phẩm, Mã HH, SKU..."
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                    />
                  </div>
                </div>

                {/* Category select */}
                <div className="col-12 col-md-3">
                  <CFormSelect
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value)
                      setPageNumber(1)
                    }}
                  >
                    <option value="">📁 Tất cả danh mục</option>
                    {categories.map((cate) => (
                      <option key={cate.cat_id} value={cate.cat_id}>
                        {cate.category_desc?.cat_name || `Danh mục #${cate.cat_id}`}
                      </option>
                    ))}
                  </CFormSelect>
                </div>

                {/* Brand select */}
                <div className="col-12 col-md-2">
                  <CFormSelect
                    value={selectedBrand}
                    onChange={(e) => {
                      setSelectedBrand(e.target.value)
                      setPageNumber(1)
                    }}
                  >
                    <option value="">🏷️ Tất cả thương hiệu</option>
                    {brands.map((b) => (
                      <option key={b.brandId} value={b.brandId}>
                        {b.title}
                      </option>
                    ))}
                  </CFormSelect>
                </div>

                {/* Status select */}
                <div className="col-12 col-md-2">
                  <CFormSelect
                    value={selectedStatus}
                    onChange={(e) => {
                      setSelectedStatus(e.target.value)
                      setPageNumber(1)
                    }}
                  >
                    <option value="">Tất cả trạng thái</option>
                    {statusList.map((st) => (
                      <option key={st.status_id} value={st.status_id}>
                        {st.name}
                      </option>
                    ))}
                  </CFormSelect>
                </div>

                {/* Submit & Reset buttons */}
                <div className="col-12 col-md-2 d-flex gap-2">
                  <CButton type="submit" color="primary" className="w-100 fw-semibold shadow-xs">
                    Tìm kiếm
                  </CButton>
                  {(dataSearch ||
                    selectedCategory ||
                    selectedBrand ||
                    selectedStatus ||
                    searchInput) && (
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

          {/* EXCEL EXPORT BUTTONS & BATCH ACTIONS */}
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
            <div>
              {selectedCheckbox.length > 0 && (
                <div className="d-flex align-items-center gap-2">
                  <span className="fw-bold text-primary small">
                    Đã chọn {selectedCheckbox.length} sản phẩm
                  </span>
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
            </div>

            <div className="d-flex flex-wrap gap-2">
              <CButton
                onClick={handleExportExcelByCategoryAndBrand}
                color="light"
                size="sm"
                className="border fw-semibold shadow-xs"
                disabled={isLoadingButton.excelCategoryButton}
              >
                {isLoadingButton.excelCategoryButton ? (
                  <>
                    <CSpinner size="sm" className="me-1" /> Đang xuất...
                  </>
                ) : (
                  '📊 Xuất Excel theo danh mục & thương hiệu'
                )}
              </CButton>
              <CButton
                onClick={handleExportExcelAllProductByCategoryAndBrand}
                color="light"
                size="sm"
                className="border fw-semibold shadow-xs"
                disabled={isLoadingButton.excelAllButton}
              >
                {isLoadingButton.excelAllButton ? (
                  <>
                    <CSpinner size="sm" className="me-1" /> Đang xuất...
                  </>
                ) : (
                  '📑 Xuất Excel thông số kĩ thuật'
                )}
              </CButton>
            </div>
          </div>

          {/* DATA TABLE CARD */}
          <div className="card border-0 shadow-sm rounded-3 overflow-hidden bg-white mb-4">
            {isLoading ? (
              <div className="p-5 text-center">
                <Loading />
              </div>
            ) : productList.length === 0 ? (
              <div className="p-5 text-center text-muted">
                <h6 className="fw-bold text-dark">Không tìm thấy sản phẩm nào</h6>
                <p className="small text-muted mb-0">
                  Thử tìm kiếm với từ khóa khác hoặc đặt lại bộ lọc.
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
                            productList.length > 0 &&
                            productList.every((item) => selectedCheckbox.includes(item.product_id))
                          }
                          onChange={(e) => {
                            const isChecked = e.target.checked
                            setIsAllCheckbox(isChecked)
                            if (isChecked) {
                              setSelectedCheckbox(productList.map((item) => item.product_id))
                            } else {
                              setSelectedCheckbox([])
                            }
                          }}
                        />
                      </CTableHeaderCell>
                      <CTableHeaderCell style={{ width: '70px' }} className="text-center">
                        Hình ảnh
                      </CTableHeaderCell>
                      <CTableHeaderCell style={{ minWidth: '240px' }}>
                        Tên sản phẩm & Mã SKU
                      </CTableHeaderCell>
                      <CTableHeaderCell style={{ minWidth: '130px' }}>Giá bán sỉ</CTableHeaderCell>
                      <CTableHeaderCell style={{ minWidth: '130px' }}>
                        Giá niêm yết
                      </CTableHeaderCell>
                      <CTableHeaderCell style={{ minWidth: '110px' }} className="text-center">
                        Tồn kho
                      </CTableHeaderCell>
                      <CTableHeaderCell style={{ minWidth: '110px' }} className="text-center">
                        Hiển thị
                      </CTableHeaderCell>
                      <CTableHeaderCell style={{ minWidth: '100px' }} className="text-center">
                        Tác vụ
                      </CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {productList.map((item) => {
                      const isSelected = selectedCheckbox.includes(item.product_id)
                      const productTitle =
                        item.product_desc?.title || item.TenHH || 'Chưa nhập tên SP'
                      const sku = item.MaHH || item.macn || ''
                      const priceVal = Number(item.price) || 0
                      const oldPriceVal = Number(item.price_old) || 0

                      return (
                        <CTableRow
                          key={item.product_id}
                          className={isSelected ? 'table-primary bg-opacity-25' : ''}
                        >
                          {/* Checkbox */}
                          <CTableDataCell className="text-center">
                            <CFormCheck
                              value={item.product_id}
                              checked={isSelected}
                              onChange={(e) => {
                                const isChecked = e.target.checked
                                if (isChecked) {
                                  setSelectedCheckbox([...selectedCheckbox, item.product_id])
                                } else {
                                  setSelectedCheckbox(
                                    selectedCheckbox.filter((pId) => pId !== item.product_id),
                                  )
                                }
                              }}
                            />
                          </CTableDataCell>

                          {/* Image */}
                          <CTableDataCell className="text-center">
                            {item.picture ? (
                              <CImage
                                src={`${imageBaseUrl}${item.picture}`}
                                alt={productTitle}
                                width={52}
                                height={52}
                                className="rounded border object-fit-contain p-1 bg-white"
                                loading="lazy"
                              />
                            ) : (
                              <div
                                className="rounded bg-light border d-flex align-items-center justify-content-center text-muted mx-auto"
                                style={{ width: '52px', height: '52px', fontSize: '10px' }}
                              >
                                No img
                              </div>
                            )}
                          </CTableDataCell>

                          {/* Name & SKU */}
                          <CTableDataCell>
                            <div
                              className="fw-bold text-dark cursor-pointer text-truncate"
                              style={{ fontSize: '13.5px', maxWidth: '320px' }}
                              onClick={() => handleUpdateClick(item.product_id)}
                              title={productTitle}
                            >
                              {productTitle}
                            </div>
                            {item.TenTrenWeb2 && (
                              <div
                                className="text-muted small text-truncate"
                                style={{ maxWidth: '320px' }}
                              >
                                {item.TenTrenWeb2}
                              </div>
                            )}
                            {sku && (
                              <span
                                className="badge mt-1 px-2 py-0.5 font-monospace"
                                style={{
                                  backgroundColor: '#f1f5f9',
                                  color: '#475569',
                                  border: '1px solid #cbd5e1',
                                  fontSize: '11px',
                                }}
                              >
                                #{sku}
                              </span>
                            )}
                          </CTableDataCell>

                          {/* Price */}
                          <CTableDataCell>
                            <span className="fw-bold text-danger" style={{ fontSize: '13.5px' }}>
                              {priceVal > 0 ? `${priceVal.toLocaleString('vi-VN')} đ` : 'Liên hệ'}
                            </span>
                          </CTableDataCell>

                          {/* Market Price */}
                          <CTableDataCell>
                            <span className="text-secondary small text-decoration-line-through">
                              {oldPriceVal > 0 ? `${oldPriceVal.toLocaleString('vi-VN')} đ` : '-'}
                            </span>
                          </CTableDataCell>

                          {/* Stock status */}
                          <CTableDataCell className="text-center">
                            {item.stock === 1 ? (
                              <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-1">
                                Còn hàng
                              </span>
                            ) : item.stock === 0 ? (
                              <span className="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 px-2 py-1">
                                Hết hàng
                              </span>
                            ) : (
                              <span className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25 px-2 py-1">
                                Ngừng KD
                              </span>
                            )}
                          </CTableDataCell>

                          {/* Visible status */}
                          <CTableDataCell className="text-center">
                            {item.Hienthi === 'Y' ? (
                              <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-1">
                                Hiển thị
                              </span>
                            ) : (
                              <span className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25 px-2 py-1">
                                Đang ẩn
                              </span>
                            )}
                          </CTableDataCell>

                          {/* Actions */}
                          <CTableDataCell className="text-center">
                            <div className="d-flex justify-content-center">
                              <button
                                onClick={() => handleUpdateClick(item.product_id)}
                                className="button-action mr-2 bg-info"
                                title="Chỉnh sửa sản phẩm"
                              >
                                <CIcon icon={cilColorBorder} className="text-white" />
                              </button>
                              <button
                                onClick={() => {
                                  setVisible(true)
                                  setDeletedId(item.product_id)
                                }}
                                className="button-action bg-danger"
                                title="Xóa sản phẩm"
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
            {productList.length > 0 && (
              <div className="card-footer bg-white border-top d-flex flex-wrap justify-content-between align-items-center gap-3 p-3">
                <div className="text-muted small">
                  Hiển thị <strong>{startItem}</strong> - <strong>{endItem}</strong> trên tổng số{' '}
                  <strong>{totalItems}</strong> sản phẩm
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

export default ProductDetail
