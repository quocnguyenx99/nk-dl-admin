import React from 'react'
import { CFooter } from '@coreui/react'

const AppFooter = () => {
  return (
    <CFooter className="px-4">
      <div>
        <a href="https://vitinhnguyenkim.vn" target="_blank" rel="noopener noreferrer">
          Nguyên Kim
        </a>
        <span className="ms-1">&copy; 2025 Nguyên Kim Computer | https://vitinhnguyenkim.vn</span>
      </div>
      <div className="ms-auto">
        <span className="me-1">Powered by</span>
        <a href="https://vitinhnguyenkim.vn" target="_blank" rel="noopener noreferrer">
          NKC-IT-GROUP
        </a>
      </div>
    </CFooter>
  )
}

export default React.memo(AppFooter)
