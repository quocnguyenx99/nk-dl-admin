import React from 'react'
import { CButton, CCol, CContainer, CRow } from '@coreui/react'
import { useNavigate } from 'react-router-dom'

import './Page404.css'

const Page404 = () => {
  const navigate = useNavigate()

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <div>
        <CRow className="justify-content-center">
          <CCol md={6} className="error-container">
            <div className="clearfix">
              <h1 className="float-start display-3">404</h1>
              <h4 className="pt-3">Ôi! Bạn đang ở nơi lạc lối.</h4>
              <p className="text-body-secondary">Trang bạn đang tìm kiếm không tồn tại.</p>
            </div>
            <CButton className="btn-home" onClick={() => navigate('/')}>
              Về trang chủ
            </CButton>
          </CCol>
        </CRow>
      </div>
    </div>
  )
}

export default Page404
