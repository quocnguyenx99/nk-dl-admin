import React, { useEffect, useState } from 'react'
import {
  CAvatar,
  CBadge,
  CButton,
  CDropdown,
  CDropdownDivider,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react'
import { cilBell, cilEnvelopeOpen, cilLockLocked, cilUser } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import '../css/headerLogout.css'

import icon from '../../assets/images/logo/userLogo.png'

import { useNavigate } from 'react-router-dom'
import { axiosClient, imageBaseUrl } from '../../axiosConfig'

const AppHeaderDropdown = () => {
  const username = localStorage.getItem('username')
  const [avatar, setAvatar] = useState(null)
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.clear()
    navigate('/login')
  }

  const fetchAdminInfo = async () => {
    try {
      const response = await axiosClient.get('/admin/admin-information')
      if (response.data.status === true) {
        setAvatar(response.data.data.avatar)
      }
    } catch (error) {
      console.error('Fetch data admin info error', error)
    }
  }

  useEffect(() => {
    fetchAdminInfo()
  }, [])

  return (
    <CDropdown variant="nav-item">
      <CDropdownToggle placement="bottom-end " className="py-0 pe-0" caret={false}>
        <div className="d-flex gap-3 align-items-center">
          <strong>{username}</strong>
          <CAvatar src={icon} size="sm" />
        </div>
      </CDropdownToggle>
      <CDropdownMenu className="pt-0" placement="bottom-end">
        {/* <CDropdownHeader className="bg-body-secondary fw-semibold mb-2">Account</CDropdownHeader>
        <CDropdownItem href="#">
          <CIcon icon={cilBell} className="me-2" />
          Updates
          <CBadge color="info" className="ms-2">
            42
          </CBadge>
        </CDropdownItem>
        <CDropdownItem href="#">
          <CIcon icon={cilEnvelopeOpen} className="me-2" />
          Messages
          <CBadge color="success" className="ms-2">
            42
          </CBadge>
        </CDropdownItem> */}

        <CDropdownHeader className="bg-body-secondary fw-semibold my-2">Settings</CDropdownHeader>
        <CDropdownItem href="#">
          <CIcon icon={cilUser} className="me-2" />
          Thông tin tài khoản
        </CDropdownItem>
        <CDropdownDivider />
        <CButton className="logout-btn w-100" onClick={handleLogout}>
          <CIcon icon={cilLockLocked} className="me-2" />
          Đăng xuất
        </CButton>
      </CDropdownMenu>
    </CDropdown>
  )
}

export default AppHeaderDropdown
