import {
  CButton,
  CCol,
  CContainer,
  CFormCheck,
  CRow,
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
import { cilColorBorder } from '@coreui/icons'
import DeletedModal from '../../components/deletedModal/DeletedModal'
import { axiosClient } from '../../axiosConfig'
import moment from 'moment/moment'
import ReactPaginate from 'react-paginate'

function Member() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const pageFromUrl = parseInt(searchParams.get('page')) || 1
  const [pageNumber, setPageNumber] = useState(pageFromUrl)

  useEffect(() => {
    setSearchParams({ page: pageNumber })
  }, [pageNumber, setSearchParams])

  const [memberData, setMemberData] = useState([])
  const [countMember, setCountMember] = useState('')

  const [isAllCheckbox, setIsAllCheckbox] = useState(false)
  const [selectedCheckbox, setSelectedCheckbox] = useState([])

  const [isCollapse, setIsCollapse] = useState(false)
  // search input
  const [dataSearch, setDataSearch] = useState('')

  // show deleted Modal
  const [visible, setVisible] = useState(false)

  // check permission stateq
  const [isPermissionCheck, setIsPermissionCheck] = useState(true)

  const handleToggleCollapse = () => {
    setIsCollapse((prevState) => !prevState)
  }

  const fetchMemberData = async (dataSearch = '') => {
    try {
      const response = await axiosClient.get(`admin/member?page=${pageNumber}&data=${dataSearch}`)

      if (response.data.status === true) {
        setMemberData(response.data.data?.items)
        setCountMember(response.data.data?.pagination.total || 0)
      }

      if (response.data.status === false && response.data.mess == 'no permission') {
        setIsPermissionCheck(false)
      }
    } catch (error) {
      console.error('Fetch member data is error', error)
    }
  }

  useEffect(() => {
    fetchMemberData()
  }, [pageNumber])

  // pagination data
  const handlePageChange = ({ selected }) => {
    const newPage = selected + 1
    setPageNumber(newPage)
    window.scrollTo(0, 0)
  }

  // search Data
  const handleSearch = (keyword) => {
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
    },
    { key: 'username', label: 'Username' },
    { key: 'customerInfo', label: 'Thông tin khách hàng' },
    { key: 'support', label: 'Sale hỗ trợ' },
    { key: 'createDate', label: 'Ngày đồng bộ' },
    { key: 'status', label: 'Trạng thái tài khoản' },
    { key: 'actions', label: 'Tác vụ' },
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
          username: customer?.username,
          customerInfo: (
            <React.Fragment>
              <div>
                <span>Họ tên: </span>
                <span className="customer-name">{customer?.full_name}</span>
              </div>
              <div>
                <span>Mã KH: </span>
                <span className="customer-name">{customer?.member_code}</span>
              </div>
              <div>
                <span>Công ty: </span>
                <span className="customer-name">{customer?.company_name}</span>
              </div>
              <div>
                <span>Mã số thuế: </span>
                <span className="customer-name">{customer?.tax_code}</span>
              </div>
            </React.Fragment>
          ),
          support: (
            <span className="customer-order">
              {customer?.sale_admins?.length > 0
                ? customer?.sale_admins?.map((admin) => `${admin.name}`).join(', ')
                : 'Chưa có sale hỗ trợ'}
            </span>
          ),
          createDate: (
            <span className="customer-registrationDate">
              {moment(customer?.created_at).format('DD-MM-YYYY, hh:mm:ss A')}
            </span>
          ),

          status: (
            <span className="customer-status">
              {customer?.is_blocked === 0 ? '[Đang hoạt động]' : '[Đã bị khóa]'}
            </span>
          ),
          actions: (
            <div style={{ width: 60 }}>
              <button
                onClick={() => handleEditClick(customer?.id)}
                className="button-action mr-2 bg-info"
              >
                <CIcon icon={cilColorBorder} className="text-white" />
              </button>
            </div>
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
          <DeletedModal visible={visible} setVisible={setVisible} />
          <CRow className="mb-3">
            <CCol>
              <h3>QUẢN LÝ THÀNH VIÊN</h3>
            </CCol>
            <CCol md={{ span: 4, offset: 4 }}>
              <div className="d-flex justify-content-end">
                <Link to={`/member`}>
                  <CButton color="primary" type="submit" size="sm">
                    Danh sách
                  </CButton>
                </Link>
              </div>
            </CCol>
          </CRow>

          <CRow>
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
                    <td className="total-count">{countMember || 0}</td>
                  </tr>
                  <tr>
                    <td>Tìm kiếm</td>
                    <td>
                      <div className="mt-2">
                        <input
                          type="text"
                          className="search-input"
                          placeholder="Tìm kiếm theo MÃ KHÁCH HÀNG, TÊN, MÃ SỐ THUẾ"
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
          </CRow>

          <CRow className="mt-3">
            <CTable>
              <thead>
                <tr>
                  {columns.map((column) => (
                    <CTableHeaderCell key={column.key} className="prevent-select">
                      {column.label}
                    </CTableHeaderCell>
                  ))}
                </tr>
              </thead>
              <CTableBody>
                {items.map((item, index) => (
                  <CTableRow key={index}>
                    {columns.map((column) => (
                      <CTableDataCell key={column.key}>{item[column.key]}</CTableDataCell>
                    ))}
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          </CRow>

          <div className="d-flex justify-content-end">
            <ReactPaginate
              pageCount={Math.ceil(countMember / 10)}
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
              forcePage={pageNumber - 1} // Đảm bảo pagination hiển thị đúng trang hiện tại
            />
          </div>
        </>
      )}
    </div>
  )
}

export default Member
