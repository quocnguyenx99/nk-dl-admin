import React, { useState } from 'react'
import {
  CAlert,
  CButton,
  CCol,
  CForm,
  CFormInput,
  CFormLabel,
  CInputGroup,
  CInputGroupText,
  CRow,
  CSpinner,
} from '@coreui/react'
import { Link } from 'react-router-dom'
import { axiosClient } from '../../axiosConfig'
import { toast } from 'react-toastify'
import CIcon from '@coreui/icons-react'
import { cilCopy, cilCheckCircle } from '@coreui/icons'

function MemberCreate() {
  const [customerCode, setCustomerCode] = useState('')
  const [accountInfo, setAccountInfo] = useState(null)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setAccountInfo(null)

    if (!customerCode.trim()) {
      setError('Vui lòng nhập mã khách hàng SAP')
      return
    }

    try {
      setIsLoading(true)
      const response = await axiosClient.post('admin/member', {
        member_code: customerCode.trim(),
      })

      const data = response?.data?.data

      if (response?.data?.status === true && data) {
        setAccountInfo({
          username: data.username,
          password: data.password,
          maKH: data.member_code,
          fullName: data.full_name,
        })
        toast.success('Tạo tài khoản thành công! Khách hàng đã được tự động duyệt & kích hoạt.')
      } else {
        setError(
          response?.data?.message ||
            'Không tạo được tài khoản. Vui lòng kiểm tra lại mã khách hàng.',
        )
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Có lỗi xảy ra, vui lòng thử lại.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = () => {
    if (!accountInfo) return
    const textToCopy = `Tên đăng nhập: ${accountInfo.username}\nMật khẩu: ${accountInfo.password}\nMã KH: ${accountInfo.maKH}`
    navigator.clipboard.writeText(textToCopy)
    toast.success('Đã sao chép thông tin tài khoản!')
  }

  const handleReset = () => {
    setCustomerCode('')
    setAccountInfo(null)
    setError(null)
  }

  return (
    <div className="pb-4">
      {/* PAGE HEADER */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4 pb-2 border-bottom">
        <div>
          <h3 className="fw-bold text-uppercase text-dark m-0">TẠO TÀI KHOẢN WEBSITE THÀNH VIÊN</h3>
          <p className="text-muted text-xs m-0 mt-1">
            Tạo tài khoản tự động từ mã khách hàng SAP. Tài khoản sau khi tạo sẽ được tự động duyệt
            và kích hoạt ngay.
          </p>
        </div>
        <div>
          <Link to="/member">
            <CButton color="light" size="sm" className="border fw-semibold shadow-xs">
              ← Danh sách thành viên
            </CButton>
          </Link>
        </div>
      </div>

      <CRow className="justify-content-center">
        <CCol col={12} md={8} lg={6}>
          <div className="card border-0 shadow-sm rounded-3 overflow-hidden bg-white">
            <div className="card-header bg-light border-bottom py-3 d-flex justify-content-between align-items-center">
              <h6 className="fw-bold text-dark m-0 text-uppercase" style={{ fontSize: '13px' }}>
                Nhập thông tin tạo tài khoản
              </h6>
              <span
                className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 px-2 py-1"
                style={{ fontSize: '11px' }}
              >
                Tự động Duyệt & Kích hoạt
              </span>
            </div>

            <div className="card-body p-4">
              <CForm onSubmit={handleSubmit} className="d-flex flex-column gap-3">
                <div>
                  <CFormLabel
                    htmlFor="customerCode"
                    className="form-label text-muted small fw-semibold text-uppercase mb-1"
                  >
                    Mã khách hàng SAP <span className="text-danger">*</span>
                  </CFormLabel>
                  <CInputGroup>
                    <CInputGroupText
                      className="bg-light fw-bold text-secondary"
                      style={{ fontSize: '13px' }}
                    >
                      Mã KH
                    </CInputGroupText>
                    <CFormInput
                      id="customerCode"
                      type="text"
                      placeholder="Nhập mã khách hàng (Ví dụ: KH0001)..."
                      value={customerCode}
                      onChange={(e) => setCustomerCode(e.target.value)}
                      autoComplete="off"
                    />
                  </CInputGroup>
                  <div className="form-text text-muted small mt-1">
                    Nhập chính xác mã khách hàng đã tồn tại trên dữ liệu SAP.
                  </div>
                </div>

                <div className="d-flex gap-2 pt-2">
                  <CButton
                    type="submit"
                    color="primary"
                    className="flex-grow-1 py-2 fw-bold shadow-xs"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <CSpinner size="sm" className="me-1" /> Đang khởi tạo...
                      </>
                    ) : (
                      '+ Tạo tài khoản mới'
                    )}
                  </CButton>
                  <CButton
                    type="button"
                    color="light"
                    className="border px-3 fw-semibold shadow-xs"
                    onClick={handleReset}
                  >
                    Đặt lại
                  </CButton>
                </div>
              </CForm>

              {error && (
                <CAlert
                  color="danger"
                  className="mt-3 mb-0 rounded-3 border-danger border-opacity-25"
                >
                  <div className="fw-bold mb-0.5">Tạo tài khoản thất bại</div>
                  <div className="small">{error}</div>
                </CAlert>
              )}

              {accountInfo && (
                <div className="mt-4 p-3 bg-success bg-opacity-10 border border-success border-opacity-25 rounded-3">
                  <div className="d-flex align-items-center gap-2 mb-2 text-success fw-bold">
                    <CIcon icon={cilCheckCircle} size="lg" />
                    <span>Tài khoản đã được khởi tạo & kích hoạt thành công!</span>
                  </div>

                  <div className="bg-white p-3 rounded-2 border mb-3 small">
                    <div className="mb-1">
                      Mã khách hàng: <strong className="text-dark">{accountInfo.maKH}</strong>
                    </div>
                    {accountInfo.fullName && (
                      <div className="mb-1">
                        Họ & Tên: <strong className="text-dark">{accountInfo.fullName}</strong>
                      </div>
                    )}
                    <div className="mb-1">
                      Tên đăng nhập (Username):{' '}
                      <code className="bg-light text-primary px-1.5 py-0.5 rounded border fw-bold">
                        {accountInfo.username}
                      </code>
                    </div>
                    <div className="mb-1">
                      Mật khẩu khởi tạo:{' '}
                      <code className="bg-light text-danger px-1.5 py-0.5 rounded border fw-bold">
                        {accountInfo.password}
                      </code>
                    </div>
                    <div className="mt-2 pt-2 border-top d-flex align-items-center gap-2">
                      <span
                        className="badge bg-success text-white px-2 py-0.5"
                        style={{ fontSize: '10.5px' }}
                      >
                        Trạng thái: Đã duyệt
                      </span>
                      <span
                        className="badge bg-info text-white px-2 py-0.5"
                        style={{ fontSize: '10.5px' }}
                      >
                        Hoạt động: Đang mở
                      </span>
                    </div>
                  </div>

                  <CButton
                    color="success"
                    size="sm"
                    className="w-100 text-white fw-bold shadow-xs py-2"
                    onClick={handleCopy}
                  >
                    <CIcon icon={cilCopy} className="me-1.5" />
                    Sao chép thông tin tài khoản
                  </CButton>
                </div>
              )}
            </div>
          </div>
        </CCol>
      </CRow>
    </div>
  )
}

export default MemberCreate
