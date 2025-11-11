import React, { useEffect, useState } from 'react'

import { CCol, CContainer, CFormSelect, CRow, CTable } from '@coreui/react'

import WidgetsDropdown from '../widgets/WidgetsDropdown'
import { axiosClient } from '../../axiosConfig'
import moment from 'moment'
import { mainUrl } from '../../axiosConfig'

import './css/dashboard.css'
import ReactPaginate from 'react-paginate'
import { Link } from 'react-router-dom'

const Dashboard = () => {
  const [adminLogData, setAdminLogData] = useState([])
  const [dashBoardData, setDashBoardData] = useState({})
  const [staticData, setStaticData] = useState([])
  const [timePeriod, setTimePeriod] = useState('Tuần')

  //pagination state
  const [pageNumber, setPageNumber] = useState(1)

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

  const fetchStatictical = async () => {
    try {
      const response = await axiosClient.get(`admin/get-statistics?page=${pageNumber}`)

      if (response.data.status === true) {
        setStaticData(response.data.data)
      }
    } catch (error) {
      console.error('Fetch statictical data is error', error)
    }
  }

  useEffect(() => {
    fetchStatictical()
  }, [pageNumber])

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

  const columnsVisited = [
    {
      key: 'username',
      label: 'Name',
      _props: { scope: 'col' },
    },
    {
      key: 'url',
      label: 'Link truy cập',
      _props: { scope: 'col' },
    },
    {
      key: 'module',
      label: 'Module',
      _props: { scope: 'col' },
    },
    {
      key: 'action',
      label: 'action',
      _props: { scope: 'col' },
    },
    {
      key: 'ip',
      label: 'IP Address',
      _props: { scope: 'col' },
    },
  ]

  const itemsVisited =
    staticData?.data && staticData?.data.length > 0
      ? staticData?.data.map((item, index) => ({
          index: index + 1,
          visited: item?.count,
          username: item?.mem_id === 0 ? 'Khách vãng lai' : item?.member?.username,
          url: (
            <Link
              target="_blank"
              to={`${mainUrl}/${item?.module === 'product' ? 'detail-product' : item.module}/${item?.url}`}
            >
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
      label: 'Username',
      _props: { scope: 'col' },
    },
    {
      key: 'page',
      label: 'Page',
      _props: { scope: 'col' },
    },
    {
      key: 'actions',
      label: 'Action',
      _props: { scope: 'col' },
    },
    {
      key: 'nameID',
      label: 'Name/ID',
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

  return (
    <div>
      <CRow className="mb-3">
        <CCol md={6}>
          <h2>BẢNG ĐIỀU KHIỂN</h2>
        </CCol>
      </CRow>
      <WidgetsDropdown className="mb-4" dashBoardData={dashBoardData} />

      <CRow>
        <h6>Khách hàng có lượt truy cập nhiều nhất</h6>
        <CCol md={12} className="mb-3">
          <div className="input-group">
            <CFormSelect
              style={{ maxWidth: '200px' }}
              options={[
                { label: '-- Chọn bộ lọc --', value: 'All', disabled: true },
                { label: 'URL sản phẩm', value: 'url' },
                { label: 'Mã sản phẩm', value: 'masp' },
              ]}
            />

            <input
              type="text"
              className="form-control"
              placeholder="Tìm kiếm..."
              onChange={(e) => {
                const searchValue = e.target.value.toLowerCase()
                const filteredData = staticData?.data.filter((item) =>
                  item?.url?.toLowerCase().includes(searchValue),
                )
                setStaticData({ ...staticData, data: filteredData })
              }}
            />
          </div>
        </CCol>

        <CCol>
          <CTable
            hover
            bordered
            style={{ fontSize: 14 }}
            className="mt-2 mb-4"
            columns={columnsVisited}
            items={itemsVisited}
          />
          <div className="d-flex justify-content-end">
            <ReactPaginate
              pageCount={Math.ceil(staticData?.total / staticData?.per_page)}
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

      <CRow className="align-items-center">
        <CCol md={8}>
          <h6 style={{ fontWeight: 'bold' }}>Lịch sử hoạt động admin</h6>
          <CTable hover style={{ fontSize: 13 }} className="mt-2" columns={columns} items={items} />
        </CCol>
        <CCol md={4}>
          <div className="system-info">
            <h6 style={{ fontWeight: 'bold' }}>Thông tin hệ thống</h6>
            <ul>
              <li>
                <span role="img" aria-label="icon">
                  📄
                </span>
                <strong>PHP Version</strong>: 8.1.25
              </li>
              <li>
                <span role="img" aria-label="icon">
                  📄
                </span>
                <strong>MySQL Version</strong>: 10.4.32-MariaDB
              </li>
              <li>
                <span role="img" aria-label="icon">
                  📄
                </span>
                <strong>Server Software</strong>: LiteSpeed
              </li>
              <li>
                <span role="img" aria-label="icon">
                  📄
                </span>
                <strong>Client Browser</strong>: Mozilla/5.0 (Windows NT 10.0; Win64; x64)
                AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36
              </li>
              <li>
                <span role="img" aria-label="icon">
                  📄
                </span>
                <strong>IP Address</strong>: 192.168.245.190:8000
              </li>
              <li>
                <span role="img" aria-label="icon">
                  📄
                </span>
                <strong>Version</strong>: 3.1.9
              </li>
            </ul>
          </div>
        </CCol>
      </CRow>
    </div>
  )
}

export default Dashboard
