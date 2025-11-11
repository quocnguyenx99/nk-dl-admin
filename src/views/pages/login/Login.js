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

// import ReCAPTCHA from 'react-google-recaptcha'

const Login = () => {
  const [username, setUserName] = useState('')
  const [password, setPassWord] = useState('')
  const [key, setKey] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showSecureKey, setShowSecureKey] = useState(false)
  const [loading, setLoading] = useState(false)
  // const [recaptchaToken, setRecaptchaToken] = useState(null)

  const navigate = useNavigate()

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleLogin()
  }

  const handleLogin = async () => {
    if (!username || !password || !key) {
      toast.warn('Vui lòng nhập đầy đủ thông tin!')
      return
    }
    try {
      setLoading(true)
      const res = await axiosClient.post('/admin-login', {
        username,
        password,
        passwordSecurity: key,
        // captchaToken: recaptchaToken,
      })
      if (res.data.status === true) {
        localStorage.setItem('adminCN', res.data.token)
        localStorage.setItem('username', res.data.username)
        navigate('/')
      } else {
        if (res.data.mess === 'username') toast.error('Sai tên đăng nhập!')
        else if (res.data.mess === 'pass') toast.error('Sai mật khẩu!')
        else if (res.data.mess === 'wrong passwordSecurity') toast.error('Sai khóa bảo mật!')
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
      className="min-vh-100 d-flex align-items-center"
      style={{
        background:
          'linear-gradient(135deg, rgba(25,135,84,0.15) 0%, rgba(13,110,253,0.08) 60%, rgba(255,255,255,0.4) 100%)',
      }}
    >
      <div>
        <CRow className="justify-content-center">
          <CCol md={5} lg={4}>
            <CCard className="shadow-lg border-0" style={{ borderRadius: 16 }}>
              <CCardBody className="p-4">
                <div className="text-center mb-4">
                  <CImage src={Logo} width={150} alt="Logo" className="mb-2" />
                </div>

                <CForm onKeyDown={handleKeyDown} autoComplete="off">
                  <label className="small fw-semibold mb-1">Tài khoản</label>
                  <CInputGroup className="mb-3">
                    <CInputGroupText className="bg-light">
                      <CIcon icon={cilUser} />
                    </CInputGroupText>
                    <CFormInput
                      style={{
                        fontSize: 18,
                      }}
                      placeholder="Nhập tài khoản"
                      value={username}
                      onChange={(e) => setUserName(e.target.value)}
                      autoFocus
                    />
                  </CInputGroup>

                  <label className="small fw-semibold mb-1">Mật khẩu</label>
                  <CInputGroup className="mb-3">
                    <CInputGroupText className="bg-light">
                      <CIcon icon={cilLockLocked} />
                    </CInputGroupText>
                    <CFormInput
                      style={{
                        fontSize: 18,
                      }}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Nhập mật khẩu"
                      value={password}
                      onChange={(e) => setPassWord(e.target.value)}
                    />
                    <CButton
                      type="button"
                      color="secondary"
                      variant="outline"
                      onClick={() => setShowPassword((s) => !s)}
                      tabIndex={-1}
                      style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                    >
                      <CIcon icon={showPassword ? cilFaceDead : cilFace} />
                    </CButton>
                  </CInputGroup>

                  <label className="small fw-semibold mb-1">Khóa bảo mật</label>
                  <CInputGroup className="mb-4">
                    <CInputGroupText className="bg-light">
                      <CIcon icon={cilLockLocked} />
                    </CInputGroupText>
                    <CFormInput
                      style={{
                        fontSize: 18,
                      }}
                      type={showSecureKey ? 'text' : 'password'}
                      placeholder="Nhập khóa bảo mật"
                      value={key}
                      onChange={(e) => setKey(e.target.value)}
                    />
                    <CButton
                      type="button"
                      color="secondary"
                      variant="outline"
                      onClick={() => setShowSecureKey((s) => !s)}
                      tabIndex={-1}
                      style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                    >
                      <CIcon icon={showSecureKey ? cilFaceDead : cilFace} />
                    </CButton>
                  </CInputGroup>

                  {/* <div className="mb-3 text-center">
                    <ReCAPTCHA
                      sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
                      onChange={setRecaptchaToken}
                    />
                  </div> */}

                  <CButton
                    color="primary"
                    className="w-100 py-2 fw-semibold"
                    disabled={loading}
                    onClick={handleLogin}
                    style={{ fontSize: 16 }}
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

                <div className="text-center mt-4">
                  <small className="text-muted">
                    © {new Date().getFullYear()} Nguyen Kim Admin Portal
                  </small>
                </div>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </div>
    </div>
  )
}

export default Login
