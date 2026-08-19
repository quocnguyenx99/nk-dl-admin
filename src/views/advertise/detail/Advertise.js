import { cilColorBorder, cilTrash } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { CButton, CCol, CFormCheck, CFormSelect, CImage, CRow, CTable } from '@coreui/react'
import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { axiosClient, imageBaseUrl } from '../../../axiosConfig'

import ReactPaginate from 'react-paginate'
import DeletedModal from '../../../components/deletedModal/DeletedModal'
import { toast } from 'react-toastify'
import Loading from '../../../components/loading/Loading'

function Advertise() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const pageFromUrl = parseInt(searchParams.get('page')) || 1
  const [pageNumber, setPageNumber] = useState(pageFromUrl)

  useEffect(() => {
    setSearchParams({ page: pageNumber })
  }, [pageNumber, setSearchParams])

  const [isPermissionCheck, setIsPermissionCheck] = useState(true)
  const [dataAdvertise, setDataAdvertise] = useState([])
  const [dataAdvertisePos, setDataAdvertisePos] = useState([])
  const [selectedPosition, setSelectedPosition] = useState('')

  const [isLoading, setIsLoading] = useState(false)
  const [visible, setVisible] = useState(false)
  const [deletedId, setDeletedId] = useState(null)

  const [isAllCheckbox, setIsAllCheckbox] = useState(false)
  const [selectedCheckbox, setSelectedCheckbox] = useState([])
  const [isCollapse, setIsCollapse] = useState(false)

  const handleToggleCollapse = () => {
    setIsCollapse((prevState) => !prevState)
  }

  const [dataSearch, setDataSearch] = useState('')

  const handleAddNewClick = () => {
    navigate('/advertise/add')
  }

  const handleEditClick = (id) => {
    navigate(`/advertise/edit?id=${id}`)
  }

  const handleSearch = (keyword) => {
    fetchDataAdvertise(keyword)
  }

  const fetchDataAdvertisePos = async () => {
    try {
      const response = await axiosClient.get(`admin/ad-pos`)
      if (response.data.status === 'success') {
        setDataAdvertisePos(response.data.list)
      }
    } catch (error) {
      console.error('Fetch data ad-pos is error', error)
    }
  }

  useEffect(() => {
    fetchDataAdvertisePos()
  }, [])

  const fetchDataAdvertise = async (dataSearchKey = '') => {
    try {
      setIsLoading(true)
      const response = await axiosClient.get(
        `admin/advertise?data=${dataSearchKey}&page=${pageNumber}&pos=${selectedPosition}`,
      )

      if (response.data.status === true) {
        setDataAdvertise(response.data.list)
      }

      if (response.data.status === false && response.data.mess === 'no permission') {
        setIsPermissionCheck(false)
      }
    } catch (error) {
      console.error('Fetch advertise list error', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDataAdvertise()
  }, [pageNumber, selectedPosition])

  const handlePageChange = ({ selected }) => {
    const newPage = selected + 1
    setPageNumber(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async () => {
    setVisible(true)
    try {
      const response = await axiosClient.delete(`admin/advertise/${deletedId}`)
      if (response.data.status === true) {
        setVisible(false)
        fetchDataAdvertise()
        toast.success('Xóa quảng cáo thành công!')
      }

      if (response.data.status === false && response.data.mess === 'no permission') {
        toast.warn('Bạn không có quyền thực hiện tác vụ này!')
      }
    } catch (error) {
      console.error('Delete advertise id is error', error)
      toast.error('Đã xảy ra lỗi khi xóa. Vui lòng thử lại!')
    }
  }

  const handleDeleteSelectedCheckbox = async () => {
    try {
      const response = await axiosClient.post('admin/delete-all-advertise', {
        data: selectedCheckbox,
      })
      if (response.data.status === true) {
        toast.success('Đã xóa các mục được chọn!')
        fetchDataAdvertise()
        setSelectedCheckbox([])
      }
    } catch (error) {
      console.error('Deleted all id checkbox is error', error)
    }
  }

  const items =
    dataAdvertise?.data && dataAdvertise?.data?.length > 0
      ? dataAdvertise?.data.map((item) => ({
          id: (
            <CFormCheck
              key={item?.id}
              aria-label="Select item"
              defaultChecked={item?.id}
              id={`flexCheckDefault_${item?.id}`}
              value={item?.id}
              checked={selectedCheckbox.includes(item?.id)}
              onChange={(e) => {
                const advertiseId = item?.id
                const isChecked = e.target.checked
                if (isChecked) {
                  setSelectedCheckbox([...selectedCheckbox, advertiseId])
                } else {
                  setSelectedCheckbox(selectedCheckbox.filter((id) => id !== advertiseId))
                }
              }}
            />
          ),
          image: (
            <div
              className="d-flex justify-content-center align-items-center bg-light rounded p-1"
              style={{ maxWidth: '160px', minHeight: '60px' }}
            >
              <CImage
                style={{ maxWidth: '100%', maxHeight: '60px', objectFit: 'contain' }}
                src={`${imageBaseUrl}${item.picture}`}
                alt={`Banner ${item?.id}`}
                loading="lazy"
                onError={(e) => {
                  e.target.onerror = null
                  e.target.src = `${imageBaseUrl}no-images.jpg`
                }}
              />
            </div>
          ),
          url: (
            <div style={{ maxWidth: '280px' }}>
              {item?.link ? (
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary fw-semibold text-truncate d-block"
                  style={{ fontSize: '13px' }}
                  title={item.link}
                >
                  {item.link}
                </a>
              ) : (
                <span className="text-muted small">Không có liên kết</span>
              )}
            </div>
          ),
          dimension: (
            <span
              className="badge bg-light text-dark border px-2 py-1"
              style={{ fontSize: '11px' }}
            >
              {`${item.width || 0} x ${item.height || 0} px`}
            </span>
          ),
          actions: (
            <div className="d-flex justify-content-center">
              <button
                onClick={() => handleEditClick(item.id)}
                className="button-action mr-2 bg-info"
                title="Sửa quảng cáo"
              >
                <CIcon icon={cilColorBorder} className="text-white" />
              </button>
              <button
                onClick={() => {
                  setVisible(true)
                  setDeletedId(item.id)
                }}
                className="button-action bg-danger"
                title="Xóa quảng cáo"
              >
                <CIcon icon={cilTrash} className="text-white" />
              </button>
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
              const allIds = dataAdvertise?.data?.map((item) => item.id) || []
              setSelectedCheckbox(allIds)
            } else {
              setSelectedCheckbox([])
            }
          }}
        />
      ),
      _props: { scope: 'col', className: 'text-center' },
    },
    {
      key: 'image',
      label: 'Hình ảnh Banner',
      _props: { scope: 'col' },
    },
    {
      key: 'url',
      label: 'Đường dẫn liên kết',
      _props: { scope: 'col' },
    },
    {
      key: 'dimension',
      label: 'Kích thước (WxH)',
      _props: { scope: 'col' },
    },
    {
      key: 'actions',
      label: 'Tác vụ',
      _props: { scope: 'col', className: 'text-center' },
    },
  ]

  const totalItems = dataAdvertise?.total || 0
  const perPage = dataAdvertise?.per_page || 10
  const totalPages = Math.ceil(totalItems / perPage) || 1
  const startItem = totalItems === 0 ? 0 : (pageNumber - 1) * perPage + 1
  const endItem = Math.min(pageNumber * perPage, totalItems)

  return (
    <div className="pb-4">
      {!isPermissionCheck ? (
        <div className="card shadow-sm p-4 text-center">
          <h5 className="text-danger fw-bold mb-2">
            Bạn không đủ quyền để thao tác trên danh mục quản trị này.
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
              <h3 className="fw-bold text-uppercase text-dark m-0">QUẢN LÝ ADVERTISE / BANNER</h3>
              <p className="text-muted text-xs m-0 mt-1">
                Quản lý các banner quảng cáo, liên kết chuyển hướng và vị trí hiển thị
              </p>
            </div>
            <div className="d-flex flex-wrap gap-2">
              <CButton
                onClick={handleAddNewClick}
                color="primary"
                size="sm"
                className="fw-bold px-3 shadow-xs"
              >
                + Thêm mới banner
              </CButton>
              <Link to={'/advertise/category'}>
                <CButton color="light" size="sm" className="border fw-semibold shadow-xs">
                  Quản lý vị trí
                </CButton>
              </Link>
            </div>
          </div>

          {/* PRESERVED FILTER TABLE */}
          <CRow className="mb-4">
            <CCol col={12}>
              <table className="filter-table">
                <thead>
                  <tr>
                    <th colSpan="2">
                      <div className="d-flex justify-content-between align-items-center">
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
                      <td className="total-count">{dataAdvertise?.total || 0}</td>
                    </tr>
                    <tr>
                      <td>Lọc theo vị trí</td>
                      <td>
                        <CFormSelect
                          className="component-size w-50"
                          aria-label="Chọn vị trí lọc"
                          options={[
                            { label: 'Chọn vị trí', value: '' },
                            ...(dataAdvertisePos && dataAdvertisePos.length > 0
                              ? dataAdvertisePos.map((pos) => ({
                                  label: pos.title,
                                  value: pos.name,
                                }))
                              : []),
                          ]}
                          value={selectedPosition}
                          onChange={(e) => setSelectedPosition(e.target.value)}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td>Tìm kiếm</td>
                      <td>
                        <em>
                          <strong>Tìm kiếm theo từ khóa theo Tiêu đề, Danh mục vị trí</strong>
                        </em>
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
          </CRow>

          {/* BATCH ACTION BAR */}
          {selectedCheckbox.length > 0 && (
            <div className="alert alert-primary bg-primary bg-opacity-10 border-primary border-opacity-25 d-flex justify-content-between align-items-center p-2.5 px-3 rounded-3 mb-3">
              <div className="d-flex align-items-center gap-2">
                <span className="fw-bold text-primary">
                  Đã chọn {selectedCheckbox.length} quảng cáo
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

          {/* DATA TABLE CARD */}
          <div className="card border-0 shadow-sm rounded-3 overflow-hidden bg-white mb-4">
            {isLoading ? (
              <div className="p-5 text-center">
                <Loading />
              </div>
            ) : items.length === 0 ? (
              <div className="p-5 text-center text-muted">
                <h6 className="fw-bold text-dark">Chưa có banner quảng cáo nào</h6>
                <p className="small text-muted mb-0">
                  Nhấn nút &quot;+ Thêm mới banner&quot; ở góc trên để tạo banner quảng cáo đầu
                  tiên.
                </p>
              </div>
            ) : (
              <CTable hover className="align-middle mb-0" columns={columns} items={items} />
            )}

            {/* PAGINATION FOOTER */}
            {totalItems > 0 && (
              <div className="card-footer bg-white border-top d-flex flex-wrap justify-content-between align-items-center gap-3 p-3">
                <div className="text-muted small">
                  Hiển thị <strong>{startItem}</strong> - <strong>{endItem}</strong> trên tổng số{' '}
                  <strong>{totalItems}</strong> quảng cáo
                </div>
                <ReactPaginate
                  pageCount={totalPages}
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
                  containerClassName={'pagination mb-0'}
                  activeClassName={'active'}
                  previousLabel={'<<'}
                  nextLabel={'>>'}
                  forcePage={pageNumber - 1}
                />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default Advertise
