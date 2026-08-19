import {
  CButton,
  CFormCheck,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

import './css/member.scss'

import CIcon from '@coreui/icons-react'
import { cilColorBorder, cilUser } from '@coreui/icons'
import DeletedModal from '../../components/deletedModal/DeletedModal'
import { axiosClient } from '../../axiosConfig'
import moment from 'moment'
import ReactPaginate from 'react-paginate'
import Loading from '../../components/loading/Loading'

function Member() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const pageFromUrl = parseInt(searchParams.get('page')) || 1
  const [pageNumber, setPageNumber] = useState(pageFromUrl)

  useEffect(() => {
    setSearchParams({ page: pageNumber })
  }, [pageNumber, setSearchParams])

  const [memberData, setMemberData] = useState([])
  const [countMember, setCountMember] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  const [isAllCheckbox, setIsAllCheckbox] = useState(false)
  const [selectedCheckbox, setSelectedCheckbox] = useState([])

  const [isCollapse, setIsCollapse] = useState(false)
  const [dataSearch, setDataSearch] = useState('')
  const [visible, setVisible] = useState(false)
  const [isPermissionCheck, setIsPermissionCheck] = useState(true)

  const handleToggleCollapse = () => {
    setIsCollapse((prevState) => !prevState)
  }

  const fetchMemberData = async (keyword = '') => {
    try {
      setIsLoading(true)
      const response = await axiosClient.get(`admin/member?page=${pageNumber}&data=${keyword}`)

      if (response.data.status === true) {
        setMemberData(response.data.data?.items || [])
        setCountMember(response.data.data?.pagination?.total || 0)
      }

      if (response.data.status === false && response.data.mess === 'no permission') {
        setIsPermissionCheck(false)
      }
    } catch (error) {
      console.error('Fetch member data is error', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMemberData(dataSearch)
  }, [pageNumber])

  const handlePageChange = ({ selected }) => {
    const newPage = selected + 1
    setPageNumber(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSearch = (keyword) => {
    setPageNumber(1)
    fetchMemberData(keyword)
  }

  const handleEditClick = (id) => {
    navigate(`/member/edit?id=${id}`)
  }

  const columns = [
    {
      key: 'id',
      label: (
        <CFormCheck
          checked={isAllCheckbox}
          onChange={(e) => {
            const isChecked = e.target.checked
            setIsAllCheckbox(isChecked)
            if (isChecked) {
              const allChecks = memberData?.map((item) => item.id) || []
              setSelectedCheckbox(allChecks)
            } else {
              setSelectedCheckbox([])
            }
          }}
        />
      ),
      _props: { scope: 'col', className: 'text-center' },
    },
    { key: 'username', label: 'Tên đăng nhập', _props: { scope: 'col' } },
    { key: 'customerInfo', label: 'Thông tin khách hàng / Đại lý', _props: { scope: 'col' } },
    { key: 'support', label: 'Sale hỗ trợ', _props: { scope: 'col' } },
    { key: 'createDate', label: 'Ngày đồng bộ', _props: { scope: 'col' } },
    {
      key: 'status',
      label: 'Trạng thái tài khoản',
      _props: { scope: 'col', className: 'text-center' },
    },
    { key: 'actions', label: 'Tác vụ', _props: { scope: 'col', className: 'text-center' } },
  ]

  const items =
    memberData && memberData?.length > 0
      ? memberData?.map((customer) => ({
          id: (
            <CFormCheck
              key={customer?.id}
              defaultChecked={customer?.id}
              id={`flexCheckDefault_${customer?.id}`}
              value={customer?.id}
              checked={selectedCheckbox.includes(customer?.id)}
              onChange={(e) => {
                const customerId = customer?.id
                const isChecked = e.target.checked
                if (isChecked) {
                  setSelectedCheckbox([...selectedCheckbox, customerId])
                } else {
                  setSelectedCheckbox(selectedCheckbox.filter((id) => id !== customerId))
                }
              }}
            />
          ),
          username: (
            <div className="d-flex align-items-center gap-2">
              <div
                className="rounded-circle bg-primary bg-opacity-10 text-primary fw-bold d-flex align-items-center justify-content-center flex-shrink-0"
                style={{ width: '36px', height: '36px', fontSize: '13px' }}
              >
                <CIcon icon={cilUser} />
              </div>
              <div>
                <div
                  className="fw-bold text-dark cursor-pointer"
                  style={{ fontSize: '13.5px' }}
                  onClick={() => handleEditClick(customer?.id)}
                >
                  {customer?.username || '—'}
                </div>
              </div>
            </div>
          ),
          customerInfo: (
            <div className="d-flex flex-column gap-1" style={{ maxWidth: '300px' }}>
              <div className="fw-bold text-primary" style={{ fontSize: '13.5px' }}>
                {customer?.full_name || 'Chưa cập nhật tên'}
              </div>
              <div className="d-flex flex-wrap align-items-center gap-2">
                {customer?.member_code && (
                  <span
                    className="badge bg-warning bg-opacity-10 text-warning border border-warning border-opacity-25 px-2 py-0.5"
                    style={{ fontSize: '11px' }}
                  >
                    Mã KH: {customer.member_code}
                  </span>
                )}
                {customer?.tax_code && (
                  <span
                    className="badge bg-light text-secondary border px-2 py-0.5"
                    style={{ fontSize: '11px' }}
                  >
                    MST: {customer.tax_code}
                  </span>
                )}
              </div>
              {customer?.company_name && (
                <div className="text-muted small text-truncate" title={customer.company_name}>
                  Công ty: {customer.company_name}
                </div>
              )}
            </div>
          ),
          support: (
            <div>
              {customer?.sales?.length > 0 ? (
                <span
                  className="badge bg-info bg-opacity-10 text-info border border-info border-opacity-25 px-2 py-1"
                  style={{ fontSize: '11.5px' }}
                >
                  {customer.sales.map((admin) => admin.display_name).join(', ')}
                </span>
              ) : (
                <span className="text-muted small">Chưa có sale hỗ trợ</span>
              )}
            </div>
          ),
          createDate: (
            <span className="text-secondary small">
              {customer?.created_at ? moment(customer.created_at).format('DD/MM/YYYY, HH:mm') : '—'}
            </span>
          ),
          status: (
            <div className="text-center">
              {customer?.status === 1 ? (
                <span
                  className="badge bg-success text-white px-2.5 py-1"
                  style={{ fontSize: '11px', fontWeight: 700 }}
                >
                  Đã duyệt
                </span>
              ) : (
                <span
                  className="badge bg-warning text-dark px-2.5 py-1"
                  style={{ fontSize: '11px', fontWeight: 700 }}
                >
                  Chưa duyệt
                </span>
              )}
            </div>
          ),
          actions: (
            <div className="d-flex justify-content-center">
              <button
                onClick={() => handleEditClick(customer?.id)}
                className="button-action bg-info"
                title="Chỉnh sửa thông tin thành viên"
              >
                <CIcon icon={cilColorBorder} className="text-white" />
              </button>
            </div>
          ),
          _cellProps: { id: { scope: 'row' } },
        }))
      : []

  const perPage = 10
  const totalPages = Math.ceil(countMember / perPage) || 1
  const startItem = countMember === 0 ? 0 : (pageNumber - 1) * perPage + 1
  const endItem = Math.min(pageNumber * perPage, countMember)

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
          <DeletedModal visible={visible} setVisible={setVisible} />

          {/* PAGE HEADER */}
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4 pb-2 border-bottom">
            <div>
              <h3 className="fw-bold text-uppercase text-dark m-0">QUẢN LÝ THÀNH VIÊN / ĐẠI LÝ</h3>
              <p className="text-muted text-xs m-0 mt-1">
                Quản lý danh sách tài khoản thành viên đại lý, mã khách hàng, sale hỗ trợ và trạng
                thái duyệt
              </p>
            </div>
            <div className="d-flex flex-wrap gap-2">
              <Link to="/member/create">
                <CButton color="primary" size="sm" className="fw-bold px-3 shadow-xs">
                  + Tạo tài khoản website
                </CButton>
              </Link>
              <Link to="/member">
                <CButton color="light" size="sm" className="border fw-semibold shadow-xs">
                  Danh sách thành viên
                </CButton>
              </Link>
            </div>
          </div>

          {/* PRESERVED FILTER TABLE */}
          <div className="mb-4">
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
              {!isCollapse ? (
                <tbody>
                  <tr>
                    <td>Tổng cộng</td>
                    <td className="total-count">{countMember || 0} thành viên</td>
                  </tr>
                  <tr>
                    <td>Tìm kiếm</td>
                    <td>
                      <div className="d-flex gap-2 align-items-center mt-1">
                        <input
                          type="text"
                          className="search-input flex-grow-1"
                          placeholder="Tìm kiếm theo MÃ KHÁCH HÀNG, HỌ TÊN, MÃ SỐ THUẾ, CÔNG TY..."
                          value={dataSearch}
                          onChange={(e) => setDataSearch(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSearch(dataSearch)
                          }}
                        />
                        <button onClick={() => handleSearch(dataSearch)} className="submit-btn">
                          Tìm kiếm
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              ) : null}
            </table>
          </div>

          {/* DATA TABLE CARD */}
          <div className="card border-0 shadow-sm rounded-3 overflow-hidden bg-white mb-4">
            {isLoading ? (
              <div className="p-5 text-center">
                <Loading />
              </div>
            ) : items.length === 0 ? (
              <div className="p-5 text-center text-muted">
                <h6 className="fw-bold text-dark">Chưa tìm thấy tài khoản thành viên nào</h6>
                <p className="small text-muted mb-0">
                  Thử thay đổi từ khóa tìm kiếm hoặc bấm nút &quot;+ Tạo tài khoản website&quot; để
                  thêm mới.
                </p>
              </div>
            ) : (
              <div className="table-responsive">
                <CTable hover className="align-middle mb-0">
                  <thead>
                    <CTableRow
                      className="bg-light text-secondary text-uppercase"
                      style={{ fontSize: '11.5px' }}
                    >
                      {columns.map((column) => (
                        <CTableHeaderCell key={column.key} className={column._props?.className}>
                          {column.label}
                        </CTableHeaderCell>
                      ))}
                    </CTableRow>
                  </thead>
                  <CTableBody>
                    {items.map((item, index) => (
                      <CTableRow key={index}>
                        {columns.map((column) => (
                          <CTableDataCell key={column.key} className={column._props?.className}>
                            {item[column.key]}
                          </CTableDataCell>
                        ))}
                      </CTableRow>
                    ))}
                  </CTableBody>
                </CTable>
              </div>
            )}

            {/* PAGINATION FOOTER */}
            {countMember > 0 && (
              <div className="card-footer bg-white border-top d-flex flex-wrap justify-content-between align-items-center gap-3 p-3">
                <div className="text-muted small">
                  Hiển thị <strong>{startItem}</strong> - <strong>{endItem}</strong> trên tổng số{' '}
                  <strong>{countMember}</strong> thành viên
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

export default Member
