import React, { useEffect, useState, useParams } from 'react'
import {
  CButton,
  CCol,
  CContainer,
  CRow,
  CTable,
  CTableHeaderCell,
  CTableRow,
  CTableBody,
  CTableDataCell,
  CTableHead,
} from '@coreui/react'
import { Link, useLocation } from 'react-router-dom'
import { axiosClient } from '../../axiosConfig'
import moment from 'moment'

function DetailCoupon() {
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const coupon_code = searchParams.get('coupon_code')

  const [dataDetailCoupon, setDataDetailCoupon] = useState([])

  const fetchCouponDetailData = async () => {
    try {
      const response = await axiosClient.get(`admin/get-detail-coupon/${coupon_code}`)

      setDataDetailCoupon(response.data)
    } catch (error) {
      console.error('Fetch coupon data error', error)
    }
  }

  useEffect(() => {
    fetchCouponDetailData()
  }, [])

  const items =
    Array.isArray(dataDetailCoupon?.data) &&
    dataDetailCoupon?.data.length > 0 &&
    dataDetailCoupon?.data.map((item, index) => ({
      id: index + 1,
      maCouponUSer: item.MaCouponUSer,
      dateUsingCode: moment(item.DateUsingCode).format('hh:mm, DD/MM/YYYY'),
      idUser: item.IDuser,
      iDOrderCode: <span className="orange-txt">{item.IDOrderCode}</span>,
      _cellProps: {
        id: { scope: 'row' },
        style: { backgroundColor: index % 2 == 0 ? 'red' : '#ffffff' },
      },
    }))

  const columns = [
    { key: 'id', label: 'STT', _props: { scope: 'col' } },
    { key: 'maCouponUSer', label: 'Mã Coupon', _props: { scope: 'col' } },
    { key: 'dateUsingCode', label: 'Thời gian sử dụng', _props: { scope: 'col' } },
    { key: 'idUser', label: 'ID USER', _props: { scope: 'col' } },
    { key: 'iDOrderCode', label: 'Mã đơn hàng', _props: { scope: 'col' } },
  ]

  return (
    <div>
      <CRow className="mb-3">
        <CCol md={6}>
          <h2>CHI TIẾT COUPON</h2>
        </CCol>
        <CCol md={6}>
          <div className="d-flex justify-content-end">
            <Link to={`/coupon`}>
              <CButton color="primary" size="sm">
                Danh sách
              </CButton>
            </Link>
          </div>
        </CCol>
      </CRow>

      <CRow>
        <CCol md={12} className="d-flex justify-content-between border p-3 mb-3 bg-white">
          <div>
            <strong>
              Mã Đợt Phát Hành:{' '}
              <strong
                style={{
                  fontSize: 18,
                  color: 'red',
                }}
              >
                {dataDetailCoupon?.codeCoupon}
              </strong>
            </strong>
          </div>

          <div>
            <strong>Trạng thái: </strong>
            <span style={{ fontSize: 18, color: dataDetailCoupon?.status === 1 ? 'green' : 'red' }}>
              {dataDetailCoupon?.status === 1 ? 'Đang phát hành' : 'Ngưng phát hành'}
            </span>
          </div>

          <div>
            <strong>
              Ngày tạo: {moment(dataDetailCoupon?.DateCreateCoupon).format('DD-MM-YYYY')}
            </strong>
            <span></span>
          </div>
        </CCol>

        <CCol className="mt-3">
          <h6>Danh sách Mã Coupon đã sử dụng</h6>

          {/* Kiểm tra nếu items có dữ liệu */}
          {items && items.length > 0 ? (
            <CTable className="mt-2" columns={columns} items={items} />
          ) : (
            <p>Không có coupon đã sử dụng</p>
          )}
        </CCol>
      </CRow>
    </div>
  )
}

export default DetailCoupon
