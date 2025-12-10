import React, { useEffect, useState } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCol,
  CContainer,
  CRow,
  CFormSelect,
  CTable,
} from '@coreui/react'
import { Link } from 'react-router-dom'

import { axiosClient } from '../../axiosConfig'
import moment from 'moment'
import { mainUrl } from '../../axiosConfig'

import './css/dashboard.css'
import ReactPaginate from 'react-paginate'

const NewDashboard = () => {
  const [adminLogData, setAdminLogData] = useState([])
  const [dashBoardData, setDashBoardData] = useState({})
  const [staticData, setStaticData] = useState([])
  const [timePeriod, setTimePeriod] = useState('Tuần')
  const [username, setUsername] = useState('')
  const [memberType, setMemberType] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  //pagination state
  const [pageNumber, setPageNumber] = useState(1)

  // logs admin
  const fetchAdminLogData = async () => {
    try {
      const response = await axiosClient.get(`admin/admin-log`)

      if (response.data.status === true) {
        setAdminLogData(response.data.listLog)
      }
    } catch (error) {
      console.error('Fetch admin log data is error', error)
    }
  }

  useEffect(() => {
    fetchAdminLogData()
  }, [])

  // statistical data

  const fetchStatictical = async () => {
    try {
      const response = await axiosClient.get(
        `admin/get-statistics?page=${pageNumber}&member_type=${memberType}&data=${searchTerm}`,
      )

      if (response.data.status === true) {
        setStaticData(response.data)
      }
    } catch (error) {
      console.error('Fetch statictical data is error', error)
    }
  }

  useEffect(() => {
    fetchStatictical()
  }, [pageNumber, memberType, searchTerm])

  // dashboard data

  const fetchDashBoardData = async () => {
    try {
      const response = await axiosClient.get('admin/dashboard')
      if (response.data.status === true) {
        setDashBoardData(response.data)
      }
    } catch (error) {
      console.error('Fetch data dashboard is error', error)
    }
  }

  useEffect(() => {
    fetchDashBoardData()
  }, [])

  useEffect(() => {
    const name = localStorage.getItem('username') || 'Đại lý'
    setUsername(name)
  }, [])

  const columnsVisited = [
    {
      key: 'username',
      label: 'Khách hàng',
      _props: { scope: 'col' },
    },
    {
      key: 'url',
      label: 'Sản phẩm quan tâm',
      _props: { scope: 'col' },
    },
    {
      key: 'module',
      label: 'Danh mục',
      _props: { scope: 'col' },
    },
    {
      key: 'action',
      label: 'Hành động',
      _props: { scope: 'col' },
    },
    {
      key: 'ip',
      label: 'Địa chỉ IP',
      _props: { scope: 'col' },
    },
  ]

  const itemsVisited =
    staticData?.data && staticData?.data.length > 0
      ? staticData?.data.map((item, index) => ({
          index: index + 1,
          visited: item?.count,
          username: item?.member?.full_name ? item?.member?.full_name : 'Khách tiềm năng',
          url: (
            <Link target="_blank" to={`${mainUrl}${item?.url}`}>
              {item?.url}
            </Link>
          ),
          module: item?.module,
          action: item?.action,
          ip: item?.ip,
          _cellProps: { id: { scope: 'row' } },
        }))
      : []

  const columns = [
    {
      key: 'username',
      label: 'Đại lý',
      _props: { scope: 'col' },
    },
    {
      key: 'page',
      label: 'Chức năng',
      _props: { scope: 'col' },
    },
    {
      key: 'actions',
      label: 'Hoạt động',
      _props: { scope: 'col' },
    },
    {
      key: 'nameID',
      label: 'Mã/Tên',
      _props: { scope: 'col' },
    },

    {
      key: 'ip',
      label: 'IP Address',
      _props: { scope: 'col' },
    },
  ]

  const items =
    adminLogData?.data && adminLogData?.data.length > 0
      ? adminLogData?.data.map((log) => ({
          username: log?.username,
          page: log?.cat,
          actions: log?.action,
          nameID: log?.display_name,
          ip: log?.ip,
          _cellProps: { id: { scope: 'row' } },
        }))
      : []

  const getDateRange = (period) => {
    const today = moment()
    let startDate

    if (period === 'Tuần') {
      startDate = today.clone().startOf('week')
    } else if (period === 'Tháng') {
      startDate = today.clone().startOf('month')
    } else if (period === 'Năm') {
      startDate = today.clone().startOf('year')
    }

    return `${moment(startDate).format('DD/MM/YYYY')} - ${moment(today).format('DD/MM/YYYY')}`
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

  // Handler cho member type filter
  const handleMemberTypeChange = (e) => {
    setMemberType(e.target.value)
    setPageNumber(1) // Reset về trang 1 khi filter
  }

  // Handler cho search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
  }

  // Filter items based on search term
  const filteredItemsVisited = itemsVisited.filter((item) => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return (
      item.username?.toLowerCase().includes(searchLower) ||
      item.module?.toLowerCase().includes(searchLower) ||
      item.action?.toLowerCase().includes(searchLower)
    )
  })

  return (
    <div>
      <CContainer fluid className="py-4">
        {/* KPI Cards - Bigger and More Prominent */}
        <CRow className="g-4 mb-4">
          <CCol xl={3} lg={6} md={6}>
            <CCard
              className="kpi-card-large gradient-green shadow-sm"
              style={{ border: 'none', borderRadius: '8px' }}
            >
              <CCardBody className="p-4">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <div className="kpi-label-large mb-2">📦 Tổng đơn hàng</div>
                    <div className="kpi-value-large">{dashBoardData?.order || '0'}</div>
                  </div>
                  <div className="kpi-icon-large">
                    <i className="fas fa-shopping-cart"></i>
                  </div>
                </div>
              </CCardBody>
            </CCard>
          </CCol>

          <CCol xl={3} lg={6} md={6}>
            <CCard
              className="kpi-card-large gradient-blue shadow-sm"
              style={{ border: 'none', borderRadius: '8px' }}
            >
              <CCardBody className="p-4">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <div className="kpi-label-large mb-2">🎁 Tổng sản phẩm</div>
                    <div className="kpi-value-large">{dashBoardData?.product || '0'}</div>
                  </div>
                  <div className="kpi-icon-large">
                    <i className="fas fa-box-open"></i>
                  </div>
                </div>
              </CCardBody>
            </CCard>
          </CCol>

          <CCol xl={3} lg={6} md={6}>
            <CCard
              className="kpi-card-large gradient-purple shadow-sm"
              style={{ border: 'none', borderRadius: '8px' }}
            >
              <CCardBody className="p-4">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <div className="kpi-label-large mb-2">👥 Tổng thành viên</div>
                    <div className="kpi-value-large">{dashBoardData?.member || '0'}</div>
                  </div>
                  <div className="kpi-icon-large">
                    <i className="fas fa-users"></i>
                  </div>
                </div>
              </CCardBody>
            </CCard>
          </CCol>

          <CCol xl={3} lg={6} md={6}>
            <CCard
              className="kpi-card-large gradient-orange shadow-sm"
              style={{ border: 'none', borderRadius: '8px' }}
            >
              <CCardBody className="p-4">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <div className="kpi-label-large mb-2">👁️ Tổng lượt truy cập</div>
                    <div className="kpi-value-large">{dashBoardData?.statistics || '0'}</div>
                  </div>
                  <div className="kpi-icon-large">
                    <i className="fas fa-eye"></i>
                  </div>
                </div>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
        {/* Hero Card */}
        <CCard className="shadow-sm hero-card mb-4" style={{ border: 'none', borderRadius: '8px' }}>
          <div className="p-4 text-white position-relative hero-inner">
            <CRow className="align-items-center">
              <CCol lg={9} className="mb-4 mb-lg-0">
                <h2 className="mb-3 fw-bold hero-title">
                  🏪 Chào mừng đến với hệ thống quản lý Nguyên Kim Đại lý
                </h2>
                <p className="mb-3 fs-5">
                  Xin chào, <strong className="text-warning fw-bold">{username}</strong>!
                </p>
                <p className="mb-4 hero-desc">
                  Quản lý đơn hàng, khách hàng, hoa hồng và hiệu suất bán hàng trên một giao diện
                  hiện đại.
                </p>
                <div className="d-flex gap-3 flex-wrap">
                  <Link to="/order">
                    <CButton color="light" className="dash-btn">
                      📦 Đơn hàng
                    </CButton>
                  </Link>
                  <Link to="/member">
                    <CButton color="warning" className="dash-btn text-dark">
                      👥 Khách hàng
                    </CButton>
                  </Link>
                </div>
              </CCol>
              <CCol lg={3} className="text-center">
                <div className="hero-emoji">🤝</div>
                <div className="text-white fs-6 fw-medium hero-note">
                  Chúc bạn bán hàng thành công!
                </div>
              </CCol>
            </CRow>
          </div>
        </CCard>
        <CRow className="g-4 mb-4">
          <CCol xs={12}>
            <CCard
              className="equal-card"
              style={{
                border: '1px solid #e5e5e5',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              }}
            >
              <CCardBody className="p-4">
                <div className="section-head">
                  <div className="icon-wrap bg-primary text-white">👥</div>
                  <h5 className="mb-0 fw-bold">Khách hàng & Sản phẩm quan tâm</h5>
                </div>
                <CRow className="mb-3">
                  <CCol md={4}>
                    <div
                      className="input-group small-input"
                      style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}
                    >
                      <span
                        className="input-group-text bg-light border-end-0"
                        style={{ borderRadius: '0' }}
                      >
                        <i className="fas fa-filter text-muted"></i>
                      </span>
                      <CFormSelect
                        className="border-start-0"
                        style={{ borderRadius: '0' }}
                        value={memberType}
                        onChange={handleMemberTypeChange}
                        options={[
                          { label: '-- Tất cả loại khách hàng --', value: '' },
                          { label: '🛍️ Nội bộ', value: 'internal' },
                          { label: '⭐ Thành viên', value: 'member' },
                          { label: '💝 Vãng lai', value: 'guest' },
                        ]}
                      />
                    </div>
                  </CCol>
                  <CCol md={8}>
                    <div
                      className="input-group small-input"
                      style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}
                    >
                      <span
                        className="input-group-text bg-light border-end-0"
                        style={{ borderRadius: '0' }}
                      >
                        <i className="fas fa-search text-muted"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control border-start-0"
                        style={{ borderRadius: '0' }}
                        placeholder="🔍 Tìm kiếm khách hàng hoặc sản phẩm..."
                        value={searchTerm}
                        onChange={handleSearch}
                      />
                    </div>
                  </CCol>
                </CRow>
                <div className="table-responsive compact-table">
                  <CTable
                    hover
                    bordered
                    striped
                    style={{ fontSize: 14, boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}
                    columns={columnsVisited}
                    items={filteredItemsVisited}
                  />
                </div>
                <div className="d-flex justify-content-end mt-3">
                  <ReactPaginate
                    pageCount={Math.ceil(
                      staticData?.pagination?.total / staticData?.pagination?.per_page,
                    )}
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
                    containerClassName={'pagination pagination-sm'}
                    activeClassName={'active'}
                    previousLabel={'<< Trước'}
                    nextLabel={'Sau >>'}
                  />
                </div>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
        {/* Activity History Table - Full Width */}
        <CRow className="g-4">
          <CCol xs={12}>
            <CCard
              className="equal-card"
              style={{
                border: '1px solid #e5e5e5',
                borderRadius: '8px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              }}
            >
              <CCardBody className="p-4">
                <div className="section-head">
                  <div className="icon-wrap bg-success text-white">📊</div>
                  <h5 className="mb-0 fw-bold">Lịch sử hoạt động</h5>
                </div>
                <div className="table-responsive compact-table">
                  <CTable
                    hover
                    striped
                    style={{ fontSize: 14, boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}
                    columns={columns}
                    items={items}
                  />
                </div>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default NewDashboard
