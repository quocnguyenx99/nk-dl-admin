import React, { useState, useEffect } from 'react'
import { CButton } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilArrowTop } from '@coreui/icons'

const ScrollUpButton = () => {
  const [visible, setVisible] = useState(false)

  const toggleVisibility = () => {
    if (window.scrollY > 300) {
      setVisible(true)
    } else {
      setVisible(false)
    }
  }

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility)
    return () => {
      window.removeEventListener('scroll', toggleVisibility)
    }
  }, [])

  return (
    <CButton
      size="sm"
      color="primary"
      style={{
        position: 'fixed',
        bottom: '40px',
        right: '40px',
        display: visible ? 'inline' : 'none',
      }}
      onClick={scrollToTop}
    >
      <CIcon icon={cilArrowTop} size="lg" />
    </CButton>
  )
}

export default ScrollUpButton
