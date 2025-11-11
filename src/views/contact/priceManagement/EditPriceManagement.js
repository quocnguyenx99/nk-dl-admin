import { CButton, CCol, CContainer, CFormSelect, CRow } from '@coreui/react'
import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { axiosClient } from '../../../axiosConfig'
import moment from 'moment'

import '../css/editPriceManagement.css'
import Loading from '../../../components/loading/Loading'

function EditPriceManagement() {
  const [isCollapse, setIsCollapse] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const id = searchParams.get('id')

  // check permission state
  const [isPermissionCheck, setIsPermissionCheck] = useState(true)

  const [priceManagementData, setPriceManagementData] = useState({})

  const handleToggleCollapse = () => {
    setIsCollapse((prevState) => !prevState)
  }

  const fetchDataById = async () => {
    try {
      setIsLoading(true)
      const response = await axiosClient.get(`/admin/contact-qoute/${id}/edit`)

      if (response.data.status === true) {
        setPriceManagementData(response.data.contactQoute)
      } else {
        console.error('No data found for the given ID.')
      }

      if (response.data.status === false && response.data.mess == 'no permission') {
        setIsPermissionCheck(false)
      }
    } catch (error) {
      console.error('Fetch price management id is error', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDataById()
  }, [])

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
          {isLoading ? (
            <Loading />
          ) : (
            <>
              <CRow className="mb-3">
                <CCol>
                  <h2>CHI TIẾT BÁO GIÁ</h2>
                </CCol>
                <CCol md={{ span: 4, offset: 4 }}>
                  <div className="d-flex justify-content-end">
                    <Link to={`/price-management`}>
                      <CButton color="primary" type="submit" size="sm">
                        Danh sách
                      </CButton>
                    </Link>
                  </div>
                </CCol>
              </CRow>

              <CRow>
                <CCol>
                  <table className="filter-table">
                    <thead>
                      <tr>
                        <th colSpan="2">
                          <div className="d-flex justify-content-between">
                            <span>Chi tiết liên lạc</span>
                            <span className="toggle-pointer" onClick={handleToggleCollapse}>
                              {isCollapse ? '▼' : '▲'}
                            </span>
                          </div>
                        </th>
                      </tr>
                    </thead>
                    {!isCollapse && (
                      <tbody>
                        {priceManagementData && Object.keys(priceManagementData).length > 0 ? (
                          <>
                            <tr>
                              <td>ID</td>
                              <td style={{ fontWeight: 600 }}>{priceManagementData?.id}</td>
                            </tr>
                            <tr>
                              <td>Họ tên</td>
                              <td style={{ fontWeight: 600 }}>{priceManagementData?.name}</td>
                            </tr>
                            <tr>
                              <td>Điện thoại</td>
                              <td className="blue-txt">{priceManagementData?.phone}</td>
                            </tr>
                            <tr>
                              <td>Thư điện tử</td>
                              <td className="blue-txt">{priceManagementData?.email}</td>
                            </tr>
                            <tr>
                              <td>Tên công ty</td>
                              <td>{priceManagementData?.company}</td>
                            </tr>
                            <tr>
                              <td>Địa chỉ</td>
                              <td>{priceManagementData?.address}</td>
                            </tr>
                            <tr>
                              <td>File đính kèm</td>
                              <td>{}</td>
                            </tr>
                            <tr>
                              <td>Nội dung</td>
                              <td>{priceManagementData?.content}</td>
                            </tr>
                            <tr>
                              <td>Ngày gửi</td>
                              <td>
                                {moment
                                  .unix(priceManagementData?.date_post)
                                  .format('hh:mm:ss A , DD/MM/YYYY')}
                              </td>
                            </tr>
                          </>
                        ) : (
                          'Không có dữ liệu báo giá về id này!'
                        )}
                      </tbody>
                    )}
                  </table>
                </CCol>
              </CRow>
              <CRow className="mt-4">
                <Link to={'/price-management'}>
                  <CButton color="primary" size="sm">
                    Trở lại
                  </CButton>
                </Link>
              </CRow>
            </>
          )}
        </>
      )}
    </div>
  )
}

export default EditPriceManagement
