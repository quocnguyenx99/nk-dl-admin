import React from 'react'
import { CButton, CCol, CContainer, CRow } from '@coreui/react'
import { useNavigate } from 'react-router-dom'

import './Page500.css'

const Page500 = () => {
  const navigate = useNavigate()

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <div>
        <CRow className="justify-content-center">
          <CCol md={6} className="error-container">
            <span className="clearfix">
              <h1 className="display-3">500</h1>
              <h4 className="pt-3">Ôi! Đã xảy ra sự cố!</h4>
              <p className="text-body-secondary">
                Trang bạn đang tìm kiếm tạm thời không khả dụng.
              </p>
            </span>
            <CButton className="btn-home" onClick={() => navigate('/')}>
              Về trang chủ
            </CButton>
          </CCol>
        </CRow>
      </div>
    </div>
  )
}

export default Page500
