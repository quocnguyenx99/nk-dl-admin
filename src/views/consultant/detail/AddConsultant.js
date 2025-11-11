import {
  CButton,
  CCol,
  CContainer,
  CFormCheck,
  CFormInput,
  CFormSelect,
  CFormTextarea,
  CImage,
  CRow,
  CSpinner,
} from '@coreui/react'
import React, { useEffect, useState } from 'react'

import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { Link, useNavigate } from 'react-router-dom'
import CKedtiorCustom from '../../../components/customEditor/ckEditorCustom'
import { axiosClient, imageBaseUrl } from '../../../axiosConfig'

import { toast } from 'react-toastify'

function AddConsultant() {
  const username = localStorage.getItem('username')
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const [editorData, setEditorData] = useState('')

  const [dataConsultantCate, setDataConsultantCate] = useState([])

  const initialValues = {
    question: '',
    name: '',
    email: '',
    category: '',
    answer_by: '',
    visible: 0,
  }

  const validationSchema = Yup.object({
    question: Yup.string().required('Nội dung câu hỏi là bắt buộc.'),
    name: Yup.string().required('Tên người hỏi là bắt buộc.'),
    // email: Yup.string().required('Email người hỏi viết là bắt buộc.'),
    category: Yup.string().required('Danh mục tư vấn là bắt buộc.'),
    // answer_by: Yup.string().required('Meta description là bắt buộc.'),
    visible: Yup.string().required('Cho phép hiển thị là bắt buộc.'),
  })

  const fetchDataConsultantCate = async (dataSearch = '') => {
    try {
      const response = await axiosClient.get(`admin/faqs-category`)
      if (response.data.status === true) {
        setDataConsultantCate(response.data.list)
      }
    } catch (error) {
      console.error('Fetch data faqs cate is error', error)
    }
  }

  useEffect(() => {
    fetchDataConsultantCate()
  }, [])

  const handleSubmit = async (values) => {
    // console.log('>>> check log', values, editorData)

    try {
      setIsLoading(true)
      const response = await axiosClient.post('admin/faqs', {
        title: values.question,
        poster: values.name,
        email_poster: values.email,
        cat_id: values.category,
        answer_by: username,
        description: editorData,
        display: values.visible,
      })

      if (response.data.status === true) {
        toast.success('Thêm tư vấn thành công!')
        navigate('/consultant')
      }

      if (response.data.status === false && response.data.mess == 'no permission') {
        toast.warn('Bạn không có quyền thực hiện tác vụ này!')
      }
    } catch (error) {
      console.error('Post data consultant is error', error)
      toast.error('Đã xảy ra lỗi. Vui lòng thử lại!')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <CRow className="mb-3">
        <CCol>
          <h2>THÊM TƯ VẤN MỚI</h2>
        </CCol>
        <CCol md={6}>
          <div className="d-flex justify-content-end">
            <Link to={'/consultant'}>
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
            {({ setFieldValue, setValues, values }) => {
              return (
                <Form>
                  <CCol md={12}>
                    <label htmlFor="question-input">Nội dung câu hỏi</label>
                    <Field
                      name="question"
                      type="text"
                      as={CFormTextarea}
                      id="question-input"
                      style={{ height: 100 }}
                    />
                    <ErrorMessage name="question" component="div" className="text-danger" />
                  </CCol>
                  <br />

                  <CCol md={8}>
                    <label htmlFor="name-input">Họ tên người gửi</label>
                    <Field name="name">
                      {({ field }) => <CFormInput {...field} type="text" id="name-input" />}
                    </Field>
                    <ErrorMessage name="name" component="div" className="text-danger" />
                  </CCol>
                  <br />

                  <CCol md={8}>
                    <label htmlFor="email-input">Email người gửi</label>
                    <Field name="email" type="text" as={CFormInput} id="email-input" />
                    <ErrorMessage name="email" component="div" className="text-danger" />
                  </CCol>
                  <br />

                  <CCol md={12}>
                    <label htmlFor="category-select">Danh mục tư vấn</label>
                    <Field
                      className="w-50"
                      name="category"
                      as={CFormSelect}
                      id="category-select"
                      text="Lựa chọn danh mục đăng câu hỏi tư vấn"
                      options={[
                        { label: 'Chọn danh mục', value: '' },
                        ...(dataConsultantCate && dataConsultantCate?.length > 0
                          ? dataConsultantCate?.map((cate) => ({
                              label: cate?.faqs_category_desc.cat_name,
                              value: cate?.cat_id,
                            }))
                          : []),
                      ]}
                    />
                    <ErrorMessage name="category" component="div" className="text-danger" />
                  </CCol>
                  <br />

                  <CCol md={8}>
                    <label htmlFor="answer_by-input">Trả lời bởi</label>
                    <Field
                      name="answer_by"
                      type="text"
                      as={CFormInput}
                      id="answer_by-input"
                      value={username}
                      readOnly
                    />
                    <ErrorMessage name="answer_by" component="div" className="text-danger" />
                  </CCol>
                  <br />

                  <CCol md={12}>
                    <label htmlFor="editor">Nội dung trả lời</label>
                    <CKedtiorCustom
                      data={editorData}
                      onChangeData={(data) => setEditorData(data)}
                    />
                  </CCol>
                  <br />

                  <CCol md={12}>
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
                        'Thêm mới'
                      )}
                    </CButton>
                  </CCol>
                </Form>
              )
            }}
          </Formik>
        </CCol>
      </CRow>
    </div>
  )
}

export default AddConsultant
