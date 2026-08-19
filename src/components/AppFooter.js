import React from 'react'
import { CFooter } from '@coreui/react'

const AppFooter = () => {
  return (
    <CFooter className="px-4 py-3 bg-white border-top small text-secondary mt-auto">
      <div>
        <a
          href="https://vitinhnguyenkim.vn"
          target="_blank"
          rel="noopener noreferrer"
          className="fw-bold text-decoration-none text-dark me-1"
        >
          Vi Tính Nguyên Kim
        </a>
        <span>&copy; {new Date().getFullYear()} Nguyên Kim Computer | </span>
        <a
          href="https://vitinhnguyenkim.vn"
          target="_blank"
          rel="noopener noreferrer"
          className="text-secondary text-decoration-none ms-1"
        >
          https://vitinhnguyenkim.vn
        </a>
      </div>
      <div className="ms-auto small">
        <span className="me-1">Hệ Thống Quản Trị &bull; Powered by</span>
        <a
          href="https://vitinhnguyenkim.vn"
          target="_blank"
          rel="noopener noreferrer"
          className="fw-bold text-decoration-none"
          style={{ color: '#2356c4' }}
        >
          NKC IT GROUP
        </a>
      </div>
    </CFooter>
  )
}

export default React.memo(AppFooter)
