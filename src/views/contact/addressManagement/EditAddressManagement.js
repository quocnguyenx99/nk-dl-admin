import {
  CButton,
  CCol,
  CContainer,
  CFormCheck,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CFormTextarea,
  CImage,
  CRow,
  CSpinner,
} from '@coreui/react'
import React, { useEffect, useState } from 'react'

import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { Link, useLocation } from 'react-router-dom'
import { axiosClient, imageBaseUrl } from '../../../axiosConfig'

import { toast } from 'react-toastify'
import CKedtiorCustom from '../../../components/customEditor/ckEditorCustom'

function EditAddressManagement() {
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const id = searchParams.get('id')

  // check permission state
  const [isPermissionCheck, setIsPermissionCheck] = useState(true)

  const [isLoading, setIsLoading] = useState(false)

  const [addressEditor, setAddressEditor] = useState('')
  const [phoneEditor, setPhoneEditor] = useState('')

  const initialValues = {
    title: '',
    companyName: '',
    // address: '',
    // phone: '',
    mail: '',
    website: '',
    workTime: '',
    map: '',
    visible: 0,
  }

  const validationSchema = Yup.object({
    title: Yup.string().required('Tiêu đề là bắt buộc.').min(5, 'Tiêu đề phải có ít nhất 5 ký tự.'),
    companyName: Yup.string()
      .required('Tên công ty là bắt buộc.')
      .min(3, 'Tên công ty phải có ít nhất 3 ký tự.'),
    // address: Yup.string()
    //   .required('Địa chỉ là bắt buộc.')
    //   .min(10, 'Địa chỉ phải có ít nhất 10 ký tự.'),
    // phone: Yup.string().required('Số điện thoại là bắt buộc.'),
    mail: Yup.string().required('Email là bắt buộc.').email('Email không hợp lệ.'),
    workTime: Yup.string().required('Thời gian làm việc là bắt buộc.'),
    visible: Yup.number()
      .required('Trường hiển thị là bắt buộc.')
      .oneOf([0, 1], 'Giá trị phải là 0 hoặc 1.'),
  })

  const fetchDataById = async (setValues) => {
    try {
      const response = await axiosClient.get(`admin/contact-config/${id}/edit`)
      const data = response.data.data

      if (data) {
        setValues({
          title: data?.title,
          companyName: data?.company,
          workTime: data?.work_time,
          // address: data?.address,
          // phone: data?.phone,
          mail: data?.email,
          website: data?.website,
          map: data?.map,
          visible: data?.display,
        })
        setAddressEditor(data?.address)
        setPhoneEditor(data?.phone)
      } else {
        console.error('No data found for the given ID.')
      }

      if (response.data.status === false && response.data.mess == 'no permission') {
        setIsPermissionCheck(false)
      }
    } catch (error) {
      console.error('Fetch data id intro is error', error.message)
    }
  }

  const handleSubmit = async (values) => {
    try {
      setIsLoading(true)
      const response = await axiosClient.put(`admin/contact-config/${id}`, {
        title: values.title,
        company: values.companyName,
        address: addressEditor,
        phone: phoneEditor,
        email: values.mail,
        website: values.website,
        work_time: values.workTime,
        map: values.map,
        display: values.visible,
      })
      if (response.data.status === true) {
        toast.success('Chỉnh sửa địa chỉ thành công!')
      }
      if (response.data.status === false && response.data.mess == 'no permission') {
        toast.warn('Bạn không có quyền thực hiện tác vụ này!')
      }
    } catch (error) {
      console.error('Put data address is error', error)
      toast.error('Đã xảy ra lỗi. Vui lòng thử lại!')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      {!isPermissionCheck ? (
        <h5>
          <div>Bạn không đủ quyền để thao tác trên danh mục quản trị này.</div>
          <div className="mt-4">
            Vui lòng quay lại trang chủ <Link to={'/dashboard'}>(Nhấn vào để quay lại)</Link>
          </div>
        </h5>
      ) : (
        <>
          <CRow className="mb-3">
            <CCol>
              <h2>CHỈNH SỬA SỔ ĐỊA CHỈ</h2>
            </CCol>
            <CCol md={6}>
              <div className="d-flex justify-content-end">
                <Link to={'/address'}>
                  <CButton color="primary" type="button" size="sm">
                    Danh sách
                  </CButton>
                </Link>
              </div>
            </CCol>
          </CRow>

          <CRow>
            <CCol md={10}>
              <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {({ setValues, values }) => {
                  useEffect(() => {
                    fetchDataById(setValues)
                  }, [setValues, id])
                  return (
                    <Form>
                      <CCol md={8}>
                        <label htmlFor="title-input">Tiêu đề</label>
                        <Field name="title">
                          {({ field }) => <CFormInput {...field} type="text" id="title-input" />}
                        </Field>
                        <ErrorMessage name="title" component="div" className="text-danger" />
                      </CCol>
                      <br />

                      <CCol md={8}>
                        <label htmlFor="companyName-input">Tên công ty</label>
                        <Field name="companyName">
                          {({ field }) => (
                            <CFormInput {...field} type="text" id="companyName-input" />
                          )}
                        </Field>
                        <ErrorMessage name="companyName" component="div" className="text-danger" />
                      </CCol>
                      <br />

                      <CCol md={12}>
                        <CFormLabel>Địa chỉ</CFormLabel>
                        <CKedtiorCustom
                          data={addressEditor}
                          onChangeData={(data) => setAddressEditor(data)}
                        />
                      </CCol>
                      <br />

                      <CCol md={12}>
                        <CFormLabel>Điện thoại</CFormLabel>
                        <CKedtiorCustom
                          data={phoneEditor}
                          onChangeData={(data) => setPhoneEditor(data)}
                        />
                      </CCol>
                      <br />

                      <CCol md={8}>
                        <label htmlFor="workTime-input">Giờ làm việc</label>
                        <Field name="workTime">
                          {({ field }) => <CFormInput {...field} type="text" id="workTime-input" />}
                        </Field>
                        <ErrorMessage name="workTime" component="div" className="text-danger" />
                      </CCol>
                      <br />

                      {/* <div style="width: 100%"><iframe width="100%" height="250" frameborder="0" scrolling="no" marginheight="0" marginwidth="0" src="https://maps.google.com/maps?width=100%25&amp;height=250&amp;hl=en&amp;q=245A%20Tr%E1%BA%A7n%20Quang%20Kh%E1%BA%A3i,%20Ph%C6%B0%E1%BB%9Dng%20T%C3%A2n%20%C4%90%E1%BB%8Bnh,%20Qu%E1%BA%ADn%201,%20TP.%20H%E1%BB%93%20Ch%C3%AD%20Minh+(Showroom%20Ch%C3%ADnh%20Nh%C3%A2n)&amp;t=&amp;z=14&amp;ie=UTF8&amp;iwloc=B&amp;output=embed"><a href="https://www.gps.ie/">gps devices</a></iframe></div> */}

                      <CCol md={12}>
                        <label htmlFor="map-input">Bản đồ</label>
                        <Field
                          name="map"
                          type="text"
                          as={CFormTextarea}
                          id="map-input"
                          style={{ height: 200 }}
                          text={'Tạo map từ trang: https://www.maps.ie/create-google-map/'}
                        />

                        <ErrorMessage name="map" component="div" className="text-danger" />
                        <br />

                        {values.map ? (
                          <div dangerouslySetInnerHTML={{ __html: values.map }} />
                        ) : (
                          'Không có sitemap cho địa chỉ'
                        )}
                      </CCol>

                      <CCol md={12} className="mt-4">
                        <label htmlFor="visible-select">Hiển thị</label>
                        <Field
                          className={'w-50'}
                          name="visible"
                          as={CFormSelect}
                          id="visible-select"
                          options={[
                            { label: 'Không', value: 0 },
                            { label: 'Có', value: 1 },
                          ]}
                        />
                        <ErrorMessage name="visible" component="div" className="text-danger" />
                      </CCol>
                      <br />

                      <CCol xs={12}>
                        <CButton color="primary" type="submit" size="sm" disabled={isLoading}>
                          {isLoading ? (
                            <>
                              <CSpinner size="sm"></CSpinner> Đang cập nhật...
                            </>
                          ) : (
                            'Cập nhật'
                          )}
                        </CButton>
                      </CCol>
                    </Form>
                  )
                }}
              </Formik>
            </CCol>
          </CRow>
        </>
      )}
    </div>
  )
}

export default EditAddressManagement
