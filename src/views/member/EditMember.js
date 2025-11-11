import React, { useEffect, useState } from 'react'
import {
  CButton,
  CCol,
  CContainer,
  CFormCheck,
  CFormInput,
  CFormSelect,
  CRow,
  CSpinner,
  CCard,
  CCardBody,
  CCardHeader,
  CCollapse,
} from '@coreui/react'

import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { Link, useLocation } from 'react-router-dom'
import { toast } from 'react-toastify'
import { axiosClient } from '../../axiosConfig'

function EditMember() {
  const location = useLocation()

  // check permission state
  const [isPermissionCheck, setIsPermissionCheck] = useState(true)

  const [isLoading, setIsLoading] = useState(false)

  const [showPasswordFields, setShowPasswordFields] = useState(false)
  const [saleSupportList, setSaleSupportList] = useState([])

  const params = new URLSearchParams(location.search)
  const id = params.get('id')

  const initialValues = {
    userName: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    email: '',
    phone: '',
    address: '',
    // point: '',
    // pointUsed: '',
    // shippingAddress: '',
    companyName: '',
    companyAddress: '',
    companyEmail: '',
    companyPhone: '',
    sapCustomerCode: '',
    sapCCCode: '',
    sapTaxCode: '',
    supportStaff: [],
    approvalStatus: 0,
    accountStatus: 1,
  }

  // keep a copy for reinitializing Formik after fetch
  const [formInit, setFormInit] = useState(initialValues)

  const validationSchema = Yup.object({
    // title: Yup.string().required('Tiêu đề là bắt buộc.'),
    // friendlyUrl: Yup.string().required('Chuỗi đường dẫn là bắt buộc.'),
    // pageTitle: Yup.string().required('Tiêu đề bài viết là bắt buộc.'),
    // metaKeyword: Yup.string().required('Meta keywords là bắt buộc.'),
    // metaDesc: Yup.string().required('Meta description là bắt buộc.'),
    // visible: Yup.string().required('Cho phép hiển thị là bắt buộc.'),
  })

  // fetch data to edit
  const fetchDataById = async () => {
    try {
      const response = await axiosClient.get(`/admin/member/${id}/edit`)
      const data = response.data.data
      if (data) {
        setFormInit((prev) => ({
          ...prev,
          userName: data?.username || '',
          fullName: data?.full_name || '',
          email: data?.email || '',
          phone: data?.phone || '',
          address: data?.address || '',
          companyName: data?.company_name || '',
          companyAddress: data?.company_address || '',
          companyEmail: data?.company_email || '',
          companyPhone: data?.company_phone || '',
          sapCustomerCode: data?.member_code || '',
          sapCCCode: data?.cc_code || '',
          sapTaxCode: data?.tax_code || '',
          // point: data?.point || '',
          // pointUsed: data?.point_used || '',
          approvalStatus: data?.status,
          accountStatus: data?.is_blocked,
          supportStaff: data?.sale_list,
        }))
      } else {
        console.error('No data found for the given ID.')
      }

      if (response.data.status === false && response.data.mess == 'no permission') {
        setIsPermissionCheck(false)
      }
    } catch (error) {
      console.error('Fetch data id member is error', error.message)
    }
  }

  useEffect(() => {
    if (id) {
      fetchDataById()
    }
  }, [id])

  // fetch data for update password
  const updatePassword = async (values) => {
    if (!id) return
    try {
      setIsLoading(true)
      const response = await axiosClient.post(`/admin/member/update-password/${id}`, {
        password: values.password,
        password_confirmation: values.confirmPassword,
      })

      if (response.data.status === true) {
        toast.success('Đặt lại mật khẩu thành công.')
      } else {
        toast.error(response.data.message || 'Đặt lại mật khẩu thất bại. Vui lòng thử lại.')
      }
    } catch (error) {
      toast.error('Đã xảy ra lỗi. Vui lòng thử lại.')
    } finally {
      setIsLoading(false)
    }
  }

  // fetch data for sale supports
  const saleSupports = async () => {
    try {
      const response = await axiosClient.get(`/admin/get-children`)
      const data = response.data.data
      console.log('data', data)

      if (data && response.data.status === true) {
        setSaleSupportList(data)
      } else {
        console.error('No sale supports data found for the given ID.')
      }

      if (response.data.status === false && response.data.mess == 'no permission') {
        setIsPermissionCheck(false)
      }
    } catch (error) {
      console.error('Fetch sale supports data is error', error.message)
    }
  }

  useEffect(() => {
    saleSupports()
  }, [])

  const handleSubmit = async (values) => {
    try {
      setIsLoading(true)
      const response = await axiosClient.post(`/admin/member/${id}`, {
        _method: 'PUT',
        member_code: values.sapCustomerCode,
        cc_code: values.sapCCCode,
        tax_code: values.sapTaxCode,
        full_name: values.fullName,
        email: values.email,
        phone: values.phone,
        address: values.address,
        company_name: values.companyName,
        company_address: values.companyAddress,
        company_email: values.companyEmail,
        company_phone: values.companyPhone,
        status: values.approvalStatus,
        is_blocked: values.accountStatus,
        sale_list: values.supportStaff,
      })
      if (response.data.status === true) {
        toast.success('Cập nhật thông tin thành công')
      } else if (response.data.status === false && response.data.mess == 'no permission') {
        setIsPermissionCheck(false)
        toast.error('Bạn không có quyền thực hiện hành động này')
      } else {
        toast.error('Đã xảy ra lỗi. Vui lòng thử lại!')
      }
    } catch (e) {
      toast.error('Đã xảy ra lỗi. Vui lòng thử lại!')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      {!isPermissionCheck ? (
        <div className="text-danger">Bạn không có quyền truy cập trang này.</div>
      ) : (
        <>
          <CRow className="mb-3">
            <CCol>
              <h3>CẬP NHẬT THÀNH VIÊN</h3>
            </CCol>
            <CCol md={{ span: 4, offset: 4 }}>
              <div className="d-flex justify-content-end">
                <Link to={`/member`}>
                  <CButton color="primary" type="submit" size="sm">
                    Danh sách
                  </CButton>
                </Link>
              </div>
            </CCol>
          </CRow>

          <CRow>
            <Formik
              initialValues={formInit}
              enableReinitialize
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ values, setFieldValue }) => (
                <Form>
                  <CCard className="mb-4 shadow-sm" style={{ borderRadius: 10 }}>
                    <CCardHeader className="bg-light fw-semibold">
                      Thông tin khách hàng & Giao hàng
                    </CCardHeader>
                    <CCardBody>
                      <CRow className="g-4">
                        {/* Thông tin khách hàng */}
                        <CCol md={6}>
                          <h6 className="mb-3">Thông tin khách hàng</h6>
                          <div className="mb-3">
                            <label htmlFor="userName-input">Tên đăng nhập</label>
                            <Field name="userName">
                              {({ field }) => (
                                <CFormInput
                                  {...field}
                                  disabled
                                  type="text"
                                  id="userName-input"
                                  placeholder="Tên đăng nhập"
                                />
                              )}
                            </Field>
                            <ErrorMessage name="userName" component="div" className="text-danger" />
                          </div>

                          {/* Nút đổi mật khẩu */}
                          <div className="d-flex justify-content-between mb-3">
                            <CButton
                              color="warning"
                              variant="outline"
                              size="sm"
                              onClick={() => setShowPasswordFields((v) => !v)}
                            >
                              {showPasswordFields ? 'Ẩn đổi mật khẩu' : 'Đổi mật khẩu'}
                            </CButton>
                          </div>

                          {/* Collapse phần đổi mật khẩu */}
                          <CCollapse visible={showPasswordFields}>
                            <div className="mb-3">
                              <label htmlFor="password-input">Mật khẩu mới</label>
                              <Field
                                name="password"
                                type="password"
                                as={CFormInput}
                                id="password-input"
                                placeholder="Đổi mật khẩu (tuỳ chọn)"
                              />
                              <small className="text-muted">Tối thiểu 6 ký tự.</small>
                              <ErrorMessage
                                name="password"
                                component="div"
                                className="text-danger"
                              />
                            </div>

                            <div className="mb-3">
                              <label htmlFor="confirmPassword-input">Xác nhận mật khẩu</label>
                              <Field
                                name="confirmPassword"
                                type="password"
                                as={CFormInput}
                                id="confirmPassword-input"
                                placeholder="Xác nhận lại mật khẩu"
                              />
                              <small className="text-muted">
                                Phải giống password đã nhập ở trên.
                              </small>
                              <ErrorMessage
                                name="confirmPassword"
                                component="div"
                                className="text-danger"
                              />
                            </div>

                            <div className="d-flex justify-content-end">
                              <CButton
                                color="success"
                                variant="outline"
                                size="sm"
                                onClick={() => updatePassword(values)}
                              >
                                Xác nhận mật khẩu
                              </CButton>
                            </div>
                          </CCollapse>

                          <div className="mb-3">
                            <label htmlFor="fullName-input">Họ tên</label>
                            <Field
                              name="fullName"
                              type="text"
                              as={CFormInput}
                              id="fullName-input"
                            />
                            <ErrorMessage name="fullName" component="div" className="text-danger" />
                          </div>

                          <div className="mb-3">
                            <label htmlFor="email-input">Thư điện tử</label>
                            <Field name="email" type="text" as={CFormInput} id="email-input" />
                          </div>

                          <div className="mb-3">
                            <label htmlFor="phone-input">Điện thoại</label>
                            <Field name="phone" type="text" as={CFormInput} id="phone-input" />
                          </div>
                        </CCol>

                        {/* Thông tin nhận hàng */}
                        <CCol md={6}>
                          <h6 className="mb-3">Thông tin nhận hàng</h6>
                          <div className="mb-3">
                            <label htmlFor="address-input">Địa chỉ nhận hàng</label>
                            <Field name="address" type="text" as={CFormInput} id="address-input" />
                            <ErrorMessage name="address" component="div" className="text-danger" />
                          </div>

                          {/* <div className="mb-3">
                            <label htmlFor="point-input">Điểm tích luỹ</label>
                            <Field name="point" type="text" as={CFormInput} id="point-input" />
                          </div>
                          <div className="mb-3">
                            <label htmlFor="pointUsed-input">Điểm đã sử dụng</label>
                            <Field
                              name="pointUsed"
                              type="text"
                              as={CFormInput}
                              id="pointUsed-input"
                            />
                          </div> */}
                        </CCol>
                      </CRow>
                    </CCardBody>
                  </CCard>

                  <CCard className="mb-4 shadow-sm" style={{ borderRadius: 10 }}>
                    <CCardHeader className="bg-light fw-semibold">
                      Thông tin công ty & Đồng bộ SAP
                    </CCardHeader>
                    <CCardBody>
                      <CRow className="g-4">
                        {/* Thông tin công ty */}
                        <CCol md={6}>
                          <h6 className="mb-3">Thông tin công ty</h6>
                          <div className="mb-3">
                            <label htmlFor="companyName-input">Tên Công Ty</label>
                            <Field name="companyName" as={CFormInput} id="companyName-input" />
                          </div>
                          <div className="mb-3">
                            <label htmlFor="companyAddress-input">Địa chỉ Công Ty</label>
                            <Field
                              name="companyAddress"
                              as={CFormInput}
                              id="companyAddress-input"
                            />
                          </div>
                          <div className="mb-3">
                            <label htmlFor="companyEmail-input">Email Công Ty</label>
                            <Field name="companyEmail" as={CFormInput} id="companyEmail-input" />
                          </div>
                          <div className="mb-3">
                            <label htmlFor="companyPhone-input">Số Điện Thoại Công Ty</label>
                            <Field name="companyPhone" as={CFormInput} id="companyPhone-input" />
                          </div>
                        </CCol>

                        {/* Thông tin đồng bộ SAP */}
                        <CCol md={6}>
                          <h6 className="mb-3">Thông tin đồng bộ SAP</h6>
                          <div className="mb-3">
                            <label htmlFor="sapCustomerCode-input">Mã Khách Hàng</label>
                            <Field
                              name="sapCustomerCode"
                              as={CFormInput}
                              id="sapCustomerCode-input"
                            />
                          </div>
                          <div className="mb-3">
                            <label htmlFor="sapCCCode-input">Mã CC*</label>
                            <Field name="sapCCCode" as={CFormInput} id="sapCCCode-input" />
                          </div>
                          <div className="mb-3">
                            <label htmlFor="sapTaxCode-input">Mã Số Thuế</label>
                            <Field name="sapTaxCode" as={CFormInput} id="sapTaxCode-input" />
                          </div>
                        </CCol>
                      </CRow>
                    </CCardBody>
                  </CCard>

                  <CCard className="mb-4 shadow-sm" style={{ borderRadius: 10 }}>
                    <CCardHeader className="bg-light fw-semibold">
                      Nhân viên support khách hàng
                    </CCardHeader>
                    <CCardBody>
                      <CRow className="row-cols-1 row-cols-md-3 row-cols-lg-4 g-3">
                        {saleSupportList &&
                          Array.isArray(saleSupportList) &&
                          saleSupportList.map((sale, idx) => (
                            <CCol key={sale.id}>
                              <CFormCheck
                                id={`staff_${idx}`}
                                label={sale?.display_name || ''}
                                checked={values.supportStaff?.includes(sale.sale_id)}
                                onChange={(e) => {
                                  const checked = e.target.checked
                                  const current = new Set(values.supportStaff || [])
                                  if (checked) current.add(sale.sale_id)
                                  else current.delete(sale.sale_id)
                                  setFieldValue('supportStaff', Array.from(current))
                                }}
                              />
                            </CCol>
                          ))}
                      </CRow>
                    </CCardBody>
                  </CCard>

                  <CCard className="mb-4 shadow-sm" style={{ borderRadius: 10 }}>
                    <CCardHeader className="bg-light fw-semibold">Kích hoạt tài khoản</CCardHeader>
                    <CCardBody>
                      <CRow className="g-3">
                        <CCol md={6}>
                          <label htmlFor="approvalStatus-select">Trạng thái duyệt</label>
                          <Field
                            name="approvalStatus"
                            as={CFormSelect}
                            id="approvalStatus-select"
                            options={[
                              { label: 'Chờ kích hoạt', value: 0 },
                              { label: 'Đã duyệt', value: 1 },
                            ]}
                          />
                        </CCol>
                        <CCol md={6}>
                          <label htmlFor="accountStatus-select">Trạng thái hoạt động</label>
                          <Field
                            name="accountStatus"
                            as={CFormSelect}
                            id="accountStatus-select"
                            options={[
                              { label: 'Đang hoạt động', value: 0 },
                              { label: 'Bị khóa', value: 1 },
                            ]}
                          />
                        </CCol>
                      </CRow>
                    </CCardBody>
                  </CCard>

                  <div className="d-flex gap-2">
                    <CButton color="primary" type="submit" size="sm" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <CSpinner size="sm" /> Đang cập nhật...
                        </>
                      ) : (
                        'Cập nhật'
                      )}
                    </CButton>
                  </div>
                </Form>
              )}
            </Formik>
          </CRow>
        </>
      )}
    </div>
  )
}

export default EditMember
