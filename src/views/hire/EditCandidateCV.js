import { CButton, CCol, CContainer, CFormInput, CRow } from '@coreui/react'
import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

import { Formik, Form, Field, ErrorMessage } from 'formik'
import { axiosClient, imageBaseUrl } from '../../axiosConfig'
import moment from 'moment'
import { toast } from 'react-toastify'

import './css/editCandidateCV.css'
import axios from 'axios'

function EditCandidateCV() {
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const id = searchParams.get('id')

  // check permission state
  const [isPermissionCheck, setIsPermissionCheck] = useState(true)

  const [candidateData, setCandidateData] = useState([])

  const initialValues = {
    name: '',
    email: '',
    phone: '',
    category: '',
    dateSend: '',
  }

  const fetchDataById = async (setValues) => {
    try {
      const response = await axiosClient.get(`admin/detail-candidates/${id}`)
      const data = response.data.data

      if (data && response.data.status === true) {
        setCandidateData(data)
        setValues({
          name: data?.name,
          email: data?.gmail,
          phone: data?.phone,
          category: data?.titlePost,
          dateSend: moment.unix(data?.date_post).format('DD-MM-YYYY, hh:mm:ss A'),
        })
      } else {
        console.error('No data found for the given ID.')
      }

      if (response.data.status === false && response.data.mess == 'no permission') {
        setIsPermissionCheck(false)
      }
    } catch (error) {
      console.error('Fetch data id comment is error', error.message)
    }
  }

  const downloadForm = async (nameFile, candidateName) => {
    const format = nameFile.match(/\.(.*)$/)[1]

    try {
      const response = await axiosClient({
        url: `/admin/downloadFile-candidate?url=${nameFile}`,
        method: 'GET',
        responseType: 'blob',
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute(
        'download',
        format === 'pdf' ? `CV_${candidateName}.pdf` : `Phiếu thông tin_${candidateName}.doc`,
      )

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Error:', error)
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
              <h2>HỒ SƠ ỨNG VIÊN</h2>
            </CCol>
            <CCol md={{ span: 4, offset: 4 }}>
              <div className="d-flex justify-content-end">
                <Link to={`/hire/candidate-CV`}>
                  <CButton color="primary" type="submit" size="sm">
                    Danh sách
                  </CButton>
                </Link>
              </div>
            </CCol>
          </CRow>

          <CRow>
            <CCol md={6}>
              <h6>{'Thông tin ứng viên'}</h6>
              <Formik initialValues={initialValues}>
                {({ setFieldValue, setValues }) => {
                  useEffect(() => {
                    fetchDataById(setValues)
                  }, [setValues])
                  return (
                    <Form>
                      <CCol md={12}>
                        <label htmlFor="name-input">Tên ứng viên</label>
                        <Field name="name">
                          {({ field }) => (
                            <CFormInput {...field} type="text" id="name-input" readOnly />
                          )}
                        </Field>
                        <ErrorMessage name="name" component="div" className="text-danger" />
                      </CCol>
                      <br />

                      <CCol md={12}>
                        <label htmlFor="email-input">Thư điện tử</label>
                        <Field name="email" type="text" as={CFormInput} id="email-input" readOnly />
                        <ErrorMessage name="email" component="div" className="text-danger" />
                      </CCol>
                      <br />

                      <CCol md={12}>
                        <label htmlFor="phone-input">Số điện thoại</label>
                        <Field
                          name="phone"
                          type="number"
                          as={CFormInput}
                          id="phone-input"
                          readOnly
                        />
                        <ErrorMessage name="phone" component="div" className="text-danger" />
                      </CCol>
                      <br />

                      <CCol md={12}>
                        <label htmlFor="category-input">Vị trí ứng tuyển</label>
                        <Field
                          name="category"
                          type="text"
                          as={CFormInput}
                          id="category-input"
                          readOnly
                        />
                        <ErrorMessage name="category" component="div" className="text-danger" />
                      </CCol>
                      <br />

                      <CCol md={12}>
                        <label htmlFor="dateSend-input">Ngày nộp hồ sơ</label>
                        <Field
                          name="dateSend"
                          type="text"
                          as={CFormInput}
                          id="dateSend-input"
                          readOnly
                        />
                        <ErrorMessage name="dateSend" component="div" className="text-danger" />
                      </CCol>
                      <br />
                    </Form>
                  )
                }}
              </Formik>
            </CCol>

            <CCol md={6}>
              <CCol md={12}>
                <span>
                  Nhấp vào đường link sau để xem CV ứng viên:{' '}
                  <Link to={`${imageBaseUrl}${candidateData?.cv}`}>Xem chi tiết</Link>
                </span>
              </CCol>
              <br />

              <CCol md={12}>
                <div>
                  Tải về phiếu CV:
                  <CButton
                    size="sm"
                    color="primary"
                    onClick={() => downloadForm(candidateData.cv, candidateData.name)}
                  >
                    Tải về
                  </CButton>
                </div>
              </CCol>
              <br />

              <CCol md={12}>
                <div>
                  Tải về phiếu thông tin ứng tuyển:{' '}
                  <CButton
                    size="sm"
                    color="primary"
                    onClick={() => downloadForm(candidateData.fileInfo, candidateData.name)}
                  >
                    Tải về
                  </CButton>
                </div>
              </CCol>
            </CCol>
          </CRow>
        </>
      )}
    </div>
  )
}

export default EditCandidateCV
