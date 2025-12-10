import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CButton,
  CCard,
  CCardBody,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CImage,
  CInputGroup,
  CInputGroupText,
  CRow,
  CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser, cilFaceDead, cilFace } from '@coreui/icons'
import Logo from '../../../assets/images/logo/logo NK.png'
import { axiosClient } from '../../../axiosConfig'
import { toast } from 'react-toastify'

import ReCAPTCHA from 'react-google-recaptcha'

const Login = () => {
  const [username, setUserName] = useState('')
  const [password, setPassWord] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [recaptchaToken, setRecaptchaToken] = useState(null)

  const navigate = useNavigate()

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleLogin()
  }

  const handleLogin = async () => {
    if (!username || !password) {
      toast.warn('Vui lòng nhập đầy đủ thông tin!')
      return
    }
    // if (!recaptchaToken) {
    //   toast.warn('Vui lòng xác thực reCAPTCHA!')
    //   return
    // }
    try {
      setLoading(true)
      const res = await axiosClient.post('/admin-login', {
        username,
        password,
        captchaToken: recaptchaToken,
      })
      if (res.data.status === true) {
        localStorage.setItem('adminNKDL', res.data.token)
        localStorage.setItem('username', res.data.username)
        navigate('/')
      } else {
        if (res.data.mess === 'username') toast.error('Sai tên đăng nhập!')
        else if (res.data.mess === 'pass') toast.error('Sai mật khẩu!')
        else toast.error('Đăng nhập thất bại!')
      }
    } catch (e) {
      toast.error('Có lỗi xảy ra, vui lòng thử lại!')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={5} lg={4} xl={4}>
            <CCard className="shadow-lg border-0">
              <CCardBody className="p-4">
                <div className="text-center mb-4">
                  <CImage src={Logo} width={120} alt="Logo" className="mb-2" />
                  <h5 className="fw-bold text-dark mb-1">Đăng nhập</h5>
                  <small className="text-muted">Nguyen Kim Đại Lý</small>
                </div>

                <CForm onKeyDown={handleKeyDown} autoComplete="off">
                  <div className="mb-3">
                    <CInputGroup>
                      <CInputGroupText className="bg-light">
                        <CIcon icon={cilUser} />
                      </CInputGroupText>
                      <CFormInput
                        placeholder="Tài khoản"
                        value={username}
                        onChange={(e) => setUserName(e.target.value)}
                        autoFocus
                      />
                    </CInputGroup>
                  </div>

                  <div className="mb-3">
                    <CInputGroup>
                      <CInputGroupText className="bg-light">
                        <CIcon icon={cilLockLocked} />
                      </CInputGroupText>
                      <CFormInput
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Mật khẩu"
                        value={password}
                        onChange={(e) => setPassWord(e.target.value)}
                      />
                      <CButton
                        type="button"
                        color="light"
                        onClick={() => setShowPassword((s) => !s)}
                        tabIndex={-1}
                      >
                        <CIcon icon={showPassword ? cilFaceDead : cilFace} />
                      </CButton>
                    </CInputGroup>
                  </div>

                  <div className="mb-3 d-flex justify-content-center">
                    <ReCAPTCHA
                      sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
                      onChange={setRecaptchaToken}
                    />
                  </div>

                  <CButton
                    color="primary"
                    className="w-100"
                    disabled={loading}
                    onClick={handleLogin}
                  >
                    {loading ? (
                      <>
                        <CSpinner size="sm" className="me-2" /> Đang đăng nhập...
                      </>
                    ) : (
                      'Đăng nhập'
                    )}
                  </CButton>
                </CForm>

                <div className="text-center mt-3 pt-3 border-top">
                  <small className="text-muted">© {new Date().getFullYear()} Nguyen Kim</small>
                </div>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Login
