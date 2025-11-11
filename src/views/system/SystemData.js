import React, { useEffect, useState } from 'react'
import {
  CTable,
  CTableBody,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
  CContainer,
  CRow,
  CCol,
} from '@coreui/react'
import { axiosClient } from '../../axiosConfig'
import Loading from '../../components/loading/Loading'
import { toast } from 'react-toastify'
import moment from 'moment/moment'
import { Link } from 'react-router-dom'

function SystemData() {
  const [nameTableData, setNameTableData] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  // check permission state
  const [isPermissionCheck, setIsPermissionCheck] = useState(true)

  const fetchDataSystem = async () => {
    try {
      setIsLoading(true)
      const response = await axiosClient.get('/name-table-backup-database')
      const data = response.data.data

      if (data) {
        setNameTableData(data)
      }

      if (response.data.status === false && response.data.mess == 'no permission') {
        setIsPermissionCheck(false)
      }
    } catch (error) {
      console.error('Fetch data system is error', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDataSystem()
  }, [])

  const handleSubmit = async (tableName) => {
    try {
      const response = await axiosClient({
        url: `backup-database/${tableName}`,
        method: 'GET',
        responseType: 'blob',
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${tableName}_table.sql`)
      document.body.appendChild(link)
      link.click()
      link.remove()

      // Dọn dẹp URL Blob
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error to get backup data', error)
      toast.error('Đã xảy ra lỗi. Vui lòng thử lại!')
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
          <CRow className="mb-3">
            <CCol>
              <h2>QUẢN LÝ DỮ LIỆU</h2>
            </CCol>
          </CRow>

          {isLoading ? (
            <Loading />
          ) : (
            <CRow>
              <h6>Thông tin dữ liệu</h6>
              <CTable hover align="middle" className="mb-0 border" responsive>
                <CTableHead color="light">
                  <CTableRow>
                    <CTableHeaderCell>Table</CTableHeaderCell>
                    <CTableHeaderCell>Row</CTableHeaderCell>
                    <CTableHeaderCell>Data Size</CTableHeaderCell>

                    <CTableHeaderCell>Create Time</CTableHeaderCell>
                    <CTableHeaderCell>Update Time</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {nameTableData && nameTableData?.length > 0
                    ? nameTableData.map((item, index) => (
                        <CTableRow key={index}>
                          <CTableDataCell>
                            <div
                              style={{
                                color: 'blue',
                                textDecoration: 'underline',
                                cursor: 'pointer',
                              }}
                              onClick={() => handleSubmit(item?.nameTable)}
                            >
                              {item?.nameTable}
                            </div>
                          </CTableDataCell>
                          <CTableDataCell>{item?.rowCount}</CTableDataCell>
                          <CTableDataCell>{item?.dataSize}</CTableDataCell>
                          <CTableDataCell>
                            {moment(item?.creationTime).format('hh:mm:ss A, DD/MM/YYYY')}
                          </CTableDataCell>
                          <CTableDataCell>
                            {moment(item?.updateTime).format('hh:mm:ss A, DD/MM/YYYY')}
                          </CTableDataCell>
                        </CTableRow>
                      ))
                    : 'Không có dữ liệu'}
                </CTableBody>
              </CTable>
            </CRow>
          )}
        </>
      )}
    </div>
  )
}

export default SystemData
